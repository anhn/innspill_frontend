import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logAction } from "@/utils/activityLogger";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import API_ENDPOINTS from "@/config/api";
import { ROLE_OPTIONS, ROLE_ROUTES, getStoredRole, persistRole, UserRole } from "@/constants/roles";

interface Course {
  id: string;
  courseId: string;
  name: string;
  code: string;
  academicYear: string;
  university: string;
  teacherId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function Auth() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupType, setSignupType] = useState<"student" | "teacher">("teacher");
  const [signupCourse, setSignupCourse] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const pendingSignupDataRef = useRef<{
    name: string;
    email: string;
    password: string;
    type: "student" | "teacher";
    courseId?: string;
  } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: t("auth.error"),
        description: t("auth.fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store user info in localStorage
      try {
        localStorage.setItem("ai4edu_user", data.user?.username || loginEmail);
        
        if (data.sessionId) {
          localStorage.setItem("ai4edu_session_id", data.sessionId);
        }
      } catch (storageError) {
        // Silently handle storage errors
      }

      // Log successful login (best-effort)
      logAction({
        action: 'login',
        endpoint: API_ENDPOINTS.auth.login,
        method: 'POST',
        success: true,
        metadata: { 
          loginType: 'database',
          role: data.user?.role,
          country: data.user?.country
        }
      });

      // Determine role from user data or default to teacher
      const userRole = data.user?.role || 'teacher';
      persistRole(userRole as UserRole);

      toast({
        title: t("auth.loginSuccess"),
        description: t("auth.loginSuccessDesc"),
      });
      
      const destination = ROLE_ROUTES[userRole as UserRole] || "/ai-teacher";
      navigate(destination);
    } catch (error) {
      
      // Log failed login attempt (best-effort)
      logAction({
        action: 'login',
        endpoint: API_ENDPOINTS.auth.login,
        method: 'POST',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        metadata: { usernameTried: loginEmail ? 'provided' : 'empty' }
      });

      toast({
        title: t("auth.error"),
        description: error instanceof Error ? error.message : t("auth.loginFailed"),
        variant: "destructive",
      });
    }
  };

  // Fetch courses when type is student
  useEffect(() => {
    if (signupType === "student") {
      fetchCourses();
    } else {
      setCourses([]);
      setSignupCourse("");
    }
  }, [signupType]);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const userName = localStorage.getItem('ai4edu_user') || '';
      const params = new URLSearchParams();
      if (userName) {
        params.append('userName', userName);
      }
      
      const url = params.toString() 
        ? `${API_ENDPOINTS.courses.list}?${params.toString()}`
        : API_ENDPOINTS.courses.list;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const fetchedCourses = Array.isArray(result.data) ? result.data : [];
          setCourses(fetchedCourses);
        } else {
          setCourses([]);
        }
      } else {
        await response.json().catch(() => ({}));
        setCourses([]);
      }
    } catch (error) {
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSignupClick = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim whitespace from inputs
    const trimmedName = signupName?.trim() || '';
    const trimmedEmail = signupEmail?.trim() || '';
    const trimmedPassword = signupPassword?.trim() || '';
    
    // Basic validation
    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      toast({
        title: t("auth.error"),
        description: t("auth.validation"),
        variant: "destructive",
      });
      return;
    }
    
    // Email validation (basic pattern check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast({
        title: t("auth.error"),
        description: t("auth.invalidEmail"),
        variant: "destructive",
      });
      return;
    }

    // Password strength validation (minimum 6 characters)
    if (trimmedPassword.length < 6) {
      toast({
        title: t("auth.error"),
        description: t("auth.passwordTooShort"),
        variant: "destructive",
      });
      return;
    }

    // Validate course selection for students
    if (signupType === "student" && !signupCourse) {
      toast({
        title: t("auth.error"),
        description: "Please select a course",
        variant: "destructive",
      });
      return;
    }

    // Capture the courseId before showing dialog
    let courseIdToSave: string | undefined = undefined;
    if (signupType === "student" && signupCourse) {
      const selectedCourse = courses.find(c => c.id === signupCourse || c.courseId === signupCourse);
      if (selectedCourse) {
        courseIdToSave = selectedCourse.courseId || selectedCourse.id;
      } else {
        courseIdToSave = signupCourse;
      }
    }

    // Store the form data before showing dialog (using ref for immediate access)
    pendingSignupDataRef.current = {
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      type: signupType,
      courseId: courseIdToSave,
    };

    // Reset consent checkbox and show consent dialog
    setConsentChecked(false);
    setShowConsentDialog(true);
  };

  const handleConsent = () => {
    if (!consentChecked) {
      toast({
        title: t("auth.error"),
        description: "Du må bekrefte samtykket ved å krysse av i boksen.",
        variant: "destructive",
      });
      return;
    }
    setHasConsented(true);
    setShowConsentDialog(false);
    setConsentChecked(false); // Reset for next time
    
    // Proceed with registration using captured data from ref
    if (pendingSignupDataRef.current) {
      handleSignup(pendingSignupDataRef.current);
    } else {
      // Fallback to current state if no pending data (shouldn't happen)
      handleSignup();
    }
  };

  const handleNoConsent = () => {
    setShowConsentDialog(false);
    setConsentChecked(false); // Reset checkbox
    pendingSignupDataRef.current = null; // Clear pending data
    toast({
      title: t("auth.error"),
      description: "Du må samtykke for å fortsette med registreringen.",
      variant: "destructive",
    });
  };

  const handleSignup = async (formData?: {
    name: string;
    email: string;
    password: string;
    type: "student" | "teacher";
    courseId?: string;
  }) => {
    // Use provided formData or fall back to state (for backward compatibility)
    const dataToUse = formData || {
      name: signupName?.trim() || '',
      email: signupEmail?.trim() || '',
      password: signupPassword?.trim() || '',
      type: signupType,
      courseId: signupType === "student" && signupCourse 
        ? (courses.find(c => c.id === signupCourse || c.courseId === signupCourse)?.courseId || 
           courses.find(c => c.id === signupCourse || c.courseId === signupCourse)?.id || 
           signupCourse)
        : undefined,
    };
    
    try {
      const requestBody: any = {
        name: dataToUse.name,
        username: dataToUse.name,
        email: dataToUse.email,
        password: dataToUse.password,
        type: dataToUse.type,
      };

      // Add remark (courseId) for students
      if (dataToUse.type === "student" && dataToUse.courseId) {
        requestBody.remark = dataToUse.courseId;
      }

      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Log successful registration
      logAction({
        action: 'login', // Using 'login' as registration is not in the enum
        endpoint: API_ENDPOINTS.auth.register,
        method: 'POST',
        success: true,
        metadata: { 
          registrationType: 'new-account',
          username: dataToUse.name,
          email: dataToUse.email
        }
      });

      toast({
        title: t("auth.signupSuccess") || "Account Created",
        description: t("auth.signupSuccessDesc") || "Welcome to EduAI Coach! Please log in.",
      });

      // Clear form
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupType("teacher");
      setSignupCourse("");
      setHasConsented(false);
      setConsentChecked(false);
      pendingSignupDataRef.current = null; // Clear pending data
      
      // Switch to login tab (optional - you can auto-login instead)
      // For now, let user manually login with new credentials
      
    } catch (error) {
      // Log failed registration
      logAction({
        action: 'login',
        endpoint: API_ENDPOINTS.auth.register,
        method: 'POST',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        metadata: { emailTried: dataToUse.email ? 'provided' : 'empty' }
      });

      toast({
        title: t("auth.error"),
        description: error instanceof Error ? error.message : "Registration failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t("auth.brandName")}</h1>
          <p className="text-white/80">{t("auth.brandTagline")}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>{t("auth.welcome")}</CardTitle>
                <CardDescription>{t("auth.welcomeDesc")}</CardDescription>
              </div>
              <div className="w-44">
                <Select value={language} onValueChange={(val) => setLanguage(val as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.language")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t("settings.english")}</SelectItem>
                    <SelectItem value="no">{t("settings.norwegian")}</SelectItem>
                    <SelectItem value="vi">{t("settings.vietnamese")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
                <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Username</Label>
                    <Input
                      id="login-email"
                      type="text"
                      placeholder={t("auth.email")}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder={t("auth.password")}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <LogIn className="mr-2 h-4 w-4" />
                    {t("auth.login")}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignupClick} className="space-y-4" noValidate>
                  <div>
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your Username"
                      value={signupName}
                      onChange={(e) => {
                        setSignupName(e.target.value);
                      }}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@usn.no"
                      value={signupEmail}
                      onChange={(e) => {
                        setSignupEmail(e.target.value);
                      }}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => {
                        setSignupPassword(e.target.value);
                      }}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-type">Type</Label>
                    <Select
                      value={signupType}
                      onValueChange={(value) => {
                        setSignupType(value as "student" | "teacher");
                        setSignupCourse(""); // Reset course when type changes
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {signupType === "student" && (
                    <div>
                      <Label htmlFor="signup-course">Course</Label>
                      <Select
                        value={signupCourse}
                        onValueChange={setSignupCourse}
                        disabled={loadingCourses}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Select a course"} />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.length === 0 && !loadingCourses ? (
                            <SelectItem value="" disabled>No courses available</SelectItem>
                          ) : (
                            courses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.name} ({course.code})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button type="submit" className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t("auth.signup")}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm leading-relaxed max-w-2xl mx-auto">
            InnSpill AI er en prototype på en virtuell assistent basert på GPT-teknologi som skal støtte studenter i læringen av kursene. Prosjektet ledes av professor Anh Nguyen-Duc ved Institutt for økonomi og informatikk, Handelshøyskolen, Universitetet i Sørøst-Norge (kontakt: angu@usn.no). All informasjon som samles inn, brukes utelukkende til formålene beskrevet her og behandles konfidensielt i tråd med gjeldende personvernregler. Vi gjennomfører nødvendige tekniske og organisatoriske tiltak for å beskytte opplysningene dine, og data lagres sikkert i en beskyttet database med tilgang begrenset til forskningsteamet.
          </p>
        </div>
      </div>

      {/* Consent Dialog */}
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Samtykke til deltakelse i forskningsprosjekt</DialogTitle>
            <DialogDescription className="text-left">
              <div className="space-y-4 mt-4 text-sm leading-relaxed">
                <div>
                  <h3 className="font-semibold text-base mb-2">Kunstig intelligens i utdanning: Evaluation of InnSpill Platform</h3>
                  <p>
                    Du inviteres til å delta i et forskningsprosjekt som undersøker bruk av kunstig intelligens (KI) i utdanning. Før du kan ta i bruk KI-baserte funksjoner i plattformen, ber vi deg lese informasjonen nedenfor og ta stilling til om du ønsker å gi samtykke. Deltakelse er frivillig, og du kan når som helst trekke samtykket uten negative konsekvenser.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-2">Formålet med prosjektet</h4>
                  <p>
                    Formålet med prosjektet er å undersøke og evaluere hvordan KI-baserte verktøy kan støtte studenters læring, refleksjon og arbeid med oppgaver i høyere utdanning. Prosjektet har som mål å:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>forstå hvordan studenter bruker KI i læringsprosesser</li>
                    <li>evaluere pedagogisk nytte, begrensninger og risiko ved bruk av KI</li>
                    <li>bidra til trygg, ansvarlig og transparent bruk av KI i undervisning</li>
                  </ul>
                  <p className="mt-2">
                    Prosjektet er et forsknings- og utviklingsprosjekt. Data kan også benyttes til videre utvikling og kvalitetsforbedring av InnSpill-plattformen, samt i vitenskapelige publikasjoner og forskningsformidling. Personopplysninger brukes ikke til karaktersetting eller disiplinære vurderinger, med mindre dette er tydelig kommunisert på forhånd av institusjonen.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-2">Hvorfor får du denne forespørselen?</h4>
                  <p>
                    Du får denne forespørselen fordi du er student eller deltaker i et emne, kurs eller læringsaktivitet der InnSpill-plattformen og KI-baserte funksjoner inngår som del av undervisningen.
                  </p>
                  <p className="mt-2">
                    Alle deltakere i det aktuelle emnet eller tilbudet får samme forespørsel.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-2">Hvem er ansvarlig for forskningsprosjektet?</h4>
                  <p>
                    University of South-Eastern Norway (Universitetet i Sørøst-Norge) er behandlingsansvarlig for personopplysningene som behandles i prosjektet.
                  </p>
                  <p className="mt-2">
                    <strong>Prosjektansvarlig:</strong><br />
                    Professor Anh Nguyen-Duc<br />
                    E-post: <a href="mailto:angu@usn.no" className="text-primary hover:underline">angu@usn.no</a>
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-2">Hva innebærer det å delta?</h4>
                  <p>
                    Dersom du samtykker, innebærer deltakelsen at du kan bruke KI-baserte funksjoner i InnSpill-plattformen, for eksempel:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>veiledning og forslag til videre arbeid</li>
                    <li>støtte til strukturering av oppgaver og refleksjon</li>
                    <li>automatisk generert tilbakemelding</li>
                  </ul>
                  <p className="mt-2">
                    I forbindelse med dette kan følgende opplysninger samles inn:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>tekstlige oppgavesvar og refleksjoner</li>
                    <li>dialog og interaksjon med KI-systemet</li>
                    <li>tidsstempler, bruksmønstre og tekniske loggfiler</li>
                  </ul>
                  <p className="mt-2">
                    Opplysningene registreres elektronisk gjennom plattformen.
                  </p>
                  <p className="mt-2">
                    Det samles ikke inn særlige kategorier av personopplysninger (sensitive data), med mindre du selv frivillig skriver slik informasjon i fritekst.
                  </p>
                  <p className="mt-2">
                    Prosjektet innebærer ikke automatiserte avgjørelser med rettsvirkning eller tilsvarende vesentlig betydning for deg.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-2">Frivillighet og mulighet for å trekke seg</h4>
                  <p>
                    Det er frivillig å delta i prosjektet.
                  </p>
                  <p className="mt-2">
                    Du kan når som helst trekke samtykket ditt uten begrunnelse og uten negative konsekvenser.
                  </p>
                  <p className="mt-2">
                    Dersom du trekker samtykket, vil du ikke kunne benytte KI-baserte funksjoner videre, og opplysninger som ennå ikke er anonymisert vil bli slettet så langt det er mulig.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-2">Kort om personvern</h4>
                  <p>
                    Personopplysninger behandles konfidensielt og i samsvar med personvernforordningen (GDPR).
                  </p>
                  <p className="mt-2">
                    Opplysningene brukes kun til formålene som er beskrevet i dette samtykket.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-2">Hvordan lagres og sikres opplysningene dine?</h4>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Data lagres på sikre servere innenfor EU/EØS</li>
                    <li>Kun autoriserte medlemmer av prosjektgruppen har tilgang</li>
                    <li>Opplysningene anonymiseres eller pseudonymiseres så langt det er mulig</li>
                    <li>Ingen enkeltpersoner vil kunne gjenkjennes i publikasjoner eller rapporter</li>
                    <li>Eventuelle teknologileverandører benyttes i tråd med gjeldende databehandleravtaler. Personopplysninger overføres ikke til land utenfor EU/EØS uten nødvendige sikkerhetstiltak.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-2">Rettslig grunnlag</h4>
                  <p>
                    Behandlingen av personopplysninger skjer på grunnlag av ditt samtykke, jf. GDPR artikkel 6 nr. 1 bokstav a.
                  </p>
                  <p className="mt-2">
                    Prosjektet er vurdert av Sikt – Kunnskapssektorens tjenesteleverandør, som har funnet at behandlingen av personopplysninger skjer i samsvar med personvernregelverket.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-2">Hvor lenge lagres opplysningene?</h4>
                  <p>
                    Prosjektet er planlagt avsluttet 1st Oct 2026.
                  </p>
                  <p className="mt-2">
                    Når prosjektet er avsluttet, vil personopplysninger bli slettet eller anonymisert i tråd med Universitetet i Sørøst-Norges retningslinjer. Anonymiserte data kan lagres videre for forsknings- og undervisningsformål innen samme fagområde.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-2">Dine rettigheter</h4>
                  <p>
                    Så lenge det er mulig å identifisere deg i datamaterialet, har du rett til:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>innsyn i hvilke opplysninger som behandles</li>
                    <li>retting eller sletting av opplysninger</li>
                    <li>å trekke samtykket ditt</li>
                  </ul>
                  <p className="mt-2">
                    Mer informasjon om dine rettigheter finner du på Datatilsynets nettsider:<br />
                    <a href="https://www.datatilsynet.no/rettigheter-og-plikter/den-registrertes-rettigheter/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      https://www.datatilsynet.no/rettigheter-og-plikter/den-registrertes-rettigheter/
                    </a>
                  </p>
                  <p className="mt-2">
                    For spørsmål eller utøvelse av rettigheter kan du kontakte:<br />
                    <strong>Prosjektansvarlig:</strong> Professor Anh Nguyen-Duc, <a href="mailto:angu@usn.no" className="text-primary hover:underline">angu@usn.no</a>
                  </p>
                  <p className="mt-2">
                    Spørsmål om personvernvurderingen kan også rettes til:<br />
                    <a href="mailto:personverntjenester@sikt.no" className="text-primary hover:underline">personverntjenester@sikt.no</a> | Telefon 73 98 40 40
                  </p>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-3">Samtykke</h4>
                  <p className="mb-4">
                    Jeg har lest og forstått informasjonen over og samtykker til at mine opplysninger behandles slik det er beskrevet.
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:gap-2">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Checkbox
                id="consent-checkbox"
                checked={consentChecked}
                onCheckedChange={(checked) => setConsentChecked(checked === true)}
              />
              <Label htmlFor="consent-checkbox" className="text-sm font-normal cursor-pointer">
                Jeg samtykker til deltakelse i forskningsprosjektet
              </Label>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleNoConsent}
                className="flex-1 sm:flex-none"
              >
                Jeg samtykker ikke
              </Button>
              <Button
                type="button"
                onClick={handleConsent}
                disabled={!consentChecked}
                className="flex-1 sm:flex-none"
              >
                Jeg samtykker
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
