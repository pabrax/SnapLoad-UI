// Display formatting of library rows (Node runs the .ts directly).
import test from "node:test"
import assert from "node:assert/strict"
import { formatDuration, formatBytes, trackRow } from "../src/lib/library-view.ts"

test("durations render as m:ss and h:mm:ss", () => {
  assert.equal(formatDuration(0), "0:00")
  assert.equal(formatDuration(5), "0:05")
  assert.equal(formatDuration(61.9), "1:01")
  assert.equal(formatDuration(3599), "59:59")
  assert.equal(formatDuration(3661), "1:01:01")
})

test("unknown or invalid durations render as a dash", () => {
  for (const bad of [null, undefined, NaN, -1, Infinity]) assert.equal(formatDuration(bad), "–")
})

test("sizes are human readable", () => {
  assert.equal(formatBytes(0), "0 B")
  assert.equal(formatBytes(512), "512 B")
  assert.equal(formatBytes(1536), "1.5 KB")
  assert.equal(formatBytes(10_000_000), "9.5 MB")
  assert.equal(formatBytes(5 * 1024 ** 3), "5.0 GB")
})

test("row_view_model_has_title_artist_duration", () => {
  const row = trackRow({ id: "0123456789abcdef", title: "Song", artist: "Band", album: "LP", duration_s: 215, format: "mp3", size_bytes: 1, has_cover: true, kept: true })

  assert.deepEqual(row, {
    id: "0123456789abcdef",
    title: "Song",
    artist: "Band",
    duration: "3:35",
    coverUrl: "/api/library/0123456789abcdef/cover",
    kept: true,
    label: "Song – Band",
  })
})

test("rows fall back for missing tags and covers", () => {
  const row = trackRow({ id: "0123456789abcdef", title: null, artist: null, album: null, duration_s: null, format: "wav", size_bytes: 1, has_cover: false, kept: false })

  assert.equal(row.title, "Sin título")
  assert.equal(row.artist, "Artista desconocido")
  assert.equal(row.duration, "–")
  assert.equal(row.coverUrl, null)
  assert.equal(row.label, "Sin título")
})
