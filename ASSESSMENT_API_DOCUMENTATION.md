# Assessment Module - Backend API Documentation

This document lists all the backend API endpoints required for the Assessment module (Exercises functionality).

## Base URL
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://innspill.ai/microapi/api/v1`

All endpoints require authentication via cookies/session (credentials: 'include').

---

## 1. Courses API

### 1.1 Get Courses List
**Endpoint**: `GET /courses`

**Description**: Fetch all courses for a specific teacher, filtered by academic year and university.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `teacherId` | string | Yes | Username/ID of the teacher |
| `academicYear` | string | Yes | Academic year (e.g., "2025-2026") |
| `university` | string | Yes | University/organization name |

**Example Request**:
```
GET /api/v1/courses?teacherId=john.doe&academicYear=2025-2026&university=USN
```

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": "course_id_1",
      "name": "Introduction to Computer Science",
      "code": "CS101",
      "academicYear": "2025-2026",
      "university": "Universitetet i Sørøst-Norge (USN)",
      "teacherId": "john.doe"
    },
    {
      "id": "course_id_2",
      "name": "Data Structures and Algorithms",
      "code": "CS201",
      "academicYear": "2025-2026",
      "university": "Universitetet i Sørøst-Norge (USN)",
      "teacherId": "john.doe"
    }
  ]
}
```

**Alternative Response Format** (if not wrapped in `data`):
```json
[
  {
    "id": "course_id_1",
    "name": "Introduction to Computer Science",
    "code": "CS101",
    "academicYear": "2025-2026",
    "university": "Universitetet i Sørøst-Norge (USN)",
    "teacherId": "john.doe"
  }
]
```

---

## 2. Exercises API

### 2.1 Get Exercises List
**Endpoint**: `GET /exercises`

**Description**: Fetch all exercises for a specific course.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `courseId` | string | Yes | ID of the course |

**Example Request**:
```
GET /api/v1/exercises?courseId=course_id_1
```

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": "exercise_id_1",
      "courseId": "course_id_1",
      "lectureLabel": "Lecture 1",
      "title": "Introduction to Algorithms",
      "description": "Write a function to sort an array using bubble sort",
      "learningObjective": "Understand basic sorting algorithms",
      "evaluationRank": "1-10",
      "evaluationCriteria": "Code correctness, efficiency, code quality",
      "references": "Textbook Chapter 3, Pages 45-60",
      "goodExamples": "Example of well-structured code with comments",
      "badExamples": "Example of code without proper structure",
      "aiSupportingStyles": ["Guiding Questions", "Task Breakdown", "Detail Feedback"],
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Alternative Response Format** (if not wrapped in `data`):
```json
[
  {
    "id": "exercise_id_1",
    "courseId": "course_id_1",
    ...
  }
]
```

---

### 2.2 Create Exercise
**Endpoint**: `POST /exercises`

**Description**: Create a new exercise for a course.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "courseId": "course_id_1",
  "lectureLabel": "Lecture 1",
  "title": "Introduction to Algorithms",
  "description": "Write a function to sort an array using bubble sort",
  "learningObjective": "Understand basic sorting algorithms",
  "evaluationRank": "1-10",
  "evaluationCriteria": "Code correctness, efficiency, code quality",
  "references": "Textbook Chapter 3, Pages 45-60",
  "goodExamples": "Example of well-structured code with comments",
  "badExamples": "Example of code without proper structure",
  "aiSupportingStyles": ["Guiding Questions", "Task Breakdown", "Detail Feedback"]
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `courseId` | string | Yes | ID of the course this exercise belongs to |
| `lectureLabel` | string | Yes | Label identifying the lecture (e.g., "Lecture 1", "Week 3", "Module 2") |
| `title` | string | Yes | Title of the exercise |
| `description` | string | Yes | Detailed description of the exercise |
| `learningObjective` | string | No | Learning objective this exercise addresses |
| `evaluationRank` | string | No | Evaluation scale: "1-10", "A-F", "Pass-Failed", "1-4", "100%" |
| `evaluationCriteria` | string | No | Criteria used for evaluation |
| `references` | string | No | Relevant references (textbooks, articles, etc.) |
| `goodExamples` | string | No | Examples of good work |
| `badExamples` | string | No | Examples of work that needs improvement |
| `aiSupportingStyles` | string[] | No | Array of AI support styles: "Guiding Questions", "Task Breakdown", "Suggest Prompts", "Detail Feedback", "Reflection" |

**Response Format** (Success):
```json
{
  "success": true,
  "data": {
    "id": "exercise_id_1",
    "courseId": "course_id_1",
    "lectureLabel": "Lecture 1",
    "title": "Introduction to Algorithms",
    "description": "Write a function to sort an array using bubble sort",
    "learningObjective": "Understand basic sorting algorithms",
    "evaluationRank": "1-10",
    "evaluationCriteria": "Code correctness, efficiency, code quality",
    "references": "Textbook Chapter 3, Pages 45-60",
    "goodExamples": "Example of well-structured code with comments",
    "badExamples": "Example of code without proper structure",
    "aiSupportingStyles": ["Guiding Questions", "Task Breakdown", "Detail Feedback"],
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

**Response Format** (Error):
```json
{
  "success": false,
  "message": "Failed to create exercise: [error details]"
}
```

---

### 2.3 Update Exercise
**Endpoint**: `PUT /exercises/{exerciseId}`

**Description**: Update an existing exercise.

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `exerciseId` | string | Yes | ID of the exercise to update |

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**: (Same as Create Exercise, all fields optional except those you want to update)
```json
{
  "lectureLabel": "Lecture 2",
  "title": "Updated Exercise Title",
  "description": "Updated description",
  "learningObjective": "Updated learning objective",
  "evaluationRank": "A-F",
  "evaluationCriteria": "Updated criteria",
  "references": "Updated references",
  "goodExamples": "Updated good examples",
  "badExamples": "Updated bad examples",
  "aiSupportingStyles": ["Guiding Questions", "Reflection"]
}
```

**Response Format** (Success):
```json
{
  "success": true,
  "data": {
    "id": "exercise_id_1",
    "courseId": "course_id_1",
    "lectureLabel": "Lecture 2",
    "title": "Updated Exercise Title",
    ...
    "updatedAt": "2025-01-15T11:00:00Z"
  }
}
```

**Response Format** (Error):
```json
{
  "success": false,
  "message": "Failed to update exercise: [error details]"
}
```

---

### 2.4 Delete Exercise
**Endpoint**: `DELETE /exercises/{exerciseId}`

**Description**: Delete an exercise.

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `exerciseId` | string | Yes | ID of the exercise to delete |

**Example Request**:
```
DELETE /api/v1/exercises/exercise_id_1
```

**Response Format** (Success):
```json
{
  "success": true,
  "message": "Exercise deleted successfully"
}
```

**Response Format** (Error):
```json
{
  "success": false,
  "message": "Failed to delete exercise: [error details]"
}
```

---

### 2.5 Get Exercise by ID (Optional)
**Endpoint**: `GET /exercises/{exerciseId}`

**Description**: Fetch a single exercise by its ID. (Currently not used in the frontend, but may be useful)

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `exerciseId` | string | Yes | ID of the exercise |

**Response Format**:
```json
{
  "success": true,
  "data": {
    "id": "exercise_id_1",
    "courseId": "course_id_1",
    "lectureLabel": "Lecture 1",
    "title": "Introduction to Algorithms",
    ...
  }
}
```

---

## 3. Error Handling

All endpoints should return appropriate HTTP status codes:
- `200 OK` - Successful request
- `201 Created` - Resource created successfully (for POST)
- `400 Bad Request` - Invalid request parameters or body
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Response Format**:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (optional)"
}
```

---

## 4. Authentication

All endpoints require authentication. The frontend sends requests with:
- `credentials: 'include'` - to include cookies/session
- User authentication is handled via session cookies

The backend should:
- Verify the user's session/authentication
- Ensure the user has permission to access/modify the requested resources
- Return `401 Unauthorized` if authentication fails

---

## 5. Data Validation

### Required Fields for Exercise Creation:
- `courseId` (string)
- `lectureLabel` (string)
- `title` (string)
- `description` (string)

### Optional Fields:
- `learningObjective` (string)
- `evaluationRank` (string) - Must be one of: "1-10", "A-F", "Pass-Failed", "1-4", "100%"
- `evaluationCriteria` (string)
- `references` (string)
- `goodExamples` (string)
- `badExamples` (string)
- `aiSupportingStyles` (string[]) - Array of strings, valid values: "Guiding Questions", "Task Breakdown", "Suggest Prompts", "Detail Feedback", "Reflection"

---

## 6. Notes

1. **Course Filtering**: The courses endpoint should filter courses by:
   - Teacher ID (username from localStorage)
   - Academic Year
   - University/Organization

2. **Exercise Filtering**: Exercises are filtered by `courseId` in the query parameter.

3. **Timestamps**: The backend should automatically set `createdAt` and `updatedAt` timestamps.

4. **ID Generation**: The backend should generate unique IDs for courses and exercises (UUIDs or MongoDB ObjectIds).

5. **Response Consistency**: The API should consistently return either:
   - `{ success: true, data: [...] }` format, OR
   - Direct array/object format
   
   The frontend handles both formats, but consistency is recommended.

---

## 7. Example Implementation Checklist

- [ ] Implement `GET /courses` with query parameter filtering
- [ ] Implement `GET /exercises` with courseId filtering
- [ ] Implement `POST /exercises` with validation
- [ ] Implement `PUT /exercises/:id` with validation
- [ ] Implement `DELETE /exercises/:id`
- [ ] Add authentication middleware
- [ ] Add input validation
- [ ] Add error handling
- [ ] Add database models/schemas for Course and Exercise
- [ ] Add timestamps (createdAt, updatedAt)
- [ ] Test all endpoints

