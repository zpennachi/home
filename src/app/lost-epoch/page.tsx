"use client";

import { useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Sliders, 
  RefreshCw, 
  Type, 
  Layers, 
  Sparkles, 
  ArrowLeft,
  Settings
} from 'lucide-react';
import Link from 'next/link';

// Import optimized Google Fonts matching the brutalist/acid aesthetic
import { Syncopate, Space_Grotesk, Unbounded, Syne } from 'next/font/google';

const syncopate = Syncopate({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-syncopate',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-unbounded',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

export default function LostEpochPage() {
  // Colorway states
  const [colors, setColors] = useState({
    bg: '#0a0b0a',       // Obsidian Base
    sage: '#d2dfc4',     // Lost Epoch Sage
    coral: '#f0715c',    // Coral Accent
    muted: '#86887e',    // Monochrome Muted
  });

  // Customizer states
  const [titleText, setTitleText] = useState('LOST EPOCH'); // default title, customizable by user
  const [subtitleText, setSubtitleText] = useState('the lost epoch collection.');
  const [titleFont, setTitleFont] = useState<'syncopate' | 'unbounded' | 'syne' | 'spaceGrotesk'>('syncopate');
  const [subtitleFont, setSubtitleFont] = useState<'spaceGrotesk' | 'inter' | 'mono'>('spaceGrotesk');
  const [grainOpacity, setGrainOpacity] = useState(0.22);
  const [sculptureContrast, setSculptureContrast] = useState(1.2);
  const [sculptureBrightness, setSculptureBrightness] = useState(0.85);
  const [tunnelSpeed, setTunnelSpeed] = useState(8); 
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isTunnelAnimated, setIsTunnelAnimated] = useState(true);

  // Copy color helper
  const copyToClipboard = (colorHex: string, colorName: string) => {
    navigator.clipboard.writeText(colorHex);
    setCopiedColor(colorName);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Preset reset
  const resetToDefault = () => {
    setColors({
      bg: '#0a0b0a',
      sage: '#d2dfc4',
      coral: '#f0715c',
      muted: '#86887e',
    });
    setTitleText('LOST EPOCH');
    setSubtitleText('the lost epoch collection.');
    setTitleFont('syncopate');
    setSubtitleFont('spaceGrotesk');
    setGrainOpacity(0.22);
    setSculptureContrast(1.2);
    setSculptureBrightness(0.85);
    setTunnelSpeed(8);
  };

  // Resolve font class for rendering
  const getTitleFontClass = () => {
    switch(titleFont) {
      case 'syncopate': return syncopate.className;
      case 'unbounded': return unbounded.className;
      case 'syne': return syne.className;
      case 'spaceGrotesk': return spaceGrotesk.className;
      default: return syncopate.className;
    }
  };

  const getSubtitleFontClass = () => {
    switch(subtitleFont) {
      case 'spaceGrotesk': return spaceGrotesk.className;
      case 'inter': return 'font-sans'; // falls back to Inter from layout.tsx
      case 'mono': return 'font-mono'; // falls back to JetBrains Mono
      default: return spaceGrotesk.className;
    }
  };

  return (
    <div 
      className={`min-h-screen relative font-mono transition-colors duration-500 overflow-x-hidden selection:bg-[var(--selection-bg)] selection:text-[var(--selection-fg)] ${syncopate.variable} ${spaceGrotesk.variable} ${unbounded.variable} ${syne.variable}`}
      style={{ 
        backgroundColor: colors.bg,
        color: colors.sage,
        '--selection-bg': colors.coral,
        '--selection-fg': colors.bg,
      } as React.CSSProperties}
    >
      
      {/* SVG Grain Noise Filter Overlay */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
        <filter id="brutalist-grain">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.8" 
            numOctaves="4" 
            stitchTiles="stitch" 
          />
          <feColorMatrix 
            type="matrix" 
            values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 rgb(from var(--grain-opacity) r g b) 0" 
          />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </svg>

      {/* Grain Layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay"
        style={{
          filter: 'url(#brutalist-grain)',
          opacity: grainOpacity,
          backgroundColor: '#808080',
        }}
      />

      {/* Header Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-muted/25 relative z-10">
        <div className="flex items-center gap-4">
          <Link 
            href="/new" 
            className="flex items-center gap-2 text-xs uppercase tracking-widest hover:opacity-80 transition-opacity"
            style={{ color: colors.muted }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span 
            className="text-2xs font-mono px-2 py-0.5 rounded border border-muted/30 uppercase tracking-widest"
            style={{ color: colors.muted, borderColor: colors.muted }}
          >
            Type & Color Specimen
          </span>
          <span 
            className="text-2xs font-mono px-2 py-0.5 rounded border uppercase tracking-widest bg-coral/10"
            style={{ color: colors.coral, borderColor: colors.coral }}
          >
            v1.1
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-24 relative z-10">
        
        {/* SECTION 1: THE COMPOSITION RECREATION */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-muted/20 pb-4">
            <div>
              <span className="text-2xs uppercase tracking-[0.2em]" style={{ color: colors.muted }}>Composition Re-creation</span>
              <h2 className="text-xl font-bold font-sans uppercase tracking-tight">Interactive Layout</h2>
            </div>
            <div className="text-right font-mono text-2xs" style={{ color: colors.muted }}>
              Responsive Grid / CSS & SVG Delineation
            </div>
          </div>

          {/* THE BOARD */}
          <div 
            className="w-full max-w-4xl mx-auto border border-muted/30 overflow-hidden relative shadow-2xl transition-all duration-300"
            style={{ 
              borderColor: colors.muted + '40',
              backgroundColor: colors.bg
            }}
          >
            
            {/* Visual Header: Greek Bust and Angel Wheel */}
            <div className="grid grid-cols-12 border-b border-muted/20 relative min-h-[380px] overflow-hidden">
              
              {/* Coral Angels Wheel Overlay (Top Left) */}
              <div className="absolute top-4 left-6 z-20 w-24 h-24 md:w-32 md:h-32 opacity-95">
                <svg 
                  viewBox="0 0 100 100" 
                  className="w-full h-full animate-[spin_40s_linear_infinite]"
                  style={{ color: colors.coral }}
                >
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" fill="none" />
                  <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="0.25" fill="none" />
                  
                  {/* Cherub/Angel SVGs Arranged in a Circle */}
                  {[...Array(8)].map((_, i) => {
                    const angle = (i * 360) / 8;
                    return (
                      <g key={i} transform={`rotate(${angle} 50 50) translate(0 -36)`}>
                        <path 
                          d="M-4,0 C-4,-4 -1,-6 0,-6 C1,-6 4,-4 4,0 C4,4 1,6 0,6 C-1,6 -4,4 -4,0 Z M-3,-1 C-5,-2 -7,-1 -8,1 C-9,3 -8,5 -6,5 C-4,5 -3,3 -3,1 Z M3,-1 C5,-2 7,-1 8,1 C9,3 8,5 6,5 C4,5 3,3 3,1 Z M-1,5 C-2,8 0,10 0,10 C0,10 2,8 1,5 Z" 
                          fill="currentColor" 
                          transform="scale(0.7) translate(-1 -1)"
                        />
                      </g>
                    );
                  })}
                  
                  {/* Inner details */}
                  <polygon points="50,45 53,52 47,52" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <polygon points="50,55 53,48 47,48" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </svg>
              </div>

              {/* Main Bust Image Container */}
              <div className="col-span-12 flex items-center justify-center bg-black/60 relative h-[380px] md:h-[450px]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10 pointer-events-none" />
                
                {/* Bust Image */}
                <img 
                  src="/lost-epoch/classic_sculpture_bust.png" 
                  alt="Classical Greek Sculpture Bust" 
                  className="w-full h-full object-cover transition-all duration-300 select-none pointer-events-none"
                  style={{
                    filter: `grayscale(1) contrast(${sculptureContrast}) brightness(${sculptureBrightness}) sepia(0.06)`,
                  }}
                />
              </div>
            </div>

            {/* Middle Row: Typography, Line, Grid Tunnel */}
            <div className="p-6 md:p-8 space-y-6 relative border-b border-muted/20">
              
              {/* Header Title with stretch line & tunnel grid */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                
                {/* Title and Subtitle Block */}
                <div className="shrink-0 space-y-2 relative z-10">
                  <div className="flex items-center gap-2">
                    {/* Retro target crosshair */}
                    <div className="w-5 h-5 flex items-center justify-center relative opacity-80 shrink-0">
                      <div className="absolute w-full h-[0.5px]" style={{ backgroundColor: colors.sage }} />
                      <div className="absolute h-full w-[0.5px]" style={{ backgroundColor: colors.sage }} />
                      <div className="w-3.5 h-3.5 rounded-full border border-dashed" style={{ borderColor: colors.sage }} />
                    </div>

                    <h1 
                      className={`text-4xl md:text-5.5xl font-extrabold uppercase tracking-tighter leading-none select-all ${getTitleFontClass()}`}
                      style={{ 
                        color: colors.sage,
                        letterSpacing: titleFont === 'syncopate' ? '-0.07em' : '-0.04em'
                      }}
                    >
                      {titleText}
                    </h1>
                  </div>

                  <p 
                    className={`text-sm md:text-base tracking-tighter leading-none lowercase pl-7 select-all font-bold ${getSubtitleFontClass()}`}
                    style={{ color: colors.coral }}
                  >
                    {subtitleText}
                  </p>
                </div>

                {/* Horizontal Delineator Line */}
                <div 
                  className="hidden md:block grow h-[1px] mx-4 self-center opacity-60" 
                  style={{ backgroundColor: colors.sage }}
                />

                {/* Animated 3D Wireframe Tunnel Grid */}
                <div className="w-full md:w-96 h-20 md:h-24 overflow-hidden relative shrink-0 border border-muted/20 bg-black/30 rounded-sm">
                  <svg 
                    viewBox="0 0 300 100" 
                    preserveAspectRatio="none" 
                    className="w-full h-full"
                    style={{ color: colors.sage }}
                  >
                    {/* Radiating Perspective Lines from Vanishing Point on Left (60, 50) */}
                    {[...Array(24)].map((_, i) => {
                      const angle = (i * Math.PI * 2) / 24;
                      const x2 = 60 + Math.cos(angle) * 400;
                      const y2 = 50 + Math.sin(angle) * 400;
                      return (
                        <line 
                          key={`rad-${i}`}
                          x1="60" 
                          y1="50" 
                          x2={x2} 
                          y2={y2} 
                          stroke="currentColor" 
                          strokeWidth="0.5" 
                          opacity="0.35" 
                        />
                      );
                    })}

                    {/* Concentric rings sliding in perspective */}
                    {[...Array(12)].map((_, i) => {
                      return (
                        <g key={`ring-group-${i}`}>
                          <RingElement 
                            index={i} 
                            speed={tunnelSpeed} 
                            isAnimated={isTunnelAnimated} 
                            color={colors.sage} 
                          />
                        </g>
                      );
                    })}

                    {/* Vanishing Point Glow */}
                    <circle cx="60" cy="50" r="1.5" fill="currentColor" className="animate-pulse" />
                  </svg>
                </div>
              </div>

              {/* Japanese Philosophy block with flower icon */}
              <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-muted/10 items-start">
                
                {/* 5-Petal Flower Symbol */}
                <div className="shrink-0 w-10 h-10 mt-1" style={{ color: colors.sage }}>
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                    <path d="M50,38 C40,25 25,40 38,50 C25,60 40,75 50,62 C60,75 75,60 62,50 C75,40 60,25 50,38 Z" />
                    <circle cx="50" cy="50" r="5" className="fill-black" />
                  </svg>
                </div>

                {/* Japanese monologues */}
                <div className="space-y-2 max-w-xl">
                  <p 
                    className="text-[10px] md:text-xs leading-relaxed tracking-wider font-sans font-light text-justify"
                    style={{ color: colors.sage }}
                  >
                    すべてを失った時の軌跡を再び。もう立ち直れないと心に決めていたけれど、宇宙はいつも、私たちみんなにとって最後にはすべてがうまくいくようにする方法を見つけてくれる。これが自然の真の道——死と再生。
                  </p>
                  <p className="text-[9px] font-mono tracking-widest uppercase" style={{ color: colors.muted }}>
                    [ RE-EMERGENCE PROTOCOL // INDEX 089-B ]
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Section: Chariot and Three Horses */}
            <div className="relative min-h-[300px] md:min-h-[380px] bg-black/85 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
              
              <img 
                src="/lost-epoch/chariot_three_horses.png" 
                alt="Greek Statue Chariot Pull" 
                className="w-full h-full object-cover transition-all duration-300 select-none pointer-events-none"
                style={{
                  filter: `grayscale(1) contrast(${sculptureContrast}) brightness(${sculptureBrightness}) sepia(0.06)`,
                }}
              />
            </div>

          </div>
        </section>

        {/* SECTION 2: INTERACTIVE COLOR SWATCHES */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-muted/20 pb-4">
            <div>
              <span className="text-2xs uppercase tracking-[0.2em]" style={{ color: colors.muted }}>Design System</span>
              <h2 className="text-xl font-bold font-sans uppercase tracking-tight">Active Colorway</h2>
            </div>
            <div className="text-right font-mono text-2xs" style={{ color: colors.muted }}>
              Click Swatch to Copy Hex
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Swatch 1: Obsidian Base */}
            <div 
              onClick={() => copyToClipboard(colors.bg, 'Obsidian Base')}
              className="group cursor-pointer border border-muted/20 rounded-md p-4 space-y-4 hover:border-foreground/40 transition-all duration-300"
              style={{ backgroundColor: colors.bg === '#0a0b0a' ? 'rgba(255,255,255,0.02)' : colors.bg + '1A' }}
            >
              <div 
                className="w-full h-32 rounded border border-muted/30 relative flex items-end p-3 transition-transform duration-500 group-hover:scale-[1.02]" 
                style={{ backgroundColor: colors.bg }}
              >
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/60 text-white border border-white/10">
                  Background
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-wider font-bold" style={{ color: colors.sage }}>Obsidian Base</h3>
                  {copiedColor === 'Obsidian Base' ? (
                    <span className="text-2xs text-emerald-400 flex items-center gap-1 font-sans">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: colors.muted }} />
                  )}
                </div>
                <div className="text-2xs font-mono space-y-0.5" style={{ color: colors.muted }}>
                  <p>HEX: {colors.bg.toUpperCase()}</p>
                  <p>RGB: {hexToRgb(colors.bg)}</p>
                  <p>HSL: {hexToHsl(colors.bg)}</p>
                </div>
              </div>
            </div>

            {/* Swatch 2: Lost Epoch Sage */}
            <div 
              onClick={() => copyToClipboard(colors.sage, 'Lost Epoch Sage')}
              className="group cursor-pointer border border-muted/20 rounded-md p-4 space-y-4 hover:border-foreground/40 transition-all duration-300"
              style={{ backgroundColor: colors.bg === '#0a0b0a' ? 'rgba(255,255,255,0.02)' : colors.bg + '1A' }}
            >
              <div 
                className="w-full h-32 rounded border border-muted/30 relative flex items-end p-3 transition-transform duration-500 group-hover:scale-[1.02]" 
                style={{ backgroundColor: colors.sage }}
              >
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black text-white">
                  Primary Text / Accents
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-wider font-bold" style={{ color: colors.sage }}>Lost Epoch Sage</h3>
                  {copiedColor === 'Lost Epoch Sage' ? (
                    <span className="text-2xs text-emerald-400 flex items-center gap-1 font-sans">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: colors.muted }} />
                  )}
                </div>
                <div className="text-2xs font-mono space-y-0.5" style={{ color: colors.muted }}>
                  <p>HEX: {colors.sage.toUpperCase()}</p>
                  <p>RGB: {hexToRgb(colors.sage)}</p>
                  <p>HSL: {hexToHsl(colors.sage)}</p>
                </div>
              </div>
            </div>

            {/* Swatch 3: Coral Accent */}
            <div 
              onClick={() => copyToClipboard(colors.coral, 'Coral Accent')}
              className="group cursor-pointer border border-muted/20 rounded-md p-4 space-y-4 hover:border-foreground/40 transition-all duration-300"
              style={{ backgroundColor: colors.bg === '#0a0b0a' ? 'rgba(255,255,255,0.02)' : colors.bg + '1A' }}
            >
              <div 
                className="w-full h-32 rounded border border-muted/30 relative flex items-end p-3 transition-transform duration-500 group-hover:scale-[1.02]" 
                style={{ backgroundColor: colors.coral }}
              >
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black text-white">
                  Secondary Text
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-wider font-bold" style={{ color: colors.sage }}>Coral Accent</h3>
                  {copiedColor === 'Coral Accent' ? (
                    <span className="text-2xs text-emerald-400 flex items-center gap-1 font-sans">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: colors.muted }} />
                  )}
                </div>
                <div className="text-2xs font-mono space-y-0.5" style={{ color: colors.muted }}>
                  <p>HEX: {colors.coral.toUpperCase()}</p>
                  <p>RGB: {hexToRgb(colors.coral)}</p>
                  <p>HSL: {hexToHsl(colors.coral)}</p>
                </div>
              </div>
            </div>

            {/* Swatch 4: Monochrome Muted */}
            <div 
              onClick={() => copyToClipboard(colors.muted, 'Monochrome Muted')}
              className="group cursor-pointer border border-muted/20 rounded-md p-4 space-y-4 hover:border-foreground/40 transition-all duration-300"
              style={{ backgroundColor: colors.bg === '#0a0b0a' ? 'rgba(255,255,255,0.02)' : colors.bg + '1A' }}
            >
              <div 
                className="w-full h-32 rounded border border-muted/30 relative flex items-end p-3 transition-transform duration-500 group-hover:scale-[1.02]" 
                style={{ backgroundColor: colors.muted }}
              >
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black text-white">
                  Borders / Metadata
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-wider font-bold" style={{ color: colors.sage }}>Monochrome Muted</h3>
                  {copiedColor === 'Monochrome Muted' ? (
                    <span className="text-2xs text-emerald-400 flex items-center gap-1 font-sans">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: colors.muted }} />
                  )}
                </div>
                <div className="text-2xs font-mono space-y-0.5" style={{ color: colors.muted }}>
                  <p>HEX: {colors.muted.toUpperCase()}</p>
                  <p>RGB: {hexToRgb(colors.muted)}</p>
                  <p>HSL: {hexToHsl(colors.muted)}</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3: THE LIVE CUSTOMIZER */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-muted/20 pb-4">
            <div>
              <span className="text-2xs uppercase tracking-[0.2em]" style={{ color: colors.muted }}>Interactive Tool</span>
              <h2 className="text-xl font-bold font-sans uppercase tracking-tight">Design System Sandbox</h2>
            </div>
            <button 
              onClick={resetToDefault}
              className="flex items-center gap-1 text-2xs uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity border border-muted/30 px-2.5 py-1 rounded"
              style={{ color: colors.sage, borderColor: colors.muted + '40' }}
            >
              <RefreshCw className="w-3 h-3" /> Reset Mockup
            </button>
          </div>

          {/* Customizer Panel */}
          <div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-8 border rounded-md"
            style={{ 
              borderColor: colors.muted + '40',
              backgroundColor: colors.bg === '#0a0b0a' ? 'rgba(255, 255, 255, 0.01)' : 'transparent' 
            }}
          >
            
            {/* Column 1: Typography controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-muted/15 pb-2">
                <Type className="w-4 h-4" style={{ color: colors.coral }} />
                <h3 className="text-xs uppercase tracking-widest font-bold">Typography & Texts</h3>
              </div>
              
              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-2xs uppercase tracking-wider" style={{ color: colors.muted }}>
                  Title Text
                </label>
                <input 
                  type="text" 
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value.toUpperCase())}
                  placeholder="DARK DESIRE"
                  className="w-full text-xs font-mono p-2.5 rounded bg-black/40 border transition-all duration-300 focus:outline-none focus:border-foreground"
                  style={{ borderColor: colors.muted + '30', color: colors.sage }}
                />
              </div>

              {/* Title Font Selector */}
              <div className="space-y-1">
                <label className="text-2xs uppercase tracking-wider block" style={{ color: colors.muted }}>
                  Title Font Family
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'syncopate', label: 'Syncopate (Wide)' },
                    { id: 'unbounded', label: 'Unbounded' },
                    { id: 'syne', label: 'Syne (Curves)' },
                    { id: 'spaceGrotesk', label: 'Space Grotesk' }
                  ].map((fontOption) => (
                    <button
                      key={fontOption.id}
                      onClick={() => setTitleFont(fontOption.id as any)}
                      className={`text-2xs py-1.5 px-2 border rounded text-center transition-all ${
                        titleFont === fontOption.id 
                          ? 'border-current font-bold' 
                          : 'border-muted/30 opacity-70 hover:opacity-100'
                      }`}
                      style={{ color: titleFont === fontOption.id ? colors.coral : colors.sage }}
                    >
                      {fontOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitle Input */}
              <div className="space-y-1">
                <label className="text-2xs uppercase tracking-wider" style={{ color: colors.muted }}>
                  Subtitle Text
                </label>
                <input 
                  type="text" 
                  value={subtitleText}
                  onChange={(e) => setSubtitleText(e.target.value)}
                  placeholder="the lost epoch collection."
                  className="w-full text-xs font-mono p-2.5 rounded bg-black/40 border transition-all duration-300 focus:outline-none focus:border-foreground"
                  style={{ borderColor: colors.muted + '30', color: colors.coral }}
                />
              </div>

              {/* Subtitle Font Selector */}
              <div className="space-y-1">
                <label className="text-2xs uppercase tracking-wider block" style={{ color: colors.muted }}>
                  Subtitle Font Family
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'spaceGrotesk', label: 'Space Gro' },
                    { id: 'inter', label: 'Inter Sans' },
                    { id: 'mono', label: 'Monospace' }
                  ].map((fontOption) => (
                    <button
                      key={fontOption.id}
                      onClick={() => setSubtitleFont(fontOption.id as any)}
                      className={`text-2xs py-1.5 px-1.5 border rounded text-center transition-all ${
                        subtitleFont === fontOption.id 
                          ? 'border-current font-bold' 
                          : 'border-muted/30 opacity-70 hover:opacity-100'
                      }`}
                      style={{ color: subtitleFont === fontOption.id ? colors.coral : colors.sage }}
                    >
                      {fontOption.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Color Palette Swappers */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-muted/15 pb-2">
                <Layers className="w-4 h-4" style={{ color: colors.coral }} />
                <h3 className="text-xs uppercase tracking-widest font-bold">Colorway Adjustments</h3>
              </div>

              {/* Background Color */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <label className="text-2xs uppercase tracking-wider block" style={{ color: colors.muted }}>
                    Obsidian Base
                  </label>
                  <span className="text-2xs font-mono opacity-80">{colors.bg}</span>
                </div>
                <input 
                  type="color" 
                  value={colors.bg}
                  onChange={(e) => setColors({ ...colors, bg: e.target.value })}
                  className="w-10 h-10 rounded border cursor-pointer border-muted/30 bg-transparent"
                />
              </div>

              {/* Sage Accent */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <label className="text-2xs uppercase tracking-wider block" style={{ color: colors.muted }}>
                    Lost Epoch Sage
                  </label>
                  <span className="text-2xs font-mono opacity-80">{colors.sage}</span>
                </div>
                <input 
                  type="color" 
                  value={colors.sage}
                  onChange={(e) => setColors({ ...colors, sage: e.target.value })}
                  className="w-10 h-10 rounded border cursor-pointer border-muted/30 bg-transparent"
                />
              </div>

              {/* Coral Accent */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <label className="text-2xs uppercase tracking-wider block" style={{ color: colors.muted }}>
                    Coral Accent
                  </label>
                  <span className="text-2xs font-mono opacity-80">{colors.coral}</span>
                </div>
                <input 
                  type="color" 
                  value={colors.coral}
                  onChange={(e) => setColors({ ...colors, coral: e.target.value })}
                  className="w-10 h-10 rounded border cursor-pointer border-muted/30 bg-transparent"
                />
              </div>

              {/* Muted Lines */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <label className="text-2xs uppercase tracking-wider block" style={{ color: colors.muted }}>
                    Monochrome Muted
                  </label>
                  <span className="text-2xs font-mono opacity-80">{colors.muted}</span>
                </div>
                <input 
                  type="color" 
                  value={colors.muted}
                  onChange={(e) => setColors({ ...colors, muted: e.target.value })}
                  className="w-10 h-10 rounded border cursor-pointer border-muted/30 bg-transparent"
                />
              </div>
            </div>

            {/* Column 3: Texture & Animation Filters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-muted/15 pb-2">
                <Sparkles className="w-4 h-4" style={{ color: colors.coral }} />
                <h3 className="text-xs uppercase tracking-widest font-bold">Interactive Features</h3>
              </div>

              {/* Tunnel Animation Settings */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-2xs uppercase tracking-wider block" style={{ color: colors.muted }}>
                    Tunnel Animation Speed
                  </label>
                  <span className="text-2xs font-mono" style={{ color: colors.sage }}>
                    {isTunnelAnimated ? `${tunnelSpeed}s` : 'Paused'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="2" 
                    max="20" 
                    step="0.5"
                    value={tunnelSpeed} 
                    disabled={!isTunnelAnimated}
                    onChange={(e) => setTunnelSpeed(Number(e.target.value))}
                    className="grow h-1 bg-black/60 rounded-lg appearance-none cursor-pointer accent-current opacity-80"
                    style={{ color: colors.sage }}
                  />
                  <button
                    onClick={() => setIsTunnelAnimated(!isTunnelAnimated)}
                    className="text-2xs uppercase border px-2 py-0.5 rounded transition-colors"
                    style={{ 
                      borderColor: colors.muted + '40', 
                      backgroundColor: isTunnelAnimated ? 'transparent' : colors.coral + '22',
                      color: isTunnelAnimated ? colors.sage : colors.coral
                    }}
                  >
                    {isTunnelAnimated ? 'Pause' : 'Play'}
                  </button>
                </div>
              </div>

              {/* Grain Opacity Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-baseline">
                  <label className="text-2xs uppercase tracking-wider" style={{ color: colors.muted }}>
                    Photocopy Grain Opacity
                  </label>
                  <span className="text-2xs font-mono" style={{ color: colors.sage }}>
                    {Math.round(grainOpacity * 100)}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0.0" 
                  max="0.6" 
                  step="0.02"
                  value={grainOpacity} 
                  onChange={(e) => setGrainOpacity(Number(e.target.value))}
                  className="w-full h-1 bg-black/60 rounded-lg appearance-none cursor-pointer accent-current opacity-80"
                  style={{ color: colors.sage }}
                />
              </div>

              {/* Sculpture Contrast Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <label className="text-2xs uppercase tracking-wider" style={{ color: colors.muted }}>
                    Sculpture Contrast
                  </label>
                  <span className="text-2xs font-mono" style={{ color: colors.sage }}>
                    {sculptureContrast.toFixed(2)}x
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0.8" 
                  max="2.0" 
                  step="0.05"
                  value={sculptureContrast} 
                  onChange={(e) => setSculptureContrast(Number(e.target.value))}
                  className="w-full h-1 bg-black/60 rounded-lg appearance-none cursor-pointer accent-current opacity-80"
                  style={{ color: colors.sage }}
                />
              </div>

              {/* Sculpture Brightness Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <label className="text-2xs uppercase tracking-wider" style={{ color: colors.muted }}>
                    Sculpture Brightness
                  </label>
                  <span className="text-2xs font-mono" style={{ color: colors.sage }}>
                    {Math.round(sculptureBrightness * 100)}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0.4" 
                  max="1.3" 
                  step="0.05"
                  value={sculptureBrightness} 
                  onChange={(e) => setSculptureBrightness(Number(e.target.value))}
                  className="w-full h-1 bg-black/60 rounded-lg appearance-none cursor-pointer accent-current opacity-80"
                  style={{ color: colors.sage }}
                />
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 4: DESIGN SYSTEM TYPE SPECIMEN */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-muted/20 pb-4">
            <div>
              <span className="text-2xs uppercase tracking-[0.2em]" style={{ color: colors.muted }}>Typography Specimen</span>
              <h2 className="text-xl font-bold font-sans uppercase tracking-tight">Typography Hierarchy</h2>
            </div>
            <div className="text-right font-mono text-2xs" style={{ color: colors.muted }}>
              Syncopate / Space Grotesk / Unbounded / Syne
            </div>
          </div>

          <div 
            className="border border-muted/20 rounded-md overflow-hidden p-6 md:p-8 space-y-12"
            style={{ backgroundColor: colors.bg }}
          >
            {/* Syncopate Heavy Extended */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border-b border-muted/15 pb-8">
              <div className="space-y-1">
                <h4 className="text-2xs uppercase font-mono tracking-widest text-white/50">Font Family</h4>
                <p className="text-xs font-bold" style={{ color: colors.coral }}>Syncopate Bold</p>
                <p className="text-3xs" style={{ color: colors.muted }}>Ultra-wide geometric uppercase-only. Matches the layout screengrab title exactly.</p>
              </div>
              <div className="md:col-span-3 space-y-4">
                <span className="text-2xs font-mono" style={{ color: colors.muted }}>Syncopate // tracking-tighter uppercase</span>
                <h1 className="text-4xl md:text-5xl font-bold font-sans uppercase tracking-tighter leading-none select-all" style={{ fontFamily: 'var(--font-syncopate)', letterSpacing: '-0.07em' }}>
                  {titleText}
                </h1>
                <p className="text-2xs font-mono" style={{ color: colors.muted }}>
                  Character Set: ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                </p>
              </div>
            </div>

            {/* Unbounded Ultra Extended */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border-b border-muted/15 pb-8">
              <div className="space-y-1">
                <h4 className="text-2xs uppercase font-mono tracking-widest text-white/50">Font Family</h4>
                <p className="text-xs font-bold" style={{ color: colors.coral }}>Unbounded</p>
                <p className="text-3xs" style={{ color: colors.muted }}>Vibrant, highly extended typeface with unique glyph terminals.</p>
              </div>
              <div className="md:col-span-3 space-y-4">
                <span className="text-2xs font-mono" style={{ color: colors.muted }}>Unbounded // tracking-tight</span>
                <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight leading-none select-all" style={{ fontFamily: 'var(--font-unbounded)', letterSpacing: '-0.04em' }}>
                  {titleText}
                </h1>
                <p className="text-2xs font-mono" style={{ color: colors.muted }}>
                  Character Set: ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
                </p>
              </div>
            </div>

            {/* Space Grotesk */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border-b border-muted/15 pb-8">
              <div className="space-y-1">
                <h4 className="text-2xs uppercase font-mono tracking-widest text-white/50">Font Family</h4>
                <p className="text-xs font-bold" style={{ color: colors.coral }}>Space Grotesk</p>
                <p className="text-3xs" style={{ color: colors.muted }}>Brutalist geometric tech sans. Used for the lowercase coral subtitle in this revision.</p>
              </div>
              <div className="md:col-span-3 space-y-4">
                <span className="text-2xs font-mono" style={{ color: colors.muted }}>Space Grotesk // tracking-tight bold lowercase</span>
                <p className="text-2xl md:text-3xl font-bold tracking-tight lowercase select-all" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {subtitleText}
                </p>
                <p className="text-2xs font-mono" style={{ color: colors.muted }}>
                  Character Set: abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                </p>
              </div>
            </div>

            {/* Monospace System */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <div className="space-y-1">
                <h4 className="text-2xs uppercase font-mono tracking-widest text-white/50">Font Family</h4>
                <p className="text-xs font-bold" style={{ color: colors.coral }}>System Monospace</p>
                <p className="text-3xs" style={{ color: colors.muted }}>Used for technical labels and parameters.</p>
              </div>
              <div className="md:col-span-3 space-y-4">
                <span className="text-2xs font-mono" style={{ color: colors.muted }}>System Monospace // tracking-widest uppercase</span>
                <p className="text-xs tracking-widest uppercase font-mono">
                  [ ACTIVE_FONT: {titleFont.toUpperCase()} ] [ ACTIVE_SUBTITLE: {subtitleFont.toUpperCase()} ]
                </p>
                <p className="text-2xs font-mono" style={{ color: colors.muted }}>
                  Character Set: abcdefghijklmnopqrstuvwxyz 0123456789 [] -- // _
                </p>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-muted/20 mt-24 text-center space-y-4 relative z-10">
        <p className="text-2xs uppercase tracking-[0.2em]" style={{ color: colors.muted }}>
          Aesthetic Inspired by Acid Classical Brutalism
        </p>
        <p className="text-3xs font-mono" style={{ color: colors.muted }}>
          Next.js 16 + Tailwind CSS v4 + custom SVG filter & inline styles. 2026.
        </p>
      </footer>

    </div>
  );
}

// Sub-component to render an individual concentric perspective rectangle
interface RingElementProps {
  index: number;
  speed: number;
  isAnimated: boolean;
  color: string;
}

function RingElement({ index, speed, isAnimated, color }: RingElementProps) {
  const [scale, setScale] = useState(0);

  useEffect(() => {
    if (!isAnimated) return;

    const step = 1 / 12;
    const startOffset = index * step;
    let animationFrameId: number;
    let startTime = performance.now();

    const update = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      const progress = ((elapsed / speed) + startOffset) % 1.0;
      
      const adjustedScale = Math.pow(progress, 3);
      setScale(adjustedScale);

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [index, speed, isAnimated]);

  const finalScale = isAnimated ? scale : Math.pow(((index + 1) / 12), 3);
  
  const w = finalScale * 240;
  const h = finalScale * 120;
  const x = 60 - w * 0.15;
  const y = 50 - h * 0.5;

  let opacity = 0.8;
  if (finalScale > 0.8) {
    opacity = (1 - finalScale) * 5;
  } else if (finalScale < 0.15) {
    opacity = finalScale * 6;
  }
  
  if (opacity < 0) opacity = 0;
  if (opacity > 0.8) opacity = 0.8;

  return (
    <rect 
      x={x}
      y={y}
      width={w}
      height={h}
      fill="none" 
      stroke={color} 
      strokeWidth={finalScale * 0.75 + 0.25}
      strokeDasharray={finalScale > 0.4 ? "2 2" : undefined}
      opacity={opacity}
    />
  );
}

// Utility color converters
function hexToRgb(hex: string): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : 'n/a';
}

function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  
  if (!result) return 'n/a';
  
  r = parseInt(result[1], 16) / 255;
  g = parseInt(result[2], 16) / 255;
  b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
}
