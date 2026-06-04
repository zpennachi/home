"use client";

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import TreeBackground3D from '@/components/work/TreeBackground3D'
import { useState, useRef } from 'react'
import { TreePine, X, Scan } from 'lucide-react'
import { Toaster, toast } from 'sonner'

export default function NewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/new/admin');
  const isHome = pathname === '/new';
  const showTree = pathname === '/new' || pathname === '/new/work' || pathname === '/new/about' || pathname === '/new/contact';

  const [isTreeMode, setIsTreeMode] = useState(false);
  const modelViewerRef = useRef<any>(null);

  // Different static heights for different page views:
  // - Work: high canopy branches (0.95)
  // - About: lower-middle trunk (0.65)
  // - Contact: roots base (0.25)
  let treeScrollPercent: number | undefined = undefined;
  if (pathname === '/new/work') {
    treeScrollPercent = 0.95;
  } else if (pathname === '/new/about') {
    treeScrollPercent = 0.65;
  } else if (pathname === '/new/contact') {
    treeScrollPercent = 0.25;
  }

  const triggerAR = () => {
    if (modelViewerRef.current) {
      // Check support if property exists
      if ('canActivateAR' in modelViewerRef.current && !modelViewerRef.current.canActivateAR) {
        toast.error("AR is not supported on this device. Try opening this page on iOS Safari or Android Chrome.", {
          duration: 5000,
          style: {
            background: 'rgba(20, 20, 25, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f3f4f6',
            backdropFilter: 'blur(10px)',
          }
        });
        return;
      }
      toast.message("Launching AR Mode...", {
        description: "Point your camera to a flat surface and move it slightly.",
        duration: 4000,
        style: {
          background: 'rgba(20, 20, 25, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#f3f4f6',
          backdropFilter: 'blur(10px)',
        }
      });
      modelViewerRef.current.activateAR();
    } else {
      toast.error("AR library is still loading. Please wait a second and try again.");
    }
  };

  // Typecast string to any to bypass TypeScript custom-element compilation error
  const ModelViewer = 'model-viewer' as any;

  return (
    <>
      <Toaster position="top-center" />
      {!isAdmin && !isTreeMode && <Header />}
      {!isAdmin && showTree && (
        <>
          <TreeBackground3D 
            mode={isHome ? 'scroll' : 'static'} 
            scrollPercent={treeScrollPercent} 
            interactive={isTreeMode} 
          />
          {/* Subtle mobile readability mask (frosted lens filter over the 3D background canvas), hidden in tree mode */}
          <div className={cn(
            "fixed inset-0 bg-background/35 backdrop-blur-[1px] md:hidden z-0 pointer-events-none transition-opacity duration-500",
            isTreeMode ? "opacity-0" : "opacity-100"
          )} />
        </>
      )}
      <div className={cn(
        "flex-grow transition-all duration-500", 
        !isAdmin && "pt-24 pb-12",
        isTreeMode && "opacity-0 pointer-events-none scale-98"
      )}>
        {children}
      </div>
      {!isAdmin && !isTreeMode && <Footer />}

      {/* Floating Action Bar (Mobile Only) */}
      {!isAdmin && showTree && (
        <div className="fixed bottom-6 right-6 z-50 md:hidden flex items-center gap-3">
          {isTreeMode ? (
            <>
              {/* Exit Tree Mode Button (on the left) */}
              <button
                onClick={() => setIsTreeMode(false)}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-foreground text-background shadow-2xl border border-muted/20 hover:scale-105 active:scale-95 transition-all cursor-pointer pointer-events-auto"
                aria-label="Exit Tree Mode"
              >
                <X className="w-5 h-5" />
              </button>

              {/* AR Mode Button (on the right, same spot as tree icon) */}
              <button
                onClick={triggerAR}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-foreground text-background shadow-2xl border border-muted/20 hover:scale-105 active:scale-95 transition-all cursor-pointer pointer-events-auto"
                aria-label="View in Augmented Reality (AR)"
                title="View in AR"
              >
                <Scan className="w-5 h-5" />
              </button>
            </>
          ) : (
            /* Tree Mode Toggle Button (on the right) */
            <button
              onClick={() => setIsTreeMode(true)}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-foreground text-background shadow-2xl border border-muted/20 hover:scale-105 active:scale-95 transition-all cursor-pointer pointer-events-auto"
              aria-label="Enter Tree Mode"
            >
              <TreePine className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Hidden model-viewer element required to bootstrap WebXR / AR Quick Look sessions */}
      {showTree && (
        <ModelViewer
          ref={modelViewerRef}
          src="/models/two_cedar_trees.glb"
          ios-src="/models/two_cedar_trees.usdz"
          ar
          ar-modes="webxr scene-viewer quick-look"
          style={{ display: 'none' }}
        />
      )}
    </>
  )
}
