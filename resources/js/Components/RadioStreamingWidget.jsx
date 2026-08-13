import React from "react";
import {
  Play, Pause, Volume2, VolumeX, Volume1,
  RefreshCw, X, Wifi, AlertTriangle, Disc
} from "lucide-react";
import { useRadioPlayer } from "./RadioPlayerContext";

export const RadioStreamingWidget = () => {
  const {
    isPlaying,
    isLoading,
    isExpanded,
    volume,
    isMuted,
    hasError,
    streamStatus,
    setIsExpanded,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    handleRetry,
  } = useRadioPlayer();

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX size={16} />;
    if (volume < 0.5) return <Volume1 size={16} />;
    return <Volume2 size={16} />;
  };

  return (
    <div className="relative">
      {/* EXPANDED PLAYER CARD (Pop-up anchored above the trigger) */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 sm:right-0 w-[340px] max-w-[92vw] bg-slate-900/95 dark:bg-slate-950/95 text-white rounded-3xl p-5 shadow-2xl border border-amber-500/20 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300 flex flex-col gap-4 font-sans ring-1 ring-black/60 z-50">
          
          {/* Top Bar / Header with MY MOE 101.1 FM Logo */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              {/* Logo Display */}
              <div className="h-10 w-24 bg-white/95 rounded-xl p-1 flex items-center justify-center shadow-inner border border-amber-400/40">
                <img
                  src="/images/mymoe-logo.svg"
                  alt="MY MOE 101.1 FM"
                  className="h-full w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/images/mymoe-logo.png";
                  }}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    MY MOE
                  </span>
                  <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded-full tracking-wider animate-pulse">
                    ON AIR
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  101.1 FM Radio Streaming
                </span>
              </div>
            </div>

            {/* Close / Minimize Button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition cursor-pointer"
              title="Kecilkan Player"
              aria-label="Tutup Player Radio"
            >
              <X size={16} />
            </button>
          </div>

          {/* Visualizer Display Box */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800/90 via-slate-900/95 to-slate-950 border border-white/10 p-4 flex flex-col items-center justify-center min-h-[120px]">
            
            {/* Ambient gold-purple background glow */}
            <div className={`absolute inset-0 bg-gradient-to-r from-amber-500/10 via-purple-600/15 to-sky-500/10 transition-opacity duration-700 ${isPlaying ? "opacity-100" : "opacity-25"}`} />

            {/* Spinning Vinyl Record with MY MOE Logo Center */}
            <div className="relative z-10 flex items-center justify-center mb-3">
              <div className={`w-16 h-16 rounded-full bg-slate-950 border-2 border-amber-500/30 flex items-center justify-center shadow-xl shadow-amber-500/10 transition-transform duration-1000 ${isPlaying ? "animate-[spin_5s_linear_infinite]" : ""}`}>
                <div className="w-9 h-9 rounded-full bg-white p-0.5 flex items-center justify-center border border-amber-400 shadow">
                  <img
                    src="/images/mymoe-logo.svg"
                    alt="Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/images/mymoe-logo.png";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Animated Equalizer Wave Bars */}
            <div className="relative z-10 flex items-end justify-center gap-1.5 h-6">
              {[
                { delay: "0s", maxH: "h-5" },
                { delay: "0.2s", maxH: "h-6" },
                { delay: "0.4s", maxH: "h-4" },
                { delay: "0.1s", maxH: "h-6" },
                { delay: "0.3s", maxH: "h-5" },
                { delay: "0.5s", maxH: "h-4" },
                { delay: "0.25s", maxH: "h-5" },
              ].map((bar, idx) => (
                <span
                  key={idx}
                  className={`w-1 rounded-full bg-gradient-to-t from-amber-400 via-purple-400 to-sky-400 transition-all duration-300 ${
                    isPlaying
                      ? `animate-bounce ${bar.maxH}`
                      : "h-1.5 opacity-30"
                  }`}
                  style={{
                    animationDelay: bar.delay,
                    animationDuration: "0.65s",
                  }}
                />
              ))}
            </div>

            {/* Status text */}
            <span className="relative z-10 text-[10px] font-semibold text-slate-300 mt-2.5 flex items-center gap-1.5">
              <Wifi size={10} className={isPlaying ? "text-emerald-400" : "text-slate-500"} />
              {streamStatus}
            </span>
          </div>

          {/* Error Banner if connection fails */}
          {hasError && (
            <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs text-red-300">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                <span className="text-[11px] leading-tight font-medium">Gagal memuat stream live.</span>
              </div>
              <button
                onClick={handleRetry}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={10} />
                Coba Lagi
              </button>
            </div>
          )}

          {/* Main Playback & Volume Controls */}
          <div className="flex flex-col gap-3">
            
            {/* Play / Pause Big Center Button */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={togglePlay}
                disabled={isLoading}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-500/30 cursor-pointer ${
                  isPlaying
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30"
                    : "bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black shadow-amber-500/40 hover:scale-105"
                }`}
                aria-label={isPlaying ? "Jeda Radio" : "Putar Radio MY MOE 101.1 FM"}
              >
                {isLoading ? (
                  <RefreshCw size={22} className="animate-spin text-white" />
                ) : isPlaying ? (
                  <Pause size={22} className="fill-current text-white" />
                ) : (
                  <Play size={22} className="fill-current ml-0.5 text-slate-950" />
                )}
              </button>
            </div>

            {/* Volume Slider Bar */}
            <div className="bg-slate-800/60 rounded-2xl p-2.5 border border-white/5 flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                title={isMuted ? "Bunyikan Suara" : "Senyapkan Suara"}
                aria-label="Mute / Unmute"
              >
                {renderVolumeIcon()}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="flex-grow h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
                aria-label="Pengatur Volume"
              />

              <span className="text-[10px] font-mono font-bold text-slate-400 w-8 text-right">
                {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>

          {/* Footer station information */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-medium truncate">stream.mymoe.online</span>
            <span className="font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
              101.1 FM
            </span>
          </div>

        </div>
      )}

      {/* FLOATING TRIGGER BADGE / BUTTON (Side-by-side with AI Chat) */}
      <div
        className={`flex items-center bg-slate-900/95 dark:bg-slate-950/95 hover:bg-slate-850 text-white rounded-full shadow-2xl shadow-black/40 border border-amber-500/30 backdrop-blur-md transition-all duration-300 group overflow-hidden ${
          isPlaying ? "ring-2 ring-amber-400/50 shadow-amber-500/20" : ""
        }`}
      >
        {/* Quick Play/Pause Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className={`p-3 transition-colors flex items-center justify-center cursor-pointer ${
            isPlaying
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "hover:bg-white/10 text-amber-400"
          }`}
          title={isPlaying ? "Jeda Radio" : "Putar MY MOE 101.1 FM"}
          aria-label={isPlaying ? "Jeda Radio" : "Putar MY MOE 101.1 FM"}
        >
          {isLoading ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={18} className="fill-current" />
          ) : (
            <Play size={18} className="fill-current ml-0.5" />
          )}
        </button>

        {/* Expand Trigger with MY MOE Logo and Status */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="py-2.5 pr-4 pl-1.5 flex items-center gap-2.5 text-left hover:bg-white/5 transition cursor-pointer"
          title="Buka Player MY MOE 101.1 FM"
          aria-label="Buka Panel Streaming Radio"
        >
          {/* Logo in Pill */}
          <div className="h-6 w-14 bg-white/95 rounded-lg p-0.5 flex items-center justify-center shadow-inner">
            <img
              src="/images/mymoe-logo.svg"
              alt="MY MOE"
              className="h-full w-auto object-contain"
              onError={(e) => {
                e.currentTarget.src = "/images/mymoe-logo.png";
              }}
            />
          </div>

          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-emerald-400 animate-ping" : "bg-red-500"}`} />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-100">
                101.1 FM
              </span>
            </div>
            <span className="text-[9px] text-amber-300 font-semibold">
              {isPlaying ? "On Air" : "Klik Memutar"}
            </span>
          </div>

          {/* Animated Mini Soundwave */}
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-3.5 ml-1">
              <span className="w-0.5 h-3 bg-amber-400 animate-bounce rounded-full [animation-delay:0s]" />
              <span className="w-0.5 h-2 bg-purple-400 animate-bounce rounded-full [animation-delay:0.2s]" />
              <span className="w-0.5 h-3.5 bg-amber-400 animate-bounce rounded-full [animation-delay:0.4s]" />
            </div>
          )}
        </button>
      </div>

    </div>
  );
};

export default RadioStreamingWidget;
