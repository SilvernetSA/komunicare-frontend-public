interface DefaultBoardIncluded {
  nameOnJSON: string;
  homeBoard: string;
}

export interface Communicator {
  id: string;
  name: string;
  description: string;
  author: string;
  email: string;
  rootBoard: string;
  boards: string[];
  defaultBoardsIncluded: DefaultBoardIncluded[];
}

export const defaultCommunicators: Communicator[] = [
  {
    id: 'komunicare_default',
    name: 'Komunicare',
    description: 'Komunicare default communicator',
    author: 'Komunicare Team',
    email: 'info@komuni.care',
    rootBoard: 'komunicare',
    boards: ['komunicare'],
    defaultBoardsIncluded: [
      { nameOnJSON: 'komunicare', homeBoard: 'komunicare' },
    ],
  },
];
