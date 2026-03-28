import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Bot, GraduationCap, Users, Building, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import TractionModal from "@/components/TractionModal";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showTractionModal, setShowTractionModal] = useState(false);

  // Show traction modal 3 seconds after component mounts
  // TEMPORARILY DISABLED
  useEffect(() => {
    // const timer = setTimeout(() => {
    //   setShowTractionModal(true);
    // }, 3000);

    // return () => clearTimeout(timer);
  }, []);

  const dashboardItems = [
    {
      id: "teacher",
      title: t("home.aiForTeacher.title"),
      description: t("home.aiForTeacher.desc"),
      icon: BookOpen,
      path: "/ai-teacher",
      color: "text-primary"
    },
    {
      id: "researcher",
      title: t("home.aiForResearcher.title"),
      description: t("home.aiForResearcher.desc"),
      icon: GraduationCap,
      path: "/ai-researcher",
      color: "text-accent"
    },
    {
      id: "students",
      title: t("home.aiForStudents.title"),
      description: t("home.aiForStudents.desc"),
      icon: Users,
      path: "/ai-students",
      color: "text-primary"
    },
    {
      id: "schools",
      title: t("home.aiForSchools.title"),
      description: t("home.aiForSchools.desc"),
      icon: Building,
      path: "/ai-schools",
      color: "text-accent"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-white py-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="h-12 w-12" />
            <h1 className="text-5xl font-bold">{t("home.title")}</h1>
          </div>
          <p className="text-xl text-white/90">
            {t("home.subtitle")}
          </p>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">{t("home.whatCanYouDo")}</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dashboardItems.map((item) => (
            <Card 
              key={item.id}
              className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 h-full"
              onClick={() => navigate(item.path)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-secondary">
                    <item.icon className={`h-12 w-12 ${item.color}`} />
                  </div>
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Traction Modal */}
      <TractionModal 
        isOpen={showTractionModal}
        onClose={() => setShowTractionModal(false)}
      />
    </div>
  );
};

export default Index;
