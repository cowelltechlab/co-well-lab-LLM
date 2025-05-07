import { useState } from "react";
import { useAppContext } from "@/context/useAppContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { TextInputDialog } from "@/components/TextInputDialog";
import {
  resumeTextPlaceholder,
  jobDescriptionPlaceholder,
} from "@/placeholders/placeholder_values";

export function WelcomeInputView() {
  const navigate = useNavigate();
  const { letterLabData } = useAppContext();

  useEffect(() => {
    if (!letterLabData?.hasAccess) {
      navigate("/enter");
    }
  }, [letterLabData, navigate]);

  const {
    resumeText,
    jobDescription,
    setResumeText,
    setJobDescription,
    isGeneratingCoverLetter,
    generationError,
    initialGeneration,
  } = useAppContext();

  const [showResumePopup, setShowResumePopup] = useState(false);
  const [showJobPopup, setShowJobPopup] = useState(false);

  const handleGenerate = async () => {
    const success = await initialGeneration();
    if (success) {
      navigate("/review-all");
    }
  };

  return (
    <Card className="w-full max-w-2xl p-6 text-center shadow-lg bg-white space-y-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Welcome to LetterLab, an AI Cover Letter Generator
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-left text-gray-700 leading-relaxed">
        <p>
          Hi there! 👋 Welcome to <strong>LetterLab</strong>, your personalized
          Cover Letter Builder — a space designed to help you create a cover
          letter that’s not only professional, but also a true reflection of
          your skills, goals, and personality.
        </p>
        <p>
          We believe the best cover letters don’t come from templates or generic
          buzzwords — they come from <em>you</em>. A great cover letter clearly
          shows how your strengths and experiences connect to the specific job
          you’re applying for. That’s why we’ll be using your resume as a
          starting point to highlight your qualifications in a way that directly
          aligns with the job description. Think of it as translating your
          resume into a story that fits the role.
        </p>
        <p>
          But we’re not stopping there. We’ll also be using{" "}
          <strong>Bandura’s Self-Efficacy Theory</strong> to guide how we build
          this content — together. This means focusing on what you believe you
          can do, what you’ve already succeeded at, and where you’re most
          confident. We’ll reflect on your past achievements (
          <em>mastery experiences</em>), consider how others’ successes inspire
          you (<em>vicarious experiences</em>), and even use affirming,
          encouraging language (<em>verbal persuasion</em>) to help you express
          yourself with confidence.
        </p>
        <p>
          Together, we’ll make sure your cover letter feels like{" "}
          <strong>you</strong> — clear, capable, and ready for the opportunity
          ahead. Add your resume and the job you’d like to apply for below and
          let’s get started!
        </p>
      </CardContent>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <Button
            variant="default"
            onClick={() => setShowResumePopup(true)}
            disabled={isGeneratingCoverLetter}
          >
            Paste Your Resume
            {resumeText && <span className="ml-2 text-green-500">✓</span>}
          </Button>
          <Button
            variant="default"
            onClick={() => setShowJobPopup(true)}
            disabled={isGeneratingCoverLetter}
          >
            Paste Job Description
            {jobDescription && <span className="ml-2 text-green-500">✓</span>}
          </Button>
          <Button
            variant="default"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleGenerate}
            disabled={isGeneratingCoverLetter || !resumeText || !jobDescription}
          >
            {isGeneratingCoverLetter ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Cover Letter"
            )}
          </Button>

          {generationError && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{generationError}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>

      {/* Resume Dialog */}
      <TextInputDialog
        open={showResumePopup}
        title="Your Resume"
        description="Paste your resume text below."
        initialValue={resumeTextPlaceholder}
        onSave={setResumeText}
        onClose={() => setShowResumePopup(false)}
      />

      {/* Job Description Dialog */}
      <TextInputDialog
        open={showJobPopup}
        title="Job Description"
        description="Paste the job description text below."
        initialValue={jobDescriptionPlaceholder}
        onSave={setJobDescription}
        onClose={() => setShowJobPopup(false)}
      />
    </Card>
  );
}
