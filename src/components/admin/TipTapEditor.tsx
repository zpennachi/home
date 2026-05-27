'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import FloatingMenuExtension from '@tiptap/extension-floating-menu'
import { useEffect, forwardRef, useImperativeHandle } from 'react'
import { cn } from '@/lib/utils'
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Type,
    Link as LinkIcon,
    Code,
    Highlighter
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
                Markdown.configure({
                    html: false,
                    tightLists: true,
                    bulletListMarker: '-',
                }),
                Placeholder.configure({
                    placeholder: 'Type your narrative...',
                    emptyEditorClass: 'is-editor-empty',
                }),
            ],
            content: initialContent,
            editorProps: {
                attributes: {
                    class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[500px] text-foreground leading-relaxed',
                },
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

        const MenuButton = ({ onClick, isActive, children, title }: any) => (
            <button
                type="button"
                onClick={onClick}
                title={title}
                className={cn(
                    "p-2 rounded-lg transition-all duration-200 hover:bg-muted/80",
                    isActive ? "text-foreground bg-muted shadow-sm" : "text-muted-fg hover:text-foreground"
                )}
            >
                {children}
            </button>
        )

        return (
            <div className="relative group">
                <style jsx global>{`
                .tiptap p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                    font-style: italic;
                }
                .tiptap ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .tiptap ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .tiptap h1 { font-size: 2.25rem; font-weight: 900; margin-bottom: 1.5rem; margin-top: 2rem; letter-spacing: -0.02em; }
                .tiptap h2 { font-size: 1.75rem; font-weight: 800; margin-bottom: 1rem; margin-top: 1.5rem; letter-spacing: -0.01em; }
                .tiptap h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; margin-top: 1.25rem; }
                .tiptap p { margin-bottom: 1rem; }
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
                        <div className="flex items-center gap-1 bg-background/95 backdrop-blur-md border border-muted/50 p-1 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
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
                            <div className="w-px h-4 bg-muted mx-1" />
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
                            <div className="w-px h-4 bg-muted mx-1" />
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
                        </div>
                    </BubbleMenu>
                )}

                {/* Floating Menu (Empty Line based) */}
                {editor && (
                    <FloatingMenu editor={editor}>
                        <div className="flex items-center gap-1 bg-background/95 backdrop-blur-md border border-muted/50 p-1.5 rounded-2xl shadow-xl">
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                title="Big Heading"
                            >
                                <div className="flex items-center gap-2 px-1">
                                    <Heading1 className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Title</span>
                                </div>
                            </MenuButton>
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                title="Medium Heading"
                            >
                                <div className="flex items-center gap-2 px-1">
                                    <Heading2 className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Sub</span>
                                </div>
                            </MenuButton>
                            <div className="w-px h-4 bg-muted mx-1" />
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

                <div className="w-full bg-background border border-transparent hover:border-muted focus-within:border-muted rounded-3xl p-8 transition-all duration-300">
                    <EditorContent editor={editor} />
                </div>
            </div>
        )
    }
)

TipTapEditor.displayName = 'TipTapEditor'
