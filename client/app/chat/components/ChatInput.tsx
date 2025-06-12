import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCallback, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string, transcriptApi: string) => Promise<void>;
  isProcessing: boolean;
  resetTranscript?: () => void;
  isListening: boolean;
  transcriptApi: string;
}

export default function ChatInput({
  // inputMessage = "",
  onSend,
  isProcessing,
  resetTranscript,
  transcriptApi,
  isListening,
}: ChatInputProps) {
  const { register, handleSubmit, watch, reset, setValue } = useForm<{
    message: string;
  }>({
    defaultValues: { message: "" },
  });

  const message = watch("message");

  const handleFormSubmit = useCallback(() => {
    if ((!message.trim() && !transcriptApi) || isListening) return;
    onSend(message, transcriptApi);
    reset({ message: "" });
    resetTranscript?.();
  }, [transcriptApi, message]);

  useEffect(() => {
    if (transcriptApi) {
      setValue("message", transcriptApi);
    }
  }, [transcriptApi]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <div className="flex items-center space-x-2">
        <textarea
          {...register("message")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleFormSubmit();
            }
          }}
          placeholder={
            isListening ? "Listening..." : "Shift + Enter để xuống dòng"
          }
          disabled={isProcessing}
          className="text-sm xs:text-xs flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 max-h-32"
        />

        <button
          type="submit"
          disabled={isProcessing || !message.trim()}
          className={`rounded-lg p-2.5 text-white transition-all duration-200 ${
            isProcessing || !message.trim()
              ? "bg-slate-400 cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-orange-700 to-amber-600 hover:from-orange-700 hover:to-amber-700"
          }`}
        >
          <Send className={`h-5 w-5 ${isProcessing ? "opacity-50" : ""}`} />
        </button>
      </div>
    </form>
  );
}
