"use client";

import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { Note } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

type Filter = {
  favorites: 'all' | 'favorites';
  tag: string;
  sortBy: 'updatedAt' | 'createdAt';
};

interface NotesContextType {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: Filter;
  setFilter: (filter: Partial<Filter>) => void;
  filteredNotes: Note[];
  allTags: string[];
}

export const NotesContext = createContext<NotesContextType | null>(null);

const initialFilter: Filter = {
  favorites: 'all',
  tag: 'all',
  sortBy: 'updatedAt',
};

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilterState] = useState<Filter>(initialFilter);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedNotes = localStorage.getItem('kinetic-notes');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
      console.error('Failed to load notes from localStorage', error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('kinetic-notes', JSON.stringify(notes));
      } catch (error) {
        console.error('Failed to save notes to localStorage', error);
      }
    }
  }, [notes, isMounted]);

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: noteData.tags || [],
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(prevNotes =>
      prevNotes.map(note => (note.id === updatedNote.id ? { ...updatedNote, updatedAt: Date.now() } : note))
    );
  };
  
  const undoDelete = (deletedNote: Note) => {
    setNotes(prevNotes => [...prevNotes, deletedNote].sort((a,b) => b.updatedAt - a.updatedAt));
  };

  const deleteNote = (id: string) => {
    const noteToDelete = notes.find(note => note.id === id);
    if (!noteToDelete) return;

    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    toast({
      title: "Not silindi",
      description: `"${noteToDelete.title}" çöp kutusuna taşındı.`,
      action: <Button variant="secondary" onClick={() => undoDelete(noteToDelete)}>Geri Al</Button>,
    });
  };

  const setFilter = (newFilter: Partial<Filter>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }));
  };

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach(note => {
      note.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        const searchLower = searchQuery.toLowerCase();
        const contentMatch =
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower) ||
          (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchLower)));

        const favoriteMatch = filter.favorites === 'all' || note.isFavorite;
        const tagMatch = filter.tag === 'all' || (note.tags && note.tags.includes(filter.tag));

        return contentMatch && favoriteMatch && tagMatch;
      })
      .sort((a, b) => (filter.sortBy === 'createdAt' ? b.createdAt - a.createdAt : b.updatedAt - a.updatedAt));
  }, [notes, searchQuery, filter]);

  const value = {
    notes,
    setNotes,
    addNote,
    updateNote,
    deleteNote,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    filteredNotes,
    allTags,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}
