'use client'

import { useState, ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import TopBar from './TopBar'
import SidebarDrawer from './SidebarDrawer'
import Navigation from './Navigation'

interface DrawerLayoutProps {
  children: ReactNode
}

export default function DrawerLayout({ children }: DrawerLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on route changes
  useEffect(() => {
    setIsDrawerOpen(false)
  }, [pathname])

  const handleMenuToggle = () => {
    setIsDrawerOpen(prev => !prev)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
  }

  return (
    <>
      <TopBar onMenuToggle={handleMenuToggle} isMenuOpen={isDrawerOpen} />
      
      <SidebarDrawer open={isDrawerOpen} onClose={handleDrawerClose}>
        <Navigation onLinkClick={handleDrawerClose} />
      </SidebarDrawer>

      <main className="pt-16 min-h-screen bg-base-100">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </>
  )
}