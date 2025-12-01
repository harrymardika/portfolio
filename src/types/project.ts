// Project type definitions
export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  url: string;
  homepage?: string;
  stars: number;
  topics: string[];
  languages: Language[];
  updatedAt: string;
  year: number;
  heroImage?: string;
}

export interface Language {
  name: string;
  color?: string;
  percentage?: number;
}

export interface TimeLayer {
  year: number;
  projects: Project[];
}
