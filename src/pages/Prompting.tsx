import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Copy, 
  Save, 
  Loader2, 
  CheckCircle2,
  Calendar,
  Tag,
  X,
  Search,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { getStoredRole, ROLE_ROUTES } from "@/constants/roles";

interface SavedPrompt {
  id: string;
  originalPrompt: string;
  revisedPrompt: string;
  analysis: string;
  topic?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Prompting({ onBack }: { onBack?: () => void }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Navigate to the appropriate dashboard based on user role
      const currentRole = getStoredRole();
      const dashboardRoute = ROLE_ROUTES[currentRole] || ROLE_ROUTES.teacher;
      navigate(dashboardRoute);
    }
  };
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [revisedPrompt, setRevisedPrompt] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isRevising, setIsRevising] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"date" | "topic">("date");
  const [newTopic, setNewTopic] = useState("");
  const [showTopicInput, setShowTopicInput] = useState(false);

  useEffect(() => {
    loadSavedPrompts();
  }, []);

  const loadSavedPrompts = async () => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      const response = await fetch(`${API_ENDPOINTS.prompts.list}?userName=${encodeURIComponent(userName)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSavedPrompts(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading saved prompts:', error);
    }
  };

  const handleRevise = async () => {
    if (!originalPrompt.trim()) {
      toast({
        title: t("prompting.error"),
        description: t("prompting.errorRevise"),
        variant: "destructive",
      });
      return;
    }

    setIsRevising(true);
    setAnalysis("");
    setRevisedPrompt("");

    try {
      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      const response = await fetch(API_ENDPOINTS.prompts.revise, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: originalPrompt,
          userName: userName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to revise prompt');
      }

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.data.analysis || "");
        setRevisedPrompt(data.data.revisedPrompt || "");
        toast({
          title: t("prompting.saved"),
          description: t("prompting.savedDescription"),
        });
      } else {
        throw new Error(data.message || t("prompting.errorReviseFailed"));
      }
    } catch (error) {
      console.error('Error revising prompt:', error);
      toast({
        title: t("prompting.error"),
        description: error instanceof Error ? error.message : t("prompting.errorReviseFailed"),
        variant: "destructive",
      });
    } finally {
      setIsRevising(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (revisedPrompt) {
      navigator.clipboard.writeText(revisedPrompt);
      toast({
        title: t("prompting.copied"),
        description: t("prompting.copiedDescription"),
      });
    }
  };

  const handleSave = async () => {
    if (!originalPrompt.trim() || !revisedPrompt.trim()) {
      toast({
        title: t("prompting.error"),
        description: t("prompting.errorSave"),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      const response = await fetch(API_ENDPOINTS.prompts.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPrompt,
          revisedPrompt,
          analysis,
          topic: newTopic.trim() || undefined,
          userName: userName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save prompt');
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: t("prompting.saved"),
          description: t("prompting.savedDescription"),
        });
        setNewTopic("");
        setShowTopicInput(false);
        loadSavedPrompts();
      } else {
        throw new Error(data.message || t("prompting.errorSaveFailed"));
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: t("prompting.error"),
        description: error instanceof Error ? error.message : t("prompting.errorSaveFailed"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadPrompt = (prompt: SavedPrompt) => {
    setOriginalPrompt(prompt.originalPrompt);
    setRevisedPrompt(prompt.revisedPrompt);
    setAnalysis(prompt.analysis);
    setSelectedPrompt(prompt);
    setNewTopic(prompt.topic || "");
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      const userName = localStorage.getItem('ai4edu_user') || 'Guest';
      const response = await fetch(API_ENDPOINTS.prompts.delete(id), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName })
      });

      if (response.ok) {
        toast({
          title: t("prompting.deleted"),
          description: t("prompting.deletedDescription"),
        });
        loadSavedPrompts();
        if (selectedPrompt?.id === id) {
          setSelectedPrompt(null);
          setOriginalPrompt("");
          setRevisedPrompt("");
          setAnalysis("");
        }
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast({
        title: t("prompting.error"),
        description: t("prompting.errorDeleteFailed"),
        variant: "destructive",
      });
    }
  };

  const filteredPrompts = savedPrompts.filter(prompt => {
    const matchesSearch = searchQuery === "" || 
      prompt.originalPrompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.revisedPrompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prompt.topic && prompt.topic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const groupedPrompts = filterBy === "date" 
    ? filteredPrompts.reduce((acc, prompt) => {
        const date = new Date(prompt.createdAt).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(prompt);
        return acc;
      }, {} as Record<string, SavedPrompt[]>)
    : filteredPrompts.reduce((acc, prompt) => {
        const topic = prompt.topic || t("prompting.uncategorized");
        if (!acc[topic]) acc[topic] = [];
        acc[topic].push(prompt);
        return acc;
      }, {} as Record<string, SavedPrompt[]>);

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Saved Prompts */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("prompting.savedPrompts")}</CardTitle>
                <CardDescription>{t("prompting.savedPromptsDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={t("prompting.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm border rounded-md"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterBy === "date" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterBy("date")}
                      className="flex-1"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      {t("prompting.filterByDate")}
                    </Button>
                    <Button
                      variant={filterBy === "topic" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterBy("topic")}
                      className="flex-1"
                    >
                      <Tag className="h-4 w-4 mr-1" />
                      {t("prompting.filterByTopic")}
                    </Button>
                  </div>
                </div>

                {/* Prompts List */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {Object.keys(groupedPrompts).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t("prompting.noSavedPrompts")}
                    </p>
                  ) : (
                    Object.entries(groupedPrompts).map(([group, prompts]) => (
                      <div key={group} className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground">
                          {filterBy === "date" ? group : group}
                        </h4>
                        {prompts.map((prompt) => (
                          <Card
                            key={prompt.id}
                            className={`cursor-pointer transition-colors ${
                              selectedPrompt?.id === prompt.id
                                ? "border-primary bg-primary/5"
                                : "hover:bg-secondary"
                            }`}
                            onClick={() => handleLoadPrompt(prompt)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {prompt.originalPrompt.substring(0, 50)}
                                    {prompt.originalPrompt.length > 50 ? "..." : ""}
                                  </p>
                                  {prompt.topic && (
                                    <Badge variant="secondary" className="mt-1 text-xs">
                                      {prompt.topic}
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePrompt(prompt.id);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{t("prompting.title")}</CardTitle>
                <CardDescription>
                  {t("prompting.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Original Prompt Input */}
                <div className="space-y-2">
                  <Label htmlFor="original-prompt">{t("prompting.originalPrompt")}</Label>
                  <Textarea
                    id="original-prompt"
                    placeholder={t("prompting.originalPromptPlaceholder")}
                    value={originalPrompt}
                    onChange={(e) => setOriginalPrompt(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <Button
                    onClick={handleRevise}
                    disabled={isRevising || !originalPrompt.trim()}
                    className="w-full"
                  >
                    {isRevising ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("prompting.revising")}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t("prompting.revisePrompt")}
                      </>
                    )}
                  </Button>
                </div>

                {/* Analysis Section */}
                {analysis && (
                  <div className="space-y-2">
                    <Label>{t("prompting.analysis")}</Label>
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <p className="text-sm whitespace-pre-wrap">{analysis}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Revised Prompt Output */}
                {revisedPrompt && (
                  <div className="space-y-2">
                    <Label htmlFor="revised-prompt">{t("prompting.revisedPrompt")}</Label>
                    <Textarea
                      id="revised-prompt"
                      value={revisedPrompt}
                      onChange={(e) => setRevisedPrompt(e.target.value)}
                      className="min-h-[120px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCopyToClipboard}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {t("prompting.copyToClipboard")}
                      </Button>
                      <Button
                        onClick={() => setShowTopicInput(!showTopicInput)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        {t("prompting.addTopic")}
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t("prompting.saving")}
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            {t("prompting.save")}
                          </>
                        )}
                      </Button>
                    </div>
                    {showTopicInput && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={t("prompting.topicPlaceholder")}
                          value={newTopic}
                          onChange={(e) => setNewTopic(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border rounded-md"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack}>
                {t("teacher.editor.back")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

