import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface TooltipPortalProps {
  anchorEl: HTMLElement | null;
  text: string;
  show: boolean;
  // Optional style overrides
  offset?: number; // px from right edge
}

export default function TooltipPortal({
  anchorEl,
  text,
  show,
  offset = 8,
}: TooltipPortalProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  if (!elRef.current) elRef.current = document.createElement("div");

  useLayoutEffect(() => {
    const el = elRef.current!;
    document.body.appendChild(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  useLayoutEffect(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    setPos({
      top: rect.top + rect.height / 2,
      left: rect.right + offset,
    });
  }, [anchorEl, show, offset]);

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        transform: "translateY(-50%)",
        pointerEvents: "none",
      }}
      className={`whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white shadow-lg z-[9999] transition-opacity duration-150 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      role="tooltip"
    >
      {text}
    </div>,
    elRef.current!
  );
}
