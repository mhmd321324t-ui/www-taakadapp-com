"""
Admin API Tests for المؤذن العالمي (The Global Muezzin) App
Tests admin dashboard endpoints: stats, users, settings, notifications
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://prayer-times-ai-1.preview.emergentagent.com')
ADMIN_EMAIL = 'mhmd321324t@gmail.com'
ADMIN_PASSWORD = 'admin123'


@pytest.fixture(scope='module')
def admin_token():
    """Get admin authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip(f"Admin login failed: {response.text}")
    data = response.json()
    assert "access_token" in data
    print(f"✅ Admin login successful for {ADMIN_EMAIL}")
    return data["access_token"]


def auth_headers(token):
    return {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_returns_token(self):
        """Admin login returns access token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        print("✅ Admin login returns valid token")
    
    def test_admin_registration_already_exists(self):
        """Admin email already exists - returns 400"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": ADMIN_EMAIL,
            "password": "newpass123",
            "name": "Admin"
        })
        # Should be 400 because admin already exists
        assert response.status_code == 400
        print("✅ Admin registration correctly returns 400 (already exists)")


class TestAdminStatsEndpoint:
    """Admin stats endpoint tests"""
    
    def test_admin_stats_returns_total_users(self, admin_token):
        """GET /api/admin/stats returns stats with total_users"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=auth_headers(admin_token))
        assert response.status_code == 200
        
        data = response.json()
        assert "stats" in data
        
        stats = data["stats"]
        assert "total_users" in stats
        assert isinstance(stats["total_users"], int)
        assert stats["total_users"] >= 0
        
        assert "push_subscribers" in stats
        assert "status_checks" in stats
        
        print(f"✅ Admin stats: {stats['total_users']} users, {stats['push_subscribers']} subscribers")
    
    def test_admin_stats_has_recent_users_without_password(self, admin_token):
        """Admin stats recent_users should NOT contain password_hash"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=auth_headers(admin_token))
        assert response.status_code == 200
        
        data = response.json()
        assert "recent_users" in data
        
        for user in data["recent_users"]:
            assert "password_hash" not in user, "SECURITY ISSUE: password_hash exposed in response!"
            assert "id" in user
            assert "email" in user
        
        print(f"✅ Admin stats recent_users ({len(data['recent_users'])} users) has no password_hash")
    
    def test_admin_stats_requires_auth(self):
        """Admin stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401
        print("✅ Admin stats correctly requires authentication")
    
    def test_admin_stats_requires_admin_role(self):
        """Non-admin user cannot access admin stats"""
        # Create a normal user
        timestamp = int(time.time())
        test_email = f"TEST_nonadmin_{timestamp}@test.com"
        
        reg = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "name": "Regular User"
        })
        if reg.status_code != 200:
            pytest.skip("Could not create test user")
        
        token = reg.json()["access_token"]
        
        # Try to access admin stats with non-admin token
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=auth_headers(token))
        assert response.status_code == 403
        print("✅ Non-admin user correctly gets 403 for admin stats")


class TestAdminUsersEndpoint:
    """Admin users endpoint tests"""
    
    def test_admin_users_returns_list(self, admin_token):
        """GET /api/admin/users returns user list"""
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=auth_headers(admin_token))
        assert response.status_code == 200
        
        data = response.json()
        assert "users" in data
        assert isinstance(data["users"], list)
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        
        print(f"✅ Admin users: {data['total']} total users, page {data['page']}/{data['pages']}")
    
    def test_admin_users_no_password_hash(self, admin_token):
        """Admin users list should NOT contain password_hash"""
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=auth_headers(admin_token))
        assert response.status_code == 200
        
        data = response.json()
        for user in data["users"]:
            assert "password_hash" not in user, "SECURITY ISSUE: password_hash exposed!"
            assert "id" in user
            assert "email" in user
        
        print(f"✅ Admin users list ({len(data['users'])} users) has no password_hash")
    
    def test_admin_users_pagination(self, admin_token):
        """Admin users supports pagination"""
        response = requests.get(f"{BASE_URL}/api/admin/users?page=1&limit=5", headers=auth_headers(admin_token))
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["users"]) <= 5
        assert data["page"] == 1
        print("✅ Admin users pagination working")


class TestAdminSettingsEndpoint:
    """Admin settings endpoint tests"""
    
    def test_admin_get_settings(self, admin_token):
        """GET /api/admin/settings returns app settings"""
        response = requests.get(f"{BASE_URL}/api/admin/settings", headers=auth_headers(admin_token))
        assert response.status_code == 200
        
        data = response.json()
        # Settings may be default or updated - check for key fields
        assert "key" in data or "app_name" in data
        assert "maintenance_mode" in data
        
        # If default settings, should have app_name
        if "app_name" in data:
            print(f"✅ Admin settings: app={data['app_name']}, method={data.get('default_method')}")
        else:
            print(f"✅ Admin settings: maintenance_mode={data['maintenance_mode']}")
    
    def test_admin_update_settings(self, admin_token):
        """PUT /api/admin/settings updates settings"""
        # Update settings
        response = requests.put(f"{BASE_URL}/api/admin/settings", 
            headers=auth_headers(admin_token),
            json={
                "announcement": "Test announcement from pytest",
                "maintenance_mode": False
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "message" in data
        
        # Verify update persisted
        get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=auth_headers(admin_token))
        settings = get_response.json()
        assert settings["announcement"] == "Test announcement from pytest"
        
        # Clean up - reset announcement
        requests.put(f"{BASE_URL}/api/admin/settings", 
            headers=auth_headers(admin_token),
            json={"announcement": ""}
        )
        
        print("✅ Admin settings update and persistence working")
    
    def test_admin_settings_requires_admin(self):
        """Non-admin cannot access settings"""
        timestamp = int(time.time())
        test_email = f"TEST_settings_{timestamp}@test.com"
        
        reg = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "name": "Regular User"
        })
        if reg.status_code != 200:
            pytest.skip("Could not create test user")
        
        token = reg.json()["access_token"]
        
        response = requests.get(f"{BASE_URL}/api/admin/settings", headers=auth_headers(token))
        assert response.status_code == 403
        print("✅ Non-admin correctly gets 403 for admin settings")


class TestAdminNotificationEndpoint:
    """Admin notification endpoint tests"""
    
    def test_admin_send_notification(self, admin_token):
        """POST /api/admin/send-notification sends notification"""
        response = requests.post(f"{BASE_URL}/api/admin/send-notification",
            headers=auth_headers(admin_token),
            json={
                "title": "Test Notification",
                "body": "This is a test notification from pytest"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "message" in data
        assert "target_count" in data
        
        print(f"✅ Admin notification sent to {data['target_count']} subscribers")


class TestBasicEndpoints:
    """Basic endpoints for verification"""
    
    def test_health_endpoint(self):
        """Health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["app"] == "المؤذن العالمي"
        print("✅ Health endpoint working")
    
    def test_prayer_times_endpoint(self):
        """Prayer times endpoint"""
        response = requests.get(f"{BASE_URL}/api/prayer-times", params={
            "lat": 24.47, "lon": 39.61, "method": 4, "school": 0
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "times" in data
        assert "fajr" in data["times"]
        print(f"✅ Prayer times: Fajr={data['times']['fajr']}")
    
    def test_daily_hadith_endpoint(self):
        """Daily hadith endpoint"""
        response = requests.get(f"{BASE_URL}/api/daily-hadith")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "hadith" in data
        assert "text" in data["hadith"]
        print("✅ Daily hadith working")
    
    def test_ai_daily_athkar_endpoint(self):
        """AI daily athkar endpoint - should return gemini source"""
        response = requests.post(f"{BASE_URL}/api/ai/daily-athkar", json={
            "time_of_day": "morning",
            "language": "ar"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["source"] == "gemini", f"Expected gemini source but got {data['source']}"
        assert "athkar" in data
        print(f"✅ AI athkar working, source={data['source']}")
    
    def test_ai_smart_reminder_endpoint(self):
        """AI smart reminder endpoint"""
        response = requests.post(f"{BASE_URL}/api/ai/smart-reminder", json={
            "context": {"nextPrayer": "dhuhr", "minutesLeft": 15}
        })
        assert response.status_code == 200
        data = response.json()
        assert "reminder" in data
        print(f"✅ AI reminder: '{data['reminder'][:50]}...'")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
