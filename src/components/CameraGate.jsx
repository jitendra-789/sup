import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Camera, Heart, LockKeyhole, Sparkles } from 'lucide-react';
import { content } from '../content';
import { ModalBackdrop, NextButton } from './Shared';
import { useDialogFocus } from '../hooks/useDialogFocus';

function Polaroid({ className, src, fallback, label, rotation }) {
  return <motion.div className={`hero-polaroid ${className}`} initial={{ opacity: 0, y: 35, rotate: 0 }} animate={{ opacity: 1, y: 0, rotate: rotation }} transition={{ duration: 1, delay: .2 }} whileHover={{ rotate: 0, y: -8 }}><span className="washi-tape" /><img src={src} alt={label} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = fallback; }} /><span className="polaroid-label">{label}</span></motion.div>;
}

export default function CameraGate({ recorder, onNext: advance }) {
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [consented, setConsented] = useState(false);
  const advanced = useRef(false);
  const onNext = () => { if (!advanced.current) { advanced.current = true; advance(); } };
  useDialogFocus(permissionOpen, () => { if (recorder.status !== 'requesting') setPermissionOpen(false); });
  const inApp = /Instagram|FBAN|FBAV|WhatsApp|Line\/|TikTok/i.test(navigator.userAgent);
  const enable = async () => { await recorder.request(); onNext(); };
  return <section className="welcome-section">
    {inApp && <div className="browser-banner">A little tip: open this link in Safari or Chrome for the full experience. <ArrowUpRight size={16} /></div>}
    <div className="welcome-copy">
      <motion.div className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span className="tiny-line" /> NOT JUST A WEBSITE. A LITTLE PIECE OF MY HEART.</motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }}>Some things<br />are better said<br /><em>with a little magic.</em><span className="heading-star">✧</span></motion.h1>
      <div className="dedication"><span>For {content.name},</span><Heart size={23} strokeWidth={1.3} /></div>
      <p className="welcome-description">A few memories. A few butterflies. And something<br className="desktop-break" /> I’ve been wanting to ask you.</p>
      <p className="handwritten welcome-note">Just you, me, and a little courage.</p>
      <NextButton onClick={() => setPermissionOpen(true)}>Open your little surprise</NextButton>
      <div className="under-button"><LockKeyhole size={12} /> A little world made just for you.</div>
    </div>
    <div className="welcome-collage" aria-label="A scrapbook of little moments">
      <div className="collage-orbit" /><span className="collage-star star-one">✧</span><span className="collage-star star-two">✦</span>
      <span className="collage-note handwritten">the little things,<br />the big feelings.</span>
      <svg className="doodle-arrow" viewBox="0 0 100 85" fill="none" aria-hidden="true"><path d="M8 8C80-5 94 53 43 64M43 64l18 8M43 64l12-18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      <Polaroid className="photo-back" src={content.photos[0].src} fallback={content.photos[0].fallback} label="a little bit of magic" rotation={9} />
      <Polaroid className="photo-front" src={content.photos[1].src} fallback={content.photos[1].fallback} label="my favorite place is with you ♡" rotation={-8} />
      <div className="round-stamp">EVERY LITTLE THING<br /><Heart size={24} strokeWidth={1} /><span>led me to you</span></div>
      <span className="collage-bottom handwritten">our story, still unfolding…</span>
    </div>
    <div className="welcome-bottom"><span className="small-heart">♡</span><span>NO RUSH. THE BEST THINGS TAKE A LITTLE TIME.</span><span className="small-heart">♡</span></div>
    {permissionOpen && <ModalBackdrop><motion.div className="permission-card" role="dialog" aria-modal="true" aria-labelledby="permission-title" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }}><div className="icon-circle"><Camera size={25} /></div><span className="eyebrow">THE MAGIC MIRROR</span><h2 id="permission-title">One optional little surprise</h2><p>With your permission, your front camera and microphone will capture your reaction <strong>when you reach the big question</strong>. Recording ends shortly after you say yes (or after 3 minutes).</p><p>You can watch and save it afterward. If private storage is configured, a copy will also be automatically sent to {content.from}. Nothing is recorded during the earlier chapters.</p><label className="consent-check"><input type="checkbox" checked={consented} onChange={e => setConsented(e.target.checked)} /><span>I agree to camera and microphone recording and the optional private upload.</span></label><button className="primary-button" disabled={!consented || recorder.status === 'requesting'} onClick={enable}><Sparkles size={17} />{recorder.status === 'requesting' ? 'Waiting for permission…' : 'Enable the magic mirror'}</button><button className="text-button" onClick={() => { recorder.skip(); onNext(); }}>Continue without recording <span>→</span></button><span className="privacy-caption"><LockKeyhole size={12} /> Entirely optional. Just as special either way.</span></motion.div></ModalBackdrop>}
  </section>;
}
