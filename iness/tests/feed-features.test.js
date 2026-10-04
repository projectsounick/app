const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("feed features use the shared theme and ship without preview-only routes", () => {
  const featureLayer = read("src/Components/Community/FeedFeatureLayer.tsx");
  const feed = read("src/Components/Community/CommunityFeed.tsx");
  const composer = read("src/Modals/CommunitPostModal.tsx");

  assert.match(featureLayer, /useGlobalTheme/);
  assert.match(feed, /useGlobalTheme/);
  assert.match(composer, /useGlobalTheme/);
  assert.equal(fs.existsSync(path.join(root, "app/feed-preview.tsx")), false);
});

test("feed UI retains complete story, save, poll, privacy, and publishing controls", () => {
  const featureLayer = read("src/Components/Community/FeedFeatureLayer.tsx");
  const feed = read("src/Components/Community/CommunityFeed.tsx");
  const composer = read("src/Modals/CommunitPostModal.tsx");

  for (const action of ["react", "reply", "delete"]) {
    assert.match(featureLayer, new RegExp(`storyAction\\(\\"${action}\\"`));
  }
  assert.match(featureLayer, /complainType:\s*"story"/);
  assert.match(feed, /New collection name/);
  assert.match(feed, /ListEmptyComponent/);
  assert.match(composer, /publishingStatus === "scheduled"/);
  assert.match(composer, /contentType === "poll"/);
  assert.match(composer, /commentsEnabled/);
  assert.match(composer, /sharingEnabled/);
});

test("feed extras are theme-based and analytics events are wired to real actions", () => {
  const featureLayer = read("src/Components/Community/FeedFeatureLayer.tsx");
  const extras = read("src/Components/Community/FeedExtrasModal.tsx");
  const feed = read("src/Components/Community/CommunityFeed.tsx");
  const store = read("app/(tabs)/dashboard/tabs/store.tsx");
  const product = read("src/Modals/ProductBottomSheetModal.tsx");

  assert.match(featureLayer, /close_friends/);
  assert.match(featureLayer, /StoryViewersModal/);
  assert.match(extras, /useGlobalTheme/);
  assert.match(extras, /story_hide/);
  assert.match(feed, /kind:\s*"impression"/);
  assert.match(feed, /kind:\s*"share"/);
  assert.match(store, /targetType:\s*"store"/);
  assert.match(product, /kind:\s*"add_to_cart"/);
});
