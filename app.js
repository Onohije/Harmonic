// Harmonic Music Catalog - Core Logic

// State
let tracksList = [];
let currentPlaylist = []; // Track context for the player (results or favorites)
let favoritesList = JSON.parse(localStorage.getItem('harmonic_favorites')) || [];
let currentTrackIndex = -1;
let isPlaying = false;
let isLooping = false;
let activeView = 'explore-view';
let debouncerTimeout = null;

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchClearBtn = document.getElementById('search-clear-btn');
const limitSelect = document.getElementById('limit-select');
const explicitSelect = document.getElementById('explicit-select');
const filterToggleBtn = document.getElementById('filter-toggle-btn');
const filterDropdown = document.getElementById('filter-dropdown');
const themeBtn = document.getElementById('theme-btn');

const exploreView = document.getElementById('explore-view');
const favoritesView = document.getElementById('favorites-view');
const navItems = document.querySelectorAll('.nav-item');

const catalogTitle = document.getElementById('catalog-title');
const resultsCount = document.getElementById('results-count');
const musicGrid = document.getElementById('music-grid');
const favoritesGrid = document.getElementById('favorites-grid');

const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const retryBtn = document.getElementById('retry-btn');
const emptyState = document.getElementById('empty-state');
const favEmptyState = document.getElementById('fav-empty-state');
const exploreJumpBtn = document.getElementById('explore-jump-btn');

// Player Elements
const nativeAudio = document.getElementById('native-audio');
const playerBar = document.getElementById('player-bar');
const playerArt = document.getElementById('player-art');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const playerFavBtn = document.getElementById('player-fav-btn');
const playerPlay = document.getElementById('player-play');
const playerPrev = document.getElementById('player-prev');
const playerNext = document.getElementById('player-next');
const playerLoop = document.getElementById('player-loop');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const timelineProgressBg = document.getElementById('timeline-progress-bg');
const timelineProgress = document.getElementById('timeline-progress');
const timelineHandle = document.getElementById('timeline-handle');
const playerMute = document.getElementById('player-mute');
const volumeSlider = document.getElementById('volume-slider');
const playerInfo = document.getElementById('player-info');
const playerClose = document.getElementById('player-close');
const miniEqualizer = document.querySelector('.mini-equalizer');

// Modal Elements
const detailsModal = document.getElementById('details-modal');
const modalClose = document.getElementById('modal-close');
const modalArtwork = document.getElementById('modal-artwork');
const modalGenre = document.getElementById('modal-genre');
const modalExplicit = document.getElementById('modal-explicit');
const modalTitle = document.getElementById('modal-title');
const modalArtist = document.getElementById('modal-artist');
const modalAlbum = document.getElementById('modal-album');
const modalDate = document.getElementById('modal-date');
const modalDuration = document.getElementById('modal-duration');
const modalPrice = document.getElementById('modal-price');
const modalPlayBtn = document.getElementById('modal-play-btn');
const modalActionPlay = document.getElementById('modal-action-play');
const modalActionFav = document.getElementById('modal-action-fav');
const modalActionStore = document.getElementById('modal-action-store');
const modalAlbumTracksList = document.getElementById('modal-album-tracks-list');
const modalLoadingTracks = document.getElementById('modal-loading-tracks');

// Cache track detailed data for modal play operations
let activeModalTrack = null;

// Initial Load
window.addEventListener('DOMContentLoaded', () => {
  init();
});

// Initialization
function init() {
  // Theme Setup
  themeInit();
  
  // Render favorites if any exist
  renderFavorites();
  
  // Set initial search results
  fetchTracks('Daft Punk');
  
  // Register all Event Listeners
  setupEventListeners();
}

// Themes
function themeInit() {
  const savedTheme = localStorage.getItem('harmonic_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('harmonic_theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  themeBtn.innerHTML = theme === 'light' ? "<i class='bx bx-moon'></i>" : "<i class='bx bx-sun'></i>";
}

// Event Listeners Registration
function setupEventListeners() {
  // Theme button
  themeBtn.addEventListener('click', toggleTheme);
  
  // Navigation tabs
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-target');
      switchView(target);
    });
  });
  
  // Search input debouncer
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val) {
      searchClearBtn.classList.remove('hidden');
    } else {
      searchClearBtn.classList.add('hidden');
    }
    
    clearTimeout(debouncerTimeout);
    debouncerTimeout = setTimeout(() => {
      if (val.length >= 2) {
        fetchTracks(val);
      } else if (val.length === 0) {
        fetchTracks('Daft Punk'); // Fallback to home trending
      }
    }, 450);
  });
  
  // Clear search input
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.classList.add('hidden');
    fetchTracks('Daft Punk');
  });
  
  // Filters dropdown toggles
  filterToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    filterDropdown.classList.toggle('hidden');
  });
  
  document.addEventListener('click', (e) => {
    if (!filterDropdown.classList.contains('hidden') && !filterDropdown.contains(e.target) && e.target !== filterToggleBtn) {
      filterDropdown.classList.add('hidden');
    }
  });
  
  // Select limits or explicit filters trigger searches
  limitSelect.addEventListener('change', () => {
    const val = searchInput.value.trim() || 'Daft Punk';
    fetchTracks(val);
  });
  
  explicitSelect.addEventListener('change', () => {
    const val = searchInput.value.trim() || 'Daft Punk';
    fetchTracks(val);
  });
  
  // Retry fetch button
  retryBtn.addEventListener('click', () => {
    const val = searchInput.value.trim() || 'Daft Punk';
    fetchTracks(val);
  });
  
  // Empty favorites explorer helper button
  exploreJumpBtn.addEventListener('click', () => {
    switchView('explore-view');
  });
  
  // Quick Search Tags
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');
      searchInput.value = q;
      searchClearBtn.classList.remove('hidden');
      fetchTracks(q);
    });
  });

  // Audio Native controls handlers
  nativeAudio.addEventListener('timeupdate', updateProgress);
  nativeAudio.addEventListener('ended', handleTrackEnded);
  nativeAudio.addEventListener('loadedmetadata', () => {
    timeTotal.textContent = formatDuration(nativeAudio.duration);
  });
  
  // Custom Player Event Listeners
  playerPlay.addEventListener('click', togglePlay);
  playerPrev.addEventListener('click', playPreviousTrack);
  playerNext.addEventListener('click', playNextTrack);
  
  playerLoop.addEventListener('click', () => {
    isLooping = !isLooping;
    playerLoop.classList.toggle('active', isLooping);
  });
  
  playerFavBtn.addEventListener('click', () => {
    if (currentTrackIndex !== -1 && currentPlaylist[currentTrackIndex]) {
      toggleFavorite(currentPlaylist[currentTrackIndex]);
    }
  });

  // Volume operations
  volumeSlider.addEventListener('input', (e) => {
    setVolume(e.target.value);
  });
  
  playerMute.addEventListener('click', toggleMute);
  
  // Timeline clicks and drags
  timelineProgressBg.addEventListener('click', seekProgress);
  
  let isDraggingTimeline = false;
  
  timelineProgressBg.addEventListener('mousedown', () => { isDraggingTimeline = true; });
  document.addEventListener('mouseup', () => { isDraggingTimeline = false; });
  document.addEventListener('mousemove', (e) => {
    if (isDraggingTimeline) seekProgress(e);
  });

  // Modal Actions
  modalClose.addEventListener('click', closeDetails);
  detailsModal.addEventListener('click', (e) => {
    if (e.target === detailsModal) closeDetails();
  });
  
  // Play button on modal art & primary actions
  modalPlayBtn.addEventListener('click', playModalTrack);
  modalActionPlay.addEventListener('click', playModalTrack);
  modalActionFav.addEventListener('click', () => {
    if (activeModalTrack) {
      toggleFavorite(activeModalTrack);
      updateModalFavoriteButtonState();
    }
  });
  
  // Floating detail viewer button
  playerInfo.addEventListener('click', () => {
    if (currentTrackIndex !== -1 && currentPlaylist[currentTrackIndex]) {
      openDetailsModal(currentPlaylist[currentTrackIndex]);
    }
  });
  
  // Collapse/Hide Player
  playerClose.addEventListener('click', () => {
    playerBar.classList.add('collapsed');
    nativeAudio.pause();
    isPlaying = false;
    updatePlayerPlayState();
    removeActiveCardHighlights();
  });
}

// Tab Switching
function switchView(viewId) {
  activeView = viewId;
  
  // Toggle nav classes
  navItems.forEach(item => {
    if (item.getAttribute('data-target') === viewId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Toggle sections
  if (viewId === 'explore-view') {
    exploreView.classList.remove('hidden');
    favoritesView.classList.add('hidden');
  } else {
    exploreView.classList.add('hidden');
    favoritesView.classList.remove('hidden');
    renderFavorites();
  }
}

// Fetch tracks from iTunes Search API
async function fetchTracks(query) {
  showLoading(true);
  hideError();
  hideEmpty();
  
  const limit = limitSelect.value;
  const explicit = explicitSelect.value;
  
  catalogTitle.textContent = query === 'Daft Punk' ? 'Popular Tracks' : `Search Results for "${query}"`;
  
  // iTunes Search URL construction
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=${limit}&explicit=${explicit === 'Yes' ? 'yes' : 'no'}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Search failed to fetch from network.');
    const data = await res.json();
    
    tracksList = data.results || [];
    
    showLoading(false);
    
    if (tracksList.length === 0) {
      showEmpty();
      resultsCount.textContent = '0 matches';
    } else {
      resultsCount.textContent = `${tracksList.length} tracks found`;
      renderTracks(tracksList, 'music-grid');
    }
    
  } catch (err) {
    console.error(err);
    showLoading(false);
    showError(err.message || 'Unable to load catalog. Check your connection.');
  }
}

// Render dynamic track cards to target container
function renderTracks(tracks, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  tracks.forEach((track, index) => {
    const isSaved = isFavorite(track.trackId);
    
    // Check if this track is the one currently active in the player
    const isCurrent = currentPlaylist[currentTrackIndex] && currentPlaylist[currentTrackIndex].trackId === track.trackId;
    const activeClass = isCurrent ? 'playing-card' : '';
    
    // High-res cover image replacement
    const highResArt = getHighResArtwork(track.artworkUrl100);
    
    const card = document.createElement('div');
    card.className = `music-card ${activeClass}`;
    card.setAttribute('data-id', track.trackId);
    
    card.innerHTML = `
      <div class="card-artwork-wrapper">
        <img class="card-artwork" src="${highResArt}" alt="${track.trackName} Cover" loading="lazy">
        <div class="card-overlay">
          <button class="play-circle-btn" aria-label="Play preview">
            <i class="bx ${isCurrent && isPlaying ? 'bx-pause' : 'bx-play'}"></i>
          </button>
        </div>
      </div>
      <div class="card-metadata">
        <h4 class="card-title" title="${track.trackName}">${track.trackName}</h4>
        <span class="card-artist" title="${track.artistName}">${track.artistName}</span>
        <span class="card-album" title="${track.collectionName || 'Single'}">${track.collectionName || 'Single'}</span>
      </div>
      <div class="card-actions">
        <span class="card-genre">${track.primaryGenreName || 'Music'}</span>
        <div class="card-icons">
          <button class="card-btn fav-btn ${isSaved ? 'favorited' : ''}" aria-label="Favorite">
            <i class="bx ${isSaved ? 'bxs-heart' : 'bx-heart'}"></i>
          </button>
          <button class="card-btn info-btn" aria-label="Details">
            <i class="bx bx-info-circle"></i>
          </button>
        </div>
      </div>
    `;
    
    // Setup Card Actions Listeners
    // 1. Play overlay button
    const playOverlay = card.querySelector('.play-circle-btn');
    playOverlay.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCardPlayClick(track, index, tracks);
    });
    
    // 2. Favorite button click
    const favBtn = card.querySelector('.fav-btn');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(track);
      // Toggle CSS visual state locally
      const saved = isFavorite(track.trackId);
      favBtn.classList.toggle('favorited', saved);
      favBtn.querySelector('i').className = saved ? 'bx bxs-heart' : 'bx bx-heart';
    });
    
    // 3. Info Details click
    const infoBtn = card.querySelector('.info-btn');
    infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDetailsModal(track);
    });
    
    // 4. Click whole card triggers details
    card.addEventListener('click', () => {
      openDetailsModal(track);
    });
    
    container.appendChild(card);
  });
}

// Render My Favorites View
function renderFavorites() {
  if (favoritesList.length === 0) {
    favEmptyState.classList.remove('hidden');
    favoritesGrid.classList.add('hidden');
  } else {
    favEmptyState.classList.add('hidden');
    favoritesGrid.classList.remove('hidden');
    renderTracks(favoritesList, 'favorites-grid');
  }
}

// Play Card Operation logic
function handleCardPlayClick(track, index, playlistContext) {
  // If clicking currently active track, toggle play/pause status
  if (currentPlaylist[currentTrackIndex] && currentPlaylist[currentTrackIndex].trackId === track.trackId) {
    togglePlay();
  } else {
    // Determine the playlist structure (Search Results or Favorites list)
    currentPlaylist = [...playlistContext];
    // Find index in selected playlist context
    currentTrackIndex = currentPlaylist.findIndex(t => t.trackId === track.trackId);
    playTrack(currentPlaylist[currentTrackIndex]);
  }
}

// Setup play execution
function playTrack(track) {
  if (!track || !track.previewUrl) return;
  
  nativeAudio.src = track.previewUrl;
  nativeAudio.load();
  nativeAudio.play()
    .then(() => {
      isPlaying = true;
      updatePlayerUI(track);
      updatePlayerPlayState();
    })
    .catch(err => {
      console.error("Audio playback error: ", err);
      isPlaying = false;
      updatePlayerPlayState();
    });
}

// Sync player user interface with current playing track data
function updatePlayerUI(track) {
  playerBar.classList.remove('collapsed');
  
  playerArt.src = getHighResArtwork(track.artworkUrl100);
  playerTitle.textContent = track.trackName;
  playerTitle.title = track.trackName;
  playerArtist.textContent = track.artistName;
  playerArtist.title = track.artistName;
  
  // Set favorite state in player controls
  const isSaved = isFavorite(track.trackId);
  playerFavBtn.classList.toggle('favorited', isSaved);
  playerFavBtn.querySelector('i').className = isSaved ? 'bx bxs-heart' : 'bx bx-heart';
  
  // Visual active highlights sync across card elements
  removeActiveCardHighlights();
  
  const activeCards = document.querySelectorAll(`.music-card[data-id="${track.trackId}"]`);
  activeCards.forEach(card => {
    card.classList.add('playing-card');
    const btn = card.querySelector('.play-circle-btn i');
    if (btn) btn.className = 'bx bx-pause';
  });
}

// Play Pause control trigger
function togglePlay() {
  if (currentTrackIndex === -1) return;
  
  if (isPlaying) {
    nativeAudio.pause();
    isPlaying = false;
  } else {
    nativeAudio.play();
    isPlaying = true;
  }
  
  updatePlayerPlayState();
}

function updatePlayerPlayState() {
  // Update floating control button
  playerPlay.innerHTML = isPlaying ? "<i class='bx bx-pause'></i>" : "<i class='bx bx-play'></i>";
  
  // Equalizer visual animation trigger
  if (isPlaying) {
    miniEqualizer.classList.remove('hidden');
  } else {
    miniEqualizer.classList.add('hidden');
  }
  
  // Update icons on relevant active grid cards
  if (currentPlaylist[currentTrackIndex]) {
    const activeId = currentPlaylist[currentTrackIndex].trackId;
    const cards = document.querySelectorAll(`.music-card`);
    cards.forEach(card => {
      const isCurrent = card.getAttribute('data-id') == activeId;
      const playIcon = card.querySelector('.play-circle-btn i');
      if (playIcon) {
        if (isCurrent) {
          playIcon.className = isPlaying ? 'bx bx-pause' : 'bx bx-play';
        } else {
          playIcon.className = 'bx bx-play';
        }
      }
    });
  }
}

// Skip Playback Controls
function playPreviousTrack() {
  if (currentPlaylist.length === 0 || currentTrackIndex === -1) return;
  
  currentTrackIndex--;
  if (currentTrackIndex < 0) {
    currentTrackIndex = currentPlaylist.length - 1; // Wrap around to end
  }
  playTrack(currentPlaylist[currentTrackIndex]);
}

function playNextTrack() {
  if (currentPlaylist.length === 0 || currentTrackIndex === -1) return;
  
  currentTrackIndex++;
  if (currentTrackIndex >= currentPlaylist.length) {
    currentTrackIndex = 0; // Wrap around to start
  }
  playTrack(currentPlaylist[currentTrackIndex]);
}

function handleTrackEnded() {
  if (isLooping) {
    nativeAudio.currentTime = 0;
    nativeAudio.play();
  } else {
    playNextTrack();
  }
}

// Audio timeline updates
function updateProgress() {
  const current = nativeAudio.currentTime;
  const duration = nativeAudio.duration;
  
  if (isNaN(duration)) return;
  
  timeCurrent.textContent = formatDuration(current);
  
  const percentage = (current / duration) * 100;
  timelineProgress.style.width = `${percentage}%`;
  timelineHandle.style.left = `${percentage}%`;
}

function seekProgress(e) {
  if (currentTrackIndex === -1 || isNaN(nativeAudio.duration)) return;
  
  const rect = timelineProgressBg.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const totalWidth = rect.width;
  
  let percentage = clickX / totalWidth;
  if (percentage < 0) percentage = 0;
  if (percentage > 1) percentage = 1;
  
  nativeAudio.currentTime = percentage * nativeAudio.duration;
  updateProgress();
}

// Volume levels operations
function setVolume(val) {
  nativeAudio.volume = val;
  volumeSlider.value = val;
  
  // Icon update based on values
  if (val == 0) {
    playerMute.innerHTML = "<i class='bx bx-volume-mute'></i>";
  } else if (val < 0.4) {
    playerMute.innerHTML = "<i class='bx bx-volume'></i>";
  } else if (val < 0.75) {
    playerMute.innerHTML = "<i class='bx bx-volume-low'></i>";
  } else {
    playerMute.innerHTML = "<i class='bx bx-volume-full'></i>";
  }
}

let lastVolume = 0.75;
function toggleMute() {
  if (nativeAudio.volume > 0) {
    lastVolume = nativeAudio.volume;
    setVolume(0);
  } else {
    setVolume(lastVolume);
  }
}

// Favorites management & LocalStorage bindings
function isFavorite(trackId) {
  return favoritesList.some(item => item.trackId === trackId);
}

function toggleFavorite(track) {
  const index = favoritesList.findIndex(item => item.trackId === track.trackId);
  
  if (index === -1) {
    // Add to library list
    favoritesList.push(track);
  } else {
    // Remove
    favoritesList.splice(index, 1);
  }
  
  localStorage.setItem('harmonic_favorites', JSON.stringify(favoritesList));
  
  // Redraw active views if we are browsing My Library view
  if (activeView === 'favorites-view') {
    renderFavorites();
  }
  
  // Sync the current playing controls heart status
  if (currentPlaylist[currentTrackIndex] && currentPlaylist[currentTrackIndex].trackId === track.trackId) {
    const isSaved = isFavorite(track.trackId);
    playerFavBtn.classList.toggle('favorited', isSaved);
    playerFavBtn.querySelector('i').className = isSaved ? 'bx bxs-heart' : 'bx bx-heart';
  }
  
  // Sync global cards
  syncCardHearts(track.trackId);
}

function syncCardHearts(trackId) {
  const isSaved = isFavorite(trackId);
  const cards = document.querySelectorAll(`.music-card[data-id="${trackId}"]`);
  cards.forEach(card => {
    const favBtn = card.querySelector('.fav-btn');
    if (favBtn) {
      favBtn.classList.toggle('favorited', isSaved);
      favBtn.querySelector('i').className = isSaved ? 'bx bxs-heart' : 'bx bx-heart';
    }
  });
}

// Modal View actions
async function openDetailsModal(track) {
  activeModalTrack = track;
  
  // UI setups
  modalArtwork.src = getHighResArtwork(track.artworkUrl100);
  modalTitle.textContent = track.trackName;
  modalArtist.textContent = track.artistName;
  modalAlbum.textContent = track.collectionName || 'Single';
  
  modalGenre.textContent = track.primaryGenreName || 'Music';
  
  // Explicit tag display details
  if (track.trackExplicitness === 'explicit') {
    modalExplicit.classList.remove('hidden');
  } else {
    modalExplicit.classList.add('hidden');
  }
  
  // Formatted date
  if (track.releaseDate) {
    const dateObj = new Date(track.releaseDate);
    modalDate.textContent = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } else {
    modalDate.textContent = 'Unknown';
  }
  
  modalDuration.textContent = formatDuration(track.trackTimeMillis / 1000);
  
  // Setup Price formats
  if (track.trackPrice && track.trackPrice > 0) {
    modalPrice.textContent = `$${track.trackPrice}`;
  } else if (track.collectionPrice && track.collectionPrice > 0) {
    modalPrice.textContent = `$${track.collectionPrice} (Album Only)`;
  } else {
    modalPrice.textContent = 'Free/Subscription';
  }
  
  // Store link setup
  modalActionStore.href = track.trackViewUrl || '#';
  
  updateModalFavoriteButtonState();
  
  // Trigger secondary fetch for tracks list in the album
  if (track.collectionId) {
    fetchAlbumTracks(track.collectionId);
  } else {
    modalAlbumTracksList.innerHTML = `<li class="album-track-item">Single Track Release</li>`;
  }
  
  // Trigger overlay visibility styling
  detailsModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Stop background scrolls
}

function closeDetails() {
  detailsModal.classList.add('hidden');
  document.body.style.overflow = '';
}

// Modal Operation: Play active modal target
function playModalTrack() {
  if (!activeModalTrack) return;
  
  // Inject this track to the player queue
  // If track already in explorer view or favorites, sync appropriately
  const idxInTracks = tracksList.findIndex(t => t.trackId === activeModalTrack.trackId);
  
  if (idxInTracks !== -1) {
    currentPlaylist = [...tracksList];
    currentTrackIndex = idxInTracks;
  } else {
    // Fallback standalone injection
    currentPlaylist = [activeModalTrack];
    currentTrackIndex = 0;
  }
  
  playTrack(activeModalTrack);
}

// Secondary Fetch: Get all tracks belonging to the Album
async function fetchAlbumTracks(collectionId) {
  modalLoadingTracks.classList.remove('hidden');
  modalAlbumTracksList.innerHTML = '';
  
  const lookupUrl = `https://itunes.apple.com/lookup?id=${collectionId}&entity=song`;
  
  try {
    const res = await fetch(lookupUrl);
    if (!res.ok) throw new Error();
    const data = await res.json();
    
    modalLoadingTracks.classList.add('hidden');
    
    // Filter out the collection meta object, keep only tracks
    const albumSongs = data.results.filter(item => item.wrapperType === 'track');
    
    if (albumSongs.length === 0) {
      modalAlbumTracksList.innerHTML = `<li class="album-track-item">Single Track</li>`;
      return;
    }
    
    albumSongs.forEach(song => {
      const isCurrentInPlayer = currentPlaylist[currentTrackIndex] && currentPlaylist[currentTrackIndex].trackId === song.trackId;
      const isCurrentPlaying = isCurrentInPlayer && isPlaying;
      const highlightClass = isCurrentInPlayer ? 'current-modal-track' : '';
      
      const li = document.createElement('li');
      li.className = `album-track-item ${highlightClass}`;
      li.innerHTML = `
        <div class="track-item-left">
          <span class="track-item-num">${song.trackNumber || '-'}</span>
          <i class="bx ${isCurrentPlaying ? 'bx-volume-low' : 'bx-play'}"></i>
          <span class="track-item-title">${song.trackName}</span>
        </div>
        <span class="track-item-time">${formatDuration(song.trackTimeMillis / 1000)}</span>
      `;
      
      li.addEventListener('click', () => {
        // Build playlist queue around this album!
        currentPlaylist = albumSongs;
        currentTrackIndex = albumSongs.findIndex(t => t.trackId === song.trackId);
        playTrack(song);
        
        // Redraw lists highlights inside modal
        document.querySelectorAll('.album-track-item').forEach(el => el.classList.remove('current-modal-track'));
        li.classList.add('current-modal-track');
      });
      
      modalAlbumTracksList.appendChild(li);
    });
    
  } catch (err) {
    modalLoadingTracks.classList.add('hidden');
    modalAlbumTracksList.innerHTML = `<li class="album-track-item">Failed to load album tracks.</li>`;
  }
}

// Utility: Toggle favorite button state in details modal
function updateModalFavoriteButtonState() {
  if (!activeModalTrack) return;
  const saved = isFavorite(activeModalTrack.trackId);
  modalActionFav.innerHTML = saved ? "<i class='bx bxs-heart'></i> Remove Favorite" : "<i class='bx bx-heart'></i> Add to Favorites";
}

// Utility: Clean active card styles
function removeActiveCardHighlights() {
  const cards = document.querySelectorAll('.music-card');
  cards.forEach(card => {
    card.classList.remove('playing-card');
    const playIcon = card.querySelector('.play-circle-btn i');
    if (playIcon) playIcon.className = 'bx bx-play';
  });
}

// Utility: Formatting numbers of seconds into M:SS durations
function formatDuration(sec) {
  if (isNaN(sec) || sec === Infinity) return '0:00';
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Utility: Fetch 600x600 Cover Art from default iTunes 100x100 source link
function getHighResArtwork(url) {
  if (!url) return '';
  return url.replace('100x100bb.jpg', '600x600bb.jpg');
}
