console.log('player script loaded');

const audio = new Audio();
const playerBar = document.getElementById('player-bar');
const playerImage = document.getElementById('player-image');
const playerTrackName = document.getElementById('player-track-name');
const playerTrackArtist = document.getElementById('player-track-artist');
const playerPlay = document.getElementById('player-play');
const playerPrev = document.getElementById('player-prev');
const playerNext = document.getElementById('player-next');
const playerRepeat = document.getElementById('player-repeat');
const playerShuffle = document.getElementById('player-shuffle');
const playerProgress = document.getElementById('player-progress');
const playerTime = document.getElementById('player-time');
const playerDuration = document.getElementById('player-duration');
const playerVolume = document.getElementById('player-volume');
const playerVolumeBtn = document.getElementById('player-volume-btn');
const artistCards = document.querySelectorAll('.artist-card');
const homeBtn = document.getElementById('home-btn');
const homeSection = document.getElementById("home-section");
const aboutSection = document.getElementById("about-section");
const supportSection = document.getElementById("support-section");
const aboutLink = document.getElementById("about-link");
const supportLink = document.getElementById("support-link");
const backHome = document.getElementById("back-home");
const backHome2 = document.getElementById("back-home-2");
const searchInput = document.getElementById("search-input");
const createPlaylistBtn = document.getElementById("create-playlist-btn");
const playlistContainer = document.getElementById("playlist-container");
const artistSection = document.getElementById("artist-section");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebarOverlay = document.getElementById("sidebar-overlay");

let userPlaylists = JSON.parse(localStorage.getItem("userPlaylists")) || [];
let activeSongList = [];
let isEditMode = false;
let activeUserPlaylist = null;

let playlist = [];
let lastVolume = 1;
let currentTrackIndex = -1;

function formatTime(seconds) {
  if (!isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function buildPlaylist() {
  const cards = document.querySelectorAll('.card[data-audio]');
  playlist = [];
  cards.forEach(card => {
    const img = card.querySelector('img');
    if (!img) return;
    const title = card.querySelector('h4')?.textContent || 'Unknown';
    const artist = card.querySelector('p')?.textContent || 'Unknown';
    const audioSrc = card.dataset.audio;
    if (audioSrc) {
      playlist.push({ img, title, artist, audioSrc, card });
    }
  });
  console.log('Playlist built:', playlist.length, 'songs');
  activeSongList = playlist;
}

function loadTrack(index) {
  if (index < 0 || index >= activeSongList.length) return;
  currentTrackIndex = index;
  const track = activeSongList[index];
  audio.src = track.audioSrc;
  playerTrackName.textContent = track.title;
  playerTrackArtist.textContent = track.artist;
  playerImage.src = track.img.src;
  playerBar.classList.remove('hidden');
}

function togglePlay() {
  if (!audio.src) return;
  if (audio.paused) {
    audio.play().catch(e => console.warn('play failed:', e));
  } else {
    audio.pause();
  }
}

buildPlaylist();

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();

  if (query === "") {
    activeSongList = playlist;
    playlist.forEach(song => {
      song.card.style.display = "block";
    });
    return;
  }
 const filtered = playlist.filter(song =>
    song.title.toLowerCase().includes(query) ||
    song.artist.toLowerCase().includes(query)
  );
  activeSongList = filtered;

  playlist.forEach(song => {
    if (filtered.includes(song)) {
      song.card.style.display = "block";
    } else {
      song.card.style.display = "none";
    }
  });
  currentTrackIndex = 0;
});

artistCards.forEach(card => {
  card.addEventListener('click', () => {

    const selectedArtist = card.dataset.artist;

    activeSongList = playlist.filter(song =>
      song.artist.toLowerCase().includes(selectedArtist.toLowerCase())
    );

    document.querySelectorAll('.card').forEach(songCard => {
      if (
        songCard.dataset.artist &&
        songCard.dataset.artist.toLowerCase().includes(selectedArtist.toLowerCase())
      ) {
        songCard.style.display = "block";
      } else {
        songCard.style.display = "none";
      }
    });

    currentTrackIndex = 0;
  });
});

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', (e) => {
    e.stopPropagation();

    const audioSrc = card.dataset.audio;

    const index = activeSongList.findIndex(
      song => song.audioSrc === audioSrc
    );

    if (index === -1) return;

    if (currentTrackIndex === index) {
      togglePlay();
    } else {
      loadTrack(index);
      audio.play().catch(e => console.warn('play failed:', e));
    }
  });
});

playerPlay.addEventListener('click', togglePlay);

playerPrev.addEventListener('click', () => {
  if (activeSongList.length === 0) return;
  const prev = currentTrackIndex > 0 ? currentTrackIndex - 1 : activeSongList.length - 1;
  loadTrack(prev);
  audio.play().catch(e => console.warn('play failed:', e));
});

playerNext.addEventListener('click', () => {
  if (activeSongList.length === 0) return;

  let next;
  if (isShuffleEnabled) {
    next = Math.floor(Math.random() * activeSongList.length);

    if (next === currentTrackIndex && activeSongList.length > 1) {
      next = (next + 1) % activeSongList.length;
    }
  } else {
    next = (currentTrackIndex + 1) % activeSongList.length;
  }

  loadTrack(next);
  audio.play().catch(e => console.warn('play failed:', e));
});


playerProgress.addEventListener('input', () => {
  audio.currentTime = Number(playerProgress.value);
});

audio.addEventListener('loadedmetadata', () => {
  playerProgress.max = audio.duration;
  playerDuration.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  playerProgress.value = audio.currentTime;
  playerTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('play', () => {
  const playIcon = playerPlay.querySelector('.icon-play');
  const pauseIcon = playerPlay.querySelector('.icon-pause');
  if (playIcon) playIcon.classList.add('hidden');
  if (pauseIcon) pauseIcon.classList.remove('hidden');
  playerPlay.setAttribute('aria-label', 'Pause');
});

audio.addEventListener('pause', () => {
  const playIcon = playerPlay.querySelector('.icon-play');
  const pauseIcon = playerPlay.querySelector('.icon-pause');
  if (playIcon) playIcon.classList.remove('hidden');
  if (pauseIcon) pauseIcon.classList.add('hidden');
  playerPlay.setAttribute('aria-label', 'Play');
});

let isRepeatEnabled = false;

playerRepeat.addEventListener('click', () => {
  isRepeatEnabled = !isRepeatEnabled;
  if (isRepeatEnabled) {
    isShuffleEnabled = false;
    playerShuffle.classList.remove('control-active');
  }
  audio.loop = isRepeatEnabled;
  playerRepeat.classList.toggle('control-active', isRepeatEnabled);
});

audio.addEventListener('ended', () => {
  if (activeSongList.length === 0 || currentTrackIndex === -1) return;

  let next;
  if (isShuffleEnabled) {
    next = Math.floor(Math.random() * activeSongList.length);

    if (next === currentTrackIndex && activeSongList.length > 1) {
      next = (next + 1) % activeSongList.length;
    }
  } else {
    next = (currentTrackIndex + 1) % activeSongList.length;
  }

  loadTrack(next);
  audio.play();
});

let isShuffleEnabled = false;

playerShuffle.addEventListener('click', () => {
  isShuffleEnabled = !isShuffleEnabled;
  if (isShuffleEnabled) {
    isRepeatEnabled = false;
    audio.loop = false;
    playerRepeat.classList.remove('control-active');
  }
  playerShuffle.classList.toggle('control-active', isShuffleEnabled);
});

const playerVolumeIcon = document.getElementById('player-volume-icon');

function updateVolumeIcon(volume) {
  if (volume == 0) {
    playerVolumeIcon.src = "src/assets/svgs/volume-mute.svg";
  } else if (volume < 0.5) {
    playerVolumeIcon.src = "src/assets/svgs/volume-low.svg";
  } else {
    playerVolumeIcon.src = "src/assets/svgs/volume-high.svg";
  }
}

playerVolume.addEventListener('input', () => {
  audio.volume = playerVolume.value;
  updateVolumeIcon(audio.volume);
});

playerVolumeBtn.addEventListener('click', () => {
  if (audio.volume > 0) {
    lastVolume = audio.volume;
    audio.volume = 0;
    playerVolume.value = 0;
  } else {
    audio.volume = lastVolume || 1;
    playerVolume.value = audio.volume;
  }

  updateVolumeIcon(audio.volume);
});

homeBtn.addEventListener('click', () => {
  activeSongList = playlist;
  activeUserPlaylist = null;
  isEditMode = false;
  currentTrackIndex = -1;

  document.getElementById("section-heading").textContent = "Popular artists";

  artistSection.classList.remove("hidden");

  document.querySelectorAll('.card').forEach(card => {
    card.style.display = "block";

  const addBtn = card.querySelector(".add-to-playlist");
  if (addBtn) addBtn.classList.add("hidden");
});

  renderPlaylists();
});

aboutLink.addEventListener("click", () => {
  homeSection.classList.add("hidden");
  aboutSection.classList.remove("hidden");
});

supportLink.addEventListener("click", () => {
  homeSection.classList.add("hidden");
  supportSection.classList.remove("hidden");
});

function goHome() {
  aboutSection.classList.add("hidden");
  supportSection.classList.add("hidden");
  homeSection.classList.remove("hidden");
}

backHome.addEventListener("click", goHome);
backHome2.addEventListener("click", goHome);

createPlaylistBtn.addEventListener("click", () => {
  const name = prompt("Enter playlist name:");
  if (!name) return;

  const newPlaylist = {
    id: Date.now(),
    name,
    songs: []
  };

  userPlaylists.push(newPlaylist);
  savePlaylists();
  renderPlaylists();
});

function renderPlaylists() {
  playlistContainer.innerHTML = "";

  userPlaylists.forEach(pl => {
    const div = document.createElement("div");

    const isActive = activeUserPlaylist && activeUserPlaylist.id === pl.id;

    div.className = `
      flex justify-between items-center 
      p-3 rounded-lg cursor-pointer transition
      ${isActive 
        ? "bg-red-600 text-white shadow-lg" 
        : "bg-white/10 backdrop-blur-md hover:bg-white/20"}
    `;

    div.innerHTML = `
    <span>${pl.name}</span>
    <div class="flex items-center gap-2">
      <button class="h-8 edit-playlist  text-sm ">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#ffffff" d="M3 6v2h11V6H3m0 4v2h11v-2H3m17 .1c-.1 0-.3.1-.4.2l-1 1l2.1 2.1l1-1c.2-.2.2-.6 0-.8l-1.3-1.3c-.1-.1-.2-.2-.4-.2m-1.9 1.8l-6.1 6V20h2.1l6.1-6.1l-2.1-2M3 14v2h7v-2H3Z"/></svg>
      </button>
      <button class="delete-playlist text-sm">✕</button>
    </div>
  `;

    div.addEventListener("click", () => {
      activeUserPlaylist = pl;
      isEditMode = false; 
      showUserPlaylist(pl);
      renderPlaylists();
    });

    div.querySelector(".edit-playlist").addEventListener("click", (e) => {
  e.stopPropagation();

  if (activeUserPlaylist && activeUserPlaylist.id === pl.id && isEditMode) {

    const newName = prompt("Rename playlist:", pl.name);

    if (newName && newName.trim() !== "") {
      pl.name = newName.trim();
      savePlaylists();
      renderPlaylists();
      document.getElementById("section-heading").textContent = pl.name;
    }

  } else {
    activeUserPlaylist = pl;
    isEditMode = true;
    showUserPlaylist(pl);
    renderPlaylists();
  }
});

    div.querySelector(".delete-playlist").addEventListener("click", (e) => {
      e.stopPropagation();
      userPlaylists = userPlaylists.filter(p => p.id !== pl.id);
      savePlaylists();
      activeUserPlaylist = null;
      renderPlaylists();
    });

    playlistContainer.appendChild(div);
  });
}  

function showUserPlaylist(pl) {
  artistSection.classList.add("hidden");
  activeUserPlaylist = pl;
  document.getElementById("section-heading").textContent = pl.name;

  if (isEditMode) {
    activeSongList = playlist;

    document.querySelectorAll(".card").forEach(card => {
      card.style.display = "block";

      const audioSrc = card.dataset.audio;
      const addBtn = card.querySelector(".add-to-playlist");

      addBtn.classList.remove("hidden"); 

      if (pl.songs.includes(audioSrc)) {
        addBtn.textContent = "✓";
      } else {
        addBtn.textContent = "+";
      }
    });

  } else {
    activeSongList = playlist.filter(song =>
      pl.songs.includes(song.audioSrc)
    );

    document.querySelectorAll(".card").forEach(card => {
      card.style.display = "none";

      const addBtn = card.querySelector(".add-to-playlist");
      addBtn.classList.add("hidden"); 
    });

    activeSongList.forEach(song => {
      song.card.style.display = "block";
    });
  }
  currentTrackIndex = -1;
}

document.querySelectorAll(".add-to-playlist").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!activeUserPlaylist || !isEditMode) {
      alert("Click ✏ to edit playlist!");
      return;
    }

    const card = btn.closest(".card");
    const audioSrc = card.dataset.audio;

    if (activeUserPlaylist.songs.includes(audioSrc)) {
      activeUserPlaylist.songs = activeUserPlaylist.songs.filter(
        song => song !== audioSrc
      );
      btn.textContent = "+";
      btn.classList.remove("bg-green-600");
    } else {
      activeUserPlaylist.songs.push(audioSrc);
      btn.textContent = "✓";
      btn.classList.add("bg-green-600");
    }

    savePlaylists();
  });
});

function savePlaylists() {
  localStorage.setItem("userPlaylists", JSON.stringify(userPlaylists));
}
renderPlaylists();

// Open sidebar
sidebarToggle.addEventListener("click", () => {
  sidebar.classList.remove("-translate-x-full");
  sidebarOverlay.classList.remove("hidden");
});

// Close when clicking overlay
sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.add("-translate-x-full");
  sidebarOverlay.classList.add("hidden");
});