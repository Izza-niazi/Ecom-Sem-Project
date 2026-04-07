const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

const ALLOWED_FOLDERS = new Set(["products", "brands", "avatars"]);

function ensureUploadDirs() {
  for (const folder of ALLOWED_FOLDERS) {
    const dir = path.join(UPLOAD_ROOT, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

function extFromMime(mime) {
  const m = String(mime || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (m === "image/png") return "png";
  if (m === "image/gif") return "gif";
  if (m === "image/webp") return "webp";
  if (m === "image/jpeg" || m === "image/jpg") return "jpg";
  return "jpg";
}

function parseDataUri(dataUri) {
  const s = String(dataUri);
  const match = s.match(/^data:([^,]+),([\s\S]*)$/);
  if (!match) {
    throw new Error("Invalid image data");
  }
  const header = match[1];
  const data = match[2];
  if (!header.endsWith(";base64")) {
    throw new Error("Unsupported image encoding");
  }
  const mime = header.slice(0, -7);
  const buffer = Buffer.from(data, "base64");
  if (!buffer.length && data.trim().length > 0) {
    throw new Error("Invalid base64");
  }
  return { mime, buffer };
}

/**
 * Saves a base64 data URI to disk. Returns the same shape as the old Cloudinary helper.
 * url is a root-relative path so the CRA proxy (dev) and same-origin deploys resolve correctly.
 */
async function uploadImage(dataUri, { folder }) {
  ensureUploadDirs();
  if (!ALLOWED_FOLDERS.has(folder)) {
    throw new Error("Invalid upload folder");
  }
  const { mime, buffer } = parseDataUri(dataUri);
  const ext = extFromMime(mime);
  const filename = `${uuidv4()}.${ext}`;
  const destPath = path.join(UPLOAD_ROOT, folder, filename);
  await fs.promises.writeFile(destPath, buffer);

  const public_id = `${folder}/${filename}`.replace(/\\/g, "/");
  return {
    public_id,
    secure_url: `/uploads/${public_id}`,
  };
}

function resolveStoredFile(publicId) {
  if (!publicId || typeof publicId !== "string") return null;
  const normalized = publicId.replace(/\\/g, "/").trim();
  if (!normalized || normalized.includes("..")) return null;
  const full = path.resolve(UPLOAD_ROOT, ...normalized.split("/"));
  const rootResolved = path.resolve(UPLOAD_ROOT) + path.sep;
  if (!full.startsWith(rootResolved)) return null;
  return full;
}

async function destroyImage(publicId) {
  const fullPath = resolveStoredFile(publicId);
  if (!fullPath) return;
  try {
    await fs.promises.unlink(fullPath);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
}

module.exports = { uploadImage, destroyImage };
