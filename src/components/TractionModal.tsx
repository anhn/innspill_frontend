import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, GraduationCap, Building, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";

// EmailJS types
declare global {
  interface Window {
    emailjs: {
      send: (serviceId: string, templateId: string, templateParams: any) => Promise<any>;
    };
  }
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' }
];

const content = {
  en: {
    title: "Get Early Access to Beta!",
    subtitle: "Be the first to experience our AI-powered educational platform. We'll notify you as soon as the beta version is ready.",
    roleLabel: "What describes you best?",
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email address",
    submitButton: "Get Early Access",
    submittingButton: "Getting Ready...",
    privacyText: "By submitting, you agree to receive updates about our beta launch. We respect your privacy and won't spam you.",
    roles: {
      student: "Student",
      researcher: "Researcher", 
      teacher: "Teacher",
      school: "School",
      others: "Others"
    }
  },
  no: {
    title: "Få tidlig tilgang til Beta!",
    subtitle: "Vær den første til å oppleve vår AI-drevne utdanningsplattform. Vi vil varsle deg så snart betaversjonen er klar.",
    roleLabel: "Hva beskriver deg best?",
    emailLabel: "E-postadresse",
    emailPlaceholder: "Skriv inn din e-postadresse",
    submitButton: "Få tidlig tilgang",
    submittingButton: "Forbereder...",
    privacyText: "Ved å sende inn samtykker du til å motta oppdateringer om vår beta-lansering. Vi respekterer ditt personvern og vil ikke spamme deg.",
    roles: {
      student: "Student",
      researcher: "Forsker",
      teacher: "Lærer", 
      school: "Skole",
      others: "Andre"
    }
  },
  vi: {
    title: "Nhận quyền truy cập sớm vào Phiên bản Beta!",
    subtitle: "Hãy là người đầu tiên trải nghiệm nền tảng giáo dục được hỗ trợ bởi AI của chúng tôi. Chúng tôi sẽ thông báo cho bạn ngay khi phiên bản beta sẵn sàng.",
    roleLabel: "Điều gì mô tả bạn tốt nhất?",
    emailLabel: "Địa chỉ Email",
    emailPlaceholder: "Nhập địa chỉ email của bạn",
    submitButton: "Nhận quyền truy cập sớm",
    submittingButton: "Đang chuẩn bị...",
    privacyText: "Bằng cách gửi, bạn đồng ý nhận thông tin cập nhật về việc ra mắt beta của chúng tôi. Chúng tôi tôn trọng quyền riêng tư của bạn và sẽ không gửi thư rác.",
    roles: {
      student: "Học sinh",
      researcher: "Nhà nghiên cứu",
      teacher: "Giáo viên",
      school: "Trường học", 
      others: "Khác"
    }
  }
};

interface TractionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TractionModal = ({ isOpen, onClose }: TractionModalProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localLanguage, setLocalLanguage] = useState<"en" | "no" | "vi">("en");

  const currentContent = content[localLanguage] || content.en;

  const roles = [
    { value: "student", label: currentContent.roles.student, icon: Users },
    { value: "researcher", label: currentContent.roles.researcher, icon: GraduationCap },
    { value: "teacher", label: currentContent.roles.teacher, icon: BookOpen },
    { value: "school", label: currentContent.roles.school, icon: Building },
    { value: "others", label: currentContent.roles.others, icon: User },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !selectedRole) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Send email using EmailJS or your preferred email service
      await sendTractionEmail(email, selectedRole, localLanguage);
      
      // Navigate to login page
      navigate("/auth");
    } catch (error) {
      console.error("Error submitting traction data:", error);
      // Still navigate to login page even if email fails
      navigate("/auth");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendTractionEmail = async (email: string, role: string, language: string) => {
    // Using Formspree for static website email handling
    const formData = new FormData();
    formData.append('email', email);
    formData.append('role', role);
    formData.append('language', language);
    formData.append('timestamp', new Date().toISOString());
    formData.append('user_agent', navigator.userAgent);
    formData.append('referrer', document.referrer);
    formData.append('_subject', 'New AI4EDU Traction Signup');
    formData.append('_replyto', email);
    formData.append('_captcha', 'false');
    formData.append('_next', window.location.href);

    try {
      // Send to Formspree
      const response = await fetch('https://formspree.io/f/mvgwegnq', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('Email sent successfully to anhnd85@gmail.com');
        console.log('Formspree response:', await response.json());
      } else {
        console.error('Formspree error:', response.status, response.statusText);
        const errorData = await response.json();
        console.error('Error details:', errorData);
      }
      
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Fallback: Open email client
      const mailtoLink = `mailto:anhnd85@gmail.com?subject=New AI4EDU Traction Signup&body=${encodeURIComponent(
        `New user signup for AI4EDU:\n\nEmail: ${email}\nRole: ${role}\nLanguage: ${language}\nTimestamp: ${new Date().toISOString()}`
      )}`;
      window.open(mailtoLink);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with transparency */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4 p-6 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 flex gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLocalLanguage(lang.code as "en" | "no" | "vi")}
              className={`text-2xl hover:scale-110 transition-transform ${
                localLanguage === lang.code ? 'ring-2 ring-blue-500 rounded-full' : ''
              }`}
              title={lang.name}
            >
              {lang.flag}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentContent.title}
          </h2>
          <p className="text-gray-600">
            {currentContent.subtitle}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              {currentContent.roleLabel}
            </Label>
            <RadioGroup value={selectedRole} onValueChange={setSelectedRole}>
              {roles.map((role) => (
                <div key={role.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={role.value} id={role.value} />
                  <Label 
                    htmlFor={role.value} 
                    className="flex items-center space-x-2 cursor-pointer flex-1"
                  >
                    <role.icon className="h-4 w-4 text-gray-500" />
                    <span>{role.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              {currentContent.emailLabel}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={currentContent.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!email || !selectedRole || !isValidEmail(email) || isSubmitting}
            className="w-full bg-gradient-primary hover:bg-gradient-primary/90 text-white font-medium py-2.5"
          >
            {isSubmitting ? currentContent.submittingButton : currentContent.submitButton}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          {currentContent.privacyText}
        </p>
      </div>
    </div>
  );
};

export default TractionModal;
