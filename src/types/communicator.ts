// CommunicatorState is defined in src/store/communicatorsStore.ts where it is used.

export interface DefaultBoardIncluded {
  nameOnJSON: string;
  homeBoard: string;
}

export interface Communicator {
  id?: string;
  name: string;
  author: string;
  email: string;
  description?: string;
  rootBoard: string;
  boards: string[];
  defaultBoardsIncluded?: DefaultBoardIncluded[];
  copySource?: 'komunicare';
  copySourceCommunicatorId?: string;
  nameKey?: string;
  [key: string]: unknown;
}
