import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAssignmentSupport, AssignmentSection } from "@/contexts/AssignmentSupportContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BookOpen,
  FileText,
  Bell,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  Send,
  Flag,
  MessageSquare,
  Calendar,
  AlertCircle,
  ChevronDown,
  Download,
  Eye,
  Award,
  ChevronLeft,
  ChevronRight,
  Trophy,
  RefreshCw,
  Save,
  Loader2,
  File,
  Edit,
  X,
  Plus,
  Trash2,
  Star,
  ArrowLeft,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import API_ENDPOINTS from "@/config/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Interfaces
interface Course {
  id: string;
  name: string;
  code: string;
  academicYear: string;
  university: string;
  description?: string;
  learningOutcome?: string;
  schedules?: string;
}

interface Project {
  id: string;
  courseId: string;
  courseDescription: string;
  learningOutcome: string;
  keyMilestones: string;
  attachments: string[];
  availableStakeholders: string[];
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
  enabledAIGuideline: boolean;
  lockOnSubmissionQuestion: boolean;
  lockOnFeedbackReceivedQuestion: boolean;
  submissionQuestion?: string;
  feedbackReceivedQuestion?: string;
  submissionQuestionTimer?: number;
  feedbackReceivedQuestionTimer?: number;
  attachments: string[];
  status?: 'published' | 'unpublished';
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
  datetime: string;
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
  attachments?: string[];
  // New array properties
  submissionQuestionAnswers?: SubmissionQuestionAnswer[];
  feedbackReceivedQuestionAnswers?: FeedbackReceivedQuestionAnswer[];
  feedbackHistory?: FeedbackHistoryEntry[];
  starScoreHistory?: StarScoreHistoryEntry[];
  // Backward compatibility - latest values
  starScore?: number;
  feedback?: string;
  stakeholderId?: string;
  // Legacy fields (for backward compatibility)
  reflection?: string;
  feedbackAgreement?: boolean;
  feedbackComment?: string;
}

interface Notification {
  id: string;
  title: string;
  summary: string;
  datetime: string;
  read: boolean;
  important: boolean;
  readAt?: string; // Timestamp when marked as read
  recipientType?: 'student' | 'teacher'; // Type of recipient
  studentId?: string; // Student ID (when recipientType is 'student')
  teacherId?: string; // Teacher ID (when recipientType is 'teacher')
  type?: 'submission' | 'stakeholder' | 'stakeholder_chat' | 'feedback' | 'system' | string;
  taskId?: string;
  taskTitle?: string;
}

interface Stakeholder {
  id: string;
  projectId: string;
  avatarImage?: string;
  name: string;
  persona: string;
  attachments: string[];
  status?: string;
}

interface ChatMessage {
  id: string;
  stakeholderId: string;
  message: string;
  sender: 'student' | 'stakeholder';
  timestamp: string;
  sessionId?: string; // Session ID this message belongs to
  // OpenAI metrics (for AI-generated messages)
  responseSize?: number;
  tokenUsage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  responseTime?: number; // Response time in milliseconds
}

interface ChatSession {
  id: string;
  studentId: string;
  stakeholderId: string;
  title?: string;
  startTime: string;
  endTime?: string;
  chatItems: ChatMessage[];
}

interface ProgressStats {
  tasksDone: number;
  tasksActive: number;
  tasksOnTime: number;
  tasksLate: number;
  tasksNotStartedLate: number;
  tasksNotStartedOnSchedule: number;
  averageScore: number;
  feedbackReceived: number;
  feedbackRead: number;
  feedbackQuestionsAnswered: number;
  submissions: number;
  submissionQuestionsAnswered: number;
  conversationItems: number;
  engagementLength: number;
  engagementDuration: number;
}

interface Quiz {
  id: string;
  projectId: string;
  name?: string;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizAnswer {
  questionId: string;
  selectedAnswer: number | null;
  timestamp: string;
}

interface QuizState {
  quizId: string;
  currentQuestionIndex: number;
  answers: { [questionId: string]: number | null };
  comments: { [questionId: string]: string };
  lockedAnswers: { [questionId: string]: boolean }; // Track which answers are locked
  isSubmitted: boolean; // Track if quiz is submitted
  score: number | null; // Calculated score
  submittedAt: string | null; // When quiz was submitted
  startedAt: string;
  lastUpdated: string;
}

interface StudentGroup {
  id: string;
  courseId: string;
  projectId?: string;
  name: string;
  description?: string;
  studentIds: string[];
  studentNames?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
}

// Utility function - accessible to both AssignmentSupport and TaskSection
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Utility function to safely format datetime strings
const formatDateTime = (datetime: string | null | undefined): string => {
  if (!datetime) {
    return 'N/A';
  }
  
  // Handle different datetime formats
  try {
    const date = new Date(datetime);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // Try parsing as ISO string if it's not already (replace space with T)
      const isoDate = new Date(datetime.replace(' ', 'T'));
      if (!isNaN(isoDate.getTime())) {
        return isoDate.toLocaleString();
      }
      return 'Invalid Date';
    }
    
    return date.toLocaleString();
  } catch (error) {
    console.warn('Error formatting datetime:', datetime, error);
    return 'Invalid Date';
  }
};

export default function AssignmentSupport() {
  const navigate = useNavigate();
  const { 
    setIsInAssignmentSupport, 
    activeSection, 
    setActiveSection,
    selectedProjectId,
    setSelectedProjectId,
    selectedTaskId,
    setSelectedTaskId,
    selectedStakeholderId,
    setSelectedStakeholderId,
  } = useAssignmentSupport();
  const { toast } = useToast();
  const { t } = useLanguage();

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [questionId: string]: number | null }>({});
  const [quizComments, setQuizComments] = useState<{ [questionId: string]: string }>({});
  const [quizLockedAnswers, setQuizLockedAnswers] = useState<{ [questionId: string]: boolean }>({});
  const [quizIsSubmitted, setQuizIsSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizSubmissionId, setQuizSubmissionId] = useState<string | null>(null);
  const [quizLeaderboard, setQuizLeaderboard] = useState<Array<{ studentId: string; studentName: string; score: number }>>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    tasksDone: 0,
    tasksActive: 0,
    tasksOnTime: 0,
    tasksLate: 0,
    tasksNotStartedLate: 0,
    tasksNotStartedOnSchedule: 0,
    averageScore: 0,
    feedbackReceived: 0,
    feedbackRead: 0,
    feedbackQuestionsAnswered: 0,
    submissions: 0,
    submissionQuestionsAnswered: 0,
    conversationItems: 0,
    engagementLength: 0,
    engagementDuration: 0,
  });
  
  // Group metrics from backend endpoint
  const [groupMetrics, setGroupMetrics] = useState<Array<{
    groupId: string;
    groupName: string;
    memberCount: number;
    tasksDone: number;
    tasksLate: number;
    totalTasks: number;
    averageScore: number | null;
    feedbackReceivedCount: number;
    feedbackOnFeedbackCount: number;
    submissionsCount: number;
    submissionQuestionsAnsweredCount: number;
    conversationMessagesCount: number;
    conversationSessionsPerMonth: number;
    quizScoreLatestAverage: number | null;
  }>>([]);

  // Task submission state
  const [taskSubmission, setTaskSubmission] = useState<string>("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [showReflectionDialog, setShowReflectionDialog] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionTimer, setReflectionTimer] = useState(300); // 5 minutes in seconds
  const [showFeedbackAgreement, setShowFeedbackAgreement] = useState(false);
  const [feedbackAgreement, setFeedbackAgreement] = useState<boolean | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackTimer, setFeedbackTimer] = useState(300);
  
  // Track tasks with new feedback (tasks that have feedback but haven't been viewed yet)
  const [tasksWithNewFeedback, setTasksWithNewFeedback] = useState<Set<string>>(new Set());
  const [lastSeenFeedback, setLastSeenFeedback] = useState<{ [taskId: string]: string }>({}); // Track last seen feedback timestamp per task

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ [key: string]: ChatMessage[] }>({});
  const [chatSessions, setChatSessions] = useState<{ [key: string]: ChatSession[] }>({});
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isChatbotThinking, setIsChatbotThinking] = useState(false);

  // Ref to track if we've fetched submissions for progress tracking to prevent loops
  const progressFetchedRef = useRef<string | null>(null);
  // Ref to track if we've fetched submissions for a specific task to prevent loops
  const taskSubmissionsFetchedRef = useRef<string | null>(null);
  // Ref to track if a message is being sent to prevent duplicate calls
  const isSendingMessageRef = useRef(false);
  // Ref to track reflection timer interval
  const reflectionTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Define all fetch functions with useCallback before useEffect hooks
  const fetchCourses = useCallback(async () => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      if (!userName) {
        toast({
          title: "Error",
          description: "Username not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Use new endpoint: GET /courses/student/:username
      const response = await fetch(
        `${API_ENDPOINTS.courses.getByStudent(userName)}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        const fetchedCourses = data.data || data || [];
        if (Array.isArray(fetchedCourses)) {
          setCourses(fetchedCourses);
          if (fetchedCourses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(fetchedCourses[0].id);
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch courses' }));
        toast({
          title: "Error",
          description: errorData.message || "Failed to load courses",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    }
  }, [toast, selectedCourseId, setSelectedCourseId]);

  const fetchProject = useCallback(async () => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      if (!userName || courses.length === 0) return;

      // Use existing endpoint: GET /projects/course/:courseId
      // Fetch project for each course the student is enrolled in
      const projectPromises = courses.map(async (course: Course) => {
        try {
          const response = await fetch(
            `${API_ENDPOINTS.projects.getByCourse(course.id)}?userName=${encodeURIComponent(userName)}`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            }
          );

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              return result.data;
            }
          }
          return null;
        } catch (error) {
          console.error(`Error fetching project for course ${course.id}:`, error);
          return null;
        }
      });

      const projectResults = await Promise.all(projectPromises);
      const validProjects = projectResults.filter(p => p !== null) as Project[];
      
      setProjects(validProjects);
      
      // Auto-select first project if available
      if (validProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(validProjects[0].id);
      } else if (selectedCourseId && validProjects.length > 0) {
        // If a course is selected, try to find project for that course
        const projectForCourse = validProjects.find((p: Project) => p.courseId === selectedCourseId);
        if (projectForCourse) {
          setSelectedProjectId(projectForCourse.id);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    }
  }, [courses, selectedCourseId, selectedProjectId, setSelectedProjectId, toast]);

  const fetchTasks = useCallback(async () => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      if (!userName) return;

      if (selectedProjectId) {
        // Use existing endpoint: GET /assessment-tasks/project/:projectId
        // Fetch tasks for the selected project
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
            // Only show published tasks
            const publishedTasks = fetchedTasks.filter((task: Task) => task.status === 'published');
            setTasks(publishedTasks);
          }
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch tasks' }));
          console.error('Error fetching tasks:', errorData);
        }
      } else if (projects.length > 0) {
        // If no project selected but we have projects, fetch tasks for all projects
        const taskPromises = projects.map(async (project: Project) => {
          try {
            const response = await fetch(
              `${API_ENDPOINTS.assessmentTasks.getByProject(project.id)}?userName=${encodeURIComponent(userName)}`,
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
                // Only show published tasks
                return fetchedTasks.filter((task: Task) => task.status === 'published');
              }
            }
            return [];
          } catch (error) {
            console.error(`Error fetching tasks for project ${project.id}:`, error);
            return [];
          }
        });

        const taskResults = await Promise.all(taskPromises);
        const allTasks = taskResults.flat();
        setTasks(allTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [selectedProjectId, projects]);

  const fetchGroups = useCallback(async (courseId?: string) => {
    try {
      if (!courseId) {
        setGroups([]);
        return;
      }

      console.log('[fetchGroups] Fetching groups for courseId:', courseId);
      const url = API_ENDPOINTS.studentGroups.getByCourse(courseId);
      console.log('[fetchGroups] API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      console.log('[fetchGroups] Response status:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('[fetchGroups] Response data:', result);
        
        if (result.success) {
          const fetchedGroups = result.data || [];
          console.log('[fetchGroups] Fetched groups array:', fetchedGroups);
          console.log('[fetchGroups] Number of groups:', fetchedGroups.length);
          setGroups(Array.isArray(fetchedGroups) ? fetchedGroups : []);
        } else {
          console.warn('[fetchGroups] API returned success=false:', result);
          setGroups([]);
        }
      } else {
        const errorText = await response.text();
        console.error('[fetchGroups] API error response:', response.status, errorText);
        setGroups([]);
      }
    } catch (error) {
      console.error('[fetchGroups] Error fetching groups:', error);
      setGroups([]);
    }
  }, []);

  const fetchStakeholders = useCallback(async () => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      if (!userName) return;

      if (selectedProjectId) {
        // Use existing endpoint: GET /assessment-roles/project/:projectId
        // Fetch stakeholders for the selected project
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
            setStakeholders(result.data || []);
          }
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch stakeholders' }));
          console.error('Error fetching stakeholders:', errorData);
        }
      } else if (projects.length > 0) {
        // If no project selected but we have projects, fetch stakeholders for all projects
        const stakeholderPromises = projects.map(async (project: Project) => {
          try {
            const response = await fetch(
              `${API_ENDPOINTS.assessmentRoles.getByProject(project.id)}?userName=${encodeURIComponent(userName)}`,
              {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
              }
            );

            if (response.ok) {
              const result = await response.json();
              if (result.success) {
                return result.data || [];
              }
            }
            return [];
          } catch (error) {
            console.error(`Error fetching stakeholders for project ${project.id}:`, error);
            return [];
          }
        });

        const stakeholderResults = await Promise.all(stakeholderPromises);
        const allStakeholders = stakeholderResults.flat();
        setStakeholders(allStakeholders);
      }
    } catch (error) {
      console.error('Error fetching stakeholders:', error);
    }
  }, [selectedProjectId, projects]);

  const createNotification = useCallback(async (notificationData: {
    recipientType: 'student' | 'teacher';
    studentId?: string; // Required when recipientType is 'student'
    teacherId?: string; // Required when recipientType is 'teacher'
    title: string;
    message: string;
    summary?: string;
    type?: string;
    taskId?: string;
    taskTitle?: string;
    important?: boolean;
  }) => {
    try {
      // Determine the userName for the query parameter based on recipientType
      const userName = notificationData.recipientType === 'student' 
        ? notificationData.studentId 
        : notificationData.teacherId;
      
      if (!userName) {
        console.error('Missing studentId or teacherId for notification');
        return null;
      }

      const response = await fetch(
        `${API_ENDPOINTS.notifications.create}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(notificationData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Map the created notification to match our interface
          const createdNotification = {
            id: result.data.id,
            title: result.data.title,
            summary: result.data.summary || result.data.message || '',
            datetime: result.data.datetime || new Date().toISOString(),
            read: result.data.read || false,
            important: result.data.important || false,
            readAt: result.data.readAt,
            recipientType: result.data.recipientType,
            studentId: result.data.studentId,
            teacherId: result.data.teacherId,
            type: result.data.type,
            taskId: result.data.taskId,
            taskTitle: result.data.taskTitle,
          };
          
          // Add to local state
          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            if (!existingIds.has(createdNotification.id)) {
              return [createdNotification, ...prev];
            }
            return prev;
          });
          
          return createdNotification;
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create notification' }));
        console.error('Error creating notification:', errorData);
        return null;
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }, []);

  const fetchSubmissions = useCallback(async (options?: { 
    includeGroupMembers?: boolean; 
    groupIds?: string[];
    projectId?: string | null;
  }) => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      if (!userName) return;
      
      let allSubmissions: Submission[] = [];
      
      // If we need to fetch for group members, use project-based endpoint or fetch per member
      if (options?.includeGroupMembers && options?.projectId) {
        // Try to use project-based grouped endpoint if available
        try {
          const response = await fetch(
            `${API_ENDPOINTS.assessmentSubmissions.getByProjectGrouped(options.projectId)}?userName=${encodeURIComponent(userName)}`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            }
          );
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              // The grouped endpoint might return data in a different format
              // Flatten it to get all submissions
              const groupedData = result.data;
              // Extract all submissions from grouped structure
              if (Array.isArray(groupedData)) {
                // If it's an array of submissions, use directly
                allSubmissions = groupedData;
              } else if (groupedData.submissions && Array.isArray(groupedData.submissions)) {
                allSubmissions = groupedData.submissions;
              } else {
                // If format is different, try to extract from nested structure
                Object.values(groupedData).forEach((group: any) => {
                  if (Array.isArray(group)) {
                    allSubmissions.push(...group);
                  } else if (group.submissions && Array.isArray(group.submissions)) {
                    allSubmissions.push(...group.submissions);
                  } else if (group && typeof group === 'object') {
                    // Try to find submission-like objects
                    Object.values(group).forEach((item: any) => {
                      if (Array.isArray(item)) {
                        allSubmissions.push(...item);
                      }
                    });
                  }
                });
              }
            }
          }
        } catch (error) {
          console.warn('Failed to fetch grouped submissions, falling back to individual fetches:', error);
          // Fallback: fetch for each group member
          if (options.groupIds && groups.length > 0) {
            const memberIds = new Set<string>();
            groups.forEach(group => {
              if (options.groupIds?.includes(group.id)) {
                group.studentIds.forEach(id => memberIds.add(id));
              }
            });
            
            // Fetch submissions for each member
            const memberSubmissionsPromises = Array.from(memberIds).map(async (memberId) => {
              try {
                const response = await fetch(
                  `${API_ENDPOINTS.assessmentSubmissions.getByStudent(memberId)}?userName=${encodeURIComponent(userName)}`,
                  {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                  }
                );
                
                if (response.ok) {
                  const result = await response.json();
                  if (result.success) {
                    return result.data || [];
                  }
                }
                return [];
              } catch (error) {
                console.error(`Error fetching submissions for member ${memberId}:`, error);
                return [];
              }
            });
            
            const memberSubmissionsArrays = await Promise.all(memberSubmissionsPromises);
            allSubmissions = memberSubmissionsArrays.flat();
          }
        }
      } else {
        // Default: fetch only current user's submissions
        const response = await fetch(
          `${API_ENDPOINTS.assessmentSubmissions.getByStudent(userName)}?userName=${encodeURIComponent(userName)}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            allSubmissions = result.data || [];
          }
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch submissions' }));
          console.error('Error fetching submissions:', errorData);
        }
      }
      
      // Process all submissions (same logic as before)
      if (allSubmissions.length > 0) {
        setSubmissions(prevSubmissions => {
          // Detect new feedback by comparing with previous submissions
          const newFeedbackTasks = new Set<string>();
          allSubmissions.forEach((submission: Submission) => {
            // Check for feedback in new format (feedbackHistory) or legacy format (feedback)
            const currentFeedback = submission.feedbackHistory && submission.feedbackHistory.length > 0
              ? submission.feedbackHistory[submission.feedbackHistory.length - 1].feedback
              : submission.feedback;
            
            if (currentFeedback) {
              // Check if this is new feedback (either no previous feedback or feedback was updated)
              const previousSubmission = prevSubmissions.find(s => s.id === submission.id);
              const previousFeedback = previousSubmission 
                ? (previousSubmission.feedbackHistory && previousSubmission.feedbackHistory.length > 0
                    ? previousSubmission.feedbackHistory[previousSubmission.feedbackHistory.length - 1].feedback
                    : previousSubmission.feedback)
                : null;
              const lastSeen = lastSeenFeedback[submission.taskId];
              
              if (!previousSubmission || !previousFeedback) {
                // New feedback for this task
                newFeedbackTasks.add(submission.taskId);
              } else if (previousFeedback !== currentFeedback) {
                // Feedback was updated
                newFeedbackTasks.add(submission.taskId);
              } else if (lastSeen && new Date(submission.datetime) > new Date(lastSeen)) {
                // Feedback exists but hasn't been seen yet
                newFeedbackTasks.add(submission.taskId);
              }
            }
          });
          
          setTasksWithNewFeedback(newFeedbackTasks);
          
          // Create notifications for new feedback in the backend (only for current user)
          if (newFeedbackTasks.size > 0) {
            const userName = localStorage.getItem('ai4edu_user') || '';
            if (userName) {
              newFeedbackTasks.forEach(async (taskId) => {
                const task = tasks.find(t => t.id === taskId);
                const submission = allSubmissions.find((s: Submission) => s.taskId === taskId && s.studentId === userName);
                if (task && submission) {
                  // Create notification for student in the backend
                  await createNotification({
                    recipientType: 'student',
                    studentId: userName,
                    title: "New Feedback Received",
                    message: `You have received new feedback for task: ${task.taskTitle || task.keyword || 'Task'}`,
                    summary: `You have received new feedback for task: ${task.taskTitle || task.keyword || 'Task'}`,
                    type: 'submission',
                    taskId,
                    taskTitle: task.taskTitle || task.keyword,
                    important: true,
                  });
                }
              });
            }
          }
          
          return allSubmissions;
        });
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  }, [lastSeenFeedback, tasks, createNotification, groups]); // Added groups to dependencies

  const fetchNotifications = useCallback(async (userRole?: 'student' | 'teacher') => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      if (!userName) return;

      // Determine which endpoint to use based on role
      // If role is not specified, try to determine from user context or default to student
      const isTeacher = userRole === 'teacher';
      const endpoint = isTeacher 
        ? API_ENDPOINTS.notifications.getByTeacher(userName)
        : API_ENDPOINTS.notifications.getByStudent(userName);

      const response = await fetch(
        `${endpoint}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Map all fields including new ones from backend
          const mappedNotifications = result.data.map((notif: any) => ({
            id: notif.id,
            title: notif.title,
            summary: notif.summary || notif.message || '',
            datetime: notif.datetime,
            read: notif.read || false,
            important: notif.important || false,
            readAt: notif.readAt,
            recipientType: notif.recipientType || 'student', // Default to 'student' for backward compatibility
            studentId: notif.studentId,
            teacherId: notif.teacherId,
            type: notif.type,
            taskId: notif.taskId,
            taskTitle: notif.taskTitle,
          }));
          setNotifications(mappedNotifications);
        } else {
          setNotifications([]);
        }
      } else {
        // If endpoint doesn't exist yet, use empty array
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    // Check if notification is already read
    const notification = notifications.find(n => n.id === notificationId);
    if (notification?.read) {
      return; // Already read, no need to update
    }

    // Optimistically update local state first
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
    ));

    try {
      const response = await fetch(
        API_ENDPOINTS.notifications.markAsRead(notificationId),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update with actual readAt from backend if provided
          setNotifications(prev => prev.map(n => 
            n.id === notificationId ? { 
              ...n, 
              read: true, 
              readAt: result.data?.readAt || new Date().toISOString() 
            } : n
          ));
        } else {
          console.error('Failed to mark notification as read:', result.message);
          // Revert local state if API call fails
          setNotifications(prev => prev.map(n => 
            n.id === notificationId ? { ...n, read: false, readAt: undefined } : n
          ));
        }
      } else if (response.status === 404) {
        console.error('Notification not found');
        // Revert local state
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, read: false, readAt: undefined } : n
        ));
      } else if (response.status === 403) {
        console.error('Unauthorized to mark this notification as read');
        // Revert local state
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, read: false, readAt: undefined } : n
        ));
      } else {
        console.error('Error marking notification as read:', response.statusText);
        // Revert local state if API call fails
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, read: false, readAt: undefined } : n
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert local state if API call fails
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: false, readAt: undefined } : n
      ));
    }
  }, [notifications]);

  const toggleNotificationImportant = useCallback(async (notificationId: string) => {
    const currentNotification = notifications.find(n => n.id === notificationId);
    if (!currentNotification) return;

    try {

      const response = await fetch(
        API_ENDPOINTS.notifications.toggleImportant(notificationId),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Use the important value from backend response
          setNotifications(prev => prev.map(n => 
            n.id === notificationId ? { ...n, important: result.data.important } : n
          ));
        } else {
          console.error('Failed to toggle notification important status:', result.message);
          // Revert local state if API call fails
          setNotifications(prev => prev.map(n => 
            n.id === notificationId ? { ...n, important: currentNotification.important } : n
          ));
        }
      } else if (response.status === 404) {
        console.error('Notification not found');
        // Revert local state
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, important: currentNotification.important } : n
        ));
      } else if (response.status === 403) {
        console.error('Unauthorized to toggle this notification');
        // Revert local state
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, important: currentNotification.important } : n
        ));
      } else {
        console.error('Error toggling notification important status:', response.statusText);
        // Revert local state if API call fails
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, important: currentNotification.important } : n
        ));
      }
    } catch (error) {
      console.error('Error toggling notification important status:', error);
      // Revert local state if API call fails
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, important: currentNotification.important } : n
      ));
    }
  }, [notifications]);

  const fetchChatMessages = useCallback(async (sessionId?: string) => {
    if (!selectedStakeholderId) return;
    
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      if (!userName) return;

      // Build URL with optional sessionId query parameter
      let url = `${API_ENDPOINTS.chatMessages.getByStudentAndStakeholder(userName, selectedStakeholderId)}?userName=${encodeURIComponent(userName)}`;
      if (sessionId) {
        url += `&sessionId=${encodeURIComponent(sessionId)}`;
      }

      // Use new endpoint: GET /chat-messages/student/:username/stakeholder/:stakeholderId
      const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Backend returns both sessions and flattened chatItems
          const sessions: ChatSession[] = result.data.sessions || [];
          const chatItems: ChatMessage[] = result.data.chatItems || [];
          
          // Store sessions
          // The backend should return all sessions, but if it only returns one when sessionId is provided,
          // we need to merge with existing sessions to preserve the session list
          setChatSessions((prev) => {
            const existingSessions = prev[selectedStakeholderId] || [];
            
            // If backend returned all sessions (likely case), just use them
            // If backend only returned one session, merge it with existing ones
            if (sessionId && sessions.length === 1) {
              // Backend only returned the requested session, merge with existing
              const sessionMap = new Map(existingSessions.map(s => [s.id, s]));
              // Update or add the returned session
              sessions.forEach(session => {
                sessionMap.set(session.id, session);
              });
              return {
                ...prev,
                [selectedStakeholderId]: Array.from(sessionMap.values()),
              };
            } else {
              // Backend returned all sessions (or no sessionId provided), replace all
              return {
                ...prev,
                [selectedStakeholderId]: sessions,
              };
            }
          });
          
          // Only auto-select session if no specific sessionId was provided
          // If sessionId was provided, it's already set in selectChatSession, so don't override it
          let targetSessionId = sessionId;
          if (!sessionId) {
            // Find active session (not ended) or use the most recent one
            const activeSession = sessions.find(s => !s.endTime) || sessions[sessions.length - 1];
            if (activeSession) {
              targetSessionId = activeSession.id;
              setActiveSessionId(activeSession.id);
            }
          }
          
          // Use chatItems (flattened list) for display, or filter by selected session
          const messagesToDisplay = targetSessionId
            ? chatItems.filter(item => item.sessionId === targetSessionId)
            : chatItems;
          
          setChatMessages(messagesToDisplay);
          
          // Update chat history with flattened items
          setChatHistory((prev) => ({
            ...prev,
            [selectedStakeholderId]: chatItems,
          }));
        }
      } else {
        // If endpoint doesn't exist yet, load from state using functional update
        setChatHistory((prev) => {
          const history = prev[selectedStakeholderId] || [];
        setChatMessages(history);
          return prev; // No change to history
        });
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      // Fallback to state using functional update
      setChatHistory((prev) => {
        const history = prev[selectedStakeholderId] || [];
      setChatMessages(history);
        return prev; // No change to history
      });
    }
  }, [selectedStakeholderId]); // REMOVED 'chatHistory' from dependencies to prevent infinite loop

  const fetchQuizzes = useCallback(async () => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      if (!userName || !selectedCourseId) {
        setQuizzes([]);
        return;
      }

      // Try to fetch quizzes by course ID first
      try {
        const response = await fetch(
          `${API_ENDPOINTS.assessmentQuizzes.getByCourse(selectedCourseId)}?userName=${encodeURIComponent(userName)}`,
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
            const allQuizzes = Array.isArray(fetchedQuizzes) ? fetchedQuizzes : [];
            
            // Debug: Log raw quiz data
            console.log('[Quiz Fetch] Raw quizzes from API:', allQuizzes.length);
            allQuizzes.forEach((quiz: Quiz) => {
              console.log(`[Quiz Fetch] Quiz ${quiz.id}: ${quiz.questions?.length || 0} questions (raw)`);
              if (quiz.questions) {
                const questionIds = quiz.questions.map((q: QuizQuestion) => q.id);
                const uniqueIds = new Set(questionIds);
                console.log(`[Quiz Fetch] Question IDs:`, questionIds);
                console.log(`[Quiz Fetch] Unique question IDs:`, Array.from(uniqueIds));
                if (questionIds.length !== uniqueIds.size) {
                  console.warn(`[Quiz Fetch] WARNING: Found ${questionIds.length - uniqueIds.size} duplicate question IDs in quiz ${quiz.id}`);
                }
              }
            });
            
            // Deduplicate quizzes by ID
            const uniqueQuizzes = Array.from(
              new Map(allQuizzes.map((quiz: Quiz) => [quiz.id, quiz])).values()
            ) as Quiz[];
            
            // Deduplicate questions within each quiz
            const deduplicatedQuizzes = uniqueQuizzes.map(quiz => {
              // Ensure questions array exists and is valid
              if (!quiz.questions || !Array.isArray(quiz.questions)) {
                console.error(`[Quiz Fetch] Quiz ${quiz.id} has invalid questions array:`, quiz.questions);
                return {
                  ...quiz,
                  questions: []
                };
              }
              
              const originalCount = quiz.questions.length;
              
              // Check for missing or invalid question IDs
              const questionsWithInvalidIds = quiz.questions.filter((q: QuizQuestion) => !q.id || q.id === undefined || q.id === null);
              if (questionsWithInvalidIds.length > 0) {
                console.error(`[Quiz Fetch] Quiz ${quiz.id}: Found ${questionsWithInvalidIds.length} questions with missing/invalid IDs`);
                console.error(`[Quiz Fetch] Questions with invalid IDs:`, questionsWithInvalidIds);
              }
              
              // Check for duplicate question IDs before deduplication
              const questionIds = quiz.questions.map((q: QuizQuestion) => q.id);
              const uniqueIds = new Set(questionIds.filter(id => id != null && id !== undefined));
              const duplicateCount = originalCount - uniqueIds.size;
              
              if (duplicateCount > 0) {
                console.warn(`[Quiz Fetch] Quiz ${quiz.id}: Found ${duplicateCount} duplicate/missing question IDs out of ${originalCount} questions`);
                // Find which IDs are duplicated
                const idCounts: { [key: string]: number } = {};
                questionIds.forEach(id => {
                  if (id != null && id !== undefined) {
                    idCounts[id] = (idCounts[id] || 0) + 1;
                  }
                });
                const duplicatedIds = Object.entries(idCounts).filter(([_, count]) => count > 1);
                if (duplicatedIds.length > 0) {
                  console.warn(`[Quiz Fetch] Duplicated question IDs:`, duplicatedIds.map(([id]) => id));
                }
              }
              
              // Deduplicate questions, but use index as fallback for questions without IDs
              const deduplicatedQuestions = Array.from(
                new Map(quiz.questions.map((q: QuizQuestion, index: number) => {
                  // Use ID if available, otherwise use index as fallback
                  const key = q.id || `question-${index}`;
                  return [key, q];
                })).values()
              ) as QuizQuestion[];
              
              // Debug: Log deduplication results
              if (originalCount !== deduplicatedQuestions.length) {
                console.warn(`[Quiz Fetch] Quiz ${quiz.id}: Deduplicated ${originalCount} questions to ${deduplicatedQuestions.length} (removed ${originalCount - deduplicatedQuestions.length} duplicates)`);
              } else {
                console.log(`[Quiz Fetch] Quiz ${quiz.id}: ${deduplicatedQuestions.length} questions (no duplicates found)`);
              }
              
              return {
                ...quiz,
                questions: deduplicatedQuestions
              };
            });
            
            setQuizzes(deduplicatedQuizzes);

            // Auto-select first quiz if available
            if (deduplicatedQuizzes.length > 0 && !selectedQuizId) {
              setSelectedQuizId(deduplicatedQuizzes[0].id);
            }
            return;
          }
        } else if (response.status === 404) {
          // Endpoint doesn't exist, skip silently to fallback
          console.log('Quiz by course endpoint not available, using project-based fetch');
        } else if (response.status === 429) {
          // Rate limited, wait and retry later
          console.warn('Rate limited when fetching quizzes by course, will retry via project fetch');
        }
      } catch (error) {
        // Only log if it's not a 404
        if (error instanceof Error && !error.message.includes('404')) {
          console.warn('Error fetching quizzes by course, falling back to project-based fetch:', error);
        }
      }

      // Fallback: Fetch quizzes for all projects the student has access to
      if (projects.length > 0) {
        // Add delay between requests to avoid rate limiting
        const quizResults = [];
        for (let i = 0; i < projects.length; i++) {
          const project = projects[i];
          try {
            // Add 100ms delay between each project request
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            const response = await fetch(
              `${API_ENDPOINTS.assessmentQuizzes.getByProject(project.id)}?userName=${encodeURIComponent(userName)}`,
              {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
              }
            );

            if (response.ok) {
              const result = await response.json();
              if (result.success) {
                quizResults.push(...(result.data || []));
              }
            } else if (response.status === 429) {
              console.warn('Rate limited when fetching quizzes for projects, stopping');
              break; // Stop fetching to avoid more 429s
            }
          } catch (error) {
            console.error(`Error fetching quizzes for project ${project.id}:`, error);
          }
        }

        // Deduplicate quizzes by ID (in case same quiz exists in multiple projects)
        const uniqueQuizzes = Array.from(
          new Map(quizResults.map((quiz: Quiz) => [quiz.id, quiz])).values()
        ) as Quiz[];
        
        // Deduplicate questions within each quiz
        const deduplicatedQuizzes = uniqueQuizzes.map(quiz => {
          // Ensure questions array exists and is valid
          if (!quiz.questions || !Array.isArray(quiz.questions)) {
            console.error(`[Quiz Fetch] Quiz ${quiz.id} from project has invalid questions array:`, quiz.questions);
            return {
              ...quiz,
              questions: []
            };
          }
          
          const originalCount = quiz.questions.length;
          
          // Check for missing or invalid question IDs
          const questionsWithInvalidIds = quiz.questions.filter((q: QuizQuestion) => !q.id || q.id === undefined || q.id === null);
          if (questionsWithInvalidIds.length > 0) {
            console.error(`[Quiz Fetch] Quiz ${quiz.id} from project: Found ${questionsWithInvalidIds.length} questions with missing/invalid IDs`);
            console.error(`[Quiz Fetch] Questions with invalid IDs:`, questionsWithInvalidIds);
          }
          
          // Check for duplicate question IDs before deduplication
          const questionIds = quiz.questions.map((q: QuizQuestion) => q.id);
          const uniqueIds = new Set(questionIds.filter(id => id != null && id !== undefined));
          const duplicateCount = originalCount - uniqueIds.size;
          
          if (duplicateCount > 0) {
            console.warn(`[Quiz Fetch] Quiz ${quiz.id} from project: Found ${duplicateCount} duplicate/missing question IDs out of ${originalCount} questions`);
            // Find which IDs are duplicated
            const idCounts: { [key: string]: number } = {};
            questionIds.forEach(id => {
              if (id != null && id !== undefined) {
                idCounts[id] = (idCounts[id] || 0) + 1;
              }
            });
            const duplicatedIds = Object.entries(idCounts).filter(([_, count]) => count > 1);
            if (duplicatedIds.length > 0) {
              console.warn(`[Quiz Fetch] Duplicated question IDs:`, duplicatedIds.map(([id]) => id));
            }
          }
          
          // Deduplicate questions, but use index as fallback for questions without IDs
          const deduplicatedQuestions = Array.from(
            new Map(quiz.questions.map((q: QuizQuestion, index: number) => {
              // Use ID if available, otherwise use index as fallback
              const key = q.id || `question-${index}`;
              return [key, q];
            })).values()
          ) as QuizQuestion[];
          
          // Debug: Log deduplication results
          console.log(`[Quiz Fetch] Quiz ${quiz.id} from project: ${originalCount} questions (raw) -> ${deduplicatedQuestions.length} questions (deduplicated)`);
          if (originalCount !== deduplicatedQuestions.length) {
            console.warn(`[Quiz Fetch] WARNING: Removed ${originalCount - deduplicatedQuestions.length} duplicate questions from quiz ${quiz.id}`);
          }
          
          return {
            ...quiz,
            questions: deduplicatedQuestions
          };
        });
        
        setQuizzes(deduplicatedQuizzes);

        // Auto-select first quiz if available
        if (deduplicatedQuizzes.length > 0 && !selectedQuizId) {
          setSelectedQuizId(deduplicatedQuizzes[0].id);
        }
      } else {
        setQuizzes([]);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setQuizzes([]);
    }
  }, [selectedCourseId, projects, selectedQuizId]);

  const loadQuizState = useCallback(async (quizId: string) => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      if (!userName) return;

      // Try to load from backend first
      try {
        const response = await fetch(
          `${API_ENDPOINTS.quizSubmissions.getByQuizAndStudent(quizId, userName)}?userName=${encodeURIComponent(userName)}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const submission = result.data;
            setQuizSubmissionId(submission.id || submission._id);
            setQuizAnswers(submission.answers || {});
            setQuizComments(submission.comments || {});
            setQuizLockedAnswers(submission.lockedAnswers || {});
            setQuizIsSubmitted(submission.isSubmitted || false);
            setQuizScore(submission.score || null);
            
            // Restore current question index from submission or default to 0
            const state: QuizState = {
              quizId,
              currentQuestionIndex: submission.currentQuestionIndex || 0,
              answers: submission.answers || {},
              comments: submission.comments || {},
              lockedAnswers: submission.lockedAnswers || {},
              isSubmitted: submission.isSubmitted || false,
              score: submission.score || null,
              submittedAt: submission.submittedAt || null,
              startedAt: submission.startedAt || new Date().toISOString(),
              lastUpdated: submission.lastUpdated || new Date().toISOString(),
            };
            setQuizState(state);
            // Ensure current question index is within bounds
            const currentQuiz = quizzes.find(q => q.id === quizId);
            if (currentQuiz) {
              const maxIndex = currentQuiz.questions.length - 1;
              setCurrentQuestionIndex(Math.min(state.currentQuestionIndex, maxIndex));
            } else {
              setCurrentQuestionIndex(state.currentQuestionIndex);
            }
            return;
          }
        }
      } catch (error) {
        console.warn('Error loading quiz state from backend, trying localStorage:', error);
      }

      // Fallback to localStorage
      const storageKey = `quiz_state_${userName}_${quizId}`;
      const savedState = localStorage.getItem(storageKey);
      
      if (savedState) {
        const state: QuizState = JSON.parse(savedState);
        setQuizState(state);
        setCurrentQuestionIndex(state.currentQuestionIndex);
        setQuizAnswers(state.answers);
        setQuizComments(state.comments || {});
        setQuizLockedAnswers(state.lockedAnswers || {});
        setQuizIsSubmitted(state.isSubmitted || false);
        setQuizScore(state.score || null);
      } else {
        // Initialize new quiz state
        const newState: QuizState = {
          quizId,
          currentQuestionIndex: 0,
          answers: {},
          comments: {},
          lockedAnswers: {},
          isSubmitted: false,
          score: null,
          submittedAt: null,
          startedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };
        setQuizState(newState);
        setCurrentQuestionIndex(0);
        setQuizAnswers({});
        setQuizComments({});
        setQuizLockedAnswers({});
        setQuizIsSubmitted(false);
        setQuizScore(null);
      }
    } catch (error) {
      console.error('Error loading quiz state:', error);
    }
  }, []);

  const saveQuizState = useCallback(async (quizId: string, questionIndex: number, answers: { [questionId: string]: number | null }, comments: { [questionId: string]: string }, lockedAnswers?: { [questionId: string]: boolean }, isSubmitted?: boolean, score?: number | null) => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      if (!userName) return;

      const finalLockedAnswers = lockedAnswers || quizLockedAnswers;
      const finalIsSubmitted = isSubmitted !== undefined ? isSubmitted : (quizState?.isSubmitted || false);
      const finalScore = score !== undefined ? score : (quizState?.score || null);
      const submittedAt = isSubmitted ? (quizState?.submittedAt || new Date().toISOString()) : quizState?.submittedAt || null;
      const startedAt = quizState?.startedAt || new Date().toISOString();

      const submissionData = {
        quizId,
        studentId: userName,
        courseId: selectedCourseId,
        answers,
        comments,
        lockedAnswers: finalLockedAnswers,
        score: finalScore,
        isSubmitted: finalIsSubmitted,
        submittedAt: submittedAt,
        startedAt: startedAt,
        currentQuestionIndex: questionIndex,
      };

      // Save to backend
      try {
        let response;
        if (quizSubmissionId) {
          // Update existing submission
          response = await fetch(
            `${API_ENDPOINTS.quizSubmissions.update(quizSubmissionId)}?userName=${encodeURIComponent(userName)}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(submissionData),
            }
          );
        } else {
          // Create new submission
          response = await fetch(
            `${API_ENDPOINTS.quizSubmissions.create}?userName=${encodeURIComponent(userName)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(submissionData),
            }
          );
        }

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const savedSubmission = result.data;
            setQuizSubmissionId(savedSubmission.id || savedSubmission._id);
          }
        } else {
          console.warn('Failed to save quiz state to backend, saving to localStorage only');
        }
      } catch (error) {
        console.warn('Error saving quiz state to backend, saving to localStorage only:', error);
      }

      // Also save to localStorage as backup
      const storageKey = `quiz_state_${userName}_${quizId}`;
      const state: QuizState = {
        quizId,
        currentQuestionIndex: questionIndex,
        answers,
        comments,
        lockedAnswers: finalLockedAnswers,
        isSubmitted: finalIsSubmitted,
        score: finalScore,
        submittedAt: submittedAt,
        startedAt: startedAt,
        lastUpdated: new Date().toISOString(),
      };
      
      localStorage.setItem(storageKey, JSON.stringify(state));
      setQuizState(state);
    } catch (error) {
      console.error('Error saving quiz state:', error);
    }
  }, [quizLockedAnswers, quizState, quizSubmissionId, selectedCourseId]);

  const calculateScore = (quiz: Quiz, answers: { [questionId: string]: number | null }): number => {
    if (!quiz || quiz.questions.length === 0) return 0;
    
    const answeredQuestions = quiz.questions.filter(q => answers[q.id] !== null && answers[q.id] !== undefined);
    if (answeredQuestions.length === 0) return 0;
    
    const correctAnswers = answeredQuestions.filter(q => {
      const studentAnswer = answers[q.id];
      return studentAnswer === q.correctAnswer;
    }).length;
    
    return Math.round((correctAnswers / answeredQuestions.length) * 100);
  };

  const getAnsweredQuestionsCount = (quiz: Quiz | undefined, answers: { [questionId: string]: number | null }): number => {
    if (!quiz || !quiz.questions) return 0;
    return quiz.questions.filter(q => answers[q.id] !== null && answers[q.id] !== undefined).length;
  };

  const handleQuizSubmit = async (quiz: Quiz) => {
    // Lock all answered questions
    const newLockedAnswers: { [questionId: string]: boolean } = {};
    Object.keys(quizAnswers).forEach(questionId => {
      if (quizAnswers[questionId] !== null && quizAnswers[questionId] !== undefined) {
        newLockedAnswers[questionId] = true;
      }
    });
    
    // Calculate score based on answered questions
    const score = calculateScore(quiz, quizAnswers);
    
    // Save state with locked answers and submission status
    if (selectedQuizId) {
      await saveQuizState(selectedQuizId, currentQuestionIndex, quizAnswers, quizComments, newLockedAnswers, true, score);
      setQuizLockedAnswers(newLockedAnswers);
      setQuizIsSubmitted(true);
      setQuizScore(score);
      
      toast({
        title: "Quiz Submitted",
        description: `Your score: ${score}% (${getAnsweredQuestionsCount(quiz, quizAnswers)} questions answered)`,
      });
    }
  };

  const fetchQuizLeaderboard = useCallback(async () => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      if (!selectedQuizId) {
        setQuizLeaderboard([]);
        return;
      }

      // Fetch quiz scores from new endpoint
      const queryParams = new URLSearchParams();
      queryParams.append('userName', userName);
      queryParams.append('quizId', selectedQuizId);
      
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
          // Get top 10 scores (already sorted by backend)
          const top10 = result.data.slice(0, 10);
          const leaderboard = top10.map((entry: any) => ({
            studentId: entry.studentId,
            studentName: entry.studentName || entry.studentId || 'Unknown',
            score: entry.score || 0,
          }));
          setQuizLeaderboard(leaderboard);
        } else {
          setQuizLeaderboard([]);
        }
      } else {
        console.warn('Failed to fetch quiz scores, using empty array');
        setQuizLeaderboard([]);
      }
    } catch (error) {
      console.error('Error fetching quiz scores:', error);
      setQuizLeaderboard([]);
    }
  }, [selectedQuizId]);

  const fetchProgressStats = useCallback(async () => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      if (!userName || !selectedProjectId) {
        // If no project selected, reset to defaults
        setProgressStats({
          tasksDone: 0,
          tasksActive: 0,
          tasksOnTime: 0,
          tasksLate: 0,
          tasksNotStartedLate: 0,
          tasksNotStartedOnSchedule: 0,
          averageScore: 0,
          feedbackReceived: 0,
          feedbackRead: 0,
          feedbackQuestionsAnswered: 0,
          submissions: 0,
          submissionQuestionsAnswered: 0,
          conversationItems: 0,
          engagementLength: 0,
          engagementDuration: 0,
        });
        setGroupMetrics([]);
        return;
      }

      // Call new backend endpoint: GET /api/v1/student-metrics/progress-student
      // Use scope="both" to get both individual and group metrics in one call
      const params = new URLSearchParams({
        projectId: selectedProjectId,
        userName: userName,  // Required for authentication
        studentId: userName, // For student view, studentId = logged-in user
        scope: "both",       // Get both individual and group metrics
      });

      const url = `${API_ENDPOINTS.studentMetrics.progressStudent}?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const data = result.data;
          
          // Map individualMetrics to ProgressStats interface
          if (data.individualMetrics) {
            const metrics = data.individualMetrics;
            setProgressStats({
              tasksDone: metrics.tasksDone || 0,
              tasksActive: 0, // Not provided by backend, keep as 0
              tasksOnTime: 0, // Not provided by backend, keep as 0
              tasksLate: metrics.tasksLate || 0,
              tasksNotStartedLate: 0, // Not provided by backend, keep as 0
              tasksNotStartedOnSchedule: 0, // Not provided by backend, keep as 0
              averageScore: metrics.averageScore || 0,
              feedbackReceived: metrics.feedbackReceivedCount || 0,
              feedbackRead: metrics.feedbackOnFeedbackCount || 0,
              feedbackQuestionsAnswered: 0, // Not provided by backend, keep as 0
              submissions: metrics.submissionsCount || 0,
              submissionQuestionsAnswered: metrics.submissionQuestionsAnsweredCount || 0,
              conversationItems: metrics.conversationSessionsPerMonth || 0,  // Sessions per month (for "Conversation sessions / month")
              engagementLength: metrics.conversationMessagesCount || 0,      // Total messages (for "Sessions length")
              engagementDuration: 0, // Not provided by backend, keep as 0
            });
          }
          
          // Store groupMetrics for Group tab
          if (data.groupMetrics && Array.isArray(data.groupMetrics)) {
            setGroupMetrics(data.groupMetrics);
          } else {
            setGroupMetrics([]);
          }
        } else {
          console.warn('Backend returned success=false for progress metrics:', result);
          // Fallback to defaults
          setProgressStats({
            tasksDone: 0,
            tasksActive: 0,
            tasksOnTime: 0,
            tasksLate: 0,
            tasksNotStartedLate: 0,
            tasksNotStartedOnSchedule: 0,
            averageScore: 0,
            feedbackReceived: 0,
            feedbackRead: 0,
            feedbackQuestionsAnswered: 0,
            submissions: 0,
            submissionQuestionsAnswered: 0,
            conversationItems: 0,
            engagementLength: 0,
            engagementDuration: 0,
          });
          setGroupMetrics([]);
        }
      } else {
        // Try to get error details from response
        let errorMessage = `Failed to fetch progress metrics: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('Backend error response:', errorData);
        } catch (e) {
          // If response is not JSON, use status text
        }
        console.error(errorMessage);
        
        // Fallback to defaults on error
        setProgressStats({
          tasksDone: 0,
          tasksActive: 0,
          tasksOnTime: 0,
          tasksLate: 0,
          tasksNotStartedLate: 0,
          tasksNotStartedOnSchedule: 0,
          averageScore: 0,
          feedbackReceived: 0,
          feedbackRead: 0,
          feedbackQuestionsAnswered: 0,
          submissions: 0,
          submissionQuestionsAnswered: 0,
          conversationItems: 0,
          engagementLength: 0,
          engagementDuration: 0,
        });
        setGroupMetrics([]);
      }
    } catch (error) {
      console.error('Error fetching progress stats from backend:', error);
      // Fallback to defaults on error
      setProgressStats({
        tasksDone: 0,
        tasksActive: 0,
        tasksOnTime: 0,
        tasksLate: 0,
        tasksNotStartedLate: 0,
        tasksNotStartedOnSchedule: 0,
        averageScore: 0,
        feedbackReceived: 0,
        feedbackRead: 0,
        feedbackQuestionsAnswered: 0,
        submissions: 0,
        submissionQuestionsAnswered: 0,
        conversationItems: 0,
        engagementLength: 0,
        engagementDuration: 0,
      });
      setGroupMetrics([]);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    setIsInAssignmentSupport(true);
    return () => setIsInAssignmentSupport(false);
  }, [setIsInAssignmentSupport]);

  // Fetch courses for student
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Fetch groups when course is selected
  useEffect(() => {
    if (selectedCourseId) {
      fetchGroups(selectedCourseId);
    } else {
      setGroups([]);
    }
  }, [selectedCourseId, fetchGroups]);

  // Fetch projects when courses are loaded (with delay to avoid burst)
  useEffect(() => {
    if (courses.length > 0) {
      // Delay to avoid immediate burst after courses load
      const timer = setTimeout(() => {
      fetchProject();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [courses, fetchProject]);

  // === Lazy loading per section ===
  // Fetch tasks when "project" section is active
  useEffect(() => {
    if (activeSection === "project" && selectedProjectId) {
      // Only fetch if we don't have tasks yet or if project changed
      if (tasks.length === 0 || tasks[0]?.projectId !== selectedProjectId) {
      fetchTasks();
      }
    }
  }, [activeSection, selectedProjectId, fetchTasks, tasks]);

  // Fetch task-related submissions when "task" section is active and a task is selected
  useEffect(() => {
    if (activeSection === "task" && selectedTaskId) {
      // Only fetch once per task to prevent infinite loops
      if (taskSubmissionsFetchedRef.current !== selectedTaskId) {
        // Check if we already have submissions for this task
        const hasSubmission = submissions.some((s) => s.taskId === selectedTaskId);
        if (!hasSubmission) {
          taskSubmissionsFetchedRef.current = selectedTaskId;
      fetchSubmissions();
        } else {
          // Mark as fetched even if we already have it
          taskSubmissionsFetchedRef.current = selectedTaskId;
    }
      }
    }
  }, [activeSection, selectedTaskId, fetchSubmissions]); // REMOVED 'submissions' from dependencies to prevent infinite loop

  // Poll for new feedback when task section is active and a task is selected
  useEffect(() => {
    if (activeSection === "task" && selectedTaskId) {
      // Poll every 10 seconds for new feedback
      const pollInterval = setInterval(() => {
        fetchSubmissions();
      }, 10000); // 10 seconds

      return () => clearInterval(pollInterval);
    }
  }, [activeSection, selectedTaskId, fetchSubmissions]);

  // Reset feedback agreement dialog state when task changes
  useEffect(() => {
    // Reset feedback agreement dialog when switching tasks
    setShowFeedbackAgreement(false);
    setFeedbackAgreement(null);
    setFeedbackComment("");
    setFeedbackTimer(300); // Reset to initial timer value
  }, [selectedTaskId]);

  // Fetch notifications when "notification" section is active
  useEffect(() => {
    if (activeSection === "notification") {
      // Only fetch if we don't have notifications yet
      if (notifications.length === 0) {
    fetchNotifications();
      }
    }
  }, [activeSection, fetchNotifications, notifications.length]);

  // Fetch chat messages when stakeholder is selected (with delay)
  useEffect(() => {
    if (selectedStakeholderId) {
      // Clear active session and messages when switching stakeholders
      setActiveSessionId(null);
      setChatMessages([]);
      
      const timer = setTimeout(() => {
      fetchChatMessages();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // Clear active session when stakeholder changes
      setActiveSessionId(null);
      setChatMessages([]);
    }
  }, [selectedStakeholderId, fetchChatMessages]);

  // Fetch stakeholders when "stakeholder" section is active
  useEffect(() => {
    if (activeSection === "stakeholder" && selectedProjectId) {
      // Only fetch if we don't have stakeholders yet or if project changed
      if (stakeholders.length === 0 || stakeholders[0]?.projectId !== selectedProjectId) {
        fetchStakeholders();
      }
    }
  }, [activeSection, selectedProjectId, fetchStakeholders, stakeholders]);

  // Fetch progress stats when "progress" section is active
  useEffect(() => {
    if (activeSection === "progress" && selectedProjectId) {
      // Fetch progress stats from backend endpoint
      // No need to fetch tasks/submissions separately as backend handles all calculations
      fetchProgressStats();
    }
  }, [activeSection, selectedProjectId, fetchProgressStats]);

  // Fetch quizzes when "quiz" section is active
  useEffect(() => {
    if (activeSection === "quiz" && selectedCourseId) {
      // Only fetch if we don't have quizzes yet
      if (quizzes.length === 0) {
        fetchQuizzes();
      }
    }
  }, [activeSection, selectedCourseId, fetchQuizzes, quizzes.length]);

  // Load quiz state when quiz is selected (with delay)
  useEffect(() => {
    if (selectedQuizId) {
      const timer = setTimeout(() => {
        // Reset submission ID when switching quizzes
        setQuizSubmissionId(null);
        loadQuizState(selectedQuizId);
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [selectedQuizId, loadQuizState]);

  // Cleanup reflection timer interval on unmount
  useEffect(() => {
    return () => {
      if (reflectionTimerIntervalRef.current) {
        clearInterval(reflectionTimerIntervalRef.current);
        reflectionTimerIntervalRef.current = null;
      }
    };
  }, []);

  const handleSubmitTask = async () => {
    if (!selectedTaskId || !taskSubmission.trim()) {
      toast({
        title: "Error",
        description: "Please enter your submission",
        variant: "destructive",
      });
      return;
    }

    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    // If lockOnSubmissionQuestion is enabled, show reflection dialog
    if (task.lockOnSubmissionQuestion) {
      // Clear any existing timer interval
      if (reflectionTimerIntervalRef.current) {
        clearInterval(reflectionTimerIntervalRef.current);
        reflectionTimerIntervalRef.current = null;
      }
      // Reset timer to 300 seconds
      setReflectionTimer(300);
      setShowReflectionDialog(true);
      // Start timer
      const interval = setInterval(() => {
        setReflectionTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            reflectionTimerIntervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      reflectionTimerIntervalRef.current = interval;
    } else {
      await submitTask();
    }
  };

  const submitTask = async () => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      if (!userName) {
        toast({
          title: "Error",
          description: "Username not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Get student name from existing submissions or use userName as fallback
      const existingSubmission = submissions.find(s => s.studentId === userName && s.taskId === selectedTaskId);
      const studentName = existingSubmission?.studentName || userName;

      // Calculate attempt number based on existing submissions for this task
      const taskSubmissions = submissions.filter(s => s.taskId === selectedTaskId && s.studentId === userName);
      const attemptNumber = taskSubmissions.length + 1;

      // Get conversationLog if available (from previous conversations)
      const conversationLog = existingSubmission?.conversationLog || '';

      // Upload file first if one is selected
      let uploadedFilePath: string | null = null;
      if (submissionFile) {
        try {
          const formData = new FormData();
          formData.append('file', submissionFile);

          console.log('[Submit Task] Uploading file:', {
            fileName: submissionFile.name,
            fileSize: submissionFile.size,
            fileType: submissionFile.type,
            endpoint: `${API_ENDPOINTS.files.upload}?userName=${encodeURIComponent(userName)}`
          });

          const uploadResponse = await fetch(
            `${API_ENDPOINTS.files.upload}?userName=${encodeURIComponent(userName)}`,
            {
              method: 'POST',
              credentials: 'include',
              body: formData,
            }
          );
          
          console.log('[Submit Task] Upload response status:', uploadResponse.status);

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            console.log('[Submit Task] File upload response:', uploadResult);
            
            // Extract file path from response
            uploadedFilePath = uploadResult.data?.filename || 
                              uploadResult.data?.path || 
                              uploadResult.filename || 
                              uploadResult.path;
            
            if (!uploadedFilePath) {
              console.warn('[Submit Task] File uploaded but no path returned:', uploadResult);
              // Try to construct path from filename
              uploadedFilePath = uploadResult.data?.name || submissionFile.name;
            }
            
            console.log('[Submit Task] File uploaded successfully:', uploadedFilePath);
          } else {
            // Enhanced error handling for 500 errors
            console.error('[Submit Task] File upload failed with status:', uploadResponse.status, uploadResponse.statusText);
            
            let errorMessage = 'Failed to upload file';
            let errorDetails: any = {};
            
            try {
              // Try to get error details from JSON response
              const errorData = await uploadResponse.json();
              console.error('[Submit Task] File upload error response:', errorData);
              console.error('[Submit Task] Full error object:', JSON.stringify(errorData, null, 2));
              
              errorDetails = errorData;
              errorMessage = errorData.message || 
                            errorData.error || 
                            errorData.details || 
                            errorData.stack ||
                            `Server error: ${uploadResponse.status} ${uploadResponse.statusText}`;
              
              // Log validation errors if present
              if (errorData.errors) {
                console.error('[Submit Task] Validation errors:', errorData.errors);
              }
            } catch (parseError) {
              // If JSON parsing fails, try to get text response
              try {
                const errorText = await uploadResponse.text();
                console.error('[Submit Task] File upload error text:', errorText);
                errorMessage = errorText || errorMessage;
              } catch (textError) {
                console.error('[Submit Task] Failed to read error response:', textError);
                errorMessage = `Server error: ${uploadResponse.status} ${uploadResponse.statusText}`;
              }
            }
            
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
            return;
          }
        } catch (uploadError) {
          console.error('[Submit Task] Error uploading file:', uploadError);
          toast({
            title: "Error",
            description: "Failed to upload file. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      const requestBody: any = {
        taskId: selectedTaskId,
        studentId: userName,
        studentName: studentName,
        submission: taskSubmission,
        attemptNumber: attemptNumber,
      };

      // Add attachments if file was uploaded
      if (uploadedFilePath) {
        requestBody.attachments = [uploadedFilePath];
      }

      // Add conversationLog only if it exists
      if (conversationLog && conversationLog.trim()) {
        requestBody.conversationLog = conversationLog;
      }

      // Add submission question answer if reflectionText exists
      if (reflectionText && reflectionText.trim()) {
        requestBody.submissionQuestionAnswer = reflectionText; // Singular, string as per backend schema
      }

      console.log('[Submit Task] Request body:', { ...requestBody, submission: '***' });

      const response = await fetch(API_ENDPOINTS.assessmentSubmissions.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to submit task' }));
        console.error('[Submit Task] Error response:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to submit task');
      }

      const result = await response.json();
      if (result.success) {
        // Clear timer interval when task is submitted
        if (reflectionTimerIntervalRef.current) {
          clearInterval(reflectionTimerIntervalRef.current);
          reflectionTimerIntervalRef.current = null;
        }
        toast({ title: "Success", description: "Task submitted successfully" });
        setTaskSubmission("");
        setReflectionText("");
        setSubmissionFile(null); // Clear the file after successful submission
        setShowReflectionDialog(false);
        fetchSubmissions();
        
        // Create notification for teacher about new submission
        if (selectedTaskId) {
          const task = tasks.find(t => t.id === selectedTaskId);
          if (task) {
            // Get course information to identify teacher
            // Note: You may need to adjust this based on how teacherId is stored in your system
            // Options: course.teacherId, course.instructorId, course.createdBy, or from submission response
            const project = projects.find(p => p.id === task.projectId);
            const course = courses.find(c => c.id === project?.courseId);
            
            // Try to get teacherId from various possible sources
            // Adjust these based on your actual data structure
            const teacherId = (course as any)?.teacherId 
              || (course as any)?.instructorId 
              || (course as any)?.createdBy
              || (result.data as any)?.teacherId; // Check if backend returns teacherId in submission response
            
            if (teacherId) {
              await createNotification({
                recipientType: 'teacher',
                teacherId: teacherId,
                title: "New Submission Received",
                message: `${studentName} has submitted ${task.taskTitle || task.keyword || 'a task'}`,
                summary: `New submission from ${studentName} for task: ${task.taskTitle || task.keyword || 'Task'}`,
                type: 'submission',
                taskId: selectedTaskId,
                taskTitle: task.taskTitle || task.keyword,
                important: true,
              });
            } else {
              console.warn('Teacher ID not found. Cannot create teacher notification for submission.');
            }
          }
        }
      } else {
        throw new Error(result.message || 'Failed to submit task');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit task",
        variant: "destructive",
      });
    }
  };

  const handleFeedbackRead = async () => {
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task || !task.lockOnFeedbackReceivedQuestion) {
      return;
    }

    // If user has already answered (yes/no selected), save it directly
    if (feedbackAgreement !== null) {
      await handleFeedbackSubmit();
      return;
    }

    // Mark feedback as seen for this task
    if (selectedTaskId && tasksWithNewFeedback.has(selectedTaskId)) {
      const submission = submissions.find(s => s.taskId === selectedTaskId && 
        ((s.feedbackHistory && s.feedbackHistory.length > 0) || s.feedback)
      );
      if (submission) {
        setLastSeenFeedback(prev => ({
          ...prev,
          [selectedTaskId]: submission.datetime,
        }));
        setTasksWithNewFeedback(prev => {
          const newSet = new Set(prev);
          newSet.delete(selectedTaskId);
          return newSet;
        });
      }
    }

    // Open the dialog if no answer has been provided yet
    setShowFeedbackAgreement(true);
    const interval = setInterval(() => {
      setFeedbackTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedTaskId || feedbackAgreement === null) {
      return;
    }

    // Find the LATEST submission with feedback for this task
    const submissionsWithFeedback = taskSubmissions
      .filter(s => s.taskId === selectedTaskId && s.feedback)
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
    
    const latestSubmission = submissionsWithFeedback[0];

    if (!latestSubmission || !latestSubmission.id) {
      toast({
        title: "Error",
        description: "No submission found to update",
        variant: "destructive",
      });
      return;
    }

    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      const response = await fetch(
        `${API_ENDPOINTS.assessmentSubmissions.update(latestSubmission.id)}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            feedbackReceivedQuestionAnswer: feedbackAgreement !== null
              ? (feedbackAgreement 
                  ? 'Yes' 
                  : feedbackComment && feedbackComment.trim()
                    ? `No - ${feedbackComment.trim()}` 
                    : 'No')
              : null,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast({
            title: "Success",
            description: "Feedback agreement saved successfully",
          });
          // Refresh submissions to get updated data
          await fetchSubmissions();
          // Close dialog and reset state
          setShowFeedbackAgreement(false);
          setFeedbackAgreement(null);
          setFeedbackComment("");
          setFeedbackTimer(300);
        } else {
          throw new Error(result.message || 'Failed to save feedback agreement');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving feedback agreement:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save feedback agreement",
        variant: "destructive",
      });
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !selectedStakeholderId || !selectedProjectId) return;
    
    // Prevent duplicate calls
    if (isSendingMessageRef.current) {
      console.warn('Message already being sent, ignoring duplicate call');
      return;
    }

    try {
      isSendingMessageRef.current = true; // Set flag to prevent duplicate calls
      
      const userName = localStorage.getItem('ai4edu_user') || '';
      if (!userName) return;

      // Save message before clearing input
      const messageToSend = chatInput;

      // Optimistically add student message
      const studentMessage: ChatMessage = {
        id: Date.now().toString(),
        stakeholderId: selectedStakeholderId,
        message: messageToSend,
        sender: 'student',
        timestamp: new Date().toISOString(),
      };

      setChatMessages(prev => [...prev, studentMessage]); // Use functional update
      setChatInput("");
      setIsChatbotThinking(true); // Show loading indicator

      // Use new endpoint: POST /chat-messages
      // Include sessionId if we have an active session, or title for new session
      const requestBody: any = {
        studentId: userName,
        stakeholderId: selectedStakeholderId,
        message: messageToSend,
        projectId: selectedProjectId,
        sender: 'student', // Explicitly set sender to ensure it's saved correctly
      };
      
      // Add sessionId if continuing an existing session
      if (activeSessionId) {
        requestBody.sessionId = activeSessionId;
      } else {
        // Optionally add title for new session (you can make this user-configurable)
        // For now, we'll let the backend generate a default title
      }
      
      const response = await fetch(API_ENDPOINTS.chatMessages.send, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Backend returns session info and both messages
          const sessionInfo = result.data.session;
          const studentMessage = result.data.studentMessage;
          const stakeholderResponse = result.data.stakeholderResponse;
          
          // Update active session ID if we got a new session
          if (sessionInfo && sessionInfo.id) {
            setActiveSessionId(sessionInfo.id);
            
            // If session was ended but we're adding messages, update session state
            // The backend may have reopened the session (cleared endTime)
            setChatSessions(prev => {
              const stakeholderSessions = prev[selectedStakeholderId || ''] || [];
              const sessionIndex = stakeholderSessions.findIndex(s => s.id === sessionInfo.id);
              
              if (sessionIndex >= 0) {
                // Update existing session (may clear endTime if reopened)
                const updatedSessions = [...stakeholderSessions];
                updatedSessions[sessionIndex] = {
                  ...updatedSessions[sessionIndex],
                  ...sessionInfo,
                  // If backend returned session without endTime, it means it was reopened
                  endTime: sessionInfo.endTime || undefined,
                };
                return {
                  ...prev,
                  [selectedStakeholderId || '']: updatedSessions,
                };
              } else {
                // New session, add it
                return {
                  ...prev,
                  [selectedStakeholderId || '']: [sessionInfo, ...stakeholderSessions],
                };
              }
            });
          }
          
          // Map messages with session info and OpenAI metrics
          const mappedStudentMessage: ChatMessage = {
            ...studentMessage,
            sessionId: sessionInfo?.id,
          };
          
          const mappedStakeholderResponse: ChatMessage = {
            ...stakeholderResponse,
            sessionId: sessionInfo?.id,
            responseSize: stakeholderResponse.responseSize,
            tokenUsage: stakeholderResponse.tokenUsage,
            responseTime: stakeholderResponse.responseTime,
          };
          
          // Only add the AI response (student message already added optimistically)
          // Use functional updates to ensure we're working with the latest state
          setChatMessages(prev => {
            // Check if we already have the student message (from optimistic update)
            const hasStudentMessage = prev.some(msg => 
              msg.sender === 'student' && 
              msg.message === mappedStudentMessage.message &&
              Math.abs(new Date(msg.timestamp).getTime() - new Date(mappedStudentMessage.timestamp).getTime()) < 5000
            );
            
            if (hasStudentMessage) {
              // Student message already added optimistically, only add AI response
              return [...prev, mappedStakeholderResponse];
      } else {
              // Add both (shouldn't happen, but safe fallback)
              return [...prev, mappedStudentMessage, mappedStakeholderResponse];
            }
          });
          
          setChatHistory(prev => ({
            ...prev,
            [selectedStakeholderId]: [
              ...(prev[selectedStakeholderId] || []), 
              mappedStudentMessage, 
              mappedStakeholderResponse
            ],
          }));
        }
      } else {
        // If API fails, still keep the optimistic update
        setChatHistory(prev => ({
          ...prev,
          [selectedStakeholderId]: [...(prev[selectedStakeholderId] || []), studentMessage],
        }));
        toast({
          title: "Warning",
          description: "Message sent but AI response unavailable",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsChatbotThinking(false); // Hide loading indicator
      isSendingMessageRef.current = false; // Reset flag to allow new messages
    }
  };

  const endChatSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.chatMessages.endSession(sessionId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update session in state
          setChatSessions(prev => {
            const stakeholderSessions = prev[selectedStakeholderId || ''] || [];
            const updatedSessions = stakeholderSessions.map(session =>
              session.id === sessionId
                ? { ...session, endTime: result.data?.endTime || new Date().toISOString() }
                : session
            );
            return {
              ...prev,
              [selectedStakeholderId || '']: updatedSessions,
            };
          });
          
          // Don't clear active session - allow users to continue viewing and adding to ended sessions
          // The session is marked as ended but can still be viewed and continued
          
          toast({
            title: "Success",
            description: "Chat session ended",
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to end session' }));
        throw new Error(errorData.message || 'Failed to end session');
      }
    } catch (error) {
      console.error('Error ending chat session:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to end session",
        variant: "destructive",
      });
    }
  }, [selectedStakeholderId, activeSessionId, toast]);

  const startNewChat = useCallback(() => {
    setActiveSessionId(null);
    setChatMessages([]);
  }, []);

  const selectChatSession = useCallback(async (sessionId: string) => {
    setActiveSessionId(sessionId);
    await fetchChatMessages(sessionId);
  }, [fetchChatMessages]);

  const updateSessionTitle = useCallback(async (sessionId: string, newTitle: string) => {
    // Note: This assumes the backend has an endpoint to update session title
    // If not available, you may need to add it to the backend
    // For now, we'll update it locally
    setChatSessions(prev => {
      const stakeholderSessions = prev[selectedStakeholderId || ''] || [];
      const updatedSessions = stakeholderSessions.map(session =>
        session.id === sessionId
          ? { ...session, title: newTitle }
          : session
      );
      return {
        ...prev,
        [selectedStakeholderId || '']: updatedSessions,
      };
    });
  }, [selectedStakeholderId]);

  // Close active session on logout (if not already closed)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeSessionId && selectedStakeholderId) {
        // Close session when page unloads (logout or close tab)
        endChatSession(activeSessionId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeSessionId, selectedStakeholderId, endChatSession]);

  const getTaskStatus = (task: Task): 'active' | 'done' => {
    const submission = submissions.find(s => s.taskId === task.id);
    return submission ? 'done' : 'active';
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const selectedStakeholder = stakeholders.find(s => s.id === selectedStakeholderId);
  const taskSubmissions = selectedTaskId 
    ? submissions.filter(s => s.taskId === selectedTaskId)
    : [];

  // Render sections based on activeSection
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate("/ai-students")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("nav.back")}
      </Button>
      {activeSection === "course-info" && (
        <CourseInformationSection 
          course={courses.find(c => c.id === selectedCourseId)}
          groups={groups || []}
          tasks={tasks || []}
          submissions={submissions || []}
          selectedProjectId={selectedProjectId}
          selectedCourseId={selectedCourseId}
          onRefreshGroups={() => fetchGroups(selectedCourseId)}
          onRefreshTasks={fetchTasks}
          onRefreshSubmissions={fetchSubmissions}
        />
      )}

      {activeSection === "project" && (
        <ProjectSection
          project={selectedProject}
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          onTaskSelect={(taskId) => {
            setSelectedTaskId(taskId);
            setActiveSection("task");
          }}
          getTaskStatus={getTaskStatus}
          tasksWithNewFeedback={tasksWithNewFeedback}
          onTaskViewed={(taskId) => {
            // Mark feedback as seen for this task
            const submission = submissions.find(s => s.taskId === taskId && 
              ((s.feedbackHistory && s.feedbackHistory.length > 0) || s.feedback)
            );
            if (submission) {
              setLastSeenFeedback(prev => ({
                ...prev,
                [taskId]: submission.datetime,
              }));
              setTasksWithNewFeedback(prev => {
                const newSet = new Set(prev);
                newSet.delete(taskId);
                return newSet;
              });
            }
          }}
          onRefreshTasks={fetchTasks}
          onRefreshSubmissions={fetchSubmissions}
        />
      )}

      {activeSection === "task" && (
        <TaskSection
          task={selectedTask}
          submission={taskSubmission}
          onSubmissionChange={setTaskSubmission}
          submissionFile={submissionFile}
          onFileChange={setSubmissionFile}
          onSubmit={handleSubmitTask}
          submissions={taskSubmissions}
          showReflectionDialog={showReflectionDialog}
          reflectionText={reflectionText}
          onReflectionChange={setReflectionText}
          reflectionTimer={reflectionTimer}
          onReflectionSubmit={submitTask}
          onCloseReflectionDialog={() => {
            // Clear timer interval when closing dialog
            if (reflectionTimerIntervalRef.current) {
              clearInterval(reflectionTimerIntervalRef.current);
              reflectionTimerIntervalRef.current = null;
            }
            setShowReflectionDialog(false);
            setReflectionText("");
            setReflectionTimer(300);
          }}
          showFeedbackAgreement={showFeedbackAgreement}
          feedbackAgreement={feedbackAgreement}
          onFeedbackAgreementChange={setFeedbackAgreement}
          feedbackComment={feedbackComment}
          onFeedbackCommentChange={setFeedbackComment}
          feedbackTimer={feedbackTimer}
          onFeedbackRead={handleFeedbackRead}
          onCloseFeedbackAgreement={() => {
            setShowFeedbackAgreement(false);
            setFeedbackAgreement(null);
            setFeedbackComment("");
            setFeedbackTimer(300);
          }}
          onFeedbackSubmit={handleFeedbackSubmit}
          groups={groups}
          selectedCourseId={selectedCourseId}
          onRefreshSubmissions={fetchSubmissions}
        />
      )}

      {activeSection === "notification" && (
        <NotificationSection
          notifications={notifications}
          tasks={tasks}
          onNotificationClick={markNotificationAsRead}
          onToggleImportant={toggleNotificationImportant}
        />
      )}

      {activeSection === "stakeholder" && (
        <StakeholderSection
          stakeholders={stakeholders}
          selectedStakeholderId={selectedStakeholderId}
          onStakeholderSelect={setSelectedStakeholderId}
          selectedStakeholder={selectedStakeholder}
          chatMessages={chatMessages}
          chatInput={chatInput}
          onChatInputChange={setChatInput}
          onSendMessage={handleSendChatMessage}
          chatHistory={chatHistory}
          chatSessions={chatSessions}
          activeSessionId={activeSessionId}
          onStartNewChat={startNewChat}
          onSelectSession={selectChatSession}
          onEndSession={endChatSession}
          onUpdateSessionTitle={updateSessionTitle}
          isChatbotThinking={isChatbotThinking}
        />
      )}

      {activeSection === "progress" && (
        <ProgressTrackingSection
          stats={progressStats}
          tasks={tasks}
          groups={groups}
          submissions={submissions}
          selectedCourseId={selectedCourseId}
          selectedProjectId={selectedProjectId}
          quizScore={quizScore}
          groupMetrics={groupMetrics}
        />
      )}

      {activeSection === "quiz" && (
        <QuizSection
          quizzes={quizzes}
          selectedQuizId={selectedQuizId}
          onQuizSelect={setSelectedQuizId}
          currentQuestionIndex={currentQuestionIndex}
          onQuestionIndexChange={setCurrentQuestionIndex}
          quizAnswers={quizAnswers}
          onAnswerChange={(questionId, answer) => {
            // Don't allow changing locked answers
            if (quizLockedAnswers[questionId]) {
              toast({
                title: "Answer Locked",
                description: "This question has been submitted and cannot be changed.",
                variant: "default",
              });
              return;
            }
            const newAnswers = { ...quizAnswers, [questionId]: answer };
            setQuizAnswers(newAnswers);
            // Recalculate score if quiz is submitted (but don't auto-save)
            if (selectedQuizId && quizIsSubmitted) {
              const quiz = quizzes.find(q => q.id === selectedQuizId);
              if (quiz) {
                const newScore = calculateScore(quiz, newAnswers);
                setQuizScore(newScore);
              }
            }
          }}
          quizComments={quizComments}
          onCommentChange={(questionId, comment) => {
            const newComments = { ...quizComments, [questionId]: comment };
            setQuizComments(newComments);
            // No auto-save - user must click Save button
          }}
          quizLockedAnswers={quizLockedAnswers}
          quizIsSubmitted={quizIsSubmitted}
          quizScore={quizScore}
          onQuizSubmit={handleQuizSubmit}
          leaderboard={quizLeaderboard}
          onSaveState={async () => {
            if (selectedQuizId) {
              await saveQuizState(selectedQuizId, currentQuestionIndex, quizAnswers, quizComments, quizLockedAnswers, quizIsSubmitted, quizScore);
            }
          }}
          onRefreshLeaderboard={fetchQuizLeaderboard}
        />
      )}
    </div>
  );
}

// Section Components
function CourseInformationSection({ 
  course, 
  groups, 
  tasks, 
  submissions, 
  selectedProjectId,
  selectedCourseId,
  onRefreshGroups,
  onRefreshTasks,
  onRefreshSubmissions,
}: { 
  course?: Course;
  groups: StudentGroup[];
  tasks: Task[];
  submissions: Submission[];
  selectedProjectId: string | null;
  selectedCourseId: string;
  onRefreshGroups: () => void;
  onRefreshTasks: () => void;
  onRefreshSubmissions: (options?: { 
    includeGroupMembers?: boolean; 
    groupIds?: string[];
    projectId?: string | null;
  }) => void;
}) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [groupTaskStatus, setGroupTaskStatus] = useState<{ [groupId: string]: { [studentId: string]: { completedTasks: string[], taskCount: number } } }>({});
  const [loadingTaskStatus, setLoadingTaskStatus] = useState<{ [groupId: string]: boolean }>({});
  const [groupTaskStatusErrors, setGroupTaskStatusErrors] = useState<{ [groupId: string]: string }>({});
  const { toast } = useToast();

  // Get current user's username
  const currentUserName = localStorage.getItem('ai4edu_user') || '';

  // Filter groups by course, project, active status, and user membership
  const filteredGroups = (groups || []).filter(g => {
    if (!course) return false;
    const courseMatch = String(g.courseId) === String(course.id);
    const projectMatch = !selectedProjectId || !g.projectId || String(g.projectId) === String(selectedProjectId);
    const isActive = g.isActive;
    
    // Check if current user is a member of this group
    const isUserMember = currentUserName && (
      g.studentIds.includes(currentUserName) ||
      g.studentNames?.some((name, idx) => 
        name === currentUserName || g.studentIds[idx] === currentUserName
      )
    );
    
    if (!courseMatch) {
      console.log('[CourseInformationSection] Course mismatch:', {
        groupCourseId: g.courseId,
        courseId: course.id,
        groupName: g.name
      });
    }
    if (!projectMatch && selectedProjectId) {
      console.log('[CourseInformationSection] Project mismatch:', {
        groupProjectId: g.projectId,
        selectedProjectId,
        groupName: g.name
      });
    }
    if (!isActive) {
      console.log('[CourseInformationSection] Group not active:', {
        groupName: g.name,
        isActive: g.isActive
      });
    }
    if (!isUserMember) {
      console.log('[CourseInformationSection] User not a member:', {
        groupName: g.name,
        currentUserName,
        groupStudentIds: g.studentIds
      });
    }
    
    return courseMatch && projectMatch && isActive && isUserMember;
  });

  // Fetch task status for groups
  const fetchGroupTaskStatus = useCallback(async (groupId: string) => {
    if (!selectedProjectId) return;
    
    setLoadingTaskStatus(prev => ({ ...prev, [groupId]: true }));
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      const response = await fetch(
        `${API_ENDPOINTS.assessmentSubmissions.getGroupTaskStatus(groupId)}?projectId=${encodeURIComponent(selectedProjectId)}&userName=${encodeURIComponent(userName)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setGroupTaskStatus(prev => ({
            ...prev,
            [groupId]: result.data
          }));
          // Clear any previous error for this group
          setGroupTaskStatusErrors(prev => {
            const updated = { ...prev };
            delete updated[groupId];
            return updated;
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch task status' }));
        console.error('Error fetching group task status:', errorData);
        
        // Handle specific error cases
        let errorMessage = 'Failed to load task status';
        if (response.status === 403) {
          errorMessage = 'Not authorized to view task status';
          console.warn(`Not authorized to view task status for group ${groupId}`);
        } else if (response.status === 404) {
          errorMessage = 'Group not found';
          console.warn(`Group ${groupId} not found`);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        setGroupTaskStatusErrors(prev => ({ ...prev, [groupId]: errorMessage }));
        
        // Fallback: clear status for this group
        setGroupTaskStatus(prev => {
          const updated = { ...prev };
          delete updated[groupId];
          return updated;
        });
      }
    } catch (error) {
      console.error('Error fetching group task status:', error);
      setGroupTaskStatusErrors(prev => ({ 
        ...prev, 
        [groupId]: error instanceof Error ? error.message : 'Failed to load task status' 
      }));
      setGroupTaskStatus(prev => {
        const updated = { ...prev };
        delete updated[groupId];
        return updated;
      });
    } finally {
      setLoadingTaskStatus(prev => ({ ...prev, [groupId]: false }));
    }
  }, [selectedProjectId]);

  // Fetch task status for all filtered groups when they change
  useEffect(() => {
    if (!course || !selectedProjectId) return;
    filteredGroups.forEach(group => {
      // Only fetch if we don't already have status for this group and it's not currently loading
      if (!groupTaskStatus[group.id] && !loadingTaskStatus[group.id]) {
        fetchGroupTaskStatus(group.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, selectedProjectId, filteredGroups, fetchGroupTaskStatus]);
  // Note: Removed loadingTaskStatus and groupTaskStatus from deps to prevent infinite loops

  // Debug logging - MUST be before early return (Rules of Hooks)
  useEffect(() => {
    if (!course) return;
    console.log('[CourseInformationSection] Groups Debug:', {
      courseId: course.id,
      selectedProjectId,
      totalGroups: (groups || []).length,
      filteredGroups: filteredGroups.length,
      allGroups: (groups || []).map(g => ({
        id: g.id,
        name: g.name,
        courseId: g.courseId,
        projectId: g.projectId,
        isActive: g.isActive
      }))
    });
  }, [course, course?.id, selectedProjectId, groups, filteredGroups]);

  // Early return AFTER all hooks
  if (!course) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>No course selected</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Course Info</TabsTrigger>
          <TabsTrigger value="groups">Group Information</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>{course.code} - {course.name}</CardTitle>
              <CardDescription>Academic Year: {course.academicYear}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.description && (
                <div>
                  <Label className="text-lg font-semibold">Course Description</Label>
                  <p className="mt-2 text-muted-foreground">{course.description}</p>
                </div>
              )}
              {course.learningOutcome && (
                <div>
                  <Label className="text-lg font-semibold">Learning Outcomes</Label>
                  <p className="mt-2 text-muted-foreground">{course.learningOutcome}</p>
                </div>
              )}
              {course.schedules && (
                <div>
                  <Label className="text-lg font-semibold">Schedules</Label>
                  <p className="mt-2 text-muted-foreground">{course.schedules}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Group Information</CardTitle>
                  <CardDescription>View group members and their task progress</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setIsRefreshing(true);
                    try {
                      // Refresh groups and tasks
                      await Promise.all([
                        onRefreshGroups(),
                        onRefreshTasks(),
                      ]);
                      
                      // Refresh task status for all filtered groups (lightweight endpoint)
                      await Promise.all(
                        filteredGroups.map(group => fetchGroupTaskStatus(group.id))
                      );
                    } catch (error) {
                      console.error('Error refreshing group information:', error);
                      toast({
                        title: "Error",
                        description: "Failed to refresh group information. Please try again.",
                        variant: "destructive",
                      });
                    } finally {
                      // Small delay to show spinner even if very fast
                      setTimeout(() => setIsRefreshing(false), 300);
                    }
                  }}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredGroups.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {currentUserName 
                    ? `You are not a member of any active groups for this course${selectedProjectId ? " and project" : ""}.`
                    : `No active groups found for this course${selectedProjectId ? " and project" : ""}.`
                  }
                </p>
              ) : (
                <div className="space-y-6">
                  {filteredGroups.map(group => {
                    const groupStatus = groupTaskStatus[group.id] || {};
                    const isLoading = loadingTaskStatus[group.id];
                    const error = groupTaskStatusErrors[group.id];

                    return (
                      <Card key={group.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{group.name}</CardTitle>
                              {group.description && (
                                <CardDescription className="mt-1">{group.description}</CardDescription>
                              )}
                            </div>
                            <Badge variant="default">
                              {group.studentIds.length} {group.studentIds.length === 1 ? 'member' : 'members'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-semibold mb-2 block">Group Members</Label>
                              {isLoading ? (
                                <div className="flex items-center justify-center py-4">
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  <span className="text-sm text-muted-foreground">Loading task status...</span>
                                </div>
                              ) : error ? (
                                <div className="flex items-center justify-center py-4">
                                  <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
                                  <span className="text-sm text-destructive">{error}</span>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {group.studentIds.map((studentId, idx) => {
                                    const studentName = group.studentNames?.[idx] || studentId;
                                    const studentStatus = groupStatus[studentId] || { completedTasks: [], taskCount: 0 };
                                    const completedTaskIds = new Set(studentStatus.completedTasks || []);
                                    const tasksDone = (tasks || []).filter(t => completedTaskIds.has(t.id));
                                    
                                    return (
                                      <div key={studentId} className="border rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-medium">{studentName}</span>
                                          <Badge variant="secondary">
                                            {studentStatus.taskCount || tasksDone.length} {(studentStatus.taskCount || tasksDone.length) === 1 ? 'task' : 'tasks'} done
                                          </Badge>
                                        </div>
                                        {tasksDone.length > 0 ? (
                                          <div className="mt-2 space-y-1">
                                            <Label className="text-xs text-muted-foreground">Tasks Completed:</Label>
                                            <div className="flex flex-wrap gap-1">
                                              {tasksDone.map(task => {
                                                // Find the last attempt submission for this student and task (if submissions are available)
                                                const taskSubmissions = (submissions || [])
                                                  .filter(s => 
                                                    (s.studentId === studentId || s.studentName === studentId) &&
                                                    s.taskId === task.id
                                                  )
                                                  .sort((a, b) => {
                                                    // Sort by attempt number descending, then by datetime descending
                                                    if (b.attemptNumber !== a.attemptNumber) {
                                                      return b.attemptNumber - a.attemptNumber;
                                                    }
                                                    return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
                                                  });
                                                
                                                const lastSubmission = taskSubmissions[0] || null;
                                                
                                                return (
                                                  <Badge 
                                                    key={task.id} 
                                                    variant="outline" 
                                                    className={`text-xs ${lastSubmission ? 'cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors' : ''}`}
                                                    onClick={() => {
                                                      if (lastSubmission) {
                                                        setSelectedSubmission(lastSubmission);
                                                        setSubmissionDialogOpen(true);
                                                      }
                                                    }}
                                                  >
                                                    {task.taskTitle || task.keyword || 'Untitled Task'}
                                                  </Badge>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-xs text-muted-foreground mt-2">No tasks completed yet</p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submission Detail Dialog */}
      <Dialog open={submissionDialogOpen} onOpenChange={setSubmissionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              {selectedSubmission && (
                <>
                  Task: {tasks.find(t => t.id === selectedSubmission.taskId)?.taskTitle || tasks.find(t => t.id === selectedSubmission.taskId)?.keyword || 'Unknown Task'} | 
                  Student: {selectedSubmission.studentName} | 
                  Attempt: {selectedSubmission.attemptNumber}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Date & Time</Label>
                <p className="text-sm mt-1">{formatDateTime(selectedSubmission.datetime)}</p>
              </div>
              
              <div>
                <Label className="text-sm font-semibold">Submission</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedSubmission.submission}</p>
                </div>
              </div>

              {/* Submission Question Answers */}
              {selectedSubmission.submissionQuestionAnswers && selectedSubmission.submissionQuestionAnswers.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold">Submission Questions</Label>
                  <div className="mt-1 space-y-2">
                    {selectedSubmission.submissionQuestionAnswers.map((answer, idx) => (
                      <div key={idx} className="p-3 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">
                          {formatDateTime(answer.datetime)}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{answer.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy reflection field */}
              {selectedSubmission.reflection && (!selectedSubmission.submissionQuestionAnswers || selectedSubmission.submissionQuestionAnswers.length === 0) && (
                <div>
                  <Label className="text-sm font-semibold">Reflection</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{selectedSubmission.reflection}</p>
                  </div>
                </div>
              )}

              {/* Score */}
              {(() => {
                const latestScore = selectedSubmission.starScoreHistory && selectedSubmission.starScoreHistory.length > 0
                  ? selectedSubmission.starScoreHistory[selectedSubmission.starScoreHistory.length - 1].score
                  : selectedSubmission.starScore;
                return latestScore !== undefined && latestScore !== null ? (
                  <div>
                    <Label className="text-sm font-semibold">Score</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{latestScore}/5</span>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Feedback */}
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

              {/* Feedback Received Question Answers */}
              {selectedSubmission.feedbackReceivedQuestionAnswers && selectedSubmission.feedbackReceivedQuestionAnswers.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold">Feedback Questions</Label>
                  <div className="mt-1 space-y-2">
                    {selectedSubmission.feedbackReceivedQuestionAnswers.map((answer, idx) => (
                      <div key={idx} className="p-3 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">
                          {formatDateTime(answer.datetime)}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Agreement: </span>
                          {answer.agreement ? "Yes" : "No"}
                        </p>
                        {answer.comment && (
                          <p className="text-sm mt-1 whitespace-pre-wrap">
                            <span className="font-medium">Comment: </span>
                            {answer.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy feedback agreement/comment */}
              {(selectedSubmission.feedbackAgreement !== undefined || selectedSubmission.feedbackComment) && 
               (!selectedSubmission.feedbackReceivedQuestionAnswers || selectedSubmission.feedbackReceivedQuestionAnswers.length === 0) && (
                <div>
                  <Label className="text-sm font-semibold">Feedback Response</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    {selectedSubmission.feedbackAgreement !== undefined && (
                      <p className="text-sm">
                        <span className="font-medium">Agreement: </span>
                        {selectedSubmission.feedbackAgreement ? "Yes" : "No"}
                      </p>
                    )}
                    {selectedSubmission.feedbackComment && (
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        <span className="font-medium">Comment: </span>
                        {selectedSubmission.feedbackComment}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSubmissionDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectSection({
  project,
  tasks,
  selectedTaskId,
  onTaskSelect,
  getTaskStatus,
  tasksWithNewFeedback,
  onTaskViewed,
  onRefreshTasks,
  onRefreshSubmissions,
}: {
  project?: Project;
  tasks: Task[];
  selectedTaskId: string | null;
  onTaskSelect: (id: string) => void;
  getTaskStatus: (task: Task) => 'active' | 'done';
  tasksWithNewFeedback: Set<string>;
  onTaskViewed: (taskId: string) => void;
  onRefreshTasks?: () => void;
  onRefreshSubmissions?: () => void;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    if (!onRefreshTasks) return;
    setIsRefreshing(true);
    try {
      await onRefreshTasks(); // Fetch tasks
      // Also fetch submissions to update task statuses
      if (onRefreshSubmissions) {
        await onRefreshSubmissions();
      }
    } finally {
      // Small delay to show spinner even if very fast
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };
  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project</CardTitle>
          <CardDescription>No project available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Description - Full Width Top Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Project Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Course Description</Label>
              <p className="mt-2 text-muted-foreground">{project.courseDescription}</p>
            </div>
            <div>
              <Label className="font-semibold">Learning Outcome</Label>
              <p className="mt-2 text-muted-foreground">{project.learningOutcome}</p>
            </div>
            <div>
              <Label className="font-semibold">Key Milestones</Label>
              <p className="mt-2 text-muted-foreground">{project.keyMilestones}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Published tasks for this project</CardDescription>
            </div>
            {onRefreshTasks && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {tasks.map((task) => {
              const status = getTaskStatus(task);
              const isOverdue = new Date(task.submissionDeadline) < new Date() && status === 'active';
              const isSelected = selectedTaskId === task.id;
              
              return (
                <Card
                  key={task.id}
                  className={`cursor-pointer transition-all duration-300 transform ${
                    isSelected
                      ? 'ring-2 ring-primary ring-offset-2 scale-105 shadow-lg'
                      : 'hover:scale-105 hover:shadow-md'
                  } ${
                    status === 'done' 
                      ? isSelected
                        ? 'bg-green-100 border-green-300'
                        : 'bg-green-50 border-green-200 hover:bg-green-100'
                      : isOverdue
                      ? isSelected
                        ? 'bg-red-100 border-red-300'
                        : 'bg-red-50 border-red-200 hover:bg-red-100'
                      : isSelected
                        ? 'bg-blue-100 border-blue-300'
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  }`}
                  onClick={() => {
                    onTaskSelect(task.id);
                    // Mark task as viewed when selected
                    if (tasksWithNewFeedback.has(task.id)) {
                      onTaskViewed(task.id);
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{task.taskTitle || 'Untitled Task'}</CardTitle>
                      <div className="flex items-center gap-2">
                        {tasksWithNewFeedback.has(task.id) && (
                          <div className="relative" title="New feedback available">
                            <Bell className="h-5 w-5 text-yellow-600 animate-pulse" />
                            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                          </div>
                        )}
                      {status === 'done' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-600" />
                      )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>Deadline: {new Date(task.submissionDeadline).toLocaleDateString()}</span>
                      </div>
                      <Badge variant={status === 'done' ? 'default' : 'secondary'}>
                        {status === 'done' ? 'Done' : isOverdue ? 'Overdue' : 'Active'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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

function TaskSection({
  task,
  submission,
  onSubmissionChange,
  submissionFile,
  onFileChange,
  onSubmit,
  submissions,
  showReflectionDialog,
  reflectionText,
  onReflectionChange,
  reflectionTimer,
  onReflectionSubmit,
  onCloseReflectionDialog,
  showFeedbackAgreement,
  feedbackAgreement,
  onFeedbackAgreementChange,
  feedbackComment,
  onFeedbackCommentChange,
  feedbackTimer,
  onFeedbackRead,
  onCloseFeedbackAgreement,
  onFeedbackSubmit,
  groups,
  selectedCourseId,
  onRefreshSubmissions,
}: {
  task?: Task;
  submission: string;
  onSubmissionChange: (value: string) => void;
  submissionFile: File | null;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
  submissions: Submission[];
  showReflectionDialog: boolean;
  reflectionText: string;
  onReflectionChange: (value: string) => void;
  reflectionTimer: number;
  onReflectionSubmit: () => void;
  onCloseReflectionDialog: () => void;
  showFeedbackAgreement: boolean;
  feedbackAgreement: boolean | null;
  onFeedbackAgreementChange: (value: boolean | null) => void;
  feedbackComment: string;
  onFeedbackCommentChange: (value: string) => void;
  feedbackTimer: number;
  onFeedbackRead: () => void;
  onCloseFeedbackAgreement: () => void;
  onFeedbackSubmit: () => void;
  groups?: StudentGroup[];
  selectedCourseId?: string;
  onRefreshSubmissions?: () => void;
}) {
  const { toast } = useToast();

  if (!task) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task</CardTitle>
          <CardDescription>No task selected</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Find the submission with the most recent feedback (could be a new attempt or updated feedback on existing submission)
  const getLatestFeedbackSubmission = () => {
    if (submissions.length === 0) return null;
    
    // Find all submissions with feedback
    const submissionsWithFeedback = submissions.filter(sub => {
      const hasFeedback = (sub.feedbackHistory && sub.feedbackHistory.length > 0) || sub.feedback;
      return hasFeedback;
    });
    
    if (submissionsWithFeedback.length === 0) return null;
    
    // Find the one with the most recent feedback datetime
    let latestSubmission = submissionsWithFeedback[0];
    let latestFeedbackTime = new Date(0);
    
    for (const sub of submissionsWithFeedback) {
      let feedbackTime: Date;
      
      if (sub.feedbackHistory && sub.feedbackHistory.length > 0) {
        // Get the latest feedback entry from history
        const latestFeedbackEntry = sub.feedbackHistory[sub.feedbackHistory.length - 1];
        feedbackTime = new Date(latestFeedbackEntry.datetime);
      } else if (sub.feedback) {
        // Use submission datetime as fallback for legacy feedback
        feedbackTime = new Date(sub.datetime);
      } else {
        continue;
      }
      
      if (feedbackTime > latestFeedbackTime) {
        latestFeedbackTime = feedbackTime;
        latestSubmission = sub;
      }
    }
    
    return latestSubmission;
  };
  
  const latestSubmission = getLatestFeedbackSubmission();
  // Check for feedback in new format (feedbackHistory) or legacy format (feedback)
  const hasFeedback = latestSubmission?.feedbackHistory && latestSubmission.feedbackHistory.length > 0 
    ? latestSubmission.feedbackHistory[latestSubmission.feedbackHistory.length - 1].feedback
    : latestSubmission?.feedback;

  return (
    <div className="space-y-6">
      {/* Task Description */}
      <Card>
        <CardHeader>
          <CardTitle>{task.taskTitle || 'Task'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="font-semibold">Description</Label>
            <p className="mt-2 text-muted-foreground">{task.description}</p>
          </div>
          {task.outcome && (
            <div>
              <Label className="font-semibold">Outcome</Label>
              <p className="mt-2 text-muted-foreground">{task.outcome}</p>
            </div>
          )}
          <div>
            <Label className="font-semibold">Evaluation Criteria</Label>
            <p className="mt-2 text-muted-foreground">{task.evaluationCriteria}</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Deadline: {new Date(task.submissionDeadline).toLocaleString()}</span>
          </div>
          {task.attachments && task.attachments.length > 0 && (
            <div>
              <Label className="font-semibold">Attached Files</Label>
              <div className="mt-2 space-y-2">
                {task.attachments.map((attachment, index) => {
                  const filename = decodeURIComponent(attachment.split('/').pop() || `Attachment ${index + 1}`);
                  return (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate flex-1">{filename}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(attachment, filename)}
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Area */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Your Submission</Label>
            <Textarea
              value={submission}
              onChange={(e) => onSubmissionChange(e.target.value)}
              placeholder="Enter your submission here..."
              rows={10}
            />
          </div>
          <div>
            <Label>Upload File (Optional)</Label>
            <Input
              type="file"
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Prefer .txt, .pdf files, but other files are also accepted.
            </p>
          </div>
          <Button onClick={onSubmit} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Submit
          </Button>
        </CardContent>
      </Card>

      {/* Reflection Dialog */}
      <Dialog open={showReflectionDialog} onOpenChange={(open) => {
        if (!open) {
          onCloseReflectionDialog();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reflection Question</DialogTitle>
            <DialogDescription>
              {task.submissionQuestion || "What makes you think you are writing a good answer?"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Time remaining: {formatTime(reflectionTimer)}</span>
            </div>
            <Textarea
              value={reflectionText}
              onChange={(e) => onReflectionChange(e.target.value)}
              placeholder="Enter your reflection..."
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button 
              onClick={onReflectionSubmit} 
              disabled={!reflectionText.trim() || reflectionTimer === 0}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Area */}
      {hasFeedback && latestSubmission && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">
                {latestSubmission.feedbackHistory && latestSubmission.feedbackHistory.length > 0
                  ? latestSubmission.feedbackHistory[latestSubmission.feedbackHistory.length - 1].feedback
                  : latestSubmission.feedback}
              </p>
            </div>
            {(latestSubmission.starScoreHistory && latestSubmission.starScoreHistory.length > 0
              ? latestSubmission.starScoreHistory[latestSubmission.starScoreHistory.length - 1].score
              : latestSubmission.starScore) && (
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Score: {
                  latestSubmission.starScoreHistory && latestSubmission.starScoreHistory.length > 0
                    ? latestSubmission.starScoreHistory[latestSubmission.starScoreHistory.length - 1].score
                    : latestSubmission.starScore
                }/5</span>
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={async () => {
                  // Share to group functionality
                  const currentUserName = localStorage.getItem('ai4edu_user') || '';
                  if (!currentUserName || !latestSubmission) {
                    toast({
                      title: "Error",
                      description: "Unable to share: missing user information or submission",
                      variant: "destructive",
                    });
                    return;
                  }

                  // Get current user's groups for the selected course
                  const userGroups = groups.filter(g => 
                    g.courseId === selectedCourseId && 
                    g.isActive && 
                    g.studentIds.includes(currentUserName)
                  );

                  if (userGroups.length === 0) {
                    toast({
                      title: "No Group Found",
                      description: "You are not a member of any active group for this course.",
                      variant: "default",
                    });
                    return;
                  }

                  // Get all other members from user's groups (excluding current user)
                  const otherMembers = new Set<string>();
                  userGroups.forEach(group => {
                    group.studentIds.forEach(id => {
                      if (id !== currentUserName) {
                        otherMembers.add(id);
                      }
                    });
                  });

                  if (otherMembers.size === 0) {
                    toast({
                      title: "No Other Members",
                      description: "There are no other members in your group(s).",
                      variant: "default",
                    });
                    return;
                  }

                  // Use the new share endpoint - backend will handle all the logic
                  try {
                    const response = await fetch(API_ENDPOINTS.assessmentSubmissions.share(latestSubmission.id), {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({
                        autoDetectGroupMembers: true,
                        shareFeedback: true,
                        shareScore: true,
                      }),
                    });

                    const result = await response.json();

                    if (!response.ok) {
                      // Handle specific error cases from backend
                      const errorMessage = result.message || result.error || 'Failed to share submission';
                      
                      if (result.error === 'SUBMISSION_NOT_FOUND') {
                        toast({
                          title: "Submission Not Found",
                          description: "The submission could not be found. Please refresh and try again.",
                          variant: "destructive",
                        });
                      } else if (result.error === 'NO_TARGET_STUDENTS') {
                        toast({
                          title: "No Group Members",
                          description: "No other members found in your group(s) to share with.",
                          variant: "default",
                        });
                      } else if (result.error === 'UNAUTHORIZED') {
                        toast({
                          title: "Not Authorized",
                          description: "You can only share your own submissions.",
                          variant: "destructive",
                        });
                      } else if (result.error === 'STUDENTS_NOT_IN_GROUP') {
                        toast({
                          title: "Invalid Students",
                          description: result.message || "Some students are not in the same group as you.",
                          variant: "destructive",
                        });
                      } else {
                        toast({
                          title: "Share Failed",
                          description: errorMessage,
                          variant: "destructive",
                        });
                      }
                      return;
                    }

                    if (result.success) {
                      const { totalShared, totalSkipped, totalFailed, sharedWith, skipped, failed } = result.data || {};
                      let description = '';
                      let title = '';
                      
                      if (totalShared > 0) {
                        title = "Shared Successfully";
                        description = `Submission and feedback shared with ${totalShared} group member(s)`;
                        
                        if (totalSkipped > 0) {
                          description += `. ${totalSkipped} member(s) already had it`;
                        }
                        
                        if (totalFailed > 0) {
                          description += `. ${totalFailed} member(s) failed to receive`;
                          // Optionally show which students failed
                          if (failed && failed.length > 0) {
                            const failedNames = failed.map((f: any) => f.studentName || f.studentId).join(', ');
                            description += `: ${failedNames}`;
                          }
                        }
                      } else if (totalSkipped > 0 && totalSkipped === (totalSkipped + totalShared + totalFailed)) {
                        title = "Already Shared";
                        description = "All group members already have this submission and the latest feedback.";
                      } else if (totalFailed > 0 && totalShared === 0) {
                        title = "Share Failed";
                        description = `Failed to share with ${totalFailed} group member(s).`;
                        if (failed && failed.length > 0) {
                          const failedNames = failed.map((f: any) => f.studentName || f.studentId).join(', ');
                          description += `: ${failedNames}`;
                        }
                      } else {
                        title = "No Members";
                        description = "No members to share with.";
                      }

                      toast({
                        title: title,
                        description: description,
                        variant: totalShared > 0 ? "default" : totalFailed > 0 ? "destructive" : "default",
                      });

                      // Refresh submissions to show the shared ones
                      if (onRefreshSubmissions && totalShared > 0) {
                        onRefreshSubmissions();
                      }
                    } else {
                      toast({
                        title: "Share Failed",
                        description: result.message || "Failed to share submission with group members.",
                        variant: "destructive",
                      });
                    }
                  } catch (error) {
                    console.error('Error sharing submission:', error);
                    toast({
                      title: "Error",
                      description: error instanceof Error ? error.message : "Failed to share submission. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Share to group
              </Button>
              <Button onClick={onFeedbackRead}>
                Your feedback ?
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Agreement Dialog */}
      <Dialog open={showFeedbackAgreement} onOpenChange={(open) => {
        if (!open) {
          onCloseFeedbackAgreement();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Feedback Agreement</DialogTitle>
            <DialogDescription>
              {task.feedbackReceivedQuestion || "Do you agree with the feedback?"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Time remaining: {formatTime(feedbackTimer)}</span>
            </div>
            <div className="flex gap-4">
              <Button
                variant={feedbackAgreement === true ? "default" : "outline"}
                onClick={() => onFeedbackAgreementChange(true)}
              >
                Yes
              </Button>
              <Button
                variant={feedbackAgreement === false ? "default" : "outline"}
                onClick={() => onFeedbackAgreementChange(false)}
              >
                No
              </Button>
            </div>
            {feedbackAgreement === false && (
              <div>
                <Label>Comment</Label>
                <Textarea
                  value={feedbackComment}
                  onChange={(e) => onFeedbackCommentChange(e.target.value)}
                  placeholder="Enter your comment..."
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                // Save feedback agreement
                onFeedbackSubmit();
              }}
              disabled={feedbackAgreement === null || (feedbackAgreement === false && !feedbackComment.trim()) || feedbackTimer === 0}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Master View - Submissions History */}
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissions.map((sub) => (
              <Card key={sub.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Attempt {sub.attemptNumber}</CardTitle>
                      <CardDescription>
                        {formatDateTime(sub.datetime)}
                      </CardDescription>
                    </div>
                    {(sub.starScoreHistory && sub.starScoreHistory.length > 0 
                      ? sub.starScoreHistory[sub.starScoreHistory.length - 1].score 
                      : sub.starScore) && (
                      <Badge>
                        <Star className="h-3 w-3 mr-1" />
                        {(sub.starScoreHistory && sub.starScoreHistory.length > 0 
                          ? sub.starScoreHistory[sub.starScoreHistory.length - 1].score 
                          : sub.starScore)}/5
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-xs">Submission</Label>
                    <p className="text-sm">{sub.submission}</p>
                  </div>
                  {sub.attachments && sub.attachments.length > 0 && (
                    <div>
                      <Label className="text-xs font-semibold">Attached Files</Label>
                      <div className="mt-1 space-y-1">
                        {sub.attachments.map((attachment, index) => {
                          const filename = decodeURIComponent(attachment.split('/').pop() || `Attachment ${index + 1}`);
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <File className="h-3 w-3 text-muted-foreground" />
                              <button
                                type="button"
                                className="text-xs text-primary hover:underline truncate"
                                onClick={() => downloadFile(attachment, filename)}
                                title={filename}
                              >
                                {filename}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Submission Question Answers - New format */}
                  {task?.submissionQuestion && sub.submissionQuestionAnswers && sub.submissionQuestionAnswers.length > 0 && (
                    <div>
                      <Label className="text-xs font-semibold">Submission Question</Label>
                      <p className="text-sm text-muted-foreground mb-1">{task.submissionQuestion}</p>
                      {sub.submissionQuestionAnswers.map((answer, idx) => (
                        <div key={idx} className="mb-2">
                          <Label className="text-xs font-semibold">Your Answer {sub.submissionQuestionAnswers.length > 1 ? `#${idx + 1}` : ''}</Label>
                          <p className="text-sm">{answer.answer}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(answer.datetime)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Legacy reflection field (backward compatibility) */}
                  {task?.submissionQuestion && !sub.submissionQuestionAnswers && sub.reflection && (
                    <div>
                      <Label className="text-xs font-semibold">Submission Question</Label>
                      <p className="text-sm text-muted-foreground mb-1">{task.submissionQuestion}</p>
                      <Label className="text-xs font-semibold">Your Answer</Label>
                      <p className="text-sm">{sub.reflection}</p>
                    </div>
                  )}
                  
                  {/* Feedback History - New format */}
                  {sub.feedbackHistory && sub.feedbackHistory.length > 0 && (
                    <div>
                      <Label className="text-xs font-semibold">Feedback History</Label>
                      {sub.feedbackHistory.map((entry, idx) => (
                        <div key={idx} className="mb-2 p-2 bg-muted rounded">
                          <p className="text-sm">{entry.feedback}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(entry.datetime)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Legacy feedback field (backward compatibility) */}
                  {!sub.feedbackHistory && sub.feedback && (
                    <div>
                      <Label className="text-xs font-semibold">Feedback</Label>
                      <p className="text-sm">{sub.feedback}</p>
                    </div>
                  )}
                  
                  {/* Feedback Received Question Answers - New format */}
                  {task?.feedbackReceivedQuestion && sub.feedbackReceivedQuestionAnswers && sub.feedbackReceivedQuestionAnswers.length > 0 && (
                    <div>
                      <Label className="text-xs font-semibold">Feedback Question</Label>
                      <p className="text-sm text-muted-foreground mb-1">{task.feedbackReceivedQuestion}</p>
                      {sub.feedbackReceivedQuestionAnswers.map((answer, idx) => (
                        <div key={idx} className="mb-2">
                          <Label className="text-xs font-semibold">Your Answer {sub.feedbackReceivedQuestionAnswers.length > 1 ? `#${idx + 1}` : ''}</Label>
                          <p className="text-sm">
                            <span className="mr-2">{answer.agreement ? "Yes" : "No"}</span>
                            {answer.comment && <span>{answer.comment}</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(answer.datetime)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Legacy feedback agreement fields (backward compatibility) */}
                  {task?.feedbackReceivedQuestion && !sub.feedbackReceivedQuestionAnswers && (sub.feedbackAgreement !== undefined || sub.feedbackComment) && (
                    <div>
                      <Label className="text-xs font-semibold">Feedback Question</Label>
                      <p className="text-sm text-muted-foreground mb-1">{task.feedbackReceivedQuestion}</p>
                      <Label className="text-xs font-semibold">Your Answer</Label>
                      <p className="text-sm">
                        {sub.feedbackAgreement !== undefined && (
                          <span className="mr-2">
                            {sub.feedbackAgreement ? "Yes" : "No"}
                          </span>
                        )}
                        {sub.feedbackComment && (
                          <span>{sub.feedbackComment}</span>
                        )}
                      </p>
                    </div>
                  )}
                  
                  {/* Star Score History - Only show quality score (latest entry) */}
                  {sub.starScoreHistory && sub.starScoreHistory.length > 0 && (
                    <div>
                      <Label className="text-xs font-semibold">Score History</Label>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          // Only show the latest (last) entry which is the quality score
                          const latestEntry = sub.starScoreHistory[sub.starScoreHistory.length - 1];
                          return (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              {latestEntry.score}/5 - {formatDateTime(latestEntry.datetime)}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {sub.conversationLog && (
                    <div>
                      <Label className="text-xs">Conversation Log</Label>
                      <p className="text-sm">{sub.conversationLog}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSection({
  notifications,
  tasks,
  onNotificationClick,
  onToggleImportant,
}: {
  notifications: Notification[];
  tasks: Task[];
  onNotificationClick: (id: string) => void;
  onToggleImportant: (id: string) => void;
}) {
  const typeLabel = (type?: string) => {
    if (!type) return 'Notification';
    switch (type) {
      case 'submission':
        return 'Submission';
      case 'stakeholder':
      case 'stakeholder_chat':
        return 'Stakeholder Chat';
      case 'feedback':
        return 'Feedback';
      case 'system':
        return 'System';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`cursor-pointer transition-colors ${
                  notif.read ? 'bg-muted' : 'bg-background'
                }`}
                onClick={() => onNotificationClick(notif.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {typeLabel(notif.type)}
                        </Badge>
                        {notif.type === 'submission' && (
                          <Badge variant="secondary" className="text-xs">
                            {notif.taskTitle || tasks.find(t => t.id === notif.taskId)?.taskTitle || 'Task'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{notif.title}</h4>
                        {notif.important && (
                          <Flag className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                        {!notif.read && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notif.summary}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDateTime(notif.datetime)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleImportant(notif.id);
                      }}
                    >
                      <Flag className={`h-4 w-4 ${notif.important ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StakeholderSection({
  stakeholders,
  selectedStakeholderId,
  onStakeholderSelect,
  selectedStakeholder,
  chatMessages,
  chatInput,
  onChatInputChange,
  onSendMessage,
  chatHistory,
  chatSessions,
  activeSessionId,
  onStartNewChat,
  onSelectSession,
  onEndSession,
  onUpdateSessionTitle,
  isChatbotThinking,
}: {
  stakeholders: Stakeholder[];
  selectedStakeholderId: string | null;
  onStakeholderSelect: (id: string) => void;
  selectedStakeholder?: Stakeholder;
  chatMessages: ChatMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendMessage: () => void;
  chatHistory: { [key: string]: ChatMessage[] };
  chatSessions: { [key: string]: ChatSession[] };
  activeSessionId: string | null;
  onStartNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onEndSession: (sessionId: string) => void;
  onUpdateSessionTitle: (sessionId: string, title: string) => void;
  isChatbotThinking: boolean;
}) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  // Get sessions for selected stakeholder
  const stakeholderSessions = selectedStakeholderId ? (chatSessions[selectedStakeholderId] || []) : [];
  const activeSession = stakeholderSessions.find(s => s.id === activeSessionId);

  // Get username from localStorage for student messages
  const username = typeof window !== 'undefined' ? (localStorage.getItem('ai4edu_user') || 'Student') : 'Student';

  // Helper function to get default title from datetime
  const getDefaultTitle = (datetime: string) => {
    return formatDateTime(datetime);
  };

  // Helper function to truncate text to first 10 words
  const truncateToWords = (text: string, wordCount: number = 10): string => {
    const words = text.trim().split(/\s+/);
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  const handleEditTitle = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title || getDefaultTitle(session.startTime));
  };

  const handleSaveTitle = (sessionId: string) => {
    if (editingTitle.trim()) {
      onUpdateSessionTitle(sessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
    setEditingTitle("");
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle("");
  };

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Stakeholders Grid */}
      <div className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Stakeholders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {stakeholders
                .filter((stakeholder) => stakeholder.status === 'active')
                .map((stakeholder) => (
                <Card
                  key={stakeholder.id}
                  className={`cursor-pointer transition-colors ${
                    selectedStakeholderId === stakeholder.id
                      ? 'border-primary'
                      : ''
                  }`}
                  onClick={() => onStakeholderSelect(stakeholder.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-16 w-16 mb-2">
                        <AvatarImage src={stakeholder.avatarImage} />
                        <AvatarFallback>{stakeholder.name[0]}</AvatarFallback>
                      </Avatar>
                      <h4 className="font-semibold">{stakeholder.name}</h4>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Sessions Panel */}
        {selectedStakeholderId && (
          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Chat Sessions</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStartNewChat}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stakeholderSessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No chat sessions yet
                  </p>
                ) : (
                  stakeholderSessions.map((session) => {
                    const isActive = session.id === activeSessionId;
                    const isEnded = !!session.endTime;
                    const displayTitle = session.title || getDefaultTitle(session.startTime);
                    const isEditing = editingSessionId === session.id;

                    return (
                      <div
                        key={session.id}
                        className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-primary/10 border-primary'
                            : 'bg-muted/50 border-border hover:bg-muted'
                        } ${isEnded ? 'opacity-75' : ''}`}
                        onClick={() => !isEditing && onSelectSession(session.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          {isEditing ? (
                            <div className="flex-1 flex items-center gap-1">
                              <Input
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveTitle(session.id);
                                  } else if (e.key === 'Escape') {
                                    handleCancelEdit();
                                  }
                                }}
                                className="h-7 text-xs"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveTitle(session.id);
                                }}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEdit();
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                        </div>
                          ) : (
                            <>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{displayTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(session.startTime).toLocaleDateString()}
                                  {isEnded && ' • Ended'}
                                </p>
                    </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTitle(session);
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                {isActive && !isEnded && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEndSession(session.id);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                  </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chat Area */}
      <div className="col-span-3">
        {selectedStakeholder ? (
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedStakeholder.avatarImage} />
                  <AvatarFallback>{selectedStakeholder.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{selectedStakeholder.name}</CardTitle>
                    {activeSession && (
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>
                          {activeSession.title || getDefaultTitle(activeSession.startTime)}
                        </span>
                        {activeSession.endTime && (
                          <Badge variant="secondary" className="text-xs">Ended</Badge>
                        )}
                      </CardDescription>
                    )}
                </div>
                </div>
                {activeSession && !activeSession.endTime && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEndSession(activeSession.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                )}
                {activeSession && activeSession.endTime && (
                  <Badge variant="secondary" className="text-xs">
                    Session Ended - You can continue chatting
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-1">
                {chatMessages.length === 0 && !activeSessionId ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Start a new conversation</p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === 'student' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] min-w-0 p-3 rounded-lg ${
                        msg.sender === 'student'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className={`font-semibold text-xs mb-1 ${
                        msg.sender === 'student' ? 'opacity-90' : 'opacity-80'
                      }`}>
                        {msg.sender === 'student' 
                          ? `${username}:` 
                          : `${selectedStakeholder?.name || 'Agent'}:`}
                      </p>
                      <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{msg.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  ))
                )}
                {/* Loading indicator when chatbot is thinking */}
                {isChatbotThinking && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%] min-w-0 p-3 rounded-lg bg-muted flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => onChatInputChange(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onSendMessage();
                    }
                  }}
                />
                <Button onClick={onSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Select a stakeholder to start chatting</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ProgressTrackingSection({
  stats,
  tasks,
  groups,
  submissions,
  selectedCourseId,
  selectedProjectId,
  quizScore,
  groupMetrics,
}: {
  stats: ProgressStats;
  tasks: Task[];
  groups: StudentGroup[];
  submissions: Submission[];
  selectedCourseId: string;
  selectedProjectId: string | null;
  quizScore?: number | null;
  groupMetrics?: Array<{
    groupId: string;
    groupName: string;
    memberCount: number;
    tasksDone: number;
    tasksLate: number;
    totalTasks: number;
    averageScore: number | null;
    feedbackReceivedCount: number;
    feedbackOnFeedbackCount: number;
    submissionsCount: number;
    submissionQuestionsAnsweredCount: number;
    conversationMessagesCount: number;
    conversationSessionsPerMonth: number;
    quizScoreLatestAverage: number | null;
  }>;
}) {
  const { t } = useLanguage();
  const [averageScoreDialogOpen, setAverageScoreDialogOpen] = useState(false);

  // Use totalTasks from stats if available (from backend), otherwise fallback to tasks.length
  const totalTasks = stats.tasksDone + stats.tasksLate > 0 ? (stats.tasksDone + stats.tasksLate) : tasks.length;
  const progressPercentage = totalTasks > 0 ? (stats.tasksDone / totalTasks) * 100 : 0;

  // Derived ratios and statuses for individual metrics
  const totalForDoneMetric = stats.tasksDone + stats.tasksLate;
  const tasksDoneRatio = totalForDoneMetric > 0 ? stats.tasksDone / totalForDoneMetric : 0;
  const tasksDoneStatus: ProgressStatus =
    tasksDoneRatio >= 1 ? "excellent" : tasksDoneRatio >= 0.8 ? "ontrack" : "needs_help";

  const tasksLateStatus: ProgressStatus =
    stats.tasksLate === 0 ? "excellent" : stats.tasksLate <= 2 ? "ontrack" : "needs_help";

  const averageScoreStatus: ProgressStatus =
    stats.averageScore >= 4
      ? "excellent"
      : stats.averageScore >= 3
      ? "ontrack"
      : "needs_help";

  const feedbackCoverageRatio =
    stats.tasksDone > 0 ? Math.min(stats.feedbackReceived / stats.tasksDone, 1) : 0;
  const feedbackCoverageStatus: ProgressStatus =
    feedbackCoverageRatio >= 1
      ? "excellent"
      : feedbackCoverageRatio >= 0.8
      ? "ontrack"
      : "needs_help";

  const feedbackOnFeedbackRatio =
    stats.feedbackReceived > 0 ? Math.min(stats.feedbackRead / stats.feedbackReceived, 1) : 0;
  const feedbackOnFeedbackStatus: ProgressStatus =
    feedbackOnFeedbackRatio >= 0.7
      ? "excellent"
      : feedbackOnFeedbackRatio >= 0.3
      ? "ontrack"
      : "needs_help";

  // Approximate conversation sessions per month using current count
  const conversationSessionsPerMonth = stats.conversationItems;
  const conversationStatus: ProgressStatus =
    conversationSessionsPerMonth >= 2
      ? "excellent"
      : conversationSessionsPerMonth >= 1
      ? "ontrack"
      : "needs_help";

  // Status for sessions length (engagement length)
  const sessionsLength = stats.engagementLength;
  const sessionsLengthStatus: ProgressStatus =
    sessionsLength >= 2
      ? "excellent"
      : sessionsLength >= 1
      ? "ontrack"
      : "needs_help";

  const quizScoreRatio = quizScore !== null && quizScore !== undefined ? quizScore / 100 : 0;
  const quizScoreStatus: ProgressStatus =
    quizScoreRatio >= 0.8
      ? "excellent"
      : quizScoreRatio >= 0.6
      ? "ontrack"
      : "needs_help";

  // Use groupMetrics from backend if available, otherwise fallback to empty
  // These metrics mirror the individual metrics but aggregated at group level
  const groupStats = groupMetrics && groupMetrics.length > 0
    ? groupMetrics.map(gm => ({
        groupId: gm.groupId,
        groupName: gm.groupName,
        memberCount: gm.memberCount,
        tasksDone: gm.tasksDone,
        tasksLate: gm.tasksLate,
        totalTasks: gm.totalTasks,
        averageScore: gm.averageScore ?? 0,
        feedbackReceivedCount: gm.feedbackReceivedCount,
        feedbackOnFeedbackCount: gm.feedbackOnFeedbackCount,
        submissionsCount: gm.submissionsCount,
        submissionQuestionsAnsweredCount: gm.submissionQuestionsAnsweredCount,
        conversationSessionsPerMonth: gm.conversationSessionsPerMonth ?? 0,
        quizScoreLatestAverage: gm.quizScoreLatestAverage ?? null,
      }))
    : []; // If no groupMetrics from backend, show empty (backend handles filtering)

  return (
    <div className="space-y-6">
      <Tabs defaultValue="individual" className="w-full">
        <TabsList>
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="group">Group</TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Project Progress</span>
                <span className="text-sm text-muted-foreground">
                  {stats.tasksDone} / {totalTasks} tasks
                </span>
              </div>
              <Progress value={progressPercentage} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Tasks Done"
          value={`${stats.tasksDone} / ${totalForDoneMetric || 0}`}
          icon={CheckCircle2}
          color="text-green-600"
          status={tasksDoneStatus}
          statusMessage={t("progress.individual.tasksDone")}
          helpText="Calculated as tasks done divided by (tasks done + tasks late). Higher means you are keeping up with your work."
          t={t}
        />
        <StatCard
          title="Tasks Late"
          value={stats.tasksLate}
          icon={XCircle}
          color="text-red-600"
          status={tasksLateStatus}
          statusMessage={
            stats.tasksLate === 0
              ? t("progress.individual.tasksLate.zero")
              : t("progress.individual.tasksLate.nonZero")
          }
          helpText="Number of tasks where the deadline has passed and you have not submitted yet."
          t={t}
        />
        <StatCard
          title="Average Score"
          value={stats.averageScore.toFixed(1)}
          icon={TrendingUp}
          color="text-yellow-600"
          onClick={() => setAverageScoreDialogOpen(true)}
          status={averageScoreStatus}
          statusMessage={t("progress.individual.averageScore")}
          helpText="Average of all your task star scores on a 0–5 scale."
          t={t}
        />
        <StatCard
          title="Feedback Received (%)"
          value={`${Math.round(feedbackCoverageRatio * 100)}%`}
          icon={Bell}
          color="text-purple-600"
          status={feedbackCoverageStatus}
          statusMessage={t("progress.individual.feedbackReceived")}
          helpText="Percentage of your completed tasks where you have received teacher feedback."
          t={t}
        />
        <StatCard
          title="Feedback on Feedback (%)"
          value={`${Math.round(feedbackOnFeedbackRatio * 100)}%`}
          icon={Eye}
          color="text-blue-600"
          status={feedbackOnFeedbackStatus}
          statusMessage={t("progress.individual.feedbackOnFeedback")}
          helpText="Of all feedback you received, how many you have responded to (agreement or comment)."
          t={t}
        />
        <StatCard
          title="Conversation sessions / month"
          value={conversationSessionsPerMonth.toFixed(1)}
          icon={MessageSquare}
          color="text-pink-600"
          status={conversationStatus}
          statusMessage={t("progress.individual.conversationSessions")}
          helpText="How many conversation sessions (with AI or stakeholders) you have about your tasks in a month."
          t={t}
        />
        <StatCard
          title="Sessions length"
          value={stats.engagementLength}
          icon={MessageSquare}
          color="text-blue-600"
          status={sessionsLengthStatus}
          statusMessage={t("progress.individual.sessionsLength")}
          helpText="An indicator of how long you stay engaged in your sessions for this project. Higher values suggest more sustained focus."
          t={t}
        />
        <StatCard
          title="Quiz Score (latest)"
          value={quizScore !== null ? `${quizScore.toFixed(1)}%` : "N/A"}
          icon={TrendingUp}
          color="text-teal-600"
          status={quizScoreStatus}
          statusMessage={t("progress.individual.quizScore")}
          helpText="Score from your most recent quiz attempt for the selected quiz (0–100%)."
          t={t}
        />
      </div>

      {/* Average Score Details Dialog */}
      <Dialog open={averageScoreDialogOpen} onOpenChange={setAverageScoreDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Average Score Details</DialogTitle>
            <DialogDescription>
              This average score is calculated from all your task scores (star scores).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Number of scored submissions:</span>{" "}
              {
                submissions.filter(
                  (s) => s.starScore !== undefined && s.starScore !== null
                ).length
              }
            </p>
            <p>
              <span className="font-semibold">Average score:</span>{" "}
              {stats.averageScore.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              Formula: (Sum of all submission star scores) ÷ (Number of submissions with a
              star score).
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setAverageScoreDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </TabsContent>

        <TabsContent value="group">
          <Card>
            <CardHeader>
              <CardTitle>Group Progress Overview</CardTitle>
              <CardDescription>Aggregated metrics for all active groups</CardDescription>
            </CardHeader>
            <CardContent>
              {groupStats.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active groups found for this course{selectedProjectId ? " and project" : ""}.
                </p>
              ) : (
                <div className="space-y-6">
                  {groupStats.map(groupStat => {
                    const groupTotalTasks = groupStat.totalTasks || totalTasks;
                    const groupProgressPercentage =
                      groupTotalTasks > 0 ? (groupStat.tasksDone / groupTotalTasks) * 100 : 0;

                    // Derive group-level statuses using same logic as individual tab
                    const groupTotalForDoneMetric = groupStat.tasksDone + (groupStat.tasksLate || 0);
                    const groupTasksDoneRatio =
                      groupTotalForDoneMetric > 0 ? groupStat.tasksDone / groupTotalForDoneMetric : 0;
                    const groupTasksDoneStatus: ProgressStatus =
                      groupTasksDoneRatio >= 1
                        ? "excellent"
                        : groupTasksDoneRatio >= 0.8
                        ? "ontrack"
                        : "needs_help";

                    const groupTasksLateStatus: ProgressStatus =
                      (groupStat.tasksLate || 0) === 0
                        ? "excellent"
                        : (groupStat.tasksLate || 0) <= 2
                        ? "ontrack"
                        : "needs_help";

                    const groupAverageScoreStatus: ProgressStatus =
                      (groupStat.averageScore ?? 0) >= 4
                        ? "excellent"
                        : (groupStat.averageScore ?? 0) >= 3
                        ? "ontrack"
                        : "needs_help";

                    const groupFeedbackCoverageRatio =
                      groupStat.tasksDone > 0
                        ? Math.min(
                            groupStat.feedbackReceivedCount / groupStat.tasksDone,
                            1
                          )
                        : 0;
                    const groupFeedbackCoverageStatus: ProgressStatus =
                      groupFeedbackCoverageRatio >= 1
                        ? "excellent"
                        : groupFeedbackCoverageRatio >= 0.8
                        ? "ontrack"
                        : "needs_help";

                    const groupFeedbackOnFeedbackRatio =
                      groupStat.feedbackReceivedCount > 0
                        ? Math.min(
                            (groupStat.feedbackOnFeedbackCount || 0) /
                              groupStat.feedbackReceivedCount,
                            1
                          )
                        : 0;
                    const groupFeedbackOnFeedbackStatus: ProgressStatus =
                      groupFeedbackOnFeedbackRatio >= 0.7
                        ? "excellent"
                        : groupFeedbackOnFeedbackRatio >= 0.3
                        ? "ontrack"
                        : "needs_help";

                    const groupConversationSessions =
                      groupStat.conversationSessionsPerMonth ?? 0;
                    const groupConversationStatus: ProgressStatus =
                      groupConversationSessions >= 2
                        ? "excellent"
                        : groupConversationSessions >= 1
                        ? "ontrack"
                        : "needs_help";

                    const groupQuizRatio =
                      groupStat.quizScoreLatestAverage !== null &&
                      groupStat.quizScoreLatestAverage !== undefined
                        ? groupStat.quizScoreLatestAverage / 100
                        : 0;
                    const groupQuizStatus: ProgressStatus =
                      groupQuizRatio >= 0.8
                        ? "excellent"
                        : groupQuizRatio >= 0.6
                        ? "ontrack"
                        : "needs_help";
                    
                    return (
                      <Card key={groupStat.groupId}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{groupStat.groupName}</CardTitle>
                              <CardDescription>
                                {groupStat.memberCount} {groupStat.memberCount === 1 ? 'member' : 'members'}
                              </CardDescription>
                            </div>
                            <Badge variant="default">
                              {groupStat.tasksDone} / {totalTasks} tasks
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Group Progress</span>
                                <span className="text-sm text-muted-foreground">
                                  {groupStat.tasksDone} / {groupTotalTasks} tasks
                                </span>
                              </div>
                              <Progress value={groupProgressPercentage} />
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <StatCard
                                title="Tasks Done"
                                value={groupStat.tasksDone}
                                icon={CheckCircle2}
                                color="text-green-600"
                                status={groupTasksDoneStatus}
                                statusMessage={t("progress.group.tasksDone")}
                                helpText="Calculated as group tasks done divided by (group tasks done + group tasks late)."
                                t={t}
                              />
                              <StatCard
                                title="Tasks Late"
                                value={groupStat.tasksLate || 0}
                                icon={XCircle}
                                color="text-red-600"
                                status={groupTasksLateStatus}
                                statusMessage={
                                  (groupStat.tasksLate || 0) === 0
                                    ? t("progress.group.tasksLate.zero")
                                    : t("progress.group.tasksLate.nonZero")
                                }
                                helpText="Number of group tasks where the deadline has passed and no one in the group has submitted yet."
                                t={t}
                              />
                              <StatCard
                                title="Average Score"
                                value={groupStat.averageScore !== null ? groupStat.averageScore.toFixed(1) : "N/A"}
                                icon={TrendingUp}
                                color="text-yellow-600"
                                status={groupAverageScoreStatus}
                                statusMessage={t("progress.group.averageScore")}
                                helpText="Average of all group task star scores on a 0–5 scale."
                                t={t}
                              />
                              <StatCard
                                title="Feedback Received"
                                value={groupStat.feedbackReceivedCount}
                                icon={Bell}
                                color="text-purple-600"
                                status={groupFeedbackCoverageStatus}
                                statusMessage={t("progress.group.feedbackReceived")}
                                helpText="Percentage of completed group tasks where someone in the group has received feedback."
                                t={t}
                              />
                              <StatCard
                                title="Feedback on Feedback"
                                value={groupStat.feedbackOnFeedbackCount || 0}
                                icon={Eye}
                                color="text-blue-600"
                                status={groupFeedbackOnFeedbackStatus}
                                statusMessage={t("progress.group.feedbackOnFeedback")}
                                helpText="Of all feedback your group received, how many times someone in the group has responded."
                                t={t}
                              />
                              <StatCard
                                title="Submission Questions Answered"
                                value={groupStat.submissionQuestionsAnsweredCount}
                                icon={CheckCircle2}
                                color="text-green-600"
                                helpText="How many submissions from your group include answered reflection or submission questions."
                                t={t}
                              />
                              <StatCard
                                title="Submissions"
                                value={groupStat.submissionsCount}
                                icon={Upload}
                                color="text-indigo-600"
                                helpText="Total number of submissions sent by all members of your group for this project."
                                t={t}
                              />
                              <StatCard
                                title="Conversation sessions / month"
                                value={groupStat.conversationSessionsPerMonth.toFixed(1)}
                                icon={MessageSquare}
                                color="text-pink-600"
                                status={groupConversationStatus}
                                statusMessage={t("progress.group.conversationSessions")}
                                helpText="How many conversation sessions per month your group has about this project."
                                t={t}
                              />
                              <StatCard
                                title="Quiz Score (latest avg)"
                                value={
                                  groupStat.quizScoreLatestAverage !== null
                                    ? `${groupStat.quizScoreLatestAverage.toFixed(1)}%`
                                    : "N/A"
                                }
                                icon={TrendingUp}
                                color="text-teal-600"
                                status={groupQuizStatus}
                                statusMessage={t("progress.group.quizScore")}
                                helpText="Average of the latest quiz scores (0–100%) for all members of your group."
                                t={t}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

type ProgressStatus = "excellent" | "ontrack" | "needs_help";

function StatCard({
  title,
  value,
  icon: _Icon,
  color,
  onClick,
  status,
  statusMessage,
  helpText,
  t,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
  status?: ProgressStatus;
  statusMessage?: string;
  helpText?: string;
  t: (key: string) => string;
}) {
  const getStatusConfig = (state: ProgressStatus | undefined) => {
    if (state === "excellent") {
      return {
        label: t("progress.status.excellent"),
        emoji: "🌟",
        bubbleClass: "bg-emerald-100 text-emerald-700 animate-bounce",
        defaultMessage: t("progress.message.excellent.default"),
      };
    }
    if (state === "ontrack") {
      return {
        label: t("progress.status.ontrack"),
        emoji: "🚀",
        bubbleClass: "bg-sky-100 text-sky-700 animate-pulse",
        defaultMessage: t("progress.message.ontrack.default"),
      };
    }
    if (state === "needs_help") {
      return {
        label: t("progress.status.needsHelp"),
        emoji: "⚠️",
        bubbleClass: "bg-red-100 text-red-700 animate-ping",
        defaultMessage: t("progress.message.needsHelp.default"),
      };
    }
    return null;
  };

  const statusConfig = getStatusConfig(status);

  // Get background color based on status
  const getBackgroundColor = () => {
    if (status === "excellent") return "bg-emerald-50";
    if (status === "ontrack") return "bg-sky-50";
    if (status === "needs_help") return "bg-rose-50";
    return "";
  };

  return (
    <Card
      className={`${getBackgroundColor()} ${onClick ? "cursor-pointer transition-transform hover:scale-[1.01]" : "transition-transform"}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="grid grid-cols-[30%_50%_20%] gap-3 items-center">
          {/* Left: Title + (?) Button, then Number */}
          <div className="flex flex-col items-start justify-start">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-muted-foreground">{title}</p>
              {helpText && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs font-semibold hover:bg-muted"
                      aria-label={`How is ${title} calculated?`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      ?
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-xs text-xs" align="start">
                    <p className="font-semibold mb-1">{title}</p>
                    <p className="text-muted-foreground">{helpText}</p>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          
          {/* Middle: Status Text */}
          <div className="flex flex-col items-center justify-center text-center">
            {statusConfig && (
              <>
                <p className="text-xs font-semibold">{statusConfig.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {statusMessage || statusConfig.defaultMessage}
                </p>
              </>
            )}
          </div>
          
          {/* Right: Status Icon */}
          <div className="flex items-center justify-center">
            {statusConfig && (
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-base ${statusConfig.bubbleClass}`}
              >
                <span aria-hidden="true">{statusConfig.emoji}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quiz Section Component
function QuizSection({
  quizzes,
  selectedQuizId,
  onQuizSelect,
  currentQuestionIndex,
  onQuestionIndexChange,
  quizAnswers,
  onAnswerChange,
  quizComments,
  onCommentChange,
  quizLockedAnswers,
  quizIsSubmitted,
  quizScore,
  onQuizSubmit,
  leaderboard,
  onSaveState,
  onRefreshLeaderboard,
}: {
  quizzes: Quiz[];
  selectedQuizId: string | null;
  onQuizSelect: (id: string) => void;
  currentQuestionIndex: number;
  onQuestionIndexChange: (index: number) => void;
  quizAnswers: { [questionId: string]: number | null };
  onAnswerChange: (questionId: string, answer: number | null) => void;
  quizComments: { [questionId: string]: string };
  onCommentChange: (questionId: string, comment: string) => void;
  quizLockedAnswers: { [questionId: string]: boolean };
  quizIsSubmitted: boolean;
  quizScore: number | null;
  onQuizSubmit: (quiz: Quiz) => void;
  leaderboard: Array<{ studentId: string; studentName: string; score: number }>;
  onSaveState: () => void;
  onRefreshLeaderboard?: () => void;
}) {
  const selectedQuiz = quizzes.find(q => q.id === selectedQuizId);
  
  // Ensure questions are deduplicated (safety check)
  const deduplicatedQuiz = selectedQuiz ? (() => {
    const originalCount = selectedQuiz.questions?.length || 0;
    const deduplicatedQuestions = Array.from(
      new Map(selectedQuiz.questions.map((q: QuizQuestion) => [q.id, q])).values()
    ) as QuizQuestion[];
    
    // Debug: Log if questions are being removed
    if (originalCount !== deduplicatedQuestions.length) {
      console.warn(`[Quiz Display] WARNING: Quiz ${selectedQuiz.id} had ${originalCount} questions, but only ${deduplicatedQuestions.length} after deduplication`);
      console.log(`[Quiz Display] Original question IDs:`, selectedQuiz.questions.map((q: QuizQuestion) => q.id));
      console.log(`[Quiz Display] Deduplicated question IDs:`, deduplicatedQuestions.map((q: QuizQuestion) => q.id));
    } else {
      console.log(`[Quiz Display] Quiz ${selectedQuiz.id}: ${deduplicatedQuestions.length} questions displayed`);
    }
    
    return {
      ...selectedQuiz,
      questions: deduplicatedQuestions
    };
  })() : null;
  
  const questionsPerPage = 10; // Show 10 questions per page for efficient navigation
  const totalPages = deduplicatedQuiz ? Math.ceil(deduplicatedQuiz.questions.length / questionsPerPage) : 0;
  const currentPage = Math.floor(currentQuestionIndex / questionsPerPage);
  const startIndex = currentPage * questionsPerPage;
  const endIndex = Math.min(startIndex + questionsPerPage, deduplicatedQuiz?.questions.length || 0);
  const currentPageQuestions = deduplicatedQuiz?.questions.slice(startIndex, endIndex) || [];
  
  // Ensure currentQuestionIndex is within bounds
  useEffect(() => {
    if (deduplicatedQuiz && currentQuestionIndex >= deduplicatedQuiz.questions.length) {
      onQuestionIndexChange(Math.max(0, deduplicatedQuiz.questions.length - 1));
    }
  }, [deduplicatedQuiz, currentQuestionIndex, onQuestionIndexChange]);

  // Helper function to count answered questions
  const getAnsweredCount = (quiz: Quiz | undefined, answers: { [questionId: string]: number | null }): number => {
    if (!quiz || !quiz.questions) return 0;
    // Deduplicate questions by ID before counting
    const uniqueQuestions = Array.from(
      new Map(quiz.questions.map((q: QuizQuestion) => [q.id, q])).values()
    ) as QuizQuestion[];
    return uniqueQuestions.filter(q => answers[q.id] !== null && answers[q.id] !== undefined).length;
  };

  // Auto-save removed - user must click Save button manually

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz</CardTitle>
          <CardDescription>No quizzes available for your courses</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Quiz</h2>
          <p className="text-muted-foreground">Take quizzes and track your progress</p>
        </div>
        {quizzes.length > 1 && (
          <Select value={selectedQuizId || ""} onValueChange={onQuizSelect}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a quiz" />
            </SelectTrigger>
            <SelectContent>
              {quizzes.map((quiz) => (
                <SelectItem key={quiz.id} value={quiz.id}>
                  {quiz.name || "Quiz"} ({quiz.questions.length} questions)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Score Display (if submitted) */}
      {quizIsSubmitted && quizScore !== null && deduplicatedQuiz && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Your Score: {quizScore}%
            </CardTitle>
            <CardDescription>
              Based on {getAnsweredCount(deduplicatedQuiz, quizAnswers)} answered questions
              {deduplicatedQuiz.questions.length > getAnsweredCount(deduplicatedQuiz, quizAnswers) && (
                <span className="block mt-1">
                  You can still answer {deduplicatedQuiz.questions.length - getAnsweredCount(deduplicatedQuiz, quizAnswers)} unanswered questions to improve your score
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Leaderboard Dashboard - Show when a quiz is selected */}
      {selectedQuizId && deduplicatedQuiz && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top 10 Highest Scores
                </CardTitle>
                <CardDescription>Leaderboard for this quiz</CardDescription>
              </div>
              {onRefreshLeaderboard && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefreshLeaderboard}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.studentId}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-muted text-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{entry.studentName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{entry.score}%</span>
                      {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-2">No scores available yet</p>
                {onRefreshLeaderboard && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefreshLeaderboard}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load Leaderboard
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quiz Content */}
      {deduplicatedQuiz ? (
        <div className="grid grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Question Navigation</CardTitle>
                <CardDescription>
                  {deduplicatedQuiz?.questions.length || 0} questions total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {/* Page Navigation */}
                  {totalPages > 1 && (
                    <div className="mb-4 pb-4 border-b">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Page {currentPage + 1} of {totalPages}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const prevPage = Math.max(0, currentPage - 1);
                              onQuestionIndexChange(prevPage * questionsPerPage);
                            }}
                            disabled={currentPage === 0}
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const nextPage = Math.min(totalPages - 1, currentPage + 1);
                              onQuestionIndexChange(nextPage * questionsPerPage);
                            }}
                            disabled={currentPage === totalPages - 1}
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Question Numbers Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {deduplicatedQuiz.questions.map((question, index) => {
                      const isAnswered = quizAnswers[question.id] !== null && quizAnswers[question.id] !== undefined;
                      const isLocked = quizLockedAnswers[question.id] || false;
                      const hasComment = quizComments[question.id] && quizComments[question.id].trim().length > 0;
                      const isCurrent = index === currentQuestionIndex;
                      
                      return (
                        <button
                          key={question.id}
                          onClick={() => onQuestionIndexChange(index)}
                          className={`w-8 h-8 rounded text-xs font-medium transition-colors relative ${
                            isCurrent
                              ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1'
                              : isLocked
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : isAnswered
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                          title={`Question ${index + 1}${isLocked ? ' (locked)' : ''}${hasComment ? ' (has comment)' : ''}${isAnswered ? ' (answered)' : ''}`}
                        >
                          {index + 1}
                          {hasComment && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white" />
                          )}
                          {isLocked && (
                            <span className="absolute -bottom-0.5 -right-0.5 text-[8px]">🔒</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Quiz Area */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{deduplicatedQuiz.name || "Quiz"}</CardTitle>
                    <CardDescription>
                      Question {currentQuestionIndex + 1} of {deduplicatedQuiz.questions.length}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {getAnsweredCount(deduplicatedQuiz, quizAnswers)} / {deduplicatedQuiz.questions.length} answered
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {deduplicatedQuiz.questions[currentQuestionIndex] && (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {deduplicatedQuiz.questions[currentQuestionIndex].question}
                      </h3>
                      {quizLockedAnswers[deduplicatedQuiz.questions[currentQuestionIndex].id] && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800 flex items-center gap-2">
                            <span>🔒</span>
                            This question has been submitted and is locked. You cannot change your answer.
                          </p>
                        </div>
                      )}
                      <div className="space-y-3">
                        {deduplicatedQuiz.questions[currentQuestionIndex].options.map((option, optIndex) => {
                          const questionId = deduplicatedQuiz.questions[currentQuestionIndex].id;
                          const isSelected = quizAnswers[questionId] === optIndex;
                          const isLocked = quizLockedAnswers[questionId] || false;
                          
                          return (
                            <button
                              key={optIndex}
                              onClick={() => !isLocked && onAnswerChange(questionId, optIndex)}
                              disabled={isLocked}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                isLocked
                                  ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                                  : isSelected
                                  ? 'border-primary bg-primary/10'
                                  : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isLocked
                                    ? 'border-gray-400 bg-gray-300'
                                    : isSelected
                                    ? 'border-primary bg-primary'
                                    : 'border-muted'
                                }`}>
                                  {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                  )}
                                </div>
                                <span>{option}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Comment/Explanation Section */}
                    <div className="pt-4 border-t">
                      <Label htmlFor="quiz-comment" className="text-base font-semibold mb-2 block">
                        Explanation or Comment (Optional)
                        {quizLockedAnswers[deduplicatedQuiz.questions[currentQuestionIndex].id] && (
                          <span className="text-xs text-muted-foreground ml-2">(Locked)</span>
                        )}
                      </Label>
                      <Textarea
                        id="quiz-comment"
                        value={quizComments[deduplicatedQuiz.questions[currentQuestionIndex].id] || ''}
                        onChange={(e) => onCommentChange(deduplicatedQuiz.questions[currentQuestionIndex].id, e.target.value)}
                        placeholder="Explain your answer or add any comments about this question..."
                        rows={4}
                        className="resize-none"
                        disabled={quizLockedAnswers[deduplicatedQuiz.questions[currentQuestionIndex].id] || false}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {quizLockedAnswers[deduplicatedQuiz.questions[currentQuestionIndex].id]
                          ? "This question is locked and cannot be edited."
                          : "Click the Save button to save your explanation"}
                      </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => onQuestionIndexChange(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          Progress: {Math.round(((getAnsweredCount(deduplicatedQuiz, quizAnswers)) / deduplicatedQuiz.questions.length) * 100)}%
                        </div>
                        {!quizIsSubmitted && (
                          <>
                            <Button
                              variant="outline"
                              onClick={onSaveState}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button
                              onClick={() => selectedQuiz && onQuizSubmit(selectedQuiz)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Done
                            </Button>
                          </>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => onQuestionIndexChange(Math.min(deduplicatedQuiz.questions.length - 1, currentQuestionIndex + 1))}
                        disabled={currentQuestionIndex === deduplicatedQuiz.questions.length - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Quiz Selected</CardTitle>
            <CardDescription>Please select a quiz to begin</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
