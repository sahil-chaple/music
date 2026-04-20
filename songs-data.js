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
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687172/Dhurandhar-title-track_wolv0w.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597534/Dhurandhar_-_Title_Track_-_Dhurandhar_320_kbps_wiemwg.mp3" // Placeholder Cloudinary URL
  },
  {
    id: 2,
    title: "Lutt Le Gaya",
    artist: "Asha Bhosle",
    albumId: 1,
    duration: "4:13",
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687171/Lutt-Le-Gaya_qwihoh.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597562/Lutt_Le_Gaya_ritd1l.mp3"
  },
  {
    id: 3,
    title: "Naal Nachna",
    artist: "Suresh Wadkar",
    albumId: 1,
    duration: "2:35",
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687173/Naal-Nachna_mkbvt4.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597553/Naal_Nachna_-_Dhurandhar_320_kbps_llqz2v.mp3"
  },
  {
    id: 4,
    title: "Ramba Ho",
    artist: "Asha Bhosle, Usha Uthup",
    albumId: 1,
    duration: "2:41",
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687172/ramba-ho_chmljv.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597559/Ramba_Ho_-_Dhurandhar_320_kbps_gvmnol.mp3"
  },
  {
    id: 5,
    title: "Run Down The City",
    artist: "Monica",
    albumId: 1,
    duration: "2:20",
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687171/run-down-the-city_cui2hi.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597552/Run_Down_The_City_-_Monica_-_Dhurandhar_320_kbps_din1n7.mp3"
  },
  {
    id: 6,
    title: "Shararat",
    artist: "Asha Bhosle",
    albumId: 1,
    duration: "3:44",
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687171/shararat_tbsblq.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597557/Shararat_-_Dhurandhar_320_kbps_y7i3hl.mp3"
  }
];

export const albums = [
  {
    id: 1,
    title: "Dhurandhar (1983)",
    artist: "R. D. Burman",
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687172/Dhurandhar-title-track_wolv0w.jpg",
    description: "The classic Bollywood energetic soundtrack composed by the legend R. D. Burman."
  }
];
