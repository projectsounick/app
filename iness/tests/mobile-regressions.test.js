const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const walkSourceFiles = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkSourceFiles(fullPath);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });

test("Expo Router app directory contains routes rather than internal modules", () => {
  const forbiddenDirectories = [
    "Components",
    "Hoc",
    "Modals",
    "Theme",
    "helpers",
    "hooks",
    "interfaces",
    "modules",
    "services",
    "shared",
    "utils",
    "validation",
  ];

  for (const directory of forbiddenDirectories) {
    assert.equal(fs.existsSync(path.join(root, "app", directory)), false);
    assert.equal(fs.existsSync(path.join(root, "src", directory)), true);
  }
  assert.equal(fs.existsSync(path.join(root, "app", "Home.tsx")), false);
});

test("protected content does not mount before authentication and role checks", () => {
  const wrapper = read("src/Hoc/LoginWrapper.tsx");
  assert.match(wrapper, /isLoggedIn \? <WrappedComponent/);
  assert.match(wrapper, /options\.allowedRoles\.includes/);
  assert.match(wrapper, /Access restricted/);
});

test("notification navigation only uses allowlisted routes", () => {
  const notificationRouter = read("src/utils/notificationRouter.ts");
  assert.match(notificationRouter, /ALLOWED_NOTIFICATION_ROUTES/);
  assert.match(notificationRouter, /normalizeNotificationRoute\(screen\)/);
  assert.match(notificationRouter, /pathname: safeScreen/);
  assert.doesNotMatch(notificationRouter, /pathname: screen as any/);
});

test("support chat performs one controlled initial conversation request", () => {
  const supportChat = read("app/(tabs)/dashboard/supportchat.tsx");
  assert.match(
    supportChat,
    /useGetDataHook\(chatService\.getSupportConversation, targetUserId, false\)/
  );
  assert.equal((supportChat.match(/fetchData\(targetUserId\)/g) || []).length, 1);
});

test("refresh requests advertise the same client contract as normal requests", () => {
  const userService = read("src/services/user.service.ts");
  const refreshFunction = userService.slice(
    userService.indexOf("async function generateRefreshToken")
  );
  assert.match(refreshFunction, /"X-API-Version": "2"/);
  assert.match(refreshFunction, /"X-App-Version"/);
  assert.match(refreshFunction, /"X-App-Platform"/);
  assert.match(refreshFunction, /signal: controller\.signal/);
  assert.match(refreshFunction, /clearTimeout\(timeoutId\)/);
});

test("mobile source no longer calls the obsolete PhonePe merchant endpoint", () => {
  const paymentService = read("src/services/payment.service.ts");
  assert.doesNotMatch(paymentService, /phonepe|getMerchentId/i);
});

test("audited navigation, loading, feedback, and price regressions stay fixed", () => {
  const buttonSection = read("src/modules/ButtonSection.tsx");
  const hrDashboard = read("app/(tabs)/dashboard/hrCompanyDashboard.tsx");
  const login = read("app/login.tsx");
  const banner = read("src/modules/BannerCard.tsx");
  const planDetails = read("app/(tabs)/dashboard/plandetails.tsx");
  const cartItem = read("src/Components/Cart/CartItemCard.tsx");
  const productList = read("src/Components/ecom/ProductList.tsx");

  assert.match(
    buttonSection,
    /safeRouter\.navigate\("\/dashboard\/supportchat"\)/
  );
  assert.doesNotMatch(buttonSection, /navigate\("supportchat"/);
  assert.doesNotMatch(hrDashboard, /loading \|\| !data/);
  assert.match(hrDashboard, /Unable to load company analytics/);
  assert.match(login, /setErrorMessage\("Email is required"\);\s*setLoading\(false\)/);
  assert.match(banner, /setSnackbarMessage\(error\?\.message/);
  assert.match(planDetails, /setSnackbarMessage\(error\?\.message/);
  assert.match(cartItem, /Unable to apply this coupon/);
  assert.match(productList, /Price unavailable/);
});

test("public JSON requests use bounded response-validating fetches", () => {
  const fetchUtility = read("utils/fetchJsonWithTimeout.ts");
  assert.match(fetchUtility, /AbortController/);
  assert.match(fetchUtility, /if \(!response\.ok\)/);
  assert.match(fetchUtility, /clearTimeout\(timeoutId\)/);

  for (const file of [
    "src/modules/TransformationCards.tsx",
    "src/Components/Home/TestimonialsCarousel.tsx",
    "app/(tabs)/dashboard/testimonials.tsx",
    "src/modules/OfferCard.tsx",
    "src/services/promotionalVideo.service.ts",
  ]) {
    assert.match(read(file), /fetchJsonWithTimeout/);
  }
});

test("main tabs retain the audited performance safeguards", () => {
  const tabLayout = read("app/(tabs)/dashboard/tabs/_layout.tsx");
  const customTabBar = read("src/modules/CustomTabBar.tsx");
  const home = read("app/(tabs)/dashboard/tabs/index.tsx");
  const train = read("app/(tabs)/dashboard/tabs/train.tsx");
  const currentPlans = read("src/Components/Train/CurrentPlans.tsx");
  const feed = read("src/Components/Community/CommunityFeed.tsx");
  const store = read("src/Components/ecom/ProductList.tsx");
  const cache = read("utils/apiCache.ts");
  const healthCards = read("src/modules/HealthCards.tsx");
  const androidHealth = read("hooks/useAndroidHealthSync.ts");

  assert.match(tabLayout, /showManage=\{isStaff\}/);
  assert.match(customTabBar, /tabs\.filter\(\(tab\) => tab\.route !== "manage"\)/);
  assert.match(home, /<FlatList/);
  assert.match(home, /initialNumToRender=\{4\}/);
  assert.doesNotMatch(train, /onScroll=\{Animated\.event/);
  assert.doesNotMatch(currentPlans, /<ScrollView/);
  assert.match(feed, /FEED_FRESHNESS_MS/);
  assert.match(feed, /const FeedVideoPlayer = memo/);
  assert.match(store, /const groupedProducts = useMemo/);
  assert.match(store, /initialNumToRender=\{2\}/);
  assert.match(cache, /private memoryCache/);
  assert.match(healthCards, /<AppleHealthDashboard \/>/);
  assert.match(healthCards, /<AndroidHealthDashboard \/>/);
  assert.match(androidHealth, /androidStatusRequest/);
});

test("dashboard sections retain lifecycle, caching, responsive, and accessibility safeguards", () => {
  const home = read("app/(tabs)/dashboard/tabs/index.tsx");
  const activity = read("src/Components/Home/DashboardActivityContext.tsx");
  const image = read("src/Components/Home/CachedRemoteImage.tsx");
  const banner = read("src/modules/FeatureBanner.tsx");
  const offers = read("src/modules/OfferCard.tsx");
  const testimonials = read("src/Components/Home/TestimonialsCarousel.tsx");
  const blogs = read("src/modules/BlogSliderCard.tsx");
  const podcasts = read("src/Components/Home/PodcastSection.tsx");
  const quickAccess = read("src/modules/ButtonSection.tsx");
  const header = read("src/modules/SmallHeader.tsx");
  const health = read("src/modules/HealthCards.tsx");
  const sessions = read("src/Components/Home/SessionCards.tsx");

  assert.match(home, /DashboardActivityProvider/);
  assert.match(home, /accessibilityLiveRegion="polite"/);
  assert.match(activity, /useIsFocused/);
  assert.match(activity, /AppState\.addEventListener/);
  assert.match(activity, /isReduceMotionEnabled/);

  assert.match(banner, /if \(!isActive \|\| reduceMotion\)/);
  assert.match(offers, /getItemLayout=/);
  assert.match(offers, /onScrollToIndexFailed=/);
  assert.match(offers, /dashboard:offers/);
  assert.match(testimonials, /dashboard:testimonials/);
  assert.doesNotMatch(testimonials, /Date\.now\(\).*testimonial/);

  assert.match(blogs, /<FlatList/);
  assert.match(blogs, /blogs\.slice\(0, 8\)/);
  assert.match(podcasts, /<FlatList/);
  assert.doesNotMatch(quickAccess, /useSelector/);

  assert.match(image, /cachePolicy="memory-disk"/);
  assert.match(image, /onError=/);
  assert.match(header, /useFocusEffect/);
  assert.match(header, /getStoredNotifications/);
  assert.match(header, /Notifications, \$\{notificationResponseLength\} unread/);

  for (const source of [offers, testimonials, blogs, podcasts, header, health, sessions]) {
    assert.match(source, /useWindowDimensions/);
    assert.match(source, /accessibility(?:Role|Label)/);
  }
});

test("Feed comments retain reporting, blocking, deletion, and first-comment access", () => {
  const feed = read("src/Components/Community/CommunityFeed.tsx");
  const service = read("src/services/community.service.ts");

  assert.match(feed, /name="chatbubble-outline"/);
  assert.match(feed, /Report comment/);
  assert.match(feed, /Report user/);
  assert.match(feed, /Block user/);
  assert.match(feed, /Delete comment/);
  assert.match(feed, /(?:getCommentLanguageFilter\(\)|commentLanguageFilter)\.isProfane/);
  assert.match(feed, /maxLength=\{2000\}/);
  assert.match(feed, /"Block user\?"/);
  assert.match(service, /report-post-comment\/\$\{commentId\}/);
  assert.match(service, /delete-post-comment\/\$\{commentId\}/);
});

test("Android crash-prone dashboard flows retain their lifecycle guards", () => {
  const rootLayout = read("app/_layout.tsx");
  const errorBoundary = read("src/Components/AppErrorBoundary.tsx");
  const userVideoCall = read("src/modules/VideoCallModule.tsx");
  const trainerVideoCall = read("src/modules/TrainerVideoCallModule.tsx");
  const shortcut = read("src/modules/Imagepicker.tsx");
  const transformation = read("app/(tabs)/dashboard/transformationImage.tsx");
  const purchases = read("app/(tabs)/dashboard/purchases.tsx");
  const activePlanDates = read(
    "src/Components/ActivePlans.tsx/ActivePlanHeaderAddOn.tsx"
  );

  assert.match(rootLayout, /<AppErrorBoundary>/);
  assert.match(errorBoundary, /getDerivedStateFromError/);
  assert.match(errorBoundary, /Try Again/);

  for (const videoCall of [userVideoCall, trainerVideoCall]) {
    assert.match(videoCall, /mountedRef/);
    assert.match(videoCall, /setupTimers\.forEach\(clearTimeout\)/);
    assert.match(videoCall, /agoraEngineRef\.current !== engine/);
    assert.match(videoCall, /engine\.release\(\)/);
  }

  for (const picker of [shortcut, transformation]) {
    assert.match(picker, /MediaTypeOptions\.Images/);
    assert.match(picker, /MediaTypeOptions\.Videos/);
  }
  assert.doesNotMatch(transformation, /mediaTypes: ImagePicker\.MediaTypeOptions\.All/);
  assert.match(purchases, /Array\.isArray\(response\.data\)/);
  assert.match(activePlanDates, /const getDateKey/);
  assert.match(activePlanDates, /getFullYear\(\)/);
  assert.match(activePlanDates, /getMonth\(\)/);
});

test("dismissible native modals handle the Android back button", () => {
  const modalFiles = [
    "src/Modals/VideoViewerModal.tsx",
    "src/Modals/ImageViewerModal.tsx",
    "src/Modals/TransformationModal.tsx",
    "src/Modals/MediaVideoModal.tsx",
    "src/Modals/ActivityModal.tsx",
    "src/Modals/PodcastBottomSheetModal.tsx",
    "src/Modals/NotificationPermissionModal.tsx",
    "src/Modals/CommunitPostModal.tsx",
    "src/Modals/VideoCallJoinModal.tsx",
    "src/Modals/SessionCalendarSheet.tsx",
  ];

  for (const file of modalFiles) {
    assert.match(read(file), /onRequestClose=/, `${file} lacks onRequestClose`);
  }
});

test("press-driven navigation uses the shared rapid-tap guard", () => {
  const safeRouter = read("src/utils/safeRouter.ts");

  assert.match(safeRouter, /const NAVIGATION_LOCK_MS = 750/);
  assert.match(safeRouter, /if \(now < nextAllowedNavigationAt\)/);
  assert.match(safeRouter, /nativeRouter\.navigate/);
  assert.match(safeRouter, /nativeRouter\.back/);

  const allowedRawNavigationFiles = new Set([
    "src/utils/notificationRouter.ts",
  ]);
  const sourceFiles = ["app", "src"].flatMap((directory) =>
    walkSourceFiles(path.join(root, directory))
  );

  for (const filePath of sourceFiles) {
    const relativePath = path.relative(root, filePath).replace(/\\/g, "/");
    if (allowedRawNavigationFiles.has(relativePath)) continue;

    const source = fs.readFileSync(filePath, "utf8");
    assert.doesNotMatch(
      source,
      /\brouter\.(?:push|back)\s*\(/,
      `${relativePath} bypasses safeRouter`
    );
    assert.doesNotMatch(
      source,
      /\bnavigation\.goBack\s*\(/,
      `${relativePath} bypasses guarded back navigation`
    );
  }
});

test("async press actions use the shared single-flight guard", () => {
  const safeAction = read("src/utils/safeAction.ts");
  const shortcut = read("src/modules/Imagepicker.tsx");
  const login = read("app/login.tsx");

  assert.match(safeAction, /activeActions\.has\(key\)/);
  assert.match(safeAction, /cooldowns\.get\(key\)/);
  assert.match(shortcut, /runSingleAction\("dashboard-floating-menu"/);
  assert.match(shortcut, /runSingleAction\("dashboard-shortcut"/);
  assert.match(login, /runSingleAction\("login-google-android"/);
  assert.match(login, /runSingleAction\("login-send-otp"/);
  assert.match(login, /if \(userInfo\.type !== "success"\)/);
});

test("meditation renders one type selector per theme branch", () => {
  const meditation = read("app/(tabs)/dashboard/meditation.tsx");
  assert.equal(
    (meditation.match(/type: "breathing" as MeditationType/g) || []).length,
    2
  );
});
