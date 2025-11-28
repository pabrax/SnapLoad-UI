export function BackgroundEffects() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-purple-950/20 to-teal-950/20" />
      
      <div className="absolute top-32 left-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl glow-effect" />
      <div
        className="absolute bottom-20 right-16 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl glow-effect"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-24 h-24 bg-teal-500/10 rounded-full blur-3xl glow-effect"
        style={{ animationDelay: "2s" }}
      />
    </>
  )
}
