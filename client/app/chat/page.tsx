"use client";

import ConfirmDialog from "@/components/ConfirmDialog";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import "webrtc-adapter";
import ChatInput from "./components/ChatInput";
import FirstVisitGuide from "./components/FirstVisitGuide";
// import Suggestions from "./components/Suggestions";
import { useInitChat } from "@/hooks/useInitChat";
import { useMessage } from "@/hooks/useMessage";
import { useRecordAudio } from "@/hooks/useRecordAudio";
import ChatMessages from "./components/ChatMessages";
import { AudioLines } from "lucide-react";

export default function ChatPage() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { showGuide, setShowGuide } = useInitChat();
  const {
    isListening,
    audioURL,
    startRecording,
    stopRecording,
    transcriptApi,
    setTranscriptApi,
    speak,
  } = useRecordAudio();

  const { messages, handleSendMessage, isProcessing, handleClearChat } =
    useMessage();

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
          {/* {currentSuggestions.length > 0 && !isProcessing && (
            <div className="p-1">
              <Suggestions
                suggestions={currentSuggestions}
                onSuggestionClick={handleSuggestionClick}
                isProcessing={isProcessing}
              />
            </div>
          )} */}
          {isListening ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-25"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400">
                  <AudioLines className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400">Listening...</p>
            </div>
          ) : (
            <>
              <ChatInput
                isListening={isListening}
                transcriptApi={transcriptApi}
                resetTranscript={() => {
                  setTranscriptApi("");
                }}
                onSend={(message, transcriptApi) =>
                  handleSendMessage(message, transcriptApi, speak)
                }
                isProcessing={isProcessing}
              />
            </>
          )}

          <div className="flex justify-between items-center gap-x-4">
            <button
              onClick={startRecording}
              disabled={isListening}
              className="font-semibold items-center w-full text-center space-x-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-200"
            >
              🎙️ Start Speaking
            </button>
            <button
              onClick={stopRecording}
              disabled={!isListening}
              className="font-semibold items-center w-full text-center space-x-2 px-6 py-2 rounded-lg bg-gradient-to-r bg-red-500 to-amber-400 hover:from-red-600 hover:to-amber-500 text-white transition-all duration-200"
            >
              🛑 Stop
            </button>
          </div>

          <p>Status: {isListening ? "🎤 Listening..." : "🛑 Not Listening"}</p>

          {audioURL && !isListening && (
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
    </div>
  );
}
