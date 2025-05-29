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

  const getContentRating = (draftKey: "draft1" | "draft2"): number | null => {
    return letterLabData?.contentRepresentationRating?.[draftKey] ?? null;
  };

  const setContentRating = (draftKey: "draft1" | "draft2", value: number) => {
    if (!letterLabData) return;
    setLetterLabData({
      ...letterLabData,
      contentRepresentationRating: {
        ...letterLabData.contentRepresentationRating,
        [draftKey]: value,
      },
    });
  };

  const getStyleRating = (draftKey: "draft1" | "draft2"): number | null => {
    return letterLabData?.styleRepresentationRating?.[draftKey] ?? null;
  };

  const setStyleRating = (draftKey: "draft1" | "draft2", value: number) => {
    if (!letterLabData) return;
    setLetterLabData({
      ...letterLabData,
      styleRepresentationRating: {
        ...letterLabData.styleRepresentationRating,
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
                      🎉 Thanks for helping LetterLab understand you and your
                      experiences better!
                    </p>
                    <p>
                      In this next step, we’ll show you 2 versions of your cover
                      letter.
                    </p>
                    <ul className="list-disc ml-6 space-y-1">
                      <li>
                        📝 Each version is built from your resume and the job
                        description, but with different stylistic choices
                      </li>
                      <li>
                        💬 As you review, leave feedback on what you like and
                        what felt missed the mark
                      </li>
                      <li>
                        ⭐ Finally, rate the draft for how well it represents
                        you
                      </li>
                    </ul>
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
                          getContentRating("draft1") !== null
                            ? "border-green-500"
                            : letterLabData?.textFeedback?.draft1?.likes?.trim() &&
                              letterLabData?.textFeedback?.draft1?.dislikes?.trim()
                            ? "border-orange-500"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="font-semibold">
                          How well does the content of this letter represent you
                          and your experiences?
                        </div>
                        <div className="pt-1">
                          <LikertScale
                            value={getContentRating("draft1")}
                            onChange={(rating) =>
                              setContentRating("draft1", rating)
                            }
                            showBorder={false}
                            isComplete={getContentRating("draft1") !== null}
                          />
                        </div>
                      </div>

                      {/* Second Rating Question */}
                      <div
                        className={`mt-4 p-3 rounded-lg border-2 ${
                          getStyleRating("draft1") !== null
                            ? "border-green-500"
                            : getContentRating("draft1") !== null
                            ? "border-orange-500"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="font-semibold">
                          How well does this cover letter represent your writing
                          tone & style?
                        </div>
                        <div className="pt-1">
                          <LikertScale
                            value={getStyleRating("draft1")}
                            onChange={(rating) =>
                              setStyleRating("draft1", rating)
                            }
                            showBorder={false}
                            isComplete={getStyleRating("draft1") !== null}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 flex justify-center">
                      <Button
                        variant="outline"
                        className={
                          getContentRating("draft1") !== null &&
                          getStyleRating("draft1") !== null &&
                          letterLabData?.textFeedback?.draft1?.likes?.trim() &&
                          letterLabData?.textFeedback?.draft1?.dislikes?.trim()
                            ? "border-2 border-orange-500 hover:border-orange-600"
                            : ""
                        }
                        onClick={() => {
                          setActiveTab("draft2");
                        }}
                        disabled={
                          getContentRating("draft1") === null ||
                          getStyleRating("draft1") === null ||
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
                          getContentRating("draft2") !== null
                            ? "border-green-500"
                            : letterLabData?.textFeedback?.draft2?.likes?.trim() &&
                              letterLabData?.textFeedback?.draft2?.dislikes?.trim()
                            ? "border-orange-500"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="font-semibold">
                          How well does the content of this letter represent you
                          and your experiences?
                        </div>
                        <div className="pt-1">
                          <LikertScale
                            value={getContentRating("draft2")}
                            onChange={(rating) =>
                              setContentRating("draft2", rating)
                            }
                            showBorder={false}
                            isComplete={getContentRating("draft2") !== null}
                          />
                        </div>
                      </div>

                      {/* Second Rating Question */}
                      <div
                        className={`mt-4 p-3 rounded-lg border-2 ${
                          getStyleRating("draft2") !== null
                            ? "border-green-500"
                            : getContentRating("draft2") !== null
                            ? "border-orange-500"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="font-semibold">
                          How well does this cover letter represent your writing
                          tone & style?
                        </div>
                        <div className="pt-1">
                          <LikertScale
                            value={getStyleRating("draft2")}
                            onChange={(rating) =>
                              setStyleRating("draft2", rating)
                            }
                            showBorder={false}
                            isComplete={getStyleRating("draft2") !== null}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 flex justify-center">
                      <Button
                        variant="outline"
                        className={
                          getContentRating("draft2") !== null &&
                          getStyleRating("draft2") !== null &&
                          letterLabData?.textFeedback?.draft2?.likes?.trim() &&
                          letterLabData?.textFeedback?.draft2?.dislikes?.trim()
                            ? "border-2 border-orange-500 hover:border-orange-600"
                            : ""
                        }
                        onClick={() => {
                          setActiveTab("submit");
                        }}
                        disabled={
                          getContentRating("draft2") === null ||
                          getStyleRating("draft2") === null ||
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
                          contentRepresentationRating:
                            letterLabData.contentRepresentationRating ?? {},
                          styleRepresentationRating:
                            letterLabData.styleRepresentationRating ?? {},
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

                          const responseData = await res.json();
                          console.log(
                            "✅ Feedback submitted successfully",
                            responseData
                          );

                          // Update context with completed status and finalPreference
                          if (
                            responseData.completed !== undefined ||
                            responseData.finalPreference !== undefined
                          ) {
                            setLetterLabData({
                              ...letterLabData,
                              completed: responseData.completed,
                              finalPreference: responseData.finalPreference,
                            });
                          }

                          setHasSubmitted(true);
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
                        window.open(
                          "https://gatech.co1.qualtrics.com/jfe/form/SV_42yH2yLMgouPMeq",
                          "_blank"
                        );

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
              <TabsContent
                value="final"
                className="h-full w-full flex flex-col overflow-hidden"
              >
                {/* Preference statement */}
                {letterLabData?.finalPreference &&
                  letterLabData.finalPreference !== "tie" && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex-shrink-0">
                      <p className="text-lg text-gray-800">
                        {letterLabData.finalPreference === "control"
                          ? "You preferred the Control Cover Letter"
                          : "You preferred the Aligned Cover Letter"}
                      </p>
                    </div>
                  )}

                <div className="flex-1 flex gap-6 min-h-0">
                  {/* Left panel: Control draft */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="text-lg font-semibold mb-2 flex-shrink-0">
                      Control
                    </h3>
                    <div
                      className={`flex-1 border rounded p-4 overflow-y-auto whitespace-pre-wrap text-sm text-gray-800 leading-relaxed min-h-0 ${
                        letterLabData?.finalPreference === "control"
                          ? "border-green-500 border-2"
                          : ""
                      }`}
                    >
                      {letterLabData?.initial_cover_letter ||
                        "Control draft not available"}
                    </div>
                  </div>

                  {/* Right panel: Aligned draft */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="text-lg font-semibold mb-2 flex-shrink-0">
                      Aligned
                    </h3>
                    <div
                      className={`flex-1 border rounded p-4 overflow-y-auto whitespace-pre-wrap text-sm text-gray-800 leading-relaxed min-h-0 ${
                        letterLabData?.finalPreference === "aligned"
                          ? "border-green-500 border-2"
                          : ""
                      }`}
                    >
                      {letterLabData?.final_cover_letter ||
                        "Aligned draft not available"}
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
                getContentRating("draft1") !== null &&
                getStyleRating("draft1") !== null &&
                letterLabData?.textFeedback?.draft1?.likes?.trim() &&
                letterLabData?.textFeedback?.draft1?.dislikes?.trim()
                  ? "border-green-500"
                  : activeTab !== "intro"
                  ? "border-orange-500 hover:border-orange-600"
                  : ""
              }`}
              value="draft1"
            >
              {getContentRating("draft1") !== null &&
                getStyleRating("draft1") !== null &&
                letterLabData?.textFeedback?.draft1?.likes?.trim() &&
                letterLabData?.textFeedback?.draft1?.dislikes?.trim() && (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                )}
              Draft 1
            </TabsTrigger>
            <TabsTrigger
              className={`py-2 px-5 border-2 ${
                getContentRating("draft2") !== null &&
                getStyleRating("draft2") !== null &&
                letterLabData?.textFeedback?.draft2?.likes?.trim() &&
                letterLabData?.textFeedback?.draft2?.dislikes?.trim()
                  ? "border-green-500"
                  : getContentRating("draft1") !== null &&
                    getStyleRating("draft1") !== null &&
                    letterLabData?.textFeedback?.draft1?.likes?.trim() &&
                    letterLabData?.textFeedback?.draft1?.dislikes?.trim()
                  ? "border-orange-500 hover:border-orange-600"
                  : "border-gray-300"
              }`}
              value="draft2"
            >
              {getContentRating("draft2") !== null &&
                getStyleRating("draft2") !== null &&
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
                  : getContentRating("draft1") !== null &&
                    getStyleRating("draft1") !== null &&
                    letterLabData?.textFeedback?.draft1?.likes?.trim() &&
                    letterLabData?.textFeedback?.draft1?.dislikes?.trim() &&
                    getContentRating("draft2") !== null &&
                    getStyleRating("draft2") !== null &&
                    letterLabData?.textFeedback?.draft2?.likes?.trim() &&
                    letterLabData?.textFeedback?.draft2?.dislikes?.trim()
                  ? "border-orange-500 hover:border-orange-600"
                  : "border-gray-300 opacity-50 cursor-not-allowed pointer-events-none"
              }`}
              value="submit"
              disabled={
                !(
                  getContentRating("draft1") !== null &&
                  getStyleRating("draft1") !== null &&
                  letterLabData?.textFeedback?.draft1?.likes?.trim() &&
                  letterLabData?.textFeedback?.draft1?.dislikes?.trim() &&
                  getContentRating("draft2") !== null &&
                  getStyleRating("draft2") !== null &&
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
