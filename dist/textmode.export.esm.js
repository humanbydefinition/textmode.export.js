class Ae {
  $extractFramebufferData(e) {
    return { characterPixels: e.readPixels(0), primaryColorPixels: e.readPixels(1), secondaryColorPixels: e.readPixels(2) };
  }
  $getCharacterIndex(e, t) {
    return e[t] + (e[t + 1] << 8);
  }
}
class Q {
  $downloadFile(e, t) {
    try {
      const r = this._sanitizeFilename(t), a = URL.createObjectURL(e), i = document.createElement("a");
      i.href = a, i.download = r, i.style.display = "none", i.rel = "noopener", document.body.appendChild(i), i.click(), document.body.removeChild(i), URL.revokeObjectURL(a);
    } catch (r) {
      console.error("[textmode-export] Failed to download file:", r);
    }
  }
  _sanitizeFilename(e) {
    if (!e) return this._generateDefaultFilename();
    const t = e.trim();
    return t ? t.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, "_").replace(/_{2,}/g, "_").replace(/^_+|_+$/g, "").substring(0, 255) || this._generateDefaultFilename() : this._generateDefaultFilename();
  }
  _generateDefaultFilename() {
    return `textmode-export-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/:/g, "-")}`;
  }
}
function fe(s, e) {
  return { r: s[e], g: s[e + 1], b: s[e + 2], a: s[e + 3] };
}
class We extends Ae {
  _extractTransformData(e, t) {
    const r = e[t + 2], a = !!(1 & r), i = !!(2 & r), n = !!(4 & r), c = e[t + 3] / 255;
    return { isInverted: a, flipHorizontal: i, flipVertical: n, rotation: Math.round(360 * c * 100) / 100 };
  }
  _calculateCellPosition(e, t, r) {
    return { x: e, y: t, cellX: e * r.cellWidth, cellY: t * r.cellHeight };
  }
  $extractSVGCellData(e, t) {
    const r = [];
    let a = 0;
    for (let i = 0; i < t.rows; i++) for (let n = 0; n < t.cols; n++) {
      const c = 4 * a, l = this.$getCharacterIndex(e.characterPixels, c);
      let p = fe(e.primaryColorPixels, c), o = fe(e.secondaryColorPixels, c);
      const d = this._extractTransformData(e.characterPixels, c);
      if (d.isInverted) {
        const m = p;
        p = o, o = m;
      }
      const u = this._calculateCellPosition(n, i, t);
      r.push({ charIndex: l, primaryColor: p, secondaryColor: o, transform: d, position: u }), a++;
    }
    return r;
  }
}
class qe {
  _createGlyphPath(e, t, r, a, i) {
    const n = i / e.head.unitsPerEm;
    return { getBoundingBox: () => ({ x1: r + t.xMin * n, y1: a + -t.yMax * n, x2: r + t.xMax * n, y2: a + -t.yMin * n }), toSVG: () => this._glyphToSVGPath(t, r, a, n) };
  }
  _glyphToSVGPath(e, t, r, a) {
    if (!e || !e.xs) return "";
    const { xs: i, ys: n, endPts: c, flags: l } = e;
    if (!(i && n && c && l)) return "";
    let p = "", o = 0;
    for (let d = 0; d < c.length; d++) {
      const u = c[d];
      if (!(u < o)) {
        if (u >= o) {
          const m = t + i[o] * a, x = r - n[o] * a;
          p += `M${m.toFixed(2)},${x.toFixed(2)}`;
          let h = o + 1;
          for (; h <= u; )
            if (1 & l[h]) {
              const g = t + i[h] * a, _ = r - n[h] * a;
              p += `L${g.toFixed(2)},${_.toFixed(2)}`, h++;
            } else {
              const g = t + i[h] * a, _ = r - n[h] * a;
              let v = h + 1 > u ? o : h + 1;
              if (1 & l[v]) {
                const f = t + i[v] * a, C = r - n[v] * a;
                p += `Q${g.toFixed(2)},${_.toFixed(2)} ${f.toFixed(2)},${C.toFixed(2)}`, h = v + 1;
              } else {
                const f = (g + (t + i[v] * a)) / 2, C = (_ + (r - n[v] * a)) / 2;
                p += `Q${g.toFixed(2)},${_.toFixed(2)} ${f.toFixed(2)},${C.toFixed(2)}`, h = v;
              }
            }
          p += "Z";
        }
        o = u + 1;
      }
    }
    return p;
  }
  _generateCharacterPath(e, t, r, a, i) {
    const n = t.characterMap.get(e), c = n?.glyphData;
    return c ? this._createGlyphPath(t.font, c, r, a, i) : null;
  }
  $generatePositionedCharacterPath(e, t, r, a, i, n, c, l) {
    if (!l) return null;
    const p = c / t.font.head.unitsPerEm, o = r + (i - l.advanceWidth * p) / 2, d = a + (n + 0.7 * c) / 2, u = this._generateCharacterPath(e, t, o, d, c);
    return u && u.toSVG() || null;
  }
}
class He {
  _pathGenerator;
  constructor() {
    this._pathGenerator = new qe();
  }
  $generateSVGHeader(e) {
    const { width: t, height: r } = e;
    return `<?xml version="1.0" encoding="UTF-8"?><svg width="${t}" height="${r}" viewBox="0 0 ${t} ${r}" xmlns="http://www.w3.org/2000/svg"><title>textmode.js sketch</title>`;
  }
  $generateSVGFooter() {
    return "</g></svg>";
  }
  _generateTransformAttribute(e, t) {
    const { transform: r, position: a } = e;
    if (!r.flipHorizontal && !r.flipVertical && !r.rotation) return "";
    const i = a.cellX + t.cellWidth / 2, n = a.cellY + t.cellHeight / 2, c = [];
    if (r.flipHorizontal || r.flipVertical) {
      const l = r.flipHorizontal ? -1 : 1, p = r.flipVertical ? -1 : 1;
      c.push(`translate(${i} ${n})scale(${l} ${p})translate(${-i} ${-n})`);
    }
    return r.rotation && c.push(`rotate(${r.rotation} ${i} ${n})`), ` transform="${c.join(" ")}"`;
  }
  _generateCellBackground(e, t, r) {
    if (!r.includeBackgroundRectangles || e.secondaryColor.a === 0) return "";
    const { position: a } = e, { r: i, g: n, b: c, a: l } = e.secondaryColor, p = `rgba(${i},${n},${c},${l / 255})`;
    return r.drawMode === "stroke" ? `<rect x="${a.cellX}" y="${a.cellY}" width="${t.cellWidth}" height="${t.cellHeight}" stroke="${p}" fill="none" stroke-width="${r.strokeWidth}"/>` : `<rect x="${a.cellX}" y="${a.cellY}" width="${t.cellWidth}" height="${t.cellHeight}" fill="${p}"/>`;
  }
  _generateCharacterPath(e, t, r, a) {
    const i = r.characters[e.charIndex];
    if (!i) return "";
    const n = this._pathGenerator.$generatePositionedCharacterPath(i.character, r, e.position.cellX, e.position.cellY, t.cellWidth, t.cellHeight, r.fontSize, i.glyphData);
    if (!n) return "";
    const { r: c, g: l, b: p, a: o } = e.primaryColor, d = `rgba(${c},${l},${p},${o / 255})`;
    return a.drawMode === "stroke" ? `<path d="${n}" stroke="${d}" stroke-width="${a.strokeWidth}" fill="none"/>` : `<path d="${n}" fill="${d}"/>`;
  }
  $generateCellContent(e, t, r, a) {
    const i = [], n = this._generateCellBackground(e, t, a);
    n && i.push(n);
    const c = this._generateCharacterPath(e, t, r, a);
    if (c) {
      const l = this._generateTransformAttribute(e, t);
      i.push(l ? `<g${l}>${c}</g>` : c);
    }
    return i.join("");
  }
  $generateSVGContent(e, t, r, a) {
    const i = [this.$generateSVGHeader(t), '<g id="ascii-cells">'];
    for (const n of e) i.push(this.$generateCellContent(n, t, r, a));
    return i.push(this.$generateSVGFooter()), i.join("");
  }
  $optimizeSVGContent(e) {
    return e.replace(/\s+/g, " ").replace(/> </g, "><");
  }
}
class ge {
  _applyDefaultOptions(e) {
    return { includeBackgroundRectangles: e.includeBackgroundRectangles ?? !0, drawMode: e.drawMode ?? "fill", strokeWidth: e.strokeWidth ?? 1, filename: e.filename };
  }
  $generateSVG(e, t = {}) {
    const r = new We(), a = new He(), i = r.$extractSVGCellData(r.$extractFramebufferData(e.layers.base.drawFramebuffer), e.grid), n = a.$generateSVGContent(i, e.grid, e.font, this._applyDefaultOptions(t));
    return a.$optimizeSVGContent(n);
  }
  $saveSVG(e, t = {}) {
    new Q().$downloadFile(new Blob([this.$generateSVG(e, t)], { type: "image/svg+xml;charset=utf-8" }), t.filename);
  }
}
const se = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" }, le = { png: ".png", jpg: ".jpg", webp: ".webp" };
class be {
  _applyDefaultOptions(e) {
    return { format: e.format ?? "png", scale: Math.abs(e.scale ?? 1), filename: e.filename };
  }
  _validateOptions(e) {
    if (!(e.format in se)) throw new Error(`Saving '${e.format}' files is not supported`);
  }
  async $generateImageBlob(e, t) {
    const r = e, a = document.createElement("canvas"), i = a.getContext("2d"), n = Math.round(r.width * t.scale), c = Math.round(r.height * t.scale);
    return a.width = n, a.height = c, i.imageSmoothingEnabled = !1, i.clearRect(0, 0, n, c), i.drawImage(r, 0, 0, r.width, r.height, 0, 0, n, c), await new Promise((l, p) => {
      a.toBlob((o) => {
        o ? l(o) : p(new Error(`Failed to generate ${t.format.toUpperCase()} blob`));
      }, se[t.format]);
    });
  }
  async $saveImage(e, t = {}) {
    const r = this._applyDefaultOptions(t);
    this._validateOptions(r);
    const a = await this.$generateImageBlob(e, r);
    new Q().$downloadFile(a, r.filename);
  }
  async $copyImageToClipboard(e, t = {}) {
    if (typeof navigator > "u" || !navigator.clipboard || typeof navigator.clipboard.write != "function") throw new Error("Clipboard API is not available in this environment");
    const r = this._applyDefaultOptions(t);
    this._validateOptions(r);
    const a = await this.$generateImageBlob(e, r), i = new ClipboardItem({ [se[r.format]]: a });
    await navigator.clipboard.write([i]);
  }
}
class ve {
  _applyDefaultOptions(e) {
    return { preserveTrailingSpaces: e.preserveTrailingSpaces ?? !1, emptyCharacter: e.emptyCharacter ?? " ", filename: e.filename };
  }
  _createTXTContent(e, t) {
    const r = new Ae(), a = e.layers.base.drawFramebuffer, i = r.$extractFramebufferData(a), n = [];
    let c = 0;
    for (let l = 0; l < e.grid.rows; l++) {
      let p = "";
      for (let o = 0; o < e.grid.cols; o++) {
        const d = 4 * c, u = r.$getCharacterIndex(i.characterPixels, d);
        p += e.font.characters[u]?.character || t.emptyCharacter, c++;
      }
      t.preserveTrailingSpaces || (p = p.trimEnd()), n.push(p);
    }
    return n.join(`
`);
  }
  $generateTXT(e, t = {}) {
    return this._createTXTContent(e, this._applyDefaultOptions(t));
  }
  $saveTXT(e, t = {}) {
    const r = this._applyDefaultOptions(t), a = this._createTXTContent(e, r), i = new Blob([a], { type: "text/plain;charset=utf-8" });
    new Q().$downloadFile(i, r.filename);
  }
}
class je {
  _canvas;
  _ctx;
  async $record(e, t, r, a) {
    const i = Math.max(1, Math.round(t.frameRate)), n = Math.round(1e3 / i), c = Math.max(1, Math.round(t.frameCount));
    return await new Promise((l, p) => {
      const o = [];
      let d, u = 0, m = !1;
      const x = () => {
        d && (d(), d = void 0);
      }, h = (_) => {
        m || (m = !0, x(), l(_));
      }, g = () => {
        if (u >= c) h(o);
        else try {
          const _ = t.scale, v = Math.max(1, Math.round(e.width * _)), f = Math.max(1, Math.round(e.height * _));
          this._canvas || (this._canvas = document.createElement("canvas")), this._canvas.width === v && this._canvas.height === f || (this._canvas.width = v, this._canvas.height = f), this._ctx || (this._ctx = this._canvas.getContext("2d"));
          const C = this._ctx;
          C.imageSmoothingEnabled = !1, C.clearRect(0, 0, v, f), C.drawImage(e, 0, 0, e.width, e.height, 0, 0, v, f);
          const F = { imageData: C.getImageData(0, 0, v, f), width: v, height: f, delayMs: n };
          o.push(F), u += 1, a?.({ state: "recording", frameIndex: u, totalFrames: c }), u >= c && h(o);
        } catch (_) {
          ((v) => {
            if (m) return;
            m = !0, x();
            const f = v instanceof Error ? v.message : "GIF recording failed";
            a?.({ state: "error", message: f }), p(v instanceof Error ? v : new Error(String(v)));
          })(_);
        }
      };
      d = r(() => {
        g();
      }), a?.({ state: "recording", frameIndex: 0, totalFrames: c });
    });
  }
}
var Pe = Object.defineProperty, Qe = (s) => Pe(s, "__esModule", { value: !0 }), Xe = (s, e) => () => (e || s((e = { exports: {} }).exports, e), e.exports), Ye = (s, e) => {
  for (var t in e) Pe(s, t, { get: e[t], enumerable: !0 });
}, Je = Xe((s) => {
  function e(d, u, m) {
    return 0.29889531 * d + 0.58662247 * u + 0.11448223 * m;
  }
  function t(d, u, m) {
    return 0.59597799 * d - 0.2741761 * u - 0.32180189 * m;
  }
  function r(d, u, m) {
    return 0.21147017 * d - 0.52261711 * u + 0.31114694 * m;
  }
  function a(d, u) {
    let m = d[0] - u[0], x = d[1] - u[1], h = d[2] - u[2], g = i(d) - i(u);
    return m * m * 0.5053 + x * x * 0.299 + h * h * 0.1957 + g * g;
  }
  function i(d) {
    return d[3] != null ? d[3] : 255;
  }
  function n(d, u) {
    return Math.sqrt(a(d, u));
  }
  function c(d, u) {
    let [m, x, h] = d, [g, _, v] = u, f = e(m, x, h) - e(g, _, v), C = t(m, x, h) - t(g, _, v), F = r(m, x, h) - r(g, _, v), E = i(d) - i(u);
    return f * f * 0.5053 + C * C * 0.299 + F * F * 0.1957 + E * E;
  }
  function l(d, u) {
    return Math.sqrt(c(d, u));
  }
  function p(d, u) {
    var m, x = 0;
    for (m = 0; m < d.length; m++) {
      let h = d[m] - u[m];
      x += h * h;
    }
    return x;
  }
  function o(d, u) {
    return Math.sqrt(p(d, u));
  }
  Qe(s), Ye(s, { colorDifferenceRGBToYIQ: () => l, colorDifferenceRGBToYIQSquared: () => c, colorDifferenceYIQ: () => n, colorDifferenceYIQSquared: () => a, euclideanDistance: () => o, euclideanDistanceSquared: () => p });
}), Ke = { trailer: 59 };
function De(s = 256) {
  let e = 0, t = new Uint8Array(s);
  return { get buffer() {
    return t.buffer;
  }, reset() {
    e = 0;
  }, bytesView: () => t.subarray(0, e), bytes: () => t.slice(0, e), writeByte(a) {
    r(e + 1), t[e] = a, e++;
  }, writeBytes(a, i = 0, n = a.length) {
    r(e + n);
    for (let c = 0; c < n; c++) t[e++] = a[c + i];
  }, writeBytesView(a, i = 0, n = a.byteLength) {
    r(e + n), t.set(a.subarray(i, i + n), e), e += n;
  } };
  function r(a) {
    var i = t.length;
    if (i >= a) return;
    a = Math.max(a, i * (i < 1048576 ? 2 : 1.125) >>> 0), i != 0 && (a = Math.max(a, 256));
    let n = t;
    t = new Uint8Array(a), e > 0 && t.set(n.subarray(0, e), 0);
  }
}
var Z = 12, xe = 5003, Ze = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535];
function et(s, e, t, r, a, i, n, c) {
  a = a || De(512), i = i || new Uint8Array(256), n = n || new Int32Array(xe), c = c || new Int32Array(xe);
  let l = n.length, p = Math.max(2, r);
  i.fill(0), c.fill(0), L();
  let o = 0, d = 0, u = p + 1, m = u, x = !1, h = m, g = D(h), _ = 1 << u - 1, v = _ + 1, f = _ + 2, C = 0, F = t[0], E = 0;
  for (let k = l; k < 65536; k *= 2) ++E;
  E = 8 - E, a.writeByte(p), O(_);
  for (let k = 1; k < t.length; k++) V(t[k]);
  return O(F), O(v), a.writeByte(0), a.bytesView();
  function A(k) {
    i[C++] = k, C >= 254 && B();
  }
  function L() {
    n.fill(-1);
  }
  function V(k) {
    let R = (k << Z) + F, y = k << E ^ F;
    if (n[y] === R) F = c[y];
    else {
      if (n[y] >= 0) {
        let w = y === 0 ? 1 : l - y;
        do
          if (y -= w, y < 0 && (y += l), n[y] === R) return void (F = c[y]);
        while (n[y] >= 0);
      }
      O(F), F = k, f < 1 << Z ? (c[y] = f++, n[y] = R) : (L(), f = _ + 2, x = !0, O(_));
    }
  }
  function B() {
    C > 0 && (a.writeByte(C), a.writeBytesView(i, 0, C), C = 0);
  }
  function D(k) {
    return (1 << k) - 1;
  }
  function O(k) {
    for (o &= Ze[d], d > 0 ? o |= k << d : o = k, d += h; d >= 8; ) A(255 & o), o >>= 8, d -= 8;
    if ((f > g || x) && (x ? (h = m, g = D(h), x = !1) : (++h, g = h == Z ? 1 << Z : D(h))), k == v) {
      for (; d > 0; ) A(255 & o), o >>= 8, d -= 8;
      B();
    }
  }
}
var tt = et;
function Ve(s, e, t) {
  return s << 8 & 63488 | e << 2 & 992 | t >> 3 & 31;
}
function Te(s, e, t, r) {
  return s >> 4 | 240 & e | (240 & t) << 4 | (240 & r) << 8;
}
function Oe(s, e, t) {
  return s >> 4 << 8 | e >> 4 << 4 | t >> 4;
}
function ee(s, e, t) {
  return s < e ? e : s > t ? t : s;
}
function ae(s) {
  return s * s;
}
function ye(s, e, t) {
  for (var r = 0, a = 1e100, i = s[e], n = i.cnt, c = (i.ac, i.rc), l = i.gc, p = i.bc, o = i.fw; o != 0; o = s[o].fw) {
    var d = s[o].cnt, u = n * d / (n + d);
    if (!(u >= a)) {
      var m = 0;
      !((m += u * ae(s[o].rc - c)) >= a) && !((m += u * ae(s[o].gc - l)) >= a) && !((m += u * ae(s[o].bc - p)) >= a) && (a = m, r = o);
    }
  }
  i.err = a, i.nn = r;
}
function de() {
  return { ac: 0, rc: 0, gc: 0, bc: 0, cnt: 0, nn: 0, fw: 0, bk: 0, tm: 0, mtm: 0, err: 0 };
}
function rt(s, e) {
  let t = new Array(e === "rgb444" ? 4096 : 65536), r = s.length;
  if (e === "rgba4444") for (let a = 0; a < r; ++a) {
    let i = s[a], n = i >> 24 & 255, c = i >> 16 & 255, l = i >> 8 & 255, p = 255 & i, o = Te(p, l, c, n), d = o in t ? t[o] : t[o] = de();
    d.rc += p, d.gc += l, d.bc += c, d.ac += n, d.cnt++;
  }
  else if (e === "rgb444") for (let a = 0; a < r; ++a) {
    let i = s[a], n = i >> 16 & 255, c = i >> 8 & 255, l = 255 & i, p = Oe(l, c, n), o = p in t ? t[p] : t[p] = de();
    o.rc += l, o.gc += c, o.bc += n, o.cnt++;
  }
  else for (let a = 0; a < r; ++a) {
    let i = s[a], n = i >> 16 & 255, c = i >> 8 & 255, l = 255 & i, p = Ve(l, c, n), o = p in t ? t[p] : t[p] = de();
    o.rc += l, o.gc += c, o.bc += n, o.cnt++;
  }
  return t;
}
function at(s, e, t) {
  let { format: r = "rgb565", clearAlpha: a = !0, clearAlphaColor: i = 0, clearAlphaThreshold: n = 0, oneBitAlpha: c = !1 } = t || {}, l = t.useSqrt !== !1, p = r === "rgba4444", o = rt(s, r), d = o.length, u = d - 1, m = new Uint32Array(d + 1);
  for (var x = 0, h = 0; h < o.length; ++h) {
    let k = o[h];
    if (k != null) {
      var g = 1 / k.cnt;
      p && (k.ac *= g), k.rc *= g, k.gc *= g, k.bc *= g, o[x++] = k;
    }
  }
  for (ae(e) / x < 0.022 && (l = !1), h = 0; h < x - 1; ++h) o[h].fw = h + 1, o[h + 1].bk = h, l && (o[h].cnt = Math.sqrt(o[h].cnt));
  var _, v, f;
  for (l && (o[h].cnt = Math.sqrt(o[h].cnt)), h = 0; h < x; ++h) {
    ye(o, h);
    var C = o[h].err;
    for (v = ++m[0]; v > 1 && !(o[_ = m[f = v >> 1]].err <= C); v = f) m[v] = _;
    m[v] = h;
  }
  var F = x - e;
  for (h = 0; h < F; ) {
    for (var E; ; ) {
      var A = m[1];
      if ((E = o[A]).tm >= E.mtm && o[E.nn].mtm <= E.tm) break;
      for (E.mtm == u ? A = m[1] = m[m[0]--] : (ye(o, A), E.tm = h), C = o[A].err, v = 1; (f = v + v) <= m[0] && (f < m[0] && o[m[f]].err > o[m[f + 1]].err && f++, !(C <= o[_ = m[f]].err)); v = f) m[v] = _;
      m[v] = A;
    }
    var L = o[E.nn], V = E.cnt, B = L.cnt;
    g = 1 / (V + B), p && (E.ac = g * (V * E.ac + B * L.ac)), E.rc = g * (V * E.rc + B * L.rc), E.gc = g * (V * E.gc + B * L.gc), E.bc = g * (V * E.bc + B * L.bc), E.cnt += L.cnt, E.mtm = ++h, o[L.bk].fw = L.fw, o[L.fw].bk = L.bk, L.mtm = u;
  }
  let D = [];
  var O = 0;
  for (h = 0; ; ++O) {
    let k = ee(Math.round(o[h].rc), 0, 255), R = ee(Math.round(o[h].gc), 0, 255), y = ee(Math.round(o[h].bc), 0, 255), w = 255;
    p && (w = ee(Math.round(o[h].ac), 0, 255), c && (w = w <= (typeof c == "number" ? c : 127) ? 0 : 255), a && w <= n && (k = R = y = i, w = 0));
    let S = p ? [k, R, y, w] : [k, R, y];
    if (it(D, S) || D.push(S), (h = o[h].fw) == 0) break;
  }
  return D;
}
function it(s, e) {
  for (let t = 0; t < s.length; t++) {
    let r = s[t], a = r[0] === e[0] && r[1] === e[1] && r[2] === e[2], i = !(r.length >= 4 && e.length >= 4) || r[3] === e[3];
    if (a && i) return !0;
  }
  return !1;
}
function ot(s, e, t) {
  let r = (t = t || "rgb565") === "rgb444" ? 4096 : 65536, a = new Uint8Array(s.length), i = new Array(r);
  if (t === "rgba4444") for (let n = 0; n < s.length; n++) {
    let c, l = s[n], p = l >> 24 & 255, o = l >> 16 & 255, d = l >> 8 & 255, u = 255 & l, m = Te(u, d, o, p);
    i[m] != null ? c = i[m] : (c = nt(u, d, o, p, e), i[m] = c), a[n] = c;
  }
  else for (let n = 0; n < s.length; n++) {
    let c, l = s[n], p = l >> 16 & 255, o = l >> 8 & 255, d = 255 & l, u = t === "rgb444" ? Oe(d, o, p) : Ve(d, o, p);
    i[u] != null ? c = i[u] : (c = st(d, o, p, e), i[u] = c), a[n] = c;
  }
  return a;
}
function nt(s, e, t, r, a) {
  let i = 0, n = 1e100;
  for (let c = 0; c < a.length; c++) {
    let l = a[c], p = l[0], o = l[1], d = l[2], u = W(l[3] - r);
    u > n || (u += W(p - s), !(u > n) && (u += W(o - e), !(u > n) && (u += W(d - t), !(u > n) && (n = u, i = c))));
  }
  return i;
}
function st(s, e, t, r) {
  let a = 0, i = 1e100;
  for (let n = 0; n < r.length; n++) {
    let c = r[n], l = c[0], p = c[1], o = c[2], d = W(l - s);
    d > i || (d += W(p - e), !(d > i) && (d += W(o - t), !(d > i) && (i = d, a = n)));
  }
  return a;
}
function W(s) {
  return s * s;
}
function lt(s = {}) {
  let { initialCapacity: e = 4096, auto: t = !0 } = s, r = De(e), a = new Uint8Array(256), i = new Int32Array(5003), n = new Int32Array(5003), c = !1;
  return { reset() {
    r.reset(), c = !1;
  }, finish() {
    r.writeByte(Ke.trailer);
  }, bytes: () => r.bytes(), bytesView: () => r.bytesView(), get buffer() {
    return r.buffer;
  }, get stream() {
    return r;
  }, writeHeader: l, writeFrame(p, o, d, u = {}) {
    let { transparent: m = !1, transparentIndex: x = 0, delay: h = 0, palette: g = null, repeat: _ = 0, colorDepth: v = 8, dispose: f = -1 } = u, C = !1;
    if (t ? c || (C = !0, l(), c = !0) : C = !!u.first, o = Math.max(0, Math.floor(o)), d = Math.max(0, Math.floor(d)), C) {
      if (!g) throw new Error("First frame must include a { palette } option");
      ct(r, o, d, g, v), _e(r, g), _ >= 0 && ut(r, _);
    }
    let F = Math.round(h / 10);
    dt(r, f, F, m, x);
    let E = !!g && !C;
    pt(r, o, d, E ? g : null), E && _e(r, g), ht(r, p, o, d, v, a, i, n);
  } };
  function l() {
    Re(r, "GIF89a");
  }
}
function dt(s, e, t, r, a) {
  var i, n;
  s.writeByte(33), s.writeByte(249), s.writeByte(4), a < 0 && (a = 0, r = !1), r ? (i = 1, n = 2) : (i = 0, n = 0), e >= 0 && (n = 7 & e), n <<= 2, s.writeByte(0 | n | i), N(s, t), s.writeByte(a || 0), s.writeByte(0);
}
function ct(s, e, t, r, a = 8) {
  let i = 128 | a - 1 << 4 | he(r.length) - 1;
  N(s, e), N(s, t), s.writeBytes([i, 0, 0]);
}
function ut(s, e) {
  s.writeByte(33), s.writeByte(255), s.writeByte(11), Re(s, "NETSCAPE2.0"), s.writeByte(3), s.writeByte(1), N(s, e), s.writeByte(0);
}
function _e(s, e) {
  let t = 1 << he(e.length);
  for (let r = 0; r < t; r++) {
    let a = [0, 0, 0];
    r < e.length && (a = e[r]), s.writeByte(a[0]), s.writeByte(a[1]), s.writeByte(a[2]);
  }
}
function pt(s, e, t, r) {
  if (s.writeByte(44), N(s, 0), N(s, 0), N(s, e), N(s, t), r) {
    let a = 0, i = 0, n = he(r.length) - 1;
    s.writeByte(128 | a | i | n);
  } else s.writeByte(0);
}
function ht(s, e, t, r, a = 8, i, n, c) {
  tt(t, r, e, a, s, i, n, c);
}
function N(s, e) {
  s.writeByte(255 & e), s.writeByte(e >> 8 & 255);
}
function Re(s, e) {
  for (var t = 0; t < e.length; t++) s.writeByte(e.charCodeAt(t));
}
function he(s) {
  return Math.max(Math.ceil(Math.log2(s)), 1);
}
Je();
class mt {
  _recorder;
  _textmodifier;
  _registerPostDrawHook;
  constructor(e, t) {
    this._recorder = new je(), this._textmodifier = e, this._registerPostDrawHook = t;
  }
  async $saveGIF(e = {}) {
    const t = this._textmodifier.canvas, r = this._applyDefaultOptions(e), a = e.onProgress;
    try {
      const i = await this._recorder.$record(t, r, this._registerPostDrawHook, a), n = lt(), { repeat: c } = e;
      for (let o = 0; o < i.length; o++) {
        const d = i[o], { width: u, height: m, imageData: x, delayMs: h } = d, g = new Uint32Array(x.data.buffer.slice(0)), _ = at(g, 256, {}), v = ot(g, _);
        n.writeFrame(v, u, m, { palette: _, delay: h, repeat: o === 0 ? c : -1 }), o % 2 != 0 && o !== i.length - 1 || (a?.({ state: "encoding", frameIndex: o + 1, totalFrames: i.length }), await new Promise((f) => setTimeout(f, 0)));
      }
      n.finish();
      const l = n.bytes(), p = l.buffer.slice(l.byteOffset, l.byteOffset + l.byteLength);
      new Q().$downloadFile(new Blob([p], { type: "image/gif" }), r.filename), a?.({ state: "completed", totalFrames: r.frameCount });
    } catch (i) {
      throw a?.({ state: "error", message: i instanceof Error ? i.message : "GIF export failed" }), i;
    }
  }
  _applyDefaultOptions(e) {
    const t = Math.abs(Math.round(e.frameCount ?? 300)), r = Math.abs(e.frameRate ?? 60), a = Math.abs(e.scale ?? 1), i = Math.max(-1, Math.round(e.repeat ?? 0));
    return { filename: e.filename, frameCount: t, frameRate: r, scale: a, repeat: i };
  }
}
function ft(s) {
  return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default") ? s.default : s;
}
var we, Ce = { exports: {} };
function gt() {
  return we || (we = 1, s = Ce, (function() {
    function e(l, p) {
      return (function(o) {
        if (typeof o != "string" || !o.match(/^data:image\/webp;base64,/i)) throw new Error("Failed to decode WebP Base64 URL");
        return window.atob(o.substring(23));
      })(typeof l == "string" && /^data:image\/webp/.test(l) ? l : l.toDataURL("image/webp", p));
    }
    function t(l) {
      return (l.charCodeAt(0) | l.charCodeAt(1) << 8 | l.charCodeAt(2) << 16 | l.charCodeAt(3) << 24) >>> 0;
    }
    function r(l) {
      let p = l.indexOf("VP8", 12);
      if (p === -1) throw new Error("Bad image format, does this browser support WebP?");
      let o = !1;
      for (; p < l.length - 8; ) {
        let d, u;
        switch (u = l.substring(p, p + 4), p += 4, d = t(l.substring(p, p + 4)), p += 4, u) {
          case "VP8 ":
            return { frame: l.substring(p, p + d), hasAlpha: o };
          case "ALPH":
            o = !0;
        }
        p += d, 1 & d && p++;
      }
      throw new Error("Failed to find VP8 keyframe in WebP image, is this image mistakenly encoded in the Lossless WebP format?");
    }
    function a(l) {
      this.value = l;
    }
    function i(l) {
      this.value = l;
    }
    function n(l, p, o) {
      if (Array.isArray(o)) for (let d = 0; d < o.length; d++) n(l, p, o[d]);
      else if (typeof o == "string") l.writeString(o);
      else if (o instanceof Uint8Array) l.writeBytes(o);
      else {
        if (!o.id) throw new Error("Bad EBML datatype " + typeof o.data);
        if (o.offset = l.pos + p, l.writeUnsignedIntBE(o.id), Array.isArray(o.data)) {
          let d, u, m;
          o.size === -1 ? l.writeByte(255) : o.size === -2 ? (d = l.pos, l.writeBytes([15, 255, 255, 255, 255])) : (d = l.pos, l.writeBytes([0, 0, 0, 0])), u = l.pos, o.dataOffset = u + p, n(l, p, o.data), o.size !== -1 && o.size !== -2 && (m = l.pos, o.size = m - u, l.seek(d), l.writeEBMLVarIntWidth(o.size, 4), l.seek(m));
        } else if (typeof o.data == "string") l.writeEBMLVarInt(o.data.length), o.dataOffset = l.pos + p, l.writeString(o.data);
        else if (typeof o.data == "number") o.size || (o.size = l.measureUnsignedInt(o.data)), l.writeEBMLVarInt(o.size), o.dataOffset = l.pos + p, l.writeUnsignedIntBE(o.data, o.size);
        else if (o.data instanceof i) l.writeEBMLVarInt(8), o.dataOffset = l.pos + p, l.writeDoubleBE(o.data.value);
        else if (o.data instanceof a) l.writeEBMLVarInt(4), o.dataOffset = l.pos + p, l.writeFloatBE(o.data.value);
        else {
          if (!(o.data instanceof Uint8Array)) throw new Error("Bad EBML datatype " + typeof o.data);
          l.writeEBMLVarInt(o.data.byteLength), o.dataOffset = l.pos + p, l.writeBytes(o.data);
        }
      }
    }
    let c = function(l, p) {
      return function(o) {
        let d, u, m = !1, x = 0, h = 0, g = null, _ = null, v = null, f = [], C = 0, F = 0, E = { quality: 0.95, transparent: !1, alphaQuality: void 0, fileWriter: null, fd: null, frameDuration: null, frameRate: null }, A = { Cues: { id: new Uint8Array([28, 83, 187, 107]), positionEBML: null }, SegmentInfo: { id: new Uint8Array([21, 73, 169, 102]), positionEBML: null }, Tracks: { id: new Uint8Array([22, 84, 174, 107]), positionEBML: null } }, L = { id: 17545, data: new i(0) }, V = [], B = new p(o.fileWriter || o.fd);
        function D(y) {
          return y - d.dataOffset;
        }
        function O() {
          u = (function() {
            let M = { id: 21420, size: 5, data: 0 }, U = { id: 290298740, data: [] };
            for (let I in A) {
              let q = A[I];
              q.positionEBML = Object.create(M), U.data.push({ id: 19899, data: [{ id: 21419, data: q.id }, q.positionEBML] });
            }
            return U;
          })();
          let y = { id: 357149030, data: [{ id: 2807729, data: 1e6 }, { id: 19840, data: "webm-writer-js" }, { id: 22337, data: "webm-writer-js" }, L] }, w = [{ id: 176, data: x }, { id: 186, data: h }];
          o.transparent && w.push({ id: 21440, data: 1 });
          let S = { id: 374648427, data: [{ id: 174, data: [{ id: 215, data: 1 }, { id: 29637, data: 1 }, { id: 156, data: 0 }, { id: 2274716, data: "und" }, { id: 134, data: "V_VP8" }, { id: 2459272, data: "VP8" }, { id: 131, data: 1 }, { id: 224, data: w }] }] };
          d = { id: 408125543, size: -2, data: [u, y, S] };
          let $ = new l(256);
          n($, B.pos, [{ id: 440786851, data: [{ id: 17030, data: 1 }, { id: 17143, data: 1 }, { id: 17138, data: 4 }, { id: 17139, data: 8 }, { id: 17026, data: "webm" }, { id: 17031, data: 2 }, { id: 17029, data: 2 }] }, d]), B.write($.getAsDataArray()), A.SegmentInfo.positionEBML.data = D(y.offset), A.Tracks.positionEBML.data = D(S.offset), m = !0;
        }
        function k(y) {
          return y.alpha ? (function(w) {
            let S, $, M = new l(4);
            if (!(w.trackNumber > 0 && w.trackNumber < 127)) throw new Error("TrackNumber must be > 0 and < 127");
            return M.writeEBMLVarInt(w.trackNumber), M.writeU16BE(w.timecode), M.writeByte(0), S = { id: 161, data: [M.getAsDataArray(), w.frame] }, $ = { id: 30113, data: [{ id: 166, data: [{ id: 238, data: 1 }, { id: 165, data: w.alpha }] }] }, { id: 160, data: [S, $] };
          })(y) : (function(w) {
            let S = new l(4);
            if (!(w.trackNumber > 0 && w.trackNumber < 127)) throw new Error("TrackNumber must be > 0 and < 127");
            return S.writeEBMLVarInt(w.trackNumber), S.writeU16BE(w.timecode), S.writeByte(128), { id: 163, data: [S.getAsDataArray(), w.frame] };
          })(y);
        }
        function R() {
          if (f.length === 0) return;
          let y = 0;
          for (let I = 0; I < f.length; I++) y += f[I].frame.length + (f[I].alpha ? f[I].alpha.length : 0);
          let w = new l(y + 64 * f.length), S = (function(I) {
            return { id: 524531317, data: [{ id: 231, data: Math.round(I.timecode) }] };
          })({ timecode: Math.round(C) });
          for (let I = 0; I < f.length; I++) S.data.push(k(f[I]));
          var $, M, U;
          n(w, B.pos, S), B.write(w.getAsDataArray()), $ = 1, M = Math.round(C), U = S.offset, V.push({ id: 187, data: [{ id: 179, data: M }, { id: 183, data: [{ id: 247, data: $ }, { id: 241, data: D(U) }] }] }), f = [], C += F, F = 0;
        }
        this.addFrame = function(y, w, S) {
          m || (x = y.width || 0, h = y.height || 0, O());
          let $, M = r(e(y, o.quality)), U = null;
          $ = S || (typeof w == "number" ? w : o.frameDuration), o.transparent && (w instanceof HTMLCanvasElement || typeof w == "string" ? U = w : M.hasAlpha && (U = (function(I) {
            g !== null && g.width === I.width && g.height === I.height || (g = document.createElement("canvas"), g.width = I.width, g.height = I.height, _ = g.getContext("2d"), v = _.createImageData(g.width, g.height));
            let q = I.getContext("2d").getImageData(0, 0, I.width, I.height).data, J = v.data, K = 0, ze = I.width * I.height * 4;
            for (let oe = 3; oe < ze; oe += 4) {
              let ne = q[oe];
              J[K++] = ne, J[K++] = ne, J[K++] = ne, J[K++] = 255;
            }
            return _.putImageData(v, 0, 0), g;
          })(y))), (function(I) {
            I.trackNumber = 1, I.timecode = Math.round(F), f.push(I), F += I.duration, F >= 5e3 && R();
          })({ frame: M.frame, duration: $, alpha: U ? r(e(U, o.alphaQuality)).frame : null });
        }, this.complete = function() {
          return m || O(), R(), (function() {
            let y = { id: 475249515, data: V }, w = new l(16 + 32 * V.length);
            n(w, B.pos, y), B.write(w.getAsDataArray()), A.Cues.positionEBML.data = D(y.offset);
          })(), (function() {
            let y = new l(u.size), w = B.pos;
            n(y, u.dataOffset, u.data), B.seek(u.dataOffset), B.write(y.getAsDataArray()), B.seek(w);
          })(), (function() {
            let y = new l(8), w = B.pos;
            y.writeDoubleBE(C), B.seek(L.dataOffset), B.write(y.getAsDataArray()), B.seek(w);
          })(), (function() {
            let y = new l(10), w = B.pos;
            y.writeUnsignedIntBE(d.id), y.writeEBMLVarIntWidth(B.pos - d.dataOffset, 5), B.seek(d.offset), B.write(y.getAsDataArray()), B.seek(w);
          })(), B.complete("video/webm");
        }, this.getWrittenSize = function() {
          return B.length;
        }, o = (function(y, w) {
          let S = {};
          return [y, w].forEach(function($) {
            for (let M in $) Object.prototype.hasOwnProperty.call($, M) && (S[M] = $[M]);
          }), S;
        })(E, o || {}), (function() {
          if (!o.frameDuration) {
            if (!o.frameRate) throw new Error("Missing required frameDuration or frameRate setting");
            o.frameDuration = 1e3 / o.frameRate;
          }
          o.quality = Math.max(Math.min(o.quality, 0.99999), 0), o.alphaQuality === void 0 ? o.alphaQuality = o.quality : o.alphaQuality = Math.max(Math.min(o.alphaQuality, 0.99999), 0);
        })();
      };
    };
    s.exports = c;
  })()), Ce.exports;
  var s;
}
var Ee, ke = { exports: {} };
function bt() {
  return Ee || (Ee = 1, s = ke, (function() {
    let e = function(t) {
      this.data = new Uint8Array(t), this.pos = 0;
    };
    e.prototype.seek = function(t) {
      this.pos = t;
    }, e.prototype.writeBytes = function(t) {
      for (let r = 0; r < t.length; r++) this.data[this.pos++] = t[r];
    }, e.prototype.writeByte = function(t) {
      this.data[this.pos++] = t;
    }, e.prototype.writeU8 = e.prototype.writeByte, e.prototype.writeU16BE = function(t) {
      this.data[this.pos++] = t >> 8, this.data[this.pos++] = t;
    }, e.prototype.writeDoubleBE = function(t) {
      let r = new Uint8Array(new Float64Array([t]).buffer);
      for (let a = r.length - 1; a >= 0; a--) this.writeByte(r[a]);
    }, e.prototype.writeFloatBE = function(t) {
      let r = new Uint8Array(new Float32Array([t]).buffer);
      for (let a = r.length - 1; a >= 0; a--) this.writeByte(r[a]);
    }, e.prototype.writeString = function(t) {
      for (let r = 0; r < t.length; r++) this.data[this.pos++] = t.charCodeAt(r);
    }, e.prototype.writeEBMLVarIntWidth = function(t, r) {
      switch (r) {
        case 1:
          this.writeU8(128 | t);
          break;
        case 2:
          this.writeU8(64 | t >> 8), this.writeU8(t);
          break;
        case 3:
          this.writeU8(32 | t >> 16), this.writeU8(t >> 8), this.writeU8(t);
          break;
        case 4:
          this.writeU8(16 | t >> 24), this.writeU8(t >> 16), this.writeU8(t >> 8), this.writeU8(t);
          break;
        case 5:
          this.writeU8(8 | t / 4294967296 & 7), this.writeU8(t >> 24), this.writeU8(t >> 16), this.writeU8(t >> 8), this.writeU8(t);
          break;
        default:
          throw new Error("Bad EBML VINT size " + r);
      }
    }, e.prototype.measureEBMLVarInt = function(t) {
      if (t < 127) return 1;
      if (t < 16383) return 2;
      if (t < 2097151) return 3;
      if (t < 268435455) return 4;
      if (t < 34359738367) return 5;
      throw new Error("EBML VINT size not supported " + t);
    }, e.prototype.writeEBMLVarInt = function(t) {
      this.writeEBMLVarIntWidth(t, this.measureEBMLVarInt(t));
    }, e.prototype.writeUnsignedIntBE = function(t, r) {
      switch (r === void 0 && (r = this.measureUnsignedInt(t)), r) {
        case 5:
          this.writeU8(Math.floor(t / 4294967296));
        case 4:
          this.writeU8(t >> 24);
        case 3:
          this.writeU8(t >> 16);
        case 2:
          this.writeU8(t >> 8);
        case 1:
          this.writeU8(t);
          break;
        default:
          throw new Error("Bad UINT size " + r);
      }
    }, e.prototype.measureUnsignedInt = function(t) {
      return t < 256 ? 1 : t < 65536 ? 2 : t < 1 << 24 ? 3 : t < 4294967296 ? 4 : 5;
    }, e.prototype.getAsDataArray = function() {
      if (this.pos < this.data.byteLength) return this.data.subarray(0, this.pos);
      if (this.pos == this.data.byteLength) return this.data;
      throw new Error("ArrayBufferDataStream's pos lies beyond end of buffer");
    }, s.exports = e;
  })()), ke.exports;
  var s;
}
var Be, Ie, Fe, Se = { exports: {} };
function vt() {
  return Be || (Be = 1, s = Se, (function() {
    let e = function(t) {
      return function(r) {
        let a = [], i = Promise.resolve(), n = null, c = null;
        function l(d) {
          return new Promise(function(u, m) {
            let x = new FileReader();
            x.addEventListener("loadend", function() {
              u(x.result);
            }), x.readAsArrayBuffer(d);
          });
        }
        function p(d) {
          return new Promise(function(u, m) {
            d instanceof Uint8Array ? u(d) : d instanceof ArrayBuffer || ArrayBuffer.isView(d) ? u(new Uint8Array(d)) : d instanceof Blob ? u(l(d).then(function(x) {
              return new Uint8Array(x);
            })) : u(l(new Blob([d])).then(function(x) {
              return new Uint8Array(x);
            }));
          });
        }
        function o(d) {
          let u = d.byteLength || d.length || d.size;
          if (!Number.isInteger(u)) throw new Error("Failed to determine size of element");
          return u;
        }
        r && r.constructor.name === "FileWriter" ? n = r : t && r && (c = r), this.pos = 0, this.length = 0, this.seek = function(d) {
          if (d < 0) throw new Error("Offset may not be negative");
          if (isNaN(d)) throw new Error("Offset may not be NaN");
          if (d > this.length) throw new Error("Seeking beyond the end of file is not allowed");
          this.pos = d;
        }, this.write = function(d) {
          let u = { offset: this.pos, data: d, length: o(d) }, m = u.offset >= this.length;
          this.pos += u.length, this.length = Math.max(this.length, this.pos), i = i.then(function() {
            if (c) return new Promise(function(x, h) {
              p(u.data).then(function(g) {
                let _ = 0, v = Buffer.from(g.buffer), f = function(C, F, E) {
                  _ += F, _ >= E.length ? x() : t.write(c, E, _, E.length - _, u.offset + _, f);
                };
                t.write(c, v, 0, v.length, u.offset, f);
              });
            });
            if (n) return new Promise(function(x, h) {
              n.onwriteend = x, n.seek(u.offset), n.write(new Blob([u.data]));
            });
            if (!m) for (let x = 0; x < a.length; x++) {
              let h = a[x];
              if (!(u.offset + u.length <= h.offset || u.offset >= h.offset + h.length)) {
                if (u.offset < h.offset || u.offset + u.length > h.offset + h.length) throw new Error("Overwrite crosses blob boundaries");
                return u.offset == h.offset && u.length == h.length ? void (h.data = u.data) : p(h.data).then(function(g) {
                  return h.data = g, p(u.data);
                }).then(function(g) {
                  u.data = g, h.data.set(u.data, u.offset - h.offset);
                });
              }
            }
            a.push(u);
          });
        }, this.complete = function(d) {
          return i = c || n ? i.then(function() {
            return null;
          }) : i.then(function() {
            let u = [];
            for (let m = 0; m < a.length; m++) u.push(a[m].data);
            return new Blob(u, { type: d });
          }), i;
        };
      };
    };
    s.exports = e;
  })()), Se.exports;
  var s;
}
function xt() {
  return Fe ? Ie : (Fe = 1, Ie = gt()(bt(), vt()(null)));
}
var yt = xt();
const _t = ft(yt);
class wt {
  async $record(e, t, r, a) {
    const i = Math.max(1, Math.round(t.frameRate)), n = Math.max(1, Math.round(t.frameCount)), c = new _t({ quality: t.quality, alphaQuality: t.transparent ? t.quality : void 0, transparent: t.transparent, frameRate: i }), l = this._createSnapshotSurface();
    return await new Promise((p, o) => {
      let d, u = "capturing", m = !1, x = 0;
      const h = () => {
        d && (d(), d = void 0);
      }, g = () => {
        a?.({ state: "recording", frameIndex: x, totalFrames: n });
      }, _ = (f) => {
        if (m) return;
        m = !0, h();
        const C = f instanceof Error ? f.message : "WEBM export failed";
        a?.({ state: "error", message: C }), o(f instanceof Error ? f : new Error(String(f)));
      }, v = () => {
        u !== "capturing" || m || (u = "encoding", h(), c.complete().then((f) => {
          ((C) => {
            m || (m = !0, a?.({ state: "completed", frameIndex: Math.min(n, x), totalFrames: n }), p(C));
          })(f);
        }).catch(_));
      };
      d = r(() => {
        (() => {
          if (u === "capturing") if (x >= n) v();
          else try {
            const f = l(e);
            c.addFrame(f), x += 1, g(), x >= n && v();
          } catch (f) {
            _(f);
          }
        })();
      }), g();
    });
  }
  _createSnapshotSurface() {
    let e = null, t = null;
    return (r) => {
      const a = Math.max(1, r.width), i = Math.max(1, r.height), n = ((c, l) => (e || (e = document.createElement("canvas")), e.width !== c || e.height !== l ? (e.width = c, e.height = l, t = e.getContext("2d"), t && (t.imageSmoothingEnabled = !1)) : t || (t = e.getContext("2d"), t && (t.imageSmoothingEnabled = !1)), t ? e : null))(a, i);
      return n && t ? (t.clearRect(0, 0, a, i), t.drawImage(r, 0, 0, a, i), n) : r;
    };
  }
}
class Ct {
  _recorder;
  _textmodifier;
  _registerPostDrawHook;
  constructor(e, t) {
    this._recorder = new wt(), this._textmodifier = e, this._registerPostDrawHook = t;
  }
  async $saveWEBM(e = {}) {
    const t = this._textmodifier.canvas, r = this._applyDefaultOptions(e);
    try {
      const a = await this._recorder.$record(t, r, this._registerPostDrawHook, e.onProgress);
      new Q().$downloadFile(a, r.filename);
    } catch (a) {
      throw e.onProgress?.({ state: "error", message: a instanceof Error ? a.message : "WEBM export failed" }), a;
    }
  }
  _applyDefaultOptions(e) {
    return { filename: e.filename, frameRate: Math.abs(Math.round(e.frameRate ?? 60)), frameCount: Math.abs(Math.round(e.frameCount ?? 300)), quality: Math.abs(Math.min(Math.max(e.quality ?? 1, 0), 1)), transparent: !!e.transparent, debugLogging: !!e.debugLogging };
  }
}
const b = { root: "textmode-export-overlay", stack: "textmode-export-overlay__stack", stackDense: "textmode-export-overlay__stack--dense", stackCompact: "textmode-export-overlay__stack--compact", section: "textmode-export-overlay__section", header: "textmode-export-overlay__header", headerTitleRow: "textmode-export-overlay__header-title-row", headerLinks: "textmode-export-overlay__header-links", row: "textmode-export-overlay__row", label: "textmode-export-overlay__label", field: "textmode-export-overlay__field", fieldCompact: "textmode-export-overlay__field--compact", fieldDense: "textmode-export-overlay__field--dense", fieldFull: "textmode-export-overlay__field--full", fieldChannel: "textmode-export-overlay__field--channel", input: "textmode-export-overlay__input", checkbox: "textmode-export-overlay__checkbox", muted: "textmode-export-overlay__muted", status: "textmode-export-overlay__status", statusGif: "textmode-export-overlay__status--gif", statusVideo: "textmode-export-overlay__status--video", statusTitle: "textmode-export-overlay__status-title", statusValue: "textmode-export-overlay__status-value", divider: "textmode-export-overlay__divider", title: "textmode-export-overlay__title", button: "textmode-export-overlay__button", buttonPrimary: "textmode-export-overlay__button--primary", buttonSecondary: "textmode-export-overlay__button--secondary", buttonFull: "textmode-export-overlay__button--full", supportLink: "textmode-export-overlay__support-link", supportIcon: "textmode-export-overlay__support-icon", linkIcon: "textmode-export-overlay__link-icon" };
class T {
  element;
  mounted = !1;
  destroyed = !1;
  mount(e) {
    if (this.destroyed) throw new Error("Cannot mount a destroyed component");
    if (this.mounted) return;
    const t = this.render();
    e.appendChild(t), this.element = t, this.onMount(), this.mounted = !0;
  }
  unmount() {
    this.mounted && this.element && (this._onUnmount(), this.element.remove(), this.element = void 0, this.mounted = !1);
  }
  destroy() {
    this.destroyed || (this.unmount(), this._onDestroy(), this.destroyed = !0);
  }
  update(e) {
    this.mounted && this.onUpdate(e);
  }
  onMount() {
  }
  _onUnmount() {
  }
  _onDestroy() {
  }
  onUpdate(e) {
  }
  get root() {
    if (!this.element) throw new Error("Component is not mounted yet");
    return this.element;
  }
  isMounted() {
    return this.mounted;
  }
}
class H extends T {
  static _iconNamespace = "http://www.w3.org/2000/svg";
  render() {
    const e = document.createElement("div");
    e.classList.add(b.stack, b.stackDense, b.header);
    const t = document.createElement("div");
    t.classList.add(b.headerTitleRow);
    const r = document.createElement("strong");
    r.textContent = "textmode.export.js", r.classList.add(b.title);
    const a = document.createElement("div");
    a.classList.add(b.headerLinks);
    const i = this._createLink("https://github.com/humanbydefinition/textmode.export.js", "View repository on GitHub", b.linkIcon, [{ d: "M0 0h24v24H0z", fill: "none", stroke: "none" }, { d: "M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" }]), n = this._createLink("https://code.textmode.art/support.html", "Support textmode.export.js", b.supportIcon, [{ d: "M0 0h24v24H0z", fill: "none", stroke: "none" }, { d: "M3 14c.83 .642 2.077 1.017 3.5 1c1.423 .017 2.67 -.358 3.5 -1c.83 -.642 2.077 -1.017 3.5 -1c1.423 -.017 2.67 .358 3.5 1" }, { d: "M8 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2" }, { d: "M12 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2" }, { d: "M3 10h14v5a6 6 0 0 1 -6 6h-2a6 6 0 0 1 -6 -6v-5z" }, { d: "M16.746 16.726a3 3 0 1 0 .252 -5.555" }]);
    a.appendChild(i), a.appendChild(n), t.appendChild(r), t.appendChild(a);
    const c = document.createElement("div");
    return c.classList.add(b.divider), e.appendChild(t), e.appendChild(c), e;
  }
  _createLink(e, t, r, a) {
    const i = document.createElement("a");
    return i.href = e, i.target = "_blank", i.rel = "noopener noreferrer", i.classList.add(b.supportLink), i.setAttribute("aria-label", t), i.appendChild(this._createIcon(r, a)), i;
  }
  _createIcon(e, t) {
    const r = document.createElementNS(H._iconNamespace, "svg");
    r.setAttribute("xmlns", H._iconNamespace), r.setAttribute("width", "18"), r.setAttribute("height", "18"), r.setAttribute("viewBox", "0 0 24 24"), r.setAttribute("fill", "none"), r.setAttribute("stroke", "currentColor"), r.setAttribute("stroke-width", "2"), r.setAttribute("stroke-linecap", "round"), r.setAttribute("stroke-linejoin", "round"), r.classList.add(e);
    for (const a of t) {
      const i = document.createElementNS(H._iconNamespace, "path");
      for (const [n, c] of Object.entries(a)) i.setAttribute(n, c);
      r.appendChild(i);
    }
    return r;
  }
}
class P extends T {
  props;
  constructor(e) {
    super(), this.props = e;
  }
  render() {
    const e = document.createElement("div");
    e.classList.add(b.field), this.applyVariant(e, this.props.variant);
    const t = document.createElement("label");
    if (t.classList.add(b.label), t.textContent = this.props.label, this.props.labelFor && (t.htmlFor = this.props.labelFor), e.appendChild(t), this.props.description) {
      const r = document.createElement("span");
      r.classList.add(b.muted), r.textContent = this.props.description, e.appendChild(r);
    }
    return e;
  }
  attachControl(e) {
    this.root.appendChild(e);
  }
  update(e) {
    this.props = e, super.update(e);
  }
  onUpdate(e) {
    const t = this.root;
    for (; t.firstChild; ) t.removeChild(t.firstChild);
    this.props = e, t.classList.add(b.field), this.applyVariant(t, e.variant);
    const r = document.createElement("label");
    if (r.classList.add(b.label), r.textContent = e.label, e.labelFor && (r.htmlFor = e.labelFor), t.appendChild(r), e.description) {
      const a = document.createElement("span");
      a.classList.add(b.muted), a.textContent = e.description, t.appendChild(a);
    }
  }
  applyVariant(e, t) {
    switch (e.classList.remove(b.fieldCompact, b.fieldDense, b.fieldFull, b.fieldChannel), t) {
      case "compact":
        e.classList.add(b.fieldCompact);
        break;
      case "dense":
        e.classList.add(b.fieldDense);
        break;
      case "full":
        e.classList.add(b.fieldFull);
        break;
      case "channel":
        e.classList.add(b.fieldChannel);
    }
  }
}
class me extends T {
  props;
  select;
  handleChange = () => {
    this.props.defaultValue = this.select.value;
  };
  constructor(e) {
    super(), this.props = e;
  }
  render() {
    return this.select = document.createElement("select"), this.select.classList.add(b.input), this.props.id && (this.select.id = this.props.id), this.populateOptions(), this.select.addEventListener("change", this.handleChange), this.select;
  }
  get selectElement() {
    return this.select;
  }
  get value() {
    return this.select.value;
  }
  set value(e) {
    this.select && (this.select.value = e), this.props.defaultValue = e;
  }
  _onUnmount() {
    this.select.removeEventListener("change", this.handleChange);
  }
  onUpdate(e) {
    this.props = e, this.populateOptions(), e.defaultValue && (this.select.value = e.defaultValue);
  }
  update(e) {
    this.props = { ...this.props, ...e }, this.select && (e.id && (this.select.id = e.id), e.options && this.populateOptions(), e.defaultValue !== void 0 && (this.select.value = e.defaultValue));
  }
  populateOptions() {
    if (this.select) {
      this.select.innerHTML = "";
      for (const e of this.props.options) {
        const t = document.createElement("option");
        t.value = e.value, t.textContent = e.label, this.select.appendChild(t);
      }
      this.props.defaultValue && (this.select.value = this.props.defaultValue);
    }
  }
}
class Le extends T {
  props;
  button;
  constructor(e) {
    super(), this.props = e;
  }
  render() {
    return this.button = document.createElement("button"), this.button.type = "button", this.button.textContent = this.props.label, this.button.classList.add(b.button), this.props.variant === "secondary" ? this.button.classList.add(b.buttonSecondary) : this.button.classList.add(b.buttonPrimary), this.props.fullWidth && this.button.classList.add(b.buttonFull), this.button.disabled = !!this.props.disabled, this.button;
  }
  get buttonElement() {
    return this.button;
  }
  setLabel(e) {
    this.props.label = e, this.button.textContent = e;
  }
  setDisabled(e) {
    this.props.disabled = e, this.button.disabled = e;
  }
  onUpdate(e) {
    this.props = e, this.button.textContent = e.label, this.button.disabled = !!e.disabled, e.variant === "secondary" ? (this.button.classList.add(b.buttonSecondary), this.button.classList.remove(b.buttonPrimary)) : (this.button.classList.add(b.buttonPrimary), this.button.classList.remove(b.buttonSecondary)), this.button.classList.toggle(b.buttonFull, !!e.fullWidth);
  }
}
class Et {
  api;
  constructor(e) {
    this.api = e;
  }
  async $copy(e, t) {
    switch (e) {
      case "txt": {
        const r = this.api.toString(t);
        await navigator.clipboard.writeText(r);
        break;
      }
      case "svg": {
        const r = this.api.toSVG(t);
        await navigator.clipboard.writeText(r);
        break;
      }
      case "image":
        await this.api.copyCanvas(t);
        break;
      default:
        throw new Error(`Clipboard not supported for ${e}`);
    }
  }
}
class kt {
  api;
  events;
  constructor(e, t) {
    this.api = e, this.events = t;
  }
  async $requestExport(e, t, r = {}) {
    this.events.$emit("export:request", { format: e });
    try {
      const a = { onGIFProgress: r.onGIFProgress ? (i) => {
        r.onGIFProgress?.(i), this.events.$emit("export:progress", { format: e, progress: i });
      } : e === "gif" ? (i) => this.events.$emit("export:progress", { format: e, progress: i }) : void 0, onVideoProgress: r.onVideoProgress ? (i) => {
        r.onVideoProgress?.(i), this.events.$emit("export:progress", { format: e, progress: i });
      } : e === "video" ? (i) => this.events.$emit("export:progress", { format: e, progress: i }) : void 0 };
      await this._execute(e, t, a), this.events.$emit("export:success", { format: e });
    } catch (a) {
      throw this.events.$emit("export:error", { format: e, error: a }), a;
    }
  }
  _execute(e, t, r) {
    switch (e) {
      case "txt":
        return Promise.resolve(this.api.saveStrings(t));
      case "image":
        return this.api.saveCanvas(t);
      case "svg":
        return Promise.resolve(this.api.saveSVG(t));
      case "gif": {
        const a = { ...t, onProgress: r.onGIFProgress };
        return this.api.saveGIF(a);
      }
      case "video": {
        const a = { ...t, onProgress: r.onVideoProgress };
        return this.api.saveWEBM(a);
      }
    }
  }
}
class Bt {
  modifier;
  overlay;
  animationFrameId = null;
  handleUpdate;
  bound = !1;
  constructor(e, t) {
    this.modifier = e, this.overlay = t, this.handleUpdate = () => this.scheduleUpdate();
  }
  scheduleUpdate() {
    this.animationFrameId !== null && cancelAnimationFrame(this.animationFrameId), this.animationFrameId = requestAnimationFrame(() => this.update());
  }
  bind() {
    this.bound || (window.addEventListener("resize", this.handleUpdate), window.addEventListener("scroll", this.handleUpdate, !0), this.bound = !0, this.handleUpdate());
  }
  update() {
    this.animationFrameId = null;
    const e = this.modifier.canvas.getBoundingClientRect();
    this.overlay.style.top = `${e.top + window.scrollY + 8}px`, this.overlay.style.left = `${e.left + window.scrollX + 8}px`;
  }
  dispose() {
    this.animationFrameId !== null && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.bound && (window.removeEventListener("resize", this.handleUpdate), window.removeEventListener("scroll", this.handleUpdate, !0), this.bound = !1);
  }
}
const X = "textmode-export-number-input", It = `${X}__field`, Ft = `${X}__controls`, St = `${X}__control`, Ue = `${X}__display`, te = `${Ue}--visible`, Lt = (s) => {
  s.dispatchEvent(new Event("input", { bubbles: !0 })), s.dispatchEvent(new Event("change", { bubbles: !0 }));
}, Me = (s) => {
  const e = document.createElement("button");
  return e.type = "button", e.className = St, e.textContent = s > 0 ? "▲" : "▼", e;
};
class G extends T {
  props;
  input;
  display;
  incrementButton;
  decrementButton;
  suppressClickAfterPointer = /* @__PURE__ */ new WeakMap();
  holdTimeoutId;
  holdIntervalId;
  activePointerId;
  disabledObserver;
  constructor(e) {
    super(), this.props = e;
  }
  render() {
    const e = document.createElement("div");
    e.className = X, this.input = document.createElement("input"), this.input.type = "number", this.input.value = this.props.defaultValue, Object.assign(this.input, this.props.attributes), this.input.className = It, this.display = document.createElement("div"), this.display.className = Ue;
    const t = document.createElement("div");
    return t.className = Ft, this.incrementButton = Me(1), this.decrementButton = Me(-1), t.appendChild(this.incrementButton), t.appendChild(this.decrementButton), e.appendChild(this.input), e.appendChild(this.display), e.appendChild(t), this.bindStepControls(), this.bindHoldBehavior(), this.bindInputListeners(), this.observeDisabledState(e), this.updateDisplay(), e;
  }
  get inputElement() {
    return this.input;
  }
  get value() {
    return this.input.value;
  }
  set value(e) {
    this.input.value = e, this.updateDisplay();
  }
  refresh() {
    this.updateDisplay();
  }
  _onDestroy() {
    this.clearHoldTimers(), this.disabledObserver?.disconnect();
  }
  bindStepControls() {
    const e = (i) => () => {
      if (this.input.disabled) return;
      const n = this.input.value, c = this.input.getAttribute("step");
      if (c && c !== "any") i > 0 ? this.input.stepUp() : this.input.stepDown();
      else {
        const l = i > 0 ? 1 : -1, p = Number.parseFloat(this.input.value || "0"), o = Number.isFinite(p) ? p + l : l;
        this.input.value = String(o);
      }
      this.input.value !== n && Lt(this.input), this.updateDisplay(), this.input.focus({ preventScroll: !0 });
    }, t = e(1), r = e(-1), a = (i, n) => (c) => {
      if (this.suppressClickAfterPointer.get(i)) return this.suppressClickAfterPointer.set(i, !1), void c.preventDefault();
      n();
    };
    this.incrementButton.addEventListener("click", a(this.incrementButton, t)), this.decrementButton.addEventListener("click", a(this.decrementButton, r));
  }
  bindHoldBehavior() {
    const e = (t, r) => {
      const a = r > 0 ? () => this.incrementButton.click() : () => this.decrementButton.click();
      t.addEventListener("pointerdown", (c) => {
        if (c.button === 0) {
          c.preventDefault(), this.suppressClickAfterPointer.set(t, !0), this.activePointerId = c.pointerId;
          try {
            t.setPointerCapture(c.pointerId);
          } catch {
          }
          a(), this.holdTimeoutId = window.setTimeout(() => {
            this.holdIntervalId = window.setInterval(a, 80);
          }, 380);
        }
      });
      const i = () => {
        if (this.activePointerId !== void 0) {
          try {
            t.releasePointerCapture(this.activePointerId);
          } catch {
          }
          this.activePointerId = void 0;
        }
      }, n = () => {
        this.clearHoldTimers(), i();
      };
      t.addEventListener("pointerup", n), t.addEventListener("pointerleave", n), t.addEventListener("pointercancel", n);
    };
    e(this.incrementButton, 1), e(this.decrementButton, -1);
  }
  bindInputListeners() {
    const e = () => {
      this.props.defaultValue = this.input.value, this.updateDisplay();
    };
    this.input.addEventListener("input", e), this.input.addEventListener("change", e);
  }
  observeDisabledState(e) {
    const t = () => {
      const r = this.input.disabled;
      this.incrementButton.disabled = r, this.decrementButton.disabled = r, e.classList.toggle("is-disabled", r), r ? (this.display.classList.remove(te), this.input.style.removeProperty("color"), this.input.style.removeProperty("caretColor")) : this.updateDisplay();
    };
    typeof MutationObserver < "u" && (this.disabledObserver = new MutationObserver(t), this.disabledObserver.observe(this.input, { attributes: !0, attributeFilter: ["disabled"] })), t();
  }
  updateDisplay() {
    const e = this.props.formatDisplay;
    if (!e) return this.display.textContent = "", this.display.classList.remove(te), this.input.style.removeProperty("color"), void this.input.style.removeProperty("caretColor");
    const t = this.input.value, r = Number.parseFloat(t), a = e(Number.isFinite(r) ? r : Number.NaN, t, this.input);
    a ? (this.display.textContent = a, this.display.classList.add(te), this.input.style.color = "transparent", this.input.style.caretColor = "#f8fafc") : (this.display.textContent = "", this.display.classList.remove(te), this.input.style.removeProperty("color"), this.input.style.removeProperty("caretColor"));
  }
  clearHoldTimers() {
    this.holdTimeoutId !== void 0 && (window.clearTimeout(this.holdTimeoutId), this.holdTimeoutId = void 0), this.holdIntervalId !== void 0 && (window.clearInterval(this.holdIntervalId), this.holdIntervalId = void 0);
  }
}
class j extends T {
  variant;
  additionalClasses;
  constructor(e = "stack", t = []) {
    super(), this.variant = e, this.additionalClasses = t;
  }
  render() {
    const e = document.createElement("div"), t = [this.variant === "stack" ? b.stack : void 0, this.variant === "stackDense" ? b.stackDense : void 0, this.variant === "stackCompact" ? b.stackCompact : void 0, this.variant === "row" ? b.row : void 0, this.variant === "section" ? b.section : void 0, ...this.additionalClasses].filter(Boolean);
    return e.classList.add(...t), e;
  }
}
const $e = { neutral: "textmode-export-overlay__status-value--neutral", active: "textmode-export-overlay__status-value--active", alert: "textmode-export-overlay__status-value--alert" };
class Ne extends T {
  props;
  container;
  messageElement;
  constructor(e) {
    super(), this.props = e;
  }
  render() {
    this.container = document.createElement("div"), this.container.classList.add(b.status), this.props.context === "gif" ? this.container.classList.add(b.statusGif) : this.props.context === "video" && this.container.classList.add(b.statusVideo);
    const e = document.createElement("span");
    return e.classList.add(b.statusTitle), e.textContent = this.props.title, this.messageElement = document.createElement("span"), this.messageElement.classList.add(b.statusValue), this.messageElement.textContent = this.props.message, this.applyVariant(this.props.variant ?? "neutral"), this.container.appendChild(e), this.container.appendChild(this.messageElement), this.container;
  }
  setMessage(e, t = "neutral") {
    this.messageElement.textContent = e, this.applyVariant(t);
  }
  onUpdate(e) {
    this.props = e, this.setMessage(e.message, e.variant ?? "neutral");
  }
  applyVariant(e) {
    this.messageElement.classList.remove(...Object.values($e)), this.messageElement.classList.add($e[e]);
  }
}
class Y extends T {
  _config;
  _managedComponents = /* @__PURE__ */ new Set();
  constructor(e) {
    super(), this._config = e;
  }
  _manageComponent(e) {
    return this._managedComponents.add(e), e;
  }
  _onUnmount() {
    for (const e of this._managedComponents) e.unmount();
  }
  _onDestroy() {
    for (const e of this._managedComponents) e.destroy();
    this._managedComponents.clear();
  }
}
const z = { frameCount: 300, frameRate: 60, scale: 1, repeat: 0 };
class ue extends Y {
  frameCountInput = this._manageComponent(new G({ defaultValue: String(z.frameCount), attributes: { min: "1", max: "600", step: "1" } }));
  frameRateInput = this._manageComponent(new G({ defaultValue: String(z.frameRate), attributes: { min: "1", max: "60", step: "1" } }));
  scaleInput = this._manageComponent(new G({ defaultValue: String(z.scale), attributes: { min: "0.1", max: "8", step: "0.1" } }));
  repeatInput = this._manageComponent(new G({ defaultValue: "0", attributes: { min: "0", max: "50", step: "1" }, formatDisplay: (e, t) => Number.isFinite(e) ? e === 0 ? "∞" : null : t.trim() === "" ? null : t }));
  status = this._manageComponent(new Ne({ title: "status", message: "ready to record", variant: "neutral", context: "gif" }));
  recordingState = "idle";
  constructor(e) {
    super(e);
  }
  render() {
    const e = document.createElement("div");
    e.classList.add(b.stack);
    const t = new j("row");
    t.mount(e);
    const r = new P({ label: "number of frames", labelFor: "textmode-export-gif-frame-count", variant: "dense" });
    r.mount(t.root), this.frameCountInput.mount(r.root), this.frameCountInput.inputElement.id = "textmode-export-gif-frame-count";
    const a = new P({ label: "frame rate (fps)", labelFor: "textmode-export-gif-frame-rate", variant: "dense" });
    a.mount(t.root), this.frameRateInput.mount(a.root), this.frameRateInput.inputElement.id = "textmode-export-gif-frame-rate";
    const i = new j("row");
    i.mount(e);
    const n = new P({ label: "scale", labelFor: "textmode-export-gif-scale", variant: "dense" });
    n.mount(i.root), this.scaleInput.mount(n.root), this.scaleInput.inputElement.id = "textmode-export-gif-scale";
    const c = new P({ label: "loop count", labelFor: "textmode-export-gif-repeat", variant: "dense" });
    return c.mount(i.root), this.repeatInput.mount(c.root), this.repeatInput.inputElement.id = "textmode-export-gif-repeat", this.status.mount(e), e;
  }
  getOptions() {
    const e = this._config.defaultOptions ?? {};
    return { frameCount: this.safeParseInt(this.frameCountInput.value, e.frameCount ?? 300), frameRate: this.safeParseInt(this.frameRateInput.value, e.frameRate ?? 60), scale: this.safeParseFloat(this.scaleInput.value, e.scale ?? 1), repeat: this.safeParseInt(this.repeatInput.value, e.repeat ?? 0) };
  }
  reset() {
    this.recordingState = "idle", this.applyDefaults(), this.setRecordingState("idle");
  }
  validate() {
    const e = Number.parseInt(this.frameCountInput.value, 10), t = Number.parseInt(this.frameRateInput.value, 10), r = Number.parseFloat(this.scaleInput.value);
    return Number.isFinite(e) && e > 0 && Number.isFinite(t) && t > 0 && Number.isFinite(r) && r > 0;
  }
  isRecording() {
    return this.recordingState === "recording" || this.recordingState === "encoding";
  }
  setRecordingState(e, t) {
    this.recordingState = e;
    const r = e === "recording" || e === "encoding";
    switch (this.frameCountInput.inputElement.disabled = r, this.frameRateInput.inputElement.disabled = r, this.scaleInput.inputElement.disabled = r, this.repeatInput.inputElement.disabled = r, e) {
      case "recording":
        if (t?.totalFrames) {
          const a = t.frameIndex ?? 0;
          this.status.setMessage(`recording ${a}/${t.totalFrames}`, "active");
        } else this.status.setMessage("recording…", "active");
        break;
      case "encoding":
        if (t?.totalFrames) {
          const a = t.frameIndex ?? 0;
          this.status.setMessage(`encoding ${a}/${t.totalFrames}`, "active");
        } else this.status.setMessage("encoding…", "active");
        break;
      case "completed":
        this.status.setMessage("GIF saved successfully", "active");
        break;
      case "error":
        this.status.setMessage(t?.message ?? "failed to export GIF", "alert");
        break;
      default:
        this.status.setMessage("ready to record", "neutral");
    }
  }
  handleProgress(e) {
    if (e.state !== "recording" && e.state !== "encoding" || !e.totalFrames) e.state === "completed" ? this.status.setMessage("GIF saved successfully", "active") : e.state === "error" && this.status.setMessage(e.message ?? "failed to export GIF", "alert");
    else {
      const t = e.state === "recording" ? "recording" : "encoding";
      this.status.setMessage(`${t} ${e.frameIndex ?? 0}/${e.totalFrames}`, "active");
    }
  }
  applyDefaults() {
    const e = this._config.defaultOptions ?? {}, t = e.frameCount ?? z.frameCount, r = e.frameRate ?? z.frameRate, a = e.scale ?? z.scale, i = e.repeat ?? z.repeat;
    this.frameCountInput.value = String(t), this.frameRateInput.value = String(r), this.scaleInput.value = String(a), this.repeatInput.value = String(i), this.frameCountInput.refresh(), this.frameRateInput.refresh(), this.scaleInput.refresh(), this.repeatInput.refresh();
  }
  safeParseInt(e, t) {
    const r = Number.parseInt(e, 10);
    return Number.isFinite(r) ? r : t;
  }
  safeParseFloat(e, t) {
    const r = Number.parseFloat(e);
    return Number.isFinite(r) ? r : t;
  }
}
const ie = "textmode-export-range-input", Mt = `${ie}__field`, $t = `${ie}__tooltip`, ce = `${ie}__tooltip--visible`, re = (s, e) => {
  if (typeof s != "string" || s.length === 0) return e;
  const t = Number.parseFloat(s);
  return Number.isFinite(t) ? t : e;
}, At = (s, e, t) => Math.min(t, Math.max(e, s));
class Pt extends T {
  props;
  input;
  tooltip;
  hoverActive = !1;
  focusActive = !1;
  pointerActive = !1;
  suppressFocusFromPointer = !1;
  activePointerId;
  disabledObserver;
  resizeObserver;
  constructor(e) {
    super(), this.props = e;
  }
  render() {
    const e = document.createElement("div");
    return e.className = ie, this.input = document.createElement("input"), this.input.type = "range", this.input.value = this.props.defaultValue, Object.assign(this.input, this.props.attributes), this.input.className = Mt, this.tooltip = document.createElement("div"), this.tooltip.className = $t, e.appendChild(this.input), e.appendChild(this.tooltip), this.bindEvents(e), this.updateTooltip(), this.syncDisabledState(e), e;
  }
  get inputElement() {
    return this.input;
  }
  get value() {
    return this.input.value;
  }
  set value(e) {
    this.input.value = e, this.updateTooltip();
  }
  _onDestroy() {
    this.disabledObserver?.disconnect(), this.resizeObserver?.disconnect();
  }
  bindEvents(e) {
    this.input.addEventListener("pointerenter", () => {
      this.hoverActive = !0, this.refreshTooltipVisibility();
    }), this.input.addEventListener("pointerleave", () => {
      this.hoverActive = !1, this.refreshTooltipVisibility();
    }), this.input.addEventListener("focus", () => {
      let r = !1;
      try {
        r = this.input.matches(":focus-visible");
      } catch {
        r = !this.suppressFocusFromPointer;
      }
      this.suppressFocusFromPointer || !r || this.input.disabled ? this.focusActive = !1 : this.focusActive = !0, this.suppressFocusFromPointer = !1, this.refreshTooltipVisibility();
    }), this.input.addEventListener("blur", () => {
      this.focusActive = !1, this.refreshTooltipVisibility();
    }), this.input.addEventListener("pointerdown", (r) => {
      this.pointerActive = !0, this.suppressFocusFromPointer = !0, this.hoverActive = !0, this.refreshTooltipVisibility();
      try {
        this.input.setPointerCapture(r.pointerId), this.activePointerId = r.pointerId;
      } catch {
        this.activePointerId = void 0;
      }
    });
    const t = () => {
      this.pointerActive = !1, this.suppressFocusFromPointer = !1, this.hoverActive = this.input.matches(":hover"), this.releasePointerCapture(), this.refreshTooltipVisibility();
    };
    this.input.addEventListener("pointerup", t), this.input.addEventListener("pointercancel", t), this.input.addEventListener("lostpointercapture", t), this.input.addEventListener("input", () => {
      (this.hoverActive || this.focusActive || this.pointerActive) && this.updateTooltip(), this.props.defaultValue = this.input.value;
    }), this.input.addEventListener("change", () => {
      this.pointerActive || this.updateTooltip(), this.props.defaultValue = this.input.value;
    }), typeof ResizeObserver < "u" && (this.resizeObserver = new ResizeObserver(() => {
      this.tooltip.classList.contains(ce) && this.updateTooltipPosition();
    }), this.resizeObserver.observe(e));
  }
  refreshTooltipVisibility() {
    const e = (this.hoverActive || this.focusActive || this.pointerActive) && !this.input.disabled;
    e && this.updateTooltip(), this.tooltip.classList.toggle(ce, e);
  }
  syncDisabledState(e) {
    const t = () => {
      const r = this.input.disabled;
      e.classList.toggle("is-disabled", r), r && (this.hoverActive = !1, this.focusActive = !1, this.pointerActive = !1, this.suppressFocusFromPointer = !1, this.releasePointerCapture(), this.tooltip.classList.remove(ce));
    };
    typeof MutationObserver < "u" && (this.disabledObserver = new MutationObserver(t), this.disabledObserver.observe(this.input, { attributes: !0, attributeFilter: ["disabled"] })), t();
  }
  releasePointerCapture() {
    if (this.activePointerId !== void 0) {
      try {
        this.input.releasePointerCapture(this.activePointerId);
      } catch {
      }
      this.activePointerId = void 0;
    }
  }
  updateTooltip() {
    this.updateTooltipContent(), this.updateTooltipPosition();
  }
  updateTooltipContent() {
    const e = this.props.formatValue ?? ((r) => `${r}`), t = this.getCurrentValue();
    this.tooltip.textContent = e(t, this.input);
  }
  updateTooltipPosition() {
    const e = this.getMin(), t = this.getMax(), r = At(this.getCurrentValue(), e, t), a = t - e, i = a === 0 ? 0 : (r - e) / a;
    this.tooltip.style.left = 100 * i + "%";
  }
  getMin() {
    return re(this.input.min, 0);
  }
  getMax() {
    return re(this.input.max, 100);
  }
  getCurrentValue() {
    return re(this.input.value, re(this.props.defaultValue, 0));
  }
}
function Dt(s) {
  if (!Number.isFinite(s)) return "default quality";
  const e = Math.max(0, Math.min(1, s));
  return e >= 0.995 ? "near-lossless" : e >= 0.98 ? "maximum detail" : e >= 0.88 ? "ultra quality" : e >= 0.7 ? "high quality" : e >= 0.5 ? "balanced" : e >= 0.25 ? "compact" : e >= 0.1 ? "lightweight" : "draft";
}
function Vt(s) {
  return `${Dt(s)} (quality ≈ ${s.toFixed(3)})`;
}
class pe extends Y {
  frameRateInput = this._manageComponent(new G({ defaultValue: String(60), attributes: { min: String(1), max: String(60), step: "1" }, formatDisplay: (e) => Number.isFinite(e) ? `${e} fps` : null }));
  frameCountInput = this._manageComponent(new G({ defaultValue: String(480), attributes: { min: String(1), max: String(3600), step: "1" } }));
  qualityInput = this._manageComponent(new Pt({ defaultValue: String(0.7), attributes: { min: String(0), max: String(1), step: "0.001" }, formatValue: (e) => Vt(e) }));
  status = this._manageComponent(new Ne({ title: "status", message: "ready to record", variant: "neutral", context: "video" }));
  recordingState = "idle";
  constructor(e) {
    super(e);
  }
  render() {
    const e = document.createElement("div");
    e.classList.add(b.stack);
    const t = new j("row");
    t.mount(e);
    const r = new P({ label: "number of frames", labelFor: "textmode-export-video-frame-count", variant: "compact" });
    r.mount(t.root), this.frameCountInput.mount(r.root), this.frameCountInput.inputElement.id = "textmode-export-video-frame-count";
    const a = new P({ label: "frame rate (fps)", labelFor: "textmode-export-video-frame-rate", variant: "compact" });
    a.mount(t.root), this.frameRateInput.mount(a.root), this.frameRateInput.inputElement.id = "textmode-export-video-frame-rate";
    const i = new P({ label: "quality", labelFor: "textmode-export-video-quality", variant: "full" });
    return i.mount(e), this.qualityInput.mount(i.root), this.qualityInput.inputElement.id = "textmode-export-video-quality", this.status.mount(e), e;
  }
  getOptions() {
    const e = this._config.defaultOptions ?? {}, t = Number.parseInt(this.frameCountInput.value, 10), r = Number.parseFloat(this.frameRateInput.value), a = Number.parseFloat(this.qualityInput.value);
    return { frameCount: Number.isFinite(t) ? t : e.frameCount ?? 480, frameRate: Number.isFinite(r) ? r : e.frameRate ?? 60, quality: Number.isFinite(a) ? a : e.quality ?? 0.7 };
  }
  reset() {
    this.recordingState = "idle", this.applyDefaults(), this.status.setMessage("ready to record", "neutral");
  }
  validate() {
    const e = Number.parseInt(this.frameCountInput.value, 10), t = Number.parseFloat(this.frameRateInput.value);
    return Number.isFinite(e) && e >= 1 && Number.isFinite(t) && t >= 1;
  }
  isRecording() {
    return this.recordingState === "recording";
  }
  setRecordingState(e, t) {
    this.recordingState = e;
    const r = e === "recording";
    this.frameCountInput.inputElement.disabled = r, this.frameRateInput.inputElement.disabled = r, this.qualityInput.inputElement.disabled = r, this.syncStatus(e, t);
  }
  handleProgress(e) {
    this.syncStatus(e.state, e);
  }
  syncStatus(e, t) {
    switch (e) {
      case "recording": {
        const r = t?.frameIndex ?? 0, a = t?.totalFrames ?? this.resolvePlannedFrameCount();
        if (a) {
          const i = Math.min(Math.max(0, Math.round(r)), a);
          this.status.setMessage(`recording ${i}/${a} frames`, "active");
        } else this.status.setMessage(`recording ${Math.max(0, Math.round(r))} frames`, "active");
        break;
      }
      case "completed":
        this.status.setMessage("saved to disk", "active");
        break;
      case "error":
        this.status.setMessage(t?.message ? `error: ${t.message}` : "recording failed", "alert");
        break;
      default:
        this.status.setMessage("ready to record", "neutral");
    }
  }
  resolvePlannedFrameCount() {
    const e = Number.parseInt(this.frameCountInput.value, 10);
    return Number.isFinite(e) && e > 0 ? Math.round(e) : void 0;
  }
  applyDefaults() {
    const e = this._config.defaultOptions ?? {}, t = e.frameCount ?? 480, r = e.frameRate ?? 60, a = e.quality ?? 0.7;
    this.frameCountInput.value = String(t), this.frameRateInput.value = String(r), this.qualityInput.value = String(a), this.frameCountInput.refresh(), this.frameRateInput.refresh();
  }
}
const Tt = `@layer textmode-export-overlay{.textmode-export-overlay{--overlay-bg: rgba(20, 20, 20, .8);--overlay-surface: rgba(40, 40, 40, .9);--overlay-border: rgba(255, 255, 255, .14);--overlay-border-strong: rgba(255, 255, 255, .2);--overlay-border-focus: rgba(160, 160, 160, .6);--overlay-focus-shadow: 0 0 0 1px rgba(140, 140, 140, .28);--overlay-text: #ffffff;--overlay-muted: rgba(200, 200, 200, .74);--overlay-radius: .75rem;--overlay-stack-gap: .55rem;position:absolute;top:0;left:0;display:flex;flex-direction:column;gap:var(--overlay-stack-gap);min-width:236px;max-width:236px;padding:.65rem .8rem;background:var(--overlay-bg);color:var(--overlay-text);border-radius:var(--overlay-radius);border:1px solid var(--overlay-border);box-shadow:0 12px 28px #0000004d;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:.82rem;line-height:1.35;pointer-events:auto;z-index:2147483647}.textmode-export-overlay *{box-sizing:border-box}.textmode-export-overlay__header{display:flex;flex-direction:column;gap:.4rem}.textmode-export-overlay__header-title-row{display:flex;align-items:center;justify-content:space-between;gap:.4rem}.textmode-export-overlay__header-links{display:inline-flex;align-items:center;gap:.3rem}.textmode-export-overlay__support-link{display:inline-flex;align-items:center;justify-content:center;padding:.2rem;border-radius:.45rem;border:1px solid transparent;color:#d7d7d7d1;background:transparent;text-decoration:none;line-height:0;transition:background .18s ease,color .18s ease,transform .18s ease,border-color .18s ease}.textmode-export-overlay__support-link:hover{color:#fff;background:#5a5a5a4d;border-color:#c8c8c824}.textmode-export-overlay__support-link:focus-visible{outline:none;border-color:var(--overlay-border-focus);box-shadow:var(--overlay-focus-shadow)}.textmode-export-overlay__support-icon,.textmode-export-overlay__link-icon{display:block;width:1rem;height:1rem}.textmode-export-overlay__stack{display:flex;flex-direction:column;gap:var(--overlay-stack-gap)}.textmode-export-overlay__stack--dense{gap:.3rem}.textmode-export-overlay__stack--compact{gap:.45rem}.textmode-export-overlay__section{display:flex;flex-direction:column;gap:.4rem}.textmode-export-overlay__title{font-size:.92rem;font-weight:600}.textmode-export-overlay__divider{width:100%;height:1px;background:#ffffff29;margin-top:.25rem}.textmode-export-overlay__label{font-weight:500;opacity:.9}.textmode-export-overlay__checkbox{display:flex;align-items:center;gap:.5rem}.textmode-export-overlay__checkbox input[type=checkbox]{width:1rem;height:1rem;accent-color:rgba(100,100,100,.9)}.textmode-export-overlay__row{display:flex;gap:.6rem;flex-wrap:wrap;align-items:flex-start;width:100%}.textmode-export-overlay__field{display:flex;flex-direction:column;gap:.3rem;flex:1 1 120px;min-width:120px}.textmode-export-overlay__field--compact{flex:1 1 100px;min-width:100px}.textmode-export-overlay__field--dense{flex:1 1 90px;min-width:90px}.textmode-export-overlay__field--channel{flex:1 1 0;min-width:0}.textmode-export-overlay__field--full{width:100%;flex:1 1 100%}.textmode-export-overlay__input,.textmode-export-overlay select.textmode-export-overlay__input,.textmode-export-overlay input.textmode-export-overlay__input{width:100%;padding:.35rem .5rem;border-radius:.4rem;border:1px solid var(--overlay-border-strong);background:var(--overlay-surface);color:var(--overlay-text);font:inherit;line-height:1.35;transition:border-color .18s ease,box-shadow .18s ease,background .18s ease}.textmode-export-overlay select.textmode-export-overlay__input{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(200, 200, 200, 0.74)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");background-repeat:no-repeat;background-position:right .5rem center;background-size:1rem;padding-right:2rem}.textmode-export-overlay__input:focus{outline:none;border-color:var(--overlay-border-focus);box-shadow:var(--overlay-focus-shadow);background:#2d2f42eb}.textmode-export-overlay__input::placeholder{color:var(--overlay-muted);opacity:.7}.textmode-export-overlay__muted{font-size:.75rem;opacity:.7;display:block}.textmode-export-overlay__button{display:inline-flex;align-items:center;justify-content:center;gap:.35rem;border-radius:.45rem;border:none;font-weight:600;padding:.45rem .7rem;cursor:pointer;transition:background .2s ease,transform .2s ease,box-shadow .2s ease}.textmode-export-overlay__button--primary{background:#505050;color:#fff}.textmode-export-overlay__button--secondary{background:#606060;color:#fff}.textmode-export-overlay__button--full{width:100%}.textmode-export-overlay__button:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 7px 18px #00000073}.textmode-export-overlay__button--primary:hover:not(:disabled){background:#404040}.textmode-export-overlay__button--secondary:hover:not(:disabled){background:#4a4a4a}.textmode-export-overlay__button:disabled{cursor:default;opacity:.55;transform:none;box-shadow:none}.textmode-export-overlay__status{display:flex;flex-direction:column;gap:.25rem;padding:.45rem .55rem;border-radius:.45rem;border:1px solid rgba(110,110,110,.22);background:#4646462e}.textmode-export-overlay__status--gif{background:#5050501f;border-color:#78787840}.textmode-export-overlay__status--video{background:#4646461f;border-color:#6e6e6e40}.textmode-export-overlay__status-title{font-weight:600;font-size:.75rem;opacity:.85;text-transform:uppercase;letter-spacing:.04em}.textmode-export-overlay__status-value{font-size:.82rem;color:#dedede;transition:color .18s ease}.textmode-export-overlay__status-value--neutral{color:#cfcfcf}.textmode-export-overlay__status-value--active{color:#f5f5f5}.textmode-export-overlay__status-value--alert{color:#b8b8b8}.textmode-export-number-input,.textmode-export-overlay .textmode-export-number-input{display:flex;align-items:stretch;width:100%;background:var(--overlay-surface);border:1px solid var(--overlay-border-strong);border-radius:.4rem;overflow:hidden;transition:border-color .18s ease,box-shadow .18s ease,background .18s ease;position:relative}.textmode-export-number-input:focus-within{border-color:var(--overlay-border-focus);box-shadow:var(--overlay-focus-shadow)}.textmode-export-number-input.is-disabled{opacity:.55}.textmode-export-number-input__field{flex:1 1 auto;min-width:0;border:none;background:transparent;color:var(--overlay-text);font:inherit;padding:.35rem .5rem;appearance:textfield}.textmode-export-number-input__field::-webkit-outer-spin-button,.textmode-export-number-input__field::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}.textmode-export-number-input__field:focus{outline:none}.textmode-export-number-input__controls{display:flex;flex-direction:column;border-left:1px solid rgba(255,255,255,.12);min-width:1.6rem}.textmode-export-number-input__control{display:flex;align-items:center;justify-content:center;width:100%;flex:1;border:none;background:#32323299;color:#d0d0d0;font-size:.68rem;line-height:1;cursor:pointer;transition:background .15s ease,color .15s ease;padding:0}.textmode-export-number-input__control:hover:not(:disabled){background:#5a5a5ad9;color:#fff}.textmode-export-number-input__control:disabled{cursor:default;opacity:.4;background:#28282880;color:#c8c8c866}.textmode-export-number-input:focus-within .textmode-export-number-input__control{background:#3c3c3cbf;color:#e8e8e8}.textmode-export-number-input__display{position:absolute;inset:0;display:flex;align-items:center;padding:.4rem .55rem;pointer-events:none;color:#f8fafc;opacity:0;transition:opacity .14s ease}.textmode-export-number-input__display--visible{opacity:1}.textmode-export-range-input{position:relative;width:100%}.textmode-export-range-input.is-disabled{opacity:.55}.textmode-export-range-input__field{width:100%;height:1.4rem;padding:0;margin:0;background:transparent;cursor:pointer;appearance:none;-webkit-appearance:none}.textmode-export-range-input__field::-webkit-slider-thumb{width:12px;height:12px;margin-top:-3.5px;-webkit-appearance:none;border-radius:50%;background:#a0a0a0;border:2px solid #303030;box-shadow:0 0 0 2px #00000059}.textmode-export-range-input__field::-webkit-slider-runnable-track{height:5px;border-radius:999px;background:linear-gradient(90deg,#8c8c8cd9,#646464a6)}.textmode-export-range-input__field::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:#a0a0a0;border:2px solid #303030;margin-top:-3.5px}.textmode-export-range-input__field::-moz-range-track{height:5px;border-radius:999px;background:linear-gradient(90deg,#8c8c8cd9,#646464a6)}.textmode-export-range-input__tooltip{position:absolute;top:-1.5rem;left:0;transform:translate(-50%);padding:.2rem .35rem;border-radius:.35rem;background:#1e1e1ee0;color:#f8fafc;font-size:.68rem;line-height:1;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .15s ease}.textmode-export-range-input__tooltip--visible{opacity:1}}`;
class Ot {
  _textmodifier;
  _state;
  _events;
  _exportService;
  _clipboardService;
  _definitions;
  _formats = /* @__PURE__ */ new Map();
  _eventUnsubscribers = [];
  _shadowHost;
  _shadowRoot;
  _overlayElement;
  _optionsContainer;
  _copyButtonContainer;
  _positionService;
  _header = new H();
  _formatField = new P({ label: "export format", labelFor: "textmode-export-format", variant: "full" });
  _formatSelect = new me({ id: "textmode-export-format", options: [] });
  _exportButton = new Le({ label: "download file", fullWidth: !0, variant: "primary" });
  _copyButton = new Le({ label: "copy to clipboard", fullWidth: !0, variant: "primary" });
  _currentFormat;
  _currentBlade;
  _handleFormatSelectChange = () => {
    this._handleFormatChange(this._formatSelect.value);
  };
  _handleExportClickSafe = () => {
    this._handleExportClick().catch((e) => {
      console.error("[textmode-export] Export failed", e);
    });
  };
  _handleCopyClickSafe = () => {
    this._handleCopyClick().catch((e) => {
      console.error("[textmode-export] Copy failed", e);
    });
  };
  constructor(e, t, r, a, i) {
    this._textmodifier = e, this._state = r, this._events = a, this._exportService = new kt(t, a), this._clipboardService = new Et(t), this._definitions = i, this._currentFormat = r.snapshot.format, this._initializeFormatMap(), this._registerEventHandlers();
  }
  $mount() {
    this._createOverlay(), this._renderStaticContent(), this._positionService = new Bt(this._textmodifier, this._shadowHost), this._positionService.bind(), this._switchFormat(this._currentFormat);
  }
  $dispose() {
    this._formatSelect.isMounted() && this._formatSelect.selectElement.removeEventListener("change", this._handleFormatSelectChange), this._exportButton.isMounted() && this._exportButton.buttonElement.removeEventListener("click", this._handleExportClickSafe), this._copyButton.isMounted() && this._copyButton.buttonElement.removeEventListener("click", this._handleCopyClickSafe);
    for (const e of this._eventUnsubscribers) e();
    this._eventUnsubscribers.length = 0, this._events.$clear();
    for (const e of this._formats.values()) e.blade.destroy();
    this._formats.clear(), this._currentBlade = void 0, this._shadowHost?.isConnected && this._shadowHost.remove(), this._positionService?.dispose();
  }
  _initializeFormatMap() {
    for (const e of this._definitions) {
      const t = e.createBlade();
      this._formats.set(e.format, { definition: e, blade: t, initialized: !1 });
    }
  }
  _createOverlay() {
    this._shadowHost = document.createElement("div"), this._shadowHost.dataset.plugin = "textmode-export-overlay-host", this._shadowHost.style.cssText = "position: absolute; top: 0; left: 0; pointer-events: none; z-index: 2147483647;", this._shadowRoot = this._shadowHost.attachShadow({ mode: "open" });
    const e = document.createElement("style");
    e.textContent = Tt, this._shadowRoot.appendChild(e), this._overlayElement = document.createElement("div"), this._overlayElement.dataset.plugin = "textmode-export-overlay", this._overlayElement.classList.add(b.root, b.stack), this._shadowRoot.appendChild(this._overlayElement), document.body.appendChild(this._shadowHost);
  }
  _renderStaticContent() {
    this._header.mount(this._overlayElement);
    const e = document.createElement("div");
    e.classList.add(b.section), this._overlayElement.appendChild(e), this._formatField.mount(e), this._prepareFormatOptions(), this._formatSelect.mount(this._formatField.root), this._formatSelect.selectElement.addEventListener("change", this._handleFormatSelectChange), this._optionsContainer = document.createElement("div"), this._optionsContainer.classList.add(b.stack, b.stackCompact), this._overlayElement.appendChild(this._optionsContainer), this._exportButton.mount(this._overlayElement), this._exportButton.buttonElement.addEventListener("click", this._handleExportClickSafe), this._copyButtonContainer = document.createElement("div"), this._copyButtonContainer.classList.add(b.stack, b.stackDense), this._overlayElement.appendChild(this._copyButtonContainer), this._copyButton.mount(this._copyButtonContainer), this._copyButton.buttonElement.dataset.defaultLabel = "copy to clipboard", this._copyButton.buttonElement.addEventListener("click", this._handleCopyClickSafe);
  }
  _prepareFormatOptions() {
    const e = this._definitions.map((t) => ({ value: t.format, label: t.label }));
    this._formatSelect.update({ options: e, defaultValue: this._currentFormat });
  }
  _registerEventHandlers() {
    this._eventUnsubscribers.push(this._events.$on("export:request", ({ format: e }) => {
      e === this._currentFormat && (this._state.$set({ isBusy: !0, error: void 0 }), this._updateExportButton());
    }), this._events.$on("export:success", ({ format: e }) => {
      if (e === this._currentFormat) {
        const t = { isBusy: !1 };
        e === "gif" && (t.gifProgress = void 0), e === "video" && (t.videoProgress = void 0), this._state.$set(t), this._updateExportButton();
      }
    }), this._events.$on("export:error", ({ format: e, error: t }) => {
      e === this._currentFormat && (this._state.$set({ isBusy: !1, error: t }), this._updateExportButton());
    }), this._events.$on("export:progress", ({ format: e, progress: t }) => {
      if (t) {
        if (e === "gif" && this._currentBlade?.blade instanceof ue) {
          const r = t;
          this._state.$set({ gifProgress: r }), this._currentBlade.blade.handleProgress(r);
        } else if (e === "video" && this._currentBlade?.blade instanceof pe) {
          const r = t;
          this._state.$set({ videoProgress: r }), this._currentBlade.blade.handleProgress(r);
        }
        this._updateExportButton();
      }
    }));
  }
  _handleFormatChange(e) {
    this._currentFormat = e, this._state.$set({ format: e }), this._switchFormat(e), this._events.$emit("format:change", { format: e });
  }
  _switchFormat(e) {
    const t = this._formats.get(e);
    if (!t) throw new Error(`Unknown export format: ${e}`);
    this._currentBlade && this._currentBlade.blade.unmount(), this._optionsContainer.innerHTML = "", t.blade.mount(this._optionsContainer), t.initialized || (t.blade.reset(), t.initialized = !0), this._currentBlade = t, this._formatSelect.value = e, this._updateCopyButtonState(), this._updateExportButton(), this._positionService?.scheduleUpdate();
  }
  _updateCopyButtonState() {
    const e = this._currentBlade?.definition.supportsClipboard ?? !1;
    this._copyButtonContainer.style.display = e ? "flex" : "none", this._copyButton.setDisabled(!e);
  }
  async _handleExportClick() {
    if (!this._currentBlade) return;
    const e = this._currentBlade.definition.format, t = this._currentBlade.blade.getOptions();
    if (this._currentBlade.blade.validate()) {
      if (e === "gif") {
        const r = this._currentBlade.blade;
        if (r.isRecording()) return;
        r.setRecordingState("recording");
        try {
          await this._exportService.$requestExport("gif", t, { onGIFProgress: (a) => {
            r.setRecordingState(a.state, a);
          } });
        } catch (a) {
          throw r.setRecordingState("error"), a;
        }
        return void window.setTimeout(() => {
          r.setRecordingState("idle"), this._updateExportButton();
        }, 1600);
      }
      if (e === "video") {
        const r = this._currentBlade.blade;
        if (r.isRecording()) return;
        r.setRecordingState("recording");
        try {
          await this._exportService.$requestExport("video", t, { onVideoProgress: (a) => {
            r.setRecordingState(a.state, a);
          } });
        } catch (a) {
          throw r.setRecordingState("error"), a;
        }
        return void window.setTimeout(() => {
          r.setRecordingState("idle"), this._updateExportButton();
        }, 1600);
      }
      this._exportButton.setDisabled(!0), this._exportButton.setLabel("exporting…");
      try {
        await this._exportService.$requestExport(e, t);
      } finally {
        this._exportButton.setDisabled(!1), this._exportButton.setLabel("download file");
      }
    } else console.warn("[textmode-export] Export options failed validation");
  }
  async _handleCopyClick() {
    if (!this._currentBlade || !this._currentBlade.definition.supportsClipboard) return;
    const e = this._currentBlade.definition.format, t = this._currentBlade.blade.getOptions(), r = this._copyButton.buttonElement.dataset.defaultLabel ?? "copy to clipboard";
    this._copyButton.setDisabled(!0), this._copyButton.setLabel("copying…");
    try {
      await this._clipboardService.$copy(e, t), this._copyButton.setLabel("copied!");
    } catch (a) {
      console.error("[textmode-export] Failed to copy to clipboard", a), this._copyButton.setLabel("copy failed!");
    } finally {
      window.setTimeout(() => {
        this._copyButton.setLabel(r), this._copyButton.setDisabled(!1);
      }, 1200);
    }
  }
  _updateExportButton() {
    if (!this._currentBlade) return;
    const e = this._currentBlade.definition.format;
    if (e === "gif" && this._currentBlade.blade instanceof ue) {
      const r = this._currentBlade.blade, a = this._state.snapshot.gifProgress;
      if (r.isRecording()) if (this._exportButton.setDisabled(!0), a?.totalFrames) {
        const i = a.frameIndex ?? 0, n = a.state === "encoding" ? "encoding" : "recording";
        this._exportButton.setLabel(`${n} ${i}/${a.totalFrames}`);
      } else {
        const i = a?.state === "encoding" ? "encoding" : "recording";
        this._exportButton.setLabel(`${i}…`);
      }
      else this._exportButton.setDisabled(!1), this._exportButton.setLabel("start recording");
      return;
    }
    if (e === "video" && this._currentBlade.blade instanceof pe) {
      const r = this._currentBlade.blade, a = this._state.snapshot.videoProgress;
      if (r.isRecording()) if (this._exportButton.setDisabled(!0), a?.totalFrames) {
        const i = a.frameIndex ?? 0;
        this._exportButton.setLabel(`recording ${i}/${a.totalFrames} frames`);
      } else this._exportButton.setLabel("recording…");
      else this._exportButton.setDisabled(!1), this._exportButton.setLabel("start recording");
      return;
    }
    const t = this._state.snapshot.isBusy;
    this._exportButton.setDisabled(t), this._exportButton.setLabel(t ? "exporting…" : "download file");
  }
}
class Rt {
  _listeners = /* @__PURE__ */ new Map();
  $on(e, t) {
    this._listeners.has(e) || this._listeners.set(e, /* @__PURE__ */ new Set());
    const r = this._listeners.get(e);
    return r.add(t), () => {
      r.delete(t), r.size === 0 && this._listeners.delete(e);
    };
  }
  $emit(e, t) {
    const r = this._listeners.get(e);
    if (r) for (const a of [...r]) try {
      a(t);
    } catch (i) {
      console.error("[textmode-export] Event handler failed", i);
    }
  }
  $clear() {
    this._listeners.clear();
  }
}
class Ut {
  _state;
  _listeners = /* @__PURE__ */ new Set();
  constructor(e) {
    this._state = e;
  }
  get snapshot() {
    return Object.freeze({ ...this._state });
  }
  $set(e) {
    this._state = Object.assign({}, this._state, e);
    const t = this.snapshot;
    for (const r of [...this._listeners]) try {
      r(t);
    } catch (a) {
      console.error("[textmode-export] State listener failed", a);
    }
  }
  $subscribe(e) {
    return this._listeners.add(e), e(this.snapshot), () => {
      this._listeners.delete(e);
    };
  }
  $reset(e) {
    this._state = e;
    const t = this.snapshot;
    for (const r of [...this._listeners]) r(t);
  }
}
const Nt = (s) => ({ format: s, isBusy: !1 });
class Ge extends T {
  props;
  checkbox;
  labelElement;
  handleChange = () => {
    this.props.defaultChecked = this.checkbox.checked;
  };
  constructor(e) {
    super(), this.props = e;
  }
  render() {
    this.labelElement = document.createElement("label"), this.labelElement.classList.add(b.checkbox), this.checkbox = document.createElement("input"), this.checkbox.type = "checkbox", this.props.id && (this.checkbox.id = this.props.id), this.checkbox.checked = !!this.props.defaultChecked, this.checkbox.addEventListener("change", this.handleChange);
    const e = document.createElement("span");
    return e.textContent = this.props.label, this.labelElement.htmlFor = this.props.id ?? "", this.labelElement.appendChild(this.checkbox), this.labelElement.appendChild(e), this.labelElement;
  }
  get inputElement() {
    return this.checkbox;
  }
  get checked() {
    return this.checkbox.checked;
  }
  set checked(e) {
    this.checkbox.checked = e;
  }
  _onUnmount() {
    this.checkbox.removeEventListener("change", this.handleChange);
  }
  onUpdate(e) {
    this.props = e, e.id && (this.checkbox.id = e.id, this.labelElement.htmlFor = e.id), this.checkbox.checked = !!e.defaultChecked, this.labelElement.lastElementChild && (this.labelElement.lastElementChild.textContent = e.label);
  }
}
class Gt extends T {
  props;
  input;
  handleInput = () => {
    this.props.defaultValue = this.input.value;
  };
  constructor(e) {
    super(), this.props = e;
  }
  render() {
    return this.input = document.createElement("input"), this.input.type = "text", this.input.classList.add(b.input), this.props.id && (this.input.id = this.props.id), this.props.maxLength !== void 0 && (this.input.maxLength = this.props.maxLength), this.props.defaultValue !== void 0 && (this.input.value = this.props.defaultValue), this.input.addEventListener("input", this.handleInput), this.input;
  }
  get inputElement() {
    return this.input;
  }
  get value() {
    return this.input.value;
  }
  set value(e) {
    this.input.value = e;
  }
  _onUnmount() {
    this.input.removeEventListener("input", this.handleInput);
  }
  onUpdate(e) {
    this.props = e, e.id && (this.input.id = e.id), e.maxLength !== void 0 && (this.input.maxLength = e.maxLength), e.defaultValue !== void 0 && (this.input.value = e.defaultValue);
  }
}
class zt extends Y {
  trailingSpaces = this._manageComponent(new Ge({ label: "preserve trailing spaces", defaultChecked: !1 }));
  emptyCharacter = this._manageComponent(new Gt({ id: "textmode-export-empty-character", defaultValue: " ", maxLength: 1 }));
  constructor(e) {
    super(e);
  }
  render() {
    const e = document.createElement("div");
    e.classList.add(b.stack), this.trailingSpaces.mount(e);
    const t = new P({ label: "empty character", labelFor: "textmode-export-empty-character", variant: "full" });
    return t.mount(e), this.emptyCharacter.mount(t.root), e;
  }
  getOptions() {
    const e = this._config.defaultOptions ?? {}, t = this.emptyCharacter.value || e.emptyCharacter || " ";
    return { preserveTrailingSpaces: this.trailingSpaces.checked, emptyCharacter: t };
  }
  reset() {
    this.applyDefaults();
  }
  validate() {
    return this.emptyCharacter.value.length <= 1;
  }
  applyDefaults() {
    const e = this._config.defaultOptions ?? {};
    this.trailingSpaces.checked = e.preserveTrailingSpaces ?? !1, this.emptyCharacter.value = e.emptyCharacter ?? " ";
  }
}
class Wt extends Y {
  formatSelect = this._manageComponent(new me({ id: "textmode-export-image-format", options: [{ value: "png", label: `PNG (${le.png})` }, { value: "jpg", label: `JPG (${le.jpg})` }, { value: "webp", label: `WEBP (${le.webp})` }], defaultValue: "png" }));
  scaleInput = this._manageComponent(new G({ defaultValue: "1", attributes: { min: "0.1", step: "0.1" } }));
  constructor(e) {
    super(e);
  }
  render() {
    const e = document.createElement("div");
    e.classList.add(b.stack);
    const t = new j("row");
    t.mount(e);
    const r = new P({ label: "image format", labelFor: "textmode-export-image-format", variant: "compact" });
    r.mount(t.root), this.formatSelect.mount(r.root);
    const a = new P({ label: "scale", labelFor: "textmode-export-image-scale", variant: "dense" });
    return a.mount(t.root), this.scaleInput.mount(a.root), this.scaleInput.inputElement.id = "textmode-export-image-scale", e;
  }
  getOptions() {
    const e = Number.parseFloat(this.scaleInput.value);
    return { format: this.formatSelect.value, scale: Number.isFinite(e) ? e : this._config.defaultOptions?.scale ?? 1 };
  }
  reset() {
    this.applyDefaults(), this.scaleInput.refresh();
  }
  validate() {
    const e = Number.parseFloat(this.scaleInput.value);
    return Number.isFinite(e) && e > 0;
  }
  applyDefaults() {
    const e = this._config.defaultOptions ?? {};
    this.formatSelect.value = e.format ?? "png";
    const t = e.scale ?? 1;
    this.scaleInput.value = String(t);
  }
}
class qt extends Y {
  includeBackground = this._manageComponent(new Ge({ id: "textmode-export-svg-include-backgrounds", label: "include cell backgrounds", defaultChecked: !0 }));
  drawMode = this._manageComponent(new me({ id: "textmode-export-svg-draw-mode", options: [{ value: "fill", label: "fill" }, { value: "stroke", label: "stroke" }], defaultValue: "fill" }));
  strokeWidth = this._manageComponent(new G({ defaultValue: "1", attributes: { min: "0", step: "0.1" } }));
  constructor(e) {
    super(e);
  }
  render() {
    const e = document.createElement("div");
    e.classList.add(b.stack), this.includeBackground.mount(e);
    const t = new j("row");
    t.mount(e);
    const r = new P({ label: "draw mode", labelFor: "textmode-export-svg-draw-mode", variant: "compact" });
    r.mount(t.root), this.drawMode.mount(r.root);
    const a = new P({ label: "stroke width", labelFor: "textmode-export-svg-stroke-width", variant: "compact" });
    return a.mount(t.root), this.strokeWidth.mount(a.root), this.strokeWidth.inputElement.id = "textmode-export-svg-stroke-width", this.drawMode.selectElement.addEventListener("change", () => this.updateStrokeControls()), this.updateStrokeControls(), e;
  }
  getOptions() {
    return { includeBackgroundRectangles: this.includeBackground.checked, drawMode: this.drawMode.value, strokeWidth: Number.parseFloat(this.strokeWidth.value) };
  }
  reset() {
    this.applyDefaults(), this.updateStrokeControls();
  }
  validate() {
    const e = Number.parseFloat(this.strokeWidth.value);
    return this.drawMode.value !== "stroke" || Number.isFinite(e) && e >= 0;
  }
  updateStrokeControls() {
    const e = this.drawMode.value === "stroke";
    this.strokeWidth.inputElement.disabled = !e, this.strokeWidth.refresh();
  }
  applyDefaults() {
    const e = this._config.defaultOptions ?? {};
    this.includeBackground.checked = e.includeBackgroundRectangles ?? !0, this.drawMode.value = e.drawMode ?? "fill";
    const t = e.strokeWidth ?? 1;
    this.strokeWidth.value = String(t), this.strokeWidth.refresh();
  }
}
const Ht = [{ format: "txt", label: "plain text (.txt)", supportsClipboard: !0, createBlade: () => new zt({ format: "txt", label: "plain text (.txt)", supportsClipboard: !0, defaultOptions: { preserveTrailingSpaces: !1, emptyCharacter: " " } }) }, { format: "image", label: "image (.png / .jpg / .webp)", supportsClipboard: !0, createBlade: () => new Wt({ format: "image", label: "image (.png / .jpg / .webp)", supportsClipboard: !0, defaultOptions: { format: "png", scale: 1 } }) }, { format: "svg", label: "vector (.svg)", supportsClipboard: !0, createBlade: () => new qt({ format: "svg", label: "vector (.svg)", supportsClipboard: !0, defaultOptions: { includeBackgroundRectangles: !0, drawMode: "fill", strokeWidth: 1 } }) }, { format: "gif", label: "animated GIF (.gif)", supportsClipboard: !1, createBlade: () => new ue({ format: "gif", label: "animated GIF (.gif)", supportsClipboard: !1, defaultOptions: { frameCount: 300, frameRate: 60, scale: 1, repeat: 0 } }) }, { format: "video", label: "video (.webm)", supportsClipboard: !1, createBlade: () => new pe({ format: "video", label: "video (.webm)", supportsClipboard: !1, defaultOptions: { frameCount: 480, frameRate: 60, quality: 0.7 } }) }];
function jt() {
  return Ht;
}
function Qt(s, e) {
  const t = jt(), r = t[0]?.format, a = new Ut(Nt(r)), i = new Rt(), n = new Ot(s, e, a, i, t);
  return n.$mount(), n;
}
const Xt = (s = {}) => {
  const e = s.overlay ?? !0;
  let t;
  return { name: "textmode-export", version: "1.0.0", async install(r, a) {
    const i = { saveCanvas: async (n = {}) => new be().$saveImage(r.canvas, n), copyCanvas: async (n = {}) => new be().$copyImageToClipboard(r.canvas, n), saveSVG: (n = {}) => {
      new ge().$saveSVG(r, n);
    }, saveStrings: (n = {}) => {
      new ve().$saveTXT(r, n);
    }, toSVG: (n = {}) => new ge().$generateSVG(r, n), toString: (n = {}) => new ve().$generateTXT(r, n), saveGIF: async (n = {}) => new mt(r, a.registerPostDrawHook).$saveGIF(n), saveWEBM: async (n = {}) => new Ct(r, a.registerPostDrawHook).$saveWEBM(n) };
    Object.assign(r, i), e && (t = Qt(r, i));
  }, async uninstall(r) {
    t?.$dispose(), t = void 0;
    const a = ["saveCanvas", "copyCanvas", "saveSVG", "saveStrings", "toSVG", "toString", "saveGIF", "saveWEBM"];
    for (const i of a) delete r[i];
  } };
};
typeof window < "u" && (window.createTextmodeExportPlugin = Xt);
export {
  Xt as createTextmodeExportPlugin
};
