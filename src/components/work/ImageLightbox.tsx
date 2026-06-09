'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface ImageLightboxProps {
    children: React.ReactNode
}

export function ImageLightbox({ children }: ImageLightboxProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [images, setImages] = useState<string[]>([])
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        // Find all content image elements inside the container.
        // We filter out tiny icons/avatars (width/height < 48px) and common UI decoration SVGs.
        const updateImageList = () => {
            if (!containerRef.current) return
            const imgElements = Array.from(containerRef.current.querySelectorAll('img'))
            const contentImages = imgElements.filter(img => {
                const src = img.getAttribute('src') || ''
                const rect = img.getBoundingClientRect()
                
                // Exclude tiny layout icons, SVGs, or avatars
                const isTiny = (rect.width > 0 && rect.width < 48) || (rect.height > 0 && rect.height < 48)
                const isSvg = src.includes('.svg') || src.startsWith('data:image/svg+xml')
                // Exclude other project thumbnails in the footer if we only want main case study images
                const isFooterLink = img.closest('footer') !== null

                return src && !isTiny && !isSvg && !isFooterLink
            })

            const srcList = contentImages.map(img => img.getAttribute('src') || '')
            setImages(srcList)
        }

        // Run once loaded
        updateImageList()

        // Also run a small timeout to handle late-loaded or hydrated client images
        const timer = setTimeout(updateImageList, 1000)

        const handleImgClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (target.tagName === 'IMG') {
                const src = target.getAttribute('src')
                const isFooterLink = target.closest('footer') !== null
                
                // Only open lightbox for non-footer, content images
                if (src && !isFooterLink && !src.includes('.svg') && !src.startsWith('data:image/svg+xml')) {
                    // Re-calculate lists in case of dynamic elements
                    const imgElements = Array.from(containerRef.current?.querySelectorAll('img') || [])
                    const contentImages = imgElements.filter(img => {
                        const s = img.getAttribute('src') || ''
                        const rect = img.getBoundingClientRect()
                        const isT = (rect.width > 0 && rect.width < 48) || (rect.height > 0 && rect.height < 48)
                        const isS = s.includes('.svg') || s.startsWith('data:image/svg+xml')
                        const isF = img.closest('footer') !== null
                        return s && !isT && !isS && !isF
                    })
                    const srcList = contentImages.map(img => img.getAttribute('src') || '')

                    const index = srcList.indexOf(src)
                    if (index !== -1) {
                        setImages(srcList)
                        setCurrentIndex(index)
                        setIsOpen(true)
                    }
                }
            }
        }

        const element = containerRef.current
        element.addEventListener('click', handleImgClick)

        return () => {
            clearTimeout(timer)
            element.removeEventListener('click', handleImgClick)
        }
    }, [children])

    // Keyboard controls
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false)
            } else if (e.key === 'ArrowRight') {
                handleNext()
            } else if (e.key === 'ArrowLeft') {
                handlePrev()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, currentIndex, images])

    const handleNext = () => {
        if (images.length === 0) return
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const handlePrev = () => {
        if (images.length === 0) return
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <div ref={containerRef} className="relative">
            {children}

            <AnimatePresence>
                {isOpen && images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-[2px] select-none"
                    >
                        {/* Close button (zero rounded corners, minimal outline) */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 p-3 text-white/50 hover:text-white transition-colors cursor-pointer rounded-none border border-white/10 hover:border-white/40 bg-black/40 z-[110]"
                            aria-label="close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Left arrow (zero rounded corners, minimal outline) */}
                        <button
                            onClick={handlePrev}
                            className="absolute left-6 p-4 text-white/50 hover:text-white transition-colors cursor-pointer rounded-none border border-white/10 hover:border-white/40 bg-black/40 z-[110]"
                            aria-label="previous image"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        {/* Center image viewport */}
                        <div className="w-full max-w-6xl h-[80vh] px-4 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentIndex}
                                    src={images[currentIndex]}
                                    alt={`project visual ${currentIndex + 1}`}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.15, ease: 'easeInOut' }}
                                    className="max-w-full max-h-full object-contain pointer-events-none"
                                />
                            </AnimatePresence>
                        </div>

                        {/* Right arrow (zero rounded corners, minimal outline) */}
                        <button
                            onClick={handleNext}
                            className="absolute right-6 p-4 text-white/50 hover:text-white transition-colors cursor-pointer rounded-none border border-white/10 hover:border-white/40 bg-black/40 z-[110]"
                            aria-label="next image"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Monospace lowercase index indicator */}
                        <div className="absolute bottom-6 text-white/40 font-mono text-[10px] uppercase tracking-[0.2em]">
                            [ {currentIndex + 1} / {images.length} ]
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
