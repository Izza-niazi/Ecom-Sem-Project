/**
 * Seed MongoDB with an admin user and sample products.
 * Run from project root:  npm run seed
 * Requires MONGO_URI in backend/.env (same as the running app).
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const User = require("../models/userModel");
const Product = require("../models/productModel");

const SEED_ADMIN_EMAIL =
  process.env.SEED_ADMIN_EMAIL || "admin@flipkart-demo.local";
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Adminpass1";
const SEED_ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Demo Admin";

const FLIP_IMG = (id) =>
  `https://rukminim1.flixcart.com/image/416/416/${id}.jpeg`;

async function connect() {
  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in backend/.env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("MongoDB connected for seed");
}

const sampleProducts = (adminId) => [
  {
    name: "Wireless Bluetooth Headphones",
    description:
      "Over-ear wireless headphones with deep bass and 30-hour battery life. Foldable design with cushioned ear cups.",
    highlights: ["Bluetooth 5.0", "30h battery", "Built-in mic", "Foldable"],
    specifications: [
      { title: "Connectivity", description: "Bluetooth 5.0, 3.5mm aux" },
      { title: "Battery", description: "Li-ion rechargeable" },
    ],
    price: 1999,
    cuttedPrice: 4999,
    images: [
      {
        public_id: "seed/headphones-1",
        url: FLIP_IMG("kffq2kw0/headphone/n/c/3/boat-rockerz-510-caribbean-green-original-imafw3kyu8dhcyyp"),
      },
    ],
    brand: {
      name: "SoundMax",
      logo: {
        public_id: "seed/brand-soundmax",
        url: FLIP_IMG("kyhlfgw0/smartwatch/7/8/h/38-android-ios-nf-38-android-ios-hrv-nf-noy-original-imagargduszk8fby"),
      },
    },
    category: "Electronics",
    stock: 50,
    warranty: 1,
    user: adminId,
    seo: {
      pageTitle: "Wireless Bluetooth Headphones — deals",
      metaDescription:
        "Over-ear wireless headphones with deep bass and 30-hour battery. Shop SoundMax on izzumarket.",
      keywords: "bluetooth headphones, wireless headphones, electronics, SoundMax",
      ogTitle: "Wireless Bluetooth Headphones",
      ogDescription: "Deep bass, 30h battery — shop with confidence.",
      robots: "index, follow",
      canonicalPath: "",
    },
  },
  {
    name: "Smartphone 128GB",
    description:
      "6.5 inch display, 128GB storage, 48MP triple camera. Fast charging included.",
    highlights: ["128GB Storage", "48MP Camera", "5000mAh battery"],
    specifications: [
      { title: "Display", description: "6.5 inch FHD+" },
      { title: "Processor", description: "Octa-core" },
    ],
    price: 12999,
    cuttedPrice: 16999,
    images: [
      {
        public_id: "seed/phone-1",
        url: FLIP_IMG("kq43l880/mobile/e/m/f/c25-yu-1000-infinix-original-imag4wh24cqgzfcf"),
      },
    ],
    brand: {
      name: "Mobitech",
      logo: {
        public_id: "seed/brand-mobitech",
        url: FLIP_IMG("kyhlfgw0/smartwatch/7/8/h/38-android-ios-nf-38-android-ios-hrv-nf-noy-original-imagargduszk8fby"),
      },
    },
    category: "Mobiles",
    stock: 100,
    warranty: 1,
    user: adminId,
  },
  {
    name: "Men's Casual Sneakers",
    description:
      "Lightweight casual shoes with cushioned sole. Suitable for daily wear.",
    highlights: ["Breathable mesh", "Rubber sole", "Lace-up"],
    specifications: [
      { title: "Material", description: "Synthetic mesh upper" },
      { title: "Care", description: "Wipe with dry cloth" },
    ],
    price: 899,
    cuttedPrice: 2499,
    images: [
      {
        public_id: "seed/shoes-1",
        url: FLIP_IMG("ku79vgw0/shoe/n/k/b/6-941-6-waanz-black-original-imag7mtd8yfcj5gz"),
      },
    ],
    brand: {
      name: "Stride",
      logo: {
        public_id: "seed/brand-stride",
        url: FLIP_IMG("ku79vgw0/shoe/n/k/b/6-941-6-waanz-black-original-imag7mtd8yfcj5gz"),
      },
    },
    category: "Fashion",
    stock: 75,
    warranty: 0,
    user: adminId,
  },
  {
    name: "Stainless Steel Kettle 1.5L",
    description:
      "Electric kettle with auto shut-off. 1500W fast boil. BPA-free interior.",
    highlights: ["1.5 Litre", "Auto shut-off", "360° base"],
    specifications: [
      { title: "Power", description: "1500W" },
      { title: "Material", description: "Stainless steel" },
    ],
    price: 649,
    cuttedPrice: 1299,
    images: [
      {
        public_id: "seed/kettle-1",
        url: FLIP_IMG("kq6y3yk0/electric-kettle/h/m/u/cdl-original-imag4ffgxnggtuk6"),
      },
    ],
    brand: {
      name: "KitchenPro",
      logo: {
        public_id: "seed/brand-kitchen",
        url: FLIP_IMG("kq6y3yk0/electric-kettle/h/m/u/cdl-original-imag4ffgxnggtuk6"),
      },
    },
    category: "Appliances",
    stock: 40,
    warranty: 2,
    user: adminId,
  },
  {
    name: "Wooden Coffee Table",
    description:
      "Compact coffee table for living room. Engineered wood with melamine finish.",
    highlights: ["W 90cm x D 45cm", "Easy to assemble", "Scratch resistant"],
    specifications: [
      { title: "Dimensions", description: "90 x 45 x 40 cm" },
      { title: "Weight", description: "12 kg" },
    ],
    price: 3299,
    cuttedPrice: 5999,
    images: [
      {
        public_id: "seed/table-1",
        url: FLIP_IMG("krntoy80/tv-cabinet/b/o/o/particle-board-decent-tv-entertainment-unit-bluewud-original-imag5y32uz7d2hn6"),
      },
    ],
    brand: {
      name: "HomeCraft",
      logo: {
        public_id: "seed/brand-home",
        url: FLIP_IMG("krntoy80/tv-cabinet/b/o/o/particle-board-decent-tv-entertainment-unit-bluewud-original-imag5y32uz7d2hn6"),
      },
    },
    category: "Home",
    stock: 15,
    warranty: 1,
    user: adminId,
  },
];

async function run() {
  const force = process.argv.includes("--force");

  await connect();

  let admin = await User.findOne({ email: SEED_ADMIN_EMAIL });
  if (admin) {
    admin.role = "admin";
    await admin.save();
    console.log("Existing user promoted to admin:", SEED_ADMIN_EMAIL);
  } else {
    admin = await User.create({
      name: SEED_ADMIN_NAME,
      email: SEED_ADMIN_EMAIL,
      gender: "male",
      password: SEED_ADMIN_PASSWORD,
      role: "admin",
      avatar: {
        public_id: "",
        url: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
      },
    });
    console.log("Created admin user:", SEED_ADMIN_EMAIL);
  }

  const count = await Product.countDocuments();
  if (count > 0 && !force) {
    console.log(
      `Skip products (${count} already in DB). Run: npm run seed -- --force to add samples anyway.`
    );
    await mongoose.disconnect();
    return;
  }

  if (force && count > 0) {
    await Product.deleteMany({ name: { $in: sampleProducts(admin._id).map((p) => p.name) } });
  }

  const docs = sampleProducts(admin._id);
  await Product.insertMany(docs);
  console.log(`Inserted ${docs.length} sample products.`);

  console.log("\n--- Login (admin dashboard) ---");
  console.log("Email:   ", SEED_ADMIN_EMAIL);
  console.log("Password:", SEED_ADMIN_PASSWORD);
  console.log("Change SEED_ADMIN_* in backend/.env and re-run with --force if needed.\n");

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
