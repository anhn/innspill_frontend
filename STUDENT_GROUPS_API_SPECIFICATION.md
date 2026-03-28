# Student Groups API Specification

## Overview
This document defines the backend API endpoints required to implement student group/team functionality in the Assessment dashboard. Groups allow students to work in teams, with aggregated views for submissions, stakeholders, and progress metrics.

---

## Data Models

### Group
```typescript
interface Group {
  id: string;                    // MongoDB ObjectId
  courseId: string;              // Reference to Course
  projectId?: string;            // Optional: Reference to Project (if groups are project-specific)
  name: string;                  // Group name (e.g., "Team Alpha", "Group 1")
  description?: string;          // Optional group description
  studentIds: string[];          // Array of student IDs (usernames or user IDs)
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  createdBy: string;             // Teacher username who created the group
  isActive: boolean;             // Whether group is currently active
}
```

### Grouped Submission (Aggregated)
```typescript
interface GroupedSubmission {
  groupId: string;
  groupName: string;
  taskId: string;
  studentIds: string[];          // All students in the group
  studentNames: string[];        // All student names in the group
  datetime: string;              // Latest submission datetime
  attemptNumber: number;         // Highest attempt number
  submission: string;             // Combined/aggregated submission text
  conversationLog: string;       // Combined conversation logs
  // Aggregated scores (average or sum depending on metric)
  taskQualityScore?: number | "not applicable";
  reflectionScore?: number;
  criticalthinkingScore?: number;
  conceptMasteryScore?: number;
  // Aggregated arrays
  submissionQuestionAnswers?: SubmissionQuestionAnswer[];
  feedbackReceivedQuestionAnswers?: FeedbackReceivedQuestionAnswer[];
  feedbackHistory?: FeedbackHistoryEntry[];
  starScoreHistory?: StarScoreHistoryEntry[];
  stakeholderId?: string;
}
```

### Grouped Progress Metrics
```typescript
interface GroupedProgressMetrics {
  groupId: string;
  groupName: string;
  studentIds: string[];
  studentNames: string[];
  // Aggregated metrics
  averageTaskQualityScore?: number;
  averageReflectionScore?: number;
  averageCriticalThinkingScore?: number;
  averageConceptMasteryScore?: number;
  totalSubmissions: number;
  completedTasks: number;
  totalTasks: number;
  // Time-based metrics
  averageResponseTime?: number;
  averageFeedbackTime?: number;
  // Timeline data aggregated
  timelineData?: any[];
}
```

---

## API Endpoints

### 1. Group Management

#### 1.1 Create Group
**Endpoint:** `POST /api/v1/student-groups`

**Request Body:**
```json
{
  "courseId": "string (required)",
  "projectId": "string (optional)",
  "name": "string (required)",
  "description": "string (optional)",
  "studentIds": ["string"] (required, array of student usernames/IDs)
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "courseId": "string",
    "projectId": "string",
    "name": "string",
    "description": "string",
    "studentIds": ["string"],
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp",
    "createdBy": "string",
    "isActive": true
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Validation error message"
}
```

**Validation Rules:**
- `courseId` must exist
- `name` is required and must be unique within the course
- `studentIds` must be an array with at least 2 students
- All `studentIds` must be valid student users
- Students cannot be in multiple active groups for the same course/project

---

#### 1.2 Get Groups by Course
**Endpoint:** `GET /api/v1/student-groups/course/:courseId`

**Query Parameters:**
- `projectId` (optional): Filter by specific project
- `includeInactive` (optional, default: false): Include inactive groups

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "courseId": "string",
      "projectId": "string",
      "name": "string",
      "description": "string",
      "studentIds": ["string"],
      "studentNames": ["string"],  // Resolved student names
      "createdAt": "ISO 8601 timestamp",
      "updatedAt": "ISO 8601 timestamp",
      "createdBy": "string",
      "isActive": true
    }
  ]
}
```

---

#### 1.3 Get Group by ID
**Endpoint:** `GET /api/v1/student-groups/:groupId`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "courseId": "string",
    "projectId": "string",
    "name": "string",
    "description": "string",
    "studentIds": ["string"],
    "studentNames": ["string"],
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp",
    "createdBy": "string",
    "isActive": true
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Group not found"
}
```

---

#### 1.4 Update Group
**Endpoint:** `PUT /api/v1/student-groups/:groupId`

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "studentIds": ["string"] (optional, array of student IDs),
  "isActive": "boolean (optional)"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "courseId": "string",
    "projectId": "string",
    "name": "string",
    "description": "string",
    "studentIds": ["string"],
    "studentNames": ["string"],
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp",
    "createdBy": "string",
    "isActive": true
  }
}
```

**Validation:**
- If updating `studentIds`, validate all students exist and are not in other active groups
- `name` must be unique within the course if changed

---

#### 1.5 Delete Group
**Endpoint:** `DELETE /api/v1/student-groups/:groupId`

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Group deleted successfully"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Group not found"
}
```

**Note:** Deleting a group should not delete students, only remove the group association.

---

#### 1.6 Get Students by Group
**Endpoint:** `GET /api/v1/student-groups/:groupId/students`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "fullName": "string",
      "type": "student"
    }
  ]
}
```

---

### 2. Grouped Submissions

#### 2.1 Get Grouped Submissions by Task
**Endpoint:** `GET /api/v1/assessment-submissions/task/:taskId/grouped`

**Query Parameters:**
- `groupId` (optional): Filter by specific group
- `viewType` (required): `"individual"` | `"group"`

**Response (Success - 200) - Group View:**
```json
{
  "success": true,
  "viewType": "group",
  "data": [
    {
      "groupId": "string",
      "groupName": "string",
      "taskId": "string",
      "studentIds": ["string"],
      "studentNames": ["string"],
      "datetime": "ISO 8601 timestamp",
      "attemptNumber": 1,
      "submission": "string (combined text)",
      "conversationLog": "string (combined)",
      "taskQualityScore": 4.5,
      "reflectionScore": 3.8,
      "criticalthinkingScore": 4.2,
      "conceptMasteryScore": 4.0,
      "submissionQuestionAnswers": [...],
      "feedbackReceivedQuestionAnswers": [...],
      "feedbackHistory": [...],
      "starScoreHistory": [...],
      "stakeholderId": "string"
    }
  ]
}
```

**Response (Success - 200) - Individual View:**
```json
{
  "success": true,
  "viewType": "individual",
  "data": [
    {
      "id": "string",
      "taskId": "string",
      "studentId": "string",
      "studentName": "string",
      "groupId": "string (if student is in a group)",
      "groupName": "string (if student is in a group)",
      "datetime": "ISO 8601 timestamp",
      "attemptNumber": 1,
      "submission": "string",
      // ... other submission fields
    }
  ]
}
```

**Aggregation Rules for Group View:**
- **Submission text**: Combine all submissions with separators (e.g., "--- Student A ---\n...\n--- Student B ---\n...")
- **Scores**: Calculate average (for numeric scores)
- **Datetime**: Use the latest submission datetime
- **Attempt Number**: Use the highest attempt number
- **Arrays**: Merge and deduplicate arrays (submissionQuestionAnswers, feedbackHistory, etc.)
- **Conversation Log**: Combine all conversation logs

---

#### 2.2 Get Grouped Submissions by Project
**Endpoint:** `GET /api/v1/assessment-submissions/project/:projectId/grouped`

**Query Parameters:**
- `groupId` (optional): Filter by specific group
- `viewType` (required): `"individual"` | `"group"`

**Response:** Same structure as 2.1, but includes all tasks in the project.

---

### 3. Grouped Stakeholders

#### 3.1 Get Grouped Stakeholder Submissions
**Endpoint:** `GET /api/v1/assessment-submissions/stakeholder/:stakeholderId/grouped`

**Query Parameters:**
- `taskId` (optional): Filter by specific task
- `projectId` (optional): Filter by project
- `groupId` (optional): Filter by specific group
- `viewType` (required): `"individual"` | `"group"`

**Response (Success - 200) - Group View:**
```json
{
  "success": true,
  "viewType": "group",
  "data": [
    {
      "groupId": "string",
      "groupName": "string",
      "stakeholderId": "string",
      "taskId": "string",
      "studentIds": ["string"],
      "studentNames": ["string"],
      // Aggregated stakeholder feedback data
      "feedback": "string (combined)",
      "feedforward": "string (combined)",
      "taskQualityScore": 4.5,
      // ... other aggregated fields
    }
  ]
}
```

**Aggregation Rules:**
- Combine feedback and feedforward text from all group members
- Average numeric scores
- Merge feedback history arrays

---

### 4. Grouped Progress Metrics

#### 4.1 Get Grouped Progress Metrics
**Endpoint:** `GET /api/v1/student-metrics/progress-masterview/grouped`

**Query Parameters:**
- `courseId` (required)
- `projectId` (optional)
- `groupId` (optional): If provided, return metrics for specific group only
- `windowType` (required): `"weekly"` | `"monthly"`
- `viewType` (required): `"class"` | `"student"` | `"group"`

**Response (Success - 200) - Group View:**
```json
{
  "success": true,
  "viewType": "group",
  "data": {
    "summary": {
      "totalGroups": 5,
      "totalStudents": 20,
      "averageGroupSize": 4.0
    },
    "groups": [
      {
        "groupId": "string",
        "groupName": "string",
        "studentIds": ["string"],
        "studentNames": ["string"],
        "metrics": {
          "averageTaskQualityScore": 4.2,
          "averageReflectionScore": 3.9,
          "averageCriticalThinkingScore": 4.1,
          "averageConceptMasteryScore": 4.0,
          "totalSubmissions": 45,
          "completedTasks": 12,
          "totalTasks": 15,
          "completionRate": 0.8,
          "averageResponseTime": 1200,  // in seconds
          "averageFeedbackTime": 3600
        },
        "timelineData": [
          {
            "date": "YYYY-MM-DD",
            "taskQualityScore": 4.2,
            "reflectionScore": 3.9,
            "submissionsCount": 3
          }
        ]
      }
    ]
  }
}
```

**Aggregation Rules:**
- **Average scores**: Calculate mean across all group members
- **Total submissions**: Sum of all submissions from group members
- **Completed tasks**: Count unique tasks with at least one submission from any group member
- **Completion rate**: completedTasks / totalTasks
- **Average response time**: Mean of all individual response times
- **Timeline data**: Aggregate daily/weekly metrics by averaging group member metrics

---

#### 4.2 Get Grouped Progress Detail View
**Endpoint:** `GET /api/v1/student-metrics/progress-detail/grouped`

**Query Parameters:**
- `courseId` (required)
- `projectId` (optional)
- `groupId` (required): Specific group to get detailed metrics for
- `windowType` (required): `"weekly"` | `"monthly"`

**Response (Success - 200):**
```json
{
  "success": true,
  "viewType": "group",
  "data": {
    "groupId": "string",
    "groupName": "string",
    "studentIds": ["string"],
    "studentNames": ["string"],
    "metrics": {
      "averageTaskQualityScore": 4.2,
      "averageReflectionScore": 3.9,
      "averageCriticalThinkingScore": 4.1,
      "averageConceptMasteryScore": 4.0,
      "totalSubmissions": 45,
      "completedTasks": 12,
      "totalTasks": 15,
      "completionRate": 0.8
    },
    "taskBreakdown": [
      {
        "taskId": "string",
        "taskTitle": "string",
        "submissionsCount": 3,
        "averageTaskQualityScore": 4.5,
        "averageReflectionScore": 4.0,
        "students": [
          {
            "studentId": "string",
            "studentName": "string",
            "submissionCount": 1,
            "taskQualityScore": 4.5
          }
        ]
      }
    ],
    "timelineData": [
      {
        "date": "YYYY-MM-DD",
        "metrics": {
          "taskQualityScore": 4.2,
          "reflectionScore": 3.9,
          "submissionsCount": 3
        }
      }
    ]
  }
}
```

---

### 5. Student Group Assignment

#### 5.1 Assign Students to Group
**Endpoint:** `POST /api/v1/student-groups/:groupId/students`

**Request Body:**
```json
{
  "studentIds": ["string"]  // Array of student IDs to add
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Students assigned to group successfully",
  "data": {
    "groupId": "string",
    "addedStudentIds": ["string"],
    "totalStudents": 4
  }
}
```

**Validation:**
- Students must not be in another active group for the same course/project
- Students must be valid student users

---

#### 5.2 Remove Students from Group
**Endpoint:** `DELETE /api/v1/student-groups/:groupId/students`

**Request Body:**
```json
{
  "studentIds": ["string"]  // Array of student IDs to remove
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Students removed from group successfully",
  "data": {
    "groupId": "string",
    "removedStudentIds": ["string"],
    "remainingStudentIds": ["string"]
  }
}
```

---

#### 5.3 Get Students Not in Any Group
**Endpoint:** `GET /api/v1/student-groups/course/:courseId/unassigned-students`

**Query Parameters:**
- `projectId` (optional): Filter by project

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "fullName": "string",
      "type": "student"
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Database Schema

### StudentGroups Collection
```javascript
{
  _id: ObjectId,
  courseId: ObjectId,  // Reference to Course
  projectId: ObjectId,  // Optional: Reference to Project
  name: String,
  description: String,
  studentIds: [String],  // Array of student usernames or user IDs
  createdAt: Date,
  updatedAt: Date,
  createdBy: String,  // Teacher username
  isActive: Boolean
}

// Indexes:
// - { courseId: 1, name: 1 } (unique)
// - { courseId: 1, projectId: 1, isActive: 1 }
// - { studentIds: 1 }
```

### User Collection Update
Add/update `group` field in User documents:
```javascript
{
  // ... existing user fields
  group: ObjectId,  // Reference to StudentGroups._id (optional)
  // Or use courseId + groupName for simpler lookup
}
```

---

## Implementation Notes

1. **Group Uniqueness**: Group names should be unique within a course (and optionally within a project).

2. **Student Membership**: A student can only be in one active group per course/project at a time.

3. **Aggregation Logic**:
   - **Text fields**: Combine with clear separators
   - **Numeric scores**: Calculate average (or weighted average if needed)
   - **Arrays**: Merge and deduplicate
   - **Dates**: Use latest/most recent

4. **Performance**: Consider caching aggregated group data for frequently accessed views.

5. **Backward Compatibility**: Individual view should still work as before, with optional `groupId` field added to submissions.

6. **Authorization**: Only teachers/admins can create, update, or delete groups. Students can view their own group.

---

## Frontend Integration Points

1. **Students Tab**: Add "Groups" sub-tab with group management UI
2. **Submissions Tab**: Add view toggle (Individual/Group) dropdown
3. **Stakeholders**: Add view toggle (Individual/Group) for stakeholder submissions
4. **Progress Tab - Detail View**: Add "Group" option to student dropdown, show aggregated metrics

---

## Testing Checklist

- [ ] Create group with valid students
- [ ] Create group with duplicate name (should fail)
- [ ] Add student to multiple groups (should fail)
- [ ] Get grouped submissions for a task
- [ ] Get individual submissions (should still work)
- [ ] Get grouped stakeholder submissions
- [ ] Get grouped progress metrics
- [ ] Update group (add/remove students)
- [ ] Delete group
- [ ] Verify aggregation calculations are correct
- [ ] Test with groups that have different numbers of students
- [ ] Test with students not in any group
