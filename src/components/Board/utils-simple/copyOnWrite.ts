export * from './copyOnWrite.domain';

import {
  CommunicatorCopyResolution,
  buildCommunicatorCopy,
  buildSuggestedCommunicatorCopyName,
  findExistingPersonalCopyForBoardWithRefresh,
  DEFAULT_COMMUNICATOR_NAME,
} from './copyOnWrite.domain';
import { UserData } from '../../../types/app';
import { Communicator } from '../../../types/communicator';
import { switchCommunicatorNavigation } from '../../../utils/switchCommunicatorNavigation';

interface CommunicatorCopyDialogPayload {
  communicator: Communicator;
  promptText: string;
  suggestedName: string;
}

type NavigateFn = (path: string, options?: { replace?: boolean }) => void;

type CommunicatorCopyDialogHandler = (
  payload: CommunicatorCopyDialogPayload,
) => Promise<CommunicatorCopyResolution | null>;

let communicatorCopyDialogHandler: CommunicatorCopyDialogHandler | null = null;

export type ResolveOrCreateCommunicatorCopyResult =
  | {
      kind: 'existing';
      communicator: Communicator;
    }
  | {
      kind: 'created';
      communicator: Communicator;
      resolution: CommunicatorCopyResolution;
    }
  | {
      kind: 'cancelled';
    };

export interface ProtectedBoardCommunicatorCopyState {
  shouldAbort: boolean;
  createCommunicator: boolean;
  communicatorCopyResolution: CommunicatorCopyResolution | null;
}

export const prepareCommunicatorCopyDraft = async ({
  communicator,
  userData,
  boardTitle,
  boardId,
  promptText,
}: {
  communicator: Communicator;
  userData: UserData | undefined;
  boardTitle?: string;
  boardId?: string;
  promptText: string;
}): Promise<{
  communicatorDraft: Communicator;
  resolution: CommunicatorCopyResolution;
} | null> => {
  const resolution = await requestCommunicatorCopyConfiguration(
    communicator,
    promptText,
    buildSuggestedCommunicatorCopyName(communicator, userData, boardTitle),
  );

  if (!resolution) {
    return null;
  }

  return {
    communicatorDraft: buildCommunicatorCopy(
      communicator,
      userData,
      resolution.name,
      boardId,
    ),
    resolution,
  };
};

export const createAndActivateCommunicatorCopy = async ({
  communicator,
  userData,
  boardTitle,
  boardId,
  promptText,
  noticeMessage,
  upsertCommunicator,
  navigate,
  showNotification,
}: {
  communicator: Communicator;
  userData: UserData | undefined;
  boardTitle?: string;
  boardId?: string;
  promptText: string;
  noticeMessage: string;
  upsertCommunicator: (communicator: Communicator) => void;
  navigate?: NavigateFn;
  showNotification: (message: string) => void;
}): Promise<{
  communicator: Communicator;
  resolution: CommunicatorCopyResolution;
} | null> => {
  const preparedCommunicatorCopy = await prepareCommunicatorCopyDraft({
    communicator,
    userData,
    boardTitle,
    boardId,
    promptText,
  });

  if (!preparedCommunicatorCopy) {
    return null;
  }

  const { communicatorDraft, resolution } = preparedCommunicatorCopy;
  const communicatorCopy = communicatorDraft;
  upsertCommunicator(communicatorCopy);
  switchCommunicatorNavigation({
    communicator: communicatorCopy,
    navigate,
    skipBoardNavigation: true,
  });
  showNotification(noticeMessage);

  return {
    communicator: communicatorCopy,
    resolution,
  };
};

export const resolveProtectedBoardCommunicatorCopy = async ({
  shouldResolveCommunicatorCopy,
  onExistingCopy,
  ...communicatorCopyParams
}: {
  shouldResolveCommunicatorCopy: boolean;
  onExistingCopy?: (communicator: Communicator) => boolean | void;
  existingCopy?: Communicator | null;
  communicators: Communicator[];
  fallbackCommunicators: Communicator[];
  activeCommunicator: Communicator;
  userEmail?: string;
  boardId?: string;
  fetchMyCommunicators: (options?: {
    force?: boolean;
  }) => Promise<Communicator[]>;
  userData: UserData | undefined;
  boardTitle?: string;
  promptText: string;
  noticeMessage: string;
  upsertCommunicator: (communicator: Communicator) => void;
  navigate?: NavigateFn;
  showNotification: (message: string) => void;
}): Promise<ProtectedBoardCommunicatorCopyState> => {
  if (!shouldResolveCommunicatorCopy) {
    return {
      shouldAbort: false,
      createCommunicator: false,
      communicatorCopyResolution: null,
    };
  }

  const communicatorCopyResult = await resolveOrCreateCommunicatorCopy(
    communicatorCopyParams,
  );

  if (communicatorCopyResult.kind === 'existing') {
    return {
      shouldAbort:
        onExistingCopy?.(communicatorCopyResult.communicator) === true,
      createCommunicator: false,
      communicatorCopyResolution: null,
    };
  }

  if (communicatorCopyResult.kind === 'cancelled') {
    return {
      shouldAbort: true,
      createCommunicator: false,
      communicatorCopyResolution: null,
    };
  }

  return {
    shouldAbort: false,
    createCommunicator: true,
    communicatorCopyResolution: communicatorCopyResult.resolution,
  };
};

export const resolveOrCreateCommunicatorCopy = async ({
  existingCopy,
  communicators,
  fallbackCommunicators,
  activeCommunicator,
  userEmail,
  boardId,
  fetchMyCommunicators,
  userData,
  boardTitle,
  promptText,
  noticeMessage,
  upsertCommunicator,
  navigate,
  showNotification,
}: {
  existingCopy?: Communicator | null;
  communicators: Communicator[];
  fallbackCommunicators: Communicator[];
  activeCommunicator: Communicator;
  userEmail?: string;
  boardId?: string;
  fetchMyCommunicators: (options?: {
    force?: boolean;
  }) => Promise<Communicator[]>;
  userData: UserData | undefined;
  boardTitle?: string;
  promptText: string;
  noticeMessage: string;
  upsertCommunicator: (communicator: Communicator) => void;
  navigate?: NavigateFn;
  showNotification: (message: string) => void;
}): Promise<ResolveOrCreateCommunicatorCopyResult> => {
  const resolvedExistingCopy =
    existingCopy ||
    (await findExistingPersonalCopyForBoardWithRefresh({
      communicators,
      fallbackCommunicators,
      activeCommunicator,
      userEmail,
      boardId,
      fetchMyCommunicators,
    }));

  if (resolvedExistingCopy) {
    return {
      kind: 'existing',
      communicator: resolvedExistingCopy,
    };
  }

  const createdCommunicatorCopy = await createAndActivateCommunicatorCopy({
    communicator: activeCommunicator,
    userData,
    boardTitle,
    boardId,
    promptText,
    noticeMessage,
    upsertCommunicator,
    navigate,
    showNotification,
  });

  if (!createdCommunicatorCopy) {
    return { kind: 'cancelled' };
  }

  return {
    kind: 'created',
    communicator: createdCommunicatorCopy.communicator,
    resolution: createdCommunicatorCopy.resolution,
  };
};

export const setCommunicatorCopyDialogHandler = (
  handler: CommunicatorCopyDialogHandler | null,
): void => {
  communicatorCopyDialogHandler = handler;
};

export const requestCommunicatorCopyConfiguration = async (
  communicator: Communicator,
  promptText: string,
  suggestedName?: string,
): Promise<CommunicatorCopyResolution | null> => {
  const fallbackSuggestedName = `${
    communicator.name || DEFAULT_COMMUNICATOR_NAME
  } (copy)`;

  const resolvedName = suggestedName || fallbackSuggestedName;

  if (communicatorCopyDialogHandler) {
    return communicatorCopyDialogHandler({
      communicator,
      promptText,
      suggestedName: resolvedName,
    });
  }

  if (typeof window !== 'undefined') {
    const typedName = window.prompt(promptText, resolvedName);
    if (typedName === null) {
      return null;
    }
    const trimmedName = typedName.trim();
    if (!trimmedName) {
      return null;
    }
    return {
      name: trimmedName,
      setAsStartup: false,
    };
  }

  return {
    name: resolvedName,
    setAsStartup: false,
  };
};
