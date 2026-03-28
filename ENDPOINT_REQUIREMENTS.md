# Endpoint Requirements for Activity Tab Monitoring

This document specifies the new and updated API endpoints needed for the Activity tab in the Monitoring Dashboard.

## Current Implementation Status

The Activity tab currently uses a fallback approach:
- **AI Literacy**: Filters action logs by `action=aiLiteracy` (needs dedicated endpoint)
- **Prompt Revision**: Filters action logs by endpoint/action containing "prompt" (needs dedicated endpoint)
- **Management Tool**: Filters action logs by tool keywords (needs dedicated endpoint)
- **Assignment Submission**: Uses existing `GET /api/v1/assessment-submissions` (may need query params update)
- **Chat**: Filters action logs by chat-related endpoints (needs dedicated endpoint or use existing chat-messages API)
- **Quiz**: Filters action logs by quiz-related endpoints (needs dedicated endpoint or use existing quiz-submissions API)

## Required Endpoints

### 1. GET /api/v1/monitoring/activity/ai-literacy

**Purpose**: Get list of users with AI literacy progress (top 50)

**Query Parameters**:
- `limit` (optional): Integer, 1-1000. Default: 50.
- `sortBy` (optional): `"progress"` | `"timestamp"` | `"level"`. Default: `"progress"`.
- `sortOrder` (optional): `"asc"` | `"desc"`. Default: `"desc"`.

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "userId": "string",
      "username": "string",
      "progress": 75,  // 0-100 percentage
      "level": 3,      // Current level completed
      "timestamp": "2024-01-15T10:30:00Z",  // Last activity
      "completedLevels": [1, 2, 3]  // Array of completed level numbers
    }
  ]
}
```

**Backend Implementation Notes**:
- Query AI literacy status/progress from user records or dedicated AI literacy collection
- Return users sorted by progress level (highest first)
- Include last activity timestamp from action logs or AI literacy activity records

---

### 2. GET /api/v1/monitoring/activity/prompt-revision

**Purpose**: Get list of users who use prompt revision feature (top 50 most recent)

**Query Parameters**:
- `limit` (optional): Integer, 1-1000. Default: 50.
- `sortBy` (optional): `"timestamp"`. Default: `"timestamp"`.
- `sortOrder` (optional): `"asc"` | `"desc"`. Default: `"desc"`.

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "userId": "string",
      "username": "string",
      "timestamp": "2024-01-15T10:30:00Z",
      "action": "prompt-revise",  // or "prompt-create", etc.
      "promptId": "string",
      "endpoint": "/api/v1/prompts/revise"
    }
  ]
}
```

**Backend Implementation Notes**:
- Query action logs filtered by:
  - `action` contains "prompt" OR
  - `endpoint` matches `/api/v1/prompts/*`
- Group by userId to get latest per user
- Return most recent usage first

**Alternative**: If action logs don't have sufficient data, query prompts collection and join with users.

---

### 3. GET /api/v1/monitoring/activity/management-tools

**Purpose**: Get list of users who use management toolkit (SWOT, Planning Poker, etc.)

**Query Parameters**:
- `limit` (optional): Integer, 1-1000. Default: 50.
- `toolType` (optional): `"all"` | `"swot"` | `"planning-poker"`. Filter by tool type. Default: `"all"`.
- `sortBy` (optional): `"timestamp"`. Default: `"timestamp"`.
- `sortOrder` (optional): `"asc"` | `"desc"`. Default: `"desc"`.

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "userId": "string",
      "username": "string",
      "toolType": "SWOT",  // or "Planning Poker", "Management Tool"
      "timestamp": "2024-01-15T10:30:00Z",
      "groupId": "string",      // Optional: for planning poker
      "projectId": "string"     // Optional: for SWOT
    }
  ]
}
```

**Backend Implementation Notes**:
- Query action logs filtered by:
  - For SWOT: `endpoint` contains `/api/v1/swot-analysis/` OR `action` contains "swot"
  - For Planning Poker: `endpoint` contains `/api/v1/planning-poker/` OR `action` contains "planning-poker"
- Group by userId and toolType to get latest per user/tool combination
- Determine toolType from endpoint or action field

---

### 4. GET /api/v1/assessment-submissions (UPDATE)

**Purpose**: Get assignment submissions (already exists, may need query params update)

**Current Status**: Endpoint exists at `API_ENDPOINTS.assessmentSubmissions.list`

**Required Query Parameters** (verify/update):
- `limit` (optional): Integer, 1-1000. Default: existing default.
- `sortBy` (optional): `"createdAt"` | `"updatedAt"`. Default: `"createdAt"`.
- `sortOrder` (optional): `"asc"` | `"desc"`. Default: `"desc"`.
- `distinctUsers` (optional): Boolean. If true, return only latest submission per user. Default: `false`.

**Response (200)** - Verify current format:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "studentId": "string",
      "student": {
        "id": "string",
        "username": "string"
      },
      "taskId": "string",
      "projectId": "string",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {  // Optional
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

**Backend Implementation Notes**:
- If `distinctUsers=true`, group submissions by `studentId` and return only the latest submission per user
- Ensure `sortBy=createdAt` and `sortOrder=desc` work correctly
- Include student username in response (populate student relation)

---

### 5. GET /api/v1/monitoring/activity/chat-sessions

**Purpose**: Get list of users with most recent chat sessions (top 50)

**Query Parameters**:
- `limit` (optional): Integer, 1-1000. Default: 50.
- `sortBy` (optional): `"timestamp"`. Default: `"timestamp"`.
- `sortOrder` (optional): `"asc"` | `"desc"`. Default: `"desc"`.

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "userId": "string",
      "username": "string",
      "sessionId": "string",
      "timestamp": "2024-01-15T10:30:00Z",  // Last message timestamp
      "messageCount": 10  // Number of messages in session
    }
  ]
}
```

**Backend Implementation Notes**:
- Query `chat-messages` collection or action logs filtered by:
  - `endpoint` contains `/api/v1/chat-messages/` OR `/api/v1/chatbot/`
  - `action` contains "chat"
- Group by userId and sessionId to get latest session per user
- Return most recent chat activity first

**Alternative Implementation**:
- Use existing `GET /api/v1/chat-messages` endpoints if they support aggregation/grouping by user and session
- Add query params: `groupBy=user&latestSession=true&limit=50`

---

### 6. GET /api/v1/monitoring/activity/quiz-completions

**Purpose**: Get list of users with most recent quiz completions (top 50)

**Query Parameters**:
- `limit` (optional): Integer, 1-1000. Default: 50.
- `sortBy` (optional): `"timestamp"`. Default: `"timestamp"`.
- `sortOrder` (optional): `"asc"` | `"desc"`. Default: `"desc"`.

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "userId": "string",
      "username": "string",
      "quizId": "string",
      "quizTitle": "string",  // Optional
      "timestamp": "2024-01-15T10:30:00Z",  // Submission/completion time
      "score": 85  // Optional: score percentage
    }
  ]
}
```

**Backend Implementation Notes**:
- Query `quiz-submissions` collection or action logs filtered by:
  - `endpoint` contains `/api/v1/quiz-submissions/` OR `/api/v1/assessment-quizzes/`
  - `action` contains "quiz"
- Group by userId to get latest completion per user
- Return most recent quiz completion first
- Optionally include quiz title by joining with quiz collection

**Alternative Implementation**:
- Use existing `GET /api/v1/quiz-submissions` endpoints if they support:
  - Query params: `distinctUsers=true&limit=50&sortBy=createdAt&sortOrder=desc`
  - Ensure it returns latest submission per user

---

## Implementation Priority

### High Priority (Core Functionality)
1. **GET /api/v1/monitoring/activity/ai-literacy** - AI Literacy data is specific and may not be in action logs
2. **GET /api/v1/assessment-submissions** - Update to support `distinctUsers` query param
3. **GET /api/v1/monitoring/activity/chat-sessions** - Chat activity monitoring

### Medium Priority (Can use action logs as fallback)
4. **GET /api/v1/monitoring/activity/prompt-revision** - Can filter action logs, but dedicated endpoint is cleaner
5. **GET /api/v1/monitoring/activity/management-tools** - Can filter action logs, but dedicated endpoint provides better tool categorization
6. **GET /api/v1/monitoring/activity/quiz-completions** - Can use quiz-submissions API with updates, or filter action logs

## Fallback Strategy

Until dedicated endpoints are implemented, the frontend uses:
- `GET /api/v1/logs/actions` with action/endpoint filtering
- `GET /api/v1/assessment-submissions` for assignment submissions
- Client-side grouping and sorting to extract user-level data

This works but is less efficient and may not capture all activity if action logging is incomplete.

## Notes for Backend Team

1. All endpoints should respect school/admin role permissions
2. Consider adding pagination support for endpoints returning large datasets
3. Ensure consistent date format (ISO 8601) across all endpoints
4. Include username in responses (populate user relations where needed)
5. Consider caching frequently accessed data (e.g., AI literacy progress)
6. Action logs should consistently log:
   - `userId` or `username` (prefer both)
   - `action` field with standardized naming
   - `endpoint` field for request path
   - `metadata` field for additional context (progress, level, etc.)
