import moment from 'moment';

export function reconcileBoards(
  localBoard: { lastEdited?: string },
  remoteBoard: { lastEdited?: string },
): { lastEdited?: string } {
  if (localBoard.lastEdited && remoteBoard.lastEdited) {
    if (moment(localBoard.lastEdited).isSameOrAfter(remoteBoard.lastEdited)) {
      return localBoard;
    }
    if (moment(localBoard.lastEdited).isBefore(remoteBoard.lastEdited)) {
      return remoteBoard;
    }
  }
  return localBoard;
}
