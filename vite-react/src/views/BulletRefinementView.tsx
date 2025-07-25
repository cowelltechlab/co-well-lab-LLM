import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/useAppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { LikertScale } from "@/components/LikertScale";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface Bullet {
  index: number;
  text: string;
  rationale: string;
}


export function BulletRefinementView() {
  const navigate = useNavigate();
  const { 
    letterLabData, 
    resumeText,
    jobDescription,
    generationError 
  } = useAppContext();

  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [currentBulletIndex, setCurrentBulletIndex] = useState(0);
  const [currentIteration, setCurrentIteration] = useState(1);
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationError, setRegenerationError] = useState("");
  const [isLoadingBullets, setIsLoadingBullets] = useState(false);
  const [bulletLoadError, setBulletLoadError] = useState("");

  // Generate bullets on component mount if not already generated
  useEffect(() => {
    if (!bullets.length && letterLabData?.document_id && !isLoadingBullets) {
      generateBullets();
    }
  }, [letterLabData?.document_id, bullets.length]);

  // Redirect if no access
  useEffect(() => {
    if (!letterLabData?.hasAccess) {
      navigate("/enter");
    }
  }, [letterLabData, navigate]);

  const generateBullets = async () => {
    if (!letterLabData?.document_id || !resumeText || !jobDescription) {
      setBulletLoadError("Missing session or input data. Please start over.");
      return;
    }

    setIsLoadingBullets(true);
    setBulletLoadError("");

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBase}/lab/generate-bse-bullets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          session_id: letterLabData.document_id,
          resume: resumeText,
          job_description: jobDescription,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate bullets");
      }

      const data = await response.json();
      setBullets(data.bullets);
    } catch (error) {
      console.error("Error generating bullets:", error);
      setBulletLoadError(
        error instanceof Error ? error.message : "Failed to generate bullets"
      );
    } finally {
      setIsLoadingBullets(false);
    }
  };

  const handleRegenerateWithFeedback = async () => {
    if (currentRating === null) {
      setRegenerationError("Please provide a rating before regenerating.");
      return;
    }

    setIsRegenerating(true);
    setRegenerationError("");

    try {
      // Save current iteration data
      // Save iteration data to backend
      try {
        const saveResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lab/save-iteration-data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            session_id: letterLabData?.document_id,
            bullet_index: currentBulletIndex,
            iteration_number: currentIteration,
            bullet_text: bullets[currentBulletIndex].text,
            rationale: bullets[currentBulletIndex].rationale,
            user_rating: currentRating,
            user_feedback: currentFeedback,
            is_final: false,
          }),
        });

        if (!saveResponse.ok) {
          throw new Error("Failed to save iteration data");
        }
      } catch (error) {
        console.error("Error saving iteration data:", error);
        setRegenerationError("Failed to save iteration data. Please try again.");
        setIsRegenerating(false);
        return;
      }

      // Call regeneration endpoint
      try {
        const regenerateResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lab/regenerate-bullet`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            session_id: letterLabData?.document_id,
            bullet_index: currentBulletIndex,
            current_bullet: {
              text: bullets[currentBulletIndex].text,
              rationale: bullets[currentBulletIndex].rationale,
            },
            user_rating: currentRating,
            user_feedback: currentFeedback,
            iteration_history: [], // TODO: Include actual iteration history if needed
          }),
        });

        if (!regenerateResponse.ok) {
          throw new Error("Failed to regenerate bullet");
        }

        const regeneratedData = await regenerateResponse.json();
        
        // Update the bullet with the regenerated content
        const updatedBullets = [...bullets];
        updatedBullets[currentBulletIndex] = {
          ...updatedBullets[currentBulletIndex],
          text: regeneratedData.bullet.text,
          rationale: regeneratedData.bullet.rationale,
        };

        setBullets(updatedBullets);
      } catch (error) {
        console.error("Error regenerating bullet:", error);
        setRegenerationError("Failed to regenerate bullet. Please try again.");
        setIsRegenerating(false);
        return;
      }
      setCurrentIteration(prev => prev + 1);
      setCurrentRating(null);
      setCurrentFeedback("");
    } catch (error) {
      console.error("Error regenerating bullet:", error);
      setRegenerationError(
        error instanceof Error ? error.message : "Failed to regenerate bullet"
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAllDone = async () => {
    // Save final iteration data if user provided feedback
    if (currentRating !== null || currentFeedback.trim() !== "") {
      // Save final iteration data to backend
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/lab/save-iteration-data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            session_id: letterLabData?.document_id,
            bullet_index: currentBulletIndex,
            iteration_number: currentIteration,
            bullet_text: bullets[currentBulletIndex].text,
            rationale: bullets[currentBulletIndex].rationale,
            user_rating: currentRating,
            user_feedback: currentFeedback,
            is_final: true,
          }),
        });
      } catch (error) {
        console.error("Error saving final iteration data:", error);
        // Continue with navigation even if save fails
      }
    }

    // Move to next bullet or final profile
    if (currentBulletIndex < bullets.length - 1) {
      setCurrentBulletIndex(prev => prev + 1);
      setCurrentIteration(1);
      setCurrentRating(null);
      setCurrentFeedback("");
      setRegenerationError("");
    } else {
      // All bullets complete, go to final profile
      navigate("/aligned-profile");
    }
  };

  const handleBack = () => {
    if (currentBulletIndex > 0) {
      setCurrentBulletIndex(prev => prev - 1);
      setCurrentIteration(1);
      setCurrentRating(null);
      setCurrentFeedback("");
      setRegenerationError("");
    } else {
      navigate("/control-profile");
    }
  };

  if (isLoadingBullets) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <Card className="w-full max-w-4xl text-center shadow-lg bg-white">
          <CardContent className="flex items-center justify-center min-h-[200px] px-8">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">Generating your experience statements...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bulletLoadError || generationError) {
    return (
      <Card className="w-full max-w-4xl mx-auto p-6 shadow-lg bg-white">
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertDescription>{bulletLoadError || generationError}</AlertDescription>
          </Alert>
          <div className="flex space-x-4">
            <Button onClick={() => navigate("/control-profile")} variant="outline">
              Back to Control Profile
            </Button>
            <Button onClick={generateBullets} variant="default">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bullets.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <Card className="w-full max-w-4xl text-center shadow-lg bg-white">
          <CardContent className="flex flex-col items-center justify-center min-h-[200px] space-y-4 px-8">
            <div className="text-lg">No bullets generated. Please try again.</div>
            <Button onClick={generateBullets} variant="default">
              Generate Bullets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentBullet = bullets[currentBulletIndex];

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 shadow-lg bg-white space-y-6">
      <CardHeader>
        <div className="bg-blue-100 p-3 rounded-lg border border-blue-200 mb-4">
          <div className="text-blue-800 font-medium">
            Bullet {currentBulletIndex + 1} of {bullets.length} - Iteration {currentIteration}
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          Review Your Experience Statement
        </CardTitle>
        <p className="text-gray-600">
          Below is a statement about your experience and how it relates to the job description. 
          This reflects how you might present your strengths to match what the job is looking for.
        </p>
        <p className="text-gray-800 font-medium">
          <strong>Your task is to evaluate this statement—not for how polished or professional it sounds, 
          but for how well it represents your strengths.</strong>
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Current Bullet Display */}
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Experience Statement</h3>
              {isRegenerating ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-gray-800 leading-relaxed text-base">
                  {currentBullet.text}
                </p>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Rationale</h4>
              {isRegenerating ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed">
                  {currentBullet.rationale}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <Label className="text-base font-medium block mb-4">
            How well does this bullet represent your strengths?
          </Label>
          <LikertScale
            value={currentRating}
            onChange={setCurrentRating}
            leftLabel="This does not represent my strengths"
            middleLabel="Neutral"
            rightLabel="This represents my strengths"
            showBorder={false}
          />
        </div>

        {/* Feedback Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="feedback" className="text-base font-medium">
              How would you change this bullet to better represent yourself and/or your strengths?
            </Label>
            <Textarea
              id="feedback"
              placeholder="Describe specific changes you'd like to see, such as different skills to highlight, accomplishments to emphasize, or ways to better align with your experience..."
              value={currentFeedback}
              onChange={(e) => setCurrentFeedback(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
        </div>

        {/* Error Display */}
        {regenerationError && (
          <Alert variant="destructive">
            <AlertDescription>{regenerationError}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack}>
            {currentBulletIndex === 0 ? "Back" : "Previous Bullet"}
          </Button>
          
          <div className="flex space-x-3">
            <Button 
              onClick={handleRegenerateWithFeedback}
              disabled={isRegenerating || currentRating === null}
              variant="outline"
              className="border-blue-500 text-blue-700 hover:bg-blue-50"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                "Regenerate with Feedback"
              )}
            </Button>
            
            <Button 
              onClick={handleAllDone}
              className="bg-green-600 hover:bg-green-700"
            >
              {currentBulletIndex === bullets.length - 1 
                ? "All Done - Generate Final Profile" 
                : "All Done - Next Bullet"
              }
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}