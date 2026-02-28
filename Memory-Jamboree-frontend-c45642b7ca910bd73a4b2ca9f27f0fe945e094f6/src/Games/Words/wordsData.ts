// wordsData.ts

import { API_BASE_URL } from "../../lib/client";

export async function generateWordsData(level: string, count: number = 300): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/words?level=${level}&count=${count}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("auth_token") || ""}`,
          "Accept": "application/json",   
          "Content-Type": "application/json",
        },
      }

    );
    if (!response.ok) throw new Error("Failed to fetch words");

    const data = await response.json();
    return data.words || [];
  } catch (error) {
    console.error("Error fetching words:", error);
    return [];
  }
}
export async function getWordsData(level: string, count: number = 300): Promise<string[]> {
  const words = await generateWordsData(level, count);
  return words;
}