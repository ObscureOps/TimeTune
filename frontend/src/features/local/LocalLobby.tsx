import { useState } from "react";
import "./LocalLobby.css";

type Props = { onStart: (players: string[]) => void };

export default function LocalLobby({ onStart }: Props) {
  const [players, setPlayers] = useState(["Player 1", "Player 2"]);
  const maxPlayers = 8;

  function updatePlayer(index: number, name: string) {
    setPlayers((current) => current.map((player, i) => i === index ? name : player));
  }

  function addPlayer() {
    if (players.length >= maxPlayers) return;
    setPlayers((current) => [...current, "Player " + (current.length + 1)]);
  }

  function removePlayer(index: number) {
    if (players.length <= 2) return;
    setPlayers((current) => current.filter((_, i) => i !== index));
  }

  return (
    <main className="local-lobby-shell">
      <header className="local-lobby-topbar">
        <a className="wordmark" href="/" aria-label="TimeTune home"><span className="wordmark-mark">T</span><span>TimeTune</span></a>
        <span className="local-mode-badge"><span /> LOCAL MODE</span>
      </header>
      <section className="local-lobby">
        <p className="local-lobby-eyebrow">ONE DEVICE · PASS IT AROUND</p>
        <h1>Who is<br />playing?</h1>
        <p className="local-lobby-description">Add your players, then tap any name to edit it before the game starts. Everyone gets their own timeline and takes turns on this device.</p>
        <div className="local-player-list">
          {players.map((player, index) => (
            <div className="local-player-row" key={index}>
              <span className="local-player-number">{String(index + 1).padStart(2, "0")}</span>
              <input value={player} onChange={(event) => updatePlayer(index, event.target.value)} aria-label={"Player " + (index + 1) + " name"} maxLength={24} />
              {players.length > 2 && <button className="local-remove-player" onClick={() => removePlayer(index)} aria-label={"Remove " + player}>×</button>}
            </div>
          ))}
        </div>
        {players.length < maxPlayers && <button className="local-add-player" onClick={addPlayer}>＋ Add player <span>{players.length}/{maxPlayers}</span></button>}
        <button className="local-start-button" disabled={players.some((name) => !name.trim())} onClick={() => onStart(players.map((name) => name.trim()))}>Start local game <span>↗</span></button>
        <div className="local-lobby-footnote">2–8 PLAYERS · SHARED DEVICE</div>
      </section>
    </main>
  );
}
