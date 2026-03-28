import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink,
  CheckCircle2,
  XCircle,
  ArrowLeft
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getStoredRole, ROLE_ROUTES } from "@/constants/roles";

interface AITool {
  id: string;
  name: string;
  description: string;
  screenshot: string;
  useCases: string[];
  pricing: "free" | "paid" | "freemium";
  website: string;
  category: "text" | "image" | "code" | "multimodal";
}

const aiTools: AITool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "OpenAI's conversational AI assistant capable of understanding context, generating text, answering questions, and assisting with various tasks including writing, analysis, and problem-solving.",
    screenshot: "/images/chatgpt.png",
    useCases: [
      "Lesson plan generation and refinement",
      "Student feedback and assessment creation",
      "Content summarization and explanation",
      "Question generation for quizzes",
      "Curriculum development assistance"
    ],
    pricing: "freemium",
    website: "https://chat.openai.com",
    category: "text"
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    description: "AI-powered search engine that provides accurate, cited answers by searching the web and synthesizing information from multiple sources.",
    screenshot: "/images/perflexity.png",
    useCases: [
      "Research and fact-checking",
      "Finding current information and sources",
      "Academic paper analysis",
      "Topic exploration with citations",
      "Up-to-date information retrieval"
    ],
    pricing: "freemium",
    website: "https://www.perplexity.ai",
    category: "text"
  },
  {
    id: "claude",
    name: "Claude",
    description: "Anthropic's AI assistant focused on helpfulness, harmlessness, and honesty. Excellent for long-form content, analysis, and ethical considerations.",
    screenshot: "/images/claude.jpg",
    useCases: [
      "Long-form content creation",
      "Document analysis and summarization",
      "Ethical reasoning and discussion",
      "Complex problem-solving",
      "Code review and explanation"
    ],
    pricing: "freemium",
    website: "https://claude.ai",
    category: "text"
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Google's multimodal AI that can understand and generate text, images, audio, and video. Integrated with Google services and designed for classroom use.",
    screenshot: "/images/gemini_in_classroom.jpg",
    useCases: [
      "Multimodal content creation",
      "Google Workspace integration",
      "Document analysis with images",
      "Video and audio understanding",
      "Comprehensive research assistance",
      "Classroom activity planning"
    ],
    pricing: "freemium",
    website: "https://gemini.google.com",
    category: "multimodal"
  },
  {
    id: "beautiful-ai",
    name: "Beautiful.ai",
    description: "AI-powered presentation tool that automatically designs professional slides. Helps create visually appealing educational presentations with minimal effort.",
    screenshot: "/images/beautiful_ai.png",
    useCases: [
      "Automated presentation design",
      "Educational slide creation",
      "Visual content organization",
      "Professional teaching materials",
      "Student presentation templates"
    ],
    pricing: "freemium",
    website: "https://www.beautiful.ai",
    category: "text"
  },
  {
    id: "canva-ai",
    name: "Canva AI",
    description: "Canva's AI-powered design tools that help create educational graphics, posters, worksheets, and visual content quickly and easily.",
    screenshot: "/images/canva_ai.png",
    useCases: [
      "Educational graphic design",
      "Worksheet and handout creation",
      "Poster and banner design",
      "Social media content for education",
      "Visual learning materials"
    ],
    pricing: "freemium",
    website: "https://www.canva.com",
    category: "image"
  },
  {
    id: "keenious",
    name: "Keenious",
    description: "AI-powered research tool that helps find relevant academic papers, articles, and sources for educational content and research projects.",
    screenshot: "/images/keenious.jpg",
    useCases: [
      "Academic research assistance",
      "Literature review support",
      "Source finding and citation",
      "Research paper discovery",
      "Educational content validation"
    ],
    pricing: "freemium",
    website: "https://www.keenious.com",
    category: "text"
  },
  {
    id: "scispace",
    name: "SciSpace",
    description: "AI-powered platform for reading, understanding, and analyzing scientific papers. Helps educators and students navigate complex research literature.",
    screenshot: "/images/scispace.png",
    useCases: [
      "Scientific paper analysis",
      "Research paper summarization",
      "Academic literature comprehension",
      "Citation and reference management",
      "Research methodology understanding"
    ],
    pricing: "freemium",
    website: "https://typeset.io",
    category: "text"
  }
];

export default function AITools({ onBack }: { onBack?: () => void }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);

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

  const getPricingBadge = (pricing: string) => {
    switch (pricing) {
      case "free":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t("aiTools.pricing.free")}
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            {t("aiTools.pricing.paid")}
          </Badge>
        );
      case "freemium":
        return (
          <Badge className="bg-blue-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t("aiTools.pricing.freemium")}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (selectedTool) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedTool.name}</CardTitle>
                  <CardDescription className="mt-2">{selectedTool.description}</CardDescription>
                </div>
                {getPricingBadge(selectedTool.pricing)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Screenshot */}
              <div className="rounded-lg border overflow-hidden bg-secondary/50">
                <img
                  src={selectedTool.screenshot}
                  alt={`${selectedTool.name} screenshot`}
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.nextElementSibling as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
                <div className="aspect-video hidden items-center justify-center p-8">
                  <p className="text-muted-foreground text-sm">
                    {t("aiTools.screenshotNotAvailable").replace("{tool}", selectedTool.name)}
                  </p>
                </div>
              </div>

              {/* Use Cases */}
              <div>
                <h3 className="text-lg font-semibold mb-3">{t("aiTools.useCases")}</h3>
                <ul className="space-y-2">
                  {selectedTool.useCases.map((useCase, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setSelectedTool(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("aiTools.backToLibrary")}
                </Button>
                <Button onClick={() => window.open(selectedTool.website, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("aiTools.visitWebsite")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("aiTools.title")}</CardTitle>
            <CardDescription>
              {t("aiTools.description")}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiTools.map((tool) => (
            <Card
              key={tool.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
              onClick={() => setSelectedTool(tool)}
            >
              <div className="aspect-video bg-secondary/50 rounded-t-lg overflow-hidden relative">
                <img
                  src={tool.screenshot}
                  alt={`${tool.name} screenshot`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.nextElementSibling as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 hidden items-center justify-center">
                  <p className="text-muted-foreground text-xs">
                    {tool.name} Screenshot
                  </p>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                  {getPricingBadge(tool.pricing)}
                </div>
                <CardDescription className="line-clamp-2">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTool(tool);
                }}>
                  {t("aiTools.viewDetails")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("teacher.editor.back")}
          </Button>
        </div>
      </div>
    </div>
  );
}

