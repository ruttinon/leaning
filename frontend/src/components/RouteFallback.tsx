interface RouteFallbackProps {
  label?: string
}

export function RouteFallback({ label = 'Loading...' }: RouteFallbackProps) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/80 px-6 py-12 text-sm text-gray-500">
      {label}
    </div>
  )
}
