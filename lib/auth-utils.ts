/**
 * Validação de senha forte (LGPD / boas práticas).
 * Mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais.
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "A senha deve ter no mínimo 8 caracteres." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos uma letra minúscula." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos uma letra maiúscula." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos um número." };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos um caractere especial (!@#$%^&* etc.)." };
  }
  return { valid: true };
}

/** Email do usuário master (acesso ao painel admin). Não expor em client se sensível. */
export const MASTER_EMAIL = "sandro@rhumarh.com";

export function isMasterUser(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === MASTER_EMAIL.toLowerCase();
}
