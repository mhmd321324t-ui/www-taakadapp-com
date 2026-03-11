"""
المؤذن العالمي - Backend API
Full Islamic App with Prayer Times, Notifications, AI Athkar, Mosque Search
"""
from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, date, timedelta
import asyncio
import math
import hashlib
import hmac as hmac_lib
import base64
import json as json_module
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ==================== CONFIG ====================
JWT_SECRET = os.environ.get('JWT_SECRET', 'almuadhin-global-secret-2026')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
FIREBASE_PROJECT_ID = os.environ.get('FIREBASE_PROJECT_ID', 'hxhdh-78bec')
VAPID_PUBLIC_KEY = os.environ.get('VAPID_PUBLIC_KEY', '')
VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY', '')
VAPID_EMAIL = os.environ.get('VAPID_EMAIL', 'mailto:admin@almuadhin.com')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'almuadhin')

# MongoDB
client_db = AsyncIOMotorClient(MONGO_URL)
db = client_db[DB_NAME]

# App
app = FastAPI(title="المؤذن العالمي API", version="2.0")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== JWT ====================
def _b64enc(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def _b64dec(s: str) -> bytes:
    s += '=' * (-len(s) % 4)
    return base64.urlsafe_b64decode(s)

def create_jwt(payload: dict, hours: int = 720) -> str:
    header = _b64enc(json_module.dumps({"alg":"HS256","typ":"JWT"}).encode())
    exp = datetime.utcnow() + timedelta(hours=hours)
    pl = {**payload, "exp": exp.isoformat(), "iat": datetime.utcnow().isoformat()}
    pl_enc = _b64enc(json_module.dumps(pl).encode())
    sig = hmac_lib.new(JWT_SECRET.encode(), f"{header}.{pl_enc}".encode(), hashlib.sha256).digest()
    return f"{header}.{pl_enc}.{_b64enc(sig)}"

def verify_jwt(token: str) -> Optional[dict]:
    try:
        h, p, s = token.split('.')
        expected = hmac_lib.new(JWT_SECRET.encode(), f"{h}.{p}".encode(), hashlib.sha256).digest()
        if not hmac_lib.compare_digest(expected, _b64dec(s)):
            return None
        payload = json_module.loads(_b64dec(p))
        if datetime.utcnow() > datetime.fromisoformat(payload["exp"]):
            return None
        return payload
    except Exception:
        return None

def hash_password(pw: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac('sha256', pw.encode(), salt, 100000)
    return f"{base64.b64encode(salt).decode()}:{base64.b64encode(dk).decode()}"

def check_password(pw: str, hashed: str) -> bool:
    try:
        s, dk = hashed.split(':')
        return hmac_lib.compare_digest(
            hashlib.pbkdf2_hmac('sha256', pw.encode(), base64.b64decode(s), 100000),
            base64.b64decode(dk)
        )
    except Exception:
        return False

async def get_user(creds: HTTPAuthorizationCredentials = Depends(security)) -> Optional[dict]:
    if not creds:
        return None
    payload = verify_jwt(creds.credentials)
    if not payload:
        return None
    return await db.users.find_one({"id": payload.get("user_id")})

# ==================== MODELS ====================
class UserRegister(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class PushSubscription(BaseModel):
    endpoint: str
    p256dh: str
    auth: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    method: Optional[int] = 3
    school: Optional[int] = 0
    timezone: Optional[str] = "Asia/Riyadh"
    user_id: Optional[str] = None

class MosqueTimesRequest(BaseModel):
    mosqueName: str
    latitude: float
    longitude: float
    method: int = 3
    school: int = 0
    mosqueUuid: Optional[str] = None

class DhikrAIRequest(BaseModel):
    time_of_day: str = "morning"
    occasion: Optional[str] = None
    language: str = "ar"
    count: int = 5

# ==================== UTILS ====================
OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

def haversine(lat1, lon1, lat2, lon2) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(dlon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

async def query_overpass(q: str) -> Optional[dict]:
    for ep in OVERPASS_ENDPOINTS:
        try:
            async with httpx.AsyncClient(timeout=20) as c:
                r = await c.post(ep, content=q, headers={"Content-Type":"text/plain"})
                if r.status_code == 200:
                    return r.json()
        except Exception:
            continue
    return None

def clean_time(t: str) -> str:
    return re.sub(r'\s*\(.*?\)', '', t).strip()

# ==================== STATUS ====================
@api_router.get("/")
async def root():
    return {"message": "المؤذن العالمي API", "version": "2.0", "status": "running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat(), "app": "المؤذن العالمي"}

# ==================== AUTH ====================
@api_router.post("/auth/register")
async def register(data: UserRegister):
    email = data.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "البريد الإلكتروني مسجل مسبقاً")
    uid = str(uuid.uuid4())
    user = {
        "id": uid, "email": email,
        "name": data.name or email.split("@")[0],
        "password_hash": hash_password(data.password),
        "provider": "email",
        "created_at": datetime.utcnow().isoformat(),
        "avatar": None,
    }
    await db.users.insert_one(user)
    token = create_jwt({"user_id": uid, "email": email})
    return {"access_token": token, "token_type": "bearer", "user": {k: user[k] for k in ("id","email","name","avatar","provider")}}

@api_router.post("/auth/login")
async def login(data: UserLogin):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not check_password(data.password, user.get("password_hash", "")):
        raise HTTPException(401, "بيانات الدخول غير صحيحة")
    token = create_jwt({"user_id": user["id"], "email": email})
    return {"access_token": token, "token_type": "bearer", "user": {k: user[k] for k in ("id","email","name","avatar","provider") if k in user}}

@api_router.post("/auth/google")
async def google_login(data: dict):
    """Exchange Firebase ID token for app JWT"""
    id_token = data.get("id_token")
    if not id_token:
        raise HTTPException(400, "id_token مطلوب")
    
    # Verify Firebase ID token via Firebase REST API
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.post(
                f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={os.environ.get('FIREBASE_API_KEY','')}",
                json={"idToken": id_token}
            )
            if r.status_code != 200:
                raise HTTPException(401, "Token Firebase غير صالح")
            firebase_user = r.json().get("users", [{}])[0]
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "فشل التحقق من Google")

    email = firebase_user.get("email", "")
    name = firebase_user.get("displayName", email.split("@")[0])
    photo = firebase_user.get("photoUrl", None)
    firebase_uid = firebase_user.get("localId", "")

    # Upsert user
    user = await db.users.find_one({"$or": [{"email": email}, {"firebase_uid": firebase_uid}]})
    if not user:
        uid = str(uuid.uuid4())
        user = {
            "id": uid, "email": email, "name": name,
            "avatar": photo, "provider": "google",
            "firebase_uid": firebase_uid,
            "created_at": datetime.utcnow().isoformat(),
        }
        await db.users.insert_one(user)
    else:
        await db.users.update_one({"id": user["id"]}, {"$set": {"name": name, "avatar": photo, "firebase_uid": firebase_uid}})

    token = create_jwt({"user_id": user["id"], "email": email})
    return {"access_token": token, "token_type": "bearer", "user": {k: user.get(k) for k in ("id","email","name","avatar","provider")}}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_user)):
    if not user:
        raise HTTPException(401, "غير مصادق")
    return {k: user.get(k) for k in ("id","email","name","avatar","provider","created_at")}

@api_router.post("/auth/logout")
async def logout():
    return {"message": "تم تسجيل الخروج"}

# ==================== PRAYER TIMES ====================
@api_router.get("/prayer-times")
async def prayer_times(lat: float = Query(...), lon: float = Query(...), method: int = Query(4), school: int = Query(0)):
    """Get prayer times using Aladhan API"""
    try:
        today = date.today()
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(f"https://api.aladhan.com/v1/timings/{today.day}-{today.month}-{today.year}",
                params={"latitude": lat, "longitude": lon, "method": method, "school": school})
            r.raise_for_status()
            data = r.json()["data"]

        timings = data["timings"]
        hijri = data["date"]["hijri"]
        
        return {
            "success": True,
            "source": "aladhan",
            "times": {
                "fajr": clean_time(timings["Fajr"]),
                "sunrise": clean_time(timings["Sunrise"]),
                "dhuhr": clean_time(timings["Dhuhr"]),
                "asr": clean_time(timings["Asr"]),
                "maghrib": clean_time(timings["Maghrib"]),
                "isha": clean_time(timings["Isha"]),
                "midnight": clean_time(timings.get("Midnight", "")),
            },
            "hijri": {
                "date": f"{hijri['day']} {hijri['month']['ar']} {hijri['year']} هـ",
                "day": hijri["day"],
                "month_ar": hijri["month"]["ar"],
                "month_en": hijri["month"]["en"],
                "month_num": hijri["month"]["number"],
                "year": hijri["year"],
            },
            "meta": data.get("meta", {})
        }
    except Exception as e:
        raise HTTPException(500, f"خطأ في جلب أوقات الصلاة: {str(e)}")

# ==================== MOSQUE SEARCH ====================
@api_router.get("/mosques/search")
async def search_mosques(
    lat: float = Query(...), lon: float = Query(...),
    radius: int = Query(5000), query: Optional[str] = Query(None)
):
    """Search mosques using Mawaqit API first, fallback to Overpass"""
    
    # Try Mawaqit first (has real prayer times!)
    try:
        async with httpx.AsyncClient(timeout=20) as c:
            params = {"lat": lat, "lon": lon, "radius": radius}
            if query:
                params["word"] = query
            r = await c.get("https://mawaqit.net/api/2.0/mosque/search", params=params)
            if r.status_code == 200:
                mosques_raw = r.json()
                mosques = []
                for m in mosques_raw:
                    mosque = {
                        "osm_id": m.get("uuid", str(uuid.uuid4())),
                        "mawaqit_uuid": m.get("uuid"),
                        "name": m.get("name", ""),
                        "address": m.get("localisation", ""),
                        "latitude": float(m.get("latitude", 0)),
                        "longitude": float(m.get("longitude", 0)),
                        "websiteUrl": m.get("site"),
                        "phone": m.get("phone"),
                        "image": m.get("image"),
                        "hasAutoSync": True,
                        "hasMawaqit": True,
                        "times": m.get("times", []),
                        "iqama": m.get("iqama", []),
                        "jumua": m.get("jumua"),
                        "facilities": {
                            "womenSpace": m.get("womenSpace", False),
                            "parking": m.get("parking", False),
                            "ablutions": m.get("ablutions", False),
                            "handicapAccessibility": m.get("handicapAccessibility", False),
                            "childrenCourses": m.get("childrenCourses", False),
                            "adultCourses": m.get("adultCourses", False),
                        },
                        "_dist": float(m.get("proximity", 9999)) / 1000,
                    }
                    mosques.append(mosque)
                
                mosques.sort(key=lambda x: x["_dist"])
                return {"mosques": mosques[:50], "count": len(mosques), "source": "mawaqit"}
    except Exception as e:
        logger.warning(f"Mawaqit search failed: {e}")

    # Fallback to Overpass API
    try:
        if query:
            overpass_q = f'[out:json][timeout:20];(node["amenity"="place_of_worship"]["religion"="muslim"]["name"~"{query}",i](around:{radius},{lat},{lon});way["amenity"="place_of_worship"]["religion"="muslim"]["name"~"{query}",i](around:{radius},{lat},{lon}););out center body;'
        else:
            overpass_q = f'[out:json][timeout:20];(node["amenity"="place_of_worship"]["religion"="muslim"](around:{radius},{lat},{lon});way["amenity"="place_of_worship"]["religion"="muslim"](around:{radius},{lat},{lon}););out center body;'
        
        data = await query_overpass(overpass_q)
        mosques = []
        for el in (data or {}).get("elements", []):
            tags = el.get("tags", {})
            name = tags.get("name") or tags.get("name:ar")
            if not name:
                continue
            e_lat = el.get("lat") or el.get("center", {}).get("lat", 0)
            e_lon = el.get("lon") or el.get("center", {}).get("lon", 0)
            mosques.append({
                "osm_id": str(el.get("id")),
                "name": name,
                "address": tags.get("addr:street", "") + " " + tags.get("addr:city", ""),
                "latitude": e_lat, "longitude": e_lon,
                "hasAutoSync": False, "hasMawaqit": False,
                "_dist": haversine(lat, lon, e_lat, e_lon)
            })
        mosques.sort(key=lambda x: x["_dist"])
        return {"mosques": mosques[:50], "count": len(mosques), "source": "openstreetmap"}
    except Exception as e:
        raise HTTPException(500, f"خطأ في البحث: {str(e)}")

@api_router.post("/mosques/prayer-times")
async def mosque_times(req: MosqueTimesRequest):
    """Get mosque prayer times from Mawaqit or Aladhan"""
    
    # If we have UUID, use Mawaqit directly
    if req.mosqueUuid:
        try:
            async with httpx.AsyncClient(timeout=15) as c:
                r = await c.get(f"https://mawaqit.net/api/2.0/mosque/{req.mosqueUuid}/prayer-times")
                if r.status_code == 200:
                    data = r.json()
                    today_day = date.today().day
                    times_raw = data.get("times", {})
                    
                    if isinstance(times_raw, dict):
                        today_times = times_raw.get(str(today_day))
                    elif isinstance(times_raw, list) and len(times_raw) >= today_day:
                        today_times = times_raw[today_day - 1]
                    else:
                        today_times = None
                    
                    if today_times and len(today_times) >= 5:
                        keys = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]
                        times_map = {keys[i]: today_times[i] for i in range(min(len(keys), len(today_times)))}
                        return {
                            "success": True, "source": "mawaqit",
                            "times": times_map,
                            "jumua": data.get("jumua"),
                            "iqama": data.get("iqama"),
                        }
        except Exception as e:
            logger.warning(f"Mawaqit times error: {e}")

    # Try Mawaqit search by name
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get("https://mawaqit.net/api/2.0/mosque/search",
                params={"lat": req.latitude, "lon": req.longitude, "word": req.mosqueName[:20]})
            if r.status_code == 200:
                mosques = r.json()
                for m in mosques[:3]:
                    m_lat, m_lon = float(m.get("latitude", 0)), float(m.get("longitude", 0))
                    if haversine(req.latitude, req.longitude, m_lat, m_lon) < 0.5:
                        times = m.get("times", [])
                        if len(times) >= 5:
                            keys = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]
                            return {
                                "success": True, "source": "mawaqit",
                                "times": {keys[i]: times[i] for i in range(min(6, len(times)))},
                                "jumua": m.get("jumua"),
                                "iqama": m.get("iqama"),
                            }
    except Exception:
        pass

    # Fallback to Aladhan
    try:
        today = date.today()
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(f"https://api.aladhan.com/v1/timings/{today.day}-{today.month}-{today.year}",
                params={"latitude": req.latitude, "longitude": req.longitude, "method": req.method, "school": req.school})
            r.raise_for_status()
            t = r.json()["data"]["timings"]
            return {
                "success": True, "source": "calculated",
                "times": {
                    "fajr": clean_time(t["Fajr"]), "sunrise": clean_time(t["Sunrise"]),
                    "dhuhr": clean_time(t["Dhuhr"]), "asr": clean_time(t["Asr"]),
                    "maghrib": clean_time(t["Maghrib"]), "isha": clean_time(t["Isha"]),
                }
            }
    except Exception as e:
        raise HTTPException(500, str(e))

# ==================== PUSH NOTIFICATIONS ====================
@api_router.get("/push/vapid-key")
async def get_vapid_key():
    return {"publicKey": VAPID_PUBLIC_KEY}

@api_router.post("/push/subscribe")
async def subscribe_push(sub: PushSubscription, user: dict = Depends(get_user)):
    """Save push subscription to DB"""
    doc = {
        "id": str(uuid.uuid4()),
        "endpoint": sub.endpoint,
        "p256dh": sub.p256dh,
        "auth": sub.auth,
        "latitude": sub.latitude,
        "longitude": sub.longitude,
        "method": sub.method,
        "school": sub.school,
        "timezone": sub.timezone,
        "user_id": user["id"] if user else sub.user_id,
        "created_at": datetime.utcnow().isoformat(),
        "active": True,
    }
    await db.push_subscriptions.update_one(
        {"endpoint": sub.endpoint}, {"$set": doc}, upsert=True
    )
    return {"success": True, "message": "تم تسجيل الإشعارات بنجاح"}

@api_router.post("/push/test")
async def test_push(data: dict, user: dict = Depends(get_user)):
    """Send a test push notification"""
    endpoint = data.get("endpoint")
    if not endpoint:
        raise HTTPException(400, "endpoint مطلوب")
    
    sub = await db.push_subscriptions.find_one({"endpoint": endpoint})
    if not sub:
        raise HTTPException(404, "الاشتراك غير موجود")
    
    result = await send_push_notification(sub, {
        "title": "المؤذن العالمي 🕌",
        "body": "تم تفعيل الإشعارات بنجاح!",
        "icon": "/pwa-icon-192.png",
        "badge": "/pwa-icon-192.png",
        "tag": "test",
    })
    return {"success": result}

async def send_push_notification(sub: dict, payload: dict) -> bool:
    """Send a web push notification using pywebpush"""
    try:
        from pywebpush import webpush, WebPushException
        webpush(
            subscription_info={
                "endpoint": sub["endpoint"],
                "keys": {"p256dh": sub["p256dh"], "auth": sub["auth"]},
            },
            data=json_module.dumps(payload),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={"sub": VAPID_EMAIL},
        )
        return True
    except Exception as e:
        logger.error(f"Push failed: {e}")
        return False

@api_router.post("/push/send-prayer")
async def send_prayer_notifications(data: dict):
    """Send prayer time notifications to all subscribed users"""
    prayer_name = data.get("prayer", "")
    prayer_ar = {"fajr": "الفجر", "dhuhr": "الظهر", "asr": "العصر", "maghrib": "المغرب", "isha": "العشاء"}.get(prayer_name, prayer_name)
    
    subs = await db.push_subscriptions.find({"active": True}).to_list(None)
    sent = 0
    for sub in subs:
        payload = {
            "title": f"🕌 حان وقت صلاة {prayer_ar}",
            "body": "استعد للصلاة، حي على الصلاة، حي على الفلاح",
            "icon": "/pwa-icon-192.png",
            "badge": "/pwa-icon-192.png",
            "tag": f"prayer-{prayer_name}",
            "requireInteraction": True,
            "vibrate": [200, 100, 200, 100, 200],
            "actions": [{"action": "open", "title": "فتح التطبيق"}],
            "data": {"prayer": prayer_name, "type": "athan"}
        }
        if await send_push_notification(sub, payload):
            sent += 1
    
    return {"success": True, "sent": sent, "total": len(subs)}

# ==================== AI FEATURES ====================
@api_router.post("/ai/daily-athkar")
async def get_daily_athkar(req: DhikrAIRequest):
    """Generate contextual daily Athkar using Gemini AI"""
    
    prompts = {
        "morning": "أعطني 5 أذكار صباح مختلفة مع فضلها من الكتاب والسنة، بشكل JSON array من objects {text, virtue, count, reference}",
        "evening": "أعطني 5 أذكار مساء مختلفة مع فضلها من الكتاب والسنة، بشكل JSON array من objects {text, virtue, count, reference}",
        "after_prayer": "أعطني 5 أذكار بعد الصلاة مع فضلها، بشكل JSON array من objects {text, virtue, count, reference}",
        "sleep": "أعطني 5 أذكار النوم مع فضلها، بشكل JSON array من objects {text, virtue, count, reference}",
        "general": "أعطني 5 أذكار عامة يومية مع فضلها، بشكل JSON array من objects {text, virtue, count, reference}",
    }
    
    prompt = prompts.get(req.time_of_day, prompts["general"])
    if req.occasion:
        prompt += f". المناسبة: {req.occasion}"
    
    # Try Emergent LLM with Gemini
    if EMERGENT_LLM_KEY:
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"athkar-{req.time_of_day}-{date.today().isoformat()}",
                system_message="أنت عالم إسلامي متخصص في الأذكار والأدعية من الكتاب والسنة. أجب دائماً بـ JSON array صحيح فقط بدون أي نص إضافي."
            ).with_model("gemini", "gemini-2.0-flash")
            
            response = await chat.send_message(UserMessage(text=prompt))
            if response:
                json_match = re.search(r'\[.*\]', response, re.DOTALL)
                if json_match:
                    athkar = json_module.loads(json_match.group())
                    return {"success": True, "source": "gemini", "athkar": athkar, "time_of_day": req.time_of_day}
        except Exception as e:
            logger.warning(f"Emergent Gemini failed: {e}")
    
    # Fallback to static athkar
    return {
        "success": True, "source": "static",
        "time_of_day": req.time_of_day,
        "athkar": get_static_athkar(req.time_of_day)
    }

def get_static_athkar(time_of_day: str) -> list:
    morning = [
        {"text": "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", "virtue": "يُقال عند الصباح", "count": 1, "reference": "رواه مسلم"},
        {"text": "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ", "virtue": "من أذكار الصباح", "count": 1, "reference": "رواه الترمذي"},
        {"text": "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ", "virtue": "سيد الاستغفار", "count": 1, "reference": "رواه البخاري"},
        {"text": "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", "virtue": "حماية من الشر", "count": 3, "reference": "رواه مسلم"},
        {"text": "بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", "virtue": "من قالها 3 مرات لم تضره مصيبة", "count": 3, "reference": "رواه أبو داود والترمذي"},
    ]
    evening = [
        {"text": "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ", "virtue": "يُقال عند المساء", "count": 1, "reference": "رواه مسلم"},
        {"text": "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ", "virtue": "من أذكار المساء", "count": 1, "reference": "رواه الترمذي"},
        {"text": "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي", "virtue": "طلب العافية", "count": 3, "reference": "رواه أبو داود"},
        {"text": "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", "virtue": "حماية من الشر", "count": 3, "reference": "رواه مسلم"},
        {"text": "حَسْبُنَا اللهُ وَنِعْمَ الْوَكِيلُ", "virtue": "من قالها صباحاً ومساءً كفاه الله", "count": 7, "reference": "رواه أبو داود"},
    ]
    return evening if "evening" in time_of_day else morning

@api_router.post("/ai/smart-reminder")
async def smart_reminder(data: dict):
    """Generate smart contextual Islamic reminder"""
    context = data.get("context", {})
    prayer = context.get("nextPrayer", "")
    minutes_left = context.get("minutesLeft", 0)
    
    prompt = f"أعطني تذكير إسلامي قصير (جملة واحدة) مناسب لشخص يبقى {minutes_left} دقيقة قبل صلاة {prayer}. أجب بالعربية فقط."
    
    if EMERGENT_LLM_KEY:
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"reminder-{prayer}-{datetime.now().isoformat()}",
                system_message="أنت مذكّر إسلامي لطيف. أجب بجملة واحدة فقط بالعربية."
            ).with_model("gemini", "gemini-2.0-flash")
            
            response = await chat.send_message(UserMessage(text=prompt))
            if response:
                return {"reminder": response.strip()}
        except Exception as e:
            logger.warning(f"Emergent reminder failed: {e}")
    
    reminders = [
        "تذكر أن الصلاة عماد الدين، استعد لها بالوضوء",
        "قال النبي ﷺ: أبرد بالظهر فإن شدة الحر من فيح جهنم",
        "الصلاة على وقتها من أحب الأعمال إلى الله",
        "لا تؤخر صلاتك، فإن الموت لا يستأذن",
    ]
    import random
    return {"reminder": random.choice(reminders)}

# ==================== HIJRI DATE ====================
@api_router.get("/hijri-date")
async def hijri_date(lat: float = Query(24.68), lon: float = Query(46.72)):
    try:
        today = date.today()
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(f"https://api.aladhan.com/v1/timings/{today.day}-{today.month}-{today.year}",
                params={"latitude": lat, "longitude": lon, "method": 4})
            r.raise_for_status()
            hijri = r.json()["data"]["date"]["hijri"]
        return {
            "hijriDate": f"{hijri['day']} {hijri['month']['ar']} {hijri['year']} هـ",
            "day": hijri["day"], "month_ar": hijri["month"]["ar"],
            "month_en": hijri["month"]["en"], "year": hijri["year"],
            "month_num": hijri["month"]["number"],
        }
    except Exception as e:
        raise HTTPException(500, str(e))

# ==================== DAILY HADITH ====================
STATIC_HADITHS = [
    {"text": "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى", "narrator": "عمر بن الخطاب", "source": "صحيح البخاري", "number": "1"},
    {"text": "مَنْ كَانَ يُؤْمِنُ بِاللهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", "narrator": "أبو هريرة", "source": "صحيح البخاري ومسلم", "number": "15"},
    {"text": "لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", "narrator": "أنس بن مالك", "source": "صحيح البخاري ومسلم", "number": "13"},
    {"text": "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", "narrator": "عبد الله بن عمرو", "source": "صحيح البخاري", "number": "10"},
    {"text": "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللهُ لَهُ بِهِ طَرِيقًا إِلَى الجَنَّةِ", "narrator": "أبو هريرة", "source": "صحيح مسلم", "number": "2699"},
    {"text": "إِنَّ اللهَ لا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ", "narrator": "أبو هريرة", "source": "صحيح مسلم", "number": "2564"},
    {"text": "الطُّهُورُ شَطْرُ الإِيمَانِ، وَالحَمْدُ لِلَّهِ تَمْلأُ المِيزَانَ", "narrator": "أبو مالك الأشعري", "source": "صحيح مسلم", "number": "223"},
    {"text": "خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ", "narrator": "عثمان بن عفان", "source": "صحيح البخاري", "number": "5027"},
    {"text": "الدُّعَاءُ هُوَ الْعِبَادَةُ", "narrator": "النعمان بن بشير", "source": "سنن الترمذي", "number": "3247"},
    {"text": "مَا مِنْ عَبْدٍ يَسْتَغْفِرُ اللهَ إِلا غَفَرَ اللهُ لَهُ", "narrator": "أبو هريرة", "source": "سنن الترمذي", "number": "3559"},
    {"text": "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ", "narrator": "أبو ذر", "source": "سنن الترمذي", "number": "1956"},
    {"text": "أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ", "narrator": "عائشة", "source": "صحيح البخاري ومسلم", "number": "6464"},
    {"text": "الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ", "narrator": "أبو هريرة", "source": "صحيح مسلم", "number": "2956"},
    {"text": "مَنْ صَلَّى عَلَيَّ صَلاةً صَلَّى اللهُ عَلَيْهِ بِهَا عَشْرًا", "narrator": "أبو هريرة", "source": "صحيح مسلم", "number": "408"},
    {"text": "اتَّقِ اللهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ", "narrator": "معاذ بن جبل", "source": "سنن الترمذي", "number": "1987"},
    {"text": "الصَّلَوَاتُ الْخَمْسُ وَالْجُمُعَةُ إِلَى الْجُمُعَةِ كَفَّارَاتٌ لِمَا بَيْنَهُنَّ مَا اجْتُنِبَتِ الْكَبَائِرُ", "narrator": "أبو هريرة", "source": "صحيح مسلم", "number": "233"},
    {"text": "إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَمَلُهُ إِلا مِنْ ثَلاثٍ: صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ", "narrator": "أبو هريرة", "source": "صحيح مسلم", "number": "1631"},
    {"text": "رِضَا اللهِ فِي رِضَا الْوَالِدَيْنِ وَسَخَطُ اللهِ فِي سَخَطِ الْوَالِدَيْنِ", "narrator": "عبد الله بن عمرو", "source": "سنن الترمذي", "number": "1899"},
    {"text": "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ وَمَا زَادَ اللهُ عَبْدًا بِعَفْوٍ إِلا عِزًّا", "narrator": "أبو هريرة", "source": "صحيح مسلم", "number": "2588"},
    {"text": "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ ثَقِيلَتَانِ فِي المِيزَانِ: سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ العَظِيمِ", "narrator": "أبو هريرة", "source": "صحيح البخاري ومسلم", "number": "6406"},
    {"text": "لَا تَحَاسَدُوا وَلَا تَنَاجَشُوا وَلَا تَبَاغَضُوا وَلَا تَدَابَرُوا وَكُونُوا عِبَادَ اللهِ إِخْوَانًا", "narrator": "أبو هريرة", "source": "صحيح مسلم", "number": "2564"},
    {"text": "مَنْ قَرَأَ آيَةَ الْكُرْسِيِّ دُبُرَ كُلِّ صَلاةٍ مَكْتُوبَةٍ لَمْ يَمْنَعْهُ مِنْ دُخُولِ الْجَنَّةِ إِلا أَنْ يَمُوتَ", "narrator": "أبو أمامة", "source": "سنن النسائي", "number": "9928"},
    {"text": "إِنَّ مِنْ أَحَبِّكُمْ إِلَيَّ وَأَقْرَبِكُمْ مِنِّي مَجْلِسًا يَوْمَ الْقِيَامَةِ أَحَاسِنُكُمْ أَخْلاقًا", "narrator": "جابر", "source": "سنن الترمذي", "number": "2018"},
    {"text": "الْجَنَّةُ تَحْتَ أَقْدَامِ الأُمَّهَاتِ", "narrator": "أنس بن مالك", "source": "سنن النسائي", "number": "3104"},
    {"text": "اقْرَأُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ", "narrator": "أبو أمامة", "source": "صحيح مسلم", "number": "804"},
    {"text": "مَنْ يُرِدِ اللهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ", "narrator": "معاوية بن أبي سفيان", "source": "صحيح البخاري", "number": "71"},
    {"text": "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ وَفِي كُلٍّ خَيْرٌ", "narrator": "أبو هريرة", "source": "صحيح مسلم", "number": "2664"},
    {"text": "بُنِيَ الإِسْلامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لا إِلَهَ إِلا اللهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللهِ وَإِقَامِ الصَّلاةِ وَإِيتَاءِ الزَّكَاةِ وَصَوْمِ رَمَضَانَ وَحَجِّ الْبَيْتِ", "narrator": "ابن عمر", "source": "صحيح البخاري ومسلم", "number": "8"},
    {"text": "مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لا يَذْكُرُ رَبَّهُ مَثَلُ الْحَيِّ وَالْمَيِّتِ", "narrator": "أبو موسى الأشعري", "source": "صحيح البخاري", "number": "6407"},
    {"text": "مَا مَلَأَ آدَمِيٌّ وِعَاءً شَرًّا مِنْ بَطْنٍ", "narrator": "المقدام بن معدي كرب", "source": "سنن الترمذي", "number": "2380"},
]

@api_router.get("/daily-hadith")
async def daily_hadith():
    """Get today's hadith - rotates daily from collection"""
    today = date.today()
    day_of_year = today.timetuple().tm_yday
    idx = day_of_year % len(STATIC_HADITHS)
    hadith = STATIC_HADITHS[idx]
    return {
        "success": True,
        "hadith": {
            "text": hadith["text"],
            "narrator": hadith["narrator"],
            "source": hadith["source"],
            "number": hadith["number"],
        },
        "date": today.isoformat(),
    }

# ==================== QURAN ====================
@api_router.get("/quran/surah/{number}")
async def get_surah(number: int, reciter: str = Query("ar.alafasy")):
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.get(f"https://api.alquran.cloud/v1/surah/{number}/{reciter}")
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(500, str(e))

@api_router.get("/quran/search")
async def search_quran(q: str = Query(...)):
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(f"https://api.alquran.cloud/v1/search/{q}/all/ar")
            r.raise_for_status()
            return r.json()
    except Exception as e:
        raise HTTPException(500, str(e))

# ==================== USER DATA SYNC ====================
@api_router.post("/user/sync")
async def sync_user_data(data: dict, user: dict = Depends(get_user)):
    """Sync user data to cloud"""
    if not user:
        raise HTTPException(401, "مطلوب تسجيل الدخول")
    
    sync_doc = {
        "user_id": user["id"],
        "updated_at": datetime.utcnow().isoformat(),
        **{k: data[k] for k in data if k not in ("user_id", "_id")}
    }
    await db.user_data.update_one({"user_id": user["id"]}, {"$set": sync_doc}, upsert=True)
    return {"success": True}

@api_router.get("/user/sync")
async def get_user_data(user: dict = Depends(get_user)):
    """Get synced user data"""
    if not user:
        raise HTTPException(401, "مطلوب تسجيل الدخول")
    doc = await db.user_data.find_one({"user_id": user["id"]}, {"_id": 0})
    return doc or {}

# ==================== STATUS (legacy) ====================
class StatusCheckCreate(BaseModel):
    client_name: str

@api_router.post("/status")
async def create_status(data: StatusCheckCreate):
    doc = {"id": str(uuid.uuid4()), "client_name": data.client_name, "timestamp": datetime.utcnow().isoformat()}
    await db.status_checks.insert_one(doc)
    return doc

@api_router.get("/status")
async def get_status():
    docs = await db.status_checks.find({}, {"_id": 0}).to_list(100)
    return docs

# ==================== APP ====================
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    client_db.close()
