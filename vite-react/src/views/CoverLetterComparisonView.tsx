import { useState, useEffect } from "react";
import { useAppContext } from "@/context/useAppContext";
import { useNavigate } from "react-router-dom";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TextFeedbackPanel from "@/components/TextFeedbackPanel";
import { LikertScale } from "@/components/LikertScale";
import { CheckCircle } from "lucide-react";

export function CoverLetterComparisonView() {
  const { letterLabData, setLetterLabData } = useAppContext();
  const [activeTab, setActiveTab] = useState("intro");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasTakenSurvey, setHasTakenSurvey] = useState(false);

  const navigate = useNavigate();

  const [draftMap, setDraftMap] = useState<{
    draft1: "initial" | "final";
    draft2: "initial" | "final";
  } | null>(null);

  useEffect(() => {
    if (!letterLabData?.hasAccess) {
      navigate("/enter");
    }
  }, [letterLabData, navigate]);

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
                  <div className="bg-blue-100/70 p-4 rounded-lg border border-blue-200 space-y-4">
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
                      variant="outline"
                      className="border-2 border-orange-500 hover:border-orange-600"
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

                  {/* Right panel: text feedback */}
                  <div className="flex-1 border rounded p-4 flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                      <TextFeedbackPanel draftKey="draft1" />
                      {/* Rating section */}
                      <div
                        className={`mt-4 p-3 rounded-lg border-2 ${
                          getRating("draft1") !== null
                            ? "border-green-500"
                            : letterLabData?.textFeedback?.draft1?.likes?.trim() &&
                              letterLabData?.textFeedback?.draft1?.dislikes?.trim()
                            ? "border-orange-500"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="font-semibold">
                          To what extent does this draft sound like you?
                        </div>
                        <div className="pt-1">
                          <LikertScale
                            value={getRating("draft1")}
                            onChange={(rating) => setRating("draft1", rating)}
                            showBorder={false}
                            isComplete={getRating("draft1") !== null}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 flex justify-center">
                      <Button
                        variant="outline"
                        className={
                          getRating("draft1") !== null &&
                          letterLabData?.textFeedback?.draft1?.likes?.trim() &&
                          letterLabData?.textFeedback?.draft1?.dislikes?.trim()
                            ? "border-2 border-orange-500 hover:border-orange-600"
                            : ""
                        }
                        onClick={() => {
                          setActiveTab("draft2");
                        }}
                        disabled={
                          getRating("draft1") === null ||
                          !letterLabData?.textFeedback?.draft1?.likes?.trim() ||
                          !letterLabData?.textFeedback?.draft1?.dislikes?.trim()
                        }
                      >
                        Continue
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

                  {/* Right panel: text feedback */}
                  <div className="flex-1 border rounded p-4 flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                      <TextFeedbackPanel draftKey="draft2" />
                      {/* Rating section */}
                      <div
                        className={`mt-4 p-3 rounded-lg border-2 ${
                          getRating("draft2") !== null
                            ? "border-green-500"
                            : letterLabData?.textFeedback?.draft2?.likes?.trim() &&
                              letterLabData?.textFeedback?.draft2?.dislikes?.trim()
                            ? "border-orange-500"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="font-semibold">
                          To what extent does this draft sound like you?
                        </div>
                        <div className="pt-1">
                          <LikertScale
                            value={getRating("draft2")}
                            onChange={(rating) => setRating("draft2", rating)}
                            showBorder={false}
                            isComplete={getRating("draft2") !== null}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 flex justify-center">
                      <Button
                        variant="outline"
                        className={
                          getRating("draft2") !== null &&
                          letterLabData?.textFeedback?.draft2?.likes?.trim() &&
                          letterLabData?.textFeedback?.draft2?.dislikes?.trim()
                            ? "border-2 border-orange-500 hover:border-orange-600"
                            : ""
                        }
                        onClick={() => {
                          setActiveTab("submit");
                        }}
                        disabled={
                          getRating("draft2") === null ||
                          !letterLabData?.textFeedback?.draft2?.likes?.trim() ||
                          !letterLabData?.textFeedback?.draft2?.dislikes?.trim()
                        }
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}

            {activeTab === "submit" && (
              <TabsContent
                value="submit"
                className="h-full w-full flex items-center justify-center"
              >
                <div className="text-center space-y-6 max-w-lg">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    🎉 Thank you for using our tool!
                  </h2>
                  <p className="text-gray-600">
                    Your feedback helps us improve our cover letter generation
                    process. Please take a moment to complete our survey to
                    share your experience.
                  </p>
                  <div className="flex flex-col items-center space-y-4">
                    <Button
                      onClick={async () => {
                        if (!letterLabData) return;

                        // Calculate final preference
                        const calculateFinalPreference = () => {
                          if (!letterLabData?.chatRating || !draftMap)
                            return null;

                          const draft1Rating = letterLabData.chatRating.draft1;
                          const draft2Rating = letterLabData.chatRating.draft2;

                          if (
                            draft1Rating === undefined ||
                            draft2Rating === undefined ||
                            draft1Rating === null ||
                            draft2Rating === null
                          )
                            return null;

                          // Determine which draft corresponds to initial/final
                          const initialRating =
                            draftMap.draft1 === "initial"
                              ? draft1Rating
                              : draft2Rating;
                          const finalRating =
                            draftMap.draft1 === "final"
                              ? draft1Rating
                              : draft2Rating;

                          if (initialRating > finalRating) {
                            return "control";
                          } else if (finalRating > initialRating) {
                            return "aligned";
                          } else {
                            return "tie";
                          }
                        };

                        const finalPreference = calculateFinalPreference();

                        const payload = {
                          document_id: letterLabData.document_id,
                          chatMessages: letterLabData.chatMessages ?? {},
                          textFeedback: letterLabData.textFeedback ?? {},
                          draftRating: letterLabData.chatRating ?? {},
                          draftMapping: letterLabData.draftMapping ?? {},
                          finalPreference,
                          resume: letterLabData.resume,
                          job_desc: letterLabData.job_desc,
                        };

                        try {
                          const res = await fetch(
                            `${
                              import.meta.env.VITE_API_BASE_URL
                            }/lab/submit-final-data`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(payload),
                            }
                          );

                          if (!res.ok) throw new Error("Server error");
                          console.log("✅ Feedback submitted successfully");
                          setHasSubmitted(true);
                          // TODO: Navigate to survey or show success message
                        } catch (err) {
                          console.error("❌ Feedback submission failed:", err);
                        }
                      }}
                      variant="outline"
                      className={`border-2 ${
                        hasSubmitted
                          ? "border-green-500 hover:border-green-600"
                          : "border-orange-500 hover:border-orange-600"
                      }`}
                      disabled={hasSubmitted}
                    >
                      {hasSubmitted && (
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      )}
                      Submit
                    </Button>
                    {hasSubmitted && (
                      <Button
                        onClick={() => {
                          setActiveTab("survey");
                        }}
                        variant="outline"
                        className="border-2 border-orange-500 hover:border-orange-600"
                      >
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}

            {activeTab === "survey" && (
              <TabsContent
                value="survey"
                className="h-full w-full flex items-center justify-center"
              >
                <div className="text-center space-y-6 max-w-lg">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    📝 Help Us Improve
                  </h2>
                  <p className="text-gray-600">
                    Please take a moment to answer a few questions about your
                    experience using our cover letter generation tool. Your
                    feedback is invaluable in helping us improve our service.
                  </p>
                  <div className="flex flex-col items-center space-y-4">
                    <Button
                      onClick={() => {
                        // TODO: Replace with actual survey URL
                        window.open("https://example.com/survey", "_blank");

                        // Set up listener for when user returns to this tab
                        const handleFocus = () => {
                          setHasTakenSurvey(true);
                          window.removeEventListener("focus", handleFocus);
                        };

                        // Add a small delay before adding the listener to avoid immediate trigger
                        setTimeout(() => {
                          window.addEventListener("focus", handleFocus);
                        }, 1000);
                      }}
                      variant="outline"
                      className={`border-2 ${
                        hasTakenSurvey
                          ? "border-green-500 hover:border-green-600"
                          : "border-orange-500 hover:border-orange-600"
                      }`}
                      disabled={hasTakenSurvey}
                    >
                      {hasTakenSurvey && (
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      )}
                      Take Survey
                    </Button>
                    {hasTakenSurvey && (
                      <Button
                        onClick={() => {
                          setActiveTab("final");
                        }}
                        variant="outline"
                        className="border-2 border-orange-500 hover:border-orange-600"
                      >
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}

            {activeTab === "final" && (
              <TabsContent value="final" className="h-full w-full">
                <div className="flex h-full gap-6">
                  {/* Left panel: Control draft */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold mb-2">Control</h3>
                    <div className="flex-1 border rounded p-4 overflow-auto whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                      {letterLabData?.initial_cover_letter || "Control draft not available"}
                    </div>
                  </div>

                  {/* Right panel: Aligned draft */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold mb-2">Aligned</h3>
                    <div className="flex-1 border rounded p-4 overflow-auto whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                      {letterLabData?.final_cover_letter || "Aligned draft not available"}
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </div>

          {/* Tab list at the bottom */}
          <TabsList className="flex justify-evenly border-t py-10 px-6">
            <TabsTrigger
              className={`py-2 px-5 border-2 ${
                activeTab === "intro"
                  ? "border-green-500"
                  : activeTab !== "intro"
                  ? "border-green-500"
                  : "border-orange-500 hover:border-orange-600"
              }`}
              value="intro"
            >
              {activeTab !== "intro" && (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              )}
              Intro
            </TabsTrigger>
            <TabsTrigger
              className={`py-2 px-5 border-2 ${
                getRating("draft1") !== null &&
                letterLabData?.textFeedback?.draft1?.likes?.trim() &&
                letterLabData?.textFeedback?.draft1?.dislikes?.trim()
                  ? "border-green-500"
                  : activeTab !== "intro"
                  ? "border-orange-500 hover:border-orange-600"
                  : ""
              }`}
              value="draft1"
            >
              {getRating("draft1") !== null &&
                letterLabData?.textFeedback?.draft1?.likes?.trim() &&
                letterLabData?.textFeedback?.draft1?.dislikes?.trim() && (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                )}
              Draft 1
            </TabsTrigger>
            <TabsTrigger
              className={`py-2 px-5 border-2 ${
                getRating("draft2") !== null &&
                letterLabData?.textFeedback?.draft2?.likes?.trim() &&
                letterLabData?.textFeedback?.draft2?.dislikes?.trim()
                  ? "border-green-500"
                  : getRating("draft1") !== null &&
                    letterLabData?.textFeedback?.draft1?.likes?.trim() &&
                    letterLabData?.textFeedback?.draft1?.dislikes?.trim()
                  ? "border-orange-500 hover:border-orange-600"
                  : "border-gray-300"
              }`}
              value="draft2"
            >
              {getRating("draft2") !== null &&
                letterLabData?.textFeedback?.draft2?.likes?.trim() &&
                letterLabData?.textFeedback?.draft2?.dislikes?.trim() && (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                )}
              Draft 2
            </TabsTrigger>
            <TabsTrigger
              className={`py-2 px-5 border-2 transition-colors ${
                hasSubmitted
                  ? "border-green-500"
                  : activeTab === "submit"
                  ? "border-orange-500 hover:border-orange-600"
                  : getRating("draft1") !== null &&
                    letterLabData?.textFeedback?.draft1?.likes?.trim() &&
                    letterLabData?.textFeedback?.draft1?.dislikes?.trim() &&
                    getRating("draft2") !== null &&
                    letterLabData?.textFeedback?.draft2?.likes?.trim() &&
                    letterLabData?.textFeedback?.draft2?.dislikes?.trim()
                  ? "border-orange-500 hover:border-orange-600"
                  : "border-gray-300 opacity-50 cursor-not-allowed pointer-events-none"
              }`}
              value="submit"
              disabled={
                !(
                  getRating("draft1") !== null &&
                  letterLabData?.textFeedback?.draft1?.likes?.trim() &&
                  letterLabData?.textFeedback?.draft1?.dislikes?.trim() &&
                  getRating("draft2") !== null &&
                  letterLabData?.textFeedback?.draft2?.likes?.trim() &&
                  letterLabData?.textFeedback?.draft2?.dislikes?.trim()
                )
              }
            >
              {hasSubmitted && (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              )}
              Submit
            </TabsTrigger>
            <TabsTrigger
              className={`py-2 px-5 border-2 transition-colors ${
                hasTakenSurvey
                  ? "border-green-500"
                  : activeTab === "survey"
                  ? "border-orange-500 hover:border-orange-600"
                  : hasSubmitted
                  ? "border-orange-500 hover:border-orange-600"
                  : "border-gray-300 opacity-50 cursor-not-allowed pointer-events-none"
              }`}
              value="survey"
              disabled={!hasSubmitted}
            >
              {hasTakenSurvey && (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              )}
              Survey
            </TabsTrigger>
            <TabsTrigger
              className={`py-2 px-5 border-2 transition-colors ${
                activeTab === "final"
                  ? "border-green-500"
                  : hasTakenSurvey
                  ? "border-orange-500 hover:border-orange-600"
                  : "border-gray-300 opacity-50 cursor-not-allowed pointer-events-none"
              }`}
              value="final"
              disabled={!hasTakenSurvey}
            >
              {activeTab === "final" && (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              )}
              Final
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>
    </div>
  );
}
