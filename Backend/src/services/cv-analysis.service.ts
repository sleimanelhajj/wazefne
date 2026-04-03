import {
  GoogleGenerativeAI,
  ResponseSchema,
  SchemaType,
} from "@google/generative-ai";

export interface CvSectionScores {
  structure: number;
  impact: number;
  skillsAlignment: number;
  atsReadability: number;
  clarity: number;
}

export interface CvAnalysisResult {
  overallScore: number;
  summary: string;
  sectionScores: CvSectionScores;
  strengths: string[];
  issues: string[];
  suggestions: string[];
  improvedBullets: string[];
}

interface AnalyzeCvParams {
  cvText: string;
  targetRole?: string;
  jobDescription?: string;
}

interface AnalyzeCvFileParams {
  fileBuffer: Buffer;
  fileMimeType: string;
  targetRole?: string;
  jobDescription?: string;
}

const CV_ANALYSIS_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    overallScore: { type: SchemaType.INTEGER },
    summary: { type: SchemaType.STRING },
    sectionScores: {
      type: SchemaType.OBJECT,
      properties: {
        structure: { type: SchemaType.INTEGER },
        impact: { type: SchemaType.INTEGER },
        skillsAlignment: { type: SchemaType.INTEGER },
        atsReadability: { type: SchemaType.INTEGER },
        clarity: { type: SchemaType.INTEGER },
      },
      required: [
        "structure",
        "impact",
        "skillsAlignment",
        "atsReadability",
        "clarity",
      ],
    },
    strengths: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    issues: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    suggestions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    improvedBullets: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: [
    "overallScore",
    "summary",
    "sectionScores",
    "strengths",
    "issues",
    "suggestions",
    "improvedBullets",
  ],
};

const toScore = (value: unknown, fallback = 50): number => {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
};

const toStringArray = (value: unknown, maxItems = 8): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, maxItems);
};

const toShortString = (value: unknown, fallback: string, maxChars = 500): string => {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  return text.slice(0, maxChars);
};

const makeStatusError = (message: string, statusCode = 502): Error & { statusCode: number } => {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
};

const sanitizeJsonText = (rawText: string): string =>
  rawText
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u2018|\u2019/g, "'")
    .trim();

const extractBalancedObjects = (input: string): string[] => {
  const results: string[] = [];

  for (let start = 0; start < input.length; start++) {
    if (input[start] !== "{") continue;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < input.length; i++) {
      const ch = input[i];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (ch === "\\") {
          escaped = true;
        } else if (ch === '"') {
          inString = false;
        }
        continue;
      }

      if (ch === '"') {
        inString = true;
        continue;
      }

      if (ch === "{") depth++;
      if (ch === "}") {
        depth--;
        if (depth === 0) {
          results.push(input.slice(start, i + 1));
          start = i;
          break;
        }
      }
    }
  }

  return results;
};

const extractJsonPayload = (rawText: string): unknown => {
  const cleaned = sanitizeJsonText(rawText);

  const candidates: string[] = [];
  if (cleaned) candidates.push(cleaned);

  const fenceRegex = /```(?:json)?\s*([\s\S]*?)```/gi;
  let match: RegExpExecArray | null;
  while ((match = fenceRegex.exec(cleaned)) !== null) {
    const block = match[1]?.trim();
    if (block) candidates.push(block);
  }

  candidates.push(...extractBalancedObjects(cleaned));

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed) && parsed[0] && typeof parsed[0] === "object") {
        return parsed[0];
      }
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      // Keep trying.
    }
  }

  throw makeStatusError("Gemini returned invalid JSON for CV analysis.");
};

const normalizeAnalysis = (payload: unknown): CvAnalysisResult => {
  const source =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const sectionSource =
    source.sectionScores && typeof source.sectionScores === "object"
      ? (source.sectionScores as Record<string, unknown>)
      : {};

  const sectionScores: CvSectionScores = {
    structure: toScore(sectionSource.structure, 50),
    impact: toScore(sectionSource.impact, 50),
    skillsAlignment: toScore(sectionSource.skillsAlignment, 50),
    atsReadability: toScore(sectionSource.atsReadability, 50),
    clarity: toScore(sectionSource.clarity, 50),
  };

  const strengths = toStringArray(source.strengths, 6);
  const issues = toStringArray(source.issues, 6);
  const suggestions = toStringArray(source.suggestions, 10);
  const improvedBullets = toStringArray(source.improvedBullets, 6);

  const averageSectionScore = Math.round(
    (sectionScores.structure +
      sectionScores.impact +
      sectionScores.skillsAlignment +
      sectionScores.atsReadability +
      sectionScores.clarity) /
      5,
  );

  return {
    overallScore: toScore(source.overallScore, averageSectionScore),
    summary: toShortString(
      source.summary,
      "CV analyzed successfully. Add more quantified impact for stronger results.",
      700,
    ),
    sectionScores,
    strengths,
    issues,
    suggestions,
    improvedBullets,
  };
};

const buildPrompt = ({ cvText, targetRole, jobDescription }: AnalyzeCvParams): string => {
  const roleLine = targetRole?.trim()
    ? `Target role: ${targetRole.trim()}`
    : "Target role: Not provided";
  const jdLine = jobDescription?.trim()
    ? `Job description context:\n${jobDescription.trim().slice(0, 4000)}`
    : "Job description context: Not provided";

  return `
You are a senior technical recruiter and ATS optimization expert.
Analyze the following CV and return only valid JSON (no markdown, no commentary outside JSON).

Scoring rules:
- Score from 0 to 100.
- Penalize vague bullets and missing measurable outcomes.
- Reward clear structure, strong skills alignment, and ATS-friendly formatting.

Return JSON with this exact shape:
{
  "overallScore": number,
  "summary": string,
  "sectionScores": {
    "structure": number,
    "impact": number,
    "skillsAlignment": number,
    "atsReadability": number,
    "clarity": number
  },
  "strengths": string[],
  "issues": string[],
  "suggestions": string[],
  "improvedBullets": string[]
}

Constraints:
- "strengths" 3-6 concise bullets.
- "issues" 3-6 concise bullets.
- "suggestions" 5-10 actionable fixes.
- "improvedBullets" 2-6 improved achievement bullets rewritten from weak CV content.
- Keep language clear and practical.

${roleLine}
${jdLine}

CV:
${cvText}
`.trim();
};

const getModel = (apiKey: string, modelName: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 1800,
      responseMimeType: "application/json",
      responseSchema: CV_ANALYSIS_SCHEMA,
    },
  });
};

const runWithTimeout = async <T>(
  executor: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await executor(controller.signal);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("abort")) {
      throw makeStatusError("Gemini request timed out while analyzing the CV.", 504);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

const getResponseText = (result: any): string => {
  try {
    return result.response?.text?.() ?? "";
  } catch {
    const candidates = result?.response?.candidates;
    if (Array.isArray(candidates) && candidates.length > 0) {
      const parts = candidates[0]?.content?.parts;
      if (Array.isArray(parts)) {
        return parts
          .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
          .join("\n")
          .trim();
      }
    }
    return "";
  }
};

const parseOrRepairJson = async (
  model: any,
  rawText: string,
  timeoutMs: number,
): Promise<unknown> => {
  try {
    return extractJsonPayload(rawText);
  } catch {
    const repairPrompt = `
Convert the following model output into strict valid JSON only.
Do not add commentary, markdown, or code fences.

Model output:
${rawText}
`.trim();

    const repairResult = await runWithTimeout(
      (signal) => model.generateContent(repairPrompt, { signal }),
      timeoutMs,
    );
    const repairedText = getResponseText(repairResult);
    return extractJsonPayload(repairedText);
  }
};

const fallbackAnalysis = (): CvAnalysisResult => ({
  overallScore: 55,
  summary:
    "We analyzed the CV, but formatting made some model output incomplete. Re-run once for a cleaner score breakdown.",
  sectionScores: {
    structure: 55,
    impact: 50,
    skillsAlignment: 55,
    atsReadability: 55,
    clarity: 55,
  },
  strengths: ["Professional background detected."],
  issues: ["Could not fully parse all AI fields in this attempt."],
  suggestions: [
    "Use clear section headings (Summary, Experience, Skills, Education).",
    "Add measurable outcomes to each recent role.",
    "Keep skills matched to the target role keywords.",
  ],
  improvedBullets: [],
});

export const analyzeCvWithGemini = async (
  params: AnalyzeCvParams,
): Promise<CvAnalysisResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw makeStatusError("GEMINI_API_KEY is missing in Backend/.env", 500);
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const model = getModel(apiKey, modelName);
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS || "90000");

  const prompt = buildPrompt(params);
  const result = await runWithTimeout(
    (signal) => model.generateContent(prompt, { signal }),
    timeoutMs,
  );
  const raw = getResponseText(result);

  try {
    const payload = await parseOrRepairJson(model, raw, timeoutMs);
    return normalizeAnalysis(payload);
  } catch {
    return fallbackAnalysis();
  }
};

const buildFilePrompt = ({
  targetRole,
  jobDescription,
}: Omit<AnalyzeCvFileParams, "fileBuffer" | "fileMimeType">): string => {
  const roleLine = targetRole?.trim()
    ? `Target role: ${targetRole.trim()}`
    : "Target role: Not provided";
  const jdLine = jobDescription?.trim()
    ? `Job description context:\n${jobDescription.trim().slice(0, 4000)}`
    : "Job description context: Not provided";

  return `
You are a senior technical recruiter and ATS optimization expert.
The user uploaded a CV file. Read it and return only valid JSON (no markdown, no extra text).

Return JSON with this exact shape:
{
  "overallScore": number,
  "summary": string,
  "sectionScores": {
    "structure": number,
    "impact": number,
    "skillsAlignment": number,
    "atsReadability": number,
    "clarity": number
  },
  "strengths": string[],
  "issues": string[],
  "suggestions": string[],
  "improvedBullets": string[]
}

Constraints:
- "strengths" 3-6 concise bullets.
- "issues" 3-6 concise bullets.
- "suggestions" 5-10 actionable fixes.
- "improvedBullets" 2-6 improved achievement bullets rewritten from weak CV content.

${roleLine}
${jdLine}
`.trim();
};

export const analyzeCvFileWithGemini = async (
  params: AnalyzeCvFileParams,
): Promise<CvAnalysisResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw makeStatusError("GEMINI_API_KEY is missing in Backend/.env", 500);
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const model = getModel(apiKey, modelName);
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS || "90000");

  const prompt = buildFilePrompt(params);
  const result = await runWithTimeout(
    (signal) =>
      model.generateContent(
        {
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: params.fileMimeType,
                    data: params.fileBuffer.toString("base64"),
                  },
                },
              ],
            },
          ],
        },
        { signal },
      ),
    timeoutMs,
  );

  const raw = getResponseText(result);

  try {
    const payload = await parseOrRepairJson(model, raw, timeoutMs);
    return normalizeAnalysis(payload);
  } catch {
    return fallbackAnalysis();
  }
};
