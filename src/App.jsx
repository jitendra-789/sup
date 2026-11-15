import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Heart, Volume2, VolumeX } from 'lucide-react';
import { content } from './content';
import { useReactionRecorder } from './hooks/useReactionRecorder';
import CameraGate from './components/CameraGate';
import OpeningChapter from './components/OpeningChapter';
import PhotoAnnotations from './components/PhotoAnnotations';
import TriviaAndReasons from './components/TriviaAndReasons';
import ProposalFinale from './components/ProposalFinale';
import Celebration from './components/Celebration';
import { LoveMark } from './components/Shared';

const chapters = ['A little hello', 'The letter', 'Our moments', 'Little things', 'The question', 'Our next chapter'];

export default function App() {
  const [stage, setStage] = useState(0);
  const [declined, setDeclined] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [musicMissing, setMusicMissing] = useState(false);
  const music = useRef(null);
  const heading = useRef(null);
  const recorder = useReactionRecorder();
  const next = () => setStage(s => Math.min(5, s + 1));
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); if (stage > 0) heading.current?.focus({ preventScroll: true }); }, [stage]);
  useEffect(() => { if (stage === 4) recorder.start(); }, [stage, recorder.start]);
  const toggleMusic = async () => {
    if (musicOn) { music.current.pause(); setMusicOn(false); }
    else { try { music.current.volume = .15; await music.current.play(); setMusicOn(true); } catch { setMusicMissing(true); } }
  };
  const yes = () => { recorder.finish(); setStage(5); };
  const no = () => { recorder.skip(); setDeclined(true); setStage(5); };
  return <MotionConfig reducedMotion="user"><div className="app-shell"><div className="paper-grain" aria-hidden="true" /><div className="ambient-petals" aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <i key={i} style={{ left: `${8 + i * 14}%`, animationDelay: `${i * -3}s`, animationDuration: `${18 + i * 2}s` }} />)}</div><header className="site-header"><a href="#" className="brand" onClick={e => e.preventDefault()} aria-label="For you, with love"><Heart size={20} strokeWidth={1.4} /><span>for you, <em>with love.</em></span></a><div className="header-right"><span className="header-dedication">a little something, just for {content.name.toLowerCase()}</span><button className="music-toggle" onClick={toggleMusic} aria-label={musicOn ? 'Mute background music' : 'Play background music'} title={musicMissing ? 'Add public/assets/background-music.mp3 to enable music' : 'Optional background music'} disabled={musicMissing}>{musicOn ? <Volume2 size={17} /> : <VolumeX size={17} />}</button></div></header><main ref={heading} tabIndex={-1} id="main-content"><AnimatePresence mode="wait"><motion.div key={stage} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .4 }}>
    {stage === 0 && <CameraGate recorder={recorder} onNext={next} />}
    {stage === 1 && <OpeningChapter onNext={next} />}
    {stage === 2 && <PhotoAnnotations onNext={next} />}
    {stage === 3 && <TriviaAndReasons onNext={next} />}
    {stage === 4 && <ProposalFinale onYes={yes} onNo={no} status={recorder.status} />}
    {stage === 5 && (declined ? <section className="celebration-page declined-page"><div className="eyebrow">NO PRESSURE. ALWAYS.</div><h1>Thank you for<br /><em>being honest.</em></h1><p className="closing-message">You don’t owe me a yes. I’m glad you took the time to read this, and I respect your answer.</p><p className="handwritten closing-signature">Take all the space you need. ♡</p></section> : <Celebration blob={recorder.blob} status={recorder.status} />)}
  </motion.div></AnimatePresence></main><footer className="site-footer"><LoveMark /><nav className="chapter-dots" aria-label="Chapter progress">{chapters.map((chapter, i) => <span key={chapter} className={`chapter-dot ${stage === i ? 'current' : ''} ${stage > i ? 'completed' : ''}`} aria-current={stage === i ? 'step' : undefined} title={chapter}><span className="sr-only">{chapter}{stage === i ? ', current chapter' : ''}</span></span>)}</nav><span className="footer-page">{String(stage + 1).padStart(2, '0')} <span>/ 06</span></span></footer><audio ref={music} src={content.music} loop preload="none" onError={() => { setMusicMissing(true); setMusicOn(false); }} /></div></MotionConfig>;
}
