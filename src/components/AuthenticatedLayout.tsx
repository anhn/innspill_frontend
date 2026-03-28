import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatPanel } from "@/components/ChatPanel";
import { useChat } from "@/contexts/ChatContext";
import { logAction } from "@/utils/activityLogger";
import API_ENDPOINTS from "@/config/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { isChatOpen, isChatMinimized, chatWidth, chatTopic, chatFunction, closeChat, toggleMinimize, setChatWidth } = useChat();
  const { toast } = useToast();

  // Feedback form state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [experienceRating, setExperienceRating] = useState<number | null>(null);
  const [aiCompetenceRating, setAiCompetenceRating] = useState<number | null>(null);
  const [learningRating, setLearningRating] = useState<number | null>(null);
  const [openEndedReflections, setOpenEndedReflections] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Calculate main content width based on chat panel state
  const mainContentWidth = isChatOpen ? `calc(100% - ${chatWidth}px)` : '100%';

  // Auto-logout on inactivity (15 minutes)
  useEffect(() => {
    const INACTIVITY_MS = 15 * 60 * 1000; // 15 minutes
    let timer: number | undefined;

    const logout = async () => {
      try {
        const user = localStorage.getItem('ai4edu_user') || undefined;
        if (user) {
          await logAction({
            action: 'logout',
            endpoint: API_ENDPOINTS.auth.logout,
            method: 'POST',
            success: true,
            metadata: { reason: 'inactivity' }
          });
        }
        localStorage.removeItem('ai4edu_user');
        localStorage.removeItem('ai4edu_session_id');
      } catch (error) {
        console.error('Error during auto-logout:', error);
        // Still clear data even if logging fails
        localStorage.removeItem('ai4edu_user');
        localStorage.removeItem('ai4edu_session_id');
      }
      // Redirect to login
      window.location.hash = '#/auth';
    };

    const resetTimer = () => {
      if (timer) window.clearTimeout(timer);
      // Only arm when user is logged in
      const isLoggedIn = (() => { try { return !!localStorage.getItem('ai4edu_user'); } catch { return false; } })();
      if (isLoggedIn) {
        timer = window.setTimeout(logout, INACTIVITY_MS);
      }
    };

    const events: Array<keyof DocumentEventMap> = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(evt => document.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timer) window.clearTimeout(timer);
      events.forEach(evt => document.removeEventListener(evt, resetTimer));
    };
  }, []);

  const handleFeedbackSubmit = async () => {
    // Validate ratings
    if (!experienceRating || !aiCompetenceRating || !learningRating) {
      toast({
        title: "Validation Error",
        description: "Please provide ratings for all three questions.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingFeedback(true);

    try {
      // Get username from localStorage if available
      const username = localStorage.getItem("ai4edu_user") || undefined;

      const response = await fetch(API_ENDPOINTS.userFeedback.submit, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          experienceRating,
          aiCompetenceRating,
          learningRating,
          openEndedReflections: openEndedReflections.trim() || undefined,
          username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit feedback');
      }

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });

      // Reset form
      setExperienceRating(null);
      setAiCompetenceRating(null);
      setLearningRating(null);
      setOpenEndedReflections("");
      setFeedbackOpen(false);
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const RatingSelector = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: number | null; 
    onChange: (value: number) => void;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`flex-1 py-2 px-3 rounded-md border transition-colors ${
              value === rating
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-input hover:bg-accent'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 relative">
          <main 
            className="transition-all duration-200 ease-in-out relative"
            style={{ width: mainContentWidth }}
          >
            {/* Feedback and Help Buttons - Top Right */}
            <div className="absolute top-4 right-4 z-50 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="shadow-lg"
                onClick={() => {
                  const subject = encodeURIComponent("InnSpill.AI – System Support Request");
                  const body = encodeURIComponent(
                    [
                      "Hi,",
                      "",
                      "I need help with the system.",
                      "",
                      `Time: ${new Date().toISOString()}`,
                      `User: ${localStorage.getItem("ai4edu_user") || "Unknown user"}`,
                      "",
                      "Please help investigate.",
                      "",
                      "Best regards,",
                      localStorage.getItem("ai4edu_user") || "Unknown user",
                    ].join("\n")
                  );
                  window.location.href = `mailto:angu@usn.no?subject=${subject}&body=${body}`;
                }}
                title="Get Help / Contact Support"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="shadow-lg"
                onClick={() => setFeedbackOpen(true)}
                title="Provide Feedback"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>
            {children}
          </main>
          
          {/* Chat Panel Container */}
          <ChatPanel
            isOpen={isChatOpen}
            onClose={closeChat}
            onToggleMinimize={toggleMinimize}
            isMinimized={isChatMinimized}
            width={chatWidth}
            onWidthChange={setChatWidth}
            topic={chatTopic}
            chatbotFunction={chatFunction}
          />
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Feedback</DialogTitle>
            <DialogDescription>
              Help us improve by sharing your experience with the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <RatingSelector
              label="How would you rate your experience with the platform?"
              value={experienceRating}
              onChange={setExperienceRating}
            />
            <RatingSelector
              label="How did the platform affect your AI competence?"
              value={aiCompetenceRating}
              onChange={setAiCompetenceRating}
            />
            <RatingSelector
              label="How did the platform affect your learning?"
              value={learningRating}
              onChange={setLearningRating}
            />
            <div className="space-y-2">
              <Label htmlFor="reflections">Additional Comments (Optional)</Label>
              <Textarea
                id="reflections"
                placeholder="Share any additional thoughts or suggestions..."
                value={openEndedReflections}
                onChange={(e) => setOpenEndedReflections(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFeedbackOpen(false)}
              disabled={isSubmittingFeedback}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFeedbackSubmit}
              disabled={isSubmittingFeedback || !experienceRating || !aiCompetenceRating || !learningRating}
            >
              {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
