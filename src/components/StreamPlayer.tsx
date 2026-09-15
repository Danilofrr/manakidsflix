import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Captions,
  CaptionsOff,
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
import {
  pickTrack,
  readCaptionPreference,
  resolveTrackUrl,
  writeCaptionPreference,
  type SubtitleTrack,
} from "@/lib/subtitles";

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
  url?: string;
  hlsUrl?: string;
  youtubeId?: string;
  title: string;
  poster?: string;
  startAt?: number;
  subtitles?: SubtitleTrack[];
  autoStart?: boolean;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onBack?: () => void;
};

type Engine = {
  play: () => void;
  pause: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
};

export function StreamPlayer(props: StreamPlayerProps) {
  const {
    source,
    url,
    hlsUrl,
    youtubeId,
    title,
    poster,
    startAt = 0,
    subtitles = [],
    autoStart = false,
    onProgress,
    onEnded,
    onBack,
  } = props;

  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytHostRef = useRef<HTMLDivElement>(null);
  const ytRef = useRef<any>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const progressCb = useRef(onProgress);
  const endedCb = useRef(onEnded);
  progressCb.current = onProgress;
  endedCb.current = onEnded;

  const isYouTube = source === "youtube" && Boolean(youtubeId);
  const pref = useMemo(() => readCaptionPreference(), []);

  const [started, setStarted] = useState(autoStart);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(100);
  const [muted, setMutedState] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [ccMenu, setCcMenu] = useState(false);
  const [cueText, setCueText] = useState("");
  const [playbackError, setPlaybackError] = useState("");
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});
  const [activeLang, setActiveLang] = useState<string | null>(() =>
    pref.enabled ? (pref.language ?? null) : null,
  );
  const [ytCaptionsEnabled, setYtCaptionsEnabled] = useState(Boolean(pref.enabled));
  const ytCaptionsRef = useRef(Boolean(pref.enabled));

  const localTracks = isYouTube ? [] : subtitles;

  useEffect(() => {
    setStarted(autoStart);
    setReady(false);
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    setPlaybackError("");
    setCcMenu(false);
    setCueText("");
    if (source === "youtube") {
      const enabled = Boolean(pref.enabled);
      setYtCaptionsEnabled(enabled);
      ytCaptionsRef.current = enabled;
    }
  }, [source, url, hlsUrl, youtubeId, autoStart, pref.enabled]);

  useEffect(() => {
    let active = true;
    void Promise.all(
      subtitles.map(async (t) => [t.id, await resolveTrackUrl(t)] as const),
    ).then((pairs) => {
      if (active) setResolvedUrls(Object.fromEntries(pairs));
    });
    return () => {
      active = false;
    };
  }, [subtitles]);

  useEffect(() => {
    if (isYouTube || !localTracks.length || activeLang || !pref.enabled) return;
    const chosen = pickTrack(localTracks, pref.language);
    if (chosen) setActiveLang(chosen.languageCode);
  }, [localTracks, pref.enabled, pref.language, activeLang, isYouTube]);

  const chooseLanguage = (lang: string | null) => {
    setActiveLang(lang);
    setCcMenu(false);
    writeCaptionPreference({ enabled: Boolean(lang), language: lang ?? pref.language });
  };

  const applyYoutubeCaptions = useCallback((enabled: boolean) => {
    const p = ytRef.current;
    if (!p) return;

    try {
      if (!enabled) {
        p.unloadModule?.("captions");
        p.unloadModule?.("cc");
        return;
      }

      p.loadModule?.("captions");
      p.loadModule?.("cc");

      window.setTimeout(() => {
        try {
          const list: any[] =
            p.getOption?.("captions", "tracklist") ??
            p.getOption?.("cc", "tracklist") ??
            [];

          const preferred =
            list.find((t: any) => /^pt(-|$)/i.test(t.languageCode ?? "")) ?? list[0];

          if (preferred?.languageCode) {
            p.setOption?.("captions", "track", { languageCode: preferred.languageCode });
            p.setOption?.("cc", "track", { languageCode: preferred.languageCode });
          }
        } catch {
          // O YouTube usa a faixa padrão quando não expõe a lista.
        }
      }, 180);
    } catch {
      // Alguns vídeos não possuem legendas.
    }
  }, []);

  const toggleYoutubeCaptions = useCallback(() => {
    const next = !ytCaptionsRef.current;
    ytCaptionsRef.current = next;
    setYtCaptionsEnabled(next);
    setCcMenu(false);
    writeCaptionPreference({ enabled: next, language: pref.language ?? "pt" });
    applyYoutubeCaptions(next);
  }, [applyYoutubeCaptions, pref.language]);

  useEffect(() => {
    const handler = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    const shell = shellRef.current as any;
    if (shell?.requestFullscreen) void shell.requestFullscreen();
    else if ((videoRef.current as any)?.webkitEnterFullscreen)
      (videoRef.current as any).webkitEnterFullscreen();
  }, []);

  useEffect(() => {
    if (isYouTube || !started) return;
    const video = videoRef.current;
    const src = hlsUrl || url;
    if (!video || !src) return;

    let destroy: (() => void) | undefined;
    let cancelled = false;
    const isHls = Boolean(hlsUrl) || /\.m3u8(\?|$)/i.test(src);

    if (isHls && !video.canPlayType("application/vnd.apple.mpegurl")) {
      void import("hls.js").then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) {
          video.src = src;
          return;
        }

        const hls = new Hls({ enableWorker: true });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) setPlaybackError("Não foi possível carregar este vídeo.");
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        destroy = () => hls.destroy();
      });
    } else {
      video.src = src;
    }

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [isYouTube, started, url, hlsUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (isYouTube || !video) return;
    const list = Array.from(video.textTracks);
    let activeTrack: TextTrack | null = null;

    for (const t of list) {
      const isActive = Boolean(activeLang) && t.language === activeLang;
      t.mode = isActive ? "hidden" : "disabled";
      if (isActive) activeTrack = t;
    }

    setCueText("");
    if (!activeTrack) return;

    const onCue = () => {
      const cues = Array.from(activeTrack?.activeCues ?? []) as VTTCue[];
      setCueText(cues.map((c) => c.text.replace(/<[^>]+>/g, "")).join("\n"));
    };

    activeTrack.addEventListener("cuechange", onCue);
    return () => activeTrack?.removeEventListener("cuechange", onCue);
  }, [activeLang, isYouTube, started, resolvedUrls]);

  useEffect(() => {
    if (!isYouTube || !started) return;
    let cancelled = false;

    void loadYouTubeApi().then((YT) => {
      if (cancelled || !ytHostRef.current) return;

      ytRef.current = new YT.Player(ytHostRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          playsinline: 1,
          enablejsapi: 1,
          rel: 0,
          fs: 0,
          disablekb: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          cc_lang_pref: "pt",
          hl: "pt-BR",
          modestbranding: 1,
          origin: window.location.origin,
          start: Math.floor(startAt),
        },
        events: {
          onReady: (e: any) => {
            setReady(true);
            setDuration(e.target.getDuration?.() ?? 0);
            setVolumeState(e.target.getVolume?.() ?? 100);
            if (startAt > 0) e.target.seekTo(startAt, true);

            applyYoutubeCaptions(ytCaptionsRef.current);
            e.target.playVideo();
          },
          onStateChange: (e: any) => {
            setPlaying(e.data === 1);
            if (e.data === 1) setDuration(e.target.getDuration?.() ?? 0);
            if (e.data === 0) endedCb.current?.();
          },
          onError: () => setPlaybackError("Não foi possível carregar este vídeo."),
        },
      });
    });

    const ticker = window.setInterval(() => {
      const p = ytRef.current;
      if (!p?.getCurrentTime) return;
      const t = p.getCurrentTime() ?? 0;
      const d = p.getDuration?.() ?? 0;
      setCurrent(t);
      if (d) setDuration(d);
      if (d > 0) progressCb.current?.(t, d);
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(ticker);
      ytRef.current?.destroy?.();
      ytRef.current = null;
    };
  }, [isYouTube, started, youtubeId, startAt, applyYoutubeCaptions]);

  const engine: Engine = useMemo(
    () =>
      isYouTube
        ? {
            play: () => ytRef.current?.playVideo?.(),
            pause: () => ytRef.current?.pauseVideo?.(),
            seek: (t) => ytRef.current?.seekTo?.(t, true),
            setVolume: (v) => {
              ytRef.current?.unMute?.();
              ytRef.current?.setVolume?.(v);
            },
            setMuted: (m) => (m ? ytRef.current?.mute?.() : ytRef.current?.unMute?.()),
          }
        : {
            play: () => void videoRef.current?.play(),
            pause: () => videoRef.current?.pause(),
            seek: (t) => {
              if (videoRef.current) videoRef.current.currentTime = t;
            },
            setVolume: (v) => {
              if (videoRef.current) videoRef.current.volume = v / 100;
            },
            setMuted: (m) => {
              if (videoRef.current) videoRef.current.muted = m;
            },
          },
    [isYouTube],
  );

  const togglePlay = () => (playing ? engine.pause() : engine.play());

  const seekTo = (value: number) => {
    engine.seek(value);
    setCurrent(value);
  };

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3200);
  }, []);

  useEffect(() => {
    if (!started) return;
    if (!playing) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setControlsVisible(true);
      return;
    }

    revealControls();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [playing, started, revealControls]);

  useEffect(() => {
    if (!started) return;

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        seekTo(Math.min(duration, current + 10));
      } else if (e.key === "ArrowLeft") {
        seekTo(Math.max(0, current - 10));
      } else if (e.key === "f") {
        toggleFullscreen();
      } else if (e.key === "m") {
        const next = !muted;
        setMutedState(next);
        engine.setMuted(next);
      } else if (e.key.toLowerCase() === "c" && isYouTube) {
        toggleYoutubeCaptions();
      }

      revealControls();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const btn =
    "grid place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65 h-11 w-11 sm:h-10 sm:w-10";

  return (
    <div
      ref={shellRef}
      className="relative select-none overflow-hidden rounded-3xl bg-black shadow-card [&:fullscreen]:h-screen [&:fullscreen]:w-screen [&:fullscreen]:rounded-none"
      onMouseMove={revealControls}
      onTouchStart={revealControls}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {started ? (
          isYouTube ? (
            <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black [&_iframe]:absolute [&_iframe]:left-1/2 [&_iframe]:top-1/2 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:max-w-none [&_iframe]:-translate-x-1/2 [&_iframe]:-translate-y-1/2 [&_iframe]:scale-[1.25] [&_iframe]:border-0">
              <div ref={ytHostRef} className="absolute inset-0 h-full w-full" />
            </div>
          ) : (
            <video
              ref={videoRef}
              poster={poster}
              autoPlay
              playsInline
              crossOrigin="anonymous"
              className="absolute inset-0 h-full w-full bg-black object-cover"
              onLoadedMetadata={(e) => {
                setReady(true);
                setDuration(e.currentTarget.duration || 0);
                if (startAt > 0) e.currentTarget.currentTime = startAt;
              }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onVolumeChange={(e) => {
                setVolumeState(Math.round(e.currentTarget.volume * 100));
                setMutedState(e.currentTarget.muted);
              }}
              onTimeUpdate={(e) => {
                const t = e.currentTarget.currentTime;
                const d = e.currentTarget.duration || 0;
                setCurrent(t);
                if (d) setDuration(d);
                if (d) progressCb.current?.(t, d);
              }}
              onEnded={() => endedCb.current?.()}
              onError={() => setPlaybackError("Não foi possível carregar este vídeo.")}
            >
              {subtitles.map((t) => (
                <track
                  key={t.id}
                  kind="subtitles"
                  src={resolvedUrls[t.id] ?? t.url}
                  srcLang={t.languageCode}
                  label={t.languageName}
                />
              ))}
            </video>
          )
        ) : null}

        {started && playbackError ? (
          <div className="absolute inset-0 z-40 grid place-items-center bg-background p-6 text-center">
            <p className="font-display text-sm text-muted-foreground">{playbackError}</p>
          </div>
        ) : null}

        {started ? (
          <button
            type="button"
            aria-label={playing ? "Pausar" : "Reproduzir"}
            onClick={() => {
              togglePlay();
              revealControls();
            }}
            onDoubleClick={toggleFullscreen}
            className="absolute inset-0 z-10 cursor-pointer bg-transparent"
          />
        ) : null}

        {started && ready && !playing ? (
          <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-black/10">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow sm:h-20 sm:w-20">
              <Play className="h-8 w-8 fill-current sm:h-10 sm:w-10" />
            </div>
          </div>
        ) : null}

        {started && !isYouTube && cueText ? (
          <div
            className={`pointer-events-none absolute inset-x-0 z-20 flex justify-center px-6 transition-all ${
              controlsVisible ? "bottom-24 sm:bottom-28" : "bottom-8"
            }`}
          >
            <p className="max-w-[90%] whitespace-pre-line rounded-xl bg-black/65 px-3 py-1.5 text-center text-base font-semibold leading-snug text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.9)] sm:text-xl">
              {cueText}
            </p>
          </div>
        ) : null}

        {!started ? (
          <div className="absolute inset-0">
            {poster ? (
              <img src={poster} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-brand" />
            )}
            <div className="absolute inset-0 grid place-items-center bg-black/25">
              <button
                type="button"
                aria-label={`Reproduzir ${title}`}
                onClick={() => {
                  setStarted(true);
                  revealControls();
                }}
                className="grid h-20 w-20 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow transition-transform hover:scale-110 sm:h-24 sm:w-24"
              >
                <Play className="h-9 w-9 fill-current sm:h-11 sm:w-11" />
              </button>
            </div>
          </div>
        ) : null}

        {started ? (
          <div
            className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-3 pb-3 pt-14 transition-opacity duration-300 sm:px-4 sm:pb-4 sm:pt-20 ${
              controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <input
              type="range"
              aria-label="Barra de progresso"
              min={0}
              max={Math.max(duration, 1)}
              step={1}
              value={Math.min(current, duration || 0)}
              disabled={!ready && isYouTube}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-primary sm:h-2"
            />

            <div className="mt-2 flex flex-wrap items-center gap-2 text-white sm:gap-3">
              {onBack ? (
                <button onClick={onBack} aria-label="Voltar" className={btn}>
                  <ArrowLeft className="h-5 w-5" />
                </button>
              ) : null}

              <button
                aria-label="Voltar 10 segundos"
                onClick={() => seekTo(Math.max(0, current - 10))}
                className={btn}
              >
                <RotateCcw className="h-5 w-5" />
              </button>

              <button
                aria-label={playing ? "Pausar" : "Reproduzir"}
                onClick={togglePlay}
                className="grid h-12 w-12 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow"
              >
                {playing ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 fill-current" />
                )}
              </button>

              <button
                aria-label="Avançar 10 segundos"
                onClick={() => seekTo(Math.min(duration || current + 10, current + 10))}
                className={btn}
              >
                <RotateCw className="h-5 w-5" />
              </button>

              <span className="font-display text-xs tabular-nums sm:text-sm">
                {fmt(current)} / {fmt(duration)}
              </span>

              <div className="ml-auto flex items-center gap-2">
                {isYouTube ? (
                  <button
                    type="button"
                    aria-label={
                      ytCaptionsEnabled
                        ? "Desativar legendas do YouTube"
                        : "Ativar legendas do YouTube"
                    }
                    aria-pressed={ytCaptionsEnabled}
                    title={ytCaptionsEnabled ? "Desativar legendas" : "Ativar legendas do YouTube"}
                    onClick={toggleYoutubeCaptions}
                    className={`${btn} ${
                      ytCaptionsEnabled
                        ? "bg-primary text-primary-foreground hover:bg-primary"
                        : ""
                    }`}
                  >
                    {ytCaptionsEnabled ? (
                      <Captions className="h-5 w-5" />
                    ) : (
                      <CaptionsOff className="h-5 w-5" />
                    )}
                  </button>
                ) : localTracks.length > 0 ? (
                  <div className="relative">
                    <button
                      aria-label="Legendas"
                      aria-pressed={Boolean(activeLang)}
                      onClick={() => setCcMenu((v) => !v)}
                      className={`${btn} ${
                        activeLang ? "bg-primary text-primary-foreground hover:bg-primary" : ""
                      }`}
                    >
                      {activeLang ? (
                        <Captions className="h-5 w-5" />
                      ) : (
                        <CaptionsOff className="h-5 w-5" />
                      )}
                    </button>

                    {ccMenu ? (
                      <div className="absolute bottom-14 right-0 z-50 w-48 overflow-hidden rounded-2xl border border-white/15 bg-black/95 p-1 text-left">
                        <p className="px-3 py-2 font-display text-xs uppercase text-white/60">
                          Legendas
                        </p>
                        <button
                          onClick={() => chooseLanguage(null)}
                          className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${
                            activeLang
                              ? "text-white/80 hover:bg-white/10"
                              : "bg-white/15 text-white"
                          }`}
                        >
                          Desativadas
                        </button>
                        {localTracks.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => chooseLanguage(t.languageCode)}
                            className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${
                              activeLang === t.languageCode
                                ? "bg-white/15 text-white"
                                : "text-white/80 hover:bg-white/10"
                            }`}
                          >
                            {t.languageName}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <button
                  aria-label={muted ? "Ativar som" : "Silenciar"}
                  onClick={() => {
                    const next = !muted;
                    setMutedState(next);
                    engine.setMuted(next);
                  }}
                  className={btn}
                >
                  {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>

                <input
                  type="range"
                  aria-label="Volume"
                  min={0}
                  max={100}
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setVolumeState(v);
                    setMutedState(v === 0);
                    engine.setMuted(v === 0);
                    engine.setVolume(v);
                  }}
                  className="hidden h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-white/25 accent-primary sm:block"
                />

                <button aria-label="Tela cheia" onClick={toggleFullscreen} className={btn}>
                  {fullscreen ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
