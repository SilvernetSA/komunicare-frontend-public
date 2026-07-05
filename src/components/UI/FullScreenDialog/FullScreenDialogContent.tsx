import React from 'react';
import classNames from 'classnames';

interface FullScreenDialogContentProps {
  className?: string;
  children?: React.ReactNode;
}

function FullScreenDialogContent({
  className,
  children,
}: FullScreenDialogContentProps) {
  const fullScreenDialogContentClassName = classNames(
    'FullScreenDialogContent',
    className,
  );
  return <div className={fullScreenDialogContentClassName}>{children}</div>;
}

export { FullScreenDialogContent };
