var Xt = Object.defineProperty;
var Yt = (n, t, e) => t in n ? Xt(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var a = (n, t, e) => Yt(n, typeof t != "symbol" ? t + "" : t, e);
class L extends Error {
  constructor(t, e = {}) {
    super(L.i(t, e)), this.name = "TextmodeError";
  }
  static i(t, e) {
    return `${t}${e && Object.keys(e).length > 0 ? `

📋 Context:` + Object.entries(e).map(([i, r]) => `
  - ${i}: ${L.o(r)}`).join("") : ""}

${"↓".repeat(24)}
`;
  }
  static o(t) {
    if (t === null) return "null";
    if (t === void 0) return "undefined";
    if (typeof t == "string") return `"${t}"`;
    if (typeof t == "number" || typeof t == "boolean") return t + "";
    if (Array.isArray(t)) return t.length === 0 ? "[]" : t.length <= 5 ? `[${t.map((e) => L.o(e)).join(", ")}]` : `[${t.slice(0, 3).map((e) => L.o(e)).join(", ")}, ... +${t.length - 3} more]`;
    if (typeof t == "object") {
      const e = Object.keys(t);
      return e.length === 0 ? "{}" : e.length <= 3 ? `{ ${e.map((i) => `${i}: ${L.o(t[i])}`).join(", ")} }` : `{ ${e.slice(0, 2).map((i) => `${i}: ${L.o(t[i])}`).join(", ")}, ... +${e.length - 2} more }`;
    }
    return t + "";
  }
}
var jt = ((n) => (n[n.SILENT = 0] = "SILENT", n[n.WARNING = 1] = "WARNING", n[n.ERROR = 2] = "ERROR", n[n.THROW = 3] = "THROW", n))(jt || {});
const D = class D {
  constructor() {
    a(this, "l", { globalLevel: 3 });
  }
  static u() {
    return D.h || (D.h = new D()), D.h;
  }
  v(t, e) {
    const i = "%c[textmode.js] Oops! (╯°□°)╯︵ Something went wrong in your code.", r = "color: #f44336; font-weight: bold; background: #ffebee; padding: 2px 6px; border-radius: 3px;";
    switch (this.l.globalLevel) {
      case 0:
        return !1;
      case 1:
        return console.group(i, r), console.warn(L.i(t, e)), console.groupEnd(), !1;
      case 2:
        return console.group(i, r), console.error(L.i(t, e)), console.groupEnd(), !1;
      default:
        throw new L(t, e);
    }
  }
  m(t, e, i) {
    return !!t || (this.v(e, i), !1);
  }
  _(t) {
    this.l.globalLevel = t;
  }
};
a(D, "h", null);
let ut = D;
const V = ut.u();
class q {
  constructor(t, e, i) {
    a(this, "A");
    a(this, "C");
    a(this, "M", /* @__PURE__ */ new Map());
    a(this, "F", /* @__PURE__ */ new Map());
    a(this, "U", 0);
    this.A = t, this.C = this.P(e, i), this.R();
  }
  R() {
    const t = this.A.getProgramParameter(this.C, this.A.ACTIVE_UNIFORMS);
    for (let e = 0; e < t; e++) {
      const i = this.A.getActiveUniform(this.C, e);
      if (i) {
        const r = i.name.replace(/\[0\]$/, ""), s = this.A.getUniformLocation(this.C, r);
        s && (this.M.set(r, s), this.F.set(r, { type: i.type, size: i.size }));
      }
    }
  }
  P(t, e) {
    const i = this.S(this.A.VERTEX_SHADER, t), r = this.S(this.A.FRAGMENT_SHADER, e), s = this.A.createProgram();
    if (this.A.attachShader(s, i), this.A.attachShader(s, r), this.A.linkProgram(s), !this.A.getProgramParameter(s, this.A.LINK_STATUS)) {
      const h = this.A.getProgramInfoLog(s);
      throw Error("Shader program link error: " + h);
    }
    return this.A.deleteShader(i), this.A.deleteShader(r), s;
  }
  S(t, e) {
    const i = this.A.createShader(t);
    if (this.A.shaderSource(i, e), this.A.compileShader(i), !this.A.getShaderParameter(i, this.A.COMPILE_STATUS)) {
      const r = this.A.getShaderInfoLog(i);
      throw this.A.deleteShader(i), Error("Shader compilation error: " + r);
    }
    return i;
  }
  $() {
    this.A.useProgram(this.C), this.k();
  }
  k() {
    this.U = 0;
  }
  I(t) {
    for (const e in t) this.O(e, t[e]);
  }
  O(t, e) {
    var c, l;
    const i = this.M.get(t);
    if (!i) return;
    const r = this.F.get(t);
    if (!r) return;
    const { type: s, size: h } = r, o = this.A;
    if (e instanceof WebGLTexture) {
      const u = this.U++;
      return o.uniform1i(i, u), o.activeTexture(o.TEXTURE0 + u), void o.bindTexture(o.TEXTURE_2D, e);
    }
    if (e instanceof it) {
      const u = this.U++;
      return o.uniform1i(i, u), o.activeTexture(o.TEXTURE0 + u), void o.bindTexture(o.TEXTURE_2D, e.textures[0]);
    }
    if (typeof e == "number") return void (s === o.INT || s === o.BOOL ? o.uniform1i(i, e) : o.uniform1f(i, e));
    if (typeof e == "boolean") return void o.uniform1i(i, e ? 1 : 0);
    if (Array.isArray(e[0])) {
      const u = e.flat(), f = { [o.FLOAT_VEC2]: () => o.uniform2fv(i, u), [o.FLOAT_VEC3]: () => o.uniform3fv(i, u), [o.FLOAT_VEC4]: () => o.uniform4fv(i, u) };
      (c = f[s]) == null || c.call(f);
    } else {
      const u = e, f = { [o.FLOAT]: () => h > 1 ? o.uniform1fv(i, u) : o.uniform1f(i, u[0]), [o.FLOAT_VEC2]: () => o.uniform2fv(i, u), [o.FLOAT_VEC3]: () => o.uniform3fv(i, u), [o.FLOAT_VEC4]: () => o.uniform4fv(i, u), [o.INT]: () => h > 1 ? o.uniform1iv(i, u) : o.uniform1i(i, u[0]), [o.INT_VEC2]: () => o.uniform2iv(i, u), [o.INT_VEC3]: () => o.uniform3iv(i, u), [o.INT_VEC4]: () => o.uniform4iv(i, u), [o.BOOL]: () => o.uniform1iv(i, u), [o.FLOAT_MAT2]: () => o.uniformMatrix2fv(i, !1, u), [o.FLOAT_MAT3]: () => o.uniformMatrix3fv(i, !1, u), [o.FLOAT_MAT4]: () => o.uniformMatrix4fv(i, !1, u) };
      (l = f[s]) == null || l.call(f);
    }
  }
  get D() {
    return this.C;
  }
  L() {
    this.A.deleteProgram(this.C);
  }
}
function vt(n, t, e, i) {
  return 180 * Math.atan2(i - t, e - n) / Math.PI;
}
function _(n, t, e, i) {
  return Math.hypot(e - n, i - t);
}
function bt(n) {
  return (n % 360 + 360) % 360 / 360;
}
function xt(n, t, e) {
  n.bindTexture(n.TEXTURE_2D, t), n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL, 1), n.texImage2D(n.TEXTURE_2D, 0, n.RGBA, n.RGBA, n.UNSIGNED_BYTE, e), n.bindTexture(n.TEXTURE_2D, null);
}
function et(n, t, e, i, r) {
  n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, t), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, e), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, i), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, r);
}
function ft(n, t, e, i, r, s = 0, h = WebGL2RenderingContext.FLOAT, o = !1) {
  n.enableVertexAttribArray(t), n.vertexAttribPointer(t, e, h, o, i, r), n.vertexAttribDivisor(t, s);
}
function Ct(n, t, e, i, r) {
  n.bindBuffer(t, e), n.bufferData(t, i, r), n.bindBuffer(t, null);
}
const rt = `#version 300 es
in vec2 A0;in vec2 A1;in vec2 A2;in vec2 A3;in vec3 A4;in vec4 A5;in vec4 A6;in vec4 A7;in vec3 A8;in vec3 A9;in vec4 Aa;in vec4 Ab;in vec3 Ac;uniform vec2 Ut;uniform float Uu;uniform float Uv;out vec2 v_uv;out vec3 v_glyphIndex;out vec4 v_glyphColor;out vec4 v_cellColor;out vec4 v_glyphFlags;out vec3 v_worldPosition;out vec3 v_normal;out float v_geometryType;const float A=6.28318530718f;const int B=2;const int C=3;const int D=4;vec2 E(float F,vec2 G,vec2 H,vec2 I,vec2 J){float K=1.0f-F;float L=K*K;float M=L*K;float N=F*F;float O=N*F;return M*G+3.0f*L*F*H+3.0f*K*N*I+O*J;}vec2 P(float F,vec2 G,vec2 H,vec2 I,vec2 J){float K=1.0f-F;float L=K*K;float N=F*F;return-3.0f*L*G+3.0f*(L-2.0f*K*F)*H+3.0f*(2.0f*K*F-N)*I+3.0f*N*J;}vec3 Q(vec3 R,float S){float T=cos(S);float U=sin(S);return vec3(R.x,R.y*T-R.z*U,R.y*U+R.z*T);}vec3 V(vec3 R,float S){float T=cos(S);float U=sin(S);return vec3(R.x*T+R.z*U,R.y,-R.x*U+R.z*T);}vec3 W(vec3 R,float S){float T=cos(S);float U=sin(S);return vec3(R.x*T-R.y*U,R.x*U+R.y*T,R.z);}vec3 X(vec3 R,vec3 Y){vec3 Z=R;if(Y.z!=0.0f){Z=W(Z,Y.z);}if(Y.y!=0.0f){Z=V(Z,Y.y);}if(Y.x!=0.0f){Z=Q(Z,Y.x);}return Z;}void main(){v_uv=A1;v_glyphIndex=A4;v_glyphColor=A5;v_cellColor=A6;v_glyphFlags=A7;vec4 a=Aa;vec4 b=Ab;vec2 c=A3;vec2 d=A2;float e=Ac.x;float f=Ac.y;int g=int(Ac.z);vec2 h=d;vec2 i=h+c*0.5f;float j=f+e*0.5f;vec3 k=vec3(i,j);vec3 l;if(g==D){float F=clamp(A0.x,0.0f,1.0f);vec2 G=b.xy;vec2 H=a.xy;vec2 I=a.zw;vec2 J=b.zw;vec2 m=E(F,G,H,I,J);vec2 n=P(F,G,H,I,J);float o=length(n);vec2 p=o>0.0f?n/o:vec2(1.0f,0.0f);vec2 q=vec2(-p.y,p.x);vec2 r=m;vec2 s=r+q*A0.y*c.y;l=vec3(s,f);}else if(g==C){float t=mod(a.x,A);if(t<0.0f){t+=A;}float u=mod(a.y,A);if(u<0.0f){u+=A;}float v=t-u;if(v<=0.0f){v+=A;}float S=t-A0.x*v;vec2 w=vec2(cos(S),sin(S))*A0.y;vec2 s=w*c+h;l=vec3(s,f);}else if(g==B){vec2 s=A0.xy*c+h;l=vec3(s,f);}vec3 x=X(l,A9);vec3 y=x+A8;vec3 z=vec3(0.0f,0.0f,1.0f);v_worldPosition=y;v_normal=z;v_geometryType=float(g);vec2 AA=(y.xy/Ut)*2.0f;AA.y=-AA.y;float AB=y.z/Ut.y;float AC=clamp(-AB*Uu,-0.99f,0.99f);if(Uv>0.5f){gl_Position=vec4(AA,AC,1.0f);}else{float AD=0.5f;float AE=1.0f/(1.0f-AB*AD);AA*=AE;gl_Position=vec4(AA,AC,1.0f);}}`, G = class G {
  constructor(t, e, i = e, r = 1, s = {}, h) {
    a(this, "H");
    a(this, "G");
    a(this, "l");
    a(this, "A");
    a(this, "N");
    a(this, "X", []);
    a(this, "Y", null);
    a(this, "K");
    a(this, "j");
    a(this, "Z", null);
    a(this, "W", /* @__PURE__ */ new Map());
    var o;
    this.H = e, this.G = i, this.A = t, this.K = (o = 8, Math.min(Math.max(r, 1), o)), this.j = h, this.l = { filter: "nearest", wrap: "clamp", format: "rgba", type: "unsigned_byte", depth: !0, ...s }, G.q || (G.q = new q(t, rt, `#version 300 es
precision highp float;in vec2 v_uv;uniform sampler2D Uc;uniform sampler2D Ud;uniform sampler2D Ue;uniform vec2 Uf;layout(location=0)out vec4 o_character;layout(location=1)out vec4 o_primaryColor;layout(location=2)out vec4 o_secondaryColor;void main(){vec2 A=vec2(v_uv.x,1.-v_uv.y);vec2 B=A*Uf;vec2 C=(floor(B)+0.5f)/Uf;vec4 D=texture(Uc,C);vec4 E=texture(Ud,C);if(E.a==0.){discard;}vec4 F=texture(Ue,C);o_character=D;o_primaryColor=E;o_secondaryColor=F;}`));
    const c = t.getParameter(t.MAX_DRAW_BUFFERS), l = t.getParameter(t.MAX_COLOR_ATTACHMENTS);
    this.K = Math.min(this.K, c, l), this.N = t.createFramebuffer(), this.V(), this.J(), this.l.depth && this.tt();
  }
  V() {
    const t = this.A, e = this.l.filter === "linear" ? t.LINEAR : t.NEAREST, i = this.l.wrap === "repeat" ? t.REPEAT : t.CLAMP_TO_EDGE, r = this.l.type === "float" ? t.FLOAT : t.UNSIGNED_BYTE, s = r === t.FLOAT ? t.RGBA32F : t.RGBA8, h = t.RGBA;
    for (let o = 0; o < this.K; o++) {
      const c = t.createTexture();
      t.bindTexture(t.TEXTURE_2D, c), et(t, e, e, i, i), t.texImage2D(t.TEXTURE_2D, 0, s, this.H, this.G, 0, h, r, null), this.X.push(c);
    }
    t.bindTexture(t.TEXTURE_2D, null);
  }
  J() {
    const t = this.A;
    if (t.bindFramebuffer(t.FRAMEBUFFER, this.N), this.K === 1) t.framebufferTexture2D(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, this.X[0], 0);
    else {
      const e = [];
      for (let i = 0; i < this.K; i++) {
        const r = t.COLOR_ATTACHMENT0 + i;
        t.framebufferTexture2D(t.FRAMEBUFFER, r, t.TEXTURE_2D, this.X[i], 0), e.push(r);
      }
      t.drawBuffers(e);
    }
    t.bindFramebuffer(t.FRAMEBUFFER, null);
  }
  tt() {
    const t = this.A;
    this.Y = t.createRenderbuffer(), t.bindRenderbuffer(t.RENDERBUFFER, this.Y), t.renderbufferStorage(t.RENDERBUFFER, t.DEPTH_COMPONENT24, this.H, this.G), t.bindFramebuffer(t.FRAMEBUFFER, this.N), t.framebufferRenderbuffer(t.FRAMEBUFFER, t.DEPTH_ATTACHMENT, t.RENDERBUFFER, this.Y), t.bindFramebuffer(t.FRAMEBUFFER, null), t.bindRenderbuffer(t.RENDERBUFFER, null);
  }
  st(t) {
    xt(this.A, this.X[0], t);
  }
  resize(t, e) {
    this.H = t, this.G = e, this.W.clear();
    const i = this.A, r = this.l.type === "float" ? i.FLOAT : i.UNSIGNED_BYTE, s = r === i.FLOAT ? i.RGBA32F : i.RGBA8, h = i.RGBA;
    for (const o of this.X) i.bindTexture(i.TEXTURE_2D, o), i.texImage2D(i.TEXTURE_2D, 0, s, this.H, this.G, 0, h, r, null);
    i.bindTexture(i.TEXTURE_2D, null), this.Y && (i.bindRenderbuffer(i.RENDERBUFFER, this.Y), i.renderbufferStorage(i.RENDERBUFFER, i.DEPTH_COMPONENT24, this.H, this.G), i.bindRenderbuffer(i.RENDERBUFFER, null));
  }
  readPixels(t) {
    const e = this.W.get(t);
    if (e) return e;
    const i = this.A, r = this.H, s = this.G, h = new Uint8Array(r * s * 4), o = i.getParameter(i.READ_FRAMEBUFFER_BINDING);
    i.bindFramebuffer(i.READ_FRAMEBUFFER, this.N), i.readBuffer(i.COLOR_ATTACHMENT0 + t), i.readPixels(0, 0, r, s, i.RGBA, i.UNSIGNED_BYTE, h), i.bindFramebuffer(i.READ_FRAMEBUFFER, o);
    const c = 4 * r, l = new Uint8Array(h.length);
    for (let u = 0; u < s; u++) {
      const f = (s - 1 - u) * c, g = u * c;
      l.set(h.subarray(f, f + c), g);
    }
    return this.W.set(t, l), l;
  }
  begin() {
    const t = this.A;
    this.W.clear(), this.j.et(), this.j.it(this.N, this.H, this.G), this.l.depth && t.clear(t.DEPTH_BUFFER_BIT), this.j.state.rt();
  }
  end() {
    this.j.state.nt(), this.j.ot();
    const t = this.j.ht();
    this.j.it(t.framebuffer, t.viewport[2], t.viewport[3]);
  }
  ct() {
    return this.Z || this.lt(), this.Z;
  }
  lt() {
    if (!this.j) return;
    const t = { Uc: this.X[0], Ud: this.X[1], Ue: this.X[2], Uf: [this.H, this.G] }, e = G.q;
    this.Z = this.j.ft.ut(e, t, !0);
  }
  L() {
    const t = this.A;
    t.deleteFramebuffer(this.N);
    for (const e of this.X) t.deleteTexture(e);
    this.Y && t.deleteRenderbuffer(this.Y);
  }
  get width() {
    return this.H;
  }
  get height() {
    return this.G;
  }
  get textures() {
    return this.X;
  }
  get attachmentCount() {
    return this.K;
  }
};
a(G, "q", null);
let it = G;
const Rt = /* @__PURE__ */ new WeakMap();
function ot(n, t) {
  Rt.set(n, t);
}
function Ft(n) {
  return Rt.get(n);
}
function X(n, t, e, i, r = 255) {
  n[0] = t / 255, n[1] = (e ?? t) / 255, n[2] = (i ?? t) / 255, n[3] = r / 255;
}
class nt {
  constructor() {
    a(this, "dt", 1);
    a(this, "vt", 0);
    a(this, "gt", 0);
    a(this, "_t", 0);
    a(this, "At", 0);
    a(this, "yt", 0);
    a(this, "wt", 0);
    a(this, "bt", [0, 0, 0]);
    a(this, "Ct", [1, 1, 1, 1]);
    a(this, "Mt", [0, 0, 0, 1]);
    a(this, "xt", !1);
    a(this, "Ft", !1);
    a(this, "Tt", !1);
    a(this, "Pt", 0);
    a(this, "Et", [0, 0, 0, 1]);
    a(this, "Rt", !1);
    a(this, "St", []);
    a(this, "$t", []);
  }
  static kt() {
    return { zt: 1, It: 0, Ot: 0, Dt: 0, At: 0, yt: 0, wt: 0, Pt: 0, Lt: !1, Bt: !1, Tt: !1, Rt: !1, Ht: [0, 0, 0], Gt: [1, 1, 1, 1], Nt: [0, 0, 0, 1] };
  }
  Xt(t) {
    t.zt = this.dt, t.It = this.vt, t.Ot = this.gt, t.Dt = this._t, t.At = this.At, t.yt = this.yt, t.wt = this.wt, t.Lt = this.xt, t.Bt = this.Ft, t.Tt = this.Tt, t.Pt = this.Pt, t.Rt = this.Rt, t.Ht[0] = this.bt[0], t.Ht[1] = this.bt[1], t.Ht[2] = this.bt[2], t.Gt[0] = this.Ct[0], t.Gt[1] = this.Ct[1], t.Gt[2] = this.Ct[2], t.Gt[3] = this.Ct[3], t.Nt[0] = this.Mt[0], t.Nt[1] = this.Mt[1], t.Nt[2] = this.Mt[2], t.Nt[3] = this.Mt[3];
  }
  Yt(t) {
    this.dt = t.zt, this.vt = t.It, this.gt = t.Ot, this._t = t.Dt, this.At = t.At, this.yt = t.yt, this.wt = t.wt, this.xt = t.Lt, this.Ft = t.Bt, this.Tt = t.Tt, this.Pt = t.Pt, this.Rt = t.Rt, this.bt[0] = t.Ht[0], this.bt[1] = t.Ht[1], this.bt[2] = t.Ht[2], this.Ct[0] = t.Gt[0], this.Ct[1] = t.Gt[1], this.Ct[2] = t.Gt[2], this.Ct[3] = t.Gt[3], this.Mt[0] = t.Nt[0], this.Mt[1] = t.Nt[1], this.Mt[2] = t.Nt[2], this.Mt[3] = t.Nt[3];
  }
  rt() {
    let t = this.$t.pop();
    t || (t = nt.kt()), this.Xt(t), this.St.push(t);
  }
  nt() {
    const t = this.St.pop();
    t ? (this.Yt(t), this.$t.push(t)) : console.warn("pop() called without matching push()");
  }
  Kt(t) {
    this.Xt(t);
  }
  jt(t) {
    this.dt = Math.abs(t);
  }
  Zt() {
    this.vt = 0, this.gt = 0, this._t = 0, this.At = 0, this.yt = 0, this.wt = 0, this.Rt = !1;
  }
  Wt(t) {
    t !== 0 && (this.At += t * Math.PI / 180);
  }
  qt(t) {
    t !== 0 && (this.yt += t * Math.PI / 180);
  }
  Vt(t) {
    t !== 0 && (this.wt += t * Math.PI / 180);
  }
  Qt(t = 0, e = 0, i = 0) {
    t === 0 && e === 0 && i === 0 || (this.vt += t, this.gt += e, this._t += i);
  }
  Jt(t) {
    this.Qt(t, 0, 0);
  }
  ts(t) {
    this.Qt(0, t, 0);
  }
  ss(t) {
    this.Qt(0, 0, t);
  }
  es(t) {
    this.bt[0] = t[0], this.bt[1] = t[1], this.bt[2] = t[2];
  }
  rs(t, e, i, r = 255) {
    X(this.Ct, t, e, i, r);
  }
  ns(t, e, i, r = 255) {
    X(this.Mt, t, e, i, r);
  }
  hs(t) {
    this.xt = t;
  }
  cs(t) {
    this.Ft = t;
  }
  ls(t) {
    this.Tt = t;
  }
  us(t) {
    this.Pt = bt(t);
  }
  fs(t, e, i, r) {
    X(this.Et, t, e, i, r);
  }
  ds(t) {
    this.Rt = t;
  }
  get canvasBackgroundColor() {
    return this.Et;
  }
  get useOrtho() {
    return this.Rt;
  }
  get rotationX() {
    return this.At;
  }
  get rotationY() {
    return this.yt;
  }
  get rotationZ() {
    return this.wt;
  }
}
const dt = new Float32Array([-0.5, -0.5, 0, 0, 0.5, -0.5, 1, 0, -0.5, 0.5, 0, 1, -0.5, 0.5, 0, 1, 0.5, -0.5, 1, 0, 0.5, 0.5, 1, 1]), H = { ps: 16, vs: WebGL2RenderingContext.TRIANGLES, gs: { _s: { size: 2, offset: 0 }, As: { size: 2, offset: 8 } } };
class Ht {
  constructor(t) {
    a(this, "A");
    a(this, "ws");
    a(this, "bs");
    this.A = t, this.ws = t.createBuffer(), this.bs = new Float32Array(dt.length);
  }
  Cs(t, e, i, r) {
    const s = this.A, h = Ft(this.A), o = h[2], c = h[3], l = t / o * 2 - 1, u = (t + i) / o * 2 - 1, f = 1 - (e + r) / c * 2, g = 1 - e / c * 2, p = dt, A = this.bs;
    for (let d = 0; d < p.length; d += 4) {
      const v = p[d], m = p[d + 1], E = p[d + 2], y = p[d + 3], T = l + (v + 0.5) * (u - l), w = f + (m + 0.5) * (g - f);
      A[d] = T, A[d + 1] = w, A[d + 2] = E, A[d + 3] = y;
    }
    s.bindBuffer(s.ARRAY_BUFFER, this.ws), s.bufferData(s.ARRAY_BUFFER, A, s.DYNAMIC_DRAW), s.enableVertexAttribArray(0), s.vertexAttribPointer(0, 2, s.FLOAT, !1, 16, 0), s.drawArrays(s.TRIANGLES, 0, 6), s.disableVertexAttribArray(0), s.bindBuffer(s.ARRAY_BUFFER, null);
  }
  L() {
    this.A.deleteBuffer(this.ws);
  }
}
var b = ((n) => (n.RECTANGLE = "rectangle", n.LINE = "line", n.ELLIPSE = "ellipse", n.ARC = "arc", n.TRIANGLE = "triangle", n.BEZIER_CURVE = "bezier_curve", n))(b || {});
const _t = { rectangle: 2, line: 2, ellipse: 2, triangle: 2, arc: 3, bezier_curve: 4 };
class Wt {
  constructor(t) {
    a(this, "A");
    a(this, "Ms", /* @__PURE__ */ new Map());
    this.A = t;
  }
  Fs(t, e, i, r) {
    const s = this.A;
    let h = this.Ms.get(t);
    h || (h = /* @__PURE__ */ new Map(), this.Ms.set(t, h));
    let o = h.get(e) || null;
    if (!o) {
      o = s.createVertexArray(), h.set(e, o), s.bindVertexArray(o), s.bindBuffer(s.ARRAY_BUFFER, r);
      const c = s.getAttribLocation(t, "A0");
      c !== -1 && ft(s, c, i.gs._s.size, i.ps, i.gs._s.offset, 0, s.FLOAT, !1);
      const l = s.getAttribLocation(t, "A1");
      l !== -1 && ft(s, l, i.gs.As.size, i.ps, i.gs.As.offset, 0, s.FLOAT, !1);
    }
    s.bindVertexArray(o);
  }
  Ts() {
    this.A.bindVertexArray(null);
  }
  L() {
    for (const [, t] of this.Ms) for (const [, e] of t) e && this.A.deleteVertexArray(e);
  }
}
const I = class I {
  static Ps(t, e, i = 0) {
    const r = e || new Float32Array(I.FLOATS_PER_INSTANCE);
    let s = i;
    r[s++] = t._s[0], r[s++] = t._s[1], r[s++] = t.Es[0], r[s++] = t.Es[1], r[s++] = t.Ht[0], r[s++] = t.Ht[1], r[s++] = t.Ht[2], r[s++] = t.Gt[0], r[s++] = t.Gt[1], r[s++] = t.Gt[2], r[s++] = t.Gt[3], r[s++] = t.Nt[0], r[s++] = t.Nt[1], r[s++] = t.Nt[2], r[s++] = t.Nt[3], r[s++] = t.Rs[0], r[s++] = t.Rs[1], r[s++] = t.Rs[2], r[s++] = t.Pt;
    const h = t.Ss;
    r[s++] = (h == null ? void 0 : h[0]) ?? 0, r[s++] = (h == null ? void 0 : h[1]) ?? 0, r[s++] = (h == null ? void 0 : h[2]) ?? 0;
    const o = t.$s;
    r[s++] = (o == null ? void 0 : o[0]) ?? 0, r[s++] = (o == null ? void 0 : o[1]) ?? 0, r[s++] = (o == null ? void 0 : o[2]) ?? 0;
    const c = t.ks, l = t.zs, u = t.Is, f = t.Os, g = t.Ds, p = !(!l || !u);
    return p ? (r[s++] = (f == null ? void 0 : f[0]) ?? 0, r[s++] = (f == null ? void 0 : f[1]) ?? 0, r[s++] = (g == null ? void 0 : g[0]) ?? 0, r[s++] = (g == null ? void 0 : g[1]) ?? 0, r[s++] = l[0], r[s++] = l[1], r[s++] = u[0], r[s++] = u[1]) : !p && !!c ? (r[s++] = c[0], r[s++] = c[1], r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0) : (r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0), r[s++] = t.Ls ?? 0, r[s++] = t.Bs ?? 0, r[s++] = t.Hs ?? 0, r;
  }
  static Gs(t, e) {
    const i = t.length * I.FLOATS_PER_INSTANCE, r = e || new Float32Array(i);
    for (let s = 0; s < t.length; s++) {
      const h = s * I.FLOATS_PER_INSTANCE;
      I.Ps(t[s], r, h);
    }
    return r;
  }
};
a(I, "BYTES_PER_INSTANCE", 144), a(I, "FLOATS_PER_INSTANCE", 36);
let N = I;
const P = class P {
};
a(P, "STRIDE", N.BYTES_PER_INSTANCE), a(P, "ATTRIBUTES", { A2: { location: -1, size: 2, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: P.STRIDE, offset: 0, divisor: 1 }, A3: { location: -1, size: 2, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: P.STRIDE, offset: 8, divisor: 1 }, A4: { location: -1, size: 3, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: P.STRIDE, offset: 16, divisor: 1 }, A5: { location: -1, size: 4, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: P.STRIDE, offset: 28, divisor: 1 }, A6: { location: -1, size: 4, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: P.STRIDE, offset: 44, divisor: 1 }, A7: { location: -1, size: 4, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: P.STRIDE, offset: 60, divisor: 1 }, A8: { location: -1, size: 3, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: P.STRIDE, offset: 76, divisor: 1 }, A9: { location: -1, size: 3, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: P.STRIDE, offset: 88, divisor: 1 }, Aa: { location: -1, size: 4, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: P.STRIDE, offset: 100, divisor: 1 }, Ab: { location: -1, size: 4, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: P.STRIDE, offset: 116, divisor: 1 }, Ac: { location: -1, size: 3, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: P.STRIDE, offset: 132, divisor: 1 } });
let K = P;
class kt {
  constructor(t = 1e3, e = 1.5) {
    a(this, "Ns");
    a(this, "Xs");
    a(this, "Ys");
    a(this, "Ks", 0);
    a(this, "js", 0);
    this.Xs = t, this.Ys = e;
    const i = t * N.FLOATS_PER_INSTANCE;
    this.Ns = new Float32Array(i);
  }
  ensureCapacity(t) {
    if (t <= this.Xs) return;
    const e = Math.ceil(t * this.Ys), i = this.Xs;
    this.Xs = e;
    const r = e * N.FLOATS_PER_INSTANCE, s = new Float32Array(r), h = i * N.FLOATS_PER_INSTANCE;
    s.set(this.Ns.subarray(0, Math.min(h, this.Ks))), this.Ns = s;
  }
  getWritePointer() {
    return { buffer: this.Ns, offset: this.Ks };
  }
  commitWrite(t) {
    this.Ks += t, this.js++;
  }
  reset() {
    this.Ks = 0, this.js = 0;
  }
  subarray(t = 0, e) {
    return this.Ns.subarray(t, e ?? this.Ks);
  }
  get instanceCount() {
    return this.js;
  }
  get capacity() {
    return this.Xs;
  }
  get writeIndex() {
    return this.Ks;
  }
  get isEmpty() {
    return this.js === 0;
  }
}
class Zt {
  constructor(t) {
    a(this, "Ns");
    this.Ns = t;
  }
  writeInstance(t) {
    this.Ns.ensureCapacity(this.Ns.instanceCount + 1);
    const { buffer: e, offset: i } = this.Ns.getWritePointer();
    e[i + 0] = t.x, e[i + 1] = t.y, e[i + 2] = t.width, e[i + 3] = t.height, e[i + 4] = t.char0, e[i + 5] = t.char1, e[i + 6] = t.char2, e[i + 7] = t.r1, e[i + 8] = t.g1, e[i + 9] = t.b1, e[i + 10] = t.a1, e[i + 11] = t.r2, e[i + 12] = t.g2, e[i + 13] = t.b2, e[i + 14] = t.a2, e[i + 15] = t.invert, e[i + 16] = t.flipX, e[i + 17] = t.flipY, e[i + 18] = t.charRot, e[i + 19] = t.translationX, e[i + 20] = t.translationY, e[i + 21] = t.translationZ, e[i + 22] = t.rotationX, e[i + 23] = t.rotationY, e[i + 24] = t.rotationZ;
    const r = t.curveParams0, s = t.curveParams1;
    return e[i + 25] = r[0], e[i + 26] = r[1], e[i + 27] = r[2], e[i + 28] = r[3], e[i + 29] = s[0], e[i + 30] = s[1], e[i + 31] = s[2], e[i + 32] = s[3], e[i + 33] = t.depth, e[i + 34] = t.baseZ, e[i + 35] = t.geometryType, this.Ns.commitWrite(N.FLOATS_PER_INSTANCE), this.Ns.instanceCount - 1;
  }
  get instanceCount() {
    return this.Ns.instanceCount;
  }
}
class Kt {
  constructor(t, e = 1e3) {
    a(this, "A");
    a(this, "Zs", null);
    a(this, "Ws", 0);
    a(this, "qs", /* @__PURE__ */ new Map());
    this.A = t, this.Vs(e);
  }
  Vs(t) {
    const e = this.A;
    this.Zs && e.deleteBuffer(this.Zs), this.Zs = e.createBuffer();
    const i = t * N.BYTES_PER_INSTANCE;
    Ct(e, e.ARRAY_BUFFER, this.Zs, i, e.DYNAMIC_DRAW), this.Ws = t;
  }
  recreateBuffer(t) {
    this.Vs(t);
  }
  get capacity() {
    return this.Ws;
  }
  upload(t, e) {
    if (e === 0) return;
    const i = this.A;
    i.bindBuffer(i.ARRAY_BUFFER, this.Zs);
    const r = e * N.FLOATS_PER_INSTANCE;
    i.bufferSubData(i.ARRAY_BUFFER, 0, t, 0, r);
  }
  Qs(t) {
    let e = this.qs.get(t);
    if (!e) {
      e = /* @__PURE__ */ new Map();
      const i = this.A;
      for (const r in K.ATTRIBUTES) {
        const s = i.getAttribLocation(t, r);
        s !== -1 && e.set(r, s);
      }
      this.qs.set(t, e);
    }
    return e;
  }
  bindAttributes(t) {
    const e = this.A, i = t.D, r = this.Qs(i);
    for (const [s, h] of r) {
      const o = K.ATTRIBUTES[s];
      o && ft(e, h, o.size, o.stride, o.offset, o.divisor, o.type, o.normalized);
    }
  }
  unbindAttributes(t) {
    const e = this.A, i = this.Qs(t.D);
    for (const [r, s] of i)
      K.ATTRIBUTES[r] && (e.disableVertexAttribArray(s), e.vertexAttribDivisor(s, 0));
  }
  dispose() {
    this.Zs && (this.A.deleteBuffer(this.Zs), this.Zs = null), this.qs.clear();
  }
}
class Vt {
  constructor(t, e = 1e3, i = 1.5) {
    a(this, "A");
    a(this, "Ns");
    a(this, "Js");
    a(this, "te");
    this.A = t, this.Ns = new kt(e, i), this.Js = new Zt(this.Ns), this.te = new Kt(t, e);
  }
  se(t) {
    var r, s, h, o, c, l, u, f, g, p;
    const e = [0, 0, 0, 0], i = [0, 0, 0, 0];
    return t.zs && t.Is ? (e[0] = ((r = t.Os) == null ? void 0 : r[0]) ?? 0, e[1] = ((s = t.Os) == null ? void 0 : s[1]) ?? 0, e[2] = ((h = t.Ds) == null ? void 0 : h[0]) ?? 0, e[3] = ((o = t.Ds) == null ? void 0 : o[1]) ?? 0, i[0] = t.zs[0], i[1] = t.zs[1], i[2] = t.Is[0], i[3] = t.Is[1]) : t.ks && (e[0] = t.ks[0], e[1] = t.ks[1]), this.ee({ x: t._s[0], y: t._s[1], width: t.Es[0], height: t.Es[1], char0: t.Ht[0], char1: t.Ht[1], char2: t.Ht[2], r1: t.Gt[0], g1: t.Gt[1], b1: t.Gt[2], a1: t.Gt[3], r2: t.Nt[0], g2: t.Nt[1], b2: t.Nt[2], a2: t.Nt[3], invert: t.Rs[0], flipX: t.Rs[1], flipY: t.Rs[2], charRot: t.Pt, translationX: ((c = t.Ss) == null ? void 0 : c[0]) ?? 0, translationY: ((l = t.Ss) == null ? void 0 : l[1]) ?? 0, translationZ: ((u = t.Ss) == null ? void 0 : u[2]) ?? 0, rotationX: ((f = t.$s) == null ? void 0 : f[0]) ?? 0, rotationY: ((g = t.$s) == null ? void 0 : g[1]) ?? 0, rotationZ: ((p = t.$s) == null ? void 0 : p[2]) ?? 0, curveParams0: e, curveParams1: i, depth: t.Ls || 0, baseZ: t.Bs || 0, geometryType: t.Hs || 0 });
  }
  ee(t) {
    const e = this.Js.writeInstance(t);
    return this.Ns.capacity > this.te.capacity && this.te.recreateBuffer(this.Ns.capacity), e;
  }
  get count() {
    return this.Ns.instanceCount;
  }
  get isEmpty() {
    return this.Ns.isEmpty;
  }
  clear() {
    this.Ns.reset();
  }
  ie(t) {
    const e = this.Ns.instanceCount;
    if (e === 0) return;
    const i = this.Ns.subarray();
    this.te.upload(i, e), this.te.bindAttributes(t);
  }
  re(t) {
    this.te.unbindAttributes(t);
  }
  Cs(t, e) {
    const i = this.Ns.instanceCount;
    i !== 0 && this.A.drawArraysInstanced(t, 0, e, i);
  }
  L() {
    this.te.dispose();
  }
}
class O {
  constructor(t, e, i, r) {
    a(this, "A");
    a(this, "ne");
    a(this, "oe");
    a(this, "he");
    a(this, "ae", null);
    this.A = t, this.ne = e, this.oe = i, this.he = r;
    const s = this.A.createBuffer();
    Ct(this.A, this.A.ARRAY_BUFFER, s, this.he.ce, this.A.STATIC_DRAW), this.ae = s;
  }
  get type() {
    return this.oe;
  }
  get unitGeometry() {
    return this.he;
  }
  get unitBuffer() {
    return this.ae;
  }
  get batch() {
    return this.ne;
  }
  le() {
    this.ne.clear();
  }
  ue() {
    return !this.ne.isEmpty;
  }
  L() {
    this.ne.L(), this.A.deleteBuffer(this.ae);
  }
  fe(t, e, i) {
    return this.ne.se(t);
  }
  de(t, e, i, r, s, h) {
    const o = s.It ?? 0, c = s.Ot ?? 0, l = s.Dt ?? 0, u = s.At ?? 0, f = s.yt ?? 0, g = s.wt ?? 0, p = [0, 0, 0, 0], A = [0, 0, 0, 0];
    h && (h.bezStartX !== void 0 && h.bezStartY !== void 0 && h.bezEndX !== void 0 && h.bezEndY !== void 0 ? (p[0] = h.cp1x ?? 0, p[1] = h.cp1y ?? 0, p[2] = h.cp2x ?? 0, p[3] = h.cp2y ?? 0, A[0] = h.bezStartX ?? 0, A[1] = h.bezStartY ?? 0, A[2] = h.bezEndX ?? 0, A[3] = h.bezEndY ?? 0) : h.arcStart === void 0 && h.arcStop === void 0 || (p[0] = h.arcStart ?? 0, p[1] = h.arcStop ?? 0));
    const d = { x: t, y: e, width: i, height: r, char0: s.Ht[0], char1: s.Ht[1], char2: s.Ht[2], r1: s.Gt[0], g1: s.Gt[1], b1: s.Gt[2], a1: s.Gt[3], r2: s.Nt[0], g2: s.Nt[1], b2: s.Nt[2], a2: s.Nt[3], invert: s.Tt ? 1 : 0, flipX: s.Lt ? 1 : 0, flipY: s.Bt ? 1 : 0, charRot: s.Pt, translationX: o, translationY: c, translationZ: l, rotationX: u, rotationY: f, rotationZ: g, curveParams0: p, curveParams1: A, depth: (h == null ? void 0 : h.depth) ?? 0, baseZ: (h == null ? void 0 : h.baseZ) ?? 0, geometryType: _t[this.oe] ?? 0 };
    return this.ne.ee(d);
  }
}
const qt = { ce: dt, pe: 6, ...H }, Qt = { ce: new Float32Array([0, -0.5, 0, 0, 1, -0.5, 1, 0, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 1, -0.5, 1, 0, 1, 0.5, 1, 1]), pe: 6, ...H }, Jt = { ce: function(n = 32) {
  const t = [], e = 2 * Math.PI / n;
  for (let i = 0; i < n; i++) {
    const r = i * e, s = (i + 1) % n * e, h = Math.cos(r), o = Math.sin(r), c = 0.5 * (h + 1), l = 0.5 * (o + 1), u = Math.cos(s), f = Math.sin(s), g = 0.5 * (u + 1), p = 0.5 * (f + 1);
    t.push(0, 0, 0.5, 0.5, h, o, c, l, u, f, g, p);
  }
  return new Float32Array(t);
}(32), pe: 96, ...H };
let $t = { ce: function(n) {
  const t = [];
  for (let e = 0; e < n; e++) {
    const i = e / n, r = (e + 1) / n;
    t.push(i, 0, i, 0, i, 1, i, 1, r, 1, r, 1);
  }
  return new Float32Array(t);
}(32), pe: 96, ...H };
const te = { ce: new Float32Array([0, 0, 0, 0, 1, 0, 1, 0, 0.5, 1, 0.5, 1]), pe: 3, ...H }, ee = { ce: function(n = 16) {
  const t = [];
  for (let e = 0; e < n; e++) {
    const i = e / n, r = (e + 1) / n;
    t.push(i, -0.5, i, 0, r, -0.5, r, 0, i, 0.5, i, 1, i, 0.5, i, 1, r, -0.5, r, 0, r, 0.5, r, 1);
  }
  return new Float32Array(t);
}(16), pe: 96, ...H }, ie = { [b.RECTANGLE]: class extends O {
  constructor(n, t) {
    super(n, t, b.RECTANGLE, qt);
  }
  se(n, t) {
    return this.de(0, 0, n.width, n.height, t);
  }
}, [b.LINE]: class extends O {
  constructor(n, t) {
    super(n, t, b.LINE, Qt);
  }
  se(n, t) {
    const e = n.x2 - n.x1, i = n.y2 - n.y1, r = Math.hypot(e, i), s = Math.atan2(i, e), h = t.zt || 1, o = n.x1 + e / 2 - r / 2, c = n.y1 + i / 2, l = { ...t, wt: (t.wt || 0) + s };
    return this.de(o, c, r, h, l);
  }
}, [b.ELLIPSE]: class extends O {
  constructor(n, t) {
    super(n, t, b.ELLIPSE, Jt);
  }
  se(n, t) {
    return this.de(0, 0, n.width, n.height, t);
  }
}, [b.ARC]: class extends O {
  constructor(n, t) {
    super(n, t, b.ARC, $t);
  }
  se(n, t) {
    const e = n.start * Math.PI / 180, i = n.stop * Math.PI / 180;
    return this.de(0, 0, n.width, n.height, t, { arcStart: e, arcStop: i });
  }
}, [b.TRIANGLE]: class extends O {
  constructor(n, t) {
    super(n, t, b.TRIANGLE, te);
  }
  se(n, t) {
    const e = Math.min(n.x1, n.x2, n.x3), i = Math.max(n.x1, n.x2, n.x3), r = Math.min(n.y1, n.y2, n.y3), s = i - e, h = Math.max(n.y1, n.y2, n.y3) - r;
    return this.de(e, r, s, h, t);
  }
}, [b.BEZIER_CURVE]: class extends O {
  constructor(n, t) {
    super(n, t, b.BEZIER_CURVE, ee);
  }
  se(n, t) {
    return this.de(0, 0, 1, t.zt || 1, t, { cp1x: n.cp1x, cp1y: n.cp1y, cp2x: n.cp2x, cp2y: n.cp2y, bezStartX: n.x1, bezStartY: n.y1, bezEndX: n.x2, bezEndY: n.y2 });
  }
} };
class se {
  constructor(t) {
    a(this, "A");
    a(this, "ve");
    a(this, "ge");
    this.A = t, this.ge = new Wt(t), this.ve = /* @__PURE__ */ new Map();
    for (const e of Object.values(b)) {
      const i = new Vt(t), r = new ie[e](t, i);
      this.ve.set(e, r);
    }
  }
  me(t) {
    const e = this._e(t);
    for (const i of e) this.Ae(i);
  }
  _e(t) {
    const e = [];
    let i = null, r = null, s = null;
    for (const h of t) r !== h.material || s !== h.type ? (i && i.length > 0 && e.push({ material: r, type: s, commands: i }), i = [h], r = h.material, s = h.type) : i.push(h);
    return i && i.length > 0 && e.push({ material: r, type: s, commands: i }), e;
  }
  Ae(t) {
    const { material: e, type: i, commands: r } = t, s = this.ve.get(i);
    e.shader.$(), e.shader.I(e.uniforms);
    const h = Ft(this.A), o = r.length > 0 && r[0].state.Rt;
    e.shader.I({ Us: h[2] / h[3], Ut: [h[2], h[3]], Uu: 1, Uv: o ? 1 : 0 }), s.le();
    for (const c of r) s.se(c.params, c.state);
    if (s.ue()) {
      const c = s.unitGeometry, l = s.unitBuffer;
      try {
        this.ge.Fs(e.shader.D, i + "", c, l), s.batch.ie(e.shader), s.batch.Cs(c.vs, c.pe);
      } finally {
        s.batch.re(e.shader), this.ge.Ts(), s.le();
      }
    }
  }
  L() {
    for (const t of this.ve.values()) t.L();
    this.ve.clear(), this.ge.L();
  }
}
function Mt(n) {
  let t = 0;
  for (let e = 0; e < n.length; e++)
    t = (t << 5) - t + n.charCodeAt(e), t &= t;
  return t;
}
function yt(n) {
  return Mt(n + "");
}
function W(n, t) {
  return (n << 5) - n + t;
}
class re {
  constructor(t) {
    a(this, "A");
    a(this, "ye", 0);
    a(this, "we");
    a(this, "be");
    a(this, "Ce", /* @__PURE__ */ new Map());
    this.A = t, this.we = new q(t, rt, `#version 300 es
precision highp float;in vec3 v_glyphIndex;in vec4 v_glyphColor;in vec4 v_cellColor;in vec4 v_glyphFlags;layout(location=0)out vec4 o_character;layout(location=1)out vec4 o_primaryColor;layout(location=2)out vec4 o_secondaryColor;void main(){int A=int(v_glyphFlags.r>0.5?1:0);int B=int(v_glyphFlags.g>0.5?1:0);int C=int(v_glyphFlags.b>0.5?1:0);float D=float(A|(B<<1)|(C<<2))/255.;o_character=vec4(v_glyphIndex.xy,D,clamp(v_glyphFlags.a,0.,1.));o_primaryColor=vec4(v_glyphColor.rgb,v_glyphColor.a);o_secondaryColor=vec4(v_cellColor.rgb,v_cellColor.a);}`), this.be = { id: this.ye++, shader: this.we, uniforms: Object.freeze({}), hash: this.Me(this.we, {}), isBuiltIn: !0 };
  }
  get xe() {
    return this.be;
  }
  ut(t, e = {}, i = !1) {
    const r = this.Me(t, e), s = this.Ce.get(r);
    if (s) return s;
    const h = { id: this.ye++, shader: t, uniforms: Object.freeze({ ...e }), hash: r, isBuiltIn: i };
    return this.Ce.set(r, h), h;
  }
  Fe(t, e = {}) {
    return { id: this.ye++, shader: t, uniforms: Object.freeze({ ...e }), hash: 0, isBuiltIn: !1 };
  }
  Me(t, e) {
    const i = yt(t.D), r = function(s, h) {
      let o = 0;
      const c = Object.keys(s).sort();
      for (const l of c) o = W(o, Mt(l)), o = W(o, h(s[l]));
      return o;
    }(e, this.Te.bind(this));
    return W(i, r);
  }
  Te(t) {
    return typeof t == "number" || typeof t == "boolean" ? function(e) {
      return typeof e == "boolean" ? e ? 1 : 0 : Math.floor(e);
    }(t) : Array.isArray(t) ? function(e) {
      let i = 0;
      const r = Array.isArray(e[0]) ? e.flat() : e;
      for (const s of r) i = W(i, typeof s == "number" ? s : 0);
      return i;
    }(t) : t instanceof Float32Array || t instanceof Int32Array ? function(e) {
      let i = 0;
      const r = Math.min(e.length, 16);
      for (let s = 0; s < r; s++) i = W(i, e[s]);
      return i;
    }(t) : t instanceof WebGLTexture ? yt(t) : 0;
  }
  L() {
    this.we != this.we && this.we.L(), this.we.L(), this.Ce.clear();
  }
}
class ne {
  constructor() {
    a(this, "Pe", []);
    a(this, "Ee", 1);
    a(this, "Es", 0);
  }
  Re(t, e) {
    if (this.Es >= this.Pe.length) {
      const r = { id: this.Ee++, type: t, params: {}, state: nt.kt(), material: e };
      this.Pe.push(r);
    }
    const i = this.Pe[this.Es];
    return i.id = this.Ee++, i.type = t, i.material = e, this.Es++, i;
  }
  Se(t, e, i) {
    const r = this.Re(b.RECTANGLE, i), s = r.params;
    return s.width = t.width, s.height = t.height, e.Kt(r.state), r.id;
  }
  $e(t, e, i) {
    const r = this.Re(b.LINE, i), s = r.params;
    return s.x1 = t.x1, s.y1 = t.y1, s.x2 = t.x2, s.y2 = t.y2, s.thickness = t.thickness, e.Kt(r.state), r.id;
  }
  ke(t, e, i) {
    const r = this.Re(b.ELLIPSE, i), s = r.params;
    return s.width = t.width, s.height = t.height, s.startAngle = t.startAngle, s.endAngle = t.endAngle, s.segments = t.segments, e.Kt(r.state), r.id;
  }
  ze(t, e, i) {
    const r = this.Re(b.ARC, i), s = r.params;
    return s.width = t.width, s.height = t.height, s.start = t.start, s.stop = t.stop, e.Kt(r.state), r.id;
  }
  Ie(t, e, i) {
    const r = this.Re(b.TRIANGLE, i), s = r.params;
    return s.x1 = t.x1, s.y1 = t.y1, s.x2 = t.x2, s.y2 = t.y2, s.x3 = t.x3, s.y3 = t.y3, e.Kt(r.state), r.id;
  }
  Oe(t, e, i) {
    const r = this.Re(b.BEZIER_CURVE, i), s = r.params;
    return s.x1 = t.x1, s.y1 = t.y1, s.cp1x = t.cp1x, s.cp1y = t.cp1y, s.cp2x = t.cp2x, s.cp2y = t.cp2y, s.x2 = t.x2, s.y2 = t.y2, s.thickness = t.thickness, s.segments = t.segments, e.Kt(r.state), r.id;
  }
  De() {
    this.Es = 0;
  }
  [Symbol.iterator]() {
    let t = 0;
    const e = this.Es, i = this.Pe;
    return { next: () => t < e ? { value: i[t++], done: !1 } : { value: void 0, done: !0 } };
  }
}
class he {
  constructor(t) {
    a(this, "A");
    a(this, "Le", null);
    a(this, "Be");
    a(this, "ft");
    a(this, "He");
    a(this, "Ge");
    a(this, "Ne");
    a(this, "Xe", null);
    a(this, "Ye", {});
    a(this, "Ke", []);
    a(this, "je", []);
    a(this, "Ze", null);
    a(this, "We", [0, 0, 0, 0]);
    this.A = t, t.enable(t.DEPTH_TEST), t.depthFunc(t.LEQUAL), t.clearDepth(1), t.depthMask(!0), t.disable(t.CULL_FACE), this.He = new nt(), this.ft = new re(t), this.Ge = new ne(), this.Be = new se(t), this.Ne = new Ht(t);
    const e = [0, 0, t.canvas.width, t.canvas.height];
    ot(t, e), this.Ke.push(null), this.je.push(e), this.Ze = null, this.We = e;
  }
  et() {
    this.Ke.push(this.Ze), this.je.push([...this.We]);
  }
  ht() {
    return { framebuffer: this.Ke.pop() ?? null, viewport: this.je.pop() ?? [0, 0, this.A.canvas.width, this.A.canvas.height] };
  }
  it(t, e, i) {
    const r = this.A;
    this.Ze !== t && (r.bindFramebuffer(r.FRAMEBUFFER, t), this.Ze = t);
    const s = [0, 0, e, i];
    this.We[0] === s[0] && this.We[1] === s[1] && this.We[2] === s[2] && this.We[3] === s[3] || (r.viewport(...s), ot(r, s), this.We = s);
  }
  qe(t) {
    this.Le !== t && (this.Le = t, t.$());
  }
  Ve(t, e) {
    return new q(this.A, t, e);
  }
  Qe(t) {
    this.Xe = t, t && (this.Ye = {});
  }
  O(t, e) {
    this.Ye[t] = e;
  }
  Je(t) {
    Object.assign(this.Ye, t);
  }
  ti(t) {
    return new q(this.A, rt, t);
  }
  si(t, e, i) {
    this.Ge.Se({ width: e ?? t.width, height: i ?? t.height }, this.He, t.ct());
  }
  ei(t, e, i, r) {
    this.Ne.Cs(t, e, i, r);
  }
  ii(t, e) {
    if (this.Xe) {
      const i = this.ft.Fe(this.Xe, this.Ye);
      this.Ge.Se({ width: t, height: e }, this.He, i), this.Xe = null, this.Ye = {};
    } else this.Ge.Se({ width: t, height: e }, this.He, this.ft.xe);
  }
  ri(t, e, i, r) {
    this.Ge.$e({ x1: t, y1: e, x2: i, y2: r }, this.He, this.ft.xe);
  }
  ni(t, e) {
    this.Ge.ke({ width: t, height: e }, this.He, this.ft.xe);
  }
  oi(t, e, i, r, s, h) {
    this.Ge.Ie({ x1: t, y1: e, x2: i, y2: r, x3: s, y3: h }, this.He, this.ft.xe);
  }
  hi(t, e, i, r, s, h, o, c) {
    this.Ge.Oe({ x1: t, y1: e, cp1x: i, cp1y: r, cp2x: s, cp2y: h, x2: o, y2: c }, this.He, this.ft.xe);
  }
  ai(t, e, i, r) {
    this.Ge.ze({ width: t, height: e, start: i, stop: r }, this.He, this.ft.xe);
  }
  ci(t, e, i = 1, r = {}) {
    return new it(this.A, t, e, i, r, this);
  }
  li(t, e = t, i = t, r = 255) {
    this.He.fs(t, e ?? t, i ?? t, r);
    const [s, h, o, c] = this.He.canvasBackgroundColor;
    this.De(s, h, o, c);
  }
  De(t = 0, e = 0, i = 0, r = 0) {
    this.A.clearColor(t, e, i, r), this.A.clear(this.A.COLOR_BUFFER_BIT);
  }
  ui() {
    const t = [0, 0, this.A.canvas.width, this.A.canvas.height];
    this.A.viewport(...t), ot(this.A, t), this.We = t, this.je.length > 0 && (this.je[0] = t);
  }
  ot() {
    const t = this.Ge;
    this.Be.me(t), t.De();
  }
  L() {
    this.ft.L(), this.Be.L(), this.Ne.L();
  }
  get context() {
    return this.A;
  }
  get state() {
    return this.He;
  }
}
const R = { readShort: (n, t) => (R.t.uint16[0] = n[t] << 8 | n[t + 1], R.t.int16[0]), readUshort: (n, t) => n[t] << 8 | n[t + 1], readUshorts(n, t, e) {
  const i = [];
  for (let r = 0; r < e; r++) i.push(R.readUshort(n, t + 2 * r));
  return i;
}, readUint(n, t) {
  const e = R.t.uint8;
  return e[3] = n[t], e[2] = n[t + 1], e[1] = n[t + 2], e[0] = n[t + 3], R.t.uint32[0];
}, readASCII(n, t, e) {
  let i = "";
  for (let r = 0; r < e; r++) i += String.fromCharCode(n[t + r]);
  return i;
}, t: (() => {
  const n = new ArrayBuffer(8);
  return { uint8: new Uint8Array(n), int16: new Int16Array(n), uint16: new Uint16Array(n), uint32: new Uint32Array(n) };
})() };
function J(n) {
  return n + 3 & -4;
}
function $(n, t, e) {
  n[t] = e >>> 8 & 255, n[t + 1] = 255 & e;
}
function B(n, t, e) {
  n[t] = e >>> 24 & 255, n[t + 1] = e >>> 16 & 255, n[t + 2] = e >>> 8 & 255, n[t + 3] = 255 & e;
}
function oe(n, t, e) {
  for (let i = 0; i < e.length; i++) n[t + i] = 255 & e.charCodeAt(i);
}
function at(n, t, e) {
  const i = t + e;
  let r = 0;
  const s = R.t;
  for (let h = t; h < i; h += 4) s.uint8[3] = n[h] || 0, s.uint8[2] = n[h + 1] || 0, s.uint8[1] = n[h + 2] || 0, s.uint8[0] = n[h + 3] || 0, r = r + (s.uint32[0] >>> 0) >>> 0;
  return r >>> 0;
}
class ae {
  constructor(t) {
    a(this, "b");
    a(this, "p", 0);
    a(this, "bitbuf", 0);
    a(this, "bitcnt", 0);
    this.b = t;
  }
  readBits(t) {
    for (; this.bitcnt < t; ) {
      const i = this.b[this.p++] || 0;
      this.bitbuf |= i << this.bitcnt, this.bitcnt += 8;
    }
    const e = this.bitbuf & (1 << t) - 1;
    return this.bitbuf >>>= t, this.bitcnt -= t, e;
  }
  alignToByte() {
    this.bitbuf = 0, this.bitcnt = 0;
  }
  get offset() {
    return this.p;
  }
}
function k(n) {
  let t = 32, e = 0;
  for (const o of n) o && (o < t && (t = o), o > e && (e = o));
  if (e === 0) return { min: 0, max: 0, table: /* @__PURE__ */ new Map() };
  const i = new Uint32Array(e + 1);
  for (const o of n) o && i[o]++;
  const r = new Uint32Array(e + 1);
  let s = 0;
  i[0] = 0;
  for (let o = 1; o <= e; o++) s = s + i[o - 1] << 1, r[o] = s;
  const h = /* @__PURE__ */ new Map();
  for (let o = 0; o < n.length; o++) {
    const c = n[o];
    if (!c) continue;
    const l = r[c]++;
    let u = h.get(c);
    u || (u = [], h.set(c, u)), u[ce(l, c)] = o;
  }
  return { min: t, max: e, table: h };
}
function ct(n, t) {
  let e = 0;
  for (let i = 1; i <= t.max; i++) {
    e |= n.readBits(1) << i - 1;
    const r = t.table.get(i);
    if (r && e < r.length) {
      const s = r[e];
      if (s !== void 0) return s;
    }
  }
  throw Error("Invalid Huffman code");
}
function ce(n, t) {
  let e = 0;
  for (let i = 0; i < t; i++) e = e << 1 | 1 & n, n >>>= 1;
  return e >>> 0;
}
function le(n) {
  if (n.length < 2) throw Error("ZLIB data too short");
  const t = n[0], e = n[1];
  if ((15 & t) != 8) throw Error("Unsupported ZLIB compression method");
  if (((t << 8) + e) % 31 != 0) throw Error("Bad ZLIB header check");
  let i = 2;
  32 & e && (i += 4);
  const r = [];
  return function(s, h) {
    const o = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258], c = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], l = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577], u = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
    let f = 0;
    for (; !f; ) {
      f = s.readBits(1);
      const g = s.readBits(2);
      if (g === 0) {
        s.alignToByte();
        const p = s.readBits(16);
        if ((65535 & (65535 ^ p)) !== s.readBits(16)) throw Error("DEFLATE uncompressed LEN/NLEN mismatch");
        for (let A = 0; A < p; A++) h.push(s.readBits(8));
      } else {
        if (g !== 1 && g !== 2) throw Error("Unsupported DEFLATE type");
        {
          let p, A;
          if (g === 1) {
            const d = Array(288).fill(0);
            for (let v = 0; v <= 143; v++) d[v] = 8;
            for (let v = 144; v <= 255; v++) d[v] = 9;
            for (let v = 256; v <= 279; v++) d[v] = 7;
            for (let v = 280; v <= 287; v++) d[v] = 8;
            p = k(d), A = k(Array(32).fill(5));
          } else {
            const d = s.readBits(5) + 257, v = s.readBits(5) + 1, m = s.readBits(4) + 4, E = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], y = Array(19).fill(0);
            for (let C = 0; C < m; C++) y[E[C]] = s.readBits(3);
            const T = k(y), w = [];
            for (; w.length < d + v; ) {
              const C = ct(s, T);
              if (C <= 15) w.push(C);
              else if (C === 16) {
                const U = s.readBits(2) + 3, M = w[w.length - 1] || 0;
                for (let Q = 0; Q < U; Q++) w.push(M);
              } else if (C === 17) {
                const U = s.readBits(3) + 3;
                for (let M = 0; M < U; M++) w.push(0);
              } else {
                if (C !== 18) throw Error("Invalid code length symbol");
                {
                  const U = s.readBits(7) + 11;
                  for (let M = 0; M < U; M++) w.push(0);
                }
              }
            }
            const x = w.slice(0, d), S = w.slice(d, d + v);
            p = k(x), A = k(S);
          }
          for (; ; ) {
            const d = ct(s, p);
            if (d < 256) h.push(d);
            else {
              if (d === 256) break;
              if (d > 256 && d < 286) {
                const v = d - 257;
                let m = o[v];
                const E = c[v];
                E && (m += s.readBits(E));
                const y = ct(s, A);
                if (y >= 30) throw Error("Invalid distance symbol");
                let T = l[y];
                const w = u[y];
                w && (T += s.readBits(w));
                const x = h.length - T;
                if (x < 0) throw Error("Invalid distance");
                for (let S = 0; S < m; S++) h.push(h[x + S] || 0);
              } else if (d === 286 || d === 287) throw Error("Reserved length symbol");
            }
          }
        }
      }
    }
  }(new ae(n.subarray(i)), r), new Uint8Array(r);
}
function ue(n) {
  const t = R, e = new Uint8Array(n);
  if (t.readASCII(e, 0, 4) !== "wOFF") throw Error("Invalid WOFF signature");
  const i = t.readUint(e, 4), r = t.readUshort(e, 12), s = t.readUint(e, 16), h = [];
  let o = 44;
  for (let m = 0; m < r; m++) {
    const E = t.readASCII(e, o, 4), y = t.readUint(e, o + 4), T = t.readUint(e, o + 8), w = t.readUint(e, o + 12), x = t.readUint(e, o + 16);
    h.push({ tag: E, offset: y, compLength: T, origLength: w, checksum: x }), o += 20;
  }
  for (const m of h) {
    const E = new Uint8Array(e.buffer, m.offset, m.compLength);
    if (m.compLength === m.origLength) m.data = new Uint8Array(E);
    else if (m.data = le(E), m.data.length !== m.origLength) if (m.data.length < m.origLength) {
      const y = new Uint8Array(m.origLength);
      y.set(m.data), m.data = y;
    } else m.data = m.data.subarray(0, m.origLength);
  }
  const c = r;
  let l = 1, u = 0;
  for (; l << 1 <= c; ) l <<= 1, u++;
  const f = 16 * l, g = 16 * c - f;
  let p = 12 + 16 * c;
  const A = {};
  for (const m of h) A[m.tag] = p, p = J(p + m.data.length);
  const d = new Uint8Array(Math.max(s || 0, p));
  B(d, 0, i), $(d, 4, c), $(d, 6, f), $(d, 8, u), $(d, 10, g);
  let v = 12;
  for (const m of h) {
    oe(d, v, m.tag), v += 4;
    let E = m.data;
    if (m.tag === "head" && E.length >= 12) {
      const y = new Uint8Array(E);
      B(y, 8, 0), B(d, v, at(y, 0, J(y.length))), v += 4;
    } else
      B(d, v, at(E, 0, J(E.length))), v += 4;
    B(d, v, A[m.tag]), v += 4, B(d, v, m.data.length), v += 4;
  }
  for (const m of h) {
    const E = A[m.tag];
    d.set(m.data, E);
  }
  if (h.find((m) => m.tag === "head")) {
    const m = A.head, E = function(y, T) {
      const w = T + 8, x = [y[w], y[w + 1], y[w + 2], y[w + 3]];
      B(y, w, 0);
      const S = 2981146554 - (at(y, 0, J(y.length)) >>> 0) >>> 0;
      return y[w] = x[0], y[w + 1] = x[1], y[w + 2] = x[2], y[w + 3] = x[3], S >>> 0;
    }(d, m);
    B(d, m + 8, E);
  }
  return d.buffer;
}
const fe = { parseTab(n, t, e) {
  const i = { tables: [], ids: {}, off: t };
  n = new Uint8Array(n.buffer, t, e), t = 0;
  const r = R, s = r.readUshort, h = s(n, t += 2);
  t += 2;
  const o = [];
  for (let c = 0; c < h; c++) {
    const l = s(n, t), u = s(n, t += 2);
    t += 2;
    const f = r.readUint(n, t);
    t += 4;
    const g = `p${l}e${u}`;
    let p = o.indexOf(f);
    if (p === -1) {
      let A;
      p = i.tables.length, o.push(f);
      const d = s(n, f);
      A = d === 4 ? this.parse4(n, f) : d === 12 ? this.parse12(n, f) : { format: d }, i.tables.push(A);
    }
    i.ids[g] = p;
  }
  return i;
}, parse4(n, t) {
  const e = R, i = e.readUshort, r = e.readUshorts, s = t, h = i(n, t += 2);
  t += 2;
  const o = i(n, t += 2) >>> 1, c = { format: 4, searchRange: i(n, t += 2), entrySelector: 0, rangeShift: 0, endCount: [], startCount: [], idDelta: [], idRangeOffset: [], glyphIdArray: [] };
  t += 2, c.entrySelector = i(n, t), t += 2, c.rangeShift = i(n, t), t += 2, c.endCount = r(n, t, o), t += 2 * o, t += 2, c.startCount = r(n, t, o), t += 2 * o;
  for (let l = 0; l < o; l++) c.idDelta.push(e.readShort(n, t)), t += 2;
  return c.idRangeOffset = r(n, t, o), t += 2 * o, c.glyphIdArray = r(n, t, s + h - t >> 1), c;
}, parse12(n, t) {
  const e = R.readUint;
  e(n, t += 4), e(n, t += 4);
  const i = e(n, t += 4);
  t += 4;
  const r = new Uint32Array(3 * i);
  for (let s = 0; s < 3 * i; s += 3) r[s] = e(n, t + (s << 2)), r[s + 1] = e(n, t + (s << 2) + 4), r[s + 2] = e(n, t + (s << 2) + 8);
  return { format: 12, groups: r };
} }, de = { parseTab(n, t, e) {
  const i = R;
  t += 18;
  const r = i.readUshort(n, t);
  t += 2, t += 16;
  const s = i.readShort(n, t);
  t += 2;
  const h = i.readShort(n, t);
  t += 2;
  const o = i.readShort(n, t);
  t += 2;
  const c = i.readShort(n, t);
  return t += 2, t += 6, { unitsPerEm: r, xMin: s, yMin: h, xMax: o, yMax: c, indexToLocFormat: i.readShort(n, t) };
} }, ge = { parseTab(n, t, e) {
  const i = R;
  t += 4;
  const r = ["ascender", "descender", "lineGap", "advanceWidthMax", "minLeftSideBearing", "minRightSideBearing", "xMaxExtent", "caretSlopeRise", "caretSlopeRun", "caretOffset", "res0", "res1", "res2", "res3", "metricDataFormat", "numberOfHMetrics"], s = {};
  for (let h = 0; h < r.length; h++) {
    const o = r[h], c = o === "advanceWidthMax" || o === "numberOfHMetrics" ? i.readUshort : i.readShort;
    s[o] = c(n, t + 2 * h);
  }
  return s;
} }, pe = { parseTab(n, t, e, i) {
  const r = R, s = [], h = [], o = i.maxp.numGlyphs, c = i.hhea.numberOfHMetrics;
  let l = 0, u = 0, f = 0;
  for (; f < c; ) l = r.readUshort(n, t + (f << 2)), u = r.readShort(n, t + (f << 2) + 2), s.push(l), h.push(u), f++;
  for (; f < o; ) s.push(l), h.push(u), f++;
  return { aWidth: s, lsBearing: h };
} }, Et = { cmap: fe, head: de, hhea: ge, maxp: { parseTab(n, t, e) {
  const i = R;
  return i.readUint(n, t), t += 4, { numGlyphs: i.readUshort(n, t) };
} }, hmtx: pe, loca: { parseTab(n, t, e, i) {
  const r = R, s = [], h = i.head.indexToLocFormat, o = i.maxp.numGlyphs + 1;
  if (h === 0) for (let c = 0; c < o; c++) s.push(r.readUshort(n, t + (c << 1)) << 1);
  else if (h === 1) for (let c = 0; c < o; c++) s.push(r.readUint(n, t + (c << 2)));
  return s;
} }, glyf: { parseTab(n, t, e, i) {
  const r = [], s = i.maxp.numGlyphs;
  for (let h = 0; h < s; h++) r.push(null);
  return r;
}, fi(n, t) {
  const e = R, i = n.di, r = n.loca;
  if (r[t] === r[t + 1]) return null;
  const s = Y.findTable(i, "glyf", n.pi);
  if (!s) return null;
  let h = s[0] + r[t];
  const o = {};
  if (o.noc = e.readShort(i, h), h += 2, o.xMin = e.readShort(i, h), h += 2, o.yMin = e.readShort(i, h), h += 2, o.xMax = e.readShort(i, h), h += 2, o.yMax = e.readShort(i, h), h += 2, o.xMin >= o.xMax || o.yMin >= o.yMax) return null;
  if (o.noc > 0) {
    o.endPts = [];
    for (let g = 0; g < o.noc; g++) o.endPts.push(e.readUshort(i, h)), h += 2;
    const c = e.readUshort(i, h);
    if (h += 2, i.length - h < c) return null;
    h += c;
    const l = o.endPts[o.noc - 1] + 1;
    o.flags = [];
    for (let g = 0; g < l; g++) {
      const p = i[h];
      if (h++, o.flags.push(p), 8 & p) {
        const A = i[h];
        h++;
        for (let d = 0; d < A; d++) o.flags.push(p), g++;
      }
    }
    o.xs = [];
    for (let g = 0; g < l; g++) {
      const p = o.flags[g], A = !!(16 & p);
      2 & p ? (o.xs.push(A ? i[h] : -i[h]), h++) : A ? o.xs.push(0) : (o.xs.push(e.readShort(i, h)), h += 2);
    }
    o.ys = [];
    for (let g = 0; g < l; g++) {
      const p = o.flags[g], A = !!(32 & p);
      4 & p ? (o.ys.push(A ? i[h] : -i[h]), h++) : A ? o.ys.push(0) : (o.ys.push(e.readShort(i, h)), h += 2);
    }
    let u = 0, f = 0;
    for (let g = 0; g < l; g++) u += o.xs[g], f += o.ys[g], o.xs[g] = u, o.ys[g] = f;
  } else o.parts = [], o.endPts = [], o.flags = [], o.xs = [], o.ys = [];
  return o;
} } }, Y = { parse(n) {
  const t = new Uint8Array(n);
  R.readASCII(t, 0, 4) === "wOFF" && (n = ue(n));
  const e = new Uint8Array(n), i = Et, r = {}, s = { di: e, gi: 0, pi: 0 };
  for (const h in i) {
    const o = h, c = Y.findTable(e, o, 0);
    if (c) {
      const [l, u] = c;
      let f = r[l];
      f == null && (f = i[o].parseTab(e, l, u, s), r[l] = f), s[o] = f;
    }
  }
  return [s];
}, findTable(n, t, e) {
  const i = R, r = i.readUshort(n, e + 4);
  let s = e + 12;
  for (let h = 0; h < r; h++) {
    const o = i.readASCII(n, s, 4);
    i.readUint(n, s + 4);
    const c = i.readUint(n, s + 8), l = i.readUint(n, s + 12);
    if (o === t) return [c, l];
    s += 16;
  }
  return null;
}, T: Et, B: R };
class Ae {
  mi(t) {
    var i;
    const e = [];
    return (i = t.cmap) != null && i.tables ? (t.cmap.tables.forEach((r) => {
      if (r.format === 4) {
        const s = this._i(r);
        e.push(...s);
      } else if (r.format === 12) {
        const s = this.Ai(r);
        e.push(...s);
      }
    }), [...new Set(e)]) : [];
  }
  _i(t) {
    const e = [];
    if (!(t.startCount && t.endCount && t.idRangeOffset && t.idDelta)) return e;
    for (let i = 0; i < t.startCount.length; i++) {
      const r = t.startCount[i], s = t.endCount[i];
      if (r !== 65535 || s !== 65535) {
        for (let h = r; h <= s; h++)
          if (this.yi(t, h, i) > 0) try {
            const o = String.fromCodePoint(h);
            e.push(o);
          } catch {
          }
      }
    }
    return e;
  }
  Ai(t) {
    const e = [];
    if (!t.groups) return e;
    for (let i = 0; i < t.groups.length; i += 3) {
      const r = t.groups[i], s = t.groups[i + 1], h = t.groups[i + 2];
      for (let o = r; o <= s; o++)
        if (h + (o - r) > 0) try {
          const c = String.fromCodePoint(o);
          e.push(c);
        } catch {
        }
    }
    return e;
  }
  yi(t, e, i) {
    if (t.idRangeOffset[i] === 0) return e + t.idDelta[i] & 65535;
    {
      const r = t.idRangeOffset[i] / 2 + (e - t.startCount[i]) - (t.startCount.length - i);
      if (r >= 0 && t.glyphIdArray && r < t.glyphIdArray.length) {
        const s = t.glyphIdArray[r];
        if (s !== 0) return s + t.idDelta[i] & 65535;
      }
    }
    return 0;
  }
}
class At {
  constructor() {
    a(this, "wi", /* @__PURE__ */ new Map());
    a(this, "bi", /* @__PURE__ */ new Map());
  }
  Ci(t, e) {
    const i = `${this.Mi(t)}_${e}`;
    if (this.wi.has(i)) return this.wi.get(i);
    const r = t.cmap;
    if (!r || !r.tables) return this.wi.set(i, 0), 0;
    let s = 0;
    for (const h of r.tables) if (h.format === 4 ? s = this.xi(e, h) : h.format === 12 && (s = this.Fi(e, h)), s > 0) break;
    return this.wi.set(i, s), s;
  }
  Ti(t, e) {
    const i = e.codePointAt(0);
    return i === void 0 ? 0 : this.Ci(t, i);
  }
  Pi(t, e) {
    const i = t.hmtx;
    return i && i.aWidth && i.aWidth.length !== 0 ? e < i.aWidth.length ? i.aWidth[e] : i.aWidth[i.aWidth.length - 1] : 0;
  }
  Ei(t, e) {
    const i = e / t.head.unitsPerEm, r = t.hhea.ascender * i, s = t.hhea.descender * i, h = t.hhea.lineGap * i;
    return { ascender: r, descender: s, lineGap: h, lineHeight: r - s + h, unitsPerEm: t.head.unitsPerEm, scale: i };
  }
  Ri() {
    this.wi.clear(), this.bi.clear();
  }
  Mi(t) {
    return `${t.pi}_${t.di.length}`;
  }
  xi(t, e) {
    const i = e.endCount.length;
    let r = -1;
    for (let s = 0; s < i; s++) if (t <= e.endCount[s]) {
      r = s;
      break;
    }
    if (r === -1 || t < e.startCount[r]) return 0;
    if (e.idRangeOffset[r] === 0) return t + e.idDelta[r] & 65535;
    {
      const s = e.idRangeOffset[r] / 2 + (t - e.startCount[r]) - (i - r);
      if (s >= 0 && s < e.glyphIdArray.length) {
        const h = e.glyphIdArray[s];
        return h === 0 ? 0 : h + e.idDelta[r] & 65535;
      }
    }
    return 0;
  }
  Fi(t, e) {
    const i = e.groups.length / 3;
    for (let r = 0; r < i; r++) {
      const s = e.groups[3 * r], h = e.groups[3 * r + 1], o = e.groups[3 * r + 2];
      if (t >= s && t <= h) return o + (t - s);
    }
    return 0;
  }
}
class me {
  constructor(t) {
    a(this, "Si");
    a(this, "$i");
    a(this, "j");
    a(this, "ki");
    this.j = t, this.ki = new At(), this.Si = document.createElement("canvas"), this.$i = this.Si.getContext("2d", { willReadFrequently: !0, alpha: !0 });
  }
  zi(t, e, i, r) {
    const s = t.length, h = Math.ceil(Math.sqrt(s)), o = Math.ceil(s / h), c = e.width * h, l = e.height * o;
    this.Ii(c, l), this.Oi(t, e, h, i, r);
    const u = this.j.ci(c, l, 1, { filter: "nearest" });
    return u.st(this.Si), { framebuffer: u, columns: h, rows: o };
  }
  Ii(t, e) {
    this.Si.width = t, this.Si.height = e, this.Si.style.width = t + "px", this.Si.style.height = e + "px", this.$i.imageSmoothingEnabled = !1, this.Si.style.imageRendering = "pixelated", this.$i.clearRect(0, 0, t, e), this.$i.textBaseline = "top", this.$i.textAlign = "left", this.$i.fillStyle = "white";
  }
  Oi(t, e, i, r, s) {
    const h = r / s.head.unitsPerEm;
    for (let o = 0; o < t.length; o++) {
      const c = o % i, l = Math.floor(o / i), u = t[o].character, f = this.Di(s, u);
      if (!f) continue;
      const g = u.codePointAt(0) || 0, p = this.ki.Ci(s, g), A = this.ki.Pi(s, p) * h, d = c * e.width, v = l * e.height, m = d + 0.5 * e.width, E = v + 0.5 * e.height, y = Math.round(m - 0.5 * e.width), T = Math.round(E - 0.5 * r), w = y + 0.5 * (e.width - A), x = T + s.hhea.ascender * h;
      this.Li(f, w, x, h);
    }
  }
  Di(t, e) {
    const i = e.codePointAt(0) || 0, r = this.ki.Ci(t, i);
    return r === 0 ? null : Y.T.glyf.fi(t, r);
  }
  Li(t, e, i, r) {
    if (!t || !t.xs || t.noc === 0) return;
    let { xs: s, ys: h, endPts: o, flags: c } = t;
    if (!(s && h && o && c)) return;
    this.$i.beginPath();
    let l = 0;
    for (let u = 0; u < o.length; u++) {
      const f = o[u];
      if (!(f < l)) {
        if (f >= l) {
          const g = e + s[l] * r, p = i - h[l] * r;
          this.$i.moveTo(g, p);
          let A = l + 1;
          for (; A <= f; )
            if (1 & c[A]) {
              const d = e + s[A] * r, v = i - h[A] * r;
              this.$i.lineTo(d, v), A++;
            } else {
              const d = e + s[A] * r, v = i - h[A] * r;
              if (A + 1 > f) {
                const E = e + s[l] * r, y = i - h[l] * r;
                if (1 & c[l]) this.$i.quadraticCurveTo(d, v, E, y);
                else {
                  const T = (d + E) / 2, w = (v + y) / 2;
                  this.$i.quadraticCurveTo(d, v, T, w);
                }
                break;
              }
              const m = A + 1;
              if (1 & c[m]) {
                const E = e + s[m] * r, y = i - h[m] * r;
                this.$i.quadraticCurveTo(d, v, E, y), A = m + 1;
              } else {
                const E = (d + (e + s[m] * r)) / 2, y = (v + (i - h[m] * r)) / 2;
                this.$i.quadraticCurveTo(d, v, E, y), A = m;
              }
            }
          this.$i.closePath();
        }
        l = f + 1;
      }
    }
    this.$i.fill();
  }
}
class ve {
  constructor() {
    a(this, "Bi");
    this.Bi = new At();
  }
  Hi(t, e, i) {
    let r = 0;
    const s = this.Bi.Ei(i, e), h = s.lineHeight;
    for (const o of t) {
      const c = this.Bi.Ti(i, o);
      if (c === 0) continue;
      const l = this.Bi.Pi(i, c) * s.scale;
      r = Math.max(r, l);
    }
    return { width: Math.ceil(r), height: Math.ceil(h) };
  }
  Ri() {
    this.Bi.Ri();
  }
}
class ye {
  constructor() {
    a(this, "ki");
    this.ki = new At();
  }
  createCharacterObjects(t, e) {
    return t.map((i, r) => {
      const s = i.codePointAt(0) || 0, h = this.Gi(r);
      let o = 0;
      if (e.hmtx && e.hmtx.aWidth) {
        const c = this.ki.Ci(e, s);
        c > 0 && e.hmtx.aWidth[c] !== void 0 && (o = e.hmtx.aWidth[c]);
      }
      return { character: i, unicode: s, color: h, advanceWidth: o };
    });
  }
  Gi(t) {
    return [t % 256 / 255, Math.floor(t / 256) % 256 / 255, 0];
  }
  Ni(t, e) {
    if (!V.m(typeof t == "string", "Character must be a string.", { method: "getCharacterColor", providedValue: t })) return [0, 0, 0];
    const i = e.find((r) => r.character === t);
    return i ? i.color : [0, 0, 0];
  }
  Xi(t, e) {
    return V.m(typeof t == "string" && t.length > 0, "Characters must be a string with at least one character.", { method: "getCharacterColors", providedValue: t }) ? Array.from(t).map((i) => this.Ni(i, e) || [0, 0, 0]) : [[0, 0, 0]];
  }
}
class gt {
  constructor(t, e = 16) {
    a(this, "Yi");
    a(this, "Ki", []);
    a(this, "ji");
    a(this, "Zi", 16);
    a(this, "Wi", 0);
    a(this, "qi", 0);
    a(this, "Vi", { width: 0, height: 0 });
    a(this, "Qi");
    a(this, "Ji", /* @__PURE__ */ new Map());
    a(this, "tr");
    a(this, "sr");
    a(this, "er");
    a(this, "ir");
    this.Zi = e, this.tr = new Ae(), this.sr = new me(t), this.er = new ve(), this.ir = new ye();
  }
  async rr(t) {
    let e;
    if (t) {
      const i = await fetch(t);
      if (!i.ok) throw new L(`Failed to load font file: ${i.status} ${i.statusText}`);
      e = await i.arrayBuffer();
    } else
      e = await (await fetch("data:font/woff;base64,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")).arrayBuffer();
    await this.nr(e), this.Yi = Y.parse(e)[0], await this.hr();
  }
  ar(t) {
    if (t === void 0) return this.Zi;
    this.Zi = t, this.Vi = this.er.Hi(this.Ki.map((i) => i.character), this.Zi, this.Yi);
    const e = this.sr.zi(this.Ki, this.Vi, this.Zi, this.Yi);
    this.ji = e.framebuffer, this.Wi = e.columns, this.qi = e.rows;
  }
  async cr(t) {
    try {
      const e = await fetch(t);
      if (!e.ok) throw new L(`Failed to load font file: ${e.status} ${e.statusText}`);
      const i = await e.arrayBuffer();
      await this.nr(i);
      const r = Y.parse(i);
      if (!r || r.length === 0) throw Error("Failed to parse font file");
      this.Yi = r[0], await this.hr();
    } catch (e) {
      throw new L("Failed to load font: " + (e instanceof Error ? e.message : "Unknown error"), e);
    }
  }
  async nr(t) {
    const e = Date.now();
    this.Qi = new FontFace("CustomFont_" + e, t), await this.Qi.load(), document.fonts.add(this.Qi);
  }
  async hr() {
    const t = this.tr.mi(this.Yi);
    this.Ji.clear(), this.Ki = this.ir.createCharacterObjects(t, this.Yi), this.Vi = this.er.Hi(t, this.Zi, this.Yi);
    const e = this.sr.zi(this.Ki, this.Vi, this.Zi, this.Yi);
    this.ji = e.framebuffer, this.Wi = e.columns, this.qi = e.rows;
  }
  Ni(t) {
    return this.ir.Ni(t, this.Ki);
  }
  Xi(t) {
    return this.ir.Xi(t, this.Ki);
  }
  getGlyphData(t) {
    if (!Number.isFinite(t)) return null;
    const e = this.Ji.get(t);
    if (e !== void 0) return e;
    const i = this.lr(t);
    if (i < 0) return this.Ji.set(t, null), null;
    const r = this.Yi.glyf;
    if (!r) return this.Ji.set(t, null), null;
    let s = r[i] ?? null;
    return s == null && (s = Y.T.glyf.fi(this.Yi, i) ?? null, r[i] = s), this.Ji.set(t, s), s;
  }
  lr(t) {
    const e = this.Yi.cmap;
    for (const i of e.tables) if (i.format === 4) {
      const r = i;
      for (let s = 0; s < r.startCount.length; s++) if (t >= r.startCount[s] && t <= r.endCount[s]) {
        if (r.idRangeOffset[s] === 0) return t + r.idDelta[s] & 65535;
        {
          const h = r.idRangeOffset[s] / 2 + (t - r.startCount[s]) - (r.startCount.length - s);
          if (h >= 0 && h < r.glyphIdArray.length) {
            const o = r.glyphIdArray[h];
            if (o !== 0) return o + r.idDelta[s] & 65535;
          }
        }
      }
    } else if (i.format === 12) {
      const r = i;
      for (let s = 0; s < r.groups.length; s += 3) {
        const h = r.groups[s], o = r.groups[s + 1], c = r.groups[s + 2];
        if (t >= h && t <= o) return c + (t - h);
      }
    }
    return 0;
  }
  L() {
    this.ji.L(), document.fonts.delete(this.Qi);
  }
  get fontFramebuffer() {
    return this.ji;
  }
  get characters() {
    return this.Ki;
  }
  get textureColumns() {
    return this.Wi;
  }
  get textureRows() {
    return this.qi;
  }
  get maxGlyphDimensions() {
    return this.Vi;
  }
  get fontSize() {
    return this.Zi;
  }
  get font() {
    return this.Yi;
  }
}
class wt {
  constructor(t, e, i) {
    a(this, "ur");
    a(this, "dr");
    a(this, "H");
    a(this, "G");
    a(this, "pr");
    a(this, "vr");
    a(this, "gr");
    a(this, "mr");
    a(this, "_r");
    this.gr = t, this.mr = e, this._r = i, this.Ar();
  }
  Ar() {
    this.ur = Math.floor(this.gr.width / this.mr), this.dr = Math.floor(this.gr.height / this._r), this.H = this.ur * this.mr, this.G = this.dr * this._r, this.pr = Math.floor((this.gr.width - this.H) / 2), this.vr = Math.floor((this.gr.height - this.G) / 2);
  }
  yr(t, e) {
    this.mr = t, this._r = e, this.Ar();
  }
  get cellWidth() {
    return this.mr;
  }
  get cellHeight() {
    return this._r;
  }
  get cols() {
    return this.ur;
  }
  get rows() {
    return this.dr;
  }
  get width() {
    return this.H;
  }
  get height() {
    return this.G;
  }
  get offsetX() {
    return this.pr;
  }
  get offsetY() {
    return this.vr;
  }
}
const Ee = /^#([0-9a-f]{3,8})$/i, we = /^rgba?\(([^)]+)\)$/i;
function lt(n) {
  return Number.isNaN(n) ? 0 : Math.max(0, Math.min(255, n));
}
function Te(n) {
  if (!n) return null;
  const t = n.trim().toLowerCase();
  if (!t || t === "transparent") return null;
  let e = null;
  return t.startsWith("#") ? e = function(i) {
    const r = Ee.exec(i.trim());
    if (!r) return null;
    const s = r[1];
    return s.length === 3 ? [parseInt(s[0] + s[0], 16), parseInt(s[1] + s[1], 16), parseInt(s[2] + s[2], 16), 255] : s.length === 4 ? [parseInt(s[0] + s[0], 16), parseInt(s[1] + s[1], 16), parseInt(s[2] + s[2], 16), parseInt(s[3] + s[3], 16)] : s.length === 6 || s.length === 8 ? [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16), s.length === 8 ? parseInt(s.slice(6, 8), 16) : 255] : null;
  }(t) : t.startsWith("rgb") && (e = function(i) {
    const r = we.exec(i.trim());
    if (!r) return null;
    const s = r[1].split(",").map((u) => u.trim());
    if (s.length < 3) return null;
    const h = lt(parseFloat(s[0])), o = lt(parseFloat(s[1])), c = lt(parseFloat(s[2])), l = s[3] !== void 0 ? 255 * Math.max(0, Math.min(1, parseFloat(s[3]))) : 255;
    return [h, o, c, Math.round(l)];
  }(t)), e ? e[3] === 0 ? null : e : null;
}
class be {
  constructor(t = {}) {
    a(this, "gr");
    a(this, "wr", null);
    a(this, "br", !1);
    a(this, "Cr");
    this.br = t.overlay ?? !1, this.br && t.canvas ? (this.wr = t.canvas, this.gr = this.Mr(), this.Cr = !0, this.Fr()) : t.canvas ? (this.gr = t.canvas, this.Cr = !1) : (this.gr = this.Tr(t.width, t.height), this.Cr = !0), this.gr.style.imageRendering = "pixelated";
  }
  Tr(t, e) {
    const i = document.createElement("canvas");
    return i.className = "textmodeCanvas", i.style.imageRendering = "pixelated", i.width = t || 800, i.height = e || 600, document.body.appendChild(i), i;
  }
  Mr() {
    const t = document.createElement("canvas");
    t.className = "textmodeCanvas", t.style.imageRendering = "pixelated";
    const e = this.wr.getBoundingClientRect();
    let i = Math.round(e.width), r = Math.round(e.height);
    if (this.wr instanceof HTMLVideoElement) {
      const o = this.wr;
      (i === 0 || r === 0) && o.videoWidth > 0 && o.videoHeight > 0 && (i = o.videoWidth, r = o.videoHeight);
    }
    t.width = i, t.height = r, t.style.position = "absolute", t.style.pointerEvents = "none";
    const s = window.getComputedStyle(this.wr);
    let h = parseInt(s.zIndex || "0", 10);
    return isNaN(h) && (h = 0), t.style.zIndex = "" + (h + 1), t;
  }
  Fr() {
    var t;
    this.Pr(), (t = this.wr.parentNode) == null || t.insertBefore(this.gr, this.wr.nextSibling);
  }
  Er() {
    const t = [];
    return this.br && this.wr instanceof HTMLElement && (t.push(this.wr), this.wr.parentElement && t.push(this.wr.parentElement)), this.gr.parentElement && t.push(this.gr.parentElement), t.push(this.gr), t.push(document.body), t.push(document.documentElement), t;
  }
  Rr() {
    const t = this.Er();
    for (const e of t) {
      if (!e) continue;
      const i = Te(window.getComputedStyle(e).backgroundColor);
      if (i) return i;
    }
    return [255, 255, 255, 255];
  }
  Pr() {
    if (!this.wr) return;
    const t = this.wr.getBoundingClientRect();
    let e = this.wr.offsetParent;
    if (e && e !== document.body) {
      const i = e.getBoundingClientRect();
      this.gr.style.top = t.top - i.top + "px", this.gr.style.left = t.left - i.left + "px";
    } else this.gr.style.top = t.top + window.scrollY + "px", this.gr.style.left = t.left + window.scrollX + "px";
  }
  Sr(t, e) {
    if (this.br) {
      const i = this.wr.getBoundingClientRect();
      this.gr.width = Math.round(i.width), this.gr.height = Math.round(i.height), this.Pr();
    } else this.gr.width = t ?? this.gr.width, this.gr.height = e ?? this.gr.height;
  }
  $r() {
    const t = this.gr.getContext("webgl2", { alpha: !0, premultipliedAlpha: !1, preserveDrawingBuffer: !0, antialias: !1, depth: !0, stencil: !1, powerPreference: "high-performance" });
    if (!t) throw new L("`textmode.js` requires WebGL2 support.");
    return t;
  }
  L() {
    const t = this.gr.getContext("webgl") || this.gr.getContext("webgl2");
    if (t) {
      const e = t.getExtension("WEBGL_lose_context");
      e == null || e.loseContext();
    }
    this.Cr && this.gr.parentNode && this.gr.parentNode.removeChild(this.gr);
  }
  get canvas() {
    return this.gr;
  }
  get targetCanvas() {
    return this.wr;
  }
  get width() {
    return this.gr.width;
  }
  get height() {
    return this.gr.height;
  }
}
const xe = /^#|0x/gi;
function Z(n) {
  return Number.isNaN(n) || !Number.isFinite(n) || n <= 0 ? 0 : n >= 255 ? 255 : Math.round(n);
}
function tt(n) {
  return Z(parseInt(n, 16));
}
class F {
  constructor(t, e, i, r, s) {
    a(this, "kr");
    a(this, "zr");
    a(this, "Ht");
    a(this, "r");
    a(this, "g");
    a(this, "b");
    a(this, "a");
    this.r = Z(t), this.g = Z(e), this.b = Z(i), this.a = Z(r), this.kr = [this.r, this.g, this.b, this.a], this.zr = [this.r / 255, this.g / 255, this.b / 255, this.a / 255], this.Ht = s ? [...s] : void 0;
  }
  static Ir(t, e, i, r = 255) {
    return new F(t, e, i, r);
  }
  static Or(t, e = 255) {
    return new F(t, t, t, e);
  }
  static Dr(t) {
    const [e, i, r, s] = function(h) {
      const o = h.replace(xe, ""), c = (l = o).length === 3 || l.length === 4 ? l.split("").map((u) => u + u).join("") : l;
      var l;
      if (c.length !== 6 && c.length !== 8) throw Error("Invalid hex color: " + h);
      return [tt(c.slice(0, 2)), tt(c.slice(2, 4)), tt(c.slice(4, 6)), c.length === 8 ? tt(c.slice(6, 8)) : 255];
    }(t);
    return new F(e, i, r, s);
  }
  static Lr(t) {
    const [e, i, r] = t;
    return new F(255 * e, 255 * i, 255 * r, 255, t);
  }
  get rgb() {
    return [this.r, this.g, this.b];
  }
  get rgba() {
    return [...this.kr];
  }
  get normalized() {
    return [...this.zr];
  }
  get character() {
    return this.Ht ? [...this.Ht] : void 0;
  }
  static Br(t) {
    return t instanceof F;
  }
}
const z = class z {
  constructor(t, e, i, r, s, h, o) {
    a(this, "A");
    a(this, "j");
    a(this, "Hr");
    a(this, "Gr");
    a(this, "Nr");
    a(this, "H");
    a(this, "G");
    a(this, "Z", null);
    a(this, "Tt", 0);
    a(this, "Lt", 0);
    a(this, "Bt", 0);
    a(this, "Pt", 0);
    a(this, "Xr", "sampled");
    a(this, "Yr", "fixed");
    a(this, "Gt", [1, 1, 1, 1]);
    a(this, "Nt", [0, 0, 0, 1]);
    a(this, "Kr", [0, 0, 0, 1]);
    a(this, "jr", [[0.1, 0, 0]]);
    a(this, "Zr");
    this.A = t, this.j = e, this.Hr = i, this.Gr = r, this.Nr = s, this.H = h, this.G = o;
  }
  dispose() {
    this.A.deleteTexture(this.Hr);
  }
  invert(t = !0) {
    return this.Tt = t ? 1 : 0, this.Z = null, this;
  }
  flipX(t = !0) {
    return this.Lt = t ? 1 : 0, this.Z = null, this;
  }
  flipY(t = !0) {
    return this.Bt = t ? 1 : 0, this.Z = null, this;
  }
  charRotation(t) {
    return this.Pt = bt(t), this.Z = null, this;
  }
  charColorMode(t) {
    return this.Xr = t, this.Z = null, this;
  }
  cellColorMode(t) {
    return this.Yr = t, this.Z = null, this;
  }
  charColor(t, e, i, r) {
    return this.qr(this.Gt, t, e, i, r), this.Z = null, this;
  }
  cellColor(t, e, i, r) {
    return this.qr(this.Nt, t, e, i, r), this.Z = null, this;
  }
  background(t, e, i, r) {
    return this.qr(this.Kr, t, e, i, r), this.Z = null, this;
  }
  characters(t) {
    if (!this.Zr) throw Error("Glyph color resolver not initialized");
    const e = this.Zr(t).filter((i) => Array.isArray(i)).slice(0, 64);
    return this.jr = e, this.Z = null, this;
  }
  get texture() {
    return this.Hr;
  }
  get width() {
    return this.H;
  }
  get height() {
    return this.G;
  }
  get originalWidth() {
    return this.Gr;
  }
  get originalHeight() {
    return this.Nr;
  }
  ct() {
    return this.Z || this.lt(), this.Z;
  }
  Vr() {
  }
  lt() {
    this.Vr();
    const t = this.Qr(), e = this.Jr();
    this.Z = this.j.ft.Fe(t, e);
  }
  qr(t, e, i, r, s) {
    if (F.Br(e)) X(t, e.r, e.g, e.b, e.a);
    else {
      if (typeof e == "string") {
        const h = F.Dr(e);
        return void X(t, h.r, h.g, h.b, h.a);
      }
      X(t, e, i, r, s);
    }
  }
  Qr() {
    return z.Wr || (z.Wr = new q(this.A, rt, `#version 300 es
precision highp float;in vec2 v_uv;uniform sampler2D Ug;uniform bool Uh;uniform bool Ui;uniform bool Uj;uniform float Uk;uniform bool Ul;uniform vec4 Um;uniform bool Un;uniform vec4 Uo;uniform vec4 Up;uniform int Uq;uniform vec3 Ur[64];layout(location=0)out vec4 o_character;layout(location=1)out vec4 o_primaryColor;layout(location=2)out vec4 o_secondaryColor;float A(vec3 B){return dot(B,vec3(0.299f,0.587f,0.114f));}void main(){vec2 C=vec2(v_uv.x,1.0f-v_uv.y);vec4 D=texture(Ug,C);float E=A(D.rgb);vec2 F=vec2(0.);if(Uq>0){float G=float(Uq);float H=clamp(E*(G-1.0f),0.0f,G-1.0f);int I=int(floor(H+0.5f));vec3 J=Ur[I];F=J.xy;}else{F=vec2(E,0.0f);}vec4 K=Ul?Um:D;vec4 L=Un?Uo:D;if(D.a<0.01f){K=Up;L=Up;}else{}o_primaryColor=vec4(K.rgb,K.a);o_secondaryColor=vec4(L.rgb,L.a);int M=int(Uh?1:0);int N=int(Ui?1:0);int O=int(Uj?1:0);float P=float(M|(N<<1)|(O<<2))/255.;o_character=vec4(F,P,clamp(Uk,0.0f,1.0f));}`)), z.Wr;
  }
  Jr() {
    return { Ug: this.tn(), Uh: !!this.Tt, Ui: !!this.Lt, Uj: !!this.Bt, Uk: this.Pt, Ul: this.Xr === "fixed", Um: this.Gt, Un: this.Yr === "fixed", Uo: this.Nt, Up: this.Kr, Uq: this.jr.length, Ur: this.jr };
  }
};
a(z, "Wr", null);
let st = z;
class j extends st {
  constructor(t, e, i, r, s, h, o) {
    const c = Math.min(h / r, o / s);
    super(t, e, i, r, s, Math.max(1, Math.floor(r * c)), Math.max(1, Math.floor(s * c)));
  }
  static sn(t, e, i, r, s) {
    const h = t.context, o = h.createTexture();
    h.bindTexture(h.TEXTURE_2D, o), h.pixelStorei(h.UNPACK_FLIP_Y_WEBGL, 1), et(h, h.NEAREST, h.NEAREST, h.CLAMP_TO_EDGE, h.CLAMP_TO_EDGE), h.texImage2D(h.TEXTURE_2D, 0, h.RGBA, h.RGBA, h.UNSIGNED_BYTE, e), h.bindTexture(h.TEXTURE_2D, null);
    const c = e.naturalWidth ?? e.width ?? e.videoWidth ?? 0, l = e.naturalHeight ?? e.height ?? e.videoHeight ?? 0, u = new j(h, t, o, c, l, i, r);
    return u.Zr = s, u;
  }
  tn() {
    return this.Hr;
  }
}
class Ce {
  constructor(t = 60) {
    a(this, "en");
    a(this, "rn", null);
    a(this, "nn", 0);
    a(this, "hn", !0);
    a(this, "an", 0);
    a(this, "cn", 0);
    a(this, "ln", []);
    a(this, "un", 10);
    a(this, "fn", 0);
    this.en = 1e3 / t;
  }
  dn(t) {
    if (!this.hn) return;
    this.nn = performance.now();
    const e = (i) => {
      if (!this.hn) return void (this.rn = null);
      const r = i - this.nn;
      r >= this.en && (t(), this.nn = i - r % this.en), this.hn && (this.rn = requestAnimationFrame(e));
    };
    this.rn = requestAnimationFrame(e);
  }
  pn() {
    this.rn && (cancelAnimationFrame(this.rn), this.rn = null);
  }
  vn() {
    this.hn && (this.hn = !1, this.pn());
  }
  gn(t) {
    this.hn || (this.hn = !0, this.dn(t));
  }
  mn(t, e) {
    if (t === void 0) return this.an;
    this.en = 1e3 / t, this.hn && e && (this.pn(), this.dn(e));
  }
  _n() {
    const t = performance.now();
    if (this.cn > 0) {
      const e = t - this.cn;
      this.ln.push(e), this.ln.length > this.un && this.ln.shift();
      const i = this.ln.reduce((r, s) => r + s, 0) / this.ln.length;
      this.an = 1e3 / i;
    }
    this.cn = t;
  }
  get An() {
    return this.hn;
  }
  get yn() {
    return this.an;
  }
  get wn() {
    return this.fn;
  }
  set wn(t) {
    this.fn = t;
  }
  bn() {
    this.fn++;
  }
}
class Pt {
  constructor(t) {
    a(this, "gr");
    a(this, "Cn");
    a(this, "Mn", { x: -1, y: -1 });
    a(this, "xn", { x: -1, y: -1 });
    a(this, "Fn", null);
    a(this, "Tn", 0);
    a(this, "Pn");
    a(this, "En");
    a(this, "Rn");
    a(this, "Sn");
    a(this, "$n");
    a(this, "kn");
    a(this, "zn", !1);
    a(this, "In");
    a(this, "On");
    a(this, "Dn");
    a(this, "Ln");
    a(this, "Bn");
    this.gr = t;
  }
  Hn(t) {
    const e = performance.now() + Math.max(0, t);
    e > this.Tn && (this.Tn = e);
  }
  Gn() {
    return performance.now() < this.Tn;
  }
  Nn(t) {
    const e = this.gr.canvas;
    e.style.cursor = t == null || t === "" ? "" : t;
  }
  rr(t) {
    this.Cn = t, this.Xn();
  }
  Yn() {
    if (this.zn) return;
    const t = this.gr.canvas;
    this.Pn = (e) => {
      this.Kn(e), this.jn(e);
    }, this.En = () => {
      this.xn = { ...this.Mn }, this.Mn.x = -1, this.Mn.y = -1, this.Fn = null;
    }, this.Rn = (e) => {
      this.Kn(e), this.Zn(e);
    }, this.Sn = (e) => {
      this.Kn(e), this.Wn(e);
    }, this.$n = (e) => {
      this.Kn(e), this.qn(e);
    }, this.kn = (e) => {
      this.Kn(e), this.Vn(e);
    }, t.addEventListener("mousemove", this.Pn, { passive: !0 }), t.addEventListener("mouseleave", this.En, { passive: !0 }), t.addEventListener("mousedown", this.Rn, { passive: !0 }), t.addEventListener("mouseup", this.Sn, { passive: !0 }), t.addEventListener("click", this.$n, { passive: !0 }), t.addEventListener("wheel", this.kn, { passive: !1 }), this.zn = !0;
  }
  Qn() {
    if (!this.zn) return;
    const t = this.gr.canvas;
    t.removeEventListener("mousemove", this.Pn), t.removeEventListener("mouseleave", this.En), t.removeEventListener("mousedown", this.Rn), t.removeEventListener("mouseup", this.Sn), t.removeEventListener("click", this.$n), t.removeEventListener("wheel", this.kn), this.zn = !1;
  }
  Xn() {
    if (this.zn) try {
      if (this.Fn) {
        const t = new MouseEvent("mousemove", { clientX: this.Fn.x, clientY: this.Fn.y, bubbles: !1, cancelable: !1 });
        this.Kn(t);
      } else this.Mn.x !== -1 && this.Mn.y !== -1 && (this.Mn.x >= this.Cn.cols || this.Mn.y >= this.Cn.rows) && (this.Mn.x = -1, this.Mn.y = -1);
    } catch {
      this.Mn.x = -1, this.Mn.y = -1;
    }
  }
  Jn(t) {
    this.In = t;
  }
  so(t) {
    this.On = t;
  }
  eo(t) {
    this.Dn = t;
  }
  io(t) {
    this.Ln = t;
  }
  ro(t) {
    this.Bn = t;
  }
  no() {
    return { x: this.Mn.x, y: this.Mn.y };
  }
  jn(t) {
    if (this.Ln && !this.Gn()) {
      const e = { position: { ...this.Mn }, previousPosition: { ...this.xn }, originalEvent: t };
      this.Ln(e);
    }
  }
  Zn(t) {
    if (this.On && !this.Gn()) {
      const e = { position: { ...this.Mn }, previousPosition: { ...this.xn }, button: t.button, originalEvent: t };
      this.On(e);
    }
  }
  Wn(t) {
    if (this.Dn && !this.Gn()) {
      const e = { position: { ...this.Mn }, previousPosition: { ...this.xn }, button: t.button, originalEvent: t };
      this.Dn(e);
    }
  }
  qn(t) {
    if (this.In && !this.Gn()) {
      const e = { position: { ...this.Mn }, previousPosition: { ...this.xn }, button: t.button, originalEvent: t };
      this.In(e);
    }
  }
  Vn(t) {
    if (this.Bn && !this.Gn()) {
      const e = { position: { ...this.Mn }, previousPosition: { ...this.xn }, delta: { x: t.deltaX, y: t.deltaY }, originalEvent: t };
      this.Bn(e);
    }
  }
  Kn(t) {
    const e = this.gr.canvas;
    this.xn = { ...this.Mn }, this.Fn = { x: t.clientX, y: t.clientY };
    const i = e.getBoundingClientRect(), r = t.clientX - i.left, s = t.clientY - i.top, h = e.width / i.width, o = s * (e.height / i.height), c = r * h - this.Cn.offsetX, l = o - this.Cn.offsetY, u = Math.floor(c / this.Cn.cellWidth), f = Math.floor(l / this.Cn.cellHeight);
    u >= 0 && u < this.Cn.cols && f >= 0 && f < this.Cn.rows ? (this.Mn.x = u, this.Mn.y = f) : (this.Mn.x = -1, this.Mn.y = -1);
  }
}
const Re = Object.freeze(Object.defineProperty({ __proto__: null, MouseManager: Pt }, Symbol.toStringTag, { value: "Module" }));
class St {
  constructor() {
    a(this, "oo", /* @__PURE__ */ new Map());
    a(this, "ho", null);
    a(this, "ao", null);
    a(this, "co");
    a(this, "lo");
    a(this, "zn", !1);
    a(this, "uo");
    a(this, "fo");
    a(this, "do", { ArrowUp: "UP_ARROW", ArrowDown: "DOWN_ARROW", ArrowLeft: "LEFT_ARROW", ArrowRight: "RIGHT_ARROW", F1: "F1", F2: "F2", F3: "F3", F4: "F4", F5: "F5", F6: "F6", F7: "F7", F8: "F8", F9: "F9", F10: "F10", F11: "F11", F12: "F12", Enter: "ENTER", Return: "RETURN", Tab: "TAB", Escape: "ESCAPE", Backspace: "BACKSPACE", Delete: "DELETE", Insert: "INSERT", Home: "HOME", End: "END", PageUp: "PAGE_UP", PageDown: "PAGE_DOWN", Shift: "SHIFT", Control: "CONTROL", Alt: "ALT", Meta: "META", " ": "SPACE" });
  }
  Yn() {
    this.zn || (this.co = (t) => {
      this.po(t);
    }, this.lo = (t) => {
      this.vo(t);
    }, window.addEventListener("keydown", this.co, { passive: !1 }), window.addEventListener("keyup", this.lo, { passive: !1 }), this.zn = !0);
  }
  Qn() {
    this.zn && (window.removeEventListener("keydown", this.co), window.removeEventListener("keyup", this.lo), this.zn = !1, this.oo.clear(), this.ho = null, this.ao = null);
  }
  so(t) {
    this.uo = t;
  }
  eo(t) {
    this.fo = t;
  }
  mo(t) {
    const e = this._o(t), i = this.oo.get(t) || this.oo.get(e);
    return (i == null ? void 0 : i.isPressed) || !1;
  }
  Ao() {
    return this.ho;
  }
  yo() {
    return this.ao;
  }
  wo() {
    const t = [];
    for (const [e, i] of this.oo) i.isPressed && t.push(e);
    return t;
  }
  bo() {
    return { ctrl: this.mo("Control"), shift: this.mo("Shift"), alt: this.mo("Alt"), meta: this.mo("Meta") };
  }
  Co() {
    this.oo.clear(), this.ho = null, this.ao = null;
  }
  po(t) {
    const e = t.key, i = Date.now();
    this.oo.has(e) || this.oo.set(e, { isPressed: !1, lastPressTime: 0, lastReleaseTime: 0 });
    const r = this.oo.get(e);
    if (!r.isPressed && (r.isPressed = !0, r.lastPressTime = i, this.ho = e, this.uo)) {
      const s = { key: e, keyCode: t.keyCode, ctrlKey: t.ctrlKey, shiftKey: t.shiftKey, altKey: t.altKey, metaKey: t.metaKey, isPressed: !0, originalEvent: t };
      this.uo(s);
    }
  }
  vo(t) {
    const e = t.key, i = Date.now();
    this.oo.has(e) || this.oo.set(e, { isPressed: !1, lastPressTime: 0, lastReleaseTime: 0 });
    const r = this.oo.get(e);
    if (r.isPressed = !1, r.lastReleaseTime = i, this.ao = e, this.fo) {
      const s = { key: e, keyCode: t.keyCode, ctrlKey: t.ctrlKey, shiftKey: t.shiftKey, altKey: t.altKey, metaKey: t.metaKey, isPressed: !1, originalEvent: t };
      this.fo(s);
    }
  }
  _o(t) {
    return this.do[t] || t.toLowerCase();
  }
}
const Fe = Object.freeze(Object.defineProperty({ __proto__: null, KeyboardManager: St }, Symbol.toStringTag, { value: "Module" }));
class Lt {
  constructor(t, e) {
    a(this, "gr");
    a(this, "Mo");
    a(this, "Cn");
    a(this, "xo", /* @__PURE__ */ new Map());
    a(this, "Fo", /* @__PURE__ */ new Map());
    a(this, "To", /* @__PURE__ */ new Map());
    a(this, "Po", null);
    a(this, "Eo");
    a(this, "Ro");
    a(this, "So");
    a(this, "$o");
    a(this, "ko");
    a(this, "zo");
    a(this, "zn", !1);
    a(this, "Io");
    a(this, "Oo");
    a(this, "Do");
    a(this, "Lo");
    a(this, "Bo");
    a(this, "Ho");
    a(this, "Go");
    a(this, "No");
    a(this, "Xo");
    a(this, "Yo");
    a(this, "Ko", 320);
    a(this, "jo", 350);
    a(this, "Zo", 10);
    a(this, "Wo", 550);
    a(this, "qo", 14);
    a(this, "Vo", 48);
    a(this, "Qo", 650);
    a(this, "Jo", 0.02);
    a(this, "th", 2);
    a(this, "sh", 600);
    a(this, "eh", 0);
    a(this, "ih", null);
    this.gr = t, this.Mo = e;
    const i = this.gr.canvas;
    this.Eo = i.style.touchAction, this.Ro = i.style.userSelect, i.style.touchAction || (i.style.touchAction = "none"), i.style.userSelect || (i.style.userSelect = "none");
  }
  rr(t) {
    this.Cn = t, this.Xn();
  }
  Yn() {
    if (this.zn) return;
    const t = this.gr.canvas;
    this.So = (e) => {
      this.rh(e);
    }, this.$o = (e) => {
      this.nh(e);
    }, this.ko = (e) => {
      this.oh(e);
    }, this.zo = (e) => {
      this.hh(e);
    }, t.addEventListener("touchstart", this.So, { passive: !1 }), t.addEventListener("touchmove", this.$o, { passive: !1 }), t.addEventListener("touchend", this.ko, { passive: !1 }), t.addEventListener("touchcancel", this.zo, { passive: !1 }), this.zn = !0;
  }
  Qn() {
    if (!this.zn) return;
    const t = this.gr.canvas;
    t.removeEventListener("touchstart", this.So), t.removeEventListener("touchmove", this.$o), t.removeEventListener("touchend", this.ko), t.removeEventListener("touchcancel", this.zo), this.zn = !1, this.Po = null, this.xo.clear(), this.Fo.clear(), this.To.forEach((e) => {
      e.longPressTimer !== null && window.clearTimeout(e.longPressTimer);
    }), this.To.clear(), this.ih = null, this.eh = 0, t.style.touchAction = this.Eo, t.style.userSelect = this.Ro;
  }
  Xn() {
    if (!this.Cn || this.xo.size === 0) return;
    const t = /* @__PURE__ */ new Map();
    for (const e of this.xo.values()) {
      const i = this.ah(e.clientX, e.clientY, e.id, e);
      t.set(e.id, i);
    }
    this.xo = t;
  }
  uh() {
    return Array.from(this.xo.values()).map((t) => ({ ...t }));
  }
  fh(t) {
    this.Io = t;
  }
  io(t) {
    this.Oo = t;
  }
  dh(t) {
    this.Do = t;
  }
  ph(t) {
    this.Lo = t;
  }
  gh(t) {
    this.Bo = t;
  }
  mh(t) {
    this.Ho = t;
  }
  _h(t) {
    this.Go = t;
  }
  Ah(t) {
    this.No = t;
  }
  yh(t) {
    this.Xo = t;
  }
  wh(t) {
    this.Yo = t;
  }
  rh(t) {
    var r;
    if (!this.Cn) return;
    t.preventDefault(), (r = this.Mo) == null || r.Hn(this.sh);
    const e = performance.now(), i = this.bh(t.changedTouches);
    for (const s of i) {
      const h = this.xo.get(s.id);
      h && this.Fo.set(s.id, this.Ch(h)), this.xo.set(s.id, s);
      const o = { id: s.id, startPosition: s, lastPosition: s, startTime: e, lastTime: e, longPressTimer: null, longPressFired: !1 };
      this.Go && (o.longPressTimer = window.setTimeout(() => {
        const c = this.xo.get(s.id);
        c && (o.longPressFired = !0, this.Go({ touch: this.Ch(c), duration: performance.now() - o.startTime, originalEvent: t }));
      }, this.Wo)), this.To.set(s.id, o), this.Io && this.Io(this.Mh(s, t, void 0, e));
    }
    this.xo.size === 2 && this.xh();
  }
  nh(t) {
    var r;
    if (!this.Cn) return;
    t.preventDefault(), (r = this.Mo) == null || r.Hn(this.sh);
    const e = performance.now(), i = this.bh(t.changedTouches);
    for (const s of i) {
      const h = this.xo.get(s.id), o = h ? this.Ch(h) : void 0;
      o && this.Fo.set(s.id, o), this.xo.set(s.id, s);
      const c = this.To.get(s.id);
      c && (c.lastPosition = s, c.lastTime = e, o) && _(o.clientX, o.clientY, s.clientX, s.clientY) > this.qo && c.longPressTimer !== null && (window.clearTimeout(c.longPressTimer), c.longPressTimer = null), this.Oo && this.Oo(this.Mh(s, t, o, e));
    }
    this.xo.size === 2 ? this.Fh(t) : this.Po = null;
  }
  oh(t) {
    if (!this.Cn) return;
    t.preventDefault();
    const e = performance.now(), i = this.bh(t.changedTouches);
    for (const r of i) {
      const s = this.xo.get(r.id), h = s ? this.Ch(s) : void 0, o = this.To.get(r.id);
      o && o.longPressTimer !== null && (window.clearTimeout(o.longPressTimer), o.longPressTimer = null), this.Do && this.Do(this.Mh(r, t, h, e)), o && this.Th(o, t), this.To.delete(r.id), this.Fo.delete(r.id), this.xo.delete(r.id);
    }
    this.xo.size < 2 && (this.Po = null);
  }
  hh(t) {
    if (!this.Cn) return;
    t.preventDefault();
    const e = performance.now(), i = this.bh(t.changedTouches);
    for (const r of i) {
      const s = this.xo.get(r.id), h = s ? this.Ch(s) : void 0, o = this.To.get(r.id);
      o && o.longPressTimer !== null && (window.clearTimeout(o.longPressTimer), o.longPressTimer = null), this.Lo && this.Lo(this.Mh(r, t, h, e)), this.To.delete(r.id), this.Fo.delete(r.id), this.xo.delete(r.id);
    }
    this.xo.size < 2 && (this.Po = null);
  }
  bh(t) {
    const e = [];
    for (let i = 0; i < t.length; i += 1) {
      const r = t.item(i);
      r && e.push(this.Ph(r));
    }
    return e;
  }
  Ph(t) {
    return this.ah(t.clientX, t.clientY, t.identifier, { id: t.identifier, x: -1, y: -1, clientX: t.clientX, clientY: t.clientY, pressure: t.force, radiusX: t.radiusX, radiusY: t.radiusY, rotationAngle: t.rotationAngle });
  }
  ah(t, e, i, r) {
    const s = this.gr.canvas, h = s.getBoundingClientRect(), o = t - h.left, c = e - h.top, l = s.width / h.width, u = c * (s.height / h.height), f = o * l - this.Cn.offsetX, g = u - this.Cn.offsetY, p = Math.floor(f / this.Cn.cellWidth), A = Math.floor(g / this.Cn.cellHeight), d = p >= 0 && p < this.Cn.cols && A >= 0 && A < this.Cn.rows;
    return { id: i, x: d ? p : -1, y: d ? A : -1, clientX: t, clientY: e, pressure: r.pressure, radiusX: r.radiusX, radiusY: r.radiusY, rotationAngle: r.rotationAngle };
  }
  Mh(t, e, i, r) {
    const s = this.To.get(t.id), h = Array.from(this.Fo.values()).map((l) => this.Ch(l)), o = Array.from(this.xo.values()).map((l) => this.Ch(l)), c = this.bh(e.changedTouches);
    return { touch: this.Ch(t), previousTouch: i ? this.Ch(i) : void 0, touches: o, previousTouches: h, changedTouches: c, deltaTime: s ? r - s.lastTime : 0, originalEvent: e };
  }
  xh() {
    if (this.xo.size !== 2) return void (this.Po = null);
    const t = Array.from(this.xo.values()), [e, i] = t, r = _(e.x, e.y, i.x, i.y), s = vt(e.clientX, e.clientY, i.clientX, i.clientY);
    this.Po = { ids: [e.id, i.id], initialDistance: Math.max(r, 1e-4), initialAngle: s, lastScale: 1, lastRotation: 0 };
  }
  Fh(t) {
    if (this.Po || this.xh(), !this.Po) return;
    const [e, i] = this.Po.ids, r = this.xo.get(e), s = this.xo.get(i);
    if (!r || !s) return;
    const h = _(r.x, r.y, s.x, s.y) / this.Po.initialDistance, o = h - this.Po.lastScale;
    this.Xo && Math.abs(o) > this.Jo && (this.Xo({ touches: [this.Ch(r), this.Ch(s)], scale: h, deltaScale: o, center: this.Eh(r, s), originalEvent: t }), this.Po.lastScale = h);
    let c = vt(r.clientX, r.clientY, s.clientX, s.clientY) - this.Po.initialAngle;
    c = (c + 180) % 360 - 180;
    const l = c - this.Po.lastRotation;
    this.Yo && Math.abs(l) > this.th && (this.Yo({ touches: [this.Ch(r), this.Ch(s)], rotation: c, deltaRotation: l, center: this.Eh(r, s), originalEvent: t }), this.Po.lastRotation = c);
  }
  Eh(t, e) {
    const i = (t.clientX + e.clientX) / 2, r = (t.clientY + e.clientY) / 2, s = this.ah(i, r, -1, { id: -1, x: -1, y: -1, clientX: i, clientY: r });
    return { x: s.x, y: s.y };
  }
  Th(t, e) {
    const i = performance.now(), r = i - t.startTime, s = _(t.startPosition.clientX, t.startPosition.clientY, t.lastPosition.clientX, t.lastPosition.clientY);
    if (!t.longPressFired && r <= this.Ko && s <= this.Zo)
      this.Rh(t.lastPosition, i) && this.Ho ? this.Ho({ touch: this.Ch(t.lastPosition), taps: 2, originalEvent: e }) : this.Bo && this.Bo({ touch: this.Ch(t.lastPosition), taps: 1, originalEvent: e });
    else if (!t.longPressFired && r <= this.Qo && s >= this.Vo) {
      const h = { x: t.lastPosition.clientX - t.startPosition.clientX, y: t.lastPosition.clientY - t.startPosition.clientY }, o = Math.max(Math.hypot(h.x, h.y), 1e-4), c = { x: h.x / o, y: h.y / o }, l = { x: h.x / r, y: h.y / r };
      this.No && this.No({ touch: this.Ch(t.lastPosition), direction: c, distance: o, velocity: l, originalEvent: e });
    }
    this.eh = i, this.ih = this.Ch(t.lastPosition);
  }
  Rh(t, e) {
    return !this.ih || e - this.eh > this.jo ? !1 : _(t.clientX, t.clientY, this.ih.clientX, this.ih.clientY) <= this.Zo;
  }
  Ch(t) {
    return { ...t };
  }
}
const Me = Object.freeze(Object.defineProperty({ __proto__: null, TouchManager: Lt }, Symbol.toStringTag, { value: "Module" }));
class ht extends st {
  constructor(e, i, r, s, h, o, c, l) {
    const u = h / o;
    let f, g;
    u > 1 ? (f = c, g = Math.round(c / u)) : (g = l, f = Math.round(l * u));
    super(e, i, r, h, o, f, g);
    a(this, "Sh");
    a(this, "$h", !1);
    a(this, "kh", []);
    a(this, "an", null);
    a(this, "zh", 0);
    a(this, "Ih", 0);
    a(this, "Oh", -1);
    this.Sh = s;
  }
  dispose() {
    super.dispose();
    for (const e of this.kh) this.A.deleteTexture(e);
    this.kh = [], this.Sh.pause(), this.Sh.src = "", this.Sh.load();
  }
  Dh() {
    if (!this.$h && this.Sh.readyState >= this.Sh.HAVE_CURRENT_DATA) {
      const e = this.A;
      e.bindTexture(e.TEXTURE_2D, this.Hr), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, this.Sh), e.bindTexture(e.TEXTURE_2D, null);
    }
  }
  tn() {
    if (this.$h && this.kh.length > 0) {
      const e = this.Ih % this.kh.length;
      return this.kh[e];
    }
    return this.Hr;
  }
  ct() {
    return this.Z = null, super.ct();
  }
  Vr() {
    this.Dh();
  }
  async Lh(e, i) {
    var r;
    try {
      if (e <= 0) throw Error("Video preload requires a frameRate greater than 0.");
      const s = this.Sh.duration;
      if (!isFinite(s) || s <= 0) throw Error("Video duration is invalid, cannot preload frames.");
      const h = Math.max(1, Math.ceil(s * e));
      if (this.Bh(e, h), await this.Hh(e, i)) return void this.Gh("captureStream", i);
      await this.Nh(e, i), this.Gh("seeking", i);
    } catch (s) {
      const h = s instanceof Error ? s : Error(s + "");
      throw (r = i == null ? void 0 : i.onError) == null || r.call(i, h), h;
    }
  }
  Bh(e, i) {
    this.an = e, this.zh = i, this.kh = [], this.$h = !1, this.Ih = 0, this.Oh = -1;
  }
  Gh(e, i) {
    var r;
    if (this.kh.length === 0) throw Error(`Video preload via ${e} completed but produced 0 frames.`);
    this.zh = this.kh.length, this.$h = !0, this.Ih = 0, this.Oh = -1, this.Sh.pause(), this.Sh.currentTime = 0, i != null && i.onProgress && i.onProgress({ percent: 100, loadedFrames: this.zh, totalFrames: this.zh, strategy: e }), (r = i == null ? void 0 : i.onComplete) == null || r.call(i, { totalFrames: this.zh, strategy: e });
  }
  Xh(e) {
    const i = this.A, r = i.createTexture();
    return i.bindTexture(i.TEXTURE_2D, r), i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, 1), et(i, i.LINEAR, i.LINEAR, i.CLAMP_TO_EDGE, i.CLAMP_TO_EDGE), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, i.RGBA, i.UNSIGNED_BYTE, e), i.bindTexture(i.TEXTURE_2D, null), r;
  }
  Yh(e, i) {
    if (!(i != null && i.onProgress) || this.zh === 0) return;
    const r = Math.min(99, Math.floor(this.kh.length / this.zh * 100)), s = 10 * Math.floor(r / 10);
    s > this.Oh && (this.Oh = s, i.onProgress({ percent: r, loadedFrames: this.kh.length, totalFrames: this.zh, strategy: e }));
  }
  async Hh(e, i) {
    const r = globalThis, s = r == null ? void 0 : r.MediaStreamTrackProcessor, h = this.Sh.captureStream;
    if (typeof s != "function" || typeof h != "function") return !1;
    let o, c = null;
    try {
      const l = h.call(this.Sh);
      if (o = l.getVideoTracks()[0], !o) return l.getTracks().forEach((g) => g.stop()), !1;
      if (c = new s({ track: o }).readable.getReader(), this.Sh.currentTime = 0, this.Sh.muted = !0, await this.Sh.play().catch(() => {
      }), this.Sh.paused) return !1;
      const u = 1e6 / e;
      let f = 0;
      for (; this.kh.length < this.zh; ) {
        const g = await c.read();
        if (g.done) break;
        const p = g.value;
        if (p) try {
          const A = typeof p.timestamp == "number" ? p.timestamp : f;
          (this.kh.length === 0 || A >= f) && (this.kh.push(this.Xh(p)), f = A + u, this.Yh("captureStream", i));
        } finally {
          p.close();
        }
      }
      return c.releaseLock(), o.stop(), c = null, o = void 0, this.Sh.pause(), this.Sh.currentTime = 0, this.kh.length !== 0;
    } catch {
      return this.kh = [], this.Oh = -1, !1;
    } finally {
      if (c) try {
        await c.cancel();
      } catch {
      }
      o && o.stop(), this.Sh.pause(), this.Sh.currentTime = 0;
    }
  }
  async Nh(e, i) {
    const r = 1 / e, s = this.zh, h = this.Sh;
    h.pause();
    for (let o = 0; o < s; o++) {
      const c = Math.min(h.duration, o * r);
      await this.Kh(c), this.kh.push(this.Xh(h)), this.Yh("seeking", i);
    }
    h.currentTime = 0;
  }
  Kh(e) {
    return new Promise((i, r) => {
      const s = this.Sh, h = () => {
        s.removeEventListener("seeked", o), s.removeEventListener("error", c);
      }, o = () => {
        h(), i();
      }, c = () => {
        h(), r(Error("Video seek failed while preloading frames."));
      };
      s.addEventListener("seeked", o, { once: !0 }), s.addEventListener("error", c, { once: !0 });
      const l = isFinite(s.duration) ? s.duration : e, u = Math.min(Math.max(e, 0), l);
      if (Math.abs(s.currentTime - u) < 1e-4) return h(), void i();
      s.currentTime = u;
    });
  }
  frame(e) {
    return this.$h && e !== void 0 && this.zh > 0 && (this.Ih = (e % this.zh + this.zh) % this.zh, this.Z = null), this;
  }
  static async sn(e, i, r, s, h, o) {
    const c = e.context, l = o == null ? void 0 : o.frameRate;
    let u;
    if (typeof i == "string") {
      if (u = document.createElement("video"), u.crossOrigin = "anonymous", u.loop = !0, u.muted = !0, u.playsInline = !0, await new Promise((d, v) => {
        u.addEventListener("loadedmetadata", () => d(), { once: !0 }), u.addEventListener("error", (m) => {
          var y;
          const E = m.target;
          v(Error("Failed to load video: " + (((y = E.error) == null ? void 0 : y.message) || "Unknown error")));
        }, { once: !0 }), u.src = i;
      }), !l) try {
        await u.play();
      } catch (d) {
        console.warn("Video autoplay prevented - you may need to call video.play() after user interaction:", d);
      }
    } else u = i, u.readyState < u.HAVE_METADATA && await new Promise((d, v) => {
      u.addEventListener("loadedmetadata", () => d(), { once: !0 }), u.addEventListener("error", (m) => {
        var E;
        return v(Error("Video error: " + ((E = m.target.error) == null ? void 0 : E.message)));
      }, { once: !0 });
    });
    const f = c.createTexture();
    c.bindTexture(c.TEXTURE_2D, f), c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, 1), et(c, c.LINEAR, c.LINEAR, c.CLAMP_TO_EDGE, c.CLAMP_TO_EDGE), c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, u), c.bindTexture(c.TEXTURE_2D, null);
    const g = u.videoWidth, p = u.videoHeight, A = new ht(c, e, f, u, g, p, r, s);
    return A.Zr = h, l && l > 0 && await A.Lh(l, o), A;
  }
  async play() {
    await this.Sh.play();
  }
  pause() {
    this.Sh.pause();
  }
  stop() {
    this.Sh.pause(), this.Sh.currentTime = 0;
  }
  speed(e) {
    return this.Sh.playbackRate = e, this;
  }
  loop(e = !0) {
    return this.Sh.loop = e, this;
  }
  time(e) {
    return this.Sh.currentTime = e, this;
  }
  volume(e) {
    return this.Sh.volume = Math.max(0, Math.min(1, e)), this;
  }
  get texture() {
    return this.Hr;
  }
  get width() {
    return this.H;
  }
  get height() {
    return this.G;
  }
  get originalWidth() {
    return this.Gr;
  }
  get originalHeight() {
    return this.Nr;
  }
  get videoElement() {
    return this.Sh;
  }
  get currentTime() {
    return this.Sh.currentTime;
  }
  get duration() {
    return this.Sh.duration;
  }
  get isPlaying() {
    return !this.Sh.paused && !this.Sh.ended;
  }
  get isPreloaded() {
    return this.$h;
  }
  get totalFrames() {
    return this.zh;
  }
  get preloadFrameRate() {
    return this.an;
  }
  get currentFrameIndex() {
    return this.Ih;
  }
}
const Pe = (n) => class extends n {
  jh(t, e, i, r) {
    if (F.Br(t)) return t;
    if (typeof t == "number" || typeof t == "string") return this.color(t, e, i, r);
    throw Error("Unsupported color input passed to color-capable method.");
  }
  rotate(t = 0, e = 0, i = 0) {
    this.j.state.Wt(t), this.j.state.qt(e), this.j.state.Vt(i);
  }
  rotateX(t) {
    this.j.state.Wt(t);
  }
  rotateY(t) {
    this.j.state.qt(t);
  }
  rotateZ(t) {
    this.j.state.Vt(t);
  }
  translate(t = 0, e = 0, i = 0) {
    this.j.state.Qt(t, e, i);
  }
  translateX(t) {
    this.j.state.Qt(t, 0, 0);
  }
  translateY(t) {
    this.j.state.Qt(0, t, 0);
  }
  translateZ(t) {
    this.j.state.Qt(0, 0, t);
  }
  push() {
    this.j.state.rt();
  }
  pop() {
    this.j.state.nt();
  }
  color(t, e, i, r) {
    if (F.Br(t)) return t;
    if (typeof t == "string") {
      const s = Array.from(t);
      if (s.length === 1) {
        const h = s[0], o = this.Yi.Ni(h);
        return F.Lr(o);
      }
      return F.Dr(t);
    }
    if (typeof t == "number") return typeof e == "number" && typeof i == "number" ? F.Ir(t, e, i, r ?? 255) : typeof e == "number" && i === void 0 ? F.Or(t, e) : F.Or(t, r ?? 255);
    throw Error("Unsupported color input passed to color().");
  }
  rect(t = 1, e = 1) {
    this.j.ii(t, e);
  }
  point() {
    this.j.ii(1, 1);
  }
  line(t, e, i, r) {
    this.j.ri(t, e, i, r);
  }
  lineWeight(t) {
    this.j.state.jt(t);
  }
  background(t, e, i, r = 255) {
    const s = this.jh(t, e, i, r);
    this.j.li(s.r, s.g, s.b, s.a);
  }
  char(t) {
    if (F.Br(t)) {
      const i = t.character;
      return void (i && this.j.state.es(i));
    }
    const e = Array.from(t);
    if (e.length === 0) throw Error("char() requires at least one character.");
    this.j.state.es(this.Yi.Ni(e[0]));
  }
  charColor(t, e, i, r) {
    const s = this.jh(t, e, i, r);
    this.j.state.rs(s.r, s.g, s.b, s.a);
  }
  cellColor(t, e, i, r) {
    const s = this.jh(t, e, i, r);
    this.j.state.ns(s.r, s.g, s.b, s.a);
  }
  flipX(t) {
    this.j.state.hs(t);
  }
  flipY(t) {
    this.j.state.cs(t);
  }
  charRotation(t) {
    this.j.state.us(t);
  }
  invert(t) {
    this.j.state.ls(t);
  }
  clear() {
    this.j.li(0, 0, 0, 0);
  }
  ellipse(t, e) {
    this.j.ni(t / 2, e / 2);
  }
  triangle(t, e, i, r, s, h) {
    this.j.oi(t, e, i, r, s, h);
  }
  bezierCurve(t, e, i, r, s, h, o, c) {
    this.j.hi(t, e, i, r, s, h, o, c);
  }
  arc(t, e, i, r) {
    this.j.ai(t / 2, e / 2, i, r);
  }
  shader(t) {
    this.j.Qe(t);
  }
  setUniform(t, e) {
    this.j.O(t, e);
  }
  setUniforms(t) {
    this.j.Je(t);
  }
  createFilterShader(t) {
    return this.j.ti(t);
  }
  createFramebuffer(t) {
    return this.j.ci(t.width ?? this.grid.cols, t.height ?? this.grid.rows, 3);
  }
  image(t, e, i) {
    this.j.si(t, e, i);
  }
  ortho() {
    this.j.state.ds(!0);
  }
  async loadImage(t) {
    if (typeof t != "string") return j.sn(this.j, t, this.Cn.cols, this.Cn.rows, (r) => this.Yi.Xi(r));
    const e = t, i = await new Promise((r, s) => {
      const h = new Image();
      h.crossOrigin = "anonymous", h.onload = () => r(h), h.onerror = (o) => s(o), h.src = e;
    });
    return j.sn(this.j, i, this.Cn.cols, this.Cn.rows, (r) => this.Yi.Xi(r));
  }
  async loadVideo(t, e) {
    return ht.sn(this.j, t, this.Cn.cols, this.Cn.rows, (i) => this.Yi.Xi(i), e);
  }
}, Se = (n) => class extends n {
  async loadFont(t) {
    return this.Yi.cr(t).then(() => {
      const e = this.Yi.maxGlyphDimensions;
      this.Cn.yr(e.width, e.height), this.Zh.resize(this.Cn.cols, this.Cn.rows), this.j.ui(), this.Mo.Xn(), this.Wh.Xn();
    });
  }
  fontSize(t) {
    if (!V.m(typeof t == "number" && t > 0, "Font size must be a positive number greater than 0.", { method: "fontSize", providedValue: t }) || this.Yi.fontSize === t) return;
    this.Yi.ar(t);
    const e = this.Yi.maxGlyphDimensions;
    this.Cn.yr(e.width, e.height), this.Zh.resize(this.Cn.cols, this.Cn.rows), this.j.ui(), this.Mo.Xn(), this.Wh.Xn();
  }
}, Le = (n) => class extends n {
  get frameCount() {
    return this.qh.wn;
  }
  set frameCount(t) {
    this.qh.wn = t;
  }
  frameRate(t) {
    return t === void 0 ? this.qh.yn : this.qh.mn(t, () => this.Vh());
  }
  noLoop() {
    this.qh.vn();
  }
  loop() {
    this.qh.gn(() => this.Vh());
  }
  redraw(t = 1) {
    if (V.m(typeof t == "number" && t > 0 && Number.isInteger(t), "Redraw count must be a positive integer.", { method: "redraw", providedValue: t })) for (let e = 0; e < t; e++) this.Vh();
  }
  isLooping() {
    return this.qh.An;
  }
}, Ue = (n) => class extends n {
  constructor(...t) {
    super(...t);
  }
  mouseClicked(t) {
    this.Mo.Jn(t);
  }
  mousePressed(t) {
    this.Mo.so(t);
  }
  mouseReleased(t) {
    this.Mo.eo(t);
  }
  mouseMoved(t) {
    this.Mo.io(t);
  }
  mouseScrolled(t) {
    this.Mo.ro(t);
  }
  get mouse() {
    return this.Mo.no();
  }
  cursor(t) {
    this.Mo.Nn(t);
  }
}, Ne = (n) => class extends n {
  constructor(...t) {
    super(...t);
  }
  touchStarted(t) {
    this.Wh.fh(t);
  }
  touchMoved(t) {
    this.Wh.io(t);
  }
  touchEnded(t) {
    this.Wh.dh(t);
  }
  touchCancelled(t) {
    this.Wh.ph(t);
  }
  tap(t) {
    this.Wh.gh(t);
  }
  doubleTap(t) {
    this.Wh.mh(t);
  }
  longPress(t) {
    this.Wh._h(t);
  }
  swipe(t) {
    this.Wh.Ah(t);
  }
  pinch(t) {
    this.Wh.yh(t);
  }
  rotateGesture(t) {
    this.Wh.wh(t);
  }
  get touches() {
    return this.Wh.uh();
  }
}, Be = (n) => class extends n {
  constructor(...t) {
    super(...t);
  }
  keyPressed(t) {
    this.Qh.so(t);
  }
  keyReleased(t) {
    this.Qh.eo(t);
  }
  isKeyPressed(t) {
    return this.Qh.mo(t);
  }
  get lastKeyPressed() {
    return this.Qh.Ao();
  }
  get lastKeyReleased() {
    return this.Qh.yo();
  }
  get pressedKeys() {
    return this.Qh.wo();
  }
  get modifierState() {
    return this.Qh.bo();
  }
};
class Ie {
  constructor(t) {
    a(this, "Jh");
    a(this, "ta", /* @__PURE__ */ new Map());
    a(this, "sa", []);
    a(this, "ea", /* @__PURE__ */ new Map());
    a(this, "ia", /* @__PURE__ */ new Map());
    this.Jh = t;
  }
  async ra(t) {
    for (const e of t) {
      if (this.ta.has(e.name)) return void console.warn(`[textmode.js] Plugin "${e.name}" is already installed.`);
      const i = this.na(e.name);
      try {
        await e.install(this.Jh, i);
      } catch (r) {
        throw this.oa(e.name), r;
      }
      this.ta.set(e.name, e), this.sa.push(e.name);
    }
  }
  async ha(t) {
    const e = this.ta.get(t);
    if (!e) return;
    const i = this.na(t);
    e.uninstall && await e.uninstall(this.Jh, i), this.ta.delete(t), this.sa.splice(this.sa.indexOf(t), 1), this.oa(t);
  }
  aa() {
    this.ca(this.ea);
  }
  la() {
    this.ca(this.ia);
  }
  async ua() {
    const t = [...this.ta.keys()];
    for (const e of t) await this.ha(e);
  }
  na(t) {
    return { renderer: this.Jh.j, font: this.Jh.Yi, grid: this.Jh.Cn, canvas: this.Jh.gr, drawFramebuffer: this.Jh.Zh, asciiFramebuffer: this.Jh.fa, registerPreDrawHook: (e) => this.da(this.ea, t, e), registerPostDrawHook: (e) => this.da(this.ia, t, e) };
  }
  da(t, e, i) {
    const r = t.get(e) ?? /* @__PURE__ */ new Set();
    return r.add(i), t.set(e, r), () => {
      const s = t.get(e);
      s && (s.delete(i), s.size === 0 && t.delete(e));
    };
  }
  oa(t) {
    this.ea.delete(t), this.ia.delete(t);
  }
  ca(t) {
    for (const e of this.sa) {
      const i = t.get(e);
      i && i.forEach((r) => r());
    }
  }
}
const Tt = `#version 300 es
in vec2 A0;in vec2 A1;out vec2 v_uv;void main(){v_uv=A1;gl_Position=vec4(A0,0.,1.);}`;
class Ut {
  constructor() {
    a(this, "pa", /* @__PURE__ */ new Map());
    a(this, "va", []);
    a(this, "ga", 0);
    a(this, "ma", 0);
    a(this, "_a");
  }
  get totalWeight() {
    return this.ga;
  }
  get progress() {
    if (this.ga === 0) return 0;
    let t = 0;
    for (const e of this.va) {
      const i = this.pa.get(e);
      i && (t += Math.min(1, Math.max(0, i.progress)) * i.weight);
    }
    return Math.min(1, t / this.ga);
  }
  setProgressChangeCallback(t) {
    this._a = t;
  }
  createPhase(t, e = 1) {
    const i = `phase-${this.va.length + 1}-${Date.now()}`, r = { id: i, label: t, weight: Math.max(1e-3, e), progress: 0, status: "running" };
    return this.pa.set(i, r), this.va.push(i), this.ga += r.weight, i;
  }
  updatePhaseProgress(t, e) {
    const i = this.pa.get(t);
    if (!i) return;
    i.progress = Math.max(0, Math.min(1, e)), i.status = i.progress >= 1 ? "complete" : "running";
    const r = this.progress;
    Math.abs(r - this.ma) > 1e-3 && (this.ma = r, this._a && this._a(r));
  }
  completePhase(t) {
    const e = this.pa.get(t);
    e && (e.progress = 1, e.status = "complete", this.updatePhaseProgress(t, 1));
  }
  failPhase(t) {
    const e = this.pa.get(t);
    e && (e.status = "failed");
  }
  snapshotPhases() {
    return this.va.map((t) => {
      const e = this.pa.get(t);
      return e ? { id: e.id, label: e.label, weight: e.weight, progress: e.progress, status: e.status } : { id: t, label: t, weight: 1, progress: 0, status: "pending" };
    });
  }
}
class Nt {
  constructor(t = "active") {
    a(this, "ya");
    a(this, "wa", "");
    a(this, "ba", "");
    this.ya = t;
  }
  get state() {
    return this.ya;
  }
  get isEnabled() {
    return this.ya !== "disabled";
  }
  get shouldRender() {
    return this.ya === "active" || this.ya === "transitioning" || this.ya === "error";
  }
  get errorMessage() {
    return this.wa;
  }
  get errorDetails() {
    return this.ba;
  }
  activate() {
    this.ya !== "done" && this.ya !== "transitioning" || (this.ya = "active");
  }
  finish() {
    this.ya !== "disabled" && (this.ya = "done");
  }
  startTransition() {
    this.ya !== "disabled" && (this.ya = "transitioning");
  }
  completeTransition() {
    this.ya === "transitioning" && (this.ya = "done");
  }
  setError(t) {
    this.ya !== "disabled" && (this.ya = "error", t instanceof Error ? (this.wa = t.message, this.ba = t.stack || "") : (this.wa = t, this.ba = ""));
  }
  disable() {
    this.ya = "disabled";
  }
}
class Bt {
  constructor(t, e) {
    a(this, "Ca", 0);
    a(this, "Ma", 1);
    a(this, "xa");
    a(this, "Fa");
    this.xa = t, this.Fa = e;
  }
  get opacity() {
    return this.Ma;
  }
  get isTransitioning() {
    return this.Ma < 1;
  }
  start() {
    this.xa !== "none" && this.Fa > 0 && (this.Ca = performance.now());
  }
  update() {
    if (this.xa === "none" || this.Fa === 0) return this.Ma = 1, !1;
    const t = performance.now() - this.Ca, e = Math.min(1, t / this.Fa);
    return e >= 1 ? (this.Ma = 0, !0) : (this.Ma = 1 - e, !1);
  }
  reset() {
    this.Ma = 1, this.Ca = 0;
  }
}
function pt(n, t) {
  const e = n.tone ?? "auto";
  let i = "dark";
  return e === "light" || e === "dark" ? i = e : t && (i = function(r) {
    if (!r) return 0;
    const [s, h, o] = r.map((l) => l / 255), c = (l) => l <= 0.04045 ? l / 12.92 : Math.pow((l + 0.055) / 1.055, 2.4);
    return 0.2126 * c(s) + 0.7152 * c(h) + 0.0722 * c(o);
  }(t) > 0.5 ? "light" : "dark"), { mode: i, background: t, textColor: i === "light" ? "#1A1A1A" : "#F8F8F8", subtleColor: i === "light" ? "#4A4A4A" : "#C0C0C0" };
}
function It(n) {
  return n.mode === "light" ? ["#E91E63", "#9C27B0", "#FF6F00"] : ["#8EF9F3", "#F15BB5", "#FF9B71"];
}
function Dt(n, t) {
  return n.length ? n.map((e) => t.color(e)) : [t.color("#FFFFFF")];
}
const De = ({ textmodifier: n, grid: t, progress: e, frameCount: i, message: r, palette: s, theme: h, phases: o, transitionOpacity: c, isError: l, errorMessage: u }) => {
  const f = "|/-\\", g = Math.floor(i / 6) % 4, p = n.color(h.textColor), A = Math.floor(255 * c), d = n.color(p.r, p.g, p.b, A);
  if (n.charColor(d), n.cellColor(0, 0, 0, 0), l) {
    const v = n.color(h.mode === "light" ? "#D32F2F" : "#FF6B6B", A);
    n.charColor(v), n.push(), n.translate(0, -2, 0), n.char("X"), n.rect(1, 1), n.pop();
    const m = "SETUP ERROR", E = -Math.floor(m.length / 2);
    n.push(), n.translate(E, 0, 0);
    for (const y of m) n.char(y), n.rect(1, 1), n.translateX(1);
    if (n.pop(), u) {
      const y = n.color(h.subtleColor), T = n.color(y.r, y.g, y.b, A);
      n.charColor(T);
      const w = Math.floor(0.8 * t.cols), x = u.split(" "), S = [];
      let C = "";
      for (const M of x) (C + " " + M).length <= w ? C = C ? C + " " + M : M : (C && S.push(C), C = M);
      C && S.push(C);
      const U = S.slice(0, 3);
      S.length > 3 && (U[2] = U[2].substring(0, w - 3) + "..."), U.forEach((M, Q) => {
        const Gt = -Math.floor(M.length / 2);
        n.push(), n.translate(Gt, 3 + Q, 0);
        for (const zt of M) n.char(zt), n.rect(1, 1), n.translateX(1);
        n.pop();
      });
    }
    return;
  }
  if (n.push(), n.translate(0, 0, 0), n.char(f[g]), n.rect(1, 1), n.pop(), e > 0 || o.some((v) => v.status !== "pending")) {
    const v = Math.max(6, Math.floor(0.6 * t.cols)), m = -Math.floor(v / 2), E = Math.floor(v * e), y = s.length ? s : [n.color("#FFFFFF")];
    n.push(), n.translate(m, 3, 0);
    for (let T = 0; T < v; T++) {
      const w = T < E ? "*" : ".", x = y[T % y.length], S = n.color(x.r, x.g, x.b, A);
      n.charColor(S), n.char(w), n.rect(1, 1), n.translateX(1);
    }
    n.pop();
  }
  if (r) {
    const v = n.color(h.subtleColor), m = n.color(v.r, v.g, v.b, A);
    n.charColor(m);
    const E = -Math.floor(r.toUpperCase().length / 2);
    n.push(), n.translate(E, 5, 0);
    for (const y of r.toUpperCase()) n.char(y), n.rect(1, 1), n.translateX(1);
    n.pop();
  }
}, Oe = { message: "loading...", tone: "auto", transition: "fade", transitionDuration: 500 };
class Ge {
  constructor(t, e, i) {
    this.Ta = t, this.id = e, this.label = i;
  }
  report(t) {
    this.Ta.updatePhaseProgress(this.id, t);
  }
  complete() {
    this.Ta.completePhase(this.id);
  }
  fail(t) {
    this.Ta.failPhase(this.id);
  }
  async track(t) {
    try {
      const e = typeof t == "function" ? await t() : await t;
      return this.complete(), e;
    } catch (e) {
      throw this.fail(), e;
    }
  }
}
class Ot {
  constructor(t, e, i) {
    a(this, "Jh");
    a(this, "l");
    a(this, "Pa");
    a(this, "Ta");
    a(this, "Ea");
    a(this, "j");
    a(this, "Ra", []);
    a(this, "Sa");
    a(this, "$a", performance.now());
    a(this, "Ia");
    this.Jh = t, this.l = { ...Oe, ...e ?? {} }, this.Pa = new Nt("active"), this.Ta = new Ut(), this.Ea = new Bt(this.l.transition, this.l.transitionDuration), this.Sa = pt(this.l, i);
    const r = It(this.Sa);
    this.Ra = Dt(r, this.Jh), this.j = this.ka(), this.Ta.setProgressChangeCallback((s) => {
      s >= 0.999 && this.finish();
    });
  }
  get shouldRender() {
    return this.Pa.shouldRender;
  }
  get progress() {
    return this.Ta.progress;
  }
  message(t) {
    return typeof t == "string" && (this.l.message = t), this.l.message;
  }
  addPhase(t, e = 1) {
    this.Pa.activate();
    const i = this.Ta.createPhase(t, e);
    return new Ge(this.Ta, i, t);
  }
  finish() {
    this.l.transition !== "none" && this.l.transitionDuration > 0 ? (this.Pa.startTransition(), this.Ea.start()) : (this.Pa.finish(), this.za());
  }
  za() {
    this.Ia && this.Ia();
  }
  setOnComplete(t) {
    this.Ia = t;
  }
  error(t) {
    this.Pa.setError(t);
  }
  renderFrame(t) {
    if (!this.shouldRender) return;
    const e = this.Jh.Oa;
    if (e) {
      if (this.Pa.state === "transitioning" && this.Ea.update())
        return this.Pa.completeTransition(), void this.za();
      this.Jh.clear(), this.Jh.push();
      try {
        const i = { textmodifier: this.Jh, grid: e, progress: this.progress, elapsedMs: performance.now() - this.$a, frameCount: t, message: this.l.message, palette: this.Ra, theme: this.Sa, phases: this.Ta.snapshotPhases(), transitionOpacity: this.Ea.opacity, isError: this.Pa.state === "error", errorMessage: this.Pa.errorMessage || void 0, errorDetails: this.Pa.errorDetails || void 0 };
        this.j(i);
      } finally {
        this.Jh.pop();
      }
    }
  }
  updateBackgroundColor(t) {
    this.Sa = pt(this.l, t);
  }
  ka() {
    const t = this.l.renderer || De;
    return (e) => {
      t(e), this.Da(e);
    };
  }
  Da(t) {
    const { textmodifier: e, grid: i, frameCount: r, theme: s, transitionOpacity: h } = t, o = [116, 101, 120, 116, 109, 111, 100, 101, 46, 106, 115].map((f) => String.fromCharCode(f)).join(""), c = (i.rows + 1 >> 1) - 2, l = 2 - (i.cols + 1 >> 1), u = s.mode === "light" ? [[255, 107, 107], [78, 205, 196], [69, 183, 209], [255, 160, 122], [152, 216, 200]] : [[255, 107, 157], [199, 128, 250], [78, 205, 196], [255, 217, 61], [107, 207, 127]];
    e.push(), e.translate(l, c, 0);
    for (let f = 0; f < o.length; f++) {
      const g = o[f], p = Math.floor(0.1 * r + 0.5 * f) % u.length, [A, d, v] = u[p], m = Math.floor(255 * h), E = e.color(A, d, v, m);
      e.charColor(E), e.char(g), e.rect(1, 1), e.translateX(1);
    }
    e.pop();
  }
}
class ze extends function(e, ...i) {
  return i.reduce((r, s) => s(r), e);
}(class {
}, Pe, Se, Le, Ue, Ne, Be) {
  constructor(e = {}) {
    super();
    a(this, "j");
    a(this, "Yi");
    a(this, "gr");
    a(this, "Cn");
    a(this, "qh");
    a(this, "Mo");
    a(this, "Wh");
    a(this, "Qh");
    a(this, "La");
    a(this, "Ba");
    a(this, "Oa");
    a(this, "Ha");
    a(this, "Ga");
    a(this, "Zh");
    a(this, "Na");
    a(this, "fa");
    a(this, "Xa");
    a(this, "Ya");
    a(this, "Ka", !1);
    a(this, "ja", !1);
    a(this, "Za", !1);
    a(this, "Wa", !1);
    a(this, "qa", () => {
    });
    a(this, "Va", () => {
    });
    a(this, "Qa", () => {
    });
    a(this, "Ja");
    a(this, "tc");
    a(this, "br", !1);
    a(this, "sc");
    this.Ya = new Ie(this), this.br = e.overlay ?? !1, this.gr = new be(e), this.j = new he(this.gr.$r()), this.Yi = new gt(this.j, e.fontSize ?? 16), this.Ba = new gt(this.j, 16), this.qh = new Ce(e.frameRate ?? 60), this.La = new Ot(this, e.loadingScreen, this.gr.Rr()), this.La.setOnComplete(() => {
      this.qh.wn = 0, this.Wa = !0;
    }), this.Mo = new Pt(this.gr), this.Wh = new Lt(this.gr, this.Mo), this.Qh = new St(), this.Na = this.j.Ve(Tt, `#version 300 es
precision highp float;uniform sampler2D U0;uniform vec2 U1;uniform sampler2D U3;uniform sampler2D U4;uniform sampler2D U2;uniform vec2 U5;uniform vec2 U6;uniform vec4 U7;in vec2 v_uv;out vec4 fragColor;mat2 A(float B){float C=sin(B);float D=cos(B);return mat2(D,-C,C,D);}void main(){vec2 E=gl_FragCoord.xy/U6;vec2 F=E*U5;vec2 G=floor(F);vec2 H=(G+0.5)/U5;vec4 I=texture(U3,H);vec4 J=texture(U4,H);vec4 K=texture(U2,H);int L=int(K.b*255.+0.5);bool M=(L&1)!=0;bool N=(L&2)!=0;bool O=(L&4)!=0;int P=int(K.r*255.+0.5)+int(K.g*255.+0.5)*256;int Q=int(U1.x);int R=P/Q;int S=P-(R*Q);float T=(U1.y-1.)-float(R);vec2 U=1./U1;vec2 V=vec2(float(S),T)*U;vec2 W=V+U;float X=-K.a*360.*0.017453292;vec2 Y=fract(F)-0.5f;vec2 Z=vec2(N?-1.:1.,O?-1.:1.);Y*=Z;Y=A(X)*Y+0.5;vec2 a=V+clamp(Y,0.,1.)*U;const float b=0.0001;if(any(lessThan(a,V-b))||any(greaterThan(a,W+b))){fragColor=M?I:J;return;}vec4 c=texture(U0,a);if(M)c.rgb=mix(c.rgb,1.-c.rgb,float(M));vec4 d=mix(U7,J,J.a);fragColor=mix(d,I,c);}`), this.ec(e);
  }
  async ec(e) {
    await Promise.all([this.Yi.rr(e.fontSource), this.Ba.rr(e.fontSource)]);
    const i = this.Yi.maxGlyphDimensions;
    this.Cn = new wt(this.gr.canvas, i.width, i.height);
    const r = this.Ba.maxGlyphDimensions;
    this.Oa = new wt(this.gr.canvas, r.width, r.height), this.Mo.rr(this.Cn), this.Wh.rr(this.Cn), this.Zh = this.j.ci(this.Cn.cols, this.Cn.rows, 3), this.Ha = this.j.ci(this.Oa.cols, this.Oa.rows, 3), this.fa = this.j.ci(this.Cn.width, this.Cn.height, 1), this.Ga = this.j.ci(this.Oa.width, this.Oa.height, 1), this.br && (this.sc = j.sn(this.j, this.gr.targetCanvas, this.Cn.cols, this.Cn.rows, (s) => this.Yi.Xi(s))), this.Xa = this.j.Ve(Tt, `#version 300 es
precision highp float;uniform sampler2D U8;uniform vec2 U9;uniform vec2 Ua;uniform vec2 Ub;in vec2 v_uv;out vec4 fragColor;void main(){vec2 A=gl_FragCoord.xy-Ua;vec2 B=A*(U9/Ub);vec2 C=(floor(B)+0.5)/U9;fragColor=texture(U8,C);}`), this.rc(), this.qh.dn(() => this.Vh()), await this.Ya.ra(e.plugins ?? []);
    try {
      await this.qa(), this.La.finish();
    } catch (s) {
      console.error("Error during setup:", s), this.La.error(s);
    }
  }
  rc() {
    this.Ja = () => {
      this.br && this.resizeCanvas(this.gr.targetCanvas.width, this.gr.targetCanvas.height), this.Qa();
    }, window.addEventListener("resize", this.Ja), this.Mo.Yn(), this.Wh.Yn(), this.Qh.Yn(), window.addEventListener("blur", () => {
      this.Qh.Co();
    }), this.br && (this.tc = new ResizeObserver(() => {
      this.resizeCanvas(this.gr.targetCanvas.width, this.gr.targetCanvas.height);
    }), this.tc.observe(this.gr.targetCanvas));
  }
  Vh() {
    this.ja = !0;
    try {
      this.qh._n(), this.qh.bn(), this.br && xt(this.j.context, this.sc.texture, this.gr.targetCanvas);
      const e = this.La.shouldRender, i = this.Wa && !e;
      i && this.Ya.aa(), this.j.state.Zt();
      const r = e ? this.Ha : this.Zh, s = e ? this.Ba : this.Yi, h = e ? this.Oa : this.Cn, o = e ? this.Ga : this.fa;
      r.begin(), e ? this.La.renderFrame(this.qh.wn) : i && this.Va(), r.end(), o.begin(), this.j.qe(this.Na), this.Na.I({ U0: s.fontFramebuffer, U1: [s.textureColumns, s.textureRows], U2: r.textures[0], U3: r.textures[1], U4: r.textures[2], U5: [h.cols, h.rows], U6: [o.width, o.height], U7: this.j.state.canvasBackgroundColor }), this.j.ei(0, 0, this.gr.width, this.gr.height), o.end(), this.j.De(...this.j.state.canvasBackgroundColor), this.j.qe(this.Xa), this.Xa.I({ U8: o.textures[0], U9: [o.width, o.height], Ua: [h.offsetX, h.offsetY], Ub: [h.width, h.height] }), this.j.ei(h.offsetX, h.offsetY, h.width, h.height), i && this.Ya.la();
    } finally {
      this.ja = !1, this.Ka && !this.Za && this.nc();
    }
  }
  resizeCanvas(e, i) {
    this.gr.Sr(e, i), this.La.updateBackgroundColor(this.gr.Rr()), this.Cn.Ar(), this.Oa.Ar(), this.Zh.resize(this.Cn.cols, this.Cn.rows), this.fa.resize(this.Cn.width, this.Cn.height), this.Ha.resize(this.Oa.cols, this.Oa.rows), this.Ga.resize(this.Oa.width, this.Oa.height), this.j.ui(), this.Mo.Xn(), this.Wh.Xn(), this.Vh();
  }
  destroy() {
    this.Za || this.Ka || (this.Ka = !0, this.qh.vn(), this.ja || this.nc());
  }
  nc() {
    var e, i;
    this.Ka = !1, this.Ya.ua(), window.removeEventListener("resize", this.Ja), (e = this.tc) == null || e.disconnect(), this.Mo.Qn(), this.Wh.Qn(), this.Qh.Qn(), this.Zh.L(), this.Ha.L(), this.Na.L(), this.Yi.L(), this.Ba.L(), this.j.L(), this.fa.L(), this.Ga.L(), this.Xa.L(), (i = this.sc) == null || i.dispose(), this.gr.L(), this.Za = !0;
  }
  setup(e) {
    this.qa = e;
  }
  draw(e) {
    this.Va = e;
  }
  windowResized(e) {
    this.Qa = e;
  }
  get grid() {
    return this.Cn;
  }
  get font() {
    return this.Yi;
  }
  get width() {
    return this.gr.width;
  }
  get height() {
    return this.gr.height;
  }
  get canvas() {
    return this.gr.canvas;
  }
  get drawFramebuffer() {
    return this.Zh;
  }
  get isDisposed() {
    return this.Za;
  }
  get overlay() {
    return this.sc;
  }
  get loading() {
    return this.La;
  }
}
class mt {
  constructor() {
  }
  static create(t = {}) {
    return new ze(t);
  }
  static setErrorLevel(t) {
    V._(t);
  }
  static get version() {
    return "0.6.0-beta.1";
  }
}
const Ye = Object.freeze(Object.defineProperty({ __proto__: null, LoadingPhaseTracker: Ut, LoadingScreenManager: Ot, LoadingScreenStateMachine: Nt, LoadingScreenTransition: Bt, resolveColorInputs: Dt, resolveDefaultPalette: It, resolveTheme: pt }, Symbol.toStringTag, { value: "Module" })), je = Object.freeze(Object.defineProperty({ __proto__: null, TextmodeFont: gt, TextmodeImage: j, TextmodeVideo: ht }, Symbol.toStringTag, { value: "Module" })), He = Object.freeze(Object.defineProperty({ __proto__: null, keyboard: Fe, mouse: Re, touch: Me }, Symbol.toStringTag, { value: "Module" })), _e = mt.create, We = mt.setErrorLevel, ke = mt.version;
export {
  be as TextmodeCanvas,
  F as TextmodeColor,
  jt as TextmodeErrorLevel,
  it as TextmodeFramebuffer,
  wt as TextmodeGrid,
  ze as Textmodifier,
  _e as create,
  He as input,
  je as loadables,
  Ye as loading,
  We as setErrorLevel,
  mt as textmode,
  ke as version
};
