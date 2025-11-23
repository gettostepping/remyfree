'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClapperboard,
  faFilm,
  faTv,
  faUser,
  faChevronDown,
  faSignOutAlt,
  faCog,
  faUserCircle,
  faShield,
  faRocket,
  faSearch
} from '@fortawesome/free-solid-svg-icons'

interface AdminData {
  isOwner: boolean
  isDeveloper: boolean
  isAdmin: boolean
  isTrialMod: boolean
  roles: string[]
  uid: number
}

export default function Header() {
  // Authentication disabled: treat as unauthenticated by default
  const session: any = null
  const status = 'unauthenticated'
  const pathname = usePathname()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userUid, setUserUid] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number } | null>(null)
  const previousPositionRef = useRef<{ left: number; width: number } | null>(null)
  const [shouldAnimate, setShouldAnimate] = useState(true)
  const [showSearchBar, setShowSearchBar] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Dropdown close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
      // Don't close search bar if on explore page (it should always be visible)
      if (
        pathname !== '/search' &&
        searchInputRef.current &&
        !searchInputRef.current.parentElement?.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[data-explore-button]')
      ) {
        setShowSearchBar(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [pathname])

  // Focus search input when shown
  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearchBar])

  // Auto-open search bar on /explore
  useEffect(() => {
    if (pathname === '/search') {
      setShowSearchBar(true)
    } else {
      setShowSearchBar(false)
      setSearchQuery('')
    }
  }, [pathname])

  // Get user UID for profile link
  const hasFetchedProfileRef = useRef(false)
  useEffect(() => {
    if (session?.user?.email && !hasFetchedProfileRef.current) {
      hasFetchedProfileRef.current = true
      fetch('/api/profiles?email=' + encodeURIComponent(session.user.email))
        .then(res => res.json())
        .then(data => {
          if (data.user?.uid) setUserUid(data.user.uid.toString())
        })
        .catch(() => {})
        .finally(() => {
          setTimeout(() => { hasFetchedProfileRef.current = false }, 1000)
        })
    } else if (!session?.user?.email) {
      hasFetchedProfileRef.current = false
    }
  }, [session?.user?.email])

  // Fetch admin data
  const hasFetchedAdminRef = useRef(false)
  useEffect(() => {
    if (!session) {
      setAdminData(null)
      hasFetchedAdminRef.current = false
      return
    }
    if (hasFetchedAdminRef.current) return
    hasFetchedAdminRef.current = true
    async function fetchAdminStatus() {
      try {
        const res = await fetch('/api/admin/check')
        if (res.ok) {
          const data = await res.json()
          setAdminData(data)
        }
      } catch (error) {
        console.error('Failed to fetch admin status:', error)
      } finally {
        setTimeout(() => { hasFetchedAdminRef.current = false }, 1000)
      }
    }
    fetchAdminStatus()
  }, [session?.user?.email])

  // Animated tab indicator logic
  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current) return
      let activeLink = navRef.current.querySelector(`a[href="${pathname}"]`) as HTMLElement
      if (!activeLink) {
        const allLinks = navRef.current.querySelectorAll('a')
        for (const link of allLinks) {
          if (link.getAttribute('href') === pathname) {
            activeLink = link as HTMLElement
            break
          }
        }
      }
      if (activeLink) {
        const navRect = navRef.current.getBoundingClientRect()
        const linkRect = activeLink.getBoundingClientRect()
        const newStyle = {
          left: linkRect.left - navRect.left,
          width: linkRect.width
        }
        const prevPos = previousPositionRef.current
        if (prevPos && Math.abs(newStyle.left - prevPos.left) > 150) {
          setShouldAnimate(false)
          setIndicatorStyle(newStyle)
          previousPositionRef.current = newStyle
          setTimeout(() => setShouldAnimate(true), 50)
        } else {
          setShouldAnimate(true)
          setIndicatorStyle(newStyle)
          previousPositionRef.current = newStyle
        }
      }
    }
    updateIndicator()
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(updateIndicator)
    })
    window.addEventListener('resize', updateIndicator)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', updateIndicator)
    }
  }, [pathname])

  // Search handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push('/search')
    }
  }
  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (pathname === '/search') {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
    } else {
      setShowSearchBar(!showSearchBar)
    }
  }

  const adminCheck = adminData && (adminData.isAdmin || adminData.isDeveloper || adminData.isOwner || adminData.isTrialMod)

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 bg-neutral-900/70 backdrop-blur border-b border-neutral-800 min-h-[80px]"
    >
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between gap-2 flex-wrap">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl flex-shrink-0">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <FontAwesomeIcon icon={faClapperboard} className="text-2xl text-brand-400" />
            </motion.div>
            <span className="text-2xl font-black text-brand-400">Reminiscent</span>
          </Link>
        </motion.div>

        {/* Navigation */}
        <nav ref={navRef} className="flex items-center gap-2 flex-1 min-w-0 relative">
          {[
            { href: '/', icon: faClapperboard, label: 'Home' },
            { href: '/movies', icon: faFilm, label: 'Movies' },
            { href: '/tv', icon: faTv, label: 'TV Shows' },
            ...((adminData?.isDeveloper || adminData?.isAdmin || adminData?.isOwner)
              ? [{ href: '/anime', icon: faRocket, label: 'Anime' }]
              : []),
          ].map((item, index) => {
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${isActive ? 'text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'}`}
                >
                  <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </motion.div>
            )
          })}

          {/* Explore Button + Animated Search Bar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleExploreClick}
              data-explore-button
              className={`group/nav flex items-center gap-2 px-2 md:px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                pathname === '/search'
                  ? 'bg-brand-600 text-white scale-105'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50 hover:scale-105'
              }`}
            >
              <FontAwesomeIcon icon={faSearch} className="w-4 h-4 transition-transform duration-300 group-hover/nav:scale-110" />
              <span className="transition-all duration-300 hidden sm:inline">Explore</span>
            </button>
            {/* Animated Search Bar */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showSearchBar
                  ? 'max-w-[280px] md:max-w-[350px] opacity-100 ml-2'
                  : 'max-w-0 opacity-0 ml-0'
              }`}
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center h-full">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tracks, artists..."
                  className="bg-neutral-800/90 backdrop-blur-sm border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm w-full min-w-[200px] transition-all duration-300"
                  onBlur={(e) => {
                    if (
                      pathname !== '/search' &&
                      !e.currentTarget.parentElement?.contains(e.relatedTarget as Node) &&
                      !(e.relatedTarget as HTMLElement)?.closest('[data-explore-button]')
                    ) {
                      setTimeout(() => {
                        if (!searchQuery.trim()) {
                          setShowSearchBar(false)
                        }
                      }, 200)
                    }
                  }}
                />
              </form>
            </div>
          </div>

          {/* Animated tab indicator */}
          {indicatorStyle && indicatorStyle.width > 0 && (
            <motion.div
              className="absolute bg-brand-600 rounded-lg -z-10 h-full"
              initial={false}
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width
              }}
              transition={shouldAnimate
                ? {
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8,
                    bounce: 0.2
                  }
                : { duration: 0 }
              }
            />
          )}
        </nav>
      </div>
    </motion.header>
  )
}