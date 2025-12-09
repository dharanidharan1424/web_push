import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await db.user.findUnique({
                    where: { email: credentials.email as string },
                })

                if (!user) {
                    return null
                }

                const isValid = await verifyPassword(
                    credentials.password as string,
                    user.password
                )

                if (!isValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session
        },
        async redirect({ url, baseUrl }) {
            // Use NEXT_PUBLIC_APP_URL if available, otherwise use baseUrl
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || baseUrl

            // If url is relative, prepend the app URL
            if (url.startsWith('/')) {
                return `${appUrl}${url}`
            }
            // If url is on the same origin, allow it
            else if (new URL(url).origin === appUrl) {
                return url
            }
            // Otherwise redirect to app URL
            return appUrl
        },
    },
})
