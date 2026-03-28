import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { AssessmentProvider } from "@/contexts/AssessmentContext";
import { AssignmentSupportProvider } from "@/contexts/AssignmentSupportContext";
import { ManagementToolkitProvider } from "@/contexts/ManagementToolkitContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import Index from "./pages/Index";
import AITeacher from "./pages/AITeacher";
import AIResearcher from "./pages/AIResearcher";
import AIStudents from "./pages/AIStudents";
import AISchools from "./pages/AISchools";
import AICoach from "./pages/AICoach";
import ChatHistory from "./pages/ChatHistory";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AILiteracyCourse from "./pages/AILiteracyCourse";
import AssignmentSupport from "./pages/AssignmentSupport";
import Monitoring from "./pages/Monitoring";
import SchoolCourses from "./pages/SchoolCourses";
import ManagementToolkit from "./pages/ManagementToolkit";
import { getStoredRole, ROLE_ROUTES } from "@/constants/roles";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ChatProvider>
          <AssessmentProvider>
            <AssignmentSupportProvider>
              <ManagementToolkitProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <AppContent />
                </TooltipProvider>
              </ManagementToolkitProvider>
            </AssignmentSupportProvider>
          </AssessmentProvider>
        </ChatProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

// Guard to ensure only student accounts can access certain routes
const StudentOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const role = getStoredRole();
  if (role !== "student") {
    // Non-student users are redirected to their dashboard
    const destination = ROLE_ROUTES[role] || "/ai-teacher";
    return <Navigate to={destination} replace />;
  }
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Index />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-teacher"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <AITeacher />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-researcher"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <AIResearcher />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-students"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <AIStudents />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        {/* Student-only Assignment Support */}
        <Route
          path="/assignment-support"
          element={
            <ProtectedRoute>
              <StudentOnlyRoute>
                <AuthenticatedLayout>
                  <AssignmentSupport />
                </AuthenticatedLayout>
              </StudentOnlyRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-schools"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <AISchools />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-coach"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <AICoach />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat-history"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ChatHistory />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Settings />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        {/* AI Literacy mini course within authenticated layout */}
        <Route
          path="/ai-literacy"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <AILiteracyCourse />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/monitoring"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Monitoring />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/school-courses"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <SchoolCourses />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/management-toolkit"
          element={
            <ProtectedRoute>
              <StudentOnlyRoute>
                <AuthenticatedLayout>
                  <ManagementToolkit />
                </AuthenticatedLayout>
              </StudentOnlyRoute>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
};

export default App;