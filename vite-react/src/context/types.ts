export interface BulletPoint {
  text: string;
  rationale: string;
  rating: number | null;
  qualitative: string | null;
}

export type Rating = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface BulletPointFeedback {
  rating: Rating | null;
  qualitative: string;
}

export type BulletPointGroup = {
  [key: string]: BulletPoint;
};

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface CoverLetterResponse {
  resume?: string;
  job_desc?: string;
  initial_cover_letter?: string;
  review_all_view_intro?: string;
  BSETB_enactive_mastery?: BulletPointGroup;
  BSETB_vicarious_experience?: BulletPointGroup;
  BSETB_verbal_persuasion?: BulletPointGroup;
  _id?: string;
  document_id?: string;
  final_cover_letter?: string;
  chatMessages?: {
    draft1?: Message[];
    draft2?: Message[];
  };
  textFeedback?: {
    draft1?: {
      likes: string;
      dislikes: string;
    };
    draft2?: {
      likes: string;
      dislikes: string;
    };
  };
  chatRating?: {
    draft1?: number;
    draft2?: number;
  };
  contentRepresentationRating?: {
    draft1?: number;
    draft2?: number;
  };
  styleRepresentationRating?: {
    draft1?: number;
    draft2?: number;
  };
  draftMapping?: {
    draft1?: "initial" | "final";
    draft2?: "initial" | "final";
  };
  token?: string;
  hasAccess?: boolean;
  completed?: boolean;
  finalPreference?: "control" | "aligned" | "tie" | null;
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
  initialGeneration: () => Promise<boolean>;
}
