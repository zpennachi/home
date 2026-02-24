"use client";

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ThemeToggle } from '@/components/work/ThemeToggle'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function NewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/new/admin');


  return (
    <>
      {!isAdmin && <Header />}
      <div className={cn("flex-grow", !isAdmin && "pt-24 pb-12")}>
        {children}
      </div>
      {!isAdmin && <Footer />}
      {!isAdmin && <ThemeToggle />}
    </>
  )
}
