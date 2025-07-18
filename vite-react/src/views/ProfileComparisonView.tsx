import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/useAppContext";
import { useTokenHandler } from "@/hooks/useTokenHandler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ProfileComparisonView() {
  const navigate = useNavigate();
  const { letterLabData, setLetterLabData } = useAppContext();
  const { handleApiResponse } = useTokenHandler();
  const [isCompleted, setIsCompleted] = useState(false);
  const hasMarkedCompleted = useRef(false);

  // Redirect if no access
  useEffect(() => {
    if (!letterLabData?.hasAccess) {
      navigate("/enter");
    }
  }, [letterLabData, navigate]);

  // Check if we have both profiles
  const hasControlProfile = letterLabData?.controlProfile?.text;
  const hasAlignedProfile = letterLabData?.alignedProfile?.text;

  const markSessionCompleted = async () => {
    if (!letterLabData?.document_id || hasMarkedCompleted.current) {
      return;
    }

    hasMarkedCompleted.current = true;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lab/mark-session-completed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          session_id: letterLabData.document_id,
        }),
      });

      // Check for invalidated token and handle redirect
      const handledResponse = await handleApiResponse(response, setLetterLabData);
      if (!handledResponse) {
        return; // Token was invalidated, redirect handled
      }

      if (!handledResponse.ok) {
        const err = await handledResponse.json();
        throw new Error(err.error || "Failed to mark session as completed");
      }

      console.log("Session marked as completed");
    } catch (error) {
      console.error("Error marking session as completed:", error);
      // Don't reset hasMarkedCompleted on error to prevent spam
    }
  };

  useEffect(() => {
    // Check if both profiles have been completed with responses
    const controlComplete = letterLabData?.controlProfile?.likertResponses && letterLabData?.controlProfile?.openResponses;
    const alignedComplete = letterLabData?.alignedProfile?.likertResponses && letterLabData?.alignedProfile?.openResponses;
    
    if (controlComplete && alignedComplete) {
      setIsCompleted(true);
      
      // Automatically mark session as completed when user reaches this screen
      if (!hasMarkedCompleted.current) {
        markSessionCompleted();
      }
    }
  }, [letterLabData]);

  const handleBack = () => {
    navigate("/aligned-profile");
  };

  const handleComplete = async () => {
    // Ensure session is marked as completed
    if (!hasMarkedCompleted.current) {
      await markSessionCompleted();
    }
    
    // Show completion message
    alert("Study completed! Thank you for your participation.");
    // Navigate to home
    navigate("/");
  };

  if (!hasControlProfile || !hasAlignedProfile) {
    return (
      <Card className="w-full max-w-4xl mx-auto p-6 shadow-lg bg-white">
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              Please complete both the control profile and aligned profile before viewing the comparison.
            </AlertDescription>
          </Alert>
          <Button onClick={handleBack} variant="outline">
            Back to Aligned Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto p-6 shadow-lg bg-white space-y-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Profile Comparison - Research Summary
        </CardTitle>
        <p className="text-gray-600 text-center">
          Here's a side-by-side comparison of your initial and final profiles from the collaborative alignment process.
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Profile Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Control Profile */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blue-800">Initial Profile</h3>
              <span className="bg-blue-50 text-blue-800 px-2 py-1 rounded text-sm border border-blue-200">Control</span>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {letterLabData.controlProfile?.text}
              </p>
            </div>
            
            {/* Control Profile Ratings Summary */}
            {letterLabData.controlProfile?.likertResponses && (
              <div className="bg-blue-25 p-4 rounded border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">Your Initial Ratings (1-7 scale):</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Accuracy: {letterLabData.controlProfile.likertResponses.accuracy}/7</div>
                  <div>Control: {letterLabData.controlProfile.likertResponses.control}/7</div>
                  <div>Expression: {letterLabData.controlProfile.likertResponses.expression}/7</div>
                  <div>Alignment: {letterLabData.controlProfile.likertResponses.alignment}/7</div>
                </div>
              </div>
            )}
          </div>

          {/* Aligned Profile */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-green-800">Final Profile</h3>
              <span className="bg-green-50 text-green-800 px-2 py-1 rounded text-sm border border-green-200">Aligned</span>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {letterLabData.alignedProfile?.text}
              </p>
            </div>
            
            {/* Aligned Profile Ratings Summary */}
            {letterLabData.alignedProfile?.likertResponses && (
              <div className="bg-green-25 p-4 rounded border border-green-100">
                <h4 className="font-medium text-green-800 mb-2">Your Final Ratings (1-7 scale):</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Accuracy: {letterLabData.alignedProfile.likertResponses.accuracy}/7</div>
                  <div>Control: {letterLabData.alignedProfile.likertResponses.control}/7</div>
                  <div>Expression: {letterLabData.alignedProfile.likertResponses.expression}/7</div>
                  <div>Alignment: {letterLabData.alignedProfile.likertResponses.alignment}/7</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Research Summary */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">
            📊 Research Summary
          </h3>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Initial Process:</strong> AI-generated profile based on resume and job description
              </div>
              <div>
                <strong>Collaborative Process:</strong> Sequential bullet refinement with user feedback
              </div>
            </div>
            <div className="pt-2 border-t border-yellow-200">
              <strong>Goal:</strong> Understanding how users and AI systems can work together to create more aligned identity representations
            </div>
          </div>
        </div>

        {/* Bullet Iterations Summary */}
        {letterLabData.bulletIterations && letterLabData.bulletIterations.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🔄 Collaboration Summary
            </h3>
            <div className="space-y-3">
              {letterLabData.bulletIterations.map((bulletData, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Bullet {index + 1}</span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      {bulletData.iterations.length} iteration{bulletData.iterations.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Final iteration: {bulletData.finalIteration || bulletData.iterations.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion Status */}
        {isCompleted && (
          <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
            <div className="flex items-center justify-center space-x-2 text-green-800">
              <span className="text-lg font-semibold">✅ Study Completed</span>
            </div>
            <p className="text-green-700 mt-2">
              Thank you for participating in this collaborative alignment research study!
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack}>
            Back to Aligned Profile
          </Button>
          <Button 
            onClick={handleComplete}
            className="bg-green-600 hover:bg-green-700"
            disabled={!isCompleted}
          >
            {isCompleted ? "Complete Study" : "Complete Both Profiles First"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}