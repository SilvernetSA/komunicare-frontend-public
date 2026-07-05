import { accesoriesBoard } from './komunicare/accesoriesBoard';
import { actionsBoard } from './komunicare/actionsBoard';
import { bodyPartsBoard } from './komunicare/bodyPartsBoards';
import { breakfastBoard } from './komunicare/breakfastsBoard';
import { chatBoard } from './komunicare/chatBoard';
import { clothingBoard } from './komunicare/clothingBoard';
import { drinksBoard } from './komunicare/drinksBoards';
import { familyBoard } from './komunicare/familyBoard';
import { feelingsBoard } from './komunicare/feelingsBoard';
import { foodBoard } from './komunicare/foodBoard';
import { fruitsAndVegetables } from './komunicare/fruitsAndVegetables';
import { handWashingBoard } from './komunicare/handWashingBoard';
import { hobbiesBoard } from './komunicare/hobbiesBoard';
import { personalHygiene } from './komunicare/personalHygiene';
import { questionsAndConversationBoard } from './komunicare/questionsAndConversationBoard';
import { schoolBoard } from './komunicare/schoolBoard';
import { sportsBoard } from './komunicare/sportsBoard';
import { toothBrushingBoard } from './komunicare/toothBrushingBoard';
import { toysBoard } from './komunicare/toysBoard';
import { Board } from './types';

const komunicare: Board[] = [
  {
    isPublic: true,
    tiles: [
      { ...feelingsBoard.tile, type: 'board' as const },
      { ...chatBoard.tile, type: 'board' as const },
      { ...foodBoard.tile, type: 'board' as const },
      { ...drinksBoard.tile, type: 'board' as const },
      { ...familyBoard.tile, type: 'board' as const },
      { ...sportsBoard.tile, type: 'board' as const },
      { ...clothingBoard.tile, type: 'board' as const },
      hobbiesBoard.tile,
      personalHygiene.tile,
      schoolBoard.tile,
      bodyPartsBoard.tile,
      actionsBoard.tile,
      toysBoard.tile,
      questionsAndConversationBoard.tile,
    ],
    locale: 'es-ES',
    format: 'komunicare',
    description: 'komunicareDescription',
    isFixed: true,
    name: 'Tablero Komunicare',
    author: 'Komunicare',
    email: 'info@komuni.care',
    caption: '../logo.svg',
    grid: {
      rows: 4,
      columns: 4,
      order: [
        [feelingsBoard.id, chatBoard.id, foodBoard.id, bodyPartsBoard.id],
        [drinksBoard.id, familyBoard.id, sportsBoard.id, actionsBoard.id],
        [clothingBoard.id, hobbiesBoard.id, personalHygiene.id, schoolBoard.id],
        [toysBoard.id, questionsAndConversationBoard.id, null, null],
      ],
    },
    lastEdited: '2024-06-12T17:09:50-03:00',
    id: 'komunicare',
    hidden: false,
  },
  {
    ...feelingsBoard.board,
    name: feelingsBoard.board.nameKey || 'Feelings',
  } as Board,
  { ...chatBoard.board, name: chatBoard.board.nameKey || 'Chat' } as Board,
  { ...foodBoard.board, name: foodBoard.board.nameKey || 'Food' } as Board,
  { ...drinksBoard.board, name: drinksBoard.board.nameKey || 'Drinks' },
  { ...familyBoard.board, name: familyBoard.board.nameKey || 'Family' },
  { ...sportsBoard.board, name: sportsBoard.board.nameKey || 'Sports' },
  {
    ...fruitsAndVegetables.board,
    name: fruitsAndVegetables.board.nameKey || 'Fruits',
  },
  {
    ...breakfastBoard.board,
    name: breakfastBoard.board.nameKey || 'Breakfast',
  },
  { ...clothingBoard.board, name: clothingBoard.board.nameKey || 'Clothing' },
  {
    ...accesoriesBoard.board,
    name: accesoriesBoard.board.nameKey || 'Accessories',
  },
  { ...hobbiesBoard.board, name: hobbiesBoard.board.nameKey || 'Hobbies' },
  {
    ...personalHygiene.board,
    name: personalHygiene.board.nameKey || 'Personal Hygiene',
  },
  handWashingBoard.board,
  schoolBoard.board,
  toothBrushingBoard.board,
  bodyPartsBoard.board,
  actionsBoard.board,
  toysBoard.board,
  questionsAndConversationBoard.board,
];

export default komunicare;
