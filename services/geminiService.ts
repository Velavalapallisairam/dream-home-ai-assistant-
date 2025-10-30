
import { GoogleGenAI, GenerateContentResponse, Modality, Chat, ChatMessage, Type } from '@google/genai';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
  const imagePart = fileToGenerativePart(imageBase64, mimeType);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{text: prompt}, imagePart]},
  });
  return response.text;
};

export const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }
    throw new Error('Image generation failed.');
};


export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    const imagePart = fileToGenerativePart(imageBase64, mimeType);
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [imagePart, { text: prompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const firstPart = response.candidates?.[0]?.content?.parts[0];
    if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
        return firstPart.inlineData.data;
    }
    throw new Error('Image editing failed or returned no image.');
};


let chatInstance: Chat | null = null;

const getChatInstance = () => {
  if (!chatInstance) {
    chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
    });
  }
  return chatInstance;
};

// FIX: Refactored to correctly handle chat history, fixing a bug where user messages were duplicated and improving model interaction by using structured history.
export const streamChatResponse = async (
  history: ChatMessage[],
  useThinkingMode: boolean,
  onChunk: (text: string) => void
): Promise<void> => {
    
    const model = useThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const config = useThinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {};
    
    // For complex queries with thinking mode, we don't use the chat session
    if (useThinkingMode) {
        const response = await ai.models.generateContentStream({
            model: model,
            contents: history,
            config: config,
        });
        for await (const chunk of response) {
            onChunk(chunk.text);
        }
    } else {
        const chat = getChatInstance();
        // When using a chat session, the history should not contain the last user message,
        // as it's sent via sendMessageStream.
        const lastMessage = history[history.length - 1];
        const chatHistory = history.slice(0, -1);
        chat.history = chatHistory;
        const responseStream = await chat.sendMessageStream({ message: lastMessage.parts[0].text });
        for await (const chunk of responseStream) {
            onChunk(chunk.text);
        }
    }
};
