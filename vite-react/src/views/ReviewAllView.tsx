import { useEffect, useState } from "react";
import { useAppContext } from "@/context/useAppContext";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, ExternalLink } from "lucide-react";

import { BeliefHeaderWithTooltip } from "@/components/BeliefHeaderWithTooltip";

import type { CoverLetterResponse } from "@/context/types";

export function ReviewAllView() {
  const navigate = useNavigate();
  const { letterLabData, setLetterLabData } = useAppContext();
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    if (!letterLabData) {
      navigate("/");
    }
  }, [letterLabData, navigate]);

  useEffect(() => {
    if (!letterLabData?.hasAccess) {
      navigate("/enter");
    }
  }, [letterLabData, navigate]);

  if (!letterLabData) return null;

  const beliefs: {
    key: BSETBeliefKey;
    title: string;
    label: string;
  }[] = [
    {
      key: "BSETB_enactive_mastery",
      title: "I. Demonstrating Mastery & Strategic Vision",
      label: "(Enactive Mastery Experience)",
    },
    {
      key: "BSETB_vicarious_experience",
      title:
        "II. Modeling Collaborative Excellence & Multidisciplinary Teamwork",
      label: "(Vicarious Experience / Social Modeling)",
    },
    {
      key: "BSETB_verbal_persuasion",
      title:
        "III. Expressing Self-Belief & Commitment to Inclusive Research Culture",
      label: "(Verbal Persuasion / Physiological & Affective States)",
    },
  ];

  type BSETBeliefKey =
    | "BSETB_enactive_mastery"
    | "BSETB_vicarious_experience"
    | "BSETB_verbal_persuasion";

  function getBulletTexts(
    data: CoverLetterResponse,
    beliefKey: BSETBeliefKey
  ): string[] {
    const group = data[beliefKey];
    return Object.values(group ?? {}).map((b) => b.text);
  }

  const beliefTooltips: Record<BSETBeliefKey, string> = {
    BSETB_enactive_mastery: `What it means:
This refers to the confidence that comes from successfully accomplishing tasks in the past. It's the most powerful source of self-efficacy — when you've done something before and done it well, you're more likely to believe you can do it again.`,
    BSETB_vicarious_experience: `What it means:
We build belief in our own abilities by observing others (especially similar to us) succeed through effort. When we model leadership or collaboration, we also boost others' self-efficacy.`,
    BSETB_verbal_persuasion: `What it means:
Encouragement, positive feedback, and managing your emotional state under pressure can boost your belief in your abilities. Calmness, confidence, and resilience matter.`,
  };

  function isSectionComplete(sectionKey: BSETBeliefKey): boolean {
    if (!letterLabData) return false;

    const section = letterLabData[sectionKey];
    return Object.values(section ?? {}).every(
      (bp) =>
        typeof bp.rating === "number" &&
        bp.rating >= 1 &&
        bp.rating <= 7 &&
        typeof bp.qualitative === "string" &&
        bp.qualitative.trim().length > 0
    );
  }

  function allSectionsComplete(): boolean {
    return beliefs.every((belief) => isSectionComplete(belief.key));
  }

  function extractFeedback(
    section: Record<
      string,
      { rating: number | null; qualitative: string | null }
    >
  ): Record<string, { rating: number | null; qualitative: string }> {
    return Object.fromEntries(
      Object.entries(section ?? {}).map(([bpKey, bp]) => [
        bpKey,
        {
          rating: bp.rating ?? null,
          qualitative: bp.qualitative ?? "",
        },
      ])
    );
  }

  async function handleFeedbackSubmission() {
    if (!letterLabData) return;

    setIsFinalizing(true);

    const feedbackOnly = {
      BSETB_enactive_mastery: extractFeedback(
        letterLabData.BSETB_enactive_mastery ?? {}
      ),
      BSETB_vicarious_experience: extractFeedback(
        letterLabData.BSETB_vicarious_experience ?? {}
      ),
      BSETB_verbal_persuasion: extractFeedback(
        letterLabData.BSETB_verbal_persuasion ?? {}
      ),
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/lab/final-cover-letter`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            document_id: letterLabData.document_id || letterLabData._id,
            section_feedback: feedbackOnly,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit feedback.");
      }

      console.log("All section feedback successfully saved.");

      const data = await response.json();
      const finalCoverLetter = data.final_cover_letter;

      setLetterLabData((prev) =>
        prev ? { ...prev, final_cover_letter: finalCoverLetter } : prev
      );

      navigate("/cover-letter-comparison");
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("There was a problem submitting your feedback.");
    } finally {
      setIsFinalizing(false);
    }
  }

  return (
    <Card className="w-full max-w-4xl p-6 bg-white shadow-lg space-y-8">
      <h2 className="text-2xl font-bold mb-4">
        Your Personalized Cover Letter Review
      </h2>
      <div className="bg-blue-100/70 p-4 rounded-lg border border-blue-200">
        <p className="text-gray-700 whitespace-pre-line">
          Below are <strong>3 sections</strong> with different ways of
          expressing your experience for the{" "}
          <strong>{letterLabData.role_name}</strong> role.
        </p>
        <p className="mt-2">
          👉 Click “Review Section” to deep dive into the statements and review
          them. For each one, you’ll:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
          <li>✅ Rate how well it fits you</li>
          <li>
            💬 Leave <strong>clear, specific feedback</strong> on what you like
            or want changed
          </li>
        </ul>
        <p className="mt-2">
          Your input will help LetterLab craft a cover letter that truly
          reflects your voice, strengths, and goals.
        </p>
      </div>

      {beliefs.map(({ key, title }, index) => {
        const bullets = getBulletTexts(letterLabData, key);

        // Find the first incomplete section
        const firstIncompleteIndex = beliefs.findIndex(
          (belief) => !isSectionComplete(belief.key)
        );
        const isNextAction = index === firstIncompleteIndex;

        return (
          <div key={key} className="relative border-t pt-6 mt-6 space-y-4">
            <div className="flex justify-between items-start">
              <BeliefHeaderWithTooltip
                title={title}
                tooltip={beliefTooltips[key]}
              />
              <Button
                variant="outline"
                className={`shrink-0 ${
                  isSectionComplete(key)
                    ? "border-2 border-green-500 hover:border-green-600"
                    : isNextAction
                    ? "border-2 border-orange-500 hover:border-orange-600"
                    : ""
                }`}
                onClick={() => navigate(`/review-section/${key}`)}
              >
                {isSectionComplete(key) ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                Review Section
              </Button>
            </div>

            <ul className="list-disc ml-6 text-left space-y-2 text-gray-800">
              {bullets.map((bp, i) => (
                <li key={i}>{bp}</li>
              ))}
            </ul>
          </div>
        );
      })}
      <Button
        variant="outline"
        className={`mt-8 w-full ${
          allSectionsComplete() && !isFinalizing
            ? "border-2 border-orange-500 hover:border-orange-600"
            : ""
        }`}
        onClick={handleFeedbackSubmission}
        disabled={!allSectionsComplete() || isFinalizing}
      >
        {isFinalizing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Cover Letter...
          </>
        ) : allSectionsComplete() ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-600" />
            Generate Cover Letter
          </>
        ) : (
          // Placeholder or faded label while disabled
          <>Generate Cover Letter</>
        )}
      </Button>
    </Card>
  );
}
