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
 * @returns Object containing summary, explanation, and quiz questions
 */
export async function getPdfExplanation(selection: string): Promise<{
  summary: string;
  explanation: string;
  quiz: string[];
  error?: boolean;
}> {
  try {
    // Validate input length
    if (selection.length > 6000) {
      throw new Error("Selection too long");
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
          content: `Return JSON with keys summary, explanation, quiz (array of 3) for passage:
"""${selection}"""` 
        }
      ],
    });
    
    const content = response.choices[0]?.message.content || '{}';
    const parsedResponse = JSON.parse(content);
    
    return {
      summary: parsedResponse.summary || "",
      explanation: parsedResponse.explanation || "",
      quiz: Array.isArray(parsedResponse.quiz) ? parsedResponse.quiz : []
    };
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