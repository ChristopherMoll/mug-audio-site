const jwt = require("jsonwebtoken");

// Safe to commit: these are NOT secrets.
// For Mux signed playback, these would be "Signed Playback IDs".
const CLIPS = {
  "1": {
    title: "Merry Christmas, Mommy 🎄",
    subtitle: "A little message from your favorite boy.",
    playbackId: "xlGLxjFxEWro97gj4PgRxuP6sGDaQRvQ00400OzBEeSn8"
  }
};

function pickRandomClip() {
  const keys = Object.keys(CLIPS);
  const k = keys[Math.floor(Math.random() * keys.length)];
  return CLIPS[k];
}

exports.handler = async (event) => {
  const qs = event.queryStringParameters || {};
  const requestedId = qs.clip;
  const code = qs.c || "";

  // Optional gate to stop random people minting tokens if endpoint is discovered.
  // Put ORNAMENT_CODE in Netlify env vars. Add ?c=... to your NFC URL.
  if (process.env.ORNAMENT_CODE && code !== process.env.ORNAMENT_CODE) {
    return { statusCode: 403, body: "Forbidden" };
  }

  const clip = (requestedId && CLIPS[requestedId]) ? CLIPS[requestedId] : pickRandomClip();

  const now = Math.floor(Date.now() / 1000);
  const token = jwt.sign(
    { sub: clip.playbackId, exp: now + 60 }, // 60 seconds
    process.env.MUX_SIGNING_KEY_PRIVATE,
    { algorithm: "RS256", keyid: process.env.MUX_SIGNING_KEY_ID }
  );

  const videoUrl = `https://stream.mux.com/${clip.playbackId}.m3u8?token=${encodeURIComponent(token)}`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify({
      title: clip.title,
      subtitle: clip.subtitle,
      posterUrl: clip.posterUrl || null,
      videoUrl
    })
  };
};
