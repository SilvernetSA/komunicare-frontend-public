import shortid from 'shortid';

import { UserData } from '@/types/app';
import { Board } from '@/types/board';
import { Communicator } from '@/types/communicator';

export const DEFAULT_COMMUNICATOR_ID = 'komunicare_default';
export const DEFAULT_COMMUNICATOR_NAME = 'Komunicare';
export const DEFAULT_COMMUNICATOR_DESCRIPTION =
  'Komunicare default communicator';
export const DEFAULT_COMMUNICATOR_BUNDLES = ['komunicare'];
export const PROTECTED_ROOT_BOARD_IDS = new Set(['komunicare']);
export const ROOT_BOARD_TO_BUNDLE: Record<string, string> = {
  komunicare: 'komunicare',
};
export const CANONICAL_ROOT_BOARD_IDS = Object.keys(ROOT_BOARD_TO_BUNDLE);

export const BUNDLE_TO_COPY_SOURCE = {
  komunicare: 'komunicare',
} as const;

export const COPY_SOURCE_ALIAS: Record<string, CommunicatorCopySource> = {
  komunicare: 'komunicare',
};

export type CommunicatorCopySource =
  (typeof BUNDLE_TO_COPY_SOURCE)[keyof typeof BUNDLE_TO_COPY_SOURCE];

export const normalizeEmail = (value?: string): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

export const normalizeName = (value?: string): string =>
  typeof value === 'string' ? value.trim() : '';

export const normalizeBundleName = (value?: string): string => {
  const raw = String(value || '')
    .trim()
    .toLowerCase();
  if (raw === 'komunicare') {
    return 'komunicare';
  }
  return '';
};

export const normalizeCopySource = (
  value: unknown,
): CommunicatorCopySource | undefined => {
  const normalizedValue = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
  return COPY_SOURCE_ALIAS[normalizedValue];
};

export const hasDefaultBundles = (communicator: Communicator): boolean => {
  const included = communicator.defaultBoardsIncluded;
  if (!Array.isArray(included) || !included.length) {
    return false;
  }

  const names = new Set(
    included.map((item) => normalizeBundleName(String(item?.nameOnJSON || ''))),
  );

  return DEFAULT_COMMUNICATOR_BUNDLES.every((name) => names.has(name));
};

export const inferBundleByCommunicatorName = (
  communicator?: Communicator,
): string => {
  const commName = normalizeName(communicator?.name).toLowerCase();
  if (commName.includes('komunicare')) {
    return 'komunicare';
  }
  return '';
};

export const isCanonicalRootBoardId = (boardId: string): boolean =>
  PROTECTED_ROOT_BOARD_IDS.has(boardId);

export const hasCustomBoards = (communicator: Communicator): boolean => {
  const rootBoard = String(communicator.rootBoard || '');
  if (rootBoard && !PROTECTED_ROOT_BOARD_IDS.has(rootBoard)) {
    return true;
  }

  const boards = Array.isArray(communicator.boards) ? communicator.boards : [];
  return boards.some(
    (boardId) => !PROTECTED_ROOT_BOARD_IDS.has(String(boardId)),
  );
};

export const resolveCommunicatorBundle = (
  communicator?: Communicator,
): string => {
  if (!communicator) {
    return '';
  }

  const explicitCopySource = normalizeCopySource(
    (communicator as any)?.copySource,
  );
  if (explicitCopySource === 'komunicare') {
    return 'komunicare';
  }

  const boards = Array.isArray(communicator.boards)
    ? communicator.boards.map((boardId) => String(boardId))
    : [];
  // This heuristic only works when there are ≥2 canonical roots defined.
  // With a single canonical root, every communicator that lacks it would
  // incorrectly be classified as that bundle's copy.
  if (boards.length && CANONICAL_ROOT_BOARD_IDS.length >= 2) {
    const missingCanonicalRoots = CANONICAL_ROOT_BOARD_IDS.filter(
      (canonicalBoardId) => !boards.includes(canonicalBoardId),
    );
    if (missingCanonicalRoots.length === 1) {
      return ROOT_BOARD_TO_BUNDLE[missingCanonicalRoots[0]];
    }
  }

  const rootBoard = String(communicator.rootBoard || '').trim();
  if (ROOT_BOARD_TO_BUNDLE[rootBoard]) {
    return ROOT_BOARD_TO_BUNDLE[rootBoard];
  }

  return inferBundleByCommunicatorName(communicator);
};

export const resolveBundleNameForBoard = (
  communicator: Communicator,
  boardId: string,
): string => {
  const normalizedBoardId = String(boardId || '').trim();
  if (!normalizedBoardId) {
    return resolveCommunicatorBundle(communicator);
  }

  if (ROOT_BOARD_TO_BUNDLE[normalizedBoardId]) {
    return ROOT_BOARD_TO_BUNDLE[normalizedBoardId];
  }

  const communicatorBundle = resolveCommunicatorBundle(communicator);
  if (communicatorBundle) {
    return communicatorBundle;
  }

  const included = Array.isArray(communicator?.defaultBoardsIncluded)
    ? communicator.defaultBoardsIncluded
    : [];

  const directMatch = included.find(
    (item) =>
      String(item?.homeBoard || '') === normalizedBoardId &&
      normalizeBundleName(String(item?.nameOnJSON || '')),
  );
  if (directMatch?.nameOnJSON) {
    return normalizeBundleName(String(directMatch.nameOnJSON));
  }

  const rootBoard = String(communicator?.rootBoard || '');
  if (rootBoard && rootBoard === normalizedBoardId) {
    const rootMatch = included.find(
      (item) =>
        String(item?.homeBoard || '') === rootBoard &&
        normalizeBundleName(String(item?.nameOnJSON || '')),
    );
    if (rootMatch?.nameOnJSON) {
      return normalizeBundleName(String(rootMatch.nameOnJSON));
    }
  }

  return inferBundleByCommunicatorName(communicator);
};

export const resolveCopySourceForBoard = (
  communicator: Communicator,
  boardId: string,
): CommunicatorCopySource | '' => {
  const normalizedBoardId = String(boardId || '').trim();
  if (normalizedBoardId && ROOT_BOARD_TO_BUNDLE[normalizedBoardId]) {
    const canonicalBundle = ROOT_BOARD_TO_BUNDLE[normalizedBoardId];
    return (
      BUNDLE_TO_COPY_SOURCE[
        canonicalBundle as keyof typeof BUNDLE_TO_COPY_SOURCE
      ] || ''
    );
  }

  const explicitCopySource = normalizeCopySource(
    (communicator as any)?.copySource,
  );
  if (explicitCopySource) {
    return explicitCopySource;
  }

  // For non-canonical boards, name-based bundle inference is unreliable:
  // a communicator named "Komunicare Navidad" would infer 'komunicare',
  // causing a false copySource that triggers the API uniqueness constraint.
  return '';
};

export const resolveCommunicatorCopySource = (
  communicator?: Communicator,
): CommunicatorCopySource | '' => {
  if (!communicator) {
    return '';
  }

  const explicitCopySource = normalizeCopySource(
    (communicator as any)?.copySource,
  );
  if (explicitCopySource) {
    return explicitCopySource;
  }

  const bundle = resolveCommunicatorBundle(communicator);
  if (!bundle) {
    return '';
  }

  return (
    BUNDLE_TO_COPY_SOURCE[bundle as keyof typeof BUNDLE_TO_COPY_SOURCE] || ''
  );
};

export interface CommunicatorCopyResolution {
  name: string;
  setAsStartup: boolean;
}

export const isOwnedByUser = (
  ownerEmail: string | undefined,
  userEmail: string | undefined,
): boolean => {
  if (!ownerEmail || !userEmail) {
    return false;
  }
  return normalizeEmail(ownerEmail) === normalizeEmail(userEmail);
};

export const findExistingPersonalCopyForBoard = ({
  communicators,
  activeCommunicator,
  userEmail,
  boardId,
}: {
  communicators: Communicator[];
  activeCommunicator: Communicator;
  userEmail?: string;
  boardId?: string;
}): Communicator | null => {
  const normalizedUserEmail = normalizeEmail(userEmail);
  const normalizedBoardId = String(boardId || '').trim();

  if (!normalizedUserEmail || !normalizedBoardId) {
    return null;
  }

  const boardIsCanonicalRoot = isCanonicalRootBoardId(normalizedBoardId);

  const candidateCommunicators = communicators.filter((communicator) => {
    if (!communicator?.id) {
      return false;
    }
    if (!isOwnedByUser(communicator.email, normalizedUserEmail)) {
      return false;
    }

    return (
      Boolean(normalizeCopySource((communicator as any).copySource)) ||
      hasCustomBoards(communicator)
    );
  });

  const findLatestMatch = (
    predicate: (communicator: Communicator) => boolean,
  ): Communicator | null => {
    for (
      let index = candidateCommunicators.length - 1;
      index >= 0;
      index -= 1
    ) {
      const communicator = candidateCommunicators[index];
      if (predicate(communicator)) {
        return communicator;
      }
    }
    return null;
  };

  // Copy-source matching is only reliable for canonical root boards.
  // For non-canonical boards (custom/dynamic communicators), inferBundleByCommunicatorName
  // can return 'komunicare' for any communicator whose name contains "komunicare",
  // causing false positives against the user's personal komunicare copy.
  if (boardIsCanonicalRoot) {
    const expectedCopySource = resolveCopySourceForBoard(
      activeCommunicator,
      normalizedBoardId,
    );

    if (expectedCopySource) {
      const explicitCopySourceMatch = findLatestMatch(
        (communicator) =>
          normalizeCopySource((communicator as any).copySource) ===
          expectedCopySource,
      );

      if (explicitCopySourceMatch) {
        return explicitCopySourceMatch;
      }
    }
  }

  const activeBundleName = resolveBundleNameForBoard(
    activeCommunicator,
    normalizedBoardId,
  );

  if (!boardIsCanonicalRoot) {
    const activeCommunicatorId = String(
      (activeCommunicator as any).id || '',
    ).trim();

    const directBoardMatch = findLatestMatch((communicator) => {
      const rootBoard = String(communicator.rootBoard || '');
      if (rootBoard && rootBoard === normalizedBoardId) {
        return true;
      }

      const boards = Array.isArray(communicator.boards)
        ? communicator.boards
        : [];
      if (boards.includes(normalizedBoardId)) {
        if (!activeBundleName) {
          return true;
        }
        return resolveCommunicatorBundle(communicator) === activeBundleName;
      }

      // A personal copy created from this specific system communicator will
      // have a different rootBoard (new ID) but will carry copySourceCommunicatorId
      // pointing back to the source. Match on that to detect the existing copy.
      const copySourceCommunicatorId = String(
        (communicator as any).copySourceCommunicatorId || '',
      ).trim();
      if (
        copySourceCommunicatorId &&
        activeCommunicatorId &&
        copySourceCommunicatorId === activeCommunicatorId
      ) {
        return true;
      }

      return false;
    });

    // For non-canonical boards, bundle-based fallback is unreliable:
    // resolveCommunicatorBundle returns 'komunicare' for any communicator
    // that doesn't include the 'komunicare' root board, causing false matches
    // against the user's personal komunicare copy.
    return directBoardMatch;
  }

  if (!activeBundleName) {
    return null;
  }

  return findLatestMatch(
    (communicator) =>
      resolveCommunicatorBundle(communicator) === activeBundleName,
  );
};

export const findExistingPersonalCopyForBoardWithRefresh = async ({
  communicators,
  fallbackCommunicators,
  activeCommunicator,
  userEmail,
  boardId,
  fetchMyCommunicators,
}: {
  communicators: Communicator[];
  fallbackCommunicators: Communicator[];
  activeCommunicator: Communicator;
  userEmail?: string;
  boardId?: string;
  fetchMyCommunicators: (options?: {
    force?: boolean;
  }) => Promise<Communicator[]>;
}): Promise<Communicator | null> => {
  const existingCopy = findExistingPersonalCopyForBoard({
    communicators,
    activeCommunicator,
    userEmail,
    boardId,
  });

  if (existingCopy || !userEmail) {
    return existingCopy;
  }

  try {
    const refreshedCommunicators = await fetchMyCommunicators({ force: true });

    return findExistingPersonalCopyForBoard({
      communicators: refreshedCommunicators?.length
        ? refreshedCommunicators
        : fallbackCommunicators,
      activeCommunicator,
      userEmail,
      boardId,
    });
  } catch {
    // Si falla el refresh, seguimos con los datos locales.
    return null;
  }
};

export const isProtectedCommunicator = (
  communicator: Communicator,
  userData: UserData,
): boolean => {
  if (!userData.email) {
    return false;
  }

  if (communicator.id === DEFAULT_COMMUNICATOR_ID) {
    return true;
  }

  if (isOwnedByUser(communicator.email, userData.email)) {
    return false;
  }

  if (hasDefaultBundles(communicator)) {
    return true;
  }

  return true;
};

export const isProtectedBoard = (board: Board, userData: UserData): boolean => {
  if (!userData.email) {
    return false;
  }

  const ownedByUser = isOwnedByUser(board.email, userData.email);

  if (PROTECTED_ROOT_BOARD_IDS.has(String(board.id || '')) && !ownedByUser) {
    return true;
  }

  return !ownedByUser;
};

export const buildCommunicatorCopy = (
  communicator: Communicator,
  userData: UserData | undefined,
  name: string,
  boardId?: string,
): Communicator => {
  const description =
    communicator.description === DEFAULT_COMMUNICATOR_DESCRIPTION
      ? `${DEFAULT_COMMUNICATOR_DESCRIPTION} (copy)`
      : communicator.description;
  const copySource = boardId
    ? resolveCopySourceForBoard(communicator, boardId)
    : resolveCommunicatorCopySource(communicator);
  const copySourceCommunicatorId = String(
    (communicator as any).copySourceCommunicatorId || communicator.id || '',
  ).trim();

  return {
    ...communicator,
    name,
    author: userData?.name || communicator.author,
    email: userData?.email || communicator.email,
    id: shortid.generate(),
    description,
    copySource: copySource || undefined,
    copySourceCommunicatorId: copySourceCommunicatorId || undefined,
  };
};

export const buildSuggestedCommunicatorCopyName = (
  communicator: Communicator,
  userData: UserData | undefined,
  boardTitle?: string,
): string => {
  const authorName =
    normalizeName(userData?.name) || communicator.author || 'My';
  const communicatorName = normalizeName(communicator.name);
  const contextualBoardTitle = normalizeName(boardTitle);
  const shouldUseContextualBoardTitle =
    contextualBoardTitle.length > 0 &&
    (communicator.id === DEFAULT_COMMUNICATOR_ID ||
      communicatorName.length === 0 ||
      communicatorName === DEFAULT_COMMUNICATOR_NAME ||
      communicator.description === DEFAULT_COMMUNICATOR_DESCRIPTION);

  const baseName =
    (shouldUseContextualBoardTitle
      ? contextualBoardTitle
      : communicatorName || contextualBoardTitle) || DEFAULT_COMMUNICATOR_NAME;

  return `${authorName} - ${baseName}`;
};
