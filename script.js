// Each clip now has a video file (MP4) and optional poster image.
const CLIPS = {
  "1": {
    title: "Merry Christmas, Mommy 🎄",
    subtitle: "A little message from your favorite boy.",
    video: "video/clip-1.mp4",
    poster: "images/clip-1-poster.jpg"
  },
  "2": {
    title: "Snuggles & Hot Cocoa ☕",
    subtitle: "Tap to watch something cozy.",
    video: "video/clip-2.mp4",
    poster: "images/clip-2-poster.jpg"
  },
  "3": {
    title: "Christmas Giggles 😄",
    subtitle: "Tap to hear his laugh.",
    video: "video/clip-3.mp4",
    poster: "images/clip-3-poster.jpg"
  }
  // add 4, 5... as needed
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
  const videoEl = document.getElementById("clipVideo");

  titleEl.textContent = clip.title;
  subtitleEl.textContent = clip.subtitle;

  videoEl.src = clip.video;
  if (clip.poster) {
    videoEl.poster = clip.poster;
  }

  // No autoplay here: we’ll only start on user tap
  videoEl.muted = false;      // make sure default is unmuted
}

function initVideoControls() {
  const videoEl = document.getElementById("clipVideo");
  const playButton = document.getElementById("playButton");
  const hintText = document.getElementById("hintText");

  function playFromStart() {
    videoEl.muted = false;
    videoEl.currentTime = 0;
    videoEl
      .play()
      .then(() => {
        playButton.classList.add("playing");
        playButton.textContent = "Playing… 🎧";
        hintText.textContent = "Tap again if you want to watch it once more.";
      })
      .catch(() => {
        // Very rare failure case — you could show an error if you want
      });
  }

  playButton.addEventListener("click", playFromStart);
  playButton.addEventListener("touchstart", playFromStart);

  videoEl.addEventListener("ended", () => {
    playButton.classList.remove("playing");
    playButton.textContent = "Play again 🎬";
  });
}

window.addEventListener("load", () => {
  setupClip();
  initVideoControls();
});
