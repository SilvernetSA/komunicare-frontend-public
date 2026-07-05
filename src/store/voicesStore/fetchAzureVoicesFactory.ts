import { apiClient } from '../apiClient';
import { getApiErrorMessage } from '../helpers/getApiErrorMessage';

import type { Voice } from '../../types/speech';

export const fetchAzureVoicesFactory =
  (get: () => { cloudVoicesLoaded: boolean; voices: Voice[] }) =>
  async (): Promise<Voice[]> => {
    const state = get();

    if (state.cloudVoicesLoaded) {
      return state.voices.filter((v) => v.voiceSource === 'cloud');
    }

    try {
      const { AZURE_VOICES_BASE_PATH_API, AZURE_SPEECH_SUBSCR_KEY } =
        await import('../../constants');
      const { status, data } = await apiClient.get(
        `${AZURE_VOICES_BASE_PATH_API}list`,
        { headers: { 'Ocp-Apim-Subscription-Key': AZURE_SPEECH_SUBSCR_KEY } },
      );
      if (status === 200 && Array.isArray(data)) return data as Voice[];
      return [];
    } catch (error: any) {
      throw new Error(
        getApiErrorMessage(error, 'Failed to fetch Azure voices'),
      );
    }
  };
