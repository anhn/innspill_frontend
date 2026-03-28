import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings as SettingsIcon, Sparkles, Shuffle, Settings, Upload, Users, TrendingUp, Award, GraduationCap, BookOpen, FileText, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useAssignmentSupport } from "@/contexts/AssignmentSupportContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logAction } from "@/utils/activityLogger";
import API_ENDPOINTS from "@/config/api";
import { ROLE_LABELS, ROLE_OPTIONS, ROLE_ROUTES, UserRole, getStoredRole, persistRole } from "@/constants/roles";
import { Sidebar, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";

// Component to show notification badge for Assignment Support
function AssignmentSupportNotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const userName = localStorage.getItem('ai4edu_user') || '';
        if (!userName) return;

              const response = await fetch(
          `${API_ENDPOINTS.notifications.getByStudent(userName)}?userName=${encodeURIComponent(userName)}`,
                {
                  method: 'GET',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                }
              );

              if (response.ok) {
                const result = await response.json();
                if (result.success) {
            // Backend already filters out read notifications, so result.data contains only unread
            setUnreadCount((result.data || []).length);
            }
        }
      } catch (error) {
        console.error('Error fetching unread notification count:', error);
      }
    };

    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (unreadCount === 0) return null;

  return (
    <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-xs">
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  );
}

export function AppSidebar() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState<UserRole>(() => getStoredRole());
  const { isInAssessment, activeSection, setActiveSection, selectedCourseId, setSelectedCourseId, courses, unreadNotificationCount: assessmentUnreadCount } = useAssessment();
  const { isInAssignmentSupport, activeSection: assignmentSection, setActiveSection: setAssignmentSection } = useAssignmentSupport();
  // Use unread count from Assessment context (which includes both backend and frontend notifications)
  // Removed duplicate fetching - Assessment module now handles all notification tracking
  const unreadNotificationCount = assessmentUnreadCount || 0;
  
  // Get current user
  const currentUser = (() => {
    try {
      return localStorage.getItem('ai4edu_user') || 'Guest';
    } catch {
      return 'Guest';
    }
  })();

  const handleLogout = async () => {
    try {
      // Log logout action
      await logAction({
        action: 'logout',
        endpoint: API_ENDPOINTS.auth.logout,
        method: 'POST',
        success: true,
        metadata: { reason: 'manual_logout' }
      });
      
      // Clear user data
      localStorage.removeItem('ai4edu_user');
      localStorage.removeItem('ai4edu_session_id');
      
      // Redirect to login
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear data and redirect even if logging fails
      localStorage.removeItem('ai4edu_user');
      localStorage.removeItem('ai4edu_session_id');
      navigate('/auth');
    }
  };
  const handleRoleSwitch = (role: UserRole) => {
    persistRole(role);
    setCurrentRole(role);
    const destination = ROLE_ROUTES[role] || "/ai-teacher";
    navigate(destination);
  };
  
  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="flex h-full flex-col justify-between">
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <button
            type="button"
            onClick={() => {
              // Dynamically navigate to the dashboard based on current user role
              const dashboardRoute = ROLE_ROUTES[currentRole] || ROLE_ROUTES.teacher;
              navigate(dashboardRoute);
            }}
            className="flex w-full items-center justify-between rounded-md border border-transparent px-2 py-1 text-left transition hover:border-sidebar-border"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-sidebar-foreground" />
              <div>
                <span className="text-lg font-semibold text-sidebar-foreground block">InnSpill.AI</span>
                <span className="text-xs text-sidebar-foreground/70">
                  {ROLE_LABELS[currentRole]} workspace
                </span>
              </div>
            </div>
          </button>
        </SidebarHeader>
        
        <div className="flex-1 overflow-y-auto">
          {isInAssessment ? (
            <div className="px-4 py-6 space-y-2">
              <h3 className="px-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-4">
                {t("nav.assessment.dashboard")}
              </h3>
              
              {/* Course Selection Dropdown */}
              <div className="mb-4 px-2">
                <label className="text-xs font-medium text-sidebar-foreground/70 mb-2 block">{t("nav.assessment.course")}</label>
                <Select 
                  value={selectedCourseId || (courses.length > 0 ? courses[0].id : "")} 
                  onValueChange={setSelectedCourseId}
                >
                  <SelectTrigger className="w-full h-8 bg-violet-50/60 border-violet-200/40 text-sm py-1.5 hover:bg-violet-50/80 transition-colors">
                    <SelectValue placeholder={t("nav.assessment.selectCourse")} />
                  </SelectTrigger>
                  <SelectContent className="bg-violet-50/95 border-violet-200/50">
                    {courses.map((course) => (
                      <SelectItem 
                        key={course.id} 
                        value={course.id}
                        className="text-sm py-1.5 hover:bg-violet-100/60 focus:bg-violet-100/60"
                      >
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {[
                { id: "setup" as const, label: t("nav.assessment.setup"), icon: Settings },
                { id: "submission" as const, label: t("nav.assessment.submission"), icon: Upload },
                { id: "stakeholders" as const, label: t("nav.assessment.stakeholders"), icon: Users },
                { id: "progress" as const, label: t("nav.assessment.progress"), icon: TrendingUp },
                { id: "quiz" as const, label: t("nav.assessment.quiz"), icon: Award },
                { id: "students" as const, label: t("nav.assessment.students"), icon: GraduationCap },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm relative ${
                      activeSection === item.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          ) : isInAssignmentSupport ? (
            <div className="px-4 py-6 space-y-2">
              <h3 className="px-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-4">
                {t("nav.assignment.dashboard")}
              </h3>
              {[
                { id: "course-info" as const, label: t("nav.assignment.courseInfo"), icon: BookOpen },
                { id: "project" as const, label: t("nav.assignment.project"), icon: FileText },
                { id: "stakeholder" as const, label: t("nav.assignment.stakeholder"), icon: Users },
                { id: "progress" as const, label: t("nav.assignment.progress"), icon: TrendingUp },
                { id: "quiz" as const, label: t("nav.assignment.quiz"), icon: Award },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setAssignmentSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm relative ${
                      assignmentSection === item.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.hasBadge && (
                      <AssignmentSupportNotificationBadge />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-6 text-sm text-sidebar-foreground/70">
              <p className="leading-relaxed">
                {t("nav.navigationDescription")}
              </p>
            </div>
          )}
        </div>
        
        <SidebarFooter className="border-t border-sidebar-border p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {currentUser.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {currentUser}
                </p>
                <Badge variant="secondary" className="mt-1">
                  {ROLE_LABELS[currentRole]}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="flex-1 justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent/50"
                onClick={handleSettings}
              >
                <SettingsIcon className="h-4 w-4" />
                {t("nav.settings")}
              </Button>
              <Button
                variant="ghost"
                className="flex-1 justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent/50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                {t("nav.logout")}
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
