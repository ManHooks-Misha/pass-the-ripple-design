// utils/textUtils.ts
export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  
  // Server-safe HTML tag removal using regex
  // Note: Regex is not perfect for HTML parsing but works for simple cases
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

export const getPlainText = (html: string, maxLength?: number): string => {
  let plainText = stripHtmlTags(html);
  
  if (maxLength && plainText.length > maxLength) {
    plainText = plainText.substring(0, maxLength).trim() + '...';
  }
  
  return plainText;
};