import { useState } from "react";
import { 
  Search, 
  FileText, 
  ClipboardList, 
  BarChart3, 
  Lightbulb, 
  PenTool, 
  Users,
  MessageSquare,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/ChatContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface ResearchArea {
  id: string;
  icon: React.ElementType;
  genAICapabilities: string[];
  researcherResponsibilities: string[];
  enabled: boolean;
}

const researchAreas: ResearchArea[] = [
  {
    id: "research-design",
    icon: Search,
    genAICapabilities: [
      "researcher.areas.researchDesign.ai1",
      "researcher.areas.researchDesign.ai2",
      "researcher.areas.researchDesign.ai3"
    ],
    researcherResponsibilities: [
      "researcher.areas.researchDesign.researcher1",
      "researcher.areas.researchDesign.researcher2"
    ],
    enabled: false,
  },
  {
    id: "literature-review",
    icon: FileText,
    genAICapabilities: [
      "researcher.areas.literatureReview.ai1",
      "researcher.areas.literatureReview.ai2",
      "researcher.areas.literatureReview.ai3"
    ],
    researcherResponsibilities: [
      "researcher.areas.literatureReview.researcher1",
      "researcher.areas.literatureReview.researcher2"
    ],
    enabled: false,
  },
  {
    id: "data-collection",
    icon: ClipboardList,
    genAICapabilities: [
      "researcher.areas.dataCollection.ai1",
      "researcher.areas.dataCollection.ai2",
      "researcher.areas.dataCollection.ai3",
      "researcher.areas.dataCollection.ai4"
    ],
    researcherResponsibilities: [
      "researcher.areas.dataCollection.researcher1",
      "researcher.areas.dataCollection.researcher2"
    ],
    enabled: false,
  },
  {
    id: "data-analysis",
    icon: BarChart3,
    genAICapabilities: [
      "researcher.areas.dataAnalysis.ai1",
      "researcher.areas.dataAnalysis.ai2",
      "researcher.areas.dataAnalysis.ai3",
      "researcher.areas.dataAnalysis.ai4"
    ],
    researcherResponsibilities: [
      "researcher.areas.dataAnalysis.researcher1",
      "researcher.areas.dataAnalysis.researcher2"
    ],
    enabled: false,
  },
  {
    id: "interpretation",
    icon: Lightbulb,
    genAICapabilities: [
      "researcher.areas.interpretation.ai1",
      "researcher.areas.interpretation.ai2",
      "researcher.areas.interpretation.ai3"
    ],
    researcherResponsibilities: [
      "researcher.areas.interpretation.researcher1",
      "researcher.areas.interpretation.researcher2",
      "researcher.areas.interpretation.researcher3"
    ],
    enabled: false,
  },
  {
    id: "writing-presentation",
    icon: PenTool,
    genAICapabilities: [
      "researcher.areas.writingPresentation.ai1",
      "researcher.areas.writingPresentation.ai2",
      "researcher.areas.writingPresentation.ai3",
      "researcher.areas.writingPresentation.ai4",
      "researcher.areas.writingPresentation.ai5"
    ],
    researcherResponsibilities: [
      "researcher.areas.writingPresentation.researcher1",
      "researcher.areas.writingPresentation.researcher2"
    ],
    enabled: false,
  },
  {
    id: "collaboration",
    icon: Users,
    genAICapabilities: [
      "researcher.areas.collaboration.ai1",
      "researcher.areas.collaboration.ai2",
      "researcher.areas.collaboration.ai3",
      "researcher.areas.collaboration.ai4"
    ],
    researcherResponsibilities: [
      "researcher.areas.collaboration.researcher1",
      "researcher.areas.collaboration.researcher2"
    ],
    enabled: false,
  },
];

export default function AIResearcher() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { openChat } = useChat();
  const { t } = useLanguage();

  const handleOpenChat = (areaId: string) => {
    const instruction = `${t(`researcher.areas.${areaId}.description`)}\n\n${t("researcher.help")}`;
    openChat(instruction);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-subtle p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl">{t("researcher.title")}</CardTitle>
              <CardDescription className="text-lg">
                {t("researcher.subtitle")}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Research Areas Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchAreas.map((area) => (
              <Card 
                key={area.id}
                className={`overflow-hidden hover:shadow-lg transition-all ${
                  area.enabled ? 'cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => area.enabled && setExpandedCard(expandedCard === area.id ? null : area.id)}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-primary/10">
                      <area.icon className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{t(`researcher.areas.${area.id}.title`)}</CardTitle>
                  <CardDescription className="mt-2">
                    {t(`researcher.areas.${area.id}.description`)}
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
                        {t("researcher.whatAIcanDo")}
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
                        {t("researcher.researcherResponsibility")}
                      </h4>
                      <ul className="space-y-1">
                        {area.researcherResponsibilities.map((responsibilityKey, idx) => (
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
                      {t("researcher.startAssistant")}
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
