import { API_DOMAIN } from "@/lib/config";
import { useEffect, useRef, useState } from "react";
import { useSpeechSynthesis } from "react-speech-kit";
import SpeechRecognition from "react-speech-recognition";

export const useRecordAudio = () => {
  const { speak, cancel } = useSpeechSynthesis();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [transcriptApi, setTranscriptApi] = useState("");
  const [isListening, setIsListening] = useState(false);

  const startRecording = async () => {
    setIsListening(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(
          "Trình duyệt không hỗ trợ ghi âm (getUserMedia). Vui lòng dùng Chrome trên Android hoặc Safari mới nhất."
        );
        return;
      }
      cancel();
      // resetTranscript();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current =
        stream &&
        new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        const urlApi = new URL(`${API_DOMAIN}/api/chat/whisper`);

        const formData = new FormData();
        formData.append("file", audioBlob, "speech.webm");
        const res = await fetch(urlApi.toString(), {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        setTranscriptApi(data.transcript);
        if (data) {
          setIsListening(false);
        }
      };

      mediaRecorderRef.current.start();
      SpeechRecognition.startListening({ continuous: true });
    } catch (error) {
      console.log("error", error);
    }
  };

  // Dừng ghi âm
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    SpeechRecognition.stopListening();
  };

  useEffect(() => {
    if (!transcriptApi) {
      setAudioURL(null);
    }
  }, [transcriptApi]);

  return {
    audioURL,
    setAudioURL,
    speak,
    cancel,
    isListening,
    startRecording,
    stopRecording,
    transcriptApi,
    setTranscriptApi,
  };
};
