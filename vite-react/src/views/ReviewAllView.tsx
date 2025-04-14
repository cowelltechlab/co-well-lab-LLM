// src/views/ReviewSectionView.tsx
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function ReviewAllView() {
  const navigate = useNavigate();
  const { coverLetterData } = useAppContext();
  const data = useAppContext();

  console.log("data", data);

  // if (!coverLetterData) {
  //   navigate("/");
  //   return null;
  // }

  const bullets = {
    enactive_mastery: Object.values(coverLetterData.BSETB_enactive_mastery).map(
      (b) => b.text
    ),
    vicarious_experience: Object.values(
      coverLetterData.BSETB_vicarious_experience
    ).map((b) => b.text),
    verbal_persuasion: Object.values(
      coverLetterData.BSETB_verbal_persuasion
    ).map((b) => b.text),
  };

  return (
    <Card className="w-full max-w-6xl p-6 bg-white shadow-lg">
      <Tabs defaultValue="cover">
        <TabsList className="flex border-b mb-4">
          <TabsTrigger value="cover">Cover Letter</TabsTrigger>
          <TabsTrigger value="bullets">Bullet Points</TabsTrigger>
        </TabsList>

        <TabsContent value="cover">
          <h2 className="text-xl font-semibold mb-2">Cover Letter</h2>
          <p className="whitespace-pre-line">
            {coverLetterData.initial_cover_letter}
          </p>
        </TabsContent>

        <TabsContent value="bullets">
          <h2 className="text-xl font-semibold mb-2">
            Bullet Points by Bandura Category
          </h2>

          <div className="mt-4">
            {Object.entries(bullets).map(([key, points]) => (
              <div key={key} className="mb-6">
                <h3 className="text-lg font-bold capitalize underline">
                  {key.replace("_", " ")}
                </h3>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  {points.map((bp, idx) => (
                    <li key={idx}>{bp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
