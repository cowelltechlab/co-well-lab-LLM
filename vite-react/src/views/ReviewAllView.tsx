import { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ReviewAllView() {
  const navigate = useNavigate();
  const { letterLabData } = useAppContext();

  useEffect(() => {
    if (!letterLabData) {
      navigate("/");
    }
  }, [letterLabData, navigate]);

  if (!letterLabData) return null;

  const beliefs = [
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

  return (
    <Card className="w-full max-w-4xl p-6 bg-white shadow-lg space-y-8">
      <h2 className="text-2xl font-bold mb-4">
        Your Personalized Cover Letter Review
      </h2>
      <p className="text-gray-700 whitespace-pre-line">
        {letterLabData.review_all_view_intro}
      </p>

      {beliefs.map(({ key, title, label }, index) => {
        const bullets = Object.values(letterLabData[key]).map((b) => b.text);

        return (
          <div key={key} className="relative border-t pt-6 mt-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">
                  {title} <span className="italic text-gray-600">{label}</span>
                </h3>
              </div>
              <Button variant="outline" className="shrink-0">
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
