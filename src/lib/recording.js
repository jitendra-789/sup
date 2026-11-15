export const MIME_TYPES = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
export function chooseMimeType(recorder) {
  return MIME_TYPES.find(type => recorder.isTypeSupported(type)) || '';
}
export function recordingExtension(type) {
  return type.includes('mp4') ? 'mp4' : 'webm';
}
