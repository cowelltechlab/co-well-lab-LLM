import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// Import PDF.js with proper types
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

// Set the worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Function to generate cover letter by calling the backend API
async function generateCoverLetter(resumeText: string, jobDesc: string) {
  const response = await fetch("http://localhost:5002/cover-letter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ resume_text: resumeText, job_desc: jobDesc }),
  });
  const data = await response.json();
  return data.cover_letter;
}

function App() {
  const [step, setStep] = useState<"intro" | "main">("intro");
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [showJobPopup, setShowJobPopup] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [resumeInputMode, setResumeInputMode] = useState<"paste" | "upload">(
    "paste"
  );
  const [jobInputMode, setJobInputMode] = useState<"paste" | "upload">("paste");
  const [resumeFileWarning, setResumeFileWarning] = useState("");
  const [jobFileWarning, setJobFileWarning] = useState("");
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [generationError, setGenerationError] = useState("");

  const handleGenerate = async () => {
    if (resumeText && jobDescription) {
      setIsGeneratingCoverLetter(true);
      setGenerationError("");

      try {
        const responseObject = await generateCoverLetter(
          resumeText,
          jobDescription
        );

        const bulletPointList = Object.values(
          responseObject.bullet_points
        ).join("\n\n");

        console.log(bulletPointList);

        setGeneratedCoverLetter(bulletPointList);
        setStep("main");
      } catch (error) {
        console.error("Error generating cover letter:", error);
        setGenerationError(
          "Failed to generate cover letter. Please try again."
        );
      } finally {
        setIsGeneratingCoverLetter(false);
      }
    } else {
      alert("Please provide both a resume and a job description.");
    }
  };

  // Parse PDF file using PDF.js
  const parsePdfFile = async (file: File): Promise<string> => {
    try {
      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Load the PDF document
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

      let fullText = "";

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText +=
          textContent.items
            .map((item: any) => item.str)
            .join(" ")
            .replace(/\s+/g, " ") + "\n\n";
      }

      return fullText.trim();
    } catch (error) {
      console.error("Detailed PDF parsing error:", error);
      throw new Error(
        "Failed to parse PDF. The file might be image-based or corrupted."
      );
    }
  };

  // Handle file upload for job description
  const handleJobFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJobFileWarning("");
    setIsLoadingJob(true);

    try {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (fileType === "text/plain" || fileName.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setJobDescription(content);
          setIsLoadingJob(false);
        };
        reader.readAsText(file);
      } else if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        try {
          const pdfText = await parsePdfFile(file);
          setJobDescription(pdfText);
        } catch (error) {
          setJobFileWarning(error as string);
        }
      } else {
        setJobFileWarning(
          "Unsupported file type. Please use .txt or .pdf files."
        );
      }
    } catch (error) {
      setJobFileWarning("An error occurred while processing the file.");
      console.error(error);
    } finally {
      setIsLoadingJob(false);
    }
  };

  const handleResumeFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFileWarning("");
    setIsLoadingResume(true);

    try {
      if (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      ) {
        const pdfText = await parsePdfFile(file);
        setResumeText(pdfText);
      } else if (
        file.type === "text/plain" ||
        file.name.toLowerCase().endsWith(".txt")
      ) {
        const text = await file.text();
        setResumeText(text);
      } else {
        setResumeFileWarning("Unsupported file type. Please use PDF or TXT.");
      }
    } catch (error) {
      setResumeFileWarning(
        error instanceof Error ? error.message : "Failed to process file"
      );
    } finally {
      setIsLoadingResume(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      {step === "intro" ? (
        <Card className="w-full max-w-2xl p-6 text-center shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Welcome to Neuro, an AI Cover Letter Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Upload your resume or enter it manually, then provide a job
              description. Our AI will generate a tailored cover letter for you!
            </p>
            <div className="flex flex-col gap-4">
              <Button
                variant="default"
                onClick={() => setShowResumePopup(true)}
                disabled={isGeneratingCoverLetter}
              >
                Upload or Paste Your Resume
                {resumeText && <span className="ml-2 text-green-500">✓</span>}
              </Button>
              <Button
                variant="default"
                onClick={() => setShowJobPopup(true)}
                disabled={isGeneratingCoverLetter}
              >
                Upload or Paste Job Description
                {jobDescription && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </Button>
              <Button
                variant="default"
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleGenerate}
                disabled={
                  isGeneratingCoverLetter || !resumeText || !jobDescription
                }
              >
                {isGeneratingCoverLetter ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Cover Letter"
                )}
              </Button>

              {generationError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{generationError}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-4xl p-6 shadow-lg bg-white">
          <Tabs defaultValue="review">
            <TabsList className="flex border-b">
              <TabsTrigger value="review">Review</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>
            <TabsContent
              value="review"
              className="flex flex-col md:flex-row gap-4 p-4"
            >
              <div className="w-full md:w-1/2 md:border-r md:pr-4">
                <h2 className="font-bold mb-2">Cover Letter:</h2>
                <p className="whitespace-pre-line">{generatedCoverLetter}</p>
              </div>
              <div className="w-full md:w-1/2">
                <h2 className="font-bold mb-2">Resume:</h2>
                <p className="whitespace-pre-line">{resumeText}</p>
              </div>
            </TabsContent>
            <TabsContent value="edit" className="p-4">
              <Textarea
                className="w-full h-64"
                value={generatedCoverLetter}
                onChange={(e) => setGeneratedCoverLetter(e.target.value)}
              />
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  className="mr-2"
                  onClick={() => setStep("intro")}
                >
                  Back
                </Button>
                <Button>Save Cover Letter</Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}

      {/* Resume Upload/Paste Popup */}
      <Dialog
        open={showResumePopup}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowResumePopup(false);
            setResumeFileWarning("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Your Resume</DialogTitle>
            <DialogDescription>
              Choose one method to provide your resume.
            </DialogDescription>
          </DialogHeader>

          <div className="flex space-x-2 mb-4">
            <Button
              variant={resumeInputMode === "paste" ? "default" : "outline"}
              onClick={() => {
                setResumeInputMode("paste");
                setResumeFileWarning("");
              }}
              className="w-1/2"
            >
              Paste Text
            </Button>
            <Button
              variant={resumeInputMode === "upload" ? "default" : "outline"}
              onClick={() => setResumeInputMode("upload")}
              className="w-1/2"
            >
              Upload File
            </Button>
          </div>

          {resumeInputMode === "paste" ? (
            <Textarea
              placeholder="Paste your resume here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="min-h-32"
            />
          ) : (
            <>
              <Input
                type="file"
                onChange={handleResumeFileUpload}
                accept=".txt,.pdf"
                disabled={isLoadingResume}
              />

              {isLoadingResume && (
                <div className="flex items-center justify-center mt-4">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Processing your file...</span>
                </div>
              )}

              {resumeFileWarning && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{resumeFileWarning}</AlertDescription>
                </Alert>
              )}

              <p className="text-sm text-gray-500 mt-2">
                Supported file types: PDF, TXT
              </p>
            </>
          )}

          <Button onClick={() => setShowResumePopup(false)}>Save</Button>
        </DialogContent>
      </Dialog>

      {/* Job Description Upload/Paste Popup */}
      <Dialog
        open={showJobPopup}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowJobPopup(false);
            setJobFileWarning("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Job Description</DialogTitle>
            <DialogDescription>
              Choose one method to provide the job description.
            </DialogDescription>
          </DialogHeader>

          <div className="flex space-x-2 mb-4">
            <Button
              variant={jobInputMode === "paste" ? "default" : "outline"}
              onClick={() => {
                setJobInputMode("paste");
                setJobFileWarning("");
              }}
              className="w-1/2"
            >
              Paste Text
            </Button>
            <Button
              variant={jobInputMode === "upload" ? "default" : "outline"}
              onClick={() => setJobInputMode("upload")}
              className="w-1/2"
            >
              Upload File
            </Button>
          </div>

          {jobInputMode === "paste" ? (
            <Textarea
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-32"
            />
          ) : (
            <>
              <Input
                type="file"
                onChange={handleJobFileUpload}
                accept=".txt,.pdf"
                disabled={isLoadingJob}
              />

              {isLoadingJob && (
                <div className="flex items-center justify-center mt-4">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Processing your file...</span>
                </div>
              )}

              {jobFileWarning && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{jobFileWarning}</AlertDescription>
                </Alert>
              )}

              <p className="text-sm text-gray-500 mt-2">
                Supported file types: PDF, TXT
              </p>
            </>
          )}

          <Button onClick={() => setShowJobPopup(false)}>Save</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;