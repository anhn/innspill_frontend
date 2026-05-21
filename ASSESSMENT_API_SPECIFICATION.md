# Assessment Dashboard API Specification

This document specifies all API endpoints required for the Assessment Dashboard feature in the Teacher Workspace.

## Base URL

- Development: `http://localhost:3000/api/v1`
- Production: `https://innspill.ai/microapi/api/v1`

## Authentication

All endpoints require authentication. Include user identification via:

- `userName` query parameter or
- Authentication token in headers (if implemented)

---

## 1. Projects API

A project represents a course project. Each course can have only one project.

### 1.1 Create Project

**Endpoint:** `POST /projects`

**Request Body:**

```json
{
  "courseId": "string (required)",
  "courseDescription": "string",
  "learningOutcome": "string",
  "keyMilestones": "string",
  "attachments": ["string"], // Array of file URLs or file IDs
  "availableStakeholders": ["string"], // Array of stakeholder names/IDs
  "teacherId": "string (optional, can be derived from auth)",
  "additionalInfo": {} // Optional: any additional fields
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "courseId": "string",
    "courseDescription": "string",
    "learningOutcome": "string",
    "keyMilestones": "string",
    "attachments": ["string"],
    "availableStakeholders": ["string"],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Response (400/500):**

```json
{
  "success": false,
  "error": "string",
  "message": "string"
}
```

---

### 1.2 Get Project by ID

**Endpoint:** `GET /projects/:id`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "courseId": "string",
    "courseDescription": "string",
    "learningOutcome": "string",
    "keyMilestones": "string",
    "attachments": ["string"],
    "availableStakeholders": ["string"],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 1.3 Get Project by Course

**Endpoint:** `GET /projects/course/:courseId`

**Query Parameters:**

- `userName` (optional): Teacher username

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "courseId": "string",
    "courseDescription": "string",
    "learningOutcome": "string",
    "keyMilestones": "string",
    "attachments": ["string"],
    "availableStakeholders": ["string"],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Note:** Returns null or empty if no project exists for the course.

---

### 1.4 List All Projects

**Endpoint:** `GET /projects`

**Query Parameters:**

- `userName` (optional): Teacher username
- `courseId` (optional): Filter by course ID
- `teacherId` (optional): Filter by teacher ID

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "courseId": "string",
      "courseDescription": "string",
      "learningOutcome": "string",
      "keyMilestones": "string",
      "attachments": ["string"],
      "availableStakeholders": ["string"],
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ]
}
```

---

### 1.5 Update Project

**Endpoint:** `PUT /projects/:id`

**Request Body:**

```json
{
  "courseDescription": "string",
  "learningOutcome": "string",
  "keyMilestones": "string",
  "attachments": ["string"],
  "availableStakeholders": ["string"],
  "additionalInfo": {}
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "courseId": "string",
    "courseDescription": "string",
    "learningOutcome": "string",
    "keyMilestones": "string",
    "attachments": ["string"],
    "availableStakeholders": ["string"],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 1.6 Delete Project

**Endpoint:** `DELETE /projects/:id`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Note:** Should also delete associated tasks, roles, quizzes, and submissions (or handle cascading deletes).

---

## 2. Tasks API

Tasks belong to a project and represent assignments for students.

### 2.1 Create Task

**Endpoint:** `POST /assessment-tasks`

**Request Body:**

```json
{
  "projectId": "string (required)",
  "description": "string (required)",
  "keyword": "string (required)",
  "submissionDeadline": "ISO 8601 datetime (required)",
  "evaluationCriteria": "string",
  "enabledAIGuideline": "boolean (default: false)",
  "lockOnSubmissionQuestion": "boolean (default: false)",
  "lockOnFeedbackReceivedQuestion": "boolean (default: false)",
  "submissionQuestion": "string (required if lockOnSubmissionQuestion is true)",
  "feedbackReceivedQuestion": "string (required if lockOnFeedbackReceivedQuestion is true)",
  "submissionQuestionTimer": "number (minutes, default: 5)",
  "feedbackReceivedQuestionTimer": "number (minutes, default: 5)",
  "attachments": ["string"], // Array of file URLs or file IDs
  "additionalInfo": {} // Optional: any additional fields
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "description": "string",
    "keyword": "string",
    "submissionDeadline": "ISO 8601 datetime",
    "evaluationCriteria": "string",
    "enabledAIGuideline": "boolean",
    "lockOnSubmissionQuestion": "boolean",
    "lockOnFeedbackReceivedQuestion": "boolean",
    "submissionQuestion": "string",
    "feedbackReceivedQuestion": "string",
    "submissionQuestionTimer": "number",
    "feedbackReceivedQuestionTimer": "number",
    "attachments": ["string"],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 2.2 Get Task by ID

**Endpoint:** `GET /assessment-tasks/:id`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "description": "string",
    "keyword": "string",
    "submissionDeadline": "ISO 8601 datetime",
    "evaluationCriteria": "string",
    "enabledAIGuideline": "boolean",
    "lockOnSubmissionQuestion": "boolean",
    "lockOnFeedbackReceivedQuestion": "boolean",
    "submissionQuestion": "string",
    "feedbackReceivedQuestion": "string",
    "submissionQuestionTimer": "number",
    "feedbackReceivedQuestionTimer": "number",
    "attachments": ["string"],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 2.3 Get Tasks by Project

**Endpoint:** `GET /assessment-tasks/project/:projectId`

**Query Parameters:**

- `userName` (optional): Teacher username

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "projectId": "string",
      "description": "string",
      "keyword": "string",
      "submissionDeadline": "ISO 8601 datetime",
      "evaluationCriteria": "string",
      "enabledAIGuideline": "boolean",
      "lockOnSubmissionQuestion": "boolean",
      "lockOnFeedbackReceivedQuestion": "boolean",
      "submissionQuestion": "string",
      "feedbackReceivedQuestion": "string",
      "submissionQuestionTimer": "number",
      "feedbackReceivedQuestionTimer": "number",
      "attachments": ["string"],
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ]
}
```

---

### 2.4 List All Tasks

**Endpoint:** `GET /assessment-tasks`

**Query Parameters:**

- `userName` (optional): Teacher username
- `projectId` (optional): Filter by project ID

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "projectId": "string",
      "description": "string",
      "keyword": "string",
      "submissionDeadline": "ISO 8601 datetime",
      "evaluationCriteria": "string",
      "enabledAIGuideline": "boolean",
      "lockOnSubmissionQuestion": "boolean",
      "lockOnFeedbackReceivedQuestion": "boolean",
      "submissionQuestion": "string",
      "feedbackReceivedQuestion": "string",
      "submissionQuestionTimer": "number",
      "feedbackReceivedQuestionTimer": "number",
      "attachments": ["string"],
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ]
}
```

---

### 2.5 Update Task

**Endpoint:** `PUT /assessment-tasks/:id`

**Request Body:** (Same as Create Task, all fields optional except those that are conditionally required)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "description": "string",
    "keyword": "string",
    "submissionDeadline": "ISO 8601 datetime",
    "evaluationCriteria": "string",
    "enabledAIGuideline": "boolean",
    "lockOnSubmissionQuestion": "boolean",
    "lockOnFeedbackReceivedQuestion": "boolean",
    "submissionQuestion": "string",
    "feedbackReceivedQuestion": "string",
    "submissionQuestionTimer": "number",
    "feedbackReceivedQuestionTimer": "number",
    "attachments": ["string"],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 2.6 Delete Task

**Endpoint:** `DELETE /assessment-tasks/:id`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Note:** Should handle cascading deletes for associated submissions.

---

## 3. Roles API

Roles represent stakeholders (e.g., mentors, reviewers) that can provide feedback to students.

### 3.1 Create Role

**Endpoint:** `POST /assessment-roles`

**Request Body:**

```json
{
  "projectId": "string (required)",
  "name": "string (required)",
  "persona": "string (required)",
  "avatarImage": "string (optional)", // Base64 encoded image or URL
  "attachments": ["string"] // Array of file URLs or file IDs (knowledge base)
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "name": "string",
    "persona": "string",
    "avatarImage": "string",
    "attachments": ["string"],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 3.2 Get Role by ID

**Endpoint:** `GET /assessment-roles/:id`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "name": "string",
    "persona": "string",
    "avatarImage": "string",
    "attachments": ["string"],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 3.3 Get Roles by Project

**Endpoint:** `GET /assessment-roles/project/:projectId`

**Query Parameters:**

- `userName` (optional): Teacher username

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "projectId": "string",
      "name": "string",
      "persona": "string",
      "avatarImage": "string",
      "attachments": ["string"],
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ]
}
```

---

### 3.4 List All Roles

**Endpoint:** `GET /assessment-roles`

**Query Parameters:**

- `userName` (optional): Teacher username
- `projectId` (optional): Filter by project ID

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "projectId": "string",
      "name": "string",
      "persona": "string",
      "avatarImage": "string",
      "attachments": ["string"],
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ]
}
```

---

### 3.5 Update Role

**Endpoint:** `PUT /assessment-roles/:id`

**Request Body:** (Same as Create Role, all fields optional)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "name": "string",
    "persona": "string",
    "avatarImage": "string",
    "attachments": ["string"],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 3.6 Delete Role

**Endpoint:** `DELETE /assessment-roles/:id`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

---

## 4. Quizzes API

Quizzes are generated based on tasks and keywords, and can be edited with version history.

### 4.1 Generate Quiz

**Endpoint:** `POST /assessment-quizzes/generate`

**Request Body:**

```json
{
  "projectId": "string (required)",
  "taskIds": ["string"], // Array of task IDs to use for generation
  "keywords": ["string"], // Array of keywords from tasks
  "learningObjectives": "string (optional)", // Project learning objectives
  "numberOfQuestions": "number (optional, default: 10)"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "questions": [
      {
        "id": "string",
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "correctAnswer": "number (0-based index)"
      }
    ],
    "history": [],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Note:** This endpoint should use AI/LLM to generate questions based on the project's learning objectives and task keywords.

---

### 4.2 Create Quiz

**Endpoint:** `POST /assessment-quizzes`

**Request Body:**

```json
{
  "projectId": "string (required)",
  "questions": [
    {
      "id": "string (optional)",
      "question": "string (required)",
      "options": ["string", "string", "string", "string"] (required, min 2 options),
      "correctAnswer": "number (required, 0-based index)"
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "questions": [
      {
        "id": "string",
        "question": "string",
        "options": ["string"],
        "correctAnswer": "number"
      }
    ],
    "history": [],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 4.3 Get Quiz by ID

**Endpoint:** `GET /assessment-quizzes/:id`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "questions": [
      {
        "id": "string",
        "question": "string",
        "options": ["string"],
        "correctAnswer": "number"
      }
    ],
    "history": [
      {
        "id": "string",
        "questions": [
          {
            "id": "string",
            "question": "string",
            "options": ["string"],
            "correctAnswer": "number"
          }
        ],
        "createdAt": "ISO 8601 datetime",
        "updatedBy": "string"
      }
    ],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 4.4 Get Quizzes by Project

**Endpoint:** `GET /assessment-quizzes/project/:projectId`

**Query Parameters:**

- `userName` (optional): Teacher username

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "projectId": "string",
      "questions": [
        {
          "id": "string",
          "question": "string",
          "options": ["string"],
          "correctAnswer": "number"
        }
      ],
      "history": [
        {
          "id": "string",
          "questions": [
            {
              "id": "string",
              "question": "string",
              "options": ["string"],
              "correctAnswer": "number"
            }
          ],
          "createdAt": "ISO 8601 datetime",
          "updatedBy": "string"
        }
      ],
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ]
}
```

---

### 4.5 List All Quizzes

**Endpoint:** `GET /assessment-quizzes`

**Query Parameters:**

- `userName` (optional): Teacher username
- `projectId` (optional): Filter by project ID

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "projectId": "string",
      "questions": [
        {
          "id": "string",
          "question": "string",
          "options": ["string"],
          "correctAnswer": "number"
        }
      ],
      "history": [
        {
          "id": "string",
          "questions": [
            {
              "id": "string",
              "question": "string",
              "options": ["string"],
              "correctAnswer": "number"
            }
          ],
          "createdAt": "ISO 8601 datetime",
          "updatedBy": "string"
        }
      ],
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ]
}
```

---

### 4.6 Update Quiz

**Endpoint:** `PUT /assessment-quizzes/:id`

**Request Body:**

```json
{
  "questions": [
    {
      "id": "string (optional, new if not provided)",
      "question": "string (required)",
      "options": ["string", "string", "string", "string"] (required),
      "correctAnswer": "number (required)"
    }
  ],
  "updatedBy": "string (required)" // Teacher username
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "projectId": "string",
    "questions": [
      {
        "id": "string",
        "question": "string",
        "options": ["string"],
        "correctAnswer": "number"
      }
    ],
    "history": [
      {
        "id": "string",
        "questions": [
          {
            "id": "string",
            "question": "string",
            "options": ["string"],
            "correctAnswer": "number"
          }
        ],
        "createdAt": "ISO 8601 datetime",
        "updatedBy": "string"
      }
    ],
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Note:** When updating, the previous version should be saved to the `history` array before updating the current questions.

---

### 4.7 Delete Quiz

**Endpoint:** `DELETE /assessment-quizzes/:id`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Quiz deleted successfully"
}
```

---

## 5. Submissions API

Submissions represent student work submitted for tasks, with feedback from stakeholders.

### 5.1 Create Submission

**Endpoint:** `POST /assessment-submissions`

**Request Body:**

```json
{
  "taskId": "string (required)",
  "studentId": "string (required)",
  "studentName": "string (required)",
  "submission": "string (required)", // The submitted work/content
  "conversationLog": "string (optional)", // Conversation history with stakeholders
  "attemptNumber": "number (optional, default: 1)",
  "stakeholderId": "string (optional)" // If feedback is from a specific stakeholder
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "taskId": "string",
    "studentId": "string",
    "studentName": "string",
    "datetime": "ISO 8601 datetime",
    "attemptNumber": "number",
    "submission": "string",
    "conversationLog": "string",
    "starScore": "number (optional)",
    "feedback": "string (optional)",
    "stakeholderId": "string (optional)",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 5.2 Get Submission by ID

**Endpoint:** `GET /assessment-submissions/:id`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "taskId": "string",
    "studentId": "string",
    "studentName": "string",
    "datetime": "ISO 8601 datetime",
    "attemptNumber": "number",
    "submission": "string",
    "conversationLog": "string",
    "starScore": "number",
    "feedback": "string",
    "stakeholderId": "string",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 5.3 Get Submissions by Task

**Endpoint:** `GET /assessment-submissions/task/:taskId`

**Query Parameters:**

- `userName` (optional): Teacher username
- `stakeholderId` (optional): Filter by stakeholder ID

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "taskId": "string",
      "studentId": "string",
      "studentName": "string",
      "datetime": "ISO 8601 datetime",
      "attemptNumber": "number",
      "submission": "string",
      "conversationLog": "string",
      "starScore": "number",
      "feedback": "string",
      "stakeholderId": "string",
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ]
}
```

---

### 5.4 Get Submissions by Student

**Endpoint:** `GET /assessment-submissions/student/:studentId`

**Query Parameters:**

- `userName` (optional): Teacher username
- `taskId` (optional): Filter by task ID

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "taskId": "string",
      "studentId": "string",
      "studentName": "string",
      "datetime": "ISO 8601 datetime",
      "attemptNumber": "number",
      "submission": "string",
      "conversationLog": "string",
      "starScore": "number",
      "feedback": "string",
      "stakeholderId": "string",
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ]
}
```

---

### 5.5 List All Submissions

**Endpoint:** `GET /assessment-submissions`

**Query Parameters:**

- `userName` (optional): Teacher username
- `taskId` (optional): Filter by task ID
- `studentId` (optional): Filter by student ID
- `stakeholderId` (optional): Filter by stakeholder ID

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "taskId": "string",
      "studentId": "string",
      "studentName": "string",
      "datetime": "ISO 8601 datetime",
      "attemptNumber": "number",
      "submission": "string",
      "conversationLog": "string",
      "starScore": "number",
      "feedback": "string",
      "stakeholderId": "string",
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ]
}
```

---

### 5.6 Update Submission

**Endpoint:** `PUT /assessment-submissions/:id`

**Request Body:**

```json
{
  "submission": "string (optional)",
  "conversationLog": "string (optional)",
  "starScore": "number (optional, 0-100)",
  "feedback": "string (optional)",
  "stakeholderId": "string (optional)"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "taskId": "string",
    "studentId": "string",
    "studentName": "string",
    "datetime": "ISO 8601 datetime",
    "attemptNumber": "number",
    "submission": "string",
    "conversationLog": "string",
    "starScore": "number",
    "feedback": "string",
    "stakeholderId": "string",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

---

### 5.7 Delete Submission

**Endpoint:** `DELETE /assessment-submissions/:id`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Submission deleted successfully"
}
```

---

### 5.8 Generate Feedback for Submission

**Endpoint:** `POST /assessment-submissions/:id/generate-feedback`

**Request Body:**

```json
{
  "stakeholderId": "string (optional)", // If feedback should be from a specific stakeholder role
  "useAIGuideline": "boolean (optional, default: true)"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "feedback": "string", // Generated feedback text
    "starScore": "number", // Generated score (0-100)
    "generatedAt": "ISO 8601 datetime"
  }
}
```

**Note:** This endpoint should use AI/LLM to generate feedback based on:

- The submission content
- Task evaluation criteria
- Stakeholder persona (if stakeholderId is provided)
- Task attachments and knowledge base
- Previous conversation logs

---

### 5.9 Generate Feedback for Multiple Submissions

**Endpoint:** `POST /assessment-submissions/generate-feedback-batch`

**Request Body:**

```json
{
  "submissionIds": ["string"], // Array of submission IDs
  "stakeholderId": "string (optional)",
  "useAIGuideline": "boolean (optional, default: true)"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "generated": "number", // Number of feedbacks generated
    "results": [
      {
        "submissionId": "string",
        "feedback": "string",
        "starScore": "number",
        "generatedAt": "ISO 8601 datetime"
      }
    ]
  }
}
```

**Note:** This should process submissions that don't already have feedback.

---

## 6. Analytics & Reporting Endpoints

### 6.1 Get Submission Heatmap Data

**Endpoint:** `GET /assessment-submissions/heatmap`

**Query Parameters:**

- `projectId` (required): Project ID
- `userName` (optional): Teacher username

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "string",
        "keyword": "string"
      }
    ],
    "students": ["string"], // Array of student IDs
    "heatmap": [
      {
        "taskId": "string",
        "studentId": "string",
        "hasSubmission": "boolean",
        "starScore": "number (null if no submission)"
      }
    ]
  }
}
```

---

### 6.2 Get Stakeholder Interaction Heatmap

**Endpoint:** `GET /assessment-submissions/stakeholder-heatmap`

**Query Parameters:**

- `projectId` (required): Project ID
- `userName` (optional): Teacher username

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "stakeholders": [
      {
        "id": "string",
        "name": "string"
      }
    ],
    "students": ["string"],
    "heatmap": [
      {
        "stakeholderId": "string",
        "studentId": "string",
        "conversationCount": "number", // Number of conversation items
        "totalConversationLength": "number" // Total length of conversations
      }
    ]
  }
}
```

---

### 6.3 Get Progress Data

**Endpoint:** `GET /assessment-submissions/progress`

**Query Parameters:**

- `projectId` (required): Project ID
- `studentId` (optional): Filter by student ID
- `userName` (optional): Teacher username

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "students": [
      {
        "studentId": "string",
        "studentName": "string",
        "progress": [
          {
            "date": "YYYY-MM-DD",
            "completedTasks": "number" // Accumulated count
          }
        ]
      }
    ]
  }
}
```

---

### 6.4 Get Timeline Data

**Endpoint:** `GET /assessment-submissions/timeline`

**Query Parameters:**

- `projectId` (required): Project ID
- `studentId` (optional): Filter by student ID
- `userName` (optional): Teacher username

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "taskId": "string",
      "taskKeyword": "string",
      "studentId": "string",
      "studentName": "string",
      "datetime": "ISO 8601 datetime",
      "submissionDeadline": "ISO 8601 datetime",
      "isOnTime": "boolean"
    }
  ]
}
```

---

### 6.5 Get Quiz Leaderboard

**Endpoint:** `GET /assessment-quizzes/:quizId/leaderboard`

**Query Parameters:**

- `userName` (optional): Teacher username

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "studentId": "string",
      "studentName": "string",
      "score": "number (0-100)",
      "totalQuestions": "number",
      "correctAnswers": "number",
      "completedAt": "ISO 8601 datetime"
    }
  ]
}
```

**Note:** Results should be sorted by score (descending).

---

### 6.6 Get Student Quiz Answers

**Endpoint:** `GET /assessment-quizzes/:quizId/student/:studentId`

**Query Parameters:**

- `userName` (optional): Teacher username

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "studentId": "string",
    "studentName": "string",
    "quizId": "string",
    "answers": [
      {
        "questionId": "string",
        "question": "string",
        "options": ["string"],
        "correctAnswer": "number",
        "studentAnswer": "number",
        "isCorrect": "boolean",
        "comment": "string (optional)" // Student's comment on the answer
      }
    ],
    "score": "number",
    "completedAt": "ISO 8601 datetime"
  }
}
```

---

## 7. File Upload Endpoints

### 7.1 Upload Attachment

**Endpoint:** `POST /assessment/upload`

**Request:**

- Content-Type: `multipart/form-data`
- Body: File(s) to upload

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "fileId": "string",
    "fileName": "string",
    "fileUrl": "string",
    "fileSize": "number",
    "mimeType": "string",
    "uploadedAt": "ISO 8601 datetime"
  }
}
```

---

## Common Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**

```json
{
  "success": false,
  "error": "ValidationError",
  "message": "string",
  "validationErrors": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

**401 Unauthorized:**

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You do not have permission to perform this action"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "error": "NotFound",
  "message": "Resource not found"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "InternalServerError",
  "message": "An unexpected error occurred"
}
```

---

## Data Types

### ISO 8601 Datetime Format

All datetime fields should be in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

Example: `2025-01-15T10:30:00.000Z`

### File References

File attachments can be:

- URLs to uploaded files
- File IDs that can be resolved to URLs
- Base64 encoded strings (for small images like avatars)

---

## Notes for Backend Implementation

1. **Authentication**: All endpoints should verify the user is authenticated and has appropriate permissions (teacher role).

2. **Authorization**: Teachers should only be able to access projects, tasks, roles, quizzes, and submissions for courses they teach.

3. **Cascading Deletes**:
   - Deleting a project should delete all associated tasks, roles, quizzes, and submissions
   - Deleting a task should delete all associated submissions
   - Consider soft deletes for important data

4. **Quiz Generation**: The `/assessment-quizzes/generate` endpoint should integrate with an AI/LLM service to generate questions based on:
   - Project learning objectives
   - Task keywords
   - Task descriptions
   - Evaluation criteria

5. **Feedback Generation**: The feedback generation endpoints should use AI/LLM with context from:
   - Submission content
   - Task evaluation criteria
   - Stakeholder persona (if applicable)
   - Knowledge base attachments
   - Previous conversation logs

6. **Performance**: Consider pagination for list endpoints that may return large datasets.

7. **Validation**:
   - Ensure `correctAnswer` index is within bounds of `options` array
   - Validate datetime formats
   - Validate file types and sizes for uploads
   - Ensure required fields are present

8. **Version History**: Quiz updates should preserve previous versions in the `history` array before updating.

9. **Timestamps**: All entities should have `createdAt` and `updatedAt` timestamps that are automatically managed.

10. **Student Data**: The frontend may pass `studentId` and `studentName` - the backend should validate these against actual student records if available.
