"""
Backend API Tests for المؤذن العالمي (The Global Muezzin) App
Tests prayer times, daily hadith, AI features, auth, and mosque search endpoints
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://prayer-times-app-34.preview.emergentagent.com')


class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_endpoint_returns_healthy(self):
        """Verify /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert data["app"] == "المؤذن العالمي"
        print("✅ Health endpoint working correctly")


class TestPrayerTimesEndpoint:
    """Prayer times API tests - uses Aladhan.com API"""
    
    def test_prayer_times_with_valid_location(self):
        """Get prayer times for Medina, Saudi Arabia"""
        response = requests.get(f"{BASE_URL}/api/prayer-times", params={
            "lat": 24.47,
            "lon": 39.61,
            "method": 4,  # Umm Al-Qura
            "school": 0
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["source"] == "aladhan"
        
        # Verify all prayer times are present
        times = data["times"]
        required_prayers = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]
        for prayer in required_prayers:
            assert prayer in times, f"Missing prayer: {prayer}"
            assert ":" in times[prayer], f"Invalid time format for {prayer}"
        
        # Verify hijri date is present
        assert "hijri" in data
        assert "date" in data["hijri"]
        assert "day" in data["hijri"]
        assert "month_ar" in data["hijri"]
        
        print(f"✅ Prayer times returned: Fajr={times['fajr']}, Dhuhr={times['dhuhr']}, Maghrib={times['maghrib']}")
    
    def test_prayer_times_for_mecca(self):
        """Get prayer times for Mecca"""
        response = requests.get(f"{BASE_URL}/api/prayer-times", params={
            "lat": 21.42,
            "lon": 39.82,
            "method": 4,
            "school": 0
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "times" in data
        print("✅ Prayer times for Mecca working")


class TestDailyHadithEndpoint:
    """Daily hadith API tests"""
    
    def test_daily_hadith_returns_data(self):
        """Verify /api/daily-hadith returns hadith data"""
        response = requests.get(f"{BASE_URL}/api/daily-hadith")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "hadith" in data
        
        hadith = data["hadith"]
        assert "text" in hadith and len(hadith["text"]) > 0
        assert "narrator" in hadith
        assert "source" in hadith
        assert "number" in hadith
        
        # Verify date is returned
        assert "date" in data
        
        print(f"✅ Daily hadith: '{hadith['text'][:50]}...' - {hadith['source']}")


class TestAIFeatures:
    """AI-powered features tests"""
    
    def test_smart_reminder_endpoint(self):
        """Test /api/ai/smart-reminder returns reminder text"""
        response = requests.post(f"{BASE_URL}/api/ai/smart-reminder", json={
            "context": {
                "nextPrayer": "asr",
                "minutesLeft": 30
            }
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "reminder" in data
        assert len(data["reminder"]) > 0
        print(f"✅ Smart reminder: '{data['reminder']}'")
    
    def test_daily_athkar_endpoint(self):
        """Test /api/ai/daily-athkar returns athkar data from Gemini AI"""
        response = requests.post(f"{BASE_URL}/api/ai/daily-athkar", json={
            "time_of_day": "morning",
            "language": "ar",
            "count": 5
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "athkar" in data
        assert len(data["athkar"]) >= 1
        
        # Verify source is gemini (real AI, not static fallback)
        assert "source" in data, "Response should include source field"
        assert data["source"] == "gemini", f"Expected source=gemini but got {data['source']}"
        
        # Verify athkar structure
        first_athkar = data["athkar"][0]
        assert "text" in first_athkar
        assert "virtue" in first_athkar
        assert "count" in first_athkar
        assert "reference" in first_athkar
        
        print(f"✅ Daily athkar returned {len(data['athkar'])} items, source: {data['source']} (AI working!)")
    
    def test_evening_athkar(self):
        """Test evening athkar"""
        response = requests.post(f"{BASE_URL}/api/ai/daily-athkar", json={
            "time_of_day": "evening",
            "language": "ar"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "athkar" in data
        print("✅ Evening athkar working")


class TestMosqueSearch:
    """Mosque search endpoint tests"""
    
    def test_mosque_search_medina(self):
        """Search for mosques near Medina (includes Al-Masjid An-Nabawi)"""
        response = requests.get(f"{BASE_URL}/api/mosques/search", params={
            "lat": 24.47,
            "lon": 39.61,
            "radius": 5000
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "mosques" in data
        assert "count" in data
        assert "source" in data
        
        # Should find mosques in Medina
        if data["count"] > 0:
            mosque = data["mosques"][0]
            assert "name" in mosque
            assert "latitude" in mosque
            assert "longitude" in mosque
            print(f"✅ Found {data['count']} mosque(s) near Medina, first: '{mosque['name']}'")
        else:
            print("⚠️ No mosques found near Medina (API may be rate limited)")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_register_user(self):
        """Test user registration"""
        timestamp = int(time.time())
        test_email = f"TEST_user_{timestamp}@test.com"
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "name": "Test User"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == test_email.lower()
        
        print(f"✅ User registration successful for {test_email}")
        return test_email
    
    def test_login_user(self):
        """Test user login with previously registered user"""
        # First register a user
        timestamp = int(time.time())
        test_email = f"TEST_login_{timestamp}@test.com"
        
        # Register
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "name": "Login Test"
        })
        assert reg_response.status_code == 200
        
        # Login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": test_email,
            "password": "testpass123"
        })
        assert login_response.status_code == 200
        
        data = login_response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == test_email.lower()
        
        print(f"✅ User login successful")
    
    def test_login_invalid_credentials(self):
        """Test login with wrong password returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✅ Invalid login correctly returns 401")
    
    def test_duplicate_registration(self):
        """Test registering same email twice returns 400"""
        timestamp = int(time.time())
        test_email = f"TEST_dup_{timestamp}@test.com"
        
        # First registration
        response1 = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "name": "Test User"
        })
        assert response1.status_code == 200
        
        # Second registration with same email
        response2 = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass456",
            "name": "Test User 2"
        })
        assert response2.status_code == 400
        print("✅ Duplicate registration correctly returns 400")


class TestQuranEndpoints:
    """Quran API tests (proxies to Alquran.cloud)"""
    
    def test_get_surah_fatiha(self):
        """Get Surah Al-Fatiha"""
        response = requests.get(f"{BASE_URL}/api/quran/surah/1")
        assert response.status_code == 200
        
        data = response.json()
        assert data["code"] == 200
        assert "data" in data
        assert data["data"]["number"] == 1
        assert data["data"]["englishName"] == "Al-Faatiha"
        print("✅ Quran surah endpoint working")


class TestHijriDate:
    """Hijri date endpoint tests"""
    
    def test_hijri_date(self):
        """Get current Hijri date"""
        response = requests.get(f"{BASE_URL}/api/hijri-date", params={
            "lat": 24.68,
            "lon": 46.72
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "hijriDate" in data
        assert "day" in data
        assert "month_ar" in data
        assert "year" in data
        
        print(f"✅ Hijri date: {data['hijriDate']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
