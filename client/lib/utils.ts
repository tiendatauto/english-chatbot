import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { VISITED_KEY } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasVisited = () => {
  const hasVisited = localStorage.getItem(VISITED_KEY);
  if (!hasVisited) {
    localStorage.setItem(VISITED_KEY, "true");
  }
  return hasVisited;
};
