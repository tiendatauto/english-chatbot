import { hasVisited } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useCheckOnboard } from "./useCheckOnboard";

export const useInitChat = () => {
  const [showGuide, setShowGuide] = useState(false);

  useCheckOnboard();

  useEffect(() => {
    if (!hasVisited()) {
      setShowGuide(true);
    }
  }, []);

  return {
    showGuide,
    setShowGuide,
  };
};
