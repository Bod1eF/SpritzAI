export function safelyParseGeminiJson(rawText) {
  const cleanedText = rawText
    .replace(/^.*```json/i, '')  // remove markdown start
    .replace(/```.*$/i, '')      // remove markdown end
    .replace(/^\[\d+\]\s?/gm, '') // remove `[1]` style line prefixes
    .trim();

  const isValid = (obj) =>
    obj &&
    typeof obj.name === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.copy === 'string'; // price/image can be null

  const tryParse = (text) => {
    try {
      const parsed = JSON.parse(text);
      const obj = Array.isArray(parsed) ? parsed[0] : parsed;
      return isValid(obj) ? obj : null;
    } catch {
      return null;
    }
  };

  // Strategy 1: Try raw cleaned parse
  let parsed = tryParse(cleanedText);
  if (parsed) return parsed;

  // Strategy 2: Extract first JSON object via regex
  const jsonMatch = cleanedText.match(/\{[\s\S]*?\}/);
  if (jsonMatch) {
    parsed = tryParse(jsonMatch[0]);
    if (parsed) return parsed;
  }

  // Strategy 3: Quoted JSON string
  try {
    const doubleParsed = JSON.parse(cleanedText);
    const obj = tryParse(doubleParsed);
    if (obj) return obj;
  } catch {}

  // Final fallback
  throw new Error('Failed to parse Gemini JSON from raw text.');
}
