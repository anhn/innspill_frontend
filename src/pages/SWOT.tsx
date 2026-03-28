import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Users,
  RefreshCw,
  HelpCircle,
  FileText,
  Users2,
  Plus,
  X,
  Edit2,
  Save,
  Circle,
} from "lucide-react";
import API_ENDPOINTS from "@/config/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface SWOTItem {
  id?: string;
  text: string;
  contributor?: string;
}

interface SWOTAnalysis {
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
  isComplete?: boolean;
  contributors?: string[];
}

interface ProjectDescription {
  title: string;
  description: string;
  learningOutcomes?: string[];
  milestones?: string[];
}

interface SWOTGuidelines {
  explanation: string;
  examples: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  tips: string[];
}

interface SWOTProps {
  onSetHeaderButton?: (button: React.ReactNode | null) => void;
}

export default function SWOT({ onSetHeaderButton }: SWOTProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const currentUserName = localStorage.getItem('ai4edu_user') || '';
  
  // State
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [swot, setSwot] = useState<SWOTAnalysis>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  });
  const [projectDescription, setProjectDescription] = useState<ProjectDescription | null>(null);
  const [guidelines, setGuidelines] = useState<SWOTGuidelines | null>(null);
  const [groupSwot, setGroupSwot] = useState<SWOTAnalysis | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showGuidelinesDialog, setShowGuidelinesDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showGroupSwotDialog, setShowGroupSwotDialog] = useState(false);
  const [showQuadrantHelpDialog, setShowQuadrantHelpDialog] = useState<keyof SWOTAnalysis | null>(null);
  const [editingItem, setEditingItem] = useState<{ quadrant: keyof SWOTAnalysis; index: number } | null>(null);
  const [editText, setEditText] = useState("");

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
          (group.studentIds.includes(currentUserName) || group.createdBy === currentUserName)
        );
        
        setGroups(userGroups);
        if (userGroups.length > 0 && !selectedGroupId) {
          setSelectedGroupId(userGroups[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }, [currentUserName, selectedGroupId]);

  // Fetch individual SWOT
  const fetchSWOT = useCallback(async () => {
    if (!selectedGroupId) {
      setSwot({ strengths: [], weaknesses: [], opportunities: [], threats: [] });
      return;
    }

    try {
      const response = await fetch(
        `${API_ENDPOINTS.swot.getSWOT(selectedGroupId)}?userName=${encodeURIComponent(currentUserName)}&viewType=individual`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('SWOT fetch response:', result); // Debug log
        if (result.success && result.data) {
          // Helper function to normalize data format
          const normalizeArray = (arr: any[]): SWOTItem[] => {
            if (!arr || arr.length === 0) return [];
            // If array contains strings, convert to objects
            if (typeof arr[0] === 'string') {
              return arr.map(text => ({ text: text }));
            }
            // If array already contains objects, ensure they have text property
            return arr.map(item => ({
              text: typeof item === 'string' ? item : (item.text || ''),
              id: item.id,
              contributor: item.contributor
            }));
          };

          // Ensure all quadrants exist, even if empty, and normalize format
          const swotData = {
            strengths: normalizeArray(result.data.strengths || []),
            weaknesses: normalizeArray(result.data.weaknesses || []),
            opportunities: normalizeArray(result.data.opportunities || []),
            threats: normalizeArray(result.data.threats || []),
          };
          console.log('Setting SWOT data:', swotData); // Debug log
          setSwot(swotData);
        } else {
          console.log('No SWOT data found, initializing empty'); // Debug log
          // Initialize empty SWOT if none exists
          setSwot({ strengths: [], weaknesses: [], opportunities: [], threats: [] });
        }
      } else {
        console.log('SWOT fetch response not ok:', response.status); // Debug log
        // If response is not ok, initialize empty SWOT
        setSwot({ strengths: [], weaknesses: [], opportunities: [], threats: [] });
      }
    } catch (error) {
      console.error('Error fetching SWOT:', error);
      // Initialize empty SWOT on error
      setSwot({ strengths: [], weaknesses: [], opportunities: [], threats: [] });
    }
  }, [selectedGroupId, currentUserName]);

  // Fetch project description (without opening dialog - for auto-load)
  const loadProjectDescription = useCallback(async (projectId: string) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.swot.getProjectDescription(projectId)}?userName=${encodeURIComponent(currentUserName)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setProjectDescription(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching project description:', error);
      // Don't show toast for auto-load, only for manual clicks
    }
  }, [currentUserName]);

  // Fetch project description and open dialog (for manual clicks)
  const fetchProjectDescription = useCallback(async (projectId: string) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.swot.getProjectDescription(projectId)}?userName=${encodeURIComponent(currentUserName)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setProjectDescription(result.data);
          setShowProjectDialog(true);
        } else {
          toast({
            title: "Error",
            description: "Failed to load project description",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching project description:', error);
      toast({
        title: "Error",
        description: "Failed to load project description",
        variant: "destructive",
      });
    }
  }, [currentUserName, toast]);

  // Fetch guidelines
  const fetchGuidelines = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.swot.getGuidelines, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setGuidelines(result.data);
          setShowGuidelinesDialog(true);
        }
      }
    } catch (error) {
      console.error('Error fetching guidelines:', error);
      toast({
        title: "Error",
        description: "Failed to load guidelines",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Fetch aggregated group SWOT
  const fetchGroupSWOT = useCallback(async () => {
    if (!selectedGroupId) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.swot.getSWOT(selectedGroupId)}?userName=${encodeURIComponent(currentUserName)}&viewType=aggregated`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Normalize group SWOT data format (similar to individual SWOT)
          const normalizeGroupArray = (arr: any[]): SWOTItem[] => {
            if (!arr || arr.length === 0) return [];
            // If array contains strings, convert to objects (no contributor info)
            if (typeof arr[0] === 'string') {
              return arr.map(text => ({ text: text }));
            }
            // If array already contains objects, ensure they have text property
            return arr.map(item => ({
              text: typeof item === 'string' ? item : (item.text || ''),
              id: item.id,
              contributor: item.contributor || item.userName || item.userId
            }));
          };

          const normalizedData = {
            strengths: normalizeGroupArray(result.data.strengths || []),
            weaknesses: normalizeGroupArray(result.data.weaknesses || []),
            opportunities: normalizeGroupArray(result.data.opportunities || []),
            threats: normalizeGroupArray(result.data.threats || []),
          };
          
          console.log('Group SWOT normalized data:', normalizedData); // Debug log
          setGroupSwot(normalizedData);
          setShowGroupSwotDialog(true);
        }
      }
    } catch (error) {
      console.error('Error fetching group SWOT:', error);
      toast({
        title: "Error",
        description: "Failed to load group SWOT",
        variant: "destructive",
      });
    }
  }, [selectedGroupId, currentUserName, toast]);

  // Save SWOT
  const handleSaveSWOT = useCallback(async () => {
    if (!selectedGroupId) return;

    setIsSaving(true);
    try {
      // Helper to extract text from item (handles both string and object formats)
      const getItemText = (item: any): string => {
        if (typeof item === 'string') return item.trim();
        return (item.text || '').trim();
      };

      // Filter out empty items before saving
      const payload = {
        strengths: swot.strengths
          .map(item => getItemText(item))
          .filter(text => text !== "")
          .map(text => ({ text })),
        weaknesses: swot.weaknesses
          .map(item => getItemText(item))
          .filter(text => text !== "")
          .map(text => ({ text })),
        opportunities: swot.opportunities
          .map(item => getItemText(item))
          .filter(text => text !== "")
          .map(text => ({ text })),
        threats: swot.threats
          .map(item => getItemText(item))
          .filter(text => text !== "")
          .map(text => ({ text })),
        isComplete: false,
      };

      console.log('Saving SWOT payload:', payload); // Debug log

      const response = await fetch(
        `${API_ENDPOINTS.swot.saveSWOT(selectedGroupId)}?userName=${encodeURIComponent(currentUserName)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('Save response:', result); // Debug log
        if (result.success) {
          toast({
            title: "Saved",
            description: "Your SWOT analysis has been saved",
          });
          // Refresh to get the saved data back in correct format
          await fetchSWOT();
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to save SWOT analysis",
            variant: "destructive",
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Save failed:', response.status, errorData);
        toast({
          title: "Error",
          description: errorData.message || "Failed to save SWOT analysis",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving SWOT:', error);
      toast({
        title: "Error",
        description: "Failed to save SWOT analysis",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [selectedGroupId, currentUserName, swot, toast, fetchSWOT]);

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchSWOT();
      toast({
        title: "Refreshed",
        description: "SWOT analysis updated",
      });
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchSWOT, toast]);

  // Add item to quadrant
  const handleAddItem = (quadrant: keyof SWOTAnalysis) => {
    const newItem: SWOTItem = { text: "" };
    setSwot(prev => ({
      ...prev,
      [quadrant]: [...prev[quadrant], newItem],
    }));
    setEditingItem({ quadrant, index: prev[quadrant].length });
    setEditText("");
  };

  // Remove item from quadrant
  const handleRemoveItem = (quadrant: keyof SWOTAnalysis, index: number) => {
    setSwot(prev => ({
      ...prev,
      [quadrant]: prev[quadrant].filter((_, i) => i !== index),
    }));
  };

  // Start editing item
  const handleStartEdit = (quadrant: keyof SWOTAnalysis, index: number, text: string) => {
    setEditingItem({ quadrant, index });
    setEditText(text);
  };

  // Save edited item
  const handleSaveEdit = () => {
    if (!editingItem) return;
    
    setSwot(prev => {
      const newQuadrant = [...prev[editingItem.quadrant]];
      newQuadrant[editingItem.index] = { ...newQuadrant[editingItem.index], text: editText };
      return { ...prev, [editingItem.quadrant]: newQuadrant };
    });
    
    setEditingItem(null);
    setEditText("");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditText("");
  };

  // Initial fetch
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Fetch SWOT when group changes
  useEffect(() => {
    if (selectedGroupId) {
      fetchSWOT();
    }
  }, [selectedGroupId, fetchSWOT]);

  // Fetch project description when group with projectId is selected (auto-load, no dialog)
  useEffect(() => {
    const group = groups.find(g => g.id === selectedGroupId);
    if (group?.projectId) {
      loadProjectDescription(group.projectId);
    }
  }, [selectedGroupId, groups, loadProjectDescription]);

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

  // Color palette for different contributors (more vibrant colors)
  const contributorColors = [
    'bg-blue-200 border-blue-500',
    'bg-purple-200 border-purple-500',
    'bg-pink-200 border-pink-500',
    'bg-yellow-200 border-yellow-500',
    'bg-indigo-200 border-indigo-500',
    'bg-teal-200 border-teal-500',
    'bg-cyan-200 border-cyan-500',
    'bg-amber-200 border-amber-500',
    'bg-emerald-200 border-emerald-500',
    'bg-rose-200 border-rose-500',
  ];

  // Get color for a contributor
  const getContributorColor = (contributor: string | undefined, allContributors: string[]): string => {
    if (!contributor) return 'bg-white/80 border-gray-300';
    const index = allContributors.indexOf(contributor);
    if (index === -1) return 'bg-white/80 border-gray-300';
    return contributorColors[index % contributorColors.length] + ' border-2';
  };

  // Extract all unique contributors from group SWOT
  const getAllContributors = (swot: SWOTAnalysis | null): string[] => {
    if (!swot) return [];
    const contributors = new Set<string>();
    
    // Helper to extract contributor from item (handles both string and object formats)
    const getContributor = (item: any): string | undefined => {
      if (typeof item === 'string') return undefined; // String items don't have contributors
      return item.contributor || item.userName || item.userId;
    };
    
    [...swot.strengths, ...swot.weaknesses, ...swot.opportunities, ...swot.threats].forEach(item => {
      const contributor = getContributor(item);
      if (contributor) {
        contributors.add(contributor);
      }
    });
    return Array.from(contributors);
  };

  if (groups.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>SWOT Analysis</CardTitle>
            <CardDescription>No groups available. You need to be a member of a group to use SWOT Analysis.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!selectedGroup) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>SWOT Analysis</CardTitle>
            <CardDescription>Please select a group to start your SWOT analysis.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Quadrant-specific help content for 1st year web development students
  const quadrantHelpContent = {
    strengths: {
      explanation: "Strengths are positive internal factors that give your team an advantage. Think about what your team is good at, what resources you have, or what skills you possess.",
      examples: [
        "Team members have basic HTML and CSS knowledge from previous courses",
        "One member has experience with JavaScript from personal projects",
        "Good communication skills and regular team meetings"
      ]
    },
    weaknesses: {
      explanation: "Weaknesses are internal factors that might hinder your project. Be honest about areas where your team lacks experience or resources.",
      examples: [
        "Limited experience with backend development and databases",
        "No prior experience with version control systems like Git",
        "Uncertainty about deploying a web application to a live server"
      ]
    },
    opportunities: {
      explanation: "Opportunities are external factors that could help your project succeed. These are positive trends, resources, or situations you can take advantage of.",
      examples: [
        "Free hosting platforms like Netlify or Vercel for deploying the project",
        "Online tutorials and documentation for learning new technologies",
        "University resources like computer labs and library access"
      ]
    },
    threats: {
      explanation: "Threats are external factors that could cause problems for your project. These are challenges or risks you might face.",
      examples: [
        "Tight deadline might limit time for learning new technologies",
        "Potential technical issues with different browsers or devices",
        "Risk of team members having conflicting schedules"
      ]
    }
  };

  // Render SWOT quadrant
  const renderQuadrant = (
    quadrant: keyof SWOTAnalysis,
    title: string,
    bgColor: string,
    borderColor: string,
    textColor: string
  ) => {
    const items = swot[quadrant];
    
    return (
      <div className={`${bgColor} ${borderColor} border-2 rounded-lg p-4 h-full flex flex-col`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className={`${textColor} font-bold text-lg`}>{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuadrantHelpDialog(quadrant)}
              className="h-5 w-5 p-0"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddItem(quadrant)}
            className="h-6 w-6 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="bg-white/80 rounded p-2 flex items-start gap-2">
                {editingItem?.quadrant === quadrant && editingItem?.index === index ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="flex-1 text-sm">{item.text || "(Empty)"}</p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(quadrant, index, item.text)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(quadrant, index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Click + to add an item</p>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

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
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* SWOT Matrix */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SWOT Analysis</CardTitle>
                  <CardDescription>Analyze your project's Strengths, Weaknesses, Opportunities, and Threats</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchGroupSWOT}
                  >
                    <Users2 className="h-4 w-4 mr-2" />
                    Group SWOT
                  </Button>
                  <Button
                    onClick={handleSaveSWOT}
                    disabled={isSaving}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* SWOT Matrix Grid */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-4 h-[600px]">
                  {/* Top Row */}
                  <div className="relative">
                    {renderQuadrant(
                      'strengths',
                      'Strengths',
                      'bg-green-50',
                      'border-green-500',
                      'text-green-700'
                    )}
                  </div>
                  <div className="relative">
                    {renderQuadrant(
                      'weaknesses',
                      'Weaknesses',
                      'bg-red-50',
                      'border-red-500',
                      'text-red-700'
                    )}
                  </div>
                  
                  {/* Bottom Row */}
                  <div className="relative">
                    {renderQuadrant(
                      'opportunities',
                      'Opportunities',
                      'bg-blue-50',
                      'border-blue-500',
                      'text-blue-700'
                    )}
                  </div>
                  <div className="relative">
                    {renderQuadrant(
                      'threats',
                      'Threats',
                      'bg-orange-50',
                      'border-orange-500',
                      'text-orange-700'
                    )}
                  </div>
                </div>

                {/* Center Circle - Project Title (Clickable) */}
                {selectedGroup.projectId && (
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => fetchProjectDescription(selectedGroup.projectId!)}
                    title="Click to view project description"
                  >
                    <div className="bg-white border-4 border-purple-500 rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-lg">
                      <div className="text-center px-2">
                        <p className="font-bold text-purple-700 text-sm line-clamp-2">
                          {projectDescription?.title || "Project"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Guidelines Dialog */}
      <Dialog open={showGuidelinesDialog} onOpenChange={setShowGuidelinesDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>SWOT Analysis Guidelines</DialogTitle>
            <DialogDescription>
              Learn how to conduct an effective SWOT analysis
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {guidelines ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Explanation</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {guidelines.explanation}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Strengths Examples</h4>
                    <ul className="space-y-1 text-sm">
                      {guidelines.examples.strengths.map((example, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">Weaknesses Examples</h4>
                    <ul className="space-y-1 text-sm">
                      {guidelines.examples.weaknesses.map((example, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">Opportunities Examples</h4>
                    <ul className="space-y-1 text-sm">
                      {guidelines.examples.opportunities.map((example, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2">Threats Examples</h4>
                    <ul className="space-y-1 text-sm">
                      {guidelines.examples.threats.map((example, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Tips</h4>
                  <ul className="space-y-1 text-sm">
                    {guidelines.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2">💡</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Loading guidelines...</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Project Description Dialog */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{projectDescription?.title || "Project Description"}</DialogTitle>
            <DialogDescription>
              Project details and learning outcomes
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {projectDescription ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {projectDescription.description}
                  </p>
                </div>
                
                {projectDescription.learningOutcomes && projectDescription.learningOutcomes.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Learning Outcomes</h3>
                    <ul className="space-y-1 text-sm">
                      {projectDescription.learningOutcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">✓</span>
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {projectDescription.milestones && projectDescription.milestones.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Milestones</h3>
                    <ul className="space-y-1 text-sm">
                      {projectDescription.milestones.map((milestone, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">📅</span>
                          <span>{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Loading project description...</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Quadrant Help Dialog */}
      <Dialog open={showQuadrantHelpDialog !== null} onOpenChange={(open) => !open && setShowQuadrantHelpDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {showQuadrantHelpDialog === 'strengths' && 'Strengths'}
              {showQuadrantHelpDialog === 'weaknesses' && 'Weaknesses'}
              {showQuadrantHelpDialog === 'opportunities' && 'Opportunities'}
              {showQuadrantHelpDialog === 'threats' && 'Threats'}
            </DialogTitle>
            <DialogDescription>
              Understanding this quadrant for your web development project
            </DialogDescription>
          </DialogHeader>
          {showQuadrantHelpDialog && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Explanation</h3>
                <p className="text-sm text-muted-foreground">
                  {quadrantHelpContent[showQuadrantHelpDialog].explanation}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Examples for Web Development Projects</h3>
                <ul className="space-y-2 text-sm">
                  {quadrantHelpContent[showQuadrantHelpDialog].examples.map((example, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Group SWOT Dialog */}
      <Dialog open={showGroupSwotDialog} onOpenChange={setShowGroupSwotDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Group SWOT Analysis</DialogTitle>
            <DialogDescription>
              Aggregated SWOT from all group members
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[75vh] pr-4">
            {groupSwot ? (() => {
              const allContributors = getAllContributors(groupSwot);
              
              return (
                <div className="relative">
                  {/* Legend/Notation Box */}
                  {allContributors.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Color Legend:</h4>
                      <div className="flex flex-wrap gap-3">
                        {allContributors.map((contributor, idx) => (
                          <div key={contributor} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border-2 ${contributorColors[idx % contributorColors.length]}`}></div>
                            <span className="text-xs">{contributor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 min-h-[500px]">
                    {/* Strengths */}
                    <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                      <h3 className="font-bold text-green-700 text-lg mb-3">Strengths</h3>
                      <ScrollArea className="h-[450px]">
                        <div className="space-y-2 pr-4">
                          {groupSwot.strengths.map((item, idx) => (
                            <div key={idx} className={`${getContributorColor(item.contributor, allContributors)} rounded p-2`}>
                              <p className="text-sm">{item.text}</p>
                              {item.contributor && (
                                <p className="text-xs text-muted-foreground mt-1">— {item.contributor}</p>
                              )}
                            </div>
                          ))}
                          {groupSwot.strengths.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No strengths added yet</p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Weaknesses */}
                    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
                      <h3 className="font-bold text-red-700 text-lg mb-3">Weaknesses</h3>
                      <ScrollArea className="h-[450px]">
                        <div className="space-y-2 pr-4">
                          {groupSwot.weaknesses.map((item, idx) => (
                            <div key={idx} className={`${getContributorColor(item.contributor, allContributors)} rounded p-2`}>
                              <p className="text-sm">{item.text}</p>
                              {item.contributor && (
                                <p className="text-xs text-muted-foreground mt-1">— {item.contributor}</p>
                              )}
                            </div>
                          ))}
                          {groupSwot.weaknesses.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No weaknesses added yet</p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Opportunities */}
                    <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                      <h3 className="font-bold text-blue-700 text-lg mb-3">Opportunities</h3>
                      <ScrollArea className="h-[450px]">
                        <div className="space-y-2 pr-4">
                          {groupSwot.opportunities.map((item, idx) => (
                            <div key={idx} className={`${getContributorColor(item.contributor, allContributors)} rounded p-2`}>
                              <p className="text-sm">{item.text}</p>
                              {item.contributor && (
                                <p className="text-xs text-muted-foreground mt-1">— {item.contributor}</p>
                              )}
                            </div>
                          ))}
                          {groupSwot.opportunities.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No opportunities added yet</p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Threats */}
                    <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4">
                      <h3 className="font-bold text-orange-700 text-lg mb-3">Threats</h3>
                      <ScrollArea className="h-[450px]">
                        <div className="space-y-2 pr-4">
                          {groupSwot.threats.map((item, idx) => (
                            <div key={idx} className={`${getContributorColor(item.contributor, allContributors)} rounded p-2`}>
                              <p className="text-sm">{item.text}</p>
                              {item.contributor && (
                                <p className="text-xs text-muted-foreground mt-1">— {item.contributor}</p>
                              )}
                            </div>
                          ))}
                          {groupSwot.threats.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No threats added yet</p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  {/* Center Circle - Project Title (for Group SWOT view) */}
                  {selectedGroup?.projectId && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="bg-white border-4 border-purple-500 rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-lg">
                        <div className="text-center px-2">
                          <p className="font-bold text-purple-700 text-sm line-clamp-2">
                            {projectDescription?.title || "Project"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })() : (
              <p className="text-muted-foreground">Loading group SWOT...</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
