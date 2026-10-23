/**
 * Header rules for the audio stream proxy (app/api/library/[id]/stream). Kept free of imports so it
 * can be unit tested with `node --test`.
 */

const TRACK_ID = /^[0-9a-f]{16}$/

// Only these request headers reach the backend: cookies and credentials never do.
const FORWARDED_REQUEST_HEADERS = ["range", "if-range"]

// Headers the browser needs to play and seek; everything else the backend sends is dropped.
const PASSED_RESPONSE_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "content-disposition",
  "cache-control",
]

export function isTrackId(value: string): boolean {
  return TRACK_ID.test(value)
}

export function upstreamHeaders(incoming: Headers): Headers {
  const out = new Headers()
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = incoming.get(name)
    if (value) out.set(name, value)
  }
  return out
}

export function downstreamHeaders(upstream: Headers): Headers {
  const out = new Headers()
  for (const name of PASSED_RESPONSE_HEADERS) {
    const value = upstream.get(name)
    if (value) out.set(name, value)
  }
  if (!out.has("accept-ranges")) out.set("accept-ranges", "bytes")
  return out
}
