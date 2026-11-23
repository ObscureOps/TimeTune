import { useEffect, useReducer, useRef, useState } from "react";
import YouTubePlayer, { type YouTubePlayerControls, type PlaybackState } from "./features/player/YouTubePlayer";
import type { CSSProperties } from "react";
import songs from "./data/songs.json";
import type { Song } from "./types/song";
import { getRandomUnusedSong, getCorrectInsertionIndex } from "./utils/songUtils";
import TimelinePlacement from "./features/timeline/TimelinePlacement";
import LocalLobby from "./features/local/LocalLobby";

type Phase =
  | "countdown"
  | "handoff"
  | "listening"
  | "guessing"
  | "reveal"
  | "placement"
  | "won";

type GameState = {
  phase: Phase;
  countdown: number;
  seconds: number;
  duration: number;
  playing: boolean;
  titleGuess: string;
  artistGuess: string;
  correct: boolean | null;
  tokens: number;
  startingSong: Song;
  drawnSong: Song;
  timeline: Song[];
  usedSongIds: string[];
  round: number;
};

type Action =
  | { type: "TICK_COUNTDOWN" }
  | { type: "START_NEXT_TURN" }
  | { type: "SET_PLAYBACK"; state: PlaybackState }
  | { type: "SET_PROGRESS"; seconds: number; duration: number }
  | { type: "OPEN_GUESS" }
  | { type: "REPLAY" }
  | { type: "SKIP_SONG"; state: GameState }
  | { type: "DIRECT_CLAIM"; state: GameState }
  | { type: "SET_TITLE"; value: string }
  | { type: "SET_ARTIST"; value: string }
  | { type: "LOCK_GUESS" }
  | { type: "CONTINUE" }
  | { type: "PLACEMENT_RESULT"; timeline: Song[] }
  | { type: "SPEND_TOKEN" }
  | { type: "NEXT_ROUND"; state: GameState }
  | { type: "RESET"; state: GameState };

const SONGS = songs as Song[];

const WAVEFORM_HEIGHTS = [
  8, 15, 29, 16, 44, 58, 28, 13, 17, 38, 62, 48,
  19, 10, 27, 41, 30, 17, 12, 8, 14, 6, 9, 18,
  5, 10, 7, 13, 19, 8, 14, 25, 20, 11, 17, 45,
  54, 22, 13, 32, 66, 40, 20, 49, 34, 57, 18, 14,
];

function createInitialState(): GameState {
  const startingSong = getRandomUnusedSong(SONGS, []);

  if (!startingSong) {
    throw new Error("The song dataset is empty.");
  }

  const drawnSong = getRandomUnusedSong(SONGS, [startingSong.id]);

  if (!drawnSong) {
    throw new Error("At least two songs are required to start a game.");
  }

  return {
    phase: "countdown",
    countdown: 3,
    seconds: 0,
    duration: 0,
    playing: false,
    titleGuess: "",
    artistGuess: "",
    correct: null,
    tokens: 1,
    startingSong,
    drawnSong,
    timeline: [],
    usedSongIds: [startingSong.id, drawnSong.id],
    round: 1,
  };
}

function normalizeGuess(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function isTitleCorrect(guess: string, title: string): boolean {
  return normalizeGuess(guess) === normalizeGuess(title);
}

function isArtistCorrect(guess: string, artist: string): boolean {
  const normalizedGuess = normalizeGuess(guess);
  const normalizedArtist = normalizeGuess(artist);

  return (
    normalizedGuess.length > 0 &&
    normalizedArtist.includes(normalizedGuess)
  );
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START_NEXT_TURN":
      return { ...state, phase: "countdown", countdown: 3, playing: false, seconds: 0, duration: 0 };

    case "TICK_COUNTDOWN":
      if (state.countdown <= 1) {
        return {
          ...state,
          phase: "listening",
          countdown: 0,
          playing: false,
        };
      }

      return {
        ...state,
        countdown: state.countdown - 1,
      };

    case "SET_PLAYBACK":
      return {
        ...state,
        playing: action.state === "playing",
        phase: action.state === "ended" && state.phase === "listening"
          ? "guessing"
          : state.phase,
      };

    case "SET_PROGRESS":
      return {
        ...state,
        seconds: action.seconds,
        duration: action.duration,
      };

    case "OPEN_GUESS":
      return {
        ...state,
        phase: "guessing",
        playing: false,
      };

    case "REPLAY":
      return {
        ...state,
        seconds: 0,
        playing: true,
        phase: "listening",
      };

    case "SKIP_SONG":
      return action.state;

    case "DIRECT_CLAIM":
      return action.state;

    case "SET_TITLE":
      return {
        ...state,
        titleGuess: action.value,
      };

    case "SET_ARTIST":
      return {
        ...state,
        artistGuess: action.value,
      };

    case "LOCK_GUESS": {
      const titleCorrect = isTitleCorrect(
        state.titleGuess,
        state.drawnSong.title,
      );

      const artistCorrect = isArtistCorrect(
        state.artistGuess,
        state.drawnSong.artist,
      );

      const correct = titleCorrect && artistCorrect;

      return {
        ...state,
        phase: "reveal",
        correct,
        tokens: correct
          ? Math.min(5, state.tokens + 1)
          : state.tokens,
      };
    }

    case "CONTINUE":
      return {
        ...state,
        phase: "placement",
      };

    case "PLACEMENT_RESULT":
      return { ...state, timeline: action.timeline };

    case "SPEND_TOKEN":
      return { ...state, tokens: Math.max(0, state.tokens - 1) };

    case "NEXT_ROUND":
      return action.state;

    case "RESET":
      return action.state;

    default:
      return state;
  }
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export default function App() {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    createInitialState,
  );
  const playerControlsRef = useRef<YouTubePlayerControls | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [powerUpsOpen, setPowerUpsOpen] = useState(false);
  const [showLocalLobby, setShowLocalLobby] = useState(true);
  const [localPlayers, setLocalPlayers] = useState<string[]>([]);
  const [localPlayerIndex, setLocalPlayerIndex] = useState(0);
  const [localTokenBalances, setLocalTokenBalances] = useState<number[]>([]);
  const [localTimelines, setLocalTimelines] = useState<Song[][]>([]);

  useEffect(() => {
    if (state.phase !== "countdown") return;

    const timer = window.setTimeout(
      () => dispatch({ type: "TICK_COUNTDOWN" }),
      900,
    );

    return () => window.clearTimeout(timer);
  }, [state.phase, state.countdown]);

  useEffect(() => {
    if (state.phase === "guessing" || state.phase === "reveal" || state.phase === "placement") {
      playerControlsRef.current?.pause();
    }
  }, [state.phase]);

  useEffect(() => {
    if (!state.playing || state.phase !== "listening") return;

    const timer = window.setInterval(() => {
      const controls = playerControlsRef.current;
      if (!controls) return;
      dispatch({
        type: "SET_PROGRESS",
        seconds: controls.getCurrentTime(),
        duration: controls.getDuration(),
      });
    }, 250);

    return () => window.clearInterval(timer);
  }, [state.playing, state.phase]);

  function restartGame() {
    dispatch({
      type: "RESET",
      state: createInitialState(),
    });
  }

  const progress = state.duration > 0 ? (state.seconds / state.duration) * 100 : 0;

  const activeBarIndex = Math.floor((progress / 100) * WAVEFORM_HEIGHTS.length);

  if (showLocalLobby) {
    return <LocalLobby onStart={(players) => { setLocalPlayers(players); setLocalTokenBalances(players.map(() => 1)); setLocalTimelines(players.map(() => [])); setLocalPlayerIndex(0); setShowLocalLobby(false); }} />;
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="TimeTune home">
          <span className="wordmark-mark">T</span>
          <span>TimeTune</span>
        </a>

        <div className="round-label">
          <span className="live-dot" />
          ROUND {String(state.round).padStart(2, "0")} · {localPlayers[localPlayerIndex] ?? "PLAYER"}
        </div>
        <div className="local-scoreboard" aria-label="Local player standings">
          {localPlayers.map((player, index) => <span key={index} className={index === localPlayerIndex ? "scoreboard-player active" : "scoreboard-player"}><strong>{player}</strong><small>{localTimelines[index]?.length ?? 0}/10 · {index === localPlayerIndex ? state.tokens : localTokenBalances[index] ?? 1} chips</small></span>)}
        </div>

        <button className={`token-counter chip-level-${state.tokens}`} aria-label={`Open power-ups. ${state.tokens} tokens`} aria-expanded={powerUpsOpen} onClick={() => setPowerUpsOpen((open) => !open)}>
          <span className="token-chip" aria-hidden="true"><span className="chip-inner">{state.tokens}</span></span><strong>{state.tokens}</strong><span className="token-label">POWER-UPS</span>
        </button>
        {powerUpsOpen && <div className="power-up-menu" role="dialog" aria-label="Token power-ups">
          <div className="power-up-heading"><span>POWER-UPS</span><button className="power-up-close" onClick={() => setPowerUpsOpen(false)} aria-label="Close">×</button></div><p className="power-up-subtitle">Spend your chips to change the turn.</p>
          <button className="power-up-action" disabled={state.tokens < 1 || !["listening","guessing"].includes(state.phase)} onClick={() => {playerControlsRef.current?.stop();const nextSong=getRandomUnusedSong(SONGS,state.usedSongIds);if(!nextSong)return;dispatch({type:"SKIP_SONG",state:{...state,phase:"countdown",countdown:3,seconds:0,duration:0,playing:false,titleGuess:"",artistGuess:"",correct:null,tokens:state.tokens-1,drawnSong:nextSong,usedSongIds:[...state.usedSongIds,nextSong.id],round:state.round+1}});setPowerUpsOpen(false);}}>
            <span className="power-up-name"><span className="action-mark">↻</span><span><strong>Skip song</strong><small>Draw a new track</small></span></span><span className="action-cost">1 CHIP</span></button>
          <button className="power-up-action" disabled={state.tokens < 3 || !["listening","guessing"].includes(state.phase)} onClick={() => {playerControlsRef.current?.stop();const nextSong=getRandomUnusedSong(SONGS,state.usedSongIds);if(!nextSong)return;const nextTimeline=[...state.timeline];nextTimeline.splice(getCorrectInsertionIndex(state.drawnSong,nextTimeline),0,state.drawnSong);const savedTimelines=localTimelines.map((timeline,index)=>index===localPlayerIndex?nextTimeline:timeline);const savedBalances=localTokenBalances.map((balance,index)=>index===localPlayerIndex?state.tokens-3:balance);setLocalTimelines(savedTimelines);setLocalTokenBalances(savedBalances);const winnerIndex=savedTimelines.findIndex((timeline)=>timeline.length>=10);if(winnerIndex>=0){setLocalPlayerIndex(winnerIndex);dispatch({type:"DIRECT_CLAIM",state:{...state,phase:"won",tokens:savedBalances[winnerIndex]??0,timeline:savedTimelines[winnerIndex],drawnSong:nextSong,usedSongIds:[...state.usedSongIds,nextSong.id],round:state.round+1}});}else{const nextPlayerIndex=(localPlayerIndex+1)%localPlayers.length;setLocalPlayerIndex(nextPlayerIndex);dispatch({type:"DIRECT_CLAIM",state:{...state,phase:"handoff",tokens:savedBalances[nextPlayerIndex]??1,timeline:savedTimelines[nextPlayerIndex]??[],drawnSong:nextSong,usedSongIds:[...state.usedSongIds,nextSong.id],round:state.round+1}});}setPowerUpsOpen(false);}}>
            <span className="power-up-name"><span className="action-mark">✦</span><span><strong>Direct claim</strong><small>Claim without placement risk</small></span></span><span className="action-cost">3 CHIPS</span></button><div className="power-up-footer">NAME BOTH TITLE + ARTIST TO EARN A CHIP</div></div>}
      </header>

      {state.phase === "handoff" && (
        <section className="countdown-stage handoff-stage" aria-live="polite">
          <p className="eyebrow">LOCAL GAME · PASS THE DEVICE</p>
          <div className="count-number">↗</div>
          <h1>Pass to {localPlayers[localPlayerIndex] ?? "the next player"}.</h1>
          <p className="count-caption">Keep the song hidden. Start when they are ready.</p>
          <button className="lock-button" onClick={() => dispatch({ type: "START_NEXT_TURN" })}>Ready to listen <span>↗</span></button>
        </section>
      )}

      {state.phase === "countdown" && (
        <section className="countdown-stage" aria-live="polite">
          <p className="eyebrow">GET YOUR EARS READY</p>

          <div className="count-number" key={state.countdown}>
            {state.countdown}
          </div>

          <p className="count-caption">A song is coming.</p>
        </section>
      )}

      {(state.phase === "listening" ||
        state.phase === "guessing") && (
        <section className="game-stage">
          <div className="stage-copy">
            <p className="eyebrow">THE LISTENING ROOM</p>

            <h1>
              {state.phase === "guessing" ? (
                <>
                  Lock in
                  <br />
                  your guess.
                </>
              ) : (
                <>
                  Somewhere
                  <br />
                  in time.
                </>
              )}
            </h1>

            <p className="stage-description">
              {state.phase === "guessing"
                ? "Name the song and artist. Get both right to earn a token."
                : "Listen close. The title and artist are hiding in the sound."}
            </p>
          </div>

          <div
            className={`record-area ${
              state.playing ? "is-playing" : "is-stopped"
            }`}
          >
            <div className="record-shadow" />

            <div className="record">
              <div className="record-grooves" />

              <div className="record-label">
                <span className="label-small">TIMETUNE</span>
                <span className="label-star">✳</span>
                <span className="label-hole" />
              </div>
            </div>

            <svg
              className={`tonearm ${
                state.playing
                  ? "tonearm-playing"
                  : "tonearm-paused"
              }`}
              viewBox="0 0 220 260"
              aria-label="Turntable tonearm"
              role="img"
            >
              <defs>
                <linearGradient
                  id="arm-metal"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0" stopColor="#d7d7d3" />
                  <stop offset=".34" stopColor="#777873" />
                  <stop offset=".62" stopColor="#343532" />
                  <stop offset="1" stopColor="#a5a6a0" />
                </linearGradient>

                <linearGradient
                  id="headshell-metal"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0" stopColor="#d7ff39" />
                  <stop offset="1" stopColor="#9ebd25" />
                </linearGradient>

                <filter
                  id="arm-shadow"
                  x="-40%"
                  y="-40%"
                  width="180%"
                  height="180%"
                >
                  <feDropShadow
                    dx="0"
                    dy="3"
                    stdDeviation="3"
                    floodColor="#000"
                    floodOpacity=".65"
                  />
                </filter>
              </defs>

              <g className="tonearm-pivot" filter="url(#arm-shadow)">
                <circle
                  cx="178"
                  cy="35"
                  r="19"
                  fill="#242524"
                  stroke="#555753"
                  strokeWidth="1.5"
                />

                <circle
                  cx="178"
                  cy="35"
                  r="11"
                  fill="#111211"
                  stroke="#777873"
                  strokeWidth="1"
                />

                <circle cx="178" cy="35" r="4" fill="#ff4e36" />
              </g>

              <g className="tonearm-track" transform="translate(178 35)">
                <path
                  d="M0 0 L-5 38 L-45 91 L-92 147"
                  fill="none"
                  stroke="#080908"
                  strokeWidth="13"
                  strokeLinecap="round"
                />

                <path
                  d="M0 0 L-5 38 L-45 91 L-92 147"
                  fill="none"
                  stroke="url(#arm-metal)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />

                <path
                  d="M-3 20 L-7 38"
                  stroke="#d6d6d1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <g
                  className="tonearm-head"
                  transform="translate(-92 147) rotate(38)"
                >
                  <rect
                    x="-13"
                    y="-9"
                    width="28"
                    height="20"
                    rx="4"
                    fill="url(#headshell-metal)"
                    stroke="#758b20"
                    strokeWidth="1"
                  />

                  <text
                    x="1"
                    y="-1"
                    textAnchor="middle"
                    fontFamily="DM Mono, monospace"
                    fontSize="6.5"
                    fontWeight="700"
                    fill="#171717"
                  >
                    SIDE
                  </text>

                  <text
                    x="1"
                    y="7"
                    textAnchor="middle"
                    fontFamily="DM Mono, monospace"
                    fontSize="9"
                    fontWeight="700"
                    fill="#171717"
                  >
                    A
                  </text>

                  <path
                    d="M-2 10 L-2 20"
                    stroke="#aeb0aa"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M-2 20 L-2 25"
                    stroke="#f4f1e9"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </g>
              </g>
            </svg>
          </div>

          <div className="player-panel">
            {state.drawnSong.youtubeId ? (
              <YouTubePlayer
                videoId={state.drawnSong.youtubeId}
                autoplay={false}
                onReady={(controls) => {
                  playerControlsRef.current = controls;
                  setPlaybackError(null);
                  if (state.phase === "listening") controls.play();
                }}
                onPlaybackStateChange={(playbackState) => {
                  dispatch({ type: "SET_PLAYBACK", state: playbackState });
                }}
                onEnded={() => {
                  const controls = playerControlsRef.current;
                  if (controls) {
                    dispatch({
                      type: "SET_PROGRESS",
                      seconds: controls.getDuration(),
                      duration: controls.getDuration(),
                    });
                  }
                }}
                onError={(code) => setPlaybackError(`YouTube playback error (${code}). Try another video.`)}
              />
            ) : (
              <div className="youtube-unavailable" role="status">
                <strong>Song audio is not configured yet.</strong>
                <span>Add a YouTube video ID to this song's data to enable playback.</span>
              </div>
            )}
            {playbackError && <p className="player-error" role="alert">{playbackError}</p>}
            <div className="player-meta">
              <span>{state.playing ? "NOW PLAYING" : "PLAYBACK PAUSED"}</span>
              <span className="time-readout">
                {formatTime(state.seconds)} / {formatTime(state.duration)}
              </span>
            </div>

            <div
              className={`waveform ${
                state.playing
                  ? "waveform-playing"
                  : "waveform-paused"
              }`}
              role="progressbar"
              aria-label="Audio progress"
              aria-valuemin={0}
              aria-valuemax={Math.max(1, Math.floor(state.duration))}
              aria-valuenow={state.seconds}
            >
              <div className="waveform-bars">
                {WAVEFORM_HEIGHTS.map((height, index) => (
                  <span
                    key={index}
                    className={`waveform-bar ${
                      index < activeBarIndex ? "active" : ""
                    }`}
                    style={
                      {
                        "--bar-height": `${height}px`,
                        "--bar-index": index,
                      } as CSSProperties
                    }
                  />
                ))}

                <div
                  className="waveform-playhead"
                  style={{ left: `${progress}%` }}
                >
                  <span className="playhead-dot" />
                </div>
              </div>

              <div className="waveform-labels">
                <span>LISTENING</span>
                <span>THE SOUND IS YOUR CLUE</span>
              </div>
            </div>

            <div className="player-controls">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >


                <button
                  className="text-control"
                  onClick={() => {
                    playerControlsRef.current?.pause();
                    dispatch({ type: "OPEN_GUESS" });
                  }}
                >
                  Guess now <span>↗</span>
                </button>
              <button
                className="text-control skip-guess-control"
                onClick={() => {
                  playerControlsRef.current?.pause();
                  dispatch({ type: "CONTINUE" });
                }}
              >
                Skip guess <span>→</span>
              </button>
              </div>

              <button
                className="play-button"
                onClick={() => {
                  if (state.playing) playerControlsRef.current?.pause();
                  else playerControlsRef.current?.play();
                }}
                aria-label={
                  state.playing ? "Pause song" : "Play song"
                }
              >
                {state.playing ? "Ⅱ" : "▶"}
              </button>

              <span className="control-hint">
                Listen as many times as you need
              </span>
              <button
                className="text-control replay-control"
                onClick={() => {
                  playerControlsRef.current?.replay();
                  dispatch({ type: "REPLAY" });
                }}
                disabled={!state.drawnSong.youtubeId}
              >
                Replay <span>↺</span>
              </button>
            </div>
          </div>

          {state.phase === "guessing" && (
            <form
              className="guess-form"
              onSubmit={(event) => {
                event.preventDefault();
                dispatch({ type: "LOCK_GUESS" });
              }}
            >
              <div className="form-heading">
                <span>YOUR GUESS</span>
                <span className="form-rule" />
              </div>

              <label>
                <span>Song title</span>

                <input
                  autoFocus
                  value={state.titleGuess}
                  onChange={(event) =>
                    dispatch({
                      type: "SET_TITLE",
                      value: event.target.value,
                    })
                  }
                  placeholder="What is it called?"
                />
              </label>

              <label>
                <span>Artist</span>

                <input
                  value={state.artistGuess}
                  onChange={(event) =>
                    dispatch({
                      type: "SET_ARTIST",
                      value: event.target.value,
                    })
                  }
                  placeholder="Who made it?"
                />
              </label>

              <button
                className="lock-button"
                type="submit"
                disabled={
                  !state.titleGuess.trim() ||
                  !state.artistGuess.trim()
                }
              >
                Lock it in <span>↗</span>
              </button>
            </form>
          )}
        </section>
      )}

      {state.phase === "reveal" && (
        <section
          className={`reveal-stage ${
            state.correct ? "correct" : "incorrect"
          }`}
        >
          <div className="reveal-mark">
            {state.correct ? "✓" : "×"}
          </div>

          <p className="eyebrow">
            {state.correct
              ? "YOU KNOW YOUR MUSIC"
              : "THE TRACK WAS"}
          </p>

          <h1>{state.correct ? "Nailed it." : "Not quite."}</h1>

          <div className="revealed-song">
            <span className="reveal-title">
              {state.drawnSong.title}
            </span>

            <span className="reveal-artist">
              {state.drawnSong.artist}
            </span>

            <span className="reveal-year">
              {state.drawnSong.year}
            </span>
          </div>

          {state.correct && (
            <div className="token-reward">
              ✦ <strong>+1 TOKEN</strong>
            </div>
          )}

          <p className="reveal-note">
            {state.correct
              ? "Title and artist identified. Now place it in time."
              : "Keep the song in mind. Now guess where it belongs."}
          </p>

          <div className="reveal-actions">
            <button
              className="lock-button"
              onClick={() => dispatch({ type: "CONTINUE" })}
            >
              Place on timeline <span>↗</span>
            </button>

          </div>
        </section>
      )}

      {state.phase === "placement" && (
        <TimelinePlacement
          key={state.round}
          startingSong={state.startingSong}
          drawnSong={state.drawnSong}
          timeline={state.timeline}
          round={state.round}
          tokens={state.tokens}
          onSpendToken={() => dispatch({ type: "SPEND_TOKEN" })}
          localPlayers={localPlayers}
          currentPlayerIndex={localPlayerIndex}
          playerTokens={localTokenBalances.map((balance, index) => index === localPlayerIndex ? state.tokens : balance)}
          playerTimelines={localTimelines}
          onStealPlacementResult={(playerIndex, nextTimeline) => setLocalTimelines((timelines) => timelines.map((timeline, index) => index === playerIndex ? nextTimeline : timeline))}
          onStealSelected={(playerIndex) => setLocalTokenBalances((balances) => balances.map((balance, index) => index === playerIndex ? Math.max(0, balance - 1) : balance))}
          onPlacementResult={(nextTimeline) => { setLocalTimelines((timelines) => timelines.map((timeline, index) => index === localPlayerIndex ? nextTimeline : timeline)); dispatch({ type: "PLACEMENT_RESULT", timeline: nextTimeline }); }}
          onNextRound={(outcome) => {
            const nextSong = getRandomUnusedSong(SONGS, state.usedSongIds);
            if (!nextSong) {
              restartGame();
              return;
            }
            // Use the resolved outcome directly: queued React updates from placement
            // callbacks may not be visible yet when this handler advances the round.
            const savedTimelines = localTimelines.map((timeline, index) =>
              outcome?.ownerIndex === index ? outcome.timeline : timeline
            );
            const savedBalances = localTokenBalances.map((balance, index) => {
              if (index === localPlayerIndex) return state.tokens;
              if (outcome?.stealerIndex === index) return Math.max(0, balance - 1);
              return balance;
            });
            setLocalTokenBalances(savedBalances);
            setLocalTimelines(savedTimelines);
            const winnerIndex = savedTimelines.findIndex((timeline) => timeline.length >= 10);
            if (winnerIndex >= 0) {
              setLocalPlayerIndex(winnerIndex);
              dispatch({ type: "NEXT_ROUND", state: { ...state, tokens: savedBalances[winnerIndex] ?? 0, timeline: savedTimelines[winnerIndex], phase: "won" } });
              return;
            }
            const nextPlayerIndex = (localPlayerIndex + 1) % localPlayers.length;
            setLocalPlayerIndex(nextPlayerIndex);
            dispatch({
              type: "NEXT_ROUND",
              state: {
                ...state,
                tokens: savedBalances[nextPlayerIndex] ?? 1,
                timeline: savedTimelines[nextPlayerIndex] ?? [],
                phase: "handoff",
                countdown: 3,
                seconds: 0,
                duration: 0,
                playing: false,
                titleGuess: "",
                artistGuess: "",
                correct: null,
                drawnSong: nextSong,
                usedSongIds: [...state.usedSongIds, nextSong.id],
                round: state.round + 1,
              },
            });
          }}
          onRestart={restartGame}
        />
      )}

      {state.phase === "won" && (
        <section className="reveal-stage correct">
          <div className="reveal-mark">✓</div>
          <p className="eyebrow">TIMELINE COMPLETE</p>
          <h1>{localPlayers[localPlayerIndex] ?? "Player"} wins!</h1>
          <div className="revealed-song">
            <span className="reveal-title">{state.timeline.length} OFFICIAL CARDS</span>
            <span className="reveal-artist">{localPlayers[localPlayerIndex] ?? "Player"} reached the 10-card victory goal.</span>
          </div>
          <div className="reveal-actions">
            <button className="lock-button" onClick={restartGame}>
              Play again <span>↻</span>
            </button>
          </div>
        </section>
      )}

      <footer className="footer">
        <span>TIME TUNE / MUSIC THROUGH TIME</span>
        <span>YOUTUBE PLAYER · FULL TRACK</span>
      </footer>
    </main>
  );
}
