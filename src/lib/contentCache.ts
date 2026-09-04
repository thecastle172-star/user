import { ConvexClient } from 'convex/browser'
import { makeFunctionReference } from 'convex/server'

export type PublicProperty = { _id?: string; id?: number | string; image: string; type: 'للبيع' | 'للإيجار'; title: string; location: string; price: string; beds: number; baths: number; area: number; description: string }
export type PublicBanner = { _id?: string; image: string; eyebrow: string; title: string; copy: string }
export type PublicContent = { properties: PublicProperty[]; banners: PublicBanner[]; whatsapp: string; contentVersion: number }

type CachedContent = { savedAt: number; data: PublicContent }

const CACHE_KEY = 'castle-public-content-v1'
const getPublic = makeFunctionReference<'query', Record<string, never>, PublicContent>('content:getPublic')

export function readCachedContent(): CachedContent | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedContent
    if (!parsed?.data?.properties || !parsed?.data?.banners || typeof parsed.savedAt !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export function loadPublicContent(fallback: PublicContent) {
  const cached = readCachedContent()
  return { data: cached?.data ?? fallback, source: cached ? 'cache' as const : 'fallback' as const }
}

export function subscribeToPublicContent(onContent: (data: PublicContent) => void, onError?: (error: Error) => void) {
  const convexUrl = import.meta.env.VITE_CONVEX_URL
  if (!convexUrl) return () => undefined

  const client = new ConvexClient(convexUrl)
  const unsubscribe = client.onUpdate(getPublic, {}, (data) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data } satisfies CachedContent))
    onContent(data)
  }, (error) => {
    onError?.(error)
  })

  return () => {
    unsubscribe()
    void client.close()
  }
}
