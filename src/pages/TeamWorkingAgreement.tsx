import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TeamWorkingAgreement() {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("managementToolkit.teamWorkingAgreement.title")}</CardTitle>
        <CardDescription>
          {t("managementToolkit.teamWorkingAgreement.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This module is coming soon. Team Working Agreement functionality will be implemented here.
        </p>
      </CardContent>
    </Card>
  );
}
