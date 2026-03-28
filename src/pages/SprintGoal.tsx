import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SprintGoal() {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("managementToolkit.sprintGoal.title")}</CardTitle>
        <CardDescription>
          {t("managementToolkit.sprintGoal.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This module is coming soon. Sprint goal functionality will be implemented here.
        </p>
      </CardContent>
    </Card>
  );
}
