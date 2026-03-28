import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RetrospectiveReview() {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("managementToolkit.retrospectiveReview.title")}</CardTitle>
        <CardDescription>
          {t("managementToolkit.retrospectiveReview.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This module is coming soon. Retrospective Review functionality will be implemented here.
        </p>
      </CardContent>
    </Card>
  );
}
