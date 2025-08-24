"use client";

import { useNotes } from '@/hooks/use-notes';
import type { Note } from '@/types';
import { NoteCard } from './NoteCard';
import { Reorder } from 'framer-motion';
import { useEffect, useState } from 'react';

interface NoteGridProps {
  onEditNote: (note: Note) => void;
}

export function NoteGrid({ onEditNote }: NoteGridProps) {
  const { filteredNotes, setNotes, notes } = useNotes();
  const [activeNotes, setActiveNotes] = useState(filteredNotes);

  useEffect(() => {
    setActiveNotes(filteredNotes);
  }, [filteredNotes]);
  
  const handleReorder = (newOrder: Note[]) => {
    setActiveNotes(newOrder);
    
    // Create a map of the new order for faster lookups
    const newOrderMap = new Map(newOrder.map((note, index) => [note.id, index]));
    
    // Create a new array for all notes, preserving the original order of unfiltered notes
    const reorderedAllNotes = [...notes].sort((a, b) => {
      const aInNewOrder = newOrderMap.has(a.id);
      const bInNewOrder = newOrderMap.has(b.id);

      if (aInNewOrder && bInNewOrder) {
        return newOrderMap.get(a.id)! - newOrderMap.get(b.id)!;
      }
      if (aInNewOrder) return -1; // a should come first
      if (bInNewOrder) return 1;  // b should come first
      return 0; // maintain original relative order of unfiltered items
    });

    setNotes(reorderedAllNotes);
  };

  if (activeNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-64">
        <h2 className="text-2xl font-semibold text-muted-foreground">Hiç not bulunamadı.</h2>
        <p className="text-muted-foreground">Başlamak için yeni bir not oluşturun!</p>
      </div>
    );
  }

  return (
    <Reorder.Group
      as="div"
      values={activeNotes}
      onReorder={handleReorder}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
        {activeNotes.map((note) => (
          <Reorder.Item 
            as="div" 
            key={note.id} 
            value={note}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
             <NoteCard
              note={note}
              onEditNote={onEditNote}
            />
          </Reorder.Item>
        ))}
    </Reorder.Group>
  );
}
