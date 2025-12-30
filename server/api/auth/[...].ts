import { NuxtAuthHandler } from '#auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { sendVerificationRequest } from '~/server/utils/email'

export default NuxtAuthHandler({
  secret: process.env.NUXT_AUTH_SECRET || 'dev-secret-change-in-production',
  pages: {
    signIn: '/login',
  },
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    }),
    // @ts-expect-error Use .default here for it to work during SSR
    EmailProvider.default({
      server: {
        host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER || '',
          pass: process.env.EMAIL_SERVER_PASSWORD || ''
        }
      },
      from: process.env.EMAIL_FROM || 'noreply@modeh.co.ke',
      sendVerificationRequest
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
          
          // Call Laravel login endpoint
          const res = await fetch(`${apiBase}/api/login`, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              remember: true
            }),
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          })

          const user = await res.json()

          if (res.ok && user) {
            // Return user object which will be saved in the JWT
            // Laravel usually returns { user: { id, name, email, ... }, token: '...' }
            // or just the user object depending on setup.
            const userData = user.user || user.data || user
            return {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              image: userData.avatar || userData.image
            }
          }
          return null
        } catch (e) {
          console.error('Auth error:', e)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
      }
      return session
    }
  }
})
