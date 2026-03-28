import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DefinitionOfDone() {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("managementToolkit.definitionOfDone.title")}</CardTitle>
        <CardDescription>
          {t("managementToolkit.definitionOfDone.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This module is coming soon. Definition of Done functionality will be implemented here.
        </p>
      </CardContent>
    </Card>
  );
}
