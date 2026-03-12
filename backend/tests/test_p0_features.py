"""
Test P0 Features for المؤذن العالمي:
1. Auth endpoints (login, register, auth/me)
2. Admin stats endpoint
3. Prayer times API
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://prayer-times-ai-1.preview.emergentagent.com')

# Admin credentials for testing
ADMIN_EMAIL = "mhmd321324t@gmail.com"
ADMIN_PASSWORD = "admin123"


class TestHealthAndStatus:
    """Health and status endpoints"""

    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "المؤذن العالمي" in data.get("app", "")
        print(f"✅ Health endpoint: {data}")

    def test_root_endpoint(self):
        """Test /api/ returns app info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "المؤذن العالمي" in data.get("message", "")
        print(f"✅ Root endpoint: {data}")


class TestAuthEndpoints:
    """Authentication endpoint tests"""

    def test_login_with_admin_credentials(self):
        """Test POST /api/auth/login with admin credentials returns access_token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "access_token" in data, "Missing access_token in response"
        assert "user" in data, "Missing user in response"
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"✅ Admin login successful, token received")

    def test_login_with_invalid_credentials(self):
        """Test login with wrong credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@email.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print(f"✅ Invalid login correctly rejected with 401")

    def test_register_new_user(self):
        """Test POST /api/auth/register creates new user"""
        test_email = f"TEST_user_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": test_email, "password": "testpass123", "name": "Test User"}
        )
        assert response.status_code == 200, f"Register failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == test_email.lower()
        print(f"✅ User registration successful: {test_email}")

    def test_register_duplicate_email(self):
        """Test registering with existing email returns 400"""
        # First registration
        test_email = f"TEST_dup_{uuid.uuid4().hex[:8]}@test.com"
        requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": test_email, "password": "testpass123"}
        )
        
        # Second registration with same email
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": test_email, "password": "testpass123"}
        )
        assert response.status_code == 400
        print(f"✅ Duplicate email registration correctly rejected")

    def test_auth_me_with_valid_token(self):
        """Test GET /api/auth/me with valid token returns user info"""
        # First login to get token
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_response.json()["access_token"]
        
        # Now test auth/me
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["email"] == ADMIN_EMAIL
        assert "id" in data
        print(f"✅ Auth/me returned user info: {data['email']}")

    def test_auth_me_without_token(self):
        """Test GET /api/auth/me without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print(f"✅ Auth/me without token correctly rejected")


class TestAdminEndpoints:
    """Admin endpoint tests"""

    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return response.json()["access_token"]

    def test_admin_stats_with_admin_token(self, admin_token):
        """Test GET /api/admin/stats with admin token returns stats"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "stats" in data
        assert "total_users" in data["stats"]
        assert "push_subscribers" in data["stats"]
        # Verify no password_hash exposed
        if "recent_users" in data:
            for user in data["recent_users"]:
                assert "password_hash" not in user, "Security issue: password_hash exposed!"
        print(f"✅ Admin stats: {data['stats']}")

    def test_admin_stats_with_non_admin_token(self):
        """Test GET /api/admin/stats with non-admin token returns 403"""
        # Create a regular user
        test_email = f"TEST_regular_{uuid.uuid4().hex[:8]}@test.com"
        reg_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": test_email, "password": "testpass123"}
        )
        if reg_response.status_code != 200:
            pytest.skip("Could not create test user")
        
        token = reg_response.json()["access_token"]
        
        # Try to access admin stats
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403
        print(f"✅ Non-admin correctly rejected from admin stats")

    def test_admin_stats_without_token(self):
        """Test GET /api/admin/stats without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401
        print(f"✅ Admin stats without token correctly rejected")


class TestPrayerTimesAPI:
    """Prayer times endpoint tests"""

    def test_prayer_times_with_valid_coords(self):
        """Test GET /api/prayer-times with lat/lon returns times"""
        response = requests.get(
            f"{BASE_URL}/api/prayer-times",
            params={"lat": 21.4225, "lon": 39.8262, "method": 4, "school": 0}  # Mecca coordinates
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "times" in data
        times = data["times"]
        
        # Verify all prayer times are present
        required_prayers = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]
        for prayer in required_prayers:
            assert prayer in times, f"Missing {prayer} in times"
            assert times[prayer], f"{prayer} time is empty"
        
        # Verify hijri date
        assert "hijri" in data
        print(f"✅ Prayer times received: {times}")

    def test_prayer_times_missing_params(self):
        """Test prayer times without required params returns error"""
        response = requests.get(f"{BASE_URL}/api/prayer-times")
        assert response.status_code == 422  # Validation error
        print(f"✅ Missing params correctly rejected")


class TestHijriDateAPI:
    """Hijri date endpoint tests"""

    def test_hijri_date_endpoint(self):
        """Test GET /api/hijri-date returns hijri date"""
        response = requests.get(
            f"{BASE_URL}/api/hijri-date",
            params={"lat": 24.68, "lon": 46.72}  # Riyadh coordinates
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "hijriDate" in data
        assert "day" in data
        assert "month_ar" in data
        assert "year" in data
        print(f"✅ Hijri date: {data['hijriDate']}")


class TestDailyHadith:
    """Daily hadith endpoint tests"""

    def test_daily_hadith_endpoint(self):
        """Test GET /api/daily-hadith returns hadith"""
        response = requests.get(f"{BASE_URL}/api/daily-hadith")
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "hadith" in data
        hadith = data["hadith"]
        assert "text" in hadith
        assert "narrator" in hadith
        assert "source" in hadith
        print(f"✅ Daily hadith received from: {hadith['narrator']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
