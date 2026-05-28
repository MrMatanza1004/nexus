'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

function ToolbarButton({ onClick, active, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded text-sm font-medium transition-all ${active ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-slate-100'}`}
      title={label}
    >
      {label}
    </button>
  )
}

export default function TipTapEditor({ content, onChange, placeholder = 'Escribí aquí...', minHeight = 120 }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
        style: `min-height: ${minHeight}px`,
      },
    },
  })

  if (!editor) return null

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-200 bg-slate-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          label="Bold"
        /><span className="text-slate-300 mx-0.5">|</span>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          label="Italic"
        /><span className="text-slate-300 mx-0.5">|</span>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          label="Strike"
        /><span className="text-slate-300 mx-0.5">|</span>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          label="H1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          label="H2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          label="H3"
        /><span className="text-slate-300 mx-0.5">|</span>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          label="• List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          label="1. List"
        /><span className="text-slate-300 mx-0.5">|</span>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          label='"Quote"'
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          label="—"
        />
      </div>
      <div className="px-4 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
