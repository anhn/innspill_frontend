# Prompt API Endpoints Specification

This document specifies the required API endpoints for the Prompting feature, including prompt revision and prompt management.

## Base URL
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://innspill.ai/microapi/api/v1`

---

## 1. Revise Prompt Endpoint

**Endpoint**: `POST /api/v1/prompts/revise`

**Description**: Analyzes and revises a user's prompt, providing analysis feedback and an improved version.

**Authentication**: Optional (uses `isOptionalAuth` middleware)

**Request Headers**:
```
Content-Type: application/json
```

**Request Body (JSON)**:
```json
{
  "prompt": "string (required) - The original prompt to be revised",
  "userName": "string (required) - The username of the user requesting the revision"
}
```

**Example Request**:
```json
POST /api/v1/prompts/revise
Content-Type: application/json

{
  "prompt": "Create a lesson plan about photosynthesis",
  "userName": "teacher@example.com"
}
```

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "analysis": "string - Detailed analysis of the prompt, including strengths, weaknesses, and suggestions for improvement",
    "revisedPrompt": "string - The improved/revised version of the prompt"
  }
}
```

**Response (Error - 400 Bad Request)**:
```json
{
  "success": false,
  "message": "Invalid request body",
  "error": "error details"
}
```

**Response (Error - 500 Internal Server Error)**:
```json
{
  "success": false,
  "message": "Failed to revise prompt",
  "error": "error details"
}
```

**Required Fields**:
- `prompt` (string, required)
- `userName` (string, required)

---

## 2. Create/Save Prompt Endpoint

**Endpoint**: `POST /api/v1/prompts`

**Description**: Saves a prompt revision (original prompt, revised prompt, analysis, and optional topic) for future reference.

**Authentication**: Optional (uses `isOptionalAuth` middleware)

**Request Headers**:
```
Content-Type: application/json
```

**Request Body (JSON)**:
```json
{
  "originalPrompt": "string (required) - The original prompt text",
  "revisedPrompt": "string (required) - The revised/improved prompt text",
  "analysis": "string (required) - The analysis feedback provided during revision",
  "topic": "string (optional) - A topic/category tag for organizing prompts (e.g., 'Lesson Planning', 'Assessment')",
  "userName": "string (required) - The username of the user saving the prompt"
}
```

**Example Request**:
```json
POST /api/v1/prompts
Content-Type: application/json

{
  "originalPrompt": "Create a lesson plan about photosynthesis",
  "revisedPrompt": "Create a comprehensive 45-minute lesson plan for 8th-grade biology students about photosynthesis, including learning objectives, key concepts, interactive activities, and assessment methods.",
  "analysis": "The original prompt was too vague. The revised version specifies grade level, duration, subject area, and required components, making it more actionable.",
  "topic": "Lesson Planning",
  "userName": "teacher@example.com"
}
```

**Response (Success - 201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "prompt_id",
    "originalPrompt": "Create a lesson plan about photosynthesis",
    "revisedPrompt": "Create a comprehensive 45-minute lesson plan...",
    "analysis": "The original prompt was too vague...",
    "topic": "Lesson Planning",
    "userName": "teacher@example.com",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Response (Error - 400 Bad Request)**:
```json
{
  "success": false,
  "message": "Invalid request body",
  "error": "error details"
}
```

**Response (Error - 500 Internal Server Error)**:
```json
{
  "success": false,
  "message": "Failed to save prompt",
  "error": "error details"
}
```

**Required Fields**:
- `originalPrompt` (string, required)
- `revisedPrompt` (string, required)
- `analysis` (string, required)
- `userName` (string, required)

**Optional Fields**:
- `topic` (string, optional)

---

## 3. List Prompts Endpoint

**Endpoint**: `GET /api/v1/prompts`

**Description**: Retrieves all saved prompts for a specific user.

**Authentication**: Optional (uses `isOptionalAuth` middleware)

**Query Parameters**:
- `userName` (string, required) - The username to filter prompts by

**Example Request**:
```
GET /api/v1/prompts?userName=teacher%40example.com
```

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "prompt_id_1",
      "originalPrompt": "Create a lesson plan about photosynthesis",
      "revisedPrompt": "Create a comprehensive 45-minute lesson plan...",
      "analysis": "The original prompt was too vague...",
      "topic": "Lesson Planning",
      "userName": "teacher@example.com",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    },
    {
      "id": "prompt_id_2",
      "originalPrompt": "Write quiz questions",
      "revisedPrompt": "Generate 10 multiple-choice quiz questions...",
      "analysis": "The original prompt lacked specificity...",
      "topic": "Assessment",
      "userName": "teacher@example.com",
      "createdAt": "2025-01-14T09:20:00.000Z",
      "updatedAt": "2025-01-14T09:20:00.000Z"
    }
  ]
}
```

**Response (Error - 400 Bad Request)**:
```json
{
  "success": false,
  "message": "userName parameter is required",
  "error": "error details"
}
```

**Response (Error - 500 Internal Server Error)**:
```json
{
  "success": false,
  "message": "Failed to retrieve prompts",
  "error": "error details"
}
```

**Required Query Parameters**:
- `userName` (string, required)

---

## 4. Get Prompt by ID Endpoint

**Endpoint**: `GET /api/v1/prompts/:id`

**Description**: Retrieves a specific saved prompt by its ID.

**Authentication**: Optional (uses `isOptionalAuth` middleware)

**URL Parameters**:
- `id` (string, required) - The ID of the prompt to retrieve

**Example Request**:
```
GET /api/v1/prompts/507f1f77bcf86cd799439011
```

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "originalPrompt": "Create a lesson plan about photosynthesis",
    "revisedPrompt": "Create a comprehensive 45-minute lesson plan...",
    "analysis": "The original prompt was too vague...",
    "topic": "Lesson Planning",
    "userName": "teacher@example.com",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Response (Error - 404 Not Found)**:
```json
{
  "success": false,
  "message": "Prompt not found"
}
```

**Response (Error - 500 Internal Server Error)**:
```json
{
  "success": false,
  "message": "Failed to retrieve prompt",
  "error": "error details"
}
```

---

## 5. Update Prompt Endpoint

**Endpoint**: `PUT /api/v1/prompts/:id`

**Description**: Updates an existing saved prompt.

**Authentication**: Optional (uses `isOptionalAuth` middleware)

**URL Parameters**:
- `id` (string, required) - The ID of the prompt to update

**Request Headers**:
```
Content-Type: application/json
```

**Request Body (JSON)**:
```json
{
  "originalPrompt": "string (optional) - Updated original prompt text",
  "revisedPrompt": "string (optional) - Updated revised prompt text",
  "analysis": "string (optional) - Updated analysis text",
  "topic": "string (optional) - Updated topic/category",
  "userName": "string (required) - The username of the user updating the prompt"
}
```

**Example Request**:
```json
PUT /api/v1/prompts/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "topic": "Biology Lesson Planning",
  "userName": "teacher@example.com"
}
```

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "originalPrompt": "Create a lesson plan about photosynthesis",
    "revisedPrompt": "Create a comprehensive 45-minute lesson plan...",
    "analysis": "The original prompt was too vague...",
    "topic": "Biology Lesson Planning",
    "userName": "teacher@example.com",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T11:45:00.000Z"
  }
}
```

**Response (Error - 404 Not Found)**:
```json
{
  "success": false,
  "message": "Prompt not found"
}
```

**Response (Error - 400 Bad Request)**:
```json
{
  "success": false,
  "message": "Invalid request body",
  "error": "error details"
}
```

**Required Fields**:
- `userName` (string, required)

**Optional Fields** (at least one must be provided):
- `originalPrompt` (string, optional)
- `revisedPrompt` (string, optional)
- `analysis` (string, optional)
- `topic` (string, optional)

---

## 6. Delete Prompt Endpoint

**Endpoint**: `DELETE /api/v1/prompts/:id`

**Description**: Deletes a saved prompt.

**Authentication**: Optional (uses `isOptionalAuth` middleware)

**URL Parameters**:
- `id` (string, required) - The ID of the prompt to delete

**Request Headers**:
```
Content-Type: application/json
```

**Request Body (JSON)**:
```json
{
  "userName": "string (required) - The username of the user deleting the prompt"
}
```

**Example Request**:
```json
DELETE /api/v1/prompts/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "userName": "teacher@example.com"
}
```

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "message": "Prompt deleted successfully"
}
```

**Response (Error - 404 Not Found)**:
```json
{
  "success": false,
  "message": "Prompt not found"
}
```

**Response (Error - 403 Forbidden)**:
```json
{
  "success": false,
  "message": "You do not have permission to delete this prompt"
}
```

**Response (Error - 400 Bad Request)**:
```json
{
  "success": false,
  "message": "userName is required",
  "error": "error details"
}
```

**Required Fields**:
- `userName` (string, required in request body)

---

## Data Model

### Prompt Object Structure
```typescript
interface Prompt {
  id: string;                    // Unique identifier (MongoDB ObjectId format)
  originalPrompt: string;        // The original prompt text
  revisedPrompt: string;         // The revised/improved prompt text
  analysis: string;              // Analysis feedback provided during revision
  topic?: string;                // Optional topic/category tag
  userName: string;               // Username of the prompt owner
  createdAt: string;             // ISO 8601 timestamp (e.g., "2025-01-15T10:30:00.000Z")
  updatedAt: string;             // ISO 8601 timestamp (e.g., "2025-01-15T10:30:00.000Z")
}
```

---

## Error Handling

All endpoints should follow a consistent error response format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Detailed error information (for debugging)"
}
```

**Common HTTP Status Codes**:
- `200 OK` - Successful GET, PUT, DELETE operations
- `201 Created` - Successful POST (create) operations
- `400 Bad Request` - Invalid request body or parameters
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side error

---

## Notes for Backend Implementation

1. **Authentication**: All endpoints use `isOptionalAuth` middleware, meaning authentication is optional but recommended for user-specific operations.

2. **User Filtering**: The `userName` field should be used to filter prompts by user. Users should only be able to access their own prompts.

3. **Topic Field**: The `topic` field is optional and can be used for organizing prompts. It should support filtering and grouping in the frontend.

4. **Timestamps**: All timestamps should be in ISO 8601 format (UTC).

5. **Validation**: 
   - Ensure `originalPrompt`, `revisedPrompt`, and `analysis` are non-empty strings when required
   - Validate `userName` format if needed
   - Ensure `topic` is a valid string if provided

6. **Database Considerations**:
   - Index `userName` for efficient querying
   - Index `topic` if topic-based filtering is needed
   - Index `createdAt` for date-based sorting

7. **Response Format**: All successful responses should include `success: true` and a `data` field containing the result(s).

