# Auto-Quiz Generator Implementation Plan

This document outlines the plan to build the "Auto-Quiz Generator" using Gemini 2.5 Flash for the backend and React, Tailwind, and Recharts for the frontend.

## Proposed Changes

### Backend Changes

#### [MODIFY] [noteController.js](file:///c:/Users/PHY/fullstack_project/backend/controllers/noteController.js)
- Add a new `generateQuiz` controller function.
- It will receive `questionCount` from the request body.
- It will fetch the note's PDF buffer from Cloudinary via `axios.get(url, { responseType: 'arraybuffer' })`.
- Utilize `@google/generative-ai` with `gemini-2.5-flash`.
- Configure `responseMimeType: "application/json"` to ensure a strict JSON array output.
- Pass the PDF as `inlineData` along with a prompt instructing Gemini to act as a test-prep expert and generate questions strictly matching the requested JSON schema `[{ "question", "options", "correctAnswer", "explanation", "topic" }]`.

#### [MODIFY] [noteRoutes.js](file:///c:/Users/PHY/fullstack_project/backend/routes/noteRoutes.js)
- Map `POST /:id/quiz` to the `generateQuiz` function and protect it with the `protect` authentication middleware.

---

### Frontend Dependencies

#### [NEW COMMAND] Install Dependencies
- Run `npm install recharts canvas-confetti` in the `frontend` directory.

---

### Frontend Components & Pages

#### [MODIFY] [App.jsx](file:///c:/Users/PHY/fullstack_project/frontend/src/App.jsx)
- Import `QuizPage`.
- Add a new route `<Route path="/note/:id/quiz" element={<QuizPage />} />` under the `ProtectedRoute` block to ensure only authenticated users can access the quiz. 
*(Note: I will use `/note/:id/quiz` instead of `/notes/:id/quiz` to match your existing route convention for note details `path="/note/:id"`)*

#### [MODIFY] [NoteDetail.jsx](file:///c:/Users/PHY/fullstack_project/frontend/src/pages/NoteDetail.jsx)
- Add a sleek "Generate Practice Quiz" button below the PDF viewer or in a logical high-visibility area.
- Create a Tailwind Modal for quiz configuration.
  - **Question Count:** Select between 5 or 10 questions.
  - **Timer Mode:** Toggle on/off (1 minute per question).
  - **Actions:** Cancel or Start Quiz.
- On "Start Quiz", use `useNavigate` to go to `/note/:id/quiz`, passing the selected configuration in route state.

#### [NEW] [QuizPage.jsx](file:///c:/Users/PHY/fullstack_project/frontend/src/pages/QuizPage.jsx)
- **State Management:** Load state, questions array, current question index, user answers, timer state.
- **Initialization:** On mount, call the backend `/api/notes/:id/quiz` endpoint using the `id` from the URL and `questionCount` from the routing state. Display an immersive loading screen.
- **Quiz Interface:**
  - Full-screen layout with dark mode support.
  - Display progress bar and countdown timer (if enabled). Red formatting when < 10 seconds.
  - Render the current question and clickable interactive option buttons.
  - "Next Question" or "Finish Quiz" button.
- **Results Dashboard:**
  - Automatically calculate the final score when finished.
  - **Confetti:** Trigger `canvas-confetti` if the score is 100%.
  - **Performance Charts:** Render a Recharts `BarChart` analyzing accuracy grouped by the AI-generated `topic`.
  - **Strengths and Weaknesses:** Derive lists of topics based on the performance.
  - **Review Section:** List incorrectly answered questions, showing the user's answer, correct answer, and the AI's explanation.

## Verification Plan

### Automated/Manual Testing
- Manually run `npm install recharts canvas-confetti`.
- Manually test the Modal in `NoteDetail.jsx`.
- Generate a 5-question test quiz and verify the loading state and incoming JSON from the backend.
- Go through the quiz interface answering questions (some correct, some incorrect) to check state transitions and timer logic.
- Verify the final Results Dashboard correctly displays the Recharts chart, triggers confetti (if 100%), and properly highlights explanations for wrong answers.
