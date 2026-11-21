"use client";

import {
  type ComponentProps,
  type CSSProperties,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export interface FlipWordsProps
  extends Omit<ComponentProps<"span">, "children"> {
  /** How long each word stays, in milliseconds. @default 3000 */
  duration?: number;
  /** The time between one letter coming in and the next, in milliseconds. @default 40 */
  stagger?: number;
  /** The words, shown in turn from the first; a word may be a few words. */
  words: string[];
}

const segmenter =
  typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : undefined;

/** A list's items with their place: keys and delays from data. */
const numbered = (list: string[]) =>
  list.map((value, index) => ({ index, value }));

/** A word's letters, whole (emoji and accents stay one letter), numbered. */
const lettersOf = (word: string) =>
  numbered(
    segmenter
      ? Array.from(segmenter.segment(word), (part) => part.segment)
      : Array.from(word)
  );

/** The word a tick shows, and the one it replaces (none at first). */
const turnOf = (words: string[], tick: number) => ({
  current: words[tick % words.length] ?? "",
  previous: tick > 0 ? (words[(tick - 1) % words.length] ?? "") : "",
});

/**
 * Words that flip in place, one after another: the outgoing word lifts away
 * and blurs while the next one rises in letter by letter. A timer counts the
 * turns and flips `data-turn` between `a` and `b`, which restarts the
 * `flip-words-in` and `flip-words-out` keyframes; every word sits in the
 * same grid cell, invisible, so the widest one holds the width and nothing
 * around it moves. It pauses while the pointer is over it.
 *
 * @cssvar --flip-words-stagger The time between one letter coming in and the next (`40ms`).
 * @cssvar --flip-words-x How far the outgoing word drifts sideways (`0.4em`, mirrored for right-to-left text).
 */
export const FlipWords = (props: FlipWordsProps) => {
  const { duration = 3000, stagger, words, className, ...rest } = props;
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const turn = turnOf(words, tick);

  useEffect(() => {
    if (paused || words.length < 2) {
      return;
    }
    const timer = window.setTimeout(() => setTick(tick + 1), duration);
    return () => window.clearTimeout(timer);
  }, [duration, paused, tick, words.length]);

  const hold = () => setPaused(true);
  const release = () => setPaused(false);

  return (
    <span
      className={cn("group/flip-words", className)}
      data-slot="flip-words"
      data-turn={tick % 2 === 0 ? "a" : "b"}
      {...rest}
    >
      <span className="sr-only">{words.join(", ")}</span>
      <span
        aria-hidden="true"
        className="inline-grid whitespace-pre [&:dir(rtl)]:[--flip-words-x:-0.4em]"
        dir="auto"
        onPointerEnter={hold}
        onPointerLeave={release}
        style={
          {
            "--flip-words-stagger":
              stagger === undefined ? undefined : `${stagger}ms`,
          } as CSSProperties
        }
      >
        {/* Every word, unseen in one cell: the widest sets the width. */}
        {numbered(words).map((word) => (
          <span className="invisible [grid-area:1/1]" key={word.index}>
            {word.value}
          </span>
        ))}
        <span className="[grid-area:1/1]" data-slot="flip-words-word">
          {lettersOf(turn.current).map((letter) => (
            <span
              className="inline-block motion-safe:group-data-[turn=a]/flip-words:animate-flip-words-in motion-safe:group-data-[turn=b]/flip-words:animate-flip-words-in-again"
              key={letter.index}
              style={{ "--flip-words-index": letter.index } as CSSProperties}
            >
              {letter.value}
            </span>
          ))}
        </span>
        <span className="pointer-events-none opacity-0 [grid-area:1/1] motion-safe:group-data-[turn=a]/flip-words:animate-flip-words-out motion-safe:group-data-[turn=b]/flip-words:animate-flip-words-out-again">
          {turn.previous}
        </span>
      </span>
    </span>
  );
};
