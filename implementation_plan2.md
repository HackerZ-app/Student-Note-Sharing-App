# Wire Up Data Models and Real-Time Dashboard Metrics

This plan will integrate real-time metrics across your application by shifting the data architecture slightly as per your requirements, and wiring up the React UI components to consume these stats.

## User Review Required

> [!IMPORTANT]
> Your original architecture used separate collections for `Like`, `SavedNote`, and `Comment`. Your prompt requests embedding these directly into the `Note` Schema as arrays (e.g., `likes: [userIds]`, `comments: [objects]`). 
> 
> **Decision Made**: The plan correctly modifies `Note.js` to use embedded arrays and updates the interaction controllers to use this new embedded structure. This makes fetching notes vastly more efficient since all metrics arrive in one single document. We will stop using the separate `Like.js`, `SavedNote.js`, and `Comment.js` models.

## Proposed Changes

### Database Models

#### [MODIFY] `backend/models/Note.js`
- Introduce new fields:
  - `views`: Number, defaulting to 0.
  - `likes`: Array of User ObjectIds.
  - `saves`: Array of User ObjectIds.
  - `comments`: Array of objects containing: `user` (ObjectId), `text` (String), and `createdAt` (Date).

---

### API Controllers & Routes

#### [MODIFY] `backend/controllers/noteController.js`
- `getNoteById`: Increment the `views` counter each time this endpoint is accessed. Ensure `likes`, `saves`, and `comments.user` are properly populated so NoteDetail has full author data for comments.

#### [MODIFY] `backend/controllers/interactionController.js`
- `toggleLike`: Rewrite to use `Note.findByIdAndUpdate` to push/pull `userId` to the `likes` array inside the `Note` document.
- `toggleSave`: Rewrite similarly to push/pull `userId` from the `saves` array.
- `addComment`: Rewrite to push `{ user: userId, text: commentText }` to the `Note.comments` array.

#### [MODIFY] `backend/routes/noteRoutes.js`
- Add a new route `GET /saved` prior to `/:id` to specifically fetch notes where `saves` contains the current user's ID.

---

### Frontend UI Components

#### [MODIFY] `frontend/src/pages/Dashboard.jsx`
- Replace mock data calculations based on user's specific fetched uploads:
  - Total Uploads: `uploads.length`
  - Total Views: Calculate dynamically utilizing `reduce` on `note.views`.
  - Reputation Score: `(totalLikes * 5) + (totalComments * 2)`.
- Re-wire the "Saved Notes" tab to hit the proposed `/notes/saved` API endpoint so it renders actually saved notes.

#### [MODIFY] `frontend/src/pages/NoteDetail.jsx`
- Extract dynamic arrays from the fetched `note` state.
- Wire the Heart icon state to actively verify if `user._id` exists within `note.likes`.
- Apply similar styling logic to the Bookmark (`note.saves`).
- Create the visual list mapping via `note.comments.map()` in the Discussion area.
- Add immediate local UI state updates during toggle events to simulate instant responsiveness before re-fetching or waiting on slow endpoints.

## Verification Plan

### Automated Tests
*None available currently.*

### Manual Verification
1. I will log in to a user account, upload a note.
2. Verify that dashboard reads correctly calculated initial mock data (0 views, 0 comments, 1 upload).
3. Attempt to Like and Bookmark the note.
4. Refresh Dashboard to see metrics multiplier accurately update the Reputation Score.
5. Create a comment and visually confirm rendering in `NoteDetail.jsx`.
