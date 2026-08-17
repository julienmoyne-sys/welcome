"use client";

import { Gamepad2, Play, RotateCcw, Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import styles from "./vtc.module.css";

const MEMORY_SYMBOLS = ["◆", "●", "▲", "■", "✦", "⬟"];
const MEMORY_DECK = [0, 3, 1, 5, 2, 4, 3, 0, 5, 1, 4, 2].map((symbolIndex, id) => ({
  id,
  symbol: MEMORY_SYMBOLS[symbolIndex],
}));

function TicTacToe() {
  const [cells, setCells] = useState<Array<"X" | "O" | null>>(Array(9).fill(null));
  const winner = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ].find(([a, b, c]) => cells[a] && cells[a] === cells[b] && cells[a] === cells[c]);
  const winnerMark = winner ? cells[winner[0]] : null;
  const turn = cells.filter(Boolean).length % 2 === 0 ? "X" : "O";
  const reset = () => setCells(Array(9).fill(null));

  return (
    <div className={styles.miniGame}>
      <div className={styles.gameStatus}>
        <span>
          {winnerMark ? `${winnerMark} a gagné !` : cells.every(Boolean) ? "Égalité" : `À ${turn}`}
        </span>
        <button type="button" onClick={reset} aria-label="Recommencer le morpion">
          <RotateCcw aria-hidden="true" />
        </button>
      </div>
      <div className={styles.ticTacToe}>
        {cells.map((cell, index) => (
          <button
            type="button"
            key={index}
            disabled={Boolean(cell) || Boolean(winnerMark)}
            onClick={() =>
              setCells((current) =>
                current.map((value, cellIndex) => (cellIndex === index ? turn : value)),
              )
            }
            aria-label={`Case ${index + 1}${cell ? `, ${cell}` : ""}`}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
}

function MemoryGame() {
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);

  const choose = (id: number) => {
    if (open.includes(id) || found.includes(id) || open.length === 2) return;
    const next = [...open, id];
    setOpen(next);
    if (next.length !== 2) return;
    if (MEMORY_DECK[next[0]].symbol === MEMORY_DECK[next[1]].symbol) {
      setFound((current) => [...current, ...next]);
      window.setTimeout(() => setOpen([]), 350);
    } else {
      window.setTimeout(() => setOpen([]), 700);
    }
  };

  return (
    <div className={styles.miniGame}>
      <div className={styles.gameStatus}>
        <span>
          {found.length === MEMORY_DECK.length
            ? "Bravo, tout est retrouvé !"
            : `${found.length / 2} / 6 paires`}
        </span>
        <button
          type="button"
          onClick={() => {
            setOpen([]);
            setFound([]);
          }}
          aria-label="Recommencer le jeu de mémoire"
        >
          <RotateCcw aria-hidden="true" />
        </button>
      </div>
      <div className={styles.memoryGrid}>
        {MEMORY_DECK.map((card) => {
          const visible = open.includes(card.id) || found.includes(card.id);
          return (
            <button
              type="button"
              key={card.id}
              data-visible={visible}
              onClick={() => choose(card.id)}
              aria-label={visible ? card.symbol : "Carte masquée"}
            >
              {visible ? card.symbol : "?"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReflexGame() {
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(4);

  const hit = (index: number) => {
    if (index !== target) return;
    setScore((value) => value + 1);
    setTarget((current) => (current + 3 + Math.floor(Math.random() * 5)) % 9);
  };

  return (
    <div className={styles.miniGame}>
      <div className={styles.gameStatus}>
        <span>
          {score} réflexe{score > 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={() => {
            setScore(0);
            setTarget(4);
          }}
          aria-label="Recommencer le jeu de réflexe"
        >
          <RotateCcw aria-hidden="true" />
        </button>
      </div>
      <div className={styles.reflexGrid}>
        {Array.from({ length: 9 }, (_, index) => (
          <button
            type="button"
            key={index}
            data-target={index === target}
            onClick={() => hit(index)}
            aria-label={index === target ? "Cible, touchez-la" : "Case vide"}
          />
        ))}
      </div>
    </div>
  );
}

type YouTubeVideo = { id: string; title: string; channel: string };

function YouTubePanel() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selected, setSelected] = useState<YouTubeVideo | null>(null);
  const [status, setStatus] = useState("Chargement des suggestions…");

  const search = async (term = "") => {
    setStatus("Recherche en cours…");
    try {
      const response = await fetch(`/api/vtc/youtube?q=${encodeURIComponent(term)}`);
      const payload = (await response.json()) as { videos?: YouTubeVideo[]; error?: string };
      if (!response.ok) throw new Error(payload.error);
      const nextVideos = payload.videos ?? [];
      setVideos(nextVideos);
      setSelected((current) =>
        current && nextVideos.some(({ id }) => id === current.id)
          ? current
          : (nextVideos[0] ?? null),
      );
      setStatus(nextVideos.length ? "" : "Aucune vidéo trouvée.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "YouTube est indisponible.");
    }
  };

  useEffect(() => {
    let active = true;
    fetch("/api/vtc/youtube?q=")
      .then(async (response) => {
        const payload = (await response.json()) as { videos?: YouTubeVideo[]; error?: string };
        if (!response.ok) throw new Error(payload.error);
        return payload.videos ?? [];
      })
      .then((nextVideos) => {
        if (!active) return;
        setVideos(nextVideos);
        setSelected(nextVideos[0] ?? null);
        setStatus(nextVideos.length ? "" : "Aucune vidéo trouvée.");
      })
      .catch((error: unknown) => {
        if (active) {
          setStatus(error instanceof Error ? error.message : "YouTube est indisponible.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void search(query);
  };

  return (
    <section className={styles.youtubePanel}>
      <div className={styles.entertainmentHeading}>
        <Play aria-hidden="true" />
        <div>
          <strong>YouTube</strong>
          <small>Lecteur officiel intégré à Welcome</small>
        </div>
      </div>
      <form className={styles.youtubeSearch} onSubmit={submit}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher une vidéo"
          aria-label="Rechercher sur YouTube"
        />
        <button type="submit" aria-label="Lancer la recherche">
          <Search aria-hidden="true" />
        </button>
      </form>
      {selected ? (
        <div className={styles.youtubePlayer}>
          <iframe
            key={selected.id}
            src={`https://www.youtube-nocookie.com/embed/${selected.id}?playsinline=1&rel=0`}
            title={selected.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <p className={styles.youtubeStatus}>{status}</p>
      )}
      {selected && (
        <p className={styles.youtubeNow}>
          <strong>{selected.title}</strong>
          <span>{selected.channel}</span>
        </p>
      )}
      <div className={styles.youtubeResults}>
        {videos.map((video) => (
          <button
            type="button"
            key={video.id}
            data-active={selected?.id === video.id}
            onClick={() => setSelected(video)}
          >
            <Play aria-hidden="true" />
            <span>
              <strong>{video.title}</strong>
              <small>{video.channel}</small>
            </span>
          </button>
        ))}
      </div>
      <small className={styles.youtubeLegal}>
        Contenu et lecteur fournis par YouTube. Des publicités peuvent être diffusées.
      </small>
    </section>
  );
}

export function EntertainmentScreen() {
  const [game, setGame] = useState<"memory" | "tic-tac-toe" | "reflex">("memory");

  return (
    <div className={`${styles.detailBody} ${styles.entertainmentBody}`}>
      <div className={styles.introBlock}>
        <p className={styles.eyebrow}>Pendant le trajet</p>
        <h2>Divertissements</h2>
        <p>Regardez YouTube ou profitez d’un jeu directement à bord.</p>
      </div>
      <div className={styles.entertainmentLayout}>
        <YouTubePanel />
        <section className={styles.gamesPanel}>
          <div className={styles.entertainmentHeading}>
            <Gamepad2 aria-hidden="true" />
            <div>
              <strong>Jeux sans publicité</strong>
              <small>Gratuits, privés et disponibles à bord</small>
            </div>
          </div>
          <div className={styles.gameTabs}>
            <button type="button" data-active={game === "memory"} onClick={() => setGame("memory")}>
              Mémoire express
            </button>
            <button
              type="button"
              data-active={game === "tic-tac-toe"}
              onClick={() => setGame("tic-tac-toe")}
            >
              Morpion
            </button>
            <button type="button" data-active={game === "reflex"} onClick={() => setGame("reflex")}>
              Réflexe
            </button>
          </div>
          {game === "memory" ? (
            <MemoryGame />
          ) : game === "tic-tac-toe" ? (
            <TicTacToe />
          ) : (
            <ReflexGame />
          )}
        </section>
      </div>
    </div>
  );
}
