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

let lastVolume = 1;
let playlist = [];
let currentTrackIndex = -1;

function formatTime(seconds) {
  if (!isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// Collect all cards with song data from images
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
}

function formatSongName(name) {
  return name.replace(/\\.mp3$/i, '').replace(/songs\\//i, '').substring(0, 40);
}

function loadTrack(index) {
  if (index < 0 || index >= playlist.length) return;
  currentTrackIndex = index;
  const track = playlist[index];
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

// Click handler for song cards
buildPlaylist();
playlist.forEach((track, idx) => {
  track.card.style.cursor = 'pointer';
  track.card.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('Card clicked:', idx, track.title);
    // If clicking same track, toggle play
    if (currentTrackIndex === idx) {
      togglePlay();
    } else {
      loadTrack(idx);
      audio.play().catch(e => console.warn('play failed:', e));
    }
  });
});

// Player controls
playerPlay.addEventListener('click', togglePlay);

playerPrev.addEventListener('click', () => {
  if (playlist.length === 0) return;
  const prev = currentTrackIndex > 0 ? currentTrackIndex - 1 : playlist.length - 1;
  loadTrack(prev);
  audio.play().catch(e => console.warn('play failed:', e));
});

playerNext.addEventListener('click', () => {
  if (playlist.length === 0) return;
  const next = (currentTrackIndex + 1) % playlist.length;
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
  if (playlist.length === 0 || currentTrackIndex === -1) return;

  const next = (currentTrackIndex + 1) % playlist.length;
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

