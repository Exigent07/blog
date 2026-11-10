"use client";

import { type ComponentProps, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { BracketAction } from "@/components/ui/BracketAction";
import styles from "./VideoPlayer.module.css";

type Props = ComponentProps<"video"> & {
  /** Set at build time when the file has an audio track (src/lib/content/markdown.ts). */
  "data-audio"?: boolean | string;
};

type FullscreenVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

/** 0:07, 1:26, 1:02:09 */
function clock(seconds: number) {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
}

/**
 * An article video in the publication's own controls: an ink slab holding the
 * picture, a bracketed play action, a scrubber whose thumb is the // mark (as
 * on the page's progress indicator), the time in Plex Mono, and full screen.
 * A sound control appears only when the file has sound. Nothing autoplays.
 *
 * Keys, while focus is in the player: K play/pause, J/L back/forward 5s,
 * M sound, F full screen; the scrubber takes arrow keys natively.
 */
export function VideoPlayer({ src, width, height, "aria-label": ariaLabel, "data-audio": audio }: Props) {
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<FullscreenVideo>(null);
  const seekRef = useRef<HTMLInputElement>(null);
  const currentRef = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [failed, setFailed] = useState(false);
  const hasAudio = audio === true || audio === "true";
  // The pipeline only ever passes a path under public/.
  const file = typeof src === "string" ? src : "";

  // Progress is written to the DOM every frame while playing; React renders only state changes.
  useEffect(() => {
    const video = videoRef.current;
    const seek = seekRef.current;
    const current = currentRef.current;
    if (!video || !seek || !current) return;
    let frame = 0;

    const sync = () => {
      const total = Number.isFinite(video.duration) ? video.duration : 0;
      seek.value = String(video.currentTime);
      seek.style.setProperty("--progress", total ? (video.currentTime / total).toFixed(4) : "0");
      seek.setAttribute("aria-valuetext", `${clock(video.currentTime)} of ${clock(total)}`);
      current.textContent = clock(video.currentTime);
    };
    const loop = () => {
      sync();
      frame = requestAnimationFrame(loop);
    };
    const onPlay = () => {
      setPlaying(true);
      setEnded(false);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(loop);
    };
    const onPause = () => {
      setPlaying(false);
      cancelAnimationFrame(frame);
      sync();
    };
    const onEnded = () => setEnded(true);
    const onMetadata = () => {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
      sync();
    };
    const onVolume = () => setMuted(video.muted);
    const onError = () => setFailed(true);

    const events: [string, () => void][] = [
      ["play", onPlay],
      ["pause", onPause],
      ["ended", onEnded],
      ["loadedmetadata", onMetadata],
      ["durationchange", onMetadata],
      ["seeked", sync],
      ["volumechange", onVolume],
      ["error", onError],
    ];
    events.forEach(([type, listener]) => video.addEventListener(type, listener));
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onMetadata();
    if (video.error) onError();
    return () => {
      cancelAnimationFrame(frame);
      events.forEach(([type, listener]) => video.removeEventListener(type, listener));
    };
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === playerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) video.play().catch(() => setFailed(true));
    else video.pause();
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (video) video.muted = !video.muted;
  };

  const toggleFullscreen = () => {
    const player = playerRef.current;
    const video = videoRef.current;
    if (!player || !video) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (player.requestFullscreen) void player.requestFullscreen();
    // iOS: only the video element itself can go full screen.
    else video.webkitEnterFullscreen?.();
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (video) video.currentTime = Math.min(Math.max(0, video.currentTime + seconds), video.duration || 0);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const actions: Record<string, () => void> = {
      k: toggle,
      f: toggleFullscreen,
      j: () => skip(-5),
      l: () => skip(5),
      ...(hasAudio && { m: toggleSound }),
    };
    const action = actions[event.key.toLowerCase()];
    if (!action) return;
    event.preventDefault();
    action();
  };

  const playLabel = playing ? "Pause" : ended ? "Replay" : "Play";

  return (
    <div
      ref={playerRef}
      className={styles.player}
      data-tone="ink"
      data-playing={playing || undefined}
      data-fullscreen={fullscreen || undefined}
      onKeyDown={onKeyDown}
    >
      <div className={styles.stage}>
        {/* The first frame stands in for a poster (#t also makes Safari fetch it). */}
        <video
          ref={videoRef}
          className={styles.video}
          src={`${file}#t=0.001`}
          width={width}
          height={height}
          preload="metadata"
          playsInline
          aria-label={ariaLabel}
          onClick={toggle}
          onDoubleClick={toggleFullscreen}
        />
        {failed && (
          <p className={styles.notice}>
            This video could not be played here.{" "}
            <a href={file} className={styles.noticeLink}>
              Open the file
            </a>
          </p>
        )}
      </div>

      <div className={styles.controls} role="group" aria-label="Video controls">
        <button type="button" className={styles.action} onClick={toggle} disabled={failed}>
          <BracketAction tail={false}>{playLabel}</BracketAction>
        </button>
        <div className={styles.timeline}>
          <span ref={currentRef} className={styles.current}>
            0:00
          </span>
          <input
            ref={seekRef}
            className={styles.seek}
            type="range"
            min={0}
            max={duration || 0}
            step="any"
            defaultValue={0}
            aria-label="Seek"
            disabled={!duration || failed}
            onInput={(event) => {
              const video = videoRef.current;
              if (video) video.currentTime = Number(event.currentTarget.value);
            }}
          />
          <span className={styles.duration}>{clock(duration)}</span>
        </div>
        <div className={styles.extras}>
          {hasAudio && (
            <button type="button" className={styles.action} onClick={toggleSound} aria-pressed={!muted}>
              <BracketAction tail={false}>Sound</BracketAction>
            </button>
          )}
          <button type="button" className={styles.action} onClick={toggleFullscreen}>
            <BracketAction tail={false}>{fullscreen ? "Exit full screen" : "Full screen"}</BracketAction>
          </button>
        </div>
      </div>

      {/* Without JavaScript the controls cannot work; the file can still be opened. */}
      <a className={styles.fallback} href={file}>
        Open the video
      </a>
    </div>
  );
}
