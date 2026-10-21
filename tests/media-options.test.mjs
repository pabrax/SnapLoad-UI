// Pure option logic shared by the audio/video forms (Node runs the .ts directly).
import test from "node:test"
import assert from "node:assert/strict"
import {
  AUDIO_FORMAT_OPTIONS,
  AUDIO_BITRATE_OPTIONS,
  VIDEO_FORMAT_OPTIONS,
  VIDEO_RESOLUTION_OPTIONS,
  bitrateApplies,
  bitrateNote,
  describeAudioQuality,
  availableResolutions,
  clampResolution,
} from "../src/lib/media-options.ts"

test("audio formats match the API (no aac) and mp3 stays first/default", () => {
  assert.deepEqual(AUDIO_FORMAT_OPTIONS.map((f) => f.value), ["mp3", "m4a", "opus", "ogg", "flac", "wav"])
})

test("bitrate options are the API ladder plus best", () => {
  const values = AUDIO_BITRATE_OPTIONS.map((o) => o.value)
  assert.equal(values[0], "best")
  for (const v of values.slice(1)) assert.ok(["64", "96", "128", "160", "192", "256", "320"].includes(v), v)
  assert.ok(values.includes("192") && values.includes("320"))
})

test("bitrate applies only to formats that are re-encoded", () => {
  for (const f of ["mp3", "m4a", "ogg"]) assert.equal(bitrateApplies(f), true, f)
  for (const f of ["opus", "flac", "wav"]) assert.equal(bitrateApplies(f), false, f)
})

test("notes explain why bitrate is not selectable", () => {
  assert.match(bitrateNote("flac"), /sin pérdida/i)
  assert.match(bitrateNote("opus"), /original/i)
  assert.equal(bitrateNote("mp3"), null)
})

test("badge text never claims kbps for non-bitrate results", () => {
  assert.equal(describeAudioQuality("192", "mp3"), "192 kbps")
  assert.equal(describeAudioQuality("best", "mp3"), "Mejor calidad")
  assert.equal(describeAudioQuality("lossless", "flac"), "Sin pérdida")
  assert.equal(describeAudioQuality("source", "opus"), "Stream original")
  assert.equal(describeAudioQuality("192", "flac"), "Sin pérdida")
})

test("video formats include mov and avi", () => {
  assert.deepEqual(VIDEO_FORMAT_OPTIONS.map((f) => f.value), ["webm", "mp4", "mkv", "mov", "avi"])
})

test("video resolutions match the API", () => {
  assert.deepEqual(VIDEO_RESOLUTION_OPTIONS.map((r) => r.value), ["best", "2160p", "1440p", "1080p", "720p", "480p", "360p"])
})

test("mov and avi are capped at 1080p, others offer everything", () => {
  for (const f of ["mov", "avi"]) {
    const values = availableResolutions(f).map((r) => r.value)
    assert.deepEqual(values, ["best", "1080p", "720p", "480p", "360p"], f)
  }
  assert.equal(availableResolutions("mp4").length, 7)
})

test("switching to mov/avi downgrades an unavailable resolution", () => {
  assert.equal(clampResolution("mov", "2160p"), "1080p")
  assert.equal(clampResolution("avi", "1440p"), "1080p")
  assert.equal(clampResolution("mov", "720p"), "720p")
  assert.equal(clampResolution("mp4", "2160p"), "2160p")
})
