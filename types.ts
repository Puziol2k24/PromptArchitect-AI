
export type AIModelType = 'GEMINI' | 'OPENAI' | 'CLAUDE';
export type AIProvider = 'GEMINI' | 'OPENAI' | 'ANTHROPIC' | 'OLLAMA' | 'LM_STUDIO' | 'CUSTOM';

export interface AppSettings {
  provider: AIProvider;
  apiKey?: string; // Optional for Gemini (uses env), required for others
  baseUrl?: string; // For Custom/OpenAI/Ollama
  model: string;
}

// --- Prompt Architect Types ---
export interface GeneratedPrompt {
  modelName: AIModelType;
  promptContent: string;
  explanation: string;
  tips: string[];
}

export interface PromptResponse {
  originalTopic: string;
  prompts: GeneratedPrompt[];
}

export interface PromptRequestConfig {
  topic: string;
  tone?: string;
  complexity?: 'basic' | 'intermediate' | 'advanced';
  language?: string;
}

// --- DevAgent Scripter Types ---
export interface DevAgentRequestConfig {
  taskType: 'BUG_FIX' | 'FEATURE' | 'REFACTOR' | 'TESTS';
  techStack: string;
  context: string; // The code snippet or error log
  description: string; // What the user wants to do
  language?: string;
}

export interface DevAgentResponse {
  agentPrompt: string; // The text to paste into Cursor/Copilot
  setupInstructions: string; // "Open file X, reference Y"
  explanation: string;
}

// --- Prompt Sentinel Types ---
export interface SecurityScenario {
  type: 'Happy Path' | 'Edge Case' | 'Adversarial/Injection' | 'Formatting' | 'Ambiguity';
  input: string;
  reasoning: string;
  expectedBehavior: string;
}

export interface SentinelResponse {
  summary: string;
  scenarios: SecurityScenario[];
}

export interface SentinelRequestConfig {
  promptOrLogic: string; 
  focusArea?: 'robustness' | 'security' | 'logic' | 'formatting';
  language?: string;
}

// --- Test Suite Generator Types (Supporting components/TestSuiteGenerator.tsx) ---
export type TestSuiteResponse = SentinelResponse;
export type TestSuiteRequestConfig = SentinelRequestConfig;

// --- N8n Agent Types ---
export interface N8nAgentRequestConfig {
  description: string;
  imageBase64?: string; // Optional screenshot of the workflow
  language?: string;
}

export interface N8nAgentResponse {
  systemPrompt: string; // The main prompt for the AI Agent node
  toolDefinitions: string; // JSON/JS structure for the tools connected
  workflowAnalysis: string; // Explanation of what the AI sees in the workflow
}

// --- Perplexity Architect Types ---
export interface PerplexityRequestConfig {
  query: string;
  focusMode: 'ALL' | 'ACADEMIC' | 'WRITING' | 'YOUTUBE' | 'REDDIT';
  responseFormat: 'CONCISE' | 'DETAILED' | 'TABLE' | 'COMPARISON';
  audience: string;
  language?: string;
}

export interface PerplexityResponse {
  optimizedPrompt: string;
  searchOperators: string[]; // e.g. "site:gov", "after:2023"
  explanation: string;
}
