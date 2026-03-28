import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, Sparkles, FileText, Printer, Eye, Plus, Edit, Trash2, Calendar, Search, Save, Layout, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import API_ENDPOINTS from "@/config/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface WorksheetFormData {
  educationLevel: string;
  year: string;
  subjectArea: string;
  language: string;
  learningObjective: string;
  difficultyLevel: "easy" | "medium" | "hard";
  formatDescription: string;
  examples: string;
  references: string;
}

interface InstructionPageObject {
  overview?: string;
  learningObjectives?: string | string[];
  instructions?: string;
  instructionsForStudents?: string;
  timeAllocation?: string;
  materialsNeeded?: string;
  gradingCriteria?: string;
  specialNotes?: string;
}

interface AnswerSheetObject {
  answers?: string | string[] | { [key: string]: any } | Array<{
    question?: string;
    answer?: string;
    answers?: Array<{ shape?: string; match?: string; [key: string]: any }>;
    [key: string]: any;
  }>;
  markingScheme?: string;
}

interface WorksheetContentObject {
  title?: string;
  instructions?: string;
  tasks?: Array<{
    type?: string;
    question?: string;
    image?: string;
    shapes?: Array<{ shape?: string; image?: string; [key: string]: any }>;
    [key: string]: any;
  }>;
  questions?: Array<{ task?: string; image?: string; answerSpace?: string; [key: string]: any }>;
  [key: string]: any;
}

interface WorksheetResult {
  worksheetContent?: string; // Always a formatted string, never an object
  title: string;
  answerSheet?: string; // Always a formatted string, never an object
  instructionPage?: string; // Always a formatted string, never an object
  // Keep content for backward compatibility
  content?: string; // Always a formatted string
}

interface SavedWorksheet {
  id: string;
  title: string;
  educationLevel: string;
  year: string;
  subjectArea: string;
  difficultyLevel: string;
  learningObjective: string;
  content: string;
  formatDescription?: string;
  examples?: string;
  references?: string;
  language?: string;
  createdAt: string;
  updatedAt: string;
  // Optional fields that may come from MongoDB
  worksheetContent?: string | any;
  instructionPage?: string | InstructionPageObject;
  answerSheet?: string | AnswerSheetObject;
}

type WorksheetView = "list" | "create" | "preview" | "edit";

// Subject/Area options based on education level
const getSubjectOptions = (educationLevel: string) => {
  switch (educationLevel) {
    case "elementary":
      return [
        "Norwegian (Bokmål)",
        "Norwegian (Nynorsk)",
        "Mathematics",
        "English",
        "Natural Sciences (Biology, Chemistry, Physics)",
        "Social Studies",
        "History",
        "Physical Education",
        "Music",
        "Arts and Crafts",
        "Food and Health"
      ];
    case "high-school":
      return [
        "English",
        "Mathematics",
        "History",
        "General Study Programmes (Sports, Art, Media, Music, Dance, Drama)"
      ];
    case "higher-education":
      return [
        "Arts, Humanities, and Social Sciences - Arts (Art, Design, Architecture, Music, Dance, Drama)",
        "Arts, Humanities, and Social Sciences - Humanities (Languages and Literature, History, Philosophy)",
        "Arts, Humanities, and Social Sciences - Social Sciences (Economics, Psychology, Sociology, Political Science, Social Anthropology)",
        "Arts, Humanities, and Social Sciences - Media and Communication",
        "STEM and Technology - Engineering (Civil, Mechanical, etc.)",
        "STEM and Technology - ICT (Computer Science, IT, Information Systems)",
        "STEM and Technology - Natural Sciences (Biology, Chemistry, Physics, Mathematics)",
        "Health and Welfare - Healthcare, Nursing, Medical-related fields",
        "Health and Welfare - Psychology (General and Specialized)",
        "Business and Management - Business Administration, Economics",
        "Agriculture, Forestry, Fisheries and Veterinary",
        "Education - Teaching and Educational Studies",
        "Services - Tourism, Sales, Service-related courses",
        "Maritime Studies",
        "General Studies"
      ];
    default:
      return [];
  }
};

// Year options based on education level
const getYearOptions = (educationLevel: string) => {
  switch (educationLevel) {
    case "elementary":
      return Array.from({ length: 7 }, (_, i) => `Grade ${i + 1}`);
    case "high-school":
      return ["Year 1 (VG1)", "Year 2 (VG2)", "Year 3 (VG3)"];
    case "higher-education":
      return ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Master's", "PhD"];
    default:
      return [];
  }
};

export default function Worksheet({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<WorksheetView>("list");
  
  // Debug: Log when component renders
  useEffect(() => {
    console.log('Worksheet component rendered, currentView:', currentView);
  }, [currentView]);
  const [worksheets, setWorksheets] = useState<SavedWorksheet[]>([]);
  const [isLoadingWorksheets, setIsLoadingWorksheets] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorksheet, setSelectedWorksheet] = useState<SavedWorksheet | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [worksheetToDelete, setWorksheetToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<WorksheetFormData>({
    educationLevel: "",
    language: "en",
    year: "",
    subjectArea: "",
    learningObjective: "",
    difficultyLevel: "medium",
    formatDescription: "",
    examples: "",
    references: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [worksheetResult, setWorksheetResult] = useState<WorksheetResult | null>(null);
  const [editingWorksheetId, setEditingWorksheetId] = useState<string | null>(null);
  
  // Editable content state
  const [editableContent, setEditableContent] = useState({
    title: "",
    worksheet: "",
    instruction: "",
    answerSheet: ""
  });
  
  // Layout options for preview/print
  const [layoutOptions, setLayoutOptions] = useState({
    spacing: "full" as "compact" | "full",
    layout: "vertical" as "vertical" | "horizontal",
    columns: 1 as 1 | 2 | 3,
    showPreview: false,
    printInstruction: false,
    printAnswerSheet: false
  });
  
  // Navigation state for preview pages
  const [currentPreviewPage, setCurrentPreviewPage] = useState<"worksheet" | "instruction" | "answerSheet">("worksheet");

  const subjectOptions = getSubjectOptions(formData.educationLevel);
  const yearOptions = getYearOptions(formData.educationLevel);

  // Fetch worksheets on mount and when returning to list view
  useEffect(() => {
    if (currentView === "list") {
      fetchWorksheets();
    }
  }, [currentView]);

  // Reset dependent fields when education level changes (only for create view, not edit)
  useEffect(() => {
    if (formData.educationLevel && currentView === "create" && !editingWorksheetId) {
      setFormData(prev => ({
        ...prev,
        year: "",
        subjectArea: ""
      }));
    }
  }, [formData.educationLevel, currentView, editingWorksheetId]);

  const fetchWorksheets = async () => {
    setIsLoadingWorksheets(true);
    try {
      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      
      // TODO: Replace with actual endpoint when available
      // For now, use mock data or check if endpoint exists
      const endpoint = (API_ENDPOINTS as any).worksheets?.list || '/api/v1/worksheets';
      const response = await fetch(
        `${endpoint}?userName=${encodeURIComponent(userName)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setWorksheets(data.data.worksheets || data.data || []);
        } else {
          setWorksheets([]);
        }
      } else if (response.status === 404) {
        // Endpoint not implemented yet, use empty array
        setWorksheets([]);
      } else {
        // Other error, use empty array
        setWorksheets([]);
      }
    } catch (error) {
      console.warn('Failed to fetch worksheets:', error);
      // Use empty array if endpoint doesn't exist yet
      setWorksheets([]);
    } finally {
      setIsLoadingWorksheets(false);
    }
  };

  const handleAddNew = () => {
    setFormData({
      educationLevel: "",
      language: "en",
      year: "",
      subjectArea: "",
      learningObjective: "",
      difficultyLevel: "medium",
      formatDescription: "",
      examples: "",
      references: ""
    });
    setWorksheetResult(null);
    setEditingWorksheetId(null);
    setCurrentView("create");
  };

  const handleEdit = async (worksheet: SavedWorksheet) => {
    console.log('📝 Editing worksheet:', worksheet);
    
    try {
      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      // Fetch full worksheet data from MongoDB
      const endpoint = (API_ENDPOINTS as any).worksheets?.getById?.(worksheet.id) || `/api/v1/worksheets/${worksheet.id}`;
      const url = `${endpoint}?userName=${encodeURIComponent(userName)}`;
      
      console.log('🔵 [Get Worksheet by ID] URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      let fullWorksheet = worksheet;
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          fullWorksheet = data.data;
          console.log('✅ Fetched full worksheet data:', fullWorksheet);
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch worksheet' }));
        console.error('❌ [Get Worksheet by ID] Error:', response.status, errorData);
        console.warn('⚠️ Failed to fetch full worksheet, using list data');
      }

      // Extract and format all parts from the full worksheet data
      const rawWorksheetContent = fullWorksheet.worksheetContent || fullWorksheet.content || "";
      const rawInstructionPage = fullWorksheet.instructionPage || null;
      const rawAnswerSheet = fullWorksheet.answerSheet || null;
      
      // Format all parts immediately
      const formattedWorksheetContent = formatContent(rawWorksheetContent);
      const formattedInstructionPage = rawInstructionPage ? formatInstructionPage(rawInstructionPage) : "";
      const formattedAnswerSheet = rawAnswerSheet ? formatAnswerSheet(rawAnswerSheet) : "";

      setFormData({
        educationLevel: fullWorksheet.educationLevel || "",
        language: fullWorksheet.language || "en",
        year: fullWorksheet.year || "",
        subjectArea: fullWorksheet.subjectArea || "",
        learningObjective: fullWorksheet.learningObjective || "",
        difficultyLevel: (fullWorksheet.difficultyLevel as "easy" | "medium" | "hard") || "medium",
        formatDescription: fullWorksheet.formatDescription || "",
        examples: fullWorksheet.examples || "",
        references: fullWorksheet.references || ""
      });
      
      setWorksheetResult({
        worksheetContent: formattedWorksheetContent,
        content: formattedWorksheetContent,
        title: fullWorksheet.title || "",
        answerSheet: formattedAnswerSheet || undefined,
        instructionPage: formattedInstructionPage || undefined
      });
      
      setEditingWorksheetId(worksheet.id);
      setSelectedWorksheet(fullWorksheet);
      setEditableContent({
        title: fullWorksheet.title || "",
        worksheet: formattedWorksheetContent,
        instruction: formattedInstructionPage,
        answerSheet: formattedAnswerSheet
      });
      setCurrentView("edit");
    } catch (error) {
      console.error('Error fetching worksheet:', error);
      // Fallback to using list data if fetch fails
      setFormData({
        educationLevel: worksheet.educationLevel || "",
        language: worksheet.language || "en",
        year: worksheet.year || "",
        subjectArea: worksheet.subjectArea || "",
        learningObjective: worksheet.learningObjective || "",
        difficultyLevel: (worksheet.difficultyLevel as "easy" | "medium" | "hard") || "medium",
        formatDescription: worksheet.formatDescription || "",
        examples: worksheet.examples || "",
        references: worksheet.references || ""
      });
      setWorksheetResult({
        worksheetContent: formatContent(worksheet.content || ""),
        content: formatContent(worksheet.content || ""),
        title: worksheet.title || ""
      });
      setEditingWorksheetId(worksheet.id);
      setSelectedWorksheet(worksheet);
      setEditableContent({
        title: worksheet.title || "",
        worksheet: formatContent(worksheet.content || ""),
        instruction: "",
        answerSheet: ""
      });
      setCurrentView("edit");
    }
  };

  const handleView = async (worksheet: SavedWorksheet) => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      // Fetch full worksheet data from MongoDB
      const endpoint = (API_ENDPOINTS as any).worksheets?.getById?.(worksheet.id) || `/api/v1/worksheets/${worksheet.id}`;
      const url = `${endpoint}?userName=${encodeURIComponent(userName)}`;
      
      console.log('🔵 [Get Worksheet by ID] URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      let fullWorksheet = worksheet;
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          fullWorksheet = data.data;
          console.log('✅ Fetched full worksheet data:', fullWorksheet);
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch worksheet' }));
        console.error('❌ [Get Worksheet by ID] Error:', response.status, errorData);
        console.warn('⚠️ Failed to fetch full worksheet, using list data');
      }

      // Extract and format all parts from the full worksheet data
      const rawWorksheetContent = fullWorksheet.worksheetContent || fullWorksheet.content || "";
      const rawInstructionPage = fullWorksheet.instructionPage || null;
      const rawAnswerSheet = fullWorksheet.answerSheet || null;
      
      // Format all parts immediately
      const formattedWorksheetContent = formatContent(rawWorksheetContent);
      const formattedInstructionPage = rawInstructionPage ? formatInstructionPage(rawInstructionPage) : "";
      const formattedAnswerSheet = rawAnswerSheet ? formatAnswerSheet(rawAnswerSheet) : "";

      setSelectedWorksheet(fullWorksheet);
      setWorksheetResult({
        worksheetContent: formattedWorksheetContent,
        content: formattedWorksheetContent,
        title: fullWorksheet.title || "",
        answerSheet: formattedAnswerSheet || undefined,
        instructionPage: formattedInstructionPage || undefined
      });
      setEditableContent({
        title: fullWorksheet.title || "",
        worksheet: formattedWorksheetContent,
        instruction: formattedInstructionPage,
        answerSheet: formattedAnswerSheet
      });
      setCurrentView("preview");
    } catch (error) {
      console.error('Error fetching worksheet:', error);
      // Fallback to using list data if fetch fails
      setSelectedWorksheet(worksheet);
      setWorksheetResult({
        worksheetContent: formatContent(worksheet.content || ""),
        content: formatContent(worksheet.content || ""),
        title: worksheet.title || ""
      });
      setEditableContent({
        title: worksheet.title || "",
        worksheet: formatContent(worksheet.content || ""),
        instruction: "",
        answerSheet: ""
      });
      setCurrentView("preview");
    }
  };

  const handleDeleteClick = (worksheetId: string) => {
    setWorksheetToDelete(worksheetId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!worksheetToDelete) return;

    try {
      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      const endpoint = (API_ENDPOINTS as any).worksheets?.delete?.(worksheetToDelete) || `/api/v1/worksheets/${worksheetToDelete}`;
      
      console.log('🔴 [Delete Worksheet] Endpoint:', endpoint);
      console.log('🔴 [Delete Worksheet] userName:', userName);
      
      const response = await fetch(
        endpoint,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userName: userName })
        }
      );

      if (response.ok) {
        toast({
          title: t("worksheet.deleted"),
          description: t("worksheet.deletedSuccessfully"),
        });
        fetchWorksheets();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete worksheet' }));
        console.error('❌ [Delete Worksheet] Error:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to delete worksheet');
      }
    } catch (error) {
      console.error('❌ [Delete Worksheet] Exception:', error);
      toast({
        title: t("worksheet.error"),
        description: error instanceof Error ? error.message : t("worksheet.failedToDelete"),
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setWorksheetToDelete(null);
    }
  };

  const handleSaveWorksheet = async () => {
    if (!worksheetResult) {
      toast({
        title: t("worksheet.error"),
        description: t("worksheet.noWorksheetToSave"),
        variant: "destructive",
      });
      return;
    }

    try {
      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      const endpoint = editingWorksheetId 
        ? (API_ENDPOINTS as any).worksheets?.update?.(editingWorksheetId) || `/api/v1/worksheets/${editingWorksheetId}`
        : (API_ENDPOINTS as any).worksheets?.create || '/api/v1/worksheets';
      
      const requestBody = {
        title: (editableContent.title || worksheetResult.title || "").trim(),
        content: (editableContent.worksheet || worksheetResult.worksheetContent || worksheetResult.content || "").trim(),
        educationLevel: formData.educationLevel,
        year: (formData.year || "").trim(),
        subjectArea: (formData.subjectArea || "").trim(),
        learningObjective: (formData.learningObjective || "").trim(),
        difficultyLevel: formData.difficultyLevel,
        formatDescription: (formData.formatDescription || "").trim(),
        examples: (formData.examples || "").trim(),
        references: (formData.references || "").trim(),
        userName: (userName || "").trim(),
        // Include instructionPage and answerSheet as strings (Joi: optional().allow(''))
        instructionPage: (editableContent.instruction || worksheetResult.instructionPage || "").toString().trim(),
        answerSheet: (editableContent.answerSheet || worksheetResult.answerSheet || "").toString().trim(),
        // Optional: persist current layout options with the worksheet (matches backend schema)
        printoutLayoutOptions: {
          spacing: layoutOptions.spacing,
          layout: layoutOptions.layout,
          columns: layoutOptions.columns,
          printInstruction: layoutOptions.printInstruction,
          printAnswerSheet: layoutOptions.printAnswerSheet
        }
      };

      // Frontend validation aligned with backend Joi schema to avoid 400 "Invalid request body"
      const missingRequiredFields: string[] = [];
      if (!requestBody.title) missingRequiredFields.push("title");
      if (!requestBody.content) missingRequiredFields.push("content");
      if (!requestBody.educationLevel) missingRequiredFields.push("educationLevel");
      if (!requestBody.year) missingRequiredFields.push("year");
      if (!requestBody.subjectArea) missingRequiredFields.push("subjectArea");
      if (!requestBody.learningObjective) missingRequiredFields.push("learningObjective");
      if (!requestBody.difficultyLevel) missingRequiredFields.push("difficultyLevel");
      if (!requestBody.userName) missingRequiredFields.push("userName");

      if (missingRequiredFields.length > 0) {
        console.warn("❌ [Save Worksheet] Missing required fields:", missingRequiredFields, requestBody);
        toast({
          title: t("worksheet.error"),
          description: `${t("worksheet.errorFillRequired")}: ${missingRequiredFields.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      console.log("🟢 [Save Worksheet] Endpoint:", endpoint);
      console.log("🟢 [Save Worksheet] Request Body:", requestBody);

      const response = await fetch(endpoint, {
        method: editingWorksheetId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({
            title: t("worksheet.saved"),
            description: editingWorksheetId ? t("worksheet.updatedSuccessfully") : t("worksheet.savedSuccessfully"),
          });
          fetchWorksheets();
          if (data.data?.id) {
            setEditingWorksheetId(data.data.id);
          }
        } else {
          throw new Error(data.message || 'Failed to save worksheet');
        }
      } else {
        // Improved error logging to debug Joi "Invalid request body" issues
        let errorDetails: any = null;
        try {
          const rawText = await response.text();
          try {
            errorDetails = JSON.parse(rawText);
          } catch {
            errorDetails = { rawText };
          }
        } catch {
          errorDetails = { message: 'Failed to read error response body' };
        }

        console.error("❌ [Save Worksheet] HTTP Error:", response.status, response.statusText);
        console.error("❌ [Save Worksheet] Error Details:", errorDetails);

        const message =
          (errorDetails && (errorDetails.message || errorDetails.error)) ||
          `Failed to save worksheet (HTTP ${response.status})`;
        throw new Error(message);
      }
    } catch (error) {
      console.error('Error saving worksheet:', error);
      toast({
        title: t("worksheet.error"),
        description: error instanceof Error ? error.message : t("worksheet.failedToSave"),
        variant: "destructive",
      });
    }
  };

  const filteredWorksheets = worksheets.filter(ws => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ws.title.toLowerCase().includes(query) ||
      ws.subjectArea.toLowerCase().includes(query) ||
      ws.learningObjective.toLowerCase().includes(query)
    );
  });

  // Helper function to try parsing JSON strings
  const tryParse = (text: string) => {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  // Helper function to format content (handles both string and structured object)
  const formatContent = (content: any, indent = 0): string => {
    if (!content) return "";

    const pad = "  ".repeat(indent);

    // ⬅️ FIX: detect JSON stored as text
    if (typeof content === "string") {
      const parsed = tryParse(content);
      
      // If parsed becomes object → recursively format it
      if (typeof parsed === "object") {
        return formatContent(parsed, indent);
      }
      
      // Else it's real text, return as-is
      return `${pad}${parsed.trim()}`;
    }

    // If it's an array
    if (Array.isArray(content)) {
      return content
        .map((item, index) => {
          if (typeof item === "string") {
            return `${pad}${index + 1}. ${item}`;
          }
          // object inside array
          return `${pad}${index + 1}.\n${formatContent(item, indent + 1)}`;
        })
        .join("\n\n");
    }

    // If it's an object — dynamic recursive rendering
    if (typeof content === "object") {
      let output: string[] = [];

      for (const key of Object.keys(content)) {
        const value = content[key];

        // Convert key to readable title
        const sectionTitle = key
          .replace(/([A-Z])/g, " $1") // camelCase → camel Case
          .replace(/_/g, " ")         // snake_case → snake case
          .replace(/\b\w/g, c => c.toUpperCase()); // capitalize each word

        if (typeof value === "string") {
          // Simple text field
          output.push(`${pad}### ${sectionTitle}:\n${formatContent(value, indent + 1)}`);
        } else if (Array.isArray(value)) {
          // Array field
          output.push(`${pad}### ${sectionTitle}:`);
          output.push(formatContent(value, indent + 1));
        } else if (typeof value === "object") {
          // Nested object as its own section
          output.push(`${pad}### ${sectionTitle}:`);
          output.push(formatContent(value, indent + 1));
        }
      }

      return output.join("\n\n");
    }

    // fallback
    return `${pad}${String(content)}`;
  };

  // Helper function to format instructionPage (handles both string and object)
  const formatInstructionPage = (instructionPage: string | InstructionPageObject | undefined): string => {
    if (!instructionPage) return "";
    
    // ⬅️ FIX: detect JSON stored as text
    if (typeof instructionPage === "string") {
      const parsed = tryParse(instructionPage);
      if (typeof parsed === "object") {
        return formatInstructionPage(parsed);
      }
      return instructionPage;
    }
    
    // If it's an object, format it nicely
    const parts: string[] = [];
    
    if (instructionPage.overview) {
      parts.push(`Overview:\n${instructionPage.overview}\n`);
    }
    if (instructionPage.learningObjectives) {
      if (Array.isArray(instructionPage.learningObjectives)) {
        parts.push(`Learning Objectives:\n${instructionPage.learningObjectives.map((obj, idx) => `${idx + 1}. ${obj}`).join("\n")}\n`);
      } else {
        parts.push(`Learning Objectives:\n${instructionPage.learningObjectives}\n`);
      }
    }
    if (instructionPage.instructions) {
      parts.push(`Instructions:\n${instructionPage.instructions}\n`);
    }
    if (instructionPage.instructionsForStudents) {
      parts.push(`Instructions for Students:\n${instructionPage.instructionsForStudents}\n`);
    }
    if (instructionPage.timeAllocation) {
      parts.push(`Time Allocation:\n${instructionPage.timeAllocation}\n`);
    }
    if (instructionPage.materialsNeeded) {
      parts.push(`Materials Needed:\n${instructionPage.materialsNeeded}\n`);
    }
    if (instructionPage.gradingCriteria) {
      parts.push(`Grading Criteria:\n${instructionPage.gradingCriteria}\n`);
    }
    if (instructionPage.specialNotes) {
      parts.push(`Special Notes:\n${instructionPage.specialNotes}\n`);
    }
    
    return parts.join("\n");
  };

  // Helper function to format answerSheet (handles both string and object)
  const formatAnswerSheet = (input: any, level = 0): string => {
    if (!input) return "";

    // If it's JSON stored as text → parse and recurse
    if (typeof input === "string") {
      const parsed = tryParse(input);
      if (parsed && typeof parsed === "object") {
        return formatAnswerSheet(parsed, level);
      }
      return input;
    }

    // If it's a primitive
    if (typeof input !== "object") {
      return String(input);
    }

    let output: string[] = [];

    // Handle arrays
    if (Array.isArray(input)) {
      return input
        .map((item, i) => {
          if (typeof item === "object") {
            // If object → flatten into "key: value"
            const entries = Object.entries(item)
              .map(([k, v]) => `   ${k}: ${formatAnswerSheet(v, level + 1)}`)
              .join("\n");
            return `${i + 1}.\n${entries}`;
          }
          return `${i + 1}. ${formatAnswerSheet(item, level + 1)}`;
        })
        .join("\n");
    }

    // Handle objects (dynamic keys)
    for (const [key, value] of Object.entries(input)) {
      const title =
        key
          .replace(/([A-Z])/g, " $1")     // break camelCase
          .replace(/_/g, " ")             // replace underscores
          .replace(/\b\w/g, (c) => c.toUpperCase()) // capitalize
          .trim();

      const formattedValue = formatAnswerSheet(value, level + 1);

      // Nested objects or lists → add section headers
      if (typeof value === "object") {
        output.push(`### ${title}\n${formattedValue}`);
      } else {
        output.push(`${title}: ${formattedValue}`);
      }
    }

    return output.join("\n\n");
  };

  const generatePreviewHTML = () => {
    const isCompact = layoutOptions.spacing === "compact";
    const spacingClass = isCompact ? "compact-mode" : "";
    const columnStyle = layoutOptions.columns > 1 
      ? `column-count: ${layoutOptions.columns}; column-gap: 1.5rem;` 
      : "";
    const layoutStyle = layoutOptions.layout === "horizontal" && layoutOptions.columns === 1
      ? "display: flex; flex-direction: row; flex-wrap: wrap; gap: 1rem;"
      : "";
    const lineHeight = isCompact ? "1.2" : "1.6";
    
    // Build pages array (all content is already formatted strings)
    const worksheetTitle = editableContent.title || worksheetResult?.title || "";
    const pages: Array<{ title: string; content: string }> = [
      { 
        title: worksheetTitle, 
        content: editableContent.worksheet || worksheetResult?.worksheetContent || worksheetResult?.content || "" 
      }
    ];
    if (layoutOptions.printInstruction && worksheetResult?.instructionPage) {
      pages.push({ 
        title: `${worksheetTitle} - ${t("worksheet.instruction")}`, 
        content: editableContent.instruction || worksheetResult.instructionPage || "" 
      });
    }
    if (layoutOptions.printAnswerSheet && worksheetResult?.answerSheet) {
      pages.push({ 
        title: `${worksheetTitle} - ${t("worksheet.answerSheet")}`, 
        content: editableContent.answerSheet || worksheetResult.answerSheet || "" 
      });
    }
    
    const pagesHTML = pages.map((page, index) => `
      <div class="worksheet-page ${index > 0 ? 'page-break' : ''}">
        <div class="worksheet-header ${spacingClass}">
          <h1 class="worksheet-title">${page.title}</h1>
          ${index === 0 ? `
          <div class="worksheet-meta">
            ${formData.educationLevel === "elementary" ? "Elementary School" : 
              formData.educationLevel === "high-school" ? "High School" : 
              "Higher Education"} - ${formData.year || ""} - ${formData.subjectArea || ""}
          </div>
          ` : ""}
        </div>
        <div class="worksheet-content ${spacingClass}">
          ${page.content}
        </div>
        ${index === 0 && formData.references ? `
        <div class="worksheet-references ${spacingClass}">
          <h3><strong>References:</strong></h3>
          <div>${formData.references}</div>
        </div>
        ` : ""}
      </div>
    `).join('');
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${worksheetResult?.title || "Worksheet Preview"}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      padding: ${isCompact ? "10px" : "20px"};
      line-height: ${lineHeight};
      color: #000;
    }
    .compact-mode * {
      margin-top: ${isCompact ? "0.25em" : "0.5em"};
      margin-bottom: ${isCompact ? "0.25em" : "0.5em"};
    }
    .compact-mode h1, .compact-mode h2, .compact-mode h3 {
      margin-top: ${isCompact ? "0.5em" : "1em"};
      margin-bottom: ${isCompact ? "0.25em" : "0.5em"};
    }
    .compact-mode p {
      margin-top: ${isCompact ? "0.1em" : "0.5em"};
      margin-bottom: ${isCompact ? "0.1em" : "0.5em"};
    }
    .worksheet-page {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
    }
    .worksheet-header {
      border-bottom: 2px solid #333;
      padding-bottom: ${isCompact ? "8px" : "16px"};
      margin-bottom: ${isCompact ? "12px" : "24px"};
      page-break-after: avoid;
      break-after: avoid;
    }
    .worksheet-title {
      font-size: ${isCompact ? "1.5rem" : "2rem"};
      font-weight: bold;
      margin-bottom: ${isCompact ? "4px" : "8px"};
    }
    .worksheet-meta {
      font-size: ${isCompact ? "0.875rem" : "1rem"};
      color: #666;
      margin-bottom: ${isCompact ? "8px" : "16px"};
    }
    .worksheet-content {
      ${columnStyle}
      ${layoutStyle}
      white-space: pre-wrap;
      line-height: ${lineHeight};
    }
    /* Smart layout: prevent breaking questions and answers */
    .worksheet-content p,
    .worksheet-content div,
    .worksheet-content li {
      page-break-inside: avoid;
      break-inside: avoid;
      orphans: 3;
      widows: 3;
    }
    /* Keep question-answer pairs together - use class-based approach */
    .worksheet-content p + p,
    .worksheet-content div + div {
      page-break-before: avoid;
      break-before: avoid;
    }
    /* Prevent breaking at question numbers */
    .worksheet-content p:first-letter,
    .worksheet-content div:first-letter {
      /* Keep first line with content */
    }
    /* Ensure questions don't break from their answers */
    .worksheet-content {
      orphans: 4;
      widows: 4;
    }
    .worksheet-references {
      margin-top: ${isCompact ? "16px" : "32px"};
      padding-top: ${isCompact ? "12px" : "24px"};
      border-top: 1px solid #ccc;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    @media print {
      body {
        padding: 0;
      }
      .page-break {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  ${pagesHTML}
</body>
</html>
    `;
  };

  const handleGenerateLearningObjective = async () => {
    // Log current formData state for debugging
    console.log('📋 Current formData state:', formData);

    try {
      setIsGenerating(true);
      const userName = localStorage.getItem('ai4edu_user') || undefined;
      const endpoint = (API_ENDPOINTS as any).worksheets?.generateLearningObjectives || '/api/v1/worksheets/generate-learning-objectives';
      
      const requestBody: any = {};
      
      // Only include fields that have values (all optional)
      if (formData.learningObjective?.trim()) {
        requestBody.text = formData.learningObjective.trim();
      }
      if (formData.educationLevel?.trim()) {
        requestBody.educationLevel = formData.educationLevel;
      }
      if (formData.year?.trim()) {
        requestBody.year = formData.year;
      }
      if (formData.subjectArea?.trim()) {
        requestBody.subjectArea = formData.subjectArea;
      }
      if (userName) {
        requestBody.userName = userName;
      }
      
      console.log('🔵 [Show Example - Learning Objective]');
      console.log('Endpoint:', endpoint);
      console.log('Request Body:', requestBody);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setFormData(prev => ({
            ...prev,
            learningObjective: data.data.learningObjectives || prev.learningObjective
          }));
          toast({
            title: "Success",
            description: "Learning objectives generated successfully.",
          });
        } else {
          throw new Error(data.message || 'Failed to generate learning objectives');
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate learning objectives' }));
        throw new Error(errorData.message || 'Failed to generate learning objectives');
      }
    } catch (error) {
      console.error('Error generating learning objectives:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate learning objectives.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFormatDescription = async () => {
    try {
      setIsGenerating(true);
      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      const endpoint = (API_ENDPOINTS as any).worksheets?.generateFormatDescription || '/api/v1/worksheets/generate-format-description';
      
      const requestBody = {
        educationLevel: formData.educationLevel,
        year: formData.year,
        subjectArea: formData.subjectArea,
        learningObjective: formData.learningObjective,
        difficultyLevel: formData.difficultyLevel,
        userName: userName
      };
      
      console.log('🟢 [Show Example - Format Description]');
      console.log('Endpoint:', endpoint);
      console.log('Request Body:', requestBody);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setFormData(prev => ({
            ...prev,
            formatDescription: data.data.formatDescription || prev.formatDescription
          }));
          toast({
            title: "Success",
            description: "Format description generated successfully.",
          });
        } else {
          throw new Error(data.message || 'Failed to generate format description');
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate format description' }));
        throw new Error(errorData.message || 'Failed to generate format description');
      }
    } catch (error) {
      console.error('Error generating format description:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate format description.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateExamples = async () => {
    try {
      setIsGenerating(true);
      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      const endpoint = (API_ENDPOINTS as any).worksheets?.generateExamples || '/api/v1/worksheets/generate-examples';
      
      const requestBody = {
        educationLevel: formData.educationLevel,
        year: formData.year,
        subjectArea: formData.subjectArea,
        learningObjective: formData.learningObjective,
        difficultyLevel: formData.difficultyLevel,
        formatDescription: formData.formatDescription,
        userName: userName
      };
      
      console.log('🟡 [Show Example - Examples]');
      console.log('Endpoint:', endpoint);
      console.log('Request Body:', requestBody);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setFormData(prev => ({
            ...prev,
            examples: data.data.examples || prev.examples
          }));
          toast({
            title: "Success",
            description: "Examples generated successfully.",
          });
        } else {
          throw new Error(data.message || 'Failed to generate examples');
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate examples' }));
        throw new Error(errorData.message || 'Failed to generate examples');
      }
    } catch (error) {
      console.error('Error generating examples:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate examples.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateWorksheet = async () => {
    if (!formData.educationLevel || !formData.year || !formData.subjectArea || !formData.learningObjective || !formData.formatDescription) {
      toast({
        title: t("worksheet.errorFillRequired"),
        description: t("worksheet.errorFillRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      
      // Use the dedicated worksheet generation endpoint
      const endpoint = (API_ENDPOINTS as any).worksheets?.generate || '/api/v1/worksheets/generate';
      
      const requestBody = {
        educationLevel: formData.educationLevel,
        language: formData.language,
        year: formData.year,
        subjectArea: formData.subjectArea,
        learningObjective: formData.learningObjective,
        difficultyLevel: formData.difficultyLevel,
        formatDescription: formData.formatDescription,
        // Use empty string defaults so backend never sees undefined
        examples: formData.examples || "",
        references: formData.references || "",
        userName: userName
      };
      
      console.log('🟣 [Generate Worksheet]');
      console.log('Endpoint:', endpoint);
      console.log('Request Body:', requestBody);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🟣 [Generate Worksheet Response]');
        console.log('Full Response:', JSON.stringify(data, null, 2));
        console.log('Response Data:', data.data);
        
        if (data.success && data.data) {
          // Extract raw data from response
          // ⬅️ FIX: Only use worksheetContent, never fall back to data.data.content (which contains entire object)
          const rawWorksheetContent = data.data.worksheetContent ?? data.data.questions ?? "";
          const rawInstructionPage = data.data.instructionPage ?? null;
          const rawAnswerSheet = data.data.answerSheet ?? null;
          const worksheetTitle = data.data.title || `Worksheet - ${formData.subjectArea}`;
          
          console.log('📋 Extracted Values:');
          console.log('  - rawWorksheetContent:', rawWorksheetContent);
          console.log('  - rawInstructionPage:', rawInstructionPage);
          console.log('  - rawAnswerSheet:', rawAnswerSheet);
          console.log('  - worksheetTitle:', worksheetTitle);
          
          // Format ALL parts immediately to remove JSON format - convert to readable text
          const formattedWorksheetContent = formatContent(rawWorksheetContent);
          const formattedInstructionPage = rawInstructionPage ? formatInstructionPage(rawInstructionPage) : "";
          const formattedAnswerSheet = rawAnswerSheet ? formatAnswerSheet(rawAnswerSheet) : "";
          
          // Store ONLY formatted strings in worksheetResult (never raw objects)
          setWorksheetResult({
            worksheetContent: formattedWorksheetContent, // Always a string
            content: formattedWorksheetContent, // Keep for backward compatibility
            title: worksheetTitle,
            answerSheet: formattedAnswerSheet || undefined, // Store as string or undefined
            instructionPage: formattedInstructionPage || undefined // Store as string or undefined
          });
          
          // Initialize editable content with formatted strings
          setEditableContent({
            title: worksheetTitle,
            worksheet: formattedWorksheetContent,
            instruction: formattedInstructionPage,
            answerSheet: formattedAnswerSheet
          });
          
          setCurrentView("preview");
          setCurrentPreviewPage("worksheet");
          toast({
            title: t("worksheet.successGenerated"),
            description: t("worksheet.successGenerated"),
          });
        } else {
          throw new Error(data.message || 'Failed to generate worksheet');
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate worksheet' }));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to generate worksheet`);
      }
    } catch (error) {
      console.error('Error generating worksheet:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate worksheet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    // Generate preview HTML with layout options and open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = generatePreviewHTML();
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      // Use both onload and a timeout as fallback
      const triggerPrint = () => {
        setTimeout(() => {
          printWindow.print();
          // Close the window after printing (optional - user can cancel)
          // printWindow.close();
        }, 500);
      };
      
      if (printWindow.document.readyState === 'complete') {
        triggerPrint();
      } else {
        printWindow.onload = triggerPrint;
      }
    }
  };

  // List View - Table Format
  if (currentView === "list") {
    return (
      <div className="min-h-screen bg-gradient-subtle p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{t("worksheet.title")}</h1>
              <p className="text-muted-foreground">{t("worksheet.description")}</p>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              {t("worksheet.createWorksheet")}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("worksheet.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingWorksheets ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("worksheet.loading")}
                </div>
              ) : filteredWorksheets.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? t("worksheet.noResults") : t("worksheet.noWorksheets")}
                  </p>
                  {!searchQuery && (
                    <Button onClick={handleAddNew} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("worksheet.createWorksheet")}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">{t("worksheet.educationLevel")}</TableHead>
                        <TableHead className="w-[200px]">{t("worksheet.areaTopic")}</TableHead>
                        <TableHead>{t("worksheet.worksheetTitle")}</TableHead>
                        <TableHead className="w-[120px]">{t("worksheet.dateCreated")}</TableHead>
                        <TableHead className="w-[100px]">{t("worksheet.difficulty")}</TableHead>
                        <TableHead className="w-[150px] text-right">{t("worksheet.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWorksheets.map((worksheet) => (
                        <TableRow key={worksheet.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Badge variant="secondary">
                              {worksheet.educationLevel === "elementary" ? t("worksheet.elementarySchool") :
                               worksheet.educationLevel === "high-school" ? t("worksheet.highSchool") :
                               t("worksheet.higherEducation")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{worksheet.subjectArea}</p>
                              <p className="text-xs text-muted-foreground">{worksheet.year}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{worksheet.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {worksheet.learningObjective}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(worksheet.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {worksheet.difficultyLevel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(worksheet)}
                                title={t("worksheet.view")}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(worksheet)}
                                title={t("worksheet.edit")}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(worksheet.id)}
                                title={t("worksheet.delete")}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("teacher.editor.back")}
            </Button>
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("worksheet.confirmDelete")}</DialogTitle>
                <DialogDescription>
                  {t("worksheet.confirmDeleteMessage")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  {t("worksheet.cancel")}
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  {t("worksheet.delete")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // Preview View
  if (currentView === "preview" && worksheetResult) {
    // Determine which view to go back to (edit if editing, create if creating)
    const backView = editingWorksheetId ? "edit" : "create";
    
    // Navigation between pages
    const pages: Array<{ key: "worksheet" | "instruction" | "answerSheet"; label: string }> = [
      { key: "worksheet", label: t("worksheet.worksheet") }
    ];
    if (worksheetResult.instructionPage) {
      pages.push({ key: "instruction", label: t("worksheet.instruction") });
    }
    if (worksheetResult.answerSheet) {
      pages.push({ key: "answerSheet", label: t("worksheet.answerSheet") });
    }
    
    const currentPageIndex = pages.findIndex(p => p.key === currentPreviewPage);
    const canGoBack = currentPageIndex > 0;
    const canGoForward = currentPageIndex < pages.length - 1;
    
    const handlePreviousPage = () => {
      if (canGoBack) {
        setCurrentPreviewPage(pages[currentPageIndex - 1].key);
      }
    };
    
    const handleNextPage = () => {
      if (canGoForward) {
        setCurrentPreviewPage(pages[currentPageIndex + 1].key);
      }
    };
    
    // Get current page content
    const getCurrentPageContent = () => {
      switch (currentPreviewPage) {
        case "instruction":
          return editableContent.instruction || worksheetResult.instructionPage || "";
        case "answerSheet":
          return editableContent.answerSheet || worksheetResult.answerSheet || "";
        case "worksheet":
          return typeof editableContent.worksheet === "string"
            ? editableContent.worksheet
            : formatContent(worksheetResult.worksheetContent);
        default:
          return editableContent.worksheet || worksheetResult.worksheetContent || worksheetResult.content || "";
      }
    };
    
    const getCurrentPageTitle = () => {
      const title = editableContent.title || worksheetResult.title || "";
      switch (currentPreviewPage) {
        case "instruction":
          return `${title} - ${t("worksheet.instruction")}`;
        case "answerSheet":
          return `${title} - ${t("worksheet.answerSheet")}`;
        default:
          return title;
      }
    };
    
    return (
      <div className="min-h-screen bg-gradient-subtle p-8 print:p-0 print:bg-white">
        <div className="max-w-4xl mx-auto print:max-w-full">
          <div className="flex flex-col gap-4 mb-6 print:hidden">
            {/* Top row: Navigation and actions */}
            <div className="flex gap-4 items-center">
              <Button variant="outline" onClick={() => setCurrentView(backView)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("worksheet.backToEditor")}
              </Button>
              {selectedWorksheet && (
                <Button variant="outline" onClick={() => handleEdit(selectedWorksheet)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t("worksheet.edit")}
                </Button>
              )}
              <Button variant="default" onClick={handleSaveWorksheet} className="ml-auto">
                <Save className="h-4 w-4 mr-2" />
                {t("worksheet.save")}
              </Button>
            </div>
            
            {/* Page Navigation */}
            {pages.length > 1 && (
              <div className="flex items-center justify-center gap-4 bg-card p-4 rounded-lg border">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!canGoBack}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t("worksheet.previous")}
                </Button>
                <div className="flex items-center gap-2">
                  {pages.map((page, index) => (
                    <Button
                      key={page.key}
                      variant={currentPreviewPage === page.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPreviewPage(page.key)}
                    >
                      {page.label}
                    </Button>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!canGoForward}
                >
                  {t("worksheet.next")}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
            
            {/* Layout options */}
            <Card className="print:hidden">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  {t("worksheet.layoutOptions")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Spacing: Compact vs Full */}
                  <div className="space-y-2">
                    <Label>{t("worksheet.spacing")}</Label>
                    <Select
                      value={layoutOptions.spacing}
                      onValueChange={(value: "compact" | "full") =>
                        setLayoutOptions(prev => ({ ...prev, spacing: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">{t("worksheet.compact")}</SelectItem>
                        <SelectItem value="full">{t("worksheet.full")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Layout: Vertical vs Horizontal */}
                  <div className="space-y-2">
                    <Label>{t("worksheet.layout")}</Label>
                    <Select
                      value={layoutOptions.layout}
                      onValueChange={(value: "vertical" | "horizontal") =>
                        setLayoutOptions(prev => ({ ...prev, layout: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vertical">{t("worksheet.vertical")}</SelectItem>
                        <SelectItem value="horizontal">{t("worksheet.horizontal")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Columns: 1, 2, 3 */}
                  <div className="space-y-2">
                    <Label>{t("worksheet.columns")}</Label>
                    <Select
                      value={layoutOptions.columns.toString()}
                      onValueChange={(value) =>
                        setLayoutOptions(prev => ({ ...prev, columns: parseInt(value) as 1 | 2 | 3 }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 {t("worksheet.column")}</SelectItem>
                        <SelectItem value="2">2 {t("worksheet.columns")}</SelectItem>
                        <SelectItem value="3">3 {t("worksheet.columns")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Print Options */}
                <div className="space-y-2 border-t pt-4">
                  <Label className="text-sm font-semibold">{t("worksheet.printOptions")}</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="print-instruction"
                        checked={layoutOptions.printInstruction}
                        onChange={(e) => setLayoutOptions(prev => ({ ...prev, printInstruction: e.target.checked }))}
                        className="h-4 w-4"
                        disabled={!worksheetResult.instructionPage}
                      />
                      <Label htmlFor="print-instruction" className="text-sm font-normal cursor-pointer">
                        {t("worksheet.includeInstruction")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="print-answer-sheet"
                        checked={layoutOptions.printAnswerSheet}
                        onChange={(e) => setLayoutOptions(prev => ({ ...prev, printAnswerSheet: e.target.checked }))}
                        className="h-4 w-4"
                        disabled={!worksheetResult.answerSheet}
                      />
                      <Label htmlFor="print-answer-sheet" className="text-sm font-normal cursor-pointer">
                        {t("worksheet.includeAnswerSheet")}
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Open preview in a new window
                      const previewWindow = window.open('', '_blank');
                      if (previewWindow) {
                        const previewContent = generatePreviewHTML();
                        previewWindow.document.write(previewContent);
                        previewWindow.document.close();
                      }
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {t("worksheet.preview")}
                  </Button>
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    {t("worksheet.print")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Preview Card with Layout Options Applied */}
          {layoutOptions.showPreview ? (
            <Card className="print:shadow-none print:border-0 print:bg-white">
              <CardHeader className="print:pb-4 print:border-b-2 print:border-gray-300">
              <Input
                value={editableContent.title || worksheetResult.title || ""}
                onChange={(e) => setEditableContent(prev => ({ ...prev, title: e.target.value }))}
                className="text-2xl print:text-3xl print:font-bold font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0"
                placeholder="Worksheet Title"
              />
              <CardDescription className="print:text-base print:mt-2">
                {formData.educationLevel === "elementary" ? t("worksheet.elementarySchool") : 
                 formData.educationLevel === "high-school" ? t("worksheet.highSchool") : 
                 t("worksheet.higherEducation")} - {formData.year} - {formData.subjectArea}
              </CardDescription>
            </CardHeader>
            <CardContent 
              className={`prose max-w-none print:prose-lg print:mt-8 ${
                layoutOptions.spacing === "compact" 
                  ? "leading-tight [&>*]:my-1 [&>h1]:my-2 [&>h2]:my-2 [&>h3]:my-2 [&>p]:my-0.5" 
                  : "leading-relaxed"
              }`}
              style={{
                columnCount: layoutOptions.columns > 1 ? layoutOptions.columns : undefined,
                columnGap: layoutOptions.columns > 1 ? "1.5rem" : undefined,
                columnFill: layoutOptions.layout === "horizontal" ? "balance" : "auto",
                padding: layoutOptions.spacing === "compact" ? "0.75rem" : undefined,
                ...(layoutOptions.spacing === "compact" && {
                  marginTop: "0.5rem",
                  marginBottom: "0.5rem"
                })
              }}
            >
              <div 
                className={`whitespace-pre-wrap text-foreground print:text-black ${
                  layoutOptions.layout === "horizontal" && layoutOptions.columns === 1 ? "flex flex-wrap gap-4" : ""
                }`}
                style={{
                  display: layoutOptions.layout === "horizontal" && layoutOptions.columns === 1 ? "flex" : "block",
                  flexDirection: layoutOptions.layout === "horizontal" && layoutOptions.columns === 1 ? "row" : "column",
                  ...(layoutOptions.spacing === "compact" && {
                    marginTop: "0.1em",
                    marginBottom: "0.1em"
                  })
                }}
              >
                <Textarea
                  value={getCurrentPageContent()}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    switch (currentPreviewPage) {
                      case "instruction":
                        setEditableContent(prev => ({ ...prev, instruction: newValue }));
                        break;
                      case "answerSheet":
                        setEditableContent(prev => ({ ...prev, answerSheet: newValue }));
                        break;
                      default:
                        setEditableContent(prev => ({ ...prev, worksheet: newValue }));
                    }
                  }}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder={currentPreviewPage === "instruction" 
                    ? t("worksheet.editInstruction")
                    : currentPreviewPage === "answerSheet"
                    ? t("worksheet.editAnswerSheet")
                    : t("worksheet.editWorksheet")}
                />
              </div>
              {(selectedWorksheet?.references || (!selectedWorksheet && formData.references)) && (
                <div className="mt-8 pt-6 border-t print:mt-12">
                  <h3 className="font-semibold mb-2 print:text-lg">{t("worksheet.references")}:</h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap print:text-base print:text-black">
                    {selectedWorksheet?.references || formData.references}
                  </div>
                </div>
              )}
              </CardContent>
            </Card>
          ) : (
            /* Default view when preview is hidden */
            <Card className="print:shadow-none print:border-0 print:bg-white">
              <CardHeader className="print:pb-4 print:border-b-2 print:border-gray-300">
                {currentPreviewPage === "worksheet" ? (
                  <Input
                    value={editableContent.title || worksheetResult.title || ""}
                    onChange={(e) => setEditableContent(prev => ({ ...prev, title: e.target.value }))}
                    className="text-2xl print:text-3xl print:font-bold font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0"
                    placeholder="Worksheet Title"
                  />
                ) : (
                  <CardTitle className="text-2xl print:text-3xl print:font-bold">
                    {currentPreviewPage === "instruction" 
                      ? `${editableContent.title || worksheetResult.title || ""} - ${t("worksheet.instruction")}`
                      : currentPreviewPage === "answerSheet"
                      ? `${editableContent.title || worksheetResult.title || ""} - ${t("worksheet.answerSheet")}`
                      : editableContent.title || worksheetResult.title || ""}
                  </CardTitle>
                )}
                <CardDescription className="print:text-base print:mt-2">
                  {formData.educationLevel === "elementary" ? t("worksheet.elementarySchool") : 
                   formData.educationLevel === "high-school" ? t("worksheet.highSchool") : 
                   t("worksheet.higherEducation")} - {formData.year} - {formData.subjectArea}
                </CardDescription>
                {selectedWorksheet?.learningObjective && (
                  <div className="mt-4 print:mt-6">
                    <p className="text-sm font-semibold print:text-base">{t("worksheet.learningObjective")}:</p>
                    <p className="text-sm text-muted-foreground print:text-base print:text-black">{selectedWorksheet.learningObjective}</p>
                  </div>
                )}
                {!selectedWorksheet && formData.learningObjective && (
                  <div className="mt-4 print:mt-6">
                    <p className="text-sm font-semibold print:text-base">{t("worksheet.learningObjective")}:</p>
                    <p className="text-sm text-muted-foreground print:text-base print:text-black">{formData.learningObjective}</p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="prose max-w-none print:prose-lg print:mt-8">
                <Textarea
                  value={getCurrentPageContent()}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    switch (currentPreviewPage) {
                      case "instruction":
                        setEditableContent(prev => ({ ...prev, instruction: newValue }));
                        break;
                      case "answerSheet":
                        setEditableContent(prev => ({ ...prev, answerSheet: newValue }));
                        break;
                      default:
                        setEditableContent(prev => ({ ...prev, worksheet: newValue }));
                    }
                  }}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder={currentPreviewPage === "instruction" 
                    ? t("worksheet.editInstruction")
                    : currentPreviewPage === "answerSheet"
                    ? t("worksheet.editAnswerSheet")
                    : t("worksheet.editWorksheet")}
                />
                {(selectedWorksheet?.references || (!selectedWorksheet && formData.references)) && (
                  <div className="mt-8 pt-6 border-t print:mt-12">
                    <h3 className="font-semibold mb-2 print:text-lg">{t("worksheet.references")}:</h3>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap print:text-base print:text-black">
                      {selectedWorksheet?.references || formData.references}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {editingWorksheetId ? t("worksheet.editWorksheet") : t("worksheet.title")}
            </CardTitle>
            <CardDescription>
              {editingWorksheetId 
                ? t("worksheet.editWorksheetDescription") 
                : t("worksheet.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 1. Education Level */}
            <div className="space-y-2">
              <Label htmlFor="education-level">1. {t("worksheet.educationLevel")} *</Label>
              <Select
                value={formData.educationLevel}
                onValueChange={(value) => {
                  console.log('📝 Education Level changed to:', value);
                  setFormData(prev => {
                    const updated = { ...prev, educationLevel: value };
                    console.log('📝 Updated formData.educationLevel:', updated.educationLevel);
                    return updated;
                  });
                }}
              >
                <SelectTrigger id="education-level">
                  <SelectValue placeholder={t("worksheet.selectEducationLevel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elementary">{t("worksheet.elementarySchool")}</SelectItem>
                  <SelectItem value="high-school">{t("worksheet.highSchool")}</SelectItem>
                  <SelectItem value="higher-education">{t("worksheet.higherEducation")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 2. Language */}
            <div className="space-y-2">
              <Label htmlFor="worksheet-language">2. Language *</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, language: value }));
                }}
              >
                <SelectTrigger id="worksheet-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="no">Norwegian</SelectItem>
                  <SelectItem value="vi">Vietnamese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 2. Year */}
            {formData.educationLevel && (
              <div className="space-y-2">
                <Label htmlFor="year">3. {t("worksheet.year")} *</Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => {
                    console.log('📝 Year changed to:', value);
                    setFormData(prev => {
                      const updated = { ...prev, year: value };
                      console.log('📝 Updated formData.year:', updated.year);
                      return updated;
                    });
                  }}
                >
                  <SelectTrigger id="year">
                    <SelectValue placeholder={t("worksheet.selectYear")} />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 3. Subject/Area */}
            {formData.educationLevel && (
              <div className="space-y-2">
                <Label htmlFor="subject-area">
                  4. {formData.educationLevel === "higher-education" ? t("worksheet.area") : t("worksheet.subjectArea")} *
                </Label>
                <Select
                  value={formData.subjectArea}
                  onValueChange={(value) => {
                    console.log('📝 Subject Area changed to:', value);
                    setFormData(prev => {
                      const updated = { ...prev, subjectArea: value };
                      console.log('📝 Updated formData.subjectArea:', updated.subjectArea);
                      return updated;
                    });
                  }}
                >
                  <SelectTrigger id="subject-area">
                    <SelectValue placeholder={formData.educationLevel === "higher-education" ? t("worksheet.selectArea") : t("worksheet.selectSubjectArea")} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 4. Learning Objective */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="learning-objective">4. {t("worksheet.learningObjective")} *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateLearningObjective}
                  disabled={isGenerating}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("worksheet.showExample")}
                </Button>
              </div>
              <Textarea
                id="learning-objective"
                placeholder={t("worksheet.learningObjectivePlaceholder")}
                value={formData.learningObjective}
                onChange={(e) => setFormData(prev => ({ ...prev, learningObjective: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>

            {/* 5. Difficulty Level */}
            <div className="space-y-2">
              <Label>5. {t("worksheet.difficultyLevel")} *</Label>
              <RadioGroup
                value={formData.difficultyLevel}
                onValueChange={(value: "easy" | "medium" | "hard") => 
                  setFormData(prev => ({ ...prev, difficultyLevel: value }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="easy" id="difficulty-easy" />
                  <Label htmlFor="difficulty-easy" className="font-normal cursor-pointer">{t("worksheet.difficultyEasy")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="difficulty-medium" />
                  <Label htmlFor="difficulty-medium" className="font-normal cursor-pointer">{t("worksheet.difficultyMedium")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hard" id="difficulty-hard" />
                  <Label htmlFor="difficulty-hard" className="font-normal cursor-pointer">{t("worksheet.difficultyHard")}</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 6. Format Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="format-description">6. {t("worksheet.formatDescription")} *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateFormatDescription}
                  disabled={isGenerating}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("worksheet.showExample")}
                </Button>
              </div>
              <Textarea
                id="format-description"
                placeholder={t("worksheet.formatDescriptionPlaceholder")}
                value={formData.formatDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, formatDescription: e.target.value }))}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                {t("worksheet.formatDescriptionHint")}
              </p>
            </div>

            {/* 7. Examples */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="examples">7. {t("worksheet.examples")}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateExamples}
                  disabled={isGenerating}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("worksheet.showExample")}
                </Button>
              </div>
              <Textarea
                id="examples"
                placeholder={t("worksheet.examplesPlaceholder")}
                value={formData.examples}
                onChange={(e) => setFormData(prev => ({ ...prev, examples: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>

            {/* 8. References (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="references">8. {t("worksheet.references")}</Label>
              <Textarea
                id="references"
                placeholder={t("worksheet.referencesPlaceholder")}
                value={formData.references}
                onChange={(e) => setFormData(prev => ({ ...prev, references: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setCurrentView("list")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("worksheet.backToList")}
              </Button>
              
              {/* Go to Result button (only show if worksheetResult exists) */}
              {worksheetResult && (
                <Button variant="outline" onClick={() => setCurrentView("preview")}>
                  <Eye className="h-4 w-4 mr-2" />
                  {t("worksheet.viewResult")}
                </Button>
              )}
              
              {/* Save button (only show if worksheetResult exists) */}
              {worksheetResult && (
                <Button variant="default" onClick={handleSaveWorksheet}>
                  <Save className="h-4 w-4 mr-2" />
                  {t("worksheet.save")}
                </Button>
              )}
              
              <Button
                onClick={handleGenerateWorksheet}
                disabled={isGenerating || !formData.educationLevel || !formData.year || !formData.subjectArea || !formData.learningObjective || !formData.formatDescription}
                className="ml-auto"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    {t("worksheet.generating")}
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    {editingWorksheetId ? t("worksheet.updateWorksheet") : t("worksheet.generateWorksheet")}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

