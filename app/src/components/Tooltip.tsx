import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
}

const Tooltip: React.FC<TooltipProps> = ({ children, text, position = 'right' }) => {
  const [show, setShow] = useState(false);

  const positionClasses = {
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={`absolute ${positionClasses[position]} z-50 px-2 py-1 bg-charcoal border border-paper/20 rounded text-[10px] font-mono text-paper whitespace-nowrap shadow-lg`}
        >
          {text}
          {/* Arrow */}
          {position === 'right' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border-4 border-transparent border-r-charcoal" />
          )}
          {position === 'left' && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full border-4 border-transparent border-l-charcoal" />
          )}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
