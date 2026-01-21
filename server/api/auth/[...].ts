import { NuxtAuthHandler } from '#auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { useRuntimeConfig } from '#imports'

export default NuxtAuthHandler({
  // Enable debug when NUXT_AUTH_DEBUG=true in environment (temporary for diagnostics)
  debug: process.env.NUXT_AUTH_DEBUG === 'true',
  secret: process.env.NUXT_AUTH_SECRET || 'dev-secret-change-in-production',
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  trustHost: true,
  // Ensure the base URL is explicitly set for production OAuth
  basePath: '/api/auth',
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR
    GoogleProvider.default({
      // Prefer environment variables, but fall back to Nuxt runtime config
      // values when available. This allows testing by wiring secrets into
      // `nuxt.config.ts`'s runtimeConfig during a build.
      clientId: process.env.GOOGLE_CLIENT_ID || useRuntimeConfig().googleClientId || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || useRuntimeConfig().googleClientSecret || '',
      allowDangerousEmailAccountLinking: true,
      // Explicitly set the callback URL - critical for production OAuth
      // This tells Google where to redirect after authentication
      callbackUrl: process.env.NUXT_AUTH_BASE_URL 
        ? `${process.env.NUXT_AUTH_BASE_URL}/callback/google` 
        : undefined
    }),
    // @ts-expect-error Use .default here for it to work during SSR
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'https://admin.modeh.co.ke'
          
          // First, ensure CSRF cookie is available for Sanctum
          await fetch(`${apiBase}/sanctum/csrf-cookie`, {
            credentials: 'include'
          })
          
          // Get CSRF token from cookie (server-side)
          const getXsrfToken = () => {
            // In server environment, we can't access document.cookie
            // The CSRF cookie should be available from the previous request
            return null // Let Sanctum handle it
          }
          
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
            return {
              id: String(data.id),
              name: data.name || data.email,
              email: data.email,
              role: data.role || 'user',
              image: data.image || data.avatar,
              // Store the API token from backend so we can use it for authenticated API calls
              apiToken: data.token,
              // Keep raw backend response for pass-through into session.user
              rawUser: data
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
    maxAge: 30 * 24 * 60 * 60,  // 30 days
    updateAge: 24 * 60 * 60  // Update session every 24 hours
  },
    cookies: {
      sessionToken: {
        name: `authjs.session-token`,
        options: {
          httpOnly: true,
          // Compute `secure` at runtime from runtime config so the built server
          // will correctly set cookie secure when deployed behind HTTPS.
          secure: (() => {
            try {
              const cfg = useRuntimeConfig()
              const base = (cfg?.app?.baseURL || cfg?.public?.baseUrl || '') as string
              return String(base).startsWith('https') || process.env.NODE_ENV === 'production'
            } catch (e) {
              return process.env.NODE_ENV === 'production'
            }
          })(),
          sameSite: 'lax',
          path: '/',
        }
      },
      // Ensure state and callback cookies share the same security settings
      // to avoid "State cookie was missing" errors during OAuth callbacks.
      state: {
        name: `authjs.state`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: (() => {
            try {
              const cfg = useRuntimeConfig()
              const base = (cfg?.app?.baseURL || cfg?.public?.baseUrl || '') as string
              return String(base).startsWith('https') || process.env.NODE_ENV === 'production'
            } catch (e) {
              return process.env.NODE_ENV === 'production'
            }
          })()
        }
      },
      callbackUrl: {
        name: `authjs.callback-url`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: (() => {
            try {
              const cfg = useRuntimeConfig()
              const base = (cfg?.app?.baseURL || cfg?.public?.baseUrl || '') as string
              return String(base).startsWith('https') || process.env.NODE_ENV === 'production'
            } catch (e) {
              return process.env.NODE_ENV === 'production'
            }
          })()
        }
      },
      csrfToken: {
        name: `authjs.csrf-token`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: (() => {
            try {
              const cfg = useRuntimeConfig()
              const base = (cfg?.app?.baseURL || cfg?.public?.baseUrl || '') as string
              return String(base).startsWith('https') || process.env.NODE_ENV === 'production'
            } catch (e) {
              return process.env.NODE_ENV === 'production'
            }
          })()
        }
      }
    },
  callbacks: {
    async jwt({ token, user, account, profile }: any) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.apiToken = (user as any).apiToken
        token.isNewUser = (user as any).isNewUser  
        token.isProfileCompleted = (user as any).is_profile_completed
        token.image = user.image || (user as any).avatar || (user as any).avatar_url
      }
      
      // For Google OAuth (account?.provider === 'google'), we need to fetch the apiToken from backend
      // if we don't have it yet
      if (account?.provider === 'google' && (!token.apiToken || token.apiToken === undefined)) {
        try {
          const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'https://admin.modeh.co.ke'
          
          await fetch(`${apiBase}/sanctum/csrf-cookie`, {
            credentials: 'include'
          })
          
          // Call the backend to get/create a Sanctum token for this user
          const res = await fetch(`${apiBase}/api/auth/social-sync`, {
            method: 'POST',
            credentials: 'include', // Include cookies to establish Laravel session
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
            token.isNewUser = data.isNewUser  
            token.role = data.role
            token.isProfileCompleted = data.is_profile_completed ?? undefined
            token.rawUser = data.user ?? data
          } else {
            try {
              await res.text()
            } catch (e) {
              // ignore read error
            }
            // Don't fail the auth flow, just log the warning
          }
        } catch (e) {
          // silently continue without apiToken
          // Continue without apiToken - user may not be registered yet
        }
      }
      
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
        // Make the API token available to the frontend
        (session.user as any).apiToken = token.apiToken as string
        (session.user as any).isNewUser = token.isNewUser as boolean  
        (session.user as any).isProfileCompleted = token.isProfileCompleted as boolean
        (session.user as any).image = token.image as string
        // Merge any raw backend response into session.user so frontend sees backend field names.
        if (token.rawUser && typeof token.rawUser === 'object') {
          Object.assign(session.user, token.rawUser)
        }
      }
      return session
    }
  }
  ,
  events: {} as any
} as any)
