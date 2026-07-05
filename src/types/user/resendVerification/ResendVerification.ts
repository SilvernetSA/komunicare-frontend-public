export interface ResendVerificationRequest {
  email: string;
  locale: string;
}

export type ResendVerificationResponse = Record<string, unknown>;
