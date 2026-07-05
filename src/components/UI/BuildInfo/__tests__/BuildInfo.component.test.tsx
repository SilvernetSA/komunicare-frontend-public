// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BuildInfo from '../BuildInfo';

vi.mock('../buildInfo.constants', () => ({
  buildInfoLabel: 'v1.0.0 · abc1234 · 2026-06-01 · DEV',
}));

vi.mock('@mui/material/Typography', () => ({
  default: ({
    children,
    style,
    ...rest
  }: React.HTMLAttributes<HTMLSpanElement> & {
    style?: React.CSSProperties;
  }) => (
    <span style={style} {...rest}>
      {children}
    </span>
  ),
}));

describe('BuildInfo component', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('renders the build info label', async () => {
    await act(async () => {
      root.render(<BuildInfo />);
    });

    expect(container.textContent).toContain(
      'v1.0.0 · abc1234 · 2026-06-01 · DEV',
    );
  });

  it('renders with aria-label="build-info" in inline variant', async () => {
    await act(async () => {
      root.render(<BuildInfo />);
    });

    const el = container.querySelector('[aria-label="build-info"]');
    expect(el).not.toBeNull();
  });

  it('renders with aria-label="build-info" in badge variant', async () => {
    await act(async () => {
      root.render(<BuildInfo variant="badge" />);
    });

    const el = container.querySelector('[aria-label="build-info"]');
    expect(el).not.toBeNull();
  });

  it('badge variant renders with inline position:fixed style', async () => {
    await act(async () => {
      root.render(<BuildInfo variant="badge" />);
    });

    const el = container.querySelector(
      '[aria-label="build-info"]',
    ) as HTMLElement;
    expect(el?.style.position).toBe('fixed');
  });

  it('inline variant does not apply a fixed position style', async () => {
    await act(async () => {
      root.render(<BuildInfo />);
    });

    const el = container.querySelector(
      '[aria-label="build-info"]',
    ) as HTMLElement;
    expect(el?.style.position).not.toBe('fixed');
  });
});
