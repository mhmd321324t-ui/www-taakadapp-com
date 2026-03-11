from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Any, Dict
import uuid
from datetime import datetime, date, timedelta
import asyncio
import math
import hashlib
import hmac
import base64
import json as json_module
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# JWT Secret (use env variable or generate one)
JWT_SECRET = os.environ.get('JWT_SECRET', 'islamic-app-secret-key-2025-change-in-production')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'islamic_app')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Create the main app without a prefix
app = FastAPI(title="Islamic App API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)


# ==================== JWT UTILITIES ====================

def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def _b64_decode(s: str) -> bytes:
    s += '=' * (-len(s) % 4)
    return base64.urlsafe_b64decode(s)

def create_jwt(payload: dict, expires_in_hours: int = 24 * 30) -> str:
    """Create a simple JWT token."""
    header = _b64_encode(json_module.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    exp = datetime.utcnow() + timedelta(hours=expires_in_hours)
    full_payload = {**payload, "exp": exp.isoformat(), "iat": datetime.utcnow().isoformat()}
    payload_enc = _b64_encode(json_module.dumps(full_payload).encode())
    sig_input = f"{header}.{payload_enc}".encode()
    sig = hmac.new(JWT_SECRET.encode(), sig_input, hashlib.sha256).digest()
    return f"{header}.{payload_enc}.{_b64_encode(sig)}"

def verify_jwt(token: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_enc, payload_enc, sig_enc = parts
        sig_input = f"{header_enc}.{payload_enc}".encode()
        expected_sig = hmac.new(JWT_SECRET.encode(), sig_input, hashlib.sha256).digest()
        actual_sig = _b64_decode(sig_enc)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        payload = json_module.loads(_b64_decode(payload_enc))
        # Check expiry
        exp = datetime.fromisoformat(payload.get("exp", ""))
        if datetime.utcnow() > exp:
            return None
        return payload
    except Exception:
        return None

def hash_password(password: str) -> str:
    """Hash a password using PBKDF2."""
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
    return f"{base64.b64encode(salt).decode()}:{base64.b64encode(dk).decode()}"

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash."""
    try:
        salt_b64, dk_b64 = hashed.split(':')
        salt = base64.b64decode(salt_b64)
        stored_dk = base64.b64decode(dk_b64)
        dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
        return hmac.compare_digest(dk, stored_dk)
    except Exception:
        return False

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)) -> Optional[dict]:
    """Get current user from JWT token."""
    if not creds:
        return None
    payload = verify_jwt(creds.credentials)
    if not payload:
        return None
    user = await db.users.find_one({"id": payload.get("user_id")})
    return user


# ==================== AUTH MODELS ====================

class UserRegister(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    created_at: Optional[str] = None


# ==================== MODELS ====================

class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class MosqueSearchResult(BaseModel):
    osm_id: str
    name: str
    address: str
    latitude: float
    longitude: float
    websiteUrl: Optional[str] = None

class MosquePrayerTimesRequest(BaseModel):
    mosqueName: str
    latitude: float
    longitude: float
    method: int = 3
    school: int = 0

class PrayerTimesResult(BaseModel):
    success: bool
    source: str
    times: Optional[Dict[str, str]] = None
    jumua: Optional[str] = None
    message: Optional[str] = None


# ==================== UTILS ====================

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in km between two coordinates."""
    R = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ==================== STATUS ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Islamic App API - Running", "version": "2.0"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**s) for s in status_checks]


# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register_user(data: UserRegister):
    """Register a new user."""
    email = data.email.lower().strip()
    # Check if email already exists
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل بالفعل")

    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": email,
        "name": data.name or email.split("@")[0],
        "password_hash": hash_password(data.password),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    await db.users.insert_one(user_doc)

    token = create_jwt({"user_id": user_id, "email": email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": email,
            "name": user_doc["name"],
            "created_at": user_doc["created_at"],
        }
    }


@api_router.post("/auth/login")
async def login_user(data: UserLogin):
    """Login with email and password."""
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="بريد إلكتروني أو كلمة مرور غير صحيحة")

    if not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="بريد إلكتروني أو كلمة مرور غير صحيحة")

    token = create_jwt({"user_id": user["id"], "email": email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": email,
            "name": user.get("name", ""),
            "created_at": user.get("created_at", ""),
        }
    }


@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user.get("name", ""),
        "created_at": current_user.get("created_at", ""),
    }


@api_router.post("/auth/logout")
async def logout():
    """Logout (client should delete the token)."""
    return {"message": "Logged out successfully"}


@api_router.put("/auth/profile")
async def update_profile(
    data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    update_data = {k: v for k, v in data.items() if k in ("name",)}
    update_data["updated_at"] = datetime.utcnow().isoformat()
    await db.users.update_one({"id": current_user["id"]}, {"$set": update_data})
    return {"success": True, "message": "Profile updated"}


# ==================== MOSQUE SEARCH ====================

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

async def query_overpass(overpass_query: str) -> Optional[dict]:
    """Query Overpass API with multiple endpoint fallbacks."""
    for endpoint in OVERPASS_ENDPOINTS:
        try:
            async with httpx.AsyncClient(timeout=30) as client_http:
                resp = await client_http.post(
                    endpoint,
                    content=overpass_query,
                    headers={"Content-Type": "text/plain"}
                )
                if resp.status_code == 200:
                    return resp.json()
                elif resp.status_code == 429:
                    await asyncio.sleep(1)
                    continue
        except Exception as e:
            logger.debug(f"Overpass endpoint {endpoint} failed: {e}")
            continue
    return None


@api_router.get("/mosques/search")
async def search_mosques(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(5000, description="Search radius in meters"),
    query: Optional[str] = Query(None, description="Text search query")
):
    """
    Search for nearby mosques using OpenStreetMap Overpass API.
    Falls back to text search if a query is provided.
    """
    try:
        mosques = []

        if query:
            # Text search using Overpass API
            overpass_query = f"""
[out:json][timeout:25];
(
  node["amenity"="place_of_worship"]["religion"="muslim"]["name"~"{query}",i](around:{radius},{lat},{lon});
  way["amenity"="place_of_worship"]["religion"="muslim"]["name"~"{query}",i](around:{radius},{lat},{lon});
  relation["amenity"="place_of_worship"]["religion"="muslim"]["name"~"{query}",i](around:{radius},{lat},{lon});
);
out center body;
"""
        else:
            # Proximity search
            overpass_query = f"""
[out:json][timeout:25];
(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:{radius},{lat},{lon});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:{radius},{lat},{lon});
  relation["amenity"="place_of_worship"]["religion"="muslim"](around:{radius},{lat},{lon});
);
out center body;
"""

        data = await query_overpass(overpass_query)
        if not data:
            return {"mosques": [], "count": 0, "error": "Overpass API unavailable"}

        for element in data.get("elements", []):
            tags = element.get("tags", {})
            name = tags.get("name") or tags.get("name:ar") or tags.get("name:en")
            if not name:
                continue

            # Get coordinates
            if element["type"] == "node":
                e_lat = element.get("lat", 0)
                e_lon = element.get("lon", 0)
            else:
                center = element.get("center", {})
                e_lat = center.get("lat", 0)
                e_lon = center.get("lon", 0)

            if not e_lat or not e_lon:
                continue

            # Build address
            city = tags.get("addr:city") or tags.get("addr:suburb") or ""
            street = tags.get("addr:street") or tags.get("addr:full") or ""
            address_parts = [p for p in [street, city] if p]
            address = ", ".join(address_parts) if address_parts else tags.get("addr:full", "")

            osm_id = str(element.get("id", ""))
            website = tags.get("website") or tags.get("url") or None

            mosque = {
                "osm_id": osm_id,
                "name": name,
                "address": address,
                "latitude": e_lat,
                "longitude": e_lon,
                "websiteUrl": website,
                "_dist": haversine_km(lat, lon, e_lat, e_lon)
            }
            mosques.append(mosque)

        # Sort by distance and limit
        mosques.sort(key=lambda m: m["_dist"])
        mosques = mosques[:50]

        return {"mosques": mosques, "count": len(mosques)}

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Overpass API timeout")
    except Exception as e:
        logger.error(f"Mosque search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


# ==================== MOSQUE PRAYER TIMES ====================

@api_router.post("/mosques/prayer-times")
async def get_mosque_prayer_times(request: MosquePrayerTimesRequest):
    """
    Get prayer times for a mosque.
    Tries Mawaqit API first (for mosques registered there),
    then falls back to Aladhan API calculation based on coordinates.
    """
    try:
        # Try Mawaqit first
        mawaqit_result = await try_mawaqit(request.mosqueName, request.latitude, request.longitude)
        if mawaqit_result:
            return mawaqit_result

        # Fallback to Aladhan API
        aladhan_result = await fetch_aladhan_times(request.latitude, request.longitude, request.method, request.school)
        if aladhan_result:
            return aladhan_result

        return PrayerTimesResult(
            success=False,
            source="none",
            message="Could not fetch prayer times"
        )

    except Exception as e:
        logger.error(f"Prayer times error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def try_mawaqit(mosque_name: str, latitude: float, longitude: float) -> Optional[PrayerTimesResult]:
    """Try to get prayer times from Mawaqit.net API."""
    try:
        # Search for mosque on Mawaqit
        search_url = "https://mawaqit.net/api/2.0/mosque/search"
        params = {
            "lat": latitude,
            "lon": longitude,
            "word": mosque_name[:30],  # Limit search word
        }
        
        headers = {
            "Api-Access-Token": "58d4dcef-f581-4a4b-bfb5-5d7628c16753",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        async with httpx.AsyncClient(timeout=10) as client_http:
            resp = await client_http.get(search_url, params=params, headers=headers)
            if resp.status_code != 200:
                return None

            mosques_data = resp.json()
            if not mosques_data:
                return None

            # Find the closest mosque
            for mosque_info in mosques_data[:3]:
                m_lat = mosque_info.get("latitude", 0)
                m_lon = mosque_info.get("longitude", 0)
                dist = haversine_km(latitude, longitude, m_lat, m_lon)
                
                if dist < 0.3:  # Within 300m
                    mosque_slug = mosque_info.get("slug") or mosque_info.get("id")
                    if not mosque_slug:
                        continue

                    # Get times for this mosque
                    times_url = f"https://mawaqit.net/api/2.0/mosque/{mosque_slug}/prayer-times"
                    times_resp = await client_http.get(times_url, headers=headers)
                    if times_resp.status_code != 200:
                        continue

                    times_data = times_resp.json()
                    today_str = date.today().isoformat()
                    
                    # Get today's prayer times
                    today_times = None
                    times_list = times_data.get("times", []) or times_data.get("calendar", [])
                    
                    if isinstance(times_list, dict):
                        day_num = str(date.today().day)
                        today_times = times_list.get(day_num) or times_list.get(today_str)
                    elif isinstance(times_list, list):
                        day = date.today().day
                        if day <= len(times_list):
                            today_times = times_list[day - 1]

                    if today_times and len(today_times) >= 5:
                        # Format: [fajr, sunrise, dhuhr, asr, maghrib, isha]
                        prayer_keys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
                        times_map = {}
                        for i, key in enumerate(prayer_keys):
                            if i < len(today_times):
                                times_map[key] = today_times[i]

                        return PrayerTimesResult(
                            success=True,
                            source="mawaqit",
                            times=times_map,
                            jumua=times_data.get("jumua") or times_data.get("jumuaTime") or ""
                        )

        return None
    except Exception as e:
        logger.debug(f"Mawaqit fetch failed: {e}")
        return None


async def fetch_aladhan_times(latitude: float, longitude: float, method: int, school: int) -> Optional[PrayerTimesResult]:
    """Fetch prayer times from Aladhan API."""
    try:
        today = date.today()
        url = f"https://api.aladhan.com/v1/timings/{today.day}-{today.month}-{today.year}"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "method": method,
            "school": school,
            "adjustment": 0
        }

        async with httpx.AsyncClient(timeout=15) as client_http:
            resp = await client_http.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        timings = data["data"]["timings"]

        def clean_time(t: str) -> str:
            import re
            return re.sub(r'\s*\(.*\)$', '', t).strip()

        times_map = {
            "fajr": clean_time(timings.get("Fajr", "")),
            "sunrise": clean_time(timings.get("Sunrise", "")),
            "dhuhr": clean_time(timings.get("Dhuhr", "")),
            "asr": clean_time(timings.get("Asr", "")),
            "maghrib": clean_time(timings.get("Maghrib", "")),
            "isha": clean_time(timings.get("Isha", ""))
        }

        return PrayerTimesResult(
            success=True,
            source="calculated",
            times=times_map
        )

    except Exception as e:
        logger.debug(f"Aladhan fallback failed: {e}")
        return None


# ==================== PRAYER TIMES API ====================

@api_router.get("/prayer-times")
async def get_prayer_times(
    lat: float = Query(...),
    lon: float = Query(...),
    method: int = Query(3),
    school: int = Query(0)
):
    """Get prayer times for a location."""
    result = await fetch_aladhan_times(lat, lon, method, school)
    if result and result.success:
        return result
    raise HTTPException(status_code=500, detail="Failed to fetch prayer times")


# ==================== HIJRI DATE API ====================

@api_router.get("/hijri-date")
async def get_hijri_date(
    lat: float = Query(...),
    lon: float = Query(...)
):
    """Get current Hijri date."""
    try:
        today = date.today()
        url = f"https://api.aladhan.com/v1/timings/{today.day}-{today.month}-{today.year}"
        params = {"latitude": lat, "longitude": lon, "method": 3}

        async with httpx.AsyncClient(timeout=15) as client_http:
            resp = await client_http.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        hijri = data["data"]["date"]["hijri"]
        return {
            "hijriDate": f"{hijri['day']} {hijri['month']['ar']} {hijri['year']} هـ",
            "hijriDay": hijri["day"],
            "hijriMonth": hijri["month"]["ar"],
            "hijriMonthEn": hijri["month"]["en"],
            "hijriMonthNumber": hijri["month"]["number"],
            "hijriYear": hijri["year"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== HEALTH CHECK ====================

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
