import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/useAppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { LikertScale } from "@/components/LikertScale";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface LikertResponses {
  accuracy: number | null;
  control: number | null;
  expression: number | null;
  alignment: number | null;
}

interface OpenResponses {
  likes: string;
  dislikes: string;
  changes: string;
}

export function ControlProfileView() {
  const navigate = useNavigate();
  const { 
    letterLabData, 
    setLetterLabData, 
    generateControlProfile, 
    isGeneratingCoverLetter,
    generationError 
  } = useAppContext();

  const [likertResponses, setLikertResponses] = useState<LikertResponses>({
    accuracy: null,
    control: null,
    expression: null,
    alignment: null,
  });

  const [openResponses, setOpenResponses] = useState<OpenResponses>({
    likes: "",
    dislikes: "",
    changes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const hasCalledGenerate = useRef(false);

  // Generate control profile on component mount if not already generated
  useEffect(() => {
    if (!letterLabData?.controlProfile?.text && !isGeneratingCoverLetter && !hasCalledGenerate.current) {
      hasCalledGenerate.current = true;
      generateControlProfile();
    }
  }, [letterLabData?.controlProfile?.text, isGeneratingCoverLetter, generateControlProfile]);

  // Redirect if no access
  useEffect(() => {
    if (!letterLabData?.hasAccess) {
      navigate("/enter");
    }
  }, [letterLabData, navigate]);

  const handleLikertChange = (question: keyof LikertResponses, value: number) => {
    setLikertResponses(prev => ({
      ...prev,
      [question]: value
    }));
  };

  const handleOpenResponseChange = (question: keyof OpenResponses, value: string) => {
    setOpenResponses(prev => ({
      ...prev,
      [question]: value
    }));
  };

  const isFormComplete = () => {
    return Object.values(likertResponses).every(value => value !== null) &&
           Object.values(openResponses).every(value => value.trim() !== "");
  };

  const handleSubmit = async () => {
    if (!isFormComplete()) {
      setSubmitError("Please complete all ratings and feedback questions.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Save responses to the database
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lab/save-control-profile-responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          session_id: letterLabData?.document_id,
          likert_responses: {
            accuracy: likertResponses.accuracy!,
            control: likertResponses.control!,
            expression: likertResponses.expression!,
            alignment: likertResponses.alignment!,
          },
          open_responses: openResponses,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save control profile responses");
      }

      // Update the letterLabData with the responses
      setLetterLabData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          controlProfile: {
            ...prev.controlProfile,
            text: prev.controlProfile?.text || "",
            likertResponses: {
              accuracy: likertResponses.accuracy!,
              control: likertResponses.control!,
              expression: likertResponses.expression!,
              alignment: likertResponses.alignment!,
            },
            openResponses: openResponses,
          }
        };
      });

      // Navigate to the next phase (bullet refinement)
      navigate("/bullet-refinement");
    } catch (error) {
      console.error("Error submitting control profile responses:", error);
      setSubmitError("Failed to save responses. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  if (isGeneratingCoverLetter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <Card className="w-full max-w-4xl text-center shadow-lg bg-white">
          <CardContent className="flex items-center justify-center min-h-[200px] px-8">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">Generating your profile statement...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (generationError) {
    return (
      <Card className="w-full max-w-4xl mx-auto p-6 shadow-lg bg-white">
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertDescription>{generationError}</AlertDescription>
          </Alert>
          <Button onClick={handleBack} variant="outline">
            Back to Start
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!letterLabData?.controlProfile?.text) {
    return (
      <Card className="w-full max-w-4xl mx-auto p-6 text-center shadow-lg bg-white">
        <CardContent className="space-y-6">
          <div className="text-lg">No profile generated. Please start over.</div>
          <Button onClick={handleBack} variant="outline">
            Back to Start
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 shadow-lg bg-white space-y-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Initial Profile Generated
        </CardTitle>
        <p className="text-gray-600">
          Here's an initial professional profile based on your resume and the job description:
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Profile Display */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Professional Profile</h3>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {letterLabData.controlProfile.text}
          </p>
        </div>

        {/* Research Data Collection */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h4 className="text-lg font-semibold mb-4 text-yellow-800">
            📝 Please rate and share your thoughts on this initial profile:
          </h4>
          
          {/* Likert Scales */}
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium block mb-3">
                The personal profile statement accurately represents me.
              </Label>
              <LikertScale
                value={likertResponses.accuracy}
                onChange={(value) => handleLikertChange("accuracy", value)}
                leftLabel="Strongly Disagree"
                middleLabel="Neutral"
                rightLabel="Strongly Agree"
                showBorder={false}
              />
            </div>

            <div>
              <Label className="text-sm font-medium block mb-3">
                I felt in control of how I was represented by the AI tool.
              </Label>
              <LikertScale
                value={likertResponses.control}
                onChange={(value) => handleLikertChange("control", value)}
                leftLabel="Strongly Disagree"
                middleLabel="Neutral"
                rightLabel="Strongly Agree"
                showBorder={false}
              />
            </div>

            <div>
              <Label className="text-sm font-medium block mb-3">
                The process allowed me to express my identity in my own words.
              </Label>
              <LikertScale
                value={likertResponses.expression}
                onChange={(value) => handleLikertChange("expression", value)}
                leftLabel="Strongly Disagree"
                middleLabel="Neutral"
                rightLabel="Strongly Agree"
                showBorder={false}
              />
            </div>

            <div>
              <Label className="text-sm font-medium block mb-3">
                I was satisfied with the alignment between my intended identity and the AI output.
              </Label>
              <LikertScale
                value={likertResponses.alignment}
                onChange={(value) => handleLikertChange("alignment", value)}
                leftLabel="Strongly Disagree"
                middleLabel="Neutral"
                rightLabel="Strongly Agree"
                showBorder={false}
              />
            </div>
          </div>

          {/* Open-ended Questions */}
          <div className="space-y-4 mt-8">
            <div>
              <Label htmlFor="likes" className="text-sm font-medium">
                What do you like about this description?
              </Label>
              <Textarea
                id="likes"
                placeholder="What resonates with you about how you're described here?"
                value={openResponses.likes}
                onChange={(e) => handleOpenResponseChange("likes", e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="dislikes" className="text-sm font-medium">
                What don't you like or what feels inaccurate?
              </Label>
              <Textarea
                id="dislikes"
                placeholder="What doesn't feel right or is missing from this description?"
                value={openResponses.dislikes}
                onChange={(e) => handleOpenResponseChange("dislikes", e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="changes" className="text-sm font-medium">
                How would you change it?
              </Label>
              <Textarea
                id="changes"
                placeholder="What specific changes would make this better represent you?"
                value={openResponses.changes}
                onChange={(e) => handleOpenResponseChange("changes", e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormComplete() || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue to Experience Review"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}