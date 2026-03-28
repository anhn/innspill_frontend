/**
 * Monitoring Dashboard for School Users
 * 
 * This component provides three tabs for monitoring platform usage:
 * 1. Users Tab: Shows all users sorted by registration time
 * 2. Actions Tab: Shows the most recent actions
 * 3. Tokens Tab: Shows token usage by time windows (daily/weekly/monthly)
 * 
 * Backend Endpoints:
 * 
 * 1. GET /api/v1/users
 *    Query Parameters:
 *      - limit (optional): Integer, 1-1000. Limits the number of results.
 *      - sortBy (optional): "lastActive" | "date_created". Default: "date_created".
 *      - sortOrder (optional): "asc" | "desc". Default: "desc".
 *      - type (optional): "teacher" | "student" | "admin". Filter by user type.
 *      - courseId (optional): String. Filter by course assignment.
 *    Response (200):
 *      {
 *        success: true,
 *        data: [
 *          {
 *            id: string,
 *            username: string,
 *            email: string,
 *            fullName: string,
 *            type: "teacher" | "student" | "admin",
 *            lastActive: "ISO date string" | null,
 *            date_created: "ISO date string"
 *          }
 *        ]
 *      }
 * 
 * 2. GET /api/v1/logs/actions
 *    Query Parameters:
 *      - limit (optional): Integer, 1-1000. Default: 50.
 *      - sortBy (optional): "timestamp". Default: "timestamp".
 *      - sortOrder (optional): "asc" | "desc". Default: "desc".
 *      - page (optional): Integer, min 1. Default: 1.
 *      - action (optional): String. Filter by action type.
 *      - coursePlanName (optional): String. Filter by course plan name.
 *      - startDate (optional): ISO date string. Filter by start date.
 *      - endDate (optional): ISO date string. Filter by end date.
 *    Response (200):
 *      {
 *        success: true,
 *        data: {
 *          logs: [
 *            {
 *              _id: string,
 *              userId: string | null,
 *              username: string | null,
 *              sessionId: string | null,
 *              timestamp: "ISO date string",
 *              action: string,
 *              endpoint: string,
 *              method: "GET" | "POST" | "PUT" | "DELETE",
 *              tokenUsage: {
 *                promptTokens: number,
 *                completionTokens: number,
 *                totalTokens: number
 *              } | null
 *            }
 *          ],
 *          pagination: {
 *            page: number,
 *            limit: number,
 *            total: number,
 *            pages: number
 *          }
 *        }
 *      }
 * 
 * 3. GET /api/v1/monitoring/llm-usage
 *    Query Parameters:
 *      - period (required): "daily" | "weekly" | "monthly". Time period for aggregation.
 *      - startDate (optional): ISO date string. Override period start.
 *      - endDate (optional): ISO date string. Override period end.
 *      - userId (optional): String. Filter by specific user.
 *      - module (optional): "aiLiteracy" | "prompting" | "assessment" | "worksheets". Filter by module.
 *    Response (200):
 *      {
 *        success: true,
 *        data: {
 *          period: "daily" | "weekly" | "monthly",
 *          startDate: "ISO date string",
 *          endDate: "ISO date string",
 *          summary: {
 *            totalRequestSize: number,
 *            totalResponseSize: number,
 *            totalProcessingTime: number,
 *            totalRequestCount: number,
 *            averageRequestSize: number,
 *            averageResponseSize: number,
 *            averageProcessingTime: number
 *          },
 *          dailyBreakdown: [
 *            {
 *              date: "YYYY-MM-DD",
 *              totalRequestSize: number,
 *              totalResponseSize: number,
 *              totalProcessingTime: number,
 *              byModule: {
 *                aiLiteracy: { requestSize: number, responseSize: number, processingTime: number },
 *                prompting: { requestSize: number, responseSize: number, processingTime: number },
 *                assessment: { requestSize: number, responseSize: number, processingTime: number },
 *                worksheets: { requestSize: number, responseSize: number, processingTime: number }
 *              }
 *            }
 *          ]
 *        }
 *      }
 * 
 * ACTIVITY TAB ENDPOINTS (New/Updated):
 * 
 * 4. GET /api/v1/monitoring/activity/ai-literacy
 *    Query Parameters:
 *      - limit (optional): Integer, 1-1000. Default: 50.
 *      - sortBy (optional): "progress" | "timestamp" | "level". Default: "progress".
 *      - sortOrder (optional): "asc" | "desc". Default: "desc".
 *    Response (200):
 *      {
 *        success: true,
 *        data: [
 *          {
 *            userId: string,
 *            username: string,
 *            progress: number, // 0-100
 *            level: number, // Current level
 *            timestamp: "ISO date string", // Last activity
 *            completedLevels: number[]
 *          }
 *        ]
 *      }
 * 
 * 5. GET /api/v1/monitoring/activity/prompt-revision
 *    Query Parameters:
 *      - limit (optional): Integer, 1-1000. Default: 50.
 *      - sortBy (optional): "timestamp". Default: "timestamp".
 *      - sortOrder (optional): "asc" | "desc". Default: "desc".
 *    Response (200):
 *      {
 *        success: true,
 *        data: [
 *          {
 *            userId: string,
 *            username: string,
 *            timestamp: "ISO date string",
 *            action: string, // e.g., "prompt-revise", "prompt-create"
 *            promptId: string,
 *            endpoint: string
 *          }
 *        ]
 *      }
 * 
 * 6. GET /api/v1/monitoring/activity/management-tools
 *    Query Parameters:
 *      - limit (optional): Integer, 1-1000. Default: 50.
 *      - toolType (optional): "all" | "swot" | "planning-poker". Filter by tool type.
 *      - sortBy (optional): "timestamp". Default: "timestamp".
 *      - sortOrder (optional): "asc" | "desc". Default: "desc".
 *    Response (200):
 *      {
 *        success: true,
 *        data: [
 *          {
 *            userId: string,
 *            username: string,
 *            toolType: "SWOT" | "Planning Poker" | "Management Tool",
 *            timestamp: "ISO date string",
 *            groupId?: string,
 *            projectId?: string
 *          }
 *        ]
 *      }
 * 
 * 7. GET /api/v1/assessment-submissions (UPDATE - Already exists, may need query params)
 *    Query Parameters:
 *      - limit (optional): Integer, 1-1000. Default: 50.
 *      - sortBy (optional): "createdAt" | "updatedAt". Default: "createdAt".
 *      - sortOrder (optional): "asc" | "desc". Default: "desc".
 *      - distinctUsers (optional): Boolean. If true, return only latest submission per user. Default: false.
 *    Response (200):
 *      {
 *        success: true,
 *        data: [
 *          {
 *            id: string,
 *            studentId: string,
 *            student: { id: string, username: string },
 *            taskId: string,
 *            projectId: string,
 *            createdAt: "ISO date string",
 *            updatedAt: "ISO date string"
 *          }
 *        ],
 *        pagination?: { page, limit, total, pages }
 *      }
 * 
 * 8. GET /api/v1/monitoring/activity/chat-sessions
 *    Query Parameters:
 *      - limit (optional): Integer, 1-1000. Default: 50.
 *      - sortBy (optional): "timestamp". Default: "timestamp".
 *      - sortOrder (optional): "asc" | "desc". Default: "desc".
 *    Response (200):
 *      {
 *        success: true,
 *        data: [
 *          {
 *            userId: string,
 *            username: string,
 *            sessionId: string,
 *            timestamp: "ISO date string",
 *            messageCount: number
 *          }
 *        ]
 *      }
 *    Alternative: Could use existing GET /api/v1/chat-messages with aggregation/grouping
 * 
 * 9. GET /api/v1/monitoring/activity/quiz-completions
 *    Query Parameters:
 *      - limit (optional): Integer, 1-1000. Default: 50.
 *      - sortBy (optional): "timestamp". Default: "timestamp".
 *      - sortOrder (optional): "asc" | "desc". Default: "desc".
 *    Response (200):
 *      {
 *        success: true,
 *        data: [
 *          {
 *            userId: string,
 *            username: string,
 *            quizId: string,
 *            quizTitle?: string,
 *            timestamp: "ISO date string",
 *            score?: number
 *          }
 *        ]
 *      }
 *    Alternative: Could use existing GET /api/v1/quiz-submissions with aggregation/grouping
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import API_ENDPOINTS from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { getStoredRole, ROLE_ROUTES } from "@/constants/roles";
import { format } from "date-fns";

interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  type: "teacher" | "student" | "admin";
  lastActive: string | null; // ISO date string or null
  date_created: string; // ISO date string
}

interface ActionLog {
  _id: string;
  userId: string | null;
  username: string | null;
  sessionId: string | null;
  timestamp: string; // ISO date string
  action: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
}

interface TokenWindow {
  windowLabel: string;
  windowStart: string;
  windowEnd: string;
  totalTokens: number;
      requestTokens: number;
      responseTokens: number;
}

export default function Monitoring() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"users" | "actions" | "tokens" | "activity">("users");
  const [windowType, setWindowType] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [activitySubTab, setActivitySubTab] = useState<"aiLiteracy" | "promptRevision" | "managementTool" | "assignmentSubmission" | "chat" | "quiz">("aiLiteracy");
  
  // Users tab state
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState<20 | 50>(20);
  
  // Sorting state for users table
  const [allUsersSortConfig, setAllUsersSortConfig] = useState<{ key: keyof User | null; direction: "asc" | "desc" }>({ key: null, direction: "asc" });
  
  // Actions tab state
  const [actions, setActions] = useState<ActionLog[]>([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [allActions, setAllActions] = useState<ActionLog[]>([]); // Store all actions for filtering
  
  // Tokens tab state
  const [tokenWindows, setTokenWindows] = useState<TokenWindow[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  // Activity tab state
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [managementToolFilter, setManagementToolFilter] = useState<string>("all");

  // Check if user has school role
  useEffect(() => {
    const role = getStoredRole();
    if (role !== "school") {
      const destination = ROLE_ROUTES[role] || "/ai-teacher";
      navigate(destination, { replace: true });
    }
  }, [navigate]);

  // Fetch data when tab or window type changes
  useEffect(() => {
    if (activeTab === "users") {
      fetchAllUsers();
    } else if (activeTab === "actions") {
      fetchActions();
    } else if (activeTab === "tokens") {
      fetchTokenUsage();
    } else if (activeTab === "activity") {
      fetchActivityData();
    }
  }, [activeTab, windowType, activitySubTab, managementToolFilter]);

  // Reset to page 1 when items per page changes
  useEffect(() => {
    setUsersPage(1);
  }, [usersPerPage]);

  // Filter actions when actionTypeFilter changes
  useEffect(() => {
    if (actionTypeFilter !== "all") {
      setActions(allActions.filter(log => log.action === actionTypeFilter).slice(0, 50));
    } else {
      setActions(allActions.slice(0, 50));
    }
  }, [actionTypeFilter, allActions]);

  const fetchAllUsers = async () => {
    setLoadingAllUsers(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.users.list}?sortBy=date_created&sortOrder=desc`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to load all users");
      const usersList: User[] = data?.data || [];
      setAllUsers(usersList);
    } catch (err) {
      setAllUsers([]);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load all users",
        variant: "destructive",
      });
    } finally {
      setLoadingAllUsers(false);
    }
  };

  const fetchActions = async () => {
    setLoadingActions(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.logs.actions}?limit=1000&sortBy=timestamp&sortOrder=desc`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to load actions");
      const logs: ActionLog[] = data?.data?.logs || [];
      setAllActions(logs);
      // Apply filter if set
      if (actionTypeFilter !== "all") {
        setActions(logs.filter(log => log.action === actionTypeFilter).slice(0, 50));
      } else {
        setActions(logs.slice(0, 50));
      }
    } catch (err) {
      setActions([]);
      setAllActions([]);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load actions",
        variant: "destructive",
      });
    } finally {
      setLoadingActions(false);
    }
  };

  const fetchTokenUsage = async () => {
    setLoadingTokens(true);
    try {
      // For daily view, try to use "daily" period, but fallback to "weekly" if backend doesn't support it
      // The dailyBreakdown will be available in either case
      const periodParam = windowType === "daily" ? "weekly" : windowType;
      const res = await fetch(`${API_ENDPOINTS.monitoring.llmUsage}?period=${periodParam}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to load token usage");
      
      const llmData = data?.data;
      if (!llmData) {
        setTokenWindows([]);
        return;
      }

      // Extract windows from dailyBreakdown or create from summary
      const windows: TokenWindow[] = [];
      
      if (llmData.dailyBreakdown && Array.isArray(llmData.dailyBreakdown)) {
        if (windowType === "daily") {
          // For daily view, use the dailyBreakdown directly without grouping
          llmData.dailyBreakdown.forEach((day: any) => {
            const date = new Date(day.date);
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);
            
            windows.push({
              windowLabel: format(dayStart, "MMM d, yyyy"),
              windowStart: dayStart.toISOString(),
              windowEnd: dayEnd.toISOString(),
              totalTokens: (day.totalRequestSize || 0) + (day.totalResponseSize || 0),
              requestTokens: day.totalRequestSize || 0,
              responseTokens: day.totalResponseSize || 0,
            });
          });
        } else {
          // Group daily data into windows based on windowType (weekly or monthly)
          const grouped: { [key: string]: TokenWindow } = {};
          
          llmData.dailyBreakdown.forEach((day: any) => {
            const date = new Date(day.date);
            let windowKey: string;
            let windowLabel: string;
            let weekStart: Date | null = null;
            let monthStart: Date | null = null;
            
            if (windowType === "weekly") {
              // Get week start (Monday) - handle week that spans months/years
              weekStart = new Date(date);
              const dayOfWeek = weekStart.getDay();
              const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
              weekStart.setDate(diff);
              weekStart.setHours(0, 0, 0, 0);
              // Use YYYY-WW format for unique key
              const year = weekStart.getFullYear();
              const weekNum = getWeekNumber(weekStart);
              windowKey = `${year}-W${weekNum.toString().padStart(2, '0')}`;
              windowLabel = `Week of ${format(weekStart, "MMM d, yyyy")}`;
            } else {
              // Monthly
              monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
              windowKey = monthStart.toISOString();
              windowLabel = format(monthStart, "MMMM yyyy");
            }
            
            if (!grouped[windowKey]) {
              const windowEndDate = windowType === "weekly" && weekStart
                ? new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000) // Add 6 days to get Sunday
                : monthStart
                ? new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0) // Last day of month
                : new Date();
              grouped[windowKey] = {
                windowLabel,
                windowStart: windowType === "weekly" && weekStart ? weekStart.toISOString() : (monthStart ? monthStart.toISOString() : windowKey),
                windowEnd: windowEndDate.toISOString(),
                totalTokens: 0,
                requestTokens: 0,
                responseTokens: 0,
              };
            }
            
            // Use day-level totals directly (more accurate than summing byModule)
            grouped[windowKey].requestTokens += day.totalRequestSize || 0;
            grouped[windowKey].responseTokens += day.totalResponseSize || 0;
            grouped[windowKey].totalTokens = grouped[windowKey].requestTokens + grouped[windowKey].responseTokens;
          });
          
          windows.push(...Object.values(grouped));
        }
      } else if (llmData.summary) {
        // Fallback: create a single window from summary
        const labelMap = {
          daily: "Current Day",
          weekly: "Current Week",
          monthly: "Current Month"
        };
        windows.push({
          windowLabel: labelMap[windowType] || "Current Period",
          windowStart: llmData.startDate || new Date().toISOString(),
          windowEnd: llmData.endDate || new Date().toISOString(),
          totalTokens: (llmData.summary.totalRequestSize || 0) + (llmData.summary.totalResponseSize || 0),
          requestTokens: llmData.summary.totalRequestSize || 0,
          responseTokens: llmData.summary.totalResponseSize || 0,
        });
      }
      
      // Sort by windowStart descending (most recent first) and take top 10
      const sorted = windows.sort((a, b) => {
        return new Date(b.windowStart).getTime() - new Date(a.windowStart).getTime();
      });
      setTokenWindows(sorted.slice(0, 10));
    } catch (err) {
      setTokenWindows([]);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load token usage",
        variant: "destructive",
      });
    } finally {
      setLoadingTokens(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Never";
    try {
      return format(new Date(dateString), "MMM d, yyyy HH:mm");
    } catch {
      return "Invalid date";
    }
  };

  const formatTokenCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(2)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(2)}K`;
    return count.toString();
  };

  // Helper to get ISO week number
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const fetchActivityData = async () => {
    setLoadingActivity(true);
    try {
      let data: any[] = [];

      if (activitySubTab === "aiLiteracy") {
        // Use dedicated AI literacy endpoint (uses AILiteracyStatus collection)
        const res = await fetch(`${API_ENDPOINTS.monitoring.activity.aiLiteracy}?limit=50&sortBy=progress&sortOrder=desc`, {
          credentials: "include",
        });
        const result = await res.json();
        if (res.ok && result?.success) {
          data = result?.data || [];
        } else {
          console.warn("AI Literacy endpoint returned error:", result);
        }
      } else if (activitySubTab === "promptRevision") {
        // Use dedicated prompt revision endpoint
        const res = await fetch(`${API_ENDPOINTS.monitoring.activity.promptRevision}?limit=50&sortBy=timestamp&sortOrder=desc`, {
          credentials: "include",
        });
        const result = await res.json();
        if (res.ok && result?.success) {
          data = result?.data || [];
        } else {
          console.warn("Prompt Revision endpoint returned error:", result);
        }
      } else if (activitySubTab === "managementTool") {
        // Use dedicated management tools endpoint
        const toolTypeParam = managementToolFilter !== "all" ? `&toolType=${managementToolFilter}` : "";
        const res = await fetch(`${API_ENDPOINTS.monitoring.activity.managementTools}?limit=50&sortBy=timestamp&sortOrder=desc${toolTypeParam}`, {
          credentials: "include",
        });
        const result = await res.json();
        if (res.ok && result?.success) {
          data = result?.data || [];
        } else {
          console.warn("Management Tools endpoint returned error:", result);
        }
      } else if (activitySubTab === "assignmentSubmission") {
        // Use assessment-submissions with distinctUsers=true query param
        const res = await fetch(`${API_ENDPOINTS.assessmentSubmissions.list}?distinctUsers=true&limit=50&sortBy=createdAt&sortOrder=desc`, {
          credentials: "include",
        });
        const result = await res.json();
        if (res.ok && result?.success) {
          const submissions: any[] = result?.data || [];
          // Transform to match expected format
          data = submissions.map((sub: any) => ({
            userId: sub.studentId || sub.student?.id || "Unknown",
            username: sub.student?.username || sub.studentName || sub.username || "Unknown",
            timestamp: sub.createdAt || sub.timestamp || new Date().toISOString(),
            taskId: sub.taskId,
            projectId: sub.projectId,
          }));
        } else {
          console.warn("Assessment Submissions endpoint returned error:", result);
        }
      } else if (activitySubTab === "chat") {
        // Use dedicated chat sessions endpoint
        const res = await fetch(`${API_ENDPOINTS.monitoring.activity.chatSessions}?limit=50&sortBy=timestamp&sortOrder=desc`, {
          credentials: "include",
        });
        const result = await res.json();
        if (res.ok && result?.success) {
          data = result?.data || [];
        } else {
          console.warn("Chat Sessions endpoint returned error:", result);
        }
      } else if (activitySubTab === "quiz") {
        // Use dedicated quiz completions endpoint
        const res = await fetch(`${API_ENDPOINTS.monitoring.activity.quizCompletions}?limit=50&sortBy=timestamp&sortOrder=desc`, {
          credentials: "include",
        });
        const result = await res.json();
        if (res.ok && result?.success) {
          data = result?.data || [];
        } else {
          console.warn("Quiz Completions endpoint returned error:", result);
        }
      }

      setActivityData(data);
    } catch (err) {
      setActivityData([]);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load activity data",
        variant: "destructive",
      });
    } finally {
      setLoadingActivity(false);
    }
  };

  // Sorting functions
  const handleSort = (key: keyof User) => {
    setAllUsersSortConfig({
      key,
      direction: allUsersSortConfig.key === key && allUsersSortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  const sortedAllUsers = useMemo(() => {
    if (!allUsersSortConfig.key) return allUsers;
    const sorted = [...allUsers].sort((a, b) => {
      const aVal = a[allUsersSortConfig.key!];
      const bVal = b[allUsersSortConfig.key!];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        return allUsersSortConfig.direction === "asc" 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      // For dates
      const aDate = new Date(aVal as string).getTime();
      const bDate = new Date(bVal as string).getTime();
      return allUsersSortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
    });
    return sorted;
  }, [allUsers, allUsersSortConfig]);

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (usersPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return sortedAllUsers.slice(startIndex, endIndex);
  }, [sortedAllUsers, usersPage, usersPerPage]);

  const totalPages = Math.ceil(sortedAllUsers.length / usersPerPage);

  // Get unique action types for filter
  const uniqueActionTypes = useMemo(() => {
    const types = new Set(allActions.map(a => a.action).filter(Boolean));
    return Array.from(types).sort();
  }, [allActions]);

  // Sort icon helper
  const getSortIcon = (key: keyof User) => {
    if (allUsersSortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return allUsersSortConfig.direction === "asc" 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Monitoring Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Platform analytics and usage metrics
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "users" | "actions" | "tokens" | "activity")} className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>All Users (Sorted by Registration Time)</CardTitle>
                      <CardDescription>All users in the collection sorted by registration date (newest first)</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={usersPerPage.toString()} onValueChange={(v) => setUsersPerPage(v === "20" ? 20 : 50)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20">20 per page</SelectItem>
                          <SelectItem value="50">50 per page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                {loadingAllUsers ? (
                  <div className="text-center py-8 text-muted-foreground">Loading all users...</div>
                ) : allUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No users found</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              <Button variant="ghost" size="sm" className="h-8 -ml-3" onClick={() => handleSort("username")}>
                                Username {getSortIcon("username")}
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button variant="ghost" size="sm" className="h-8 -ml-3" onClick={() => handleSort("email")}>
                                Email {getSortIcon("email")}
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button variant="ghost" size="sm" className="h-8 -ml-3" onClick={() => handleSort("fullName")}>
                                Full Name {getSortIcon("fullName")}
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button variant="ghost" size="sm" className="h-8 -ml-3" onClick={() => handleSort("type")}>
                                Type {getSortIcon("type")}
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button variant="ghost" size="sm" className="h-8 -ml-3" onClick={() => handleSort("lastActive")}>
                                Last Active {getSortIcon("lastActive")}
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button variant="ghost" size="sm" className="h-8 -ml-3" onClick={() => handleSort("date_created")}>
                                Registered {getSortIcon("date_created")}
                              </Button>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.fullName || "-"}</TableCell>
                              <TableCell>
                                <span className="capitalize">{user.type}</span>
                              </TableCell>
                              <TableCell>{formatDate(user.lastActive)}</TableCell>
                              <TableCell>{formatDate(user.date_created)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {(usersPage - 1) * usersPerPage + 1} to {Math.min(usersPage * usersPerPage, sortedAllUsers.length)} of {sortedAllUsers.length} users
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUsersPage(prev => Math.max(1, prev - 1))}
                          disabled={usersPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <div className="text-sm text-muted-foreground">
                          Page {usersPage} of {totalPages}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUsersPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={usersPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
                  </CardContent>
                </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Actions (Top 50 Most Recent)</CardTitle>
                      <CardDescription>Most recent actions sorted by timestamp</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by action type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Actions</SelectItem>
                          {uniqueActionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                {loadingActions ? (
                  <div className="text-center py-8 text-muted-foreground">Loading actions...</div>
                ) : actions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No actions found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Tokens</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {actions.map((action) => (
                          <TableRow key={action._id}>
                            <TableCell>{formatDate(action.timestamp)}</TableCell>
                            <TableCell>{action.username || action.userId || "Unknown"}</TableCell>
                            <TableCell>
                              <span className="font-medium">{action.action}</span>
                            </TableCell>
                            <TableCell>
                              {action.tokenUsage?.totalTokens || 0}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                  </CardContent>
                </Card>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-4">
                  <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Token Usage (Most Recent 10 Windows)</CardTitle>
                  <CardDescription>Total token usage by time window</CardDescription>
                </div>
                <Select value={windowType} onValueChange={(v) => setWindowType(v as "daily" | "weekly" | "monthly")}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                  </CardHeader>
                  <CardContent>
                {loadingTokens ? (
                  <div className="text-center py-8 text-muted-foreground">Loading token usage...</div>
                ) : tokenWindows.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No token usage data found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Window</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Request Tokens</TableHead>
                          <TableHead>Response Tokens</TableHead>
                          <TableHead>Total Tokens</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tokenWindows.map((window, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{window.windowLabel}</TableCell>
                            <TableCell>{formatDate(window.windowStart)}</TableCell>
                            <TableCell>{formatDate(window.windowEnd)}</TableCell>
                            <TableCell>{formatTokenCount(window.requestTokens)}</TableCell>
                            <TableCell>{formatTokenCount(window.responseTokens)}</TableCell>
                            <TableCell className="font-semibold">{formatTokenCount(window.totalTokens)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                  </CardContent>
                </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Tabs value={activitySubTab} onValueChange={(v) => setActivitySubTab(v as "aiLiteracy" | "promptRevision" | "managementTool" | "assignmentSubmission" | "chat" | "quiz")}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="aiLiteracy">AI Literacy</TabsTrigger>
                <TabsTrigger value="promptRevision">Prompt Revision</TabsTrigger>
                <TabsTrigger value="managementTool">Management Tool</TabsTrigger>
                <TabsTrigger value="assignmentSubmission">Assignments</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
              </TabsList>

              {/* AI Literacy Sub-tab */}
              <TabsContent value="aiLiteracy">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Literacy Progress (Top 50)</CardTitle>
                    <CardDescription>Users with progress on AI literacy sorted by progress level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingActivity ? (
                      <div className="text-center py-8 text-muted-foreground">Loading AI literacy data...</div>
                    ) : activityData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No AI literacy data found</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Username</TableHead>
                              <TableHead>Progress</TableHead>
                              <TableHead>Level</TableHead>
                              <TableHead>Last Activity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activityData.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.username || item.userId}</TableCell>
                                <TableCell>{item.progress || 0}%</TableCell>
                                <TableCell>{item.level || 0}</TableCell>
                                <TableCell>{formatDate(item.timestamp)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Prompt Revision Sub-tab */}
              <TabsContent value="promptRevision">
                <Card>
                  <CardHeader>
                    <CardTitle>Prompt Revision Users (Top 50)</CardTitle>
                    <CardDescription>Users who use the latest prompt revision, sorted by most recent usage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingActivity ? (
                      <div className="text-center py-8 text-muted-foreground">Loading prompt revision data...</div>
                    ) : activityData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No prompt revision data found</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Username</TableHead>
                              <TableHead>Last Used</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activityData.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.username || item.userId}</TableCell>
                                <TableCell>{formatDate(item.timestamp)}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{item.action || "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Management Tool Sub-tab */}
              <TabsContent value="managementTool">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Management Tool Usage (Top 50 Most Recent)</CardTitle>
                      <CardDescription>Users who use management toolkit tools (SWOT, Planning Poker, etc.)</CardDescription>
                    </div>
                    <Select value={managementToolFilter} onValueChange={setManagementToolFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tools</SelectItem>
                        <SelectItem value="swot">SWOT</SelectItem>
                        <SelectItem value="planning">Planning Poker</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent>
                    {loadingActivity ? (
                      <div className="text-center py-8 text-muted-foreground">Loading management tool data...</div>
                    ) : activityData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No management tool usage found</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Username</TableHead>
                              <TableHead>Tool Type</TableHead>
                              <TableHead>Last Used</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activityData.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.username || item.userId}</TableCell>
                                <TableCell>{item.toolType || "Management Tool"}</TableCell>
                                <TableCell>{formatDate(item.timestamp)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Assignment Submission Sub-tab */}
              <TabsContent value="assignmentSubmission">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Submissions (Top 50 Most Recent)</CardTitle>
                    <CardDescription>Users who have submitted assignments, sorted by most recent submission</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingActivity ? (
                      <div className="text-center py-8 text-muted-foreground">Loading assignment submission data...</div>
                    ) : activityData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No assignment submissions found</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Username</TableHead>
                              <TableHead>Last Submission</TableHead>
                              <TableHead>Task ID</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activityData.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.username || item.userId}</TableCell>
                                <TableCell>{formatDate(item.timestamp)}</TableCell>
                                <TableCell className="text-sm text-muted-foreground font-mono">{item.taskId || "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Chat Sub-tab */}
              <TabsContent value="chat">
                <Card>
                  <CardHeader>
                    <CardTitle>Chat Sessions (Top 50 Most Recent)</CardTitle>
                    <CardDescription>Users with the most recent chat sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingActivity ? (
                      <div className="text-center py-8 text-muted-foreground">Loading chat data...</div>
                    ) : activityData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No chat sessions found</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Username</TableHead>
                              <TableHead>Last Chat</TableHead>
                              <TableHead>Session ID</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activityData.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.username || item.userId}</TableCell>
                                <TableCell>{formatDate(item.timestamp)}</TableCell>
                                <TableCell className="text-sm text-muted-foreground font-mono">{item.sessionId?.slice(0, 8) || "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Quiz Sub-tab */}
              <TabsContent value="quiz">
                <Card>
                  <CardHeader>
                    <CardTitle>Quiz Completions (Top 50 Most Recent)</CardTitle>
                    <CardDescription>Users with the most recent quiz completions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingActivity ? (
                      <div className="text-center py-8 text-muted-foreground">Loading quiz data...</div>
                    ) : activityData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No quiz completions found</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Username</TableHead>
                              <TableHead>Last Quiz</TableHead>
                              <TableHead>Quiz ID</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activityData.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.username || item.userId}</TableCell>
                                <TableCell>{formatDate(item.timestamp)}</TableCell>
                                <TableCell className="text-sm text-muted-foreground font-mono">{item.quizId?.slice(0, 8) || "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
