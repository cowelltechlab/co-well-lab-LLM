export type Rating = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface CoverLetterResponse {
  resume?: string;
  job_desc?: string;
  _id?: string;
  document_id?: string;
  token?: string;
  hasAccess?: boolean;
  completed?: boolean;
  finalPreference?: "control" | "aligned" | "tie" | null;
  
  // v1.5 Collaborative Alignment Data
  bulletIterations?: {
    bulletIndex: number;
    iterations: {
      iterationNumber: number;
      bulletText: string;
      rationale: string;
      userRating: number;
      userFeedback: string;
      timestamp: Date;
    }[];
    finalIteration: number | null;
  }[];
  
  controlProfile?: {
    text: string;
    likertResponses?: {
      accuracy: number;
      control: number;
      expression: number;
      alignment: number;
    };
    openResponses?: {
      likes: string;
      dislikes: string;
      changes: string;
    };
  };
  
  alignedProfile?: {
    text: string;
    likertResponses?: {
      accuracy: number;
      control: number;
      expression: number;
      alignment: number;
    };
    openResponses?: {
      likes: string;
      dislikes: string;
      changes: string;
    };
  };
}

export interface AppState {
  resumeText: string;
  jobDescription: string;
  generatedCoverLetter: string;
  isGeneratingCoverLetter: boolean;
  generationError: string;
  letterLabData: CoverLetterResponse | null;
  setResumeText: (text: string) => void;
  setJobDescription: (text: string) => void;
  setGeneratedCoverLetter: (text: string) => void;
  setIsGeneratingCoverLetter: (isLoading: boolean) => void;
  setGenerationError: (error: string) => void;
  setLetterLabData: React.Dispatch<
    React.SetStateAction<CoverLetterResponse | null>
  >;
  generateControlProfile: () => Promise<boolean>;
  generateAlignedProfile: () => Promise<boolean>;
}