import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { collectImageUrls, isWarmableImageUrl, WARM_LIMIT } from "./prefetch.ts";

describe("isWarmableImageUrl", () => {
  it("accepts a network image", () => {
    assert.equal(isWarmableImageUrl("https://example.com/a/photo.jpg"), true);
    assert.equal(isWarmableImageUrl("http://example.com/x.PNG?v=2"), true);
    assert.equal(isWarmableImageUrl("https://example.com/x.webp#frag"), true);
  });

  it("accepts our own CDN even with no extension in the key", () => {
    // S3 keys here often carry no extension, so the host is the signal.
    assert.equal(isWarmableImageUrl("https://cdn.subhsandesh.in/gifts-media/abc123"), true);
  });

  it("REJECTS a data URL", () => {
    // 38 templates store photos as base64 inside the document. Those bytes are
    // already in memory; warming them would decode the same image twice.
    assert.equal(isWarmableImageUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=="), false);
  });

  it("rejects blobs, non-images and junk", () => {
    assert.equal(isWarmableImageUrl("blob:https://x/abc"), false);
    assert.equal(isWarmableImageUrl("https://example.com/song.mp3"), false);
    assert.equal(isWarmableImageUrl("https://example.com/page"), false);
    assert.equal(isWarmableImageUrl("just some words"), false);
    assert.equal(isWarmableImageUrl("not a url .jpg"), false);
    for (const bad of [null, undefined, 42, {}, [], ""]) {
      assert.equal(isWarmableImageUrl(bad), false);
    }
  });

  it("does not treat a lookalike host as ours", () => {
    assert.equal(isWarmableImageUrl("https://cdn.subhsandesh.in.evil.test/x"), false);
    assert.equal(isWarmableImageUrl("https://notcdn.subhsandesh.in/x"), false);
    assert.equal(isWarmableImageUrl("https://images.cdn.subhsandesh.in/x"), true);
  });
});

describe("collectImageUrls", () => {
  it("finds urls nested in objects and arrays", () => {
    const payload = {
      recipientName: "Asha",
      cover: "https://cdn.subhsandesh.in/one",
      memories: [
        { caption: "hi", photo: "https://example.com/two.jpg" },
        { caption: "there", photo: "https://example.com/three.png" },
      ],
    };
    assert.deepEqual(collectImageUrls(payload), [
      "https://cdn.subhsandesh.in/one",
      "https://example.com/two.jpg",
      "https://example.com/three.png",
    ]);
  });

  it("keeps document order, because that is display order", () => {
    // The first photos in the payload are the ones the template paints first,
    // so taking the first N takes the ones about to be looked at.
    const urls = collectImageUrls({
      a: "https://example.com/1.jpg",
      b: "https://example.com/2.jpg",
    }, 1);
    assert.deepEqual(urls, ["https://example.com/1.jpg"]);
  });

  it("caps the count", () => {
    const many = Array.from({ length: 40 }, (_, i) => `https://example.com/${i}.jpg`);
    assert.equal(collectImageUrls({ many }).length, WARM_LIMIT);
    assert.equal(collectImageUrls({ many }, 3).length, 3);
  });

  it("de-duplicates", () => {
    const one = "https://example.com/same.jpg";
    assert.deepEqual(collectImageUrls({ a: one, b: one, c: [one] }), [one]);
  });

  it("survives a cycle", () => {
    const node = { photo: "https://example.com/a.jpg" };
    node.self = node;
    assert.deepEqual(collectImageUrls(node), ["https://example.com/a.jpg"]);
  });

  it("returns nothing for a payload with no network images", () => {
    assert.deepEqual(collectImageUrls({ msg: "hello", photo: "data:image/png;base64,AAA" }), []);
    assert.deepEqual(collectImageUrls(null), []);
    assert.deepEqual(collectImageUrls("https://example.com/x.jpg"), ["https://example.com/x.jpg"]);
  });
});
