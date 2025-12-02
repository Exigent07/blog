import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/posts');

export interface PostData {
  slug: string;
  title: string;
  date: string;
  category: string;
  readTime: string;
  tags: string[];
  excerpt: string;
  content: string;
}

function calculateReadTime(content: string): string {
  const wordsPerMinute = 100;
  const cleanContent = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[#*`]/g, '');
  const wordCount = cleanContent.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export function getPostBySlug(slug: string): PostData | null {
  try {
    const realSlug = slug.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, `${realSlug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug: realSlug,
      title: data.title,
      date: data.date,
      category: data.category,
      readTime: calculateReadTime(content),
      tags: data.tags || ["Uncategorized"],
      excerpt: data.excerpt || '',
      content: content,
    };
  } catch (e) {
    console.error(`Error reading post ${slug}:`, e);
    return null;
  }
}

export function getAllPosts(): PostData[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const filenames = fs.readdirSync(postsDirectory);
  const posts = filenames.map((name) => getPostBySlug(name)).filter((post): post is PostData => post !== null);
  return posts.sort((a, b) => (new Date(b.date) > new Date(a.date) ? 1 : -1));
}

export function getSimilarPosts(currentSlug: string, tags: string[], category: string, limit = 3): PostData[] {
  const allPosts = getAllPosts();
  
  const otherPosts = allPosts.filter((post) => post.slug !== currentSlug);

  const scoredPosts = otherPosts.map((post) => {
    let score = 0;

    if (post.category === category) {
      score += 5;
    }

    const matchingTags = post.tags.filter((tag) => tags.includes(tag));
    score += matchingTags.length * 3;

    return { post, score };
  });

  scoredPosts.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
  });

  return scoredPosts.map((item) => item.post).slice(0, limit);
}

export function getUniqueTags(): string[] {
  const posts = getAllPosts();
  const tags = new Set<string>();
  posts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

export function getUniqueCategories(): string[] {
  const posts = getAllPosts();
  const categories = new Set<string>();
  posts.forEach(post => {
    if (post.category) categories.add(post.category);
  });
  return Array.from(categories).sort();
}

export function getUniqueYears(): string[] {
  const posts = getAllPosts();
  const years = new Set<string>();
  posts.forEach(post => {
    const date = new Date(post.date);
    if (!isNaN(date.getTime())) {
      years.add(date.getFullYear().toString());
    }
  });
  return Array.from(years).sort((a, b) => b.localeCompare(a));
}