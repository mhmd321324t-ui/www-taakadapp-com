# المؤذن العالمي (The Global Muezzin) - PRD

## Original Problem Statement
Build an Islamic prayer and lifestyle app named "المؤذن العالمي" with:
- Accurate prayer times via Aladhan.com API
- Quran text and audio from Alquran.cloud and Mp3Quran.net
- Ruqyah page with relevant content
- Daily Hadith from Sunnah.com API (using local curated collection)
- AI-powered daily Athkar and smart reminders via Gemini
- Push notifications for Athan with audio
- Islamic-themed UI with Dark/Light mode toggle
- PWA installation prompt for mobile users
- Google social login (Firebase)
- Google Play Store readiness

## Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Shadcn/UI, Framer Motion
- **Backend:** FastAPI, Python 3.11, MongoDB (Motor async driver)
- **AI:** Gemini 2.0 Flash via Emergent LLM Key (emergentintegrations library)
- **APIs:** Aladhan.com (Prayer Times), Alquran.cloud (Quran), Mawaqit (Mosques)
- **Auth:** Custom JWT + Firebase Google Social Login
- **PWA:** Service Worker, Web App Manifest

## Core Requirements
1. Prayer Times with Aladhan.com API
2. Quran reader with Alquran.cloud
3. Daily Hadith (rotating 30 hadith collection)
4. AI Athkar via Gemini (Emergent LLM key)
5. Smart reminders via Gemini AI
6. Ruqyah content pages
7. Prayer tracker with streak counter
8. Dark/Light theme toggle
9. PWA manifest and install banner
10. Push notification infrastructure

## Architecture
```
/app
├── backend/
│   ├── server.py          # FastAPI with all endpoints
│   ├── .env               # MONGO_URL, DB_NAME, EMERGENT_LLM_KEY, etc.
│   ├── requirements.txt
│   └── tests/test_api.py  # 14 pytest tests
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Router + Layout
│   │   ├── pages/               # All page components
│   │   ├── components/          # UI components
│   │   ├── hooks/               # Custom hooks
│   │   └── lib/                 # Utility libraries
│   ├── public/
│   │   ├── manifest.json        # PWA manifest
│   │   ├── sw-custom.js         # Service worker
│   │   └── audio/               # Athan audio files
│   └── .env                     # REACT_APP_BACKEND_URL
```

## API Endpoints
- `GET /api/health` - Health check
- `GET /api/prayer-times?lat=&lon=&method=&school=` - Prayer times
- `GET /api/daily-hadith` - Daily rotating hadith
- `POST /api/ai/daily-athkar` - AI-generated athkar (Gemini)
- `POST /api/ai/smart-reminder` - AI smart reminder (Gemini)
- `GET /api/quran/surah/{number}` - Quran surah proxy
- `GET /api/hijri-date` - Hijri date
- `GET /api/mosques/search` - Mosque search
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## What's Implemented (March 2026)
- [x] Backend server with all API endpoints
- [x] Prayer times via Aladhan.com API
- [x] Daily Hadith (30 curated hadiths, rotating daily)
- [x] AI Athkar via Gemini (Emergent LLM key) - confirmed working
- [x] AI Smart Reminders via Gemini
- [x] Quran page with 114 surahs from Alquran.cloud
- [x] Ruqyah page with 6 categories
- [x] Prayer tracker with localStorage persistence
- [x] Dark/Light theme toggle on More page
- [x] PWA manifest.json and service worker
- [x] PWA install banner for mobile
- [x] Auth page with email + Google login
- [x] Bottom navigation between all pages
- [x] Islamic-themed UI (RTL, Arabic)
- [x] App name "المؤذن العالمي" everywhere
- [x] 14 backend tests passing (100%)
- [x] Frontend pages all rendering (95% pass rate)

## Prioritized Backlog
### P0 (Critical)
- [ ] Test push notifications on real mobile device
- [ ] Test Google social login with real Firebase credentials
- [ ] Test Athan audio playback on lock screen

### P1 (Important)
- [ ] Fetch Hadith from Sunnah.com API (currently using local collection)
- [ ] Quran audio playback from Mp3Quran.net
- [ ] Qibla direction compass
- [ ] Replace Supabase dependencies in Stories page

### P2 (Nice to have)
- [ ] Google Play Store compliance
- [ ] Offline mode improvements
- [ ] User preferences cloud sync
- [ ] Community stories feature
