import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, BookOpen, FileText, Users, ClipboardCheck, Settings, Save, Trash2, Eraser, MessageSquare, Presentation, MessageCircle, Download, ChevronDown, Edit, Loader2, FolderOpen, Calendar, Sparkles, Wrench, Printer, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import Assessment from "./Assessment";
import AILiteracyCourse from "./AILiteracyCourse";
import Prompting from "./Prompting";
import AITools from "./AITools";
import Worksheet from "./Worksheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useChat } from "@/contexts/ChatContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { getStoredRole } from "@/constants/roles";
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import API_ENDPOINTS from "@/config/api";

type Step = 1 | 2 | 3 | 4;

interface TeacherInfo {
  educationLevel: string;
  subjectArea: string;
  country: string;
  academicYear: string;
  organization: string;
}

interface CoursePlanVersion {
  id: string;
  title: string;
  date: string;
  content: string;
  type: 'course' | 'lecture' | 'feedback';
  savedDocumentId?: string;  // MongoDB document ID if saved
  hasChanges?: boolean;  // Track if content has changed since last save
}

interface LecturePlanVersion {
  id: string;
  title: string;
  date: string;
  content: string;
  coursePlanId: string;
  type: 'lecture';
}

interface StudentFeedbackVersion {
  id: string;
  title: string;
  date: string;
  content: string;
  type: 'feedback';
}

const getWorkflowCategories = (t: (key: string) => string) => [
  {
    id: "ai-literacy",
    title: t("teacher.workflows.ai-literacy.title"),
    description: t("teacher.workflows.ai-literacy.description"),
    icon: BookOpen,
    enabled: true
  },
  {
    id: "prompting",
    title: t("teacher.workflows.prompting.title"),
    description: t("teacher.workflows.prompting.description"),
    icon: Sparkles,
    enabled: true
  },
  {
    id: "ai-tools",
    title: t("teacher.workflows.ai-tools.title"),
    description: t("teacher.workflows.ai-tools.description"),
    icon: Wrench,
    enabled: true
  },
  {
    id: "planning",
    title: t("teacher.workflows.planning.title"),
    description: t("teacher.workflows.planning.description"),
    icon: BookOpen,
    enabled: true
  },
  {
    id: "content-creation",
    title: t("teacher.workflows.content-creation.title"),
    description: t("teacher.workflows.content-creation.description"),
    icon: FileText,
    enabled: true
  },
  {
    id: "assessment",
    title: t("teacher.workflows.assessment.title"),
    description: t("teacher.workflows.assessment.description"),
    icon: ClipboardCheck,
    enabled: true
  },
];

const getPlanningCases = (t: (key: string) => string) => [
  {
    id: "develop-new-course",
    title: t("teacher.planningCases.developNewCourse.title"),
    description: t("teacher.planningCases.developNewCourse.description")
  },
  {
    id: "revise-existing-course",
    title: t("teacher.planningCases.reviseExistingCourse.title"),
    description: t("teacher.planningCases.reviseExistingCourse.description")
  },
  {
    id: "align-study-program",
    title: t("teacher.planningCases.alignStudyProgram.title"),
    description: t("teacher.planningCases.alignStudyProgram.description")
  },
  {
    id: "develop-lecture-plan",
    title: t("teacher.planningCases.developLecturePlan.title"),
    description: t("teacher.planningCases.developLecturePlan.description")
  },
  {
    id: "reflect-feedback",
    title: t("teacher.planningCases.reflectFeedback.title"),
    description: t("teacher.planningCases.reflectFeedback.description")
  }
];

const getContentCreationCases = (t: (key: string) => string) => [
  {
    id: "quiz-creation",
    title: t("contentCreation.quizCreation.title"),
    description: t("contentCreation.quizCreation.description")
  },
  {
    id: "worksheet-creation",
    title: t("contentCreation.worksheetCreation.title"),
    description: t("contentCreation.worksheetCreation.description")
  }
];

// Validation functions
const validateContentLength = (content: string, t: (key: string) => string): { isValid: boolean; message: string } => {
  if (content.length > 20000) {
    return {
      isValid: false,
      message: `Innholdet er for langt. Maksimalt ${t("teacher.coursePlan.charLimit")} ${t("teacher.coursePlan.charCount")} tillatt. Du har ${content.length} ${t("teacher.coursePlan.charCount")}.`
    };
  }
  return { isValid: true, message: "" };
};

const validateMeaningfulText = (content: string): { isValid: boolean; message: string } => {
  // Remove whitespace and special characters for analysis
  const cleanContent = content.replace(/[\s\n\r\t]/g, '');
  
  if (cleanContent.length === 0) {
    return { isValid: false, message: "Innholdet kan ikke være tomt." };
  }
  
  // Check for excessive repetition of characters (like "ølaksrepw823948y52lømkn!ølk!!!!!!")
  const charCounts: { [key: string]: number } = {};
  for (const char of cleanContent) {
    charCounts[char] = (charCounts[char] || 0) + 1;
  }
  
  // Check if any single character appears more than 30% of the time
  const maxCharCount = Math.max(...Object.values(charCounts));
  const repetitionRatio = maxCharCount / cleanContent.length;
  
  if (repetitionRatio > 0.3) {
    return {
      isValid: false,
      message: "Innholdet ser ut til å inneholde for mye repetisjon eller meningsløs tekst. Vennligst skriv inn meningsfullt innhold."
    };
  }
  
  // Check for excessive special characters or numbers
  const specialCharCount = (cleanContent.match(/[^a-zA-ZæøåÆØÅ]/g) || []).length;
  const specialCharRatio = specialCharCount / cleanContent.length;
  
  if (specialCharRatio > 0.5) {
    return {
      isValid: false,
      message: "Innholdet inneholder for mange spesialtegn eller tall. Vennligst skriv inn meningsfullt tekstinnhold."
    };
  }
  
  // Check for minimum word count (at least 10 words)
  const words = content.trim().split(/\s+/).filter(word => word.length > 0);
  if (words.length < 10) {
    return {
      isValid: false,
      message: "Innholdet må inneholde minst 10 ord for å være meningsfullt."
    };
  }
  
  return { isValid: true, message: "" };
};

// Helper function to get education level from organization name
const getEducationLevelFromOrganization = (organizationName: string, organizationOptions: any[]): string => {
  if (!organizationName) return "University"; // Default
  
  // First, try to find the organization in the options list
  const orgOption = organizationOptions.find(org => 
    org.value === organizationName || 
    org.label === organizationName ||
    org.short === organizationName
  );
  
  if (orgOption && orgOption.educationLevel) {
    // Map from organization option's educationLevel to backend expected values
    const level = orgOption.educationLevel.toLowerCase();
    if (level === "university") return "University";
    if (level === "primary") return "Primary";
    if (level === "secondary") return "Secondary";
    if (level === "high school" || level === "highschool") return "High School";
    if (level === "graduate") return "Graduate";
    if (level === "professional") return "Professional";
  }
  
  // If not found in options, try to infer from organization name
  const orgLower = organizationName.toLowerCase();
  
  // Check for university indicators
  if (orgLower.includes("university") || 
      orgLower.includes("universitet") || 
      orgLower.includes("universitetet") ||
      orgLower.includes("college") ||
      orgLower.includes("høgskole") ||
      orgLower.includes("høyskole")) {
    return "University";
  }
  
  // Check for school indicators
  if (orgLower.includes("school") || orgLower.includes("skole")) {
    // Try to determine if it's primary or high school
    if (orgLower.includes("high") || 
        orgLower.includes("videregående") ||
        orgLower.includes("secondary")) {
      return "High School";
    }
    if (orgLower.includes("primary") || 
        orgLower.includes("elementary") ||
        orgLower.includes("barneskole")) {
      return "Primary";
    }
    // Default for "school" is Primary
    return "Primary";
  }
  
  // Default to University if unable to determine
  return "University";
};

export default function AITeacher() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize arrays with translations
  const workflowCategories = getWorkflowCategories(t);
  const planningCases = getPlanningCases(t);
  const contentCreationCases = getContentCreationCases(t);
  
  const [step, setStep] = useState<Step>(1);
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>(() => {
    // Try to load organization and academicYear from localStorage
    try {
      const storedOrg = localStorage.getItem('ai4edu_organization');
      const storedAcademicYear = localStorage.getItem('ai4edu_academicYear') || "2025-2026";
      return {
        educationLevel: "",
        subjectArea: "",
        country: "",
        academicYear: storedAcademicYear,
        organization: storedOrg || ""
      };
    } catch {
      return {
        educationLevel: "",
        subjectArea: "",
        country: "",
        academicYear: "2025-2026",
        organization: ""
      };
    }
  });
  
  // Initialize selectedCategory from URL parameter if present
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const categoryParam = searchParams.get("category");
    return categoryParam || "";
  });
  
  // Update selectedCategory when URL parameter changes
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);
  const [selectedPlanningCase, setSelectedPlanningCase] = useState<string>("");
  const [selectedContentCreationCase, setSelectedContentCreationCase] = useState<string>("");
  const [coursePlanContent, setCoursePlanContent] = useState<string>("");
  const [revisedPlanContent, setRevisedPlanContent] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<string>(""); // For analysis or revised plan in right column
  const [coursePlanVersions, setCoursePlanVersions] = useState<CoursePlanVersion[]>([]);
  
  // Print/document view settings
  const [fontSize, setFontSize] = useState<number>(14);
  const [margin, setMargin] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lecturePlanVersions, setLecturePlanVersions] = useState<LecturePlanVersion[]>([]);
  const [studentFeedbackVersions, setStudentFeedbackVersions] = useState<StudentFeedbackVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [coursePlanTitle, setCoursePlanTitle] = useState<string>("Kursplanredigering");
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [showTitleHint, setShowTitleHint] = useState<boolean>(true);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<string>("markdown");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isRevising, setIsRevising] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");
  const [isSavingDocument, setIsSavingDocument] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>(`session-${Date.now()}`);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false);
  const [savedDocuments, setSavedDocuments] = useState<any[]>([]);
  const [showLoadDialog, setShowLoadDialog] = useState<boolean>(false);
  const [dailyTokenUsage, setDailyTokenUsage] = useState<number>(0);
  const [isCheckingTokenLimit, setIsCheckingTokenLimit] = useState<boolean>(false);
  const TOKEN_LIMIT_PER_DAY = 100000;
  // Analysis Explainer state
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(false);
  const [explainLoading, setExplainLoading] = useState<boolean>(false);
  const [explainError, setExplainError] = useState<string>("");
  const [explainContent, setExplainContent] = useState<string>("");
  const { openChat } = useChat();
  const allowedCountry: 'norway' | 'vietnam' | 'all' = language === 'vi' ? 'vietnam' : language === 'no' ? 'norway' : 'all';

  
  const handleMoveToCoursePlanRevision = () => {
    setSelectedCategory("planning");
    setSelectedPlanningCase("revise-existing-course");
  };

  // Pagination helpers for printable document view
  const getPagesFromContent = (content: string, fontSize: number, margin: number): string[] => {
    if (!content.trim()) return [];
    
    // Approximate characters per page based on font size and margin
    // A4 page: ~210mm width, ~297mm height
    // With margins, usable area is reduced
    const charsPerLine = Math.floor((210 - margin * 2) / (fontSize * 0.6)); // Approximate
    const linesPerPage = Math.floor((297 - margin * 2) / (fontSize * 1.5)); // Approximate
    const charsPerPage = charsPerLine * linesPerPage;
    
    const pages: string[] = [];
    const lines = content.split('\n');
    let currentPage = '';
    let currentLineCount = 0;
    
    for (const line of lines) {
      const lineLength = line.length;
      const estimatedLines = Math.ceil(lineLength / charsPerLine) || 1;
      
      if (currentLineCount + estimatedLines > linesPerPage && currentPage) {
        pages.push(currentPage.trim());
        currentPage = line + '\n';
        currentLineCount = estimatedLines;
      } else {
        currentPage += line + '\n';
        currentLineCount += estimatedLines;
      }
    }
    
    if (currentPage.trim()) {
      pages.push(currentPage.trim());
    }
    
    return pages.length > 0 ? pages : [content];
  };

  const totalPages = useMemo(() => {
    return getPagesFromContent(generatedContent, fontSize, margin).length;
  }, [generatedContent, fontSize, margin]);

  const currentPageContent = useMemo(() => {
    const pages = getPagesFromContent(generatedContent, fontSize, margin);
    return pages[currentPage - 1] || '';
  }, [generatedContent, fontSize, margin, currentPage]);

  // handlePrint is defined later for the printable document view

  // Check daily token usage
  const checkDailyTokenUsage = async () => {
    setIsCheckingTokenLimit(true);
    
    try {
      const userName = (() => { 
        try { 
          return localStorage.getItem('ai4edu_user') || 'Guest'; 
        } catch { 
          return 'Guest'; 
        } 
      })();

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = today.toISOString();
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const endDate = tomorrow.toISOString();

      // Fetch today's action logs
      const params = new URLSearchParams({
        startDate: startDate,
        endDate: endDate,
        limit: '1000',  // Get all of today's actions
        sortBy: 'timestamp',
        sortOrder: 'desc'
      });

      const response = await fetch(`${API_ENDPOINTS.logs.actions}?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        setDailyTokenUsage(0);
        return;
      }

      const data = await response.json();

      if (data.success && data.data) {
        const logs = Array.isArray(data.data) ? data.data : (data.data.logs || []);

        const totalTokens = logs.reduce((sum: number, log: any) => {
          let logTokens = 0;

          if (log.tokenUsageInternal) {
            if (typeof log.tokenUsageInternal === 'number') {
              logTokens = log.tokenUsageInternal;
            } else if (log.tokenUsageInternal.totalTokens) {
              logTokens = log.tokenUsageInternal.totalTokens;
            } else if (log.tokenUsageInternal.total) {
              logTokens = log.tokenUsageInternal.total;
            } else if (log.tokenUsageInternal.promptTokens && log.tokenUsageInternal.completionTokens) {
              logTokens = log.tokenUsageInternal.promptTokens + log.tokenUsageInternal.completionTokens;
            } else if (log.tokenUsageInternal.prompt && log.tokenUsageInternal.completion) {
              logTokens = log.tokenUsageInternal.prompt + log.tokenUsageInternal.completion;
            }
          }

          if (logTokens === 0 && log.tokenUsage) {
            if (typeof log.tokenUsage === 'number') {
              logTokens = log.tokenUsage;
            } else if (log.tokenUsage.totalTokens) {
              logTokens = log.tokenUsage.totalTokens;
            } else if (log.tokenUsage.total) {
              logTokens = log.tokenUsage.total;
            } else if (log.tokenUsage.promptTokens && log.tokenUsage.completionTokens) {
              logTokens = log.tokenUsage.promptTokens + log.tokenUsage.completionTokens;
            } else if (log.tokenUsage.prompt && log.tokenUsage.completion) {
              logTokens = log.tokenUsage.prompt + log.tokenUsage.completion;
            }
          }

          return sum + (logTokens > 0 ? logTokens : 0);
        }, 0);

        setDailyTokenUsage(totalTokens);

        if (totalTokens >= TOKEN_LIMIT_PER_DAY * 0.9 && totalTokens < TOKEN_LIMIT_PER_DAY) {
          toast({
            title: t("teacher.tokenLimit.warning") || "Token Limit Warning",
            description: `${t("teacher.tokenLimit.warningDesc") || "You have used"} ${totalTokens.toLocaleString()} / ${TOKEN_LIMIT_PER_DAY.toLocaleString()} ${t("teacher.tokenLimit.tokens") || "tokens today"}`,
            variant: "default",
          });
        }
      } else {
        setDailyTokenUsage(0);
      }
    } catch (error) {
      setDailyTokenUsage(0);
    } finally {
      setIsCheckingTokenLimit(false);
    }
  };

  // Check token usage on component mount
  useEffect(() => {
    checkDailyTokenUsage();
  }, []);

  // Clean up any existing "Original plan" versions on component mount
  useEffect(() => {
    const hasOriginalPlan = coursePlanVersions.some(v => v.title === "Original plan");
    if (hasOriginalPlan && coursePlanTitle !== "Original plan") {
      setCoursePlanVersions(prev => prev.map(v => 
        v.title === "Original plan" 
          ? { ...v, title: coursePlanTitle }
          : v
      ));
    }
  }, []); // Run once on mount

  // Update title based on planning case, but only if it's still the default title
  useEffect(() => {
    if (selectedPlanningCase) {
      // Only update title if it's still one of the default titles
      const isDefaultTitle = coursePlanTitle === "Kursplanredigering" || 
                           coursePlanTitle === "Forelesningsplanredigering" || 
                           coursePlanTitle === "Studenttilbakemeldingredigering";
      
      if (isDefaultTitle) {
      switch (selectedPlanningCase) {
        case "develop-new-course":
          setCoursePlanTitle("Kursplanredigering");
          break;
        case "revise-existing-course":
          setCoursePlanTitle("Kursplanredigering");
          break;
        case "develop-lecture-plan":
          setCoursePlanTitle("Forelesningsplanredigering");
          break;
        case "reflect-feedback":
          setCoursePlanTitle("Studenttilbakemeldingredigering");
          break;
        default:
          setCoursePlanTitle("Kursplanredigering");
      }
    }
    }
  }, [selectedPlanningCase, coursePlanTitle]);

  // Listen for course plan generation from chat and provide current content
  useEffect(() => {
    const handleCoursePlanGenerated = (event: CustomEvent) => {
      const { content } = event.detail;
      setCoursePlanContent(content);
    };

    const handleGetCurrentContent = () => {
      // Set the current content and teacher info on window object for ChatPanel to access
      (window as any).currentTextContent = coursePlanContent;
      (window as any).teacherInfo = teacherInfo;
    };

    window.addEventListener('coursePlanGenerated', handleCoursePlanGenerated as EventListener);
    window.addEventListener('getCurrentContent', handleGetCurrentContent as EventListener);
    
    return () => {
      window.removeEventListener('coursePlanGenerated', handleCoursePlanGenerated as EventListener);
      window.removeEventListener('getCurrentContent', handleGetCurrentContent as EventListener);
    };
  }, [coursePlanContent, teacherInfo]);

  const handleBack = () => {
    // Check if user came from student view
    const returnTo = searchParams.get("returnTo");
    const currentRole = getStoredRole();
    
    // If user is a student or came from student view, navigate back to student dashboard
    if ((returnTo === "student" || currentRole === "student") && 
        (selectedCategory === "ai-literacy" || selectedCategory === "prompting" || selectedCategory === "ai-tools")) {
      navigate("/ai-students");
      return;
    }
    
    if (selectedPlanningCase) {
      // Go back from sub-item to sub-category
      setSelectedPlanningCase("");
    } else if (selectedContentCreationCase) {
      // Go back from sub-item to sub-category
      setSelectedContentCreationCase("");
    } else if (selectedCategory) {
      // Go back from sub-category to main dashboard
      setSelectedCategory("");
    }
  };

  const handleSaveCoursePlan = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (selectedPlanningCase === "develop-lecture-plan") {
      const newVersion: LecturePlanVersion = {
        id: Date.now().toString(),
        title: coursePlanTitle || `Forelesningsplan v${lecturePlanVersions.length + 1}.0`,
        date: currentDate,
        content: coursePlanContent,
        coursePlanId: "selected-course-id", // This should be set when user selects a course plan
        type: 'lecture'
      };
      setLecturePlanVersions(prev => [newVersion, ...prev]);
    } else if (selectedPlanningCase === "reflect-feedback") {
      const newVersion: StudentFeedbackVersion = {
        id: Date.now().toString(),
        title: coursePlanTitle || `Studenttilbakemeldinganalyse v${studentFeedbackVersions.length + 1}.0`,
        date: currentDate,
        content: coursePlanContent,
        type: 'feedback'
      };
      setStudentFeedbackVersions(prev => [newVersion, ...prev]);
    } else {
      const newVersion: CoursePlanVersion = {
        id: Date.now().toString(),
        title: coursePlanTitle || `Kursplan v${coursePlanVersions.length + 1}.0`,
        date: currentDate,
        content: coursePlanContent,
        type: 'course'
      };
      setCoursePlanVersions(prev => [newVersion, ...prev]);
    }
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const updateSelectedVersionTitle = (newTitle: string, markChanged = false) => {
    if (!selectedVersion) {
      return;
    }
    setCoursePlanVersions(prev =>
      prev.map(v =>
        v.id === selectedVersion
          ? {
              ...v,
              title: newTitle,
              hasChanges: markChanged ? true : v.hasChanges,
            }
          : v
      )
    );
  };

  const handleTitleSave = () => {
    // Validate title - prevent generic or invalid titles
    const trimmedTitle = coursePlanTitle.trim();
    if (trimmedTitle && trimmedTitle !== "code" && trimmedTitle !== "Code" && trimmedTitle.length > 2) {
      setCoursePlanTitle(trimmedTitle);
      updateSelectedVersionTitle(trimmedTitle, true);
    } else {
      // Use a more descriptive default title
      const defaultTitle = language === "no" ? "Kursplanredigering" : 
                          language === "vi" ? "Chỉnh sửa kế hoạch khóa học" : 
                          "Course Plan Editing";
      setCoursePlanTitle(defaultTitle);
      updateSelectedVersionTitle(defaultTitle, true);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    }
  };


  const handleClearCoursePlan = () => {
    setCoursePlanContent("");
    // Clear generated content and paging when resetting the editor
    setGeneratedContent("");
    setCurrentPage(1);
    if (selectedPlanningCase === "revise-existing-course") {
      setRevisedPlanContent("");
    }
  };

  const handleExport = () => {
    // For revise case, prefer revised content if available, otherwise use input content
    const contentToExport = (selectedPlanningCase === "revise-existing-course" && revisedPlanContent.trim()) 
      ? revisedPlanContent 
      : coursePlanContent;
    
    if (!contentToExport.trim()) {
      alert(t("teacher.coursePlan.exportError"));
      return;
    }

    let content = contentToExport;
    let filename = coursePlanTitle || "kursplan";
    let mimeType = "text/plain";

    switch (exportFormat) {
      case "markdown":
        filename += ".md";
        mimeType = "text/markdown";
        break;
      case "html":
        filename += ".html";
        mimeType = "text/html";
        // Convert markdown to basic HTML
        content = content
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
          .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/gim, '<em>$1</em>')
          .replace(/\n/g, '<br>');
        break;
      case "txt":
        filename += ".txt";
        mimeType = "text/plain";
        // Remove markdown formatting
        content = content
          .replace(/#{1,6}\s+/g, '')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/`(.*?)`/g, '$1');
        break;
      case "pdf":
        // For PDF, we'll create an HTML version that can be printed to PDF
        filename += ".html";
        mimeType = "text/html";
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${coursePlanTitle}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #333; border-bottom: 2px solid #333; }
        h2 { color: #555; border-bottom: 1px solid #555; }
        h3 { color: #777; }
        strong { font-weight: bold; }
        em { font-style: italic; }
        ul, ol { margin-left: 20px; }
    </style>
</head>
<body>
    <h1>${coursePlanTitle}</h1>
    <div>${content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n/g, '<br>')}</div>
</body>
</html>`;
        content = htmlContent;
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExportDialogOpen(false);
  };

  // Pagination helpers for printable document
  const getPages = (content: string, fontSize: number, margin: number): string[] => {
    if (!content) return [];
    
    // Approximate characters per page (A4 size with margins)
    // This is a rough estimate - actual pagination would need more sophisticated calculation
    const charsPerLine = Math.floor((210 - margin * 2) / (fontSize * 0.6)); // A4 width in mm, approximate char width
    const linesPerPage = Math.floor((297 - margin * 2) / (fontSize * 1.2)); // A4 height in mm, line height
    const charsPerPage = charsPerLine * linesPerPage;
    
    const pages: string[] = [];
    const lines = content.split('\n');
    let currentPage = '';
    let currentLineCount = 0;
    
    for (const line of lines) {
      const lineLength = line.length;
      if (currentLineCount + lineLength > charsPerPage && currentPage) {
        pages.push(currentPage);
        currentPage = line + '\n';
        currentLineCount = lineLength;
      } else {
        currentPage += line + '\n';
        currentLineCount += lineLength;
      }
    }
    
    if (currentPage) {
      pages.push(currentPage);
    }
    
    return pages.length > 0 ? pages : [content];
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${coursePlanTitle}</title>
          <style>
            @page {
              size: A4;
              margin: ${margin}mm;
            }
            body {
              font-family: 'Times New Roman', serif;
              font-size: ${fontSize}pt;
              line-height: 1.6;
              margin: 0;
              padding: 0;
            }
            .page {
              page-break-after: always;
              padding: ${margin}mm;
            }
            .page:last-child {
              page-break-after: auto;
            }
            h1, h2, h3, h4, h5, h6 {
              margin-top: 1em;
              margin-bottom: 0.5em;
            }
            p {
              margin: 0.5em 0;
            }
          </style>
        </head>
        <body>
          ${getPages(generatedContent, fontSize, margin).map((page, idx) => 
            `<div class="page">${page.replace(/\n/g, '<br>')}</div>`
          ).join('')}
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleVersionSelect = (versionId: string) => {
    const version = coursePlanVersions.find(v => v.id === versionId);
    if (version) {
      // Always load content to left textarea
      setCoursePlanContent(version.content);
      setSelectedVersion(versionId);
      
      // If this is an Analysis or Revised plan, also show it in the right column
      if (version.title.startsWith("Analysis") || version.title.startsWith("Revised plan")) {
        setGeneratedContent(version.content);
        setCurrentPage(1);
      } else {
        // For original plans, clear the generated content
        setGeneratedContent("");
        setRevisedPlanContent("");
      }
      
      // If the version has "Original plan" title, update it to the current coursePlanTitle
      if (version.title === "Original plan" && coursePlanTitle !== "Original plan") {
        setCoursePlanVersions(prev => prev.map(v => 
          v.id === versionId 
            ? { ...v, title: coursePlanTitle }
            : v
        ));
        setCoursePlanTitle(coursePlanTitle);
      } else {
        setCoursePlanTitle(version.title);
      }
    }
  };

  const handleExplainMethod = () => {
    setExplainError("");
    setExplainLoading(false);
    setIsExplainOpen(true);
  };

  const renderExplainContent = () => {
    // For now, English text is provided. NO and VI will also display the same content until translations are added.
    return (
      <div className="space-y-4 text-sm leading-relaxed">
        <div>
          <h3 className="text-base font-semibold mb-1">Objective</h3>
          <p>
            The purpose of this work is to review and strengthen university course plans so that they remain relevant, fair, and ethical in an age when students and teachers use Artificial Intelligence (AI) tools such as ChatGPT.
          </p>
          <p>The main goal is to ensure that courses:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>clearly explain how AI can or cannot be used;</li>
            <li>actively teach responsible and critical AI use; and</li>
            <li>remain fair, inclusive, and pedagogically sound.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-1">How the Analysis Works</h3>
          <p>
            The method combines expert review with AI-assisted analysis to check how well a course is prepared for AI integration. It uses a structured set of guiding questions organized into eight categories:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Learning Outcomes</strong> – clarity of expectations and cognitive levels in relation to AI.</li>
            <li><strong>Teaching and Learning Activities</strong> – identifying which activities may be replaced or enhanced by AI.</li>
            <li><strong>Assessment and Examination</strong> – ensuring fairness and academic integrity when AI tools are available.</li>
            <li><strong>Policy and Transparency</strong> – checking compliance with institutional and national AI-use guidelines.</li>
            <li><strong>AI Literacy and Capacity Building</strong> – strengthening student and teacher competence in AI use.</li>
            <li><strong>Ethics, Equity, and Accessibility</strong> – ensuring fairness, inclusion, and sustainability.</li>
            <li><strong>Reading Materials</strong> – integrating relevant resources on AI literacy.</li>
            <li><strong>Meta-Layer Review</strong> – ensuring constructive alignment across all course elements.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-1">Data and References</h3>
          <p>
            The analysis is built upon a set of trusted frameworks, academic papers, and institutional guidelines that define what responsible and effective AI integration should look like in education. All documents were converted into smaller "chunks" of text, each tagged with metadata (title, organization, and URL), and stored in a searchable database.
          </p>
          <p className="font-medium mt-2">The key sources include:</p>
          <ol className="list-decimal pl-5 space-y-2 mt-1">
            <li>
              <strong>Institutional and National Frameworks</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Retningslinjer for bruk av kunstig intelligens ved eksamen og studentoppgaver — University of South-Eastern Norway (internal policy document).</li>
                <li>Norwegian Qualifications Framework for Lifelong Learning (NQF) — NOKUT, Norwegian Agency for Quality Assurance in Education. <a className="text-blue-600 underline" href="https://www.nokut.no/en/" target="_blank" rel="noreferrer">https://www.nokut.no/en/</a></li>
              </ul>
            </li>
            <li>
              <strong>AI Literacy and Competence Frameworks</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Empowering Learners for the Age of AI: An AI Literacy Framework for Primary and Secondary Education — AI Literacy Framework Consortium (2023). <a className="text-blue-600 underline" href="https://ailiteracyframework.org/" target="_blank" rel="noreferrer">https://ailiteracyframework.org/</a></li>
                <li>AI Competency Framework for Students – Chapter 4: Specifications of AI Competencies — UNESCO (2023). <a className="text-blue-600 underline" href="https://doi.org/10.54675/JKJB9835" target="_blank" rel="noreferrer">https://doi.org/10.54675/JKJB9835</a></li>
                <li>AI Competency Framework for Teachers — UNESCO (2023). <a className="text-blue-600 underline" href="https://unesdoc.unesco.org/ark:/48223/pf0000386014" target="_blank" rel="noreferrer">UNESCO Document</a></li>
              </ul>
            </li>
            <li>
              <strong>Academic Research on AI in Education</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Revisiting Learning Outcomes in the Age of Generative AI — ResearchGate Preprint (2024). <a className="text-blue-600 underline" href="https://www.researchgate.net/publication/390271445_Revisiting_Learning_Outcomes_in_the_Age_of_Generative_AI" target="_blank" rel="noreferrer">Link</a></li>
                <li>Responsible AI in Education — SSRN Preprint 4391243 (Elsevier, 2023). <a className="text-blue-600 underline" href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4391243" target="_blank" rel="noreferrer">Link</a></li>
                <li>Revisiting Assessment Design in the Age of AI — Medical Teacher (Taylor & Francis, 2025). <a className="text-blue-600 underline" href="https://doi.org/10.1080/0142159X.2025.2473606" target="_blank" rel="noreferrer">Link</a></li>
              </ul>
            </li>
            <li>
              <strong>Pedagogical and Practice-Based Sources</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Incorporating AI in Teaching: Practical Examples for Busy Instructors — Daniel Stanford (2023). <a className="text-blue-600 underline" href="https://danielstanford.substack.com/p/incorporating-ai-in-teaching-practical" target="_blank" rel="noreferrer">Link</a></li>
                <li>Tips for AI-Resistant Assessment Forms — Compiled institutional best practices (local synthesis).</li>
              </ul>
            </li>
          </ol>
          <p className="mt-2">
            Each of these sources contributes to defining what "AI-readiness" means in educational settings — from ethical principles and learning outcomes to assessment design and digital competence.
          </p>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-1">Step-by-Step Process</h3>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Collect all course-related and reference materials.</li>
            <li>Break down all documents into small, meaningful text segments with tags (source title, URL).</li>
            <li>Retrieve the most relevant segments to each question in the framework.</li>
            <li>Use AI (OpenAI GPT-4) to analyze, summarize, and interpret findings from those sources.</li>
            <li>Review and validate all AI-generated suggestions with human experts to ensure accuracy and context relevance.</li>
          </ol>
          <p className="mt-2">
            This hybrid method is called <strong>Retrieval-Augmented Generation (RAG)</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Retrieval</strong> brings verified information from local documents.</li>
            <li><strong>Generation</strong> lets the AI explain, reason, and connect this evidence to the specific course being analyzed.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-1">Outcome</h3>
          <p>The method produces:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>a clear picture of how well a course plan handles AI integration,</li>
            <li>practical recommendations for improvement, and</li>
            <li>transparent citations showing where each recommendation comes from.</li>
          </ul>
          <p className="mt-2">
            It helps universities update their courses responsibly—making them AI-aware, ethically robust, and aligned with modern learning goals in a rapidly changing digital era.
          </p>
        </div>
      </div>
    );
  };

  const openPlanningChat = (caseId: string) => {
    let instruction = "";
    
    // Create summary from Step 1 information
    const contextInfo = `
Undervisningskontekst:
- Utdanningsnivå: ${teacherInfo.educationLevel || 'Ikke spesifisert'}
- Fagområde: ${teacherInfo.subjectArea || 'Ikke spesifisert'}
- Land: ${teacherInfo.country || 'Ikke spesifisert'}
- Skoleår: ${teacherInfo.academicYear || 'Ikke spesifisert'}
- Organisasjon: ${teacherInfo.organization || 'Ikke spesifisert'}
`;

    switch (caseId) {
      case "develop-new-course":
        instruction = `${contextInfo}

Skriv så detaljert som mulig den kursplanen du ønsker, og jeg vil hjelpe deg med å opprette en komplett kursplan med læringsmål, innholdstruktur, vurderingsmetoder og tidsplan.`;
        break;
      case "revise-existing-course":
        instruction = `${contextInfo}

Vennligst lim inn din eksisterende kursplan i chatten, og fortell meg hva endringer eller forbedringer du ønsker å gjøre. Jeg vil hjelpe deg med å revidere den mens du bevarer den originale.`;
        break;
      case "align-study-program":
        instruction = `${contextInfo}

Jeg vil hjelpe deg med å justere din kursplan med studieprogramkrav. Vennligst oppgi detaljer om studieprogrammet og din nåværende kursplan.`;
        break;
      case "develop-lecture-plan":
        // Check if there are course plans available
        if (coursePlanVersions.length === 0) {
          instruction = `${contextInfo}

Jeg vil hjelpe deg med å utvikle detaljerte forelesningsplaner. Imidlertid trenger du en kursplan først. Vennligst opprett en kursplan først, eller hvis du har en eksisterende kursplan, lim den inn i chatten, og jeg vil hjelpe deg med å opprette forelesningsplaner basert på den.`;
        } else {
          instruction = `${contextInfo}

Jeg vil hjelpe deg med å utvikle detaljerte forelesningsplaner basert på dine eksisterende kursplaner. Vennligst velg hvilken kursplan du vil basere forelesningsplanen din på, eller lim inn kursplaninnholdet i chatten, og jeg vil hjelpe deg med å opprette detaljerte forelesningsplaner med læringsmål, aktiviteter og tidsplan.`;
        }
        break;
      case "reflect-feedback":
        instruction = `${contextInfo}

Jeg vil hjelpe deg med å analysere studenttilbakemeldinger og inkludere dem i din kursplanlegging. Vennligst lim inn studenttilbakemeldingene i teksteditoren først, og jeg vil hjelpe deg med å analysere dem og foreslå forbedringer i din kursplan.`;
        break;
    }
    // Determine chatbot function based on selected case
    let chatbotFunction: "create-course-plan" | "update-course-plan" | "create-lecture-plan" | "analyze-feedback" | "general" = "general";
    
    switch (caseId) {
      case "develop-new-course":
        chatbotFunction = "create-course-plan";
        break;
      case "revise-existing-course":
        chatbotFunction = "update-course-plan";
        break;
      case "develop-lecture-plan":
        chatbotFunction = "create-lecture-plan";
        break;
      case "reflect-feedback":
        chatbotFunction = "analyze-feedback";
        break;
    }
    
    openChat(instruction, chatbotFunction);
  };

  const handleAnalyzePlan = async () => {
    // Check token limit before proceeding
    if (dailyTokenUsage >= TOKEN_LIMIT_PER_DAY) {
      toast({
        title: t("teacher.tokenLimit.exceeded") || "Daily Token Limit Exceeded",
        description: t("teacher.tokenLimit.exceededDesc") || `You have reached your daily limit of ${TOKEN_LIMIT_PER_DAY.toLocaleString()} tokens. Please come back tomorrow.`,
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setValidationError(""); // Clear any previous validation errors
    const currentDate = new Date().toISOString().split('T')[0];

    try {
      // Check if there's already a version (original plan exists)
      const hasExistingVersion = coursePlanVersions.length > 0;
      // Keep a local reference to the original plan we will use for this run
      let workingOriginalPlan: CoursePlanVersion | null = null;
      
      // Check if there's an existing version with "Original plan" title that we should update
      const existingOriginalPlan = coursePlanVersions.find(v => v.title === "Original plan");
      
      if (existingOriginalPlan) {
        // Update the existing "Original plan" with the current title
        const updatedOriginal = { ...existingOriginalPlan, title: coursePlanTitle, content: coursePlanContent, date: currentDate };
        workingOriginalPlan = updatedOriginal;
        setCoursePlanVersions(prev => {
          const updated = prev.map(v => 
            v.id === existingOriginalPlan.id 
              ? updatedOriginal
              : v
          );
          return updated;
        });
      } else if (!hasExistingVersion) {
        // If no Original plan exists, check if editor has content
        if (!coursePlanContent.trim()) {
          toast({
            title: t("auth.error"),
            description: t("teacher.save.noOriginalPlan") || "Please add an original course plan before analyzing.",
            variant: "destructive",
          });
          setIsAnalyzing(false);
          return;
        }

        // Create "Original plan" file from current editor content
        const originalPlan: CoursePlanVersion = {
          id: Date.now().toString(),
          title: coursePlanTitle, // Use the current title (user's custom title or default)
          date: currentDate,
          content: coursePlanContent,
          type: 'course'
        };
        workingOriginalPlan = originalPlan;
        setCoursePlanVersions(prev => {
          const newVersions = [originalPlan, ...prev];
          return newVersions;
        });
      }

      // Find the original plan (not Analysis or Revised plan) or use the freshly created/updated one this run
      const originalPlan = workingOriginalPlan || coursePlanVersions.find(v => 
        !v.title.startsWith("Analysis") && !v.title.startsWith("Revised plan")
      ) || null;
      
      // Find existing analysis documents and get the latest one
      const analysisFiles = coursePlanVersions.filter(v => v.title.startsWith("Analysis"));
      const latestAnalysis = analysisFiles.length > 0 
        ? analysisFiles.sort((a, b) => {
            const aNum = parseInt(a.title.replace("Analysis", "").trim()) || 1;
            const bNum = parseInt(b.title.replace("Analysis", "").trim()) || 1;
            return bNum - aNum;
          })[0]
        : null;

      // Prepare content for analysis
      const originalPlanContent = originalPlan?.content || coursePlanContent;
      const previousAnalysisContent = latestAnalysis?.content || "";

      // Debug: Check language value
      // Get the current title for the API call
      let currentTitle = originalPlan?.title || coursePlanTitle;
      
      // Ensure we don't send "code" or similar generic titles
      if (currentTitle === "code" || currentTitle === "Code" || currentTitle.length < 3) {
        const defaultTitle = language === "no" ? "Kursplanredigering" : 
                            language === "vi" ? "Chỉnh sửa kế hoạch khóa học" : 
                            "Course Plan Editing";
        currentTitle = defaultTitle;
      }

      // Prepare the content to send to API
      const contentToAnalyze = latestAnalysis 
        ? `Original Plan:\n${originalPlanContent}\n\nPrevious Analysis:\n${previousAnalysisContent}`
        : originalPlanContent;
      
      // Get the latest organization from localStorage (in case it was updated in Settings)
      const currentOrganization = (() => {
        try {
          return localStorage.getItem('ai4edu_organization') || teacherInfo.organization || "";
        } catch {
          return teacherInfo.organization || "";
        }
      })();

      // Get education level from organization name
      const educationLevel = getEducationLevelFromOrganization(currentOrganization, organizationOptions);

      // Set default values for required fields
      const subjectArea = teacherInfo.subjectArea || "General";
      const academicYear = teacherInfo.academicYear || "2025-2026";
      // Set country based on language: English/Norwegian -> Norway, Vietnamese -> Vietnam
      const country = teacherInfo.country || (language === "vi" ? "Vietnam" : "Norway");

      console.log('🔵 [Analyze Course Plan] Request Body:', {
        message: latestAnalysis 
          ? "Analyze this course plan and provide updated feedback based on the previous analysis."
          : "Analyze this course plan and provide detailed feedback.",
        context: {
          currentContent: contentToAnalyze.substring(0, 100) + "...", // Log first 100 chars
          searchAIApplications: currentTitle,
          userName: (() => { try { return localStorage.getItem('ai4edu_user') || 'Guest'; } catch { return 'Guest'; } })(),
          teacherInfo: {
            educationLevel: educationLevel,
            subjectArea: subjectArea,
            country: country,
            academicYear: academicYear,
            organization: currentOrganization,
            language: language === "no" ? "Norwegian" : language === "vi" ? "Vietnamese" : "English"
          }
        }
      });

      // Send directly to backend without chatbot
      const analysisResponse = await fetch(API_ENDPOINTS.chatbot.analyzeCoursePlan, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: latestAnalysis 
            ? "Analyze this course plan and provide updated feedback based on the previous analysis."
            : "Analyze this course plan and provide detailed feedback.",
          context: {
            currentContent: contentToAnalyze,
            searchAIApplications: currentTitle, // Pass the current title to the API
            userName: (() => { try { return localStorage.getItem('ai4edu_user') || 'Guest'; } catch { return 'Guest'; } })(),
            teacherInfo: {
              educationLevel: educationLevel, // Get from organization name
              subjectArea: subjectArea, // Default to "General" if empty
              country: country, // Default based on language: vi -> Vietnam, else -> Norway
              academicYear: academicYear, // Default to "2025-2026" if empty
              organization: currentOrganization, // Use latest from localStorage
              language: language === "no" ? "Norwegian" : language === "vi" ? "Vietnamese" : "English"
            }
          }
        })
      });

      if (!analysisResponse.ok) {
        let errorDetails: any = null;
        try {
          const rawText = await analysisResponse.text();
          try {
            errorDetails = JSON.parse(rawText);
          } catch {
            errorDetails = { rawText };
          }
        } catch {
          errorDetails = { message: 'Failed to read error response' };
        }
        
        console.error('❌ [Analyze Course Plan] HTTP Error:', analysisResponse.status, analysisResponse.statusText);
        console.error('❌ [Analyze Course Plan] Error Details:', errorDetails);
        
        const errorMessage = errorDetails?.message || errorDetails?.error || `Failed to analyze plan (HTTP ${analysisResponse.status})`;
        throw new Error(errorMessage);
      }

      const analysisData = await analysisResponse.json();
      const analysisContent = analysisData.response;

      // Update daily token usage
      if (analysisData.usageInternal) {
        const tokensUsed = analysisData.usageInternal.total || 
                          (analysisData.usageInternal.prompt || 0) + (analysisData.usageInternal.completion || 0);
        if (tokensUsed > 0) {
          const newTotal = dailyTokenUsage + tokensUsed;
          setDailyTokenUsage(newTotal);
          
          // Show token usage notification
          toast({
            title: t("teacher.tokenLimit.usageUpdate") || "Token Usage",
            description: `${t("teacher.tokenLimit.thisAction") || "This action:"} ${tokensUsed.toLocaleString()} tokens\n${t("teacher.tokenLimit.todayTotal") || "Today's total:"} ${newTotal.toLocaleString()} / ${TOKEN_LIMIT_PER_DAY.toLocaleString()}`,
            variant: newTotal >= TOKEN_LIMIT_PER_DAY ? "destructive" : "default",
          });
        }
      }

      // Count existing Analysis files to create numbered version
      const existingAnalyses = coursePlanVersions.filter(v => v.title.startsWith("Analysis"));
      const analysisNumber = existingAnalyses.length + 1;
      const analysisTitle = analysisNumber === 1 ? "Analysis" : `Analysis ${analysisNumber}`;

      // Auto-create numbered "Analysis" file in Versjoner list
      const analysisPlan: CoursePlanVersion = {
        id: Date.now().toString(),
        title: analysisTitle,
        date: currentDate,
        content: analysisContent,
        type: 'course'
      };
      setCoursePlanVersions(prev => [analysisPlan, ...prev]);
      
      // Display analysis in the right column (generated area)
      setGeneratedContent(analysisContent);
      setCurrentPage(1); // Reset to first page
    } catch (error) {
      console.error('Error analyzing plan:', error);
      alert('Failed to analyze plan. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRevisePlan = async () => {
    // Check token limit before proceeding
    if (dailyTokenUsage >= TOKEN_LIMIT_PER_DAY) {
      toast({
        title: t("teacher.tokenLimit.exceeded") || "Daily Token Limit Exceeded",
        description: t("teacher.tokenLimit.exceededDesc") || `You have reached your daily limit of ${TOKEN_LIMIT_PER_DAY.toLocaleString()} tokens. Please come back tomorrow.`,
        variant: "destructive",
      });
      return;
    }

    setIsRevising(true);
    const currentDate = new Date().toISOString().split('T')[0];
    
    try {
    if (coursePlanVersions.length === 0) {
      toast({
        title: t("auth.error"),
        description: t("teacher.save.noOriginalPlan") || "Please add an original course plan before revising.",
        variant: "destructive",
      });
      return;
    }

      const analysisFiles = coursePlanVersions.filter(v => v.title.startsWith("Analysis"));
      if (analysisFiles.length === 0) {
      toast({
        title: t("auth.error"),
        description: t("teacher.error.analyzeFirst") || "Please analyze the course plan before revising.",
        variant: "destructive",
      });
      return;
    }

      // Get the content to use for revision - find the original plan (not Analysis or Revised)
      const originalPlan = coursePlanVersions.find(v => 
        !v.title.startsWith("Analysis") && !v.title.startsWith("Revised plan")
      );
      const originalContent = originalPlan?.content || "";
      let courseName = originalPlan?.title || "Original plan";
      
      // Ensure we don't send "code" or similar generic titles
      if (courseName === "code" || courseName === "Code" || courseName.length < 3) {
        const defaultTitle = language === "no" ? "Kursplanredigering" : 
                            language === "vi" ? "Chỉnh sửa kế hoạch khóa học" : 
                            "Course Plan Editing";
        courseName = defaultTitle;
      }
      
      // Use currently selected Analysis if it's an Analysis file, otherwise use the latest Analysis
      let analysisToUse;
      if (selectedVersion && coursePlanVersions.find(v => v.id === selectedVersion)?.title.startsWith("Analysis")) {
        analysisToUse = coursePlanVersions.find(v => v.id === selectedVersion);
      } else {
        // Use the most recent Analysis (highest number if multiple)
        analysisToUse = analysisFiles.sort((a, b) => {
          const aNum = parseInt(a.title.replace("Analysis", "").trim()) || 1;
          const bNum = parseInt(b.title.replace("Analysis", "").trim()) || 1;
          return bNum - aNum;
        })[0];
      }
      
      const analysisContent = analysisToUse?.content || "";

      // Get the latest organization from localStorage (in case it was updated in Settings)
      const currentOrganization = (() => {
        try {
          return localStorage.getItem('ai4edu_organization') || teacherInfo.organization || "";
        } catch {
          return teacherInfo.organization || "";
        }
      })();

      // Get education level from organization name
      const educationLevel = getEducationLevelFromOrganization(currentOrganization, organizationOptions);

      // Set default values for required fields
      const subjectArea = teacherInfo.subjectArea || "General";
      const academicYear = teacherInfo.academicYear || "2025-2026";
      // Set country based on language: English/Norwegian -> Norway, Vietnamese -> Vietnam
      const country = teacherInfo.country || (language === "vi" ? "Vietnam" : "Norway");

      console.log('🔵 [Revise Course Plan] Request Body:', {
        message: "Generate a revised course plan based on the following analysis and original plan.",
        context: {
          currentContent: `Original Plan:\n${originalContent.substring(0, 100)}...\n\nAnalysis:\n${analysisContent.substring(0, 100)}...`,
          searchAIApplications: courseName,
          userName: (() => { try { return localStorage.getItem('ai4edu_user') || 'Guest'; } catch { return 'Guest'; } })(),
          teacherInfo: {
            educationLevel: educationLevel,
            subjectArea: subjectArea,
            country: country,
            academicYear: academicYear,
            organization: currentOrganization,
            language: language === "no" ? "Norwegian" : language === "vi" ? "Vietnamese" : "English"
          }
        }
      });

      const revisionResponse = await fetch(API_ENDPOINTS.chatbot.reviseCoursePlan, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: "Generate a revised course plan based on the following analysis and original plan.",
          context: {
            currentContent: `Original Plan:\n${originalContent}\n\nAnalysis:\n${analysisContent}`,
            searchAIApplications: courseName,
            userName: (() => { try { return localStorage.getItem('ai4edu_user') || 'Guest'; } catch { return 'Guest'; } })(),
            teacherInfo: {
              educationLevel: educationLevel, // Get from organization name
              subjectArea: subjectArea, // Default to "General" if empty
              country: country, // Default based on language: vi -> Vietnam, else -> Norway
              academicYear: academicYear, // Default to "2025-2026" if empty
              organization: currentOrganization, // Use latest from localStorage
              language: language === "no" ? "Norwegian" : language === "vi" ? "Vietnamese" : "English"
            }
          }
        })
      });

      if (!revisionResponse.ok) {
        let errorDetails: any = null;
        try {
          const rawText = await revisionResponse.text();
          try {
            errorDetails = JSON.parse(rawText);
          } catch {
            errorDetails = { rawText };
          }
        } catch {
          errorDetails = { message: 'Failed to read error response' };
        }
        
        console.error('❌ [Revise Course Plan] HTTP Error:', revisionResponse.status, revisionResponse.statusText);
        console.error('❌ [Revise Course Plan] Error Details:', errorDetails);
        
        const errorMessage = errorDetails?.message || errorDetails?.error || `Failed to revise plan (HTTP ${revisionResponse.status})`;
        throw new Error(errorMessage);
      }

      const revisionData = await revisionResponse.json();
      const revisionContent = revisionData.response;

      // Update daily token usage
      if (revisionData.usageInternal) {
        const tokensUsed = revisionData.usageInternal.total || 
                          (revisionData.usageInternal.prompt || 0) + (revisionData.usageInternal.completion || 0);
        if (tokensUsed > 0) {
          const newTotal = dailyTokenUsage + tokensUsed;
          setDailyTokenUsage(newTotal);
          
          // Show token usage notification
          toast({
            title: t("teacher.tokenLimit.usageUpdate") || "Token Usage",
            description: `${t("teacher.tokenLimit.thisAction") || "This action:"} ${tokensUsed.toLocaleString()} tokens\n${t("teacher.tokenLimit.todayTotal") || "Today's total:"} ${newTotal.toLocaleString()} / ${TOKEN_LIMIT_PER_DAY.toLocaleString()}`,
            variant: newTotal >= TOKEN_LIMIT_PER_DAY ? "destructive" : "default",
          });
        }
      }

      // Count existing Revised plan files to create numbered version
      const existingRevised = coursePlanVersions.filter(v => v.title.startsWith("Revised plan"));
      const revisedNumber = existingRevised.length + 1;
      const revisedTitle = revisedNumber === 1 ? "Revised plan" : `Revised plan ${revisedNumber}`;

      // Auto-create numbered "Revised plan" file in Versjoner list
      const revisedPlan: CoursePlanVersion = {
        id: Date.now().toString(),
        title: revisedTitle,
        date: currentDate,
        content: revisionContent,
        type: 'course'
      };
      setCoursePlanVersions(prev => [revisedPlan, ...prev]);
      
      // Display revised plan in the right column (generated area)
      setGeneratedContent(revisionContent);
      setRevisedPlanContent(revisionContent);
      setCurrentPage(1); // Reset to first page
    } catch (error) {
      console.error('Error revising plan:', error);
      alert('Failed to revise plan. Please try again.');
    } finally {
      setIsRevising(false);
    }
  };

  // Load saved documents from backend - loads most recent session
  const loadSavedDocuments = async () => {
    setIsLoadingDocuments(true);
    
    try {
      const userName = (() => { 
        try { 
          return localStorage.getItem('ai4edu_user') || 'Guest'; 
        } catch { 
          return 'Guest'; 
        } 
      })();

      const organizationKeyRaw = teacherInfo.organization?.trim();
      const organizationQuery = organizationKeyRaw ? `&organization=${encodeURIComponent(organizationKeyRaw)}` : "";

      const response = await fetch(
        `${API_ENDPOINTS.coursePlanDocs.list}?userName=${encodeURIComponent(userName)}${organizationQuery}&sortBy=createdAt&sortOrder=desc&limit=200`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load documents');
      }

      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        const organizationKey = (organizationKeyRaw || "").toLowerCase();

        const matchingDocuments = data.data.filter((doc: any) => {
          const docUserName = (doc.userName || "").toLowerCase();
          const docOrg = (doc.teacherInfo?.organization || "").trim().toLowerCase();
          const userMatches = docUserName === userName.toLowerCase();
          const orgMatches = organizationKey ? docOrg === organizationKey : !docOrg;
          return userMatches && orgMatches;
        });

        if (matchingDocuments.length === 0) {
          toast({
            title: t("teacher.load.noDocuments") || "No documents",
            description: t("teacher.load.noDocumentsDesc") || "No saved documents found",
          });
          return;
        }

        const loadedVersions: CoursePlanVersion[] = matchingDocuments.map((doc: any) => ({
          id: doc._id,
          title: doc.title || doc.coursePlanName || "Document",
          date: new Date(doc.createdAt).toISOString().split('T')[0],
          content: doc.content,
          type: 'course' as const,
          savedDocumentId: doc._id,
          hasChanges: false,
          createdAt: new Date(doc.createdAt).getTime()  // Store timestamp for sorting
        }));
        
        // Sort by createdAt timestamp - most recent first
        loadedVersions.sort((a: any, b: any) => b.createdAt - a.createdAt);
        
        setCoursePlanVersions(loadedVersions);

        const firstDoc = matchingDocuments[0];

        if (loadedVersions.length > 0) {
          setCoursePlanContent(loadedVersions[0].content);
          setCoursePlanTitle(firstDoc.coursePlanName || loadedVersions[0].title || "Loaded Course Plan");
          setSelectedVersion(loadedVersions[0].id);
        }

        if (firstDoc.teacherInfo) {
          setTeacherInfo({
            educationLevel: firstDoc.teacherInfo.educationLevel || "",
            subjectArea: firstDoc.teacherInfo.subjectArea || "",
            country: firstDoc.teacherInfo.country || "",
            academicYear: firstDoc.teacherInfo.academicYear || "",
            organization: firstDoc.teacherInfo.organization || organizationKeyRaw || ""
          });
        }

        if (firstDoc.sessionId) {
          setSessionId(firstDoc.sessionId);
        }

        toast({
          title: t("teacher.load.success") || "Loaded",
          description: `${t("teacher.load.loadedSession") || "Loaded"} ${loadedVersions.length} ${t("teacher.load.documentsFound") || "documents"}`,
        });
      } else {
        toast({
          title: t("teacher.load.noDocuments") || "No documents",
          description: t("teacher.load.noDocumentsDesc") || "No saved documents found",
        });
      }
    } catch (error) {
      console.error('[Load] Error:', error);
      toast({
        title: t("auth.error"),
        description: error instanceof Error ? error.message : (t("teacher.load.error") || "Failed to load documents"),
        variant: "destructive",
      });
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // This function is now replaced by clicking on versions in the Versjoner list
  // The handleVersionSelect function below handles loading document content into editor

  const handleSaveCoursePlanDocument = async () => {
    setIsSavingDocument(true);
    
    try {
      // If no versions exist but there's content in the editor, create one
      if (coursePlanVersions.length === 0 && coursePlanContent.trim()) {
        const currentDate = new Date().toISOString().split('T')[0];
        const originalPlan: CoursePlanVersion = {
          id: `original-${Date.now()}`,
          title: coursePlanTitle || "Course Plan",
          date: currentDate,
          content: coursePlanContent,
          type: 'course',
          hasChanges: true
        };
        setCoursePlanVersions([originalPlan]);
      }
      
      if (coursePlanVersions.length === 0) {
        toast({
          title: t("auth.error"),
          description: t("teacher.save.noOriginalPlan") || "No content to save. Please create a course plan first.",
          variant: "destructive",
        });
        setIsSavingDocument(false);
        return;
      }

      // Get username from localStorage
      const userName = (() => { 
        try { 
          return localStorage.getItem('ai4edu_user') || 'Guest'; 
        } catch { 
          return 'Guest'; 
        } 
      })();


      // Helper function to determine version type
      const getVersionType = (title: string): string => {
        if (title.startsWith("Analysis")) return "analysis";
        if (title.startsWith("Revised plan")) return "revision";
        return "original";
      };

      // Helper function to extract version number
      const getVersionNumber = (title: string, versionType: string): number => {
        if (versionType === "original") return 1;
        const match = title.match(/\d+/);
        return match ? parseInt(match[0]) : 1;
      };

      // Save or update each version individually
      const saveResults = [];
      const updatedVersions = [...coursePlanVersions];

      for (let i = 0; i < coursePlanVersions.length; i++) {
        const version = coursePlanVersions[i];
        const versionType = getVersionType(version.title);
        const versionNumber = getVersionNumber(version.title, versionType);

        // Skip if already saved and no changes
        if (version.savedDocumentId && !version.hasChanges) {
          saveResults.push({ success: true, skipped: true, title: version.title });
          continue;
        }

        // Get the latest organization from localStorage (in case it was updated in Settings)
        const currentOrganization = (() => {
          try {
            return localStorage.getItem('ai4edu_organization') || teacherInfo.organization || "";
          } catch {
            return teacherInfo.organization || "";
          }
        })();

        // Get education level from organization name
        const educationLevel = getEducationLevelFromOrganization(currentOrganization, organizationOptions);

        // Set default values for required fields
        const subjectArea = teacherInfo.subjectArea || "General";
        const academicYear = teacherInfo.academicYear || "2025-2026";
        // Set country based on language: English/Norwegian -> Norway, Vietnamese -> Vietnam
        const country = teacherInfo.country || (language === "vi" ? "Vietnam" : "Norway");

        // Prepare document
        const documentToSave = {
          coursePlanName: coursePlanTitle,
          sessionId: sessionId,
          versionType: versionType,
          versionNumber: versionNumber,
          title: version.title,
          content: version.content,
          teacherInfo: {
            educationLevel: educationLevel, // Get from organization name
            subjectArea: subjectArea, // Default to "General" if empty
            country: country, // Default based on language: vi -> Vietnam, else -> Norway
            academicYear: academicYear, // Default to "2025-2026" if empty
            organization: currentOrganization, // Use latest from localStorage
            language: language === "no" ? "Norwegian" : language === "vi" ? "Vietnamese" : "English"
          },
          userName: userName,
          createdAt: version.date,
          tags: ["AI4EDU", teacherInfo.subjectArea, teacherInfo.academicYear].filter(Boolean),
          metadata: {
            notes: `Created via AI Teacher workflow - ${selectedPlanningCase}`,
            frontend_version_id: version.id
          }
        };

        // Determine endpoint and method
        const endpoint = version.savedDocumentId 
          ? API_ENDPOINTS.coursePlanDocs.update(version.savedDocumentId)
          : API_ENDPOINTS.coursePlanDocs.create;
        
        const method = version.savedDocumentId ? 'PATCH' : 'POST';

        try {
          const response = await fetch(endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(documentToSave)
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error(`[Save] Error saving ${version.title}:`, errorData);
            throw new Error(errorData.message || `Failed to save ${version.title}`);
          }

          const data = await response.json();

          // Update the version with saved document ID
          if (data.documentId || data.data?._id) {
            const docId = data.documentId || data.data._id;
            updatedVersions[i] = {
              ...updatedVersions[i],
              savedDocumentId: docId,
              hasChanges: false
            };
          }

          saveResults.push({ 
            success: true, 
            title: version.title, 
            method: method 
          });

        } catch (error) {
          console.error(`[Save] Error saving ${version.title}:`, error);
          saveResults.push({ 
            success: false, 
            title: version.title, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      // Update the versions array with saved document IDs
      setCoursePlanVersions(updatedVersions);

      // Show summary toast
      const successCount = saveResults.filter(r => r.success).length;
      const failCount = saveResults.filter(r => !r.success).length;
      const skippedCount = saveResults.filter(r => r.skipped).length;

      if (failCount > 0) {
        toast({
          title: t("auth.error"),
          description: `Saved ${successCount} documents, ${failCount} failed`,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("teacher.save.success") || "Success",
          description: `${successCount} ${t("teacher.save.documentsSaved") || "documents saved"}${skippedCount > 0 ? ` (${skippedCount} unchanged)` : ''}`,
        });
      }
      
    } catch (error) {
      console.error('[Save] Error:', error);
      toast({
        title: t("auth.error"),
        description: error instanceof Error ? error.message : (t("teacher.save.error") || "Failed to save document"),
        variant: "destructive",
      });
    } finally {
      setIsSavingDocument(false);
    }
  };

  const handleDeleteVersion = async () => {
    if (!selectedVersion) {
      toast({
        title: t("auth.error"),
        description: t("teacher.load.noDocuments") || "No document selected.",
        variant: "destructive",
      });
      return;
    }

    const versionToDelete = coursePlanVersions.find(v => v.id === selectedVersion);
    if (!versionToDelete) {
      toast({
        title: t("auth.error"),
        description: t("teacher.load.noDocumentsDesc") || "Selected document was not found.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Er du sikker på at du vil slette "${versionToDelete.title}"?`)) {
      return;
    }

    try {
      if (versionToDelete.savedDocumentId) {
        const response = await fetch(API_ENDPOINTS.coursePlanDocs.delete(versionToDelete.savedDocumentId), {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.message || 'Failed to delete document');
        }
      }

      setCoursePlanVersions(prev => prev.filter(v => v.id !== selectedVersion));
      setSelectedVersion("");
      setCoursePlanContent("");

      toast({
        title: t("teacher.delete.success") || "Document deleted.",
      });
    } catch (error) {
      toast({
        title: t("auth.error"),
        description: error instanceof Error ? error.message : (t("teacher.save.error") || "Failed to delete document"),
        variant: "destructive",
      });
    }
  };

  const selectedVersionData = useMemo(() => coursePlanVersions.find(v => v.id === selectedVersion), [coursePlanVersions, selectedVersion]);

  // Organization options for dropdown
  const organizationOptions = useMemo(() => [
    ...(allowedCountry === 'norway' || allowedCountry === 'all' ? [
      { value: "OsloMet – storbyuniversitetet (OsloMet)", label: "OsloMet – storbyuniversitetet", short: "OsloMet", country: "norway", educationLevel: "university" },
      { value: "Universitetet i Sørøst-Norge (USN)", label: "Universitetet i Sørøst-Norge", short: "USN", country: "norway", educationLevel: "university" },
      { value: "Norges teknisk-naturvitenskapelige universitet (NTNU)", label: "Norges teknisk-naturvitenskapelige universitet", short: "NTNU", country: "norway", educationLevel: "university" },
      { value: "Asker International School", label: "Asker International School", short: "AIS", country: "norway", educationLevel: "primary" },
    ] : []),
    ...(allowedCountry === 'vietnam' || allowedCountry === 'all' ? [
      { value: "UTC - Trường Đại học Giao thông Vận tải", label: "Trường Đại học Giao thông Vận tải", short: "UTC", country: "vietnam", educationLevel: "university" },
      { value: "VNU - Trường Đại học Công nghệ, ĐHQGHN (UET)", label: "VNU - Trường Đại học Công nghệ, ĐHQGHN", short: "VNU-UET", country: "vietnam", educationLevel: "university" },
    ] : []),
  ], [allowedCountry]);

  // Default organization based on language
  const defaultOrg = useMemo(() => {
    return language === 'no' ? "Universitetet i Sørøst-Norge (USN)" : organizationOptions[0]?.value || "";
  }, [language, organizationOptions]);

  // Initialize teacherInfo with default organization if not set
  useEffect(() => {
    if (!teacherInfo.organization && defaultOrg) {
      const selectedOrg = organizationOptions.find(org => org.value === defaultOrg);
      if (selectedOrg) {
        const storedAcademicYear = localStorage.getItem('ai4edu_academicYear') || "2025-2026";
        const newTeacherInfo = {
          educationLevel: selectedOrg.educationLevel,
          subjectArea: "General",
          country: selectedOrg.country,
          academicYear: storedAcademicYear,
          organization: selectedOrg.value
        };
        setTeacherInfo(newTeacherInfo);
        // Store in localStorage for Settings page
        try {
          localStorage.setItem('ai4edu_organization', selectedOrg.value);
        } catch (e) {
          console.error('Failed to save organization to localStorage:', e);
        }
      }
    } else if (teacherInfo.organization) {
      // Sync to localStorage if organization is already set
      try {
        localStorage.setItem('ai4edu_organization', teacherInfo.organization);
      } catch (e) {
        console.error('Failed to save organization to localStorage:', e);
      }
    }
  }, [defaultOrg, organizationOptions, teacherInfo.organization]);

  // Sync organization from localStorage to teacherInfo when it changes (e.g., from Settings page)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedOrg = localStorage.getItem('ai4edu_organization');
        const storedAcademicYear = localStorage.getItem('ai4edu_academicYear');
        if (storedOrg && storedOrg !== teacherInfo.organization) {
          setTeacherInfo(prev => ({
            ...prev,
            organization: storedOrg
          }));
        }
        if (storedAcademicYear && storedAcademicYear !== teacherInfo.academicYear) {
          setTeacherInfo(prev => ({
            ...prev,
            academicYear: storedAcademicYear
          }));
        }
      } catch (e) {
        console.error('Failed to sync organization/academicYear from localStorage:', e);
      }
    };

    // Check on mount and listen for storage events
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically (in case localStorage was changed in the same window)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [teacherInfo.organization, teacherInfo.academicYear]);

  const handleOrganizationChange = (orgValue: string) => {
    const selectedOrg = organizationOptions.find(org => org.value === orgValue);
    if (selectedOrg) {
      const storedAcademicYear = localStorage.getItem('ai4edu_academicYear') || "2025-2026";
      const newTeacherInfo = {
        educationLevel: selectedOrg.educationLevel,
        subjectArea: "General",
        country: selectedOrg.country,
        academicYear: storedAcademicYear,
        organization: selectedOrg.value
      };
      setTeacherInfo(newTeacherInfo);
      // Store in localStorage for Settings page
      try {
        localStorage.setItem('ai4edu_organization', selectedOrg.value);
      } catch (e) {
        console.error('Failed to save organization to localStorage:', e);
      }
      // Don't auto-advance steps - this is just for context
    }
  };

  return (
      <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="max-w-6xl mx-auto">
        {/* Main Dashboard - shown when no category is selected */}
        {!selectedCategory && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflowCategories.map((category) => (
                <Card 
                  key={category.id}
                  className={`hover:shadow-lg transition-all cursor-pointer hover:scale-105 h-full ${
                    category.enabled ? 'hover:border-primary' : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => category.enabled && setSelectedCategory(category.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 rounded-full bg-secondary">
                        <category.icon className="h-12 w-12 text-primary" />
                    </div>
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-base">
                      {category.description}
                    </CardDescription>
                    {!category.enabled && (
                      <p className="text-sm text-muted-foreground mt-2">Kommer snart</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Content Creation Cases - Sub-category dashboard */}
        {selectedCategory === "content-creation" && !selectedContentCreationCase && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Content Creation</CardTitle>
                <CardDescription>Select the content creation task you want to work with</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contentCreationCases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 h-full hover:border-primary"
                  onClick={() => setSelectedContentCreationCase(caseItem.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{caseItem.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-base">
                      {caseItem.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack}>
                {t("teacher.editor.back")}
              </Button>
            </div>
          </div>
        )}

        {/* Planning Cases - Sub-category dashboard */}
        {selectedCategory === "planning" && !selectedPlanningCase && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>{t("teacher.planning.workflowTitle")}</CardTitle>
                <CardDescription>{t("teacher.planning.selectTask")}</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {planningCases.map((planCase) => {
                const isDisabled = planCase.id !== "revise-existing-course";
                return (
                <Card 
                  key={planCase.id}
                    className={`transition-all h-full ${
                      isDisabled 
                        ? "opacity-50 cursor-not-allowed" 
                        : "hover:shadow-lg cursor-pointer hover:scale-105 hover:border-primary"
                    }`}
                    onClick={() => !isDisabled && setSelectedPlanningCase(planCase.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                        <div className={`p-4 rounded-full ${isDisabled ? "bg-gray-200" : "bg-secondary"}`}>
                          <BookOpen className={`h-12 w-12 ${isDisabled ? "text-gray-400" : "text-primary"}`} />
                    </div>
                    </div>
                      <CardTitle className={`text-xl ${isDisabled ? "text-gray-500" : ""}`}>{planCase.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                      <CardDescription className={`text-base ${isDisabled ? "text-gray-400" : ""}`}>
                      {planCase.description}
                    </CardDescription>
                  </CardContent>
                </Card>
                );
              })}
                </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack}>
                Tilbake
              </Button>
            </div>
          </div>
        )}

        {/* AI Literacy - Sub-category dashboard */}
        {selectedCategory === "ai-literacy" && (
          <AILiteracyCourse onBack={handleBack} />
        )}

        {/* Assessment - Sub-category dashboard */}
        {selectedCategory === "assessment" && (
          <Assessment
            teacherInfo={teacherInfo}
            onBack={handleBack}
          />
        )}

        {/* Prompting - Sub-category dashboard */}
        {selectedCategory === "prompting" && (
          <Prompting onBack={handleBack} />
        )}

        {/* AI Tools - Sub-category dashboard */}
        {selectedCategory === "ai-tools" && (
          <AITools onBack={handleBack} />
        )}

        {/* Content Creation - Sub-item screen */}
        {selectedContentCreationCase === "quiz-creation" && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>{t("contentCreation.quizCreation.title")}</CardTitle>
                <CardDescription>{t("contentCreation.quizCreation.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Quiz creation feature coming soon...</p>
              </CardContent>
            </Card>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack}>
                {t("teacher.editor.back")}
              </Button>
            </div>
          </div>
        )}

        {selectedContentCreationCase === "worksheet-creation" && (
          <Worksheet onBack={handleBack} />
        )}

        {/* Course Plan Revision - Two Column Layout */}
        {selectedPlanningCase === "revise-existing-course" && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>{t("teacher.step4.reviseExistingCourse")}</CardTitle>
                <CardDescription>{t("teacher.step4.reviseExistingCourse.desc")}</CardDescription>
              </CardHeader>
            </Card>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column: File History, Text Area, and Generation Button */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Course Plan Input</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-4">
                  {/* File History Tree */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">{t("teacher.coursePlan.versions")}</Label>
                    <div className="border rounded-lg p-2 max-h-48 overflow-y-auto space-y-1">
                      {coursePlanVersions.map((version) => (
                        <div
                          key={version.id}
                          className={`p-2 border rounded cursor-pointer hover:bg-secondary transition-colors ${
                            selectedVersion === version.id ? 'bg-primary text-primary-foreground' : ''
                          }`}
                          onClick={() => handleVersionSelect(version.id)}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{version.title}</p>
                              <p className="text-xs opacity-70">{version.date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Toolbar */}
                  <div className="flex gap-2 flex-wrap border-b pb-3">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleExplainMethod}
                      disabled={isAnalyzing || isRevising || isSavingDocument}
                      title={t("teacher.explain.button")}
                      className="h-8 w-8"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="bg-green-600 hover:bg-green-700 text-white h-8 w-8"
                      onClick={handleAnalyzePlan}
                      disabled={isAnalyzing || isRevising || isSavingDocument}
                      title={isAnalyzing ? t("teacher.coursePlan.analyzing") : t("teacher.coursePlan.analyze")}
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      className="bg-blue-600 hover:bg-blue-700 text-white h-8 w-8"
                      onClick={handleRevisePlan}
                      disabled={!coursePlanContent.trim() || isAnalyzing || isRevising || isSavingDocument}
                      title={isRevising ? t("teacher.coursePlan.revising") : t("teacher.coursePlan.revise")}
                    >
                      {isRevising ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleClearCoursePlan}
                      className="h-8 w-8"
                      title={t("teacher.coursePlan.clear")}
                    >
                      <Eraser className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setIsExportDialogOpen(true)}
                      className="h-8 w-8"
                      title={t("teacher.coursePlan.export")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {selectedVersion && (
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={handleDeleteVersion}
                        disabled={isAnalyzing || isRevising}
                        className="h-8 w-8"
                        title="Slett versjon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Big Text Area */}
                  <div className="flex-1 flex flex-col space-y-2">
                    <Label htmlFor="course-plan-input">Paste Course Plan</Label>
                    <Textarea
                      id="course-plan-input"
                      value={coursePlanContent}
                      onChange={(e) => {
                        setCoursePlanContent(e.target.value);
                        if (validationError) {
                          setValidationError("");
                        }
                      }}
                      placeholder="Paste your course plan here..."
                      className="flex-1 min-h-[300px] font-mono text-sm"
                    />
                  </div>

                  {/* Character Count & Token Usage */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Characters: {coursePlanContent.length.toLocaleString()} / 20,000</span>
                      <span>Tokens: {dailyTokenUsage.toLocaleString()} / {TOKEN_LIMIT_PER_DAY.toLocaleString()}</span>
                    </div>
                    {validationError && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                        {validationError}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Generated Area */}
              <Card className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Area</CardTitle>
                    {generatedContent && (
                      <div className="flex gap-2">
                        {/* Print Toolbar */}
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={handlePrint}
                          className="h-8 w-8"
                          title="Print"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1 border rounded px-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                            className="h-7 w-7"
                            title="Decrease font size"
                          >
                            <ZoomOut className="h-3 w-3" />
                          </Button>
                          <span className="text-xs px-2 min-w-[3rem] text-center">{fontSize}pt</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                            className="h-7 w-7"
                            title="Increase font size"
                          >
                            <ZoomIn className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1 border rounded px-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setMargin(Math.max(10, margin - 5))}
                            className="h-7 w-7"
                            title="Decrease margin"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs px-2 min-w-[3rem] text-center">{margin}mm</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setMargin(Math.min(60, margin + 5))}
                            className="h-7 w-7"
                            title="Increase margin"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          size="icon"
                          className="bg-purple-600 hover:bg-purple-700 text-white h-8 w-8"
                          onClick={handleSaveCoursePlanDocument}
                          disabled={isAnalyzing || isRevising || isSavingDocument}
                          title={isSavingDocument
                            ? (t("teacher.save.saving") || "Saving...")
                            : (selectedVersionData?.savedDocumentId
                                ? (t("teacher.save.update") || "Update")
                                : (t("teacher.save.button") || "Save"))}
                        >
                          {isSavingDocument ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          className="bg-orange-600 hover:bg-orange-700 text-white h-8 w-8"
                          onClick={async () => {
                            await loadSavedDocuments();
                          }}
                          disabled={isAnalyzing || isRevising || isSavingDocument || isLoadingDocuments}
                          title={t("teacher.load.button") || "Load"}
                        >
                          {isLoadingDocuments ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FolderOpen className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {generatedContent ? (
                    <div className="flex-1 flex flex-col transition-all duration-300">
                      {/* Pagination Controls */}
                      {(() => {
                        const pages = getPages(generatedContent, fontSize, margin);
                        const totalPages = pages.length;
                        const currentPageContent = pages[currentPage - 1] || generatedContent;
                        
                        return (
                          <>
                            {totalPages > 1 && (
                              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                  >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                  </Button>
                                  <span className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                  >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {/* Printable Document View */}
                            <div 
                              className="flex-1 bg-white border rounded-lg shadow-sm overflow-auto"
                              style={{
                                fontFamily: "'Times New Roman', serif",
                                fontSize: `${fontSize}pt`,
                                lineHeight: 1.6,
                                padding: `${margin}px`,
                              }}
                            >
                              <div className="prose prose-sm max-w-none">
                                <MDEditor.Markdown source={currentPageContent} />
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center bg-card rounded-lg border border-border/50 p-8 min-h-[400px] transition-opacity duration-300">
                      <div className="text-center text-muted-foreground">
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p>Generated content will appear here</p>
                        <p className="text-sm mt-1">Analyze or revise a course plan to see results</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Export Dialog */}
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t("teacher.coursePlan.export")} dokument</DialogTitle>
                  <DialogDescription>
                    Velg filformat for å eksportere dokumentet ditt.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="export-format" className="text-right">
                      {t("teacher.coursePlan.exportFormat")}
                    </Label>
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={t("teacher.coursePlan.exportFormatPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="markdown">Markdown (.md)</SelectItem>
                        <SelectItem value="html">HTML (.html)</SelectItem>
                        <SelectItem value="txt">Ren tekst (.txt)</SelectItem>
                        <SelectItem value="pdf">PDF (.html for utskrift)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                    {t("teacher.coursePlan.exportCancel")}
                  </Button>
                  <Button onClick={handleExport}>
                    {t("teacher.coursePlan.export")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Analysis Explainer Modal */}
            <Dialog open={isExplainOpen} onOpenChange={setIsExplainOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{t("teacher.explain.title")}</DialogTitle>
                  <DialogDescription>
                    {t("teacher.explain.subtitle")}
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[65vh] overflow-auto px-1">
                  {renderExplainContent()}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsExplainOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack}>
                Tilbake
              </Button>
            </div>
          </div>
        )}

        {/* Course Plan Development - Other cases (keep existing layout) */}
        {(selectedPlanningCase === "develop-new-course" || selectedPlanningCase === "develop-lecture-plan" || selectedPlanningCase === "reflect-feedback") && (
          <div className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedPlanningCase === "develop-new-course" && t("teacher.step4.developNewCourse")}
                    {selectedPlanningCase === "develop-lecture-plan" && t("teacher.step4.developLecturePlan")}
                    {selectedPlanningCase === "reflect-feedback" && t("teacher.step4.reflectFeedback")}
                  </CardTitle>
                  <CardDescription>
                    {selectedPlanningCase === "develop-new-course" && t("teacher.step4.developNewCourse.desc")}
                    {selectedPlanningCase === "develop-lecture-plan" && t("teacher.step4.developLecturePlan.desc")}
                    {selectedPlanningCase === "reflect-feedback" && t("teacher.step4.reflectFeedback.desc")}
                  </CardDescription>
                </CardHeader>
              </Card>

            <div className="grid grid-cols-12 gap-2 h-[600px]">
              {/* Left Panel - Version History (15% width) */}
              <div className="col-span-2">
                <Card className="h-full">
                  <CardHeader className="pb-1 px-3 pt-3">
                    <CardTitle className="text-sm">{t("teacher.coursePlan.versions")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 overflow-y-auto px-2 pb-2">
                    {/* Show course plans */}
                    {coursePlanVersions.map((version) => (
                      <div
                        key={version.id}
                        className={`p-1 border rounded cursor-pointer hover:bg-secondary transition-colors ${
                          selectedVersion === version.id ? 'bg-primary text-primary-foreground' : ''
                        }`}
                        onClick={() => handleVersionSelect(version.id)}
                      >
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <div className="min-w-0">
                            <p className="font-medium text-xs truncate">{version.title}</p>
                            <p className="text-xs opacity-70">{version.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show lecture plans */}
                    {selectedPlanningCase === "develop-lecture-plan" && lecturePlanVersions.map((version) => (
                      <div
                        key={version.id}
                        className={`p-1 border rounded cursor-pointer hover:bg-secondary transition-colors ${
                          selectedVersion === version.id ? 'bg-primary text-primary-foreground' : ''
                        }`}
                        onClick={() => handleVersionSelect(version.id)}
                      >
                        <div className="flex items-center gap-1">
                          <Presentation className="h-3 w-3" />
                          <div className="min-w-0">
                            <p className="font-medium text-xs truncate">{version.title}</p>
                            <p className="text-xs opacity-70">{version.date}</p>
                          </div>
                        </div>
                    </div>
                    ))}
                    
                    {/* Show student feedback */}
                    {selectedPlanningCase === "reflect-feedback" && studentFeedbackVersions.map((version) => (
                      <div
                        key={version.id}
                        className={`p-1 border rounded cursor-pointer hover:bg-secondary transition-colors ${
                          selectedVersion === version.id ? 'bg-primary text-primary-foreground' : ''
                        }`}
                        onClick={() => handleVersionSelect(version.id)}
                      >
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <div className="min-w-0">
                            <p className="font-medium text-xs truncate">{version.title}</p>
                            <p className="text-xs opacity-70">{version.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                      </div>

              {/* Middle Panel - Course Plan Editor (85% width) */}
              <div className="col-span-10">
                <Card className="h-full flex flex-col">
                  {/* Header with editable title and action buttons */}
                  <div className="bg-gray-50 border-b px-3 py-2">
                    <div className="flex flex-row items-center justify-between">
                      <div className="flex-1">
                        {isEditingTitle ? (
                          <Input
                            value={coursePlanTitle}
                            onChange={(e) => {
                              const newTitle = e.target.value;
                              setCoursePlanTitle(newTitle);
                              updateSelectedVersionTitle(newTitle, true);
                            }}
                            onBlur={handleTitleSave}
                            onKeyPress={handleTitleKeyPress}
                            className="text-lg font-semibold border-0 bg-transparent p-0 focus-visible:ring-0"
                            autoFocus
                          />
                        ) : (
                          <Popover open={(["Kursplanredigering","Forelesningsplanredigering","Studenttilbakemeldingredigering"]).includes(coursePlanTitle) && showTitleHint}>
                            <PopoverTrigger asChild>
                          <h2 
                            className="text-lg font-semibold cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                            onClick={handleTitleEdit}
                          >
                            {coursePlanTitle}
                          </h2>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-80">
                              <div className="space-y-2">
                                <div className="text-sm font-medium">{t("teacher.coursePlan.titleHint.title")}</div>
                                <div className="text-sm text-muted-foreground">{t("teacher.coursePlan.titleHint.body")}</div>
                                <div className="flex gap-2 pt-1">
                                  <Button size="sm" onClick={() => { setIsEditingTitle(true); setShowTitleHint(false); }}>
                                    {t("teacher.coursePlan.titleHint.edit")}
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setShowTitleHint(false)}>
                                    {t("teacher.coursePlan.titleHint.dismiss")}
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {/* Buttons for other planning cases */}
                          <>
                            <Button
                              size="sm" 
                              className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200"
                              onClick={() => openPlanningChat(selectedPlanningCase)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Åpne AI Chat
                            </Button>
                            <Button size="sm" onClick={handleSaveCoursePlan}>
                              <Save className="h-4 w-4 mr-1" />
                              Lagre
                            </Button>
                          </>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={handleClearCoursePlan}
                          className="h-8 w-8"
                          title={t("teacher.coursePlan.clear")}
                        >
                          <Eraser className="h-4 w-4" />
                        </Button>
                        {selectedVersion && (
                          <Button
                            size="icon"
                            variant="destructive" 
                            onClick={handleDeleteVersion}
                            disabled={isAnalyzing || isRevising}
                            className="h-8 w-8"
                            title="Slett versjon"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="outline"
                              className="h-8 w-8"
                              title={t("teacher.coursePlan.export")}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>{t("teacher.coursePlan.export")} dokument</DialogTitle>
                              <DialogDescription>
                                Velg filformat for å eksportere dokumentet ditt.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="export-format" className="text-right">
                                  {t("teacher.coursePlan.exportFormat")}
                                </Label>
                                <Select value={exportFormat} onValueChange={setExportFormat}>
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder={t("teacher.coursePlan.exportFormatPlaceholder")} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="markdown">Markdown (.md)</SelectItem>
                                    <SelectItem value="html">HTML (.html)</SelectItem>
                                    <SelectItem value="txt">Ren tekst (.txt)</SelectItem>
                                    <SelectItem value="pdf">PDF (.html for utskrift)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                                {t("teacher.coursePlan.exportCancel")}
                              </Button>
                              <Button onClick={handleExport}>
                                {t("teacher.coursePlan.export")}
                      </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        {/* Analysis Explainer Modal */}
                        <Dialog open={isExplainOpen} onOpenChange={setIsExplainOpen}>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>{t("teacher.explain.title")}</DialogTitle>
                              <DialogDescription>
                                {t("teacher.explain.subtitle")}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[65vh] overflow-auto px-1">
                              {renderExplainContent()}
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsExplainOpen(false)}>Close</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                      </div>

                  {/* Validation Error Display */}
                  {validationError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{validationError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Character Count & Token Usage Progress Bars - Compact Inline */}
                  <div className="mb-2">
                    <TooltipProvider>
                      <div className="flex items-center gap-3">
                        {/* Character Limit Progress Bar - Compact */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 cursor-pointer">
                              <span className="text-xs text-gray-500 w-12 text-right">Chars</span>
                              <div className="w-20">
                                <Progress 
                                  value={Math.min((coursePlanContent.length / 20000) * 100, 100)} 
                                  className="h-4"
                                  indicatorClassName={coursePlanContent.length > 20000 ? 'bg-red-600' : 'bg-blue-600'}
                                />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-semibold">{t("teacher.coursePlan.charLimitTitle") || "Document Character Limit"}</p>
                            <p className="text-sm mt-1">{coursePlanContent.length.toLocaleString()} / 20,000 {t("teacher.coursePlan.charCount")}</p>
                            <p className="text-xs text-gray-400">{Math.round((coursePlanContent.length / 20000) * 100)}% {t("teacher.coursePlan.used") || "used"}</p>
                            {coursePlanContent.length > 20000 && (
                              <p className="text-red-400 text-xs mt-1">⚠️ {t("teacher.coursePlan.overLimit")}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>

                        {/* Daily Token Usage Progress Bar - Compact */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 cursor-pointer">
                              <span className="text-xs text-gray-500 w-12 text-right">Tokens</span>
                              <div className="w-20">
                                <Progress 
                                  value={Math.min((dailyTokenUsage / TOKEN_LIMIT_PER_DAY) * 100, 100)} 
                                  className="h-4"
                                  indicatorClassName={
                                    dailyTokenUsage >= TOKEN_LIMIT_PER_DAY ? 'bg-red-600' : 
                                    dailyTokenUsage >= TOKEN_LIMIT_PER_DAY * 0.9 ? 'bg-orange-600' : 
                                    'bg-green-600'
                                  }
                                />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-semibold">{t("teacher.tokenLimit.dailyLimitTitle") || "Daily Token Limit"}</p>
                            <p className="text-sm mt-1">{dailyTokenUsage.toLocaleString()} / {TOKEN_LIMIT_PER_DAY.toLocaleString()} tokens</p>
                            <p className="text-xs text-gray-400">{Math.round((dailyTokenUsage / TOKEN_LIMIT_PER_DAY) * 100)}% {t("teacher.coursePlan.used") || "used"} {t("teacher.tokenLimit.today") || "today"}</p>
                            {dailyTokenUsage >= TOKEN_LIMIT_PER_DAY ? (
                              <p className="text-red-400 text-xs mt-1">❌ {t("teacher.tokenLimit.exceeded")}</p>
                            ) : dailyTokenUsage >= TOKEN_LIMIT_PER_DAY * 0.9 ? (
                              <p className="text-orange-400 text-xs mt-1">⚠️ {t("teacher.tokenLimit.warning")}</p>
                            ) : (
                              <p className="text-green-400 text-xs mt-1">✅ {Math.round((1 - dailyTokenUsage / TOKEN_LIMIT_PER_DAY) * 100)}% {t("teacher.tokenLimit.remaining")}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>

                  {/* WYSIWYG Editor */}
                  <div className="flex-1" style={{ height: 'calc(100vh - 300px)' }}>
                    <MDEditor
                      value={coursePlanContent}
                      onChange={(val) => {
                        setCoursePlanContent(val || '');
                        // Clear validation error when user starts typing
                        if (validationError) {
                          setValidationError("");
                        }
                      }}
                      data-color-mode="light"
                      height={500}
                      visibleDragbar={false}
                      preview="preview"
                      hideToolbar={false}
                    />
                  </div>
                </Card>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack}>
                Tilbake
              </Button>
            </div>
            </div>
          )}
        </div>
      </div>
  );
}