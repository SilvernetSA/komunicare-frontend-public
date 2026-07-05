export interface AuthState {
  loginStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  loginError?: string;
  resetStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  resetError?: string;
  changePasswordStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  changePasswordError?: string;
}
