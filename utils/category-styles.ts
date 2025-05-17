/**
 * Utility functions for consistent category styling across the application
 */

// Common badge style classes for consistent sizing
const BADGE_BASE_STYLE = "text-sm px-3 py-1 flex items-center justify-center font-medium rounded-md"

export const CATEGORIES = ["Budget", "Meeting", "Finance", "Reporting", "Tax"] as const

export type TaskCategory = (typeof CATEGORIES)[number]

export const getCategoryStyle = (category: string): string => {
  switch (category) {
    case "Budget":
      return `bg-blue-100 text-blue-800 ${BADGE_BASE_STYLE}`
    case "Meeting":
      return `bg-purple-100 text-purple-800 ${BADGE_BASE_STYLE}`
    case "Finance":
      return `bg-green-100 text-green-800 ${BADGE_BASE_STYLE}`
    case "Reporting":
      return `bg-yellow-100 text-yellow-800 ${BADGE_BASE_STYLE}`
    case "Tax":
      return `bg-red-100 text-red-800 ${BADGE_BASE_STYLE}`
    default:
      return `bg-gray-100 text-gray-800 ${BADGE_BASE_STYLE}`
  }
}
