/* global __dirname */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const appRoot = path.resolve(__dirname, "..");
const backendRoot = path.resolve(appRoot, "..", "..", "backend");

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (["node_modules", "android", ".git", ".expo"].includes(entry.name)) {
      return [];
    }
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

test(
  "every static app API endpoint maps to a backend function route",
  { skip: !fs.existsSync(backendRoot) },
  () => {
    const backendRoutes = new Set();
    for (const entry of fs.readdirSync(backendRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const configPath = path.join(backendRoot, entry.name, "function.json");
      if (!fs.existsSync(configPath)) continue;
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const trigger = config.bindings?.find(
        (binding) => binding.type === "httpTrigger"
      );
      if (!trigger) continue;
      backendRoutes.add((trigger.route || entry.name).split("/")[0]);
    }

    const usedRoutes = new Map();
    const endpointPatterns = [
      /\$\{baseUrl\}\/([A-Za-z0-9-]+)/g,
      /\$\{config\.apiUrl\}\/api\/([A-Za-z0-9-]+)/g,
      /iness-app-backend\.azurewebsites\.net\/api\/([A-Za-z0-9-]+)/g,
    ];

    for (const filePath of walk(appRoot).filter((file) =>
      /\.(?:js|jsx|ts|tsx)$/.test(file)
    )) {
      const source = fs.readFileSync(filePath, "utf8");
      for (const pattern of endpointPatterns) {
        let match;
        while ((match = pattern.exec(source))) {
          const route = match[1];
          if (!usedRoutes.has(route)) usedRoutes.set(route, new Set());
          usedRoutes.get(route).add(path.relative(appRoot, filePath));
        }
      }
    }

    const missing = [...usedRoutes]
      .filter(([route]) => !backendRoutes.has(route))
      .map(([route, files]) => ({ route, files: [...files] }));

    assert.deepEqual(missing, []);
  }
);

test(
  "static app API calls use methods accepted by their backend routes",
  { skip: !fs.existsSync(backendRoot) },
  () => {
    const backendMethods = new Map();
    for (const entry of fs.readdirSync(backendRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const configPath = path.join(backendRoot, entry.name, "function.json");
      if (!fs.existsSync(configPath)) continue;
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const trigger = config.bindings?.find(
        (binding) => binding.type === "httpTrigger"
      );
      if (!trigger) continue;
      backendMethods.set(
        (trigger.route || entry.name).split("/")[0].toLowerCase(),
        new Set((trigger.methods || []).map((method) => method.toUpperCase()))
      );
    }

    const mismatches = [];
    const wrapperCall =
      /fetchWrapper\.(get|post|put|delete|patch)\s*\(\s*`([^`]+)`/g;
    const endpoint =
      /(?:\$\{baseUrl\}|\$\{config\.apiUrl\}\/api|iness-app-backend\.azurewebsites\.net\/api)\/([A-Za-z0-9-]+)/;

    for (const filePath of walk(appRoot).filter((file) =>
      /\.(?:js|jsx|ts|tsx)$/.test(file)
    )) {
      const source = fs.readFileSync(filePath, "utf8");
      let match;
      while ((match = wrapperCall.exec(source))) {
        const routeMatch = match[2].match(endpoint);
        if (!routeMatch) continue;
        const route = routeMatch[1].toLowerCase();
        const method = match[1].toUpperCase();
        if (!backendMethods.get(route)?.has(method)) {
          mismatches.push({
            file: path.relative(appRoot, filePath),
            route,
            method,
            backendMethods: [...(backendMethods.get(route) || [])],
          });
        }
      }
    }

    assert.deepEqual(mismatches, []);
  }
);
