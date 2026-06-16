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
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'
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

interface TipTapEditorProps {
    initialContent: string;
    onChange: (content: string) => void;
}

export interface TipTapEditorRef {
    editor: Editor | null;
}

export const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(
    ({ initialContent, onChange }, ref) => {
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
            ],
            content: initialContent,
            editorProps: {
                attributes: {
                    class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[500px] text-foreground leading-normal font-mono',
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
            onUpdate: ({ editor }) => {
                const markdown = (editor as any).storage.markdown.getMarkdown()
                onChange(markdown)
            },
        })

        // Handle external content updates (e.g. from initial load)
        useEffect(() => {
            if (editor && initialContent !== (editor as any).storage.markdown.getMarkdown()) {
                editor.commands.setContent(initialContent)
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
                    line-height: 1.45 !important;
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
                    padding-left: 1.5rem;
                    margin-top: 0.5rem !important;
                    margin-bottom: 0.5rem !important;
                    line-height: 1.45 !important;
                }
                .notes-content-area ol,
                .tiptap ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin-top: 0.5rem !important;
                    margin-bottom: 0.5rem !important;
                    line-height: 1.45 !important;
                }
                .notes-content-area li,
                .tiptap li {
                    margin-top: 0.25rem !important;
                    margin-bottom: 0.25rem !important;
                    line-height: 1.45 !important;
                }
                .notes-content-area h1,
                .tiptap h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; margin-top: 1.25rem; letter-spacing: -0.02em; line-height: 1.25 !important; }
                .notes-content-area h2,
                .tiptap h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; margin-top: 1rem; letter-spacing: -0.01em; line-height: 1.3 !important; border-bottom: none !important; padding-bottom: 0 !important; }
                .notes-content-area h3,
                .tiptap h3 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.375rem; margin-top: 0.75rem; line-height: 1.35 !important; }
                .notes-content-area p,
                .tiptap p { 
                    margin-bottom: 0.75rem !important; 
                    line-height: 1.45 !important;
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

                {/* Persistent Toolbar */}
                {editor && (
                    <div className="flex flex-wrap items-center gap-0.5 pb-2 border-b border-neutral-100 dark:border-neutral-800 mb-4 text-xs font-mono text-muted-fg/40 lowercase select-none">
                        <MenuButton
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            isActive={editor.isActive('bold')}
                            title="Bold"
                        >
                            <Bold className="w-3.5 h-3.5" />
                        </MenuButton>
                        <MenuButton
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            isActive={editor.isActive('italic')}
                            title="Italic"
                        >
                            <Italic className="w-3.5 h-3.5" />
                        </MenuButton>
                        <MenuButton
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            isActive={editor.isActive('code')}
                            title="Code"
                        >
                            <Code className="w-3.5 h-3.5" />
                        </MenuButton>

                        <div className="w-px h-3.5 bg-muted/20 mx-1.5" />

                        <MenuButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            isActive={editor.isActive('heading', { level: 1 })}
                            title="H1"
                        >
                            <Heading1 className="w-3.5 h-3.5" />
                        </MenuButton>
                        <MenuButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            isActive={editor.isActive('heading', { level: 2 })}
                            title="H2"
                        >
                            <Heading2 className="w-3.5 h-3.5" />
                        </MenuButton>

                        <div className="w-px h-3.5 bg-muted/20 mx-1.5" />

                        <MenuButton
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            isActive={editor.isActive('bulletList')}
                            title="Bullet List"
                        >
                            <List className="w-3.5 h-3.5" />
                        </MenuButton>
                        <MenuButton
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            isActive={editor.isActive('orderedList')}
                            title="Numbered List"
                        >
                            <ListOrdered className="w-3.5 h-3.5" />
                        </MenuButton>

                        <div className="w-px h-3.5 bg-muted/20 mx-1.5" />

                        {/* Color Picker */}
                        <div className="relative flex items-center group/color">
                            <button
                                type="button"
                                title="Text Color"
                                className={cn(
                                    "p-2 rounded-none transition-all duration-200 cursor-pointer flex items-center gap-1",
                                    currentColor ? "text-foreground" : "text-muted-fg hover:text-foreground"
                                )}
                            >
                                <span className="text-[10px] font-mono font-bold lowercase" style={currentColor ? { color: currentColor } : undefined}>color</span>
                                <span
                                    className="w-2.5 h-2.5 rounded-full border border-muted/30"
                                    style={{ backgroundColor: currentColor || 'currentColor' }}
                                />
                            </button>
                            <input
                                type="color"
                                value={currentColor || '#ffffff'}
                                onChange={(e) => {
                                    editor.chain().focus().setColor(e.target.value).run()
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>

                        {currentColor && (
                            <>
                                <span className="text-muted-fg/20 select-none">/</span>
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().unsetColor().run()}
                                    className="p-2 text-[10px] text-muted-fg hover:text-foreground cursor-pointer transition-colors font-mono lowercase"
                                    title="Reset color"
                                >
                                    reset
                                </button>
                            </>
                        )}
                    </div>
                )}

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
                                    value={currentColor || '#ffffff'}
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
            </div>
        )
    }
)

TipTapEditor.displayName = 'TipTapEditor'
