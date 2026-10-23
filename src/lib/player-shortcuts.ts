/**
 * Global keyboard shortcuts of the player. Arrow keys are deliberately not used: the tablist and the
 * sliders already handle them. Free of imports so it can be unit tested with `node --test`.
 */

export type ShortcutAction = "toggle" | "next" | "prev" | "mute"

export interface ShortcutEvent {
  key: string
  target: { tagName?: string; isContentEditable?: boolean; role?: string | null; getAttribute?: (name: string) => string | null } | null
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
}

const TEXT_TARGETS = new Set(["INPUT", "TEXTAREA", "SELECT"])
// Elements where Space already means something else (activate, scroll to, adjust).
const SPACE_OWNERS = new Set(["BUTTON", "A", "SUMMARY"])
const SPACE_ROLES = new Set(["tab", "slider", "button", "link", "menuitem", "checkbox", "switch"])

function roleOf(target: NonNullable<ShortcutEvent["target"]>): string | null {
  return target.role ?? target.getAttribute?.("role") ?? null
}

export function shortcutAction(event: ShortcutEvent): ShortcutAction | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null

  const target = event.target
  if (target) {
    if (target.isContentEditable || (target.tagName && TEXT_TARGETS.has(target.tagName))) return null
  }

  switch (event.key.toLowerCase()) {
    case " ": {
      if (target) {
        const role = roleOf(target)
        if ((target.tagName && SPACE_OWNERS.has(target.tagName)) || (role && SPACE_ROLES.has(role))) return null
      }
      return "toggle"
    }
    case "n":
      return "next"
    case "p":
      return "prev"
    case "m":
      return "mute"
    default:
      return null
  }
}
