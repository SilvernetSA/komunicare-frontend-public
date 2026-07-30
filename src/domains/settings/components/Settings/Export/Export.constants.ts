export const KOMUNICARE_OBF_CONSTANTS = {
  DATA_URL: 'https://komuni.care/api/v1/boards/',
  URL: 'https://komuni.care/boards/',
  LICENSE: {
    type: 'CC-By',
    copyright_notice_url: 'http://creativecommons.org/licenses/by',
    source_url: 'https://github.com/SilvernetSA',
    author_name: 'Komunicare',
    author_url: 'https://www.komuni.care',
    author_email: 'info@komuni.care',
  },
};

export const KOMUNICARE_ZIP_OPTIONS = {
  type: 'blob',
  compression: 'DEFLATE',
  platform: 'UNIX',
};

export const KOMUNICARE_COLUMNS = 6;
export const KOMUNICARE_ROWS = 4;
export const KOMUNICARE_EXT_PREFIX = 'ext_komunicare_';
export const KOMUNICARE_EXT_PROPERTIES = ['labelKey', 'nameKey', 'hidden'];
export const NOT_FOUND_IMAGE =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCACWAJYDASIAAhEBAxEB/8QAHgABAAICAwEBAQAAAAAAAAAAAAgJAgcFBgoDAQT/xAA1EAABAwMEAQMBBQgCAwAAAAABAgMEAAUGBwgRITESMkETFCJCUXEJFUNSYXKBoSORk6Lw/8QAHAEBAAIDAQEBAAAAAAAAAAAAAAUHAgMEBgEI/8QAMREAAQMCBAQCCgMBAAAAAAAAAQACAwQRBRIhUWETIjJBcZGhwfBi0fHCFENSYXKBsf/aAAwDAQACEQMRAD8A/9k=';
export const EMPTY_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export const EXPORT_CONFIG_BY_TYPE = {
  komunicare: {
    filename: 'board.json',
    callback: 'komunicareExportAdapter',
  },
  openboard: {
    filename: 'board.obz',
    callback: 'openboardExportAdapter',
  },
  pdf: {
    filename: 'board.pdf',
    callback: 'pdfExportAdapter',
  },
};
