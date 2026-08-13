import React, { useState, useRef, useEffect } from "react";
import {
  Radio, Play, Pause, Volume2, VolumeX, Volume1,
  RefreshCw, X, Minimize2, Maximize2, Activity,
  Music, Wifi, AlertTriangle, Disc
} from "lucide-react";

export const RadioStreamingWidget = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.85);
  const [hasError, setHasError] = useState(false);
  const [streamStatus, setStreamStatus] = useState("Standby");

  // Stream URL specified in requirements
  const STREAM_URL = "https://stream.mymoe.online/stream";

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle Play/Pause toggle
  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsLoading(false);
      setStreamStatus("Dijeda");
    } else {
      setIsLoading(true);
      setHasError(false);
      setStreamStatus("Menghubungkan...");

      // Reload src if previous error or stopped
      if (audioRef.current.src !== STREAM_URL) {
        audioRef.current.src = STREAM_URL;
        audioRef.current.load();
      }

      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
        setStreamStatus("Mengudara (Live)");
      } catch (err) {
        console.warn("Stream playback failed or blocked:", err);
        setIsLoading(false);
        setIsPlaying(false);
        setHasError(true);
        setStreamStatus("Gagal Terhubung");
      }
    }
  };

  // Reconnect / Retry handler
  const handleRetry = () => {
    if (!audioRef.current) return;
    setHasError(false);
    setIsLoading(true);
    setStreamStatus("Menghubungkan ulang...");
    audioRef.current.src = `${STREAM_URL}?t=${Date.now()}`;
    audioRef.current.load();
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
        setStreamStatus("Mengudara (Live)");
      })
      .catch((err) => {
        console.error("Retry failed:", err);
        setIsLoading(false);
        setIsPlaying(false);
        setHasError(true);
        setStreamStatus("Koneksi Gagal");
      });
  };

  // Handle Volume change
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume > 0 ? prevVolume : 0.85);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
    }
  };

  // Volume icon selector
  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX size={16} />;
    if (volume < 0.5) return <Volume1 size={16} />;
    return <Volume2 size={16} />;
  };

  return (
    <>
      {/* Hidden Native Audio Element with preload="none" */}
      <audio
        ref={audioRef}
        src={STREAM_URL}
        preload="none"
        onPlaying={() => {
          setIsPlaying(true);
          setIsLoading(false);
          setHasError(false);
          setStreamStatus("Mengudara (Live)");
        }}
        onWaiting={() => {
          setIsLoading(true);
          setStreamStatus("Buffering...");
        }}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
          setHasError(true);
          setStreamStatus("Koneksi Terputus");
        }}
        onPause={() => {
          setIsPlaying(false);
          setIsLoading(false);
        }}
      />

      {/* Floating Side Dock / Player Wrapper */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center select-none">

        {/* EXPANDED PLAYER CARD (Slides in from the right) */}
        {isExpanded && (
          <div className="mr-3 w-80 sm:w-88 bg-slate-900/95 dark:bg-slate-950/95 text-white rounded-3xl p-5 shadow-2xl border border-white/15 backdrop-blur-xl animate-in slide-in-from-right-8 duration-300 flex flex-col gap-4 font-sans ring-1 ring-black/50">
            
            {/* Top Bar / Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="relative p-2 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl shadow-md">
                  <Radio size={16} className="text-white animate-pulse" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? "bg-emerald-400" : "bg-amber-400"}`} />
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPlaying ? "bg-emerald-500" : "bg-amber-500"}`} />
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                    Radio Streaming
                    <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded-full tracking-widest animate-pulse">
                      LIVE
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
                    LPPL & Moe Online Broadcast
                  </span>
                </div>
              </div>

              {/* Close / Minimize Button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                title="Kecilkan Widget"
                aria-label="Tutup Panel Radio"
              >
                <X size={16} />
              </button>
            </div>

            {/* Visualizer Display Box */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-white/10 p-4 flex flex-col items-center justify-center min-h-[110px]">
              
              {/* Background ambient glow */}
              <div className={`absolute inset-0 bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-indigo-500/10 transition-opacity duration-700 ${isPlaying ? "opacity-100" : "opacity-20"}`} />

              {/* Spinning Disc / Vinyl effect when playing */}
              <div className="relative z-10 flex items-center justify-center mb-3">
                <div className={`w-14 h-14 rounded-full bg-slate-950 border-2 border-white/20 flex items-center justify-center shadow-lg transition-transform duration-1000 ${isPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center">
                    <Disc size={16} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Animated Equalizer Wave Bars */}
              <div className="relative z-10 flex items-end justify-center gap-1.5 h-6">
                {[
                  { delay: "0s", minH: "h-1.5", maxH: "h-5" },
                  { delay: "0.2s", minH: "h-2", maxH: "h-6" },
                  { delay: "0.4s", minH: "h-1", maxH: "h-4" },
                  { delay: "0.1s", minH: "h-2.5", maxH: "h-6" },
                  { delay: "0.3s", minH: "h-1.5", maxH: "h-5" },
                  { delay: "0.5s", minH: "h-2", maxH: "h-4" },
                  { delay: "0.25s", minH: "h-1", maxH: "h-5" },
                ].map((bar, idx) => (
                  <span
                    key={idx}
                    className={`w-1 rounded-full bg-gradient-to-t from-emerald-400 to-sky-400 transition-all duration-300 ${
                      isPlaying
                        ? `animate-bounce ${bar.maxH}`
                        : "h-1.5 opacity-30"
                    }`}
                    style={{
                      animationDelay: bar.delay,
                      animationDuration: "0.7s",
                    }}
                  />
                ))}
              </div>

              {/* Status text */}
              <span className="relative z-10 text-[10px] font-semibold text-slate-300 mt-2 flex items-center gap-1.5">
                <Wifi size={10} className={isPlaying ? "text-emerald-400" : "text-slate-500"} />
                {streamStatus}
              </span>
            </div>

            {/* Error Banner if connection fails */}
            {hasError && (
              <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs text-red-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                  <span className="text-[11px] leading-tight font-medium">Gagal memuat siaran live.</span>
                </div>
                <button
                  onClick={handleRetry}
                  className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={10} />
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Main Playback & Volume Controls */}
            <div className="flex flex-col gap-3">
              
              {/* Play / Pause Big Button */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={togglePlay}
                  disabled={isLoading}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 focus:outline-none focus:ring-4 focus:ring-sky-500/30 cursor-pointer ${
                    isPlaying
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25"
                      : "bg-gradient-to-tr from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white shadow-sky-500/30 hover:scale-105"
                  }`}
                  aria-label={isPlaying ? "Jeda Siaran" : "Putar Siaran Radio"}
                >
                  {isLoading ? (
                    <RefreshCw size={22} className="animate-spin text-white" />
                  ) : isPlaying ? (
                    <Pause size={22} className="fill-current" />
                  ) : (
                    <Play size={22} className="fill-current ml-0.5" />
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
                  className="flex-grow h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
                  aria-label="Pengatur Volume"
                />

                <span className="text-[10px] font-mono font-bold text-slate-400 w-8 text-right">
                  {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
                </span>
              </div>
            </div>

            {/* Footer station information */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-medium truncate">Audio Source: stream.mymoe.online</span>
              <span className="font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                128kbps
              </span>
            </div>

          </div>
        )}

        {/* SIDE DOCK TRIGGER BUTTON (Always visible at the right edge) */}
        <div className="flex items-center">
          <div
            className={`flex items-center bg-slate-900/95 dark:bg-slate-950/95 hover:bg-slate-850 text-white rounded-l-2xl shadow-2xl border-y border-l border-white/20 backdrop-blur-md transition-all duration-300 group overflow-hidden ${
              isPlaying ? "ring-2 ring-emerald-500/40" : ""
            }`}
          >
            {/* Quick Play/Pause Action on mini badge */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className={`p-3 transition-colors flex items-center justify-center cursor-pointer ${
                isPlaying
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "hover:bg-white/10 text-sky-400"
              }`}
              title={isPlaying ? "Jeda Streaming" : "Putar Streaming Radio"}
              aria-label={isPlaying ? "Jeda Streaming" : "Putar Streaming"}
            >
              {isLoading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : isPlaying ? (
                <Pause size={16} className="fill-current" />
              ) : (
                <Play size={16} className="fill-current ml-0.5" />
              )}
            </button>

            {/* Expand / Open Drawer Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="py-3 px-3.5 flex items-center gap-2 text-left hover:bg-white/5 transition cursor-pointer"
              title="Buka Player Radio"
              aria-label="Buka Panel Streaming Radio"
            >
              {/* Radio Wave indicator */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-emerald-400 animate-ping" : "bg-red-500"}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-100">
                    Live Radio
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-medium">
                  {isPlaying ? "On Air" : "Klik Memutar"}
                </span>
              </div>

              {/* Animated Mini Equalizer in collapsed state */}
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-3.5 ml-1">
                  <span className="w-0.5 h-3 bg-emerald-400 animate-bounce rounded-full [animation-delay:0s]" />
                  <span className="w-0.5 h-2 bg-sky-400 animate-bounce rounded-full [animation-delay:0.2s]" />
                  <span className="w-0.5 h-3.5 bg-emerald-400 animate-bounce rounded-full [animation-delay:0.4s]" />
                </div>
              )}
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default RadioStreamingWidget;
