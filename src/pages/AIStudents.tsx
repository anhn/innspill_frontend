import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  FileText, 
  ScrollText,
  MessageSquare,
  ChevronDown,
  GraduationCap,
  Sparkles,
  Wrench,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/ChatContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface StudentArea {
  id: string;
  icon: React.ElementType;
  genAICapabilities: string[];
  studentResponsibilities: string[];
  enabled: boolean;
}

const studentAreas: StudentArea[] = [
  {
    id: "ai-literacy",
    icon: GraduationCap,
    genAICapabilities: [
      "generativeAI.areas.aiLiteracy.ai1",
      "generativeAI.areas.aiLiteracy.ai2",
      "generativeAI.areas.aiLiteracy.ai3"
    ],
    studentResponsibilities: [
      "generativeAI.areas.aiLiteracy.student1",
      "generativeAI.areas.aiLiteracy.student2"
    ],
    enabled: true,
  },
  {
    id: "prompting",
    icon: Sparkles,
    genAICapabilities: [
      "generativeAI.areas.prompting.ai1",
      "generativeAI.areas.prompting.ai2",
      "generativeAI.areas.prompting.ai3"
    ],
    studentResponsibilities: [
      "generativeAI.areas.prompting.student1",
      "generativeAI.areas.prompting.student2"
    ],
    enabled: true,
  },
  {
    id: "ai-tool-library",
    icon: Wrench,
    genAICapabilities: [
      "generativeAI.areas.aiToolLibrary.ai1",
      "generativeAI.areas.aiToolLibrary.ai2",
      "generativeAI.areas.aiToolLibrary.ai3"
    ],
    studentResponsibilities: [
      "generativeAI.areas.aiToolLibrary.student1",
      "generativeAI.areas.aiToolLibrary.student2"
    ],
    enabled: true,
  },
  {
    id: "assignment-support",
    icon: FileText,
    genAICapabilities: [
      "generativeAI.areas.assignmentSupport.ai1",
      "generativeAI.areas.assignmentSupport.ai2",
      "generativeAI.areas.assignmentSupport.ai3"
    ],
    studentResponsibilities: [
      "generativeAI.areas.assignmentSupport.student1",
      "generativeAI.areas.assignmentSupport.student2"
    ],
    enabled: true,
  },
  {
    id: "management-toolkit",
    icon: Briefcase,
    genAICapabilities: [
      "generativeAI.areas.managementToolkit.ai1",
      "generativeAI.areas.managementToolkit.ai2",
      "generativeAI.areas.managementToolkit.ai3"
    ],
    studentResponsibilities: [
      "generativeAI.areas.managementToolkit.student1",
      "generativeAI.areas.managementToolkit.student2"
    ],
    enabled: true,
  },
  {
    id: "literature-assistance",
    icon: BookOpen,
    genAICapabilities: [
      "generativeAI.areas.literatureAssistance.ai1",
      "generativeAI.areas.literatureAssistance.ai2",
      "generativeAI.areas.literatureAssistance.ai3"
    ],
    studentResponsibilities: [
      "generativeAI.areas.literatureAssistance.student1",
      "generativeAI.areas.literatureAssistance.student2"
    ],
    enabled: false,
  },
  {
    id: "documenting-usage",
    icon: ScrollText,
    genAICapabilities: [
      "generativeAI.areas.documentingUsage.ai1",
      "generativeAI.areas.documentingUsage.ai2"
    ],
    studentResponsibilities: [
      "generativeAI.areas.documentingUsage.student1"
    ],
    enabled: false,
  },
];

export default function AIStudents() {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { openChat } = useChat();
  const { t } = useLanguage();

  const handleOpenChat = (areaId: string) => {
    const instruction = `${t(`generativeAI.areas.${areaId}.description`)}\n\n${t("generativeAI.help")}`;
    openChat(instruction);
  };

  const handleAreaClick = (areaId: string) => {
    if (areaId === "assignment-support") {
      navigate("/assignment-support");
    } else if (areaId === "management-toolkit") {
      navigate("/management-toolkit");
    } else if (areaId === "ai-literacy") {
      navigate("/ai-teacher?category=ai-literacy&returnTo=student");
    } else if (areaId === "prompting") {
      navigate("/ai-teacher?category=prompting&returnTo=student");
    } else if (areaId === "ai-tool-library") {
      navigate("/ai-teacher?category=ai-tools&returnTo=student");
    } else {
      setExpandedCard(expandedCard === areaId ? null : areaId);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-subtle p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl">{t("generativeAI.title")}</CardTitle>
              <CardDescription className="text-lg">
                {t("generativeAI.subtitle")}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Student Areas Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentAreas
              .filter((area) => area.id !== "literature-assistance" && area.id !== "documenting-usage")
              .map((area) => (
              <Card 
                key={area.id}
                className={`overflow-hidden hover:shadow-lg transition-all ${
                  area.enabled ? 'cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => area.enabled && handleAreaClick(area.id)}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-primary/10">
                      <area.icon className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{t(`generativeAI.areas.${area.id}.title`)}</CardTitle>
                  <CardDescription className="mt-2">
                    {t(`generativeAI.areas.${area.id}.description`)}
                  </CardDescription>
                  <ChevronDown
                    className={`h-5 w-5 mx-auto mt-4 transition-transform ${
                      expandedCard === area.id ? "rotate-180" : ""
                    }`}
                  />
                </CardHeader>

                {expandedCard === area.id && (
                  <CardContent className="space-y-4 border-t pt-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-primary">
                        {t("generativeAI.whatAIcanDo")}
                      </h4>
                      <ul className="space-y-1">
                        {area.genAICapabilities.map((capabilityKey, idx) => (
                          <li key={idx} className="text-sm flex items-start">
                            <span className="text-primary mr-2">✓</span>
                            {t(capabilityKey)}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-destructive">
                        {t("generativeAI.studentResponsibility")}
                      </h4>
                      <ul className="space-y-1">
                        {area.studentResponsibilities.map((responsibilityKey, idx) => (
                          <li key={idx} className="text-sm flex items-start">
                            <span className="text-destructive mr-2">!</span>
                            {t(responsibilityKey)}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenChat(area.id);
                      }}
                      className="w-full"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {t("generativeAI.startAssistant")}
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
