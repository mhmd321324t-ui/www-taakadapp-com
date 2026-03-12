# المؤذن العالمي (The Global Muezzin) - PRD

## Original Problem Statement
Build an Islamic prayer and lifestyle app named "المؤذن العالمي" with:
- Accurate prayer times via Aladhan.com API
- Quran text and audio from Alquran.cloud and Mp3Quran.net
- Ruqyah page with relevant content
- Daily Hadith
- AI-powered daily Athkar and smart reminders via Gemini
- Push notifications for Athan with audio (persistent, lock screen)
- Islamic-themed UI with manual Dark/Light mode toggle
- PWA installation for mobile users
- Admin dashboard for full app control
- Google Play Store readiness

## Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Shadcn/UI, Framer Motion
- **Backend:** FastAPI, Python 3.11, MongoDB (Motor async driver)
- **AI:** Gemini 2.0 Flash via Emergent LLM Key (emergentintegrations library)
- **APIs:** Aladhan.com (Prayer Times), Alquran.cloud (Quran)
- **Auth:** Custom JWT (email/password)
- **PWA:** Service Worker with periodic prayer check, Web App Manifest

## Architecture
```
/app
├── backend/
│   ├── server.py          # FastAPI: auth, prayer, AI, admin endpoints
│   ├── .env               # MONGO_URL, DB_NAME, EMERGENT_LLM_KEY
│   ├── requirements.txt
│   └── tests/             # test_api.py, test_admin_api.py
├── frontend/
│   ├── src/
│   │   ├── App.tsx                    # Router + UnifiedPrayerProvider
│   │   ├── main.tsx                   # Theme init + SW registration
│   │   ├── pages/
│   │   │   ├── Index.tsx              # Home (unified prayer context)
│   │   │   ├── PrayerTimes.tsx        # Prayer times (unified context)
│   │   │   ├── AdminDashboard.tsx     # Admin (4 tabs)
│   │   │   ├── Quran.tsx, Ruqyah.tsx  # Content pages
│   │   │   ├── Auth.tsx               # Login/Register
│   │   │   └── More.tsx               # Settings + Theme toggle
│   │   ├── hooks/
│   │   │   ├── useUnifiedPrayer.tsx   # Centralized prayer times
│   │   │   ├── useAuth.tsx, useAdmin.tsx
│   │   │   └── usePrayerTimes.tsx, useGeoLocation.tsx
│   │   └── lib/
│   │       └── prayerNotifications.ts # SW notification scheduling
│   └── public/
│       ├── manifest.json, sw-custom.js
│       └── audio/athan/              # 11 athan audio files
```

## Admin
- Email: mhmd321324t@gmail.com
- Password: admin123
- Dashboard: /admin (4 tabs: overview, users, notifications, settings)

## What's Implemented (March 12, 2026)
- [x] Backend server with all API endpoints (18 tests passing)
- [x] Prayer times via Aladhan.com API
- [x] **Unified Prayer Times** - All pages share same prayer source
- [x] Daily Hadith (30 curated hadiths, rotating daily)
- [x] AI Athkar via Gemini (Emergent LLM key) - confirmed source: "gemini"
- [x] AI Smart Reminders via Gemini
- [x] Quran page with 114 surahs from Alquran.cloud
- [x] Ruqyah page with 6 categories
- [x] Prayer tracker with localStorage persistence
- [x] **Manual Dark/Light theme toggle** (localStorage: almuadhin_theme)
- [x] PWA manifest.json and service worker
- [x] **Service Worker with periodic prayer check** (every 30s for notifications)
- [x] **Admin Dashboard** (stats, users, notifications, settings)
- [x] Admin API endpoints secured with JWT + email whitelist
- [x] Auth (email/password login/register)
- [x] Bottom navigation between all pages
- [x] Islamic-themed UI (RTL, Arabic)
- [x] App name "المؤذن العالمي" everywhere
- [x] Athan audio (11 files: makkah, madinah, quds, etc.)

## Prioritized Backlog
### P0 (Critical)
- [ ] Test push notifications on real mobile device with Athan audio
- [ ] Test Google social login with real Firebase credentials
- [ ] Verify notification persistence on lock screen

### P1 (Important)
- [ ] Hadith from Sunnah.com API (currently local collection)
- [ ] Quran audio playback from Mp3Quran.net
- [ ] Qibla direction compass
- [ ] Phone storage optimization

### P2 (Nice to have)
- [ ] Google Play Store compliance
- [ ] Offline mode improvements
- [ ] User preferences cloud sync
- [ ] Social sharing of prayer times
