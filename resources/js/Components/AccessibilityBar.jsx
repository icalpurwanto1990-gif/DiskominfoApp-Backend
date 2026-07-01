import React from "react";
import { useAccessibility } from "./AccessibilityContext";
import { ZoomIn, ZoomOut } from "lucide-react";

export const AccessibilityBar = () => {
  const {
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    fontSizeMultiplier,
  } = useAccessibility();

  return (
    <div className="w-full bg-[#0a549e] text-slate-100 py-1.5 px-4 md:px-8 flex justify-between items-center text-xs border-b border-[#042240] font-medium">
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-slate-300">Portal Resmi Kabupaten Banggai Kepulauan</span>
        <span className="sm:hidden text-slate-300">Banggai Kepulauan</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Font controls */}
        <div className="flex items-center gap-1.5 pr-1">
          <span className="text-slate-400 mr-1 hidden md:inline">Ukuran Huruf:</span>
          <button
            onClick={decreaseFontSize}
            className="p-1 hover:bg-[#063360] rounded-md transition"
            title="Perkecil Huruf (-A)"
            aria-label="Perkecil Huruf"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={resetFontSize}
            className="px-1.5 py-0.5 hover:bg-[#063360] rounded-md transition text-[10px] font-bold"
            title="Reset Ukuran (A)"
            aria-label={`Reset Ukuran (saat ini ${Math.round(fontSizeMultiplier * 100)}%)`}
          >
            A ({Math.round(fontSizeMultiplier * 100)}%)
          </button>
          <button
            onClick={increaseFontSize}
            className="p-1 hover:bg-[#063360] rounded-md transition"
            title="Perbesar Huruf (+A)"
            aria-label="Perbesar Huruf"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
