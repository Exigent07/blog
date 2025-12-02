import { PostData } from "@/lib/posts";

export interface SearchFilters {
  text: string;
  tags: string[];
  category?: string;
  year?: string;
  readTimeFilter?: 'short' | 'medium' | 'long';
}

function stripQuotes(str: string): string {
  return str.replace(/^"|"$/g, "");
}

function parseReadTime(readTimeStr: string): number {
  const match = readTimeStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function splitQuery(str: string): string[] {
  const match = str.match(/(?:[^\s"]+|"[^"]*")+/g);
  return match ? Array.from(match) : [];
}

export function parseSearchQuery(query: string): SearchFilters {
  const filters: SearchFilters = {
    text: "",
    tags: [],
  };

  const parts = splitQuery(query);
  const textParts: string[] = [];

  parts.forEach(part => {
    if (part.startsWith("tag:")) {
      const val = stripQuotes(part.substring(4));
      if (val) filters.tags.push(val);
    }
    else if (part.startsWith("category:")) {
      const val = stripQuotes(part.substring(9));
      if (val) filters.category = val;
    }
    else if (part.startsWith("year:")) {
      const val = stripQuotes(part.substring(5));
      if (val) filters.year = val;
    }
    else if (part.startsWith("readtime:")) {
      const val = stripQuotes(part.substring(9));
      
      if (val === '<5') filters.readTimeFilter = 'short';
      else if (val === '5-10') filters.readTimeFilter = 'medium';
      else if (val === '>10') filters.readTimeFilter = 'long';
    }
    else {
      textParts.push(stripQuotes(part));
    }
  });

  filters.text = textParts.join(" ");
  return filters;
}

export function filterPosts(posts: PostData[], query: string): PostData[] {
  if (!query.trim()) return posts;

  const filters = parseSearchQuery(query);
  const searchText = filters.text.toLowerCase();
  
  return posts.filter(post => {
    if (searchText) {
      const postText = `${post.title} ${post.excerpt || ''}`.toLowerCase();
      if (!postText.includes(searchText)) return false;
    }

    if (filters.tags.length > 0) {
      const postTags = (post.tags || []).map(t => t.toLowerCase());
      if (!post.tags && post.category) postTags.push(post.category.toLowerCase());

      const hasAllTags = filters.tags.every(reqTag => 
        postTags.some(pt => pt === reqTag.toLowerCase())
      );
      if (!hasAllTags) return false;
    }

    if (filters.category) {
      if ((post.category || "").toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
    }

    if (filters.year) {
      const postYear = new Date(post.date).getFullYear().toString();
      if (postYear !== filters.year) return false;
    }

    if (filters.readTimeFilter) {
      const min = parseReadTime(post.readTime || "0 min");
      
      if (filters.readTimeFilter === 'short' && min >= 5) return false;
      if (filters.readTimeFilter === 'medium' && (min < 5 || min > 10)) return false;
      if (filters.readTimeFilter === 'long' && min <= 10) return false;
    }

    return true;
  });
}

export function extractAllTags(posts: PostData[]): string[] {
  const tagsSet = new Set<string>();
  
  posts.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => tagsSet.add(tag));
    } else if (post.category) {
      tagsSet.add(post.category);
    }
  });

  return Array.from(tagsSet).sort();
}
