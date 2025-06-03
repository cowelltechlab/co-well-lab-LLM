import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/useAppContext";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion } from "@radix-ui/react-accordion";
import { BulletAccordionItem } from "@/components/BulletAccordionItem";
import { CheckCircle } from "lucide-react";

import { BulletPointGroup } from "@/context/types";

type BSETBeliefKey =
  | "BSETB_enactive_mastery"
  | "BSETB_vicarious_experience"
  | "BSETB_verbal_persuasion";

const beliefSectionMeta: Record<
  BSETBeliefKey,
  { title: string; intro: string }
> = {
  BSETB_enactive_mastery: {
    title: "Enactive Mastery Experience",
    intro: `These bullets highlight instances in your career when you’ve done something important and done it well. In other words: when your actions proved that you’re skilled and capable.`,
  },
  BSETB_vicarious_experience: {
    title: "Vicarious Experience / Social Modeling",
    intro: `These bullets highlight how watching, interacting with, or learning from others — especially people like you — has helped you build confidence and competence.`,
  },
  BSETB_verbal_persuasion: {
    title: "Verbal Persuasion / Physiological & Affective States",
    intro: `These bullets highlight your ability to stay calm, motivated, and emotionally steady under pressure have contributed to your confidence and success.`,
  },
};

export function ReviewSectionView() {
  const { sectionName } = useParams<{ sectionName: BSETBeliefKey }>();
  const { letterLabData, setLetterLabData } = useAppContext();
  const navigate = useNavigate();

  const [sectionFeedback, setSectionFeedback] = useState<{
    [bpKey: string]: {
      rating: number | null;
      qualitative: string;
    };
  }>({});
  const [openItems, setOpenItems] = useState<string[]>([]);

  useEffect(() => {
    if (!letterLabData || !sectionName) return;

    const section = letterLabData[sectionName];

    const restored = Object.entries(section ?? {}).reduce(
      (acc, [bpKey, bp]) => {
        acc[bpKey] = {
          rating: typeof bp.rating === "number" ? bp.rating : null,
          qualitative: bp.qualitative ?? "",
        };

        return acc;
      },
      {} as typeof sectionFeedback
    );

    setSectionFeedback(restored);
  }, [letterLabData, sectionName]);

  useEffect(() => {
    if (!letterLabData?.hasAccess) {
      navigate("/enter");
    }
  }, [letterLabData, navigate]);

  if (!sectionName || !letterLabData || !beliefSectionMeta[sectionName]) {
    navigate("/review-all");
    return null;
  }

  const { title, intro } = beliefSectionMeta[sectionName];
  const bulletPoints = letterLabData[sectionName];

  const updateFeedback = (
    bpKey: string,
    update: { rating: number; qualitative: string }
  ) => {
    // Update local state
    setSectionFeedback((prev) => ({
      ...prev,
      [bpKey]: {
        rating: update.rating,
        qualitative: update.qualitative,
      },
    }));

    // Update context immediately to trigger localStorage save through AppProvider
    if (letterLabData && sectionName) {
      const updatedSection = {
        ...letterLabData[sectionName],
        [bpKey]: {
          ...letterLabData[sectionName]?.[bpKey],
          rating: update.rating,
          qualitative: update.qualitative,
        },
      };

      setLetterLabData({
        ...letterLabData,
        [sectionName]: updatedSection,
      });
    }
  };

  const allComplete = Object.keys(bulletPoints ?? {}).every(
    (bpKey) =>
      sectionFeedback[bpKey]?.rating &&
      sectionFeedback[bpKey]?.qualitative.trim().length > 0
  );

  const handleComplete = () => {
    if (!letterLabData || !sectionName) return;

    const updatedSection: BulletPointGroup = Object.entries(
      letterLabData[sectionName] ?? {}
    ).reduce((acc, [bpKey, original]) => {
      acc[bpKey] = {
        ...original,
        rating: sectionFeedback[bpKey]?.rating ?? null,
        qualitative: sectionFeedback[bpKey]?.qualitative ?? "",
      };
      return acc;
    }, {} as BulletPointGroup);

    setLetterLabData({
      ...letterLabData,
      [sectionName]: updatedSection,
    });

    navigate("/review-all");
  };

  return (
    <Card className="w-full max-w-4xl p-6 bg-white shadow-lg space-y-6">
      <h2 className="text-xl font-bold">Let’s Review Your {title} Section</h2>
      <div className="bg-blue-100/70 p-4 rounded-lg border border-blue-200">
        <p className="whitespace-pre-line text-gray-700">{intro}</p>
        <p className="text-gray-700 mt-2 ml-4">
          ✅ Rate how well it fits <em>you</em>
        </p>
        <p className="text-gray-700 mt-2 ml-4">
          💬 Leave <strong>clear, specific feedback</strong> on what you like or
          want changed
        </p>
        <p className="text-gray-700 mt-2">
          Your input will help LetterLab craft a cover letter that truly
          reflects your voice, strengths, and goals.
        </p>
      </div>

      <h3 className="text-lg font-semibold mt-6"> {title} </h3>

      <Accordion
        type="multiple"
        className="space-y-4"
        value={openItems}
        onValueChange={setOpenItems}
      >
        {Object.entries(bulletPoints ?? {}).map(([bpKey, bp], index) => {
          // Find the first incomplete bullet
          const bulletKeys = Object.keys(bulletPoints ?? {});
          const firstIncompleteIndex = bulletKeys.findIndex(
            (key) =>
              !sectionFeedback[key]?.rating ||
              !sectionFeedback[key]?.qualitative?.trim()
          );
          const isNextAction = index === firstIncompleteIndex;

          return (
            <BulletAccordionItem
              key={bpKey}
              bulletKey={bpKey}
              bulletText={bp.text}
              rationaleText={bp.rationale}
              feedback={
                sectionFeedback[bpKey] ?? { thumbs: null, qualitative: "" }
              }
              onFeedbackChange={(update) => updateFeedback(bpKey, update)}
              isOpen={openItems.includes(bpKey)}
              isNextAction={isNextAction}
            />
          );
        })}
      </Accordion>
      <Button
        variant="outline"
        onClick={handleComplete}
        disabled={!allComplete}
        className={`mt-8 ${
          allComplete
            ? "border-2 border-orange-500 hover:border-orange-600"
            : ""
        }`}
      >
        {allComplete && <CheckCircle className="w-5 h-5 text-green-600" />}
        Complete Section Review
      </Button>
    </Card>
  );
}
