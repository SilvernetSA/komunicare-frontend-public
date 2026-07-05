export interface AppEnv {
  apiUrl: string;
  azure: {
    instrumentationKey: string;
    speechKey: string;
    region: string;
  };
  mode: string | undefined;
}

// Use the already centralized constants to avoid divergent logic
import {
  API_URL,
  AZURE_INST_KEY,
  AZURE_SPEECH_SUBSCR_KEY,
  AZURE_SPEECH_SERVICE_REGION,
  NODE_ENV,
} from '../constants';

export function getEnv(): AppEnv {
  return {
    apiUrl: API_URL,
    azure: {
      instrumentationKey: AZURE_INST_KEY,
      speechKey: AZURE_SPEECH_SUBSCR_KEY,
      region: AZURE_SPEECH_SERVICE_REGION,
    },
    mode: NODE_ENV,
  };
}
