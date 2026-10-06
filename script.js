const audio = document.querySelector("#audio");
const player = document.querySelector(".player");
const playButton = document.querySelector("#play-toggle");
const seek = document.querySelector("#seek");
const elapsed = document.querySelector("#elapsed");
const duration = document.querySelector("#duration");
const status = document.querySelector("#player-status");

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "--:--";
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function updateProgress() {
  const hasDuration = Number.isFinite(audio.duration) && audio.duration > 0;
  const progress = hasDuration ? (audio.currentTime / audio.duration) * 100 : 0;

  seek.value = String(Math.round(progress * 10));
  seek.style.setProperty("--progress", `${progress}%`);
  elapsed.textContent = formatTime(audio.currentTime);
  duration.textContent = formatTime(audio.duration);
  seek.disabled = !hasDuration;
}

function updatePlaybackState() {
  const isPlaying = !audio.paused && !audio.ended;

  playButton.setAttribute("aria-pressed", String(isPlaying));
  playButton.setAttribute("aria-label", isPlaying ? "Pausar" : "Reproducir");
  player.classList.toggle("is-playing", isPlaying);
}

playButton.addEventListener("click", async () => {
  status.textContent = "";

  if (audio.paused) {
    if (audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      status.textContent = "Este navegador no puede reproducir el formato de este archivo.";
      return;
    }

    try {
      await audio.play();
      if (audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
        audio.pause();
        status.textContent = "Este navegador no puede reproducir el formato de este archivo.";
      }
    } catch {
      status.textContent = "No se pudo iniciar la canción. Comprueba que el audio sea compatible y esté disponible.";
      updatePlaybackState();
    }
  } else {
    audio.pause();
  }
});

audio.addEventListener("loadedmetadata", updateProgress);
audio.addEventListener("durationchange", updateProgress);
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("play", updatePlaybackState);
audio.addEventListener("pause", updatePlaybackState);

audio.addEventListener("ended", () => {
  audio.currentTime = 0;
  updateProgress();
  updatePlaybackState();
});

audio.addEventListener("error", () => {
  status.textContent = "No se pudo cargar o decodificar la canción. Comprueba que el audio sea compatible y esté disponible.";
  seek.disabled = true;
  duration.textContent = "--:--";
  updatePlaybackState();
});

seek.addEventListener("input", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
    updateProgress();
  }
});

updateProgress();
updatePlaybackState();
