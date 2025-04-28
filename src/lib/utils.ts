import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateString(string: string, number: number) {
  if (string.length > number) {
    return string.slice(0, number) + "...";
  }
  return string;
}
