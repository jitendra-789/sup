import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Heart, Sparkles } from 'lucide-react';
import { content } from '../content';
import { ChapterHeading, NextButton } from './Shared';

export default function TriviaAndReasons({ onNext }) {
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [flipped, setFlipped] = useState([]);
  const [reasons, setReasons] = useState(false);
  const current = content.trivia[question];
  const correct = answer === current.answer;
  return <section className="chapter-page trivia-page"><ChapterHeading number="03" eyebrow={reasons ? 'THE LITTLE THINGS' : 'A LITTLE US-TRIVIA'} title={reasons ? <>A few of the million reasons<br /><em>I adore you.</em></> : <>How well do you<br /><em>know our little world?</em></>} subtitle={reasons ? 'Pick a little love note. There’s a little truth inside each one.' : 'No scores. No pressure. Just an excuse to make you smile.'} />
    {!reasons ? <AnimatePresence mode="wait"><motion.div className="quiz-card" key={question} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><div className="quiz-progress">{content.trivia.map((_, i) => <span key={i} className={i <= question ? 'active' : ''} />)}<span>{question + 1} / {content.trivia.length}</span></div><span className="handwritten quiz-kicker">Okay, this one’s important…</span><h2>{current.question}</h2><div className="quiz-options">{current.options.map((option, i) => <button key={option} disabled={correct} className={`${answer === i ? correct ? 'correct' : 'incorrect' : ''}`} onClick={() => setAnswer(i)}><span>{String.fromCharCode(65 + i)}</span>{option}{answer === i && correct && <Check size={18} />}</button>)}</div><p className={`quiz-feedback ${correct ? 'is-correct' : ''}`} aria-live="polite">{answer !== null ? correct ? current.success : current.hint : 'I have a feeling you already know. ♡'}</p>{correct && <NextButton onClick={() => { if (question === content.trivia.length - 1) setReasons(true); else { setQuestion(question + 1); setAnswer(null); } }}>{question === content.trivia.length - 1 ? 'There’s more I love about you' : 'One more little question'}</NextButton>}</motion.div></AnimatePresence> : <><div className="reasons-grid">{content.reasons.map((reason, i) => <button key={reason} className={`reason-card ${flipped.includes(i) ? 'flipped' : ''}`} aria-pressed={flipped.includes(i)} onClick={() => setFlipped(prev => prev.includes(i) ? prev.filter(n => n !== i) : [...prev, i])}><motion.div animate={{ rotateY: flipped.includes(i) ? 180 : 0 }} transition={{ type: 'spring', stiffness: 150, damping: 20 }} className="reason-inner"><div className="reason-front"><Heart size={27} strokeWidth={1} /><span className="handwritten">little reason no. {String(i + 1).padStart(2, '0')}</span><span>tap to open</span></div><div className="reason-back"><Sparkles size={18} /><span className="handwritten">{reason}</span></div></motion.div></button>)}</div><p className="handwritten photo-tip">And that’s only the beginning.</p><NextButton onClick={onNext}>I have something to ask you</NextButton></>}
  </section>;
}
