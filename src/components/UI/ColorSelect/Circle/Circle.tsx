import React from 'react';

interface CircleProps {
  strokeWidth?: number;
  fill?: string;
}

const Circle: React.FC<CircleProps> = ({ fill = 'transparent' }) => (
  <svg height="48" width="48">
    <circle cx="24" cy="24" r="15" fill={fill} stroke="grey" strokeWidth="1" />
  </svg>
);

export default Circle;
