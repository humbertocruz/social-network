import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/NavBar'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/providers/auth-provider'
import { ThemeProvider } from "@/providers/theme-provider";
import { I18nProvider } from '@/providers/i18n-provider';


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Vibe - No Lies',
  description: 'Connect authentically with people who matter',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vibe'
  },
}

export const viewport = {
  test: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}
  

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <I18nProvider>
          <AuthProvider>
            <ThemeProvider>
            <main>
              <Navbar />
              {children}
            </main>
            </ThemeProvider>
            <Toaster />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
