import bcrypt from 'bcryptjs';

/**
 * Hash password menggunakan bcrypt
 * Note: Di production, hashing harus dilakukan di backend, bukan frontend
 * Untuk development/demo, kita hash di sini, tapi JANGAN gunakan di production
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Verify password
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Simple MD5 hash untuk demo (TIDAK aman, hanya untuk development)
 * Gunakan bcrypt di production
 */
export const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};
