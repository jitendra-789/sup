import { motion } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';
import { createPortal } from 'react-dom';

export function ModalBackdrop({ children, onClick }) {
  return createPortal(<div className="modal-backdrop" onClick={onClick}>{children}</div>, document.body);
}

export function NextButton({ children = 'A little more magic', onClick }) {
  return <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} className="primary-button" onClick={onClick}>{children}<ArrowRight size={17} /></motion.button>;
}

export function ChapterHeading({ number, eyebrow, title, subtitle }) {
  return <div className="chapter-heading"><div className="eyebrow"><span className="tiny-line" />{number ? `CHAPTER ${number} · ` : ''}{eyebrow}<span className="tiny-line" /></div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>;
}

export function LoveMark() { return <span className="love-mark"><Heart size={14} fill="currentColor" /> made with a heart full of you</span>; }
