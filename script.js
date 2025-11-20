// Simple configuration for your clips.
// You can add 3–5 here. IDs must match ?clip=... in the URL.
const CLIPS = {
  "1": {
    title: "Merry Christmas, Mommy 🎄",
    subtitle: "A little message from your favorite boy.",
    audio: "audio/clip-1.mp3",
    image: "images/clip-1.jpg"
  },
  "2": {
    title: "Snuggles & Hot Cocoa ☕",
    subtitle: "Press play for something cozy.",
    audio: "audio/clip-2.mp3",
    image: "images/clip-2.jpg"
  },
  "3": {
    title: "Christmas Giggles 😄",
    subtitle: "Tap to hear his little laugh.",
    audio: "audio/clip-3.mp3",
    image: "images/clip-3.jpg"
  }
  // Add "4", "5", etc. if you want more
};

function getClipIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("clip") || "1";
}

function setupClip() {
  const clipId = getClipIdFromUrl();
  const clip = CLIPS[clipId] || CLIPS["1"];

  const titleEl = document.getElementById("clipTitle");
  const subtitleEl = document.getElementById("clipSubtitle");
  const imageEl = document.getElementById("clipImage");
  const audioEl = document.getElementById("mainAudio");

  titleEl.textContent = clip.title;
  subtitleEl.textContent = clip.subtitle;
  imageEl.src = clip.image;

  audioEl.src = clip.audio;
  audioEl.preload = "auto"; // Preload for “instant” one-tap playback
}

function initAudioBehavior() {
  const audioEl = document.getElementById("mainAudio");
  const playButton = document.getElementById("playButton");
  const hintText = document.getElementById("hintText");

  let hasTriedAutoplay = false;

  // Try autoplay once after the page is ready and primer has run
  function tryAutoplay() {
    if (hasTriedAutoplay) return;
    hasTriedAutoplay = true;

    audioEl
      .play()
      .then(() => {
        playButton.classList.add("playing");
        playButton.textContent = "Playing… 🎧";
        hintText.textContent = "You can tap again to replay.";
      })
      .catch(() => {
        // Autoplay blocked – user will need to tap
        playButton.textContent = "Tap to listen 🎧";
      });
  }

  window.addEventListener("load", () => {
    // Give the silent primer a brief moment, then try autoplay.
    setTimeout(tryAutoplay, 400);
  });

  // Always allow manual play, which will work 100%
  function handleUserPlay() {
    audioEl
      .play()
      .then(() => {
        playButton.classList.add("playing");
        playButton.textContent = "Playing… 🎧";
        hintText.textContent = "Tap again if you want to hear it one more time.";
      })
      .catch(() => {
        // Extremely rare case; keep button as is
      });
  }

  playButton.addEventListener("click", handleUserPlay);
  playButton.addEventListener("touchstart", handleUserPlay);

  // When the clip ends, reset the button
  audioEl.addEventListener("ended", () => {
    playButton.classList.remove("playing");
    playButton.textContent = "Tap to listen again 🎧";
  });
}

// Initialize everything
setupClip();
initAudioBehavior();
