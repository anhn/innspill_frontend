# Group Task Status Endpoint Specification

## Endpoint

`GET /api/v1/assessment-submissions/group/:groupId/task-status`

## Purpose

Efficiently fetch task completion status for all members of a group without loading full submission data. This is a lightweight endpoint optimized for displaying task completion counts in the Group Information section.

## Request

### URL Parameters

- `groupId` (string, required): The ID of the student group

### Query Parameters

- `projectId` (string, required): The project ID to filter tasks by
- `userName` (string, required): The current user's username for authorization

### Example Request

```
GET /api/v1/assessment-submissions/group/507f1f77bcf86cd799439011/task-status?projectId=507f1f77bcf86cd799439012&userName=student1@example.com
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "student1@example.com": {
      "completedTasks": ["task1", "task2"],
      "taskCount": 2
    },
    "student2@example.com": {
      "completedTasks": ["task1"],
      "taskCount": 1
    },
    "student3@example.com": {
      "completedTasks": [],
      "taskCount": 0
    }
  }
}
```

### Response Fields

- `data` (object): Map of student IDs to their task status
  - Key: `studentId` (string): The student's ID/username
  - Value: Object containing:
    - `completedTasks` (array of strings): Array of task IDs that the student has completed
    - `taskCount` (number): Count of completed tasks (same as `completedTasks.length`)

### Error Responses

#### 400 Bad Request - Missing parameters

```json
{
  "success": false,
  "message": "projectId is required",
  "error": "MISSING_PARAMETER"
}
```

#### 404 Not Found - Group not found

```json
{
  "success": false,
  "message": "Group not found",
  "error": "GROUP_NOT_FOUND"
}
```

#### 403 Forbidden - Not authorized

```json
{
  "success": false,
  "message": "You are not a member of this group",
  "error": "UNAUTHORIZED"
}
```

## Behavior

### Validation

1. Verify the group exists
2. Verify the current user is a member of the group (or is a teacher/admin)
3. Verify projectId is provided and valid

### Logic

1. Get all members of the group
2. For each member, find all submissions for tasks in the specified project
3. Extract unique task IDs from submissions (one task = one completion, regardless of attempt number)
4. Return lightweight status object with task IDs and counts

### Performance Considerations

- Only queries submission metadata (taskId, studentId) - not full submission content
- Uses database aggregation/grouping for efficiency
- Returns minimal data payload
- Suitable for frequent refreshes

## Frontend Integration

The frontend uses this endpoint in `CourseInformationSection`:

```typescript
const fetchGroupTaskStatus = useCallback(
  async (groupId: string) => {
    const response = await fetch(
      `${API_ENDPOINTS.assessmentSubmissions.getGroupTaskStatus(groupId)}?projectId=${projectId}&userName=${userName}`,
      { method: "GET", credentials: "include" },
    );
    // Handle response...
  },
  [projectId],
);
```

## Benefits Over Previous Approach

**Before:**

- Fetched all full submission objects for all group members
- Required 1-3+ API calls depending on endpoint availability
- Transferred large payloads with unnecessary data
- Client-side filtering and calculation

**After:**

- Single lightweight API call per group
- Returns only task IDs and counts
- Minimal data transfer
- Server-side aggregation

## Example Usage

For a group with 3 members:

- **Old approach**: 1-3 calls, ~50-200KB of data
- **New approach**: 1 call, ~1-5KB of data

This is especially beneficial when:

- Groups have many members (10+)
- Submissions contain large content/attachments
- Frequent refreshes are needed
- Network bandwidth is limited
