interface AdSlotProps {
  id?: string
  className?: string
}

export default function AdSlot({ id, className }: AdSlotProps) {
  return (
    // Ad slot placeholder — replace with Google AdSense or other ad network code
    <div
      id={id}
      className={`ad-slot flex items-center justify-center bg-border/30 border border-dashed border-border rounded-card text-text-muted text-xs font-mono h-20 my-8 ${className ?? ''}`}
    >
      [ Advertisement ]
    </div>
  )
}
