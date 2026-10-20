import fs from 'fs';
import path from 'path';

import { REMINDER_FILE, SOUND_FILE } from '../sounds';

const MAX_SECONDS = 2;

/** Reads the duration of a PCM WAV from its header. */
function wavSeconds(file: string) {
  const buf = fs.readFileSync(file);
  const byteRate = buf.readUInt32LE(28);
  let offset = 12;
  while (offset < buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === 'data') return size / byteRate;
    offset += 8 + size;
  }
  throw new Error(`No data chunk in ${file}`);
}

describe('notification sound length', () => {
  it.each([...Object.values(SOUND_FILE), REMINDER_FILE])('%s is at most 2 seconds', (file) => {
    const seconds = wavSeconds(path.join(__dirname, '../../../../assets/sounds', file));
    expect(seconds).toBeGreaterThan(0.3);
    expect(seconds).toBeLessThanOrEqual(MAX_SECONDS);
  });
});
