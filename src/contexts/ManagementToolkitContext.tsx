import { createContext, useContext, useState, ReactNode } from "react";

export type ManagementToolkitModule = 
  | "swot"
  | "planning-poker"
  | "sprint-goal"
  | "definition-of-done"
  | "team-working-agreement"
  | "retrospective-review"
  | "tuckman-evaluation";

interface ManagementToolkitContextType {
  activeModule: ManagementToolkitModule | null;
  setActiveModule: (module: ManagementToolkitModule | null) => void;
  setIsInManagementToolkit: (isIn: boolean) => void;
}

const ManagementToolkitContext = createContext<ManagementToolkitContextType | undefined>(undefined);

export function ManagementToolkitProvider({ children }: { children: ReactNode }) {
  const [activeModule, setActiveModule] = useState<ManagementToolkitModule | null>(null);
  const [isInManagementToolkit, setIsInManagementToolkit] = useState(false);

  return (
    <ManagementToolkitContext.Provider
      value={{
        activeModule,
        setActiveModule,
        setIsInManagementToolkit,
      }}
    >
      {children}
    </ManagementToolkitContext.Provider>
  );
}

export function useManagementToolkit() {
  const context = useContext(ManagementToolkitContext);
  if (context === undefined) {
    throw new Error("useManagementToolkit must be used within a ManagementToolkitProvider");
  }
  return context;
}
