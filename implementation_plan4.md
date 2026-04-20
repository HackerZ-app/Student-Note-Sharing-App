# Goal Description

Implement a "Chat with this Document" feature that allows users to ask questions about a specific PDF note using the Gemini API.

The backend will fetch the PDF from Cloudinary, parse its text using `pdf-parse`, and feed it as context to the `gemini-1.5-flash` model via `@google/generative-ai`.
The frontend will include a new `NoteChat` component presented alongside the PDF on the Note Details page. 

## Proposed Changes

### Backend

- Install the following packages: `pdf-parse`, `@google/generative-ai`, and `axios` (used to securely stream/download the remote Cloudinary PDF to memory).
- Ensure `process.env.GEMINI_API_KEY` is present.

---
#### [MODIFY] [noteRoutes.js](file:///c:/Users/PHY/fullstack_project/backend/routes/noteRoutes.js)

- Import `chatWithNote` handler from the controller.
- Add `router.post('/:id/chat', protect, chatWithNote);`.

#### [MODIFY] [noteController.js](file:///c:/Users/PHY/fullstack_project/backend/controllers/noteController.js)

- Add `chatWithNote` function that:
  - Retrieves the note by ID from MongoDB.
  - Downloads the PDF as an arraybuffer utilizing Axios.
  - Parses the downloaded buffer with `pdf-parse` to extract text.
  - Queries Gemini (using `gemini-1.5-flash`) acting as a study tutor contextually aware of only the PDF text.
  - Returns the generated response text.

### Frontend

---
#### [NEW] [NoteChat.jsx](file:///c:/Users/PHY/fullstack_project/frontend/src/components/NoteChat.jsx)

- Initialize chat state to store chat history (`role`, `text`) and a loading indicator.
- Contains a scrollable message list with chat bubbles styled dynamically depending on standard dark/sleek UI (e.g. gray base, distinct colors for user vs AI bubbles).
- Input field that toggles disabled state when `loading=true` and calls `POST /api/notes/:id/chat` with Axios.

#### [MODIFY] [NoteDetail.jsx](file:///c:/Users/PHY/fullstack_project/frontend/src/pages/NoteDetail.jsx)

- Rearrange the current central layout (`max-w-4xl`) into a grid or flex side-by-side layout (e.g., `max-w-7xl` with `lg:flex-row`).
- Render the current Note Detail elements in a wider left column (approx. `lg:w-2/3`).
- Render `<NoteChat noteId={note._id} />` on the right side (`lg:w-1/3`).

## Open Questions

- Is `GEMINI_API_KEY` already added to your `.env` file, or do I need to explicitly ask you to configure that outside of this ticket?

## Verification Plan

### Automated/Manual Testing
- Install the backend dependencies and verify that the backend node dev server restarts cleanly.
- Go to an existing Note Detail page containing a PDF. 
- Try to interact with the Chat block on the right panel. Wait for an AI response.
- Ask a question specifically about the content in the PDF vs a general question not in the PDF (to test prompt bounds).
