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

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatToLocalISO (date: Date | string | number): string {
  const d = new Date(date);
  
  const tzOffset = d.getTimezoneOffset() * 60000; 
  const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, -1);
  
  return localISOTime;
};