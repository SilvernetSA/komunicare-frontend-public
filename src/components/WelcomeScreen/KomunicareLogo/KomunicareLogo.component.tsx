import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

import './KomunicareLogo.css';

const image = '/images/logo.svg';

const KomunicareLogo: React.FC = () => {
  const [showLogo, setShowLogo] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowLogo(true);
  }, []);

  return (
    <CSSTransition
      in={showLogo}
      timeout={5000}
      classNames="transition"
      appear={true}
      nodeRef={nodeRef}
    >
      <div ref={nodeRef}>
        <img className="KomunicareLogo" src={image} alt="Komunicare Logo" />
      </div>
    </CSSTransition>
  );
};

export default KomunicareLogo;
