'use client'
// AdSlot — placeholder for Google AdSense
// Replace data-ad-client and data-ad-slot with real values once approved
// Until then renders nothing (no layout shift)

import { useEffect } from 'react'

declare global {
  interface Window { adsbygoogle: unknown[] }
}

export default function AdSlot({ id, format = 'auto' }: { id: string; format?: string }) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({})
      }
    } catch {}
  }, [])

  // Swap in real publisher ID when AdSense is approved
  const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_ID
  if (!PUBLISHER_ID) return null

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={PUBLISHER_ID}
      data-ad-slot={id}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
