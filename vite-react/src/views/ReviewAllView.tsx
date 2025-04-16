import { useEffect } from "react";
import { useAppContext } from "@/context/useAppContext";
import { useNavigate } from "react-router-dom";
import type { CoverLetterResponse } from "@/context/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BeliefHeaderWithTooltip } from "@/components/BeliefHeaderWithTooltip";

export function ReviewAllView() {
  const navigate = useNavigate();
  const { letterLabData } = useAppContext();

  useEffect(() => {
    if (!letterLabData) {
      navigate("/");
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
    return Object.values(group).map((b) => b.text);
  }

  const beliefTooltips: Record<BSETBeliefKey, string> = {
    BSETB_enactive_mastery: `What it means:
This refers to the confidence that comes from successfully accomplishing tasks in the past. It's the most powerful source of self-efficacy — when you've done something before and done it well, you're more likely to believe you can do it again.`,
    BSETB_vicarious_experience: `What it means:
We build belief in our own abilities by observing others (especially similar to us) succeed through effort. When we model leadership or collaboration, we also boost others' self-efficacy.`,
    BSETB_verbal_persuasion: `What it means:
Encouragement, positive feedback, and managing your emotional state under pressure can boost your belief in your abilities. Calmness, confidence, and resilience matter.`,
  };

  return (
    <Card className="w-full max-w-4xl p-6 bg-white shadow-lg space-y-8">
      <h2 className="text-2xl font-bold mb-4">
        Your Personalized Cover Letter Review
      </h2>
      <p className="text-gray-700 whitespace-pre-line">
        {letterLabData.review_all_view_intro}
      </p>

      {beliefs.map(({ key, title }) => {
        const bullets = getBulletTexts(letterLabData, key);

        return (
          <div key={key} className="relative border-t pt-6 mt-6 space-y-4">
            <div className="flex justify-between items-start">
              <BeliefHeaderWithTooltip
                title={title}
                tooltip={beliefTooltips[key]}
              />
              <Button
                variant="outline"
                className="shrink-0"
                onClick={() => navigate(`/review-section/${key}`)}
              >
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
    </Card>
  );
}
