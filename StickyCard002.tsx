"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ReactLenis from "lenis/react";
import { useRef } from "react";

import { cn } from "./src/lib/utils";

interface CardData {
  id: number | string;
  image: string;
  alt?: string;
  buttonText?: string;
  buttonClassName?: string;
  href?: string;
  onButtonClick?: () => void;
}

interface StickyCard002Props {
  cards: CardData[];
  className?: string;
  containerClassName?: string;
  imageClassName?: string;
}

const StickyCard002 = ({
  cards,
  className,
  containerClassName,
  imageClassName,
}: StickyCard002Props) => {
  const container = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const cardElements = cardRefs.current;
      const totalCards = cardElements.length;

      if (!cardElements[0]) return;

      gsap.set(cardElements[0], { y: "0%", scale: 1, rotation: 0, opacity: 1 });

      for (let i = 1; i < totalCards; i++) {
        if (!cardElements[i]) continue;
        gsap.set(cardElements[i], { y: "120%", scale: 1, rotation: 0, opacity: 0 });
      }

      const totalSteps = totalCards - 1;
      const stepDuration = 1.6;
      const dwellDuration = 0.5;
      const animDuration = 1.1;

      const scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".sticky-cards",
          start: "top top",
          end: `+=${window.innerHeight * totalSteps * 1.35}`,
          pin: true,
          scrub: 0.6,
          pinSpacing: true,
        },
      });

      for (let i = 0; i < totalSteps; i++) {
        const currentCard = cardElements[i];
        const nextCard = cardElements[i + 1];
        if (!currentCard || !nextCard) continue;

        const startTime = i * stepDuration;
        const transitionStart = startTime + dwellDuration;

        scrollTimeline.to(
          currentCard,
          {
            scale: 0.82,
            rotation: 3,
            opacity: 0.25,
            duration: animDuration,
            ease: "power1.inOut",
          },
          transitionStart,
        );

        scrollTimeline.fromTo(
          nextCard,
          {
            y: "120%",
            opacity: 0,
          },
          {
            y: "0%",
            opacity: 1,
            duration: animDuration,
            ease: "power1.out",
          },
          transitionStart,
        );
      }

      const resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });

      if (container.current) {
        resizeObserver.observe(container.current);
      }

      return () => {
        resizeObserver.disconnect();
        scrollTimeline.kill();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    },
    { scope: container },
  );

  return (
    <div className={cn("relative h-full w-full bg-transparent", className)} ref={container}>
      <div className="sticky-cards relative flex h-full min-h-screen w-full items-center justify-center overflow-hidden p-3 lg:p-8 bg-transparent">
        <div
          className={cn(
            "relative h-[85vh] w-full max-w-3xl lg:max-w-4xl flex items-center justify-center bg-transparent",
            containerClassName,
          )}
        >
          {cards.map((card, i) => (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto"
            >
              <div className="relative group bg-transparent p-4 flex flex-col items-center">
                <img
                  ref={(el) => {
                    imageRefs.current[i] = el;
                  }}
                  src={card.image}
                  alt={card.alt || `Card ${i + 1}`}
                  className={cn(
                    "w-full h-full object-contain max-h-[58vh] drop-shadow-2xl transition-transform duration-300 group-hover:scale-105",
                    imageClassName,
                  )}
                />
                {card.href ? (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (typeof (window as unknown as { trackCtaClick?: Function }).trackCtaClick === 'function') {
                        (window as unknown as { trackCtaClick: Function }).trackCtaClick(
                          card.buttonText || 'Ver detalles',
                          `sticky_card_${card.id}`,
                          card.href
                        );
                      }
                    }}
                    className={cn(
                      "mt-8 px-6 py-3 bg-white/90 hover:bg-white text-black font-semibold rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer",
                      card.buttonClassName,
                    )}
                  >
                    <span>{card.buttonText || "Ver detalles"}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </a>
                ) : (
                  <button
                    className={cn(
                      "mt-8 px-6 py-3 bg-white/90 hover:bg-white text-black font-semibold rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer",
                      card.buttonClassName,
                    )}
                    onClick={() => {
                      if (typeof (window as unknown as { trackCtaClick?: Function }).trackCtaClick === 'function') {
                        (window as unknown as { trackCtaClick: Function }).trackCtaClick(
                          card.buttonText || 'Ver producto',
                          `sticky_card_${card.id}`,
                          'action'
                        );
                      }
                      if (card.onButtonClick) {
                        card.onButtonClick();
                      } else {
                        console.log(`Card ${card.id} clicked`);
                      }
                    }}
                  >
                    <span>{card.buttonText || "Ver detalles"}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Example usage component with default data
const Skiper17 = () => {
  const defaultCards: CardData[] = [
    {
      id: 1,
      image: "/images/lummi/ecommece.webp",
      alt: "E-Commerce Showcase",
      buttonText: "Ver producto",
      buttonClassName: "neon-border-blue border-2 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.65),inset_0_0_8px_rgba(0,240,255,0.25)] hover:shadow-[0_0_25px_rgba(0,240,255,0.9),inset_0_0_12px_rgba(0,240,255,0.4)]",
    },
    {
      id: 2,
      image: "/images/lummi/amazon.webp",
      alt: "Dulces & Confectionery Showcase",
      buttonText: "Explorar",
      buttonClassName: "neon-border-pink border-2 border-[#ff2d92] shadow-[0_0_15px_rgba(255,45,146,0.65),inset_0_0_8px_rgba(255,45,146,0.25)] hover:shadow-[0_0_25px_rgba(255,45,146,0.9),inset_0_0_12px_rgba(255,45,146,0.4)]",
    },
    {
      id: 3,
      image: "/images/lummi/tenis.webp",
      alt: "Retail & Tenis Showcase",
      buttonText: "Comprar ahora",
      href: "https://sneakersgame.netlify.app/",
      buttonClassName: "neon-border-orange border-2 border-[#ff7a00] shadow-[0_0_15px_rgba(255,122,0,0.65),inset_0_0_8px_rgba(255,122,0,0.25)] hover:shadow-[0_0_25px_rgba(255,122,0,0.9),inset_0_0_12px_rgba(255,122,0,0.4)]",
    },
    {
      id: 4,
      image: "/images/lummi/mercado.webp",
      alt: "Ropa & Moda Showcase",
      buttonText: "Explorar",
      href: "https://ventaschamarras.netlify.app/",
      buttonClassName: "neon-border-yellow border-2 border-[#ffe600] shadow-[0_0_15px_rgba(255,230,0,0.65),inset_0_0_8px_rgba(255,230,0,0.25)] hover:shadow-[0_0_25px_rgba(255,230,0,0.9),inset_0_0_12px_rgba(255,230,0,0.4)]",
    },
    {
      id: 5,
      image: "/images/lummi/mocktail.webp",
      alt: "Mocktail Showcase",
      buttonText: "Ver detalles",
      href: "https://miguelcra85-tech.github.io/NaranGo/",
      buttonClassName: "neon-border-purple border-2 border-[#b026ff] shadow-[0_0_15px_rgba(176,38,255,0.65),inset_0_0_8px_rgba(176,38,255,0.25)] hover:shadow-[0_0_25px_rgba(176,38,255,0.9),inset_0_0_12px_rgba(176,38,255,0.4)]",
    },
  ];

  return (
    <ReactLenis root>
      <div className="h-full w-full bg-transparent">
        <StickyCard002 cards={defaultCards} />
      </div>
    </ReactLenis>
  );
};

export { Skiper17, StickyCard002 };
