import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { loadYouTubeApi, type VideoSource } from "@/lib/youtube";

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const total = Math.floor(s);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
};

export type StreamPlayerProps = {
  source: VideoSource;
  /** URL do arquivo quando a fonte é a biblioteca da Maná Kids. */
  url?: string;
  youtubeId?: string;
  title: string;
  poster?: string;
  startAt?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onBack?: () => void;
};

export function StreamPlayer(props: StreamPlayerProps) {
  const { source, url, youtubeId, title, poster, startAt = 0, onProgress, onEnded, onBack } = props;
  const shellRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void shellRef.current?.requestFullscreen?.();
  }, []);

  return (
    <div
      ref={shellRef}
      className="relative overflow-hidden rounded-3xl border-2 border-border/70 bg-black shadow-card"
    >
      <div className="flex items-center gap-3 bg-black/90 px-4 py-2.5">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="Voltar"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : null}
        <p className="truncate font-display text-sm text-white">{title}</p>
      </div>

      {source === "youtube" && youtubeId ? (
        <YouTubeStage
          videoId={youtubeId}
          startAt={startAt}
          {...(onProgress ? { onProgress } : {})}
          {...(onEnded ? { onEnded } : {})}
          fullscreen={fullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      ) : (
        <video
          src={url}
          poster={poster}
          controls
          autoPlay
          playsInline
          className="aspect-video w-full bg-black object-contain"
          onLoadedMetadata={(e) => {
            if (startAt > 0) e.currentTarget.currentTime = startAt;
          }}
          onTimeUpdate={(e) =>
            onProgress?.(e.currentTarget.currentTime, e.currentTarget.duration || 0)
          }
          onEnded={() => onEnded?.()}
        />
      )}
    </div>
  );
}

function YouTubeStage({
  videoId,
  startAt,
  onProgress,
  onEnded,
  fullscreen,
  onToggleFullscreen,
}: {
  videoId: string;
  startAt: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const progressCb = useRef(onProgress);
  const endedCb = useRef(onEnded);
  progressCb.current = onProgress;
  endedCb.current = onEnded;

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let ticker: ReturnType<typeof setInterval> | undefined;

    void loadYouTubeApi().then((YT) => {
      if (cancelled || !hostRef.current) return;
      playerRef.current = new YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          playsinline: 1,
          enablejsapi: 1,
          rel: 0,
          modestbranding: 1,
          controls: 0,
          disablekb: 0,
          origin: window.location.origin,
          start: Math.floor(startAt),
        },
        events: {
          onReady: (e: any) => {
            setReady(true);
            setDuration(e.target.getDuration?.() ?? 0);
            setVolume(e.target.getVolume?.() ?? 100);
            if (startAt > 0) e.target.seekTo(startAt, true);
            e.target.playVideo();
          },
          onStateChange: (e: any) => {
            const YTState = window.YT?.PlayerState;
            setPlaying(e.data === YTState?.PLAYING);
            if (e.data === YTState?.ENDED) endedCb.current?.();
            if (e.data === YTState?.PLAYING) setDuration(e.target.getDuration?.() ?? 0);
          },
        },
      });
    });

    ticker = setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      const t = p.getCurrentTime() ?? 0;
      const d = p.getDuration?.() ?? 0;
      setCurrent(t);
      if (d) setDuration(d);
      if (d > 0) progressCb.current?.(t, d);
    }, 1000);

    return () => {
      cancelled = true;
      if (ticker) clearInterval(ticker);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [videoId, startAt]);

  const seekTo = (value: number) => {
    playerRef.current?.seekTo?.(value, true);
    setCurrent(value);
  };

  return (
    <div className="bg-black">
      <div className="relative aspect-video w-full">
        <div ref={hostRef} className="absolute inset-0 h-full w-full" />
        {/* Bloqueia apenas cliques diretos no vídeo; os controles são os nossos. */}
        <button
          type="button"
          aria-label={playing ? "Pausar" : "Reproduzir"}
          onClick={() => (playing ? playerRef.current?.pauseVideo?.() : playerRef.current?.playVideo?.())}
          onDoubleClick={onToggleFullscreen}
          className="absolute inset-0 h-full w-full cursor-pointer bg-transparent"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-black px-3 py-2.5 text-white sm:gap-3 sm:px-4">
        <input
          type="range"
          aria-label="Barra de progresso"
          min={0}
          max={Math.max(duration, 1)}
          step={1}
          value={Math.min(current, duration || 0)}
          disabled={!ready}
          onChange={(e) => seekTo(Number(e.target.value))}
          className="order-first h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-primary"
        />
        <button
          aria-label="Voltar 10 segundos"
          onClick={() => seekTo(Math.max(0, current - 10))}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          aria-label={playing ? "Pausar" : "Reproduzir"}
          onClick={() => (playing ? playerRef.current?.pauseVideo?.() : playerRef.current?.playVideo?.())}
          className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand shadow-glow"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
        </button>
        <button
          aria-label="Avançar 10 segundos"
          onClick={() => seekTo(Math.min(duration, current + 10))}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <RotateCw className="h-4 w-4" />
        </button>

        <span className="font-display text-xs tabular-nums">
          {fmt(current)} / {fmt(duration)}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            aria-label={muted ? "Ativar som" : "Silenciar"}
            onClick={() => {
              const p = playerRef.current;
              if (!p) return;
              if (muted) {
                p.unMute?.();
                setMuted(false);
              } else {
                p.mute?.();
                setMuted(true);
              }
            }}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            aria-label="Volume"
            min={0}
            max={100}
            value={muted ? 0 : volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              setMuted(v === 0);
              playerRef.current?.unMute?.();
              playerRef.current?.setVolume?.(v);
            }}
            className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-white/25 accent-primary"
          />
          <button
            aria-label="Tela cheia"
            onClick={onToggleFullscreen}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"
          >
            {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
