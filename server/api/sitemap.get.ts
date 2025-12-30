export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // determine base URL — prefer configured siteUrl, otherwise derive from request
  const headers = (event.node.req && event.node.req.headers) || {}
  const forwardedProto = headers['x-forwarded-proto'] || headers['x-forwarded-protocol'] || null
  const proto = forwardedProto || (event.node.req.socket && (event.node.req.socket as any).encrypted ? 'https' : 'https')
  const host = headers.host || config.public.siteUrl || 'localhost:3000'
  const baseUrl = (config.public.siteUrl ? String(config.public.siteUrl).replace(/\/$/, '') : `${proto}://${host}`)

  const urls = new Map<string, { lastmod?: string; priority?: string }>()
  const now = new Date().toISOString()

  // static pages (public-facing)
  const staticPages = [
    { path: '/', priority: '1.0' },
    { path: '/about', priority: '0.6' },
    { path: '/contact', priority: '0.5' },
    { path: '/pricing', priority: '0.5' },
    { path: '/faq', priority: '0.5' },
    { path: '/terms', priority: '0.3' },
    { path: '/privacy', priority: '0.3' },
    { path: '/tournaments', priority: '0.6' },
    { path: '/quiz-masters', priority: '0.6' },
    { path: '/quizzes', priority: '0.7' },
     { path: '/topics', priority: '0.7' },
      { path: '/subjects', priority: '0.7' },
       { path: '/grades', priority: '0.7' },
        { path: '/levels', priority: '0.7' }
  ]

  for (const p of staticPages) urls.set(p.path, { lastmod: now, priority: p.priority })

  // helper to normalize API list responses (tries several common shapes)
  function extractList(resp: any): any[] {
    if (!resp) return []
    if (Array.isArray(resp)) return resp
    // common wrappers
    const keys = Object.keys(resp || {})
    for (const k of ['data', 'items', 'results', 'quizzes', 'topics', 'quiz-masters', 'quiz_masters', 'quizMasters']) {
      const v = (resp as any)[k]
      if (Array.isArray(v)) return v
      if (v && Array.isArray(v.data)) return v.data
    }
    // last resort: find first array property
    for (const k of keys) if (Array.isArray((resp as any)[k])) return (resp as any)[k]
    return []
  }

  // fetch dynamic resources: quizzes, quiz-masters, topics
  try {
    // quizzes
    const quizzesRes = await $fetch(`${config.public.apiBase}/api/quizzes?per_page=1000`).catch(() => null)
    const quizzes = extractList(quizzesRes)
    for (const q of quizzes) {
      // prefer slug-based URLs only; skip items without slug to avoid id-based routes
      const slug = q?.slug
      if (!slug) continue
      const lastmod = q?.updated_at || q?.updatedAt || q?.published_at || undefined
      urls.set(`/quizzes/${slug}`, { lastmod, priority: '0.8' })
      urls.set(`/quizee/quizzes/${slug}`, { lastmod, priority: '0.8' })
    }
  } catch (e) {
    // ignore; sitemap remains with static pages
  }

  try {
    // quiz-masters
    const qmsRes = await $fetch(`${config.public.apiBase}/api/quiz-masters?per_page=1000`).catch(() => null)
    const qms = extractList(qmsRes)
    for (const m of qms) {
      const slug = m?.slug
      if (!slug) continue
      const lastmod = m?.updated_at || m?.updatedAt || m?.published_at || undefined
      urls.set(`/quiz-masters/${slug}`, { lastmod, priority: '0.7' })
      urls.set(`/quizee/quiz-masters/${slug}`, { lastmod, priority: '0.7' })
    }
  } catch (e) {}

  try {
    // topics
    const topicsRes = await $fetch(`${config.public.apiBase}/api/topics?per_page=1000`).catch(() => null)
    const topics = extractList(topicsRes)
    for (const t of topics) {
      const slug = t?.slug
      if (!slug) continue
      const lastmod = t?.updated_at || t?.updatedAt || undefined
      urls.set(`/topics/${slug}`, { lastmod, priority: '0.6' })
    }
  } catch (e) {}

  // build XML
  function esc(s: string | undefined | null) {
    if (!s) return ''
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  const parts: string[] = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
  for (const [path, meta] of urls) {
    const loc = `${baseUrl.replace(/\/$/, '')}${path}`
    parts.push('  <url>')
    parts.push(`    <loc>${esc(loc)}</loc>`)
    if (meta?.lastmod) parts.push(`    <lastmod>${esc(new Date(meta.lastmod).toISOString())}</lastmod>`)
    parts.push('    <changefreq>weekly</changefreq>')
    parts.push(`    <priority>${meta?.priority ?? '0.5'}</priority>`)
    parts.push('  </url>')
  }
  parts.push('</urlset>')

  // set content-type and return XML
  event.res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  return parts.join('\n')
})
