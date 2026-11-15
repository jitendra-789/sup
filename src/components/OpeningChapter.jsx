import { motion, useReducedMotion } from 'framer-motion';
import { content } from '../content';
import { ChapterHeading, NextButton } from './Shared';

export default function OpeningChapter({ onNext }) {
  const reduced = useReducedMotion();
  return <section className="chapter-page opening-page"><ChapterHeading number="01" eyebrow="A NOTE FROM ME" title={<>Before anything else,<br /><em>a few words for you.</em></>} subtitle="Some things deserve more than a text message." />
    <div className="letter-paper"><span className="washi-tape" /><span className="handwritten letter-salutation">My dear {content.name},</span>{content.opening.map((text, i) => <motion.p key={text} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : .3 + i * .8, duration: .6 }}>{text}</motion.p>)}<div className="letter-signature"><span className="handwritten">Always, {content.from}</span><span>♡</span></div></div>
    <NextButton onClick={onNext}>See yourself through my eyes</NextButton>
  </section>;
}
