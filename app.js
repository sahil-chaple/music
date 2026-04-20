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
  let currentActiveView = 'home'; // 'home' or 'library'
  
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
    
    // If searching, always switch to home view to show results
    if (q.length > 0 && currentActiveView !== 'home') {
      switchView('home');
    }
    
    filteredSongs = songs.filter(song => 
      song.title.toLowerCase().includes(q) || 
      song.artist.toLowerCase().includes(q)
    );
    
    renderCards(filteredSongs);
  }

  // --- RENDERING ---
  function renderCards(songsToRender) {
    if (!songsContainer) return;
    
    if (songsToRender.length === 0) {
      songsContainer.innerHTML = '<div style="padding: 20px; color: var(--text-secondary);">No songs found matching your search.</div>';
      return;
    }

    let displaySongs = [...songsToRender];
    
    // If NOT searching, only show Recently Played in the Home container
    if (searchInput.value === '') {
      if (recentlyPlayed.length > 0) {
        displaySongs = recentlyPlayed.map(id => songs.find(s => s.id === id)).filter(Boolean);
      } else {
        songsContainer.innerHTML = `
          <div style="padding: 40px; text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">
            <i class="fas fa-play-circle" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
            <h3>Welcome to StreamWave!</h3>
            <p style="margin-top: 8px;">Your recently played songs will appear here.</p>
            <p>Start exploring albums in your <b>Library</b>.</p>
          </div>`;
        return;
      }
    }

    songsContainer.innerHTML = displaySongs.map(song => `
      <div class="song-card ${songs[currentSongIndex] && songs[currentSongIndex].id === song.id ? 'playing' : ''}" data-song-id="${song.id}">
        <img class="card-cover" src="${song.cover}" alt="${song.title}">
        <div class="card-title">${song.title}</div>
        <div class="card-artist">${song.artist}</div>
      </div>
    `).join('');

    document.querySelectorAll('#songsContainer .song-card').forEach(card => {
      card.addEventListener('click', () => {
        const songId = parseInt(card.dataset.songId);
        const index = songs.findIndex(s => s.id === songId);
        loadSong(index);
        if (!isPlaying) playPause();
      });
    });
  }

  function renderAlbums() {
    if (!albumGrid) return;
    albumGrid.innerHTML = albums.map(album => `
      <div class="song-card" data-album-id="${album.id}">
        <img class="card-cover" src="${album.cover}" alt="${album.title}">
        <div class="card-title">${album.title}</div>
        <div class="card-artist">${album.artist}</div>
      </div>
    `).join('');

    document.querySelectorAll('[data-album-id]').forEach(card => {
      card.addEventListener('click', () => {
        const albumId = parseInt(card.dataset.albumId);
        showAlbumTracks(albumId);
      });
    });
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

    trackList.innerHTML = albumSongs.map((song, index) => `
      <div class="track-item ${songs[currentSongIndex].id === song.id ? 'active' : ''}" data-song-id="${song.id}">
        <div class="track-number">${index + 1}</div>
        <div class="track-details">
          <div class="track-name">${song.title}</div>
          <div class="track-artist">${song.artist}</div>
        </div>
        <div class="track-duration">${song.duration || '0:00'}</div>
      </div>
    `).join('');

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
    renderCards(filteredSongs);
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

  function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) audio.play();
  }

  function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
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

  // --- INITIALIZE ---
  function init() {
    checkAuth();
    renderCards(songs);
    renderAlbums();
    
    // Load state
    const lastIdx = localStorage.getItem('lastPlayedIndex');
    if (lastIdx !== null) loadSong(parseInt(lastIdx));
    else loadSong(0);
    
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

    console.log('🎵 StreamWave App - Fully Loaded');
  }

  init();
})();
