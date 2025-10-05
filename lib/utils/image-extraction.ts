/**
 * Utility functions for extracting and processing images from markdown text
 */

export interface ExtractedImage {
  url: string;
  alt?: string;
  originalMarkdown: string;
}

/**
 * Extract image URLs from markdown text
 * Handles both standard markdown syntax and malformed syntax like "!(url)"
 */
export function extractImagesFromMarkdown(text: string): ExtractedImage[] {
  if (!text) return [];

  const images: ExtractedImage[] = [];
  
  // Pattern 1: Standard markdown syntax ![alt](url)
  const standardPattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = standardPattern.exec(text)) !== null) {
    images.push({
      url: match[2],
      alt: match[1] || undefined,
      originalMarkdown: match[0]
    });
  }
  
  // Pattern 2: Malformed syntax !(url) - common in ENEM questions
  const malformedPattern = /!\(([^)]+)\)/g;
  
  while ((match = malformedPattern.exec(text)) !== null) {
    images.push({
      url: match[1],
      alt: undefined,
      originalMarkdown: match[0]
    });
  }
  
  // Pattern 3: Direct image URLs (png, jpg, jpeg, gif, bmp, webp, svg)
  const urlPattern = /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|bmp|webp|svg)(?:\?[^\s]*)?)/gi;
  
  while ((match = urlPattern.exec(text)) !== null) {
    // Only add if not already captured by markdown patterns
    const alreadyCaptured = images.some(img => img.url === match[1]);
    if (!alreadyCaptured) {
      images.push({
        url: match[1],
        alt: undefined,
        originalMarkdown: match[1]
      });
    }
  }
  
  return images;
}

/**
 * Remove image markdown from text, leaving clean text
 */
export function removeImageMarkdown(text: string): string {
  if (!text) return text;
  
  let cleanText = text;
  
  // Remove standard markdown images ![alt](url)
  cleanText = cleanText.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '');
  
  // Remove malformed syntax !(url)
  cleanText = cleanText.replace(/!\(([^)]+)\)/g, '');
  
  // Remove standalone image URLs (be more conservative here)
  cleanText = cleanText.replace(/(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|bmp|webp|svg)(?:\?[^\s]*)?)/gi, '');
  
  // Clean up extra whitespace
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  return cleanText;
}

/**
 * Process text to separate images from content
 */
export function processTextWithImages(text: string): {
  cleanText: string;
  images: ExtractedImage[];
} {
  const images = extractImagesFromMarkdown(text);
  const cleanText = removeImageMarkdown(text);
  
  return {
    cleanText,
    images
  };
}
