import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract profile image URL from profileImage field
 * Handles both old string format and new object format
 */
export const getProfileImageUrl = (profileImage: string | { url: string; publicId: string; uploadedAt: Date } | null | undefined): string => {
  if (!profileImage) return '';
  
  // If it's already a string (old format), return as is
  if (typeof profileImage === 'string') return profileImage;
  
  // If it's an object with url property (new format), return the url
  if (typeof profileImage === 'object' && profileImage.url) return profileImage.url;
  
  // Fallback to empty string
  return '';
};
