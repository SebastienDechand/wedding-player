const Genius = require('genius-lyrics');
const fs = require('fs');
const path = require('path');
const playlist = require('../public/audios/playlist.json');

const client = new Genius.Client(); // unofficial mode, no API key needed

const SKIP = new Set(['wicked_game']); // personal cover, no lyrics to find

function getLyricsPath(url) {
  const filename = url.replace('audios/', '').replace('.mp3', '');
  return { filename, filepath: path.join(__dirname, '..', 'public', 'lyrics', `${filename}.txt`) };
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchLyrics(title, artist) {
  const query = `${title} ${artist.split(/[,&]/)[0].trim()}`;
  const cleanTitle = title.replace(/\s*[-–]\s*(Live|Cover|Remaster.*|Greatest Hits.*)$/i, '').trim();
  const cleanQuery = `${cleanTitle} ${artist.split(/[,&]/)[0].trim()}`;

  const searches = await client.songs.search(cleanQuery);
  if (!searches || searches.length === 0) return null;

  // Pick the best match (first result)
  const lyrics = await searches[0].lyrics();
  return lyrics;
}

async function main() {
  const tracks = playlist.playlist;
  console.log(`Fetching lyrics for ${tracks.length} tracks...\n`);

  for (const track of tracks) {
    const { filename, filepath } = getLyricsPath(track.url);

    if (SKIP.has(filename)) {
      console.log(`⏭  Skipped: ${track.title} (personal cover)`);
      continue;
    }

    // Skip if already filled (more than 50 chars)
    const existing = fs.existsSync(filepath) ? fs.readFileSync(filepath, 'utf8') : '';
    if (existing.trim().length > 50) {
      console.log(`✓  Already filled: ${track.title}`);
      continue;
    }

    try {
      const lyrics = await fetchLyrics(track.title, track.artist);
      if (lyrics && lyrics.trim().length > 0) {
        fs.writeFileSync(filepath, lyrics.trim(), 'utf8');
        console.log(`✓  ${track.title} — ${track.artist}`);
      } else {
        console.log(`✗  Not found: ${track.title}`);
      }
    } catch (e) {
      console.log(`✗  Error: ${track.title} — ${e.message}`);
    }

    await sleep(800); // avoid rate limiting
  }

  console.log('\nDone.');
}

main().catch(console.error);
