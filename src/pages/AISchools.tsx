import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Shield, Users, Briefcase, BarChart3, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const categories = [
  {
    id: "governance",
    icon: Shield,
    enabled: false,
    items: [
      {
        title: "AI Policy Development",
        description: "Establish clear guidelines for AI use in educational settings, including acceptable use policies and ethical frameworks.",
      },
      {
        title: "Academic Integrity Frameworks",
        description: "Define policies around AI-assisted work, plagiarism detection, and student disclosure requirements.",
      },
      {
        title: "Data Governance & Privacy",
        description: "Implement data protection measures, consent protocols, and compliance with GDPR and local regulations.",
      },
      {
        title: "AI Ethics Committees",
        description: "Form governance bodies to review AI implementations, address concerns, and ensure responsible deployment.",
      },
    ],
  },
  {
    id: "training",
    icon: Users,
    enabled: false,
    items: [
      {
        title: "Faculty Development Programs",
        description: "Train educators on AI tools, pedagogical integration, and assessment redesign for AI-era teaching.",
      },
      {
        title: "Administrative Staff Training",
        description: "Equip non-teaching staff with AI literacy for administrative automation and process optimization.",
      },
      {
        title: "Student AI Literacy",
        description: "Develop curricula to help students understand AI capabilities, limitations, and responsible use.",
      },
      {
        title: "Ongoing Support & Community",
        description: "Create peer learning networks, workshops, and continuous professional development opportunities.",
      },
    ],
  },
  {
    id: "alignment",
    icon: Briefcase,
    enabled: false,
    items: [
      {
        title: "Industry Partnership Development",
        description: "Collaborate with employers to understand skill demands and align curriculum with job market needs.",
      },
      {
        title: "Graduate Competency Mapping",
        description: "Define and assess job-ready skills including AI fluency, critical thinking, and digital competencies.",
      },
      {
        title: "Work-Integrated Learning",
        description: "Integrate real-world projects, internships, and employer feedback into educational programs.",
      },
      {
        title: "Career Readiness Metrics",
        description: "Track graduate outcomes, employer satisfaction, and career trajectory to validate program effectiveness.",
      },
    ],
  },
];

export default function AISchools() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categoryTitles = {
    governance: "Governance, Policy & Academic Integrity",
    training: "Staff Training & Professional Development",
    alignment: "External Alignment: Job-ready graduates",
  };

  const toggleCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category?.enabled) {
      setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    }
  };

  // Prepare all modules for grid display
  const allModules = [
    {
      id: "courses",
      title: "Courses & Users",
      description: "Manage courses, map teachers, and assign students",
      icon: BookOpen,
      enabled: true,
      onClick: () => navigate("/school-courses"),
      items: [],
    },
    {
      id: "monitoring",
      title: "Monitoring",
      description: "Platform analytics, usage metrics, and performance monitoring",
      icon: BarChart3,
      enabled: true,
      onClick: () => navigate("/monitoring"),
      items: [],
    },
    ...categories.map((category) => ({
      id: category.id,
      title: categoryTitles[category.id as keyof typeof categoryTitles],
      description: "",
      icon: category.icon,
      enabled: category.enabled,
      onClick: () => category.enabled && toggleCategory(category.id),
      items: category.items,
    })),
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI for Schools</h1>
          <p className="text-muted-foreground text-lg">
            Strategic frameworks for institutional AI implementation
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allModules.map((module) => (
            <Card 
              key={module.id}
              className={`overflow-hidden flex flex-col h-full transition-all ${
                module.enabled 
                  ? 'hover:shadow-lg cursor-pointer hover:scale-[1.02]' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={module.onClick}
            >
              <CardHeader className="flex-1">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <module.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{module.title}</CardTitle>
                      {module.description && (
                        <CardDescription className="mt-1">
                          {module.description}
                        </CardDescription>
                      )}
                    </div>
                    {module.items.length > 0 && (
                      <ChevronDown
                        className={`h-5 w-5 transition-transform flex-shrink-0 ${
                          expandedCategory === module.id ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedCategory === module.id && module.items.length > 0 && (
                <CardContent className="pt-0 pb-6">
                  <div className="space-y-3">
                    {module.items.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
