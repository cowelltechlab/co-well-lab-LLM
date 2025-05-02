import { useState, useEffect } from "react";
import { useAppContext } from "@/context/useAppContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export function CoverLetterComparisonView() {
  const { letterLabData } = useAppContext();
  const [activeTab, setActiveTab] = useState("intro");
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);

  const [draftMap, setDraftMap] = useState<{
    draft1: "initial" | "final";
    draft2: "initial" | "final";
  } | null>(null);

  useEffect(() => {
    if (!letterLabData || draftMap) return;

    const random = Math.random() < 0.5;
    setDraftMap({
      draft1: random ? "initial" : "final",
      draft2: random ? "final" : "initial",
    });
  }, [letterLabData, draftMap]);

  const getDraftText = (which: "draft1" | "draft2") => {
    if (!letterLabData || !draftMap) return "";
    return draftMap[which] === "initial"
      ? letterLabData.initial_cover_letter
      : letterLabData.final_cover_letter;
  };

  return (
    <div className="h-[80vh]">
      <Card className="w-full h-full max-w-6xl p-6 bg-white shadow-lg space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full h-full"
        >
          <div className="flex h-full min-h-[600px]">
            {/* Sidebar */}
            <div className="w-1/5 pr-4 h-full">
              <TabsList className="flex flex-col items-center justify-center h-full w-full gap-4 bg-muted rounded p-2">
                <TabsTrigger value="intro">1. Introduction</TabsTrigger>
                <TabsTrigger
                  value="draft1"
                  disabled={!completedTabs.includes("intro")}
                >
                  2. Draft 1
                </TabsTrigger>
                <TabsTrigger
                  value="draft2"
                  disabled={!completedTabs.includes("draft1")}
                >
                  3. Draft 2
                </TabsTrigger>
                <TabsTrigger
                  value="final"
                  disabled={!completedTabs.includes("draft2")}
                >
                  4. Final Preference
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Main content panel */}
            <div className="flex-1 h-full border rounded p-6 bg-white shadow-sm">
              <TabsContent value="intro">
                <div className="flex items-center justify-center h-full min-h-[600px]">
                  <div className="max-w-xl w-full text-left space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      Welcome! 🎉 You’ve already done the hard part by getting
                      started — now let’s refine your cover letter so it truly
                      represents you.
                    </p>
                    <p>
                      In this next step, we’ll ask you to read and respond to
                      two drafts of your cover letter.
                    </p>
                    <ul className="list-disc ml-6 space-y-1">
                      <li>
                        📝 Each draft is built from your resume and the job
                        description, but with different stylistic choices.
                      </li>
                      <li>
                        👍👎 As you review, mark what you like and what you’d
                        change.
                      </li>
                      <li>
                        💬 You’ll also explain your preferences so we can
                        improve the next version.
                      </li>
                      <li>
                        ⭐ At the end, you’ll pick the draft you prefer — and
                        we’ll use that feedback to generate your final letter.
                      </li>
                    </ul>
                    <p>
                      Your feedback helps shape a letter that’s not only
                      professional, but also a true reflection of your voice.
                    </p>
                    <div className="pt-4 text-center">
                      <button
                        onClick={() => {
                          setCompletedTabs((prev) => [...prev, "intro"]);
                          setActiveTab("draft1");
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Ok, Let’s Begin
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="draft1" className="h-full overflow-hidden">
                <div className="flex gap-6 h-full">
                  <div className="w-1/2 h-full max-h-full overflow-auto border rounded p-4 whitespace-pre-wrap">
                    {getDraftText("draft1")}
                  </div>
                  <div className="w-1/2 border rounded p-4">
                    {/* Chat component */}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="draft2">
                <div className="flex gap-6 h-full">
                  <div className="w-1/2 h-full max-h-full overflow-auto border rounded p-4 whitespace-pre-wrap">
                    {getDraftText("draft2")}
                  </div>
                  <div className="w-1/2 border rounded p-4">
                    {/* Chat component */}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="final">
                <div className="h-full">{/* Final comparison view */}</div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
