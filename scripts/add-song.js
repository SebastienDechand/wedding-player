#!/usr/bin/env node
const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// --- Args ---
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, ...v] = a.slice(2).split('='); return [k, v.join('=')]; })
);

const { youtube, title, artist } = args;
if (!youtube || !title || !artist) {
  console.error('Usage: node scripts/add-song.js --youtube="URL" --title="Title" --artist="Artist"');
  process.exit(1);
}

// --- Helpers ---
function slug(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fetchCover(title, artist) {
  try {
    const q = encodeURIComponent(`${title} ${artist}`);
    const raw = await httpsGet(`https://itunes.apple.com/search?term=${q}&media=music&limit=1`);
    const json = JSON.parse(raw);
    const url = json.results?.[0]?.artworkUrl100;
    return url ? url.replace('100x100bb', '300x300bb') : '';
  } catch { return ''; }
}

// --- Main ---
(async () => {
  const filename = `${slug(title)}_${slug(artist)}`;
  const mp3Path = path.join(ROOT, 'public', 'audios', `${filename}.mp3`);
  const lyricsPath = path.join(ROOT, 'public', 'lyrics', `${filename}.txt`);

  // 1. Download MP3
  console.log('\n⬇  Downloading MP3...');
  execSync(`yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${mp3Path}" "${youtube}"`, { stdio: 'inherit' });

  // 2. Duration
  const seconds = parseFloat(
    execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${mp3Path}"`).toString().trim()
  );
  const duration = `${Math.floor(seconds / 60)}:${Math.round(seconds % 60).toString().padStart(2, '0')}`;

  // 3. Cover
  console.log('🖼  Fetching cover from iTunes...');
  const cover = await fetchCover(title, artist);

  // 4. playlist.json
  const playlistPath = path.join(ROOT, 'public', 'audios', 'playlist.json');
  const data = JSON.parse(fs.readFileSync(playlistPath, 'utf8'));
  const nextId = Math.max(...data.playlist.map(t => t.id)) + 1;
  data.playlist.push({ id: nextId, title, artist, url: `audios/${filename}.mp3`, duration, cover });
  fs.writeFileSync(playlistPath, JSON.stringify(data, null, 2) + '\n', 'utf8');

  // 5. Lyrics
  console.log('🎵  Fetching lyrics...');
  try {
    const Genius = require('genius-lyrics');
    const client = new Genius.Client();
    const cleanTitle = title.replace(/\s*[-–]\s*(Live|Cover|Remaster.*)$/i, '').trim();
    const cleanArtist = artist.split(/[,&]/)[0].trim();
    const results = await client.songs.search(`${cleanTitle} ${cleanArtist}`);
    const original = results.find(s => !s.title.toLowerCase().includes('translation')) || results[0];
    if (original) {
      const lyrics = await original.lyrics();
      fs.writeFileSync(lyricsPath, lyrics.trim(), 'utf8');
      console.log(`   ✓ Lyrics: "${original.title}" by ${original.artist.name}`);
    } else {
      fs.writeFileSync(lyricsPath, '', 'utf8');
      console.log('   ✗ Lyrics not found');
    }
  } catch (e) {
    fs.writeFileSync(lyricsPath, '', 'utf8');
    console.log(`   ✗ Lyrics error: ${e.message}`);
  }

  console.log(`\n✅ Added "${title}" — ${artist} (id ${nextId}, ${duration})`);
  if (!cover) console.log('   ⚠ No cover found — add manually to playlist.json');
})();
