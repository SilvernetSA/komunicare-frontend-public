import { apiClient } from '@/store/apiClient';

import type {
  ResendVerificationRequest,
  ResendVerificationResponse,
} from '@/types/user/resendVerification/ResendVerification';

export const resendVerificationFactory =
  () =>
  async (
    email: string,
    locale: string,
  ): Promise<ResendVerificationResponse> => {
    const payload: ResendVerificationRequest = { email, locale };
    const { data } = await apiClient.post<ResendVerificationResponse>(
      '/user/resend-verification',
      payload,
    );
    return data;
  };
