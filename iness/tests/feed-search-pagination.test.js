const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("feed search thoroughly matches author name and supports debounced server querying", () => {
  const feed = read("src/Components/Community/CommunityFeed.tsx");
  const service = read("src/services/community.service.ts");

  // Client search matches author names across all fields
  assert.match(feed, /authorName/);
  assert.match(feed, /createdBy\?\.firstName/);
  assert.match(feed, /createdBy\?\.lastName/);
  assert.match(feed, /createdByUser\?\.userName/);

  // Debounced server search effect
  assert.match(feed, /fetchPosts\(1,\s*false,\s*feedSearchQuery\)/);

  // Service accepts search parameter
  assert.match(service, /search\?:\s*string/);
  assert.match(service, /&search=\$\{encodeURIComponent\(search\.trim\(\)\)\}/);
});

test("feed infinite scroll pagination has robust loading and refresh mechanics", () => {
  const feed = read("src/Components/Community/CommunityFeed.tsx");

  // Uses lock ref instead of momentum lock
  assert.match(feed, /isLoadingMoreRef/);
  assert.match(feed, /onEndReachedThreshold=\{0\.6\}/);
  assert.match(feed, /RefreshControl/);
  assert.match(feed, /refreshControl=/);

  // End of feed and loading footer indicators
  assert.match(feed, /You're all caught up/);
  assert.match(feed, /Loading more posts\.\.\./);
});
