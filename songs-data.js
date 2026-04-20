// Shared Music Data
/**
 * CLOUD STORAGE NOTE (Cloudinary):
 * To use songs from Cloudinary, upload your files to the Media Library.
 * Copy the "URL" of the file.
 * Example Pattern: https://res.cloudinary.com/[your-cloud-name]/video/upload/v12345/song.mp3
 */
export const songs = [
  {
    id: 1,
    title: "Dhurandhar - Title Track",
    artist: "Asha Bhosle, R.D. Burman",
    albumId: 1,
    duration: "2:35",
    cover: "images/Dhurandhar-title-track.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597534/Dhurandhar_-_Title_Track_-_Dhurandhar_320_kbps_wiemwg.mp3" // Placeholder Cloudinary URL
  },
  {
    id: 2,
    title: "Lutt Le Gaya",
    artist: "Asha Bhosle",
    albumId: 1,
    duration: "4:13",
    cover: "images/lutt-le-gaya.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597562/Lutt_Le_Gaya_ritd1l.mp3"
  },
  {
    id: 3,
    title: "Naal Nachna",
    artist: "Suresh Wadkar",
    albumId: 1,
    duration: "2:35",
    cover: "images/naal-nachna.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597553/Naal_Nachna_-_Dhurandhar_320_kbps_llqz2v.mp3"
  },
  {
    id: 4,
    title: "Ramba Ho",
    artist: "Asha Bhosle, Usha Uthup",
    albumId: 1,
    duration: "2:41",
    cover: "images/ramba-ho.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597559/Ramba_Ho_-_Dhurandhar_320_kbps_gvmnol.mp3"
  },
  {
    id: 5,
    title: "Run Down The City",
    artist: "Monica",
    albumId: 1,
    duration: "2:20",
    cover: "images/run-down-the-city.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597552/Run_Down_The_City_-_Monica_-_Dhurandhar_320_kbps_din1n7.mp3"
  },
  {
    id: 6,
    title: "Shararat",
    artist: "Asha Bhosle",
    albumId: 1,
    duration: "3:44",
    cover: "images/shararat.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597557/Shararat_-_Dhurandhar_320_kbps_y7i3hl.mp3"
  }
];

export const albums = [
  {
    id: 1,
    title: "Dhurandhar (1983)",
    artist: "R. D. Burman",
    cover: "images/Dhurandhar-title-track.jpg",
    description: "The classic Bollywood energetic soundtrack composed by the legend R. D. Burman."
  },
  {
    id: 2,
    title: "Future Retro",
    artist: "Neon Collective",
    cover: "https://placehold.co/400x400/2a1e3c/ff00ff?text=Future+Retro",
    description: "The best of synthwave and electronic."
  },
  {
    id: 3,
    title: "Unplugged Sessions",
    artist: "Wood & Strings",
    cover: "https://placehold.co/400x400/3e2c1e/d4af37?text=Acoustic+Hits",
    description: "Pure acoustic melodies."
  },
  {
    id: 4,
    title: "Ambient Space",
    artist: "Orbit",
    cover: "https://placehold.co/400x400/0a0a1a/7aaae0?text=Ambient+Space",
    description: "Atmospheric sounds from the void."
  }
];
