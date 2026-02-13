
import { GoogleGenAI, Type } from "@google/genai";
import { 
  PromptResponse, 
  PromptRequestConfig, 
  DevAgentRequestConfig, 
  DevAgentResponse, 
  SentinelRequestConfig, 
  SentinelResponse,
  TestSuiteRequestConfig,
  TestSuiteResponse,
  N8nAgentRequestConfig,
  N8nAgentResponse,
  PerplexityRequestConfig,
  PerplexityResponse,
  ImagePromptRequestConfig,
  ImagePromptResponse,
  VideoPromptRequestConfig,
  VideoPromptResponse,
  AppSettings
} from "../types";

// --- Configuration State ---
// Default to gemini-3-pro-preview for complex reasoning tasks like prompt engineering and code generation.
let currentSettings: AppSettings = {
  provider: 'GEMINI',
  model: 'gemini-3-pro-preview',
};

export const updateAISettings = (settings: AppSettings) => {
  currentSettings = settings;
};

export const getAISettings = () => currentSettings;

// --- Helper: Clean JSON from Markdown ---
const cleanJsonOutput = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      cleaned = match[1];
    }
  }
  return cleaned;
};

// --- Universal AI Caller ---
const generateContentUniversal = async (
  systemPrompt: string, 
  userPrompt: string, 
  jsonSchema?: any,
  imagePart?: { mimeType: string; data: string },
  signal?: AbortSignal
): Promise<string> => {
  
  if (currentSettings.provider === 'GEMINI') {
    // Initializing GoogleGenAI client with apiKey obtained from environment variables.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [];
    if (imagePart) {
      parts.push({ inlineData: imagePart });
    }
    parts.push({ text: systemPrompt + "\n\n" + userPrompt });

    const config: any = { responseMimeType: "application/json" };
    if (jsonSchema) {
      config.responseSchema = jsonSchema;
    }

    // Using ai.models.generateContent to query GenAI with model name and prompt.
    const promise = ai.models.generateContent({
      model: currentSettings.model,
      contents: { parts },
      config: config
    });

    if (signal) {
      const abortPromise = new Promise<never>((_, reject) => {
        signal.addEventListener('abort', () => reject(new Error('Aborted')), { once: true });
      });
      const response = await Promise.race([promise, abortPromise]);
      // Accessing the .text property of GenerateContentResponse to get the output string.
      return (response as any).text || "";
    }
    
    const response = await promise;
    // Accessing the .text property of GenerateContentResponse to get the output string.
    return response.text || "";
  }

  if (['OPENAI', 'CUSTOM', 'OLLAMA', 'LM_STUDIO'].includes(currentSettings.provider)) {
    let baseUrl = currentSettings.baseUrl;
    if (!baseUrl) {
      if (currentSettings.provider === 'OPENAI') baseUrl = "https://api.openai.com/v1";
      if (currentSettings.provider === 'OLLAMA') baseUrl = "http://localhost:11434/v1";
      if (currentSettings.provider === 'LM_STUDIO') baseUrl = "http://localhost:1234/v1";
      if (currentSettings.provider === 'CUSTOM') baseUrl = "http://localhost:11434/v1";
    }

    const apiKey = currentSettings.apiKey || "lm-studio";
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    if (imagePart) {
       messages[1].content = [
         { type: "text", text: userPrompt },
         { type: "image_url", image_url: { url: `data:${imagePart.mimeType};base64,${imagePart.data}` } }
       ] as any;
    }

    const payload: any = {
      model: currentSettings.model,
      messages: messages,
      temperature: 0.7,
      stream: false,
    };

    if (jsonSchema && (currentSettings.provider === 'OPENAI' || currentSettings.model.includes('gpt'))) {
      payload.response_format = { type: "json_object" };
    }

    const cleanBaseUrl = baseUrl?.replace(/\/+$/, '');
    
    try {
      const response = await fetch(`${cleanBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload),
        signal
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error ${response.status}: ${err}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (error) {
       if (error instanceof TypeError && (error as any).name === 'AbortError') {
         throw new Error('Aborted');
       }
       if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
         throw new Error(`Connection failed. Ensure ${currentSettings.provider} is running at ${cleanBaseUrl} and CORS is enabled.`);
       }
       throw error;
    }
  }

  if (currentSettings.provider === 'ANTHROPIC') {
    const baseUrl = "https://api.anthropic.com/v1";
    const apiKey = currentSettings.apiKey || "";

    const payload: any = {
      model: currentSettings.model,
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt }
      ],
      max_tokens: 4096,
      temperature: 0.7,
    };

    if (imagePart) {
      payload.messages[0].content = [
        { type: "image", source: { type: "base64", media_type: imagePart.mimeType, data: imagePart.data } },
        { type: "text", text: userPrompt }
      ];
    }

    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload),
      signal
    });

    if (!response.ok) {
       const err = await response.text();
       throw new Error(`Anthropic API Error ${response.status}: ${err}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || "";
  }

  throw new Error(`Provider ${currentSettings.provider} not implemented`);
};


// --- Feature: Prompt Architect ---
export const generateOptimizedPrompts = async (config: PromptRequestConfig, signal?: AbortSignal): Promise<PromptResponse> => {
  const targetLanguage = config.language || "English";
  const systemInstruction = `
    You are an expert Prompt Engineer and LLM Architect. 
    Your task is to take a raw topic or idea from a user and generate three distinct, highly optimized system prompts tailored for three specific AI models: Google Gemini, OpenAI (GPT models), and Anthropic Claude.
    
    IMPORTANT: Return the result as a strict JSON object with no markdown formatting.
    The structure must be:
    {
      "originalTopic": "string",
      "prompts": [
        { "modelName": "GEMINI", "promptContent": "...", "explanation": "...", "tips": ["..."] },
        { "modelName": "OPENAI", "promptContent": "...", "explanation": "...", "tips": ["..."] },
        { "modelName": "CLAUDE", "promptContent": "...", "explanation": "...", "tips": ["..."] }
      ]
    }
  `;

  const userPrompt = `
    Topic: "${config.topic}".
    Desired Tone: ${config.tone || "Professional and Precise"}.
    Complexity Level: ${config.complexity || "Advanced"}.
    Target Language: ${targetLanguage}.
  `;

  const schema = {
      type: Type.OBJECT,
      properties: {
        originalTopic: { type: Type.STRING },
        prompts: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              modelName: { type: Type.STRING },
              promptContent: { type: Type.STRING },
              explanation: { type: Type.STRING },
              tips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["modelName", "promptContent", "explanation", "tips"]
          }
        }
      },
      required: ["originalTopic", "prompts"]
  };

  try {
    const jsonText = await generateContentUniversal(systemInstruction, userPrompt, schema, undefined, signal);
    return JSON.parse(cleanJsonOutput(jsonText)) as PromptResponse;
  } catch (error) {
    if ((error as Error).message === 'Aborted') throw error;
    console.error("Error generating prompts:", error);
    throw error;
  }
};

// --- Feature: DevAgent Scripter ---
export const generateDevAgentPrompt = async (config: DevAgentRequestConfig, signal?: AbortSignal): Promise<DevAgentResponse> => {
  const targetLanguage = config.language || "English";
  const systemInstruction = `
    You are a Staff Software Engineer optimizing workflows for AI Coding Agents.
    Return a strict JSON object with keys: agentPrompt, setupInstructions, explanation.
  `;
  const userPrompt = `
    Task: "${config.taskType}".
    Tech Stack: ${config.techStack}.
    Description: "${config.description}".
    Context: "${config.context.slice(0, 2000)}..."
    Target Language: ${targetLanguage}.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      agentPrompt: { type: Type.STRING },
      setupInstructions: { type: Type.STRING },
      explanation: { type: Type.STRING }
    },
    required: ["agentPrompt", "setupInstructions", "explanation"]
  };

  try {
    const jsonText = await generateContentUniversal(systemInstruction, userPrompt, schema, undefined, signal);
    return JSON.parse(cleanJsonOutput(jsonText)) as DevAgentResponse;
  } catch (error) {
    if ((error as Error).message === 'Aborted') throw error;
    console.error("Error generating dev agent prompt:", error);
    throw error;
  }
};

export const detectTechStack = async (context: string, description: string): Promise<string> => {
  const prompt = `
    Analyze the following code context and task description to identify the technology stack.
    Context: "${context.slice(0, 1000)}"
    Description: "${description.slice(0, 500)}"
    Return ONLY a concise, comma-separated list of technologies. No other text.
  `;

  try {
    if (!context && !description) return "";
    const text = await generateContentUniversal("You are a tech stack detector.", prompt);
    return text.trim();
  } catch (error) {
    console.error("Error detecting tech stack:", error);
    return "";
  }
};

// --- Feature: Prompt Sentinel (Security Checker) ---
export const runSentinelAudit = async (config: SentinelRequestConfig, signal?: AbortSignal): Promise<SentinelResponse> => {
  const targetLanguage = config.language || "English";
  const systemInstruction = `
    You are a Senior Security Auditor for Large Language Models. 
    Your goal is to conduct an adversarial "Red Team" audit of a given prompt or logic.
    Generate a JSON report with a summary and a list of specific security scenarios.
  `;
  const userPrompt = `
    Prompt to Audit: "${config.promptOrLogic}"
    Focus Area: ${config.focusArea || "security"}.
    Language: ${targetLanguage}.
    Generate 6 diverse security scenarios, specifically looking for injection vulnerabilities, jailbreaks, and logic bypasses.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      scenarios: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            input: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            expectedBehavior: { type: Type.STRING }
          },
          required: ["type", "input", "reasoning", "expectedBehavior"]
        }
      }
    },
    required: ["summary", "scenarios"]
  };

  try {
    const jsonText = await generateContentUniversal(systemInstruction, userPrompt, schema, undefined, signal);
    return JSON.parse(cleanJsonOutput(jsonText)) as SentinelResponse;
  } catch (error) {
    if ((error as Error).message === 'Aborted') throw error;
    console.error("Error running sentinel audit:", error);
    throw error;
  }
};

// Fix for TestSuiteGenerator.tsx: Export generateTestSuite which uses the same logic as sentinel audit.
export const generateTestSuite = async (config: TestSuiteRequestConfig, signal?: AbortSignal): Promise<TestSuiteResponse> => {
  return runSentinelAudit(config, signal);
};

// --- Feature: N8n Architect ---
export const generateN8nAgentPrompt = async (config: N8nAgentRequestConfig, signal?: AbortSignal): Promise<N8nAgentResponse> => {
  const targetLanguage = config.language || "English";
  
  let imagePart;
  if (config.imageBase64) {
    const base64Data = config.imageBase64.includes('base64,') 
      ? config.imageBase64.split('base64,')[1] 
      : config.imageBase64;
    imagePart = { mimeType: "image/png", data: base64Data };
  }

  const systemInstruction = `You are an n8n Workflow Architect. Create a System Prompt and Tool Definitions for an 'AI Agent' node. Return strict JSON.`;
  const userPrompt = `
    User Description: "${config.description}"
    Target Language: ${targetLanguage}.
    Return strict JSON: { "systemPrompt": "...", "toolDefinitions": "...", "workflowAnalysis": "..." }
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      systemPrompt: { type: Type.STRING },
      toolDefinitions: { type: Type.STRING },
      workflowAnalysis: { type: Type.STRING }
    },
    required: ["systemPrompt", "toolDefinitions", "workflowAnalysis"]
  };

  try {
    const jsonText = await generateContentUniversal(systemInstruction, userPrompt, schema, imagePart, signal);
    return JSON.parse(cleanJsonOutput(jsonText)) as N8nAgentResponse;
  } catch (error) {
    if ((error as Error).message === 'Aborted') throw error;
    console.error("Error generating n8n prompt:", error);
    throw error;
  }
};

// --- Feature: Perplexity Architect ---
export const generatePerplexityPrompt = async (config: PerplexityRequestConfig, signal?: AbortSignal): Promise<PerplexityResponse> => {
  const targetLanguage = config.language || "English";
  const systemInstruction = `
    You are an expert at prompting Perplexity AI. 
    Create a prompt that forces Perplexity to use specific search operators and citation styles.
    Return strict JSON.
  `;

  const userPrompt = `
    Query: "${config.query}"
    Focus Mode: ${config.focusMode}.
    Format: ${config.focusMode}.
    Audience: ${config.audience}.
    Language: ${targetLanguage}.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      optimizedPrompt: { type: Type.STRING },
      searchOperators: { type: Type.ARRAY, items: { type: Type.STRING } },
      explanation: { type: Type.STRING }
    },
    required: ["optimizedPrompt", "searchOperators", "explanation"]
  };

  try {
    const jsonText = await generateContentUniversal(systemInstruction, userPrompt, schema, undefined, signal);
    return JSON.parse(cleanJsonOutput(jsonText)) as PerplexityResponse;
  } catch (error) {
    if ((error as Error).message === 'Aborted') throw error;
    console.error("Error generating perplexity prompt:", error);
    throw error;
  }
};

// --- Feature: Image Prompt Generator ---
export const generateImagePrompt = async (config: ImagePromptRequestConfig, signal?: AbortSignal): Promise<ImagePromptResponse> => {
  const targetLanguage = config.language || "English";
  const systemInstruction = `
    You are an expert Digital Art Director and Prompt Engineer for Midjourney, DALL-E 3, and Stable Diffusion.
    Create highly detailed, stylized prompts optimized for each model's specific syntax (e.g., --ar for Midjourney, negative prompts for SD).
    Return strict JSON.
  `;

  const userPrompt = `
    Subject: "${config.description}"
    Art Style: "${config.artStyle}"
    Mood/Lighting: "${config.mood}"
    Aspect Ratio: "${config.aspectRatio}"
    Language: ${targetLanguage} (Translate prompts to English if needed for models, but keep explanation in target language).
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      midjourneyPrompt: { type: Type.STRING },
      dallePrompt: { type: Type.STRING },
      stableDiffusionPrompt: { type: Type.STRING },
      negativePrompt: { type: Type.STRING },
      parameterTips: { type: Type.STRING }
    },
    required: ["midjourneyPrompt", "dallePrompt", "stableDiffusionPrompt", "negativePrompt", "parameterTips"]
  };

  try {
    const jsonText = await generateContentUniversal(systemInstruction, userPrompt, schema, undefined, signal);
    return JSON.parse(cleanJsonOutput(jsonText)) as ImagePromptResponse;
  } catch (error) {
    if ((error as Error).message === 'Aborted') throw error;
    console.error("Error generating image prompt:", error);
    throw error;
  }
};

// --- Feature: Video Prompt Generator ---
export const generateVideoPrompt = async (config: VideoPromptRequestConfig, signal?: AbortSignal): Promise<VideoPromptResponse> => {
  const targetLanguage = config.language || "English";
  const systemInstruction = `
    You are an expert Video Production Prompter for AI models like Runway Gen-2, Pika Labs, and OpenAI Sora.
    Focus on describing motion, camera angles (pan, zoom, tilt), and temporal consistency.
    Return strict JSON.
  `;

  const userPrompt = `
    Scene Description: "${config.description}"
    Motion Level: ${config.motionLevel}
    Camera Movement: ${config.cameraMovement}
    Duration: ${config.duration}
    Language: ${targetLanguage}.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      runwayPrompt: { type: Type.STRING },
      pikaPrompt: { type: Type.STRING },
      soraPrompt: { type: Type.STRING },
      technicalSettings: {
        type: Type.OBJECT,
        properties: {
          cameraControl: { type: Type.STRING },
          motionBucket: { type: Type.STRING },
          fps: { type: Type.STRING }
        },
        required: ["cameraControl", "motionBucket", "fps"]
      }
    },
    required: ["runwayPrompt", "pikaPrompt", "soraPrompt", "technicalSettings"]
  };

  try {
    const jsonText = await generateContentUniversal(systemInstruction, userPrompt, schema, undefined, signal);
    return JSON.parse(cleanJsonOutput(jsonText)) as VideoPromptResponse;
  } catch (error) {
    if ((error as Error).message === 'Aborted') throw error;
    console.error("Error generating video prompt:", error);
    throw error;
  }
};
