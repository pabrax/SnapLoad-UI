// Library API client with an injected fetch (Node runs the .ts directly).
import test from "node:test"
import assert from "node:assert/strict"
import { listTracks, setKept, removeTrack, streamUrl, coverUrl } from "../src/lib/library-client.ts"

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
const recorder = (response) => {
  const calls = []
  const fetchImpl = async (url, init) => {
    calls.push({ url, init })
    return typeof response === "function" ? response() : response
  }
  return { calls, fetchImpl }
}

const PAGE = { tracks: [], total: 0, limit: 50, offset: 0, kept_bytes: 0 }

test("urls for the player", () => {
  assert.equal(streamUrl("0123456789abcdef"), "/api/library/0123456789abcdef/stream")
  assert.equal(coverUrl("0123456789abcdef"), "/api/library/0123456789abcdef/cover")
})

test("listTracks builds the query and returns the page", async () => {
  const { calls, fetchImpl } = recorder(json(200, PAGE))

  const result = await listTracks({ limit: 20, offset: 40, q: "daft punk" }, fetchImpl)

  assert.deepEqual(result, { ok: true, data: PAGE })
  assert.equal(calls[0].url, "/api/library?limit=20&offset=40&q=daft+punk")
})

test("listTracks omits empty parameters", async () => {
  const { calls, fetchImpl } = recorder(json(200, PAGE))
  await listTracks({ q: "  " }, fetchImpl)
  assert.equal(calls[0].url, "/api/library")
})

test("failure_maps_to_error_state_with_retry", async () => {
  const server = await listTracks({}, recorder(json(500, { error: "boom" })).fetchImpl)
  assert.deepEqual(server, { ok: false, error: "boom", retryable: true })

  const offline = await listTracks({}, async () => { throw new TypeError("fetch failed") })
  assert.equal(offline.ok, false)
  assert.equal(offline.retryable, true)
  assert.match(offline.error, /conectar|connect/i)

  const clientError = await listTracks({}, recorder(json(422, { error: "bad paging" })).fetchImpl)
  assert.deepEqual(clientError, { ok: false, error: "bad paging", retryable: false })
})

test("a non-JSON error body still yields a message", async () => {
  const result = await listTracks({}, recorder(new Response("<html>bad gateway</html>", { status: 502 })).fetchImpl)
  assert.equal(result.ok, false)
  assert.equal(result.retryable, true)
  assert.ok(result.error.length > 0)
})

test("setKept sends a JSON boolean and returns the updated track", async () => {
  const updated = { id: "0123456789abcdef", kept: false }
  const { calls, fetchImpl } = recorder(json(200, updated))

  const result = await setKept("0123456789abcdef", false, fetchImpl)

  assert.deepEqual(result, { ok: true, data: updated })
  assert.equal(calls[0].url, "/api/library/0123456789abcdef")
  assert.equal(calls[0].init.method, "PATCH")
  assert.equal(calls[0].init.body, '{"kept":false}')
})

test("removeTrack succeeds on 204 and reports errors otherwise", async () => {
  const ok = recorder(new Response(null, { status: 204 }))
  assert.deepEqual(await removeTrack("0123456789abcdef", ok.fetchImpl), { ok: true, data: null })
  assert.equal(ok.calls[0].init.method, "DELETE")

  const missing = await removeTrack("0123456789abcdef", recorder(json(404, { error: "Track not found" })).fetchImpl)
  assert.deepEqual(missing, { ok: false, error: "Track not found", retryable: false })
})
