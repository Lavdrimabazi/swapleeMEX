export function BackgroundGradient() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,140,50,0.03),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(50,140,255,0.03),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-pixel-pattern opacity-[0.02]"></div>
    </div>
  )
}
