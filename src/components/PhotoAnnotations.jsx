import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { content } from '../content';
import { ChapterHeading, NextButton } from './Shared';

export default function PhotoAnnotations({ onNext }) {
  const [index, setIndex] = useState(0);
  const photo = content.photos[index];
  const last = index === content.photos.length - 1;
  const changePhoto = next => setIndex(next);

  return <section className="chapter-page memories-page">
    <ChapterHeading number="02" eyebrow="THROUGH MY EYES"
      title={last ? <>And the cutest scene ever?<br /><em>This one. Right here.</em></> : <>My favorite view?<br /><em>It’s always been you.</em></>}
      subtitle={last ? 'Saved the sweetest one for last. ♡' : 'One little memory at a time. No rushing the good parts.'} />
    <div className="progressive-photo">
      <AnimatePresence mode="wait">
        <motion.article className={`memory-polaroid ${last ? 'last-memory' : ''}`} key={index}
          initial={{ opacity: 0, y: 25, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: last ? 2 : -2 }}
          exit={{ opacity: 0, x: -25, rotate: -5 }} transition={{ duration: .4 }} whileHover={{ rotate: 0 }}>
          <span className="washi-tape" />
          {last && <span className="cutest-badge"><Sparkles size={13} /> THE CUTEST. EVER.</span>}
          <div className="memory-image">
            <img src={photo.src} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = photo.fallback; }} alt={photo.label} />
          </div>
          <h3 className="handwritten">{photo.label}</h3><span className="photo-date">{photo.date}</span>
        </motion.article>
      </AnimatePresence>
    </div>
    <div className="memory-counter" aria-live="polite">MOMENT {String(index + 1).padStart(2, '0')} OF {String(content.photos.length).padStart(2, '0')}</div>
    <div className="memory-navigation">
      {index > 0 && <button className="memory-back" onClick={() => changePhoto(index - 1)}><ChevronLeft size={16} /> Previous memory</button>}
      <NextButton onClick={last ? onNext : () => changePhoto(index + 1)}>{last ? 'A little game, just for us' : index === content.photos.length - 2 ? 'I saved the cutest for last' : 'Another little memory'}</NextButton>
    </div>
  </section>;
}
