import React from "react";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white shadow-md rounded-lg p-4 border border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
