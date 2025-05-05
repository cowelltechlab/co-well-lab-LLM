import { useState, useEffect } from "react";
import { useAppContext } from "@/context/useAppContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export function CoverLetterComparisonView() {
  const { letterLabData } = useAppContext();
  const [activeTab, setActiveTab] = useState("intro");
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const [selectedFinalDraft, setSelectedFinalDraft] = useState<
    "draft1" | "draft2" | null
  >(null);

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
    <div className="min-h-screen flex items-center justify-center">
      {/* Fixed canvas */}
      <Card className="w-[80vw] h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full"
        >
          {/* Content fills most of the canvas */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {activeTab === "intro" && (
              <TabsContent
                value="intro"
                className="h-full w-full flex items-center justify-center"
              >
                <div className="max-w-2xl w-full px-6 space-y-6 text-gray-700 leading-relaxed text-left">
                  <div className="space-y-4">
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
                  </div>

                  <div className="pt-4 text-center">
                    <button
                      onClick={() => setActiveTab("draft1")}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Proceed
                    </button>
                  </div>
                </div>
              </TabsContent>
            )}

            {activeTab === "draft1" && (
              <TabsContent value="draft1" className="h-full w-full">
                <div className="flex h-full gap-6">
                  {/* Left panel: scrollable draft text */}
                  <div className="flex-1 border rounded p-4 overflow-auto whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                    {getDraftText("draft1")}
                  </div>

                  {/* Right panel: placeholder for chat feedback */}
                  <div className="flex-1 border rounded p-4 flex flex-col justify-between">
                    {/* Placeholder chat content */}
                    <div className="flex-1 overflow-auto">
                      <p className="text-gray-500 italic">
                        Chat feedback or commenting functionality goes here.
                      </p>
                    </div>

                    {/* Optional footer (e.g., input or buttons) */}
                    <div className="pt-4 text-right">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}

            {activeTab === "draft2" && (
              <TabsContent value="draft2" className="h-full w-full">
                <div className="flex h-full gap-6">
                  {/* Left panel: scrollable draft text */}
                  <div className="flex-1 border rounded p-4 overflow-auto whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                    {getDraftText("draft2")}
                  </div>

                  {/* Right panel: placeholder for chat feedback */}
                  <div className="flex-1 border rounded p-4 flex flex-col justify-between">
                    {/* Placeholder chat content */}
                    <div className="flex-1 overflow-auto">
                      <p className="text-gray-500 italic">
                        Chat feedback or commenting functionality goes here.
                      </p>
                    </div>

                    {/* Optional footer (e.g., input or buttons) */}
                    <div className="pt-4 text-right">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}

            {activeTab === "final" && (
              <TabsContent value="final" className="h-full w-full">
                <div className="flex h-full gap-6">
                  {/* Draft 1 Panel */}
                  <div
                    className={`flex-1 border rounded p-4 flex flex-col overflow-hidden transition-colors ${
                      selectedFinalDraft === "draft1"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="flex-1 overflow-auto whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                      {getDraftText("draft1")}
                    </div>
                    <div className="pt-4 text-center">
                      <button
                        onClick={() => setSelectedFinalDraft("draft1")}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Choose
                      </button>
                    </div>
                  </div>

                  {/* Draft 2 Panel */}
                  <div
                    className={`flex-1 border rounded p-4 flex flex-col overflow-hidden transition-colors ${
                      selectedFinalDraft === "draft2"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="flex-1 overflow-auto whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                      {getDraftText("draft2")}
                    </div>
                    <div className="pt-4 text-center">
                      <button
                        onClick={() => setSelectedFinalDraft("draft2")}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Choose
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </div>

          {/* Tab list at the bottom */}
          <TabsList className="flex justify-evenly border-t py-10 px-6">
            <TabsTrigger className="py-4 px-8" value="intro">
              Introduction
            </TabsTrigger>
            <TabsTrigger className="py-4 px-8" value="draft1">
              1. Draft 1
            </TabsTrigger>
            <TabsTrigger className="py-4 px-8" value="draft2">
              2. Draft 2
            </TabsTrigger>
            <TabsTrigger className="py-4 px-8" value="final">
              3. Final Preference
            </TabsTrigger>
            <TabsTrigger
              className={`py-4 px-8 transition-colors ${
                selectedFinalDraft
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "opacity-50 cursor-not-allowed pointer-events-none"
              }`}
              value="submit"
              disabled={!selectedFinalDraft}
            >
              5. Submit
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>
    </div>
  );
}
