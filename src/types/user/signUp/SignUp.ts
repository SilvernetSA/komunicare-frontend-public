export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  locale: string;
  gender?: string;
}

export type SignUpResponse = Record<string, unknown>;
