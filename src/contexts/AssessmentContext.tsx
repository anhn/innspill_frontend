import { createContext, useContext, useState, ReactNode } from "react";

export type DashboardSection = "setup" | "submission" | "stakeholders" | "progress" | "quiz" | "students" | "notification";

interface AssessmentContextType {
  isInAssessment: boolean;
  activeSection: DashboardSection;
  setActiveSection: (section: DashboardSection) => void;
  setIsInAssessment: (inAssessment: boolean) => void;
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  courses: Array<{ id: string; name: string; code: string }>;
  setCourses: (courses: Array<{ id: string; name: string; code: string }>) => void;
  unreadNotificationCount: number;
  setUnreadNotificationCount: (count: number) => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [isInAssessment, setIsInAssessment] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>("setup");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [courses, setCourses] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  return (
    <AssessmentContext.Provider
      value={{
        isInAssessment,
        activeSection,
        setActiveSection,
        setIsInAssessment,
        selectedCourseId,
        setSelectedCourseId,
        courses,
        setCourses,
        unreadNotificationCount,
        setUnreadNotificationCount,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
}

