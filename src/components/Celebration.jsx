import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, MailOpen, Sparkles } from 'lucide-react';
import { content } from '../content';
import ReactionRevealModal from './ReactionRevealModal';

export default function Celebration({ blob, status }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const timers = [0, 450, 1000, 1700].map((delay, i) => setTimeout(() => confetti({ particleCount: 65, spread: 85, origin: { x: i % 2 ? .8 : .2, y: .65 }, colors: ['#d96b83', '#c59b27', '#f3c5ce', '#fff3d8'], disableForReducedMotion: true }), delay));
    return () => { timers.forEach(clearTimeout); confetti.reset(); };
  }, [reduced]);
  return <section className="celebration-page"><div className="celebration-glow" /><motion.div className="celebration-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}><Heart size={61} fill="currentColor" strokeWidth={1} /><Sparkles size={27} /></motion.div><div className="eyebrow">MY FAVORITE CHAPTER STARTS HERE</div><h1>You said <em>yes.</em></h1><p className="handwritten celebration-script">And just like that, my whole world smiled.</p><p className="closing-message">{content.closing}</p><span className="handwritten closing-signature">All my love, {content.from} ♡</span>{blob ? <motion.button className="secret-envelope" onClick={() => setOpen(true)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><MailOpen size={27} /><span><small>ONE LAST LITTLE SURPRISE</small><strong>Want to see how cute you looked just now? 👀</strong></span><span>→</span></motion.button> : status === 'recording' ? <p className="finalizing" aria-live="polite">Tucking one last little memory into an envelope…</p> : <div className="keepsake-note"><Heart size={17} /> Some moments live in our hearts. This one’s ours.</div>}<div className="forever-label">YOU + ME · TO BE CONTINUED</div>{open && blob && <ReactionRevealModal blob={blob} onClose={close} />}</section>;
}
