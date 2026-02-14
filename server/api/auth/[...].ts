import { NuxtAuthHandler } from '#auth'
import GoogleProviderImport from 'next-auth/providers/google'
import CredentialsProviderImport from 'next-auth/providers/credentials'
import { useRuntimeConfig } from '#imports'

const GoogleProvider: any = (GoogleProviderImport as any).default || GoogleProviderImport
const CredentialsProvider: any = (CredentialsProviderImport as any).default || CredentialsProviderImport

const createCookieConfig = (name: string, secure: boolean) => ({
  name,
  options: {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/',
  }
})

export default NuxtAuthHandler({
  ...(() => {
    const config = useRuntimeConfig()
    const secure = String(config.public.baseUrl).startsWith('https') || process.env.NODE_ENV === 'production'

    return {
  // Enable debug only in development
  debug: process.env.NODE_ENV === 'development' && process.env.NUXT_AUTH_DEBUG === 'true',
  
  secret: config.auth?.secret || (() => {
    throw new Error('NUXT_AUTH_SECRET is required')
  })(),
  
  pages: {
    signIn: '/login',
    error: '/auth/error',
    newUser: '/onboarding'
  },
  
  trustHost: true,
  basePath: '/api/auth',

  providers: [
    GoogleProvider({
      clientId: config.public.googleClientId,
      clientSecret: config.googleClientSecret,
      allowDangerousEmailAccountLinking: true,
    }),
    
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const apiBase = config.public.apiBase
          if (!apiBase) return null
          
          // First, ensure CSRF cookie is available for Sanctum
          await fetch(`${apiBase}/sanctum/csrf-cookie`, {
            credentials: 'include'
          })
          
          // Call Laravel login endpoint
          const res = await fetch(`${apiBase}/api/login`, {
            method: 'POST',
            credentials: 'include', // Include cookies to establish Laravel session
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              remember: true
            }),
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
              // CSRF token will be handled by Sanctum automatically with credentials: 'include'
            }
          })

          if (!res.ok) {
            return null
          }

          const data = await res.json()

          if (data && data.id) {
            // Return only minimal fields to be stored in the JWT
            return {
              id: String(data.id),
              apiToken: data.token
            }
          }
          return null
        } catch (e) {
          return null
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60
  },

  cookies: {
    sessionToken: createCookieConfig('authjs.session-token', secure),
    state: createCookieConfig('authjs.state', secure),
    callbackUrl: createCookieConfig('authjs.callback-url', secure),
    csrfToken: createCookieConfig('authjs.csrf-token', secure)
  },

  callbacks: {
    async redirect({ url, baseUrl }: any) {
      if (url.startsWith('/')) return url
      try {
        const urlObj = new URL(url)
        const baseUrlObj = new URL(baseUrl)
        if (urlObj.origin === baseUrlObj.origin) return url
      } catch (e) {
        // Invalid URL
      }
      return baseUrl
    },
    async jwt({ token, user, account, profile }: any) {
      if (user) {
        if (token.id && token.id !== user.id) return null
        token.id = user.id
        token.apiToken = (user as any).apiToken
      }

      if (account?.provider === 'google' && (!token.apiToken || token.apiToken === undefined)) {
        try {
          const apiBase = config.public.apiBase
          if (!apiBase) return token
          
          await fetch(`${apiBase}/sanctum/csrf-cookie`, {
            credentials: 'include'
          })
          
          const res = await fetch(`${apiBase}/api/auth/social-sync`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
              provider: 'google',
              id: (profile as any)?.sub || token.sub || '',
              email: token.email,
              name: token.name,
              image: token.picture
            })
          })
          
          if (res.ok) {
            const data = await res.json()
            token.apiToken = data.token
            if (data.user?.id) token.id = data.user.id
          }
        } catch (e) {
          // Continue without apiToken
        }
      }
      
      return token
    },
    async session({ session, token }: any) {
      try {
        const apiBase = config.public.apiBase
        if (!apiBase) return session
        if (token?.apiToken) {
          const res = await fetch(`${apiBase}/api/me`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token.apiToken}`
            }
          })

          if (res.ok) {
            const json = await res.json().catch(() => null)
            const userData = json && (json.user || json.data || json)
            if (userData) {
              session.user = userData
              if (token.apiToken) (session.user as any).apiToken = token.apiToken
              if (!session.user.id && token.id) session.user.id = token.id
              return session
            }
          }
        }
      } catch (e) {
        // Fall back to token data
      }

      if (token?.id || token?.apiToken) {
        session.user = session.user || {}
        if (token.id) (session.user as any).id = token.id
        if (token.apiToken) (session.user as any).apiToken = token.apiToken
      }
      return session
    }
  }
    }
  })()
} as any)
