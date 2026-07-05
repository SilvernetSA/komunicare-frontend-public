interface ActivationStatus {
  message?: string;
  [key: string]: unknown;
}

const activationRequestsInFlight = new Map<string, Promise<ActivationStatus>>();
const activationResolvedStatus = new Map<string, ActivationStatus>();

/**
 * Activates an account exactly once per token, even if called concurrently.
 * Subsequent calls with the same token return the cached result without a
 * new network request.
 */
export const activateAccountOnce = async (
  token: string,
  activateAccount: (url: string) => Promise<Record<string, unknown>>,
): Promise<ActivationStatus> => {
  const resolvedStatus = activationResolvedStatus.get(token);
  if (resolvedStatus) {
    return resolvedStatus;
  }

  const inFlightRequest = activationRequestsInFlight.get(token);
  if (inFlightRequest) {
    return await inFlightRequest;
  }

  const request = activateAccount(token)
    .then((status) => {
      const normalized = status as ActivationStatus;
      activationResolvedStatus.set(token, normalized);
      return normalized;
    })
    .finally(() => {
      activationRequestsInFlight.delete(token);
    });

  activationRequestsInFlight.set(token, request);
  return await request;
};
