import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chooseMimeType, recordingExtension, MIME_TYPES } from '../src/lib/recording.js';

test('prefers Safari MP4 codecs when supported', () => {
  assert.equal(chooseMimeType({ isTypeSupported: () => true }), MIME_TYPES[0]);
});
test('falls back to supported Chrome WebM codec', () => {
  assert.equal(chooseMimeType({ isTypeSupported: type => type.includes('vp9') }), 'video/webm;codecs=vp9');
});
test('allows browser defaults if no listed codec is supported', () => {
  assert.equal(chooseMimeType({ isTypeSupported: () => false }), '');
});
test('file extensions match recording types', () => {
  assert.equal(recordingExtension('video/mp4;codecs=avc1'), 'mp4');
  assert.equal(recordingExtension('video/webm'), 'webm');
});
