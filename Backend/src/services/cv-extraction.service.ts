import path from "path";

const mammoth = require("mammoth") as {
  extractRawText: (input: { buffer: Buffer }) => Promise<{ value: string }>;
};

export const MAX_CV_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const isSupportedCvFile = (file: Express.Multer.File): boolean => {
  const mime = (file.mimetype || "").toLowerCase();
  const ext = path.extname(file.originalname || "").toLowerCase();

  return (
    SUPPORTED_MIME_TYPES.includes(mime) ||
    ext === ".pdf" ||
    ext === ".docx"
  );
};

export const isPdfCvFile = (file: Express.Multer.File): boolean => {
  const mime = (file.mimetype || "").toLowerCase();
  const ext = path.extname(file.originalname || "").toLowerCase();
  return mime === "application/pdf" || ext === ".pdf";
};

const cleanText = (raw: string): string => {
  return raw
    .replace(/\u0000/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const extractCvText = async (
  file: Express.Multer.File,
): Promise<string> => {
  const mime = (file.mimetype || "").toLowerCase();
  const ext = path.extname(file.originalname || "").toLowerCase();

  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx"
  ) {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    return cleanText(parsed.value || "");
  }

  throw new Error("Only DOCX text extraction is supported in this step.");
};
