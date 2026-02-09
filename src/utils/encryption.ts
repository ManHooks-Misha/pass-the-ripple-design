// Simple encryption/decryption utility for ripple_id
// Using base64 encoding with a simple cipher for basic obfuscation

const ENCRYPTION_KEY = 'ripple-challenge-2024';

export const encryptRippleId = (rippleId: string): string => {
  try {
    // Simple XOR cipher with base64 encoding
    const key = ENCRYPTION_KEY;
    let encrypted = '';
    
    for (let i = 0; i < rippleId.length; i++) {
      const charCode = rippleId.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode(charCode);
    }
    
    // Encode to base64 and make URL safe
    return btoa(encrypted).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    console.error('Encryption error:', error);
    return rippleId; // Fallback to original if encryption fails
  }
};

export const decryptRippleId = (encryptedRippleId: string): string => {
  try {
    // Decode from URL safe base64
    const base64 = encryptedRippleId.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const decoded = atob(padded);
    
    // Simple XOR cipher decryption
    const key = ENCRYPTION_KEY;
    let decrypted = '';
    
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode);
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedRippleId; // Fallback to original if decryption fails
  }
};
