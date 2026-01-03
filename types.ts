export interface SubGenre {
  name: string;
  matchPercentage: number;
}

export interface TechnicalDetails {
  bpmEstimate: string;
  keyEstimate: string;
  timeSignature: string;
}

export interface AnalysisResult {
  primaryGenre: string;
  confidenceScore: number;
  subGenres: SubGenre[];
  moods: string[];
  instrumentation: string[];
  similarArtists: string[];
  description: string;
  technicalDetails: TechnicalDetails;
  culturalContext: string;
}

export interface AudioState {
  file: File | null;
  url: string | null;
  base64: string | null;
  isRecording: boolean;
}
