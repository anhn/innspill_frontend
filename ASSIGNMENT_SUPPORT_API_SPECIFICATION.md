# Assignment Support API Specification

This document defines the API endpoints needed for the Assignment Support dashboard, where students access their courses, projects, tasks, and stakeholders based on their username.

## Base URL
- Development: `http://localhost:3000/api/v1`
- Production: `https://innspill.ai/microapi/api/v1`

## Authentication
All endpoints use `isOptionalAuth` middleware (authentication is optional but recommended).

---

## 1. Get Courses by Student Username

### `GET /courses/student/:username`

**Description:** Retrieves all courses that a student is enrolled in, based on the student's `remark` field matching the course `_id`.

**Input:** `username` (URL param), `userName` (optional query)

**Output:** `{ success: true, data: Course[] }`

**Implementation:** Query students where `username = :username` and `type = 'student'`, extract `remark` (courseId), return matching courses.

---

## 2. Get Projects (Using Existing Endpoint)

### Uses: `GET /projects/course/:courseId` (Already exists in Assessment module)

**Description:** Get projects for courses the student is enrolled in.

**Implementation:**
1. Get all courses for student (using endpoint #1)
2. For each course, call `GET /projects/course/:courseId`
3. Aggregate all projects

**Note:** This endpoint already exists and is used in `Assessment.tsx`. No new endpoint needed.

---

## 3. Get Tasks (Using Existing Endpoint)

### Uses: `GET /assessment-tasks/project/:projectId` (Already exists in Assessment module)

**Description:** Get published tasks for projects the student has access to.

**Implementation:**
1. Get all projects for student (using endpoint #2 logic)
2. For each project, call `GET /assessment-tasks/project/:projectId`
3. Filter tasks where `status = 'published'`
4. Aggregate all tasks

**Note:** This endpoint already exists and is used in `Assessment.tsx`. No new endpoint needed.

---

## 4. Get Project Stakeholders (Using Existing Endpoint)

### Uses: `GET /assessment-roles/project/:projectId` (Already exists in Assessment module)

**Description:** Get stakeholders for projects the student has access to.

**Implementation:**
1. Get all projects for student (using endpoint #2 logic)
2. For each project, call `GET /assessment-roles/project/:projectId`
3. Aggregate all stakeholders

**Note:** This endpoint already exists and is used in `Assessment.tsx`. No new endpoint needed.

---

## 5. Get Submissions by Student Username

### `GET /assessment-submissions/student/:username`

**Description:** Retrieves all submissions made by a specific student.

**Input:** `username` (URL param), `userName` (optional query), `taskId` (optional query)

**Output:** `{ success: true, data: Submission[] }`

**Implementation:** Query where `studentId = :username`, filter by `taskId` if provided, sort by `datetime` descending.

---

## 6. Get Notifications by Student Username

### `GET /notifications/student/:username`

**Description:** Retrieves all notifications for a specific student.

**Input:** `username` (URL param), `userName` (optional query), `read` (optional boolean), `important` (optional boolean)

**Output:** `{ success: true, data: Notification[] }`

**Implementation:** Query where `studentId = :username`, apply filters, sort by `datetime` descending.

---

## 7. Get Chat Messages by Student and Stakeholder

### `GET /chat-messages/student/:username/stakeholder/:stakeholderId`

**Description:** Retrieves chat conversation history between a student and a specific stakeholder.

**Input:** `username`, `stakeholderId` (URL params), `userName` (optional query), `limit`, `offset` (optional pagination)

**Output:** `{ success: true, data: ChatMessage[], pagination: {...} }`

**Implementation:** Query where `studentId = :username` and `stakeholderId = :stakeholderId`, sort by `timestamp` ascending.

---

## 8. Send Chat Message

### `POST /chat-messages`

**Description:** Sends a chat message from a student to a stakeholder and receives an AI-generated response.

**Input:** `{ studentId, stakeholderId, message, projectId? }`

**Output:** `{ success: true, data: { studentMessage, stakeholderResponse } }`

**Implementation:** Save student message, generate AI response using stakeholder persona, save and return both messages.

---

## Data Flow Summary

1. **Get Courses** → `GET /courses/student/:username` → Returns courses where student's `remark` matches course `_id`
2. **Get Projects** → For each course: `GET /projects/course/:courseId` (existing endpoint)
3. **Get Tasks** → For each project: `GET /assessment-tasks/project/:projectId` (existing endpoint), filter `status = 'published'`
4. **Get Stakeholders** → For each project: `GET /assessment-roles/project/:projectId` (existing endpoint)
5. **Get Submissions** → `GET /assessment-submissions/student/:username`
6. **Get Notifications** → `GET /notifications/student/:username`
7. **Get Chat Messages** → `GET /chat-messages/student/:username/stakeholder/:stakeholderId`
8. **Send Chat Message** → `POST /chat-messages`

---

## Notes

- **Endpoints 2, 3, 4** use existing endpoints from the Assessment module - no new backend implementation needed
- **Endpoints 1, 5, 6, 7, 8** require new backend implementation
- Student enrollment is tracked via `remark` field in users collection (stores course `_id`)
- Only published tasks (`status = 'published'`) are returned to students
- The existing endpoints are reused to avoid creating duplicate backend logic
