import { useState, useEffect, ReactNode } from "react";
import { AppContext } from "./AppContext";
import type { AppState, CoverLetterResponse } from "./types";
const apiBase = import.meta.env.VITE_API_BASE_URL;

export function AppProvider({ children }: { children: ReactNode }) {
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

  useEffect(() => {
    if (letterLabData) {
      localStorage.setItem("letterLabData", JSON.stringify(letterLabData));
    }
  }, [letterLabData]);

  async function initialGeneration(): Promise<boolean> {
    if (resumeText && jobDescription) {
      setIsGeneratingCoverLetter(true);
      setGenerationError("");

      try {
        const response = await fetch(`${apiBase}/lab/initialize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            resume_text: resumeText,
            job_desc: jobDescription,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Unknown server error");
        }

        const data: CoverLetterResponse = await response.json();
        setLetterLabData((prev) => ({ ...prev, ...data }));

        setGeneratedCoverLetter(data.initial_cover_letter ?? "");

        return true;
      } catch (error: unknown) {
        console.error("Error generating cover letter:", error);

        if (error instanceof Error) {
          setGenerationError(
            "Failed to generate cover letter. " + error.message
          );
        } else {
          setGenerationError(
            "Failed to generate cover letter due to an unknown error."
          );
        }

        return false;
      } finally {
        setIsGeneratingCoverLetter(false);
      }
    } else {
      alert("Please provide both a resume and a job description.");
      return false;
    }
  }

  async function generateControlProfile(): Promise<boolean> {
    if (!letterLabData?.document_id) {
      setGenerationError("No session found. Please start over.");
      return false;
    }

    if (!resumeText || !jobDescription) {
      setGenerationError("Resume and job description are required.");
      return false;
    }

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
          session_id: letterLabData.document_id,
          resume: resumeText,
          job_description: jobDescription,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate control profile");
      }

      const data = await response.json();
      
      // Update the letterLabData with the control profile
      setLetterLabData(prev => ({
        ...prev,
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
    }
  }

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
    initialGeneration,
    generateControlProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
