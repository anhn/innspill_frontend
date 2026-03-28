# Worksheet Feature - Backend Endpoints Required

This document lists all the backend API endpoints needed for the Worksheet creation feature.

## Current Implementation Status

The Worksheet feature currently uses:
- **Worksheet Generation**: `POST /api/v1/chatbot/asks` (temporary - should be replaced with dedicated endpoint)
- **Learning Objective Generation**: Placeholder (not implemented)
- **Format Description Generation**: Placeholder (not implemented)
- **Examples Generation**: Placeholder (not implemented)

## Required Endpoints

### 1. Generate Learning Objectives
**Endpoint**: `POST /api/v1/worksheets/generate-learning-objectives`

**Purpose**: Generate learning objectives based on user input text.

**Request Body**:
```json
{
  "text": "string (optional) - User's initial text/description",
  "educationLevel": "string (optional) - elementary | high-school | higher-education",
  "year": "string (optional) - Selected year/grade",
  "subjectArea": "string (optional) - Subject or area of study",
  "userName": "string (optional) - Current user identifier"
}
```

**Note**: All fields are optional. The endpoint should accept requests with any combination of fields, including an empty request body.

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "learningObjectives": "string - Generated learning objectives text"
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

---

### 2. Generate Format Description
**Endpoint**: `POST /api/v1/worksheets/generate-format-description`

**Purpose**: Generate worksheet format description (types of questions, tasks, answer formats) based on all previous form fields.

**Request Body**:
```json
{
  "educationLevel": "string (required) - elementary | high-school | higher-education",
  "year": "string (required) - Selected year/grade",
  "subjectArea": "string (required) - Subject or area of study",
  "learningObjective": "string (required) - Learning objective text",
  "difficultyLevel": "string (required) - easy | medium | hard",
  "userName": "string (required) - Current user identifier"
}
```

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "formatDescription": "string - Generated format description with suggested question types, tasks, and answer formats"
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

---

### 3. Generate Examples
**Endpoint**: `POST /api/v1/worksheets/generate-examples`

**Purpose**: Generate example questions or tasks based on the format description and learning objective.

**Request Body**:
```json
{
  "educationLevel": "string (required) - elementary | high-school | higher-education",
  "year": "string (required) - Selected year/grade",
  "subjectArea": "string (required) - Subject or area of study",
  "learningObjective": "string (required) - Learning objective text",
  "difficultyLevel": "string (required) - easy | medium | hard",
  "formatDescription": "string (required) - Format description text",
  "userName": "string (required) - Current user identifier"
}
```

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "examples": "string - Generated example questions or tasks"
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

---

### 4. Generate Worksheet
**Endpoint**: `POST /api/v1/worksheets/generate`

**Purpose**: Generate the complete worksheet based on all form fields.

**Request Body**:
```json
{
  "educationLevel": "string (required) - elementary | high-school | higher-education",
  "year": "string (required) - Selected year/grade",
  "subjectArea": "string (required) - Subject or area of study",
  "learningObjective": "string (required) - Learning objective text",
  "difficultyLevel": "string (required) - easy | medium | hard",
  "formatDescription": "string (required) - Format description text",
  "examples": "string (optional) - Example questions or tasks",
  "references": "string (optional) - References, sources, or materials",
  "userName": "string (required) - Current user identifier"
}
```

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "worksheetId": "string (optional) - ID if worksheet is saved",
    "content": "string - Generated worksheet content (formatted text)",
    "title": "string - Suggested worksheet title",
    "metadata": {
      "educationLevel": "string",
      "year": "string",
      "subjectArea": "string",
      "difficultyLevel": "string",
      "generatedAt": "ISO 8601 datetime string"
    }
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

---

## Optional Endpoints (For Future Enhancement)

### 5. Save Worksheet
**Endpoint**: `POST /api/v1/worksheets`

**Purpose**: Save a generated worksheet for later retrieval.

**Request Body**:
```json
{
  "title": "string (required)",
  "content": "string (required) - Generated worksheet content",
  "educationLevel": "string (required)",
  "year": "string (required)",
  "subjectArea": "string (required)",
  "learningObjective": "string (required)",
  "difficultyLevel": "string (required)",
  "formatDescription": "string (optional)",
  "examples": "string (optional)",
  "references": "string (optional)",
  "userName": "string (required)"
}
```

**Response (Success - 201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "string - Worksheet ID",
    "title": "string",
    "content": "string",
    "createdAt": "ISO 8601 datetime string",
    "updatedAt": "ISO 8601 datetime string"
  }
}
```

---

### 6. List Saved Worksheets
**Endpoint**: `GET /api/v1/worksheets`

**Purpose**: Retrieve list of saved worksheets for the current user.

**Query Parameters**:
- `userName` (required) - Current user identifier
- `page` (optional) - Page number for pagination
- `limit` (optional) - Items per page
- `educationLevel` (optional) - Filter by education level
- `subjectArea` (optional) - Filter by subject area

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "worksheets": [
      {
        "id": "string",
        "title": "string",
        "educationLevel": "string",
        "year": "string",
        "subjectArea": "string",
        "difficultyLevel": "string",
        "createdAt": "ISO 8601 datetime string",
        "updatedAt": "ISO 8601 datetime string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "totalPages": "number"
    }
  }
}
```

---

### 7. Get Worksheet by ID
**Endpoint**: `GET /api/v1/worksheets/:id`

**Purpose**: Retrieve a specific saved worksheet.

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "educationLevel": "string",
    "year": "string",
    "subjectArea": "string",
    "learningObjective": "string",
    "difficultyLevel": "string",
    "formatDescription": "string",
    "examples": "string",
    "references": "string",
    "createdAt": "ISO 8601 datetime string",
    "updatedAt": "ISO 8601 datetime string"
  }
}
```

**Response (Error - 404 Not Found)**:
```json
{
  "success": false,
  "message": "Worksheet not found"
}
```

---

### 8. Update Worksheet
**Endpoint**: `PUT /api/v1/worksheets/:id`

**Purpose**: Update an existing saved worksheet.

**Request Body**: (Same as Save Worksheet)

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "updatedAt": "ISO 8601 datetime string"
  }
}
```

---

### 9. Delete Worksheet
**Endpoint**: `DELETE /api/v1/worksheets/:id`

**Purpose**: Delete a saved worksheet.

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "message": "Worksheet deleted successfully"
}
```

**Response (Error - 404 Not Found)**:
```json
{
  "success": false,
  "message": "Worksheet not found"
}
```

---

## Authentication

All endpoints should use the same authentication mechanism as other endpoints in the application. Based on the current implementation:
- Authentication is optional (uses `isOptionalAuth` middleware)
- `userName` should be included in the request body or query parameters
- Session management follows the existing pattern

## Error Handling

All endpoints should return consistent error responses:
- **400 Bad Request**: Invalid request body or missing required fields
- **401 Unauthorized**: Authentication required (if authentication is enforced)
- **404 Not Found**: Resource not found (for GET/PUT/DELETE operations)
- **500 Internal Server Error**: Server error

## Notes

1. The current implementation uses `POST /api/v1/chatbot/asks` as a temporary solution for worksheet generation. This should be replaced with the dedicated `POST /api/v1/worksheets/generate` endpoint.

2. All generation endpoints should use AI/LLM to generate appropriate content based on the provided context.

3. The worksheet content should be formatted as plain text or markdown that can be easily displayed and printed.

4. Consider rate limiting for generation endpoints to prevent abuse.

5. The optional endpoints (5-9) are for future enhancement and not required for the initial implementation.

