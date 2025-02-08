import { apiRequest } from "@/lib/queryClient";

interface ChatGPTResponse {
  response: string;
}

export const chatGPTService = {
  // Funktion zum Abrufen der GPT-Antwort
  getGPTResponse: async (message: string): Promise<string> => {
    try {
      const response = await apiRequest("POST", "/api/natural-language", {
        message,
      });
      const data: ChatGPTResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error("Fehler beim Abrufen der GPT-Antwort:", error);
      throw error;
    }
  },
};
