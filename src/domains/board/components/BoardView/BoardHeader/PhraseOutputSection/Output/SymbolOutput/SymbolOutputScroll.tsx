import React, { useRef, useEffect } from 'react';

import Scroll from './SymbolOutputScroll/Scroll';
import { SymbolOutputList } from './SymbolOutputScroll/SymbolOutputList';

import { NavigationSettings } from '@/types/app';

interface SymbolItem {
  image?: string;
  label: string | React.ReactNode;
  type?: 'live' | string;
  [key: string]: unknown;
}

interface SymbolOutputScrollProps {
  symbols: SymbolItem[];
  navigationSettings: NavigationSettings;
  onWriteSymbol: (
    index: number,
  ) => (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onRemoveClick: (index: number) => (event: React.MouseEvent) => void;
  isScreenKeyboardMode?: boolean;
}

export const SymbolOutputScroll: React.FC<SymbolOutputScrollProps> = ({
  symbols,
  navigationSettings,
  onWriteSymbol,
  onRemoveClick,
  isScreenKeyboardMode,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToLastSymbol = () => {
    try {
      const lastOutputSymbol = scrollContainerRef.current?.lastElementChild;
      if (lastOutputSymbol) {
        lastOutputSymbol.scrollIntoView({ inline: 'end' });
      }
    } catch (err) {
      console.error('Error during autoScroll of output bar', err);
    }
  };

  useEffect(() => {
    scrollToLastSymbol();
  }, []);

  useEffect(() => {
    if (symbols.length > 0) scrollToLastSymbol();
  }, [symbols.length]);

  return (
    <Scroll scrollContainerReference={scrollContainerRef}>
      <SymbolOutputList
        symbols={symbols}
        navigationSettings={navigationSettings}
        onWriteSymbol={onWriteSymbol}
        onRemoveClick={onRemoveClick}
        isScreenKeyboardMode={isScreenKeyboardMode}
      />
    </Scroll>
  );
};
