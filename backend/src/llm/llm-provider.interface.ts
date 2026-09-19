export interface LlmProvider {
  readonly name: string;
  generateJson(systemPrompt: string, userPrompt: string): Promise<string>;
}
