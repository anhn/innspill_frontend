import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash, RefreshCw, Link2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import API_ENDPOINTS from "@/config/api";

interface Course {
  id: string;
  name: string;
  code: string;
  academicYear?: string;
  university?: string;
  teacherId?: string;        // Keep for backward compatibility
  teacherIds?: string[];     // New field for multiple teachers
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  password?: string;
  date_created?: string;
  type: "teacher" | "student" | "admin" | "school";
  remark?: string;      // courseId mapping (raw id)
  courseId?: string;    // same as remark (backend convenience)
  courseName?: string;  // resolved course name from backend
}

export default function SchoolCourses() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState<Course>({
    id: "",
    name: "",
    code: "",
    academicYear: "",
    university: "",
    teacherId: "",
  });
  const [userForm, setUserForm] = useState<User>({
    id: "",
    username: "",
    email: "",
    fullName: "",
    password: "",
    type: "teacher",
    remark: "none",
  });
  const [filterUserType, setFilterUserType] = useState<"all" | "teacher" | "student">("all");
  const [filterCourseId, setFilterCourseId] = useState<string>("all");
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isAssignTeachersDialogOpen, setIsAssignTeachersDialogOpen] = useState(false);
  const [selectedCourseForTeachers, setSelectedCourseForTeachers] = useState<string>("");
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [assigningTeachers, setAssigningTeachers] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const typeOk = filterUserType === "all" || u.type === filterUserType;
      const courseOk = filterCourseId === "all" || u.remark === filterCourseId;
      return typeOk && courseOk;
    });
  }, [users, filterUserType, filterCourseId]);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch(API_ENDPOINTS.courses.list, { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to load courses");
      const items: Course[] = data?.data || [];
      setCourses(Array.isArray(items) ? items : []);
    } catch (err) {
      setCourses([]);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      if (filterUserType !== "all") params.append("type", filterUserType);
      if (filterCourseId !== "all") params.append("courseId", filterCourseId);
      const url = `${API_ENDPOINTS.users?.list || "/api/v1/users"}${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to load users");
      const items: User[] = data?.data || [];
      setUsers(Array.isArray(items) ? items : []);
    } catch (err) {
      setUsers([]);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [filterUserType, filterCourseId]);

  const resetCourseForm = () => {
    setSelectedCourse(null);
    setCourseForm({
      id: "",
      name: "",
      code: "",
      academicYear: "",
      university: "",
      teacherId: "",
    });
  };

  const resetUserForm = () => {
    setUserForm({
      id: "",
      username: "",
      email: "",
      fullName: "",
      password: "",
      type: "teacher",
      remark: "none",
    });
  };

  const handleSaveCourse = async () => {
    setSavingCourse(true);
    try {
      const payload: any = {
        name: courseForm.name,
      };
      if (courseForm.code) payload.code = courseForm.code;
      if (courseForm.academicYear) payload.academicYear = courseForm.academicYear;
      if (courseForm.university) payload.university = courseForm.university;
      if (courseForm.teacherId) payload.teacherId = courseForm.teacherId;
      
      const isEdit = Boolean(selectedCourse?.id);
      const url = isEdit ? `${API_ENDPOINTS.courses.list}/${selectedCourse?.id}` : API_ENDPOINTS.courses.list;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const expectedStatus = isEdit ? 200 : 201;
      if (res.status !== expectedStatus || !data?.success) throw new Error(data?.message || "Failed to save course");
      toast({ title: "Saved", description: isEdit ? "Course updated" : "Course created" });
      resetCourseForm();
      fetchCourses();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save course",
        variant: "destructive",
      });
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.courses.list}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.status !== 200 || !data?.success) throw new Error(data?.message || "Failed to delete course");
      toast({ title: "Deleted", description: data?.message || "Course removed" });
      fetchCourses();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  const handleSaveUser = async () => {
    setSavingUser(true);
    try {
      const isEdit = Boolean(userForm.id);
      
      // Store course assignment info before resetting form
      const courseIdToAssign = userForm.remark && userForm.remark !== "none" ? userForm.remark : null;
      const userIdToUpdate = userForm.id;
      
      const payload: any = {
        username: userForm.username,
        email: userForm.email,
        type: userForm.type,
      };
      if (userForm.fullName) payload.fullName = userForm.fullName;
      
      // Don't send remark in update payload - course assignment should be done via assign-course endpoint
      // Only include remark for new users (create)
      if (!isEdit && userForm.remark && userForm.remark !== "none") {
        payload.remark = userForm.remark;
      }
      
      // Password is required for create, optional for update
      if (!isEdit) {
        if (!userForm.password || userForm.password.length < 6) {
          throw new Error("Password is required and must be at least 6 characters");
        }
        payload.password = userForm.password;
      } else if (userForm.password && userForm.password.length >= 6) {
        payload.password = userForm.password;
      }
      
      const url = isEdit
        ? `${API_ENDPOINTS.users?.list || "/api/v1/users"}/${userForm.id}`
        : API_ENDPOINTS.users?.list || "/api/v1/users";
      
      console.log('[SchoolCourses] Saving user:', { isEdit, url, payload });
      
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const expectedStatus = isEdit ? 200 : 201;
      
      if (res.status !== expectedStatus || !data?.success) {
        console.error('[SchoolCourses] User save failed:', {
          status: res.status,
          statusText: res.statusText,
          url: url,
          payload: payload,
          error: data
        });
        throw new Error(data?.message || "Failed to save user");
      }
      
      // After successful user update/create, handle course assignment separately if needed
      if (isEdit && userIdToUpdate && courseIdToAssign && userForm.type === "student") {
        // Assign course using the assign-course endpoint
        try {
          const assignRes = await fetch(`${API_ENDPOINTS.users?.list || "/api/v1/users"}/${userIdToUpdate}/assign-course`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ courseId: courseIdToAssign }),
          });
          const assignData = await assignRes.json();
          if (assignRes.status !== 200 || !assignData?.success) {
            console.warn('[SchoolCourses] User updated but course assignment failed:', assignData);
            toast({
              title: "Warning",
              description: "User updated but course assignment failed. Please assign the course manually.",
              variant: "default",
            });
          }
        } catch (assignErr) {
          console.error('[SchoolCourses] Error assigning course after user update:', assignErr);
          toast({
            title: "Warning",
            description: "User updated but course assignment failed. Please assign the course manually.",
            variant: "default",
          });
        }
      }
      
      toast({ title: "Saved", description: isEdit ? "User updated" : "User created" });
      resetUserForm();
      fetchUsers();
    } catch (err) {
      console.error('[SchoolCourses] Error saving user:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save user",
        variant: "destructive",
      });
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (id: string, userType?: string) => {
    try {
      // Clean the ID - remove any trailing characters after colon or invalid characters
      const cleanId = id.split(':')[0].trim();
      
      // Validate ID format (MongoDB ObjectId format - 24 hex characters)
      if (!/^[0-9a-fA-F]{24}$/.test(cleanId)) {
        toast({
          title: "Error",
          description: "Invalid user ID format",
          variant: "destructive",
        });
        console.error('[SchoolCourses] Invalid user ID:', id);
        return;
      }

      // Use students endpoint if it's a student, otherwise use users endpoint
      const isStudent = userType === "student";
      const endpoint = isStudent
        ? (API_ENDPOINTS.students?.delete?.(cleanId) || `${API_ENDPOINTS.students?.list || "/api/v1/students"}/${cleanId}`)
        : `${API_ENDPOINTS.users?.list || "/api/v1/users"}/${cleanId}`;
      
      console.log('[SchoolCourses] Deleting user:', { id, cleanId, endpoint, userType, isStudent });
      
      const res = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
      });
      
      // Handle non-JSON responses
      let data;
      try {
        data = await res.json();
      } catch (e) {
        const text = await res.text();
        throw new Error(`Server error (${res.status}): ${text || res.statusText}`);
      }
      
      if (res.status !== 200 || !data?.success) {
        throw new Error(data?.message || `Failed to delete ${isStudent ? 'student' : 'user'}: ${res.status} ${res.statusText}`);
      }
      
      toast({ 
        title: "Deleted", 
        description: data?.message || `${isStudent ? 'Student' : 'User'} removed successfully` 
      });
      fetchUsers();
    } catch (err) {
      console.error('[SchoolCourses] Delete user error:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleAssignCourse = async (userId: string, courseId: string | null) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.users?.list || "/api/v1/users"}/${userId}/assign-course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ courseId: courseId || null }),
      });
      const data = await res.json();
      if (res.status !== 200 || !data?.success) throw new Error(data?.message || "Failed to assign course");
      toast({ title: "Updated", description: courseId ? "Course assigned" : "Course unassigned" });
      fetchUsers();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to assign course",
        variant: "destructive",
      });
    }
  };

  const handleAssignTeachersToCourse = async () => {
    if (!selectedCourseForTeachers) {
      toast({
        title: "Error",
        description: "Please select a course",
        variant: "destructive",
      });
      return;
    }
    if (selectedTeacherIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one teacher",
        variant: "destructive",
      });
      return;
    }

    setAssigningTeachers(true);
    try {
      // Get all teachers from users list to get usernames/IDs
      const teacherList = users.filter(u => u.type === "teacher");
      
      // Assign each selected teacher to the course using the new course endpoint
      const assignmentPromises = selectedTeacherIds.map(teacherId => {
        const teacher = teacherList.find(t => t.id === teacherId);
        if (!teacher) return Promise.resolve({ success: false });
        
        // Use teacher username or email as teacherId for the API
        const teacherIdentifier = teacher.username || teacher.email || teacherId;
        
        return fetch(API_ENDPOINTS.courses.assignTeacher(selectedCourseForTeachers), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ teacherId: teacherIdentifier }),
        }).then(res => res.json());
      });

      const results = await Promise.all(assignmentPromises);
      const failures = results.filter(r => r && !r.success);
      
      if (failures.length > 0) {
        toast({
          title: "Partial Success",
          description: `${selectedTeacherIds.length - failures.length} teacher(s) assigned. ${failures.length} failed.`,
          variant: "default",
        });
      } else {
        toast({ 
          title: "Success", 
          description: `${selectedTeacherIds.length} teacher(s) assigned to course` 
        });
      }

      // Reset form and close dialog
      setSelectedCourseForTeachers("");
      setSelectedTeacherIds([]);
      setIsAssignTeachersDialogOpen(false);
      fetchCourses(); // Refresh courses to get updated teacherIds
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to assign teachers to course",
        variant: "destructive",
      });
    } finally {
      setAssigningTeachers(false);
    }
  };

  const teachers = useMemo(() => {
    return users.filter(u => u.type === "teacher");
  }, [users]);

  const handleRemoveTeacherFromCourse = async (courseId: string, teacherId: string) => {
    try {
      const res = await fetch(API_ENDPOINTS.courses.removeTeacher(courseId), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ teacherId }),
      });
      const data = await res.json();
      if (res.status !== 200 || !data?.success) {
        throw new Error(data?.message || "Failed to remove teacher");
      }
      toast({ title: "Removed", description: "Teacher removed from course" });
      fetchCourses();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to remove teacher",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Courses</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchCourses} disabled={loadingCourses}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isAssignTeachersDialogOpen} onOpenChange={setIsAssignTeachersDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Add Teachers to Course
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Assign Teachers to Course</DialogTitle>
                  <DialogDescription>
                    Select a course and choose teachers to assign to it.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select
                      value={selectedCourseForTeachers}
                      onValueChange={(value) => {
                        setSelectedCourseForTeachers(value);
                        setSelectedTeacherIds([]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.code} - {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Select Teachers</Label>
                    <div className="max-h-[300px] overflow-y-auto border rounded-md p-3 space-y-2">
                      {teachers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No teachers found. Please create teachers first.</p>
                      ) : (
                        teachers.map((teacher) => (
                          <div key={teacher.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`teacher-${teacher.id}`}
                              checked={selectedTeacherIds.includes(teacher.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTeacherIds([...selectedTeacherIds, teacher.id]);
                                } else {
                                  setSelectedTeacherIds(selectedTeacherIds.filter(id => id !== teacher.id));
                                }
                              }}
                            />
                            <label
                              htmlFor={`teacher-${teacher.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {teacher.fullName || teacher.username} ({teacher.email})
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    {selectedTeacherIds.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {selectedTeacherIds.length} teacher(s) selected
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCourseForTeachers("");
                      setSelectedTeacherIds([]);
                      setIsAssignTeachersDialogOpen(false);
                    }}
                    disabled={assigningTeachers}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignTeachersToCourse}
                    disabled={assigningTeachers || !selectedCourseForTeachers || selectedTeacherIds.length === 0}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {assigningTeachers ? "Assigning..." : `Assign ${selectedTeacherIds.length} Teacher(s)`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button size="sm" onClick={resetCourseForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Course Name</Label>
              <Input
                value={courseForm.name}
                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                placeholder="Advanced Software Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label>Course Code</Label>
              <Input
                value={courseForm.code}
                onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                placeholder="TDT4242"
              />
            </div>
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Input
                value={courseForm.academicYear || ""}
                onChange={(e) => setCourseForm({ ...courseForm, academicYear: e.target.value })}
                placeholder="2025-2026"
              />
            </div>
            <div className="space-y-2">
              <Label>University</Label>
              <Input
                value={courseForm.university || ""}
                onChange={(e) => setCourseForm({ ...courseForm, university: e.target.value })}
                placeholder="NTNU"
              />
            </div>
            <div className="space-y-2">
              <Label>Teacher Username</Label>
              <Input
                value={courseForm.teacherId || ""}
                onChange={(e) => setCourseForm({ ...courseForm, teacherId: e.target.value })}
                placeholder="teacher@example.com"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveCourse} disabled={savingCourse}>
              <Link2 className="h-4 w-4 mr-2" />
              {selectedCourse ? "Update Course" : "Create Course"}
            </Button>
            {selectedCourse && (
              <Button variant="outline" onClick={resetCourseForm}>
                Cancel
              </Button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Teacher</th>
                  <th className="text-left p-2">Academic Year</th>
                  <th className="text-left p-2">University</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-t">
                    <td className="p-2">{course.name}</td>
                    <td className="p-2">{course.code}</td>
                    <td className="p-2">
                      <div className="space-y-1">
                        {course.teacherIds && course.teacherIds.length > 0 ? (
                          course.teacherIds.map((teacherId, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <span>{teacherId}</span>
                              {course.teacherIds && course.teacherIds.length > 1 && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-5 w-5"
                                  onClick={() => handleRemoveTeacherFromCourse(course.id, teacherId)}
                                  title="Remove teacher"
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))
                        ) : (
                          <span>{course.teacherId || "-"}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-2">{course.academicYear || "-"}</td>
                    <td className="p-2">{course.university || "-"}</td>
                    <td className="p-2 flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedCourse(course);
                          setCourseForm({
                            id: course.id,
                            name: course.name,
                            code: course.code,
                            academicYear: course.academicYear || "",
                            university: course.university || "",
                            teacherId: course.teacherId || "",
                          });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteCourse(course.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {!courses.length && (
                  <tr>
                    <td className="p-2 text-muted-foreground" colSpan={6}>
                      {loadingCourses ? "Loading courses..." : "No courses found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users</CardTitle>
          <div className="flex gap-2">
            <Select value={filterUserType} onValueChange={(v: "all" | "teacher" | "student") => setFilterUserType(v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCourseId} onValueChange={setFilterCourseId}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loadingUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => {
                    resetUserForm();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{userForm.id ? "Edit User" : "Create New User"}</DialogTitle>
                  <DialogDescription>
                    {userForm.id
                      ? "Update the details of this user."
                      : "Fill in the details to create a new user."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-4 py-2">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={userForm.fullName || ""}
                      onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={userForm.password || ""}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder={userForm.id ? "Leave blank to keep" : "Set password"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={userForm.type}
                      onValueChange={(v: "teacher" | "student" | "admin" | "school") =>
                        setUserForm({ ...userForm, type: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Course (remark)</Label>
                    <Select
                      value={userForm.remark || "none"}
                      onValueChange={(v) => setUserForm({ ...userForm, remark: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Assign course (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.code} - {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetUserForm();
                      setIsUserDialogOpen(false);
                    }}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      await handleSaveUser();
                      // If successful, handleSaveUser will reset form and reload; we close dialog here
                      setIsUserDialogOpen(false);
                    }}
                    disabled={savingUser}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    {userForm.id ? "Update User" : "Create User"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2">Username</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Course (remark)</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-2">{u.username}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.fullName || "-"}</td>
                    <td className="p-2 capitalize">{u.type}</td>
                    <td className="p-2">
                      {u.courseName
                        ? u.courseName
                        : u.remark
                          ? courses.find((c) => c.id === u.remark)?.name || u.remark
                          : "Unassigned"}
                    </td>
                    <td className="p-2 flex flex-wrap gap-2">
                      <Select
                    value={u.remark || "none"}
                    onValueChange={(v) => handleAssignCourse(u.id, v === "none" ? null : v)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Assign course" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {courses.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setUserForm({
                            id: u.id,
                            username: u.username,
                            email: u.email,
                            fullName: u.fullName,
                            password: "",
                            type: u.type,
                            remark: u.remark || "none",
                          });
                          setIsUserDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteUser(u.id, u.type)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {!filteredUsers.length && (
                  <tr>
                    <td className="p-2 text-muted-foreground" colSpan={6}>
                      {loadingUsers ? "Loading users..." : "No users found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

