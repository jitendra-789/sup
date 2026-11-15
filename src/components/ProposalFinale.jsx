import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { content } from '../content';

const teasing = ['Let me think… 🙈', 'Are you sure? 💭', 'Wrong button 😄', 'Nice try! ♡', 'Follow your heart ✨'];

export default function ProposalFinale({ onYes, onNo, status }) {
  const [dodges, setDodges] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [seriousOption, setSeriousOption] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const area = useRef(null);
  const timer = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => () => clearTimeout(timer.current), []);

  const dodge = () => {
    if (!timer.current) timer.current = setTimeout(() => setSeriousOption(true), content.noButtonDelayMs);
    const bounds = area.current.getBoundingClientRect();
    const maxX = Math.max(0, (bounds.width - 190) / 2);
    setPosition({ x: (dodges % 2 ? -1 : 1) * Math.min(maxX, 55 + (dodges % 3) * 23), y: 20 + (dodges % 2) * 45 });
    setDodges(n => n + 1);
  };

  return <section className="proposal-page">
    <motion.div className="proposal-heart" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: .1 }}><Heart size={58} strokeWidth={1} /><Sparkles className="heart-sparkle" size={24} /></motion.div>
    <div className="eyebrow">EVERY CHAPTER HAS LED TO THIS</div>
    <motion.p className="handwritten proposal-intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : .5 }}>So, {content.name}…</motion.p>
    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 1 }}>{content.question}</motion.h1>
    <motion.p className="proposal-description" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : 1.5 }}>Not just for the big moments.<br />For the ordinary Tuesdays. For all of it.</motion.p>
    {confirming ? <div className="no-confirmation" aria-live="polite">
      <h2>Is it really a no? 🙂</h2><p>It’s okay if it is. Your answer is yours, and I respect it.</p>
      <button className="secondary-button" onClick={onNo}>Yes, it’s a no</button>
      <button className="text-button" onClick={() => setConfirming(false)}>Just teasing — back to the question ♡</button>
    </div> : <>
      <div className="proposal-buttons" ref={area}>
        <motion.button className="primary-button yes-button" whileTap={{ scale: .95 }} animate={reduced ? {} : { scale: [1, 1.035, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} onClick={onYes}>YES! <Heart size={22} fill="currentColor" /></motion.button>
        <motion.button className="think-button" animate={position} transition={{ type: 'spring', stiffness: 250, damping: 20 }} onPointerEnter={e => { if (e.pointerType === 'mouse' && !reduced) dodge(); }} onClick={dodge}>{teasing[dodges % teasing.length]}</motion.button>
      </div>
      {seriousOption && <motion.button className="serious-no-button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setConfirming(true)}>Is it really a no? 🙂</motion.button>}
    </>}
    <p className="proposal-footnote">{status === 'recording' ? '● Recording your reaction with your permission.' : 'No grand gestures needed. Just your heart.'}</p>
  </section>;
}
