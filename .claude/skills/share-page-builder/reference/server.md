# Server reference (apology-dashboard)

Base: `server/src/`. Reference files:
- `models/ApologyDashboardPage.ts`
- `controllers/apologyDashboardPage.controller.ts`
- `routes/apologyDashboardPage.routes.ts`
- `routes/index.ts` (mount)
- `controllers/share.controller.ts` (generic shared lookup + registry)
- `utils/shareUrl.ts` (share URL builder)
- `middleware/auth.ts` (`protect`, `optionalAuth`)

## 1. Model (`models/XxxPage.ts`)

```ts
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export interface IXxxPage extends Document {
  userId: mongoose.Types.ObjectId;
  shareId?: string;
  // ...all template content fields...
  password?: string;      // bcrypt hash
  passwordRaw?: string;   // plaintext, select:false
  isPublished: boolean;
  viewCount: number;
  comparePassword(candidate: string): Promise<boolean>;
}

const XxxPageSchema = new Schema<IXxxPage>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  shareId: { type: String, unique: true, sparse: true, index: true },
  // ...content fields with defaults...
  password: { type: String },
  passwordRaw: { type: String, select: false },
  isPublished: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
}, { timestamps: true });

XxxPageSchema.pre("save", async function (next) {
  if (!this.shareId) this.shareId = randomUUID();          // shareId minted on CREATE
  if (this.isModified("password") && this.password) {
    this.passwordRaw = this.password;                       // keep plaintext mirror
    this.password = await bcrypt.hash(this.password, 10);   // hash
  }
  next();
});

XxxPageSchema.methods.comparePassword = async function (candidate: string) {
  if (!this.password) return true;                          // no password → open
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IXxxPage>("XxxPage", XxxPageSchema);
```

Key facts: `shareId` is a **UUID v4** minted on create (not 8-char base64url). Publish does NOT mint it. Update must never overwrite `password` with an empty string.

## 2. Controller endpoints (`controllers/xxxPage.controller.ts`)

- `createXxxPage` (protect) — `new XxxPage({ userId: req.userId, ...body })`, save, return `{ success:true, data }` (includes `_id`, `shareId`).
- `getMyXxxPages` (protect) — list by `userId`.
- `getXxxPage` (protect, owner) — get by `_id` for the owner (editor reload).
- `updateXxxPage` (protect, owner) — patch fields; skip `password` if blank.
- `publishXxxPage` (protect, owner, may go through `checkPublishAccess`/points gate) — set `isPublished = true`, save, then:
  ```ts
  const { buildShareUrl } = await import("../utils/shareUrl");
  const shareUrl = await buildShareUrl(page.shareId!, String(req.userId));
  return res.json({ success: true, data: { shareUrl } });
  ```
- `getSharedXxxPage` (**public**) — `findOne({ shareId, isPublished: true })`; strip `password`/`passwordRaw`; return `{ success:true, data: safeData, hasPassword: !!page.password, templateType: "xxx" }`.
- `verifyXxxPagePassword` (**public**) —
  ```ts
  const page = await XxxPage.findOne({ shareId }).select("+passwordRaw password");
  if (!page) return res.status(404).json({ success:false, error:"Not found" });
  if (!page.password) return res.json({ success:true, verified:true });
  const ok = await page.comparePassword(req.body.password);
  return ok ? res.json({ success:true, verified:true })
            : res.status(401).json({ success:false, verified:false, error:"Wrong password" });
  ```
- `deleteXxxPage` (protect, owner).

## 3. Routes (`routes/xxxPage.routes.ts`)

```ts
const router = Router();
// PUBLIC first
router.get("/share/:shareId", getSharedXxxPage);
router.post("/share/:shareId/verify", verifyXxxPagePassword);
// then everything requires auth
router.use(protect);
router.post("/", createXxxPage);
router.get("/my", getMyXxxPages);          // /my BEFORE /:id
router.get("/:id", getXxxPage);
router.put("/:id", updateXxxPage);
router.post("/:id/publish", publishXxxPage);
router.delete("/:id", deleteXxxPage);
export default router;
```

## 4. Mount (`routes/index.ts`)

```ts
import xxxPageRoutes from "./xxxPage.routes";
router.use("/xxx-pages", xxxPageRoutes);   // → /api/xxx-pages (namespace is plural "-pages")
```

## 5. Share registry (`controllers/share.controller.ts`)

`TEMPLATE_LOOKUPS: TemplateLookup[]` where `TemplateLookup = { model, templateType, editorRoute }`. Add:
```ts
{ model: XxxPage as mongoose.Model<unknown>, templateType: "xxx", editorRoute: "/xxx" },
```
The generic `getSharedPage` loops every model, `findOneAndUpdate({ shareId, isPublished:true }, { $inc: { viewCount:1 } })`, strips password fields, returns `hasPassword` + `templateType` + `editorRoute`, and logs `PageView` analytics. This is what `GET /api/share/:shareId` (used by SSR metadata) hits.

## 6. Share URL (`utils/shareUrl.ts`)

```ts
export async function buildShareUrl(shareId: string, userId: string): Promise<string> {
  if (servesWildcardSubdomains()) {                  // true only on apex prod host
    const user = await User.findById(userId).select("subdomain");
    if (user?.subdomain) return `https://${user.subdomain}.${env.ROOT_DOMAIN}/${shareId}`;
  }
  return `${env.SHARE_BASE_URL}/${shareId}`;          // staging/local/no-subdomain fallback
}
```
`servesWildcardSubdomains()` is the staging-safety gate (SHARE_BASE_URL host must equal ROOT_DOMAIN) so `stag.subhsandesh.in` links don't 404 against the prod DB.
