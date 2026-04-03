export interface CvSectionScores {
  structure: number;
  impact: number;
  skillsAlignment: number;
  atsReadability: number;
  clarity: number;
}

export interface CvAnalysis {
  overallScore: number;
  summary: string;
  sectionScores: CvSectionScores;
  strengths: string[];
  issues: string[];
  suggestions: string[];
  improvedBullets: string[];
}

export interface CvAnalyzeResponse {
  success: boolean;
  cached: boolean;
  truncated: boolean;
  analysisId: number;
  createdAt: string;
  overallScore: number;
  analysis: CvAnalysis;
}

export interface CvHistoryItem {
  id: number;
  originalFilename: string;
  overallScore: number;
  createdAt: string;
  analysis: CvAnalysis;
}

export interface CvHistoryResponse {
  success: boolean;
  analyses: CvHistoryItem[];
}
