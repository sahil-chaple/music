// Shared Music Data
/**
 * CLOUD STORAGE NOTE (Cloudinary):
 * To use songs from Cloudinary, upload your files to the Media Library.
 * Copy the "URL" of the file.
 * Example Pattern: https://res.cloudinary.com/[your-cloud-name]/video/upload/v12345/song.mp3
 *
 * NOTE: Durations are loaded dynamically from audio metadata at runtime.
 * Do NOT hardcode a duration field — it will be ignored.
 *   // {
  //   id: ,
  //   title: "",
  //   artist: "",
  //   albumId: ,
  //   isTrending: ,
  //   isPopular: ,
  //   isNewRelease: ,
  //   cover: "",
  //   file: ""
  // }
 */
export const songs = [
  // --- Album 1: Dhurandhar (1983) ---
  {
    id: 1,
    title: "Dhurandhar - Title Track",
    artist: "Asha Bhosle, R.D. Burman",
    albumId: 1,
    language: "Hindi",
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687172/Dhurandhar-title-track_wolv0w.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597534/Dhurandhar_-_Title_Track_-_Dhurandhar_320_kbps_wiemwg.mp3"
  },
  {
    id: 2,
    title: "Lutt Le Gaya",
    artist: "Asha Bhosle",
    albumId: 1,
    language: "Punjabi",
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687171/Lutt-Le-Gaya_qwihoh.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597562/Lutt_Le_Gaya_ritd1l.mp3"
  },
  {
    id: 3,
    title: "Naal Nachna",
    artist: "Suresh Wadkar",
    albumId: 1,
    language: "Punjabi",
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687173/Naal-Nachna_mkbvt4.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597553/Naal_Nachna_-_Dhurandhar_320_kbps_llqz2v.mp3"
  },
  {
    id: 4,
    title: "Ramba Ho",
    artist: "Asha Bhosle, Usha Uthup",
    albumId: 1,
    language: "Hindi",
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687172/ramba-ho_chmljv.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597559/Ramba_Ho_-_Dhurandhar_320_kbps_gvmnol.mp3"
  },
  {
    id: 5,
    title: "Run Down The City",
    artist: "Monica",
    albumId: 1,
    language: "English",
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687171/run-down-the-city_cui2hi.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597552/Run_Down_The_City_-_Monica_-_Dhurandhar_320_kbps_din1n7.mp3"
  },
  {
    id: 6,
    title: "Shararat",
    artist: "Asha Bhosle",
    albumId: 1,
    language: "Hindi",
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687171/shararat_tbsblq.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776597557/Shararat_-_Dhurandhar_320_kbps_y7i3hl.mp3"
  },

  // --- Album 2: Majboor ---
  {
    id: 7,
    title: "Majboor",
    artist: "Zoha Waseem, Sheheryar Rehan",
    albumId: 2,
    language: "Urdu",
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776914019/kidyhibhvp2lwsvgx6ps.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776913961/Majboor_bkumhz.mp3"
  },
  {
    id: 8,
    title: "Badtameez Dil ",
    artist: "Pritam, Benny Dayal, Shefali Alvares",
    albumId: 3,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776957571/jl5jbm7p7emmkhvnyfbm.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776956471/Badtameez_Dil_Yeh_Jawaani_Hai_Deewani_128_Kbps_mjz3nd.mp3"
  },
  {
    id: 9,
    title: "Balam Pichkari",
    artist: "Pritam, Benny Dayal, Shefali Alvares",
    albumId: 3,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776957571/jl5jbm7p7emmkhvnyfbm.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776957836/Balam_Pichkari_Yeh_Jawaani_Hai_Deewani_128_Kbps_dy6kfm.mp3"
  },
  {
    id: 10,
    title: "Illahi",
    artist: "Pritam, Benny Dayal, Shefali Alvares",
    albumId: 3,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776957571/jl5jbm7p7emmkhvnyfbm.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776957837/Ilahi_Yeh_Jawaani_Hai_Deewani_128_Kbps_lyef7t.mp3"
  },
  {
    id: 11,
    title: "Kabira",
    artist: "Pritam, Benny Dayal, Shefali Alvares",
    albumId: 3,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776957571/jl5jbm7p7emmkhvnyfbm.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776957834/Kabira_Yeh_Jawaani_Hai_Deewani_128_Kbps_qhgwax.mp3"
  },
  {
    id: 12,
    title: "Dilliwali Girlfriend",
    artist: "Pritam, Benny Dayal, Shefali Alvares",
    albumId: 3,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776957571/jl5jbm7p7emmkhvnyfbm.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776957826/Dilliwaali_Girlfriend_Yeh_Jawaani_Hai_Deewani_128_Kbps_wzhvaq.mp3"
  },
  {
    id: 13,
    title: "Subhanallah",
    artist: "Pritam, Benny Dayal, Shefali Alvares",
    albumId: 3,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776957571/jl5jbm7p7emmkhvnyfbm.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776957822/Subhanallah_Yeh_Jawaani_Hai_Deewani_128_Kbps_xy0fqi.mp3"
  },
  {
    id: 14,
    title: "Ghagra",
    artist: "Pritam, Benny Dayal, Shefali Alvares",
    albumId: 3,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776957571/jl5jbm7p7emmkhvnyfbm.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1776957834/Ghagra_Yeh_Jawaani_Hai_Deewani_128_Kbps_zt6xmn.mp3"
  },
  {
    id: 15,
    title: "Aari Aari",
    artist: "S. Janaki, R. D. Burman",
    albumId: 1,
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777009373/thumb_69b26b133f98c_lghxer.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777009360/AARI_AARI_-_SouthMelody_xzmwrf.mp3"
  },
  {
    id: 16,
    title: "Bairan",
    artist: "Banjaare",
    albumId: 4,
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777010460/Bairan-Unknown-2026-20260223182954-500x500_nuhj1r.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777010468/Bairan_-_Bairan_128_kbps_wcadye.mp3"
  },
  {
    id: 17,
    title: "Sheesha",
    artist: "Mitta Ror, Swara Verma",
    albumId: 0,
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777134370/k6xoteygfwzwt50u9uot.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777134382/Sheesha_Aakhya_Mai_Aakh_Ghali_Jo_Bairan_-_Sheesha_Aakhya_Mai_Aakh_Ghali_Jo_Bairan_128_kbps_o0sxgq.mp3"
  },
  {
    id: 18,
    title: "Ishq Di Baajiyaan",
    artist: "Diljit Dosanjh, Shankar-Ehsaan-Loy",
    albumId: 0,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777136087/soorma-original-motion-picture-soundtrack-deluxe-edition-shankar-ehsaan-loy_tve9jb.webp",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777136075/Ishq_Di_Baajiyaan_PenduJatt.Com.Se_riujrj.mp3"
  },
  {
    id: 19,
    title: "Sitaare",
    artist: "Amitabh Bhattacharya, Arijit Singh, White Noise Collectives",
    albumId: 0,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777135953/Ikkis-Hindi-2025-20251226143212-500x500_esd0a8.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777135962/Sitaare_From_quot_Ikkis_quot_-_Ikkis_128_kbps_ixkwhk.mp3"
  },
  {
    id: 20,
    title: "Bulleya",
    artist: "Amit Mishra, Amit Mishra & Shilpa Rao, Papon, Pritam, Shilpa Rao",
    albumId: 0,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777135841/Sultan-Hindi-2016-20190329150247-500x500_ef0jk9.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777135839/Bulleya_-_Sultan_128_kbps_vnswua.mp3"
  },
  {
    id: 21,
    title: "Gehra Hua",
    artist: "Arijit Singh, Armaan Khan",
    albumId: 0,
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777135694/gehra-hua-dhurandhar-500-500_hkel5f.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777135708/Gehra_Hua_-_Dhurandhar_128_kbps_fj8rlx.mp3"
  },
  {
    id: 22,
    title: "Khat",
    artist: "Navjot Ahuja",
    albumId: 0,
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777135249/Khat-Hindi-2025-20251130113423-500x500_uzbrf9.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777135261/Khat_-_Khat_128_kbps_ynsgpr.mp3"
  },
  {
    id: 23,
    title: "Isq Risk",
    artist: "Rahat Fateh Ali Khan",
    albumId: 0,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777186754/xrudilujbyzurcwgg0hx.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777186715/Isq_Risk_Mere_Brother_Ki_Dulhan_128_Kbps_jrgzl8.mp3"
  },
  {
    id: 24,
    title: "Chand Sifarish",
    artist: "Jatin-Lalit",
    albumId: 0,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777186646/fanaa-jatin-lalit_b48lvk.webp",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777186637/Chand_Sifarish_PenduJatt.Com.Se_tdqui8.mp3"
  },
  {
    id: 25,
    title: "Hero Handa",
    artist: "Raj Mawar,Ashu Twinkle",
    albumId: 0,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777392690/Hero-Handa-1_gfwfwe.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777392699/Hero_Handa_w5poke.mp3"
  },
  {
    id: 26,
    title: "Pind de gerhe",
    artist: "Rupinder Handa",
    albumId: 0,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777392598/Pind-De-Gerhe-Ft-Desi-Crew-1_sxcvcg.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777392607/Pind_De_Gerhe_Ft_Desi_Crew_1_zi41cj.mp3"
  },
  {
    id: 27,
    title: "Tera Deedar Hua",
    artist: "Pritam, Anupam Amod, Rahat Fateh Ali Khan",
    albumId: 0,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777392735/yfnmk15uiivzfbyrawi6.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777392563/Tera_Deedar_Hua_Jannat_2_Original_Motion_Picturetrack_128_Kbps_pbrbb2.mp3"
  },
  {
    id: 28,
    title: "Hum Pyaar Karne Wale",
    artist: "Anuradha Paudwal, Udit Narayan, Qveen Herby - SouthMelody",
    albumId: 1,
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777391525/dhurandhar-the-revenge-shashwat-sachdev_qplcad.webp",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777392475/Hum_Pyaar_Karne_Wale_-_SouthMelody_v77wti.mp3"
  },
  {
    id: 29,
    title: "Darkhaast",
    artist: "Mithoon, Arijit Singh, Sunidhi Chauhan",
    albumId: 0,
    isTrending: false,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777392352/wyd8yrokebtou1gmrsfe.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777392248/Darkhaast_Shivaay_128_Kbps_yo5ixs.mp3"
  },
  {
    id: 30,
    title: "Tamma Tamma",
    artist: "Bappi Lahiri,Anuradha Paudwal",
    albumId: 1,
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687172/Dhurandhar-title-track_wolv0w.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777392007/Tamma_Tamma_-_SouthMelody_blb2tc.mp3"
  },
  {
    id: 31,
    title: "Jale 2",
    artist: "Sapna Choudhary, Shiva Choudhary",
    albumId: 0,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777391947/jale-2-personalized-series-7-shiva-choudhary_kudxgt.webp",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777391955/Jale_2_For_Manish_PenduJatt.Com.Se_bfjdep.mp3"
  },
  {
    id: 32,
    title: "Jale",
    artist: "Shiva Choudhary, Sapna Choudhary",
    albumId: 0,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777392331/s0thkmhwkreieyywrpo9.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777391869/Jale_Sapna_Choudhary_128_Kbps_rgmc2w.mp3"
  },
  {
    id: 33,
    title: "Vaari Jaavan ",
    artist: "Jyoti Nooran, Reble",
    albumId: 1,
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687172/Dhurandhar-title-track_wolv0w.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777391821/Vaari_Jaavan_-_SouthMelody_t7okfm.mp3"
  },
  {
    id: 34,
    title: "Jind Mahi",
    artist: "Malkit Singh",
    albumId: 0,
    isTrending: false,
    isPopular: true,
    isNewRelease: false,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777391749/uno5qhg89nbvhpzs0rdc.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777391746/Jind_Mahi_-_Malkit_Singh_r4b730.mp3"
  },
  {
    id: 35,
    title: "Jaan Se Guzarte Hain",
    artist: "Shashwat Sachdev, Khan Saab",
    albumId: 1,
    isTrending: true,
    isPopular: true,
    isNewRelease: true,
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687172/Dhurandhar-title-track_wolv0w.jpg",
    file: "https://res.cloudinary.com/dbfdls6ub/video/upload/v1777391523/Jaan_Se_Guzarte_Hain_PenduJatt.Com.Se_wuwoum.mp3"
  }
];











export const albums = [
  {
    id: 1,
    title: "Dhurandhar (1983)",
    artist: "R. D. Burman",
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776687172/Dhurandhar-title-track_wolv0w.jpg",
    description: "The classic Bollywood energetic soundtrack composed by the legend R. D. Burman."
  },
  {
    id: 2,
    title: "Majboor",
    artist: "Zoha Waseem, Sheheryar Rehan",
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776914019/kidyhibhvp2lwsvgx6ps.jpg",
    description: "A soulful modern track by Zoha Waseem and Sheheryar Rehan."
  },
  {
    id: 3,
    title: "Yeh Jawaani Hai Deewani",
    artist: "Pritam, Benny Dayal, Shefali Alvares",
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1776957571/jl5jbm7p7emmkhvnyfbm.jpg",
    description: "The classic Bollywood energetic soundtrack composed by the legends Pritam, Benny Dayal, Shefali Alvares."
  },
  {
    id: 4,
    title: "Bairan",
    artist: "Banjaare",
    cover: "https://res.cloudinary.com/dbfdls6ub/image/upload/v1777010460/Bairan-Unknown-2026-20260223182954-500x500_nuhj1r.jpg",
  }
];