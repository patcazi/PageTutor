import OpenAI from 'openai';

// NOTE: `dangerouslyAllowBrowser` is enabled only for local development.
// Do NOT ship this in production—move the call to a backend instead.
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Gets an explanation for a PDF selection
 * @param selection The text selection from the PDF
 * @param mode The type of response to generate
 * @returns Object containing the requested type of response based on mode
 */
export async function getPdfExplanation(
  selection: string,
  mode: "summary" | "analysis" | "quiz"
): Promise<{
  summary?: string;
  explanation?: string;
  quiz?: string[];
  error?: boolean;
}> {
  try {
    // Validate input length
    if (selection.length > 6000) {
      throw new Error("Selection too long");
    }
    
    let userPrompt = "";
    if (mode === "summary") {
      userPrompt = `Return JSON {summary} for passage: """${selection}"""`;
    } else if (mode === "analysis") {
      userPrompt = `Return JSON {explanation} (≤150 words) for passage: """${selection}"""`;
    } else {
      userPrompt = `Return JSON object { "quiz": [ five strings, each a multiple-choice question (A–D) ] } for passage: """${selection}"""`;
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are PageTutor AI, an educational assistant that analyzes text passages."
        },
        { 
          role: "user", 
          content: userPrompt
        }
      ],
    });
    
    const content = response.choices[0]?.message.content || '{}';
    const parsed = JSON.parse(content);
    
    if (mode === "summary") return { summary: parsed.summary };
    if (mode === "analysis") return { explanation: parsed.explanation };
    return { quiz: Array.isArray(parsed) ? parsed : (parsed.quiz || []) }; // mode === "quiz"
    
  } catch (error) {
    console.error("Error in getPdfExplanation:", error);
    return {
      summary: "",
      explanation: "",
      quiz: [],
      error: true
    };
  }
}

export default openai; 