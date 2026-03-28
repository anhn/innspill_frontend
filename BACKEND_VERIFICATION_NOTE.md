# Backend Verification Note: Course Teacher Filtering

## Issue
After implementing multiple teachers per course (`teacherIds` array), the course list is not showing in the teacher navigation menu in the Assessment module.

## Frontend Changes Applied
✅ Updated `Course` interface in `src/pages/Assessment.tsx` to include `teacherIds?: string[]`
✅ Added comment in `fetchCourses` function noting backend filtering requirements

## Backend Verification Required

The frontend uses this API call to fetch courses for a teacher:
```
GET /api/v1/courses?teacherId=username&academicYear=...&university=...
```

### Critical Backend Check
When filtering by `?teacherId=username`, the backend **MUST** return courses where:
1. **EITHER** `course.teacherId === username` (backward compatibility)
2. **OR** `username` is in the `course.teacherIds` array (new multiple teachers support)

### Expected Backend Filter Logic
```javascript
// Backend should check BOTH fields when filtering by teacherId query parameter
if (queryParams.teacherId) {
  courses = courses.filter(course => 
    course.teacherId === queryParams.teacherId || 
    (course.teacherIds && course.teacherIds.includes(queryParams.teacherId))
  );
}
```

### Current Backend Implementation Status
Based on the summary provided:
- ✅ Course model includes `teacherIds` array
- ✅ `GET /api/v1/courses` accepts `teacherId` query parameter
- ❓ **NEEDS VERIFICATION**: Does the filter check BOTH `teacherId` and `teacherIds` when `?teacherId=username` is used?

### Testing Steps
1. Create a course with multiple teachers using `/api/v1/courses/:id/assign-teacher`
2. Verify `teacherIds` array is populated
3. Call `GET /api/v1/courses?teacherId=teacher1@example.com`
4. **Expected**: Course should be returned if teacher1 is in `teacherIds` array OR `teacherId` field
5. **Current**: If not returned, backend filter needs to be updated to check both fields

### Recommendation
If backend currently only checks `teacherId` field, update the filter to:
- Check `teacherId === queryParams.teacherId` OR
- Check if `queryParams.teacherId` is in `teacherIds` array

This ensures backward compatibility while supporting the new multiple teachers feature.
