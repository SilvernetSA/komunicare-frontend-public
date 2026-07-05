interface JoyrideStyles {
  options: Record<string, unknown>;
  tooltip: Record<string, unknown>;
  tooltipContent: Record<string, unknown>;
  tooltipFooter: Record<string, unknown>;
  buttonNext: Record<string, unknown>;
  buttonBack: Record<string, unknown>;
  buttonSkip: Record<string, unknown>;
  overlay: Record<string, unknown>;
}

interface JoyrideLocale {
  last: string;
  skip: string;
  next: string;
  back: string;
}

export const joyrideStyles: JoyrideStyles = {
  options: {
    arrowColor: '#ffffff',
    backgroundColor: '#ffffff',
    primaryColor: '#7b1fa2',
    textColor: '#424242',
    width: 440,
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: '16px',
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.08)',
    padding: '0',
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    overflow: 'hidden',
  },
  tooltipContent: {
    padding: '28px 28px 12px',
    textAlign: 'left' as const,
    fontSize: '0.95rem',
    color: '#424242',
    lineHeight: '1.65',
  },
  tooltipFooter: {
    padding: '14px 28px 22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    borderTop: '1px solid #f0f0f0',
    marginTop: '4px',
  },
  buttonNext: {
    backgroundColor: '#7b1fa2',
    borderRadius: '10px',
    padding: '8px 22px',
    fontSize: '0.875rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    boxShadow: '0 2px 8px rgba(123, 31, 162, 0.28)',
    outline: 'none',
  },
  buttonBack: {
    color: '#7b1fa2',
    fontWeight: 500,
    fontSize: '0.875rem',
    marginRight: '4px',
    background: 'none',
    border: 'none',
    outline: 'none',
  },
  buttonSkip: {
    color: '#9e9e9e',
    fontSize: '0.8rem',
    marginRight: 'auto',
    background: 'none',
    border: 'none',
    outline: 'none',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
};

export const getJoyrideLocale = (
  intl: {
    formatMessage: (msg: { id: string; defaultMessage: string }) => string;
  },
  messages: Record<string, { id: string; defaultMessage: string }>,
): JoyrideLocale => ({
  last: intl ? intl.formatMessage(messages.walkthroughEndTour) : 'Finish',
  skip: intl ? intl.formatMessage(messages.walkthroughCloseTour) : 'Skip',
  next: intl ? intl.formatMessage(messages.walkthroughNext) : 'Next',
  back: intl ? intl.formatMessage(messages.walkthroughBack) : 'Back',
});
