export const mockUser = {
  id: 'user_1',
  name: 'John Doe',
  email: 'demo@example.com',
  image: null,
  isPro: false
};

export const mockItemTypes = [
  { id: 'type_snippet', name: 'Snippet', icon: 'Code', color: '#3b82f6', isSystem: true },
  { id: 'type_prompt', name: 'Prompt', icon: 'Sparkles', color: '#8b5cf6', isSystem: true },
  { id: 'type_command', name: 'Command', icon: 'Terminal', color: '#f97316', isSystem: true },
  { id: 'type_note', name: 'Note', icon: 'StickyNote', color: '#fde047', isSystem: true },
  { id: 'type_file', name: 'File', icon: 'File', color: '#6b7280', isSystem: true },
  { id: 'type_image', name: 'Image', icon: 'Image', color: '#ec4899', isSystem: true },
  { id: 'type_link', name: 'Link', icon: 'Link', color: '#10b981', isSystem: true }
];

export const mockItems = [
  {
    id: 'item_1',
    title: 'useDebounce hook',
    description: 'Custom React hook to debounce a value',
    contentType: 'TEXT' as const,
    content: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}`,
    language: 'typescript',
    itemTypeId: 'type_snippet',
    isFavorite: false,
    isPinned: true,
    tags: ['react', 'hooks', 'typescript'],
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z'
  },
  {
    id: 'item_2',
    title: 'GPT Code Review Prompt',
    description: 'System prompt for thorough code reviews',
    contentType: 'TEXT' as const,
    content: `You are an expert code reviewer. Review the following code for bugs, performance issues, security vulnerabilities, and adherence to best practices. Provide specific, actionable feedback with examples where possible.`,
    language: null,
    itemTypeId: 'type_prompt',
    isFavorite: true,
    isPinned: false,
    tags: ['gpt', 'code-review', 'ai'],
    createdAt: '2026-03-19T14:30:00Z',
    updatedAt: '2026-03-19T14:30:00Z'
  },
  {
    id: 'item_3',
    title: 'Kill port process',
    description: 'Kill whatever process is using a given port',
    contentType: 'TEXT' as const,
    content: `lsof -ti tcp:<PORT> | xargs kill -9`,
    language: 'bash',
    itemTypeId: 'type_command',
    isFavorite: false,
    isPinned: false,
    tags: ['bash', 'network', 'process'],
    createdAt: '2026-03-18T09:00:00Z',
    updatedAt: '2026-03-18T09:00:00Z'
  },
  {
    id: 'item_4',
    title: 'Fetch with error handling',
    description: 'Typed fetch wrapper with error handling',
    contentType: 'TEXT' as const,
    content: `async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json() as Promise<T>;
}`,
    language: 'typescript',
    itemTypeId: 'type_snippet',
    isFavorite: false,
    isPinned: false,
    tags: ['typescript', 'fetch', 'utils'],
    createdAt: '2026-03-17T11:00:00Z',
    updatedAt: '2026-03-17T11:00:00Z'
  },
  {
    id: 'item_5',
    title: 'Git stash all changes',
    description: 'Stash all tracked and untracked files',
    contentType: 'TEXT' as const,
    content: `git stash push -u -m "description"`,
    language: 'bash',
    itemTypeId: 'type_command',
    isFavorite: false,
    isPinned: false,
    tags: ['git'],
    createdAt: '2026-03-16T08:00:00Z',
    updatedAt: '2026-03-16T08:00:00Z'
  },
  {
    id: 'item_6',
    title: 'Python list comprehension patterns',
    description: 'Common list comprehension patterns in Python',
    contentType: 'TEXT' as const,
    content: `# Filter and transform
evens_squared = [x**2 for x in range(20) if x % 2 == 0]

# Flatten nested list
flat = [item for sublist in nested for item in sublist]

# Dict comprehension
inverted = {v: k for k, v in original.items()}`,
    language: 'python',
    itemTypeId: 'type_snippet',
    isFavorite: false,
    isPinned: false,
    tags: ['python', 'lists'],
    createdAt: '2026-03-15T13:00:00Z',
    updatedAt: '2026-03-15T13:00:00Z'
  },
  {
    id: 'item_7',
    title: 'React docs',
    description: 'Official React documentation',
    contentType: 'URL' as const,
    content: null,
    language: null,
    url: 'https://react.dev',
    itemTypeId: 'type_link',
    isFavorite: true,
    isPinned: false,
    tags: ['react', 'docs'],
    createdAt: '2026-03-14T10:00:00Z',
    updatedAt: '2026-03-14T10:00:00Z'
  }
];

export const mockCollections = [
  {
    id: 'col_1',
    name: 'React Patterns',
    description: 'Reusable React hooks, components, and patterns',
    isFavorite: true,
    itemIds: ['item_1', 'item_4', 'item_7'],
    createdAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z'
  },
  {
    id: 'col_2',
    name: 'Context Files',
    description: 'AI context and system prompt files',
    isFavorite: false,
    itemIds: ['item_2'],
    createdAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-03-19T14:30:00Z'
  },
  {
    id: 'col_3',
    name: 'Python Snippets',
    description: 'Useful Python code patterns',
    isFavorite: false,
    itemIds: ['item_6'],
    createdAt: '2026-03-11T10:00:00Z',
    updatedAt: '2026-03-15T13:00:00Z'
  },
  {
    id: 'col_4',
    name: 'Interview Prep',
    description: 'Snippets and prompts for interview practice',
    isFavorite: false,
    itemIds: ['item_1', 'item_2', 'item_6'],
    createdAt: '2026-03-12T10:00:00Z',
    updatedAt: '2026-03-19T14:30:00Z'
  },
  {
    id: 'col_5',
    name: 'Dev Tools',
    description: 'Terminal commands and dev workflow shortcuts',
    isFavorite: false,
    itemIds: ['item_3', 'item_5'],
    createdAt: '2026-03-13T10:00:00Z',
    updatedAt: '2026-03-18T09:00:00Z'
  },
  {
    id: 'col_6',
    name: 'API References',
    description: 'Links and notes for APIs I use regularly',
    isFavorite: false,
    itemIds: ['item_7'],
    createdAt: '2026-03-14T10:00:00Z',
    updatedAt: '2026-03-14T10:00:00Z'
  }
];
