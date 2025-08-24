"use client";

import React from 'react';
import { useNotes } from '@/hooks/use-notes';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heart, Tag, Search, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


export function Header() {
  const { searchQuery, setSearchQuery, filter, setFilter, allTags } = useNotes();
  const { logout, isAuthenticated } = useAuth();
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm transition-all duration-300">
      <div className="container mx-auto flex h-20 items-center justify-between gap-4 px-4">
        <h1 className="text-2xl font-bold font-headline text-primary md:text-3xl">
          Kinetik Notlar
        </h1>
        {isAuthenticated && (
          <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
             <TooltipProvider>
            <motion.div 
              className="relative w-full max-w-xs sm:max-w-sm group"
              whileFocus={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                type="text"
                placeholder="Notlarda ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full transition-all duration-300 focus:shadow-lg focus:border-primary/50"
              />
            </motion.div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Select
                  value={filter.favorites}
                  onValueChange={(value) => setFilter({ favorites: value as 'all' | 'favorites' })}
                >
                  <SelectTrigger className="w-auto gap-2 hidden sm:flex">
                    <Heart className="h-4 w-4" />
                    <SelectValue placeholder="Favorilere göre filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Notlar</SelectItem>
                    <SelectItem value="favorites">Favoriler</SelectItem>
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>
                <p>Favorilere göre filtrele</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
               <TooltipTrigger asChild>
                  <Select
                    value={filter.tag}
                    onValueChange={(value) => setFilter({ tag: value })}
                  >
                    <SelectTrigger className="w-auto gap-2 hidden sm:flex">
                        <Tag className="h-4 w-4" />
                        <SelectValue placeholder="Etikete göre filtrele" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Etiketler</SelectItem>
                      {allTags.map((tag) => (
                        <SelectItem key={tag} value={tag} className="capitalize">
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </TooltipTrigger>
               <TooltipContent>
                  <p>Etikete göre filtrele</p>
               </TooltipContent>
            </Tooltip>

            <ThemeToggle />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={logout}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Çıkış Yap</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </div>
        )}
      </div>
    </header>
  );
}
