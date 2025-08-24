"use client";

import { NotesContext } from '@/contexts/NotesContext';
import { useContext } from 'react';

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
