
import { useEffect, useRef } from "react";
import "./YouTubePlayer.css";

interface YTPlayerState {
  UNSTARTED: number;
  ENDED: number;
  PLAYING: number;
  PAUSED: number;
  BUFFERING: number;
  CUED: number;
}

interface YTPlayerConstructorOptions {
  videoId: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerStateEvent) => void;
    onError?: (event: YTPlayerErrorEvent) => void;
  };
}

interface YTNamespace {
  Player: new (
    element: HTMLElement,
    options: YTPlayerConstructorOptions,
  ) => YTPlayer;

  PlayerState: YTPlayerState;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  destroy(): void;
}

interface YTPlayerEvent {
  target: YTPlayer;
}

interface YTPlayerStateEvent {
  target: YTPlayer;
  data: number;
}

interface YTPlayerErrorEvent {
  target: YTPlayer;
  data: number;
}

export type PlaybackState =
  | "unstarted"
  | "playing"
  | "paused"
  | "buffering"
  | "ended";

export interface YouTubePlayerControls {
  play: () => void;
  pause: () => void;
  replay: () => void;
  stop: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

interface YouTubePlayerProps {
  videoId: string;
  onPlaybackStateChange?: (state: PlaybackState) => void;
  onEnded?: () => void;
  onError?: (errorCode: number) => void;
  onReady?: (controls: YouTubePlayerControls) => void;
  autoplay?: boolean;
}

const API_URL = "https://www.youtube.com/iframe_api";
const API_TIMEOUT_MS = 15_000;

let apiPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (apiPromise) {
    return apiPromise;
  }

  apiPromise = new Promise<void>((resolve, reject) => {
    let settled = false;

    const timeoutId = window.setTimeout(() => {
      finish(new Error("YouTube API loading timed out."));
    }, API_TIMEOUT_MS);

    const finish = (error?: Error) => {
      if (settled) return;

      settled = true;
      window.clearTimeout(timeoutId);

      if (error) {
        apiPromise = null;
        reject(error);
        return;
      }

      resolve();
    };

    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      try {
        previousCallback?.();
      } catch (error) {
        console.error("Previous YouTube API callback failed:", error);
      }

      if (window.YT?.Player) {
        finish();
      }
    };

    const existingScript =
      document.querySelector<HTMLScriptElement>(
        `script[src="${API_URL}"]`,
      );

    if (!existingScript) {
      const script = document.createElement("script");

      script.src = API_URL;
      script.async = true;

      script.onerror = () => {
        finish(
          new Error("Failed to load the YouTube IFrame API."),
        );
      };

      document.head.appendChild(script);
    }

    if (window.YT?.Player) {
      finish();
    }
  });

  return apiPromise;
}

function getPlaybackState(state: number): PlaybackState {
  const playerState = window.YT?.PlayerState;

  if (!playerState) {
    return "unstarted";
  }

  switch (state) {
    case playerState.PLAYING:
      return "playing";

    case playerState.PAUSED:
      return "paused";

    case playerState.BUFFERING:
      return "buffering";

    case playerState.ENDED:
      return "ended";

    default:
      return "unstarted";
  }
}

function safelyCall(callback: () => void) {
  try {
    callback();
  } catch (error) {
    console.error("YouTube player operation failed:", error);
  }
}

function safelyRead(callback: () => number): number {
  try {
    const value = callback();

    return Number.isFinite(value) && value >= 0
      ? value
      : 0;
  } catch {
    return 0;
  }
}

export default function YouTubePlayer({
  videoId,
  onPlaybackStateChange,
  onEnded,
  onError,
  onReady,
  autoplay = false,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  const callbacksRef = useRef({
    onPlaybackStateChange,
    onEnded,
    onError,
    onReady,
  });

  useEffect(() => {
    callbacksRef.current = {
      onPlaybackStateChange,
      onEnded,
      onError,
      onReady,
    };
  }, [
    onPlaybackStateChange,
    onEnded,
    onError,
    onReady,
  ]);

  useEffect(() => {
    let cancelled = false;
    let localPlayer: YTPlayer | null = null;

    async function initialize() {
      try {
        await loadYouTubeAPI();

        if (
          cancelled ||
          !containerRef.current ||
          !window.YT?.Player
        ) {
          return;
        }

        containerRef.current.innerHTML = "";

        localPlayer = new window.YT.Player(
          containerRef.current,
          {
            videoId,

            playerVars: {
              autoplay: 0,
              controls: 1,
              playsinline: 1,
              rel: 0,
              enablejsapi: 1,
              origin: window.location.origin,
            },

            events: {
              onReady: (event) => {
                if (cancelled) {
                  safelyCall(() => event.target.destroy());
                  return;
                }

                playerRef.current = event.target;

                const controls: YouTubePlayerControls = {
                  play: () => {
                    safelyCall(() => event.target.playVideo());
                  },

                  pause: () => {
                    safelyCall(() => event.target.pauseVideo());
                  },

                  replay: () => {
                    safelyCall(() => {
                      event.target.seekTo(0, true);
                      event.target.playVideo();
                    });
                  },

                  stop: () => {
                    safelyCall(() => event.target.stopVideo());
                  },

                  getCurrentTime: () =>
                    safelyRead(() =>
                      event.target.getCurrentTime(),
                    ),

                  getDuration: () =>
                    safelyRead(() =>
                      event.target.getDuration(),
                    ),
                };

                callbacksRef.current.onReady?.(controls);

                if (autoplay) {
                  controls.play();
                }
              },

              onStateChange: (event) => {
                if (cancelled) return;

                const playbackState = getPlaybackState(
                  event.data,
                );

                callbacksRef.current
                  .onPlaybackStateChange?.(playbackState);

                if (playbackState === "ended") {
                  callbacksRef.current.onEnded?.();
                }
              },

              onError: (event) => {
                if (cancelled) return;

                callbacksRef.current.onError?.(
                  event.data,
                );
              },
            },
          },
        );

        playerRef.current = localPlayer;
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to initialize YouTube player:",
            error,
          );

          callbacksRef.current.onError?.(-1);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;

      if (localPlayer) {
        safelyCall(() => localPlayer?.destroy());
      }

      if (playerRef.current === localPlayer) {
        playerRef.current = null;
      }
    };
  }, [videoId, autoplay]);

  return (
    <div className="youtube-player-container">
      <div
        ref={containerRef}
        className="youtube-player"
        aria-label="YouTube music player"
      />
    </div>
  );
}
