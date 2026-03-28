import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Activity, 
  Calendar as CalendarIcon, 
  Clock, 
  Database, 
  Filter, 
  RefreshCw, 
  Search,
  TrendingUp,
  User,
  Globe,
  BookOpen,
  Zap
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import API_ENDPOINTS from "@/config/api";
import { format } from "date-fns";

interface ChatHistoryProps {
  embedded?: boolean;
}

interface ActionLog {
  _id: string;
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent?: string;
  timestamp: string;
  action: string;
  endpoint: string;
  method: string;
  userInfo: {
    educationLevel: string;
    subjectArea: string;
    country: string;
    academicYear?: string;
    organization: string;
    language: string;
  };
  coursePlanName: string;
  requestSize: number;
  responseSize: number;
  tokenUsage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    total?: number;
    prompt?: number;
    completion?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  token_usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    total?: number;
    prompt?: number;
    completion?: number;
  };
  tokenUsageInternal?: any; // backend may store tokens under this field
  processingTime: number;
  success: boolean;
  errorMessage?: string;
  metadata?: any;
  openai?: { usage?: any };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ActionLogsResponse {
  success: boolean;
  data?: {
    logs: ActionLog[];
    pagination: Pagination;
  };
  logs?: ActionLog[];
  pagination?: Pagination;
}

const normalizeNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const extractTokensFromUsage = (usage: any): number => {
  if (!usage) return 0;
  if (typeof usage === "number") return normalizeNumber(usage);

  const directCandidates = [usage.totalTokens, usage.total_tokens, usage.total];
  for (const candidate of directCandidates) {
    const value = normalizeNumber(candidate);
    if (value > 0) return value;
  }

  const promptCandidates = [
    usage.promptTokens,
    usage.prompt_tokens,
    usage.prompt,
  ];
  const completionCandidates = [
    usage.completionTokens,
    usage.completion_tokens,
    usage.completion,
  ];

  for (let i = 0; i < promptCandidates.length; i++) {
    const prompt = normalizeNumber(promptCandidates[i]);
    const completion = normalizeNumber(completionCandidates[i]);
    if (prompt + completion > 0) {
      return prompt + completion;
    }
  }

  return 0;
};

const extractTokensFromLog = (log: ActionLog): number => {
  const candidates = [
    log.tokenUsageInternal,
    log.tokenUsage,
    log.token_usage,
    log.metadata?.tokenUsage,
    log.metadata?.token_usage,
    log.metadata?.usage,
    log.metadata?.openai?.usage,
    log.openai?.usage,
  ];

  for (const usage of candidates) {
    const value = extractTokensFromUsage(usage);
    if (value > 0) return value;
  }

  return 0;
};

export default function ActionHistory({ embedded = false }: ChatHistoryProps) {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    action: 'all',
    coursePlanName: '',
    startDate: '',
    endDate: '',
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [allLogsForStats, setAllLogsForStats] = useState<ActionLog[]>([]); // All filtered logs for stats calculation

  // Fetch all logs for stats calculation (without pagination)
  const fetchAllLogsForStats = async () => {
    try {
      const params = new URLSearchParams({
        limit: '10000', // Large limit to get all filtered logs
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.action && filters.action !== 'all' && { action: filters.action }),
        ...(filters.coursePlanName && { coursePlanName: filters.coursePlanName }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await fetch(`${API_ENDPOINTS.logs.actions}?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data: ActionLogsResponse = await response.json();
        const logsData = data.data?.logs || data.logs || [];
        setAllLogsForStats(logsData);
      }
    } catch (err) {
      console.error('Error fetching all logs for stats:', err);
      setAllLogsForStats([]);
    }
  };

  const fetchActionLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.action && filters.action !== 'all' && { action: filters.action }),
        ...(filters.coursePlanName && { coursePlanName: filters.coursePlanName }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await fetch(`${API_ENDPOINTS.logs.actions}?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch action logs: ${response.status} ${response.statusText}`);
      }

      const data: ActionLogsResponse = await response.json();

      const logsData = data.data?.logs || data.logs || [];
      const paginationData = data.data?.pagination || data.pagination || { page: 1, limit: 20, total: 0, pages: 0 };

      setLogs(logsData);
      setPagination(paginationData);
      
      // Fetch all logs for stats calculation
      await fetchAllLogsForStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch action logs';
      setError(errorMessage);
      console.error('Error fetching action logs:', err);

      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_CONNECTION_REFUSED')) {
        const mockLogs: ActionLog[] = [
          {
            _id: 'mock1',
            userId: 'user123',
            sessionId: 'session456',
            ipAddress: '192.168.1.100',
            timestamp: new Date().toISOString(),
            action: 'analyze-course-plan',
            endpoint: '/api/v1/chatbot/analyze-a-course-plan',
            method: 'POST',
            userInfo: {
              educationLevel: 'University',
              subjectArea: 'Mathematics',
              country: 'Norway',
              organization: 'University of Oslo',
              language: 'Norwegian'
            },
            coursePlanName: 'Mathematics Course Plan',
            requestSize: 1500,
            responseSize: 2000,
            tokenUsage: { totalTokens: 1500, promptTokens: 800, completionTokens: 700 },
            processingTime: 2500,
            success: true
          },
          {
            _id: 'mock2',
            userId: 'user123',
            sessionId: 'session456',
            ipAddress: '192.168.1.100',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            action: 'revise-course-plan',
            endpoint: '/api/v1/chatbot/revise-a-course-plan',
            method: 'POST',
            userInfo: {
              educationLevel: 'University',
              subjectArea: 'Science',
              country: 'Norway',
              organization: 'University of Oslo',
              language: 'English'
            },
            coursePlanName: 'Science Curriculum',
            requestSize: 2000,
            responseSize: 2500,
            tokenUsage: { totalTokens: 2100, promptTokens: 1200, completionTokens: 900 },
            processingTime: 3200,
            success: true
          },
          {
            _id: 'mock3',
            userId: 'tester',
            sessionId: 'session789',
            ipAddress: '192.168.1.100',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            action: 'login',
            endpoint: '/auth/login',
            method: 'POST',
            userInfo: {
              educationLevel: 'University',
              subjectArea: 'Education',
              country: 'Norway',
              organization: 'University of Oslo',
              language: 'Norwegian'
            },
            coursePlanName: '',
            requestSize: 0,
            responseSize: 0,
            tokenUsage: { totalTokens: 0, promptTokens: 0, completionTokens: 0 },
            processingTime: 0,
            success: true
          },
          {
            _id: 'mock4',
            userId: 'tester',
            sessionId: 'session789',
            ipAddress: '192.168.1.100',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            action: 'logout',
            endpoint: '/auth/logout',
            method: 'POST',
            userInfo: {
              educationLevel: 'University',
              subjectArea: 'Education',
              country: 'Norway',
              organization: 'University of Oslo',
              language: 'Norwegian'
            },
            coursePlanName: '',
            requestSize: 0,
            responseSize: 0,
            tokenUsage: { totalTokens: 0, promptTokens: 0, completionTokens: 0 },
            processingTime: 0,
            success: true
          }
        ];
        setLogs(mockLogs);
        setPagination({ page: 1, limit: 20, total: 4, pages: 1 });
      } else {
        setLogs([]);
        setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActionLogs();
  }, [pagination.page, filters]);

  // Extract unique action types from all logs
  const uniqueActionTypes = useMemo(() => {
    const actionSet = new Set<string>();
    allLogsForStats.forEach(log => {
      if (log.action) {
        actionSet.add(log.action);
      }
    });
    // Also check current page logs
    logs.forEach(log => {
      if (log.action) {
        actionSet.add(log.action);
      }
    });
    return Array.from(actionSet).sort();
  }, [allLogsForStats, logs]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      // Format as YYYY-MM-DDTHH:mm for API
      const formatted = format(date, "yyyy-MM-dd'T'HH:mm");
      handleFilterChange('startDate', formatted);
    } else {
      handleFilterChange('startDate', '');
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      // Format as YYYY-MM-DDTHH:mm for API
      const formatted = format(date, "yyyy-MM-dd'T'HH:mm");
      handleFilterChange('endDate', formatted);
    } else {
      handleFilterChange('endDate', '');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const summaryStats = useMemo(() => {
    // Use allLogsForStats for calculation (all filtered logs, not just current page)
    const logsForStats = allLogsForStats.length > 0 ? allLogsForStats : logs;
    
    if (logsForStats.length === 0) return null;

    const totalActions = logsForStats.length;
    const totalTokens = logsForStats.reduce(
      (sum, log) => sum + extractTokensFromLog(log),
      0
    );
    const totalProcessingTime = logsForStats.reduce(
      (sum, log) => sum + normalizeNumber(log.processingTime),
      0
    );
    const successCount = logsForStats.reduce((count, log) => count + (log.success ? 1 : 0), 0);
    const actionCounts = new Map<string, number>();
    const coursePlanCounts = new Map<string, number>();

    logsForStats.forEach((log) => {
      const actionKey = log.action || 'unknown';
      actionCounts.set(actionKey, (actionCounts.get(actionKey) || 0) + 1);

      const coursePlanKey = log.coursePlanName?.trim() || 'Untitled Course Plan';
      coursePlanCounts.set(coursePlanKey, (coursePlanCounts.get(coursePlanKey) || 0) + 1);
    });

    const topActions = Array.from(actionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([action, count]) => ({ action, count }));

    const topCoursePlans = Array.from(coursePlanCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([coursePlanName, count]) => ({ coursePlanName, count }));

    return {
      totalActions,
      totalTokens,
      averageProcessingTime: totalActions ? Math.round(totalProcessingTime / totalActions) : 0,
      successRate: totalActions ? successCount / totalActions : 0,
      topActions,
      topCoursePlans
    };
  }, [allLogsForStats, logs]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'analyze-course-plan': return <BookOpen className="h-4 w-4" />;
      case 'revise-course-plan': return <RefreshCw className="h-4 w-4" />;
      case 'create-course-plan': return <Zap className="h-4 w-4" />;
      case 'login': return <User className="h-4 w-4" />;
      case 'logout': return <User className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'analyze-course-plan': return 'bg-blue-100 text-blue-800';
      case 'revise-course-plan': return 'bg-green-100 text-green-800';
      case 'create-course-plan': return 'bg-purple-100 text-purple-800';
      case 'login': return 'bg-emerald-100 text-emerald-800';
      case 'logout': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const containerClasses = embedded ? "" : "min-h-screen bg-gradient-subtle p-8";
  const innerClasses = embedded ? "space-y-6" : "max-w-6xl mx-auto space-y-6";
  const headerSpacing = embedded ? "mb-4" : "mb-8";
  const statsSpacing = embedded ? "mb-4" : "mb-8";
  const loadingHeight = embedded ? "py-6" : "h-64";
  
  if (loading && logs.length === 0) {
    return (
      <div className={containerClasses}>
        <div className={innerClasses}>
          <div className={`flex items-center justify-center ${loadingHeight}`}>
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading action history...</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={containerClasses}>
      <div className={innerClasses}>
        {/* Header */}
        <div className={headerSpacing}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Action History</h1>
          <p className="text-muted-foreground">
            View and analyze all AI actions performed in the system. All metrics represent the complete history across every recorded session.
          </p>
        </div>

        {/* Stats Overview */}
        {summaryStats && (
          <div className={`grid grid-cols-1 gap-4 md:grid-cols-4 ${statsSpacing}`}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Actions</p>
                    <p className="text-2xl font-bold">{(summaryStats.totalActions || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">All-time actions logged</p>
                  </div>
                  <Activity className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tokens</p>
                    <p className="text-2xl font-bold">{(summaryStats.totalTokens || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {filters.action !== 'all' || filters.startDate || filters.endDate || filters.coursePlanName
                        ? 'Filtered tokens'
                        : 'All-time tokens consumed'}
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Processing Time</p>
                    <p className="text-2xl font-bold">{formatDuration(summaryStats.averageProcessingTime || 0)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {filters.action !== 'all' || filters.startDate || filters.endDate || filters.coursePlanName
                        ? 'Average for filtered results'
                        : 'Average across entire history'}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{((summaryStats.successRate || 0) * 100).toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {filters.action !== 'all' || filters.startDate || filters.endDate || filters.coursePlanName
                        ? 'Success rate for filtered results'
                        : 'Overall success rate (all-time)'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Action Type</label>
                <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actions</SelectItem>
                    {uniqueActionTypes.map((actionType) => {
                      const displayName = actionType
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                      return (
                        <SelectItem key={actionType} value={actionType}>
                          {displayName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Course Plan</label>
                <Input
                  placeholder="Filter by course plan name"
                  value={filters.coursePlanName}
                  onChange={(e) => handleFilterChange('coursePlanName', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                <Input
                      type="text"
                      readOnly
                      placeholder="Select start date"
                      value={startDate ? format(startDate, "yyyy-MM-dd HH:mm") : ""}
                      className="cursor-pointer"
                      onClick={(e) => e.currentTarget.focus()}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                <Input
                      type="text"
                      readOnly
                      placeholder="Select end date"
                      value={endDate ? format(endDate, "yyyy-MM-dd HH:mm") : ""}
                      className="cursor-pointer"
                      onClick={(e) => e.currentTarget.focus()}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={fetchActionLogs} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={() => {
                setFilters({
                  action: 'all',
                  coursePlanName: '',
                  startDate: '',
                  endDate: '',
                  sortBy: 'timestamp',
                  sortOrder: 'desc'
                });
                setStartDate(undefined);
                setEndDate(undefined);
              }}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="p-4">
              <p className="text-destructive">Error: {error}</p>
              <Button variant="outline" onClick={fetchActionLogs} className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Action Logs */}
        <div className="space-y-2">
          {logs.map((log) => {
            const tokensForLog = extractTokensFromLog(log);
            const processingMs = normalizeNumber(log.processingTime);
            const actionType = (log.action || 'unknown').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            return (
              <Card key={log._id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Action Type */}
                    <div className="flex items-center gap-2 min-w-[150px]">
                      {getActionIcon(log.action || 'unknown')}
                      <span className="font-medium">{actionType}</span>
                    </div>
                    
                    {/* DateTime */}
                    <div className="flex items-center gap-1 min-w-[180px]">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{log.timestamp ? formatTimestamp(log.timestamp) : 'N/A'}</span>
                    </div>
                    
                    {/* Duration */}
                    <div className="flex items-center gap-1 min-w-[100px]">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDuration(processingMs)}</span>
                    </div>
                    
                    {/* Token */}
                    <div className="flex items-center gap-1 min-w-[100px]">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{tokensForLog.toLocaleString()}</span>
                    </div>
                    
                    {/* Success/Failure - Aligned Right */}
                    <div className="flex items-center gap-1 ml-auto">
                      <Badge variant={log.success ? "default" : "destructive"} className="whitespace-nowrap">
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages || loading}
            >
              Next
            </Button>
          </div>
        )}

        {/* Empty State */}
        {logs.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No action logs found</h3>
              <p className="text-muted-foreground">
                No actions match your current filters. Try adjusting your search criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
