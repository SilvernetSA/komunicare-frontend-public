import React, { useRef, useCallback } from 'react';
import debounce from 'lodash/debounce';

interface ChildProofProps {
  clicksToUnlock?: number;
  onClick: (event: React.MouseEvent) => void;
  onLockTick?: (clicksLeft: number) => void;
  locked?: boolean;
}

const withChildProof = <T extends object>(
  WrappedComponent: React.ComponentType<T>,
) => {
  return React.forwardRef<any, T & ChildProofProps>((props, ref) => {
    const {
      clicksToUnlock = 4,
      onLockTick = () => {},
      onClick,
      locked,
      ...restProps
    } = props;

    const lockActivatedRef = useRef(true);
    const countRef = useRef(0);
    const debouncedResetCountRef = useRef(
      debounce(() => {
        countRef.current = 0;
      }, 2000),
    );

    const tickLock = useCallback(
      (onToggle: () => void, onTick: (clicksLeft: number) => void) => {
        if (!lockActivatedRef.current) {
          return;
        }

        if (!locked) {
          onToggle();
          lockActivatedRef.current = true;
          countRef.current = 0;
          return;
        }

        countRef.current += 1;

        if (countRef.current < clicksToUnlock) {
          debouncedResetCountRef.current();
        } else {
          debouncedResetCountRef.current.cancel();
        }

        if (countRef.current <= clicksToUnlock) {
          const clicksLeft = clicksToUnlock - countRef.current;
          onTick(clicksLeft);
        }

        if (countRef.current === clicksToUnlock) {
          onToggle();
          lockActivatedRef.current = false;

          setTimeout(() => {
            lockActivatedRef.current = true;
          }, 1000);
        }

        if (countRef.current === clicksToUnlock + 1) {
          countRef.current = 0;
          onToggle();
        }
      },
      [clicksToUnlock, locked],
    );

    const handleClick = useCallback(
      (event: React.MouseEvent) => {
        tickLock(() => {
          onClick(event);
        }, onLockTick);
      },
      [onClick, onLockTick, tickLock],
    );

    return (
      <WrappedComponent {...(restProps as T)} ref={ref} onClick={handleClick} />
    );
  });
};

export default withChildProof;
