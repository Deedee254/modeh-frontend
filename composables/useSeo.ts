/**
 * Comprehensive SEO Composable for Modeh
 * Handles slug-based URL generation, meta tags, JSON-LD structured data, and Open Graph tags
 */

import { useHead } from '#imports'

export interface SeoEntity {
  id: string | number
  name: string
  slug: string
  description?: string
  image?: string
  created_at?: string
  start_date?: string
  updated_at?: string
}

export type EntityType = 'quiz' | 'grade' | 'subject' | 'level' | 'topic' | 'tournament'

/**
 * Generate SEO URL from entity
 * @param entity - Entity with slug
 * @param entityType - Type of entity
 * @returns URL path (e.g., "/quizzes/advanced-mathematics")
 */
export function generateSeoUrl(entity: SeoEntity, entityType: EntityType): string {
  // Prefer slug when available, otherwise fall back to ID (useful for items like tournaments)
  const identifier = entity?.slug || String(entity?.id || '')

  const pluralMap: Record<EntityType, string> = {
    quiz: 'quizzes',
    grade: 'grades',
    subject: 'subjects',
    level: 'levels',
    topic: 'topics',
    tournament: 'tournaments'
  }

  const plural = pluralMap[entityType] || `${entityType}s`
  return `/${plural}/${identifier}`
}

/**
 * Generate descriptive title for entity
 */
function generateTitle(entity: SeoEntity, entityType: EntityType): string {
  const typeMap: Record<EntityType, string> = {
    quiz: 'Quiz',
    grade: 'Grade',
    subject: 'Subject',
    level: 'Level',
    topic: 'Topic',
    tournament: 'Tournament'
  }

  const type = typeMap[entityType]
  return `${entity.name} - ${type} | Modeh`
}

/**
 * Generate meta description
 */
function generateDescription(entity: SeoEntity, entityType: EntityType): string {
  if (entity.description) {
    return entity.description.substring(0, 160)
  }

  const descriptionMap: Record<EntityType, string> = {
    quiz: `Take the ${entity.name} quiz on Modeh. Test your knowledge with our comprehensive assessment.`,
    grade: `Explore subjects and content for ${entity.name} on Modeh. Learn and practice with interactive quizzes.`,
    subject: `Study ${entity.name} on Modeh. Access quizzes, topics, and learning materials.`,
    level: `Learn at ${entity.name} level on Modeh. Browse subjects and practice with quizzes.`,
    topic: `Master ${entity.name} with Modeh. Take quizzes and improve your understanding.`,
    tournament: `Join or follow the ${entity.name} tournament on Modeh. Compete in scheduled tournaments and track leaderboards.`
  }

  return descriptionMap[entityType]
}

/**
 * Generate meta keywords
 */
function generateKeywords(entity: SeoEntity, entityType: EntityType): string {
  const words = [entity.name, 'Modeh', 'learning', 'quiz', 'practice']

  const typeKeywords: Record<EntityType, string[]> = {
    quiz: ['assessment', 'test', 'exam', 'quiz'],
    grade: ['grade', 'course', 'curriculum'],
    subject: ['subject', 'course', 'study'],
    level: ['level', 'difficulty', 'learning'],
    topic: ['topic', 'lesson', 'subject'],
    tournament: ['tournament', 'competition', 'leaderboard', 'event']
  }

  return [...words, ...typeKeywords[entityType]].join(', ')
}

/**
 * Generate JSON-LD structured data for search engines
 */
function generateJsonLd(entity: SeoEntity, entityType: EntityType, baseUrl: string): Record<string, any> {
  const url = `${baseUrl}${generateSeoUrl(entity, entityType)}`
  const description = entity.description || generateDescription(entity, entityType)

  const schemaMap: Record<EntityType, () => any> = {
    quiz: () => ({
      '@context': 'https://schema.org',
      '@type': 'Quiz',
      name: entity.name,
      description,
      url,
      provider: {
        '@type': 'Organization',
        name: 'Modeh',
        url: baseUrl
      }
    }),
    grade: () => ({
      '@context': 'https://schema.org',
      '@type': 'EducationEvent',
      name: `${entity.name} - Grade Level`,
      description,
      url,
      organizer: {
        '@type': 'Organization',
        name: 'Modeh',
        url: baseUrl
      }
    }),
    subject: () => ({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: entity.name,
      description,
      url,
      provider: {
        '@type': 'Organization',
        name: 'Modeh',
        url: baseUrl
      }
    }),
    level: () => ({
      '@context': 'https://schema.org',
      '@type': 'EducationEvent',
      name: `${entity.name} - Learning Level`,
      description,
      url,
      organizer: {
        '@type': 'Organization',
        name: 'Modeh',
        url: baseUrl
      }
    }),
    topic: () => ({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: entity.name,
      description,
      url,
      publisher: {
        '@type': 'Organization',
        name: 'Modeh',
        url: baseUrl
      }
    })
    ,
    tournament: () => ({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: entity.name,
      description,
      url,
      startDate: entity.start_date || entity.created_at || undefined,
      organizer: {
        '@type': 'Organization',
        name: 'Modeh',
        url: baseUrl
      }
    })
  }

  return schemaMap[entityType]()
}

/**
 * Generate Open Graph meta tags
 */
function generateOpenGraph(entity: SeoEntity, entityType: EntityType, baseUrl: string): Record<string, string> {
  return {
    'og:title': entity.name,
    'og:description': generateDescription(entity, entityType),
    'og:url': `${baseUrl}${generateSeoUrl(entity, entityType)}`,
    'og:type': 'website',
    ...(entity.image && { 'og:image': entity.image })
  }
}

/**
 * Generate Twitter Card meta tags
 */
function generateTwitterCard(entity: SeoEntity, entityType: EntityType): Record<string, string> {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': entity.name,
    'twitter:description': generateDescription(entity, entityType),
    ...(entity.image && { 'twitter:image': entity.image })
  }
}

/**
 * Extract ID from entity for API calls (since API uses ID)
 */
export function extractIdFromEntity(entity: SeoEntity): string | number {
  return entity.id
}

/**
 * Canonical URL for entity
 */
function generateCanonicalUrl(entity: SeoEntity, entityType: EntityType, baseUrl: string): string {
  return `${baseUrl}${generateSeoUrl(entity, entityType)}`
}

/**
 * Vue Composable for SEO handling
 * Use this in page components to set up meta tags and structured data
 */
export default function useSeo() {
  return {
    generateSeoUrl,
    generateTitle,
    generateDescription,
    generateKeywords,
    generateJsonLd,
    generateOpenGraph,
    generateTwitterCard,
    extractIdFromEntity,
    generateCanonicalUrl,

    /**
     * Setup SEO for collection pages (e.g., /tournaments)
     */
    setupCollectionSeo(title: string, description: string, baseUrl: string, path = '/') {
      const canonical = `${baseUrl}${path}`
      const meta = [
        { name: 'description', content: description },
        { name: 'og:title', content: title },
        { name: 'og:description', content: description },
        { name: 'og:url', content: canonical },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description }
      ]

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url: canonical
      }

      useHead({
        title,
        meta,
        link: [{ rel: 'canonical', href: canonical }],
        script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(jsonLd) }]
      })
    },

    /**
     * Setup complete SEO for an entity page
     * @param entity - Entity to generate SEO for
     * @param entityType - Type of entity
     * @param baseUrl - Base URL of the site
     */
    setupPageSeo(entity: SeoEntity, entityType: EntityType, baseUrl: string) {
      if (!entity || (!entity.slug && !entity.id)) {
        console.warn('useSeo: Entity should have id or slug')
        return
      }

      const title = generateTitle(entity, entityType)
      const description = generateDescription(entity, entityType)
      const keywords = generateKeywords(entity, entityType)
      const jsonLd = generateJsonLd(entity, entityType, baseUrl)
      const openGraph = generateOpenGraph(entity, entityType, baseUrl)
      const twitterCard = generateTwitterCard(entity, entityType)
      const canonical = `${baseUrl}${generateSeoUrl(entity, entityType)}`

      const meta = [
        {
          name: 'description',
          content: description
        },
        {
          name: 'keywords',
          content: keywords
        },
        {
          name: 'og:title',
          content: openGraph['og:title']
        },
        {
          name: 'og:description',
          content: openGraph['og:description']
        },
        {
          name: 'og:url',
          content: openGraph['og:url']
        },
        {
          name: 'og:type',
          content: openGraph['og:type']
        },
        ...(openGraph['og:image'] ? [{ name: 'og:image', content: openGraph['og:image'] }] : []),
        {
          name: 'twitter:card',
          content: twitterCard['twitter:card']
        },
        {
          name: 'twitter:title',
          content: twitterCard['twitter:title']
        },
        {
          name: 'twitter:description',
          content: twitterCard['twitter:description']
        },
        ...(twitterCard['twitter:image'] ? [{ name: 'twitter:image', content: twitterCard['twitter:image'] }] : [])
      ]

      const link = [
        {
          rel: 'canonical',
          href: canonical
        }
      ]

      useHead({
        title,
        meta,
        link,
        script: [
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify(jsonLd)
          }
        ]
      })
    }
  }
}
