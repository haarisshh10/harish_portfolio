import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Conditional class names with Tailwind conflict resolution. Standard shadcn /
 * Lightswind utility.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
