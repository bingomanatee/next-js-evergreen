"use client"
import '~/app/globals.scss'
import { Inter } from 'next/font/google'
import { ChakraProviders } from '~/app/ChakraProviders'
import { useState } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import Messages from '~/components/Messages/Messages'
import { Noto_Serif, Space_Mono } from 'next/font/google'

const ns = Noto_Serif({
  weight: '500',
  subsets: ['latin'],
  variable: '--font-noto-serif',
  display: 'swap',
})

const sm = Space_Mono( {
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

const inter = Inter({ subsets: ['latin'] })

export default function Layout(
  {
    children,
    initialSession
  }: {
    children: React.ReactNode,
    initialSession: any
  }) {
  const [supabaseClient] = useState(() => createPagesBrowserClient())

  return (
    <html lang="en" className={[ns.variable, sm.variable].join(' ')}>
    <body className={inter.className}>
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={initialSession}
    >
      <ChakraProviders>
        {children}
        <Messages/>
      </ChakraProviders>
    </SessionContextProvider>
    </body>
    </html>
  )
}
