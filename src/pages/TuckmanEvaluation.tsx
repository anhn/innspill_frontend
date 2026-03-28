import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TuckmanEvaluation() {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("managementToolkit.tuckmanEvaluation.title")}</CardTitle>
        <CardDescription>
          {t("managementToolkit.tuckmanEvaluation.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This module is coming soon. Tuckman Teamwork Self-Evaluation functionality will be implemented here.
        </p>
      </CardContent>
    </Card>
  );
}
