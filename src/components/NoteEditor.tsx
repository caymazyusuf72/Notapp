"use client";

import React, { useState, useEffect, useTransition, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNotes } from '@/hooks/use-notes';
import { analyzeNote } from '@/lib/actions';
import { type Note, noteColors } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, X, Check } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface NoteEditorProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
}

const noteSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli').max(100),
  content: z.string().min(1, 'İçerik gerekli'),
});

type NoteFormData = z.infer<typeof noteSchema>;

export function NoteEditor({ note, isOpen, onClose }: NoteEditorProps) {
  const { addNote, updateNote } = useNotes();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [creativityResult, setCreativityResult] = useState<{ isCreative: boolean, explanation: string } | null>(null);
  const [selectedColor, setSelectedColor] = useState(note?.color || 'default');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (note) {
        reset({
          title: note.title,
          content: note.content,
        });
        setImagePreview(note.imageUrl || null);
        setSelectedColor(note.color || 'default');
        setTags(note.tags || []);
        if (note.isCreative !== undefined) {
          setCreativityResult({ isCreative: note.isCreative, explanation: note.creativityExplanation || '' });
        } else {
          setCreativityResult(null);
        }
      } else {
        reset({
          title: '',
          content: '',
        });
        setImagePreview(null);
        setSelectedColor('default');
        setTags([]);
        setCreativityResult(null);
      }
      setTagInput('');
    }
  }, [note, isOpen, reset]);

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleImageDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: NoteFormData) => {
    startTransition(async () => {
      const { isCreative, creativityExplanation } = await analyzeNote(data.content);

      const finalTags = [...tags];
      const lastTag = tagInput.trim();
      if(lastTag && !finalTags.includes(lastTag)) {
          finalTags.push(lastTag);
      }

      const noteData = {
        ...data,
        isFavorite: note?.isFavorite || false,
        imageUrl: imagePreview,
        color: selectedColor,
        isCreative,
        creativityExplanation,
        tags: finalTags,
      };

      if (note) {
        updateNote({ ...note, ...noteData });
      } else {
        addNote(noteData);
      }
      onClose();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-2xl transition-colors duration-300", noteColors[selectedColor])}>
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">
              {note ? 'Notu Düzenle' : 'Not Oluştur'}
            </DialogTitle>
             {creativityResult && (
                <DialogDescription className="flex items-center gap-2 pt-2">
                   <Sparkles className={cn("h-4 w-4", creativityResult.isCreative ? 'text-amber-500' : 'text-muted-foreground')} />
                   {creativityResult.explanation}
                </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4">
            <Input
              {...register('title')}
              placeholder="Not Başlığı"
              className="text-lg font-semibold bg-transparent"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}

            <Textarea
              {...register('content')}
              placeholder="Yazmaya başla..."
              className="min-h-[200px] resize-y bg-transparent"
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
             
            <div className="space-y-2">
              <label className="text-sm font-medium">Renk</label>
              <div className="flex items-center gap-2 flex-wrap">
                {Object.keys(noteColors).map((color) => (
                  <motion.button
                    type="button"
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-transform duration-200',
                      selectedColor === color ? 'border-primary ring-2 ring-primary/50' : 'border-transparent',
                      noteColors[color]
                    )}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 1.1 }}
                    animate={{ scale: selectedColor === color ? 1.1 : 1 }}
                  >
                    {selectedColor === color && <Check className="h-5 w-5 mx-auto text-primary-foreground mix-blend-difference" />}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="tags-input" className="text-sm font-medium">Etiketler</label>
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-input p-2 bg-transparent" onClick={() => tagInputRef.current?.focus()}>
                 {tags.map(tag => (
                   <Badge key={tag} variant="secondary">
                     {tag}
                     <button type="button" onClick={() => removeTag(tag)} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5">
                        <X className="h-3 w-3" />
                     </button>
                   </Badge>
                 ))}
                 <Input
                    id="tags-input"
                    ref={tagInputRef}
                    type="text"
                    placeholder="Etiket ekle..."
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    className="flex-1 border-none shadow-none focus-visible:ring-0 h-auto p-0 bg-transparent"
                 />
              </div>
            </div>


            <label onDragOver={(e) => e.preventDefault()} onDrop={handleImageDrop} className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                 {imagePreview ? (
                    <>
                      <Image src={imagePreview} alt="Preview" fill style={{objectFit: 'contain'}} className="rounded-lg p-2" />
                      <button type="button" onClick={() => setImagePreview(null)} className="absolute top-2 right-2 bg-background/50 rounded-full p-1 text-foreground hover:scale-110 transition-transform">
                        <X className="h-4 w-4" />
                      </button>
                    </>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <p>Buraya bir resim sürükleyip bırakın</p>
                        <p className="text-xs">veya dosya seçmek için tıklayın (isteğe bağlı)</p>
                    </div>
                )}
                 <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                    }
                 }} />
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Notu Kaydet
            </Button>
          </DialogFooter>
        </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
