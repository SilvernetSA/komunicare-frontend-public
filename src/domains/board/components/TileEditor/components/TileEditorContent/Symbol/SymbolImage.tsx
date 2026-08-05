import React from 'react';

interface SymbolImageProps {
  image?: string;
}

export const SymbolImage: React.FC<SymbolImageProps> = ({ image }) => {
  if (!image) return null;

  return (
    <div className="Symbol__image-container">
      <img
        className="Symbol__image"
        src={image}
        alt=""
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};
