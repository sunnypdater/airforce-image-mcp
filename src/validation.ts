export function validatePrompt(prompt: string): {
  valid: boolean;
  error?: string;
  warning?: string;
} {
  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, error: "Prompt cannot be empty" };
  }
  if (prompt.length > 4000) {
    return { valid: false, error: "Prompt exceeds 4000 character limit" };
  }
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(prompt)) {
    return { valid: false, error: "Prompt contains invalid control characters" };
  }
  return { valid: true };
}

export function validatePromptWithParams(
  prompt: string,
  n: number,
  resolution: string,
): { valid: boolean; error?: string; warning?: string } {
  const base = validatePrompt(prompt);
  if (!base.valid) return base;
  if (n === 4 && resolution === "4K") {
    return { valid: true, warning: "Generating 4 images at 4K may be slow and expensive" };
  }
  return { valid: true };
}
