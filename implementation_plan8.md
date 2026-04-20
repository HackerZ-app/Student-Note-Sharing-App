# Enforce Strict BYOK Strategy

The goal of this task is to improve the user onboarding experience for the "Bring Your Own Key" (BYOK) model, add beautiful global UI alerts, and properly lock down the backend upload feature to require API keys.

## User Review Required

- **Wallet.jsx Refactor**: I will refactor the "No Key" state from `Wallet.jsx` into `KeyOnboardingModal.jsx`. `Wallet.jsx` will then either render this modal or just the connected dashboard. Is it okay if I replace the disconnected state in `Wallet.jsx` with a message or simply render the `KeyOnboardingModal` there as well?
- **Global Modal Placement**: I'll inject the `<KeyOnboardingModal />` inside `App.jsx` conditionally (`user && !user.hasKey`). I'll need to modify the AuthContext and backend user responses to ensure `hasKey` is reliably available globally.

## Proposed Changes

### Frontend Infrastructure
#### [MODIFY] `frontend/package.json`
- Run `npm install react-hot-toast` to add the toast library.

#### [MODIFY] `frontend/src/App.jsx`
- Import `<Toaster />` from `react-hot-toast` and add it to the layout.
- Import and render `<KeyOnboardingModal />` if `user` exists but `user.hasKey` is false.

#### [MODIFY] `frontend/src/context/AuthContext.jsx`
- Add a `refreshUser` method (which just re-fetches `/auth/me`) so that the modal can update global state once the key is successfully saved.

---

### UI Components
#### [NEW] `frontend/src/components/KeyOnboardingModal.jsx`
- Extract the "Connect your AI Engine" UI from `Wallet.jsx`.
- Wrap it in a dark glassmorphic overlay (`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm`).
- Include a close button ('X' or clicking outside) to close the modal locally (temporarily dismiss).
- Call `refreshUser()` from context on successful connection.

#### [MODIFY] `frontend/src/pages/Wallet.jsx`
- Refactor to remove the duplicate "No Key" markup.
- If not connected, it can display a simplified message or just rely on the global modal popping up.

---

### Error Handling Interception
#### [MODIFY] `frontend/src/pages/Upload.jsx`
- Intercept 403 errors in `handleSubmit`.
- Trigger `toast.error("Please provide a Google API key to fully explore the app.", { style: { background: '#333', color: '#fff' } })`.

#### [MODIFY] `frontend/src/pages/QuizPage.jsx`
- Intercept 403 errors in the `fetchQuiz` effect.
- Show the toast and do not display generic error state if it's a missing key.

#### [MODIFY] `frontend/src/components/NoteChat.jsx`
- Intercept 403 errors in `handleSubmit`.
- Show the toast.

---

### Backend Security
#### [MODIFY] `backend/controllers/authController.js`
- Modify `getMe`, `loginUser`, and `registerUser` to append `hasKey: !!user.geminiApiKey` in the returned JSON, so the frontend always has it.

#### [MODIFY] `backend/controllers/noteController.js`
- Inside `uploadNote`:
  - Add early return if `!req.user.geminiApiKey` (Status 403).
  - Add early return if `req.user.dailyCoinsUsed >= 1500` (Status 429).
  - Initialize AI pre-screener using `new GoogleGenerativeAI(req.user.geminiApiKey)`.
  - Increment `req.user.dailyCoinsUsed` upon successful upload.

## Verification Plan

### Automated Tests
- No automated tests provided in the plan, focusing on manual verification.

### Manual Verification
1. Log in with a user who has no key. Verify the `KeyOnboardingModal` pops up automatically.
2. Dismiss the modal and navigate to Upload. Try uploading. Ensure a beautiful toast appears requiring the key.
3. Add the key in the modal. Verify the modal closes automatically and `Wallet` shows dashboard.
4. Upload a document. Verify it succeeds and daily coins decrease/increment.
5. Try to chat or generate a quiz. Verify they work with the key, or show toasts if the key is removed.
