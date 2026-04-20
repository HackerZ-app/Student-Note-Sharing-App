# Transition to Bring Your Own Key (BYOK) Model

We will build a Bring Your Own Key system using Google's Gemini AI limit (1,500 daily requests) to eliminate server costs. This limit will be shown to users as "Daily Coins" in a new "Wallet" view. Users will not be able to use AI features if they haven't supplied a key, and we will gracefully block them when they reach the coin limit.

## User Review Required
> [!WARNING]
> This implies users will no longer use the global `GEMINI_API_KEY` from your backend environment variables for studying. Have you considered whether you still want to allow users to optionally fall back to a global key if they don't provide one? As requested, the implementation restricts all AI usage strictly to user-supplied keys.

## Proposed Changes

---

### Backend: Models

#### [MODIFY] [User.js](file:///c:/Users/PHY/fullstack_project/backend/models/User.js)
- Add `geminiApiKey` (String, default: null).
- Add `dailyCoinsUsed` (Number, default: 0).
- Add `lastActiveDate` (Date, default: Date.now).

---

### Backend: Middleware

#### [NEW] [coinResetMiddleware.js](file:///c:/Users/PHY/fullstack_project/backend/middleware/coinResetMiddleware.js)
- Create a middleware that:
  - Checks `req.user.lastActiveDate`.
  - Determines if the last active date is from a previous calendar day (e.g., using `Date.now()`).
  - If it is, resets `req.user.dailyCoinsUsed` to 0, sets `req.user.lastActiveDate` to today, and calls `await req.user.save()`.

---

### Backend: Controllers & Routes

#### [NEW] [userController.js](file:///c:/Users/PHY/fullstack_project/backend/controllers/userController.js)
- `getWallet`: Returns `{ hasKey: boolean, dailyCoinsUsed: number }`.
- `saveWalletKey`: Expects `geminiApiKey` in the body, validates its format briefly, sets it on the user, saves and returns success.
- `removeWalletKey`: Nullifies the user's `geminiApiKey`, saves and returns success.

#### [NEW] [userRoutes.js](file:///c:/Users/PHY/fullstack_project/backend/routes/userRoutes.js)
- Creates the router.
- Appends the coinReset middleware to `GET /wallet` route before it fetches wallet stats.
- Maps `POST /wallet/key` and `DELETE /wallet/key`.

#### [MODIFY] [server.js](file:///c:/Users/PHY/fullstack_project/backend/server.js)
- Mount `userRoutes` on `app.use('/api/users', require('./routes/userRoutes'))`.

#### [MODIFY] [noteController.js](file:///c:/Users/PHY/fullstack_project/backend/controllers/noteController.js)
- In `generateQuiz` and `chatWithNote`:
  - Enforce `!req.user.geminiApiKey` logic, returning 403.
  - Enforce `dailyCoinsUsed >= 1500` logic, returning 429 ("Daily coin limit reached").
  - Modify `GoogleGenerativeAI(process.env.GEMINI_API_KEY)` to use `req.user.geminiApiKey`.
  - Only upon successful generation, increment `dailyCoinsUsed` and save the user.

#### [MODIFY] [noteRoutes.js](file:///c:/Users/PHY/fullstack_project/backend/routes/noteRoutes.js)
- Apply the `coinResetMiddleware` to the `/:id/chat` and `/:id/quiz` routes to ensure coins are reset before logic verifies the daily limits.

---

### Frontend: Pages & App Config

#### [NEW] [Wallet.jsx](file:///c:/Users/PHY/fullstack_project/frontend/src/pages/Wallet.jsx)
- **No Key State**: Guide Box showing instructions and visual cues. Include a password-type input with eye-toggle and a "Connect Engine" button (with ShieldCheck icon). Provide a clickable link to Google AI Studio.
- **Active Key State**: Framer Motion animation into "Daily Coin Dashboard".
  - Three premium Glowing Cards (Daily Allowance, Coins Used, Coins Remaining). Under 100 remaining shows red/orange scale warning.
  - Subtext: "Your coins automatically refill every night at midnight."
  - "Disconnect Key" secondary button. 
- Integrated API handlers using `axios.js` to handle saving/removing keys and fetching data.

#### [MODIFY] [App.jsx](file:///c:/Users/PHY/fullstack_project/frontend/src/App.jsx)
- Define `<Route path="/wallet" element={<Wallet />} />` inside `<ProtectedRoute>`.

#### [MODIFY] [Navbar.jsx](file:///c:/Users/PHY/fullstack_project/frontend/src/components/Navbar.jsx)
- Add a Wallet link inside standard user navigation view, possibly using a `Wallet` icon from `lucide-react`.

## Open Questions
- Is there any API key validation format checks you'd like me to perform (e.g. checking if it starts with "AIza...") before saving it to the database?

## Verification Plan
### Automated Tests
- Test that coin usage is properly stored based on mock user interaction testing.
- Manual integration check via browser running locally at `localhost:5173`.
### Manual Verification
- Testing user routes via browser frontend.
- Connecting an API key. Re-logging to ensure it persists over API calls.
- Calling `/api/notes/:id/chat` via front-end to verify that it successfully increments `dailyCoinsUsed`.
- Removing the API key to ensure it functions.
