import { NuxtAuthHandler } from '#auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NuxtAuthHandler({
  secret: process.env.NUXT_AUTH_SECRET || 'dev-secret-change-in-production',
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  trustHost: true,
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          redirect_uri: process.env.NUXT_AUTH_BASE_URL ? `${process.env.NUXT_AUTH_BASE_URL}/callback/google` : undefined
        }
      }
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
            console.error('[Auth] Login failed:', res.status, res.statusText)
            try {
              const errorData = await res.json()
              console.error('[Auth] Error details:', errorData)
            } catch (e) {
              console.error('[Auth] Could not parse error response')
            }
            return null
          }

          const data = await res.json()
          console.log('[Auth] Login response received:', { id: data.id, email: data.email, role: data.role })

          // Backend returns user data at top level: { id, name, email, role, image, token, ... }
          if (data && data.id) {
            return {
              id: String(data.id),
              name: data.name || data.email,
              email: data.email,
              role: data.role || 'user',
              image: data.image || data.avatar,
              // Store the API token from backend so we can use it for authenticated API calls
              apiToken: data.token
            }
          }
          return null
        } catch (e) {
          console.error('[Auth] authorize error:', e)
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
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        // Remove maxAge to let session control expiration
      }
    }
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.apiToken = (user as any).apiToken
        token.isNewUser = (user as any).isNewUser  
        token.isProfileCompleted = (user as any).is_profile_completed ?? (user as any).isProfileCompleted 
      }
      
      // For Google OAuth (account?.provider === 'google'), we need to fetch the apiToken from backend
      // if we don't have it yet
      if (account?.provider === 'google' && (!token.apiToken || token.apiToken === undefined)) {
        try {
          const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'https://admin.modeh.co.ke'
          console.log('[Auth] Google OAuth detected, fetching apiToken from backend...')
          
          // First ensure CSRF cookie
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
            token.isProfileCompleted = data.user?.is_profile_completed || data.isProfileCompleted
            console.log('[Auth] apiToken obtained from backend, isProfileCompleted:', token.isProfileCompleted)
          } else {
            console.warn('[Auth] Failed to fetch apiToken from backend:', res.status, res.statusText)
            // Don't fail the auth flow, just log the warning
          }
        } catch (e) {
          console.error('[Auth] Error fetching apiToken:', e)
          // Continue without apiToken - user may not be registered yet
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
        // Make the API token available to the frontend
        (session.user as any).apiToken = token.apiToken as string
        (session.user as any).isNewUser = token.isNewUser as boolean  
        (session.user as any).isProfileCompleted = token.isProfileCompleted as boolean
      }
      return session
    }
  }
})
