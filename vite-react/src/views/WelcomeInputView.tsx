
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { TextInputDialog } from "@/components/ui/TextInputDialog";

export function WelcomeInputView() {
  const navigate = useNavigate();
  const { 
    resumeText, 
    jobDescription, 
    setResumeText, 
    setJobDescription,
    isGeneratingCoverLetter,
    generationError,
    generateCoverLetter
  } = useAppContext();

  const [showResumePopup, setShowResumePopup] = useState(false);
  const [showJobPopup, setShowJobPopup] = useState(false);

  const handleGenerate = async () => {
    const success = await generateCoverLetter();
    if (success) {
      navigate("/chatbot");
    }
  };

  return (
    <Card className="w-full max-w-2xl p-6 text-center shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Welcome to LetterLab, an AI Cover Letter Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          Enter your resume and job description to generate a tailored cover letter!
        </p>
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
            {jobDescription && (
              <span className="ml-2 text-green-500">✓</span>
            )}
          </Button>
          <Button
            variant="default"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleGenerate}
            disabled={
              isGeneratingCoverLetter || !resumeText || !jobDescription
            }
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
        initialValue={resumeText}
        onSave={setResumeText}
        onClose={() => setShowResumePopup(false)}
      />

      {/* Job Description Dialog */}
      <TextInputDialog
        open={showJobPopup}
        title="Job Description"
        description="Paste the job description text below."
        initialValue={jobDescription}
        onSave={setJobDescription}
        onClose={() => setShowJobPopup(false)}
      />
    </Card>
  );
}