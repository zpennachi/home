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
    const [isZoomed, setIsZoomed] = useState(false)
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 }) // Normalized coords (0 to 1)
    const containerRef = useRef<HTMLDivElement>(null)

    const ZOOM_SCALE = 3 // 3x scale zoom

    useEffect(() => {
        if (!containerRef.current) return

        const updateImageList = () => {
            if (!containerRef.current) return
            const imgElements = Array.from(containerRef.current.querySelectorAll('img'))
            const contentImages = imgElements.filter(img => {
                const src = img.getAttribute('src') || ''
                const rect = img.getBoundingClientRect()
                
                const isTiny = (rect.width > 0 && rect.width < 48) || (rect.height > 0 && rect.height < 48)
                const isSvg = src.includes('.svg') || src.startsWith('data:image/svg+xml')
                const isFooterLink = img.closest('footer') !== null

                return src && !isTiny && !isSvg && !isFooterLink
            })

            const srcList = contentImages.map(img => img.getAttribute('src') || '')
            setImages(srcList)
        }

        updateImageList()
        const timer = setTimeout(updateImageList, 1000)

        const handleImgClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (target.tagName === 'IMG') {
                const src = target.getAttribute('src')
                const isFooterLink = target.closest('footer') !== null
                
                if (src && !isFooterLink && !src.includes('.svg') && !src.startsWith('data:image/svg+xml')) {
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
                        setIsZoomed(false) // Reset zoom state when opening
                        setMousePos({ x: 0.5, y: 0.5 })
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
        setIsZoomed(false)
        setMousePos({ x: 0.5, y: 0.5 })
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const handlePrev = () => {
        if (images.length === 0) return
        setIsZoomed(false)
        setMousePos({ x: 0.5, y: 0.5 })
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed) return
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const px = Math.max(0, Math.min(1, x / rect.width))
        const py = Math.max(0, Math.min(1, y / rect.height))
        setMousePos({ x: px, y: py })
    }

    const toggleZoom = () => {
        setIsZoomed(!isZoomed)
        setMousePos({ x: 0.5, y: 0.5 })
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
                        {/* Control Actions (Stacked right-aligned) */}
                        <div className="absolute top-6 right-6 flex items-center gap-3 z-[110]">
                            {/* Zoom Toggle */}
                            <button
                                onClick={toggleZoom}
                                className="px-4 py-2.5 text-[10px] font-mono lowercase tracking-wider text-white/50 hover:text-white transition-colors cursor-pointer rounded-none border border-white/10 hover:border-white/40 bg-black/40"
                            >
                                {isZoomed ? '[ fit ]' : '[ zoom ]'}
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    setIsOpen(false)
                                    setIsZoomed(false)
                                }}
                                className="p-3 text-white/50 hover:text-white transition-colors cursor-pointer rounded-none border border-white/10 hover:border-white/40 bg-black/40"
                                aria-label="close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Left Arrow (Hidden when zoomed for clean panning) */}
                        {!isZoomed && (
                            <button
                                onClick={handlePrev}
                                className="absolute left-6 p-4 text-white/50 hover:text-white transition-colors cursor-pointer rounded-none border border-white/10 hover:border-white/40 bg-black/40 z-[110]"
                                aria-label="previous image"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        {/* Center Image Viewport */}
                        <div 
                            className="w-full max-w-6xl h-[80vh] px-4 flex items-center justify-center relative overflow-hidden cursor-crosshair"
                            onMouseMove={handleMouseMove}
                            onClick={toggleZoom}
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentIndex}
                                    src={images[currentIndex]}
                                    alt={`project visual ${currentIndex + 1}`}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: isZoomed ? ZOOM_SCALE : 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.15, ease: 'easeInOut' }}
                                    style={{
                                        transformOrigin: isZoomed ? `${mousePos.x * 100}% ${mousePos.y * 100}%` : 'center center'
                                    }}
                                    className="max-w-full max-h-full object-contain pointer-events-none"
                                />
                            </AnimatePresence>
                        </div>

                        {/* Right Arrow (Hidden when zoomed for clean panning) */}
                        {!isZoomed && (
                            <button
                                onClick={handleNext}
                                className="absolute right-6 p-4 text-white/50 hover:text-white transition-colors cursor-pointer rounded-none border border-white/10 hover:border-white/40 bg-black/40 z-[110]"
                                aria-label="next image"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}

                        {/* Minimap Viewport / Navigator (Comes up on the right when zoomed) */}
                        <AnimatePresence>
                            {isZoomed && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="fixed right-6 top-24 z-[120] flex flex-col items-end gap-2"
                                >
                                    <span className="text-[8px] font-mono text-white/40 uppercase tracking-[0.2em]">viewport map</span>
                                    <div className="relative border border-white/20 bg-black/80 p-1 inline-block">
                                        <div className="relative">
                                            <img
                                                src={images[currentIndex]}
                                                alt="minimap overview"
                                                className="w-32 h-auto max-h-32 object-contain opacity-30 pointer-events-none"
                                            />
                                            {/* Tactical Viewport Indicator Box */}
                                            <div
                                                className="absolute border border-accent bg-accent/5 pointer-events-none transition-all duration-75"
                                                style={{
                                                    width: `${(1 / ZOOM_SCALE) * 100}%`,
                                                    height: `${(1 / ZOOM_SCALE) * 100}%`,
                                                    left: `${mousePos.x * (100 - (1 / ZOOM_SCALE) * 100)}%`,
                                                    top: `${mousePos.y * (100 - (1 / ZOOM_SCALE) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

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
