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
    <div className="min-h-screen flex items-center justify-center">
      {/* Fixed canvas */}
      <Card className="w-[80vw] h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full"
        >
          {/* Content fills most of the canvas */}
          <div className="flex-1 overflow-auto p-6">
            <TabsContent value="intro">
              {/* Intro content goes here */}
            </TabsContent>
            <TabsContent value="draft1">{/* Draft 1 content */}</TabsContent>
            <TabsContent value="draft2">{/* Draft 2 content */}</TabsContent>
            <TabsContent value="final">{/* Final content */}</TabsContent>
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
          </TabsList>
        </Tabs>
      </Card>
    </div>
  );
}
