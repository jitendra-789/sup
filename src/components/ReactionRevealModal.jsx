import { useEffect, useRef, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { recordingExtension } from '../lib/recording';
import { ModalBackdrop } from './Shared';

export default function ReactionRevealModal({ blob, onClose }) {
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const dialog = useRef(null);
  const close = useRef(null);
  const filename = `our-little-yes.${recordingExtension(blob.type)}`;
  const file = new File([blob], filename, { type: blob.type });
  const canShare = !!navigator.canShare?.({ files: [file] });
  useEffect(() => { const objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); return () => URL.revokeObjectURL(objectUrl); }, [blob]);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus();
    const handle = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const nodes = [...dialog.current.querySelectorAll('button, a[href], video')];
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handle);
    return () => { document.removeEventListener('keydown', handle); document.body.style.overflow = overflow; previous?.focus(); };
  }, [onClose]);
  const share = async () => { try { await navigator.share({ files: [file], title: 'Our little yes ♡' }); } catch (error) { if (error.name !== 'AbortError') setMessage('Sharing isn’t available right now. Try Save video instead.'); } };
  return <ModalBackdrop onClick={onClose}><motion.div ref={dialog} className="reaction-modal" role="dialog" aria-modal="true" aria-labelledby="reaction-title" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}><button ref={close} className="close-modal" onClick={onClose} aria-label="Close reaction video"><X size={21} /></button><span className="eyebrow">A MOMENT TO KEEP</span><h2 id="reaction-title">That smile. <em>That’s the one.</em></h2>{url && <video src={url} controls playsInline preload="metadata" tabIndex={0} />}<div className="modal-actions"><a className="primary-button" href={url || undefined} download={filename}><Download size={17} /> Save video</a>{canShare && <button className="secondary-button" onClick={share}><Share2 size={17} /> Share / Save to Photos</button>}</div><p>{message || 'On iPhone, use Share → Save Video, or save to Files.'}</p></motion.div></ModalBackdrop>;
}
