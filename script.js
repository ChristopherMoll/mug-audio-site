function getParams() {
  return new URLSearchParams(window.location.search);
}

function getClipIdFromUrl() {
  const params = getParams();
  return params.get("clip"); // if null, function will random-pick
}

function getCodeFromUrl() {
  const params = getParams();
  return params.get("c") || "";
}

async function fetchClipData() {
  const clipId = getClipIdFromUrl();
  const code = getCodeFromUrl();

  const url = new URL("/.netlify/functions/clip", window.location.origin);
  if (clipId) url.searchParams.set("clip", clipId);
  if (code) url.searchParams.set("c", code);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load clip (${res.status})`);
  return res.json();
}

async function setupClip() {
  const titleEl = document.getElementById("clipTitle");
  const subtitleEl = document.getElementById("clipSubtitle");
  const videoEl = document.getElementById("clipVideo");

  titleEl.textContent = "Loading…";
  subtitleEl.textContent = "";

  // Tap-to-play: do NOT autoplay, do NOT force muted
  videoEl.autoplay = false;
  videoEl.preload = "auto";
  videoEl.muted = false;

  const clip = await fetchClipData();

  titleEl.textContent = clip.title;
  subtitleEl.textContent = clip.subtitle;

  videoEl.src = clip.videoUrl;
  if (clip.posterUrl) videoEl.poster = clip.posterUrl;

  // Helps some mobile browsers pick up the new src promptly
  videoEl.load();
}

function initVideoControls() {
  const videoEl = document.getElementById("clipVideo");
  const playButton = document.getElementById("playButton");
  const hintText = document.getElementById("hintText");

  function playFromStart(e) {
    if (e && e.type === "touchstart") e.preventDefault();

    videoEl.muted = false;
    videoEl.currentTime = 0;

    videoEl.play()
      .then(() => {
        playButton.classList.add("playing");
        playButton.textContent = "Playing… 🎧";
        hintText.textContent = "Tap again if you want to watch it once more.";
      })
      .catch(() => {
        hintText.textContent = "If it didn’t play, tap again (some phones require a second tap).";
      });
  }

  playButton.addEventListener("click", playFromStart);
  playButton.addEventListener("touchstart", playFromStart, { passive: false });

  videoEl.addEventListener("ended", () => {
    playButton.classList.remove("playing");
    playButton.textContent = "Play again 🎬";
  });
}

window.addEventListener("load", async () => {
  try {
    await setupClip();
  } catch (err) {
    console.error(err);
    document.getElementById("clipTitle").textContent = "Couldn’t load the video.";
    document.getElementById("clipSubtitle").textContent = "Please try again in a moment.";
  }
  initVideoControls();
});
