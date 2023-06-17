"use client"
import '~/app/globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '~/app/provider'
import { useEffect, useState } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { usePathname, useRouter } from 'next/navigation'
import ManagerProvider from '~/components/managers/ManagerProvider'
// import { useRouter } from 'next/router'

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
  const router = useRouter();

  useEffect(() => {
    window.addEventListener("message", (event) => {
      console.log('window message:', event);
    });
  }, []);

  return (
    <html lang="en">
    <body className={inter.className}>
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={initialSession}
    >
      <ManagerProvider>
      <Providers>{children}</Providers>
      </ManagerProvider>
    </SessionContextProvider>
    </body>
    </html>
  )
}
