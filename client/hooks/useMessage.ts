import { ChatResponse, Message } from "@/app/chat/types";
import { API_DOMAIN } from "@/lib/config";
import { CHAT_HISTORY_KEY } from "@/lib/constants";
import { clearHistoryMessage, getUserPreferences } from "@/lib/localStorage";
import { useCallback, useEffect, useState } from "react";
import { SpeakOptions } from "react-speech-kit";

export const useMessage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasRestoredMessages, setHasRestoredMessages] = useState(false);
  // const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const preferences = getUserPreferences();
  const [isProcessing, setIsProcessing] = useState(false);

  const loadInitMessage = useCallback(() => {
    const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
    if (savedMessages && !hasRestoredMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert string timestamps back to Date objects
        const messagesWithDates: Message[] = parsedMessages.map(
          (msg: Omit<Message, "timestamp"> & { timestamp: string }) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })
        );
        setMessages(messagesWithDates);
        // Set current suggestions if available from last AI message
        // const lastAiMessage = [...messagesWithDates]
        //   .reverse()
        //   .find((msg: Message) => msg.sender === "ai");
        // if (lastAiMessage?.suggestions) {
        //   setCurrentSuggestions(lastAiMessage.suggestions);
        // }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    } else if (!hasRestoredMessages) {
      setMessages([
        {
          id: "welcome",
          content: `Hello ${preferences.fullName}! My name is EngChat, virtual assistant designed specifically to help you learn English. 😊\n\nI always try my best to support you, but sometimes I still make mistakes, so remember to double check important information!`,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    }
    setHasRestoredMessages(true);
    // setInitMessage(false);
  }, [preferences]);

  useEffect(() => {
    loadInitMessage();
  }, []);

  useEffect(() => {
    if (hasRestoredMessages) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }
  }, [messages, hasRestoredMessages]);

  const handleClearChat = () => {
    setMessages([]);
    // setCurrentSuggestions([]);
    setHasRestoredMessages(false);
    clearHistoryMessage();
  };

  const handleSendMessage = useCallback(
    async (
      message: string,
      transcriptApi: string,
      speak: (options: SpeakOptions) => void
    ) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message || transcriptApi,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      // // setCurrentSuggestions([]);
      console.log("ok");
      try {
        const requestData = {
          message: message.trim() || transcriptApi,
        };

        const headers: HeadersInit = {
          accept: "application/json",
          "Content-Type": "application/json",
        };

        // Construct URL with query parameters
        const url = new URL(`${API_DOMAIN}/api/chat`);

        const response = await fetch(url.toString(), {
          method: "POST",
          headers,
          body: JSON.stringify({ message: requestData.message }),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const aiResponse: ChatResponse = await response.json();
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse.reply,
          sender: "ai",
          timestamp: new Date(),
          suggestions: aiResponse.Suggestions,
        };

        speak({ text: aiResponse.reply });

        setMessages((prev) => [...prev, aiMessage]);
        // setCurrentSuggestions(aiResponse.Suggestions || []);
      } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
          sender: "ai",
          timestamp: new Date(),
          images: undefined,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    messages,
    setMessages,
    handleClearChat,
    handleSendMessage,
    isProcessing,
    setIsProcessing,
  };
};
