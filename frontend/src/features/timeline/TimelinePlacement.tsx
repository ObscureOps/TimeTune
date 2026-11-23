import { useState } from "react";
import type { Song } from "../../types/song";
import { isCorrectPlacement } from "../../utils/songUtils";
import "./TimelinePlacement.css";

type PlacementResult = "correct" | "incorrect" | null;

type Props = {
  startingSong: Song;
  drawnSong: Song;
  timeline: Song[];
  round: number;
  onPlacementResult: (timeline: Song[]) => void;
  onNextRound: () => void;
  onRestart: () => void;
  tokens: number;
  onSpendToken: () => void;
  localPlayers: string[];
  currentPlayerIndex: number;
  playerTokens: number[];
  onStealSelected: (playerIndex: number) => void;
};

export default function TimelinePlacement({
  startingSong,
  drawnSong,
  timeline: initialTimeline,
  round,
  onPlacementResult,
  onNextRound,
  onRestart,
  tokens,
  onSpendToken,
  localPlayers,
  currentPlayerIndex,
  playerTokens,
  onStealSelected,
}: Props) {
  const [timeline, setTimeline] = useState<Song[]>(
    initialTimeline.length > 0 ? initialTimeline : [startingSong],
  );

  const [selectedSlot, setSelectedSlot] = useState<number | null>(
    null,
  );

  const [dragOverSlot, setDragOverSlot] = useState<number | null>(
    null,
  );

  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<PlacementResult>(null);
  const [completed, setCompleted] = useState(false);
  const [lockedSlot, setLockedSlot] = useState<number | null>(null);
  const [stealMode, setStealMode] = useState(false);
  const [stealSlot, setStealSlot] = useState<number | null>(null);
  const [stealResult, setStealResult] = useState<boolean | null>(null);
  const [selectedStealer, setSelectedStealer] = useState<number | null>(null);

  const slots = timeline.length + 1;

  function selectSlot(slotIndex: number) {
    if (revealed || lockedSlot !== null) return;

    setSelectedSlot(slotIndex);
    setDragOverSlot(null);
  }

  function handleDragStart(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    if (revealed || lockedSlot !== null) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", drawnSong.id);

    setDragOverSlot(null);
  }

  function handleDragOver(
    event: React.DragEvent<HTMLButtonElement>,
    slotIndex: number,
  ) {
    if (revealed) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    setDragOverSlot(slotIndex);
  }

  function handleDrop(
    event: React.DragEvent<HTMLButtonElement>,
    slotIndex: number,
  ) {
    event.preventDefault();

    if (revealed) return;

    const draggedCard = event.dataTransfer.getData("text/plain");

    if (draggedCard !== drawnSong.id) return;

    setSelectedSlot(slotIndex);
    setDragOverSlot(null);
  }

  function commitPlacement() {
    if (selectedSlot === null || revealed || lockedSlot !== null) return;
    setLockedSlot(selectedSlot);
  }

  function resolveWithoutSteal() {
    if (lockedSlot === null) return;
    const correct = isCorrectPlacement(drawnSong, timeline, lockedSlot);
    setRevealed(true);
    setResult(correct ? "correct" : "incorrect");
    if (correct) {
      const nextTimeline = [...timeline];
      nextTimeline.splice(lockedSlot, 0, drawnSong);
      setTimeline(nextTimeline);
      onPlacementResult(initialTimeline.length === 0 ? [drawnSong] : nextTimeline);
    }
  }

  function beginSteal(playerIndex: number) {
    if (lockedSlot === null || playerIndex === currentPlayerIndex) return;
    if ((playerTokens[playerIndex] ?? 0) < 1) return;
    onStealSelected(playerIndex);
    setSelectedStealer(playerIndex);
    setStealMode(true);
    setStealSlot(null);
  }

  function resolveSteal() {
    if (stealSlot === null || lockedSlot === null) return;
    const originalCorrect = isCorrectPlacement(drawnSong, timeline, lockedSlot);
    const stealCorrect = !originalCorrect && isCorrectPlacement(drawnSong, timeline, stealSlot);
    setStealResult(stealCorrect);
    setRevealed(true);
    setResult(originalCorrect ? "correct" : "incorrect");
    if (originalCorrect) {
      const nextTimeline = [...timeline];
      nextTimeline.splice(lockedSlot, 0, drawnSong);
      setTimeline(nextTimeline);
      onPlacementResult(nextTimeline);
    }
  }

  function continueGame() {
    onNextRound();
  }

  function resetPlacement() {
    setTimeline([startingSong]);
    setSelectedSlot(null);
    setDragOverSlot(null);
    setRevealed(false);
    setResult(null);
    setCompleted(false);
    setLockedSlot(null);
    setStealMode(false);
    setStealSlot(null);
    setStealResult(null);
    setSelectedStealer(null);
  }

  if (completed) {
    return (
      <section className="timeline-stage timeline-complete">
        <div className="timeline-result-icon">✓</div>

        <p className="timeline-eyebrow">PLACEMENT COMPLETE</p>

        <h1>Nice work.</h1>

        <p className="timeline-description">
          You've successfully completed this timeline placement
          prototype.
        </p>

        <div className="timeline-summary">
          <span className="summary-label">YOUR TIMELINE</span>

          <div className="summary-cards">
            {timeline.map((card) => (
              <div className="summary-card" key={card.id}>
                <span>{card.year}</span>
                <strong>{card.title}</strong>
                <small>{card.artist}</small>
              </div>
            ))}
          </div>
        </div>

        <button className="timeline-primary" onClick={onRestart}>
          Play listening phase again <span>↻</span>
        </button>

        <button
          className="timeline-secondary"
          onClick={resetPlacement}
        >
          Try placement again
        </button>
      </section>
    );
  }

  return (
    <section className="timeline-stage">
      <header className="timeline-heading">
        <div>
          <p className="timeline-eyebrow">
            THE CHRONOLOGICAL CHALLENGE
          </p>

          <h1>
            Where does
            <br />
            it belong?
          </h1>
        </div>

        <div className="timeline-round">
          <span>YOUR TIMELINE</span>
          <strong>
            {timeline.length} {timeline.length === 1 ? "CARD" : "CARDS"}
          </strong>
        </div>
      </header>

      <p className="timeline-description">
        Drag the mystery card into the timeline. The cards will make
        room for your placement.
      </p>

      <div className="timeline-board">
        <div className="timeline-track-label">
          <span>EARLIER</span>
          <span className="timeline-track-line" />
          <span>LATER</span>
        </div>

        <div className="timeline-cards">
          {Array.from({ length: slots }, (_, slotIndex) => {
            const isSelected = selectedSlot === slotIndex;
            const isDragOver = dragOverSlot === slotIndex;

            return (
              <div
                className={`timeline-position ${
                  isSelected ? "position-selected" : ""
                } ${
                  isDragOver ? "position-drag-over" : ""
                }`}
                key={`slot-${slotIndex}`}
              >
                <button
                  className={`timeline-slot ${
                    isSelected ? "selected" : ""
                  } ${
                    isDragOver ? "drag-over" : ""
                  } ${revealed ? "locked" : ""}`}
                  onClick={() => stealMode ? setStealSlot(slotIndex) : selectSlot(slotIndex)}
                  onDragOver={(event) =>
                    handleDragOver(event, slotIndex)
                  }
                  onDragLeave={() => {
                    if (dragOverSlot === slotIndex) {
                      setDragOverSlot(null);
                    }
                  }}
                  onDrop={(event) =>
                    handleDrop(event, slotIndex)
                  }
                  disabled={revealed || (lockedSlot !== null && !stealMode)}
                  aria-label={`Place song at position ${
                    slotIndex + 1
                  }`}
                >
                  <span className="slot-plus">
                    {isSelected || isDragOver ? "↓" : "+"}
                  </span>

                  <span className="slot-label">
                    {isDragOver
                      ? "DROP HERE"
                      : isSelected
                        ? "SELECTED"
                        : "PLACE HERE"}
                  </span>
                </button>

                {slotIndex < timeline.length && (
                  <TimelineCard card={timeline[slotIndex]} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="timeline-card-area">
        <div className="timeline-card-instruction">
          <span className="instruction-line" />

          <span>
            {revealed ? "CARD REVEALED" : stealMode ? "STEAL COMMITTED · CHOOSE REBATTLE SLOT" : lockedSlot !== null ? "PLACEMENT LOCKED · STEAL WINDOW" : "DRAG THE MYSTERY CARD INTO YOUR TIMELINE"}
          </span>

          <span className="instruction-line" />
        </div>

        <div
          className={`drawn-card ${
            revealed ? "flipped" : ""
          } ${
            selectedSlot !== null && !revealed
              ? "card-selected"
              : ""
          }`}
          draggable={!revealed && lockedSlot === null && !stealMode}
          onDragStart={handleDragStart}
          onDragEnd={() => setDragOverSlot(null)}
          role="group"
          aria-label="Mystery song card. Drag it to a timeline position."
        >
          <div className="drawn-card-front">
            <div className="card-front-top">
              <span className="card-edition">TT / 004</span>
              <span className="card-symbol">✳</span>
            </div>

            <div className="card-vinyl-art">
              <div className="card-vinyl">
                <div className="card-vinyl-grooves" />

                <div className="card-vinyl-label">
                  <span>TT</span>
                </div>
              </div>

              <div className="card-art-orbit orbit-one" />
              <div className="card-art-orbit orbit-two" />
            </div>

            <div className="card-front-bottom">
              <span className="card-brand">TIMETUNE</span>
              <span className="card-question">?</span>
              <span className="card-year-label">UNKNOWN YEAR</span>
            </div>

            <div className="card-drag-indicator">
              <span>↕</span>
              DRAG TO PLACE
            </div>
          </div>

          <div className="drawn-card-back">
            <div className="card-back-top">
              <span>TIME TUNE</span>
              <span>REVEALED</span>
            </div>

            <div className="card-back-art">
              <div className="card-back-disc">
                <div className="card-back-label">TT</div>
              </div>
            </div>

            <span className="drawn-card-year">
              {drawnSong.year}
            </span>

            <strong>{drawnSong.title}</strong>

            <span className="drawn-card-artist">
              {drawnSong.artist}
            </span>

            <div className="card-back-bottom">
              <span>THE CHRONOLOGICAL CHALLENGE</span>
              <span>004 / 030</span>
            </div>
          </div>
        </div>
      </div>

      {!revealed && lockedSlot === null ? (
        <div className="timeline-actions">
          <button className="timeline-primary" disabled={selectedSlot === null} onClick={commitPlacement}>Lock placement <span>↗</span></button>
          <p className="timeline-action-hint">Placement locks before the steal window.</p>
        </div>
      ) : !revealed && !stealMode ? (
        <div className="timeline-feedback steal-window">
          <div className="feedback-heading"><span className="feedback-icon">!</span><div><strong>Steal window open</strong><span>Players decide their own house rules. Choose who agreed to steal.</span></div></div>
          <div className="local-steal-player-list">
            {localPlayers.map((player, index) => {
              const balance = playerTokens[index] ?? 0;
              const isCurrent = index === currentPlayerIndex;
              const unavailable = isCurrent || balance < 1;
              return <button key={index} className="local-steal-player" disabled={unavailable} onClick={() => beginSteal(index)}>
                <span className="local-steal-player-copy"><strong>{player}</strong><small>{isCurrent ? "Current player · cannot steal own card" : balance + (balance === 1 ? " chip" : " chips")}</small></span>
                <span className={"local-steal-status" + (unavailable ? " disabled" : "")}>{isCurrent ? "CURRENT" : balance < 1 ? "NO CHIPS" : "STEAL →"}</span>
              </button>;
            })}
          </div>
          <button className="timeline-primary" onClick={resolveWithoutSteal}>No steal · reveal <span>↗</span></button>
        </div>
      ) : !revealed && stealMode ? (
        <div className="timeline-actions">
          <p className="timeline-action-hint">The selected player committed to stealing. Choose a rebattle position.</p>
          <button className="timeline-primary" disabled={stealSlot === null} onClick={resolveSteal}>Lock rebattle <span>↗</span></button>
          <button className="timeline-secondary" onClick={() => {setStealMode(false);setStealSlot(null);}}>Cancel simulation</button>
        </div>
      ) : (
        <div className={`timeline-feedback ${result}`}>
          <div className="feedback-heading">
            <span className="feedback-icon">{result === "correct" ? "✓" : "×"}</span>
            <div>
              <strong>{stealResult !== null ? (stealResult ? "STEAL SUCCESSFUL" : "STEAL FAILED") : result === "correct" ? "Correct placement!" : "Not quite right."}</strong>
              <span>{stealResult !== null ? (stealResult ? "The selected player placed the card correctly and wins it." : "The selected player placed it incorrectly. The card is discarded.") : result === "correct" ? "The card has been added to your timeline." : "The card was discarded. The timeline stays unchanged."}</span>
            </div>
          </div>
          <button className="timeline-primary" onClick={continueGame}>Next song <span>↗</span></button>
        </div>
      )}
    </section>
  );
}

function TimelineCard({ card }: { card: Song }) {
  return (
    <article className="timeline-song-card">
      <div className="timeline-card-top">
        <span className="timeline-card-year">
          {card.year}
        </span>

        <span className="timeline-card-icon">✳</span>
      </div>

      <div className="timeline-card-art">
        <div className="timeline-card-disc">
          <div className="timeline-card-disc-label" />
        </div>
      </div>

      <strong>{card.title}</strong>

      <span className="timeline-card-artist">
        {card.artist}
      </span>

      <span className="timeline-card-number">TT / 001</span>
    </article>
  );
}
