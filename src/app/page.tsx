"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Note } from '@/types';
import { Header } from '@/components/Header';
import { NoteGrid } from '@/components/NoteGrid';
import { NoteEditor } from '@/components/NoteEditor';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleAddNote = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
  };
  
  if (isLoading || !isAuthenticated) {
     return (
      <div className="flex flex-col min-h-screen bg-background/90">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background/90">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <NoteGrid onEditNote={handleEditNote} />
      </main>
      
      <AnimatePresence>
        {isEditorOpen && (
          <NoteEditor
            note={editingNote}
            isOpen={isEditorOpen}
            onClose={handleCloseEditor}
          />
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="fixed bottom-8 right-8"
      >
        <Button
          className="h-16 w-16 rounded-full shadow-2xl"
          onClick={handleAddNote}
          aria-label="Yeni not ekle"
        >
          <Plus className="h-8 w-8" />
        </Button>
      </motion.div>
    </div>
  );
}
