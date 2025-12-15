import React from "react";
import { createPortal } from "react-dom";

export default function MenuPestanaGalaxy({ onClick }) {
  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none"
      style={{
        position: "fixed",
        right: "0px",
        top: "calc(50% - 40px)",
        zIndex: 9999999, // ASTRONÓMICO para romper cualquier stacking context
        writingMode: "vertical-rl",
        textOrientation: "upright",
        transform: "translateY(-50%)",
      }}
    >
      <button
        onClick={onClick}
        className="pointer-events-auto bg-white/30 text-[#2b2438] font-semibold
                   px-2 py-3 rounded-l-2xl shadow-md backdrop-blur-xl
                   border border-white/40 transition hover:bg-white/50"
        style={{
          position: "relative",
          zIndex: 9999999, // Por si las moscas
        }}
      >
        Menú
      </button>
    </div>,
    document.body
  );
}
