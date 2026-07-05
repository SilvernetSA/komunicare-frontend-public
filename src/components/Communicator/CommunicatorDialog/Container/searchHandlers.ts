import {
  APP_DEFAULT_BOARD_IDS,
  TAB_INDEXES,
} from '../CommunicatorDialog.constants';

import type {
  BoardPageParams,
  BoardPageResponse,
} from '../../../../store/boardsStore';
import type { UserData } from '../../../../types/app';
import type { Board } from '../../../../types/board';

const BOARDS_PAGE_LIMIT = 10;

interface SearchCriteria {
  [key: string]: unknown;
}

interface FindBoardsResult {
  limit: number;
  offset: number;
  search: string;
  page: number;
  total: number;
  data: Board[];
}

interface SearchHandlersProps {
  communicatorBoards: Board[];
  availableBoards: Board[];
  userData: UserData | Record<string, unknown>;
  fetchPublicBoards: (params: BoardPageParams) => Promise<BoardPageResponse>;
  fetchMyBoards: (params: BoardPageParams) => Promise<BoardPageResponse>;
}

interface DoSearchResult {
  boards: Board[];
  totalPages: number;
  total: number;
}

export const findBoards = (
  boards: Board[],
  criteria: SearchCriteria,
  page: number,
  search: string = '',
): FindBoardsResult => {
  let result = boards;
  for (let [key, value] of Object.entries(criteria)) {
    result = result.filter(
      (board) =>
        (board.hasOwnProperty(key) &&
          (board as Record<string, unknown>)[key] === value) ||
        !board.hasOwnProperty(key),
    );
  }
  if (search) {
    let re = new RegExp(search);
    result = result.filter(
      (board) => re.test(board.name) || re.test(board.author),
    );
  }
  return {
    limit: BOARDS_PAGE_LIMIT,
    offset: 0,
    search: search,
    page: page,
    total: result.length,
    data: result.slice(
      (page - 1) * BOARDS_PAGE_LIMIT,
      page * BOARDS_PAGE_LIMIT,
    ),
  };
};

export const doSearch = async (
  search: string,
  page: number,
  selectedTab: number,
  props: SearchHandlersProps,
): Promise<DoSearchResult> => {
  let boards: Board[] = [];
  let totalPages = 1;
  let total = 0;
  const filterOutAppDefaultBoards = (items: Board[]) =>
    items.filter((board) => !APP_DEFAULT_BOARD_IDS.includes(board.id));

  switch (selectedTab) {
    case TAB_INDEXES.COMMUNICATOR_BOARDS:
      const commState = findBoards(props.communicatorBoards, {}, page, search);
      boards = boards.concat(commState.data);
      total = commState.total;
      totalPages = Math.ceil(commState.total / BOARDS_PAGE_LIMIT);
      break;
    case TAB_INDEXES.PUBLIC_BOARDS:
      let externalState: BoardPageResponse = {
        data: [],
        total: 0,
        page,
        limit: BOARDS_PAGE_LIMIT,
      };
      try {
        externalState = await props.fetchPublicBoards({
          limit: BOARDS_PAGE_LIMIT,
          page,
          search,
        });
      } catch {
        const fallback = findBoards(
          props.availableBoards,
          {
            isPublic: true,
            hidden: false,
          },
          page,
          search,
        );
        externalState = {
          data: fallback.data,
          total: fallback.total,
          page: fallback.page,
          limit: fallback.limit,
        };
      }
      boards = boards.concat(externalState.data);
      total = externalState.total ?? externalState.data.length;
      totalPages = Math.ceil((total || 0) / BOARDS_PAGE_LIMIT);
      break;
    case TAB_INDEXES.MY_BOARDS:
      let myBoardsResponse: BoardPageResponse = {
        data: [],
        total: 0,
        page,
        limit: BOARDS_PAGE_LIMIT,
      };
      try {
        myBoardsResponse = await props.fetchMyBoards({
          limit: BOARDS_PAGE_LIMIT,
          page,
          search,
        });
      } catch {
        const fallback = findBoards(
          props.availableBoards,
          {
            email: (props.userData as UserData).email,
            hidden: false,
          },
          page,
          search,
        );
        myBoardsResponse = {
          data: fallback.data,
          total: fallback.total,
          page: fallback.page,
          limit: fallback.limit,
        };
      }
      const filteredMyBoards = filterOutAppDefaultBoards(myBoardsResponse.data);
      const filteredItemsCount =
        myBoardsResponse.data.length - filteredMyBoards.length;
      boards = boards.concat(filteredMyBoards);
      total = Math.max(
        0,
        (myBoardsResponse.total ?? myBoardsResponse.data.length) -
          filteredItemsCount,
      );
      totalPages = Math.ceil((total || 0) / BOARDS_PAGE_LIMIT);
      break;
    default:
      break;
  }
  return {
    boards,
    totalPages,
    total,
  };
};
