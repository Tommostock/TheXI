export default function MainLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        {/* Pulsing icon */}
        <div className="mx-auto mb-4 animate-pulse-glow">
          <img src="/icons/icon-192.png" alt="The XI" className="mx-auto h-16 w-16 rounded-xl" />
        </div>
        <h1 className="text-2xl font-display font-black tracking-tight text-white">
          THE <span className="text-wc-purple">XI</span>
        </h1>
        {/* Shimmer bar */}
        <div className="mt-4 mx-auto h-1 w-32 rounded-full overflow-hidden bg-border">
          <div className="h-full w-full animate-shimmer" />
        </div>
      </div>
    </div>
  )
}
