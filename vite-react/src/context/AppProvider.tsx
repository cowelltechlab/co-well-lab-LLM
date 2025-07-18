import { useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { AppContext } from "./AppContext";
import { useTokenHandler } from "@/hooks/useTokenHandler";
import type { AppState, CoverLetterResponse } from "./types";
const apiBase = import.meta.env.VITE_API_BASE_URL;

export function AppProvider({ children }: { children: ReactNode }) {
  const { handleApiResponse } = useTokenHandler();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [letterLabData, setLetterLabData] =
    useState<CoverLetterResponse | null>(() => {
      const saved = localStorage.getItem("letterLabData");
      return saved ? JSON.parse(saved) : null;
    });
  const isGeneratingProfile = useRef(false);
  const isGeneratingAlignedProfile = useRef(false);

  useEffect(() => {
    if (letterLabData) {
      localStorage.setItem("letterLabData", JSON.stringify(letterLabData));
    }
  }, [letterLabData]);


  const generateControlProfile = useCallback(async (): Promise<boolean> => {
    if (!resumeText || !jobDescription) {
      setGenerationError("Resume and job description are required.");
      return false;
    }

    // Prevent duplicate calls (StrictMode protection)
    if (isGeneratingProfile.current) {
      return false;
    }
    
    isGeneratingProfile.current = true;
    setIsGeneratingCoverLetter(true);
    setGenerationError("");

    try {
      const response = await fetch(`${apiBase}/lab/generate-control-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          session_id: letterLabData?.document_id || null, // Allow null to trigger session creation
          resume: resumeText,
          job_description: jobDescription,
        }),
      });

      // Check for invalidated token and handle redirect
      const handledResponse = await handleApiResponse(response);
      if (!handledResponse) {
        return false; // Token was invalidated, redirect handled
      }

      if (!handledResponse.ok) {
        const err = await handledResponse.json();
        throw new Error(err.error || "Failed to generate control profile");
      }

      const data = await handledResponse.json();
      
      // Update the letterLabData with the control profile and session_id
      setLetterLabData(prev => ({
        ...prev,
        document_id: data.session_id, // Update with real session_id from backend
        controlProfile: {
          text: data.profile_text
        }
      }));

      return true;
    } catch (error: unknown) {
      console.error("Error generating control profile:", error);

      if (error instanceof Error) {
        setGenerationError("Failed to generate control profile. " + error.message);
      } else {
        setGenerationError("Failed to generate control profile due to an unknown error.");
      }

      return false;
    } finally {
      setIsGeneratingCoverLetter(false);
      isGeneratingProfile.current = false;
    }
  }, [resumeText, jobDescription, letterLabData?.document_id, handleApiResponse]);

  const generateAlignedProfile = useCallback(async (): Promise<boolean> => {
    if (!letterLabData?.document_id) {
      setGenerationError("No session found. Please start over.");
      return false;
    }

    // Prevent duplicate calls (StrictMode protection)
    if (isGeneratingAlignedProfile.current) {
      return false;
    }
    
    isGeneratingAlignedProfile.current = true;
    setIsGeneratingCoverLetter(true);
    setGenerationError("");

    try {
      const response = await fetch(`${apiBase}/lab/generate-aligned-profile`, {
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
      const handledResponse = await handleApiResponse(response);
      if (!handledResponse) {
        return false; // Token was invalidated, redirect handled
      }

      if (!handledResponse.ok) {
        const err = await handledResponse.json();
        throw new Error(err.error || "Failed to generate aligned profile");
      }

      const data = await handledResponse.json();
      
      // Update the letterLabData with the aligned profile
      setLetterLabData(prev => ({
        ...prev,
        alignedProfile: {
          text: data.profile_text
        }
      }));

      return true;
    } catch (error: unknown) {
      console.error("Error generating aligned profile:", error);

      if (error instanceof Error) {
        setGenerationError("Failed to generate aligned profile. " + error.message);
      } else {
        setGenerationError("Failed to generate aligned profile due to an unknown error.");
      }

      return false;
    } finally {
      setIsGeneratingCoverLetter(false);
      isGeneratingAlignedProfile.current = false;
    }
  }, [letterLabData?.document_id, handleApiResponse]);

  const value: AppState = {
    resumeText,
    jobDescription,
    generatedCoverLetter,
    isGeneratingCoverLetter,
    generationError,
    letterLabData,
    setResumeText,
    setJobDescription,
    setGeneratedCoverLetter,
    setIsGeneratingCoverLetter,
    setGenerationError,
    setLetterLabData,
    generateControlProfile,
    generateAlignedProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
