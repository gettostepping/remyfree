'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faCodeBranch } from '@fortawesome/free-solid-svg-icons'

// Update this version whenever you push a new update
const CURRENT_VERSION = '1.1.0'

// Update this content whenever you push a new update
const CHANGELOG_CONTENT = {
  version: CURRENT_VERSION,
  title: 'What\'s New',
  items: [
    'Introduced a shared jsonFetcher + useAdminUsers hook so every admin dropdown and tool reuses the same cached user list instead of spamming /api/admin/users.',
    'Upgraded dropdown UX: they auto-close when another opens, reopen immediately after scrolling, stay visible while you scroll inside them, and respect layering so they never wiggle or lag.',
    'Hooked the Create Individual Invites panel into the new dropdown plumbing, giving it the same fast filtering, scroll handling, and event coordination as the rest of the control panel.',
    'Moved System Dashboard to SWR so admin stats refresh on a single shared interval, reducing duplicate API work while keeping the cards in sync.',
    'Removed the extra presence heartbeat from providers.tsx—PresenceHeartbeat now owns the loop—cutting duplicate POSTs and improving overall responsiveness.',
    'Polished admin styling and flow: the Delete User quick action now matches our red action buttons, and changelog + invite modals appear sequentially so they never overlap.',
    'Redesigned the Invitations area and added the mass-invite message modal so we can send announcements with invites, preview them safely, and keep the styling consistent with the new control panel.',
    'Various bug fixes and performance improvements across the dashboard.'
  ]
}

export default function ChangelogModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if this version has been seen
    const lastSeenVersion = localStorage.getItem('changelog_last_seen_version')
    
    // If the current version hasn't been seen, show the modal
    if (lastSeenVersion !== CURRENT_VERSION) {
      setIsOpen(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const eventName = isOpen ? 'changelogOpen' : 'changelogClosed'
    window.dispatchEvent(new Event(eventName))
    ;(window as any).__changelogOpen = isOpen
  }, [isOpen])

  const handleClose = () => {
    setIsOpen(false)
    // Mark this version as seen
    localStorage.setItem('changelog_last_seen_version', CURRENT_VERSION)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-neutral-900/95 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col">
              {/* Header */}
              <motion.div 
                className="p-6 border-b border-neutral-800 flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-brand-500/30 flex items-center justify-center hover:border-brand-500/50 hover:shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all duration-200">
                    <FontAwesomeIcon icon={faCodeBranch} className="text-brand-400 w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {CHANGELOG_CONTENT.title}
                    </h2>
                    <p className="text-xs text-brand-400/70 mt-0.5 font-mono">
                      v{CHANGELOG_CONTENT.version}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-neutral-400 hover:text-brand-400 transition-colors p-1.5 hover:bg-neutral-800 rounded-md"
                  aria-label="Close"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                </button>
              </motion.div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <ul className="space-y-3">
                  {CHANGELOG_CONTENT.items.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ 
                        delay: index * 0.03,
                        duration: 0.2
                      }}
                      className="flex items-start gap-3 group"
                    >
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 group-hover:scale-125 group-hover:shadow-[0_0_8px_rgba(139,92,246,0.6)] transition-all duration-200" />
                      <span className="text-sm text-neutral-300 leading-relaxed group-hover:text-brand-300 transition-colors duration-200">
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-800 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="px-8 py-2.5 bg-brand-600 hover:bg-brand-500 border border-brand-500/50 hover:border-brand-400 hover:shadow-[0_0_16px_rgba(139,92,246,0.4)] text-white text-sm font-medium rounded-md transition-all duration-200"
                >
                  Continue
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

