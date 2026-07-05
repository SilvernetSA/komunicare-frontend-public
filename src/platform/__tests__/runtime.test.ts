describe('platform runtime', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('uses web-only runtime defaults', async () => {
    const runtime = await import('../runtime');

    expect(runtime.IS_NATIVE_PLATFORM).toBe(false);
    expect(runtime.PUBLIC_APP_ORIGIN).toBe(window.location.origin);
    expect(runtime.shouldEnableServiceWorker()).toBe(true);
    expect(runtime.buildPublicAppUrl('/board/demo')).toBe(
      `${window.location.origin}/board/demo`,
    );
  });

  it('opens external urls in a browser tab', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    const { getBoardShareUrl, openExternalUrl } = await import('../browser');

    await openExternalUrl('https://example.com/help');

    expect(openSpy).toHaveBeenCalledWith(
      'https://example.com/help',
      '_blank',
      'noopener,noreferrer',
    );
    expect(getBoardShareUrl('board-123')).toBe(
      `${window.location.origin}/board/board-123`,
    );
  });
});
