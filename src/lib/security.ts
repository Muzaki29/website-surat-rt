/** Kebijakan kata sandi & utilitas keamanan aplikasi */

export interface PasswordValidation {
  valid: boolean;
  error?: string;
}

export function validatePassword(password: string): PasswordValidation {
  if (!password || password.length < 8) {
    return { valid: false, error: "Kata sandi minimal 8 karakter." };
  }
  if (password.length > 128) {
    return { valid: false, error: "Kata sandi terlalu panjang." };
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return {
      valid: false,
      error: "Kata sandi harus mengandung huruf dan angka.",
    };
  }
  return { valid: true };
}

/** Mask NIK untuk tampilan publik (4 digit terakhir) */
export function maskNik(nik: string): string {
  if (nik.length < 8) return "********";
  return `${nik.slice(0, 4)}********${nik.slice(-4)}`;
}

export function isDebugResetEnabled(): boolean {
  return (
    process.env.DEBUG_RESET === "true" &&
    process.env.NODE_ENV !== "production"
  );
}
