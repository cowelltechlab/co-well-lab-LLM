import { useState, useEffect } from "react";
import { useAppContext } from "@/context/useAppContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";
import { TextInputDialog } from "@/components/TextInputDialog";

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

      <CardContent className="bg-blue-100/70 p-4 rounded-lg border border-blue-200 space-y-4 text-left text-gray-700 leading-relaxed">
        <p>
          <strong>👋 Welcome to LetterLab!</strong>
        </p>
        <p>
          📄 Letterlab will use your <strong>resume</strong> and the{" "}
          <strong>job description you provide</strong> to highlight your
          strengths and show why you're a great fit — no generic templates here.
        </p>
        <p>
          🧠 First, you’ll review a few statements about your experience and how
          it relates to the job you want. You’ll rate each one and let us know
          what feels right (or doesn’t).
        </p>
        <p>
          ✍️ Then, LetterLab will create{" "}
          <strong>two cover letter versions</strong> based on your feedback. For
          each, you’ll:
          <br />
          👍 Tell us what you like
          <br />
          👎 Note what’s not quite right
          <br />⭐ Give it a satisfaction rating
        </p>
        <p>
          📋 Afterward, there’s a short survey about your experience using
          LetterLab. Feel free to skip anything you don’t want to answer — and
          you can stop at any time.
        </p>
        <p>
          ⬇️ Upload your <strong>resume</strong> and the{" "}
          <strong>job you’re applying for</strong> to get started!
        </p>
      </CardContent>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className={
              resumeText
                ? "border-2 border-green-500 hover:border-green-600"
                : !resumeText && !jobDescription
                ? "border-2 border-orange-500 hover:border-orange-600"
                : ""
            }
            onClick={() => setShowResumePopup(true)}
            disabled={isGeneratingCoverLetter}
          >
            {resumeText && (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            )}
            Paste Your Resume
          </Button>
          <Button
            variant="outline"
            className={
              jobDescription
                ? "border-2 border-green-500 hover:border-green-600"
                : resumeText && !jobDescription
                ? "border-2 border-orange-500 hover:border-orange-600"
                : ""
            }
            onClick={() => setShowJobPopup(true)}
            disabled={isGeneratingCoverLetter}
          >
            {jobDescription && (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            )}
            Paste Job Description
          </Button>
          <Button
            variant="outline"
            className={
              resumeText && jobDescription
                ? "border-2 border-orange-500 hover:border-orange-600"
                : ""
            }
            onClick={handleGenerate}
            disabled={isGeneratingCoverLetter || !resumeText || !jobDescription}
          >
            {isGeneratingCoverLetter ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Cover Letter Outline"
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
        initialValue=""
        onSave={setResumeText}
        onClose={() => setShowResumePopup(false)}
      />

      {/* Job Description Dialog */}
      <TextInputDialog
        open={showJobPopup}
        title="Job Description"
        description="Paste the job description text below."
        initialValue=""
        onSave={setJobDescription}
        onClose={() => setShowJobPopup(false)}
      />
    </Card>
  );
}
