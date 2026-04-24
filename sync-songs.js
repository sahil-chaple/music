// sync-songs.js
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function slugify(text) {
  return text.toString().toLowerCase().split('/').pop().split('_')[0].split('-')[0].replace(/\s+/g, '').replace(/[^\w]+/g, '').trim();
}

async function syncSongs() {
  console.log("🔄 StreamWave Incremental Sync: Checking for new music...");
  
  const filePath = './songs-data.js';
  let existingContent = '';
  let existingSongs = [];
  let existingAlbumsHtml = '';

  // 1. Read existing file and parse songs
  if (fs.existsSync(filePath)) {
    existingContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract existing songs array using regex
    const songMatch = existingContent.match(/export const songs = \[(.*?)\];/s);
    if (songMatch) {
      const arrayContent = songMatch[1];
      // Simple parse: find all file URLs already in the list
      const urlMatches = arrayContent.match(/file: "(.*?)"/g);
      if (urlMatches) {
        existingSongs = urlMatches.map(m => m.match(/"(.*?)"/)[1]);
      }
    }
    
    // Preserve albums section
    const albumMatch = existingContent.match(/export const albums = \[(.*?)\];/s);
    if (albumMatch) {
      existingAlbumsHtml = albumMatch[0];
    }
  }

  try {
    // 2. Fetch from Cloudinary
    const audioRes = await cloudinary.search.expression('resource_type:video').max_results(500).execute();
    const imageRes = await cloudinary.search.expression('resource_type:image').max_results(500).execute();
    
    const audioFiles = audioRes.resources || [];
    const imageFiles = imageRes.resources || [];

    // 3. Filter for NEW songs only
    const newFiles = audioFiles.filter(file => !existingSongs.includes(file.secure_url));

    if (newFiles.length === 0) {
      console.log("✨ No new songs found. Your library is up to date!");
      return;
    }

    console.log(`🆕 Found ${newFiles.length} new songs! Adding them now...`);
    
    // Get highest existing ID
    const idMatches = existingContent.match(/id: (\d+)/g);
    let lastId = 0;
    if (idMatches) {
      lastId = Math.max(...idMatches.map(m => parseInt(m.match(/\d+/)[0])));
    }

    const newSongsCode = newFiles.map((file, index) => {
      const fileName = file.public_id.split('/').pop();
      const songSlug = slugify(file.public_id);
      
      let title = fileName.split('_')[0].split('-')[0].trim();
      if (title.length < 3) title = fileName.replace(/[_-]/g, ' ').replace(/\d+kbps/gi, '').trim();

      const matchingCover = imageFiles.find(img => {
        const imgSlug = slugify(img.public_id);
        return songSlug === imgSlug || songSlug.includes(imgSlug) || imgSlug.includes(songSlug);
      });

      return `  {
    id: ${lastId + index + 1},
    title: "${title}",
    artist: "New Artist",
    albumId: 1,
    isTrending: false,
    isPopular: false,
    isNewRelease: true,
    cover: "${matchingCover ? matchingCover.secure_url : "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687172/Dhurandhar-title-track_wolv0w.jpg"}",
    file: "${file.secure_url}"
  }`;
    }).join(',\n');

    // 4. Reconstruct the file
    let updatedContent = '';
    if (existingContent.includes('];')) {
      // Insert new songs before the closing bracket of the songs array
      updatedContent = existingContent.replace(/(\s*)\];(\s*export const albums)/s, (match, p1, p2) => {
        return `,\n${newSongsCode}\n];\n\n${p2}`;
      });
    } else {
      // Fallback for new file
      updatedContent = `export const songs = [\n${newSongsCode}\n];\n\nexport const albums = [];`;
    }

    fs.writeFileSync(filePath, updatedContent);
    console.log(`\n✅ Done! Added ${newFiles.length} new tracks to songs-data.js.`);
    console.log(`🔒 Your previous ${existingSongs.length} songs were kept exactly as they were.`);

  } catch (error) {
    console.error("\n❌ Sync Error:", error.message);
  }
}

syncSongs();
