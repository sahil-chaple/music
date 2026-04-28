import { auth, onAuthStateChanged, signOut } from './firebase-config.js';
import { songs, albums } from './songs-data.js';

(function () {
  "use strict";

  // --- DOM ELEMENTS ---
  // Player
  const audio = document.getElementById('audioPlayer');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const repeatBtn = document.getElementById('repeatBtn');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const currentTimeSpan = document.getElementById('currentTime');
  const durationTimeSpan = document.getElementById('durationTime');
  const playerCover = document.getElementById('playerCover');
  const playerTitle = document.getElementById('playerTitle');
  const playerArtist = document.getElementById('playerArtist');
  const volumeSlider = document.getElementById('volumeSlider');
  const playerLikeBtn = document.getElementById('playerLikeBtn');

  // Layout
  const userAvatar = document.getElementById('userAvatar');
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const searchInput = document.getElementById('searchInput');

  // Views
  const homeNavItem = document.getElementById('homeNavItem');
  const libraryNavItem = document.getElementById('libraryNavItem');
  const aboutNavItem = document.getElementById('aboutNavItem');
  const logoBtn = document.getElementById('logoBtn');

  // View Specifics
  const homeView = document.getElementById('homeView');
  const libraryView = document.getElementById('libraryView');
  const profileView = document.getElementById('profileView');
  const aboutView = document.getElementById('aboutView');

  // View Specifics
  const songsContainer = document.getElementById('songsContainer');
  const albumGrid = document.getElementById('albumGrid');
  const tracklistView = document.getElementById('tracklistView');
  const trackList = document.getElementById('trackList');
  const backBtn = document.getElementById('backBtn');
  const libraryDashboard = document.getElementById('libraryDashboard');
  const detailCover = document.getElementById('detailCover');
  const detailTitle = document.getElementById('detailTitle');
  const detailArtist = document.getElementById('detailArtist');
  const addToPlaylistBtn = document.getElementById('addToPlaylistBtn');
  const createPlaylistBtn = document.getElementById('createPlaylistBtn');
  const customPlaylistsContainer = document.getElementById('customPlaylistsContainer');
  const sidebarLikedSongs = document.getElementById('sidebarLikedSongs');
  const sidebarQueue = document.getElementById('sidebarQueue');
  const sidebarTrending = document.getElementById('sidebarTrending');

  // Profile Specifics
  const profileAvatarLarge = document.getElementById('profileAvatarLarge');
  const avatarEditOverlay = document.getElementById('avatarEditOverlay');
  const profileNameLarge = document.getElementById('profileNameLarge');
  const profileEmail = document.getElementById('profileEmail');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const profileLikedGrid = document.getElementById('profileLikedGrid');
  const profileRecentRow = document.getElementById('profileRecentRow');
  const playAllLikedBtn = document.getElementById('playAllLikedBtn');
  const likedEmptyState = document.getElementById('likedEmptyState');

  // Stats
  const statSongsPlayed = document.getElementById('statSongsPlayed');
  const statLikedSongs = document.getElementById('statLikedSongs');
  const statPlaylists = document.getElementById('statPlaylists');
  const statTopArtist = document.getElementById('statTopArtist');

  // --- STATE ---
  let currentSongIndex = 0;
  let isPlaying = false;
  let filteredSongs = [...songs];
  let recentlyPlayed = []; 
  let likedSongs = []; 
  let currentActiveView = 'home'; 
  let isShuffled = true; 
  let shuffleQueue = []; 
  let shuffleQueuePos = 0; 
  let userPlaylists = []; 
  let repeatMode = 0; // 0 = all, 1 = one
  let playQueue = []; 
  let userStats = {
    totalPlayed: 0,
    topArtist: 'None'
  };
  let currentUser = null;

  const SILENT_AUDIO = "data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoAAACAgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/fw==";

  // --- AUTHENTICATION ---
  async function checkAuth() {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = 'login.html';
      } else {
        currentUser = user;
        await syncUserData();
        updateUIWithUserData();
      }
    });
  }

  async function syncUserData() {
    if (!currentUser) return;
    
    // Show skeletons
    document.querySelectorAll('.skeleton-dashboard').forEach(s => s.style.display = 'flex');

    try {
      const { doc, getDoc, setDoc, db, serverTimestamp } = await import('./firebase-config.js');
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        userPlaylists = data.playlists || [];
        likedSongs = data.likedSongs || [];
        recentlyPlayed = data.recentlyPlayed || [];
        userStats = data.stats || { totalPlayed: 0, topArtist: 'None' };
        
        // Update local session storage as well
        sessionStorage.setItem('streamwave_user', JSON.stringify({
          displayName: data.displayName || currentUser.displayName || currentUser.email.split('@')[0],
          email: currentUser.email,
          photoURL: data.photoURL || currentUser.photoURL
        }));
      } else {
        // First time user - create record
        const initialData = {
          displayName: currentUser.displayName || currentUser.email.split('@')[0],
          email: currentUser.email,
          photoURL: currentUser.photoURL || '',
          playlists: [],
          likedSongs: [],
          recentlyPlayed: [],
          stats: { totalPlayed: 0, topArtist: 'None' },
          createdAt: serverTimestamp()
        };
        await setDoc(userRef, initialData);
        userPlaylists = [];
        likedSongs = [];
        recentlyPlayed = [];
        userStats = initialData.stats;
      }
    } catch (err) {
      console.error("Firestore sync error:", err);
      // Fallback to local storage if needed, but Firestore is primary now
    } finally {
      // Hide skeletons
      document.querySelectorAll('.skeleton-dashboard').forEach(s => s.style.display = 'none');
    }
  }

  function updateUIWithUserData() {
    if (!currentUser) return;
    const userData = JSON.parse(sessionStorage.getItem('streamwave_user'));
    
    if (userAvatar) {
      if (userData.photoURL) {
        userAvatar.innerHTML = `<img src="${userData.photoURL}" alt="avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
      } else {
        userAvatar.textContent = userData.displayName?.charAt(0).toUpperCase() || 'U';
      }
      userAvatar.title = userData.displayName;
    }

    renderSidebarPlaylists();
    renderHomeDashboard();
    if (currentActiveView === 'profile') renderProfile();

    // Refresh the player's like button state now that likedSongs is loaded
    const currentSong = songs[currentSongIndex];
    if (currentSong && playerLikeBtn) {
      if (likedSongs.includes(currentSong.id)) {
        playerLikeBtn.innerHTML = '<i class="fas fa-heart"></i>';
        playerLikeBtn.classList.add('liked');
      } else {
        playerLikeBtn.innerHTML = '<i class="far fa-heart"></i>';
        playerLikeBtn.classList.remove('liked');
      }
    }
  }

  async function saveUserData(update) {
    if (!currentUser) return;
    try {
      const { doc, updateDoc, db } = await import('./firebase-config.js');
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, update);
    } catch (err) {
      console.error("Error saving user data:", err);
    }
  }

  // --- NAVIGATION (SPA) ---
  function switchView(viewName) {
    currentActiveView = viewName;
    resetTheme(); // 🎨 Always reset theme when navigating between views

    if (viewName === 'home') {
      homeView.style.display = 'block';
      libraryView.style.display = 'none';
      profileView.style.display = 'none';
      aboutView.style.display = 'none';
      homeNavItem.classList.add('active');
      libraryNavItem.classList.remove('active');
      aboutNavItem.classList.remove('active');
    } else if (viewName === 'library') {
      homeView.style.display = 'none';
      libraryView.style.display = 'block';
      profileView.style.display = 'none';
      aboutView.style.display = 'none';
      homeNavItem.classList.remove('active');
      libraryNavItem.classList.add('active');
      aboutNavItem.classList.remove('active');
      renderLibrary(); // Render full library shelves
      renderAlbums(); // Refresh albums
    } else if (viewName === 'profile') {
      homeView.style.display = 'none';
      libraryView.style.display = 'none';
      profileView.style.display = 'block';
      aboutView.style.display = 'none';
      homeNavItem.classList.remove('active');
      libraryNavItem.classList.remove('active');
      aboutNavItem.classList.remove('active');
      renderProfile();
    } else if (viewName === 'about') {
      homeView.style.display = 'none';
      libraryView.style.display = 'none';
      profileView.style.display = 'none';
      aboutView.style.display = 'block';
      homeNavItem.classList.remove('active');
      libraryNavItem.classList.remove('active');
      aboutNavItem.classList.add('active');
    }

    // Reset library inner view if switching to library (e.g. from Sidebar)
    if (viewName === 'library') {
      backBtn.innerHTML = ''; // Clear stale back button content
      resetLibraryView();
    }

    // Scroll to top of main content
    const mainEl = document.querySelector('.main');
    if (mainEl) mainEl.scrollTop = 0;

    // Close sidebar on mobile after nav
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    }
  }

  // --- SEARCH LOGIC ---
  function handleSearch(query) {
    const q = query.toLowerCase().trim();
    const homeDashboard = document.getElementById('homeDashboard');
    const searchResults = document.getElementById('searchResults');

    if (q.length > 0) {
      if (currentActiveView !== 'home') switchView('home');
      homeDashboard.style.display = 'none';
      searchResults.style.display = 'block';

      const queryWords = q.split(/\s+/).filter(w => w.length > 0);

      filteredSongs = songs.map(song => {
        const title = song.title.toLowerCase();
        const artist = song.artist.toLowerCase();
        let score = 0;

        // 1. Exact matches (Highest priority)
        if (title === q) score += 100;
        else if (title.startsWith(q)) score += 80;
        else if (title.includes(q)) score += 60;

        // 2. Artist matches
        if (artist === q) score += 50;
        else if (artist.includes(q)) score += 40;

        // 3. Word-based matching (Supports "aari aari song" matching "aari aari")
        queryWords.forEach(word => {
          if (title.includes(word)) score += 15;
          if (artist.includes(word)) score += 5;
        });

        // 4. Reverse check: Title or Artist contained in query
        // This is specifically for when voice search adds extra words like "song"
        if (q.includes(title) && title.length > 2) score += 40;

        return { song, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.song);

      renderCards(filteredSongs);
    } else {
      homeDashboard.style.display = 'flex';
      searchResults.style.display = 'none';
    }
  }

  // --- RENDERING ---
  function renderCards(songsToRender) {
    const songsContainer = document.getElementById('songsContainer');
    if (!songsContainer) return;

    if (songsToRender.length === 0) {
      songsContainer.innerHTML = '<div style="padding: 20px; color: var(--text-secondary);">No songs found matching your search.</div>';
      return;
    }

    songsContainer.innerHTML = songsToRender.map(song => {
      const isLiked = likedSongs.includes(song.id);
      return `
        <div class="song-card ${songs[currentSongIndex] && songs[currentSongIndex].id === song.id ? 'playing' : ''}" data-song-id="${song.id}">
          <button class="song-options-btn" data-song-id="${song.id}" style="position:absolute; top:8px; right:8px; z-index:10;"><i class="fas fa-ellipsis-v"></i></button>
          ${isLiked ? '<i class="fas fa-heart liked-heart-icon" style="position:absolute; bottom:45px; right:10px; color: var(--accent); font-size: 16px; z-index:10; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></i>' : ''}
          <img class="card-cover" src="${song.cover}" alt="${song.title}">
          <div class="card-title">${song.title}</div>
          <div class="card-artist">${song.artist}</div>
        </div>
      `;
    }).join('');

    attachSongClickListeners(songsContainer);
  }

  function attachSongClickListeners(container) {
    container.querySelectorAll('.song-card').forEach(card => {
      // Click logic
      card.addEventListener('click', (e) => {
        if (e.target.closest('.song-options-btn')) return;
        const songId = parseInt(card.dataset.songId);
        if (isNaN(songId)) return; // prevent album card error
        const index = songs.findIndex(s => s.id === songId);
        loadSong(index);
        if (!isPlaying) playPause();
      });

      // 3D Hover Tracking logic
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -15;
        const rotateY = ((x - centerX) / centerX) * 15;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });

      // Scroll animation classes
      card.classList.add('scroll-reveal');
      if (globalObserver) {
        globalObserver.observe(card);
      }
    });
  }

  function renderHomeDashboard() {
    console.log('🏠 Rendering Home Dashboard...');
    const dashboard = document.getElementById('homeDashboard');
    if (!dashboard) return;
    
    let html = '';

    // 1. Trending Songs
    const trending = songs.filter(s => s.isTrending).reverse();
    if (trending.length > 0) html += buildShelfHTML('Trending Now', trending, 'trending');

    // 2. New Releases
    const newReleases = songs.filter(s => s.isNewRelease).reverse();
    if (newReleases.length > 0) html += buildShelfHTML('New Releases', newReleases, 'new_releases');

    // 3. Popular Hits
    const popular = songs.filter(s => s.isPopular).reverse();
    if (popular.length > 0) html += buildShelfHTML('Popular Hits', popular, 'popular');

    // 4. Recently Played
    if (recentlyPlayed.length > 0) {
      const recent = recentlyPlayed.map(id => songs.find(s => s.id === id)).filter(Boolean);
      if (recent.length > 0) html = buildShelfHTML('Recently Played', recent, 'recent') + html;
    }

    dashboard.innerHTML = html;
    attachSongClickListeners(dashboard);
    
    // Add listeners for shelf headers
    dashboard.querySelectorAll('.shelf-header').forEach(header => {
      header.addEventListener('click', () => {
        const category = header.dataset.category;
        const title = header.textContent.replace('Show all', '').trim();
        let categorySongs = [];
        if (category === 'trending') categorySongs = songs.filter(s => s.isTrending).reverse();
        else if (category === 'new_releases') categorySongs = songs.filter(s => s.isNewRelease).reverse();
        else if (category === 'popular') categorySongs = songs.filter(s => s.isPopular).reverse();
        else if (category === 'recent') categorySongs = recentlyPlayed.map(id => songs.find(s => s.id === id)).filter(Boolean);
        
        showCategoryTracks(title, categorySongs);
      });
    });

    if (globalObserver) {
      dashboard.querySelectorAll('.home-shelf.scroll-reveal').forEach(shelf => {
        globalObserver.observe(shelf);
      });
    }
  }

  function buildShelfHTML(title, shelfSongs, categoryKey) {
    const cardsHtml = shelfSongs.map(song => {
      const isLiked = likedSongs.includes(song.id);
      return `
        <div class="song-card ${songs[currentSongIndex] && songs[currentSongIndex].id === song.id ? 'playing' : ''}" data-song-id="${song.id}">
          <button class="song-options-btn" data-song-id="${song.id}" style="position:absolute; top:8px; right:8px; z-index:10;"><i class="fas fa-ellipsis-v"></i></button>
          ${isLiked ? '<i class="fas fa-heart liked-heart-icon" style="position:absolute; bottom:45px; right:10px; color: var(--accent); font-size: 16px; z-index:10; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></i>' : ''}
          <img class="card-cover" src="${song.cover}" alt="${song.title}">
          <div class="card-title">${song.title}</div>
          <div class="card-artist">${song.artist}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="home-shelf scroll-reveal">
        <h3 class="shelf-header" data-category="${categoryKey}">${title}</h3>
        <div class="shelf-row">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  function renderLibrary() {
    const likedShelfWrapper = document.getElementById('likedShelfWrapper');
    const recentShelfWrapper = document.getElementById('recentShelfWrapper');
    const likedGrid = document.getElementById('likedGrid');
    const recentGrid = document.getElementById('recentGrid');

    if (!likedShelfWrapper) return;

    // Liked Songs
    const liked = likedSongs.map(id => songs.find(s => s.id === id)).filter(Boolean);
    if (liked.length > 0) {
      likedGrid.innerHTML = liked.map(song => buildCardHTML(song)).join('');
      likedShelfWrapper.style.display = 'flex';
      attachSongClickListeners(likedGrid);
      // Add listener to header to open full list
      likedShelfWrapper.querySelector('.shelf-header').onclick = () => showCategoryTracks('Liked Songs', liked);
    } else {
      likedShelfWrapper.style.display = 'none';
    }

    // Albums Header Click Listener
    if (albumGrid) {
      const albumHeader = albumGrid.previousElementSibling;
      if (albumHeader && albumHeader.classList.contains('shelf-header')) {
        albumHeader.onclick = () => showAllAlbumsView();
      }
    }
  }

  function showAllAlbumsView() {
    libraryDashboard.style.display = 'none';
    tracklistView.style.display = 'block';
    backBtn.style.display = 'flex';
    backBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Back to Library';
    
    // Header Info
    detailCover.src = albums[0]?.cover || 'https://placehold.co/400x400/1db954/white?text=Albums';
    detailTitle.textContent = 'Your Albums';
    detailArtist.textContent = `${albums.length} Albums Collection`;
    resetTheme(); // Clear any dynamic themes

    // Render Albums in a full grid
    trackList.innerHTML = `
      <div class="cards-grid" style="padding: 20px 0; width: 100%;">
        ${albums.map(album => `
          <div class="song-card scroll-reveal" data-album-id="${album.id}">
            <div class="card-3d-wrapper">
              <img class="card-cover" src="${album.cover}" alt="${album.title}">
              <div class="card-title">${album.title}</div>
              <div class="card-artist">${album.artist}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    // Attach click and hover listeners to cards
    trackList.querySelectorAll('.song-card').forEach(card => {
      card.onclick = () => {
        const albumId = parseInt(card.dataset.albumId);
        showAlbumTracks(albumId);
      };

      // Add 3D effect
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -15; 
        const rotateY = ((x - centerX) / centerX) * 15;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });

      if (globalObserver) globalObserver.observe(card);
    });
  }

  function buildCardHTML(song) {
    const isLiked = likedSongs.includes(song.id);
    return `
      <div class="song-card ${songs[currentSongIndex] && songs[currentSongIndex].id === song.id ? 'playing' : ''}" data-song-id="${song.id}">
        <button class="song-options-btn" data-song-id="${song.id}" style="position:absolute; top:8px; right:8px; z-index:10;"><i class="fas fa-ellipsis-v"></i></button>
        ${isLiked ? '<i class="fas fa-heart liked-heart-icon" style="position:absolute; bottom:45px; right:10px; color: var(--accent); font-size: 16px; z-index:10; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></i>' : ''}
        <div class="card-3d-wrapper">
          <img class="card-cover" src="${song.cover}" alt="${song.title}">
          <div class="card-title">${song.title}</div>
          <div class="card-artist">${song.artist}</div>
        </div>
      </div>
    `;
  }

  function renderAlbums() {
    if (!albumGrid) return;
    albumGrid.innerHTML = albums.map(album => `
      <div class="song-card scroll-reveal" data-album-id="${album.id}">
        <div class="card-3d-wrapper">
          <img class="card-cover" src="${album.cover}" alt="${album.title}">
          <div class="card-title">${album.title}</div>
          <div class="card-artist">${album.artist}</div>
        </div>
      </div>
    `).join('');

    albumGrid.querySelectorAll('[data-album-id]').forEach(card => {
      // Click logic
      card.addEventListener('click', () => {
        const albumId = parseInt(card.dataset.albumId);
        showAlbumTracks(albumId);
      });
      
      // 3D effect
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -15; 
        const rotateY = ((x - centerX) / centerX) * 15;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });

      if (globalObserver) {
        globalObserver.observe(card);
      }
    });
  }

  // --- DYNAMIC ALBUM THEMING ---

  /**
   * Converts r,g,b (0-255) to h (0-360), s (0-100), l (0-100).
   */
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  /**
   * Extracts the most VIBRANT (saturated) color from an image URL using canvas.
   * Returns a Promise resolving to an [r, g, b] array.
   */
  function extractColorFromImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 80; // Sample at 80x80 for accuracy
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, size, size);
          const data = ctx.getImageData(0, 0, size, size).data;

          let bestR = 80, bestG = 80, bestB = 80;
          let bestScore = -1;
          // Bucket pixels by hue (36 buckets of 10 degrees each)
          const buckets = Array.from({ length: 36 }, () => ({ r: 0, g: 0, b: 0, count: 0, satSum: 0 }));

          for (let i = 0; i < data.length; i += 4) {
            const pr = data[i], pg = data[i + 1], pb = data[i + 2];
            const [h, s, l] = rgbToHsl(pr, pg, pb);
            // Only consider pixels that are vivid and not too dark/bright
            if (s > 25 && l > 15 && l < 85) {
              const bucket = Math.floor(h / 10);
              buckets[bucket].r += pr;
              buckets[bucket].g += pg;
              buckets[bucket].b += pb;
              buckets[bucket].satSum += s;
              buckets[bucket].count++;
            }
          }

          // Find the bucket with highest total saturation score
          for (const bucket of buckets) {
            if (bucket.count > 0) {
              const score = bucket.satSum; // More saturated pixels = higher score
              if (score > bestScore) {
                bestScore = score;
                bestR = Math.round(bucket.r / bucket.count);
                bestG = Math.round(bucket.g / bucket.count);
                bestB = Math.round(bucket.b / bucket.count);
              }
            }
          }

          resolve([bestR, bestG, bestB]);
        } catch (e) {
          // CORS or other error – neutral fallback
          resolve([80, 80, 80]);
        }
      };
      img.onerror = () => resolve([80, 80, 80]);
      img.src = url;
    });
  }

  function renderProfile() {
    if (!currentUser) return;
    const userData = JSON.parse(sessionStorage.getItem('streamwave_user'));

    // Header
    if (userData.photoURL) {
      profileAvatarLarge.innerHTML = `<img src="${userData.photoURL}" alt="avatar">`;
    } else {
      profileAvatarLarge.textContent = userData.displayName?.charAt(0).toUpperCase() || 'U';
      profileAvatarLarge.style.background = 'var(--accent)';
    }
    profileNameLarge.textContent = userData.displayName;
    profileEmail.textContent = userData.email;

    // Stats
    statSongsPlayed.textContent = userStats.totalPlayed || 0;
    statLikedSongs.textContent = likedSongs.length;
    statPlaylists.textContent = userPlaylists.length;
    statTopArtist.textContent = userStats.topArtist || 'None';

    // Liked Songs Grid
    const liked = likedSongs.map(id => songs.find(s => s.id === id)).filter(Boolean);
    if (liked.length > 0) {
      profileLikedGrid.innerHTML = liked.map(song => buildCardHTML(song)).join('');
      likedEmptyState.style.display = 'none';
      attachSongClickListeners(profileLikedGrid);
    } else {
      profileLikedGrid.innerHTML = '';
      likedEmptyState.style.display = 'block';
    }

    // Recently Played Row
    const recent = recentlyPlayed.map(id => songs.find(s => s.id === id)).filter(Boolean);
    if (recent.length > 0) {
      profileRecentRow.innerHTML = recent.map(song => buildCardHTML(song)).join('');
      attachSongClickListeners(profileRecentRow);
    } else {
      profileRecentRow.innerHTML = '<div style="padding: 20px; color: var(--text-secondary);">No recently played songs.</div>';
    }

    // Listeners
    avatarEditOverlay.onclick = openEditProfileModal;
    editProfileBtn.onclick = openEditProfileModal;
    playAllLikedBtn.onclick = () => {
      if (liked.length > 0) {
        const firstIndex = songs.findIndex(s => s.id === liked[0].id);
        loadSong(firstIndex);
        playPause();
      }
    };
  }

  function openEditProfileModal() {
    const userData = JSON.parse(sessionStorage.getItem('streamwave_user'));
    const currentPhoto = userData.photoURL || '';
    const currentName  = userData.displayName || '';

    infoModalTitle.textContent = 'Edit Profile';
    infoModalContent.innerHTML = `
      <form id="editProfileForm" class="modal-body">

        <!-- ── Avatar Picker ── -->
        <div class="avatar-picker-section">
          <div class="avatar-picker-preview-ring" id="avatarPreviewRing">
            <div class="avatar-picker-preview" id="avatarPickerPreview">
              ${currentPhoto
                ? `<img src="${currentPhoto}" alt="Current photo" id="avatarPreviewImg">`
                : `<span id="avatarPreviewInitial">${currentName.charAt(0).toUpperCase() || 'U'}</span>`}
            </div>
          </div>
          <div class="avatar-picker-actions">
            <button type="button" class="avatar-action-btn" id="uploadPhotoBtn">
              <i class="fas fa-upload"></i> Upload Photo
            </button>
            <button type="button" class="avatar-action-btn avatar-action-url-btn" id="useUrlBtn">
              <i class="fas fa-link"></i> Use URL
            </button>
            ${currentPhoto ? `<button type="button" class="avatar-action-btn avatar-action-remove-btn" id="removePhotoBtn">
              <i class="fas fa-trash-alt"></i> Remove
            </button>` : ''}
          </div>
          <!-- URL input (hidden by default) -->
          <div class="modal-form-group" id="urlInputGroup" style="display:none; width:100%; margin-top:12px;">
            <label>Photo URL</label>
            <input type="url" id="editAvatarUrl" class="modal-input"
              value="${currentPhoto.startsWith('data:') ? '' : currentPhoto}"
              placeholder="https://example.com/photo.jpg">
          </div>
          <p class="avatar-picker-hint" id="avatarPickerHint"></p>
        </div>

        <!-- ── Display Name ── -->
        <div class="modal-form-group">
          <label>Display Name</label>
          <input type="text" id="editDisplayName" class="modal-input" value="${currentName}" required>
        </div>

        <div class="modal-footer">
          <button type="button" class="modal-btn modal-btn-secondary" id="cancelEditBtn">Cancel</button>
          <button type="submit" class="modal-btn modal-btn-primary" id="saveProfileBtn">Save Changes</button>
        </div>
      </form>
    `;

    infoModalOverlay.classList.add('active');

    // ── State for new photo ──
    let pendingPhotoDataUrl = currentPhoto; // holds the final value to save

    const profilePicInput = document.getElementById('profilePicInput');
    const avatarPreview   = document.getElementById('avatarPickerPreview');
    const hintEl          = document.getElementById('avatarPickerHint');
    const urlGroup        = document.getElementById('urlInputGroup');

    // Helper: update preview from any URL/data-url
    function setPreview(src, hint = '') {
      pendingPhotoDataUrl = src;
      hintEl.textContent = hint;
      if (src) {
        avatarPreview.innerHTML = `<img src="${src}" alt="Preview" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      } else {
        const nameVal = document.getElementById('editDisplayName').value;
        avatarPreview.innerHTML = `<span style="font-size:40px;font-weight:900;color:#000;">${nameVal.charAt(0).toUpperCase() || 'U'}</span>`;
      }
    }

    // Upload Photo button → trigger hidden file input
    document.getElementById('uploadPhotoBtn').onclick = () => {
      profilePicInput.value = '';          // reset so same file can be re-selected
      profilePicInput.click();
    };

    // File selected → FileReader → base64 data URL
    profilePicInput.onchange = () => {
      const file = profilePicInput.files[0];
      if (!file) return;

      // Size guard (5 MB limit)
      if (file.size > 5 * 1024 * 1024) {
        hintEl.textContent = '⚠️ Image must be under 5 MB.';
        hintEl.style.color = '#ff6b6b';
        return;
      }

      hintEl.style.color = 'var(--text-secondary)';
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result, '✓ Photo ready to save');
      reader.readAsDataURL(file);
    };

    // URL toggle
    document.getElementById('useUrlBtn').onclick = () => {
      const isVisible = urlGroup.style.display !== 'none';
      urlGroup.style.display = isVisible ? 'none' : 'block';
    };

    // Live URL preview on input
    const urlInput = document.getElementById('editAvatarUrl');
    if (urlInput) {
      urlInput.oninput = () => {
        const val = urlInput.value.trim();
        if (val) setPreview(val, 'Preview from URL');
        else setPreview(currentPhoto, '');
      };
    }

    // Remove photo
    const removeBtn = document.getElementById('removePhotoBtn');
    if (removeBtn) {
      removeBtn.onclick = () => {
        setPreview('', 'Photo removed');
        if (urlInput) urlInput.value = '';
      };
    }

    // ── Form submit ──
    const form = document.getElementById('editProfileForm');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const newName  = document.getElementById('editDisplayName').value.trim();
      // If URL field is visible and has a value, prefer it over the uploaded photo
      const urlVal   = (urlInput && urlGroup.style.display !== 'none') ? urlInput.value.trim() : '';
      const newPhoto = urlVal || pendingPhotoDataUrl;

      const saveBtn = document.getElementById('saveProfileBtn');
      saveBtn.textContent = 'Saving…';
      saveBtn.disabled = true;

      try {
        const { updateProfile } = await import('./firebase-config.js');
        
        // Firebase Auth has a strict length limit on photoURL (fails with data URLs).
        // Only update Auth profile if it's a normal URL or empty.
        // Firestore saveUserData handles the long data URLs perfectly.
        const authUpdates = { displayName: newName };
        if (!newPhoto || !newPhoto.startsWith('data:')) {
          authUpdates.photoURL = newPhoto;
        }
        await updateProfile(currentUser, authUpdates);
        
        await saveUserData({ displayName: newName, photoURL: newPhoto });

        sessionStorage.setItem('streamwave_user', JSON.stringify({
          ...userData,
          displayName: newName,
          photoURL: newPhoto
        }));

        infoModalOverlay.classList.remove('active');
        updateUIWithUserData();
        if (currentActiveView === 'profile') renderProfile();
      } catch (err) {
        saveBtn.textContent = 'Save Changes';
        saveBtn.disabled = false;
        hintEl.textContent = '⚠️ Error: ' + err.message;
        hintEl.style.color = '#ff6b6b';
      }
    };

    document.getElementById('cancelEditBtn').onclick = () => {
      profilePicInput.onchange = null; // detach listener
      infoModalOverlay.classList.remove('active');
    };
  }

  function applyDynamicTheme([r, g, b]) {
    const mainEl = document.querySelector('.main');
    if (!mainEl) return;
    // Build a Spotify-style gradient: vivid color at top → dark mid → base bg at bottom
    const dr = Math.round(r * 0.15);
    const dg = Math.round(g * 0.15);
    const db = Math.round(b * 0.15);
    mainEl.style.background = [
      `linear-gradient(180deg,`,
      `  rgba(${r},${g},${b}, 0.85) 0%,`,
      `  rgba(${r},${g},${b}, 0.55) 15%,`,
      `  rgba(${dr},${dg},${db}, 0.4) 40%,`,
      `  var(--bg-elevated) 75%)`
    ].join(' ');
    mainEl.style.backgroundAttachment = 'local';
    mainEl.style.setProperty('--album-accent', `rgb(${r},${g},${b})`);
    mainEl.classList.add('themed');
  }

  function resetTheme() {
    const mainEl = document.querySelector('.main');
    if (!mainEl) return;
    mainEl.style.background = '';
    mainEl.style.backgroundAttachment = '';
    mainEl.style.removeProperty('--album-accent');
    mainEl.classList.remove('themed');
  }

  function showAlbumTracks(albumId) {
    const album = albums.find(a => a.id === albumId);
    const albumSongs = songs.filter(s => s.albumId === albumId);

    libraryDashboard.style.display = 'none';
    tracklistView.style.display = 'block';
    backBtn.style.display = 'flex';
    backBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Back to Library';

    detailCover.src = album.cover;
    detailTitle.textContent = album.title;
    detailArtist.textContent = album.artist;

    // 🎨 Apply dynamic color theme based on album cover
    extractColorFromImage(album.cover).then(color => applyDynamicTheme(color));

    // Scroll main to top
    const mainEl = document.querySelector('.main');
    if (mainEl) mainEl.scrollTop = 0;

    trackList.innerHTML = albumSongs.map((song, index) => {
      const isLiked = likedSongs.includes(song.id);
      return `
        <div class="track-item ${songs[currentSongIndex].id === song.id ? 'active' : ''}" data-song-id="${song.id}">
          <div class="track-number">${index + 1}</div>
          <div class="track-details">
            <div class="track-name">${song.title}</div>
            <div class="track-artist">${song.artist}</div>
          </div>
          <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px;">
            ${isLiked ? '<i class="fas fa-heart" style="color: var(--accent); font-size: 14px;"></i>' : ''}
            <button class="song-options-btn" data-song-id="${song.id}"><i class="fas fa-ellipsis-v"></i></button>
            <div class="track-duration" id="dur-${song.id}">—</div>
          </div>
        </div>
      `;
    }).join('');

    // Dynamically load real durations from audio metadata
    albumSongs.forEach(song => {
      if (!song.file) return;
      const tmpAudio = new Audio();
      tmpAudio.preload = 'metadata';
      tmpAudio.addEventListener('loadedmetadata', () => {
        const el = document.getElementById(`dur-${song.id}`);
        if (el) el.textContent = formatTime(tmpAudio.duration);
        tmpAudio.src = ''; // free resource
      }, { once: true });
      tmpAudio.src = song.file;
    });

    document.querySelectorAll('.track-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.song-options-btn')) return;
        const songId = parseInt(item.dataset.songId);
        const index = songs.findIndex(s => s.id === songId);
        loadSong(index);
        playPause();
      });
    });
  }

  function resetLibraryView() {
    libraryDashboard.style.display = 'block';
    tracklistView.style.display = 'none';
    backBtn.style.display = 'none';
    resetTheme();
  }

  function showCategoryTracks(title, categorySongs, playlistId = null) {
    // Navigate to library view container
    currentActiveView = 'library';
    homeView.style.display = 'none';
    libraryView.style.display = 'block';
    aboutView.style.display = 'none';
    homeNavItem.classList.remove('active');
    libraryNavItem.classList.add('active');
    
    libraryDashboard.style.display = 'none';
    tracklistView.style.display = 'block';
    backBtn.style.display = 'flex';
    backBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Back to Home';
    
    detailCover.src = categorySongs[0]?.cover || 'https://placehold.co/400x400/333/1ed760?text=Music';
    detailTitle.textContent = title;
    
    // Add "Add Songs" button if it's a user playlist
    if (playlistId) {
      detailArtist.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; margin-top: 10px;">
          <span>${categorySongs.length} Songs</span>
          <button id="addSongsToPlBtn" class="modal-btn modal-btn-primary" style="padding: 6px 16px; font-size: 12px;">
            <i class="fas fa-plus"></i> Add Songs
          </button>
          <button id="deletePlaylistBtn" class="modal-btn" style="padding: 6px 16px; font-size: 12px; background: rgba(255, 68, 68, 0.1); border: 1px solid #ff4444; color: #ff4444; cursor: pointer; transition: all 0.2s;">
            <i class="fas fa-trash-alt"></i> Delete
          </button>
        </div>
      `;
      document.getElementById('addSongsToPlBtn').onclick = () => openAddSongsToPlaylistModal(playlistId);
      document.getElementById('deletePlaylistBtn').onclick = () => deletePlaylist(playlistId);
    } else {
      detailArtist.textContent = `${categorySongs.length} Songs`;
    }

    // Scroll main to top
    const mainEl = document.querySelector('.main');
    if (mainEl) mainEl.scrollTop = 0;

    trackList.innerHTML = categorySongs.map((song, index) => {
      const isLiked = likedSongs.includes(song.id);
      return `
        <div class="track-item ${songs[currentSongIndex].id === song.id ? 'active' : ''}" data-song-id="${song.id}">
          <div class="track-number">${index + 1}</div>
          <div class="track-details">
            <div class="track-name">${song.title}</div>
            <div class="track-artist">${song.artist}</div>
          </div>
          <div style="display: flex; align-items: center; justify-content: flex-end; gap: 15px;">
            ${isLiked ? '<i class="fas fa-heart" style="color: var(--accent); font-size: 14px;"></i>' : ''}
            <button class="song-options-btn" data-song-id="${song.id}"><i class="fas fa-ellipsis-v"></i></button>
            <div class="track-duration" id="dur-${song.id}">—</div>
            ${playlistId ? `<button class="remove-track-btn" data-song-id="${song.id}" title="Remove from playlist"><i class="fas fa-minus-circle"></i></button>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Dynamically load real durations
    categorySongs.forEach(song => {
      if (!song.file) return;
      const tmpAudio = new Audio();
      tmpAudio.preload = 'metadata';
      tmpAudio.addEventListener('loadedmetadata', () => {
        const el = document.getElementById(`dur-${song.id}`);
        if (el) el.textContent = formatTime(tmpAudio.duration);
        tmpAudio.src = '';
      }, { once: true });
      tmpAudio.src = song.file;
    });

    document.querySelectorAll('.track-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // If clicking the remove button, don't play the song
        if (e.target.closest('.remove-track-btn')) return;
        if (e.target.closest('.song-options-btn')) return;

        const songId = parseInt(item.dataset.songId);
        const index = songs.findIndex(s => s.id === songId);
        loadSong(index);
        playPause();
      });
    });

    // Add listeners for remove buttons
    document.querySelectorAll('.remove-track-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const songId = parseInt(btn.dataset.songId);
        removeSongFromPlaylist(playlistId, songId, title);
      });
    });
  }

  function openAddSongsToPlaylistModal(plId) {
    const playlist = userPlaylists.find(p => p.id === plId);
    if (!playlist) return;

    infoModalTitle.textContent = `Add Songs to "${playlist.name}"`;
    
    // Filter out songs already in the playlist
    let availableSongs = songs.filter(s => !playlist.songIds.includes(s.id));

    if (availableSongs.length === 0) {
      infoModalContent.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-secondary);">All available songs are already in this playlist!</div>`;
    } else {
      // Build Modal Layout with Search Bar
      infoModalContent.innerHTML = `
        <div style="padding: 15px;">
          <div class="search-wrapper" style="margin-bottom: 20px; max-width: 100%; background: var(--bg-highlight);">
            <i class="fas fa-search"></i>
            <input type="text" id="plSongSearch" placeholder="Search for a song to add..." style="background: transparent; border: none; color: white; width: 100%; outline: none;">
          </div>
          <div id="modalSongList"></div>
        </div>
      `;

      const searchInput = document.getElementById('plSongSearch');
      const songListContainer = document.getElementById('modalSongList');

      const renderModalSongs = (filtered) => {
        if (filtered.length === 0) {
          songListContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No matches found.</div>`;
          return;
        }

        songListContainer.innerHTML = filtered.map(song => `
          <div class="playlist-modal-item add-song-item" data-song-id="${song.id}" style="padding: 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 12px; margin-bottom: 8px; background: var(--bg-highlight);">
            <img src="${song.cover}" style="width: 40px; height: 40px; border-radius: 4px;">
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 14px;">${song.title}</div>
              <div style="font-size: 12px; color: var(--text-secondary);">${song.artist}</div>
            </div>
            <i class="fas fa-plus" style="color: var(--accent);"></i>
          </div>
        `).join('');

        songListContainer.querySelectorAll('.add-song-item').forEach(item => {
          item.onclick = () => {
            const songId = parseInt(item.dataset.songId);
            playlist.songIds.unshift(songId);
            savePlaylistsToStorage();
            
            item.style.opacity = '0.5';
            item.querySelector('i').className = 'fas fa-check';
            item.style.pointerEvents = 'none';

            const updatedSongs = playlist.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean);
            showCategoryTracks(playlist.name, updatedSongs, plId);
            
            // Re-filter after adding to avoid showing the same song twice
            availableSongs = availableSongs.filter(s => s.id !== songId);
          };
        });
      };

      // Initial render
      renderModalSongs(availableSongs);

      // Search functionality
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        const results = availableSongs.filter(s => 
          s.title.toLowerCase().includes(q) || 
          s.artist.toLowerCase().includes(q)
        );
        renderModalSongs(results);
      });
    }

    infoModalOverlay.classList.add('active');
  }

  function goBackToLibrary() {
    if (backBtn.textContent.includes('Home')) {
      switchView('home');
    } else {
      resetLibraryView();
    }
  }


  // --- PLAYLIST LOGIC ---
  function renderSidebarPlaylists() {
    customPlaylistsContainer.innerHTML = userPlaylists.map(pl => `
      <div class="playlist-item" data-playlist-id="${pl.id}">
        <i class="fas fa-list-ul" style="margin-right: 8px;"></i>${pl.name}
      </div>
    `).join('');

    customPlaylistsContainer.querySelectorAll('.playlist-item').forEach(item => {
      item.addEventListener('click', () => {
        const plId = item.dataset.playlistId;
        const playlist = userPlaylists.find(p => p.id === plId);
        if (playlist) {
          const playlistSongs = playlist.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean);
          showCategoryTracks(playlist.name, playlistSongs, plId);
        }
      });
    });
  }

  function createNewPlaylist() {
    infoModalTitle.textContent = "Create New Playlist";

    infoModalContent.innerHTML = `
      <div class="modal-body">
        <div class="playlist-preview-card">
          <div class="preview-cover"><i class="fas fa-music"></i></div>
          <div class="preview-info">
            <span class="preview-type">Playlist</span>
            <div class="preview-name" id="prevName">My Playlist</div>
            <div class="preview-desc" id="prevDesc">Give your playlist a description.</div>
          </div>
        </div>

        <div class="modal-form-group">
          <label>Name</label>
          <input type="text" id="plInputName" class="modal-input" placeholder="My Playlist" maxlength="30" autocomplete="off">
        </div>
        
        <div class="modal-form-group">
          <label>Description</label>
          <textarea id="plInputDesc" class="modal-textarea" placeholder="Add an optional description" maxlength="100"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-btn modal-btn-secondary" id="modalCancelBtn">Cancel</button>
        <button class="modal-btn modal-btn-primary" id="modalSaveBtn">Create Playlist</button>
      </div>
    `;

    infoModalOverlay.classList.add('active');

    const nameInput = document.getElementById('plInputName');
    const descInput = document.getElementById('plInputDesc');
    const prevName = document.getElementById('prevName');
    const prevDesc = document.getElementById('prevDesc');

    // Focus name input immediately
    setTimeout(() => nameInput.focus(), 100);

    nameInput.addEventListener('input', (e) => {
      prevName.textContent = e.target.value || "My Playlist";
    });

    descInput.addEventListener('input', (e) => {
      prevDesc.textContent = e.target.value || "Give your playlist a description.";
    });

    document.getElementById('modalCancelBtn').onclick = () => {
      infoModalOverlay.classList.remove('active');
    };

    document.getElementById('modalSaveBtn').onclick = () => {
      const name = nameInput.value.trim();
      if (!name) {
        nameInput.style.borderColor = "#ff4444";
        setTimeout(() => nameInput.style.borderColor = "", 1500);
        nameInput.focus();
        return;
      }

      const newPl = {
        id: 'pl_' + Date.now(),
        name: name,
        description: descInput.value.trim(),
        songIds: []
      };

      userPlaylists.push(newPl);
      savePlaylistsToStorage();
      renderSidebarPlaylists();
      infoModalOverlay.classList.remove('active');
    };
  }

  async function savePlaylistsToStorage() {
    if (currentUser) {
      await saveUserData({ playlists: userPlaylists });
    } else {
      localStorage.setItem('userPlaylists', JSON.stringify(userPlaylists));
    }
  }

  function deletePlaylist(plId) {
    const playlist = userPlaylists.find(p => p.id === plId);
    if (!playlist) return;

    infoModalTitle.textContent = "Delete Playlist";
    infoModalContent.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <div style="font-size: 50px; color: #ff4444; margin-bottom: 20px;">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 style="margin-bottom: 10px; font-size: 20px;">Are you sure?</h3>
        <p style="color: var(--text-secondary); margin-bottom: 30px; line-height: 1.5;">
          You are about to delete "<strong>${playlist.name}</strong>". This action cannot be undone and all songs in this playlist will be removed from this collection.
        </p>
        <div style="display: flex; gap: 15px; justify-content: center;">
          <button id="cancelDeleteBtn" class="modal-btn modal-btn-secondary" style="padding: 10px 25px;">Cancel</button>
          <button id="confirmDeleteBtn" class="modal-btn" style="padding: 10px 25px; background: #ff4444; color: white; border: none; border-radius: 20px; font-weight: bold; cursor: pointer;">Delete Playlist</button>
        </div>
      </div>
    `;

    infoModalOverlay.classList.add('active');

    document.getElementById('cancelDeleteBtn').onclick = () => {
      infoModalOverlay.classList.remove('active');
    };

    document.getElementById('confirmDeleteBtn').onclick = () => {
      userPlaylists = userPlaylists.filter(p => p.id !== plId);
      savePlaylistsToStorage();
      renderSidebarPlaylists();
      
      infoModalOverlay.classList.remove('active');
      switchView('library');
      console.log('Playlist deleted:', plId);
    };
  }

  function removeSongFromPlaylist(plId, songId, plName) {
    const playlist = userPlaylists.find(p => p.id === plId);
    if (!playlist) return;
    
    playlist.songIds = playlist.songIds.filter(id => id !== songId);
    savePlaylistsToStorage();
    
    // Refresh the view with updated list
    const updatedSongs = playlist.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean);
    showCategoryTracks(plName, updatedSongs, plId);
  }

  function openAddToPlaylistModal(targetSongId = null) {
    const songId = targetSongId !== null ? targetSongId : songs[currentSongIndex].id;
    const currentSong = songs.find(s => s.id === parseInt(songId));
    if (!currentSong) return;

    infoModalTitle.textContent = "Add to Playlist";

    if (userPlaylists.length === 0) {
      infoModalContent.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
          <p>You haven't created any playlists yet.</p>
          <button id="modalCreateBtn" style="margin-top: 15px; padding: 10px 20px; border-radius: 20px; border: none; background: var(--accent); color: #000; font-weight: bold; cursor: pointer;">Create Playlist</button>
        </div>
      `;
      infoModalOverlay.classList.add('active');
      document.getElementById('modalCreateBtn').onclick = () => {
        infoModalOverlay.classList.remove('active');
        createNewPlaylist();
      };
      return;
    }

    const plListHtml = userPlaylists.map(pl => `
      <div class="playlist-modal-item" data-pl-id="${pl.id}" style="padding: 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 12px; margin-bottom: 8px; background: var(--bg-highlight);">
        <i class="fas fa-plus-circle" style="color: var(--accent);"></i>
        <span>${pl.name}</span>
      </div>
    `).join('');

    infoModalContent.innerHTML = `
      <div style="padding: 10px;">
        <p style="margin-bottom: 15px; color: var(--text-secondary);">Select a playlist to add "<strong>${currentSong.title}</strong>"</p>
        ${plListHtml}
      </div>
    `;

    infoModalOverlay.classList.add('active');

    infoModalContent.querySelectorAll('.playlist-modal-item').forEach(item => {
      item.onclick = () => {
        const plId = item.dataset.plId;
        const playlist = userPlaylists.find(p => p.id === plId);
        if (playlist) {
          if (!playlist.songIds.includes(currentSong.id)) {
            playlist.songIds.unshift(currentSong.id);
            savePlaylistsToStorage();
            showNotification(`Added "${currentSong.title}" to "${playlist.name}"`, 'fas fa-check-circle');
            
            // Real-time UI update if viewing this specific playlist
            if (currentActiveView === 'library' && tracklistView.style.display === 'block') {
              const detailTitle = document.getElementById('detailTitle');
              if (detailTitle.textContent === playlist.name) {
                const updatedSongs = playlist.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean);
                showCategoryTracks(playlist.name, updatedSongs, plId);
              }
            }
          } else {
            showNotification(`"${currentSong.title}" is already in "${playlist.name}"`, 'fas fa-exclamation-circle');
          }
          infoModalOverlay.classList.remove('active');
        }
      };
    });
  }

  // --- PLAYER ENGINE ---
  function loadSong(index) {
    const song = songs[index];
    if (!song) return;

    audio.src = song.file || SILENT_AUDIO;
    playerCover.src = song.cover;
    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist;

    currentSongIndex = index;
    localStorage.setItem('lastPlayedIndex', index);
    addToRecentlyPlayed(song.id);
    incrementPlayCount(song);

    audio.load();
    if (isPlaying) {
      audio.play().catch(e => console.log('Play prevented:', e));
    }

    // Update active highlight in UI
    if (searchInput.value !== '') {
      renderCards(filteredSongs);
    }
    renderHomeDashboard();

    // Update Like Button State
    playerLikeBtn.style.display = 'flex';
    addToPlaylistBtn.style.display = 'flex';
    if (likedSongs.includes(song.id)) {
      playerLikeBtn.innerHTML = '<i class="fas fa-heart"></i>';
      playerLikeBtn.classList.add('liked');
    } else {
      playerLikeBtn.innerHTML = '<i class="far fa-heart"></i>';
      playerLikeBtn.classList.remove('liked');
    }

    if (currentActiveView === 'library' && tracklistView.style.display === 'block') {
      // Refresh tracklist highlight if open
      const activeAlbumId = albums.find(a => a.title === detailTitle.textContent)?.id;
      if (activeAlbumId) showAlbumTracks(activeAlbumId);
    }
  }

  async function addToRecentlyPlayed(songId) {
    recentlyPlayed = recentlyPlayed.filter(id => id !== songId);
    recentlyPlayed.unshift(songId);
    recentlyPlayed = recentlyPlayed.slice(0, 15); // Limit to 15
    
    if (currentUser) {
      await saveUserData({ recentlyPlayed });
    } else {
      localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
    }
  }

  async function incrementPlayCount(song) {
    if (!currentUser) return;
    userStats.totalPlayed++;
    
    // Simple top artist logic: most played artist
    // For now, let's just update the total and use a placeholder or basic check
    // Real logic would track artist play counts in an object
    userStats.topArtist = song.artist; // Placeholder: last played artist as top artist for now

    await saveUserData({ stats: userStats });
    if (currentActiveView === 'profile') renderProfile();
  }

  async function toggleLike(targetId = null) {
    // Handle cases where an event object is passed from addEventListener
    if (targetId && typeof targetId === 'object') targetId = null;
    
    const songId = targetId !== null ? targetId : songs[currentSongIndex].id;
    const isLiked = likedSongs.includes(songId);

    if (isLiked) {
      likedSongs = likedSongs.filter(id => id !== songId);
      showNotification('Removed from Liked Songs', 'fas fa-heart-broken');
    } else {
      likedSongs.unshift(songId); // Add to the top of the list instead of the bottom
      showNotification('Added to Liked Songs', 'fas fa-heart');
    }

    if (currentUser) {
      await saveUserData({ likedSongs });
    } else {
      localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
    }

    // Refresh UI for the player button directly without restarting the song
    if (playerLikeBtn) {
      if (likedSongs.includes(songId)) {
        playerLikeBtn.innerHTML = '<i class="fas fa-heart"></i>';
        playerLikeBtn.classList.add('liked');
      } else {
        playerLikeBtn.innerHTML = '<i class="far fa-heart"></i>';
        playerLikeBtn.classList.remove('liked');
      }
    }
    
    // Real-time UI updates for all visible hearts
    updateAllVisibleHearts(songId, !isLiked);
    
    // Real-time UI updates depending on the active view
    if (currentActiveView === 'profile') {
      renderProfile();
    } else if (currentActiveView === 'library' && document.getElementById('likedGrid')) {
      // Re-render the library view if it's open, or if we are inside the liked songs view
      renderLibrary();
      
      // If we are currently viewing the full "Liked Songs" playlist view, update it
      const detailTitle = document.getElementById('detailTitle');
      if (tracklistView.style.display === 'block' && detailTitle.textContent === 'Liked Songs') {
        const liked = likedSongs.map(id => songs.find(s => s.id === id)).filter(Boolean);
        showCategoryTracks('Liked Songs', liked);
      }
    }
  }

  function playPause() {
    if (audio.paused) {
      audio.play().then(() => {
        isPlaying = true;
        updatePlayButton();
      }).catch(e => console.error("Playback failed", e));
    } else {
      audio.pause();
      isPlaying = false;
      updatePlayButton();
    }
  }

  function updatePlayButton() {
    const icon = playPauseBtn.querySelector('i');
    icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
  }

  // --- SHUFFLE ENGINE ---
  function buildShuffleQueue(startIndex) {
    // Fisher-Yates shuffle of all song indices
    const indices = songs.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    // Move the current song to position 0 so it isn't immediately repeated
    const pos = indices.indexOf(startIndex);
    if (pos > 0) { [indices[0], indices[pos]] = [indices[pos], indices[0]]; }
    shuffleQueue = indices;
    shuffleQueuePos = 0;
  }

  function getNextShuffleIndex() {
    shuffleQueuePos++;
    if (shuffleQueuePos >= shuffleQueue.length) {
      // Rebuild queue when exhausted — pick a different first song
      buildShuffleQueue(shuffleQueue[shuffleQueue.length - 1]);
      shuffleQueuePos = 1; // skip the repeated song at index 0
    }
    return shuffleQueue[shuffleQueuePos];
  }

  function getPrevShuffleIndex() {
    shuffleQueuePos = Math.max(0, shuffleQueuePos - 1);
    return shuffleQueue[shuffleQueuePos];
  }

  function toggleShuffle() {
    isShuffled = !isShuffled;
    const btn = document.getElementById('shuffleBtn');
    if (btn) {
      btn.classList.toggle('active', isShuffled);
      btn.title = isShuffled ? 'Shuffle: On' : 'Shuffle: Off';
    }
    if (isShuffled) buildShuffleQueue(currentSongIndex);
  }

  function toggleRepeat() {
    repeatMode = repeatMode === 0 ? 1 : 0;
    if (repeatBtn) {
      if (repeatMode === 1) {
        repeatBtn.classList.add('active', 'repeat-one');
        repeatBtn.title = 'Repeat: One';
      } else {
        repeatBtn.classList.remove('active', 'repeat-one');
        repeatBtn.title = 'Repeat: All';
      }
    }
  }

  function nextSong() {
    if (playQueue.length > 0) {
      const nextId = playQueue.shift();
      saveQueueToStorage(); // Save updated queue after shifting
      const idx = songs.findIndex(s => s.id === nextId);
      if (idx !== -1) {
        loadSong(idx);
        if (isPlaying) audio.play();
        return;
      }
    }
    const nextIdx = isShuffled ? getNextShuffleIndex() : (currentSongIndex + 1) % songs.length;
    loadSong(nextIdx);
    if (isPlaying) audio.play();
  }

  function prevSong() {
    const prevIdx = isShuffled ? getPrevShuffleIndex() : (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(prevIdx);
    if (isPlaying) audio.play();
  }

  function formatTime(secs) {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateAllVisibleHearts(songId, isLikedNow) {
    const instances = document.querySelectorAll(`[data-song-id="${songId}"]`);
    instances.forEach(instance => {
      const existingHeart = instance.querySelector('.fa-heart:not(.fa-heart-broken)');
      
      if (isLikedNow) {
        if (!existingHeart) {
          const heart = document.createElement('i');
          heart.className = 'fas fa-heart liked-heart-icon';
          heart.style.color = 'var(--accent)';
          heart.style.zIndex = '10';
          
          if (instance.classList.contains('song-card')) {
             heart.style.position = 'absolute';
             heart.style.bottom = '45px';
             heart.style.right = '10px';
             heart.style.fontSize = '16px';
             heart.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))';
             instance.appendChild(heart);
          } else if (instance.classList.contains('track-item')) {
             heart.style.fontSize = '14px';
             const optionsBtn = instance.querySelector('.song-options-btn');
             if (optionsBtn) {
               optionsBtn.parentElement.insertBefore(heart, optionsBtn);
             }
          }
        }
      } else {
        if (existingHeart) existingHeart.remove();
      }
    });
  }

  function saveQueueToStorage() {
    localStorage.setItem('playQueue', JSON.stringify(playQueue));
  }

  function showNotification(message, icon = 'fas fa-info-circle') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
    
    container.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // --- LOGOUT ---
  function handleLogout() {
    signOut(auth).then(() => {
      sessionStorage.clear();
      window.location.href = 'login.html';
    });
  }



  // --- 3D SCROLL & ANIMATION ---
  let globalObserver = null;
  function setup3DScrollAnimations() {
    globalObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    // Observe existing shelves
    document.querySelectorAll('.scroll-reveal, .home-shelf').forEach(el => {
      el.classList.add('scroll-reveal');
      globalObserver.observe(el);
    });
  }

  // --- INITIALIZE ---
  function init() {
    checkAuth();
    setup3DScrollAnimations();
    renderHomeDashboard();
    renderAlbums();

    // Like button listener
    if (playerLikeBtn) {
      playerLikeBtn.addEventListener('click', toggleLike);
    }

    // Load state
    const lastIdx = localStorage.getItem('lastPlayedIndex');
    if (lastIdx !== null) loadSong(parseInt(lastIdx));
    else loadSong(0);

    const lastTime = localStorage.getItem('lastPlayedTime');
    if (lastTime) {
      audio.addEventListener('loadedmetadata', () => {
        if (!isPlaying) {
          audio.currentTime = parseFloat(lastTime);
        }
      }, { once: true });
    }

    const savedQueue = localStorage.getItem('playQueue');
    if (savedQueue) {
      try {
        playQueue = JSON.parse(savedQueue);
      } catch (e) {
        console.error("Error parsing saved queue:", e);
        playQueue = [];
      }
    }

    // Initialize shuffle queue from current song
    buildShuffleQueue(currentSongIndex);
    // Set shuffle button state visually
    const shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) {
      shuffleBtn.classList.toggle('active', isShuffled);
      shuffleBtn.title = isShuffled ? 'Shuffle: On' : 'Shuffle: Off';
      shuffleBtn.addEventListener('click', toggleShuffle);
    }

    if (repeatBtn) {
      repeatBtn.addEventListener('click', toggleRepeat);
    }
    
    // Inject global queue menu container
    const queueMenu = document.createElement('div');
    queueMenu.className = 'song-options-menu';
    document.body.appendChild(queueMenu);
    
    let currentMenuSongId = null;

    const updateQueueMenu = (songId) => {
      const isLiked = likedSongs.includes(songId);
      const isInQueue = playQueue.includes(songId);
      
      queueMenu.innerHTML = `
        <div class="song-options-item" id="menuPlayNext"><i class="fas fa-step-forward"></i> Play Next</div>
        <div class="song-options-item" id="menuAddQueue">
          <i class="${isInQueue ? 'fas fa-minus-circle' : 'fas fa-list'}"></i> 
          ${isInQueue ? 'Remove from Queue' : 'Add to Queue'}
        </div>
        <div class="song-options-item" id="menuAddToPlaylist"><i class="fas fa-plus"></i> Add to Playlist</div>
        <div class="song-options-item" id="menuToggleLike">
          <i class="${isLiked ? 'fas fa-heart-broken' : 'fas fa-heart'}"></i> 
          ${isLiked ? 'Remove from Liked' : 'Add to Liked'}
        </div>
      `;

      document.getElementById('menuPlayNext').onclick = () => {
        // Remove if already exists to move to top (prevent duplicates)
        playQueue = playQueue.filter(id => id !== songId);
        playQueue.unshift(songId);
        saveQueueToStorage();
        queueMenu.classList.remove('active');
        showNotification('Added to Play Next', 'fas fa-step-forward');
        if (detailTitle.textContent === 'Current Queue' && currentActiveView === 'library' && tracklistView.style.display === 'block') {
          const queueTracks = playQueue.map(id => songs.find(s => s.id === id)).filter(Boolean);
          showCategoryTracks('Current Queue', queueTracks);
        }
      };
      document.getElementById('menuAddQueue').onclick = () => {
        if (isInQueue) {
          // Remove from queue
          playQueue = playQueue.filter(id => id !== songId);
          showNotification('Removed from Queue', 'fas fa-minus-circle');
        } else {
          // Add to queue
          playQueue.push(songId);
          showNotification('Added to Queue', 'fas fa-list');
        }
        saveQueueToStorage();
        queueMenu.classList.remove('active');
        
        // Refresh view if in Queue view
        if (detailTitle.textContent === 'Current Queue' && currentActiveView === 'library' && tracklistView.style.display === 'block') {
          const queueTracks = playQueue.map(id => songs.find(s => s.id === id)).filter(Boolean);
          showCategoryTracks('Current Queue', queueTracks);
        }
      };
      document.getElementById('menuAddToPlaylist').onclick = () => {
        queueMenu.classList.remove('active');
        openAddToPlaylistModal(songId);
      };
      document.getElementById('menuToggleLike').onclick = () => {
        toggleLike(songId);
        queueMenu.classList.remove('active');
      };
    };
    
    document.addEventListener('click', (e) => {
      if (e.target.closest('.song-options-btn')) {
        e.preventDefault();
        e.stopPropagation();
        const btn = e.target.closest('.song-options-btn');
        currentMenuSongId = parseInt(btn.dataset.songId);
        updateQueueMenu(currentMenuSongId);
        const rect = btn.getBoundingClientRect();
        queueMenu.style.top = (rect.bottom + window.scrollY) + 'px';
        queueMenu.style.left = (rect.left + window.scrollX - 100) + 'px';
        queueMenu.classList.add('active');
      } else if (!e.target.closest('.song-options-menu')) {
        queueMenu.classList.remove('active');
      }
    });
    
    document.addEventListener('click', (e) => {
      if (e.target.closest('.song-options-btn')) {
        e.preventDefault();
        e.stopPropagation();
        const btn = e.target.closest('.song-options-btn');
        currentMenuSongId = parseInt(btn.dataset.songId);
        const rect = btn.getBoundingClientRect();
        queueMenu.style.top = (rect.bottom + window.scrollY) + 'px';
        queueMenu.style.left = (rect.left + window.scrollX - 100) + 'px';
        queueMenu.classList.add('active');
      } else if (!e.target.closest('.song-options-menu')) {
        queueMenu.classList.remove('active');
      }
    });

    const vol = localStorage.getItem('playerVolume');
    if (vol !== null) {
      audio.volume = parseFloat(vol);
      volumeSlider.value = vol;
    }

    // Interaction Listeners
    playPauseBtn.addEventListener('click', playPause);
    nextBtn.addEventListener('click', nextSong);
    prevBtn.addEventListener('click', prevSong);
    backBtn.addEventListener('click', goBackToLibrary);

    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${percent}%`;
        currentTimeSpan.textContent = formatTime(audio.currentTime);
        durationTimeSpan.textContent = formatTime(audio.duration);
        localStorage.setItem('lastPlayedTime', audio.currentTime);
      }
    });

    audio.addEventListener('error', (e) => {
      console.error("Audio error:", e);
      let errorMsg = "Unable to load song. ";

      // Check for common cloud storage errors
      if (!navigator.onLine) {
        errorMsg += "Please check your internet connection.";
      } else {
        errorMsg += "The link might be broken or expired.";
      }

      // Simple UI feedback
      playerTitle.textContent = "Error Loading Song";
      playerArtist.textContent = "Please try another track";
      isPlaying = false;
      updatePlayButton();
      showNotification(errorMsg, 'fas fa-exclamation-triangle');
    });

    // Auto-advance to next shuffled song when current one ends
    audio.addEventListener('ended', () => {
      isPlaying = true; // keep isPlaying true so loadSong triggers audio.play()
      if (repeatMode === 1 && playQueue.length === 0) {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextSong();
      }
    });

    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pos * audio.duration;
    });

    volumeSlider.addEventListener('input', (e) => {
      audio.volume = e.target.value;
      localStorage.setItem('playerVolume', e.target.value);
    });

    searchInput.addEventListener('input', (e) => handleSearch(e.target.value));

    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebarOverlay.classList.toggle('active');
    });

    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    });

    // Playlist Listeners
    sidebarLikedSongs.addEventListener('click', () => {
      const liked = likedSongs.map(id => songs.find(s => s.id === id)).filter(Boolean);
      showCategoryTracks('Liked Songs', liked);
    });

    sidebarQueue.addEventListener('click', () => {
      const queueTracks = playQueue.map(id => songs.find(s => s.id === id)).filter(Boolean);
      showCategoryTracks('Current Queue', queueTracks);
    });

    sidebarTrending.addEventListener('click', () => {
      const trending = songs.filter(s => s.isTrending).reverse();
      showCategoryTracks('Trending Now', trending);
    });

    createPlaylistBtn.addEventListener('click', createPlaylistBtn.id === 'createPlaylistBtn' ? createNewPlaylist : () => { });
    addToPlaylistBtn.addEventListener('click', openAddToPlaylistModal);

    infoModalClose.addEventListener('click', () => infoModalOverlay.classList.remove('active'));
    infoModalOverlay.addEventListener('click', (e) => {
      if (e.target === infoModalOverlay) infoModalOverlay.classList.remove('active');
    });

    renderSidebarPlaylists();

    // SPA Nav
    homeNavItem.addEventListener('click', () => switchView('home'));
    libraryNavItem.addEventListener('click', () => switchView('library'));
    aboutNavItem.addEventListener('click', () => switchView('about'));
    logoBtn.addEventListener('click', () => switchView('home'));

    // About Page CTA Buttons
    const aboutExploreBtn = document.getElementById('aboutExploreBtn');
    if (aboutExploreBtn) aboutExploreBtn.addEventListener('click', () => switchView('home'));
    
    const aboutLibraryBtn = document.getElementById('aboutLibraryBtn');
    if (aboutLibraryBtn) aboutLibraryBtn.addEventListener('click', () => switchView('library'));
    
    const aboutStartListeningBtn = document.getElementById('aboutStartListeningBtn');
    if (aboutStartListeningBtn) aboutStartListeningBtn.addEventListener('click', () => switchView('home'));

    // User Avatar Click
    userAvatar.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent immediate closing
      const existing = document.querySelector('.user-dropdown');
      if (existing) {
        existing.remove();
        return;
      }

      const menu = document.createElement('div');
      menu.className = 'user-dropdown';
      menu.innerHTML = `
        <div class="user-info">
          <div class="user-name">${userAvatar.title || 'User'}</div>
        </div>
        <div class="dropdown-item" id="profileItem"><i class="fas fa-user"></i> Profile</div>
        <div class="dropdown-item" id="supportItem"><i class="fas fa-life-ring"></i> Support</div>
        <div class="dropdown-item" id="themeMenuItem">
          <i class="fas fa-adjust"></i> 
          Theme: ${document.body.classList.contains('light') ? 'Light' : 'Dark'}
        </div>
        <div class="dropdown-item" id="settingsItem"><i class="fas fa-cog"></i> Settings</div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item" id="logoutItem" style="color: #ff4444;"><i class="fas fa-sign-out-alt"></i> Logout</div>
      `;
      document.body.appendChild(menu);

      // Handle item clicks
      document.getElementById('logoutItem').addEventListener('click', handleLogout);
      
      document.getElementById('themeMenuItem').addEventListener('click', () => {
        document.body.classList.toggle('light');
        menu.remove(); // Close menu after change
      });

      document.getElementById('profileItem').addEventListener('click', () => {
        switchView('profile');
        menu.remove();
      });

      document.getElementById('supportItem').addEventListener('click', () => {
        switchView('about');
        menu.remove();
      });

      document.getElementById('settingsItem').addEventListener('click', () => {
        showNotification("Settings feature coming soon!", 'fas fa-tools');
        menu.remove();
      });

      setTimeout(() => {
        document.addEventListener('click', function close(e) {
          if (!e.target.closest('.user-dropdown') && !e.target.closest('#userAvatar')) {
            menu.remove();
            document.removeEventListener('click', close);
          }
        });
      }, 0);
    });

    // --- FOOTER LINKS MODAL LOGIC ---
    const closeInfoModal = () => {
      if (infoModalOverlay) infoModalOverlay.classList.remove('active');
    };

    if (infoModalClose) infoModalClose.addEventListener('click', closeInfoModal);
    if (infoModalOverlay) {
      infoModalOverlay.addEventListener('click', (e) => {
        if (e.target === infoModalOverlay) closeInfoModal();
      });
    }

    document.querySelectorAll('.app-footer a').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // If it's a real link (not just '#'), let it function normally
        if (href && href !== '#' && href !== '') {
          return;
        }

        e.preventDefault();
        const topic = link.textContent.trim();

        if (topic.toLowerCase() === 'about') {
          switchView('about');
          window.scrollTo(0, 0);
          return;
        }

        infoModalTitle.textContent = topic || "Information";
        infoModalContent.innerHTML = `
          <p>This is the informational page for <strong>${topic || 'this section'}</strong>.</p>
          <p>Currently, StreamWave is in beta. Detailed policies, job listings, and community guidelines for this section are being finalized.</p>
          <p>Please check back later for full documentation and resources regarding ${topic || 'it'}.</p>
        `;
        infoModalOverlay.classList.add('active');
      });
    });

    // --- 3D ABOUT PAGE DYNAMICS ---
    const cards = document.querySelectorAll('.card-3d');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element
        const y = e.clientY - rect.top;  // y position within the element

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg)`;
      });
    });

    // --- VOICE SEARCH (MIC) ---
    const micBtn = document.getElementById('micBtn');
    if (micBtn) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        let isRecording = false;

        recognition.onstart = function () {
          isRecording = true;
          micBtn.classList.add('recording');
          searchInput.placeholder = "Listening... (Speak now)";
        };

        recognition.onresult = function (event) {
          let transcript = event.results[0][0].transcript;
          transcript = transcript.replace(/[.,!?]$/, '').trim();
          searchInput.value = transcript;
          handleSearch(transcript);
        };

          recognition.onerror = function (event) {
            console.error("Speech recognition error:", event.error);
            micBtn.classList.remove('recording');
            isRecording = false;
  
            if (event.error === 'not-allowed') {
              showNotification("Microphone access denied.", 'fas fa-microphone-slash');
            } else if (event.error === 'network') {
              showNotification("Network error: Check your internet.", 'fas fa-wifi');
            } else if (event.error === 'no-speech') {
              searchInput.placeholder = "No speech detected. Try again.";
            } else {
              showNotification("Microphone error: " + event.error, 'fas fa-exclamation-triangle');
            }
          };

        recognition.onend = function () {
          micBtn.classList.remove('recording');
          if (searchInput.placeholder === "Listening... (Speak now)") {
            searchInput.placeholder = "Search songs or artists...";
          }
          isRecording = false;
        };

        micBtn.addEventListener('click', (e) => {
          e.preventDefault(); // Stop any bubbling or default actions

          if (window.location.protocol === 'file:') {
            showNotification("Voice Search won't work on local files. Use a server.", 'fas fa-exclamation-triangle');
          }

          if (isRecording) {
            recognition.stop();
          } else {
            try {
              recognition.start();
            } catch (err) {
              console.error("Could not start speech recognition", err);
            }
          }
        });
      } else {
        micBtn.style.display = 'none';
        console.warn("Speech Recognition API not supported in this browser.");
      }
    }

    console.log('🎵 StreamWave App - Fully Loaded');
  }

  init();
})();
