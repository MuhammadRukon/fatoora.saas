import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(word: string): string {
  const firstLetter = word.charAt(0).toUpperCase();
  const rest = word.slice(1);
  return firstLetter + rest;
}
