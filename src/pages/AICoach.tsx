import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, GraduationCap, Scale, Building } from "lucide-react";

export default function AICoach() {
  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Coach</h1>
          <p className="text-muted-foreground">
            Learn about GenAI and regulatory compliance in education
          </p>
        </div>

        <Tabs defaultValue="genai" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="genai">
              <Sparkles className="h-4 w-4 mr-2" />
              GenAI Basics
            </TabsTrigger>
            <TabsTrigger value="education">
              <GraduationCap className="h-4 w-4 mr-2" />
              AI in Education
            </TabsTrigger>
            <TabsTrigger value="norway">
              <Scale className="h-4 w-4 mr-2" />
              Norway AI Act
            </TabsTrigger>
            <TabsTrigger value="usn">
              <Building className="h-4 w-4 mr-2" />
              USN Policy
            </TabsTrigger>
          </TabsList>

          {/* GenAI Basics Tab */}
          <TabsContent value="genai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>What is Generative AI?</CardTitle>
                <CardDescription>Understanding the fundamentals</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  Generative AI refers to artificial intelligence systems that can create new content,
                  including text, images, audio, and code. These systems learn patterns from vast amounts
                  of training data and use that knowledge to generate novel outputs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Large Language Models (LLMs)</h4>
                    <p className="text-sm text-muted-foreground">
                      AI models trained on massive text datasets to understand and generate human-like text.
                      Examples: GPT-4, Claude, Gemini.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Prompt Engineering</h4>
                    <p className="text-sm text-muted-foreground">
                      The practice of crafting effective instructions to guide AI systems toward desired outputs.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Hallucination</h4>
                    <p className="text-sm text-muted-foreground">
                      When AI generates plausible but factually incorrect information. Always verify AI outputs.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Fine-tuning</h4>
                    <p className="text-sm text-muted-foreground">
                      Adapting a pre-trained model to perform better on specific tasks or domains.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Tokens</h4>
                    <p className="text-sm text-muted-foreground">
                      The basic units of text that AI models process. Roughly 1 token = 4 characters in English.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI in Education Tab */}
          <TabsContent value="education" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>GenAI in Education</CardTitle>
                <CardDescription>Transforming teaching and learning</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  Generative AI is reshaping education by automating routine tasks, personalizing learning
                  experiences, and providing new tools for both educators and students.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Use Cases for Educators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-1">Content Creation</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate lecture materials, create varied examples, develop practice questions
                  </p>
                </div>
                <div className="border-l-4 border-accent pl-4">
                  <h4 className="font-semibold mb-1">Personalized Learning</h4>
                  <p className="text-sm text-muted-foreground">
                    Adapt content to different learning levels, provide instant feedback, create custom study materials
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-1">Administrative Tasks</h4>
                  <p className="text-sm text-muted-foreground">
                    Automate grading, generate reports, manage course documentation
                  </p>
                </div>
                <div className="border-l-4 border-accent pl-4">
                  <h4 className="font-semibold mb-1">Accessibility</h4>
                  <p className="text-sm text-muted-foreground">
                    Translate materials, generate alternative formats, provide language support
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Challenges & Considerations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-destructive mr-2">⚠</span>
                    <span>Academic integrity and preventing overreliance on AI</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-destructive mr-2">⚠</span>
                    <span>Ensuring equity in access to AI tools</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-destructive mr-2">⚠</span>
                    <span>Data privacy and GDPR compliance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-destructive mr-2">⚠</span>
                    <span>Need for critical evaluation of AI-generated content</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Norway AI Act Tab */}
          <TabsContent value="norway" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Regulation in Norway</CardTitle>
                <CardDescription>Compliance with EU AI Act</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  Norway follows the EU AI Act through the EEA Agreement. The regulation establishes
                  a risk-based framework for AI systems, with stricter requirements for high-risk applications.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Requirements for Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Transparency Obligations</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Educational institutions must clearly disclose when AI systems are used:
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Inform students when interacting with AI systems</li>
                    <li>• Explain how AI influences assessments or decisions</li>
                    <li>• Provide human oversight options</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">Data Protection</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Strict rules for processing student data:
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Minimize data collection to what's necessary</li>
                    <li>• Obtain explicit consent for AI data processing</li>
                    <li>• Ensure data security and privacy by design</li>
                    <li>• Provide data deletion options</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-2">Risk Management</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Educational AI systems are considered high-risk and require:
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Regular risk assessments</li>
                    <li>• Documentation of AI system capabilities and limitations</li>
                    <li>• Monitoring for bias and discrimination</li>
                    <li>• Human oversight mechanisms</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USN Policy Tab */}
          <TabsContent value="usn" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>USN AI Policy</CardTitle>
                <CardDescription>University of South-Eastern Norway guidelines</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  USN has established comprehensive guidelines for responsible AI use in teaching and research,
                  balancing innovation with ethical considerations and regulatory compliance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Core Principles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary mb-1">Academic Integrity First</h4>
                  <p className="text-sm text-muted-foreground">
                    AI tools must support, not replace, critical thinking and learning. Students must
                    understand and disclose AI use in their work.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-1">Transparency Requirement</h4>
                  <p className="text-sm text-muted-foreground">
                    Educators must clearly communicate when and how AI is used in courses, including
                    assessment criteria and acceptable use policies.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-1">Data Privacy Protection</h4>
                  <p className="text-sm text-muted-foreground">
                    Student data must not be shared with external AI services without proper consent
                    and data processing agreements. Use approved, GDPR-compliant tools only.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-1">Quality Assurance</h4>
                  <p className="text-sm text-muted-foreground">
                    All AI-generated educational content must be reviewed by qualified educators
                    before use. Maintain accountability for content accuracy.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approved AI Tools for USN</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  USN has vetted the following AI tools for educational use with proper data processing agreements:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Canvas AI Assistant</strong> - Integrated with LMS, GDPR compliant</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Microsoft Copilot (Education)</strong> - Available through Office 365</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Google Workspace AI</strong> - For approved use cases with consent</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-destructive mr-2">⚠</span>
                    <span><strong>Public AI services</strong> - Require special approval and cannot process personal data</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
