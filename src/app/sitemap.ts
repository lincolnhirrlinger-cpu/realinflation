import { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/cities'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://realinflation.co'

  const citySlugs = getAllSlugs()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/states/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/compare/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/methodology/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/submit/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  const cityPages: MetadataRoute.Sitemap = citySlugs.map(slug => ({
    url: `${base}/city/${slug}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [...staticPages, ...cityPages]
}
