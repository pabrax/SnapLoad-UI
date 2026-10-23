// Header handling of the audio stream proxy (Node runs the .ts directly).
import test from "node:test"
import assert from "node:assert/strict"
import { isTrackId, upstreamHeaders, downstreamHeaders } from "../src/lib/range-proxy.ts"

test("track ids are 16 lowercase hex chars", () => {
  assert.equal(isTrackId("0123456789abcdef"), true)
  for (const bad of ["", "0123456789ABCDEF", "0123456789abcde", "../etc/passwd", "0123456789abcdef/x", "0123456789abcdeg"]) {
    assert.equal(isTrackId(bad), false, bad)
  }
})

test("only Range and If-Range are forwarded upstream", () => {
  const incoming = new Headers({ range: "bytes=100-199", "if-range": '"etag"', cookie: "secret=1", authorization: "Bearer x" })

  const out = upstreamHeaders(incoming)

  assert.deepEqual(Object.fromEntries(out), { range: "bytes=100-199", "if-range": '"etag"' })
})

test("no Range header means none is forwarded", () => {
  assert.deepEqual([...upstreamHeaders(new Headers())], [])
})

test("range response headers are passed through", () => {
  const upstream = new Headers({
    "content-type": "audio/mpeg",
    "content-length": "1000",
    "content-range": "bytes 1000-1999/10240",
    "accept-ranges": "bytes",
    "content-disposition": 'inline; filename="song.mp3"',
    "set-cookie": "session=1",
    server: "uvicorn",
  })

  const out = downstreamHeaders(upstream)

  assert.equal(out.get("content-type"), "audio/mpeg")
  assert.equal(out.get("content-length"), "1000")
  assert.equal(out.get("content-range"), "bytes 1000-1999/10240")
  assert.equal(out.get("accept-ranges"), "bytes")
  assert.equal(out.get("content-disposition"), 'inline; filename="song.mp3"')
  assert.equal(out.get("set-cookie"), null)
  assert.equal(out.get("server"), null)
})

test("a response without Accept-Ranges still advertises byte ranges so the browser can seek", () => {
  assert.equal(downstreamHeaders(new Headers({ "content-type": "audio/mpeg" })).get("accept-ranges"), "bytes")
})

test("unsatisfiable range keeps Content-Range", () => {
  const out = downstreamHeaders(new Headers({ "content-range": "bytes */10240" }))
  assert.equal(out.get("content-range"), "bytes */10240")
})
