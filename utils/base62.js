const base62 = require('base62/lib/ascii');

function encodeBase62(id) {
  return base62.encode(id).padStart(6, '0');
}

function decodeBase62(shortUrl) {
  return base62.decode(shortUrl);
}

module.exports = { encodeBase62, decodeBase62 };
