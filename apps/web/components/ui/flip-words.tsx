
"use client";

import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type TextSlide = {
  type: "text";
  content: string;
};

type RichSlide = {
  type: "rich";
  content: ReactNode;
  /** Plain-text equivalent for screen readers and layout measurement. */
  accessibleText: string;
};

export type FlipSlide = TextSlide | RichSlide;

export interface FlipWordsProps
  extends Omit<ComponentProps<"span">, "children"> {
  /** How long each slide stays, in milliseconds. @default 3000 */
  duration?: number;

  /** Time between incoming letters, in milliseconds. @default 40 */
  stagger?: number;

  /** Legacy text-only slides. Use slides for rich content. */
  words?: string[];

  /** Slides can contain plain text or arbitrary React content. */
  slides?: FlipSlide[];
}

const segmenter =
  typeof Intl !== "undefined" &&
  typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : undefined;

const numbered = <T,>(list: T[]) =>
  list.map((value, index) => ({ index, value }));

const lettersOf = (word: string) =>
  numbered(
    segmenter
      ? Array.from(segmenter.segment(word), (part) => part.segment)
      : Array.from(word),
  );

export const FlipWords = (props: FlipWordsProps) => {
  const {
    duration = 3000,
    stagger,
    words,
    slides,
    className,
    ...rest
  } = props;

  // Convert legacy words into the new slide format.
  const items: FlipSlide[] =
    slides ??
    (words ?? []).map((content) => ({
      type: "text" as const,
      content,
    }));

  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);

  const safeTick = items.length > 0 ? tick % items.length : 0;
  const current = items[safeTick];

  const previous =
    tick > 0 && items.length > 0
      ? items[(tick - 1) % items.length]
      : undefined;

  useEffect(() => {
    if (paused || items.length < 2) return;

    const timer = window.setTimeout(
      () => setTick((current) => current + 1),
      duration,
    );

    return () => window.clearTimeout(timer);
  }, [duration, paused, tick, items.length]);

  const hold = () => setPaused(true);
  const release = () => setPaused(false);

  const getAccessibleText = (slide: FlipSlide) =>
    slide.type === "text" ? slide.content : slide.accessibleText;

  const renderContent = (slide: FlipSlide) => {
    if (slide.type === "rich") return slide.content;

    return lettersOf(slide.content).map((letter) => (
      <span
        key={letter.index}
        className="inline-block motion-safe:group-data-[turn=a]/flip-words:animate-flip-words-in motion-safe:group-data-[turn=b]/flip-words:animate-flip-words-in-again"
        style={
          {
            "--flip-words-index": letter.index,
          } as CSSProperties
        }
      >
        {letter.value}
      </span>
    ));
  };

  if (!current) return null;

  return (
    <span
      className={cn("group/flip-words", className)}
      data-slot="flip-words"
      data-turn={tick % 2 === 0 ? "a" : "b"}
      {...rest}
    >
      <span className="sr-only">
        {items.map(getAccessibleText).join(", ")}
      </span>

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
        {/* Invisible slides preserve the width of the widest sentence. */}
        {items.map((slide, index) => (
          <span
            key={index}
            className="invisible [grid-area:1/1]"
          >
            {slide.type === "text"
              ? slide.content
              : slide.accessibleText}
          </span>
        ))}

        {/* Current slide */}
        <span
          className={cn(
            "[grid-area:1/1]",
            current.type === "rich" &&
              "motion-safe:animate-flip-words-rich-in",
          )}
          data-slot="flip-words-word"
          key={tick}
        >
          {renderContent(current)}
        </span>

        {/* Previous slide */}
        {previous && (
          <span
            className={cn(
              "pointer-events-none opacity-0 [grid-area:1/1]",
              previous.type === "text" &&
                "motion-safe:group-data-[turn=a]/flip-words:animate-flip-words-out motion-safe:group-data-[turn=b]/flip-words:animate-flip-words-out-again",
              previous.type === "rich" &&
                "motion-safe:animate-flip-words-rich-out",
            )}
          >
            {previous.type === "text"
              ? previous.content
              : previous.content}
          </span>
        )}
      </span>
    </span>
  );
};
