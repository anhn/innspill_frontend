import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Users,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Clock,
  Circle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import API_ENDPOINTS from "@/config/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Interfaces
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

interface PlanningPokerTask {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  status: 'voting' | 'revealed'; // Changed: 'completed' -> 'revealed'
  votes: PlanningPokerVote[];
  averageVote?: number;
  revealed?: boolean; // Whether votes have been manually revealed
  votedUserIds?: string[]; // Array of user IDs who have voted
  voteCount?: number; // Number of votes cast
  totalMembers?: number; // Total number of group members
  allMembersVoted?: boolean; // Whether all members have voted
  canReveal?: boolean; // Whether moderator can reveal votes (at least one other user has voted)
}

interface PlanningPokerVote {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  vote: number | string;  // Can be Fibonacci number or '?' for uncertain
  votedAt: string;
}

// Fibonacci sequence for voting (simplified: 1, 2, 3, 5, 8, 13, 21)
const FIBONACCI_NUMBERS = [1, 2, 3, 5, 8, 13, 21, '?'];

interface PlanningPokerProps {
  onSetHeaderButton?: (button: React.ReactNode | null) => void;
}

export default function PlanningPoker({ onSetHeaderButton }: PlanningPokerProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const currentUserName = localStorage.getItem('ai4edu_user') || '';
  
  // State
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [tasks, setTasks] = useState<PlanningPokerTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [myVotes, setMyVotes] = useState<{ [taskId: string]: number | string }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState<Set<string>>(new Set());
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());

  // Fetch groups for current user
  const fetchGroups = useCallback(async () => {
    try {
      if (!currentUserName) return;

      // Get all courses first (we'll need to fetch groups for each course)
      const coursesResponse = await fetch(
        `${API_ENDPOINTS.courses.getByStudent(currentUserName)}?userName=${encodeURIComponent(currentUserName)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        const courses = coursesData.data || coursesData || [];
        
        // Fetch groups for all courses
        const groupPromises = courses.map(async (course: any) => {
          try {
            const response = await fetch(
              `${API_ENDPOINTS.studentGroups.getByCourse(course.id)}?userName=${encodeURIComponent(currentUserName)}`,
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
            console.error(`Error fetching groups for course ${course.id}:`, error);
            return [];
          }
        });

        const allGroups = (await Promise.all(groupPromises)).flat();
        
        // Filter groups where current user is a member
        const userGroups = allGroups.filter((group: StudentGroup) => 
          group.isActive && 
          (group.studentIds.includes(currentUserName) ||
           group.studentNames?.some((name, idx) => 
             name === currentUserName || group.studentIds[idx] === currentUserName
           ))
        );
        
        setGroups(userGroups);
        
        // Auto-select first group if available (always select first group)
        if (userGroups.length > 0) {
          setSelectedGroupId(userGroups[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Error",
        description: "Failed to load groups",
        variant: "destructive",
      });
    }
  }, [currentUserName, selectedGroupId, toast]);

  // Fetch tasks for selected group
  const fetchTasks = useCallback(async () => {
    if (!selectedGroupId) {
      setTasks([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_ENDPOINTS.planningPoker.getTasks(selectedGroupId)}?userName=${encodeURIComponent(currentUserName)}`,
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
          setTasks(fetchedTasks);
          
          // Load my votes
          const votes: { [taskId: string]: number | string } = {};
          fetchedTasks.forEach((task: PlanningPokerTask) => {
            const myVote = task.votes.find(v => v.userId === currentUserName);
            if (myVote) {
              votes[task.id] = myVote.vote;
            }
          });
          setMyVotes(votes);
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [selectedGroupId, currentUserName]);

  // Fetch online members for selected group
  const fetchOnlineMembers = useCallback(async () => {
    if (!selectedGroupId) {
      setOnlineMembers(new Set());
      return;
    }

    try {
      // Fetch online members from backend
      const response = await fetch(
        `${API_ENDPOINTS.planningPoker.getOnlineMembers(selectedGroupId)}?userName=${encodeURIComponent(currentUserName)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          // Backend returns array of online member user IDs
          setOnlineMembers(new Set(result.data));
          return;
        }
      }
      
      // If endpoint doesn't exist or returns error, mark current user as online locally
      setOnlineMembers(new Set([currentUserName]));
    } catch (error) {
      console.error('Error fetching online members:', error);
      // Fallback: mark current user as online
      setOnlineMembers(new Set([currentUserName]));
    }
  }, [selectedGroupId, currentUserName]);

  // Mark current user as online when entering the module
  const markUserOnline = useCallback(async () => {
    if (!selectedGroupId || !currentUserName) return;

    try {
      // Call endpoint to mark user as online
      const response = await fetch(
        `${API_ENDPOINTS.planningPoker.markOnline(selectedGroupId)}?userName=${encodeURIComponent(currentUserName)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({}), // Optional: empty body for clarity
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Successfully marked online on server
          // Don't mark locally - wait for fetchOnlineMembers to get updated list
          return;
        }
      }
      
      // Fallback: mark locally only if API call fails
      setOnlineMembers(prev => new Set([...prev, currentUserName]));
    } catch (error) {
      console.error('Error marking user online:', error);
      // Fallback: mark locally on error
      setOnlineMembers(prev => new Set([...prev, currentUserName]));
    }
  }, [selectedGroupId, currentUserName]);

  // Mark current user as offline when leaving the module
  const markUserOffline = useCallback(async (groupId: string) => {
    if (!groupId || !currentUserName) return;

    try {
      // Call DELETE endpoint to mark user as offline
      const response = await fetch(
        `${API_ENDPOINTS.planningPoker.markOffline(groupId)}?userName=${encodeURIComponent(currentUserName)}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Successfully marked offline on server
          // Remove from local state
          setOnlineMembers(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentUserName);
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error('Error marking user offline:', error);
      // Still remove from local state even if API call fails
      setOnlineMembers(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentUserName);
        return newSet;
      });
    }
  }, [currentUserName]);

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchTasks(),
        fetchOnlineMembers(),
      ]);
      toast({
        title: "Refreshed",
        description: "Tasks and member status updated",
      });
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTasks, fetchOnlineMembers, toast]);

  // Initial fetch
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Fetch tasks, mark user online, and fetch online members when group changes
  useEffect(() => {
    if (selectedGroupId && currentUserName) {
      fetchTasks();
      markUserOnline();
      fetchOnlineMembers();
    }
  }, [selectedGroupId, currentUserName, fetchTasks, markUserOnline, fetchOnlineMembers]);

  // Cleanup: Mark user offline when component unmounts or group changes
  useEffect(() => {
    // Store the current selectedGroupId for cleanup
    const currentGroupId = selectedGroupId;

    // Cleanup function runs when component unmounts or selectedGroupId changes
    return () => {
      // Only mark offline if we have a valid group ID
      if (currentGroupId && currentUserName) {
        markUserOffline(currentGroupId);
      }
    };
  }, [selectedGroupId, currentUserName, markUserOffline]);

  // Expose refresh button to parent (ManagementToolkit)
  useEffect(() => {
    if (onSetHeaderButton) {
      if (selectedGroupId) {
        onSetHeaderButton(
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        );
      } else {
        onSetHeaderButton(null);
      }
    }
    return () => {
      if (onSetHeaderButton) {
        onSetHeaderButton(null);
      }
    };
  }, [selectedGroupId, isRefreshing, handleRefresh, onSetHeaderButton]);

  // Get selected group
  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const groupMembers = selectedGroup?.studentIds.map((id, idx) => ({
    userId: id,
    userName: selectedGroup.studentNames?.[idx] || id,
  })) || [];

  // Add new task
  const handleAddTask = async () => {
    if (!selectedGroupId || !newTaskTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_ENDPOINTS.planningPoker.createTask}?userName=${encodeURIComponent(currentUserName)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            groupId: selectedGroupId,
            title: newTaskTitle.trim(),
            description: newTaskDescription.trim() || undefined,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast({
            title: "Success",
            description: "Task added successfully",
          });
          setNewTaskTitle("");
          setNewTaskDescription("");
          setShowAddTaskDialog(false);
          fetchTasks();
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to create task",
            variant: "destructive",
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create task' }));
        toast({
          title: "Error",
          description: errorData.message || "Failed to create task",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
    }
  };

  // Submit vote
  const handleVote = async (taskId: string, vote: number | string) => {
    if (!selectedGroupId) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.planningPoker.submitVote}?userName=${encodeURIComponent(currentUserName)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            taskId,
            groupId: selectedGroupId,
            vote: vote === '?' ? '?' : Number(vote),
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMyVotes(prev => ({ ...prev, [taskId]: vote }));
          fetchTasks();
          
          toast({
            title: "Vote submitted",
            description: `You voted ${vote}. Refresh to see when others have voted.`,
          });
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to submit vote",
            variant: "destructive",
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to submit vote' }));
        toast({
          title: "Error",
          description: errorData.message || "Failed to submit vote",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive",
      });
    }
  };

  // Reveal votes (moderator action)
  const handleRevealVotes = async (taskId: string) => {
    if (!selectedGroupId) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.planningPoker.revealVotes(taskId)}?userName=${encodeURIComponent(currentUserName)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast({
            title: "Votes Revealed",
            description: "All votes are now visible. Ask everyone to refresh.",
          });
          fetchTasks();
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to reveal votes",
            variant: "destructive",
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to reveal votes' }));
        toast({
          title: "Error",
          description: errorData.message || "Failed to reveal votes",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error revealing votes:', error);
      toast({
        title: "Error",
        description: "Failed to reveal votes",
        variant: "destructive",
      });
    }
  };

  // Clear votes for re-estimation
  const handleClearVotes = async (taskId: string) => {
    if (!selectedGroupId) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.planningPoker.clearVotes(taskId)}?userName=${encodeURIComponent(currentUserName)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast({
            title: "Votes Cleared",
            description: "Ready for re-estimation. Ask everyone to vote again.",
          });
          // Clear local vote state
          setMyVotes(prev => {
            const newVotes = { ...prev };
            delete newVotes[taskId];
            return newVotes;
          });
          fetchTasks();
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to clear votes",
            variant: "destructive",
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to clear votes' }));
        toast({
          title: "Error",
          description: errorData.message || "Failed to clear votes",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error clearing votes:', error);
      toast({
        title: "Error",
        description: "Failed to clear votes",
        variant: "destructive",
      });
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.planningPoker.deleteTask(taskId)}?userName=${encodeURIComponent(currentUserName)}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json().catch(() => ({ success: true }));
        if (result.success !== false) {
          toast({
            title: "Success",
            description: "Task deleted",
          });
          fetchTasks();
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to delete task",
            variant: "destructive",
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete task' }));
        toast({
          title: "Error",
          description: errorData.message || "Failed to delete task",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  // Check if user is moderator (task creator)
  const isModerator = (task: PlanningPokerTask) => {
    return task.createdBy === currentUserName;
  };

  // Toggle task collapse
  const toggleTaskCollapse = (taskId: string) => {
    setCollapsedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Calculate average vote
  const calculateAverage = (task: PlanningPokerTask) => {
    const numericVotes = task.votes
      .map(v => typeof v.vote === 'number' ? v.vote : null)
      .filter((v): v is number => v !== null);
    
    if (numericVotes.length === 0) return null;
    return numericVotes.reduce((sum, vote) => sum + vote, 0) / numericVotes.length;
  };

  if (groups.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Planning Poker</CardTitle>
            <CardDescription>No groups available. You need to be a member of a group to use Planning Poker.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {selectedGroup && (
        <>
          {/* Group Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Group Members ({groupMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {groupMembers.map((member) => {
                  const isCurrentUser = member.userId === currentUserName;
                  // Check if this member has created any tasks (is a moderator)
                  const isModerator = tasks.some(task => task.createdBy === member.userId);
                  const isOnline = onlineMembers.has(member.userId);
                  
                  return (
                    <div
                      key={member.userId}
                      className="flex items-center gap-2 p-3 rounded-lg border"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-white">
                          {member.userName[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {member.userName}
                            {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
                          </span>
                          {isModerator && (
                            <Badge variant="default" className="text-xs">
                              Moderator
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span title={isOnline ? 'Online' : 'Offline'}>
                        <Circle 
                          className={`h-3 w-3 ${isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}`}
                        />
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tasks</CardTitle>
                  <CardDescription>Add tasks and vote on estimates. Votes are private until revealed.</CardDescription>
                </div>
                <Button onClick={() => setShowAddTaskDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks yet. Click 'Add Task' to create one.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {tasks.map((task) => {
                    const isRevealed = task.status === 'revealed' || task.revealed;
                    const average = calculateAverage(task);
                    const myVote = myVotes[task.id];
                    const canDelete = isModerator(task);
                    // Use canReveal from backend if available, otherwise fall back to existing logic for backward compatibility
                    const canReveal = isModerator(task) && !isRevealed && (task.canReveal ?? task.votes.length > 0);
                    const canClear = isModerator(task) && isRevealed;
                    const isCollapsed = collapsedTasks.has(task.id);

                    return (
                      <Card key={task.id} className={isRevealed ? 'border-green-500' : ''}>
                        <CardHeader 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleTaskCollapse(task.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{task.title}</CardTitle>
                              {task.description && !isCollapsed && (
                                <CardDescription className="mt-1">{task.description}</CardDescription>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {canDelete && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this task? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTaskCollapse(task.id);
                                }}
                              >
                                {isCollapsed ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronUp className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {!isCollapsed && (
                          <CardContent className="space-y-4">
                          {/* Voting Section - Only show if not revealed or user hasn't voted */}
                          {(!isRevealed || !myVote) && (
                            <div>
                              <Label className="mb-2 block">Your Vote</Label>
                              <div className="flex flex-wrap gap-2">
                                {FIBONACCI_NUMBERS.map((value) => (
                                  <Button
                                    key={value}
                                    variant={myVote === value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleVote(task.id, value)}
                                    disabled={isRevealed}
                                  >
                                    {value}
                                  </Button>
                                ))}
                              </div>
                              {myVote && !isRevealed && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  You voted {myVote}. Waiting for others to vote...
                                </p>
                              )}
                            </div>
                          )}

                          {/* Voting Status */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Voting Status</Label>
                              {task.voteCount !== undefined && task.totalMembers !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  {task.voteCount} / {task.totalMembers} voted
                                </span>
                              )}
                            </div>
                            <div className="space-y-2">
                              {groupMembers.map((member) => {
                                const vote = task.votes.find(v => v.userId === member.userId);
                                // Check if member has voted (either in votes array or votedUserIds)
                                const hasVoted = vote !== undefined || 
                                  (task.votedUserIds && task.votedUserIds.includes(member.userId));
                                
                                return (
                                  <div
                                    key={member.userId}
                                    className="flex items-center justify-between p-2 rounded border"
                                  >
                                    <span className="text-sm">{member.userName}</span>
                                    {hasVoted ? (
                                      isRevealed && vote ? (
                                        <Badge variant="default">
                                          {typeof vote.vote === 'string' ? vote.vote : vote.vote}
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary">
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Voted
                                        </Badge>
                                      )
                                    ) : (
                                      <Badge variant="outline">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Waiting
                                      </Badge>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Moderator Actions */}
                          {isModerator(task) && (
                            <div className="pt-4 border-t">
                              {canReveal && (
                                <Button
                                  onClick={() => handleRevealVotes(task.id)}
                                  className="w-full mb-2"
                                  variant="default"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Reveal Votes
                                </Button>
                              )}
                              {canClear && (
                                <Button
                                  onClick={() => handleClearVotes(task.id)}
                                  className="w-full"
                                  variant="outline"
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Clear Votes (Re-estimate)
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Results (shown when revealed) */}
                          {isRevealed && average !== null && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-green-800 font-semibold">Votes Revealed</Label>
                                  <p className="text-sm text-green-700 mt-1">
                                    Average Estimate: <span className="font-bold">{average.toFixed(1)}</span>
                                  </p>
                                </div>
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                              </div>
                              <div className="mt-3 space-y-1">
                                {task.votes.map((vote) => (
                                  <div key={vote.id} className="flex items-center justify-between text-sm">
                                    <span>{vote.userName}</span>
                                    <Badge>
                                      {typeof vote.vote === 'string' ? vote.vote : vote.vote}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Task Dialog */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task for the team to estimate</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="task-description">Description (Optional)</Label>
              <Input
                id="task-description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Enter task description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
