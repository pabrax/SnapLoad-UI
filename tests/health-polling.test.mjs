// Backend health re-check schedule: fast backoff while disconnected, slow heartbeat while connected.
import test from "node:test"
import assert from "node:assert/strict"
import { nextHealthDelay } from "../src/lib/health-polling.ts"

test("disconnected backs off 3s, 6s, 12s, 24s and caps at 30s", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 10].map((n) => nextHealthDelay("disconnected", n)), [3000, 6000, 12000, 24000, 30000, 30000])
})

test("connected uses a slow heartbeat independent of past failures", () => {
  assert.equal(nextHealthDelay("connected", 0), 60000)
  assert.equal(nextHealthDelay("connected", 5), 60000)
})

test("unknown (first check pending) retries quickly", () => {
  assert.equal(nextHealthDelay("unknown", 0), 3000)
})
