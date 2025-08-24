"use client";

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { format } from 'date-fns';
import { Heart, Trash2, Sparkles } from 'lucide-react';
import { type Note, noteColors } from '@/types';
import { useNotes } from '@/hooks/use-notes';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NoteCardProps {
  note: Note;
  onEditNote: (note: Note) => void;
  style?: CSSProperties;
}

export function NoteCard({ note, onEditNote, style }: NoteCardProps) {
  const { updateNote, deleteNote } = useNotes();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavorited, setIsFavorited] = useState(note.isFavorite);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavoriteStatus = !note.isFavorite;
    setIsFavorited(newFavoriteStatus);
    updateNote({ ...note, isFavorite: newFavoriteStatus });
    if (newFavoriteStatus) {
      const heartIcon = e.currentTarget.querySelector('svg');
      if (heartIcon) {
        heartIcon.classList.add('animate-pulse-heart');
        setTimeout(() => heartIcon.classList.remove('animate-pulse-heart'), 400);
      }
    }
  };

  const handleDeleteConfirm = () => {
    const cardElement = document.querySelector(`[data-note-id="${note.id}"]`);
    if (cardElement) {
        cardElement.classList.add('animate-shake', 'animate-slide-out-fade');
    }
    setTimeout(() => {
        setIsDeleting(true);
        deleteNote(note.id)
    }, 500);
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.3 } 
    }
  };

  const colorClass = note.color && noteColors[note.color]
    ? noteColors[note.color]
    : 'bg-card';

  return (
    <AnimatePresence>
      {!isDeleting && (
        <motion.div
          layout
          data-note-id={note.id}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          whileHover={{ y: -8, scale: 1.03, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 15 }}
          style={style}
          className="h-full"
        >
          <Card
            className={cn(
              'flex h-full cursor-pointer flex-col overflow-hidden transition-all duration-300 group',
              colorClass,
              note.isCreative && 'relative border-accent shadow-lg shadow-accent/20 dark:shadow-accent/10'
            )}
            onClick={() => onEditNote(note)}
            role="button"
            aria-label={`Notu düzenle: ${note.title}`}
          >
            {note.isCreative && (
              <motion.div 
                className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-accent/30 px-2 py-1 text-xs text-accent-foreground z-10"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="font-semibold">Yaratıcı</span>
              </motion.div>
            )}
            {note.imageUrl && (
              <div className="relative h-40 w-full overflow-hidden">
                <Image
                  src={note.imageUrl}
                  alt={note.title}
                  fill
                  style={{objectFit: 'cover'}}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="truncate font-headline">{note.title}</CardTitle>
              <CardDescription>
                Son güncelleme: {format(new Date(note.updatedAt), 'PPp')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="line-clamp-4 text-sm text-muted-foreground">
                {note.content}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2">
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {note.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              <div className="flex w-full justify-end gap-2">
                <TooltipProvider>
                   <Tooltip>
                      <TooltipTrigger asChild>
                         <motion.div whileTap={{ scale: 0.8 }}>
                           <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleFavorite}
                              aria-label={note.isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}
                            >
                              <Heart
                                className={cn(
                                  'h-5 w-5 transition-all',
                                  isFavorited
                                    ? 'fill-red-500 text-red-500'
                                    : 'text-muted-foreground'
                                )}
                              />
                            </Button>
                         </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                         <p>{note.isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}</p>
                      </TooltipContent>
                   </Tooltip>
                  
                   <AlertDialog>
                      <Tooltip>
                         <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                               <motion.div whileTap={{ scale: 0.8 }} whileHover={{ rotate: -15, scale: 1.1 }}>
                                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} aria-label="Notu sil">
                                    <Trash2 className="h-5 w-5 text-muted-foreground transition-colors hover:text-destructive" />
                                  </Button>
                               </motion.div>
                            </AlertDialogTrigger>
                         </TooltipTrigger>
                         <TooltipContent>
                            <p>Notu sil</p>
                         </TooltipContent>
                      </Tooltip>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu eylem geri alınamaz. Bu, notu kalıcı olarak silecek ve verilerinizi sunucularımızdan kaldıracaktır.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteConfirm}>Sil</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                   </AlertDialog>
                </TooltipProvider>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
