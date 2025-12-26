const jwt = require("jsonwebtoken");
const { createPrivateKey } = require("crypto");


const CLIPS = {
  "1": {
    title: "Merry Christmas, Mamia & Pop-Pop 🎄",
    subtitle: "Here's a glimpse of my Christmas morning!",
    playbackId: "02yEttD2RlWOyBkpyUmfURILIzWsRgsnm594Fri5L6X00"
  },
  "2": {
    title: "Merry Christmas, Grandma 🎄",
    subtitle: "Here's a glimpse of my Christmas morning!",
    playbackId: "02yEttD2RlWOyBkpyUmfURILIzWsRgsnm594Fri5L6X00"
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
  if (process.env.ORNAMENT_CODE && code !== process.env.ORNAMENT_CODE) {
    return { statusCode: 403, body: "Forbidden" };
  }

  const clip = (requestedId && CLIPS[requestedId]) ? CLIPS[requestedId] : pickRandomClip();

  const now = Math.floor(Date.now() / 1000);

  const pem = (process.env.MUX_SIGNING_KEY_PRIVATE || "")
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "");
console.log("pem header:", pem.split("\n")[0]);
const keyObject = createPrivateKey({
key: pem,
format: "pem",
type: "pkcs8",
});




  console.log("asymmetricKeyType:", keyObject.asymmetricKeyType); // should print "rsa"

  const token = jwt.sign(
  { sub: clip.playbackId, aud: "v", exp: now + 60 },
  keyObject,
  { algorithm: "RS256", keyid: process.env.MUX_SIGNING_KEY_ID }
);


  const videoUrl = `https://stream.mux.com/${clip.playbackId}.m3u8?token=${encodeURIComponent(token)}`;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify({
      title: clip.title,
      subtitle: clip.subtitle,
      posterUrl: clip.posterUrl || null,
      videoUrl
    })
  };
};
