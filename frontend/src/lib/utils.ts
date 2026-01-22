import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null | undefined, currency = "EUR"): string {
  if (price === null || price === undefined) return "N/A";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getRarityColor(rarity: string): string {
  const rarityLower = rarity.toLowerCase();
  if (rarityLower.includes("secret")) return "text-purple-500";
  if (rarityLower.includes("ultimate")) return "text-gradient";
  if (rarityLower.includes("ultra")) return "text-yellow-500";
  if (rarityLower.includes("super")) return "text-cyan-400";
  if (rarityLower.includes("rare")) return "text-blue-500";
  return "text-gray-500";
}

export function getFrameColor(frameType: string): string {
  const frame = frameType.toLowerCase();
  if (frame.includes("xyz")) return "frame-xyz";
  if (frame.includes("synchro")) return "frame-synchro";
  if (frame.includes("fusion")) return "frame-fusion";
  if (frame.includes("ritual")) return "frame-ritual";
  if (frame.includes("link")) return "frame-link";
  if (frame.includes("spell")) return "frame-spell";
  if (frame.includes("trap")) return "frame-trap";
  if (frame.includes("effect")) return "frame-effect";
  return "frame-normal";
}

export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    MINT: "Mint (M)",
    NEAR_MINT: "Near Mint (NM)",
    EXCELLENT: "Excellent (EX)",
    GOOD: "Good (GD)",
    LIGHT_PLAYED: "Light Played (LP)",
    PLAYED: "Played (PL)",
    POOR: "Poor (P)",
  };
  return labels[condition] || condition;
}

export function getEditionLabel(edition: string): string {
  const labels: Record<string, string> = {
    FIRST_EDITION: "1st Edition",
    UNLIMITED: "Unlimited",
    LIMITED: "Limited",
  };
  return labels[edition] || edition;
}
