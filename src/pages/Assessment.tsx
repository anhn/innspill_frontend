import { useState, useEffect, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAssessment, DashboardSection } from "@/contexts/AssessmentContext";
import { 
  ClipboardCheck, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ArrowLeft, 
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Save, 
  X,
  Settings,
  Upload,
  Users,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  MessageSquare,
  Star,
  Download,
  Sparkles,
  UserCircle,
  File,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Paperclip,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import API_ENDPOINTS from "@/config/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, BarChart, Bar, ComposedChart } from "recharts";
import { Boxplot } from "@/components/Boxplot";

interface Course {
  id: string;
  name: string;
  code: string;
  academicYear: string;
  university: string;
  teacherId?: string;        // Keep for backward compatibility
  teacherIds?: string[];     // New field for multiple teachers
}

interface Project {
  id: string;
  courseId: string;
  // Backend now provides projectTitle; keep optional title for backward compatibility
  projectTitle?: string;
  title?: string;
  courseDescription: string;
  learningOutcome: string;
  keyMilestones: string;
  attachments: string[];
  availableStakeholders: string[];
  [key: string]: any; // For other information
}

interface Task {
  id: string;
  projectId: string;
  taskTitle?: string;
  description: string;
  keyword: string;
  submissionDeadline: string;
  evaluationCriteria: string;
  outcome?: string;
  instruction?: string;
  enabledAIGuideline: boolean;
  lockOnSubmissionQuestion: boolean;
  lockOnFeedbackReceivedQuestion: boolean;
  submissionQuestion?: string;
  feedbackReceivedQuestion?: string;
  submissionQuestionTimer?: number; // in minutes
  feedbackReceivedQuestionTimer?: number; // in minutes
  attachments: string[];
  status?: 'published' | 'unpublished'; // Default: 'unpublished' (per backend)
  [key: string]: any; // For other required information
}

interface Role {
  id: string;
  projectId: string;
  avatarImage?: string;
  name: string;
  persona: string;
  attachments: string[];
  status?: "active" | "inactive";
}

interface Quiz {
  id: string;
  projectId: string;
  name?: string; // Quiz name, default: "Project Knowledge Quiz"
  questions: QuizQuestion[];
  history: QuizVersion[];
  createdAt: string;
  updatedAt: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizVersion {
  id: string;
  questions: QuizQuestion[];
  createdAt: string;
  updatedBy: string;
}

interface SubmissionQuestionAnswer {
  answer: string;
  datetime: string;
}

interface FeedbackReceivedQuestionAnswer {
  agreement: boolean;
  comment?: string;
  datetime: string;
}

interface FeedbackHistoryEntry {
  feedback: string;
  feedforward?: string;
  concept?: string;
  reflection?: string;
  criticalThinking?: string;
  taskQualityScore?: number | "not applicable";
  reflectionScore?: number;
  criticalthinkingScore?: number;
  conceptMasteryScore?: number;
  starScore?: number; // Backward compatibility
  stakeholderId?: string;
  datetime: string;
  createdAt?: string;
}

interface StarScoreHistoryEntry {
  score: number;
  datetime: string;
}

interface Submission {
  id: string;
  taskId: string;
  studentId: string;
  studentName: string;
  datetime: string;
  attemptNumber: number;
  submission: string;
  conversationLog: string;
  attachments?: string[]; // Attachments are now included in all submission responses
  // New array properties
  submissionQuestionAnswers?: SubmissionQuestionAnswer[];
  feedbackReceivedQuestionAnswers?: FeedbackReceivedQuestionAnswer[];
  feedbackHistory?: FeedbackHistoryEntry[];
  starScoreHistory?: StarScoreHistoryEntry[];
  // Backward compatibility - latest values
  starScore?: number; // Deprecated, use taskQualityScore
  feedback?: string;
  feedforward?: string;
  concept?: string;
  reflection?: string;
  criticalThinking?: string;
  taskQualityScore?: number | "not applicable";
  reflectionScore?: number;
  criticalthinkingScore?: number;
  conceptMasteryScore?: number;
  stakeholderId?: string;
  // Legacy fields (for backward compatibility)
  feedbackAgreement?: boolean;
  feedbackComment?: string;
}

interface Student {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  password?: string; // Only for creation, not returned from API
  date_created?: string;
  type: 'teacher' | 'student' | 'admin';
  remark?: string;
  course?: string; // Course ID
  group?: string;
  [key: string]: any;
}

interface StudentGroup {
  id: string;
  courseId: string;
  projectId?: string;
  name: string;
  description?: string;
  studentIds: string[];
  studentNames?: string[]; // Resolved student names
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
}

interface AssessmentProps {
  teacherInfo: {
    educationLevel: string;
    subjectArea: string;
    country: string;
    academicYear: string;
    organization: string;
  };
  onBack?: () => void;
}

// Helper to truncate long text by word count
const truncateWords = (text: string, maxWords = 100) => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};

export default function Assessment({ teacherInfo, onBack }: AssessmentProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { activeSection, setIsInAssessment, selectedCourseId, setSelectedCourseId, courses: contextCourses, setCourses: setCoursesContext, setUnreadNotificationCount } = useAssessment();
  const [courses, setCourses] = useState<Course[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  
  // View type states for grouped views
  const [submissionViewType, setSubmissionViewType] = useState<"individual" | "group">("individual");
  const [stakeholderViewType, setStakeholderViewType] = useState<"individual" | "group">("individual");
  const [progressViewType, setProgressViewType] = useState<"student" | "group">("student");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [previousSubmissions, setPreviousSubmissions] = useState<Submission[]>([]);
  const [previousQuizSubmissions, setPreviousQuizSubmissions] = useState<Set<string>>(new Set());
  const [previousConversations, setPreviousConversations] = useState<{ [key: string]: number }>({}); // Track conversation counts per student-stakeholder pair
  
  // Setup section states
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Submission section states
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedStakeholderId, setSelectedStakeholderId] = useState<string>("");
  
  // Progress section states
  const [selectedStudentForProgress, setSelectedStudentForProgress] = useState<string>("");
  
  // Quiz section states
  const [selectedStudentForQuiz, setSelectedStudentForQuiz] = useState<string>("");
  
  // Form states
  const [projectFormData, setProjectFormData] = useState({
    projectTitle: "",
    courseDescription: "",
    learningOutcome: "",
    keyMilestones: "",
    attachments: [] as string[],
    availableStakeholders: [] as string[],
  });
  
  const [taskFormData, setTaskFormData] = useState({
    taskTitle: "",
    description: "",
    keyword: "",
    submissionDeadline: "",
    evaluationCriteria: "",
    outcome: "",
    instruction: "",
    enabledAIGuideline: false,
    lockOnSubmissionQuestion: false,
    lockOnFeedbackReceivedQuestion: false,
    submissionQuestion: "",
    feedbackReceivedQuestion: "",
    submissionQuestionTimer: 5,
    feedbackReceivedQuestionTimer: 5,
    attachments: [] as string[],
    status: 'unpublished' as 'published' | 'unpublished', // Default: 'unpublished' (per backend)
  });
  
  const [roleFormData, setRoleFormData] = useState({
    avatarImage: "",
    name: "",
    persona: "",
    attachments: [] as string[],
    status: "active" as "active" | "inactive",
  });
  
  const [studentFormData, setStudentFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    type: "student" as 'teacher' | 'student' | 'admin',
    remark: "", // This will store the course ID
  });
  
  // Set assessment context when component mounts/unmounts
  useEffect(() => {
    setIsInAssessment(true);
    return () => {
      setIsInAssessment(false);
    };
  }, [setIsInAssessment]);

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, [teacherInfo]);

  // Auto-select first course when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      const firstCourseId = courses[0].id;
      setSelectedCourseId(firstCourseId);
    }
  }, [courses]);

  // Fetch students when course is selected
  useEffect(() => {
    if (selectedCourseId) {
      fetchStudents(selectedCourseId);
      fetchGroups(selectedCourseId);
    } else {
      setStudents([]); // Clear students if no course is selected
      setGroups([]); // Clear groups if no course is selected
    }
  }, [selectedCourseId]);

  // Fetch projects when course is selected
  useEffect(() => {
    if (selectedCourseId) {
      fetchProjects();
    } else {
      setProjects([]);
    }
    // Reset all sub-selections when course changes
    setSelectedProjectId("");
    setSelectedTaskId("");
    setSelectedStakeholderId("");
    setSelectedStudentForProgress("");
    setSelectedStudentForQuiz("");
    setSubmissions([]);
  }, [selectedCourseId]);

  // Fetch tasks when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      fetchTasks();
    } else {
      setTasks([]);
    }
    // Reset sub-selections when project changes
    setSelectedTaskId("");
    setSelectedStakeholderId("");
    setSelectedStudentForQuiz("");
  }, [selectedProjectId]);

  // Fetch roles when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      fetchRoles();
    } else {
      setRoles([]);
    }
  }, [selectedProjectId]);

  // Fetch quizzes when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      fetchQuizzes();
    } else {
      setQuizzes([]);
    }
  }, [selectedProjectId]);

  // Submissions are now loaded manually via UI actions (no automatic fetch here)

  // Function to detect new conversations and create notifications (batch)
  const detectNewConversations = useCallback(async () => {
    if (!selectedProjectId || roles.length === 0 || students.length === 0) return;

    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      const course = courses.find(c => c.id === selectedCourseId);

      const pairs = roles.flatMap(role =>
        students.map(student => ({
          studentId: typeof student === 'string' ? student : student.username || student.id,
          stakeholderId: role.id,
          stakeholderName: role.name,
        }))
      );

      const MAX_PAIRS = 20;
      const limitedPairs = pairs.slice(0, MAX_PAIRS);
      if (limitedPairs.length === 0) return;

      const response = await fetch(
        `${API_ENDPOINTS.chatMessages.batch}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ pairs: limitedPairs.map(({ studentId, stakeholderId }) => ({ studentId, stakeholderId })) }),
        }
      );

      if (response.status === 429) {
        toast({
          title: "Rate Limit Reached",
          description: "Too many requests. Please wait a few minutes before refreshing.",
          variant: "destructive",
        });
        return;
      }

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const newNotifications: Notification[] = [];
          const latestCounts: Record<string, number> = {};

          result.data.forEach((entry: any) => {
            const studentId = entry.studentId || entry.student || entry.username;
            const stakeholderId = entry.stakeholderId || entry.roleId || entry.stakeholder;
            const messages = entry.messages || entry.chatItems || entry.data || [];
            if (!studentId || !stakeholderId) return;

            const key = `${studentId}-${stakeholderId}`;
            const currentCount = Array.isArray(messages) ? messages.length : 0;
            const previousCount = previousConversations[key] || 0;
            latestCounts[key] = currentCount;

            if (currentCount > previousCount) {
              const studentInfo = students.find(s => (typeof s === 'string' ? s === studentId : (s.username || s.id) === studentId));
              const studentName = typeof studentInfo === 'string'
                ? studentInfo
                : studentInfo?.fullName || studentInfo?.username || studentId;
              const stakeholderName =
                entry.stakeholderName ||
                entry.roleName ||
                limitedPairs.find(p => p.studentId === studentId && p.stakeholderId === stakeholderId)?.stakeholderName ||
                stakeholderId;

              newNotifications.push({
                id: `conversation-${key}-${Date.now()}`,
                type: 'conversation' as const,
                courseCode: course?.code || '',
                studentUsername: studentId,
                datetime: new Date().toISOString(),
                read: false,
                message: `New conversation between ${studentName} and ${stakeholderName}`,
              });
            }
          });

          if (Object.keys(latestCounts).length > 0) {
            setPreviousConversations(prev => ({ ...prev, ...latestCounts }));
          }

          if (newNotifications.length > 0) {
            setNotifications(prev => {
              const existingIds = new Set(prev.map(n => n.id));
              const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
              return [...uniqueNew, ...prev].slice(0, 100);
            });
          }
        }
      }
    } catch (error) {
      // Error handling
    }
  }, [selectedProjectId, roles, students, courses, selectedCourseId, previousConversations, toast]);

  // Function to detect quiz completions
  const detectQuizCompletions = useCallback(async () => {
    if (!selectedProjectId || quizzes.length === 0 || students.length === 0) return;

    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      const course = courses.find(c => c.id === selectedCourseId);
      const newNotifications: Notification[] = [];

      // Add delay between quiz checks
      for (let i = 0; i < quizzes.length; i++) {
        const quiz = quizzes[i];
        
        // Add delay between requests (except for first one)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        try {
          // Fetch leaderboard to get completed quiz submissions
          const response = await fetch(
            `${API_ENDPOINTS.quizSubmissions.getLeaderboard(quiz.id)}?userName=${encodeURIComponent(userName)}&limit=100`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            }
          );

          // Handle 429 errors
          if (response.status === 429) {
            toast({
              title: "Rate Limit Reached",
              description: "Too many requests. Please wait a few minutes before refreshing.",
              variant: "destructive",
            });
            break; // Stop processing to avoid more 429s
          }

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              const submissions = result.data || [];
              
              // Check for new quiz completions
              submissions.forEach((submission: any) => {
                const studentId = submission.studentId || submission.student?.username || submission.student?.id;
                if (!studentId) return;
                
                const submissionKey = `${quiz.id}-${studentId}`;
                if (!previousQuizSubmissions.has(submissionKey) && submission.score !== undefined) {
                  // New quiz completion detected
                  const studentName = submission.studentName || submission.student?.fullName || submission.student?.username || studentId;
                  newNotifications.push({
                    id: `quiz-${submissionKey}-${Date.now()}`,
                    type: 'quiz' as const,
                    courseCode: course?.code || '',
                    studentUsername: studentId,
                    datetime: submission.completedAt || submission.datetime || new Date().toISOString(),
                    read: false,
                    message: `${studentName} completed quiz "${quiz.name || 'Quiz'}" with score ${submission.score}%`,
                  });

                  // Add to previous set
                  setPreviousQuizSubmissions(prev => new Set([...prev, submissionKey]));
                }
              });
            }
          }
        } catch (error) {
        }
      }

      if (newNotifications.length > 0) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
          return [...uniqueNew, ...prev].slice(0, 100);
        });
      }
    } catch (error) {
    }
  }, [selectedProjectId, quizzes, students, courses, selectedCourseId, previousQuizSubmissions]);

  // Manual refresh functions for conversations and quiz completions
  const [isRefreshingNotifications, setIsRefreshingNotifications] = useState(false);
  
  const handleRefreshNotifications = async () => {
    if (isRefreshingNotifications) return;
    setIsRefreshingNotifications(true);
    try {
      await Promise.all([
        detectNewConversations(),
        detectQuizCompletions()
      ]);
      toast({
        title: "Success",
        description: "Notifications refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh notifications",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingNotifications(false);
    }
  };

  // Update unread notification count in context
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    setUnreadNotificationCount(unreadCount);
  }, [notifications, setUnreadNotificationCount]);

  // Auto-select project when projects are loaded
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    } else if (projects.length === 0) {
      setSelectedProjectId("");
    }
  }, [projects]);

  const fetchCourses = async () => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      
      // Note: Backend should filter courses where teacherId === userName OR userName is in teacherIds array
      // The ?teacherId=username query parameter should check both teacherId and teacherIds fields
      const url = `${API_ENDPOINTS.courses?.list || '/api/v1/courses'}?teacherId=${encodeURIComponent(userName)}`;
      
      const response = await fetch(url, {
            method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache', // Prevent caching to ensure fresh data
          'Pragma': 'no-cache',
        },
          credentials: 'include',
      });

      if (!response.ok && response.status !== 304) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch courses' }));
        throw new Error(errorData.message || `Failed to fetch courses: ${response.statusText}`);
      }

      // Parse response - for 304, browser should provide cached body
      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : { data: [] };
      } catch (e) {
        // If parsing fails (e.g., empty 304 response), try fresh request
        if (response.status === 304) {
          const freshUrl = `${API_ENDPOINTS.courses?.list || '/api/v1/courses'}?teacherId=${encodeURIComponent(userName)}&_t=${Date.now()}`;
          const freshResponse = await fetch(freshUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          data = await freshResponse.json();
        } else {
          throw new Error('Failed to parse courses response');
        }
      }
      
          const fetchedCourses = data.data || data || [];
      
      if (Array.isArray(fetchedCourses)) {
            setCourses(fetchedCourses);
            setCoursesContext(fetchedCourses.map(c => ({ id: c.id, name: c.name, code: c.code })));
        
        if (fetchedCourses.length === 0) {
          toast({
            title: "No Courses",
            description: "No courses found for this teacher. Please check if courses are assigned to this teacher.",
            variant: "default",
          });
        }
      } else {
        setCourses([]);
        setCoursesContext([]);
        toast({
          title: "Error",
          description: "Invalid courses data format received",
          variant: "destructive",
        });
      }
    } catch (error) {
      setCourses([]);
      setCoursesContext([]);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load courses",
        variant: "destructive",
      });
    }
  };

  const fetchProjects = async () => {
    try {
      if (!selectedCourseId) {
        setProjects([]);
        return;
      }

      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      
      // Fetch project for the selected course
      const response = await fetch(
        `${API_ENDPOINTS.projects.getByCourse(selectedCourseId)}?userName=${encodeURIComponent(userName)}`,
        {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // API returns a single project or null (each course has one project)
          const projectData = result.data;
          if (projectData) {
            setProjects([projectData]);
      } else {
            setProjects([]);
          }
        } else {
          setProjects([]);
        }
      } else {
        setProjects([]);
      }
    } catch (error) {
      setProjects([]);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    }
  };

  const fetchTasks = async () => {
    try {
      if (!selectedProjectId) {
        setTasks([]);
        return;
      }

      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      
      const response = await fetch(
        `${API_ENDPOINTS.assessmentTasks.getByProject(selectedProjectId)}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const fetchedTasks = result.data || [];
          setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
        } else {
          setTasks([]);
        }
      } else {
        setTasks([]);
      }
    } catch (error) {
      setTasks([]);
    }
  };

  const fetchRoles = async () => {
    try {
      if (!selectedProjectId) {
        setRoles([]);
        return;
      }

      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      
      const response = await fetch(
        `${API_ENDPOINTS.assessmentRoles.getByProject(selectedProjectId)}?userName=${encodeURIComponent(userName)}`,
        {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const fetchedRoles = result.data || [];
          setRoles(Array.isArray(fetchedRoles) ? fetchedRoles : []);
      } else {
          setRoles([]);
        }
      } else {
        setRoles([]);
      }
    } catch (error) {
      setRoles([]);
    }
  };

  const fetchQuizzes = async () => {
    try {
      if (!selectedProjectId) {
        setQuizzes([]);
      return;
    }

      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      
      const response = await fetch(
        `${API_ENDPOINTS.assessmentQuizzes.getByProject(selectedProjectId)}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const fetchedQuizzes = result.data || [];
          setQuizzes(Array.isArray(fetchedQuizzes) ? fetchedQuizzes : []);
        } else {
          setQuizzes([]);
        }
      } else {
        setQuizzes([]);
      }
    } catch (error) {
      setQuizzes([]);
    }
  };

  const fetchSubmissions = useCallback(async () => {
    try {
      if (!selectedProjectId || tasks.length === 0) {
        setSubmissions([]);
        setPreviousSubmissions([]);
        return;
      }

      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      
      // Collect all task IDs (limit to 20 per batch endpoint requirement)
      const taskIds = tasks.map(task => task.id).filter(Boolean);
      const MAX_BATCH_TASKS = 20;
      const limitedTaskIds = taskIds.slice(0, MAX_BATCH_TASKS);
      
      if (limitedTaskIds.length === 0) {
        setSubmissions([]);
        setPreviousSubmissions([]);
        return;
      }

      // Use batch endpoint instead of individual requests
          const response = await fetch(
        `${API_ENDPOINTS.assessmentSubmissions.batch}?userName=${encodeURIComponent(userName)}`,
            {
          method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
          body: JSON.stringify({ 
            taskIds: limitedTaskIds,
            // Optional: include stakeholderId if filtering is needed
            // stakeholderId: selectedStakeholderId || undefined,
          }),
            }
          );

      const allSubmissions: Submission[] = [];

          if (response.ok) {
            const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          // Process batch response: result.data is [{ taskId, submissions: [...] }, ...]
          result.data.forEach((entry: any) => {
            const taskSubmissions = entry.submissions || [];
              if (Array.isArray(taskSubmissions)) {
                allSubmissions.push(...taskSubmissions);
              }
          });
          
          // Log any errors from invalid taskIds
          if (result.errors && result.errors.length > 0) {
          }
        }
      } else {
        // Fallback: could retry with individual requests if batch fails
      }
      
      // Use functional update to access previousSubmissions without dependency
      setPreviousSubmissions(prev => {
        // Detect new submissions
        const newSubmissions = allSubmissions.filter(newSub => {
          return !prev.find(prevSub => prevSub.id === newSub.id);
        });
        
        // Create notifications for new submissions
        if (newSubmissions.length > 0) {
          const course = courses.find(c => c.id === selectedCourseId);
          const newNotifications: Notification[] = newSubmissions.map(submission => {
            const task = tasks.find(t => t.id === submission.taskId);
            return {
              id: `submission-${submission.id}-${Date.now()}`,
              type: 'submission' as const,
              courseCode: course?.code || '',
              studentUsername: submission.studentId,
              datetime: submission.datetime,
              read: false,
              message: `New submission from ${submission.studentName} for task: ${task?.taskTitle || task?.keyword || 'Task'}`,
            };
          });
          
          setNotifications(notifPrev => {
            const existingIds = new Set(notifPrev.map(n => n.id));
            const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
            return [...uniqueNew, ...notifPrev].slice(0, 100); // Limit to 100 notifications
          });
        }
        
        return allSubmissions;
      });
      
      setSubmissions(allSubmissions);
    } catch (error) {
      setSubmissions([]);
      setPreviousSubmissions([]);
    }
  }, [selectedProjectId, tasks, courses, selectedCourseId]); // Removed previousSubmissions from dependencies

  // Listen for refresh event from SubmissionSection
  useEffect(() => {
    const handleRefreshSubmissions = () => {
      fetchSubmissions();
    };

    window.addEventListener('assessment-refresh-submissions', handleRefreshSubmissions);
    return () => {
      window.removeEventListener('assessment-refresh-submissions', handleRefreshSubmissions);
    };
  }, [fetchSubmissions]);

  // Load submissions when a task is selected
  useEffect(() => {
    if (selectedTaskId && selectedProjectId && tasks.length > 0) {
      fetchSubmissions();
    }
  }, [selectedTaskId, selectedProjectId, fetchSubmissions, tasks]);

  const fetchStudents = async (courseId?: string) => {
    try {
      // courseId is required for the endpoint
      if (!courseId) {
        setStudents([]);
        return;
      }

      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      
      const url = `${API_ENDPOINTS.students.list}?courseId=${encodeURIComponent(courseId)}&userName=${encodeURIComponent(userName)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const fetchedStudents = result.data || [];
          setStudents(Array.isArray(fetchedStudents) ? fetchedStudents : []);
        } else {
          setStudents([]);
        }
      } else {
        await response.text();
        setStudents([]);
      }
    } catch (error) {
      setStudents([]);
    }
  };

  const fetchGroups = async (courseId?: string) => {
    try {
      if (!courseId) {
        setGroups([]);
        return;
      }

      const response = await fetch(API_ENDPOINTS.studentGroups.getByCourse(courseId), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const fetchedGroups = result.data || [];
          setGroups(Array.isArray(fetchedGroups) ? fetchedGroups : []);
        } else {
          setGroups([]);
        }
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="p-8">
        {/* Header */}
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        
        {/* Main Content Area */}
          {activeSection === "setup" && (
            <SetupSection
              courses={courses}
              selectedCourseId={selectedCourseId}
              onCourseChange={setSelectedCourseId}
              projects={projects}
              selectedProjectId={selectedProjectId}
              tasks={tasks}
              roles={roles}
              quizzes={quizzes}
              onProjectCreate={() => setShowProjectForm(true)}
              onProjectEdit={(project) => {
                setEditingProject(project);
                setProjectFormData({
                  projectTitle: project.projectTitle || project.title || "",
                  courseDescription: project.courseDescription,
                  learningOutcome: project.learningOutcome,
                  keyMilestones: project.keyMilestones,
                  attachments: project.attachments || [],
                  availableStakeholders: project.availableStakeholders || [],
                });
                setShowProjectForm(true);
              }}
              onProjectDelete={async (id) => {
                try {
                  const userName = localStorage.getItem('ai4edu_user') || 'Guest';
                  
                  const response = await fetch(API_ENDPOINTS.projects.delete(id), {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                  });

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to delete project' }));
                    throw new Error(errorData.message || 'Failed to delete project');
                  }

                  const result = await response.json();
                  if (result.success) {
                    setProjects(projects.filter(p => p.id !== id));
                    // Clear selected project if it was deleted
                    if (selectedProjectId === id) {
                      setSelectedProjectId("");
                    }
                    toast({ title: "Success", description: "Project deleted" });
                  } else {
                    throw new Error(result.message || 'Failed to delete project');
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to delete project",
                    variant: "destructive"
                  });
                }
              }}
              onTaskCreate={() => {
                // Reset form data and clear editing task when creating new task
                setEditingTask(null);
                setTaskFormData({
                  taskTitle: "",
                  description: "",
                  keyword: "",
                  submissionDeadline: "",
                  evaluationCriteria: "",
                  outcome: "",
                  instruction: "",
                  enabledAIGuideline: false,
                  lockOnSubmissionQuestion: false,
                  lockOnFeedbackReceivedQuestion: false,
                  submissionQuestion: "",
                  feedbackReceivedQuestion: "",
                  submissionQuestionTimer: 5,
                  feedbackReceivedQuestionTimer: 5,
                  attachments: [],
                  status: 'unpublished',
                });
                setShowTaskForm(true);
              }}
              onTaskEdit={(task) => {
                setEditingTask(task);
                
                // Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
                let deadlineForInput = "";
                if (task.submissionDeadline) {
                  try {
                    const date = new Date(task.submissionDeadline);
                    // Format as YYYY-MM-DDTHH:mm for datetime-local input
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    deadlineForInput = `${year}-${month}-${day}T${hours}:${minutes}`;
                  } catch (e) {
                    deadlineForInput = task.submissionDeadline;
                  }
                }
                
                setTaskFormData({
                  taskTitle: task.taskTitle || "",
                  description: task.description,
                  keyword: task.keyword,
                  submissionDeadline: deadlineForInput,
                  evaluationCriteria: task.evaluationCriteria,
                  outcome: task.outcome || "",
                  instruction: task.instruction || "",
                  enabledAIGuideline: task.enabledAIGuideline,
                  lockOnSubmissionQuestion: task.lockOnSubmissionQuestion,
                  lockOnFeedbackReceivedQuestion: task.lockOnFeedbackReceivedQuestion,
                  submissionQuestion: task.submissionQuestion || "",
                  feedbackReceivedQuestion: task.feedbackReceivedQuestion || "",
                  submissionQuestionTimer: task.submissionQuestionTimer || 5,
                  feedbackReceivedQuestionTimer: task.feedbackReceivedQuestionTimer || 5,
                  attachments: task.attachments || [],
                  status: task.status || 'unpublished',
                });
                setShowTaskForm(true);
              }}
              onTaskDelete={async (id) => {
                try {
                  const userName = localStorage.getItem('ai4edu_user') || 'Guest';
                  
                  const response = await fetch(API_ENDPOINTS.assessmentTasks.delete(id), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                  });

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to delete task' }));
                    throw new Error(errorData.message || 'Failed to delete task');
                  }

                  const result = await response.json();
                  if (result.success) {
                    setTasks(tasks.filter(t => t.id !== id));
                    toast({ title: "Success", description: "Task deleted" });
                  } else {
                    throw new Error(result.message || 'Failed to delete task');
                  }
                } catch (error) {
        toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to delete task",
                    variant: "destructive"
                  });
                }
              }}
              onRoleCreate={() => setShowRoleForm(true)}
              onRoleEdit={(role) => {
                setEditingRole(role);
                setRoleFormData({
                  avatarImage: role.avatarImage || "",
                  name: role.name,
                  persona: role.persona,
                  attachments: role.attachments || [],
                  status: role.status || "active",
                });
                setShowRoleForm(true);
              }}
              onRoleDelete={async (id) => {
                try {
                  const userName = localStorage.getItem('ai4edu_user') || 'Guest';
                  
                  const response = await fetch(API_ENDPOINTS.assessmentRoles.delete(id), {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                  });

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to delete role' }));
                    throw new Error(errorData.message || 'Failed to delete role');
                  }

                  const result = await response.json();
                  if (result.success) {
                    setRoles(roles.filter(r => r.id !== id));
                    toast({ title: "Success", description: "Role deleted" });
      } else {
                    throw new Error(result.message || 'Failed to delete role');
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to delete role",
                    variant: "destructive"
                  });
                }
              }}
              onQuizGenerate={() => setShowQuizForm(true)}
              onQuizEdit={(quiz) => {
                setEditingQuiz(quiz);
                setShowQuizForm(true);
              }}
              onQuizDelete={async (id) => {
                try {
                  const userName = localStorage.getItem('ai4edu_user') || 'Guest';
                  
                  const response = await fetch(API_ENDPOINTS.assessmentQuizzes.delete(id), {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                  });

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to delete quiz' }));
                    throw new Error(errorData.message || 'Failed to delete quiz');
                  }

                  const result = await response.json();
                  if (result.success) {
                    setQuizzes(quizzes.filter(q => q.id !== id));
                    toast({ title: "Success", description: "Quiz deleted" });
                  } else {
                    throw new Error(result.message || 'Failed to delete quiz');
      }
    } catch (error) {
      toast({
        title: "Error",
                    description: error instanceof Error ? error.message : "Failed to delete quiz",
                    variant: "destructive"
                  });
                }
              }}
            />
          )}

          {activeSection === "submission" && (
            <SubmissionSection
              tasks={tasks}
              roles={roles}
              submissions={submissions}
              students={students}
              groups={groups}
              selectedTaskId={selectedTaskId}
              selectedStakeholderId={selectedStakeholderId}
              viewType={submissionViewType}
              onViewTypeChange={setSubmissionViewType}
              onTaskChange={setSelectedTaskId}
              onStakeholderChange={setSelectedStakeholderId}
              onSubmissionUpdate={(updatedSubmission) => {
                // Update the submission in the submissions array
                setSubmissions(prev => 
                  prev.map(sub => 
                    sub.id === updatedSubmission.id ? updatedSubmission : sub
                  )
                );
              }}
              onSubmissionDelete={(submissionId) => {
                // Remove the submission from the submissions array
                setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
              }}
            />
          )}

          {activeSection === "stakeholders" && (
            <StakeholdersSection
              roles={roles}
              submissions={submissions}
              students={students}
              groups={groups}
              selectedStudent={selectedStudentForProgress}
              viewType={stakeholderViewType}
              onViewTypeChange={setStakeholderViewType}
              onStudentChange={setSelectedStudentForProgress}
            />
          )}

          {activeSection === "progress" && (
            <ProgressSection
              tasks={tasks}
              submissions={submissions}
              students={students}
              groups={groups}
              selectedStudent={selectedStudentForProgress}
              selectedProjectId={selectedProjectId || ""}
              viewType={progressViewType}
              selectedGroupId={selectedGroupId}
              onViewTypeChange={setProgressViewType}
              onGroupChange={setSelectedGroupId}
              onStudentChange={setSelectedStudentForProgress}
            />
          )}

          {activeSection === "quiz" && (
            <QuizSection
              quizzes={quizzes}
              students={students}
              selectedStudent={selectedStudentForQuiz}
              onStudentChange={setSelectedStudentForQuiz}
              selectedProjectId={selectedProjectId}
              selectedCourseId={selectedCourseId}
            />
          )}

          {activeSection === "notification" && (
            <NotificationSection
              courses={courses}
              selectedCourseId={selectedCourseId}
              notificationsFromParent={notifications}
              onNotificationRead={(id) => {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
              }}
              onRefresh={handleRefreshNotifications}
              isRefreshing={isRefreshingNotifications}
            />
          )}

          {activeSection === "students" && (
            <StudentsSection
              students={students}
              groups={groups}
              courses={courses}
              selectedCourseId={selectedCourseId}
              selectedProjectId={selectedProjectId || ""}
              onStudentCreate={() => {
    if (!selectedCourseId) {
      toast({
                    title: "No Course Selected",
                    description: "Please select a course first before creating a student.",
        variant: "destructive",
      });
      return;
    }
                setEditingStudent(null);
                setStudentFormData({
                  username: "",
                  email: "",
                  fullName: "",
                  password: "",
                  type: "student",
                  remark: "", // Not used in form, but keep for state consistency
                });
                setShowStudentForm(true);
              }}
              onStudentEdit={(student) => {
                setEditingStudent(student);
                setStudentFormData({
                  username: student.username,
                  email: student.email || "",
                  fullName: student.fullName || "",
                  password: "", // Don't pre-fill password
                  type: student.type || "student",
                  remark: student.course || student.remark || "", // Use course if available, otherwise remark
                });
                setShowStudentForm(true);
              }}
              onGroupsChange={() => {
                if (selectedCourseId) {
                  fetchGroups(selectedCourseId);
                }
              }}
              onRefreshStudents={() => {
                if (selectedCourseId) {
                  fetchStudents(selectedCourseId);
                }
              }}
              onStudentDelete={async (id) => {
                try {
                  // Clean the ID - remove any trailing characters after colon or invalid characters
                  const cleanId = id.split(':')[0].trim();
                  
                  // Validate ID format (MongoDB ObjectId format - 24 hex characters)
                  if (!/^[0-9a-fA-F]{24}$/.test(cleanId)) {
                    toast({
                      title: "Error",
                      description: "Invalid student ID format",
                      variant: "destructive",
                    });
                    console.error('[Assessment] Invalid student ID:', id);
                    return;
                  }

                  const userName = localStorage.getItem('ai4edu_user') || 'Guest';
                  
                  const endpoint = API_ENDPOINTS.students?.delete?.(cleanId) || `${API_ENDPOINTS.students?.list || "/api/v1/students"}/${cleanId}`;
                  console.log('[Assessment] Deleting student:', { id, cleanId, endpoint });
                  
                  const response = await fetch(endpoint, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                  });

                  // Handle non-JSON responses
                  let result;
                  try {
                    result = await response.json();
                  } catch (e) {
                    const text = await response.text();
                    throw new Error(`Server error (${response.status}): ${text || response.statusText}`);
                  }

                  if (!response.ok) {
                    throw new Error(result?.message || `Failed to delete student: ${response.status} ${response.statusText}`);
                  }

                  if (result.success) {
                    setStudents(students.filter(s => s.id !== id && s.id !== cleanId));
                    toast({ 
                      title: "Success", 
                      description: result.message || "Student deleted successfully" 
                    });
                  } else {
                    throw new Error(result.message || 'Failed to delete student');
                  }
                } catch (error) {
                  console.error('[Assessment] Delete student error:', error);
      toast({
        title: "Error",
                    description: error instanceof Error ? error.message : "Failed to delete student",
                    variant: "destructive"
                  });
                }
              }}
            />
          )}
        </div>

      {/* Project Form Dialog */}
      <ProjectFormDialog
        open={showProjectForm}
        onOpenChange={setShowProjectForm}
        project={editingProject}
        formData={projectFormData}
        onFormDataChange={setProjectFormData}
        onSave={async (data) => {
          try {
            const userName = localStorage.getItem('ai4edu_user') || 'Guest';
            
            if (editingProject) {
              // Update existing project via API
              // NOTE: updateProjectSchema does NOT accept courseId; send only updatable fields
              const response = await fetch(API_ENDPOINTS.projects.update(editingProject.id), {
                method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  projectTitle: data.projectTitle ?? null,
                  courseDescription: data.courseDescription ?? null,
                  learningOutcome: data.learningOutcome ?? null,
                  keyMilestones: data.keyMilestones ?? null,
                  attachments: data.attachments ?? [],
                  availableStakeholders: data.availableStakeholders ?? [],
                }),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to update project' }));
                throw new Error(errorData.message || 'Failed to update project');
              }

              const result = await response.json();
              if (result.success && result.data) {
                const updatedProject = result.data;
                setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
                // Ensure the updated project remains selected
                if (selectedProjectId === editingProject.id) {
                  setSelectedProjectId(updatedProject.id);
                }
                toast({ title: "Success", description: "Project updated" });
              } else {
                throw new Error(result.message || 'Failed to update project');
              }
            } else {
              // Create new project via API
              const response = await fetch(API_ENDPOINTS.projects.create, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  ...data,
                  courseId: selectedCourseId,
                  teacherId: userName,
                }),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to create project' }));
                throw new Error(errorData.message || 'Failed to create project');
              }

              const result = await response.json();
              if (result.success && result.data) {
                const newProject = result.data;
                setProjects([newProject]);
                setSelectedProjectId(newProject.id); // Auto-select the newly created project
                toast({ title: "Success", description: "Project created" });
      } else {
                throw new Error(result.message || 'Failed to create project');
              }
            }
            
            setShowProjectForm(false);
            setEditingProject(null);
            setProjectFormData({
              projectTitle: "",
              courseDescription: "",
              learningOutcome: "",
              keyMilestones: "",
              attachments: [],
              availableStakeholders: [],
            });
    } catch (error) {
        toast({
          title: "Error",
              description: error instanceof Error ? error.message : "Failed to save project",
              variant: "destructive" 
            });
          }
        }}
      />

      {/* Task Form Dialog */}
      <TaskFormDialog
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        task={editingTask}
        formData={taskFormData}
        onFormDataChange={setTaskFormData}
        projectId={selectedProjectId || ""}
        onSave={async (data) => {
          try {
            const projectId = selectedProjectId || "";
            if (!projectId) {
              throw new Error("No project selected. Please create a project first.");
            }

            // Convert datetime-local to ISO 8601 format
            let submissionDeadline = data.submissionDeadline;
            if (submissionDeadline && !submissionDeadline.includes('Z') && !submissionDeadline.includes('+')) {
              // Convert "2025-01-15T10:30" to "2025-01-15T10:30:00.000Z"
              submissionDeadline = new Date(submissionDeadline).toISOString();
            }

            // Keep all attachments (now they are uploaded filenames from the backend)
            const validAttachments = (data.attachments || []).filter((att: any) => {
              // Keep all string attachments (filenames from upload endpoint)
              return typeof att === 'string' && att.trim().length > 0;
            });

            // Prepare request body with only valid fields
            const requestBody: any = {
              projectId: projectId,
              description: data.description || "",
              keyword: data.keyword || "",
              submissionDeadline: submissionDeadline,
      };

      // Add optional fields only if they have values
            if (data.taskTitle) {
              requestBody.taskTitle = data.taskTitle;
            }
            if (data.evaluationCriteria) {
              requestBody.evaluationCriteria = data.evaluationCriteria;
            }
            if (data.outcome) {
              requestBody.outcome = data.outcome;
            }
            if (data.instruction) {
              requestBody.instruction = data.instruction;
            }
            // Always include status (default is 'unpublished' per backend)
            requestBody.status = data.status || 'unpublished';
            if (data.enabledAIGuideline !== undefined) {
              requestBody.enabledAIGuideline = data.enabledAIGuideline;
            }
            if (data.lockOnSubmissionQuestion !== undefined) {
              requestBody.lockOnSubmissionQuestion = data.lockOnSubmissionQuestion;
            }
            if (data.lockOnFeedbackReceivedQuestion !== undefined) {
              requestBody.lockOnFeedbackReceivedQuestion = data.lockOnFeedbackReceivedQuestion;
            }
            if (data.lockOnSubmissionQuestion && data.submissionQuestion) {
              requestBody.submissionQuestion = data.submissionQuestion;
              requestBody.submissionQuestionTimer = data.submissionQuestionTimer || 5;
            }
            if (data.lockOnFeedbackReceivedQuestion && data.feedbackReceivedQuestion) {
              requestBody.feedbackReceivedQuestion = data.feedbackReceivedQuestion;
              requestBody.feedbackReceivedQuestionTimer = data.feedbackReceivedQuestionTimer || 5;
            }
            if (validAttachments.length > 0) {
              requestBody.attachments = validAttachments;
            }

            if (editingTask) {
              // Update existing task via API
              const response = await fetch(API_ENDPOINTS.assessmentTasks.update(editingTask.id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(requestBody),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to update task' }));
                throw new Error(errorData.message || errorData.error || 'Failed to update task');
              }

              const result = await response.json();
              if (result.success && result.data) {
                setTasks(tasks.map(t => t.id === editingTask.id ? result.data : t));
                toast({ title: "Success", description: "Task updated" });
      } else {
                throw new Error(result.message || 'Failed to update task');
              }
            } else {
              // Create new task via API
              const response = await fetch(API_ENDPOINTS.assessmentTasks.create, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(requestBody),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to create task' }));
                throw new Error(errorData.message || errorData.error || 'Failed to create task');
              }

              const result = await response.json();
              if (result.success && result.data) {
                setTasks([...tasks, result.data]);
                toast({ title: "Success", description: "Task created" });
              } else {
                throw new Error(result.message || 'Failed to create task');
              }
            }
            
            setShowTaskForm(false);
            setEditingTask(null);
            setTaskFormData({
              taskTitle: "",
              description: "",
              keyword: "",
              submissionDeadline: "",
              evaluationCriteria: "",
              outcome: "",
              instruction: "",
              enabledAIGuideline: false,
              lockOnSubmissionQuestion: false,
              lockOnFeedbackReceivedQuestion: false,
              submissionQuestion: "",
              feedbackReceivedQuestion: "",
              submissionQuestionTimer: 5,
              feedbackReceivedQuestionTimer: 5,
              attachments: [],
              status: 'unpublished',
            });
          } catch (error) {
        toast({
          title: "Error",
              description: error instanceof Error ? error.message : "Failed to save task",
              variant: "destructive" 
            });
          }
        }}
      />

      {/* Role Form Dialog */}
      <RoleFormDialog
        open={showRoleForm}
        onOpenChange={setShowRoleForm}
        role={editingRole}
        formData={roleFormData}
        onFormDataChange={setRoleFormData}
        projectId={selectedProjectId || ""}
        onSave={async (data) => {
          try {
            const projectId = selectedProjectId || "";
            if (!projectId) {
              throw new Error("No project selected. Please create a project first.");
            }

            // Basic validation
            if (!data.name || !data.name.trim()) {
              throw new Error("Role name is required");
            }
            if (!data.persona || !data.persona.trim()) {
              throw new Error("Role persona is required");
            }

            if (editingRole) {
              // Update existing role via API
              // updateRoleSchema: name, persona, status, avatarImage, attachments (all optional, at least one)
              const payload: any = {};
              if (data.name && data.name.trim()) {
                payload.name = data.name.trim();
              }
              if (data.persona && data.persona.trim()) {
                payload.persona = data.persona.trim();
              }
              if (data.status) {
                payload.status = data.status;
              }
              // Allow avatarImage to be explicitly null to clear it
              if (data.avatarImage !== undefined) {
                payload.avatarImage = data.avatarImage || null;
              }
              if (Array.isArray(data.attachments)) {
                payload.attachments = data.attachments;
              }

              const response = await fetch(API_ENDPOINTS.assessmentRoles.update(editingRole.id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to update role' }));
                throw new Error(errorData.message || 'Failed to update role');
              }

              const result = await response.json();
              if (result.success && result.data) {
                setRoles(roles.map(r => r.id === editingRole.id ? result.data : r));
                toast({ title: "Success", description: "Role updated" });
        } else {
                throw new Error(result.message || 'Failed to update role');
              }
            } else {
              // Create new role via API
              // createRoleSchema: projectId, name, persona, optional status, avatarImage, attachments
              const payload = {
                projectId,
                name: data.name.trim(),
                persona: data.persona.trim(),
                status: data.status || "active",
                avatarImage: data.avatarImage || null,
                attachments: Array.isArray(data.attachments) ? data.attachments : [],
              };

              const response = await fetch(API_ENDPOINTS.assessmentRoles.create, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to create role' }));
                throw new Error(errorData.message || 'Failed to create role');
              }

              const result = await response.json();
              if (result.success && result.data) {
                setRoles([...roles, result.data]);
                toast({ title: "Success", description: "Role created" });
              } else {
                throw new Error(result.message || 'Failed to create role');
              }
            }
            
            setShowRoleForm(false);
            setEditingRole(null);
            setRoleFormData({
              avatarImage: "",
              name: "",
              persona: "",
              attachments: [],
              status: "active",
            });
    } catch (error) {
      toast({
        title: "Error",
              description: error instanceof Error ? error.message : "Failed to save role",
              variant: "destructive" 
            });
          }
        }}
      />

      {/* Student Form Dialog */}
      <StudentFormDialog
        open={showStudentForm}
        onOpenChange={setShowStudentForm}
        student={editingStudent}
        formData={studentFormData}
        onFormDataChange={setStudentFormData}
        courses={courses}
        selectedCourseId={selectedCourseId}
        onSave={async (data) => {
          try {
            
            // Basic validation for email when provided
            const hasEmail = !!data.email && !!data.email.trim();
            if (hasEmail) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(data.email.trim())) {
                throw new Error("Please enter a valid email address");
              }
            }

            if (editingStudent) {
              // Update existing student via API (updateStudentSchema: email, fullName, remark)
              const requestBody: any = {
                email: hasEmail ? data.email.trim() : null,
                fullName: data.fullName?.trim() || null,
                remark: selectedCourseId || null, // Store course _id in remark field from selectedCourseId
              };

              const response = await fetch(API_ENDPOINTS.students.update(editingStudent.id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(requestBody),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to update student' }));
                throw new Error(errorData.message || errorData.error || 'Failed to update student');
              }

              const result = await response.json();
              if (result.success && result.data) {
                setStudents(students.map(s => s.id === editingStudent.id ? result.data : s));
                toast({ title: "Success", description: "Student updated" });
              } else {
                throw new Error(result.message || 'Failed to update student');
              }
            } else {
              // Create new student via auth/create-user endpoint (supports type and remark)
              if (!selectedCourseId) {
                throw new Error("Please select a course before creating a student");
              }

              const createUserBody = {
                name: data.fullName?.trim() || data.username, // User's full name
                email: data.email.trim(), // Email is required and validated above
                password: data.password,
                type: "student", // Explicitly set type to student
                remark: selectedCourseId, // Store courseId in remark field
              };


              const createResponse = await fetch(API_ENDPOINTS.auth.createUser, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(createUserBody),
              });

              if (!createResponse.ok) {
                // Handle 429 Too Many Requests with user-friendly message
                if (createResponse.status === 429) {
                  toast({
                    title: "Too Many Requests",
                    description: "You've made too many requests. Please wait a moment and try again.",
                    variant: "destructive",
                  });
                  throw new Error("Too many requests. Please wait a moment and try again.");
                }
                
                const errorData = await createResponse.json().catch(() => ({ message: 'Failed to create student' }));
                throw new Error(errorData.message || errorData.error || 'Failed to create student');
              }

              const createResult = await createResponse.json();
              
              if (createResult.success) {
                // Handle both 'user' and 'data' response structures
                const newUser = createResult.user || createResult.data;
                
                if (newUser) {
                  // Refresh the students list to get the updated data from backend
                  if (selectedCourseId) {
                    // Wait a bit for the backend to process, then fetch
                    setTimeout(() => {
                      fetchStudents(selectedCourseId);
                    }, 1000);
                  }
                  
                  toast({ title: "Success", description: "Student created successfully" });
                } else {
                  // Success but no user data - still consider it successful if message indicates success
                  if (createResult.message && createResult.message.toLowerCase().includes('success')) {
                    // Refresh the students list
                    if (selectedCourseId) {
                      setTimeout(() => {
                        fetchStudents(selectedCourseId);
                      }, 1000);
                    }
                    toast({ title: "Success", description: createResult.message || "Student created successfully" });
                  } else {
                    throw new Error(createResult.message || 'Failed to create student');
                  }
                }
              } else {
                throw new Error(createResult.message || 'Failed to create student');
              }
            }
            
            setShowStudentForm(false);
            setEditingStudent(null);
            setStudentFormData({
              username: "",
              email: "",
              fullName: "",
              password: "",
              type: "student",
              remark: "",
            });
            // Refresh the students list if a course is selected
            if (selectedCourseId) {
              fetchStudents(selectedCourseId);
            }
          } catch (error) {
            toast({
              title: "Error",
              description: error instanceof Error ? error.message : "Failed to save student",
              variant: "destructive"
            });
          }
        }}
      />

      {/* Quiz Form Dialog */}
      <QuizFormDialog
        open={showQuizForm}
        onOpenChange={setShowQuizForm}
        quiz={editingQuiz}
        tasks={tasks}
        projectId={selectedProjectId || ""}
        onSave={async (quiz) => {
          try {
            const projectId = selectedProjectId || "";
            if (!projectId) {
              throw new Error("No project selected. Please create a project first.");
            }

            const userName = localStorage.getItem('ai4edu_user') || 'Guest';

            if (editingQuiz) {
              // Update existing quiz via API - send questions, updatedBy, and name
              const response = await fetch(API_ENDPOINTS.assessmentQuizzes.update(editingQuiz.id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  questions: quiz.questions,
                  updatedBy: userName,
                  name: quiz.name || "Project Knowledge Quiz",
                }),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to update quiz' }));
                throw new Error(errorData.message || errorData.error || 'Failed to update quiz');
              }

              const result = await response.json();
              if (result.success && result.data) {
                setQuizzes(quizzes.map(q => q.id === editingQuiz.id ? result.data : q));
                toast({ title: "Success", description: "Quiz updated" });
        } else {
                throw new Error(result.message || 'Failed to update quiz');
              }
            } else {
              // Create new quiz via API - send projectId, questions, and name
              const response = await fetch(API_ENDPOINTS.assessmentQuizzes.create, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  projectId: projectId,
                  questions: quiz.questions,
                  name: quiz.name || "Project Knowledge Quiz",
                }),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to create quiz' }));
                throw new Error(errorData.message || 'Failed to create quiz');
              }

              const result = await response.json();
              if (result.success && result.data) {
                setQuizzes([...quizzes, result.data]);
                toast({ title: "Success", description: "Quiz created" });
              } else {
                throw new Error(result.message || 'Failed to create quiz');
              }
            }
            
            setShowQuizForm(false);
            setEditingQuiz(null);
    } catch (error) {
      toast({
        title: "Error",
              description: error instanceof Error ? error.message : "Failed to save quiz",
              variant: "destructive" 
            });
          }
        }}
      />
    </div>
  );
}

// Setup Section Component
interface SetupSectionProps {
  courses: Course[];
  selectedCourseId: string;
  onCourseChange: (id: string) => void;
  projects: Project[];
  selectedProjectId: string;
  tasks: Task[];
  roles: Role[];
  quizzes: Quiz[];
  onProjectCreate: () => void;
  onProjectEdit: (project: Project) => void;
  onProjectDelete: (id: string) => Promise<void>;
  onTaskCreate: () => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (id: string) => Promise<void>;
  onRoleCreate: () => void;
  onRoleEdit: (role: Role) => void;
  onRoleDelete: (id: string) => Promise<void>;
  onQuizGenerate: () => void;
  onQuizEdit: (quiz: Quiz) => void;
  onQuizDelete: (id: string) => Promise<void>;
}

function SetupSection({
  courses,
  selectedCourseId,
  onCourseChange,
  projects,
  selectedProjectId,
  tasks,
  roles,
  quizzes,
  onProjectCreate,
  onProjectEdit,
  onProjectDelete,
  onTaskCreate,
  onTaskEdit,
  onTaskDelete,
  onRoleCreate,
  onRoleEdit,
  onRoleDelete,
  onQuizGenerate,
  onQuizEdit,
  onQuizDelete,
}: SetupSectionProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"project" | "task" | "role" | "quiz" | "lo-mapping">("project");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState<"project" | "task" | "role" | "quiz" | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string>("");
  const [deleteItemName, setDeleteItemName] = useState<string>("");

  // Sort tasks by deadline (earliest first)
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const dateA = a.submissionDeadline ? new Date(a.submissionDeadline).getTime() : 0;
      const dateB = b.submissionDeadline ? new Date(b.submissionDeadline).getTime() : 0;
      // If either task has no deadline, put it at the end
      if (!a.submissionDeadline && !b.submissionDeadline) return 0;
      if (!a.submissionDeadline) return 1;
      if (!b.submissionDeadline) return -1;
      // Sort by date (earliest first)
      return dateA - dateB;
    });
  }, [tasks]);

    return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Setup</h2>
        <p className="text-muted-foreground">Configure projects, tasks, roles, and quizzes</p>
      </div>

      {/* Project Info */}
      {selectedProjectId && projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Current Project
              {(() => {
                const proj = projects.find(p => p.id === selectedProjectId);
                const title = proj?.projectTitle || proj?.title;
                return title ? `: ${title}` : "";
              })()}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {selectedCourseId && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="project">Project</TabsTrigger>
            <TabsTrigger value="task">Tasks</TabsTrigger>
            <TabsTrigger value="role">Roles</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="lo-mapping">LO Mapping</TabsTrigger>
          </TabsList>

          <TabsContent value="project" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Projects</CardTitle>
                  <Button onClick={onProjectCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
              </Button>
                </div>
                <CardDescription>
                  Each course has one project. Create or edit project details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No project found. Create your first project.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <Card key={project.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Project</CardTitle>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onProjectEdit(project)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setDeleteItemType("project");
                                  setDeleteItemId(project.id);
                                  setDeleteItemName("this project");
                                  setDeleteConfirmOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-sm font-semibold">Course Description</Label>
                              <p className="text-sm">{project.courseDescription}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-semibold">Learning Outcome</Label>
                              <p className="text-sm">{project.learningOutcome}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-semibold">Key Milestones</Label>
                              <p className="text-sm">{project.keyMilestones}</p>
                            </div>
                          </div>
              </CardContent>
            </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="task" className="space-y-4">
            {!selectedProjectId ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-muted-foreground text-center">
                    Please select a project first to view and manage tasks.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Tasks</CardTitle>
                    <Button onClick={onTaskCreate}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                  <CardDescription>
                    Create and manage tasks for the selected project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No tasks found. Create your first task.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {sortedTasks.map((task) => (
                      <Card
                        key={task.id}
                        className={
                          task.status === "published"
                            ? "bg-green-50 border border-green-200"
                            : ""
                        }
                      >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{task.taskTitle || task.keyword || "Task"}</CardTitle>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onTaskEdit(task)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setDeleteItemType("task");
                                    setDeleteItemId(task.id);
                                    setDeleteItemName(task.taskTitle || task.keyword || "this task");
                                    setDeleteConfirmOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <p className="text-sm">
                                {truncateWords(task.description, 100)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Deadline: {task.submissionDeadline}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="role" className="space-y-4">
            {!selectedProjectId ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-muted-foreground text-center">
                    Please select a project first to view and manage roles.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
              <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Roles</CardTitle>
                    <Button onClick={onRoleCreate}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Role
                    </Button>
                </div>
                  <CardDescription>
                    Create roles for available stakeholders in the selected project
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  {roles.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No roles found. Create your first role.
                    </p>
                  ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {roles.map((role) => (
                      <Card
                        key={role.id}
                        className={
                          role.status === "active"
                            ? "bg-green-50 border border-green-200"
                            : ""
                        }
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {role.avatarImage ? (
                                <img
                                  src={role.avatarImage}
                                  alt={role.name}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <UserCircle className="w-10 h-10" />
                              )}
                              <CardTitle className="text-lg">{role.name}</CardTitle>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRoleEdit(role)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setDeleteItemType("role");
                                  setDeleteItemId(role.id);
                                  setDeleteItemName(role.name);
                                  setDeleteConfirmOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            {truncateWords(role.persona, 100)}
                          </p>
              </CardContent>
            </Card>
                    ))}
          </div>
                )}
              </CardContent>
            </Card>
            )}
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4">
            {!selectedProjectId ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-muted-foreground text-center">
                    Please select a project first to view and manage quizzes.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Quizzes</CardTitle>
                    <Button onClick={onQuizGenerate}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Quiz
                    </Button>
        </div>
                  <CardDescription>
                    Generate quizzes based on tasks and keywords for the selected project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {quizzes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No quizzes found. Generate your first quiz.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {quizzes.map((quiz) => (
                        <Card key={quiz.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{quiz.name || "Project Knowledge Quiz"}</CardTitle>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onQuizEdit(quiz)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setDeleteItemType("quiz");
                                    setDeleteItemId(quiz.id);
                                    setDeleteItemName("this quiz");
                                    setDeleteConfirmOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">
                              {quiz.questions.length} questions
                            </p>
                            {quiz.history.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {quiz.history.length} version(s) in history
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="lo-mapping" className="space-y-4">
            {!selectedProjectId ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-muted-foreground text-center">
                    Please select a project first to view and manage LO mappings.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <LOMappingComponent
                projects={projects}
                selectedProjectId={selectedProjectId}
                tasks={tasks}
                roles={roles}
                quizzes={quizzes}
              />
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {deleteItemName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteItemType === "project") {
                  await onProjectDelete(deleteItemId);
                } else if (deleteItemType === "task") {
                  await onTaskDelete(deleteItemId);
                } else if (deleteItemType === "role") {
                  await onRoleDelete(deleteItemId);
                } else if (deleteItemType === "quiz") {
                  await onQuizDelete(deleteItemId);
                }
                setDeleteConfirmOpen(false);
                setDeleteItemType(null);
                setDeleteItemId("");
                setDeleteItemName("");
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    );
  }

// LO Mapping Component
interface LOMappingComponentProps {
  projects: Project[];
  selectedProjectId: string;
  tasks: Task[];
  roles: Role[];
  quizzes: Quiz[];
}

function LOMappingComponent({
  projects,
  selectedProjectId,
  tasks,
  roles,
  quizzes,
}: LOMappingComponentProps) {
  const { toast } = useToast();
  const [loMappings, setLoMappings] = useState<{
    [loId: string]: {
      tasks: string[];
      roles: string[];
      questions: string[];
    };
  }>({});

  // Extract Learning Objectives from projects
  const extractLearningObjectives = useMemo(() => {
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    if (!selectedProject || !selectedProject.learningOutcome) {
      return [];
    }

    // Parse learningOutcome string - could be separated by newlines, semicolons, or numbered list
    const loText = selectedProject.learningOutcome.trim();
    if (!loText) return [];

    // Try to split by common delimiters
    const lines = loText
      .split(/\n|;|(?=\d+[\.\)])/) // Split by newline, semicolon, or numbered list pattern
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^(learning|outcome|objective)/i)); // Filter out headers

    // If only one line, treat as single LO
    if (lines.length === 1) {
      return [{ id: 'lo-1', text: lines[0] }];
    }

    // Multiple LOs
    return lines.map((line, index) => ({
      id: `lo-${index + 1}`,
      text: line.replace(/^\d+[\.\)]\s*/, ''), // Remove numbering
    }));
  }, [projects, selectedProjectId]);

  // Get latest quiz and extract questions (default 2 per task)
  const quizQuestions = useMemo(() => {
    if (quizzes.length === 0) return [];

    const latestQuiz = quizzes.sort((a, b) => 
      new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    )[0];

    if (!latestQuiz || !latestQuiz.questions || latestQuiz.questions.length === 0) {
      return [];
    }

    // Group questions by task (if questions have taskId) or distribute evenly
    const questionsPerTask = Math.max(2, Math.floor(latestQuiz.questions.length / tasks.length));
    const questions: Array<{ id: string; question: string; taskId?: string }> = [];

    latestQuiz.questions.forEach((q, index) => {
      // Try to find associated task (could be in question text or metadata)
      const taskIndex = Math.floor(index / questionsPerTask);
      const associatedTask = tasks[taskIndex]?.id;

      questions.push({
        id: q.id,
        question: q.question,
        taskId: associatedTask,
      });
    });

    return questions.slice(0, tasks.length * 2); // Limit to 2 per task
  }, [quizzes, tasks]);

  // Initialize mappings when data changes
  useEffect(() => {
    const initialMappings: typeof loMappings = {};
    extractLearningObjectives.forEach(lo => {
      if (!initialMappings[lo.id]) {
        initialMappings[lo.id] = {
          tasks: [],
          roles: [],
          questions: [],
        };
      }
    });
    setLoMappings(prev => ({ ...initialMappings, ...prev }));
  }, [extractLearningObjectives]);

  const toggleTaskMapping = (loId: string, taskId: string) => {
    setLoMappings(prev => ({
      ...prev,
      [loId]: {
        ...prev[loId],
        tasks: prev[loId]?.tasks.includes(taskId)
          ? prev[loId].tasks.filter(id => id !== taskId)
          : [...(prev[loId]?.tasks || []), taskId],
        roles: prev[loId]?.roles || [],
        questions: prev[loId]?.questions || [],
      },
    }));
  };

  const toggleRoleMapping = (loId: string, roleId: string) => {
    setLoMappings(prev => ({
      ...prev,
      [loId]: {
        ...prev[loId],
        tasks: prev[loId]?.tasks || [],
        roles: prev[loId]?.roles.includes(roleId)
          ? prev[loId].roles.filter(id => id !== roleId)
          : [...(prev[loId]?.roles || []), roleId],
        questions: prev[loId]?.questions || [],
      },
    }));
  };

  const toggleQuestionMapping = (loId: string, questionId: string) => {
    setLoMappings(prev => ({
      ...prev,
      [loId]: {
        ...prev[loId],
        tasks: prev[loId]?.tasks || [],
        roles: prev[loId]?.roles || [],
        questions: prev[loId]?.questions.includes(questionId)
          ? prev[loId].questions.filter(id => id !== questionId)
          : [...(prev[loId]?.questions || []), questionId],
      },
    }));
  };

  // Auto-map: Use backend endpoint with AI
  const [isAutoMapping, setIsAutoMapping] = useState(false);

  const handleAutoMap = async () => {
    setIsAutoMapping(true);
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      
      const requestBody = {
        projectId: selectedProjectId,
        useOpenAI: true,
      };

      const response = await fetch(
        `${API_ENDPOINTS.loMappings.autoMap}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data.mappings)) {
          // Convert backend response format to local state format
          const newMappings: typeof loMappings = {};
          
          result.data.mappings.forEach((mapping: any) => {
            // Find the LO by text match
            const matchingLO = extractLearningObjectives.find(lo => 
              lo.text.toLowerCase().trim() === mapping.learningObjective?.toLowerCase().trim()
            );
            
            if (matchingLO) {
              newMappings[matchingLO.id] = {
                tasks: mapping.taskIds || [],
                roles: mapping.roleIds || [],
                questions: mapping.quizQuestionIds || [],
              };
            }
          });

          setLoMappings(prev => ({ ...prev, ...newMappings }));
          toast({
            title: "Auto-mapping Complete",
            description: "Mapped LOs using AI analysis.",
          });
        } else {
          throw new Error(result.error || 'Failed to auto-map');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to auto-map');
      }
    } catch (error) {
      console.error('Error auto-mapping:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to auto-map LOs",
        variant: "destructive",
      });
    } finally {
      setIsAutoMapping(false);
    }
  };

  const [isSavingMappings, setIsSavingMappings] = useState(false);

  const handleSaveMappings = async () => {
    setIsSavingMappings(true);
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      
      // Convert local state format to backend format
      const mappings = extractLearningObjectives.map(lo => {
        const mapping = loMappings[lo.id];
        return {
          learningObjective: lo.text,
          taskIds: mapping?.tasks || [],
          roleIds: mapping?.roles || [],
          quizQuestionIds: mapping?.questions || [],
        };
      });

      const requestBody = {
        projectId: selectedProjectId,
        mappings: mappings,
      };

      const response = await fetch(
        `${API_ENDPOINTS.loMappings.save}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast({
            title: "Mappings Saved",
            description: "LO mappings have been saved successfully.",
          });
        } else {
          throw new Error(result.error || 'Failed to save mappings');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save mappings');
      }
    } catch (error) {
      console.error('Error saving mappings:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save mappings",
        variant: "destructive",
      });
    } finally {
      setIsSavingMappings(false);
    }
  };

  if (extractLearningObjectives.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-muted-foreground text-center">
            No learning objectives found. Please add learning outcomes to your project.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Learning Objective Mapping</CardTitle>
              <CardDescription>
                Map learning objectives to tasks, roles, and quiz questions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleAutoMap}
                disabled={isAutoMapping}
              >
                {isAutoMapping ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Mapping...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Auto-Map
                  </>
                )}
              </Button>
              <Button 
                onClick={handleSaveMappings}
                disabled={isSavingMappings}
              >
                {isSavingMappings ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Mappings
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Learning Objectives List */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Learning Objectives ({extractLearningObjectives.length})</h3>
              <div className="space-y-2">
                {extractLearningObjectives.map(lo => (
                  <Card key={lo.id} className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-1">{lo.id}</Badge>
                        <p className="text-sm flex-1">{lo.text}</p>
                        <Badge variant="secondary" className="ml-2">
                          {loMappings[lo.id]?.tasks.length || 0} tasks, {loMappings[lo.id]?.roles.length || 0} roles, {loMappings[lo.id]?.questions.length || 0} questions
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Mapping Matrix */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">Learning Objective</TableHead>
                    <TableHead className="min-w-[150px]">Tasks</TableHead>
                    <TableHead className="min-w-[150px]">Roles</TableHead>
                    <TableHead className="min-w-[200px]">Quiz Questions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractLearningObjectives.map(lo => (
                    <TableRow key={lo.id}>
                      <TableCell className="sticky left-0 bg-background z-10 font-medium">
                        <div className="max-w-[200px]">
                          <Badge variant="outline" className="mb-1">{lo.id}</Badge>
                          <p className="text-xs text-muted-foreground line-clamp-2">{lo.text}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 max-h-[200px] overflow-y-auto">
                          {tasks.map(task => (
                            <div key={task.id} className="flex items-center gap-2">
                              <Checkbox
                                checked={loMappings[lo.id]?.tasks.includes(task.id) || false}
                                onCheckedChange={() => toggleTaskMapping(lo.id, task.id)}
                              />
                              <label className="text-xs cursor-pointer flex-1">
                                {task.taskTitle || task.keyword || task.id}
                              </label>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 max-h-[200px] overflow-y-auto">
                          {roles.map(role => (
                            <div key={role.id} className="flex items-center gap-2">
                              <Checkbox
                                checked={loMappings[lo.id]?.roles.includes(role.id) || false}
                                onCheckedChange={() => toggleRoleMapping(lo.id, role.id)}
                              />
                              <label className="text-xs cursor-pointer flex-1">
                                {role.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 max-h-[200px] overflow-y-auto">
                          {quizQuestions.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No quiz questions available</p>
                          ) : (
                            quizQuestions.map(q => (
                              <div key={q.id} className="flex items-start gap-2">
                                <Checkbox
                                  checked={loMappings[lo.id]?.questions.includes(q.id) || false}
                                  onCheckedChange={() => toggleQuestionMapping(lo.id, q.id)}
                                  className="mt-1"
                                />
                                <label className="text-xs cursor-pointer flex-1 line-clamp-2">
                                  {q.question}
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    );
  }

// Submission Section Component
interface SubmissionSectionProps {
  tasks: Task[];
  roles: Role[];
  submissions: Submission[];
  students: Student[];
  groups: StudentGroup[];
  selectedTaskId: string;
  selectedStakeholderId: string;
  viewType: "individual" | "group";
  onViewTypeChange: (viewType: "individual" | "group") => void;
  onTaskChange: (id: string) => void;
  onStakeholderChange: (id: string) => void;
  onSubmissionUpdate?: (updatedSubmission: Submission) => void;
  onSubmissionDelete?: (submissionId: string) => void;
}

function SubmissionSection({
  tasks,
  roles,
  submissions,
  students: studentsFromState,
  groups,
  selectedTaskId,
  selectedStakeholderId,
  viewType,
  onViewTypeChange,
  onTaskChange,
  onStakeholderChange,
  onSubmissionUpdate,
  onSubmissionDelete,
}: SubmissionSectionProps) {
  const [activeTab, setActiveTab] = useState<"master" | "task">("master");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<Submission | null>(null);
  const [conversations, setConversations] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [generatingFeedback, setGeneratingFeedback] = useState<string | null>(null);
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [editFeedback, setEditFeedback] = useState("");
  const [editFeedforward, setEditFeedforward] = useState("");
  const [editConcept, setEditConcept] = useState("");
  const [editReflection, setEditReflection] = useState("");
  const [editCriticalThinking, setEditCriticalThinking] = useState("");
  const [editTaskQualityScore, setEditTaskQualityScore] = useState<number | "not applicable" | "">("");
  const [editReflectionScore, setEditReflectionScore] = useState<number | "">("");
  const [editCriticalthinkingScore, setEditCriticalthinkingScore] = useState<number | "">("");
  const [editConceptMasteryScore, setEditConceptMasteryScore] = useState<number | "">("");
  const [editScore, setEditScore] = useState<number | "">(""); // Backward compatibility - maps to taskQualityScore
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // Store generated feedback locally (not saved yet)
  const [generatedFeedback, setGeneratedFeedback] = useState<{ 
    [submissionId: string]: { 
      feedback: string;
      feedforward?: string;
      concept?: string;
      reflection?: string;
      criticalThinking?: string;
      taskQualityScore?: number | "not applicable";
      reflectionScore?: number;
      criticalthinkingScore?: number;
      conceptMasteryScore?: number;
      starScore?: number; // Backward compatibility
      stakeholderId?: string;
    } 
  }>({});
  // Batch feedback generation state
  const [generatingBatchFeedback, setGeneratingBatchFeedback] = useState(false);
  const [batchConfirmDialogOpen, setBatchConfirmDialogOpen] = useState(false);
  const [emptySubmissions, setEmptySubmissions] = useState<Submission[]>([]);
  const [groupedSubmissions, setGroupedSubmissions] = useState<any[]>([]);
  const [loadingGroupedData, setLoadingGroupedData] = useState(false);
  // Attachment content dialog state
  const [attachmentContentDialog, setAttachmentContentDialog] = useState<{
    open: boolean;
    submissionId: string;
    content: string;
    details: any;
    loading: boolean;
  }>({ open: false, submissionId: '', content: '', details: null, loading: false });
  // Append attachment to submission: only allow once per submission
  const [attachmentAppendedSubmissionIds, setAttachmentAppendedSubmissionIds] = useState<Set<string>>(() => new Set());
  const [appendingAttachmentSubmissionId, setAppendingAttachmentSubmissionId] = useState<string | null>(null);
  
  // Function to read attachment content for a submission
  const readSubmissionAttachments = async (submissionId: string) => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      const response = await fetch(
        `${API_ENDPOINTS.assessmentSubmissions.readAttachments(submissionId)}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          return {
            content: result.data.attachmentContent,
            read: result.data.attachmentsRead,
            failed: result.data.attachmentsFailed,
            total: result.data.attachmentsTotal,
            details: result.data.details,
          };
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to read attachments' }));
        throw new Error(errorData.message || errorData.error || 'Failed to read attachments');
      }
      return null;
    } catch (error) {
      console.error('Error reading attachments:', error);
      throw error;
    }
  };
  
  // Experiment feature state
  const [experimentDialogOpen, setExperimentDialogOpen] = useState(false);
  const [selectedApproaches, setSelectedApproaches] = useState<string[]>([]);
  // Keep a selected submission (first one by default) and a free-text field for experiments.
  const [selectedSubmissionForExperiment, setSelectedSubmissionForExperiment] = useState<string>("");
  const [experimentInputText, setExperimentInputText] = useState<string>("");
  const [experimentResults, setExperimentResults] = useState<{
    [approachId: string]: {
      prompt?: string;
      feedback?: string;
      loading?: boolean;
      approachName?: string;
      fewShotExamples?: any[];
      metadata?: any;
    }
  }>({});
  const [checkingPrompts, setCheckingPrompts] = useState(false);
  const [generatingExperiments, setGeneratingExperiments] = useState(false);

  // Submission table sort state (task view)
  type SortColumn = "group" | "datetime" | "username" | "attempts" | null;
  const [submissionSortColumn, setSubmissionSortColumn] = useState<SortColumn>(null);
  const [submissionSortDirection, setSubmissionSortDirection] = useState<"asc" | "desc">("asc");

  // Get unique student IDs from submissions and students state
  const studentIdsFromSubmissions = [...new Set(submissions.map(s => s.studentId))];
  const studentIdsFromState = studentsFromState.map(s => s.username);
  const allStudentIds = [...new Set([...studentIdsFromSubmissions, ...studentIdsFromState])];
  const students = allStudentIds;

  // Get active groups for the current course
  const activeGroups = groups.filter(g => g.isActive);

  // Fetch grouped submissions when viewType is "group"
  useEffect(() => {
    const fetchGroupedData = async () => {
      if (viewType === "group" && selectedTaskId) {
        setLoadingGroupedData(true);
        try {
          const response = await fetch(`${API_ENDPOINTS.assessmentSubmissions.getByTaskGrouped(selectedTaskId)}?viewType=group`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('[SubmissionSection] Grouped data response for task:', selectedTaskId, result);
            if (result.success && result.data) {
              const groupedData = Array.isArray(result.data) ? result.data : [];
              console.log('[SubmissionSection] Processed grouped submissions:', groupedData);
              console.log('[SubmissionSection] Number of groups returned:', groupedData.length);
              if (groupedData.length > 0) {
                console.log('[SubmissionSection] First group sample:', groupedData[0]);
              }
              setGroupedSubmissions(groupedData);
            } else {
              console.log('[SubmissionSection] No grouped data in response or success=false');
              setGroupedSubmissions([]);
            }
          } else {
            const errorText = await response.text();
            console.error('[SubmissionSection] Error response:', response.status, errorText);
            setGroupedSubmissions([]);
          }
        } catch (error) {
          console.error('Error fetching grouped submissions:', error);
          setGroupedSubmissions([]);
        } finally {
          setLoadingGroupedData(false);
        }
      } else if (viewType === "group" && !selectedTaskId) {
        // Fetch all grouped submissions for all tasks when no task is selected
        setLoadingGroupedData(true);
        try {
          // Fetch grouped data for all tasks
          const allTasks = tasks.map(t => t.id);
          const groupedDataPromises = allTasks.map(async (taskId) => {
            try {
              const response = await fetch(`${API_ENDPOINTS.assessmentSubmissions.getByTaskGrouped(taskId)}?viewType=group`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
              });
              if (response.ok) {
                const result = await response.json();
                console.log(`[SubmissionSection] Grouped data for task ${taskId}:`, result);
                if (result.success && result.data) {
                  const groupedData = Array.isArray(result.data) ? result.data : [];
                  console.log(`[SubmissionSection] Task ${taskId} - Number of groups:`, groupedData.length);
                  if (groupedData.length > 0) {
                    console.log(`[SubmissionSection] Task ${taskId} - First group sample:`, groupedData[0]);
                  }
                  return { taskId, data: result.data };
                } else {
                  console.log(`[SubmissionSection] Task ${taskId} - No grouped data or success=false`);
                }
              } else {
                const errorText = await response.text();
                console.error(`[SubmissionSection] Error for task ${taskId}:`, response.status, errorText);
              }
            } catch (error) {
              console.error(`Error fetching grouped data for task ${taskId}:`, error);
            }
            return null;
          });
          
          const results = await Promise.all(groupedDataPromises);
          const validResults = results.filter(r => r !== null);
          console.log('[SubmissionSection] All grouped submissions fetched:', {
            totalTasks: allTasks.length,
            validResults: validResults.length,
            results: validResults.map(r => ({ 
              taskId: r.taskId, 
              groupCount: Array.isArray(r.data) ? r.data.length : 0,
              groups: Array.isArray(r.data) ? r.data.map((g: any) => ({ 
                groupId: g.groupId, 
                groupName: g.groupName, 
                studentCount: g.studentIds?.length || 0 
              })) : []
            }))
          });
          setGroupedSubmissions(validResults);
        } catch (error) {
          console.error('Error fetching grouped submissions:', error);
          setGroupedSubmissions([]);
        } finally {
          setLoadingGroupedData(false);
        }
      } else {
        setGroupedSubmissions([]);
      }
    };
    
    fetchGroupedData();
  }, [viewType, selectedTaskId, tasks]);

  // Get students in groups for group view
  const studentsInGroups = new Set(
    activeGroups.flatMap(g => g.studentIds)
  );
  
  // Filter submissions for group view: show individual submissions from group members
  const groupViewSubmissions = viewType === "group"
    ? submissions.filter(s => {
        // Check if student is in any active group
        return studentsInGroups.has(s.studentId) || studentsInGroups.has(s.studentName || "");
      })
    : [];

  // Generate heatmap data for master view
  const heatmapData = tasks.map(task => {
    const row: any = { task: task.taskTitle || task.keyword || task.id };
    if (viewType === "individual") {
    students.forEach(student => {
      const submission = submissions.find(
        s => s.taskId === task.id && s.studentId === student
      );
      row[student] = submission ? submission.starScore || 0 : null;
    });
    } else {
      // Group view: show tasks done by group members (aggregate by group)
      activeGroups.forEach(group => {
        // Find submissions from group members for this task
        const groupSubmissions = groupViewSubmissions.filter(s => 
          s.taskId === task.id && 
          (group.studentIds.includes(s.studentId) || group.studentIds.includes(s.studentName || ""))
        );
        // Use the highest score from group members, or null if no submissions
        const scores = groupSubmissions.map(s => s.starScore).filter(s => s !== undefined && s !== null);
        row[group.id] = scores.length > 0 ? Math.max(...scores) : null;
      });
    }
    return row;
  });

  const getCellColor = (score: number | null) => {
    if (score === null) return "bg-gray-300";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-green-400";
    if (score >= 40) return "bg-green-300";
    return "bg-green-200";
  };

  // Helper function to get group for a student
  const getGroupForStudent = (studentId: string, studentName?: string): StudentGroup | null => {
    return activeGroups.find(g => 
      g.studentIds.includes(studentId) || 
      g.studentIds.includes(studentName || "")
    ) || null;
  };

  // Filter submissions for task view (stakeholder selection is only for feedback generation, not filtering)
  // In group view, show individual submissions from group members; in individual view, show all individual submissions
  const filteredSubmissions = useMemo(() => {
    return viewType === "group"
      ? groupViewSubmissions.filter(s => s.taskId === selectedTaskId)
      : submissions.filter(s => s.taskId === selectedTaskId);
  }, [viewType, groupViewSubmissions, submissions, selectedTaskId]);

  // Sorted submissions for task view table
  const sortedSubmissions = useMemo(() => {
    if (!submissionSortColumn) return filteredSubmissions;
    const dir = submissionSortDirection === "asc" ? 1 : -1;
    return [...filteredSubmissions].sort((a, b) => {
      let va: string | number;
      let vb: string | number;
      if (submissionSortColumn === "group") {
        va = getGroupForStudent(a.studentId, a.studentName)?.name ?? "";
        vb = getGroupForStudent(b.studentId, b.studentName)?.name ?? "";
      } else if (submissionSortColumn === "datetime") {
        va = new Date(a.datetime).getTime();
        vb = new Date(b.datetime).getTime();
      } else if (submissionSortColumn === "username") {
        va = a.studentName ?? "";
        vb = b.studentName ?? "";
      } else if (submissionSortColumn === "attempts") {
        va = a.attemptNumber ?? 0;
        vb = b.attemptNumber ?? 0;
      } else {
        return 0;
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [filteredSubmissions, submissionSortColumn, submissionSortDirection]);

  const handleSubmissionSort = (column: SortColumn) => {
    if (submissionSortColumn === column) {
      setSubmissionSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSubmissionSortColumn(column);
      setSubmissionSortDirection("asc");
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (submissionSortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return submissionSortDirection === "asc"
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  // Auto-select the first submission for experiments when available
  useEffect(() => {
    if (!selectedSubmissionForExperiment && filteredSubmissions.length > 0) {
      setSelectedSubmissionForExperiment(filteredSubmissions[0].id);
    }
  }, [filteredSubmissions, selectedSubmissionForExperiment]);

  // Function to find submissions with empty feedback
  const findEmptySubmissions = (): Submission[] => {
    return filteredSubmissions.filter(submission => {
      // Check if feedback exists
      const hasFeedbackHistory = submission.feedbackHistory && submission.feedbackHistory.length > 0;
      const hasFeedback = submission.feedback && submission.feedback.trim() !== "";
      const hasGeneratedFeedback = generatedFeedback[submission.id]?.feedback;
      
      // Empty if no feedback in any form
      return !hasFeedbackHistory && !hasFeedback && !hasGeneratedFeedback;
    });
  };

  // Build conversation log from submission (feedback, questions, answers)
  const buildConversationLog = (submission: Submission, task: Task | undefined): Array<{type: string; content: string; datetime: string}> => {
    const logItems: Array<{type: string; content: string; datetime: string}> = [];

    // Add submission question answers (new format)
    if (submission.submissionQuestionAnswers && submission.submissionQuestionAnswers.length > 0) {
      submission.submissionQuestionAnswers.forEach((answer) => {
        const questionText = task?.submissionQuestion || "Submission Question";
        logItems.push({
          type: "Submission Question",
          content: `Q: ${questionText}\nA: ${answer.answer}`,
          datetime: answer.datetime,
        });
      });
    }
    // Legacy format: reflection field
    else if (submission.reflection && task?.submissionQuestion) {
      logItems.push({
        type: "Submission Question",
        content: `Q: ${task.submissionQuestion}\nA: ${submission.reflection}`,
        datetime: submission.datetime,
      });
    }

    // Add feedback entries (new format)
    if (submission.feedbackHistory && submission.feedbackHistory.length > 0) {
      submission.feedbackHistory.forEach((entry) => {
        logItems.push({
          type: "Feedback",
          content: entry.feedback,
          datetime: entry.datetime,
        });
      });
    }
    // Legacy format: feedback field
    else if (submission.feedback) {
      logItems.push({
        type: "Feedback",
        content: submission.feedback,
        datetime: submission.datetime,
      });
    }

    // Add feedback received question answers (new format)
    if (submission.feedbackReceivedQuestionAnswers && submission.feedbackReceivedQuestionAnswers.length > 0) {
      submission.feedbackReceivedQuestionAnswers.forEach((answer) => {
        const questionText = task?.feedbackReceivedQuestion || "Feedback Question";
        const answerText = `${answer.agreement ? "Yes" : "No"}${answer.comment ? ` - ${answer.comment}` : ""}`;
        logItems.push({
          type: "Feedback Question",
          content: `Q: ${questionText}\nA: ${answerText}`,
          datetime: answer.datetime,
        });
      });
    }
    // Legacy format: feedbackAgreement and feedbackComment
    else if ((submission.feedbackAgreement !== undefined || submission.feedbackComment) && task?.feedbackReceivedQuestion) {
      const answerText = `${submission.feedbackAgreement !== undefined ? (submission.feedbackAgreement ? "Yes" : "No") : ""}${submission.feedbackComment ? ` - ${submission.feedbackComment}` : ""}`;
      logItems.push({
        type: "Feedback Question",
        content: `Q: ${task.feedbackReceivedQuestion}\nA: ${answerText}`,
        datetime: submission.datetime,
      });
    }

    // Sort by datetime (newest first)
    return logItems.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  };

  // Fetch conversations for a submission
  const fetchSubmissionConversations = async (submission: Submission) => {
    if (!submission.stakeholderId || !submission.studentId) {
      toast({
        title: "Error",
        description: "No stakeholder associated with this submission",
        variant: "destructive",
      });
      return;
    }

    setLoadingConversations(true);
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      const response = await fetch(
        `${API_ENDPOINTS.chatMessages.getByStudentAndStakeholder(submission.studentId, submission.stakeholderId)}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setConversations(result.data || []);
          setConversationDialogOpen(true);
        }
      } else {
        throw new Error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoadingConversations(false);
    }
  };

  // Handler for "Generate (All Empty)" button
  const handleGenerateBatchFeedback = async () => {
    // Find empty submissions
    const empty = findEmptySubmissions();
    
    if (empty.length === 0) {
      toast({
        title: "No empty submissions",
        description: "All submissions already have feedback.",
      });
      return;
    }
    
    // Store empty submissions and show confirmation dialog
    setEmptySubmissions(empty);
    setBatchConfirmDialogOpen(true);
  };

  // Handler to confirm and execute batch generation
  const handleConfirmBatchGeneration = async () => {
    if (emptySubmissions.length === 0) return;
    
    setGeneratingBatchFeedback(true);
    setBatchConfirmDialogOpen(false);
    
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      
      // Find the task to check if AI guideline is enabled
      const task = tasks.find(t => t.id === selectedTaskId);
      const useAIGuideline = task?.enabledAIGuideline ?? true;
      
      // Validate that we have submissions
      const submissionIds = emptySubmissions.map(s => s.id);
      if (submissionIds.length === 0) {
        throw new Error('No submission IDs to process');
      }
      
      // Prepare request body
      const requestBody: any = {
        submissionIds: submissionIds,
        useAIGuideline: useAIGuideline,
      };
      
      // Check if selectedStakeholderId is a feedback mode or stakeholder
      const feedbackModes = ['fewshot', 'rule-based', 'revision', 'framework', 'student-involving', 'general'];
      
      // Default to "general" if nothing is selected
      const selectedMode = selectedStakeholderId || 'general';
      
      if (feedbackModes.includes(selectedMode)) {
        // New feedback generation approach
        requestBody.feedbackMode = selectedMode;
        // For rule-based mode, include instruction from task if available
        if (selectedMode === 'rule-based' && task?.instruction) {
          requestBody.instruction = task.instruction;
        }
      } else if (selectedMode === "learn-from-human") {
        // Legacy: few-shot learning via stakeholder
        requestBody.stakeholderId = "learn-from-human";
        requestBody.feedbackMode = "fewshot";
      } else {
        // Legacy: stakeholder-based approach (fallback for any remaining stakeholder IDs)
        requestBody.stakeholderId = selectedMode;
      }
      
      // Debug: Log the request body
      console.log('[Batch Feedback Generation] Request body:', JSON.stringify(requestBody, null, 2));
      console.log('[Batch Feedback Generation] Submission IDs:', requestBody.submissionIds);
      console.log('[Batch Feedback Generation] Selected mode:', selectedMode);
      console.log('[Batch Feedback Generation] Submission count:', requestBody.submissionIds.length);
      
      // Call batch endpoint - userName in query parameter (matching single feedback pattern)
      const response = await fetch(
        `${API_ENDPOINTS.assessmentSubmissions.generateFeedbackBatch}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          const { generated, failed, results } = result.data;
          
          // Store generated feedback locally (not saved yet) - same pattern as single generation
          const newGeneratedFeedback: { 
            [submissionId: string]: { 
              feedback: string;
              feedforward?: string;
              concept?: string;
              reflection?: string;
              criticalThinking?: string;
              taskQualityScore?: number | "not applicable";
              reflectionScore?: number;
              criticalthinkingScore?: number;
              conceptMasteryScore?: number;
              starScore?: number;
              stakeholderId?: string;
            } 
          } = {};
          
          results.forEach((item: any) => {
            if (item.success && item.feedback) {
              // Extract all comprehensive feedback fields
              const taskQualityScore = item.taskQualityScore !== undefined ? item.taskQualityScore : item.starScore;
              let starScore = item.starScore;
              // Convert 0-100 to 1-5 if needed
              if (starScore && starScore > 5) {
                starScore = Math.max(1, Math.min(5, Math.round(starScore / 20)));
              }
              
              newGeneratedFeedback[item.submissionId] = {
                feedback: item.feedback || "",
                feedforward: item.feedforward || undefined,
                concept: item.concept || undefined,
                reflection: item.reflection || undefined,
                criticalThinking: item.criticalThinking || undefined,
                taskQualityScore: taskQualityScore !== undefined ? taskQualityScore : undefined,
                reflectionScore: item.reflectionScore !== undefined ? item.reflectionScore : undefined,
                criticalthinkingScore: item.criticalthinkingScore !== undefined ? item.criticalthinkingScore : undefined,
                conceptMasteryScore: item.conceptMasteryScore !== undefined ? item.conceptMasteryScore : undefined,
                starScore: starScore, // Backward compatibility
                stakeholderId: item.stakeholderId || undefined,
              };
            }
          });
          
          // Update generated feedback state
          setGeneratedFeedback(prev => ({
            ...prev,
            ...newGeneratedFeedback
          }));
          
          toast({
            title: "Batch generation complete",
            description: `Generated feedback for ${generated} submission(s). ${failed > 0 ? `${failed} failed.` : ''} Click 'Edit' to review and save.`,
          });
        } else {
          throw new Error(result.error || 'Failed to generate batch feedback');
        }
      } else {
        // Enhanced error handling
        let errorMessage = 'Failed to generate batch feedback';
        try {
          const errorData = await response.json();
          console.error('[Batch Feedback Generation] Error response:', errorData);
          console.error('[Batch Feedback Generation] Request body sent:', JSON.stringify(requestBody, null, 2));
          errorMessage = errorData.message || errorData.error || errorData.details || errorMessage;
          
          // Log validation errors if present
          if (errorData.errors) {
            console.error('[Batch Feedback Generation] Validation errors:', errorData.errors);
            errorMessage += `: ${JSON.stringify(errorData.errors)}`;
          }
        } catch (parseError) {
          const errorText = await response.text();
          console.error('[Batch Feedback Generation] Error text:', errorText);
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error generating batch feedback:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate batch feedback",
        variant: "destructive",
      });
    } finally {
      setGeneratingBatchFeedback(false);
      setEmptySubmissions([]);
    }
  };

  // Experiment: Check prompts for selected approaches
  // Required Endpoint: GET /api/v1/assessment-submissions/:submissionId/prompt
  // Query Parameters: 
  //   - userName (string, required): Username of the requesting user
  //   - stakeholderId (string, optional): Stakeholder ID for the approach (use "learn-from-human" for few-shot learning)
  //   - useAIGuideline (boolean, optional, default: true): Whether to use AI guideline from task
  // Response:
  //   {
  //     "success": true,
  //     "data": {
  //       "submissionId": "string",
  //       "stakeholderId": "string | null",
  //       "prompt": "string", // The full prompt that will be sent to the AI model
  //       "approachName": "string", // Human-readable name of the approach
  //       "fewShotExamples": [...], // If stakeholderId is "learn-from-human", includes few-shot examples
  //       "metadata": {
  //         "taskId": "string",
  //         "taskTitle": "string",
  //         "studentId": "string",
  //         "submissionText": "string",
  //         "evaluationCriteria": "string"
  //       }
  //     }
  //   }
  const handleCheckPrompts = async () => {
    if (!selectedSubmissionForExperiment || selectedApproaches.length === 0) {
      toast({
        title: "Error",
        description: "Please select a submission and at least one agent approach",
        variant: "destructive",
      });
      return;
    }

    setCheckingPrompts(true);
    setExperimentResults({});

    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      const submission = filteredSubmissions.find(s => s.id === selectedSubmissionForExperiment);
      if (!submission) return;

      const task = tasks.find(t => t.id === submission.taskId);
      const useAIGuideline = task?.enabledAIGuideline ?? true;

      // Fetch prompts for each selected approach
      const promptPromises = selectedApproaches.map(async (approachId) => {
        try {
          // Build query parameters
          const params = new URLSearchParams({
            userName: userName,
            useAIGuideline: String(useAIGuideline),
          });

          // Set feedbackMode for new feedback generation approaches
          const feedbackModes = ['fewshot', 'rule-based', 'revision', 'framework', 'student-involving', 'general'];
          if (feedbackModes.includes(approachId)) {
            params.append('feedbackMode', approachId);
          } else if (approachId === "learn-from-human") {
            // Legacy: few-shot learning via stakeholder
            params.append('stakeholderId', 'learn-from-human');
            params.append('feedbackMode', 'fewshot');
          } else if (approachId) {
            // Legacy: stakeholder-based approach
            params.append('stakeholderId', approachId);
          }

          // Call endpoint: GET /api/v1/assessment-submissions/:id/prompt
          const response = await fetch(
            `${API_ENDPOINTS.assessmentSubmissions.getPrompt(submission.id)}?${params.toString()}`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            }
          );

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              return {
                approachId,
                prompt: result.data.prompt || "Prompt not available",
                approachName: result.data.approachName,
                fewShotExamples: result.data.fewShotExamples || [],
                metadata: result.data.metadata,
                error: null,
              };
            }
          }
          return {
            approachId,
            prompt: null,
            approachName: undefined,
            fewShotExamples: [],
            metadata: undefined,
            error: "Failed to fetch prompt",
          };
        } catch (error) {
          console.error(`Error fetching prompt for approach ${approachId}:`, error);
          return {
            approachId,
            prompt: null,
            approachName: undefined,
            fewShotExamples: [],
            metadata: undefined,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      });

      const results = await Promise.all(promptPromises);

      // Update results with prompts
      const newResults: typeof experimentResults = {};
      results.forEach(result => {
        newResults[result.approachId] = {
          prompt: result.prompt || result.error || "Prompt not available",
          approachName: result.approachName,
          fewShotExamples: result.fewShotExamples,
          metadata: result.metadata,
        };
      });
      setExperimentResults(newResults);
    } catch (error) {
      console.error('Error checking prompts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch prompts",
        variant: "destructive",
      });
    } finally {
      setCheckingPrompts(false);
    }
  };

  // Experiment: Generate feedback using all selected approaches
  // Uses existing endpoint: POST /api/v1/assessment-submissions/:submissionId/generate-feedback
  // Query Parameters:
  //   - userName (string, required): Username of the requesting user
  // Request Body (experiment mode):
  //   {
  //     "stakeholderId": "string | 'learn-from-human'", // or omitted when using feedbackMode-based approaches
  //     "feedbackMode": "general" | "fewshot" | "rule-based" | "revision" | "framework" | "student-involving",
  //     "useAIGuideline": boolean,
  //     "experimentInputText": "string" // NEW: free-text content for experiments; if empty/omitted, backend falls back to stored submission text
  //   }
  // Response:
  //   {
  //     "success": true,
  //     "data": {
  //       "id": "string",
  //       "feedback": "string",
  //       "feedforward": "string",
  //       "concept": "string",
  //       "reflection": "string",
  //       "criticalThinking": "string",
  //       "taskQualityScore": number,
  //       "reflectionScore": number,
  //       "criticalthinkingScore": number,
  //       "conceptMasteryScore": number,
  //       "stakeholderId": "string",
  //       "feedbackHistory": [...],
  //       "starScoreHistory": [...]
  //     }
  //   }
  const handleGenerateExperiments = async () => {
    // When a submission is selected, we use its stored text (omit experimentInputText so backend falls back to it).
    // The experiment textarea is ignored when submission is selected.
    if (!selectedSubmissionForExperiment || selectedApproaches.length === 0) {
      toast({
        title: "Error",
        description: "Please select a submission and at least one agent approach",
        variant: "destructive",
      });
      return;
    }

    setGeneratingExperiments(true);
    // Clear previous feedback results but keep prompts and metadata if they exist
    const newResults: typeof experimentResults = {};
    selectedApproaches.forEach(approachId => {
      const existingResult = experimentResults[approachId];
      newResults[approachId] = {
        prompt: existingResult?.prompt,
        approachName: existingResult?.approachName,
        fewShotExamples: existingResult?.fewShotExamples,
        metadata: existingResult?.metadata,
        loading: true,
      };
    });
    setExperimentResults(newResults);

    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      // We still call the existing generate-feedback endpoint, keyed by a submission ID.
      // The backend now supports `experimentInputText` for experimental runs while keeping
      // the stored submission text as a fallback.
      const submission =
        filteredSubmissions.find(s => s.id === selectedSubmissionForExperiment) ||
        filteredSubmissions[0];
      if (!submission) return;

      const task = tasks.find(t => t.id === submission.taskId);
      const useAIGuideline = task?.enabledAIGuideline ?? true;

      // Generate feedback for each approach in parallel.
      // When Experiment Text has content, use it instead of the selected submission's stored text.
      // When empty, omit experimentInputText so backend uses the stored submission text.
      const inputTextToUse = experimentInputText.trim();
      const generationPromises = selectedApproaches.map(async (approachId) => {
        try {
          const requestBody: any = {
            useAIGuideline: useAIGuideline,
          };
          if (inputTextToUse) {
            requestBody.experimentInputText = inputTextToUse;
          }

          // Set feedbackMode for new feedback generation approaches
          const feedbackModes = ['fewshot', 'rule-based', 'revision', 'framework', 'student-involving', 'general'];
          if (feedbackModes.includes(approachId)) {
            requestBody.feedbackMode = approachId;
            // For rule-based mode, include instruction from task if available
            if (approachId === 'rule-based' && task?.instruction) {
              requestBody.instruction = task.instruction;
            }
          } else if (approachId === "learn-from-human") {
            // Legacy: few-shot learning via stakeholder
            requestBody.stakeholderId = "learn-from-human";
            requestBody.feedbackMode = "fewshot";
          } else if (approachId) {
            // Legacy: stakeholder-based approach
            requestBody.stakeholderId = approachId;
          }

          const response = await fetch(
            `${API_ENDPOINTS.assessmentSubmissions.generateFeedback(submission.id)}?userName=${encodeURIComponent(userName)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(requestBody),
            }
          );

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const generatedData = result.data;
              const latestFeedbackEntry = generatedData.feedbackHistory && generatedData.feedbackHistory.length > 0
                ? generatedData.feedbackHistory[generatedData.feedbackHistory.length - 1]
                : null;
              
              const feedbackText = generatedData.feedback || latestFeedbackEntry?.feedback || "";
              
              return {
                approachId,
                feedback: feedbackText,
                error: null,
              };
            }
          }
          return {
            approachId,
            feedback: null,
            error: "Failed to generate feedback",
          };
        } catch (error) {
          console.error(`Error generating feedback for approach ${approachId}:`, error);
          return {
            approachId,
            feedback: null,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      });

      const results = await Promise.all(generationPromises);

      // Update experiment results with feedback
      const updatedResults: typeof experimentResults = {};
      results.forEach(result => {
        const existingResult = experimentResults[result.approachId];
        updatedResults[result.approachId] = {
          prompt: existingResult?.prompt,
          approachName: existingResult?.approachName,
          fewShotExamples: existingResult?.fewShotExamples,
          metadata: existingResult?.metadata,
          feedback: result.feedback || result.error || "Failed to generate",
          loading: false,
        };
      });
      setExperimentResults(updatedResults);
    } catch (error) {
      console.error('Error generating experiments:', error);
      toast({
        title: "Error",
        description: "Failed to generate feedback",
        variant: "destructive",
      });
      // Mark all as not loading
      const updatedResults: typeof experimentResults = {};
      selectedApproaches.forEach(approachId => {
        updatedResults[approachId] = {
          ...experimentResults[approachId],
          loading: false,
        };
      });
      setExperimentResults(updatedResults);
    } finally {
      setGeneratingExperiments(false);
    }
  };

  // Generate feedback for a submission
  const handleGenerateFeedback = async (submission: Submission) => {
    setGeneratingFeedback(submission.id);
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      
      // Find the task to check if AI guideline is enabled
      const task = tasks.find(t => t.id === submission.taskId);
      const useAIGuideline = task?.enabledAIGuideline ?? true;
      
      // Prepare request body according to new endpoint spec
      const requestBody: any = {
        useAIGuideline: useAIGuideline,
      };
      
      // Check if selectedStakeholderId is a feedback mode or stakeholder
      const feedbackModes = ['fewshot', 'rule-based', 'revision', 'framework', 'student-involving', 'general'];
      
      // Default to "general" if nothing is selected
      const selectedMode = selectedStakeholderId || 'general';
      
      if (feedbackModes.includes(selectedMode)) {
        // New feedback generation approach
        requestBody.feedbackMode = selectedMode;
        // For rule-based mode, include instruction from task if available
        if (selectedMode === 'rule-based' && task?.instruction) {
          requestBody.instruction = task.instruction;
        }
      } else if (selectedMode === "learn-from-human") {
        // Legacy: few-shot learning via stakeholder
        requestBody.stakeholderId = "learn-from-human";
        requestBody.feedbackMode = "fewshot";
      } else {
        // Legacy: stakeholder-based approach (fallback for any remaining stakeholder IDs)
        requestBody.stakeholderId = selectedMode;
      }
      
      const response = await fetch(
        `${API_ENDPOINTS.assessmentSubmissions.generateFeedback(submission.id)}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const result = await response.json();
      
        if (result.success && result.data) {
          // Store generated feedback locally (not saved yet)
          const generatedData = result.data;
          
          // Extract feedback from latest feedbackHistory entry or direct field
          const latestFeedbackEntry = generatedData.feedbackHistory && generatedData.feedbackHistory.length > 0
            ? generatedData.feedbackHistory[generatedData.feedbackHistory.length - 1]
            : null;
          
          const feedbackText = generatedData.feedback || latestFeedbackEntry?.feedback || "";
          const feedforward = generatedData.feedforward || latestFeedbackEntry?.feedforward || "";
          const concept = generatedData.concept || latestFeedbackEntry?.concept || "";
          const reflection = generatedData.reflection || latestFeedbackEntry?.reflection || "";
          const criticalThinking = generatedData.criticalThinking || latestFeedbackEntry?.criticalThinking || "";
          
          console.log('[Feedback Generation] Extracted Text Fields:', {
            feedback: feedbackText,
            feedforward,
            concept,
            reflection,
            criticalThinking,
          });
          
          // Extract scores - prefer taskQualityScore over starScore
          const taskQualityScore = generatedData.taskQualityScore !== undefined 
            ? generatedData.taskQualityScore 
            : latestFeedbackEntry?.taskQualityScore;
          const reflectionScore = generatedData.reflectionScore || latestFeedbackEntry?.reflectionScore;
          const criticalthinkingScore = generatedData.criticalthinkingScore || latestFeedbackEntry?.criticalthinkingScore;
          const conceptMasteryScore = generatedData.conceptMasteryScore || latestFeedbackEntry?.conceptMasteryScore;
          
          console.log('[Feedback Generation] Extracted Scores (before processing):', {
            taskQualityScore,
            reflectionScore,
            criticalthinkingScore,
            conceptMasteryScore,
            rawStarScore: generatedData.starScore,
            starScoreHistory: generatedData.starScoreHistory,
          });
          
          // Backward compatibility: convert starScore if needed
          let starScore = generatedData.starScore || latestFeedbackEntry?.starScore || generatedData.starScoreHistory?.[generatedData.starScoreHistory.length - 1]?.score;
          if (starScore && starScore > 5) {
            starScore = Math.max(1, Math.min(5, Math.round(starScore / 20)));
          }
          
          // If taskQualityScore not set but starScore is, use starScore
          const finalTaskQualityScore = taskQualityScore !== undefined ? taskQualityScore : starScore;
          
          const stakeholderId = generatedData.stakeholderId || latestFeedbackEntry?.stakeholderId;
          
          console.log('[Feedback Generation] Final Processed Values:', {
            feedback: feedbackText,
            feedforward,
            concept,
            reflection,
            criticalThinking,
            taskQualityScore: finalTaskQualityScore,
            reflectionScore,
            criticalthinkingScore,
            conceptMasteryScore,
            starScore,
            stakeholderId,
          });
          
          if (feedbackText || finalTaskQualityScore !== undefined) {
            setGeneratedFeedback(prev => ({
              ...prev,
              [submission.id]: {
                feedback: feedbackText,
                feedforward: feedforward || undefined,
                concept: concept || undefined,
                reflection: reflection || undefined,
                criticalThinking: criticalThinking || undefined,
                taskQualityScore: finalTaskQualityScore !== undefined ? finalTaskQualityScore : undefined,
                reflectionScore: reflectionScore !== undefined ? reflectionScore : undefined,
                criticalthinkingScore: criticalthinkingScore !== undefined ? criticalthinkingScore : undefined,
                conceptMasteryScore: conceptMasteryScore !== undefined ? conceptMasteryScore : undefined,
                starScore: starScore, // Backward compatibility
                stakeholderId: stakeholderId || undefined,
              }
            }));
          }
          
          toast({
            title: "Success",
            description: "Feedback generated successfully. Click 'Edit' to review and save.",
          });
        } else {
          throw new Error(result.error || 'Failed to generate feedback');
        }
      } else {
        throw new Error('Failed to generate feedback');
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate feedback",
        variant: "destructive",
      });
    } finally {
      setGeneratingFeedback(null);
    }
  };

  // Save edited feedback and score
  const handleSaveEdit = async () => {
    if (!editingSubmission) return;

    // Validate taskQualityScore if provided (0-5 or "not applicable")
    const taskQualityScore = editTaskQualityScore !== "" ? editTaskQualityScore : (editScore !== "" ? Number(editScore) : undefined);
    if (taskQualityScore !== undefined && taskQualityScore !== "not applicable") {
      if (Number(taskQualityScore) < 0 || Number(taskQualityScore) > 5) {
        toast({
          title: "Validation Error",
          description: "Task Quality Score must be between 0 and 5, or 'not applicable'",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate that feedback is provided (required)
    if (!editFeedback.trim()) {
      toast({
        title: "Validation Error",
        description: "Feedback is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      
      // Prepare request body according to new endpoint spec
      const requestBody: any = {
        feedback: editFeedback.trim(),
        updateStakeholderId: false,
      };
      
      // Add optional comprehensive feedback fields
      if (editFeedforward.trim()) {
        requestBody.feedforward = editFeedforward.trim();
      }
      if (editConcept.trim()) {
        requestBody.concept = editConcept.trim();
      }
      if (editReflection.trim()) {
        requestBody.reflection = editReflection.trim();
      }
      if (editCriticalThinking.trim()) {
        requestBody.criticalThinking = editCriticalThinking.trim();
      }
      
      // Add scores
      let taskQualityScoreValue: number | "not applicable" | undefined = undefined;
      if (editTaskQualityScore !== "") {
        taskQualityScoreValue = editTaskQualityScore;
      } else if (editScore !== "") {
        taskQualityScoreValue = Number(editScore);
      }
      
      if (taskQualityScoreValue !== undefined) {
        if (taskQualityScoreValue === "not applicable") {
          requestBody.taskQualityScore = "not applicable";
        } else if (typeof taskQualityScoreValue === 'number') {
          requestBody.taskQualityScore = Number(taskQualityScoreValue);
        }
      }
      if (editReflectionScore !== "") {
        requestBody.reflectionScore = Number(editReflectionScore);
      }
      if (editCriticalthinkingScore !== "") {
        requestBody.criticalthinkingScore = Number(editCriticalthinkingScore);
      }
      if (editConceptMasteryScore !== "") {
        requestBody.conceptMasteryScore = Number(editConceptMasteryScore);
      }
      
      // Backward compatibility: include starScore if taskQualityScore is set and is a number
      if (taskQualityScoreValue !== undefined && taskQualityScoreValue !== "not applicable" && typeof taskQualityScoreValue === 'number') {
        requestBody.starScore = Number(taskQualityScoreValue);
      }
      
      // Include stakeholderId only if it's a valid stakeholder ID (not a feedback mode)
      const feedbackModes = ['fewshot', 'rule-based', 'revision', 'framework', 'student-involving', 'general'];
      
      // Only include stakeholderId if it's NOT a feedback mode
      // Feedback modes should not be saved as stakeholderId
      if (selectedStakeholderId && !feedbackModes.includes(selectedStakeholderId)) {
        // This is a real stakeholder ID
        requestBody.stakeholderId = selectedStakeholderId;
      } else if (editingSubmission.stakeholderId && !feedbackModes.includes(editingSubmission.stakeholderId)) {
        // Use existing stakeholderId from submission if it's not a feedback mode
        requestBody.stakeholderId = editingSubmission.stakeholderId;
      }
      // If selectedStakeholderId is a feedback mode, don't send it as stakeholderId

      const response = await fetch(
        `${API_ENDPOINTS.assessmentSubmissions.saveFeedback(editingSubmission.id)}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Update the submission in the UI using the callback
          if (onSubmissionUpdate) {
            onSubmissionUpdate(result.data);
          }
          
          // Clear generated feedback for this submission since it's now saved
          if (editingSubmission.id) {
            setGeneratedFeedback(prev => {
              const newState = { ...prev };
              delete newState[editingSubmission.id];
              return newState;
            });
          }
          
          toast({
            title: "Success",
            description: "Feedback and score saved successfully",
          });
          setEditDialogOpen(false);
          setEditingSubmission(null);
          setEditFeedback("");
          setEditFeedforward("");
          setEditConcept("");
          setEditReflection("");
          setEditCriticalThinking("");
          setEditTaskQualityScore("");
          setEditReflectionScore("");
          setEditCriticalthinkingScore("");
          setEditConceptMasteryScore("");
          setEditScore("");
          setHoveredStar(null);
        } else {
          throw new Error(result.error || 'Failed to update submission');
        }
      } else {
        // Enhanced error handling
        let errorMessage = 'Failed to update submission';
        try {
          const errorData = await response.json();
          console.error('[Save Feedback] Error response:', errorData);
          console.error('[Save Feedback] Request body sent:', JSON.stringify(requestBody, null, 2));
          errorMessage = errorData.message || errorData.error || errorData.details || errorMessage;
          
          // Log validation errors if present
          if (errorData.errors) {
            console.error('[Save Feedback] Validation errors:', errorData.errors);
            errorMessage += `: ${JSON.stringify(errorData.errors)}`;
          }
        } catch (parseError) {
          const errorText = await response.text();
          console.error('[Save Feedback] Error text:', errorText);
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update submission",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a submission
  const handleDeleteSubmission = async () => {
    if (!submissionToDelete) return;

    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      const response = await fetch(
        `${API_ENDPOINTS.assessmentSubmissions.delete(submissionToDelete.id)}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Remove the submission from the UI using the callback
          if (onSubmissionDelete) {
            onSubmissionDelete(submissionToDelete.id);
          }
          
          toast({
            title: "Success",
            description: "Submission deleted successfully",
          });
          setDeleteDialogOpen(false);
          setSubmissionToDelete(null);
        } else {
          throw new Error(result.error || 'Failed to delete submission');
        }
      } else {
        throw new Error('Failed to delete submission');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete submission",
        variant: "destructive",
      });
    }
  };

  // Append attachment content to submission text (only once per submission, only when attachments exist)
  const handleAppendAttachmentToSubmission = async (submission: Submission) => {
    const hasAttachments = (submission.attachments?.length ?? 0) > 0;
    if (!hasAttachments || attachmentAppendedSubmissionIds.has(submission.id)) return;
    setAppendingAttachmentSubmissionId(submission.id);
    try {
      const result = await readSubmissionAttachments(submission.id);
      const content = result?.content?.trim();
      if (!content) {
        toast({
          title: "No content to append",
          description: "No attachment content was read. You can try again or view attachment in the Attachment column.",
          variant: "destructive",
        });
        return;
      }
      const currentText = (submission.submission || '').trim();
      const newText = currentText ? currentText + '\n\n' + content : content;
      const userName = localStorage.getItem('ai4edu_user') || '';
      const response = await fetch(
        `${API_ENDPOINTS.assessmentSubmissions.update(submission.id)}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ submission: newText }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update submission' }));
        throw new Error(errorData.message || errorData.error || 'Failed to update submission');
      }
      const data = await response.json();
      const updatedSubmission = data.success && data.data ? data.data : { ...submission, submission: newText };
      if (onSubmissionUpdate) onSubmissionUpdate(updatedSubmission);
      setAttachmentAppendedSubmissionIds(prev => new Set([...prev, submission.id]));
      toast({
        title: "Attachment appended",
        description: "Attachment content was appended to the submission text.",
      });
    } catch (error) {
      console.error('Error appending attachment to submission:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to append attachment content to submission",
        variant: "destructive",
      });
    } finally {
      setAppendingAttachmentSubmissionId(null);
    }
  };

  // Open detail view
  const handleOpenDetailView = (submission: Submission) => {
    setSelectedSubmission(submission);
    setDetailDialogOpen(true);
  };

  // NOTE: Actual submissions loading is handled in parent Assessment via fetchSubmissions.
  // Here we just provide a refresh button that triggers that logic via a custom event.
  const handleRefreshSubmissions = () => {
    try {
      setIsRefreshing(true);
      // Parent listens for this custom event and calls fetchSubmissions
      const event = new CustomEvent("assessment-refresh-submissions");
      window.dispatchEvent(event);
    } finally {
      // Small delay to show spinner even if very fast
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

    return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold mb-2">Submission</h2>
        <p className="text-muted-foreground">View and manage student submissions</p>
        </div>
        <div className="flex items-center gap-4">
          <Label>View Type:</Label>
          <Select value={viewType} onValueChange={(v) => onViewTypeChange(v as "individual" | "group")}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="group">Group</SelectItem>
            </SelectContent>
          </Select>
        </div>
          </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="master">Master View</TabsTrigger>
          <TabsTrigger value="task">Task View</TabsTrigger>
        </TabsList>

        <TabsContent value="master" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
              <CardTitle>Task vs Students Heatmap</CardTitle>
              <CardDescription>
                Green cells indicate submissions with scores. Grey cells indicate no submission.
              </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshSubmissions}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[600px] border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background z-20 min-w-[150px] max-w-[200px] border-r shadow-sm">Task</TableHead>
                      {viewType === "individual" 
                        ? students.map(student => (
                        <TableHead key={student} className="min-w-[60px] text-center">{student}</TableHead>
                          ))
                        : activeGroups.map(group => (
                            <TableHead key={group.id} className="min-w-[60px] text-center">{group.name}</TableHead>
                          ))
                      }
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewType === "individual" ? (
                      heatmapData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium sticky left-0 bg-background z-10 border-r min-w-[150px] max-w-[200px] shadow-sm">
                          <div className="truncate" title={row.task}>{row.task}</div>
                        </TableCell>
                        {students.map(student => {
                          const score = row[student];
                          return (
                            <TableCell key={student} className="p-1">
                              <div
                                className={`w-10 h-10 ${getCellColor(score)} rounded flex items-center justify-center text-white font-semibold text-xs`}
                                title={score !== null ? `Score: ${score}` : "No submission"}
                              >
                                {score !== null ? score : ""}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      ))
                    ) : (
                      heatmapData.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium sticky left-0 bg-background z-10 border-r min-w-[150px] max-w-[200px] shadow-sm">
                            <div className="truncate" title={row.task}>{row.task}</div>
                          </TableCell>
                          {activeGroups.map(group => {
                            const score = row[group.id];
                            return (
                              <TableCell key={group.id} className="p-1">
                                <div
                                  className={`w-10 h-10 ${getCellColor(score)} rounded flex items-center justify-center text-white font-semibold text-xs`}
                                  title={score !== null ? `Score: ${score}` : "No submission"}
                                >
                                  {score !== null ? score : ""}
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="task" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task View</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Select Task</Label>
                  <Select value={selectedTaskId || undefined} onValueChange={onTaskChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                  <SelectContent>
                      {tasks.map(task => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.taskTitle || task.keyword || task.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
                <div>
                  <Label>Select Feedback Generation Approach</Label>
                <Select
                    value={selectedStakeholderId || "general"} 
                  onValueChange={(value) => {
                      onStakeholderChange(value);
                  }}
                >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a feedback generation approach" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="general">General (Default)</SelectItem>
                      <SelectItem value="fewshot">Few-shot Learning</SelectItem>
                      <SelectItem value="rule-based">Rule-based Grading</SelectItem>
                      <SelectItem value="revision">Revision Checking</SelectItem>
                      <SelectItem value="framework">Framework Aligning</SelectItem>
                      <SelectItem value="student-involving">Student Involving</SelectItem>
                  </SelectContent>
                </Select>
                </div>
              </div>

              {selectedTaskId && (
                <>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setExperimentDialogOpen(true)}
                      disabled={filteredSubmissions.length === 0}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Experiment
                    </Button>
                    <Button
                      onClick={handleGenerateBatchFeedback}
                      disabled={generatingBatchFeedback || !selectedTaskId}
                    >
                      <Sparkles className={`h-4 w-4 mr-2 ${generatingBatchFeedback ? "animate-spin" : ""}`} />
                      {generatingBatchFeedback ? "Generating..." : "Generate (All Empty)"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        toast({ title: "Saving all changes..." });
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save (All Changes)
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        {viewType === "group" && (
                          <TableHead>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="-ml-2 h-8 font-medium"
                              onClick={() => handleSubmissionSort("group")}
                            >
                              Group{getSortIcon("group")}
                            </Button>
                          </TableHead>
                        )}
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-2 h-8 font-medium"
                            onClick={() => handleSubmissionSort("datetime")}
                          >
                            DateTime{getSortIcon("datetime")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-2 h-8 font-medium"
                            onClick={() => handleSubmissionSort("username")}
                          >
                            Username{getSortIcon("username")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-2 h-8 font-medium"
                            onClick={() => handleSubmissionSort("attempts")}
                          >
                            Attempts{getSortIcon("attempts")}
                          </Button>
                        </TableHead>
                        <TableHead>Submission</TableHead>
                        <TableHead>Attachment</TableHead>
                        <TableHead>Conversation Log</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedSubmissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={viewType === "group" ? 10 : 9} className="text-center text-muted-foreground">
                            No submissions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedSubmissions.map(submission => {
                          const group = viewType === "group" ? getGroupForStudent(submission.studentId, submission.studentName) : null;
                          return (
                          <TableRow key={submission.id}>
                              {viewType === "group" && (
                                <TableCell>{group ? group.name : "-"}</TableCell>
                              )}
                            <TableCell>{new Date(submission.datetime).toLocaleString()}</TableCell>
                            <TableCell>{submission.studentName}</TableCell>
                            <TableCell>{submission.attemptNumber}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="max-w-xs truncate">{submission.submission}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setDetailDialogOpen(true);
                                  }}
                                  title="View full submission"
                                >
                                <Eye className="h-4 w-4" />
                              </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const attachments = submission.attachments || [];
                                if (attachments.length === 0) {
                                  return <span className="text-muted-foreground">-</span>;
                                }
                                return (
                                  <div className="flex flex-col gap-1">
                                    {attachments.map((attachment: string, idx: number) => {
                                      const fileName = attachment.split('/').pop() || attachment;
                                      return (
                                        <div key={idx} className="flex items-center gap-2">
                                          <a
                                            href={API_ENDPOINTS.files.download(attachment)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-primary hover:underline text-sm flex-1"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                            }}
                                          >
                                            <Paperclip className="h-3 w-3" />
                                            <span className="truncate max-w-[150px]" title={fileName}>
                                              {fileName}
                                            </span>
                                          </a>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2"
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              setAttachmentContentDialog({
                                                open: true,
                                                submissionId: submission.id,
                                                content: '',
                                                details: null,
                                                loading: true,
                                              });
                                              try {
                                                const result = await readSubmissionAttachments(submission.id);
                                                if (result) {
                                                  setAttachmentContentDialog({
                                                    open: true,
                                                    submissionId: submission.id,
                                                    content: result.content,
                                                    details: result.details,
                                                    loading: false,
                                                  });
                                                } else {
                                                  setAttachmentContentDialog(prev => ({
                                                    ...prev,
                                                    loading: false,
                                                    content: 'No attachment content available',
                                                  }));
                                                }
                                              } catch (error) {
                                                console.error('Error reading attachments:', error);
                                                setAttachmentContentDialog(prev => ({
                                                  ...prev,
                                                  loading: false,
                                                  content: error instanceof Error ? error.message : 'Failed to read attachment content',
                                                }));
                                              }
                                            }}
                                            title="View attachment content"
                                          >
                                            <Eye className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setConversationDialogOpen(true);
                                }}
                                disabled={(() => {
                                  const task = tasks.find(t => t.id === submission.taskId);
                                  const logItems = buildConversationLog(submission, task);
                                  return logItems.length === 0;
                                })()}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                            <TableCell>
                              {(() => {
                                // Check for generated feedback score first (not saved yet)
                                const generated = generatedFeedback[submission.id];
                                if (generated?.starScore) {
                                  return (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      <span className="italic text-muted-foreground">{generated.starScore}/5</span>
                                </div>
                                  );
                                }
                                // Then check saved score
                                const savedScore = submission.starScoreHistory && submission.starScoreHistory.length > 0
                                  ? submission.starScoreHistory[submission.starScoreHistory.length - 1].score
                                  : submission.starScore;
                                // Convert 0-100 to 1-5 if needed for display
                                const displayScore = savedScore && savedScore > 5 ? Math.max(1, Math.min(5, Math.round(savedScore / 20))) : savedScore;
                                return displayScore !== undefined ? (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{displayScore}/5</span>
                                  </div>
                                ) : "-";
                              })()}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {(() => {
                                // Check for generated feedback first (not saved yet)
                                const generated = generatedFeedback[submission.id];
                                if (generated?.feedback) {
                                  return <span className="italic text-muted-foreground">{generated.feedback}</span>;
                                }
                                // Then check saved feedback
                                return submission.feedbackHistory && submission.feedbackHistory.length > 0
                                  ? submission.feedbackHistory[submission.feedbackHistory.length - 1].feedback
                                  : submission.feedback || "-";
                              })()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                                  onClick={() => {
                              setEditingSubmission(submission);
                              // Check for generated feedback first (not saved yet)
                              const generated = generatedFeedback[submission.id];
                              let latestFeedback = "";
                              let latestFeedforward = "";
                              let latestConcept = "";
                              let latestReflection = "";
                              let latestCriticalThinking = "";
                              let latestTaskQualityScore: number | "not applicable" | "" = "";
                              let latestReflectionScore: number | "" = "";
                              let latestCriticalthinkingScore: number | "" = "";
                              let latestConceptMasteryScore: number | "" = "";
                              let latestScore: number | "" = "";
                              
                              if (generated) {
                                latestFeedback = generated.feedback || "";
                                latestFeedforward = generated.feedforward || "";
                                latestConcept = generated.concept || "";
                                latestReflection = generated.reflection || "";
                                latestCriticalThinking = generated.criticalThinking || "";
                                latestTaskQualityScore = generated.taskQualityScore !== undefined ? generated.taskQualityScore : "";
                                latestReflectionScore = generated.reflectionScore !== undefined ? generated.reflectionScore : "";
                                latestCriticalthinkingScore = generated.criticalthinkingScore !== undefined ? generated.criticalthinkingScore : "";
                                latestConceptMasteryScore = generated.conceptMasteryScore !== undefined ? generated.conceptMasteryScore : "";
                                latestScore = generated.starScore !== undefined ? generated.starScore : "";
                              } else {
                                // Use saved feedback from latest feedbackHistory entry
                                const latestEntry = submission.feedbackHistory && submission.feedbackHistory.length > 0
                                  ? submission.feedbackHistory[submission.feedbackHistory.length - 1]
                                  : null;
                                
                                latestFeedback = latestEntry?.feedback || submission.feedback || "";
                                latestFeedforward = latestEntry?.feedforward || submission.feedforward || "";
                                latestConcept = latestEntry?.concept || submission.concept || "";
                                latestReflection = latestEntry?.reflection || submission.reflection || "";
                                latestCriticalThinking = latestEntry?.criticalThinking || submission.criticalThinking || "";
                                latestTaskQualityScore = latestEntry?.taskQualityScore !== undefined 
                                  ? latestEntry.taskQualityScore 
                                  : (submission.taskQualityScore !== undefined ? submission.taskQualityScore : ("" as ""));
                                latestReflectionScore = latestEntry?.reflectionScore !== undefined 
                                  ? latestEntry.reflectionScore 
                                  : (submission.reflectionScore !== undefined ? submission.reflectionScore : "");
                                latestCriticalthinkingScore = latestEntry?.criticalthinkingScore !== undefined 
                                  ? latestEntry.criticalthinkingScore 
                                  : (submission.criticalthinkingScore !== undefined ? submission.criticalthinkingScore : "");
                                latestConceptMasteryScore = latestEntry?.conceptMasteryScore !== undefined 
                                  ? latestEntry.conceptMasteryScore 
                                  : (submission.conceptMasteryScore !== undefined ? submission.conceptMasteryScore : "");
                                
                                // Backward compatibility: use starScore if taskQualityScore not available
                                const savedScore = latestEntry?.taskQualityScore !== undefined 
                                  ? (latestEntry.taskQualityScore === "not applicable" ? undefined : Number(latestEntry.taskQualityScore))
                                  : (submission.taskQualityScore !== undefined 
                                    ? (submission.taskQualityScore === "not applicable" ? undefined : Number(submission.taskQualityScore))
                                    : (submission.starScoreHistory && submission.starScoreHistory.length > 0
                                      ? submission.starScoreHistory[submission.starScoreHistory.length - 1].score
                                      : submission.starScore));
                                // Convert 0-100 to 1-5 if needed
                                if (savedScore !== undefined && savedScore !== null) {
                                  latestScore = savedScore > 5 ? Math.max(1, Math.min(5, Math.round(savedScore / 20))) : savedScore;
                                  if (latestTaskQualityScore === "" || latestTaskQualityScore === undefined) {
                                    latestTaskQualityScore = latestScore;
                                  }
                                }
                              }
                              
                              setEditFeedback(latestFeedback);
                              setEditFeedforward(latestFeedforward);
                              setEditConcept(latestConcept);
                              setEditReflection(latestReflection);
                              setEditCriticalThinking(latestCriticalThinking);
                              setEditTaskQualityScore(latestTaskQualityScore);
                              setEditReflectionScore(latestReflectionScore);
                              setEditCriticalthinkingScore(latestCriticalthinkingScore);
                              setEditConceptMasteryScore(latestConceptMasteryScore);
                              setEditScore(latestScore === "" ? "" : Number(latestScore));
                              setHoveredStar(null);
                              setEditDialogOpen(true);
                            }}
                            title="Edit feedback and score"
                          >
                            <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                            onClick={() => handleGenerateFeedback(submission)}
                            disabled={generatingFeedback === submission.id}
                            title="Generate feedback"
                          >
                            {generatingFeedback === submission.id ? (
                              <Clock className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                                </Button>
                                {(submission.attachments?.length ?? 0) > 0 && !attachmentAppendedSubmissionIds.has(submission.id) ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAppendAttachmentToSubmission(submission)}
                                    disabled
                                    title="Append attachment content to submission text"
                                  >
                                    {appendingAttachmentSubmissionId === submission.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Paperclip className="h-4 w-4" />
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenDetailView(submission)}
                                    title="View details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                              setSubmissionToDelete(submission);
                              setDeleteDialogOpen(true);
                                  }}
                            title="Delete submission"
                                >
                                  <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                            </TableCell>
                          </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>

                  {/* Experiment Results Display */}
                  {Object.keys(experimentResults).length > 0 && (
                    <div className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Experiment Results</CardTitle>
                          <CardDescription>
                            Compare prompts and feedback generated by different agent approaches
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedApproaches.map((approachId) => {
                              const result = experimentResults[approachId];
                              // Use backend's approachName if available, fallback to derived name
                              const approachName = result?.approachName || 
                                (approachId === "learn-from-human" 
                                  ? "Learn from Human" 
                                  : roles.find(r => r.id === approachId)?.name || approachId);
                              
                              return (
                                <div key={approachId} className="border rounded-lg p-4 space-y-4">
                                  <div className="font-semibold text-lg border-b pb-2">
                                    {approachName}
                                  </div>
                                  
                                  {/* Show few-shot examples if available */}
                                  {result?.fewShotExamples && result.fewShotExamples.length > 0 && (
                                    <div className="space-y-2">
                                      <Label className="text-sm font-semibold">Few-Shot Examples ({result.fewShotExamples.length}):</Label>
                                      <div className="text-xs bg-muted/50 p-2 rounded max-h-40 overflow-y-auto">
                                        {result.fewShotExamples.map((example: any, idx: number) => (
                                          <div key={idx} className="mb-2 pb-2 border-b last:border-0">
                                            <div className="font-semibold text-xs mb-1">Example {idx + 1}:</div>
                                            <div className="text-xs opacity-80 whitespace-pre-wrap">
                                              {typeof example === 'object' 
                                                ? JSON.stringify(example, null, 2) 
                                                : String(example)}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {result?.prompt && (
                                    <div className="space-y-2">
                                      <Label className="text-sm font-semibold">Prompt:</Label>
                                      <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap max-h-60 overflow-y-auto">
                                        {result.prompt}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {result?.loading && (
                                    <div className="flex items-center justify-center py-8">
                                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                      <span className="ml-2 text-sm text-muted-foreground">Generating...</span>
                                    </div>
                                  )}
                                  
                                  {result?.feedback && !result.loading && (
                                    <div className="space-y-2">
                                      <Label className="text-sm font-semibold">Generated Feedback:</Label>
                                      <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap max-h-96 overflow-y-auto">
                                        {result.feedback}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Experiment Dialog */}
      <Dialog open={experimentDialogOpen} onOpenChange={setExperimentDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Experiment with Agent Approaches</DialogTitle>
            <DialogDescription>
              Select agent approaches and a submission to compare prompts and generated feedback
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Feedback Generation Approaches (multiple selection)</Label>
              <div className="grid grid-cols-3 gap-4 border rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="approach-fewshot"
                    checked={selectedApproaches.includes("fewshot")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedApproaches([...selectedApproaches, "fewshot"]);
                      } else {
                        setSelectedApproaches(selectedApproaches.filter(a => a !== "fewshot"));
                      }
                    }}
                  />
                  <Label htmlFor="approach-fewshot" className="cursor-pointer">
                    Few-shot Learning
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="approach-rule-based"
                    checked={selectedApproaches.includes("rule-based")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedApproaches([...selectedApproaches, "rule-based"]);
                      } else {
                        setSelectedApproaches(selectedApproaches.filter(a => a !== "rule-based"));
                      }
                    }}
                  />
                  <Label htmlFor="approach-rule-based" className="cursor-pointer">
                    Rule-based Grading
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="approach-revision"
                    checked={selectedApproaches.includes("revision")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedApproaches([...selectedApproaches, "revision"]);
                      } else {
                        setSelectedApproaches(selectedApproaches.filter(a => a !== "revision"));
                      }
                    }}
                  />
                  <Label htmlFor="approach-revision" className="cursor-pointer">
                    Revision Checking
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="approach-framework"
                    checked={selectedApproaches.includes("framework")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedApproaches([...selectedApproaches, "framework"]);
                      } else {
                        setSelectedApproaches(selectedApproaches.filter(a => a !== "framework"));
                      }
                    }}
                  />
                  <Label htmlFor="approach-framework" className="cursor-pointer">
                    Framework Aligning
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="approach-student-involving"
                    checked={selectedApproaches.includes("student-involving")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedApproaches([...selectedApproaches, "student-involving"]);
                      } else {
                        setSelectedApproaches(selectedApproaches.filter(a => a !== "student-involving"));
                      }
                    }}
                  />
                  <Label htmlFor="approach-student-involving" className="cursor-pointer">
                    Student Involving
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="approach-general"
                    checked={selectedApproaches.includes("general")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedApproaches([...selectedApproaches, "general"]);
                      } else {
                        setSelectedApproaches(selectedApproaches.filter(a => a !== "general"));
                      }
                    }}
                  />
                  <Label htmlFor="approach-general" className="cursor-pointer">
                    General (Default)
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Submission</Label>
              <Select
                value={selectedSubmissionForExperiment}
                onValueChange={setSelectedSubmissionForExperiment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a submission to experiment with" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubmissions.map((submission) => (
                    <SelectItem key={submission.id} value={submission.id}>
                      {submission.studentName} - {new Date(submission.datetime).toLocaleString()} (Attempt {submission.attemptNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experiment-input-text">Experiment Text</Label>
              <Textarea
                id="experiment-input-text"
                placeholder="Optional: paste or type text here to use instead of the selected submission's content. Leave empty to use the selected submission."
                value={experimentInputText}
                onChange={(e) => setExperimentInputText(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            {/* Show Experiment Results INSIDE the dialog */}
            {Object.keys(experimentResults).length > 0 && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <Label className="text-base font-semibold">Experiment Results</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Compare prompts and feedback generated by different agent approaches
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedApproaches.map((approachId) => {
                    const result = experimentResults[approachId];
                    // Use backend's approachName if available, fallback to derived name
                    const approachNameMap: { [key: string]: string } = {
                      'fewshot': 'Few-shot Learning',
                      'rule-based': 'Rule-based Grading',
                      'revision': 'Revision Checking',
                      'framework': 'Framework Aligning',
                      'student-involving': 'Student Involving',
                      'general': 'General (Default)',
                      'learn-from-human': 'Learn from Human'
                    };
                    const approachName = result?.approachName || 
                      approachNameMap[approachId] || 
                      roles.find(r => r.id === approachId)?.name || 
                      approachId;
                    
                    return (
                      <div key={approachId} className="border rounded-lg p-4 space-y-4 bg-card">
                        <div className="font-semibold text-lg border-b pb-2">
                          {approachName}
                        </div>
                        
                        {/* Show few-shot examples if available */}
                        {result?.fewShotExamples && result.fewShotExamples.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Few-Shot Examples ({result.fewShotExamples.length}):</Label>
                            <div className="text-xs bg-muted/50 p-2 rounded max-h-40 overflow-y-auto">
                              {result.fewShotExamples.map((example: any, idx: number) => (
                                <div key={idx} className="mb-2 pb-2 border-b last:border-0">
                                  <div className="font-semibold text-xs mb-1">Example {idx + 1}:</div>
                                  <div className="text-xs opacity-80 whitespace-pre-wrap">
                                    {typeof example === 'object' 
                                      ? JSON.stringify(example, null, 2) 
                                      : String(example)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {result?.prompt && (
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Prompt:</Label>
                            <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap max-h-60 overflow-y-auto font-mono text-xs">
                              {result.prompt}
                            </div>
                          </div>
                        )}
                        
                        {result?.loading && (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-muted-foreground">Generating...</span>
                          </div>
                        )}
                        
                        {result?.feedback && !result.loading && (
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Generated Feedback:</Label>
                            <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap max-h-96 overflow-y-auto">
                              {result.feedback}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={handleCheckPrompts}
              disabled={checkingPrompts || selectedApproaches.length === 0 || !selectedSubmissionForExperiment}
            >
              {checkingPrompts ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Prompt"
              )}
            </Button>
            <Button
              onClick={handleGenerateExperiments}
              disabled={generatingExperiments || selectedApproaches.length === 0 || !selectedSubmissionForExperiment}
            >
              {generatingExperiments ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
            <Button variant="outline" onClick={() => setExperimentDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conversation Dialog */}
      <Dialog open={conversationDialogOpen} onOpenChange={setConversationDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conversation Log</DialogTitle>
            <DialogDescription>
              All feedback, questions, and answers for {selectedSubmission?.studentName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSubmission ? (() => {
              const task = tasks.find(t => t.id === selectedSubmission.taskId);
              const logItems = buildConversationLog(selectedSubmission, task);
              
              if (logItems.length === 0) {
                return <p className="text-sm text-muted-foreground">No conversation log items found</p>;
              }
              
              return (
                <div className="space-y-4">
                  {logItems.map((item, idx) => (
                    <div key={idx} className="border-l-4 pl-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm">
                          {item.type}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(item.datetime).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                        {truncateWords(item.content, 100)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })() : (
              <p className="text-sm text-muted-foreground">No submission selected</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setConversationDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Feedback and Score Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Feedback and Score</DialogTitle>
            <DialogDescription>
              Update feedback and score for {editingSubmission?.studentName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="edit-feedback">Feedback <span className="text-red-500">*</span></Label>
              <Textarea
                id="edit-feedback"
                value={editFeedback}
                onChange={(e) => setEditFeedback(e.target.value)}
                placeholder="Enter feedback (required)"
                rows={6}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-feedforward">Feedforward</Label>
              <Textarea
                id="edit-feedforward"
                value={editFeedforward}
                onChange={(e) => setEditFeedforward(e.target.value)}
                placeholder="Enter feedforward"
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-concept">Concept</Label>
              <Textarea
                id="edit-concept"
                value={editConcept}
                onChange={(e) => setEditConcept(e.target.value)}
                placeholder="Enter concept feedback"
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reflection">Reflection</Label>
              <Textarea
                id="edit-reflection"
                value={editReflection}
                onChange={(e) => setEditReflection(e.target.value)}
                placeholder="Enter reflection feedback"
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-critical-thinking">Critical Thinking</Label>
              <Textarea
                id="edit-critical-thinking"
                value={editCriticalThinking}
                onChange={(e) => setEditCriticalThinking(e.target.value)}
                placeholder="Enter critical thinking feedback"
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Task Quality Score</Label>
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((score) => {
                    const currentScore = editTaskQualityScore === "" || editTaskQualityScore === "not applicable" 
                      ? undefined 
                      : Number(editTaskQualityScore);
                    const isSelected = currentScore === score;
                    
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => {
                          setEditTaskQualityScore(score);
                          setEditScore(score); // Sync with backward compatibility field
                        }}
                        className={`px-3 py-1 rounded border transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:bg-muted'
                        }`}
                      >
                        {score}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setEditTaskQualityScore("not applicable");
                      setEditScore("");
                    }}
                    className={`px-3 py-1 rounded border transition-colors text-xs ${
                      editTaskQualityScore === "not applicable"
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                  >
                    N/A
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reflection Score</Label>
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((score) => {
                    const currentScore = editReflectionScore === "" ? undefined : Number(editReflectionScore);
                    const isSelected = currentScore === score;
                    
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setEditReflectionScore(score)}
                        className={`px-3 py-1 rounded border transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:bg-muted'
                        }`}
                      >
                        {score}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setEditReflectionScore("")}
                    className={`px-3 py-1 rounded border transition-colors text-xs ${
                      editReflectionScore === ""
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                  >
                    N/A
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Critical Thinking Score</Label>
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((score) => {
                    const currentScore = editCriticalthinkingScore === "" ? undefined : Number(editCriticalthinkingScore);
                    const isSelected = currentScore === score;
                    
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setEditCriticalthinkingScore(score)}
                        className={`px-3 py-1 rounded border transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:bg-muted'
                        }`}
                      >
                        {score}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setEditCriticalthinkingScore("")}
                    className={`px-3 py-1 rounded border transition-colors text-xs ${
                      editCriticalthinkingScore === ""
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                  >
                    N/A
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Concept Mastery Score</Label>
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((score) => {
                    const currentScore = editConceptMasteryScore === "" ? undefined : Number(editConceptMasteryScore);
                    const isSelected = currentScore === score;
                    
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setEditConceptMasteryScore(score)}
                        className={`px-3 py-1 rounded border transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:bg-muted'
                        }`}
                      >
                        {score}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setEditConceptMasteryScore("")}
                    className={`px-3 py-1 rounded border transition-colors text-xs ${
                      editConceptMasteryScore === ""
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                  >
                    N/A
                  </button>
                </div>
              </div>
            </div>
            {/* Backward compatibility: Star rating (maps to taskQualityScore) */}
            <div className="space-y-2">
              <Label>Score (1-5) - Maps to Task Quality Score</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentStars = editScore === "" ? 0 : Number(editScore);
                  const displayStars = hoveredStar !== null ? hoveredStar : currentStars;
                  const isFilled = star <= displayStars;
                  
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setEditScore(star);
                        setEditTaskQualityScore(star);
                        setHoveredStar(null);
                      }}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded"
                      aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          isFilled
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-300 text-gray-300'
                        }`}
                      />
                    </button>
                  );
                })}
                {editScore !== "" && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({editScore}/5)
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingSubmission(null);
                setEditFeedback("");
                setEditFeedforward("");
                setEditConcept("");
                setEditReflection("");
                setEditCriticalThinking("");
                setEditTaskQualityScore("");
                setEditReflectionScore("");
                setEditCriticalthinkingScore("");
                setEditConceptMasteryScore("");
                setEditScore("");
                setHoveredStar(null);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Detailed view of submission from {selectedSubmission?.studentName}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Student</Label>
                <p className="text-sm">{selectedSubmission.studentName}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Date & Time</Label>
                <p className="text-sm">{new Date(selectedSubmission.datetime).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Attempt Number</Label>
                <p className="text-sm">{selectedSubmission.attemptNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Submission</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedSubmission.submission}</p>
                </div>
              </div>
              {(() => {
                const latestScore = selectedSubmission.starScoreHistory && selectedSubmission.starScoreHistory.length > 0
                  ? selectedSubmission.starScoreHistory[selectedSubmission.starScoreHistory.length - 1].score
                  : selectedSubmission.starScore;
                return latestScore !== undefined && latestScore !== null ? (
                  <div>
                    <Label className="text-sm font-semibold">Score</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{latestScore}</span>
                    </div>
                  </div>
                ) : null;
              })()}
              {(() => {
                const latestFeedback = selectedSubmission.feedbackHistory && selectedSubmission.feedbackHistory.length > 0
                  ? selectedSubmission.feedbackHistory[selectedSubmission.feedbackHistory.length - 1].feedback
                  : selectedSubmission.feedback;
                return latestFeedback ? (
                  <div>
                    <Label className="text-sm font-semibold">Feedback</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{latestFeedback}</p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {/* Batch Feedback Generation Confirmation Dialog */}
      <AlertDialog open={batchConfirmDialogOpen} onOpenChange={setBatchConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Feedback for All Empty Submissions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate feedback for {emptySubmissions.length} submission(s) that currently have no feedback.
              The feedback will be generated but not saved - you can review and edit each one before saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBatchGeneration}>
              Generate Feedback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Attachment Content Dialog */}
      <Dialog open={attachmentContentDialog.open} onOpenChange={(open) => {
        if (!open) {
          setAttachmentContentDialog({ open: false, submissionId: '', content: '', details: null, loading: false });
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attachment Content</DialogTitle>
            <DialogDescription>
              Content from attachments for submission {attachmentContentDialog.submissionId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {attachmentContentDialog.loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading attachment content...</span>
              </div>
            ) : (
              <>
                {attachmentContentDialog.details && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="text-sm font-semibold">Attachment Summary</div>
                    <div className="text-sm text-muted-foreground">
                      Read: {attachmentContentDialog.details.read?.length || 0} / Total: {attachmentContentDialog.details.read?.length + attachmentContentDialog.details.failed?.length || 0}
                    </div>
                    {attachmentContentDialog.details.read && attachmentContentDialog.details.read.length > 0 && (
                      <div className="text-sm">
                        <div className="font-semibold mb-1">Files read successfully:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {attachmentContentDialog.details.read.map((file: any, idx: number) => (
                            <li key={idx} className="text-xs">
                              {file.filename} ({file.type === 'text' ? 'Text' : 'Binary'}{file.size ? `, ${file.size} bytes` : ''})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {attachmentContentDialog.details.failed && attachmentContentDialog.details.failed.length > 0 && (
                      <div className="text-sm text-destructive">
                        <div className="font-semibold mb-1">Files that failed to read:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {attachmentContentDialog.details.failed.map((file: any, idx: number) => (
                            <li key={idx} className="text-xs">
                              {file.filename}: {file.error || 'Unknown error'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <div className="border rounded-lg p-4">
                  <div className="text-sm font-semibold mb-2">Content:</div>
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded max-h-[400px] overflow-y-auto font-mono">
                    {attachmentContentDialog.content || 'No content available'}
                  </pre>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setAttachmentContentDialog({ open: false, submissionId: '', content: '', details: null, loading: false });
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attachment Content Dialog */}
      <Dialog open={attachmentContentDialog.open} onOpenChange={(open) => {
        if (!open) {
          setAttachmentContentDialog({ open: false, submissionId: '', content: '', details: null, loading: false });
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attachment Content</DialogTitle>
            <DialogDescription>
              Content from attachments for submission {attachmentContentDialog.submissionId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {attachmentContentDialog.loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading attachment content...</span>
              </div>
            ) : (
              <>
                {attachmentContentDialog.details && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="text-sm font-semibold">Attachment Summary</div>
                    <div className="text-sm text-muted-foreground">
                      Read: {attachmentContentDialog.details.read?.length || 0} / Total: {(attachmentContentDialog.details.read?.length || 0) + (attachmentContentDialog.details.failed?.length || 0)}
                    </div>
                    {attachmentContentDialog.details.read && attachmentContentDialog.details.read.length > 0 && (
                      <div className="text-sm">
                        <div className="font-semibold mb-1">Files read successfully:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {attachmentContentDialog.details.read.map((file: any, idx: number) => (
                            <li key={idx} className="text-xs">
                              {file.filename} ({file.type === 'text' ? 'Text' : 'Binary'}{file.size ? `, ${file.size} bytes` : ''})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {attachmentContentDialog.details.failed && attachmentContentDialog.details.failed.length > 0 && (
                      <div className="text-sm text-destructive">
                        <div className="font-semibold mb-1">Files that failed to read:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {attachmentContentDialog.details.failed.map((file: any, idx: number) => (
                            <li key={idx} className="text-xs">
                              {file.filename}: {file.error || 'Unknown error'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <div className="border rounded-lg p-4">
                  <div className="text-sm font-semibold mb-2">Content:</div>
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded max-h-[400px] overflow-y-auto font-mono">
                    {attachmentContentDialog.content || 'No content available'}
                  </pre>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setAttachmentContentDialog({ open: false, submissionId: '', content: '', details: null, loading: false });
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this submission? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setSubmissionToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubmission}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
                        </div>
  );
}

// Stakeholders Section Component
interface StakeholdersSectionProps {
  roles: Role[];
  submissions: Submission[];
  students: Student[];
  groups: StudentGroup[];
  selectedStudent: string;
  viewType: "individual" | "group";
  onViewTypeChange: (viewType: "individual" | "group") => void;
  onStudentChange: (id: string) => void;
}

interface ChatMessage {
  id: string;
  studentId: string;
  stakeholderId: string;
  message: string;
  response?: string;
  timestamp: string;
  role?: 'student' | 'stakeholder';
}

function StakeholdersSection({
  roles,
  submissions,
  students: studentsFromState,
  groups,
  selectedStudent,
  viewType,
  onViewTypeChange,
  onStudentChange,
}: StakeholdersSectionProps) {
  const [activeTab, setActiveTab] = useState<"master" | "detail">("master");
  const [conversations, setConversations] = useState<{ [key: string]: ChatMessage[] }>({});
  const [conversationCounts, setConversationCounts] = useState<{ [key: string]: number }>({});
  const [loadingConversations, setLoadingConversations] = useState<{ [key: string]: boolean }>({});
  const [selectedStakeholderId, setSelectedStakeholderId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const { toast } = useToast();
  const [groupedStakeholderData, setGroupedStakeholderData] = useState<any[]>([]);
  const [loadingGroupedStakeholderData, setLoadingGroupedStakeholderData] = useState(false);
  
  // Clear selected stakeholder when student changes
  useEffect(() => {
    setSelectedStakeholderId("");
  }, [selectedStudent]);
  
  // Get unique student IDs from submissions and students state
  const studentIdsFromSubmissions = [...new Set(submissions.map(s => s.studentId))];
  const studentIdsFromState = studentsFromState.map(s => s.username);
  const allStudentIds = [...new Set([...studentIdsFromSubmissions, ...studentIdsFromState])];
  const students = allStudentIds.filter(Boolean); // Filter out undefined/null/empty values

  // Sort students A-Z
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [students]);

  // Get active groups
  const activeGroups = groups.filter(g => g.isActive);
  
  // Sort active groups A-Z by name
  const sortedActiveGroups = useMemo(() => {
    return [...activeGroups].sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
  }, [activeGroups]);
  
  // Get students in groups for group view
  const studentsInGroups = new Set(
    activeGroups.flatMap(g => g.studentIds)
  );

  // Fetch grouped stakeholder data when viewType is "group"
  useEffect(() => {
    const fetchGroupedStakeholderData = async () => {
      if (viewType === "group" && selectedStakeholderId) {
        setLoadingGroupedStakeholderData(true);
        try {
          const response = await fetch(`${API_ENDPOINTS.assessmentSubmissions.getByStakeholderGrouped(selectedStakeholderId)}?viewType=group`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setGroupedStakeholderData(Array.isArray(result.data) ? result.data : []);
            } else {
              setGroupedStakeholderData([]);
            }
          } else {
            setGroupedStakeholderData([]);
          }
        } catch (error) {
          console.error('Error fetching grouped stakeholder data:', error);
          setGroupedStakeholderData([]);
        } finally {
          setLoadingGroupedStakeholderData(false);
        }
      } else {
        setGroupedStakeholderData([]);
      }
    };
    
    fetchGroupedStakeholderData();
  }, [viewType, selectedStakeholderId]);

  // Fetch conversations for a specific student and stakeholder
  const fetchConversations = async (studentId: string, stakeholderId: string) => {
    const key = `${studentId}-${stakeholderId}`;
    if (loadingConversations[key] || conversations[key]) return; // Already loading or loaded
    
    setLoadingConversations(prev => ({ ...prev, [key]: true }));
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      const response = await fetch(
        `${API_ENDPOINTS.chatMessages.getByStudentAndStakeholder(studentId, stakeholderId)}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Backend returns both sessions and flattened chatItems
          const chatItems: ChatMessage[] = result.data.chatItems || [];
          setConversations(prev => ({ ...prev, [key]: chatItems }));
          setConversationCounts(prev => ({ ...prev, [key]: chatItems.length }));
        }
      }
    } catch (error) {
      console.error(`Error fetching conversations for ${studentId} and ${stakeholderId}:`, error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoadingConversations(prev => ({ ...prev, [key]: false }));
    }
  };

  // Fetch conversation counts for all student-stakeholder pairs (for heatmap)
  // Made lazy - only fetch when user explicitly requests or with significant delay
  const [heatmapFetched, setHeatmapFetched] = useState(false);
  const [isFetchingHeatmap, setIsFetchingHeatmap] = useState(false);
  
  const fetchAllConversationCounts = useCallback(async () => {
    if (isFetchingHeatmap || activeTab !== 'master') return;
    
    setIsFetchingHeatmap(true);
    const userName = localStorage.getItem('ai4edu_user') || '';

    const pairs = roles.flatMap(role =>
      students
        .map(student => ({
          studentId: student, // students is already an array of strings (student IDs)
          stakeholderId: role.id,
        }))
        .filter(pair => pair.studentId && pair.stakeholderId) // Filter out undefined/null values
    );

    const MAX_PAIRS = 20; // Keep server-safe
    const limitedPairs = pairs.slice(0, MAX_PAIRS);

    if (limitedPairs.length === 0) {
      setConversationCounts({});
      setHeatmapFetched(true);
      setIsFetchingHeatmap(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_ENDPOINTS.chatMessages.batch}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ pairs: limitedPairs }),
        }
      );

      if (response.status === 429) {
        console.warn(`Rate limited for batch heatmap fetch`);
        toast({
          title: "Rate Limit Reached",
          description: "Too many requests. Please wait before refreshing the heatmap.",
          variant: "destructive",
        });
        setIsFetchingHeatmap(false);
        return;
      }

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const counts: { [key: string]: number } = {};
          result.data.forEach((entry: any) => {
            const studentId = entry.studentId || entry.student || entry.username;
            const stakeholderId = entry.stakeholderId || entry.roleId || entry.stakeholder;
            const messages = entry.messages || entry.chatItems || entry.data || [];
            if (studentId && stakeholderId) {
              const key = `${studentId}-${stakeholderId}`;
              counts[key] = Array.isArray(messages) ? messages.length : 0;
            }
          });
          setConversationCounts(counts);
          setHeatmapFetched(true);
        } else {
          setConversationCounts({});
        }
      } else {
        console.warn('Failed to fetch conversation counts via batch endpoint');
      }
    } catch (error) {
      console.error('Error fetching conversation counts batch:', error);
    } finally {
      setIsFetchingHeatmap(false);
    }
  }, [roles, students, activeTab, isFetchingHeatmap, toast]);

  // Heatmap is now only fetched manually via refresh button - no automatic fetching

  // Calculate conversation lengths for heatmap
  const heatmapData = roles.map(role => {
    const row: any = { stakeholder: role.name };
    if (viewType === "individual") {
    sortedStudents.forEach(student => {
      const key = `${student}-${role.id}`;
      row[student] = conversationCounts[key] || 0;
    });
    } else {
      // In group view, aggregate conversation counts from group members
      sortedActiveGroups.forEach(group => {
        // Sum conversation counts from all students in this group
        const groupStudentIds = group.studentIds;
        let totalCount = 0;
        groupStudentIds.forEach(studentId => {
          const key = `${studentId}-${role.id}`;
          totalCount += conversationCounts[key] || 0;
        });
        row[group.id] = totalCount;
      });
    }
    return row;
  });

  const getConversationColor = (length: number) => {
    if (length === 0) return "bg-gray-300";
    if (length >= 20) return "bg-red-600";
    if (length >= 15) return "bg-orange-500";
    if (length >= 10) return "bg-yellow-400";
    if (length >= 5) return "bg-yellow-300";
    return "bg-yellow-200";
  };

  // Get conversations for selected student (fetch on demand)
  // Only show conversations for the selected stakeholder
  const studentConversations = selectedStakeholderId
    ? roles
        .filter(role => role.id === selectedStakeholderId)
        .map(role => {
          const key = selectedStudent ? `${selectedStudent}-${role.id}` : '';
          const messages = key ? conversations[key] || [] : [];
          return { role, conversations: messages, key };
        })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold mb-2">Stakeholders</h2>
        <p className="text-muted-foreground">View stakeholder interactions with students</p>
        </div>
        <div className="flex items-center gap-4">
          <Label>View Type:</Label>
          <Select value={viewType} onValueChange={(v) => onViewTypeChange(v as "individual" | "group")}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="group">Group</SelectItem>
            </SelectContent>
          </Select>
        </div>
                        </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="master">Master View</TabsTrigger>
          <TabsTrigger value="detail">Detail View</TabsTrigger>
        </TabsList>

        <TabsContent value="master" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
              <CardTitle>{viewType === "group" ? "Stakeholder vs Groups Heatmap" : "Stakeholder vs Students Heatmap"}</CardTitle>
              <CardDescription>
                Color intensity reflects conversation length. Grey indicates no interaction.
                {viewType === "group" ? " Showing group-level aggregated data." : ""}
              </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHeatmapFetched(false);
                    fetchAllConversationCounts();
                  }}
                  disabled={isFetchingHeatmap}
                >
                  {isFetchingHeatmap ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
                      </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stakeholder</TableHead>
                      {viewType === "individual"
                        ? sortedStudents.map(student => (
                        <TableHead key={student}>{student}</TableHead>
                          ))
                        : sortedActiveGroups.map(group => (
                            <TableHead key={group.id}>{group.name}</TableHead>
                          ))
                      }
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewType === "individual" ? (
                      heatmapData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{row.stakeholder}</TableCell>
                        {sortedStudents.map(student => {
                          const length = row[student];
                          return (
                            <TableCell key={student}>
                              <div
                                className={`w-16 h-16 ${getConversationColor(length)} rounded`}
                                title={`${length} conversation items`}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      ))
                    ) : (
                      heatmapData.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{row.stakeholder}</TableCell>
                          {sortedActiveGroups.map(group => {
                            const length = row[group.id] || 0;
                            return (
                              <TableCell key={group.id}>
                                <div
                                  className={`w-16 h-16 ${getConversationColor(length)} rounded`}
                                  title={`${length} conversation items`}
                                />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                        </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detail View</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {viewType === "group" && (
                <div>
                  <Label>Select Group</Label>
                  <Select 
                    value={selectedGroupId} 
                    onValueChange={(value) => {
                      setSelectedGroupId(value);
                      // Clear selected student when group changes
                      onStudentChange("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedActiveGroups.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>Select Username</Label>
                <Select value={selectedStudent} onValueChange={onStudentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                            <SelectContent>
                    {viewType === "group" && selectedGroupId
                      ? (() => {
                          const selectedGroup = activeGroups.find(g => g.id === selectedGroupId);
                          const groupStudents = selectedGroup?.studentIds || [];
                          return groupStudents
                            .filter(studentId => students.includes(studentId))
                            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
                            .map(student => (
                      <SelectItem key={student} value={student}>
                        {student}
                      </SelectItem>
                            ));
                        })()
                      : sortedStudents.map(student => (
                          <SelectItem key={student} value={student}>
                            {student}
                          </SelectItem>
                        ))
                    }
                            </SelectContent>
                          </Select>
                        </div>

              {selectedStudent && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle>Stakeholders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {roles.map(role => {
                            const key = `${selectedStudent}-${role.id}`;
                            const count = conversationCounts[key] || 0;
                            const isSelected = selectedStakeholderId === role.id;
                            return (
                            <Button
                              key={role.id}
                                variant={isSelected ? "default" : "outline"}
                              className="w-full justify-start"
                                onClick={() => {
                                  if (selectedStudent) {
                                    setSelectedStakeholderId(role.id);
                                    fetchConversations(selectedStudent, role.id);
                                  }
                                }}
                            >
                              {role.name}
                                {count > 0 && (
                                  <Badge variant="secondary" className="ml-2">
                                    {count}
                                  </Badge>
                                )}
                            </Button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                        </div>
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Conversations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {!selectedStakeholderId ? (
                            <p className="text-sm text-muted-foreground">Select a stakeholder from the list to view conversations.</p>
                          ) : studentConversations.map(({ role, conversations, key }) => {
                            const isLoading = loadingConversations[key];
                            return (
                            <div key={role.id} className="border-b pb-4">
                              <h4 className="font-semibold mb-2">{role.name}</h4>
                                {isLoading ? (
                                  <p className="text-sm text-muted-foreground">Loading conversations...</p>
                                ) : conversations.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No conversations. Click the stakeholder to load.</p>
                                ) : (
                                  <div className="space-y-3">
                                    {conversations.map((msg: ChatMessage) => (
                                      <div key={msg.id} className="text-sm border-l-2 pl-3 space-y-1">
                                        <p className="text-muted-foreground text-xs">
                                          {new Date(msg.timestamp).toLocaleString()}
                                        </p>
                                        {msg.role === 'student' || !msg.role ? (
                                          <div className="bg-blue-50 p-2 rounded">
                                            <p className="font-medium text-blue-900">Student:</p>
                                            <p className="text-blue-800">{msg.message}</p>
                        </div>
                                        ) : null}
                                        {msg.response && (
                                          <div className="bg-gray-50 p-2 rounded">
                                            <p className="font-medium text-gray-900">Stakeholder:</p>
                                            <p className="text-gray-800">{msg.response}</p>
                                          </div>
                                        )}
                                        {!msg.response && msg.role === 'stakeholder' && (
                                          <div className="bg-gray-50 p-2 rounded">
                                            <p className="font-medium text-gray-900">Stakeholder:</p>
                                            <p className="text-gray-800">{msg.message}</p>
                                </div>
                              )}
                            </div>
                          ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Progress Section Component
interface ProgressSectionProps {
  tasks: Task[];
  submissions: Submission[];
  students: Student[];
  groups: StudentGroup[];
  selectedStudent: string;
  selectedProjectId: string;
  viewType: "student" | "group";
  selectedGroupId: string;
  onViewTypeChange: (viewType: "student" | "group") => void;
  onGroupChange: (groupId: string) => void;
  onStudentChange: (id: string) => void;
}

interface ProgressMasterviewData {
  projectId: string;
  windowType: "weekly" | "monthly";
  studentId: string | null;
  viewType: "class" | "student";
  metrics: {
    loPerformance: Array<{
      learningObjective: string;
      boxplot: {
        min: number;
        q1: number;
        median: number;
        q3: number;
        max: number;
        mean?: number;
        count: number;
        outliers?: number[];
      };
      studentCount: number;
      submissionCount: number;
    }>;
    taskPerformance: Array<{
      taskId: string;
      taskTitle: string;
      averageTaskQuality: number;
      averageReflection: number;
      submissionCount: number;
      studentCount: number;
    }>;
    stakeholderInteraction: {
      classAverage: {
        averageSessionCount: number;
        averageSessionLength: number;
        averageChatItemsPerSession: number;
      };
      studentMetrics?: Array<{
        studentId: string;
        sessionCount: number;
        averageSessionLength: number;
        averageChatItemsPerSession: number;
      }>;
      totalStudents: number;
    };
    quizQuestionPerformance: Array<{
      quizId: string;
      quizName: string;
      questionId: string;
      question: string;
      averageScore: number;
      correctAnswerRate: number;
      totalAnswers: number;
      answerDistribution: Record<string, number>;
      correctAnswer: number;
    }>;
    conceptPerformance: Array<{
      concept: string;
      boxplot: {
        min: number;
        q1: number;
        median: number;
        q3: number;
        max: number;
        mean?: number;
        count: number;
        outliers?: number[];
      };
      studentCount: number;
      submissionCount: number;
    }>;
    feedbackUptake: {
      classAverageImprovementRate: number;
      averageStudentUptakeRate: number;
      improvementCount: number;
      totalComparisons: number;
      studentsWithData: number;
    };
    engagement: {
      classAverage: {
        averageSessionCount: number;
        averageSessionDuration: number;
      };
      studentMetrics?: Array<{
        studentId: string;
        sessionCount: number;
        averageSessionDuration: number;
        activeSessions?: number; // Optional: Count of sessions with login action
      }>;
      totalStudents: number;
    };
  };
  classAverages?: any; // For student view comparison
}

function ProgressSection({
  tasks,
  submissions,
  students: studentsFromState,
  groups,
  selectedStudent,
  selectedProjectId,
  viewType,
  selectedGroupId,
  onViewTypeChange,
  onGroupChange,
  onStudentChange,
}: ProgressSectionProps) {
  const [activeTab, setActiveTab] = useState<"master" | "detail">("master");
  const [windowType, setWindowType] = useState<"weekly" | "monthly">("weekly");
  const [progressData, setProgressData] = useState<ProgressMasterviewData | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  
  // Get unique student IDs from submissions and students state
  const studentIdsFromSubmissions = [...new Set(submissions.map(s => s.studentId))];
  const studentIdsFromState = studentsFromState.map(s => s.username);
  const allStudentIds = [...new Set([...studentIdsFromSubmissions, ...studentIdsFromState])];
  const students = allStudentIds;

  const fetchProgressMetrics = useCallback(async () => {
    if (!selectedProjectId) {
      setMetricsError("Please select a project to view progress.");
      setProgressData(null);
      return;
    }

    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const params = new URLSearchParams({
        projectId: selectedProjectId,
        windowType,
      });
      
      // Only add studentId in detail view (not in master view)
      if (activeTab === "detail" && selectedStudent && selectedStudent !== "all") {
        params.append("studentId", selectedStudent);
      }
      
      const userName = localStorage.getItem('ai4edu_user') || '';
      params.append("userName", userName);

      const response = await fetch(`${API_ENDPOINTS.studentMetrics.progressMasterview}?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch metrics (${response.status})`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        // Validate response structure - ensure metrics object exists
        if (!result.data.metrics) {
          throw new Error("Invalid response structure: metrics not found");
        }
        setProgressData(result.data);
      } else {
        throw new Error(result.error || "Failed to load progress metrics");
      }
    } catch (err) {
      setMetricsError(err instanceof Error ? err.message : "Failed to load metrics");
      setProgressData(null);
    } finally {
      setMetricsLoading(false);
    }
  }, [selectedProjectId, windowType, activeTab, selectedStudent]);

  useEffect(() => {
    fetchProgressMetrics();
  }, [fetchProgressMetrics]);

  // Timeline data for detail view
  const timelineData = submissions
    .filter(s => {
      // If no student is selected, show all submissions
      if (!selectedStudent || selectedStudent === "all") {
        return true;
      }
      // Otherwise, filter by exact student ID match
      return s.studentId === selectedStudent;
    })
    .map(s => {
      const task = tasks.find(t => t.id === s.taskId);
      const deadline = task?.submissionDeadline;
      
      // Calculate isOnTime properly
      let isOnTime = false;
      if (deadline) {
        try {
          const submissionDate = new Date(s.datetime);
          const deadlineDate = new Date(deadline);
          isOnTime = submissionDate <= deadlineDate;
        } catch (error) {
          // If date parsing fails, default to false (late)
          isOnTime = false;
        }
      } else {
        // If no deadline exists, we can't determine if it's on time
        // Default to false (late) for safety
        isOnTime = false;
      }
      
      return {
      ...s,
        isOnTime,
        taskTitle: task?.taskTitle || task?.keyword || "Unknown Task",
      };
    })
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Progress</h2>
        <p className="text-muted-foreground">Track student progress over time</p>
                        </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="master">Master View</TabsTrigger>
          <TabsTrigger value="detail">Detail View</TabsTrigger>
        </TabsList>

        <TabsContent value="master" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Class Progress Dashboard</CardTitle>
                  <CardDescription>Comprehensive metrics for all students</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Label>Window Type</Label>
                    <Select value={windowType} onValueChange={(v) => setWindowType(v as "weekly" | "monthly")}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={fetchProgressMetrics} disabled={metricsLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${metricsLoading ? 'animate-spin' : ''}`} />
                    {metricsLoading ? "Loading..." : "Refresh"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {metricsError && (
                <div className="text-destructive mb-4">{metricsError}</div>
              )}

              {!metricsError && progressData && progressData.metrics && (
                <div className="space-y-6">
                  {/* 1. LO Performance - Boxplot */}
                  <Card>
                    <CardHeader>
                      <CardTitle>1. Learning Objectives Performance</CardTitle>
                      <CardDescription>Average student scores per Learning Objective</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {progressData.metrics.loPerformance && progressData.metrics.loPerformance.length > 0 ? (
                          progressData.metrics.loPerformance.map((lo, idx) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2 text-sm">{lo.learningObjective}</h4>
                            <Boxplot data={lo.boxplot} width={250} height={80} />
                            <div className="text-xs text-muted-foreground mt-2">
                              Students: {lo.studentCount} | Submissions: {lo.submissionCount}
                            </div>
                          </div>
                        ))
                        ) : (
                          <div className="text-muted-foreground text-center py-8 col-span-full">No learning objectives data available</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 2. Task Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>2. Task Performance</CardTitle>
                      <CardDescription>Average scores and reflection scores per task</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {progressData.metrics.taskPerformance && progressData.metrics.taskPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={progressData.metrics.taskPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="taskTitle" angle={-45} textAnchor="end" height={100} />
                            <YAxis yAxisId="left" domain={[0, 5]} label={{ value: 'Score (0-5)', angle: -90, position: 'insideLeft' }} />
                            <YAxis yAxisId="right" domain={[0, 5]} orientation="right" label={{ value: 'Reflection (0-5)', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                            <Bar yAxisId="left" dataKey="averageTaskQuality" name="Task Quality" fill="#8884d8" />
                            <Bar yAxisId="right" dataKey="averageReflection" name="Reflection" fill="#82ca9d" />
                          </ComposedChart>
                </ResponsiveContainer>
                ) : (
                  <div className="text-muted-foreground text-center py-8">No task performance data available</div>
                )}
                        </div>
                    </CardContent>
                  </Card>

                  {/* 3. Stakeholder Interaction */}
                  <Card>
                    <CardHeader>
                      <CardTitle>3. Stakeholder Interaction</CardTitle>
                      <CardDescription>Chat sessions and engagement metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {progressData.metrics.stakeholderInteraction ? (
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Avg Session Count</p>
                            <p className="text-2xl font-bold">{progressData.metrics.stakeholderInteraction.classAverage?.averageSessionCount?.toFixed(1) || '0.0'}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Avg Session Length (min)</p>
                            <p className="text-2xl font-bold">{progressData.metrics.stakeholderInteraction.classAverage?.averageSessionLength?.toFixed(1) || '0.0'}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Avg Chat Items/Session</p>
                            <p className="text-2xl font-bold">{progressData.metrics.stakeholderInteraction.classAverage?.averageChatItemsPerSession?.toFixed(1) || '0.0'}</p>
                          </CardContent>
                        </Card>
                      </div>
                      ) : (
                        <div className="text-muted-foreground text-center py-8">No stakeholder interaction data available</div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 4. Quiz Question Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>4. Quiz Question Performance</CardTitle>
                      <CardDescription>Average scores per quiz question</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96">
                        {progressData.metrics.quizQuestionPerformance && progressData.metrics.quizQuestionPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={progressData.metrics.quizQuestionPerformance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="question" angle={-45} textAnchor="end" height={120} />
                            <YAxis label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="averageScore" name="Average Score" fill="#8884d8" />
                            <Bar dataKey="correctAnswerRate" name="Correct Rate" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                        ) : (
                          <div className="text-muted-foreground text-center py-8">No quiz question performance data available</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 5. Concept Performance - Boxplot (hidden) */}
                  {false && (
                  <Card>
                    <CardHeader>
                      <CardTitle>5. Concept Performance</CardTitle>
                      <CardDescription>Concept mastery scores distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {progressData.metrics.conceptPerformance && progressData.metrics.conceptPerformance.length > 0 ? (
                          progressData.metrics.conceptPerformance.map((concept, idx) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2 text-sm">{concept.concept}</h4>
                            <Boxplot data={concept.boxplot} width={250} height={80} />
                            <div className="text-xs text-muted-foreground mt-2">
                              Students: {concept.studentCount} | Submissions: {concept.submissionCount}
                            </div>
                          </div>
                        ))
                        ) : (
                          <div className="text-muted-foreground text-center py-8 col-span-full">No concept performance data available</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  )}

                  {/* 6. Feedback Uptake */}
                  <Card>
                    <CardHeader>
                      <CardTitle>6. Feedback Uptake</CardTitle>
                      <CardDescription>Class average improvement rate after feedback</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {progressData.metrics.feedbackUptake ? (
                      <div className="grid grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Class Avg Improvement</p>
                            <p className="text-2xl font-bold">{((progressData.metrics.feedbackUptake.classAverageImprovementRate || 0) * 100).toFixed(1)}%</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Avg Student Uptake</p>
                            <p className="text-2xl font-bold">{((progressData.metrics.feedbackUptake.averageStudentUptakeRate || 0) * 100).toFixed(1)}%</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Improvements</p>
                            <p className="text-2xl font-bold">{progressData.metrics.feedbackUptake.improvementCount || 0}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Comparisons</p>
                            <p className="text-2xl font-bold">{progressData.metrics.feedbackUptake.totalComparisons || 0}</p>
                          </CardContent>
                        </Card>
                      </div>
                      ) : (
                        <div className="text-muted-foreground text-center py-8">No feedback uptake data available</div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 7. Engagement */}
                  <Card>
                    <CardHeader>
                      <CardTitle>7. Engagement</CardTitle>
                      <CardDescription>Active sessions and duration metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {progressData.metrics.engagement ? (
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Avg Session Count</p>
                            <p className="text-2xl font-bold">{(progressData.metrics.engagement.classAverage?.averageSessionCount || 0).toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Login-logout sessions</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Avg Session Duration (min)</p>
                            <p className="text-2xl font-bold">{(progressData.metrics.engagement.classAverage?.averageSessionDuration || 0).toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Average duration per session</p>
                          </CardContent>
                        </Card>
                      </div>
                      ) : (
                        <div className="text-muted-foreground text-center py-8">No engagement data available</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {!metricsError && !progressData && !metricsLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No progress data available. Please select a project and click Refresh.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detail" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
              <div>
                  <CardTitle>{viewType === "group" ? "Group Progress Dashboard" : "Student Progress Dashboard"}</CardTitle>
                  <CardDescription>{viewType === "group" ? "Group metrics with class comparison" : "Individual student metrics with class comparison"}</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Label>View Type</Label>
                    <Select value={viewType} onValueChange={(v) => onViewTypeChange(v as "student" | "group")}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="group">Group</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {viewType === "student" ? (
                  <div className="space-y-2">
                    <Label>Select Student</Label>
                          <Select
                  value={selectedStudent || "all"} 
                  onValueChange={(value) => {
                    onStudentChange(value === "all" ? "" : value);
                  }}
                >
                      <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                            <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student} value={student}>
                        {student}
                      </SelectItem>
                    ))}
                            </SelectContent>
                          </Select>
                        </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Select Group</Label>
                      <Select
                        value={selectedGroupId || "all"} 
                        onValueChange={(value) => {
                          onGroupChange(value === "all" ? "" : value);
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select a group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Groups</SelectItem>
                          {groups.filter(g => g.isActive).map(group => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                        <div className="space-y-2">
                    <Label>Window Type</Label>
                    <Select value={windowType} onValueChange={(v) => setWindowType(v as "weekly" | "monthly")}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                      </div>
                  <Button onClick={fetchProgressMetrics} disabled={metricsLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${metricsLoading ? 'animate-spin' : ''}`} />
                    {metricsLoading ? "Loading..." : "Refresh"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {metricsError && (
                <div className="text-destructive mb-4">{metricsError}</div>
              )}

              {!selectedStudent || selectedStudent === "all" ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Please select a student to view individual progress metrics.</p>
                      </div>
              ) : !metricsError && progressData && progressData.viewType === "student" ? (
                <div className="space-y-6">
                  {/* Show same 7 charts but with student data and class averages comparison */}
                  {/* Similar structure to master view but with comparison indicators */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-blue-900">
                      📊 Showing metrics for: <strong>{selectedStudent}</strong>
                      {progressData.classAverages && " (Class averages shown for comparison)"}
                    </p>
                    </div>

                  {/* 1. LO Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>1. Learning Objectives Performance</CardTitle>
                      <CardDescription>Student scores vs class averages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {progressData.metrics.loPerformance.map((lo, idx) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2 text-sm">{lo.learningObjective}</h4>
                            <Boxplot data={lo.boxplot} width={250} height={80} />
                            <div className="text-xs text-muted-foreground mt-2">
                              Student: {lo.studentCount} | Class Avg: {progressData.classAverages?.loPerformance?.[idx]?.boxplot?.mean?.toFixed(1) || "N/A"}
                            </div>
                          </div>
                        ))}
                        </div>
                    </CardContent>
                  </Card>

                  {/* 2. Task Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>2. Task Performance</CardTitle>
                      <CardDescription>Student vs class averages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={progressData.metrics.taskPerformance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="taskTitle" angle={-45} textAnchor="end" height={100} />
                            <YAxis yAxisId="left" domain={[0, 5]} label={{ value: 'Score (0-5)', angle: -90, position: 'insideLeft' }} />
                            <YAxis yAxisId="right" domain={[0, 5]} orientation="right" label={{ value: 'Reflection (0-5)', angle: 90, position: 'insideRight' }} />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="averageTaskQuality" name="Student Task Quality" fill="#8884d8" />
                            <Bar yAxisId="right" dataKey="averageReflection" name="Student Reflection" fill="#82ca9d" />
                            {/* Add class average lines if available */}
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 3. Stakeholder Interaction */}
                  <Card>
                    <CardHeader>
                      <CardTitle>3. Stakeholder Interaction</CardTitle>
                      <CardDescription>Student metrics vs class averages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Session Count</p>
                            <p className="text-2xl font-bold">{progressData.metrics.stakeholderInteraction.studentMetrics?.[0]?.sessionCount?.toFixed(1) || "N/A"}</p>
                            <p className="text-xs text-muted-foreground">Class Avg: {progressData.metrics.stakeholderInteraction.classAverage.averageSessionCount.toFixed(1)}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Session Length (min)</p>
                            <p className="text-2xl font-bold">{progressData.metrics.stakeholderInteraction.studentMetrics?.[0]?.averageSessionLength?.toFixed(1) || "N/A"}</p>
                            <p className="text-xs text-muted-foreground">Class Avg: {progressData.metrics.stakeholderInteraction.classAverage.averageSessionLength.toFixed(1)}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Chat Items/Session</p>
                            <p className="text-2xl font-bold">{progressData.metrics.stakeholderInteraction.studentMetrics?.[0]?.averageChatItemsPerSession?.toFixed(1) || "N/A"}</p>
                            <p className="text-xs text-muted-foreground">Class Avg: {progressData.metrics.stakeholderInteraction.classAverage.averageChatItemsPerSession.toFixed(1)}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 4. Quiz Question Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>4. Quiz Question Performance</CardTitle>
                      <CardDescription>Student scores vs class averages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={progressData.metrics.quizQuestionPerformance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="question" angle={-45} textAnchor="end" height={120} />
                            <YAxis label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="averageScore" name="Student Score" fill="#8884d8" />
                            <Bar dataKey="correctAnswerRate" name="Correct Rate" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 5. Concept Performance (hidden) */}
                  {false && (
                  <Card>
                    <CardHeader>
                      <CardTitle>5. Concept Performance</CardTitle>
                      <CardDescription>Student concept mastery vs class distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {progressData.metrics.conceptPerformance.map((concept, idx) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2 text-sm">{concept.concept}</h4>
                            <Boxplot data={concept.boxplot} width={250} height={80} />
                            <div className="text-xs text-muted-foreground mt-2">
                              Student: {concept.studentCount} | Class Avg: {progressData.classAverages?.conceptPerformance?.[idx]?.boxplot?.mean?.toFixed(1) || "N/A"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  )}

                  {/* 6. Feedback Uptake */}
                  <Card>
                    <CardHeader>
                      <CardTitle>6. Feedback Uptake</CardTitle>
                      <CardDescription>Student improvement rate vs class average</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Student Improvement</p>
                            <p className="text-2xl font-bold">{(progressData.metrics.feedbackUptake.averageStudentUptakeRate * 100).toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">Class Avg: {(progressData.metrics.feedbackUptake.classAverageImprovementRate * 100).toFixed(1)}%</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Class Avg Improvement</p>
                            <p className="text-2xl font-bold">{(progressData.metrics.feedbackUptake.classAverageImprovementRate * 100).toFixed(1)}%</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Improvements</p>
                            <p className="text-2xl font-bold">{progressData.metrics.feedbackUptake.improvementCount}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Comparisons</p>
                            <p className="text-2xl font-bold">{progressData.metrics.feedbackUptake.totalComparisons}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 7. Engagement */}
                  <Card>
                    <CardHeader>
                      <CardTitle>7. Engagement</CardTitle>
                      <CardDescription>Student session metrics vs class averages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Session Count</p>
                            <p className="text-2xl font-bold">{progressData.metrics.engagement.studentMetrics?.[0]?.sessionCount?.toFixed(1) || "N/A"}</p>
                            <p className="text-xs text-muted-foreground mt-1">Class Avg: {progressData.metrics.engagement.classAverage.averageSessionCount.toFixed(1)}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Session Duration (min)</p>
                            <p className="text-2xl font-bold">{progressData.metrics.engagement.studentMetrics?.[0]?.averageSessionDuration?.toFixed(1) || "N/A"}</p>
                            <p className="text-xs text-muted-foreground mt-1">Class Avg: {progressData.metrics.engagement.classAverage.averageSessionDuration.toFixed(1)}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                  
                </div>
              ) : !metricsError && !progressData && !metricsLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No student data available. Please select a student and click Refresh.</p>
                </div>
              )}
                      </CardContent>
                    </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Quiz Section Component
interface QuizSectionProps {
  quizzes: Quiz[];
  students: Student[];
  selectedStudent: string;
  onStudentChange: (id: string) => void;
  selectedProjectId: string;
  selectedCourseId: string;
}

function QuizSection({
  quizzes,
  students: studentsFromState,
  selectedStudent,
  onStudentChange,
  selectedProjectId,
  selectedCourseId,
}: QuizSectionProps) {
  const [activeTab, setActiveTab] = useState<"master" | "detail">("master");
  const [leaderboard, setLeaderboard] = useState<Array<{ student: string; score: number; studentName?: string }>>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [studentSubmission, setStudentSubmission] = useState<any>(null);
  const [studentSubmissionLoading, setStudentSubmissionLoading] = useState(false);
  const { toast } = useToast();
  
  // Get student usernames from state
  const students = studentsFromState.map(s => s.username);

  // Fetch quiz scores using the new endpoint
  useEffect(() => {
    const fetchQuizScores = async () => {
      if (quizzes.length === 0) {
        setLeaderboard([]);
        return;
      }

      setLeaderboardLoading(true);
      try {
        const userName = localStorage.getItem('ai4edu_user') || '';
        
        // Build query params - prefer projectId, then courseId, then quizId
        let queryParams = new URLSearchParams();
        queryParams.append('userName', userName);
        
        if (selectedProjectId) {
          queryParams.append('projectId', selectedProjectId);
        } else if (selectedCourseId) {
          queryParams.append('courseId', selectedCourseId);
        } else if (quizzes.length > 0) {
          // Fallback to first quiz's ID
          queryParams.append('quizId', quizzes[0].id);
        } else {
          setLeaderboard([]);
          setLeaderboardLoading(false);
          return;
        }
        
        const response = await fetch(
          `${API_ENDPOINTS.quizSubmissions.getScores}?${queryParams.toString()}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const scores = result.data || [];
            const leaderboardData = scores.map((entry: any) => ({
              student: entry.studentId,
              score: entry.score || 0,
              studentName: entry.studentName || entry.studentId,
            }));
            
            setLeaderboard(leaderboardData);
          } else {
            setLeaderboard([]);
          }
        } else {
          console.error('Failed to fetch quiz scores:', response.status);
          setLeaderboard([]);
        }
      } catch (error) {
        console.error('Error fetching quiz scores:', error);
        setLeaderboard([]);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchQuizScores();
  }, [quizzes, selectedProjectId, selectedCourseId]);

  // Fetch student quiz submission when student is selected
  useEffect(() => {
    const fetchStudentSubmission = async () => {
      if (!selectedStudent || quizzes.length === 0) {
        setStudentSubmission(null);
        return;
      }

      setStudentSubmissionLoading(true);
      try {
        const userName = localStorage.getItem('ai4edu_user') || '';
        const quiz = quizzes[0]; // Use first quiz, or could add quiz selection UI
        
        const response = await fetch(
          `${API_ENDPOINTS.quizSubmissions.getByQuizAndStudent(quiz.id, selectedStudent)}?userName=${encodeURIComponent(userName)}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setStudentSubmission(result.data);
          } else {
            setStudentSubmission(null);
          }
        } else {
          console.error('Failed to fetch student submission:', response.status);
          setStudentSubmission(null);
        }
      } catch (error) {
        console.error('Error fetching student submission:', error);
        setStudentSubmission(null);
      } finally {
        setStudentSubmissionLoading(false);
      }
    };

    fetchStudentSubmission();
  }, [selectedStudent, quizzes]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Quiz</h2>
        <p className="text-muted-foreground">View quiz results and student answers</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="master">Master View</TabsTrigger>
          <TabsTrigger value="detail">Detail View</TabsTrigger>
        </TabsList>

        <TabsContent value="master" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>
                Current scores sorted by rank
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboardLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading leaderboard...</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No quiz submissions found. Students need to complete the quiz first.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((entry, idx) => (
                      <TableRow key={entry.student}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">
                          {entry.studentName || entry.student}
                        </TableCell>
                        <TableCell>{entry.score}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Answers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Username</Label>
                <Select value={selectedStudent} onValueChange={onStudentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student} value={student}>
                        {student}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                                  </div>

              {selectedStudent && (
                <div className="space-y-6">
                  {studentSubmissionLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading student submission...</p>
                    </div>
                  ) : !studentSubmission || !studentSubmission.isSubmitted ? (
                    <p className="text-muted-foreground text-center py-8">
                      {selectedStudent} has not submitted this quiz yet.
                    </p>
                  ) : quizzes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No quiz available.
                    </p>
                  ) : (
                    (() => {
                      const quiz = quizzes[0]; // Use first quiz
                      const answers = studentSubmission.answers || {};
                      const comments = studentSubmission.comments || {};
                      
                      return quiz.questions.map((question, idx) => {
                        const studentAnswer = answers[question.id] ?? null;
                        const comment = comments[question.id] || "";
                        
                        return (
                          <Card key={question.id || idx}>
                            <CardHeader>
                              <CardTitle className="text-lg">Question {idx + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label className="font-semibold">Question</Label>
                                <p>{question.question}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Options</Label>
                                <div className="space-y-2 mt-2">
                                  {question.options.map((option, optIdx) => (
                                    <div
                                      key={optIdx}
                                      className={`p-2 rounded ${
                                        optIdx === question.correctAnswer
                                          ? "bg-green-100 border border-green-300"
                                          : studentAnswer !== null && optIdx === studentAnswer
                                          ? "bg-blue-100 border border-blue-300"
                                          : "bg-gray-50"
                                      }`}
                                    >
                                      {option}
                                      {optIdx === question.correctAnswer && (
                                        <span className="ml-2 text-green-600 font-semibold">(Correct)</span>
                                      )}
                                      {studentAnswer !== null && optIdx === studentAnswer && optIdx !== question.correctAnswer && (
                                        <span className="ml-2 text-blue-600 font-semibold">(Student's Answer)</span>
                                      )}
                                      {studentAnswer === null && optIdx === question.correctAnswer && (
                                        <span className="ml-2 text-orange-600 font-semibold">(Not Answered)</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {comment && (
                                <div>
                                  <Label className="font-semibold">Comment</Label>
                                  <p className="text-sm text-muted-foreground">{comment}</p>
                                </div>
                              )}
                              {studentSubmission.score !== undefined && idx === 0 && (
                                <div>
                                  <Label className="font-semibold">Quiz Score</Label>
                                  <p className="text-lg font-bold">{studentSubmission.score}%</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      });
                    })()
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Dialog Components
interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  formData: any;
  onFormDataChange: (data: any) => void;
  onSave: (data: any) => Promise<void>;
}

function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  formData,
  onFormDataChange,
  onSave,
}: ProjectFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Create Project"}</DialogTitle>
                <DialogDescription>
            Add course description, learning outcomes, milestones, and other information
                </DialogDescription>
              </DialogHeader>
        <div className="space-y-4">
                  <div>
            <Label>Project Title</Label>
            <Input
              value={formData.projectTitle || ""}
              onChange={(e) => onFormDataChange({ ...formData, projectTitle: e.target.value })}
              placeholder="Enter project title"
            />
                  </div>
                  <div>
            <Label>Course Description</Label>
                          <Textarea
              value={formData.courseDescription}
              onChange={(e) => onFormDataChange({ ...formData, courseDescription: e.target.value })}
                            rows={4}
                          />
                        </div>
                  <div>
            <Label>Learning Outcome</Label>
                          <Textarea
              value={formData.learningOutcome}
              onChange={(e) => onFormDataChange({ ...formData, learningOutcome: e.target.value })}
                            rows={3}
                          />
                        </div>
                  <div>
            <Label>Key Milestones</Label>
                          <Textarea
              value={formData.keyMilestones}
              onChange={(e) => onFormDataChange({ ...formData, keyMilestones: e.target.value })}
              rows={3}
                          />
                        </div>
                  <div>
            <Label>Available Stakeholders</Label>
            <Input
              value={formData.availableStakeholders.join(", ")}
              onChange={(e) => onFormDataChange({
                ...formData,
                availableStakeholders: e.target.value.split(",").map(s => s.trim()).filter(s => s)
              })}
              placeholder="Comma-separated list"
            />
                  </div>
                  <div>
            <Label>Attachments</Label>
            <Input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                onFormDataChange({
                  ...formData,
                  attachments: [...formData.attachments, ...files.map(f => f.name)]
                });
              }}
            />
                  </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(formData)}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  formData: any;
  onFormDataChange: (data: any) => void;
  projectId: string;
  onSave: (data: any) => Promise<void>;
}

// Helper function to upload files
const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const userName = localStorage.getItem('ai4edu_user') || '';
  const response = await fetch(`${API_ENDPOINTS.files.upload}?userName=${encodeURIComponent(userName)}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to upload file' }));
    throw new Error(errorData.message || 'Failed to upload file');
  }
  
  const result = await response.json();
  // Backend should return the filename or path
  return result.filename || result.path || file.name;
};

// Helper function to download files
const downloadFile = async (url: string, filename: string) => {
  try {
    // If it's already a full URL, use it directly
    let downloadUrl = url;
    
    // If it's just a filename (relative path), use the new endpoint
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      downloadUrl = API_ENDPOINTS.files.download(url);
    }
    
    const response = await fetch(downloadUrl, {
      credentials: 'include',
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    // Fallback: try to open the original URL
    window.open(url, '_blank');
  }
};

function TaskFormDialog({
  open,
  onOpenChange,
  task,
  formData,
  onFormDataChange,
  projectId,
  onSave,
}: TaskFormDialogProps) {
  const { toast } = useToast();
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const fileName = file.name;
      setUploadingFiles(prev => [...prev, fileName]);
      
      try {
        const uploadedFilename = await uploadFile(file);
        onFormDataChange({
          ...formData,
          attachments: [...formData.attachments, uploadedFilename]
        });
        toast({
          title: "File uploaded",
          description: `${fileName} uploaded successfully`,
        });
      } catch (error: any) {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload failed",
          description: error.message || `Failed to upload ${fileName}`,
          variant: "destructive",
        });
      } finally {
        setUploadingFiles(prev => prev.filter(f => f !== fileName));
      }
    }
    
    // Reset the input
    e.target.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = formData.attachments.filter((_: any, i: number) => i !== index);
    onFormDataChange({
      ...formData,
      attachments: newAttachments
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add Task"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
                  <div>
            <Label>Task Title</Label>
            <Input
              value={formData.taskTitle || ""}
              onChange={(e) => onFormDataChange({ ...formData, taskTitle: e.target.value })}
              placeholder="Enter task title"
            />
                  </div>
                  <div>
            <Label>Task Description *</Label>
                          <Textarea
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                            rows={4}
                          />
                        </div>
                  <div>
            <Label>Task Keyword *</Label>
            <Input
              value={formData.keyword}
              onChange={(e) => onFormDataChange({ ...formData, keyword: e.target.value })}
            />
                  </div>
                  <div>
            <Label>Submission Deadline *</Label>
            <Input
              type="datetime-local"
              value={formData.submissionDeadline}
              onChange={(e) => onFormDataChange({ ...formData, submissionDeadline: e.target.value })}
            />
                  </div>
                  <div>
            <Label>Task Evaluation Criteria</Label>
            <Textarea
              value={formData.evaluationCriteria}
              onChange={(e) => onFormDataChange({ ...formData, evaluationCriteria: e.target.value })}
              rows={3}
            />
          </div>
                  <div>
            <Label>Outcome</Label>
            <Textarea
              value={formData.outcome || ""}
              onChange={(e) => onFormDataChange({ ...formData, outcome: e.target.value })}
              placeholder="Enter expected outcome"
              rows={3}
            />
          </div>
                  <div>
            <Label>Instruction</Label>
            <Textarea
              value={formData.instruction || ""}
              onChange={(e) => onFormDataChange({ ...formData, instruction: e.target.value })}
              placeholder="Enter task instructions"
              rows={3}
            />
          </div>
                        <div className="space-y-2">
            <Label>Options</Label>
                          <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="published"
                  checked={formData.status === 'published'}
                  onCheckedChange={(checked) => onFormDataChange({ 
                    ...formData, 
                    status: checked ? 'published' : 'unpublished' 
                  })}
                />
                <Label htmlFor="published">Published</Label>
                              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ai-guideline"
                  checked={formData.enabledAIGuideline}
                  onCheckedChange={(checked) => onFormDataChange({ ...formData, enabledAIGuideline: checked })}
                />
                <Label htmlFor="ai-guideline">Enabled AI Guideline?</Label>
                          </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lock-submission"
                  checked={formData.lockOnSubmissionQuestion}
                  onCheckedChange={(checked) => onFormDataChange({ ...formData, lockOnSubmissionQuestion: checked })}
                />
                <Label htmlFor="lock-submission">Lock-on Submission Question</Label>
                        </div>
              {formData.lockOnSubmissionQuestion && (
                <div className="ml-6 space-y-2">
                  <Label>Submission Question</Label>
                  <Textarea
                    value={formData.submissionQuestion}
                    onChange={(e) => onFormDataChange({ ...formData, submissionQuestion: e.target.value })}
                    rows={2}
                  />
                  <div>
                    <Label>Timer (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.submissionQuestionTimer}
                      onChange={(e) => onFormDataChange({ ...formData, submissionQuestionTimer: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lock-feedback"
                  checked={formData.lockOnFeedbackReceivedQuestion}
                  onCheckedChange={(checked) => onFormDataChange({ ...formData, lockOnFeedbackReceivedQuestion: checked })}
                />
                <Label htmlFor="lock-feedback">Lock-on Feedback Received Question</Label>
                    </div>
              {formData.lockOnFeedbackReceivedQuestion && (
                <div className="ml-6 space-y-2">
                  <Label>Feedback Received Question</Label>
                  <Textarea
                    value={formData.feedbackReceivedQuestion}
                    onChange={(e) => onFormDataChange({ ...formData, feedbackReceivedQuestion: e.target.value })}
                    rows={2}
                  />
                  <div>
                    <Label>Timer (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.feedbackReceivedQuestionTimer}
                      onChange={(e) => onFormDataChange({ ...formData, feedbackReceivedQuestionTimer: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <Label>Attachments</Label>
            <Input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploadingFiles.length > 0}
            />
            {uploadingFiles.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Uploading: {uploadingFiles.join(', ')}
              </p>
            )}
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm font-semibold">Attached Files</Label>
                <div className="mt-2 space-y-2">
                  {formData.attachments.map((attachment: string, index: number) => {
                    const filename = typeof attachment === 'string' 
                      ? decodeURIComponent(attachment.split('/').pop() || attachment || `Attachment ${index + 1}`)
                      : `Attachment ${index + 1}`;
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <span 
                          className="text-sm text-muted-foreground truncate flex-1 cursor-pointer hover:text-foreground"
                          onClick={() => downloadFile(attachment, filename)}
                          title="Click to download"
                        >
                          {filename}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(attachment, filename)}
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAttachment(index)}
                          title="Remove file"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
              <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(formData)}>
            <Save className="h-4 w-4 mr-2" />
            Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  );
}

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  formData: any;
  onFormDataChange: (data: any) => void;
  projectId: string;
  onSave: (data: any) => Promise<void>;
}

function RoleFormDialog({
  open,
  onOpenChange,
  role,
  formData,
  onFormDataChange,
  onSave,
}: RoleFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Add Role"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Avatar Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    onFormDataChange({ ...formData, avatarImage: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
        </div>
          <div>
            <Label>Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            />
      </div>
          <div>
            <Label>Persona *</Label>
            <Textarea
              value={formData.persona}
              onChange={(e) => onFormDataChange({ ...formData, persona: e.target.value })}
              rows={4}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status || "active"}
              onValueChange={(value) =>
                onFormDataChange({ ...formData, status: value as "active" | "inactive" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Attachments (Knowledge Base)</Label>
            <Input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                onFormDataChange({
                  ...formData,
                  attachments: [...formData.attachments, ...files.map(f => f.name)]
                });
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(formData)}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface QuizFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: Quiz | null;
  tasks: Task[];
  projectId: string;
  onSave: (quiz: Quiz) => Promise<void>;
}

function QuizFormDialog({
  open,
  onOpenChange,
  quiz,
  tasks,
  projectId,
  onSave,
}: QuizFormDialogProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuizQuestion[]>(quiz?.questions || []);
  const [quizName, setQuizName] = useState<string>(quiz?.name || "Project Knowledge Quiz");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generate options state
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(() => 
    tasks.map(t => t.id) // All tasks selected by default
  );
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [style, setStyle] = useState<'theory-oriented' | 'practice-oriented'>('theory-oriented');
  const [questionsPerTask, setQuestionsPerTask] = useState<number>(2);
  const [showGenerateOptions, setShowGenerateOptions] = useState(!quiz); // Show options for new quiz
  const [mode, setMode] = useState<'generate' | 'manual'>('generate'); // 'generate' or 'manual'

  // Reset form when dialog opens/closes or quiz changes
  useEffect(() => {
    if (open) {
      setQuestions(quiz?.questions || []);
      setQuizName(quiz?.name || "Project Knowledge Quiz");
      setSelectedTaskIds(tasks.map(t => t.id));
      setShowGenerateOptions(!quiz);
      setMode(quiz ? 'manual' : 'generate');
    }
  }, [open, quiz, tasks]);

  const handleGenerate = async () => {
    if (!projectId) {
      toast({ title: "Error", description: "No project selected", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const selectedTasks = tasks.filter(t => selectedTaskIds.includes(t.id));
      const taskIds = selectedTasks.map(t => t.id);
      const keywords = selectedTasks.map(t => t.keyword).filter(Boolean);
      
      // Get learning objectives from project (would need to fetch project, but for now use empty)
      const requestBody: any = {
        projectId: projectId,
        numberOfQuestions: questionsPerTask * selectedTasks.length,
      };

      if (taskIds.length > 0) {
        requestBody.taskIds = taskIds;
      }
      if (keywords.length > 0) {
        requestBody.keywords = keywords;
      }
      // Add difficulty and style as part of learning objectives prompt
      // (Backend may need to be updated to accept these, but we'll include them in keywords/learningObjectives for now)
      if (difficulty || style) {
        const additionalContext = [];
        if (difficulty) additionalContext.push(`Difficulty: ${difficulty}`);
        if (style) additionalContext.push(`Style: ${style}`);
        if (additionalContext.length > 0) {
          requestBody.learningObjectives = additionalContext.join(', ');
        }
      }

      const response = await fetch(API_ENDPOINTS.assessmentQuizzes.generate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate quiz' }));
        throw new Error(errorData.message || errorData.error || 'Failed to generate quiz');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setQuestions(result.data.questions || []);
        toast({ title: "Success", description: "Quiz generated successfully" });
      } else {
        throw new Error(result.message || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate quiz",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (questions.length === 0) {
      toast({ title: "Error", description: "Please add at least one question", variant: "destructive" });
      return;
    }

    // Validate all questions have at least 2 options
    for (const q of questions) {
      if (q.options.length < 2) {
        toast({ title: "Error", description: "Each question must have at least 2 options", variant: "destructive" });
        return;
      }
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        toast({ title: "Error", description: "Invalid correct answer index", variant: "destructive" });
        return;
      }
    }

    const newQuiz: Quiz = {
      id: quiz?.id || `quiz-${Date.now()}`,
      projectId,
      name: quizName || "Project Knowledge Quiz",
      questions,
      history: quiz?.history || [],
      createdAt: quiz?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await onSave(newQuiz);
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}-${Math.random()}`,
      question: "",
      options: ["", ""],
      correctAnswer: 0,
    };
    setQuestions([...questions, newQuestion]);
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const addOption = (questionIdx: number) => {
    const updated = [...questions];
    updated[questionIdx].options.push("");
    setQuestions(updated);
  };

  const deleteOption = (questionIdx: number, optionIdx: number) => {
    const updated = [...questions];
    if (updated[questionIdx].options.length <= 2) {
      toast({ title: "Error", description: "Each question must have at least 2 options", variant: "destructive" });
      return;
    }
    updated[questionIdx].options.splice(optionIdx, 1);
    // Adjust correctAnswer if needed
    if (updated[questionIdx].correctAnswer >= updated[questionIdx].options.length) {
      updated[questionIdx].correctAnswer = updated[questionIdx].options.length - 1;
    }
    setQuestions(updated);
  };

    return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quiz ? "Edit Quiz" : "Create Quiz"}</DialogTitle>
          <DialogDescription>
            {quiz ? "Edit quiz questions" : "Generate or manually create quiz questions"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Quiz Name */}
          <div>
            <Label>Quiz Name</Label>
            <Input
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="Project Knowledge Quiz"
            />
          </div>

          {/* Mode Selection for new quiz */}
          {!quiz && (
            <div>
              <Label>Create Method</Label>
              <div className="flex gap-2 mt-2">
                          <Button
                  variant={mode === 'generate' ? 'default' : 'outline'}
                  onClick={() => {
                    setMode('generate');
                    setShowGenerateOptions(true);
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                          </Button>
                <Button
                  variant={mode === 'manual' ? 'default' : 'outline'}
                  onClick={() => {
                    setMode('manual');
                    setShowGenerateOptions(false);
                    // Add an empty question if none exist
                    if (questions.length === 0) {
                      addQuestion();
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manually
                          </Button>
                        </div>
            </div>
          )}

          {showGenerateOptions && !quiz && mode === 'generate' && (
            <Card>
              <CardHeader>
                <CardTitle>Generate Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Tasks (all selected by default)</Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={selectedTaskIds.includes(task.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTaskIds([...selectedTaskIds, task.id]);
                            } else {
                              setSelectedTaskIds(selectedTaskIds.filter(id => id !== task.id));
                            }
                          }}
                        />
                        <Label htmlFor={`task-${task.id}`} className="font-normal cursor-pointer">
                          {task.taskTitle || task.keyword || task.id}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Difficulty</Label>
                    <Select value={difficulty} onValueChange={(v: 'easy' | 'medium' | 'hard') => setDifficulty(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Style</Label>
                    <Select value={style} onValueChange={(v: 'theory-oriented' | 'practice-oriented') => setStyle(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="theory-oriented">Theory-oriented</SelectItem>
                        <SelectItem value="practice-oriented">Practice-oriented</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Number of Questions per Task</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={questionsPerTask}
                    onChange={(e) => setQuestionsPerTask(parseInt(e.target.value) || 2)}
                  />
                </div>
                <Button onClick={handleGenerate} disabled={isGenerating || selectedTaskIds.length === 0}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? "Generating..." : "Generate Quiz"}
                </Button>
                      </CardContent>
                    </Card>
                  )}

          {!showGenerateOptions && !quiz && mode === 'generate' && questions.length === 0 && (
            <Button onClick={() => setShowGenerateOptions(true)} variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Show Generate Options
                    </Button>
                  )}

          {questions.length > 0 && (
                  <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Questions ({questions.length})</Label>
                <Button onClick={addQuestion} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
              {questions.map((q, idx) => (
                <Card key={q.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Question {idx + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteQuestion(q.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                                  </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[idx].question = e.target.value;
                          setQuestions(updated);
                        }}
                        rows={2}
                        placeholder="Enter your question here..."
                      />
                                </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Answer Options</Label>
                                  <Button
                                    variant="outline"
                                    size="sm"
                          onClick={() => addOption(idx)}
                          disabled={q.options.length >= 6}
                                  >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Option
                                  </Button>
                      </div>
                      {q.options.map((option, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-2 flex-1">
                                  <Button
                              type="button"
                              variant={q.correctAnswer === optIdx ? "default" : "outline"}
                                    size="sm"
                              onClick={() => {
                                const updated = [...questions];
                                updated[idx].correctAnswer = optIdx;
                                setQuestions(updated);
                              }}
                              className={q.correctAnswer === optIdx ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {q.correctAnswer === optIdx ? "✓ Correct" : "Mark Correct"}
                                  </Button>
                            <Input
                              value={option}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[idx].options[optIdx] = e.target.value;
                                setQuestions(updated);
                              }}
                              placeholder={`Option ${optIdx + 1}`}
                              className="flex-1"
                            />
                          </div>
                          {q.options.length > 2 && (
                                  <Button
                              variant="ghost"
                                    size="sm"
                              onClick={() => deleteOption(idx, optIdx)}
                              className="text-destructive hover:text-destructive"
                                  >
                              <X className="h-4 w-4" />
                                  </Button>
                          )}
                                </div>
                      ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
          )}

          {quiz && quiz.history.length > 0 && (
            <div>
              <Label>Edit History</Label>
              <div className="space-y-2 mt-2">
                {quiz.history.map((version, idx) => (
                  <Card key={version.id}>
                    <CardContent className="p-4">
                      <p className="text-sm">
                        Version {idx + 1} - {new Date(version.createdAt).toLocaleString()}
                      </p>
            </CardContent>
          </Card>
                ))}
                  </div>
                  </div>
          )}
                  </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Notification Section Component
interface Notification {
  id: string;
  type: 'submission' | 'comment' | 'quiz' | 'conversation';
  courseCode: string;
  studentUsername: string;
  datetime: string;
  read: boolean;
  message: string;
  [key: string]: any;
}

interface NotificationSectionProps {
  courses: Course[];
  selectedCourseId: string;
  notificationsFromParent?: Notification[];
  onNotificationRead?: (id: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

function NotificationSection({
  courses,
  selectedCourseId,
  notificationsFromParent = [],
  onNotificationRead,
  onRefresh,
  isRefreshing = false,
}: NotificationSectionProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;
  const maxNotifications = 100;

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!selectedCourseId) {
        setNotifications([]);
        setFilteredNotifications([]);
        return;
      }

      setLoading(true);
      try {
        const userName = localStorage.getItem('ai4edu_user') || 'Guest';
        const course = courses.find(c => c.id === selectedCourseId);
        
        if (!course) {
          setNotifications([]);
          setFilteredNotifications([]);
          return;
        }

        // Get students for the course to fetch their notifications
        const studentsResponse = await fetch(
          `${API_ENDPOINTS.students.list}?courseId=${encodeURIComponent(selectedCourseId)}&userName=${encodeURIComponent(userName)}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );

        if (studentsResponse.ok) {
          const studentsResult = await studentsResponse.json();
          const students = studentsResult.success ? (studentsResult.data || []) : [];

          // Fetch notifications for all students
          const allNotifications: Notification[] = [];
          for (const student of students.slice(0, 10)) { // Limit to avoid too many requests
            try {
              const response = await fetch(
                `${API_ENDPOINTS.notifications.getByStudent(student.username)}?userName=${encodeURIComponent(userName)}`,
                {
                  method: 'GET',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                }
              );

              if (response.ok) {
                const result = await response.json();
                if (result.success) {
                  const studentNotifications = (result.data || []).map((n: any) => ({
                    ...n,
                    courseCode: course.code,
                    studentUsername: student.username,
                  }));
                  allNotifications.push(...studentNotifications);
                }
              }
            } catch (error) {
              console.error(`Error fetching notifications for student ${student.username}:`, error);
            }
          }

          // Sort by datetime descending and limit to maxNotifications
          const sortedNotifications = allNotifications
            .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
            .slice(0, maxNotifications);

          // Merge with parent notifications (prioritize parent notifications)
          const mergedNotifications = [...notificationsFromParent, ...sortedNotifications]
            .filter((n, index, self) => index === self.findIndex(t => t.id === n.id))
            .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
            .slice(0, maxNotifications);

          setNotifications(mergedNotifications);
          setFilteredNotifications(mergedNotifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [selectedCourseId, courses, toast, notificationsFromParent]);

  // Update notifications when parent notifications change
  useEffect(() => {
    if (notificationsFromParent.length > 0) {
      setNotifications(prev => {
        const merged = [...notificationsFromParent, ...prev]
          .filter((n, index, self) => index === self.findIndex(t => t.id === n.id))
          .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
          .slice(0, maxNotifications);
        return merged;
      });
    }
  }, [notificationsFromParent]);

  // Filter notifications by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNotifications(notifications);
      setCurrentPage(1);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = notifications.filter(n =>
      n.type.toLowerCase().includes(query) ||
      n.courseCode.toLowerCase().includes(query) ||
      n.studentUsername.toLowerCase().includes(query) ||
      n.message?.toLowerCase().includes(query)
    );
    setFilteredNotifications(filtered);
    setCurrentPage(1);
  }, [searchQuery, notifications]);

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

  const handleMarkAsRead = async (id: string) => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || 'Guest';

      // Try to mark as read via API (if it's a backend notification)
        try {
          await fetch(API_ENDPOINTS.notifications.markAsRead(id), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
        } catch (error) {
        // If API call fails, it might be a frontend-generated notification, continue anyway
        console.log(`Notification ${id} might be frontend-generated, marking locally`);
      }

      // Update local state
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setFilteredNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      
      // Notify parent component
      if (onNotificationRead) {
        onNotificationRead(id);
      }
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      const unreadIds = filteredNotifications.filter(n => !n.read).map(n => n.id);

      // Mark each notification as read
      for (const id of unreadIds) {
        await handleMarkAsRead(id);
      }

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'submission': return 'Submission';
      case 'comment': return 'Comment';
      case 'quiz': return 'Quiz';
      case 'conversation': return 'Conversation';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold mb-2">Notifications</h2>
        <p className="text-muted-foreground">View and manage student activity notifications</p>
        </div>
        {onRefresh && (
          <Button
            onClick={onRefresh}
            variant="outline"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        )}
      </div>

      {/* Control Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              disabled={filteredNotifications.filter(n => !n.read).length === 0}
            >
              Mark All as Read
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Notifications ({filteredNotifications.length})
            {filteredNotifications.filter(n => !n.read).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {filteredNotifications.filter(n => !n.read).length} unread
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading notifications...</div>
          ) : paginatedNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No notifications match your search" : "No unread notifications"}
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                    notification.read
                      ? "bg-background border-border"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                    <div className="font-medium">
                      {getNotificationTypeLabel(notification.type)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {notification.courseCode}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {notification.studentUsername}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(notification.datetime).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.read ? (
                        <Badge variant="secondary">Read</Badge>
                      ) : (
                        <Badge variant="default">Unread</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredNotifications.length)} of {filteredNotifications.length} notifications
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Students Section Component
interface StudentsSectionProps {
  students: Student[];
  groups: StudentGroup[];
  courses: Course[];
  selectedCourseId: string;
  selectedProjectId: string;
  onStudentCreate: () => void;
  onStudentEdit: (student: Student) => void;
  onStudentDelete: (id: string) => Promise<void>;
  onGroupsChange: () => void;
  onRefreshStudents?: () => void;
}

function StudentsSection({
  students,
  groups,
  courses,
  selectedCourseId,
  selectedProjectId,
  onStudentCreate,
  onStudentEdit,
  onStudentDelete,
  onGroupsChange,
  onRefreshStudents,
}: StudentsSectionProps) {
  const { toast } = useToast();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState<string>("");
  const [deleteStudentName, setDeleteStudentName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"students" | "groups">("students");

  // Filter students by matching remark field with selectedCourseId
  const filteredStudents = selectedCourseId
    ? students.filter((student) => {
        // Check if student's remark or course field matches the selected course ID
        return student.remark === selectedCourseId || student.course === selectedCourseId;
      })
    : students; // Show all students if no course is selected

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
                  <div>
        <h2 className="text-3xl font-bold mb-2">Students</h2>
        <p className="text-muted-foreground">
          {selectedCourseId && selectedCourse
            ? `Manage student accounts and groups for ${selectedCourse.code} - ${selectedCourse.name}`
            : "Manage student accounts and groups"}
        </p>
                  </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "students" | "groups")}>
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-6">

      {selectedCourseId && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Showing students for course: <span className="font-medium">{selectedCourse?.code} - {selectedCourse?.name}</span>
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student Accounts</CardTitle>
            <Button onClick={onStudentCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
                    </div>
          <CardDescription>
            {selectedCourseId
              ? `Students enrolled in ${selectedCourse?.code} - ${selectedCourse?.name}`
              : "Create and manage student accounts for your courses"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {selectedCourseId
                ? `No students found for this course. Create your first student account.`
                : "No students found. Create your first student account."}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <Card key={student.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{student.fullName || student.username}</CardTitle>
                        <p className="text-sm text-muted-foreground">{student.username}</p>
                  </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStudentEdit(student)}
                        >
                          <Edit className="h-4 w-4" />
                </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeleteStudentId(student.id);
                            setDeleteStudentName(student.fullName || student.username);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                  </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {student.email && (
                        <p className="text-sm">
                          <span className="font-medium">Email:</span> {student.email}
                        </p>
                      )}
                      {(student.course || student.remark) && (
                        <p className="text-sm">
                          <span className="font-medium">Course:</span> {
                            courses.find(c => c.id === (student.course || student.remark))?.name || 
                            courses.find(c => c.id === (student.course || student.remark))?.code ||
                            (student.course || student.remark)
                          }
                        </p>
                      )}
        </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student account for {deleteStudentName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await onStudentDelete(deleteStudentId);
                setDeleteConfirmOpen(false);
                setDeleteStudentId("");
                setDeleteStudentName("");
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <GroupsSection
            groups={groups}
            students={filteredStudents}
            courses={courses}
            selectedCourseId={selectedCourseId}
            selectedProjectId={selectedProjectId}
            onGroupsChange={onGroupsChange}
            onRefreshStudents={onRefreshStudents}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Groups Section Component
interface GroupsSectionProps {
  groups: StudentGroup[];
  students: Student[];
  courses: Course[];
  selectedCourseId: string;
  selectedProjectId: string;
  onGroupsChange: () => void;
  onRefreshStudents?: () => void;
}

function GroupsSection({
  groups,
  students,
  courses,
  selectedCourseId,
  selectedProjectId,
  onGroupsChange,
  onRefreshStudents,
}: GroupsSectionProps) {
  const { toast } = useToast();
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null);
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    description: "",
    studentIds: [] as string[],
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteGroupId, setDeleteGroupId] = useState<string>("");
  const [deleteGroupName, setDeleteGroupName] = useState<string>("");

  // Filter groups by course
  // Show all groups for the course, regardless of projectId (unless projectId is explicitly set and group has projectId)
  const filteredGroups = selectedCourseId
    ? groups.filter(g => {
        // Must match courseId (use string comparison to handle any type mismatches)
        const courseMatch = String(g.courseId) === String(selectedCourseId);
        if (!courseMatch) {
          console.log('[GroupsSection] Course mismatch:', { 
            groupCourseId: g.courseId, 
            selectedCourseId, 
            groupName: g.name 
          });
          return false;
        }
        
        // If projectId is selected, show groups that match projectId OR groups without projectId (course-level groups)
        if (selectedProjectId) {
          // Show groups without projectId (course-level) OR groups matching the selected project
          const matches = !g.projectId || String(g.projectId) === String(selectedProjectId);
          if (!matches) {
            console.log('[GroupsSection] Project mismatch:', { 
              groupProjectId: g.projectId, 
              selectedProjectId, 
              groupName: g.name 
            });
          }
          return matches;
        }
        // If no projectId selected, show all groups for the course (both with and without projectId)
        return true;
      })
    : groups;
  
  // Debug logging
  useEffect(() => {
    if (selectedCourseId) {
      console.log('[GroupsSection] Groups Debug:', {
        selectedCourseId,
        selectedProjectId,
        totalGroups: groups.length,
        filteredGroups: filteredGroups.length,
        allGroups: groups.map(g => ({ 
          id: g.id, 
          name: g.name, 
          courseId: g.courseId, 
          projectId: g.projectId,
          isActive: g.isActive 
        }))
      });
    }
  }, [selectedCourseId, selectedProjectId, groups, filteredGroups]);

  // Get unassigned students (students not in any active group)
  // When editing a group, exclude the current group from assigned students calculation
  const assignedStudentIds = new Set(
    filteredGroups
      .filter(g => g.isActive && (!editingGroup || g.id !== editingGroup.id))
      .flatMap(g => g.studentIds)
  );
  const unassignedStudents = students.filter(s => !assignedStudentIds.has(s.username) && !assignedStudentIds.has(s.id));

  // Sort students A-Z by fullName or username
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const nameA = (a.fullName || a.username || '').toLowerCase();
      const nameB = (b.fullName || b.username || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [students]);

  const handleCreateGroup = () => {
    if (!selectedCourseId) {
      toast({
        title: "No Course Selected",
        description: "Please select a course first before creating a group.",
        variant: "destructive",
      });
      return;
    }
    setEditingGroup(null);
    setGroupFormData({
      name: "",
      description: "",
      studentIds: [],
    });
    setShowGroupForm(true);
  };

  const handleEditGroup = (group: StudentGroup) => {
    setEditingGroup(group);
    setGroupFormData({
      name: group.name,
      description: group.description || "",
      studentIds: group.studentIds || [],
    });
    setShowGroupForm(true);
  };

  const handleSaveGroup = async () => {
    try {
      if (!groupFormData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Group name is required",
          variant: "destructive",
        });
        return;
      }

      if (groupFormData.studentIds.length < 2) {
        toast({
          title: "Validation Error",
          description: "A group must have at least 2 students",
          variant: "destructive",
        });
        return;
      }

      const isEdit = Boolean(editingGroup?.id);

      if (isEdit && editingGroup) {
        // When editing, handle member changes separately
        // Normalize IDs for comparison (handle both username and id formats)
        const normalizeId = (id: string, students: Student[]) => {
          const student = students.find(s => s.username === id || s.id === id);
          return student?.username || student?.id || id;
        };

        const originalStudentIds = new Set(
          (editingGroup.studentIds || []).map(id => normalizeId(id, students))
        );
        const newStudentIdsNormalized = new Set(
          groupFormData.studentIds.map(id => normalizeId(id, students))
        );
        
        // Calculate added and removed students
        // Use the normalized IDs for comparison, but keep original format for API calls
        const studentsToAdd = groupFormData.studentIds.filter(id => {
          const normalized = normalizeId(id, students);
          return !originalStudentIds.has(normalized);
        });
        
        const studentsToRemove = (editingGroup.studentIds || []).filter(id => {
          const normalized = normalizeId(id, students);
          return !newStudentIdsNormalized.has(normalized);
        });

        // Update group name and description if changed
        const nameChanged = editingGroup.name !== groupFormData.name.trim();
        const descriptionChanged = (editingGroup.description || "") !== (groupFormData.description || "").trim();

        if (nameChanged || descriptionChanged) {
          const updatePayload: any = {
            name: groupFormData.name.trim(),
          };
          if (groupFormData.description) {
            updatePayload.description = groupFormData.description.trim();
          }

          const updateResponse = await fetch(API_ENDPOINTS.studentGroups.update(editingGroup.id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updatePayload),
          });

          const updateData = await updateResponse.json();
          if (!updateResponse.ok || !updateData?.success) {
            throw new Error(updateData?.message || "Failed to update group name/description");
          }
        }

        // Add new students
        if (studentsToAdd.length > 0) {
          const addResponse = await fetch(API_ENDPOINTS.studentGroups.assignStudents(editingGroup.id), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              studentIds: studentsToAdd,
            }),
          });

          const addData = await addResponse.json();
          if (!addResponse.ok || !addData?.success) {
            throw new Error(addData?.message || `Failed to add students: ${studentsToAdd.join(", ")}`);
          }
        }

        // Remove students
        if (studentsToRemove.length > 0) {
          const removeResponse = await fetch(API_ENDPOINTS.studentGroups.removeStudents(editingGroup.id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              studentIds: studentsToRemove,
            }),
          });

          const removeData = await removeResponse.json();
          if (!removeResponse.ok || !removeData?.success) {
            throw new Error(removeData?.message || `Failed to remove students: ${studentsToRemove.join(", ")}`);
          }
        }

        toast({
          title: "Success",
          description: "Group updated successfully",
        });
      } else {
        // Creating a new group
        const payload: any = {
          courseId: selectedCourseId,
          name: groupFormData.name.trim(),
          studentIds: groupFormData.studentIds,
        };
        if (selectedProjectId) payload.projectId = selectedProjectId;
        if (groupFormData.description) payload.description = groupFormData.description.trim();

        const response = await fetch(API_ENDPOINTS.studentGroups.create, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Failed to create group");
        }

        toast({
          title: "Success",
          description: "Group created successfully",
        });
      }

      setShowGroupForm(false);
      setEditingGroup(null);
      setGroupFormData({ name: "", description: "", studentIds: [] });
      onGroupsChange();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${editingGroup ? "update" : "create"} group`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.studentGroups.delete(groupId), {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to delete group");
      }

      toast({
        title: "Success",
        description: "Group deleted successfully",
      });

      setDeleteConfirmOpen(false);
      setDeleteGroupId("");
      setDeleteGroupName("");
      onGroupsChange();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete group",
        variant: "destructive",
      });
    }
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
      {selectedCourseId && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Showing groups for course: <span className="font-medium">{selectedCourse?.code} - {selectedCourse?.name}</span>
              {selectedProjectId && " (project-specific)"}
              {filteredGroups.length > 0 && (
                <span className="ml-2">({filteredGroups.length} {filteredGroups.length === 1 ? 'group' : 'groups'})</span>
              )}
            </p>
            {groups.length > 0 && filteredGroups.length === 0 && (
              <p className="text-xs text-destructive mt-2">
                Note: {groups.length} group(s) found but none match the current filter. 
                {selectedProjectId && " Try clearing the project filter to see all course groups."}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Groups</CardTitle>
              <CardDescription>
                {selectedCourseId
                  ? `Create and manage student groups for ${selectedCourse?.code} - ${selectedCourse?.name}`
                  : "Create and manage student groups"}
              </CardDescription>
            </div>
            <Button onClick={handleCreateGroup} disabled={!selectedCourseId}>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedCourseId ? (
            <p className="text-muted-foreground text-center py-8">
              Please select a course to manage groups.
            </p>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">
                No groups found{groups.length > 0 ? " matching the current filter" : ""}. Create your first group.
              </p>
              {groups.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Total groups in system: {groups.length}. 
                  {selectedProjectId && " Try clearing the project filter to see all course groups."}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        {group.description && (
                          <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={group.isActive ? "default" : "secondary"}>
                            {group.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {group.studentIds.length} {group.studentIds.length === 1 ? "student" : "students"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditGroup(group)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeleteGroupId(group.id);
                            setDeleteGroupName(group.name);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Students:</p>
                      <div className="flex flex-wrap gap-2">
                        {(group.studentNames || group.studentIds).map((studentIdOrName, idx) => {
                          const student = students.find(s => s.username === studentIdOrName || s.id === studentIdOrName);
                          return (
                            <Badge key={idx} variant="outline">
                              {student?.fullName || student?.username || studentIdOrName}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Group Form Dialog */}
      <Dialog open={showGroupForm} onOpenChange={setShowGroupForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Edit Group" : "Create Group"}</DialogTitle>
            <DialogDescription>
              {editingGroup
                ? "Update group information and student assignments"
                : "Create a new student group for collaborative work"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Group Name *</Label>
              <Input
                value={groupFormData.name}
                onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                placeholder="e.g., Team Alpha, Group 1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={groupFormData.description}
                onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                placeholder="Optional group description"
                rows={3}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Select Students * (Minimum 2)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (onRefreshStudents) {
                      onRefreshStudents();
                      toast({
                        title: "Refreshed",
                        description: "Student list updated",
                      });
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                {unassignedStudents.length === 0 && groupFormData.studentIds.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {students.length === 0
                      ? "No students available. Please add students first."
                      : "All students are already assigned to groups."}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sortedStudents.map((student) => {
                      const isSelected = groupFormData.studentIds.includes(student.username) || 
                                       groupFormData.studentIds.includes(student.id);
                      const isAssigned = !isSelected && (assignedStudentIds.has(student.username) || 
                                        assignedStudentIds.has(student.id));
                      
                      return (
                        <div key={student.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`student-${student.id}`}
                            checked={isSelected}
                            disabled={isAssigned && !isSelected}
                            onCheckedChange={(checked) => {
                              // Use username first, then id, to match how groups store studentIds
                              const studentId = student.username || student.id;
                              if (checked) {
                                // Avoid duplicates
                                if (!groupFormData.studentIds.includes(studentId) && 
                                    !groupFormData.studentIds.includes(student.username || '') &&
                                    !groupFormData.studentIds.includes(student.id || '')) {
                                  setGroupFormData({
                                    ...groupFormData,
                                    studentIds: [...groupFormData.studentIds, studentId],
                                  });
                                }
                              } else {
                                // Remove by matching either username or id
                                setGroupFormData({
                                  ...groupFormData,
                                  studentIds: groupFormData.studentIds.filter(id => 
                                    id !== studentId && 
                                    id !== student.username && 
                                    id !== student.id
                                  ),
                                });
                              }
                            }}
                          />
                          <Label
                            htmlFor={`student-${student.id}`}
                            className={`text-sm font-normal cursor-pointer ${isAssigned && !isSelected ? "text-muted-foreground opacity-50" : ""}`}
                          >
                            {student.fullName || student.username}
                            {isAssigned && !isSelected && " (already in a group)"}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Selected: {groupFormData.studentIds.length} student{groupFormData.studentIds.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowGroupForm(false);
              setEditingGroup(null);
              setGroupFormData({ name: "", description: "", studentIds: [] });
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveGroup}>
              <Save className="h-4 w-4 mr-2" />
              {editingGroup ? "Update Group" : "Create Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the group "{deleteGroupName}".
              Students will not be deleted, only removed from the group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteGroup(deleteGroupId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    );
  }

// Student Form Dialog Component
interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  formData: any;
  onFormDataChange: (data: any) => void;
  courses: Course[];
  selectedCourseId: string;
  onSave: (data: any) => Promise<void>;
}

function StudentFormDialog({
  open,
  onOpenChange,
  student,
  formData,
  onFormDataChange,
  courses,
  selectedCourseId = "",
  onSave,
}: StudentFormDialogProps) {
    return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student ? "Edit Student" : "Add Student"}</DialogTitle>
          <DialogDescription>
            {student 
              ? "Update student account information" 
              : selectedCourseId 
                ? `Create a new student account for ${courses.find(c => c.id === selectedCourseId)?.code || courses.find(c => c.id === selectedCourseId)?.name || "the selected course"}`
                : "Create a new student account"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Username *</Label>
            <Input
              value={formData.username}
              onChange={(e) => onFormDataChange({ ...formData, username: e.target.value })}
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <Label>Email {!student && "*"}</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
              placeholder={student ? "Enter email (optional)" : "Enter email (required)"}
              required={!student}
            />
              </div>
          <div>
            <Label>Full Name</Label>
            <Input
              value={formData.fullName}
              onChange={(e) => onFormDataChange({ ...formData, fullName: e.target.value })}
              placeholder="Enter full name (optional)"
            />
        </div>
          {!student && (
            <div>
              <Label>Password *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => onFormDataChange({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                required
              />
      </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(formData)}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
