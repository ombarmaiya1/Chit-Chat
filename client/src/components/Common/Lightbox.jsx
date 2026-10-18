import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Lightbox({ src, alt, onClose }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose?.();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none cursor-pointer"
      onClick={handleClose}
    >
      {/* Prominent Close button at top-right */}
      <button
        type="button"
        onClick={handleClose}
        className="fixed top-5 right-5 z-[1000000] text-white hover:text-white bg-white/20 hover:bg-white/40 active:scale-95 rounded-full w-12 h-12 flex items-center justify-center transition shadow-2xl backdrop-blur-xl border border-white/30 cursor-pointer"
        aria-label="Close modal"
        title="Close (Esc)"
      >
        <span className="text-xl font-bold leading-none">✕</span>
      </button>

      {/* Main Image Container */}
      <div 
        className="relative max-w-5xl max-h-[85vh] flex flex-col items-center justify-center p-2"
        onClick={onClose}
      >
        <img
          src={src}
          alt={alt || "Preview"}
          className="max-h-[80vh] max-w-full w-auto rounded-xl object-contain shadow-2xl border border-white/10 cursor-pointer"
          title="Click to close"
        />
        {alt && (
          <p className="mt-3 text-xs md:text-sm text-gray-200 font-medium bg-black/70 px-4 py-1.5 rounded-full border border-white/15">
            {alt}
          </p>
        )}
        <span className="mt-2 text-[11px] text-gray-400 bg-black/40 px-3 py-0.5 rounded-full">
          Click anywhere or press Esc to close
        </span>
      </div>
    </div>,
    document.body
  );
}
