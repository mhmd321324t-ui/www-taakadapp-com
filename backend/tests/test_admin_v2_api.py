"""
Admin API v2 Tests for المؤذن العالمي (The Global Muezzin) App
Tests: Ads management, Pages management, Scheduled notifications, Settings
This iteration tests the new 6-tab admin dashboard features
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://prayer-times-app-34.preview.emergentagent.com')
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
    return data["access_token"]


def auth_headers(token):
    return {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }


# ==================== HEALTH & AUTH TESTS ====================
class TestHealthAndAuth:
    """Basic health and authentication tests"""
    
    def test_health_endpoint(self):
        """Health check returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["app"] == "المؤذن العالمي"
        print("✅ Health endpoint: healthy")
    
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
        print(f"✅ Admin login successful: {ADMIN_EMAIL}")


# ==================== ADMIN STATS TESTS ====================
class TestAdminStats:
    """Admin stats endpoint - no password_hash exposed"""
    
    def test_admin_stats_no_password_hash(self, admin_token):
        """Admin stats should NOT expose password_hash"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=auth_headers(admin_token))
        assert response.status_code == 200
        data = response.json()
        
        assert "stats" in data
        assert "total_users" in data["stats"]
        assert "push_subscribers" in data["stats"]
        
        # CRITICAL: Verify no password_hash in recent_users
        for user in data.get("recent_users", []):
            assert "password_hash" not in user, "SECURITY: password_hash exposed!"
        
        print(f"✅ Admin stats: {data['stats']['total_users']} users, no password_hash exposed")


# ==================== ADS MANAGEMENT TESTS ====================
class TestAdsManagement:
    """Ads management endpoints - CREATE, READ, DELETE"""
    
    def test_get_ads_list(self, admin_token):
        """GET /api/admin/ads returns ad placements list"""
        response = requests.get(f"{BASE_URL}/api/admin/ads", headers=auth_headers(admin_token))
        assert response.status_code == 200
        data = response.json()
        assert "ads" in data
        assert isinstance(data["ads"], list)
        assert "total" in data
        print(f"✅ Admin ads list: {data['total']} ads")
    
    def test_create_and_delete_ad(self, admin_token):
        """POST /api/admin/ads creates ad, DELETE removes it"""
        # Create
        create_response = requests.post(f"{BASE_URL}/api/admin/ads", 
            headers=auth_headers(admin_token),
            json={
                "name": "TEST_Ad_ExoClick",
                "provider": "ExoClick",
                "code": "<script>test</script>",
                "placement": "prayer",
                "ad_type": "banner",
                "enabled": True,
                "priority": 0
            }
        )
        assert create_response.status_code == 200
        data = create_response.json()
        assert data["success"] is True
        assert "ad" in data
        assert data["ad"]["name"] == "TEST_Ad_ExoClick"
        assert data["ad"]["provider"] == "ExoClick"
        ad_id = data["ad"]["id"]
        
        # Verify ad persisted via GET
        get_response = requests.get(f"{BASE_URL}/api/admin/ads", headers=auth_headers(admin_token))
        ads = get_response.json()["ads"]
        found = any(a["id"] == ad_id for a in ads)
        assert found, "Created ad not found in list"
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/admin/ads/{ad_id}", headers=auth_headers(admin_token))
        assert delete_response.status_code == 200
        assert delete_response.json()["success"] is True
        
        # Verify deleted
        verify_response = requests.get(f"{BASE_URL}/api/admin/ads", headers=auth_headers(admin_token))
        ads_after = verify_response.json()["ads"]
        assert not any(a["id"] == ad_id for a in ads_after), "Ad should be deleted"
        
        print("✅ Ad CRUD: create, verify, delete working")
    
    def test_public_ads_endpoint(self):
        """GET /api/ads/active returns active ads publicly"""
        response = requests.get(f"{BASE_URL}/api/ads/active")
        assert response.status_code == 200
        data = response.json()
        assert "ads" in data
        print(f"✅ Public ads endpoint: {len(data['ads'])} active ads")


# ==================== PAGES MANAGEMENT TESTS ====================
class TestPagesManagement:
    """Custom pages management - CREATE, READ, DELETE"""
    
    def test_get_pages_list(self, admin_token):
        """GET /api/admin/pages returns custom pages"""
        response = requests.get(f"{BASE_URL}/api/admin/pages", headers=auth_headers(admin_token))
        assert response.status_code == 200
        data = response.json()
        assert "pages" in data
        assert isinstance(data["pages"], list)
        print(f"✅ Admin pages list: {len(data['pages'])} pages")
    
    def test_create_and_delete_page(self, admin_token):
        """POST /api/admin/pages creates page, DELETE removes it"""
        # Create
        create_response = requests.post(f"{BASE_URL}/api/admin/pages",
            headers=auth_headers(admin_token),
            json={
                "title": "TEST_Page_Athkar",
                "category": "أذكار",
                "content": "محتوى اختباري للأذكار",
                "enabled": True,
                "order": 99
            }
        )
        assert create_response.status_code == 200
        data = create_response.json()
        assert data["success"] is True
        assert "page" in data
        assert data["page"]["title"] == "TEST_Page_Athkar"
        page_id = data["page"]["id"]
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/admin/pages/{page_id}", headers=auth_headers(admin_token))
        assert delete_response.status_code == 200
        
        print("✅ Page CRUD: create, delete working")


# ==================== SCHEDULED NOTIFICATIONS TESTS ====================
class TestScheduledNotifications:
    """Scheduled notifications management"""
    
    def test_get_scheduled_notifications(self, admin_token):
        """GET /api/admin/scheduled-notifications returns list"""
        response = requests.get(f"{BASE_URL}/api/admin/scheduled-notifications", headers=auth_headers(admin_token))
        assert response.status_code == 200
        data = response.json()
        assert "notifications" in data
        assert isinstance(data["notifications"], list)
        print(f"✅ Scheduled notifications list: {len(data['notifications'])} items")
    
    def test_create_and_delete_notification(self, admin_token):
        """POST creates scheduled notification, DELETE removes it"""
        # Create
        create_response = requests.post(f"{BASE_URL}/api/admin/scheduled-notifications",
            headers=auth_headers(admin_token),
            json={
                "title": "TEST_Reminder",
                "body": "تذكير اختباري للصلاة",
                "schedule_time": "08:00",
                "repeat": "daily",
                "enabled": True
            }
        )
        assert create_response.status_code == 200
        data = create_response.json()
        assert data["success"] is True
        assert "notification" in data
        assert data["notification"]["title"] == "TEST_Reminder"
        notif_id = data["notification"]["id"]
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/admin/scheduled-notifications/{notif_id}", 
            headers=auth_headers(admin_token))
        assert delete_response.status_code == 200
        
        print("✅ Scheduled notification CRUD working")


# ==================== SETTINGS TESTS ====================
class TestAdminSettings:
    """Admin settings endpoint"""
    
    def test_get_settings(self, admin_token):
        """GET /api/admin/settings returns app settings"""
        response = requests.get(f"{BASE_URL}/api/admin/settings", headers=auth_headers(admin_token))
        assert response.status_code == 200
        data = response.json()
        assert "maintenance_mode" in data
        print(f"✅ Admin settings: maintenance_mode={data['maintenance_mode']}")
    
    def test_update_settings(self, admin_token):
        """PUT /api/admin/settings updates settings"""
        # Update
        update_response = requests.put(f"{BASE_URL}/api/admin/settings",
            headers=auth_headers(admin_token),
            json={
                "announcement": "TEST_Announcement",
                "maintenance_mode": False
            }
        )
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["success"] is True
        
        # Verify update persisted
        get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=auth_headers(admin_token))
        settings = get_response.json()
        assert settings["announcement"] == "TEST_Announcement"
        
        # Cleanup - reset announcement
        requests.put(f"{BASE_URL}/api/admin/settings",
            headers=auth_headers(admin_token),
            json={"announcement": ""}
        )
        
        print("✅ Admin settings update working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
