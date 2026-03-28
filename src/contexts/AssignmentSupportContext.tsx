import { createContext, useContext, useState, ReactNode } from "react";

export type AssignmentSection = 
  | "course-info" 
  | "project" 
  | "task" 
  | "notification" 
  | "stakeholder" 
  | "progress"
  | "quiz";

interface AssignmentSupportContextType {
  isInAssignmentSupport: boolean;
  setIsInAssignmentSupport: (isIn: boolean) => void;
  activeSection: AssignmentSection;
  setActiveSection: (section: AssignmentSection) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedStakeholderId: string | null;
  setSelectedStakeholderId: (id: string | null) => void;
}

const AssignmentSupportContext = createContext<AssignmentSupportContextType | undefined>(undefined);

export function AssignmentSupportProvider({ children }: { children: ReactNode }) {
  const [isInAssignmentSupport, setIsInAssignmentSupport] = useState(false);
  const [activeSection, setActiveSection] = useState<AssignmentSection>("course-info");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedStakeholderId, setSelectedStakeholderId] = useState<string | null>(null);

  return (
    <AssignmentSupportContext.Provider
      value={{
        isInAssignmentSupport,
        setIsInAssignmentSupport,
        activeSection,
        setActiveSection,
        selectedProjectId,
        setSelectedProjectId,
        selectedTaskId,
        setSelectedTaskId,
        selectedStakeholderId,
        setSelectedStakeholderId,
      }}
    >
      {children}
    </AssignmentSupportContext.Provider>
  );
}

export function useAssignmentSupport() {
  const context = useContext(AssignmentSupportContext);
  if (context === undefined) {
    // Return default values instead of throwing to prevent crashes
    // This can happen during initial render or if provider is not set up correctly
    console.warn("useAssignmentSupport called outside AssignmentSupportProvider, using default values");
    return {
      isInAssignmentSupport: false,
      setIsInAssignmentSupport: () => {},
      activeSection: "course-info" as AssignmentSection,
      setActiveSection: () => {},
      selectedProjectId: null,
      setSelectedProjectId: () => {},
      selectedTaskId: null,
      setSelectedTaskId: () => {},
      selectedStakeholderId: null,
      setSelectedStakeholderId: () => {},
    };
  }
  return context;
}

