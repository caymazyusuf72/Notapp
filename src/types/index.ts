export type Note = {
  id: string;
  title: string;
  content: string;
  color: string;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  imageUrl?: string | null;
  isCreative?: boolean;
  creativityExplanation?: string;
  tags?: string[];
};

export const noteColors: Record<string, string> = {
  default: 'bg-card',
  red: 'bg-red-200 dark:bg-red-900/50',
  orange: 'bg-orange-200 dark:bg-orange-900/50',
  yellow: 'bg-yellow-200 dark:bg-yellow-900/50',
  green: 'bg-green-200 dark:bg-green-900/50',
  teal: 'bg-teal-200 dark:bg-teal-900/50',
  blue: 'bg-blue-200 dark:bg-blue-900/50',
  purple: 'bg-purple-200 dark:bg-purple-900/50',
};
