
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";
import { Language } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    primaryGenre: { type: Type.STRING, description: "The core genre identified." },
    confidenceScore: { type: Type.NUMBER, description: "Confidence score 0-100." },
    subGenres: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          matchPercentage: { type: Type.NUMBER },
        },
        required: ["name", "matchPercentage"],
      },
    },
    moods: { type: Type.ARRAY, items: { type: Type.STRING } },
    instrumentation: { type: Type.ARRAY, items: { type: Type.STRING } },
    similarArtists: { type: Type.ARRAY, items: { type: Type.STRING } },
    description: { type: Type.STRING, description: "A technical musicological summary." },
    technicalDetails: {
      type: Type.OBJECT,
      properties: {
        bpmEstimate: { type: Type.STRING },
        keyEstimate: { type: Type.STRING },
        timeSignature: { type: Type.STRING },
      },
      required: ["bpmEstimate", "keyEstimate", "timeSignature"],
    },
    culturalContext: { type: Type.STRING, description: "Origins and era significance." },
  },
  required: [
    "primaryGenre",
    "confidenceScore",
    "subGenres",
    "moods",
    "instrumentation",
    "similarArtists",
    "description",
    "technicalDetails",
    "culturalContext"
  ],
};

const getSystemPrompt = (lang: Language) => {
  let targetLang = 'English';
  if (lang === 'th') targetLang = 'Thai';
  if (lang === 'php') targetLang = 'Filipino (Tagalog)';
  
  return `You are the core intelligence of Soundlytics, a professional-grade music analysis platform. 
   Your analysis must be precise, objective, and deeply musicological. Use standard industry terminology.
   IMPORTANT: You must provide all text fields (primaryGenre, moods, instrumentation, similarArtists, description, culturalContext, and subGenre names) in the following language: ${targetLang}.
   Technical fields like BPM and Key should remain in universal musical notation.`;
};

export const analyzeAudioContent = async (base64Audio: string, mimeType: string, lang: Language): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          {
            text: "Perform a deep technical analysis of this audio. Identify the precise genre, mood, instrumentation, and technical metadata like BPM and Key.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: getSystemPrompt(lang),
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("Analysis failed");
  } catch (error) {
    console.error("Soundlytics Analysis Error:", error);
    throw error;
  }
};

export const analyzeTextDescription = async (description: string, lang: Language): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            text: `Technical Query: "${description}". Extract musical DNA profile.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: getSystemPrompt(lang),
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("Analysis failed");
  } catch (error) {
    console.error("Soundlytics Text Error:", error);
    throw error;
  }
};
