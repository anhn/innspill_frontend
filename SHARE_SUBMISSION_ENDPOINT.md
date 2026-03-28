# Share Submission Endpoint Specification

## Endpoint
`POST /api/v1/assessment-submissions/:submissionId/share`

## Purpose
Share a submission (including its content, feedback history, and score history) with other students in the same group(s).

## Request

### URL Parameters
- `submissionId` (string, required): The ID of the submission to share

### Request Body
```json
{
  "targetStudentIds": ["student1@example.com", "student2@example.com"],
  "shareFeedback": true,
  "shareScore": true
}
```

### Request Body Fields
- `targetStudentIds` (array of strings, required): List of student IDs (usernames) to share the submission with
- `shareFeedback` (boolean, optional, default: true): Whether to include feedback history
- `shareScore` (boolean, optional, default: true): Whether to include score history

### Alternative: Auto-detect group members
If `targetStudentIds` is not provided or empty, the backend should:
1. Find all active groups that contain the submission owner
2. Get all other members from those groups (excluding the owner)
3. Share with all those members

```json
{
  "autoDetectGroupMembers": true,
  "shareFeedback": true,
  "shareScore": true
}
```

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Submission shared successfully",
  "data": {
    "sharedWith": [
      {
        "studentId": "student1@example.com",
        "studentName": "Student One",
        "submissionId": "new_submission_id_1",
        "status": "created"
      },
      {
        "studentId": "student2@example.com",
        "studentName": "Student Two",
        "submissionId": "new_submission_id_2",
        "status": "created"
      }
    ],
    "skipped": [
      {
        "studentId": "student3@example.com",
        "studentName": "Student Three",
        "reason": "already_has_submission_with_same_feedback"
      }
    ],
    "failed": [],
    "totalShared": 2,
    "totalSkipped": 1,
    "totalFailed": 0
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid submission ID
```json
{
  "success": false,
  "message": "Submission not found",
  "error": "SUBMISSION_NOT_FOUND"
}
```

#### 400 Bad Request - No target students
```json
{
  "success": false,
  "message": "No target students specified or found in groups",
  "error": "NO_TARGET_STUDENTS"
}
```

#### 403 Forbidden - Not authorized to share
```json
{
  "success": false,
  "message": "You can only share your own submissions",
  "error": "UNAUTHORIZED"
}
```

#### 400 Bad Request - Students not in same group
```json
{
  "success": false,
  "message": "Some students are not in the same group as the submission owner",
  "error": "STUDENTS_NOT_IN_GROUP",
  "data": {
    "invalidStudents": ["student4@example.com"]
  }
}
```

## Behavior

### Validation
1. Verify the submission exists
2. Verify the current user owns the submission (or is a teacher/admin)
3. If `targetStudentIds` is provided, verify all students are in the same active group(s) as the submission owner
4. If `autoDetectGroupMembers` is true, find all active groups containing the submission owner

### Sharing Logic
For each target student:
1. Check if they already have a submission for the same `taskId`
2. If they have a submission:
   - Check if they already have the latest feedback (compare feedback text and datetime)
   - If they have the same latest feedback, skip with reason "already_has_submission_with_same_feedback"
   - If they have different/older feedback, update their submission with the new feedback
3. If they don't have a submission:
   - Create a new submission with:
     - Same `taskId`
     - Same `submission` content
     - Same `conversationLog`
     - Same `submissionQuestionAnswers` (if any)
     - Same `attachments` (if any)
     - `attemptNumber: 1` (since it's their first copy)
     - If `shareFeedback: true`, copy entire `feedbackHistory` array
     - If `shareScore: true`, copy entire `starScoreHistory` array
     - Set `studentId` and `studentName` to the target student

### Notes
- The shared submission should be marked as a copy (optional: add a `sharedFrom` field pointing to the original submission ID)
- The original submission owner should remain unchanged
- All timestamps should be preserved from the original submission
- The new submissions should have their own unique IDs

## Example Usage

### Share with specific students
```javascript
POST /api/v1/assessment-submissions/507f1f77bcf86cd799439011/share
Content-Type: application/json

{
  "targetStudentIds": ["student1@example.com", "student2@example.com"],
  "shareFeedback": true,
  "shareScore": true
}
```

### Auto-detect and share with all group members
```javascript
POST /api/v1/assessment-submissions/507f1f77bcf86cd799439011/share
Content-Type: application/json

{
  "autoDetectGroupMembers": true,
  "shareFeedback": true,
  "shareScore": true
}
```

## Frontend Integration

The frontend would call this endpoint like:

```typescript
const handleShareToGroup = async () => {
  const response = await fetch(
    API_ENDPOINTS.assessmentSubmissions.share(latestSubmission.id),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        autoDetectGroupMembers: true,
        shareFeedback: true,
        shareScore: true,
      }),
    }
  );
  
  const result = await response.json();
  // Handle result...
};
```

## API Endpoint Addition

Add to `src/config/api.ts`:

```typescript
assessmentSubmissions: {
  // ... existing endpoints
  share: (id: string) => `${API_BASE_URL}/assessment-submissions/${id}/share`,
}
```
