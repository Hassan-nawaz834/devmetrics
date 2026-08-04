const test = require('node:test');
const assert = require('node:assert/strict');
const { collectPaginatedData } = require('../services/githubService');

test('collectPaginatedData fetches all pages and merges results', async () => {
  const calls = [];
  const pages = [
    { data: [{ id: 1 }, { id: 2 }] },
    { data: [{ id: 3 }] },
    { data: [] }
  ];

  const items = await collectPaginatedData(async (page) => {
    calls.push(page);
    return pages[page - 1];
  }, { perPage: 100 });

  assert.deepEqual(items.map((item) => item.id), [1, 2, 3]);
  assert.deepEqual(calls, [1, 2, 3]);
});
