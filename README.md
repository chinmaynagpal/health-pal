# Health Pal

Modern fitness tracker with AI-powered calorie detection. Snap a photo of a meal → Gemini Vision identifies the foods → you supply the portion → USDA FoodData Central returns real calorie/macro numbers → a WhatsApp summary is pushed via Twilio.

## Stack
- **Next.js 14** (App Router) + **Tailwind CSS**
- **MongoDB** via Mongoose
- **JWT** auth (bcrypt)
- **Cloudinary** for meal image storage
- **Google Gemini (1.5 Flash)** for food detection
- **USDA FoodData Central** for nutrition data
- **Twilio WhatsApp** for notifications
- **Recharts** for analytics
- **Framer Motion** for micro-interactions

## Folder structure
```
health-pal/
├── src/
│   ├── app/
│   │   ├── (auth)/login, signup       # auth pages
│   │   ├── (app)/                     # authed shell
│   │   │   ├── dashboard/             # daily overview
│   │   │   ├── upload/                # meal photo → detect → portion → log
│   │   │   ├── progress/              # recharts analytics
│   │   │   └── settings/              # profile + goals
│   │   ├── api/
│   │   │   ├── auth/ (signup|login|me)
│   │   │   ├── foods/ (detect|log)
│   │   │   ├── steps/
│   │   │   ├── weight/
│   │   │   ├── goals/
│   │   │   └── analytics/
│   │   ├── layout.js, page.js (landing), globals.css
│   ├── components/  (TopNav, BottomNav, ProgressRing, StatCard, MealCard)
│   ├── context/     (AuthContext, ThemeContext)
│   ├── lib/         (mongoose, auth, cloudinary, gemini, usda, twilio)
│   └── models/      (User, FoodLog, StepLog, WeightLog)
├── tailwind.config.js, postcss.config.js
├── next.config.mjs
├── .env.example
└── package.json
```

## Setup

1. **Install**
   ```bash
   cd health-pal
   npm install
   ```

2. **Environment**
   Copy `.env.example` → `.env.local` and fill in:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=<long random string>

   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...

   GEMINI_API_KEY=...          # https://aistudio.google.com/app/apikey
   USDA_API_KEY=...            # https://fdc.nal.usda.gov/api-key-signup.html

   TWILIO_ACCOUNT_SID=...
   TWILIO_AUTH_TOKEN=...
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```

3. **Run**
   ```bash
   npm run dev
   # http://localhost:3000
   ```

## Core meal-logging flow

1. User picks a photo on **/upload**.
2. `POST /api/foods/detect` — uploads to Cloudinary + asks Gemini for structured `{items:[{name, commonPortion, confidence}]}`.
3. UI **requires** the user to enter a portion for every item (`150g`, `1 bowl`, `2 rotis`, etc.) — the "Confirm & log" button is blocked otherwise, and the server re-validates.
4. `POST /api/foods/log` — for each item:
   - `portionToGrams()` converts portion → grams
   - `searchFood()` hits `api.nal.usda.gov/fdc/v1/foods/search`
   - calories/macros scaled by `grams / 100`
5. Meal saved to `FoodLog`; a WhatsApp message is dispatched to the user's number:
   `Health Pal Update: Meal logged - paneer butter masala (1 bowl), chapati (2 rotis) = 620 kcal`

## API reference

| Method | Path | Body / Query |
|---|---|---|
| POST | `/api/auth/signup` | `{name,email,password,heightCm?,weightKg?,whatsappNumber?}` |
| POST | `/api/auth/login` | `{email,password}` |
| GET/PATCH | `/api/auth/me` | profile |
| POST | `/api/foods/detect` | `{imageBase64}` → `{imageUrl, items[]}` |
| POST | `/api/foods/log` | `{imageUrl, items:[{foodName, portion}]}` **portion required** |
| GET | `/api/foods/log?days=1` | today's / recent logs |
| GET/POST | `/api/steps` | `{steps, date?, source?}` |
| GET/POST | `/api/weight` | `{weightKg, date?}` |
| GET/PUT | `/api/goals` | `{dailyCalories, dailySteps, targetWeightKg}` |
| GET | `/api/analytics?range=week|month` | series for charts |

All authed endpoints accept `Authorization: Bearer <jwt>`.

## Notes
- Step tracking accepts a `source` field (`manual|googlefit|applehealth`) — the schema is ready for OAuth integrations.
- Dark mode toggles via `html.dark` class (see `ThemeContext`).
- Bottom nav on mobile, top nav everywhere; max-width container keeps the feed centered on desktop.
