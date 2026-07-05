// Skip dynamic image loading since TS files can't be required directly
const boardImages = [
  'build/symbols/mulberry/*.svg',
  'build/symbols/arasaac/*.png',
  'build/symbols/komunicare/*.svg',
];

module.exports = {
  stripPrefix: 'build/',
  staticFileGlobs: [
    'build/*.html',
    'build/manifest.json',
    'build/static/**/!(*map*)',
    ...boardImages,
  ],
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
  runtimeCaching: [
    {
      urlPattern: /\/symbols\/mulberry/,
      handler: 'cacheFirst',
      options: {
        cache: {
          name: 'symbols-mulberry',
        },
      },
    },
    {
      urlPattern: /\/symbols\/arasaac/,
      handler: 'cacheFirst',
      options: {
        cache: {
          name: 'symbols-arasaac',
        },
      },
    },
    {
      urlPattern: /\/symbols\/komunicare/,
      handler: 'cacheFirst',
      options: {
        cache: {
          name: 'symbols-komunicare',
        },
      },
    },
  ],
  dontCacheBustUrlsMatching: /\.\w{8}\./,
  dynamicUrlToDependencies: {
    '/': ['build/index.html'],
  },
  navigateFallback: '/',
  swFilePath: 'build/service-worker.js',
};
