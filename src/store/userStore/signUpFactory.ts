import { apiClient } from '../apiClient';

import type {
  SignUpRequest,
  SignUpResponse,
} from '../../types/user/signUp/SignUp';

export const signUpFactory =
  () =>
  async (payload: SignUpRequest): Promise<SignUpResponse> => {
    const { data } = await apiClient.post<SignUpResponse>('/user', payload);
    return data;
  };
