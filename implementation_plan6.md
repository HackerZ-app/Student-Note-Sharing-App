# AI Content Moderation Pipeline Plan

This document outlines the implementation plan for integrating an AI pre-screener for user uploads and a "Human-in-the-Loop" Activity Log for administrators.

## Overview

The feature will use Gemini 2.5 Flash to pre-screen all uploaded PDF notes. Gemini will return a `spamScore`, an `isEducational` boolean, and a `reason`. The system will automatically approve, flag, or reject based on this score, persisting the audit trail in MongoDB for admin review.

## Proposed Changes

### Backend Changes

#### [MODIFY] [backend/models/Note.js](file:///c:/Users/PHY/fullstack_project/backend/models/Note.js)
- Update the `status` enum to `['active', 'pending', 'flagged', 'rejected']`.
- Add an `aiAnalysis` nested schema containing:
  - `spamScore` (Number)
  - `reason` (String)
  - `actionTaken` (String enum: `'auto-approved'`, `'flagged-for-review'`, `'auto-rejected'`)

#### [MODIFY] [backend/controllers/noteController.js](file:///c:/Users/PHY/fullstack_project/backend/controllers/noteController.js)
- Update the `uploadNote` function to incorporate Gemini 2.5 Flash natively.
- After Cloudinary finishes uploading, leverage `req.file.buffer` natively (fast memory bypass) to avoid downloading from Cloudinary.
- Configure the AI prompt strictly for application/json:
  - Schema: `{ "isEducational": boolean, "spamScore": number(0-100), "reason": string }`.
- Scoring Logic:
  - If `spamScore > 80` OR `!isEducational`: status = `'rejected'`, action = `'auto-rejected'`.
  - If `spamScore > 30` (up to 80): status = `'pending'`, action = `'flagged-for-review'`.
  - Else: status = `'active'`, action = `'auto-approved'`.
- Save the `Note` in all cases with the `aiAnalysis` object.
- If rejected, respond with 400 "Upload rejected by automated moderation", otherwise respond 201.

#### [MODIFY] [backend/controllers/adminController.js](file:///c:/Users/PHY/fullstack_project/backend/controllers/adminController.js)
- Add `getModerationLog`: Returns `Note.find({ aiAnalysis: { $exists: true } }).populate('uploadedBy', 'name').sort({ createdAt: -1 })`.
- Add `overrideAIAction`: Accepts `noteId` and `newStatus` ('active' or 'deleted').
  - If `newStatus` is `'active'`: Update DB status to `'active'`.
  - If `newStatus` is `'deleted'`: First, extract Cloudinary public_id from URL, call `cloudinary.uploader.destroy(public_id)` to wipe the PDF, then `note.deleteOne()`.

#### [MODIFY] [backend/routes/adminRoutes.js](file:///c:/Users/PHY/fullstack_project/backend/routes/adminRoutes.js)
- Mount `GET /moderation-log` -> `getModerationLog`.
- Mount `PATCH /moderation-override/:id` -> `overrideAIAction`.
- Protect both routes with `protect, admin` middleware.

### Frontend Changes

#### [MODIFY] [frontend/src/pages/AdminDashboard.jsx](file:///c:/Users/PHY/fullstack_project/frontend/src/pages/AdminDashboard.jsx)
- **State Management**: Add state for `moderationLog` array, and fetch it when the "CONTENT MODERATION" tab is active. Remove the old `fetchNotes` logic if it's no longer necessary, or keep the default GET `/admin/notes` updated to just `fetchModerationLog`.
- **UI Render**: Build a specific table for moderation logging.
- **Columns**:
  - *Document Info*: Title, Uploader, Date.
  - *AI Decision*: Styled badge (Green=Auto-Approved, Yellow=Flagged, Red=Auto-Rejected).
  - *AI Reasoning*: Color-coded Spam Score (0-100) and the reasoning text.
  - *Actions*: 
    - 🔗 View Original PDF (icon link).
    - ✅ "Approve" (turns status to active, visible when not active).
    - 🗑️ "Delete" (permanently deletes DB record and Cloudinary file).
- Use `lucide-react` icons (CheckCircle, Trash2, ExternalLink).

## Verification Plan

1. Upload a legitimate PDF: Verify it gets marked 'auto-approved'.
2. Access the Admin Dashboard -> Content Moderation tab. Look for the newly added PDF logic, observe UI styling.
3. Perform an Override: Delete a document and ensure both DB and Cloudinary (implicitly tracking) are cleared.
4. Perform an Override: Approve a flagged document and ensure it's marked active.
