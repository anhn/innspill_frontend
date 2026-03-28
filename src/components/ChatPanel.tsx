import { useState, useRef, useEffect } from "react";
import { X, Send, Minimize2, Maximize2, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import API_ENDPOINTS from "@/config/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type ChatbotFunction = 
  | "create-course-plan"
  | "update-course-plan" 
  | "create-lecture-plan"
  | "analyze-feedback"
  | "general";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleMinimize?: () => void;
  isMinimized?: boolean;
  width?: number;
  onWidthChange?: (width: number) => void;
  topic?: string;
  chatbotFunction?: ChatbotFunction;
}

export function ChatPanel({
  isOpen,
  onClose,
  onToggleMinimize,
  isMinimized = false,
  width = 384,
  onWidthChange,
  topic,
  chatbotFunction = "general"
}: ChatPanelProps) {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: topic
        ? topic
        : "Hello! How can I help you with AI automation today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update initial message when topic changes
  useEffect(() => {
    if (topic && topic.trim()) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: topic,
          timestamp: new Date(),
        },
      ]);
    }
  }, [topic]);

  // API call function based on chatbot function
  const callChatbotAPI = async (userQuery: string): Promise<string> => {
    // Determine endpoint based on chatbot function
    let endpoint = "";
    
    switch (chatbotFunction) {
      case "create-course-plan":
        endpoint = API_ENDPOINTS.chatbot.createCoursePlan;
        break;
      case "update-course-plan":
        endpoint = API_ENDPOINTS.chatbot.updateCoursePlan;
        break;
      case "create-lecture-plan":
        endpoint = API_ENDPOINTS.chatbot.createLecturePlan;
        break;
      case "analyze-feedback":
        endpoint = API_ENDPOINTS.chatbot.analyzeFeedback;
        break;
      default:
        endpoint = API_ENDPOINTS.chatbot.asks;
    }

    // Get current text area content and teacher info as context
    const getCurrentContent = () => {
      if (typeof window !== 'undefined') {
        // Try to get content from the main text editor
        const event = new CustomEvent('getCurrentContent');
        window.dispatchEvent(event);
        return window.currentTextContent || '';
      }
      return '';
    };

    const getTeacherInfo = () => {
      if (typeof window !== 'undefined') {
        return window.teacherInfo || {};
      }
      return {};
    };

    const currentContent = getCurrentContent();
    const teacherInfo = getTeacherInfo();

    // Debug: Log what we're getting
    console.log('Current content:', currentContent);
    console.log('Teacher info:', teacherInfo);
    console.log('Language:', language);

    // Map education level to backend expected values
    const mapEducationLevel = (level: string) => {
      switch (level?.toLowerCase()) {
        case "primary": return "Elementary";
        case "secondary": return "High School";
        case "vocational": return "Professional";
        case "university": return "University";
        default: return "Elementary";
      }
    };

    // Use the exact format that works in Postman
    const requestBody = { 
      message: userQuery,
      context: {
        currentContent: currentContent || "Jeg jobber med en mattepensum for min 3. klasse",
        userName: (() => { try { return localStorage.getItem('ai4edu_user') || 'Guest'; } catch { return 'Guest'; } })(),
        teacherInfo: {
          educationLevel: mapEducationLevel(teacherInfo.educationLevel) || "Elementary",
          subjectArea: teacherInfo.subjectArea || "Math",
          country: teacherInfo.country || "Norway",
          academicYear: teacherInfo.academicYear || "2023-2024",
          organization: teacherInfo.organization || "University of Oslo",
          language: language === "no" ? "Norwegian" : language === "vi" ? "Vietnamese" : "English"
        }
      }
    };

    console.log(`[API REQUEST] Endpoint: ${endpoint}`);
    console.log(`[API REQUEST] Body:`, requestBody);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      credentials: 'include', // Include session cookies
      body: JSON.stringify(requestBody),
    });

    console.log(`[API RESPONSE] Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.message || errorData.error || '';
        console.log(`[API ERROR] Details:`, errorData);
      } catch (e) {
        errorDetails = await response.text();
        console.log(`[API ERROR] Text:`, errorDetails);
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}${errorDetails ? ` - ${errorDetails}` : ''}`);
    }

    const data = await response.json();
    console.log(`[API SUCCESS] Response:`, data);
    return data.response || "I'm sorry, I couldn't process your request.";
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      console.log(`[API CALL] ${chatbotFunction} →`, input);
      const botResponse = await callChatbotAPI(input);

      // Add the full response to chat
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: botResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Also add the full response to the main text area
      // This will be handled by the parent component through a callback
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('coursePlanGenerated', {
          detail: { content: botResponse }
        }));
      }
    } catch (error) {
      console.error(`[API ERROR] ${chatbotFunction}:`, error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onWidthChange) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !onWidthChange || !panelRef.current) return;

    const newWidth = window.innerWidth - e.clientX;
    const minWidth = 300;
    const maxWidth = window.innerWidth * 0.6;

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      onWidthChange(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <>
      {/* Resize handle */}
      {onWidthChange && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-transparent hover:bg-blue-500 cursor-col-resize z-50"
          style={{ left: `-4px` }}
          onMouseDown={handleMouseDown}
        />
      )}
      
      <div
        ref={panelRef}
        className={`absolute right-0 top-0 h-full bg-card border-l border-border shadow-2xl animate-slide-in z-40 ${
          isMinimized ? 'h-16' : 'h-full'
        }`}
        style={{ width: `${width}px` }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">AI Chat Assistant</h2>
          </div>
          <div className="flex items-center gap-1">
            {onToggleMinimize && (
              <Button variant="ghost" size="icon" onClick={onToggleMinimize}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <ScrollArea className="h-[calc(100vh-140px)] p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === "assistant" && (
                          <Bot className="h-4 w-4 mt-0.5 text-primary" />
                        )}
                        {message.role === "user" && (
                          <User className="h-4 w-4 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-secondary text-secondary-foreground">
                      <div className="flex items-start gap-2">
                        <Bot className="h-4 w-4 mt-0.5 text-primary" />
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <p className="text-sm">AI is thinking...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Error message */}
                {error && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-destructive/10 text-destructive">
                      <div className="flex items-start gap-2">
                        <Bot className="h-4 w-4 mt-0.5" />
                        <div>
                          <p className="text-sm">Error: {error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
}
