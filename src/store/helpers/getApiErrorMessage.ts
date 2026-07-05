const readMessage = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nestedMessage = readMessage(item);
      if (nestedMessage) {
        return nestedMessage;
      }
    }
    return null;
  }

  if (typeof value === 'object' && value) {
    const objectValue = value as Record<string, unknown>;

    if ('message' in objectValue) {
      const nestedMessage = readMessage(objectValue.message);
      if (nestedMessage) {
        return nestedMessage;
      }
    }

    if ('error' in objectValue) {
      const nestedMessage = readMessage(objectValue.error);
      if (nestedMessage) {
        return nestedMessage;
      }
    }

    if ('errors' in objectValue) {
      const nestedMessage = readMessage(objectValue.errors);
      if (nestedMessage) {
        return nestedMessage;
      }
    }

    for (const item of Object.values(objectValue)) {
      const nestedMessage = readMessage(item);
      if (nestedMessage) {
        return nestedMessage;
      }
    }
  }

  return null;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Unexpected API error',
): string => {
  if (typeof error === 'object' && error && 'response' in error) {
    const responseData = (error as any).response?.data;
    const responseMessage = readMessage(responseData);
    if (responseMessage) {
      return responseMessage;
    }
  }

  const directMessage = readMessage(error);
  if (directMessage) {
    return directMessage;
  }

  return fallback;
};
