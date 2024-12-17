import * as bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): boolean {
  return password === confirmPassword;
}

export class PasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordError";
  }
}

export async function validateAndVerifyPassword(
  currentPassword: string,
  hashedPassword: string,
  newPassword?: string,
  confirmPassword?: string
): Promise<void> {
  const isCurrentPasswordValid = await verifyPassword(
    currentPassword,
    hashedPassword
  );

  if (!isCurrentPasswordValid) {
    throw new PasswordError("Current password is incorrect");
  }

  if (newPassword && confirmPassword) {
    if (!validatePasswordMatch(newPassword, confirmPassword)) {
      throw new PasswordError("New passwords don't match");
    }
  }
}
