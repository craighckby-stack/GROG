/**
 * ARCHITECTURAL UTILITY HUB
 * Role: Provides core system utilities, including UI class management and diagnostic telemetry helpers.
 * Integration: Centralized utility layer for the entire application.
 * Siphoned Patterns: AI_Agent_OS (Diagnostic Engine Utilities).
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with conflict resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates an ISO 8601 formatted UTC timestamp with Z suffix.
 * Used for system telemetry and diagnostic logging.
 */
export function getSystemTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Computes summary metrics for diagnostic check results.
 * @param checks - Dictionary mapping check names to boolean results.
 * @returns Summary object with pass rates and health status.
 */
export function summarizeDiagnosticResults(checks: Record<string, boolean>) {
  const entries = Object.entries(checks);
  const total = entries.length;
  const passed = entries.filter(([_, status]) => status).length;
  const failed = total - passed;
  
  return {
    total,
    passed,
    failed,
    is_healthy: total > 0 && failed === 0,
    pass_rate: total > 0 ? parseFloat(((passed / total) * 100).toFixed(2)) : 0.0
  };
}

/**
 * Formats memory usage data for telemetry reporting.
 * Converts bytes to MB for human-readable diagnostic logs.
 */
export function formatMemoryUsage(usage: NodeJS.MemoryUsage) {
  return {
    rss_mb: (usage.rss / 1024 / 1024).toFixed(2),
    heap_used_mb: (usage.heapUsed / 1024 / 1024).toFixed(2),
    heap_total_mb: (usage.heapTotal / 1024 / 1024).toFixed(2),
  };
}

/**
 * Safely executes a function and returns a standardized result object.
 * Prevents unhandled exceptions from propagating through the diagnostic pipeline.
 * @param fn - The asynchronous or synchronous function to execute.
 */
export async function safeExecute<T>(fn: () => Promise<T> | T): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error: any) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Debounce utility for high-frequency event handling in UI components.
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}