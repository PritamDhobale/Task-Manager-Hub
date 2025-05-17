/**
 * Utility functions for consistent badge styling across the application
 */

// Common badge style classes for consistent sizing
const BADGE_BASE_STYLE = "text-sm px-3 py-1 flex items-center justify-center font-medium rounded-md"

export const getPriorityBadgeStyle = (priority: string): string => {
  switch (priority) {
    case "High":
      return `bg-[#b45e08] text-white ${BADGE_BASE_STYLE}`
    case "Mid":
    case "Medium":
      return `bg-[#F68C1F] text-white ${BADGE_BASE_STYLE}`
    case "Low":
      return `bg-[#FAC086] text-black ${BADGE_BASE_STYLE}` // Black text for better contrast
    default:
      return `bg-[#A5A5A5] text-white ${BADGE_BASE_STYLE}`
  }
}

export const getStatusBadgeStyle = (status: string): string => {
  switch (status) {
    case "Completed":
      return `bg-[#476E2C] text-white ${BADGE_BASE_STYLE}`
    case "In Progress":
      return `bg-[#8BC53D] text-black ${BADGE_BASE_STYLE}` // Green bg + black text
    case "Not Started":
    case "Pending": // Backward support
      return `bg-[#C9E4A4] text-black ${BADGE_BASE_STYLE}`
    case "Deleted":
      return `bg-[#C62026] text-white ${BADGE_BASE_STYLE}`
    default:
      return `bg-[#A5A5A5] text-white ${BADGE_BASE_STYLE}`
  }
}
