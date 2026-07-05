import type { Board } from '../../types/board';

// Los tableros del sistema ya no se hardcodean aquí.
// Se cargan desde la API en getApiObjects() → fetchSystemBoards().
// Se mantiene el array vacío para que la app arranque sin datos hardcodeados.
export const createInitialBoards = (): Board[] => [];
