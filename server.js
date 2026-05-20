const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({
  path: path.join(__dirname, "backend", ".env"),
  override: true,
});

const express = require("express");
const app = require("./backend/app");
const connectDatabase = require("./backend/config/database");
const PORT = process.env.PORT || 4000;

// UncaughtException Error
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

// deployment
__dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Server is Running! 🚀");
  });
}

(async function start() {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Connecting to MongoDB…");
  });

  try {
    await connectDatabase();
    console.log("MongoDB connected.");
    const Product = require("./backend/models/productModel");
    const Blog = require("./backend/models/blogModel");
    const { seedProducts } = require("./backend/utils/seedProducts");
    const { seedBlogsIfEmpty } = require("./backend/utils/seedBlogsIfEmpty");
    const { syncBlogPostsWithProductLinks } = require("./backend/utils/syncBlogProductLinks");
    const { buildProductLinkMap } = require("./backend/utils/blogProductLinks");
    try {
      const demoCount = await Product.countDocuments({
        seedKey: { $exists: true, $ne: "" },
      });
      let linkMap = {};
      if (demoCount === 0) {
        const result = await seedProducts({ updateExisting: false });
        linkMap = result.linkMap;
      } else {
        const products = await Product.find({ seedKey: { $exists: true, $ne: "" } });
        linkMap = buildProductLinkMap(products);
      }
      await seedBlogsIfEmpty();
      const needsLinkSync = await Blog.exists({
        content: /\{\{product:/,
      });
      if (needsLinkSync && Object.keys(linkMap).length) {
        await syncBlogPostsWithProductLinks(linkMap);
      }
    } catch (seedErr) {
      console.warn("Demo seed skipped:", seedErr.message || seedErr);
    }
  } catch (err) {
    console.error("\nMongoDB is not connected. The API will not load data until this is fixed.\n");
    console.error(err.message);
    console.error(`
Fix checklist:
  1. Atlas → Network Access → add your current IP (or 0.0.0.0/0 for dev)
  2. Atlas → Database → Resume cluster if paused
  3. backend/.env → MONGO_URI must match Atlas user + password (URL-encode special chars in password)
  4. Restart: npm run server  (or npm run dev)
`);
    console.error("Proxy errors (ECONNREFUSED) mean the browser cannot reach port 4000 — fix Mongo first, then restart backend.\n");
  }
})();
