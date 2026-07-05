import type { Communicator } from '../../communicator';
import type { SpeechOptions } from '../../speech';

export interface LoginUserResponse {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  isFirstLogin?: boolean;
  settings?: {
    speech?: Partial<SpeechOptions>;
    [key: string]: unknown;
  };
  communicators?: Communicator[];
  [key: string]: unknown;
}

export interface LoginPayload extends Record<string, unknown> {
  id: string;
  isFirstLogin?: boolean;
  settings?: {
    speech?: {
      voiceURI?: string;
      pitch?: number;
      rate?: number;
    };
  };
  communicators?: Communicator[];
}

export interface LoginArgs {
  email: string;
  password: string;
  type?: string;
  activatedData?: LoginPayload;
}

export interface AuthError {
  message: string;
  [key: string]: unknown;
}
