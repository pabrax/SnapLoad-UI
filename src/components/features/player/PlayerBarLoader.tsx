"use client"

import dynamic from "next/dynamic"
import { usePlayer } from "./PlayerProvider"

// The bar (and its icons) is only downloaded once something is playing or has failed,
// so pages without music do not pay for it.
const PlayerBar = dynamic(() => import("./PlayerBar").then((m) => m.PlayerBar), { ssr: false })

export function PlayerBarLoader() {
  const { track, state } = usePlayer()
  if (!track && !state.error) return null
  return <PlayerBar />
}
