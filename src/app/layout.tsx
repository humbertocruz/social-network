import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { AuthProvider } from '@/providers/auth-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vibe - No Lies',
  description: 'A social network for authentic connections',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <main>
            <Navbar />
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
