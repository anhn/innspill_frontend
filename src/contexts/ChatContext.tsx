import { createContext, useContext, useState, ReactNode } from 'react';

type ChatbotFunction = 
  | "create-course-plan"
  | "update-course-plan" 
  | "create-lecture-plan"
  | "analyze-feedback"
  | "general";

interface ChatContextType {
  isChatOpen: boolean;
  isChatMinimized: boolean;
  chatWidth: number;
  chatTopic: string;
  chatFunction: ChatbotFunction;
  openChat: (topic?: string, chatbotFunction?: ChatbotFunction) => void;
  closeChat: () => void;
  toggleMinimize: () => void;
  setChatWidth: (width: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [chatWidth, setChatWidth] = useState(384);
  const [chatTopic, setChatTopic] = useState('');
  const [chatFunction, setChatFunction] = useState<ChatbotFunction>('general');

  const openChat = (topic = '', chatbotFunction: ChatbotFunction = 'general') => {
    setChatTopic(topic);
    setChatFunction(chatbotFunction);
    setIsChatOpen(true);
    setIsChatMinimized(false);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setIsChatMinimized(false);
    setChatTopic('');
    setChatFunction('general');
  };

  const toggleMinimize = () => {
    setIsChatMinimized(!isChatMinimized);
  };

  return (
    <ChatContext.Provider
      value={{
        isChatOpen,
        isChatMinimized,
        chatWidth,
        chatTopic,
        chatFunction,
        openChat,
        closeChat,
        toggleMinimize,
        setChatWidth,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
