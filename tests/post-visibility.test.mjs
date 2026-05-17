import assert from 'node:assert/strict';
import test from 'node:test';

const posts = [
  {
    title: 'Published Post',
    draft: false,
    _raw: { flattenedPath: 'published-post' },
  },
  {
    title: 'Draft Post',
    draft: true,
    _raw: { flattenedPath: 'draft-post' },
  },
];

test('filterVisiblePosts hides drafts outside development', async () => {
  const { filterVisiblePosts } = await import('../utils/post-visibility.ts');

  const visiblePosts = filterVisiblePosts(posts, 'production');

  assert.deepEqual(
    visiblePosts.map((post) => post._raw.flattenedPath),
    ['published-post']
  );
});

test('filterVisiblePosts keeps drafts in development', async () => {
  const { filterVisiblePosts } = await import('../utils/post-visibility.ts');

  const visiblePosts = filterVisiblePosts(posts, 'development');

  assert.deepEqual(
    visiblePosts.map((post) => post._raw.flattenedPath),
    ['published-post', 'draft-post']
  );
});

test('findVisiblePostByFlattenedPath blocks draft lookups outside development', async () => {
  const { findVisiblePostByFlattenedPath } = await import('../utils/post-visibility.ts');

  assert.equal(
    findVisiblePostByFlattenedPath(posts, 'draft-post', 'production'),
    undefined
  );
  assert.equal(
    findVisiblePostByFlattenedPath(posts, 'draft-post', 'development')?._raw.flattenedPath,
    'draft-post'
  );
});

test('filterVisiblePosts preserves non-draft ordering for collection views', async () => {
  const { filterVisiblePosts } = await import('../utils/post-visibility.ts');

  const orderedPosts = [
    posts[1],
    posts[0],
  ];

  const visiblePosts = filterVisiblePosts(orderedPosts, 'production');

  assert.deepEqual(
    visiblePosts.map((post) => post._raw.flattenedPath),
    ['published-post']
  );
});
