import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, CheckCircle, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function getEmbedUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1&color=white`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?color=d97706`;
  return null;
}

/* ── Native video player ─────────────────────────────────────────────────── */
function NativePlayer({ topic, watched, onWatched, isCompleted }) {
  const videoRef = useRef(null);
  const [playing, setPlaying]   = useState(false);
  const [muted, setMuted]       = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent]   = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef(null);

  const revealControls = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 2500);
    }
  }, [playing]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
      setShowControls(true);
    } else {
      videoRef.current.play().catch(() => {});
      setPlaying(true);
      hideTimer.current = setTimeout(() => setShowControls(false), 2500);
    }
  }, [playing]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(pct);
    setCurrent(videoRef.current.currentTime);
    if (pct >= 80 && !watched) onWatched();
  }, [watched, onWatched]);

  const handleSeek = useCallback((e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pct * duration;
    setProgress(pct * 100);
  }, [duration]);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setShowControls(true);
    onWatched();
  }, [onWatched]);

  const toggleMute = useCallback(() => setMuted(m => !m), []);
  const handleFullscreen = useCallback(() => videoRef.current?.requestFullscreen?.(), []);
  const handleReplay = useCallback(() => { if (videoRef.current) videoRef.current.currentTime = 0; }, []);
  const handleMouseLeave = useCallback(() => { if (playing) setShowControls(false); }, [playing]);
  const handleLoadedMetadata = useCallback(() => setDuration(videoRef.current?.duration || 0), []);
  const handlePlay = useCallback(() => setPlaying(true), []);
  const handlePause = useCallback(() => setPlaying(false), []);
  const stopPropagation = useCallback((e) => e.stopPropagation(), []);

  return (
    <div
      className="relative bg-black rounded-2xl overflow-hidden aspect-video cursor-pointer select-none"
      onMouseMove={revealControls}
      onMouseLeave={handleMouseLeave}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={topic.video_url}
        className="w-full h-full object-contain"
        muted={muted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={handlePlay}
        onPause={handlePause}
        preload="metadata"
        playsInline
      />

      {/* Big play overlay (shown when paused) */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-2xl">
            <Play className="w-9 h-9 text-white ml-1" />
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
        onClick={stopPropagation}
      >
        {/* Seek bar */}
        <div className="px-4 pt-4 pb-1">
          <div
            className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer group/seek hover:h-2.5 transition-all duration-150"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-harvest rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-harvest rounded-full shadow-md opacity-0 group-hover/seek:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 pb-3">
          <button onClick={togglePlay} className="text-white hover:text-harvest transition-colors">
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button onClick={handleReplay} className="text-white/50 hover:text-white transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/60 tabular-nums">
            {formatTime(current)} / {formatTime(duration)}
          </span>
          <div className="flex-1" />
          <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button onClick={handleFullscreen} className="text-white/60 hover:text-white transition-colors">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Embed player (YouTube / Vimeo) ─────────────────────────────────────── */
function EmbedPlayer({ embedUrl, title }) {
  return (
    <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title={title}
      />
    </div>
  );
}

/* ── Main VideoPlayer export ─────────────────────────────────────────────── */
export default function VideoPlayer({ topic, isCompleted, onComplete }) {
  const [watched, setWatched] = useState(isCompleted);

  const embedUrl = getEmbedUrl(topic.video_url);
  // For non-embed URLs: treat as direct video (uploaded files, etc.)
  const useDirect = !embedUrl && !!topic.video_url;

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h2 className="text-white font-display font-bold text-xl leading-snug">{topic.title}</h2>
        {topic.video_duration_mins > 0 && (
          <p className="text-white/40 text-xs mt-1">{topic.video_duration_mins} min</p>
        )}
      </div>

      {/* Video area */}
      {embedUrl ? (
        <EmbedPlayer embedUrl={embedUrl} title={topic.title} />
      ) : useDirect ? (
        <NativePlayer
          topic={topic}
          watched={watched}
          onWatched={() => setWatched(true)}
          isCompleted={isCompleted}
        />
      ) : (
        <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900 flex flex-col items-center justify-center gap-3 border border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <Play className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/30 text-sm">No video configured for this topic</p>
        </div>
      )}

      {/* Notes */}
      {topic.content && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-harvest text-xs uppercase tracking-wider font-semibold mb-2">Notes</p>
          <p className="text-sm text-white/70 leading-relaxed">{topic.content}</p>
        </div>
      )}

      {/* Completion row */}
      <div className="flex items-center justify-between pt-1">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" /> Topic Completed
          </div>
        ) : (
          <p className="text-white/30 text-xs">
            {useDirect ? "Watch 80% to enable completion" : "Mark as complete when ready"}
          </p>
        )}
        {!isCompleted && (
          <Button
            onClick={onComplete}
            disabled={useDirect && !watched}
            className="bg-harvest hover:bg-harvest/90 text-white gap-2 disabled:opacity-40"
          >
            Mark Complete <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}