import { useState, useEffect } from "react";
import { useAppContext } from "@/context/useAppContext";
import { useNavigate } from "react-router-dom";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChatPanel from "@/components/ChatPanel";
import { Star } from "lucide-react";

export function CoverLetterComparisonView() {
  const { letterLabData, setLetterLabData } = useAppContext();
  const [activeTab, setActiveTab] = useState("intro");
  const [selectedFinalDraft, setSelectedFinalDraft] = useState<
    "draft1" | "draft2" | null
  >(null);
  const [draft1Complete, setDraft1Complete] = useState(false);
  const [draft2Complete, setDraft2Complete] = useState(false);

  const navigate = useNavigate();

  const [draftMap, setDraftMap] = useState<{
    draft1: "initial" | "final";
    draft2: "initial" | "final";
  } | null>(null);

  useEffect(() => {
    if (!letterLabData || draftMap) return;

    const random = Math.random() < 0.5;

    const map = {
      draft1: random ? "initial" : "final",
      draft2: random ? "final" : "initial",
    } as const;

    setDraftMap(map);

    // ✅ Persist to context
    setLetterLabData({
      ...letterLabData,
      draftMapping: map,
    });
  }, [letterLabData, setLetterLabData, draftMap]);

  useEffect(() => {
    if (activeTab === "submit") {
      const submitFeedback = async () => {
        if (!letterLabData || !selectedFinalDraft) return;

        const payload = {
          document_id: letterLabData.document_id,
          chatMessages: letterLabData.chatMessages ?? {},
          chatRating: letterLabData.chatRating ?? {},
          selectedFinalDraft,
          draftMapping: letterLabData.draftMapping ?? {}, // ✅ Add this
          resume: letterLabData.resume,
          job_desc: letterLabData.job_desc,
        };

        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/lab/submit-final-data`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );

          if (!res.ok) throw new Error("Server error");
          console.log("✅ Feedback submitted successfully");
        } catch (err) {
          console.error("❌ Feedback submission failed:", err);
        }
      };

      submitFeedback();
    }
  }, [activeTab, letterLabData, selectedFinalDraft]);

  const getRating = (draftKey: "draft1" | "draft2"): number | null => {
    return letterLabData?.chatRating?.[draftKey] ?? null;
  };

  const setRating = (draftKey: "draft1" | "draft2", value: number) => {
    if (!letterLabData) return;
    setLetterLabData({
      ...letterLabData,
      chatRating: {
        ...letterLabData.chatRating,
        [draftKey]: value,
      },
    });
  };

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
                    <Button
                      onClick={() => setActiveTab("draft1")}
                      variant="default"
                    >
                      Proceed
                    </Button>
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
                  <div className="flex-1 border rounded p-4 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-hidden">
                      <ChatPanel draftKey="draft1" />
                    </div>
                    {/* Optional footer (e.g., input or buttons) */}
                    <div className="pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((star) => {
                          const isSelected =
                            getRating("draft1") !== null &&
                            getRating("draft1")! >= star;
                          return (
                            <Star
                              key={star}
                              onClick={() => setRating("draft1", star)}
                              fill={isSelected ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth={2}
                              className={`w-6 h-6 cursor-pointer ${
                                isSelected ? "text-yellow-400" : "text-gray-300"
                              } hover:text-yellow-500`}
                            />
                          );
                        })}
                      </div>
                      <Button
                        onClick={() => {
                          setDraft1Complete(true);
                          setActiveTab("draft2");
                        }}
                        disabled={getRating("draft1") === null}
                      >
                        Done Chatting
                      </Button>
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
                  <div className="flex-1 border rounded p-4 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-hidden">
                      <ChatPanel draftKey="draft2" />
                    </div>
                    {/* Optional footer (e.g., input or buttons) */}
                    <div className="pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((star) => {
                          const isSelected =
                            getRating("draft2") !== null &&
                            getRating("draft2")! >= star;
                          return (
                            <Star
                              key={star}
                              onClick={() => setRating("draft2", star)}
                              fill={isSelected ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth={2}
                              className={`w-6 h-6 cursor-pointer ${
                                isSelected ? "text-yellow-400" : "text-gray-300"
                              } hover:text-yellow-500`}
                            />
                          );
                        })}
                      </div>
                      <Button
                        onClick={() => {
                          setDraft2Complete(true);
                          setActiveTab("final");
                        }}
                        disabled={getRating("draft2") === null}
                      >
                        Done Chatting
                      </Button>
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
                      <Button
                        onClick={() => setSelectedFinalDraft("draft1")}
                        variant="default"
                      >
                        Choose Draft 1
                      </Button>
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
                      <Button
                        onClick={() => setSelectedFinalDraft("draft2")}
                        variant="default"
                      >
                        Choose Draft 2
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}

            {activeTab && (
              <TabsContent
                value="submit"
                className="h-full w-full flex items-center justify-center"
              >
                <div className="text-center space-y-6 max-w-lg">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    🎉 Thank you for participating!
                  </h2>
                  <p className="text-gray-600">
                    Your feedback helps us craft better, more authentic cover
                    letters. We're grateful for your time and insights.
                  </p>
                  <Button onClick={() => navigate("/")} className="mt-4">
                    Return Home
                  </Button>
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
            <TabsTrigger
              value="final"
              className="py-4 px-8"
              disabled={!(draft1Complete && draft2Complete)}
            >
              4. Final Preference
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
