import { createGAClient } from './service/GoogleAnalyticsClient';

interface GAClient {
  clientId: string;
  timerId: string;
}

export interface AnalyticsService {
  gaClient: GAClient;
}

export const createAnalyticsService = (): AnalyticsService => ({
  gaClient: createGAClient(),
});
