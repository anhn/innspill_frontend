import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Globe, History, Info, User, Trophy, Award, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import ChatHistory from "./ChatHistory";
import API_ENDPOINTS from "@/config/api";
import { useState, useEffect, useMemo } from "react";

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  
  // Organization options (same as in AITeacher)
  const organizationOptions = useMemo(() => {
    const allowedCountry = 'all' as 'all' | 'norway' | 'vietnam'; // You can make this dynamic if needed
    return [
      ...(allowedCountry === 'norway' || allowedCountry === 'all' ? [
        { value: "OsloMet – storbyuniversitetet (OsloMet)", label: "OsloMet – storbyuniversitetet", short: "OsloMet", country: "norway", educationLevel: "university" },
        { value: "Universitetet i Sørøst-Norge (USN)", label: "Universitetet i Sørøst-Norge", short: "USN", country: "norway", educationLevel: "university" },
        { value: "Norges teknisk-naturvitenskapelige universitet (NTNU)", label: "Norges teknisk-naturvitenskapelige universitet", short: "NTNU", country: "norway", educationLevel: "university" },
        { value: "Asker International School", label: "Asker International School", short: "AIS", country: "norway", educationLevel: "primary" },
      ] : []),
      ...(allowedCountry === 'vietnam' || allowedCountry === 'all' ? [
        { value: "UTC - Trường Đại học Giao thông Vận tải", label: "Trường Đại học Giao thông Vận tải", short: "UTC", country: "vietnam", educationLevel: "university" },
        { value: "VNU - Trường Đại học Công nghệ, ĐHQGHN (UET)", label: "VNU - Trường Đại học Công nghệ, ĐHQGHN", short: "VNU-UET", country: "vietnam", educationLevel: "university" },
      ] : []),
    ];
  }, []);

  // Default organization based on language
  const defaultOrg = useMemo(() => {
    return language === 'no' ? "Universitetet i Sørøst-Norge (USN)" : organizationOptions[0]?.value || "";
  }, [language, organizationOptions]);

  // Get current organization from localStorage
  const [currentOrganization, setCurrentOrganization] = useState<string>(() => {
    try {
      return localStorage.getItem('ai4edu_organization') || defaultOrg;
    } catch {
      return defaultOrg;
    }
  });

  // Get current academic year from localStorage
  const defaultAcademicYear = "2025-2026";
  const [currentAcademicYear, setCurrentAcademicYear] = useState<string>(() => {
    try {
      return localStorage.getItem('ai4edu_academicYear') || defaultAcademicYear;
    } catch {
      return defaultAcademicYear;
    }
  });

  // Sync with localStorage changes
  useEffect(() => {
    const storedOrg = localStorage.getItem('ai4edu_organization');
    if (storedOrg) {
      setCurrentOrganization(storedOrg);
    } else if (defaultOrg) {
      setCurrentOrganization(defaultOrg);
      localStorage.setItem('ai4edu_organization', defaultOrg);
    }
  }, [defaultOrg]);

  // Sync academic year with localStorage changes
  useEffect(() => {
    const storedAcademicYear = localStorage.getItem('ai4edu_academicYear');
    if (storedAcademicYear) {
      setCurrentAcademicYear(storedAcademicYear);
    } else {
      setCurrentAcademicYear(defaultAcademicYear);
      localStorage.setItem('ai4edu_academicYear', defaultAcademicYear);
    }
  }, []);

  const handleOrganizationChange = (orgValue: string) => {
    setCurrentOrganization(orgValue);
    try {
      localStorage.setItem('ai4edu_organization', orgValue);
      toast({
        title: t("settings.organizationUpdated") || "Organization Updated",
        description: t("settings.organizationUpdatedDesc") || "Your organization preference has been saved.",
      });
    } catch (e) {
      console.error('Failed to save organization to localStorage:', e);
      toast({
        title: "Error",
        description: "Failed to save organization preference.",
        variant: "destructive",
      });
    }
  };

  const handleAcademicYearChange = (yearValue: string) => {
    setCurrentAcademicYear(yearValue);
    try {
      localStorage.setItem('ai4edu_academicYear', yearValue);
      toast({
        title: t("settings.academicYearUpdated") || "Academic Year Updated",
        description: t("settings.academicYearUpdatedDesc") || "Your academic year preference has been saved.",
      });
    } catch (e) {
      console.error('Failed to save academic year to localStorage:', e);
      toast({
        title: "Error",
        description: "Failed to save academic year preference.",
        variant: "destructive",
      });
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value as "en" | "no" | "vi");
    toast({
      title: t("settings.languageUpdated"),
      description: value === "en" ? t("settings.languageSetEN") : value === "no" ? t("settings.languageSetNO") : t("settings.languageSetVI"),
    });
  };

  // Get current user
  const currentUser = (() => {
    try {
      return localStorage.getItem('ai4edu_user') || 'Guest';
    } catch {
      return 'Guest';
    }
  })();

  // Fetch registration date from backend
  const [registrationDate, setRegistrationDate] = useState<string | null>(null);
  const [isLoadingRegistrationDate, setIsLoadingRegistrationDate] = useState(true);

  useEffect(() => {
    const fetchRegistrationDate = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.auth.registrationDate, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Use formatted date if available, otherwise format the ISO date
            setRegistrationDate(result.data.registrationDateFormatted || new Date(result.data.registrationDate).toLocaleDateString());
          }
        }
      } catch (error) {
        console.error('Error fetching registration date:', error);
      } finally {
        setIsLoadingRegistrationDate(false);
      }
    };

    fetchRegistrationDate();
  }, []);

  // Change password dialog state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch(API_ENDPOINTS.auth.changePassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast({
            title: "Success",
            description: "Password changed successfully",
          });
          setIsChangePasswordOpen(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          throw new Error(result.message || "Failed to change password");
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to change password' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("settings.title")}</h1>
          <p className="text-muted-foreground">
            {t("settings.subtitle")}
          </p>
        </div>

        <Tabs defaultValue="language" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t("settings.language")}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Action History
            </TabsTrigger>
            <TabsTrigger value="membership" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Membership
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              {t("settings.about")}
            </TabsTrigger>
          </TabsList>

          {/* Language Tab */}
          <TabsContent value="language" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle>{t("settings.language")}</CardTitle>
                </div>
                <CardDescription>
                  {t("settings.languageDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={language} onValueChange={handleLanguageChange}>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value="en" id="lang-en" />
                    <Label htmlFor="lang-en" className="flex-1 cursor-pointer font-normal">
                      <div className="font-semibold">{t("settings.english")}</div>
                      <div className="text-sm text-muted-foreground">
                        {t("settings.englishDesc")}
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value="no" id="lang-no" />
                    <Label htmlFor="lang-no" className="flex-1 cursor-pointer font-normal">
                      <div className="font-semibold">{t("settings.norwegian")}</div>
                      <div className="text-sm text-muted-foreground">
                        {t("settings.norwegianDesc")}
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value="vi" id="lang-vi" />
                    <Label htmlFor="lang-vi" className="flex-1 cursor-pointer font-normal">
                      <div className="font-semibold">{t("settings.vietnamese")}</div>
                      <div className="text-sm text-muted-foreground">
                        {t("settings.vietnameseDesc")}
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  <CardTitle>Action History</CardTitle>
                </div>
                <CardDescription>
                  Review recent AI interactions and monitor activity without leaving the settings area.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChatHistory embedded />
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <CardTitle>{t("settings.about")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">InnSpill AI</strong> {t("settings.aboutText")}
                </p>
                <p className="mt-4">
                  {t("settings.version")}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Membership Tab */}
          <TabsContent value="membership" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Membership</CardTitle>
                </div>
                <CardDescription>
                  Your account information and membership details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                  <p className="text-foreground font-medium">{currentUser}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
                  <p className="text-foreground">Active</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                  <p className="text-foreground">
                    {isLoadingRegistrationDate ? "Loading..." : (registrationDate || "N/A")}
                  </p>
                </div>
                <div className="space-y-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="w-full max-w-md"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="organization-select" className="text-sm font-medium text-muted-foreground">
                    {t("settings.organization") || "Your Organization"}
                  </Label>
                  <Select
                    value={currentOrganization || defaultOrg}
                    onValueChange={handleOrganizationChange}
                    disabled={true}
                  >
                    <SelectTrigger id="organization-select" className="w-full max-w-md" disabled={true}>
                      <SelectValue placeholder={t("settings.selectOrganization") || "Select organization"} />
                    </SelectTrigger>
                    <SelectContent>
                      {organizationOptions.map((org) => (
                        <SelectItem key={org.value} value={org.value}>
                          {org.label} ({org.short})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("settings.organizationDesc") || "This provides context for your work but doesn't affect dashboard items."}
                  </p>
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="academic-year-input" className="text-sm font-medium text-muted-foreground">
                    {t("settings.academicYear") || "Academic Year"}
                  </Label>
                  <Input
                    id="academic-year-input"
                    type="text"
                    value={currentAcademicYear}
                    onChange={(e) => handleAcademicYearChange(e.target.value)}
                    placeholder="2025-2026"
                    className="w-full max-w-md"
                    disabled={true}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("settings.academicYearDesc") || "The academic year for your courses and projects."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Badges Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <CardTitle>AI Literacy Badges</CardTitle>
                </div>
                <CardDescription>
                  Earned badges from completing AI Literacy course levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const savedBadges = (() => {
                    try {
                      const badges = localStorage.getItem('ai_literacy_badges');
                      return badges ? JSON.parse(badges) : [];
                    } catch {
                      return [];
                    }
                  })();

                  const badgeData = [
                    { id: "foundational-ai", name: "Foundational AI Expert", description: "Mastered the basics of AI literacy", level: 1 },
                    { id: "advanced-ai", name: "Advanced AI Practitioner", description: "Achieved advanced AI literacy skills", level: 2 },
                    { id: "flint-ai", name: "Flint AI Master", description: "Achieved mastery in AI literacy and innovation", level: 3 },
                  ];

                  const earnedBadges = badgeData.filter(b => savedBadges.includes(b.id));
                  const unearnedBadges = badgeData.filter(b => !savedBadges.includes(b.id));

                  if (earnedBadges.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <p className="text-muted-foreground">No badges earned yet</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Complete AI Literacy course levels to earn badges
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3 text-green-600">Earned Badges ({earnedBadges.length}/3)</h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          {earnedBadges.map(badge => (
                            <div
                              key={badge.id}
                              className="p-4 border-2 border-yellow-500 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-md"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <Award className="h-8 w-8 text-yellow-600" />
                                <div className="flex-1">
                                  <p className="font-bold text-lg">{badge.name}</p>
                                  <p className="text-sm text-muted-foreground">Level {badge.level}</p>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">{badge.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {unearnedBadges.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 text-muted-foreground">Locked Badges</h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            {unearnedBadges.map(badge => (
                              <div
                                key={badge.id}
                                className="p-4 border-2 border-gray-300 rounded-lg bg-gray-50 opacity-60"
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <Award className="h-8 w-8 text-gray-400" />
                                  <div className="flex-1">
                                    <p className="font-bold text-lg text-gray-500">{badge.name}</p>
                                    <p className="text-sm text-muted-foreground">Level {badge.level}</p>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{badge.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsChangePasswordOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
