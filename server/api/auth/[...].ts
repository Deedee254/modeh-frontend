import { NuxtAuthHandler } from '#auth'
import { useRuntimeConfig } from '#imports'
import GoogleProviderImport from 'next-auth/providers/google'
import CredentialsProviderImport from 'next-auth/providers/credentials'

const GoogleProvider: any = (GoogleProviderImport as any).default || GoogleProviderImport
const CredentialsProvider: any = (CredentialsProviderImport as any).default || CredentialsProviderImport

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
      GoogleProvider({
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
    CredentialsProvider({
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
      // Keep JWT minimal: only `id` and `apiToken` are stored here.
      if (user) {
        if (token.id && token.id !== user.id) {
          // Token id mismatch — reject to avoid overwriting a valid token
          return null as any
        }

        token.id = user.id
        token.apiToken = (user as any).apiToken
      }

      // For Google OAuth, obtain an API token via social-sync if not present
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
            // Prefer authoritative id if returned
            if (data.user && data.user.id) token.id = data.user.id
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
      // Replace session.user with authoritative profile from the backend (/api/me)
      // Use personal access token if available to call /api/me; fallback to token id
      try {
        const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'https://admin.modeh.co.ke'
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
              // Ensure apiToken is preserved in the session so client-side useApi can find it
              if (token.apiToken) (session.user as any).apiToken = token.apiToken
              // Ensure id is present and matches token.id where possible
              if (!session.user.id && token.id) session.user.id = token.id
              return session
            }
          }
        }
      } catch (e) {
        // ignore and fall back
      }

      // Fallback: expose minimal token info to session.user so client can attempt validation
      if (token?.id || token?.apiToken) {
        session.user = session.user || {}
        if (token.id) (session.user as any).id = token.id
        if (token.apiToken) (session.user as any).apiToken = token.apiToken
      }
      return session
    }
  }
  ,
  events: {} as any
} as any)
