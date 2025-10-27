import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generic action result type for server actions
 */
export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Helper to create a successful action result
 */
export function createSuccessResult<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

/**
 * Helper to create an error result
 */
export function createErrorResult<T = unknown>(error: string): ActionResult<T> {
  return { success: false, error }
}

/**
 * Handles server action errors consistently
 */
export function handleServerError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}
