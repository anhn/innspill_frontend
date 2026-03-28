# Planning Poker API Specification (Simplified)

## Overview
This document specifies the backend API endpoints required for the Planning Poker module. The module allows team members to collaboratively estimate tasks using Planning Poker methodology with a **manual reveal** approach - no real-time synchronization needed.

## Core Design Philosophy

- **Private Input**: Students submit votes privately
- **Server Stores Votes**: All votes are stored on the server
- **Manual Reveal**: Moderator (task creator) manually reveals votes
- **Refresh = Reality Check**: Students refresh to see updates
- **No Real-time Sync**: Since students sit in the same room, verbal communication handles coordination

## Data Models

### PlanningPokerTask
```typescript
interface PlanningPokerTask {
  id: string;                    // MongoDB ObjectId
  groupId: string;               // Reference to StudentGroup
  title: string;                 // Task title (required)
  description?: string;           // Optional task description
  createdBy: string;             // Username of creator (moderator)
  createdAt: string;             // ISO timestamp
  status: 'voting' | 'revealed'; // Task status
  revealed?: boolean;            // Whether votes have been manually revealed
  votes: PlanningPokerVote[];     // Array of votes
  averageVote?: number;          // Calculated average (only when revealed)
}
```

### PlanningPokerVote
```typescript
interface PlanningPokerVote {
  id: string;                    // MongoDB ObjectId
  taskId: string;                // Reference to PlanningPokerTask
  userId: string;                // Username of voter
  userName: string;               // Display name of voter
  vote: number | '?';            // Fibonacci number (1,2,3,5,8,13,21) or '?' for uncertain
  votedAt: string;               // ISO timestamp
}
```

## API Endpoints

### 1. Create Task
**POST** `/api/v1/planning-poker/tasks`

**Query Parameters:**
- `userName` (required): Current user's username

**Request Body:**
```json
{
  "groupId": "string",
  "title": "string",
  "description": "string" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "groupId": "string",
    "title": "string",
    "description": "string",
    "createdBy": "string",
    "createdAt": "2024-01-15T10:30:00Z",
    "status": "voting",
    "revealed": false,
    "votes": [],
    "averageVote": null
  }
}
```

**Validation:**
- `groupId` must exist and user must be a member
- `title` is required and must not be empty
- User must be a member of the group

---

### 2. Get Tasks for Group
**GET** `/api/v1/planning-poker/tasks/group/:groupId`

**Query Parameters:**
- `userName` (required): Current user's username

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "groupId": "string",
      "title": "string",
      "description": "string",
      "createdBy": "string",
      "createdAt": "2024-01-15T10:30:00Z",
      "status": "voting",
      "revealed": false,
      "votes": [
        {
          "id": "string",
          "taskId": "string",
          "userId": "string",
          "userName": "string",
          "vote": 5,
          "votedAt": "2024-01-15T10:35:00Z"
        }
      ],
      "votedUserIds": ["user1@example.com", "user2@example.com"],
      "averageVote": null
    }
  ]
}
```

**Notes:**
- If `status === 'revealed'` or `revealed === true`:
  - All votes are returned with their actual vote values
  - `votedUserIds` can be omitted (or included for consistency)
- If `status === 'voting'` and `revealed === false`:
  - Only return votes for the current user (with actual vote value)
  - Include `votedUserIds` array containing ALL user IDs who have voted (without vote values)
  - This allows frontend to show "Voted" status for all members without revealing their votes

---

### 3. Submit Vote
**POST** `/api/v1/planning-poker/votes`

**Query Parameters:**
- `userName` (required): Current user's username

**Request Body:**
```json
{
  "taskId": "string",
  "groupId": "string",
  "vote": 5
}
```

**Vote Values:**
- Valid Fibonacci numbers: `1, 2, 3, 5, 8, 13, 21`
- Or `"?"` for uncertain

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "taskId": "string",
    "userId": "string",
    "userName": "string",
    "vote": 5,
    "votedAt": "2024-01-15T10:35:00Z"
  }
}
```

**Validation:**
- User must be a member of the group
- Task must exist and belong to the group
- Task must not be revealed yet (`status !== 'revealed'`)
- Vote must be a valid Fibonacci number or '?'
- If user already voted, update the existing vote

---

### 4. Reveal Votes (Moderator Only)
**POST** `/api/v1/planning-poker/tasks/:taskId/reveal`

**Query Parameters:**
- `userName` (required): Current user's username

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "groupId": "string",
    "title": "string",
    "status": "revealed",
    "revealed": true,
    "votes": [
      {
        "id": "string",
        "taskId": "string",
        "userId": "string",
        "userName": "string",
        "vote": 5,
        "votedAt": "2024-01-15T10:35:00Z"
      }
    ],
    "averageVote": 6.5
  }
}
```

**Validation:**
- User must be the task creator (moderator)
- Task must exist
- Task must not already be revealed
- Calculate and store `averageVote` (exclude '?' votes from average)

**Behavior:**
- Set `status` to `'revealed'`
- Set `revealed` to `true`
- Calculate `averageVote` from numeric votes only
- All votes are now visible to everyone

---

### 5. Clear Votes (Re-estimate)
**POST** `/api/v1/planning-poker/tasks/:taskId/clear`

**Query Parameters:**
- `userName` (required): Current user's username

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "groupId": "string",
    "title": "string",
    "status": "voting",
    "revealed": false,
    "votes": [],
    "averageVote": null
  }
}
```

**Validation:**
- User must be the task creator (moderator)
- Task must exist

**Behavior:**
- Delete all votes for this task
- Set `status` back to `'voting'`
- Set `revealed` to `false`
- Clear `averageVote`
- Task is ready for a new round of voting

---

### 6. Delete Task
**DELETE** `/api/v1/planning-poker/tasks/:taskId`

**Query Parameters:**
- `userName` (required): Current user's username

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Validation:**
- User must be the task creator (moderator)
- Task must exist

**Behavior:**
- Delete the task and all associated votes

---

### 7. Get Online Members
**GET** `/api/v1/planning-poker/groups/:groupId/members/online`

**Query Parameters:**
- `userName` (required): Current user's username

**Response:**
```json
{
  "success": true,
  "data": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
  ]
}
```

**Validation:**
- User must be a member of the group
- Group must exist

**Behavior:**
- Returns an array of user IDs (usernames) who are currently online for this group
- Online status is determined by users who have called the "Mark Online" endpoint within the last 5 minutes (or configured timeout period)
- Backend should automatically expire online status after the timeout period (e.g., 5 minutes of inactivity)
- Empty array is returned if no members are online

**Notes:**
- Online status should be tracked in-memory or with a short TTL in the database
- The timeout period should be configurable (default: 5 minutes)
- Users who are not online are not included in the response

---

### 8. Mark User Online
**POST** `/api/v1/planning-poker/groups/:groupId/members/online`

**Query Parameters:**
- `userName` (required): Current user's username

**Request Body:**
```json
{}
```
(No request body required - user is identified via `userName` query parameter)

**Response:**
```json
{
  "success": true,
  "message": "User marked as online"
}
```

**Validation:**
- User must be a member of the group
- Group must exist
- User must be authenticated

**Behavior:**
- Marks the current user as online for this group
- Updates the user's last activity timestamp for this group
- Online status expires after a timeout period (default: 5 minutes)
- If the user is already marked as online, the timestamp is refreshed

**Notes:**
- This endpoint should be called when:
  - User enters the Planning Poker module
  - User selects/switches to a group
  - Optionally: periodically while the user is active (e.g., on refresh)
- The backend should track online status per group
- Multiple users can be online for the same group simultaneously
- The online status is group-specific (user is online for a specific group, not globally)

---

## Interaction Flow

### Step 1: Moderator Creates a Round
1. Moderator (any group member) creates a task
2. Task is created with `status: 'voting'` and `revealed: false`

### Step 2: Students Submit Estimates
1. Each student selects a card (Fibonacci number or '?')
2. Student clicks Submit
3. Vote is stored but **hidden** from others
4. Other students only see "Voted" or "Waiting" status

### Step 3: Verbal Reveal
1. Students announce their numbers verbally in the room
2. Moderator clicks "Reveal Votes" button
3. Backend sets `status: 'revealed'` and `revealed: true`
4. All votes become visible to everyone
5. Average is calculated and displayed

### Step 4: Discuss & Re-estimate (Optional)
1. Team discusses the results
2. If needed, moderator clicks "Clear Votes"
3. All votes are deleted
4. Task status returns to `'voting'`
5. Process repeats

## Frontend Online Status Management

The frontend manages online status as follows:
- When a user enters the Planning Poker module or selects a group, the frontend calls `POST /groups/:groupId/members/online` to mark the user as online
- When the refresh button is clicked, the frontend calls `GET /groups/:groupId/members/online` to fetch updated online status of all group members
- Online status is displayed with green/gray icons in the Group Members panel
- Online status is **NOT automatically polled** - it's only updated on manual refresh or when entering the module

**Note:** Online status tracking is optional. If the backend endpoints are not implemented, the frontend will gracefully handle the absence and only show the current user as online locally.

## Frontend Polling

The frontend polls the `GET /tasks/group/:groupId` endpoint every 5 seconds to:
- Check if new votes have been submitted (shows "Voted" status)
- Check if votes have been revealed (shows actual vote values)
- Update the UI accordingly

**Note:** Online status is **NOT** polled automatically. It's only updated when:
- User enters the module (mark self as online)
- User clicks the refresh button (fetch all online members)

## Error Handling

All endpoints should return appropriate HTTP status codes:
- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User not authorized (e.g., not moderator for reveal/clear)
- `404 Not Found`: Task or group not found
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Notes

- **No WebSocket Required**: All communication is via REST API with polling
- **Privacy**: Votes are private until revealed by moderator
- **Moderator**: Task creator is the moderator (can reveal/clear votes)
- **Refresh Pattern**: Students refresh manually or via polling to see updates
- **Verbal Coordination**: Since students are in the same room, verbal communication handles timing
