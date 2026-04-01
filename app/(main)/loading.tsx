export default function MainLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-black tracking-tight text-white">
          THE <span className="text-wc-lime">XI</span>
        </h1>
        <div className="mt-4 flex justify-center gap-1">
          <div className="h-2 w-2 rounded-full bg-wc-lime animate-bounce [animation-delay:0ms]" />
          <div className="h-2 w-2 rounded-full bg-wc-lime animate-bounce [animation-delay:150ms]" />
          <div className="h-2 w-2 rounded-full bg-wc-lime animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}
