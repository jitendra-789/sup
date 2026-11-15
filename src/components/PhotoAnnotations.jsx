import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Plus, X } from 'lucide-react';
import { content } from '../content';
import { ChapterHeading, NextButton } from './Shared';

export default function PhotoAnnotations({ onNext }) {
  const [open, setOpen] = useState(null);
  return <section className="chapter-page memories-page"><ChapterHeading number="02" eyebrow="THROUGH MY EYES" title={<>My favorite view?<br /><em>It’s always been you.</em></>} subtitle="A few moments I wish I could keep in my pocket forever." /><div className="photo-grid">{content.photos.map((photo, i) => <motion.article className="memory-polaroid" key={photo.src} initial={{ opacity: 0, y: 30, rotate: 0 }} animate={{ opacity: 1, y: 0, rotate: [-4, 3, -2][i] }} transition={{ delay: i * .15 }} whileHover={{ y: -10, rotate: 0 }}><span className="washi-tape" /><div className="memory-image"><img src={photo.src} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = photo.fallback; }} alt={photo.label} /><button className="photo-pin" style={{ left: `${photo.pin[0]}%`, top: `${photo.pin[1]}%` }} aria-expanded={open === i} aria-label={`Read the note for ${photo.label}`} onClick={() => setOpen(open === i ? null : i)}>{open === i ? <X size={16} /> : <Plus size={17} />}</button><AnimatePresence>{open === i && <motion.div className="photo-annotation handwritten" initial={{ opacity: 0, scale: .9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .9 }}><Heart size={16} />{photo.note}</motion.div>}</AnimatePresence></div><h3 className="handwritten">{photo.label}</h3><span className="photo-date">{photo.date}</span></motion.article>)}</div><p className="handwritten photo-tip">psst… tap the little + for a secret note ♡</p><NextButton onClick={onNext}>A little game, just for us</NextButton></section>;
}
