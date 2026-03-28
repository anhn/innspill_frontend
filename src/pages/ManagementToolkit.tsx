import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useManagementToolkit, ManagementToolkitModule } from "@/contexts/ManagementToolkitContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Target,
  CreditCard,
  Rocket,
  CheckSquare,
  Users,
  RefreshCw,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import PlanningPoker from "./PlanningPoker";
import SWOT from "./SWOT";
import SprintGoal from "./SprintGoal";
import DefinitionOfDone from "./DefinitionOfDone";
import TeamWorkingAgreement from "./TeamWorkingAgreement";
import RetrospectiveReview from "./RetrospectiveReview";
import TuckmanEvaluation from "./TuckmanEvaluation";

export default function ManagementToolkit() {
  const navigate = useNavigate();
  const { activeModule, setActiveModule } = useManagementToolkit();
  const { t } = useLanguage();
  const [headerButton, setHeaderButton] = useState<React.ReactNode | null>(null);

  // Clear header button when switching modules
  useEffect(() => {
    setHeaderButton(null);
  }, [activeModule]);

  const modules: Array<{
    id: ManagementToolkitModule;
    icon: React.ElementType;
  }> = [
    {
      id: "swot",
      icon: Target,
    },
    {
      id: "planning-poker",
      icon: CreditCard,
    },
    {
      id: "sprint-goal",
      icon: Rocket,
    },
    {
      id: "definition-of-done",
      icon: CheckSquare,
    },
    {
      id: "team-working-agreement",
      icon: Users,
    },
    {
      id: "retrospective-review",
      icon: RefreshCw,
    },
    {
      id: "tuckman-evaluation",
      icon: TrendingUp,
    },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case "planning-poker":
        return <PlanningPoker onSetHeaderButton={setHeaderButton} />;
      case "swot":
        return <SWOT onSetHeaderButton={setHeaderButton} />;
      case "sprint-goal":
        return <SprintGoal />;
      case "definition-of-done":
        return <DefinitionOfDone />;
      case "team-working-agreement":
        return <TeamWorkingAgreement />;
      case "retrospective-review":
        return <RetrospectiveReview />;
      case "tuckman-evaluation":
        return <TuckmanEvaluation />;
      default:
        return null;
    }
  };

  // Show dashboard if no module is selected
  if (!activeModule) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/ai-students")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("nav.back")}
          </Button>
          <h1 className="text-3xl font-bold mb-2">{t("managementToolkit.title")}</h1>
          <p className="text-muted-foreground">
            {t("managementToolkit.description")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            const titleKey = `managementToolkit.${module.id === "planning-poker" ? "planningPoker" : module.id === "sprint-goal" ? "sprintGoal" : module.id === "definition-of-done" ? "definitionOfDone" : module.id === "team-working-agreement" ? "teamWorkingAgreement" : module.id === "retrospective-review" ? "retrospectiveReview" : module.id === "tuckman-evaluation" ? "tuckmanEvaluation" : module.id}.title`;
            const descKey = `managementToolkit.${module.id === "planning-poker" ? "planningPoker" : module.id === "sprint-goal" ? "sprintGoal" : module.id === "definition-of-done" ? "definitionOfDone" : module.id === "team-working-agreement" ? "teamWorkingAgreement" : module.id === "retrospective-review" ? "retrospectiveReview" : module.id === "tuckman-evaluation" ? "tuckmanEvaluation" : module.id}.description`;
            
            return (
              <Card
                key={module.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => setActiveModule(module.id)}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Icon className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{t(titleKey)}</CardTitle>
                  <CardDescription className="mt-2">
                    {t(descKey)}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Show tool content with Back button
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setActiveModule(null)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("managementToolkit.back")}
        </Button>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">
            {t(`managementToolkit.${activeModule === "planning-poker" ? "planningPoker" : activeModule === "sprint-goal" ? "sprintGoal" : activeModule === "definition-of-done" ? "definitionOfDone" : activeModule === "team-working-agreement" ? "teamWorkingAgreement" : activeModule === "retrospective-review" ? "retrospectiveReview" : activeModule === "tuckman-evaluation" ? "tuckmanEvaluation" : activeModule}.title`)}
          </h1>
          {headerButton}
        </div>
        <p className="text-muted-foreground">
          {t(`managementToolkit.${activeModule === "planning-poker" ? "planningPoker" : activeModule === "sprint-goal" ? "sprintGoal" : activeModule === "definition-of-done" ? "definitionOfDone" : activeModule === "team-working-agreement" ? "teamWorkingAgreement" : activeModule === "retrospective-review" ? "retrospectiveReview" : activeModule === "tuckman-evaluation" ? "tuckmanEvaluation" : activeModule}.description`)}
        </p>
      </div>

      {renderModule()}
    </div>
  );
}
