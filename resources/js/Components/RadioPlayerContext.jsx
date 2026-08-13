import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const RadioPlayerContext = createContext(undefined);

export const RadioPlayerProvider = ({ children }) => {
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

  // Load persisted volume if available
  useEffect(() => {
    const savedVol = localStorage.getItem("mymoe-radio-volume");
    if (savedVol !== null) {
      const parsed = parseFloat(savedVol);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        setVolume(parsed);
        if (parsed === 0) setIsMuted(true);
      }
    }
  }, []);

  // Sync volume with HTML5 Audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    localStorage.setItem("mymoe-radio-volume", (isMuted ? 0 : volume).toString());
  }, [volume, isMuted]);

  // Toggle Play / Pause
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

      if (audioRef.current.src !== STREAM_URL && !audioRef.current.src.includes(STREAM_URL)) {
        audioRef.current.src = STREAM_URL;
        audioRef.current.load();
      }

      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
        setStreamStatus("Mengudara (Live)");
      } catch (err) {
        console.warn("Stream playback failed:", err);
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

  // Toggle expanded state
  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <RadioPlayerContext.Provider
      value={{
        isPlaying,
        isLoading,
        isExpanded,
        volume,
        isMuted,
        hasError,
        streamStatus,
        STREAM_URL,
        setIsExpanded,
        togglePlay,
        toggleMute,
        handleVolumeChange,
        toggleExpand,
        handleRetry,
      }}
    >
      {/* Root-Level Persistent HTML5 Audio Tag (Lives above Inertia router) */}
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
      {children}
    </RadioPlayerContext.Provider>
  );
};

export const useRadioPlayer = () => {
  const context = useContext(RadioPlayerContext);
  if (!context) {
    throw new Error("useRadioPlayer must be used within a RadioPlayerProvider");
  }
  return context;
};

export default RadioPlayerProvider;
