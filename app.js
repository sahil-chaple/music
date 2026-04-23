import { auth, onAuthStateChanged, signOut } from './firebase-config.js';
import { songs, albums } from './songs-data.js';

(function() {
  "use strict";

  // --- DOM ELEMENTS ---
  // Player
  const audio = document.getElementById('audioPlayer');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
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
  const themeToggle = document.getElementById('themeToggle');
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
  const aboutView = document.getElementById('aboutView');
  
  // View Specifics
  const songsContainer = document.getElementById('songsContainer');
  const albumGrid = document.getElementById('albumGrid');
  const tracklistView = document.getElementById('tracklistView');
  const trackList = document.getElementById('trackList');
  const backBtn = document.getElementById('backBtn');
  const libraryTitle = document.getElementById('libraryTitle');
  const detailCover = document.getElementById('detailCover');
  const detailTitle = document.getElementById('detailTitle');
  const detailArtist = document.getElementById('detailArtist');

  // --- STATE ---
  let currentSongIndex = 0;
  let isPlaying = false;
  let filteredSongs = [...songs];
  let recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
  let likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];
  let currentActiveView = 'home'; // 'home' or 'library'
  let isShuffled = true; // Shuffle ON by default
  let shuffleQueue = []; // Pre-built queue of song indices
  let shuffleQueuePos = 0; // Current position in the queue
  
  const SILENT_AUDIO = "data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoAAACAgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/fw==";

  // --- AUTHENTICATION ---
  function checkAuth() {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = 'login.html';
      } else {
        const userData = JSON.parse(sessionStorage.getItem('streamwave_user')) || {
          displayName: user.displayName || user.email.split('@')[0],
          email: user.email
        };
        if (userAvatar) {
          userAvatar.textContent = userData.displayName?.charAt(0).toUpperCase() || 'U';
          userAvatar.title = userData.displayName;
        }
      }
    });
  }

  // --- NAVIGATION (SPA) ---
  function switchView(viewName) {
    currentActiveView = viewName;
    resetTheme(); // 🎨 Always reset theme when navigating between views
    
    if (viewName === 'home') {
      homeView.style.display = 'block';
      libraryView.style.display = 'none';
      aboutView.style.display = 'none';
      homeNavItem.classList.add('active');
      libraryNavItem.classList.remove('active');
      aboutNavItem.classList.remove('active');
    } else if (viewName === 'library') {
      homeView.style.display = 'none';
      libraryView.style.display = 'block';
      aboutView.style.display = 'none';
      homeNavItem.classList.remove('active');
      libraryNavItem.classList.add('active');
      aboutNavItem.classList.remove('active');
      renderLibrary(); // Render full library shelves
      renderAlbums(); // Refresh albums
    } else if (viewName === 'about') {
      homeView.style.display = 'none';
      libraryView.style.display = 'none';
      aboutView.style.display = 'block';
      homeNavItem.classList.remove('active');
      libraryNavItem.classList.remove('active');
      aboutNavItem.classList.add('active');
    }
    
    // Reset library inner view if switching to library
    if (viewName === 'library') goBackToLibrary();
    
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
    
    // If searching, always switch to home view to show results
    if (q.length > 0) {
      if (currentActiveView !== 'home') switchView('home');
      homeDashboard.style.display = 'none';
      searchResults.style.display = 'block';
      
      filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(q) || 
        song.artist.toLowerCase().includes(q)
      );
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

    songsContainer.innerHTML = songsToRender.map(song => `
      <div class="song-card ${songs[currentSongIndex] && songs[currentSongIndex].id === song.id ? 'playing' : ''}" data-song-id="${song.id}">
        <img class="card-cover" src="${song.cover}" alt="${song.title}">
        <div class="card-title">${song.title}</div>
        <div class="card-artist">${song.artist}</div>
      </div>
    `).join('');

    attachSongClickListeners(songsContainer);
  }

  function attachSongClickListeners(container) {
    container.querySelectorAll('.song-card').forEach(card => {
      // Click logic
      card.addEventListener('click', () => {
        const songId = parseInt(card.dataset.songId);
        if(isNaN(songId)) return; // prevent album card error
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
    const dashboard = document.getElementById('homeDashboard');
    if (!dashboard) return;
    
    let html = '';

    // 1. Trending Songs
    const trending = songs.filter(s => s.isTrending);
    if (trending.length > 0) html += buildShelfHTML('Trending Now', trending);

    // 2. New Releases
    const newReleases = songs.filter(s => s.isNewRelease);
    if (newReleases.length > 0) html += buildShelfHTML('New Releases', newReleases);

    // 3. Popular Artists/Songs
    const popular = songs.filter(s => s.isPopular);
    if (popular.length > 0) html += buildShelfHTML('Popular Hits', popular);


    // 5. Recently Played (Fallback if no tags)
    if (html === '' || recentlyPlayed.length > 0) {
      const recent = recentlyPlayed.map(id => songs.find(s => s.id === id)).filter(Boolean);
      if (recent.length > 0) html = buildShelfHTML('Recently Played', recent) + html;
    }

    dashboard.innerHTML = html;
    attachSongClickListeners(dashboard);

    // Observe newly injected shelves for 3D scroll animations
    if (globalObserver) {
      dashboard.querySelectorAll('.home-shelf.scroll-reveal').forEach(shelf => {
        globalObserver.observe(shelf);
      });
    }
  }

  function buildShelfHTML(title, shelfSongs) {
    const cardsHtml = shelfSongs.map(song => `
      <div class="song-card ${songs[currentSongIndex] && songs[currentSongIndex].id === song.id ? 'playing' : ''}" data-song-id="${song.id}">
        <img class="card-cover" src="${song.cover}" alt="${song.title}">
        <div class="card-title">${song.title}</div>
        <div class="card-artist">${song.artist}</div>
      </div>
    `).join('');

    return `
      <div class="home-shelf scroll-reveal">
        <h3 class="shelf-header">${title}</h3>
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
    } else {
      likedShelfWrapper.style.display = 'none';
    }

    // Recently Played
    const recent = recentlyPlayed.map(id => songs.find(s => s.id === id)).filter(Boolean);
    if (recent.length > 0) {
      recentGrid.innerHTML = recent.map(song => buildCardHTML(song)).join('');
      recentShelfWrapper.style.display = 'flex';
      attachSongClickListeners(recentGrid);
    } else {
      recentShelfWrapper.style.display = 'none';
    }
  }

  function buildCardHTML(song) {
    return `
      <div class="song-card ${songs[currentSongIndex] && songs[currentSongIndex].id === song.id ? 'playing' : ''}" data-song-id="${song.id}">
        <img class="card-cover" src="${song.cover}" alt="${song.title}">
        <div class="card-title">${song.title}</div>
        <div class="card-artist">${song.artist}</div>
      </div>
    `;
  }

  function renderAlbums() {
    if (!albumGrid) return;
    albumGrid.innerHTML = albums.map(album => `
      <div class="song-card scroll-reveal" data-album-id="${album.id}" style="transform-style: preserve-3d;">
        <img class="card-cover" src="${album.cover}" alt="${album.title}">
        <div class="card-title">${album.title}</div>
        <div class="card-artist">${album.artist}</div>
      </div>
    `).join('');

    document.querySelectorAll('[data-album-id]').forEach(card => {
      // Click logic
      card.addEventListener('click', () => {
        const albumId = parseInt(card.dataset.albumId);
        showAlbumTracks(albumId);
      });
      
      // 3D Hover Tracking logic for Albums
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

    albumGrid.style.display = 'none';
    libraryTitle.style.display = 'none';
    tracklistView.style.display = 'block';
    backBtn.style.display = 'flex';

    detailCover.src = album.cover;
    detailTitle.textContent = album.title;
    detailArtist.textContent = album.artist;

    // 🎨 Apply dynamic color theme based on album cover
    extractColorFromImage(album.cover).then(color => applyDynamicTheme(color));

    trackList.innerHTML = albumSongs.map((song, index) => `
      <div class="track-item ${songs[currentSongIndex].id === song.id ? 'active' : ''}" data-song-id="${song.id}">
        <div class="track-number">${index + 1}</div>
        <div class="track-details">
          <div class="track-name">${song.title}</div>
          <div class="track-artist">${song.artist}</div>
        </div>
        <div class="track-duration" id="dur-${song.id}">—</div>
      </div>
    `).join('');

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
      item.addEventListener('click', () => {
        const songId = parseInt(item.dataset.songId);
        const index = songs.findIndex(s => s.id === songId);
        loadSong(index);
        playPause();
      });
    });
  }

  function goBackToLibrary() {
    albumGrid.style.display = 'grid';
    libraryTitle.style.display = 'block';
    tracklistView.style.display = 'none';
    backBtn.style.display = 'none';
    resetTheme(); // 🎨 Reset to default theme when leaving album view
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

  function addToRecentlyPlayed(songId) {
    recentlyPlayed = recentlyPlayed.filter(id => id !== songId);
    recentlyPlayed.unshift(songId);
    recentlyPlayed = recentlyPlayed.slice(0, 10);
    localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
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

  function nextSong() {
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

  // --- LOGOUT ---
  function handleLogout() {
    signOut(auth).then(() => {
      sessionStorage.clear();
      window.location.href = 'login.html';
    });
  }

  function toggleLikeCurrentSong() {
    const song = songs[currentSongIndex];
    if (!song) return;

    if (likedSongs.includes(song.id)) {
      likedSongs = likedSongs.filter(id => id !== song.id);
      playerLikeBtn.innerHTML = '<i class="far fa-heart"></i>';
      playerLikeBtn.classList.remove('liked');
    } else {
      likedSongs.push(song.id);
      playerLikeBtn.innerHTML = '<i class="fas fa-heart"></i>';
      playerLikeBtn.classList.add('liked');
    }
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));

    // Refresh library if we are on it
    if (currentActiveView === 'library' && tracklistView.style.display === 'none') {
      renderLibrary();
    }
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
      playerLikeBtn.addEventListener('click', toggleLikeCurrentSong);
    }
    
    // Load state
    const lastIdx = localStorage.getItem('lastPlayedIndex');
    if (lastIdx !== null) loadSong(parseInt(lastIdx));
    else loadSong(0);

    // Initialize shuffle queue from current song
    buildShuffleQueue(currentSongIndex);
    // Set shuffle button state visually
    const shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) {
      shuffleBtn.classList.toggle('active', isShuffled);
      shuffleBtn.title = isShuffled ? 'Shuffle: On' : 'Shuffle: Off';
      shuffleBtn.addEventListener('click', toggleShuffle);
    }
    
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
      
      alert(errorMsg);
    });

    // Auto-advance to next shuffled song when current one ends
    audio.addEventListener('ended', () => {
      isPlaying = true; // keep isPlaying true so loadSong triggers audio.play()
      nextSong();
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
    
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light');
      themeToggle.querySelector('i').className = document.body.classList.contains('light') ? 'fas fa-moon' : 'fas fa-sun';
    });
    
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebarOverlay.classList.toggle('active');
    });

    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    });
    
    // SPA Nav
    homeNavItem.addEventListener('click', () => switchView('home'));
    libraryNavItem.addEventListener('click', () => switchView('library'));
    aboutNavItem.addEventListener('click', () => switchView('about'));
    logoBtn.addEventListener('click', () => switchView('home'));

    // User Avatar Click
    userAvatar.addEventListener('click', () => {
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
        <div class="dropdown-item" id="logoutItem"><i class="fas fa-sign-out-alt"></i> Logout</div>
      `;
      document.body.appendChild(menu);
      
      document.getElementById('logoutItem').addEventListener('click', handleLogout);
      
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
    const infoModalOverlay = document.getElementById('infoModalOverlay');
    const infoModalClose = document.getElementById('infoModalClose');
    const infoModalTitle = document.getElementById('infoModalTitle');
    const infoModalContent = document.getElementById('infoModalContent');

    const closeInfoModal = () => {
      infoModalOverlay.classList.remove('active');
    };

    infoModalClose.addEventListener('click', closeInfoModal);
    infoModalOverlay.addEventListener('click', (e) => {
      if (e.target === infoModalOverlay) closeInfoModal();
    });

    document.querySelectorAll('.app-footer a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const topic = link.textContent.trim();
        
        if (topic.toLowerCase() === 'about') {
          switchView('about');
          window.scrollTo(0, 0);
          return;
        }

        infoModalTitle.textContent = topic;
        infoModalContent.innerHTML = `
          <p>This is the informational page for <strong>${topic}</strong>.</p>
          <p>Currently, StreamWave is in beta. Detailed policies, job listings, and community guidelines for this section are being finalized.</p>
          <p>Please check back later for full documentation and resources regarding ${topic}.</p>
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

        recognition.onstart = function() {
          isRecording = true;
          micBtn.classList.add('recording');
          searchInput.placeholder = "Listening... (Speak now)";
        };

        recognition.onresult = function(event) {
          let transcript = event.results[0][0].transcript;
          transcript = transcript.replace(/[.,!?]$/, '').trim();
          searchInput.value = transcript;
          handleSearch(transcript);
        };

        recognition.onerror = function(event) {
          console.error("Speech recognition error:", event.error);
          micBtn.classList.remove('recording');
          isRecording = false;
          
          if (event.error === 'not-allowed') {
            alert("Microphone access denied. If you are opening this file directly (file://), Chrome blocks the microphone. You must run it through a local server (like Live Server or localhost).");
          } else if (event.error === 'network') {
            alert("Network error: Speech recognition requires an internet connection.");
          } else if (event.error === 'no-speech') {
            searchInput.placeholder = "No speech detected. Try again.";
          } else {
            alert("Microphone error: " + event.error);
          }
        };

        recognition.onend = function() {
          micBtn.classList.remove('recording');
          if (searchInput.placeholder === "Listening... (Speak now)") {
            searchInput.placeholder = "Search songs or artists...";
          }
          isRecording = false;
        };

        micBtn.addEventListener('click', (e) => {
          e.preventDefault(); // Stop any bubbling or default actions
          
          if (window.location.protocol === 'file:') {
             alert("Warning: Voice Search will not work if you opened this file directly from your folder (file://). You must use a local server (http://localhost) for Chrome to allow microphone access.");
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
