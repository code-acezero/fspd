import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  GripVertical, Plus, Trash2, ImagePlus, Loader2, X,
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Heading3, Pilcrow,
  Quote, Code2, Minus, Type, ChevronDown,
  MoveUp, MoveDown,
} from 'lucide-react';
import { uploadSiteImage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/* ─── Types ─────────────────────────────────────────────── */
export type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'blockquote' | 'code' | 'divider' | 'image';
export type FontSize = 'text-xs' | 'text-sm' | 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl' | 'text-3xl';
export type FontWeight = 'font-normal' | 'font-medium' | 'font-semibold' | 'font-bold';
export type TextAlign = 'text-left' | 'text-center' | 'text-right' | 'text-justify';
export type FontFamily = 'font-bengali' | 'font-sans' | 'font-serif' | 'font-mono';

export interface EditorBlock {
  id: string;
  type: BlockType;
  content: string;
  imageUrl?: string;
  fontSize?: FontSize;
  fontWeight?: FontWeight;
  textAlign?: TextAlign;
  fontFamily?: FontFamily;
}

/* ─── Utilities ──────────────────────────────────────────── */
let _cnt = 0;
const newId = () => `blk-${Date.now()}-${_cnt++}`;

const defaultBlock = (type: BlockType = 'paragraph'): EditorBlock => ({
  id: newId(), type, content: '',
  fontSize: type === 'h1' ? 'text-2xl' : type === 'h2' ? 'text-xl' : type === 'h3' ? 'text-lg' : 'text-base',
  fontWeight: (type === 'h1' || type === 'h2' || type === 'h3') ? 'font-bold' : 'font-normal',
  textAlign: 'text-left', fontFamily: 'font-bengali',
});

export function blocksToString(blocks: EditorBlock[]): string {
  return blocks.map(b => {
    if (b.type === 'divider') return '---';
    if (b.type === 'image') return `![${b.content || ''}](${b.imageUrl || ''})`;
    const raw = b.content
      .replace(/<b>(.*?)<\/b>/gi, '**$1**').replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<i>(.*?)<\/i>/gi, '_$1_').replace(/<em>(.*?)<\/em>/gi, '_$1_')
      .replace(/<u>(.*?)<\/u>/gi, '__$1__').replace(/<s>(.*?)<\/s>/gi, '~~$1~~')
      .replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
    if (b.type === 'h1') return `# ${raw}`;
    if (b.type === 'h2') return `## ${raw}`;
    if (b.type === 'h3') return `### ${raw}`;
    if (b.type === 'blockquote') return `> ${raw}`;
    if (b.type === 'code') return `\`\`\`\n${raw}\n\`\`\``;
    return raw;
  }).join('\n\n');
}

export function stringToBlocks(text: string): EditorBlock[] {
  if (!text || !text.trim()) return [defaultBlock('paragraph')];
  const blocks: EditorBlock[] = [];
  for (const line of text.split(/\n\n+/)) {
    const t = line.trim();
    if (!t) continue;
    if (t === '---') { blocks.push({ ...defaultBlock('divider'), content: '' }); continue; }
    const img = t.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (img) { blocks.push({ ...defaultBlock('image'), content: img[1], imageUrl: img[2] }); continue; }
    if (t.startsWith('### ')) { blocks.push({ ...defaultBlock('h3'), content: t.slice(4) }); continue; }
    if (t.startsWith('## ')) { blocks.push({ ...defaultBlock('h2'), content: t.slice(3) }); continue; }
    if (t.startsWith('# ')) { blocks.push({ ...defaultBlock('h1'), content: t.slice(2) }); continue; }
    if (t.startsWith('> ')) { blocks.push({ ...defaultBlock('blockquote'), content: t.slice(2) }); continue; }
    if (t.startsWith('\`\`\`')) { blocks.push({ ...defaultBlock('code'), content: t.replace(/^\`\`\`\n?/, '').replace(/\n?\`\`\`$/, '') }); continue; }
    const html = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>').replace(/~~(.*?)~~/g, '<s>$1</s>').replace(/\n/g, '<br />');
    blocks.push({ ...defaultBlock('paragraph'), content: html });
  }
  return blocks.length > 0 ? blocks : [defaultBlock('paragraph')];
}

/* ─── Constants ─────────────────────────────────────────── */
const BLOCK_TYPES: { type: BlockType; label: string; shortLabel: string }[] = [
  { type: 'paragraph', label: 'Paragraph', shortLabel: 'P' },
  { type: 'h1', label: 'Title (H1)', shortLabel: 'H1' },
  { type: 'h2', label: 'Subtitle (H2)', shortLabel: 'H2' },
  { type: 'h3', label: 'Heading (H3)', shortLabel: 'H3' },
  { type: 'blockquote', label: 'Blockquote', shortLabel: 'Q' },
  { type: 'code', label: 'Code Block', shortLabel: '</>' },
  { type: 'divider', label: 'Divider', shortLabel: '—' },
  { type: 'image', label: 'Image Block', shortLabel: 'IMG' },
];

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 'text-xs', label: 'XS' }, { value: 'text-sm', label: 'S' },
  { value: 'text-base', label: 'M' }, { value: 'text-lg', label: 'L' },
  { value: 'text-xl', label: 'XL' }, { value: 'text-2xl', label: '2XL' },
  { value: 'text-3xl', label: '3XL' },
];

const FONT_WEIGHTS: { value: FontWeight; label: string }[] = [
  { value: 'font-normal', label: 'Normal' }, { value: 'font-medium', label: 'Medium' },
  { value: 'font-semibold', label: 'Semi Bold' }, { value: 'font-bold', label: 'Bold' },
];

/* ─── Inline Floating Toolbar ─────────────────────────────── */
const InlineToolbar: React.FC = () => {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  useEffect(() => {
    const h = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString()) { setPos(null); return; }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0) { setPos(null); return; }
      setPos({ top: rect.top + window.scrollY - 50, left: Math.max(8, rect.left + rect.width / 2 - 130) });
    };
    document.addEventListener('selectionchange', h);
    return () => document.removeEventListener('selectionchange', h);
  }, []);
  if (!pos) return null;
  const exec = (cmd: string) => document.execCommand(cmd, false);
  return (
    <div
      className="fixed z-[500] flex items-center gap-0.5 p-1 rounded-xl bg-popover border border-border shadow-xl"
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={e => e.preventDefault()}
    >
      <button type="button" onMouseDown={() => exec('bold')} className="p-1.5 rounded-lg hover:bg-secondary text-foreground" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
      <button type="button" onMouseDown={() => exec('italic')} className="p-1.5 rounded-lg hover:bg-secondary text-foreground" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
      <button type="button" onMouseDown={() => exec('underline')} className="p-1.5 rounded-lg hover:bg-secondary text-foreground" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
      <button type="button" onMouseDown={() => exec('strikeThrough')} className="p-1.5 rounded-lg hover:bg-secondary text-foreground" title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></button>
      <div className="w-px h-5 bg-border mx-0.5" />
      <button type="button" onMouseDown={() => exec('removeFormat')} className="px-2 py-1.5 rounded-lg hover:bg-secondary text-muted-foreground text-[10px] font-sans font-bold">Clear</button>
    </div>
  );
};

/* ─── Top Toolbar ─────────────────────────────────────────── */
interface TopToolbarProps {
  focusedBlock: EditorBlock | null;
  onUpdateFocused: (u: Partial<EditorBlock>) => void;
  onAddBlock: (type: BlockType) => void;
  lang: string;
}

const TopToolbar: React.FC<TopToolbarProps> = ({ focusedBlock, onUpdateFocused, onAddBlock, lang }) => {
  const [open, setOpen] = useState<string | null>(null);
  const exec = (cmd: string) => document.execCommand(cmd, false);
  const toggle = (id: string) => setOpen(p => p === id ? null : id);

  const currentType = BLOCK_TYPES.find(t => t.type === focusedBlock?.type) || BLOCK_TYPES[0];
  const currentSize = FONT_SIZES.find(s => s.value === focusedBlock?.fontSize) || FONT_SIZES[2];

  const Drop = ({ id, trigger, children }: { id: string; trigger: React.ReactNode; children: React.ReactNode }) => (
    <div className="relative">
      <div onClick={() => toggle(id)}>{trigger}</div>
      {open === id && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-popover border border-border rounded-2xl shadow-xl p-1.5 min-w-[150px]" onMouseLeave={() => setOpen(null)}>
          {children}
        </div>
      )}
    </div>
  );

  const tb = "p-1.5 rounded-lg hover:bg-secondary text-foreground transition-colors";

  return (
    <div className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border px-3 py-2 flex flex-wrap items-center gap-1 rounded-t-2xl">
      {/* Block Type Selector */}
      <Drop id="type" trigger={
        <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-sans font-semibold border border-border min-w-[110px]">
          <span className="flex-1 text-left">{currentType.label}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
        </button>
      }>
        {BLOCK_TYPES.map(t => (
          <button key={t.type} type="button"
            onClick={() => { onUpdateFocused({ type: t.type }); setOpen(null); }}
            className={`w-full px-3 py-1.5 rounded-xl text-xs font-sans text-left transition-colors ${focusedBlock?.type === t.type ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-secondary text-foreground'}`}
          >
            <span className="font-bold mr-2 text-[10px] font-mono opacity-60">{t.shortLabel}</span>
            {t.label}
          </button>
        ))}
      </Drop>

      <div className="w-px h-5 bg-border" />

      {/* Inline Formatting */}
      <button type="button" onClick={() => exec('bold')} className={tb} title="Bold"><Bold className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => exec('italic')} className={tb} title="Italic"><Italic className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => exec('underline')} className={tb} title="Underline"><Underline className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => exec('strikeThrough')} className={tb} title="Strike"><Strikethrough className="w-3.5 h-3.5" /></button>

      <div className="w-px h-5 bg-border" />

      {/* Alignment */}
      {([
        { align: 'text-left' as TextAlign, icon: <AlignLeft className="w-3.5 h-3.5" /> },
        { align: 'text-center' as TextAlign, icon: <AlignCenter className="w-3.5 h-3.5" /> },
        { align: 'text-right' as TextAlign, icon: <AlignRight className="w-3.5 h-3.5" /> },
        { align: 'text-justify' as TextAlign, icon: <AlignJustify className="w-3.5 h-3.5" /> },
      ] as const).map(({ align, icon }) => (
        <button key={align} type="button" onClick={() => onUpdateFocused({ textAlign: align })}
          className={`p-1.5 rounded-lg transition-colors ${focusedBlock?.textAlign === align ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-foreground'}`}>{icon}</button>
      ))}

      <div className="w-px h-5 bg-border" />

      {/* Font Size */}
      <Drop id="size" trigger={
        <button type="button" className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-sans font-semibold border border-border">
          <Type className="w-3 h-3" /><span>{currentSize.label}</span><ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      }>
        <div className="grid grid-cols-3 gap-0.5">
          {FONT_SIZES.map(s => (
            <button key={s.value} type="button" onClick={() => { onUpdateFocused({ fontSize: s.value }); setOpen(null); }}
              className={`px-2 py-1.5 rounded-xl text-xs font-sans text-center transition-colors ${focusedBlock?.fontSize === s.value ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-secondary text-foreground'}`}>{s.label}</button>
          ))}
        </div>
      </Drop>

      {/* Font Weight */}
      <Drop id="weight" trigger={
        <button type="button" className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-sans font-bold border border-border">
          <Bold className="w-3 h-3" /><ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      }>
        {FONT_WEIGHTS.map(w => (
          <button key={w.value} type="button" onClick={() => { onUpdateFocused({ fontWeight: w.value }); setOpen(null); }}
            className={`w-full px-3 py-1.5 rounded-xl text-xs font-sans text-left transition-colors ${w.value} ${focusedBlock?.fontWeight === w.value ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-foreground'}`}>{w.label}</button>
        ))}
      </Drop>

      {/* Font Family */}
      <Drop id="font" trigger={
        <button type="button" className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-sans font-semibold border border-border">
          <span className="text-xs">Aa</span><ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      }>
        {([
          { value: 'font-bengali' as FontFamily, label: 'Bengali / বাংলা' },
          { value: 'font-sans' as FontFamily, label: 'Sans-Serif' },
          { value: 'font-serif' as FontFamily, label: 'Serif' },
          { value: 'font-mono' as FontFamily, label: 'Monospace' },
        ]).map(f => (
          <button key={f.value} type="button" onClick={() => { onUpdateFocused({ fontFamily: f.value }); setOpen(null); }}
            className={`w-full px-3 py-1.5 rounded-xl text-xs text-left transition-colors ${f.value} ${focusedBlock?.fontFamily === f.value ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-secondary text-foreground'}`}>{f.label}</button>
        ))}
      </Drop>

      <div className="w-px h-5 bg-border" />

      {/* Insert Blocks */}
      <div className="flex items-center gap-0.5 ml-auto">
        <button type="button" onClick={() => onAddBlock('image')} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 transition-colors" title="Image"><ImagePlus className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => onAddBlock('divider')} className={tb} title="Divider"><Minus className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => onAddBlock('blockquote')} className={tb} title="Blockquote"><Quote className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => onAddBlock('code')} className={tb} title="Code"><Code2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
};

/* ─── Single Block Component ──────────────────────────────── */
interface BlockEditorProps {
  block: EditorBlock; index: number; totalBlocks: number;
  isFocused: boolean; onFocus: () => void;
  onChange: (u: Partial<EditorBlock>) => void;
  onDelete: () => void; onInsertAfter: (type: BlockType) => void;
  onMoveUp: () => void; onMoveDown: () => void;
  onImageUpload: (f: File) => Promise<string | null>;
  lang: string; isDragOver?: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  block, index, totalBlocks, isFocused, onFocus, onChange, onDelete,
  onInsertAfter, onMoveUp, onMoveDown, onImageUpload, lang, isDragOver,
  onDragStart, onDragOver, onDrop, onDragEnd,
}) => {
  const ceRef = useRef<HTMLDivElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [imgDragOver, setImgDragOver] = useState(false);

  useEffect(() => {
    const el = ceRef.current;
    if (el && el.innerHTML !== block.content) el.innerHTML = block.content;
  }, [block.id]);

  const handleInput = () => { if (ceRef.current) onChange({ content: ceRef.current.innerHTML }); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && block.type !== 'code') { e.preventDefault(); onInsertAfter('paragraph'); }
    if (e.key === 'Backspace' && block.content === '' && totalBlocks > 1) { e.preventDefault(); onDelete(); }
  };

  const handleImgDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setImgDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file?.type.startsWith('image/')) return;
    setUploading(true);
    const url = await onImageUpload(file);
    if (url) onChange({ imageUrl: url });
    setUploading(false);
  };

  const handleImgSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await onImageUpload(file);
    if (url) onChange({ imageUrl: url });
    setUploading(false);
    if (imgInputRef.current) imgInputRef.current.value = '';
  };

  const blockTypeMeta = BLOCK_TYPES.find(t => t.type === block.type) || BLOCK_TYPES[0];

  const contentClass = [
    'w-full outline-none min-h-[1.5em] leading-relaxed break-words',
    block.fontSize ?? (block.type === 'h1' ? 'text-2xl' : block.type === 'h2' ? 'text-xl' : block.type === 'h3' ? 'text-lg' : 'text-base'),
    block.fontWeight ?? ((block.type === 'h1' || block.type === 'h2' || block.type === 'h3') ? 'font-bold' : 'font-normal'),
    block.textAlign ?? 'text-left',
    block.fontFamily ?? 'font-bengali',
    block.type === 'blockquote' ? 'pl-4 border-l-4 border-primary/50 italic text-muted-foreground' : '',
    block.type === 'code' ? 'font-mono text-xs bg-secondary/40 p-3 rounded-xl' : '',
  ].filter(Boolean).join(' ');

  const placeholder = block.type === 'h1' ? (lang === 'en' ? 'Title...' : 'শিরোনাম...')
    : block.type === 'h2' ? (lang === 'en' ? 'Subtitle...' : 'উপশিরোনাম...')
    : block.type === 'h3' ? (lang === 'en' ? 'Heading...' : 'অনুচ্ছেদ শিরোনাম...')
    : block.type === 'blockquote' ? (lang === 'en' ? 'Quote or note...' : 'উদ্ধৃতি...')
    : block.type === 'code' ? '// code...'
    : (lang === 'en' ? 'Write paragraph...' : 'অনুচ্ছেদ লিখুন...');

  return (
    <div
      className={`group/blk relative flex gap-1.5 rounded-xl px-1 py-0.5 transition-all ${isDragOver ? 'border-t-2 border-primary' : ''} ${isFocused ? 'bg-primary/[0.015]' : ''}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Left gutter */}
      <div className="flex flex-col items-center gap-1 pt-1 opacity-0 group-hover/blk:opacity-100 transition-opacity shrink-0 w-7">
        <div
          className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          draggable onDragStart={onDragStart} onDragEnd={onDragEnd} title="Drag to reorder"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
        <div className="relative">
          <button type="button" onClick={() => setShowTypeMenu(p => !p)}
            className="px-1 py-0.5 rounded text-[9px] font-bold font-sans bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border"
            title="Change block type">
            {blockTypeMeta.shortLabel}
          </button>
          {showTypeMenu && (
            <div className="absolute left-full top-0 ml-1 z-50 bg-popover border border-border rounded-2xl shadow-xl p-1 min-w-[150px]" onMouseLeave={() => setShowTypeMenu(false)}>
              {BLOCK_TYPES.map(t => (
                <button key={t.type} type="button"
                  onClick={() => { onChange({ type: t.type }); setShowTypeMenu(false); }}
                  className={`w-full px-3 py-1.5 rounded-xl text-xs font-sans text-left transition-colors ${block.type === t.type ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-secondary text-foreground'}`}
                >
                  <span className="font-mono text-[9px] opacity-50 mr-1">{t.shortLabel}</span>{t.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {index > 0 && <button type="button" onClick={onMoveUp} className="p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Up"><MoveUp className="w-3 h-3" /></button>}
        {index < totalBlocks - 1 && <button type="button" onClick={onMoveDown} className="p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Down"><MoveDown className="w-3 h-3" /></button>}
        <button type="button" onClick={onDelete} className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete"><Trash2 className="w-3 h-3" /></button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-0.5">
        {block.type === 'divider' ? (
          <div className="flex items-center gap-3 py-3">
            <hr className="flex-1 border-border" /><span className="text-muted-foreground text-xs font-sans">— — —</span><hr className="flex-1 border-border" />
          </div>
        ) : block.type === 'image' ? (
          <div className="space-y-2">
            {block.imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={block.imageUrl} alt={block.content} className="w-full max-h-80 object-cover" />
                <button type="button" onClick={() => onChange({ imageUrl: undefined })}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-destructive transition-colors"><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setImgDragOver(true); }}
                onDragLeave={() => setImgDragOver(false)}
                onDrop={handleImgDrop}
                onClick={() => imgInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${imgDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-secondary/30'}`}
              >
                {uploading ? <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" /> : (
                  <><ImagePlus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs font-bengali text-muted-foreground">{lang === 'en' ? 'Drag & drop image or click to upload' : 'ছবি টেনে আনুন বা ক্লিক করে আপলোড করুন'}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1 font-sans">JPG, PNG, WebP, GIF</p>
                  </>
                )}
              </div>
            )}
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImgSelect} />
            <input type="text" value={block.content} onChange={e => onChange({ content: e.target.value })}
              placeholder={lang === 'en' ? 'Image caption (optional)...' : 'ছবির ক্যাপশন (ঐচ্ছিক)...'}
              className="w-full px-3 py-1.5 rounded-xl bg-secondary/40 border border-border text-xs font-bengali text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        ) : (
          <div
            ref={ceRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onFocus={onFocus}
            onKeyDown={handleKeyDown}
            className={`${contentClass} empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:pointer-events-none`}
            data-placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────── */
interface RichBlockEditorProps {
  value: string;
  onChange: (value: string) => void;
  lang?: string;
  label?: string;
}

const RichBlockEditor: React.FC<RichBlockEditorProps> = ({ value, onChange, lang = 'bn', label }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => stringToBlocks(value));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [dragSrc, setDragSrc] = useState<number | null>(null);
  const [dragTgt, setDragTgt] = useState<number | null>(null);

  const setAndEmit = useCallback((newBlocks: EditorBlock[]) => {
    setBlocks(newBlocks);
    onChange(blocksToString(newBlocks));
  }, [onChange]);

  const updateBlock = useCallback((idx: number, updates: Partial<EditorBlock>) => {
    setBlocks(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };
      onChange(blocksToString(next));
      return next;
    });
  }, [onChange]);

  const deleteBlock = useCallback((idx: number) => {
    setBlocks(prev => {
      const next = prev.length <= 1 ? [defaultBlock('paragraph')] : prev.filter((_, i) => i !== idx);
      onChange(blocksToString(next));
      return next;
    });
    setFocusedIndex(p => (p !== null ? Math.max(0, p - 1) : 0));
  }, [onChange]);

  const insertAfter = useCallback((idx: number, type: BlockType = 'paragraph') => {
    setBlocks(prev => {
      const next = [...prev]; next.splice(idx + 1, 0, defaultBlock(type));
      onChange(blocksToString(next)); return next;
    });
    setTimeout(() => setFocusedIndex(idx + 1), 30);
  }, [onChange]);

  const addAtEnd = useCallback((type: BlockType = 'paragraph') => {
    setBlocks(prev => {
      const next = [...prev, defaultBlock(type)];
      onChange(blocksToString(next)); return next;
    });
    setTimeout(() => setFocusedIndex(blocks.length), 30);
  }, [onChange, blocks.length]);

  const moveBlock = useCallback((from: number, to: number) => {
    setBlocks(prev => {
      const next = [...prev]; const [m] = next.splice(from, 1); next.splice(to, 0, m);
      onChange(blocksToString(next)); return next;
    });
    setFocusedIndex(to);
  }, [onChange]);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      const res = await uploadSiteImage(file, 'post', user?.id);
      return typeof res === 'string' ? res : (res as any)?.url || null;
    } catch {
      toast({ title: lang === 'en' ? 'Image upload failed' : 'ছবি আপলোড ব্যর্থ', variant: 'destructive' });
      return null;
    }
  }, [user, toast, lang]);

  const focusedBlock = focusedIndex !== null ? (blocks[focusedIndex] ?? null) : null;
  const wordCount = blocksToString(blocks).replace(/[#>\-`[\]!*_~()]/g, '').trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-bold font-bengali text-foreground block">{label}</label>}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <TopToolbar focusedBlock={focusedBlock} onUpdateFocused={u => { if (focusedIndex !== null) updateBlock(focusedIndex, u); }} onAddBlock={addAtEnd} lang={lang} />
        <InlineToolbar />
        <div className="p-4 space-y-0.5 min-h-[180px]">
          {blocks.map((block, idx) => (
            <div key={block.id}>
              {dragTgt === idx && dragSrc !== null && dragSrc !== idx && <div className="h-0.5 bg-primary rounded-full mx-8 mb-1" />}
              <BlockEditor
                block={block} index={idx} totalBlocks={blocks.length}
                isFocused={focusedIndex === idx}
                onFocus={() => setFocusedIndex(idx)}
                onChange={u => updateBlock(idx, u)}
                onDelete={() => deleteBlock(idx)}
                onInsertAfter={t => insertAfter(idx, t)}
                onMoveUp={() => moveBlock(idx, idx - 1)}
                onMoveDown={() => moveBlock(idx, idx + 1)}
                onImageUpload={uploadImage}
                lang={lang}
                isDragOver={dragTgt === idx}
                onDragStart={e => { setDragSrc(idx); e.dataTransfer.effectAllowed = 'move'; }}
                onDragOver={e => { e.preventDefault(); if (dragSrc !== null && idx !== dragSrc) setDragTgt(idx); }}
                onDrop={e => { e.preventDefault(); if (dragSrc !== null && dragSrc !== idx) moveBlock(dragSrc, idx); setDragSrc(null); setDragTgt(null); }}
                onDragEnd={() => { setDragSrc(null); setDragTgt(null); }}
              />
            </div>
          ))}
          <button type="button" onClick={() => addAtEnd('paragraph')}
            className="w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/40 text-xs font-bengali transition-colors group">
            <Plus className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
            <span>{lang === 'en' ? 'Add new block' : 'নতুন ব্লক যোগ করুন'}</span>
          </button>
        </div>
        <div className="px-4 pb-2 pt-2 flex items-center justify-between border-t border-border/50">
          <span className="text-[10px] text-muted-foreground font-sans">{blocks.filter(b => b.type !== 'divider').length} {lang === 'en' ? 'blocks' : 'ব্লক'} · {wordCount} {lang === 'en' ? 'words' : 'শব্দ'}</span>
          <span className="text-[10px] text-muted-foreground font-sans">{lang === 'en' ? 'Enter: new block · Shift+Enter: line break' : 'Enter: নতুন ব্লক · Shift+Enter: লাইন ব্রেক'}</span>
        </div>
      </div>
    </div>
  );
};

export default RichBlockEditor;
