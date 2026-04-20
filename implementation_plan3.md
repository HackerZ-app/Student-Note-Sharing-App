# Admin Panel Moderation Upgrade Plan

This plan completely transforms the basic admin routing into a highly secure, functional Moderation panel.

## Proposed Changes

### 1. Security & Layout Re-routing (Frontend)

#### [MODIFY] `frontend/src/components/Navbar.jsx`
- Introduce rigorous Role-Based Access Control logic utilizing `user.role === 'admin'`.
- Normal Users will see: Feed, Upload, Dashboard.
- Admins will exclusively see: Admin Panel, View Live Site, Logout (abstracted into a cleaner conditional render approach).

### 2. Analytical & Moderation Rest APIs (Backend)

#### [MODIFY] `backend/controllers/adminController.js`
- Create `getSystemStats` to compute database aggregates scaling across the platform: `Total Users`, `Total Notes Documented`, and mapping the embedded interactions directly inside Notes to provide aggregate `Platform Engagement`.
- Create `getAllNotes` to query absolute data logs without pagination/filters, sorted strictly `createdAt: -1`.
- Establish `deleteUser` which cleanly removes a user via `User.findByIdAndDelete`.
- *Note:* The existing `roleMiddleware.js` (`admin`) and `authMiddleware` (`protect`) are perfectly formatted and stringently protect these environments already.

#### [MODIFY] `backend/routes/adminRoutes.js`
- Connect new HTTP routers strictly enforcing the `protect` and `admin` middleware:
  - `GET /stats`
  - `GET /notes` 
  - `DELETE /notes/:id` (existing)
  - `DELETE /users/:id`

### 3. "Command Center" UI Layout (Frontend)

#### [MODIFY] `frontend/src/pages/AdminDashboard.jsx`  *(Referenced as @Admin.jsx)*
- **Data States**: Fetch and cache statistics, Users arrays, and Content (Notes) arrays.
- **Top Metrics Display**: Render Framer Motion interactive widgets for the `Total Users`, `Total Active Notes`, and `Engagement Levels` using standard Lucide-react iconography.
- **Dynamic Tab Control**: Separate concerns cleanly into `"User Management"` and `"Content Moderation"` tables so data is strictly segmented.
- **Execute Callbacks**: Provide bold, red contextual action buttons inside robust data tables. When an Admin executes a destructive Delete command, intercept the event utilizing a browser-native `.confirm()` dialog before pushing the request through the secure `/api/admin/*` endpoints and rapidly re-syncing the internal state array.
- **Global Theme Formatting**: Adapt table border structures, cell spacing, and font tones to organically follow and blend against the persistent Dark Mode `slate-800/slate-900` configurations. 

## Open Questions

Is the browser `confirm("Are you sure?")` acceptable for deletion checks, or do you require a more complex, customized React Modal component block to handle these destructive actions?

## Verification Plan
1. Render Frontend via standard User account -> Verify Admin elements are strictly hidden.
2. Render Frontend via Admin account -> Ensure standard routes are invisible and the metrics portal maps API payloads.
3. Attempt to maliciously query `/api/admin/stats` utilizing standard JWT tokens from normal users to verify unauthorized rejection.
