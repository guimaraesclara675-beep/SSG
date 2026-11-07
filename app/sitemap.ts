import type { MetadataRoute } from 'next';
import { CIDADES, SEGMENTOS, SITE } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();
  return [
    { url: SITE.url, lastModified: agora, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/perguntas-frequentes`, lastModified: agora, changeFrequency: 'monthly', priority: 0.7 },
    ...SEGMENTOS.map(s => ({ url: `${SITE.url}/automacao/${s.slug}`, lastModified: agora, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...CIDADES.map(c => ({ url: `${SITE.url}/automacao-empresas/${c.slug}`, lastModified: agora, changeFrequency: 'monthly' as const, priority: 0.8 }))
  ];
}
