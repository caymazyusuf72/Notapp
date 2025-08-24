"use client";

import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotesProvider } from '@/contexts/NotesContext';
import { AuthProvider } from '@/contexts/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotesProvider>{children}</NotesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
