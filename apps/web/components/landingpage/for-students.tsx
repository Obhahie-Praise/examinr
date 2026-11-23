import Link from "next/link";
import React from "react";
import { FlipWords } from "../ui/flip-words";
import Image from "next/image";
import { RainbowButton } from "../ui/rainbow-button";
import { Highlighter } from "../ui/highlighter";
import { ShimmerButton } from "../ui/shimmer-button";
import { SpotlightGlowRevealText } from "../ui/spotlight-glow-reveal-text";
import Menu from "../ui/animated-menu-btn";

const StudentsHero = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center text-center">
      <div className="">
        <h1 className="text-7xl font-bold tracking-tighter">
          <FlipWords
            duration={3500}
            slides={[
              {
                type: "text",
                content: "Limitless materialsss",
              },
              {
                type: "text",
                content: "Understand difficult topics",
              },
              {
                type: "rich",
                accessibleText: "Be exam ready",
                content: (
                  <>
                    Prepare for{" "}
                    <Image
                      src="/jamb.png"
                      alt="jamb logo"
                      width={70}
                      height={70}
                      className="inline-block rounded-full object-cover align-middle"
                    />{" "}
                    <Image
                      src="/waec.png"
                      alt="waec logo"
                      width={70}
                      height={70}
                      className="inline-block rounded-full object-cover align-middle"
                    />{" "}
                    exams
                  </>
                ),
              },
              {
                type: "text",
                content: "Prep for high grades",
              },
              {
                type: "text",
                content: "All the past question",
              },
              {
                type: "rich",
                accessibleText: "Limitless AI",
                content: (
                  <>
                    Study{" "}
                    <Image
                      src="/studying-grayscale.jpg"
                      alt=""
                      width={100}
                      height={100}
                      className="inline-block rounded-full object-cover align-middle"
                    />{" "}
                    stress-free
                  </>
                ),
              },
              {
                type: "text",
                content: "Make every mark count",
              },
            ]}
            className="lowercase"
          />{" "}
          <br />{" "}
          <span className="leading-0 text-neutral-400 dark:text-neutral-700">{""}
            <SpotlightGlowRevealText text="with zero fees!" className="" dimmedOpacity={0.5} />
          </span>
        </h1>
        <p className="text-lg font-medium tracking-tight py-4">
          features everything you need to prepare smarter, practice harder, and{" "}
          <br /> ace your exams; and its{" "}
          <Highlighter action={"circle"} color="#2b7fff">
            freee
          </Highlighter>
        </p>
        <div className="flex itemce-center justify-center">
        <Link href={"/sign-up"} className="w-fit mx-auto">
          <ShimmerButton className="w-40 h-15 rounded-full font-medium  tracking-tight">
            start preparing
          </ShimmerButton>
        </Link>
        </div>
      </div>
      <div className="absolute bottom-10 right-10">
        <Menu />
      </div>
    </div>
  );
};

export default StudentsHero;
