"use client";

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";

const SpatialScene = lazy(() => import("./components/SpatialScene"));

const signals = [
  {
    id: "ai",
    index: "01",
    label: "AI systems",
    title: "Intelligence people can actually use.",
    body: "I turn model capability into legible product behavior—clear inputs, useful feedback, and systems a team can keep improving.",
    chips: ["AI PRODUCT", "SYSTEMS", "PROTOTYPING"],
  },
  {
    id: "interaction",
    index: "02",
    label: "Interactive products",
    title: "Interfaces that reward curiosity.",
    body: "I design products that invite exploration and build trust through interaction—from the first tap to the habit that follows.",
    chips: ["PRODUCT", "MOTION", "PROTOTYPING"],
  },
  {
    id: "craft",
    index: "03",
    label: "Digital craft",
    title: "Precision you can feel.",
    body: "I care about the last ten percent: the transition, the edge case, the tiny decision that makes a complex system feel obvious.",
    chips: ["INTERFACE", "ACCESSIBILITY", "POLISH"],
  },
];

const chapters = [
  { id: "arrival", label: "Arrival" },
  { id: "constellation", label: "Signals" },
  { id: "world", label: "World" },
  { id: "process", label: "Process" },
  { id: "contact", label: "Contact" },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function App() {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(1);
  const progressRef = useRef(0);
  const sectionRefs = useRef([]);

  const signal = signals[selected];

  const goTo = useCallback((index) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const chooseSignal = useCallback((index, enter = true) => {
    setSelected(index);
    if (enter) window.setTimeout(() => goTo(2), 90);
  }, [goTo]);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progressRef.current = (window.scrollY / max) * (chapters.length - 1);
      setActive(Math.max(0, Math.min(chapters.length - 1, Math.round(progressRef.current))));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        goTo(Math.min(chapters.length - 1, active + 1));
      }
      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        goTo(Math.max(0, active - 1));
      }
      if (event.key === "Escape") goTo(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goTo]);

  const chapterNav = useMemo(() => chapters.map((chapter, index) => (
    <button
      key={chapter.id}
      type="button"
      className={active === index ? "chapter-dot is-active" : "chapter-dot"}
      aria-label={`Go to ${chapter.label}`}
      aria-current={active === index ? "step" : undefined}
      onClick={() => goTo(index)}
    >
      <span>{String(index + 1).padStart(2, "0")}</span>
      <i />
      <em>{chapter.label}</em>
    </button>
  )), [active, goTo]);

  return (
    <div className="experience">
      <a className="skip-link" href="#arrival">Skip to story</a>
      <Suspense fallback={<div className="scene-fallback" aria-hidden="true" />}>
        <SpatialScene progressRef={progressRef} selected={selected} onSelect={chooseSignal} />
      </Suspense>

      <header className="topbar">
        <button className="monogram" type="button" onClick={() => goTo(0)} aria-label="Back to arrival">
          Y/N
        </button>
        <div className="availability"><i /> Available for ambitious work</div>
        <a className="top-contact" href="mailto:you@example.com">Start a conversation <Arrow /></a>
      </header>

      <aside className="rail" aria-label="Story chapters">{chapterNav}</aside>

      <main>
        <section
          id="arrival"
          data-index="0"
          ref={(node) => { sectionRefs.current[0] = node; }}
          className="chapter chapter--arrival"
        >
          <div className="copy copy--left">
            <p className="eyebrow">CREATIVE TECHNOLOGIST · SINGAPORE</p>
            <h1>I build digital worlds that make hard ideas feel <em>inevitable.</em></h1>
            <p className="lede">Product-minded engineer working across AI, interaction, and the last ten percent of polish.</p>
            <button className="text-action" type="button" onClick={() => goTo(1)}>Enter the constellation <Arrow /></button>
          </div>
          <div className="scene-label"><b>01</b><span>05</span><i /> SIGNAL CHAMBER</div>
          <button className="scroll-cue" type="button" onClick={() => goTo(1)}><i /> Scroll to explore</button>
        </section>

        <section
          id="constellation"
          data-index="1"
          ref={(node) => { sectionRefs.current[1] = node; }}
          className="chapter chapter--constellation"
        >
          <div className="copy copy--left copy--compact">
            <p className="eyebrow"><b>02</b> / 05 · CONSTELLATION</p>
            <h2>Choose a signal.</h2>
            <p className="lede">Follow the guided route—or enter any world.</p>
            <div className="signal-list">
              {signals.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={selected === index ? `signal-card signal-card--${item.id} is-selected` : `signal-card signal-card--${item.id}`}
                  onMouseEnter={() => setSelected(index)}
                  onFocus={() => setSelected(index)}
                  onClick={() => chooseSignal(index)}
                >
                  <span>{item.index}</span>
                  <strong>{item.label}</strong>
                  <Arrow />
                </button>
              ))}
            </div>
          </div>
          <p className="interaction-hint">Drag the world · Select a signal</p>
        </section>

        <section
          id="world"
          data-index="2"
          ref={(node) => { sectionRefs.current[2] = node; }}
          className="chapter chapter--world"
        >
          <div className="copy copy--right">
            <p className="eyebrow"><b>03</b> / {signal.label}</p>
            <div key={signal.id} className="signal-copy">
              <h2>{signal.title}</h2>
              <p className="lede">{signal.body}</p>
              <div className="chips">{signal.chips.map((chip) => <span key={chip}>{chip}<i /></span>)}</div>
            </div>
            <div className="world-switcher" aria-label="Switch world">
              {signals.map((item, index) => (
                <button
                  key={item.id}
                  className={selected === index ? "is-active" : ""}
                  type="button"
                  onClick={() => setSelected(index)}
                >{item.index}</button>
              ))}
            </div>
            <button className="text-action" type="button" onClick={() => goTo(3)}>Follow the fragments <Arrow /></button>
          </div>
        </section>

        <section
          id="process"
          data-index="3"
          ref={(node) => { sectionRefs.current[3] = node; }}
          className="chapter chapter--process"
        >
          <div className="copy copy--left copy--process">
            <p className="eyebrow"><b>04</b> / 05 · PROCESS VORTEX</p>
            <h2>Make the invisible structure visible.</h2>
            <ol className="orbit-process">
              <li><b>01</b><span>Research</span></li>
              <li><b>02</b><span>Systems</span></li>
              <li><b>03</b><span>Prototype</span></li>
              <li><b>04</b><span>Polish</span></li>
            </ol>
          </div>
        </section>

        <section
          id="contact"
          data-index="4"
          ref={(node) => { sectionRefs.current[4] = node; }}
          className="chapter chapter--contact"
        >
          <div className="copy copy--right copy--contact">
            <p className="eyebrow"><b>05</b> / 05 · CONTACT SINGULARITY</p>
            <h2>Let’s build something people remember.</h2>
            <p className="lede">I partner with teams who care about clarity, craft, and creating real impact.</p>
            <div className="contact-actions">
              <a className="primary-action" href="mailto:you@example.com">Start a conversation <Arrow /></a>
              <button className="secondary-action" type="button" disabled title="Add your résumé URL">Add résumé link <span>↓</span></button>
            </div>
            <p className="location">⌖ Singapore · Open to global teams</p>
          </div>
        </section>
      </main>
      <div className="progress" aria-hidden="true"><i style={{ width: `${((active + 1) / chapters.length) * 100}%` }} /></div>
    </div>
  );
}
