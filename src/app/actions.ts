"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

interface SmartSearchInputs {
  query: string;
  tags: string[];
  categories: string[];
  years: string[];
}

export async function generateSmartSearch({ 
  query, 
  tags, 
  categories, 
  years 
}: SmartSearchInputs) {
  if (!query.trim()) return "";

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are a search query parser for a developer blog.
    Your goal is to translate a natural language user request into a specific filter syntax.

    CONTEXT DATA:
    - Valid Categories: ${JSON.stringify(categories)}
    - Valid Tags: ${JSON.stringify(tags)}
    - Valid Years: ${JSON.stringify(years)}
    - Valid Read Times: ["<5", "5-10", ">10"]

    OUTPUT SYNTAX RULES:
    - category:"Exact Category Name"
    - tag:"Exact Tag Name"
    - year:YYYY
    - readtime:<5 or 5-10 or >10
    - Any remaining text should be returned as plain keywords.
    - If a user mentions a synonym, map it to the closest valid tag/category.
    - Do NOT output markdown, explanations, or JSON. Just the query string.

    EXAMPLES:
    Input: "Show me bug bounty writeups from 2024"
    Output: category:"Bug Bounty" year:2024

    Input: "short react tutorials" (assuming "React" is in tags)
    Output: tag:"React" readtime:<5 tutorials

    USER REQUEST:
    "${query}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    return response.replaceAll(/```/g, '').trim();
  } catch (error) {
    console.error("AI Search Error:", error);
    return null;
  }
}

export async function explainCode(code: string, language: string) {
  if (!code.trim()) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert developer. 
      Explain the following ${language} code snippet clearly and concisely for a developer audience.
      
      - Focus on the logic, key functions, and security implications if any.
      - Be brief (max 3-4 sentences unless complex).
      - Use markdown for the explanation.

      CODE:
      \`\`\`${language}
      ${code}
      \`\`\`
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();

  } catch (error) {
    console.error("AI Explanation Error:", error);
    return null;
  }
}

export async function explainText(
  text: string, 
  postContext?: {
    title: string;
    category: string;
    tags: string[];
  }
) {
  if (!text.trim()) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const contextInfo = postContext 
      ? `
Context: This text is selected from a blog post titled "${postContext.title}" in the ${postContext.category} category (Tags: ${postContext.tags.join(", ")}).
      `
      : "";

    const prompt = `
You are an expert security researcher and technical writer.
${contextInfo}

Provide a brief, clear explanation of the selected text or concept.
- If it's a technical term, define it.
- If it's a sentence, clarify its meaning in the context of security/hacking.
- Keep it very concise (max 2-3 sentences).
- Use formatting like **bold** for key terms if needed.

SELECTED TEXT:
"${text}"
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();

  } catch (error) {
    console.error("AI Text Explanation Error:", error);
    return null;
  }
}
