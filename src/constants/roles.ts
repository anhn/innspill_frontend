export type UserRole = "teacher" | "student" | "researcher" | "school";

export const ROLE_LABELS: Record<UserRole, string> = {
  teacher: "Teacher",
  student: "Student",
  researcher: "Researcher",
  school: "School",
};

export const ROLE_ROUTES: Record<UserRole, string> = {
  teacher: "/ai-teacher",
  student: "/ai-students",
  researcher: "/ai-researcher",
  school: "/ai-schools",
};

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "teacher", label: ROLE_LABELS.teacher },
  { value: "student", label: ROLE_LABELS.student },
  { value: "researcher", label: ROLE_LABELS.researcher },
  { value: "school", label: ROLE_LABELS.school },
];

export const getStoredRole = (): UserRole => {
  if (typeof window === "undefined") return "teacher";
  try {
    const stored = localStorage.getItem("ai4edu_role") as UserRole | null;
    if (stored && ROLE_ROUTES[stored]) {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return "teacher";
};

export const persistRole = (role: UserRole) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("ai4edu_role", role);
  } catch {
    /* ignore */
  }
};

