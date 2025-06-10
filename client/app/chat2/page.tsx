"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserPreferences } from "@/lib/localStorage";
import { API_DOMAIN } from "@/lib/config";
import { Message, ChatResponse } from "../chat/types";
import Navbar from "@/components/Navbar";
import ConfirmDialog from "@/components/ConfirmDialog";
import ChatMessages from "../chat/components/ChatMessages";
import ChatInput from "../chat/components/ChatInput";
// import ChatControls from "../chat/components/ChatControls";
import FirstVisitGuide from "../chat/components/FirstVisitGuide";
import Suggestions from "../chat/components/Suggestions";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useSpeechSynthesis } from "react-speech-kit";
const VISITED_KEY = "has-visited-chat";
const CHAT_HISTORY_KEY = "chat-history";

export default function ChatPage2() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [hasRestoredMessages, setHasRestoredMessages] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initMessage, setInitMessage] = useState(true);
  // const [enableReasoning, setEnableReasoning] = useState(false);
  // const [enableSearching, setEnableSearching] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const preferences = getUserPreferences();
  const { speak, cancel } = useSpeechSynthesis();
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!preferences.hasCompletedOnboarding) {
      router.push("/");
      return;
    }

    const hasVisited = localStorage.getItem(VISITED_KEY);
    if (!hasVisited) {
      setShowGuide(true);
      localStorage.setItem(VISITED_KEY, "true");
    }

    // Load messages from localStorage
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
        const lastAiMessage = [...messagesWithDates]
          .reverse()
          .find((msg: Message) => msg.sender === "ai");
        if (lastAiMessage?.suggestions) {
          setCurrentSuggestions(lastAiMessage.suggestions);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    } else if (!hasRestoredMessages || initMessage) {
      setMessages([
        {
          id: "welcome",
          content: `Chào ${preferences.fullName}! Mình là Đạt đẹp troai, trợ lý ảo được thiết kế riêng để hỗ trợ bạn học tiếng Anh nè. 😊\n\nMình luôn cố gắng hỗ trợ bạn tốt nhất, nhưng đôi khi vẫn có thể mắc sai sót, nên bạn nhớ kiểm tra lại những thông tin quan trọng nha!`,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    }
    setHasRestoredMessages(true);
    setInitMessage(false);
  }, [
    router,
    preferences.hasCompletedOnboarding,
    hasRestoredMessages,
    preferences.fullName,
    initMessage,
  ]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (hasRestoredMessages) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }
  }, [messages, hasRestoredMessages]);

  useEffect(() => {
    // Cleanup object URLs when component unmounts
    return () => {
      messages.forEach((msg) => msg.images?.forEach(URL.revokeObjectURL));
    };
  }, [messages]);

  const handleClearChat = () => {
    setMessages([]);
    setCurrentSuggestions([]);
    setInitMessage(true);
  };

  const getImageUrls = (images: File[]): string[] => {
    return images.map((image) => URL.createObjectURL(image));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/heic",
      "image/heif",
    ];

    const validFiles = files.filter((file) => validTypes.includes(file.type));

    if (validFiles.length !== files.length) {
      alert("Chỉ chấp nhận các file ảnh định dạng PNG, JPG, JPEG, HEIC, HEIF");
      return;
    }

    // Filter out already selected images by comparing file names and sizes
    const newFiles = validFiles.filter(
      (newFile) =>
        !selectedImages.some(
          (existingFile) =>
            existingFile.name === newFile.name &&
            existingFile.size === newFile.size
        )
    );

    if (selectedImages.length + newFiles.length > 10) {
      alert("Chỉ được chọn tối đa 10 ảnh");
      return;
    }

    setSelectedImages((prev) => [...prev, ...newFiles]);
  };

  // const convertImagesToBase64 = async (images: File[]): Promise<string[]> => {
  //   const base64Promises = images.map((image) => {
  //     return new Promise<string>((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         if (typeof reader.result === "string") {
  //           resolve(reader.result);
  //         } else {
  //           reject(new Error("Failed to convert image to base64"));
  //         }
  //       };
  //       reader.onerror = reject;
  //       reader.readAsDataURL(image);
  //     });
  //   });
  //   return Promise.all(base64Promises);
  // };

  const handleSend = async (message = inputMessage) => {
    if ((!message.trim() && !transcript) || isProcessing) {
      return;
    }

    const imageUrls =
      selectedImages.length > 0 ? getImageUrls(selectedImages) : undefined;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message || transcript,
      sender: "user",
      timestamp: new Date(),
      images: imageUrls,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setCurrentSuggestions([]);
    setIsProcessing(true);

    resetTranscript();
    setAudioURL(null);
    try {
      // Format chat history for API
      // const chatHistory = messages.map((msg) => ({
      //   FromUser: msg.sender === "user",
      //   Message: msg.content,
      // }));

      // const imagesAsBase64 =
      //   selectedImages.length > 0
      //     ? await convertImagesToBase64(selectedImages)
      //     : undefined;

      // const requestData = {
      //   ChatHistory: [
      //     ...chatHistory,
      //     { FromUser: true, Message: message.trim() },
      //   ],
      //   Question: message.trim(),
      //   imagesAsBase64,
      // };

      const requestData = {
        message: message.trim() || transcript,
      };

      const headers: HeadersInit = {
        accept: "application/json",
        "Content-Type": "application/json",
      };

      if (preferences.geminiApiKey) {
        headers["Authentication"] = preferences.geminiApiKey;
      }

      // Construct URL with query parameters
      const url = new URL(`${API_DOMAIN}/api/chat`);
      // url.searchParams.append(
      //   "username",
      //   preferences.fullName?.trim() || "guest"
      // );
      // url.searchParams.append("gender", preferences.gender || "Unknown");
      // url.searchParams.append("age", (preferences.age || 16).toString());
      // url.searchParams.append(
      //   "englishLevel",
      //   (preferences.proficiencyLevel || 3).toString()
      // );
      // url.searchParams.append("enableReasoning", enableReasoning.toString());
      // url.searchParams.append("enableSearching", enableSearching.toString());

      setSelectedImages([]);

      // setEnableReasoning(false);
      // setEnableSearching(false);

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
      setCurrentSuggestions(aiResponse.Suggestions || []);
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
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(
        "Trình duyệt không hỗ trợ ghi âm (getUserMedia). Vui lòng dùng Chrome trên Android hoặc Safari mới nhất."
      );
      return;
    }
    cancel();
    resetTranscript();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = stream && new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
    };

    mediaRecorderRef.current.start();
    SpeechRecognition.startListening({ continuous: true });
  };

  // Dừng ghi âm
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    SpeechRecognition.stopListening();
  };

  useEffect(() => {
    if (!transcript) {
      setAudioURL(null);
    }
  }, [transcript]);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-purple-400 to-blue-600">
      <Navbar />

      <div className="container mx-auto px-2 pt-20 pb-4 h-screen flex flex-col max-w-5xl">
        <ChatMessages
          messages={messages}
          isProcessing={isProcessing}
          onClearChat={handleClearChat}
          isClearing={isClearing}
          onShowClearConfirm={() => setShowClearConfirm(true)}
        />

        <div className="bg-white dark:bg-slate-800 border border-t-0 border-slate-200 dark:border-slate-700 rounded-b-xl p-3 shadow-xl space-y-3">
          {/* Suggestions */}
          {currentSuggestions.length > 0 && !isProcessing && (
            <div className="p-1">
              <Suggestions
                suggestions={currentSuggestions}
                onSuggestionClick={handleSuggestionClick}
                isProcessing={isProcessing}
              />
            </div>
          )}

          <ChatInput
            inputMessage={inputMessage || transcript}
            // inputMessage={inputMessage}
            onInputChange={setInputMessage}
            resetTranscript={resetTranscript}
            onSend={() => handleSend()}
            isProcessing={isProcessing}
            selectedImages={selectedImages}
            onImageSelect={handleImageSelect}
            onRemoveImage={(index) =>
              setSelectedImages((prev) => prev.filter((_, i) => i !== index))
            }
          />
          {/* <ChatControls
            onImageClick={() => fileInputRef.current?.click()}
            enableReasoning={enableReasoning}
            onReasoningToggle={() => {
              setEnableReasoning(!enableReasoning);
              if (!enableReasoning) setEnableSearching(false);
            }}
            enableSearching={enableSearching}
            onSearchingToggle={() => {
              setEnableSearching(!enableSearching);
              if (!enableSearching) setEnableReasoning(false);
            }}
          /> */}
          {/* <button onClick={() => SpeechRecognition.startListening()}>
            🎙️ Speak
          </button> */}
          <div className="flex justify-between items-center gap-x-4">
            <button
              onClick={startRecording}
              disabled={listening}
              className="text-slate-600 dark:text-slate-400 flex items-center justify-center sm:space-x-2 rounded-lg px-3 py-1.5 transition-all dark:bg-slate-700 bg-slate-100 w-full"
            >
              🎙️ Start Speaking
            </button>
            <button
              onClick={stopRecording}
              disabled={!listening}
              className="text-slate-600 dark:text-slate-400 flex items-center justify-center sm:space-x-2 rounded-lg px-3 py-1.5 transition-all dark:bg-slate-700 bg-slate-100 w-full"
            >
              🛑 Stop
            </button>
          </div>

          <p>Status: {listening ? "🎤 Listening..." : "🛑 Not Listening"}</p>

          {audioURL && (
            <div style={{ marginTop: 10 }}>
              <strong>🔁 Your Voice:</strong>
              <audio controls src={audioURL}></audio>
            </div>
          )}
        </div>
      </div>

      {showGuide && <FirstVisitGuide onClose={() => setShowGuide(false)} />}

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          setIsClearing(true);
          handleClearChat();
          setIsClearing(false);
          setShowClearConfirm(false);
        }}
        title="Xóa lịch sử trò chuyện"
        message="Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện không? Hành động này không thể hoàn tác."
        confirmText="Xóa"
      />

      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageSelect}
      />
    </div>
  );
}
