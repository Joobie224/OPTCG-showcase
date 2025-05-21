import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import { animate, createScope } from "animejs";

const baseURL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [cards, setCards] = useState([]);
  const [activeCardId, setActiveCardId] = useState(null);
  const activeCardRef = useRef(null);
  const root = useRef(null);
  const scope = useRef(null);
  const yamatoRef = useRef(null);
  const yamatoAnimation = useRef(null);
  const cardGridRef = useRef(null);

  useEffect(() => {
    const getData = async () => {
      const response = await fetch(`${baseURL}/cards`);
      const data = await response.json();

      setCards(data);
    };

    getData();
  }, []);

  useEffect(() => {
    scope.current = createScope({ root }).add((self) => {
      self.add("tiltCard", (event) => {
        const container = event.currentTarget;
        const card = container.querySelector(".card-img");
        const glow = container.querySelector(".card-glow");

        if (!card || !glow) return;

        const isYamato = container.classList.contains("yamato-card");
        const rotateMultiplier = isYamato ? 14 : 16;
        const scaleValue = isYamato ? 0.9 : 1.2;

        container.style.zIndex = "10";

        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * rotateMultiplier;
        const rotateY = ((x - centerX) / centerX) * rotateMultiplier;

        const glowX = ((x - centerX) / centerX) * 20;
        const glowY = ((y - centerY) / centerY) * 20;

        glow.style.background = `radial-gradient(circle at ${50 + glowX}% ${
          50 + glowY
        }%, rgba(255,255,255,0.2), transparent 60%)`;

        animate(card, {
          rotateX: -rotateX,
          rotateY: rotateY,
          scale: 1.2,
          duration: 200,
          easing: "easeOutQuad",
        });
      });

      self.add("resetTilt", (event) => {
        const card = event.currentTarget.querySelector(".card-img");
        const container = event.currentTarget;
        const glow = event.currentTarget.querySelector(".card-glow");

        if (!card || !glow) return;

        if (glow) {
          glow.style.background = `radial-gradient(circle at center, rgba(255,255,255,0.15), transparent 60%)`;
        }
        container.style.removeProperty("z-index");

        animate(card, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 300,
          easing: "easeOutElastic(1, .5)",
        });
      });
    });

    return () => scope.current.revert();
  }, []);

  useEffect(() => {
    document.querySelectorAll(".underline-target").forEach((el) => {
      const underline = document.createElement("span");
      underline.className = "underline-fill";
      el.style.position = "relative";
      el.appendChild(underline);

      animate(underline, {
        width: ["0%", "100%"],
        duration: 1300,
        easing: "easeOutExpo",
      });
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && cardGridRef.current) {
          const cards = cardGridRef.current.querySelectorAll(".card-container");

          animate(cardGridRef.current, {
            opacity: [0, 1],
            translateY: [80, 0],
            duration: 1200,
            easing: "easeOutCubic",
          });

          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardGridRef.current) observer.observe(cardGridRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="bg-gray-800">
        <div className="flex bg-gray-800 py-15 mb-40">
          <div className="flex flex-col items-start">
            <h3 className="font-[Inter] font-bold text-6xl bg-gray-800 text-gray-400 w-100 p-15 mr-70 mt-10 py-0">
              One Piece TCG card showcase
            </h3>
            <p className="subtitle text-xl text-gray-300 w-100 p-15 mr-70 py-4 font-[Inter] font-medium block">
              A site for <span className="underline-target">collectors</span>{" "}
              and <span className="underline-target">enthusiasts</span> alike,
              check out every One Piece TCG card here
            </p>
          </div>
          <div
            ref={yamatoRef}
            className="perspective-[1000px] relative yamato-card"
            onMouseEnter={() => yamatoAnimation.current?.pause()}
            onMouseMove={(event) => scope.current?.methods?.tiltCard(event)}
            onMouseLeave={(event) => scope.current?.methods?.resetTilt(event)}
          >
            <img
              className="yamato-img card-img w-130 rounded-3xl transform-gpu will-change-transform"
              src="/assets/P-046.png"
              alt="yamato card"
              style={{ transformStyle: "preserve-3d" }}
            />
            <div className="card-glow glow-animate absolute top-0 left-0 w-full h-full rounded-xl pointer-events-none z-0" />
          </div>
        </div>
        <div className="flex p-4 min-h-screen bg-gray-800">
          <div
            ref={(el) => {
              root.current = el;
              cardGridRef.current = el;
            }}
            className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 opacity-0 translate-y-10 overflow-hidden"
          >
            {scope.current &&
              cards.map((card) => (
                <div
                  key={card.id}
                  className="card-container perspective-[1000px]"
                  onMouseMove={scope.current.methods.tiltCard}
                  onMouseLeave={scope.current.methods.resetTilt}
                >
                  <img
                    ref={card.id === activeCardId ? activeCardRef : null}
                    src={`https://optcg-showcase-backend.onrender.com${card.image}`}
                    alt={card.name}
                    className="card-img w-full h-auto object-contain rounded-xl transform-gpu will-change-transform"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  />
                  <div className="card-glow absolute top-0 left-0 w-full h-full rounded-xl pointer-events-none z-0" />
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
