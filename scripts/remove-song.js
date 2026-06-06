#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, ...v] = a.slice(2).split('='); return [k, v.join('=')]; })
);

const id = parseInt(args.id);
if (!id) {
  console.error('Usage: node scripts/remove-song.js --id=12');
  process.exit(1);
}

const playlistPath = path.join(ROOT, 'public', 'audios', 'playlist.json');
const data = JSON.parse(fs.readFileSync(playlistPath, 'utf8'));
const track = data.playlist.find(t => t.id === id);

if (!track) {
  console.error(`No track with id ${id}`);
  process.exit(1);
}

console.log(`\nRemoving: [${id}] "${track.title}" — ${track.artist}`);

const mp3Path = path.join(ROOT, 'public', track.url);
const filename = track.url.replace('audios/', '').replace('.mp3', '');
const lyricsPath = path.join(ROOT, 'public', 'lyrics', `${filename}.txt`);

if (fs.existsSync(mp3Path)) { fs.unlinkSync(mp3Path); console.log('✓  MP3 deleted'); }
else console.log('⚠  MP3 not found');

if (fs.existsSync(lyricsPath)) { fs.unlinkSync(lyricsPath); console.log('✓  Lyrics deleted'); }
else console.log('⚠  Lyrics file not found');

data.playlist = data.playlist
  .filter(t => t.id !== id)
  .map((t, i) => ({ ...t, id: i + 1 }));

fs.writeFileSync(playlistPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`✓  playlist.json updated — ${data.playlist.length} tracks, IDs 1–${data.playlist.length}`);
