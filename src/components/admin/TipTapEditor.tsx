'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import FloatingMenuExtension from '@tiptap/extension-floating-menu'
import Image from '@tiptap/extension-image'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { useEffect, useState, useRef, forwardRef, useImperativeHandle, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Code,
} from 'lucide-react'

import { Markdown } from 'tiptap-markdown'
import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const WikiLinkDecorations = Extension.create<{
  onClick?: (title: string, event: MouseEvent) => void
  existingTitles?: string[]
}>({
  name: 'wikiLinkDecorations',

  addOptions() {
    return {
      onClick: undefined,
      existingTitles: []
    }
  },

  addProseMirrorPlugins() {
    const existingTitles = this.options.existingTitles || []
    const existingSet = new Set(existingTitles.map(t => t.toLowerCase()))

    return [
      new Plugin({
        state: {
          init(_, { doc }) {
            return findWikiLinks(doc, existingSet)
          },
          apply(tr, oldState) {
            return tr.docChanged ? findWikiLinks(tr.doc, existingSet) : oldState
          },
        },
        props: {
          decorations: (state) => {
            const currentTitles = this.options.existingTitles || []
            const currentSet = new Set(currentTitles.map((t: string) => t.toLowerCase()))
            return findWikiLinks(state.doc, currentSet)
          },
          handleDOMEvents: {
            click: (view, event) => {
              const target = event.target as HTMLElement
              if (target && target.classList.contains('wiki-link-span')) {
                const title = target.getAttribute('data-wiki-title')
                if (title && this.options.onClick) {
                  this.options.onClick(title, event)
                  return true
                }
              }
              return false
            }
          }
        },
      }),
    ]
  },
})

function findWikiLinks(doc: any, existingSet: Set<string>) {
  const decorations: Decoration[] = []

  doc.descendants((node: any, pos: number) => {
    if (node.isText) {
      const text = node.text || ''
      const regex = /\[\[(.*?)\]\]/g
      let match
      while ((match = regex.exec(text)) !== null) {
        const start = pos + match.index
        const end = start + match[0].length
        const title = match[1]
        const exists = existingSet.has(title.trim().toLowerCase())

        const className = exists
          ? 'wiki-link-span cursor-pointer text-blue-600 dark:text-blue-400 font-medium underline decoration-solid hover:opacity-85'
          : 'wiki-link-span cursor-pointer text-neutral-400 dark:text-neutral-500 underline decoration-dashed hover:opacity-85'

        decorations.push(
          Decoration.inline(start, end, {
            class: className,
            'data-wiki-title': title,
            style: 'cursor: pointer;'
          })
        )
      }
    }
  })

  return DecorationSet.create(doc, decorations)
}

function rgbToHex(color: string): string {
    if (!color) return '#ffffff'
    if (color.startsWith('#')) return color
    if (color.startsWith('rgb')) {
        const matches = color.match(/\d+/g)
        if (matches && matches.length >= 3) {
            const r = parseInt(matches[0], 10)
            const g = parseInt(matches[1], 10)
            const b = parseInt(matches[2], 10)
            return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
        }
    }
    return '#ffffff'
}

function syncEditorColors(editorInstance: Editor) {
    const { state } = editorInstance
    const { selection } = state
    const { $from } = selection

    // 1. Scan backwards to find the nearest preceding H1 section color
    let sectionColor = ''
    const index = $from.index(0)
    const { doc } = state
    
    for (let i = index; i >= 0; i--) {
        if (i >= doc.childCount) continue
        const node = doc.child(i)
        if (node.type.name === 'heading' && node.attrs.level === 1) {
            node.forEach((child) => {
                const colorMark = child.marks.find(m => m.type.name === 'textStyle' && m.attrs.color)
                if (colorMark) {
                    sectionColor = colorMark.attrs.color
                }
            })
            break
        }
    }

    // 3. Synchronize the DOM element styles so H2, H3, lists, blockquotes, and bullets get colored
    const editorEl = editorInstance.view.dom
    if (editorEl) {
        const children = Array.from(editorEl.children)
        let activeColor = ''
        
        children.forEach((el) => {
            const htmlEl = el as HTMLElement
            
            if (htmlEl.tagName === 'H1') {
                const span = htmlEl.querySelector('span[style*="color"]')
                if (span) {
                    activeColor = (span as HTMLElement).style.color || ''
                } else {
                    activeColor = htmlEl.style.color || ''
                }
            }
            
            if (activeColor) {
                htmlEl.style.color = activeColor
                if (htmlEl.tagName === 'UL' || htmlEl.tagName === 'OL') {
                    const lis = htmlEl.querySelectorAll('li')
                    lis.forEach((li) => {
                        li.style.color = activeColor
                    })
                }
            } else {
                htmlEl.style.removeProperty('color')
                if (htmlEl.tagName === 'UL' || htmlEl.tagName === 'OL') {
                    const lis = htmlEl.querySelectorAll('li')
                    lis.forEach((li) => {
                        li.style.removeProperty('color')
                    })
                }
            }
        })
    }
}

interface TipTapEditorProps {
    initialContent: string;
    onChange: (content: string) => void;
    editorSettings?: {
        font_family?: string;
        font_size?: string;
        line_height?: string;
        page_width?: string;
    };
    onWikiLinkClick?: (title: string, event: MouseEvent) => void;
    existingTitles?: string[];
}

export interface TipTapEditorRef {
    editor: Editor | null;
}

export const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(
    ({ initialContent, onChange, editorSettings, onWikiLinkClick, existingTitles = [] }, ref) => {
        const settings = editorSettings || {
            font_family: 'mono',
            font_size: 'medium',
            line_height: 'normal',
        }

        const fontFamily = settings.font_family === 'sans'
            ? 'var(--font-sans), sans-serif'
            : settings.font_family === 'serif'
                ? 'Georgia, Cambria, "Times New Roman", Times, serif'
                : 'var(--font-mono), monospace'

        const fontSize = settings.font_size === 'small'
            ? '12.5px'
            : settings.font_size === 'large'
                ? '15px'
                : '13.5px'

        const lineHeight = settings.line_height === 'tight'
            ? '1.3'
            : settings.line_height === 'loose'
                ? '1.55'
                : '1.4'

        const editor = useEditor({
            immediatelyRender: false,
            extensions: [
                StarterKit,
                BubbleMenuExtension,
                FloatingMenuExtension,
                TextStyle,
                Color,
                Markdown.configure({
                    html: true,
                    tightLists: true,
                    bulletListMarker: '-',
                }),
                Placeholder.configure({
                    placeholder: 'Type your narrative...',
                    emptyEditorClass: 'is-editor-empty',
                }),
                Image.configure({
                    inline: true,
                    HTMLAttributes: {
                        class: 'max-w-full h-auto border border-muted/50 my-4 rounded-none',
                    },
                }),
                WikiLinkDecorations.configure({
                    onClick: onWikiLinkClick,
                    existingTitles: existingTitles,
                })
            ],
            content: initialContent,
            editorProps: {
                attributes: {
                    class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[500px] text-foreground leading-normal font-mono',
                },
                handleKeyDown: (view, event) => {
                    if (suggestionState?.isOpen && filteredSuggestions.length > 0) {
                        if (event.key === 'ArrowDown') {
                            event.preventDefault()
                            setSelectedIdx(prev => (prev + 1) % filteredSuggestions.length)
                            return true
                        }
                        if (event.key === 'ArrowUp') {
                            event.preventDefault()
                            setSelectedIdx(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length)
                            return true
                        }
                        if (event.key === 'Enter') {
                            event.preventDefault()
                            selectSuggestion(filteredSuggestions[selectedIdx])
                            return true
                        }
                        if (event.key === 'Escape') {
                            event.preventDefault()
                            setSuggestionState(null)
                            return true
                        }
                    }

                    if (event.key === 'Enter' && !event.shiftKey) {
                        const { state } = view
                        const { selection } = state
                        const { $from } = selection
                        
                        // Check if the current node is an empty paragraph
                        if ($from.parent.type.name === 'paragraph' && $from.parent.content.size === 0) {
                            const depth = $from.depth
                            if (depth > 0) {
                                const parent = $from.node(depth - 1)
                                const index = $from.index(depth - 1)
                                
                                // We need index >= 1 (so there's at least one node before the current one)
                                if (index >= 1) {
                                    const prevNode = parent.child(index - 1)
                                    
                                    // Check if the previous node is also an empty paragraph
                                    if (prevNode.type.name === 'paragraph' && prevNode.content.size === 0) {
                                         const LIGHT_COLORS = [
                                             '#2563eb', // Intense Blue
                                             '#16a34a', // Intense Green
                                             '#ea580c', // Intense Orange
                                             '#e11d48', // Intense Crimson/Rose
                                             '#7c3aed', // Intense Purple
                                             '#0d9488', // Intense Teal
                                             '#db2777', // Intense Pink
                                         ]

                                         const DARK_COLORS = [
                                             '#3b82f6', // Bright Intense Blue
                                             '#22c55e', // Bright Intense Green
                                             '#f97316', // Bright Intense Orange
                                             '#f43f5e', // Bright Intense Rose
                                             '#8b5cf6', // Bright Intense Violet
                                             '#06b6d4', // Bright Intense Cyan/Teal
                                             '#ec4899', // Bright Intense Pink
                                         ]

                                        const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
                                        const colors = isDark ? DARK_COLORS : LIGHT_COLORS
                                        const normalizedColors = colors.map(c => c.toLowerCase())

                                        const currentColor = state.storedMarks?.find(m => m.type.name === 'textStyle')?.attrs.color 
                                            || $from.marks().find(m => m.type.name === 'textStyle')?.attrs.color
                                            || ''
                                            
                                        const currentHex = currentColor ? rgbToHex(currentColor).toLowerCase() : ''
                                        
                                        let nextColor = colors[0]
                                        const currentIndex = normalizedColors.indexOf(currentHex)
                                        if (currentIndex !== -1) {
                                            nextColor = colors[(currentIndex + 1) % colors.length]
                                        } else {
                                            nextColor = colors[Math.floor(Math.random() * colors.length)]
                                        }
                                        
                                        // Prevent default Enter behavior
                                        event.preventDefault()
                                        
                                        // Split block, convert new block to Heading 1, and set color
                                        if (editor) {
                                            editor.chain()
                                                .splitBlock()
                                                .toggleHeading({ level: 1 })
                                                .setColor(nextColor)
                                                .run()
                                        }
                                            
                                        return true
                                    }
                                }
                            }
                        }
                    }
                    return false
                },
                handleDOMEvents: {
                    drop: (view, event) => {
                        const hasFiles = event.dataTransfer?.files && event.dataTransfer.files.length > 0
                        if (!hasFiles) return false

                        event.preventDefault()
                        
                        const files = Array.from(event.dataTransfer.files)
                        const imageFiles = files.filter(file => file.type.startsWith('image/'))
                        
                        if (imageFiles.length > 0) {
                            imageFiles.forEach(file => {
                                const reader = new FileReader()
                                reader.onload = (readerEvent) => {
                                    const content = readerEvent.target?.result as string
                                    if (content && editor) {
                                        editor.chain().focus().setImage({ src: content }).run()
                                    }
                                }
                                reader.readAsDataURL(file)
                            })
                            return true
                        }
                        return false
                    },
                    paste: (view, event) => {
                        const hasFiles = event.clipboardData?.files && event.clipboardData.files.length > 0
                        if (!hasFiles) return false

                        const files = Array.from(event.clipboardData.files)
                        const imageFiles = files.filter(file => file.type.startsWith('image/'))

                        if (imageFiles.length > 0) {
                            event.preventDefault()
                            imageFiles.forEach(file => {
                                const reader = new FileReader()
                                reader.onload = (readerEvent) => {
                                    const content = readerEvent.target?.result as string
                                    if (content && editor) {
                                        editor.chain().focus().setImage({ src: content }).run()
                                    }
                                }
                                reader.readAsDataURL(file)
                            })
                            return true
                        }
                        return false
                    }
                }
            },
            onCreate: ({ editor }) => {
                syncEditorColors(editor)
            },
            onUpdate: ({ editor }) => {
                const markdown = (editor as any).storage.markdown.getMarkdown()
                onChange(markdown)
                syncEditorColors(editor)
                setTimeout(() => checkWikiLinkSuggestion(editor), 0)
            },
            onSelectionUpdate: ({ editor }) => {
                syncEditorColors(editor)
                setTimeout(() => checkWikiLinkSuggestion(editor), 0)
            },
        })

        const [suggestionState, setSuggestionState] = useState<{
            isOpen: boolean;
            query: string;
            coords: { top: number; left: number };
            startPos: number;
        } | null>(null)
        const [selectedIdx, setSelectedIdx] = useState(0)

        // Filter titles based on query
        const filteredSuggestions = useMemo(() => {
            if (!suggestionState) return []
            const query = suggestionState.query.toLowerCase()
            return existingTitles
                .filter(t => t.toLowerCase().includes(query))
                .slice(0, 5)
        }, [suggestionState, existingTitles])

        const selectSuggestion = useCallback((title: string) => {
            if (!editor || !suggestionState) return
            const { startPos } = suggestionState
            const currentPos = editor.state.selection.$from.pos
            
            // Delete matching query and insert [[title]]
            editor.chain()
                .focus()
                .deleteRange({ from: startPos, to: currentPos })
                .insertContent(`[[${title}]]`)
                .run()
                
            setSuggestionState(null)
            setSelectedIdx(0)
        }, [editor, suggestionState])

        const checkWikiLinkSuggestion = useCallback((editorInstance: Editor) => {
            const { state } = editorInstance
            const { selection } = state
            const { $from } = selection
            
            // Get current text block before cursor
            const textBefore = $from.parent.textBetween(0, $from.parentOffset, null, null)
            const match = textBefore.match(/\[\[([^\]]*)$/)
            if (match) {
                const query = match[1]
                const startPos = $from.pos - match[0].length
                
                try {
                    const coords = editorInstance.view.coordsAtPos($from.pos)
                    setSuggestionState({
                        isOpen: true,
                        query,
                        coords: { top: coords.bottom + window.scrollY, left: coords.left + window.scrollX },
                        startPos
                    })
                } catch (e) {
                    setSuggestionState(null)
                }
            } else {
                setSuggestionState(null)
            }
        }, [])

        // Handle external content updates (e.g. from initial load)
        useEffect(() => {
            if (editor && initialContent !== (editor as any).storage.markdown.getMarkdown()) {
                editor.commands.setContent(initialContent)
                setTimeout(() => {
                    syncEditorColors(editor)
                }, 0)
            }
        }, [initialContent, editor])

        useImperativeHandle(ref, () => ({
            editor: editor
        }))

        if (!editor) {
            return null
        }

        const currentColor = editor.getAttributes('textStyle').color || ''

        const MenuButton = ({ onClick, isActive, children, title }: any) => (
            <button
                type="button"
                onClick={onClick}
                title={title}
                className={cn(
                    "p-2 rounded-none transition-all duration-200 cursor-pointer",
                    isActive ? "text-foreground font-semibold scale-110" : "text-muted-fg hover:text-foreground"
                )}
            >
                {children}
            </button>
        )

        return (
            <div className="relative group">
                <style jsx global>{`
                .tiptap.prose {
                    max-width: 100% !important;
                    margin-inline: 0 !important;
                }
                .notes-content-area,
                .tiptap {
                    line-height: ${lineHeight} !important;
                    font-family: ${fontFamily} !important;
                }
                .tiptap p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                    font-style: italic;
                }
                .notes-content-area ul,
                .tiptap ul {
                    list-style-type: disc;
                    padding-left: 1.25rem;
                    margin-top: 0.4em !important;
                    margin-bottom: 0.4em !important;
                    line-height: ${lineHeight} !important;
                }
                .notes-content-area ol,
                .tiptap ol {
                    list-style-type: decimal;
                    padding-left: 1.25rem;
                    margin-top: 0.4em !important;
                    margin-bottom: 0.4em !important;
                    line-height: ${lineHeight} !important;
                }
                .notes-content-area li,
                .tiptap li {
                    margin-top: 0.2em !important;
                    margin-bottom: 0.2em !important;
                    line-height: ${lineHeight} !important;
                    font-size: ${fontSize} !important;
                }
                .notes-content-area h1,
                .tiptap h1 { font-size: 1.6em; font-weight: 600; margin-bottom: 0.5em; margin-top: 1em; letter-spacing: -0.02em; line-height: 1.2 !important; }
                .notes-content-area h2,
                .tiptap h2 { font-size: 1.3em; font-weight: 600; margin-bottom: 0.4em; margin-top: 0.8em; letter-spacing: -0.01em; line-height: 1.25 !important; border-bottom: none !important; padding-bottom: 0 !important; }
                .notes-content-area h3,
                .tiptap h3 { font-size: 1.15em; font-weight: 600; margin-bottom: 0.3em; margin-top: 0.6em; line-height: 1.3 !important; }
                .notes-content-area p,
                .tiptap p { 
                    margin-bottom: 0.5em !important; 
                    line-height: ${lineHeight} !important;
                    font-size: ${fontSize} !important;
                }
                .tiptap code { 
                    background: rgba(0,0,0,0.05); 
                    padding: 0.2rem 0.4rem; 
                    border-radius: 0.5rem; 
                    font-family: ui-monospace, monospace;
                    font-size: 0.9em;
                }
                .dark .tiptap code { background: rgba(255,255,255,0.1); }
            `}</style>



                {/* Bubble Menu (Selection-based) */}
                {editor && (
                    <BubbleMenu editor={editor}>
                        <div className="flex items-center gap-1 bg-background border border-muted/20 p-1.5 shadow-md animate-in fade-in zoom-in duration-200">
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                isActive={editor.isActive('bold')}
                                title="Bold"
                            >
                                <Bold className="w-4 h-4" />
                            </MenuButton>
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                isActive={editor.isActive('italic')}
                                title="Italic"
                            >
                                <Italic className="w-4 h-4" />
                            </MenuButton>
                            <div className="w-px h-4 bg-muted/20 mx-1" />
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                isActive={editor.isActive('heading', { level: 1 })}
                                title="Heading 1"
                            >
                                <Heading1 className="w-4 h-4" />
                            </MenuButton>
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                isActive={editor.isActive('heading', { level: 2 })}
                                title="Heading 2"
                            >
                                <Heading2 className="w-4 h-4" />
                            </MenuButton>
                            <div className="w-px h-4 bg-muted/20 mx-1" />
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                isActive={editor.isActive('bulletList')}
                                title="Bullet List"
                            >
                                <List className="w-4 h-4" />
                            </MenuButton>
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                isActive={editor.isActive('orderedList')}
                                title="Numbered List"
                            >
                                <ListOrdered className="w-4 h-4" />
                            </MenuButton>
                            <div className="w-px h-4 bg-muted/20 mx-1" />
                            {/* Color Picker */}
                            <div className="relative flex items-center">
                                <button
                                    type="button"
                                    title="Text Color"
                                    className={cn(
                                        "p-2 rounded-none transition-all duration-200 cursor-pointer flex items-center gap-1",
                                        currentColor ? "text-foreground" : "text-muted-fg hover:text-foreground"
                                    )}
                                >
                                    <span className="text-xs font-mono font-bold lowercase" style={currentColor ? { color: currentColor } : undefined}>A</span>
                                    <span
                                        className="w-3 h-3 rounded-sm border border-muted/30"
                                        style={{ backgroundColor: currentColor || 'currentColor' }}
                                    />
                                </button>
                                <input
                                    type="color"
                                    value={currentColor ? rgbToHex(currentColor) : '#ffffff'}
                                    onChange={(e) => {
                                        editor.chain().focus().setColor(e.target.value).run()
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            {currentColor && (
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().unsetColor().run()}
                                    title="Reset Color"
                                    className="p-2 rounded-none transition-all duration-200 cursor-pointer text-muted-fg hover:text-foreground"
                                >
                                    <span className="text-[10px] font-mono lowercase">reset</span>
                                </button>
                            )}
                        </div>
                    </BubbleMenu>
                )}

                {/* Floating Menu (Empty Line based) */}
                {editor && (
                    <FloatingMenu editor={editor}>
                        <div className="flex items-center gap-1 bg-background border border-muted/20 p-1.5 shadow-md">
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                title="Big Heading"
                            >
                                <Heading1 className="w-4 h-4" />
                            </MenuButton>
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                title="Medium Heading"
                            >
                                <Heading2 className="w-4 h-4" />
                            </MenuButton>
                            <div className="w-px h-4 bg-muted/20 mx-1" />
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                title="Bullet List"
                            >
                                <List className="w-4 h-4" />
                            </MenuButton>
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                                title="Code Block"
                            >
                                <Code className="w-4 h-4" />
                            </MenuButton>
                        </div>
                    </FloatingMenu>
                )}

                <div className="w-full bg-transparent focus:outline-none pt-4">
                    <EditorContent editor={editor} />
                </div>

                {suggestionState?.isOpen && filteredSuggestions.length > 0 && (
                    <div 
                        className="fixed z-[9999] w-64 bg-background border border-neutral-200 dark:border-neutral-800 rounded shadow-lg py-1 text-xs font-mono lowercase"
                        style={{
                            top: `${suggestionState.coords.top}px`,
                            left: `${suggestionState.coords.left}px`,
                        }}
                    >
                        {filteredSuggestions.map((title, idx) => (
                            <button
                                key={title}
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                }}
                                onClick={() => selectSuggestion(title)}
                                className={cn(
                                    "w-full text-left px-3 py-1.5 transition-colors cursor-pointer block",
                                    idx === selectedIdx 
                                        ? "bg-neutral-100 dark:bg-neutral-900 text-foreground font-semibold" 
                                        : "text-muted-fg hover:text-foreground"
                                )}
                            >
                                {title.toLowerCase()}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )
    }
)

TipTapEditor.displayName = 'TipTapEditor'
