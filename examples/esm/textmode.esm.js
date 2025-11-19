var Gt = Object.defineProperty;
var zt = (n, t, e) => t in n ? Gt(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var a = (n, t, e) => zt(n, typeof t != "symbol" ? t + "" : t, e);
class B extends Error {
  constructor(t, e = {}) {
    super(B.i(t, e)), this.name = "TextmodeError";
  }
  static i(t, e) {
    return `${t}${e && Object.keys(e).length > 0 ? `

📋 Context:` + Object.entries(e).map(([i, r]) => `
  - ${i}: ${B.o(r)}`).join("") : ""}

${"↓".repeat(24)}
`;
  }
  static o(t) {
    if (t === null) return "null";
    if (t === void 0) return "undefined";
    if (typeof t == "string") return `"${t}"`;
    if (typeof t == "number" || typeof t == "boolean") return t + "";
    if (Array.isArray(t)) return t.length === 0 ? "[]" : t.length <= 5 ? `[${t.map((e) => B.o(e)).join(", ")}]` : `[${t.slice(0, 3).map((e) => B.o(e)).join(", ")}, ... +${t.length - 3} more]`;
    if (typeof t == "object") {
      const e = Object.keys(t);
      return e.length === 0 ? "{}" : e.length <= 3 ? `{ ${e.map((i) => `${i}: ${B.o(t[i])}`).join(", ")} }` : `{ ${e.slice(0, 2).map((i) => `${i}: ${B.o(t[i])}`).join(", ")}, ... +${e.length - 2} more }`;
    }
    return t + "";
  }
}
var Yt = ((n) => (n[n.SILENT = 0] = "SILENT", n[n.WARNING = 1] = "WARNING", n[n.ERROR = 2] = "ERROR", n[n.THROW = 3] = "THROW", n))(Yt || {});
const I = class I {
  constructor() {
    a(this, "l", { globalLevel: 3 });
  }
  static u() {
    return I.h || (I.h = new I()), I.h;
  }
  v(t, e) {
    const i = "%c[textmode.js] Oops! (╯°□°)╯︵ Something went wrong in your code.", r = "color: #f44336; font-weight: bold; background: #ffebee; padding: 2px 6px; border-radius: 3px;";
    switch (this.l.globalLevel) {
      case 0:
        return !1;
      case 1:
        return console.group(i, r), console.warn(B.i(t, e)), console.groupEnd(), !1;
      case 2:
        return console.group(i, r), console.error(B.i(t, e)), console.groupEnd(), !1;
      default:
        throw new B(t, e);
    }
  }
  m(t, e, i) {
    return !!t || (this.v(e, i), !1);
  }
  _(t) {
    this.l.globalLevel = t;
  }
};
a(I, "h", null);
let ct = I;
const dt = ct.u();
class k {
  constructor(t, e, i) {
    a(this, "A");
    a(this, "C");
    a(this, "M", /* @__PURE__ */ new Map());
    a(this, "F", /* @__PURE__ */ new Map());
    a(this, "$", 0);
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
  U() {
    this.A.useProgram(this.C), this.k();
  }
  k() {
    this.$ = 0;
  }
  L(t) {
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
      const u = this.$++;
      return o.uniform1i(i, u), o.activeTexture(o.TEXTURE0 + u), void o.bindTexture(o.TEXTURE_2D, e);
    }
    if (e instanceof tt) {
      const u = this.$++;
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
  dispose() {
    this.A.deleteProgram(this.C);
  }
}
function vt(n, t, e, i) {
  return 180 * Math.atan2(i - t, e - n) / Math.PI;
}
function G(n, t, e, i) {
  return Math.hypot(e - n, i - t);
}
function X(n, t, e) {
  return Math.min(Math.max(n, t), e);
}
function Tt(n) {
  return (n % 360 + 360) % 360 / 360;
}
function bt(n, t, e) {
  n.bindTexture(n.TEXTURE_2D, t), n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL, 1), n.texImage2D(n.TEXTURE_2D, 0, n.RGBA, n.RGBA, n.UNSIGNED_BYTE, e), n.bindTexture(n.TEXTURE_2D, null);
}
function $(n, t, e, i, r) {
  n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, t), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, e), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, i), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, r);
}
function lt(n, t, e, i, r, s = 0, h = WebGL2RenderingContext.FLOAT, o = !1) {
  n.enableVertexAttribArray(t), n.vertexAttribPointer(t, e, h, o, i, r), n.vertexAttribDivisor(t, s);
}
function xt(n, t, e, i, r) {
  n.bindBuffer(t, e), n.bufferData(t, i, r), n.bindBuffer(t, null);
}
const et = `#version 300 es
in vec2 A0;in vec2 A1;in vec2 A2;in vec2 A3;in vec3 A4;in vec4 A5;in vec4 A6;in vec4 A7;in vec3 A8;in vec3 A9;in vec4 Aa;in vec4 Ab;in vec3 Ac;uniform vec2 Ue;uniform float Uf;uniform float Ug;out vec2 v_uv;out vec3 v_glyphIndex;out vec4 v_glyphColor;out vec4 v_cellColor;out vec4 v_glyphFlags;out vec3 v_worldPosition;out vec3 v_normal;out float v_geometryType;const float A=6.28318530718f;const int B=2;const int C=3;const int D=4;vec2 E(float F,vec2 G,vec2 H,vec2 I,vec2 J){float K=1.0f-F;float L=K*K;float M=L*K;float N=F*F;float O=N*F;return M*G+3.0f*L*F*H+3.0f*K*N*I+O*J;}vec2 P(float F,vec2 G,vec2 H,vec2 I,vec2 J){float K=1.0f-F;float L=K*K;float N=F*F;return-3.0f*L*G+3.0f*(L-2.0f*K*F)*H+3.0f*(2.0f*K*F-N)*I+3.0f*N*J;}vec3 Q(vec3 R,float S){float T=cos(S);float U=sin(S);return vec3(R.x,R.y*T-R.z*U,R.y*U+R.z*T);}vec3 V(vec3 R,float S){float T=cos(S);float U=sin(S);return vec3(R.x*T+R.z*U,R.y,-R.x*U+R.z*T);}vec3 W(vec3 R,float S){float T=cos(S);float U=sin(S);return vec3(R.x*T-R.y*U,R.x*U+R.y*T,R.z);}vec3 X(vec3 R,vec3 Y){vec3 Z=R;if(Y.z!=0.0f){Z=W(Z,Y.z);}if(Y.y!=0.0f){Z=V(Z,Y.y);}if(Y.x!=0.0f){Z=Q(Z,Y.x);}return Z;}void main(){v_uv=A1;v_glyphIndex=A4;v_glyphColor=A5;v_cellColor=A6;v_glyphFlags=A7;vec4 a=Aa;vec4 b=Ab;vec2 c=A3;vec2 d=A2;float e=Ac.x;float f=Ac.y;int g=int(Ac.z);vec2 h=d;vec2 i=h+c*0.5f;float j=f+e*0.5f;vec3 k=vec3(i,j);vec3 l;if(g==D){float F=clamp(A0.x,0.0f,1.0f);vec2 G=b.xy;vec2 H=a.xy;vec2 I=a.zw;vec2 J=b.zw;vec2 m=E(F,G,H,I,J);vec2 n=P(F,G,H,I,J);float o=length(n);vec2 p=o>0.0f?n/o:vec2(1.0f,0.0f);vec2 q=vec2(-p.y,p.x);vec2 r=m;vec2 s=r+q*A0.y*c.y;l=vec3(s,f);}else if(g==C){float t=mod(a.x,A);if(t<0.0f){t+=A;}float u=mod(a.y,A);if(u<0.0f){u+=A;}float v=t-u;if(v<=0.0f){v+=A;}float S=t-A0.x*v;vec2 w=vec2(cos(S),sin(S))*A0.y;vec2 s=w*c+h;l=vec3(s,f);}else if(g==B){vec2 s=A0.xy*c+h;l=vec3(s,f);}vec3 x=X(l,A9);vec3 y=x+A8;vec3 z=vec3(0.0f,0.0f,1.0f);v_worldPosition=y;v_normal=z;v_geometryType=float(g);vec2 AA=(y.xy/Ue)*2.0f;AA.y=-AA.y;float AB=y.z/Ue.y;float AC=clamp(-AB*Uf,-0.99f,0.99f);if(Ug>0.5f){gl_Position=vec4(AA,AC,1.0f);}else{float AD=0.5f;float AE=1.0f/(1.0f-AB*AD);AA*=AE;gl_Position=vec4(AA,AC,1.0f);}}`, _ = class _ {
  constructor(t, e, i = e, r = 1, s = {}, h) {
    a(this, "I");
    a(this, "H");
    a(this, "l");
    a(this, "A");
    a(this, "G");
    a(this, "N", []);
    a(this, "X", null);
    a(this, "Y");
    a(this, "K");
    a(this, "W", null);
    a(this, "Z", /* @__PURE__ */ new Map());
    this.I = e, this.H = i, this.A = t, this.Y = X(r, 1, 8), this.K = h, this.l = { filter: "nearest", wrap: "clamp", format: "rgba", type: "unsigned_byte", depth: !0, ...s }, _.j || (_.j = new k(t, et, `#version 300 es
precision highp float;in vec2 v_uv;uniform sampler2D Ua;uniform sampler2D Ub;uniform sampler2D Uc;uniform vec2 Ud;layout(location=0)out vec4 o_character;layout(location=1)out vec4 o_primaryColor;layout(location=2)out vec4 o_secondaryColor;void main(){vec2 A=vec2(v_uv.x,1.-v_uv.y);vec2 B=A*Ud;vec2 C=(floor(B)+0.5f)/Ud;vec4 D=texture(Ua,C);vec4 E=texture(Ub,C);if(E.a==0.){discard;}vec4 F=texture(Uc,C);o_character=D;o_primaryColor=E;o_secondaryColor=F;}`));
    const o = t.getParameter(t.MAX_DRAW_BUFFERS), c = t.getParameter(t.MAX_COLOR_ATTACHMENTS);
    this.Y = Math.min(this.Y, o, c), this.G = t.createFramebuffer(), this.V(), this.q(), this.l.depth && this.J();
  }
  V() {
    const t = this.A, e = this.l.filter === "linear" ? t.LINEAR : t.NEAREST, i = this.l.wrap === "repeat" ? t.REPEAT : t.CLAMP_TO_EDGE, r = this.l.type === "float" ? t.FLOAT : t.UNSIGNED_BYTE, s = r === t.FLOAT ? t.RGBA32F : t.RGBA8, h = t.RGBA;
    for (let o = 0; o < this.Y; o++) {
      const c = t.createTexture();
      t.bindTexture(t.TEXTURE_2D, c), $(t, e, e, i, i), t.texImage2D(t.TEXTURE_2D, 0, s, this.I, this.H, 0, h, r, null), this.N.push(c);
    }
    t.bindTexture(t.TEXTURE_2D, null);
  }
  q() {
    const t = this.A;
    if (t.bindFramebuffer(t.FRAMEBUFFER, this.G), this.Y === 1) t.framebufferTexture2D(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, this.N[0], 0);
    else {
      const e = [];
      for (let i = 0; i < this.Y; i++) {
        const r = t.COLOR_ATTACHMENT0 + i;
        t.framebufferTexture2D(t.FRAMEBUFFER, r, t.TEXTURE_2D, this.N[i], 0), e.push(r);
      }
      t.drawBuffers(e);
    }
    t.bindFramebuffer(t.FRAMEBUFFER, null);
  }
  J() {
    const t = this.A;
    this.X = t.createRenderbuffer(), t.bindRenderbuffer(t.RENDERBUFFER, this.X), t.renderbufferStorage(t.RENDERBUFFER, t.DEPTH_COMPONENT24, this.I, this.H), t.bindFramebuffer(t.FRAMEBUFFER, this.G), t.framebufferRenderbuffer(t.FRAMEBUFFER, t.DEPTH_ATTACHMENT, t.RENDERBUFFER, this.X), t.bindFramebuffer(t.FRAMEBUFFER, null), t.bindRenderbuffer(t.RENDERBUFFER, null);
  }
  tt(t) {
    bt(this.A, this.N[0], t);
  }
  resize(t, e) {
    this.I = t, this.H = e, this.Z.clear();
    const i = this.A, r = this.l.type === "float" ? i.FLOAT : i.UNSIGNED_BYTE, s = r === i.FLOAT ? i.RGBA32F : i.RGBA8, h = i.RGBA;
    for (const o of this.N) i.bindTexture(i.TEXTURE_2D, o), i.texImage2D(i.TEXTURE_2D, 0, s, this.I, this.H, 0, h, r, null);
    i.bindTexture(i.TEXTURE_2D, null), this.X && (i.bindRenderbuffer(i.RENDERBUFFER, this.X), i.renderbufferStorage(i.RENDERBUFFER, i.DEPTH_COMPONENT24, this.I, this.H), i.bindRenderbuffer(i.RENDERBUFFER, null));
  }
  readPixels(t) {
    const e = this.Z.get(t);
    if (e) return e;
    const i = this.A, r = this.I, s = this.H, h = new Uint8Array(r * s * 4), o = i.getParameter(i.READ_FRAMEBUFFER_BINDING);
    i.bindFramebuffer(i.READ_FRAMEBUFFER, this.G), i.readBuffer(i.COLOR_ATTACHMENT0 + t), i.readPixels(0, 0, r, s, i.RGBA, i.UNSIGNED_BYTE, h), i.bindFramebuffer(i.READ_FRAMEBUFFER, o);
    const c = 4 * r, l = new Uint8Array(h.length);
    for (let u = 0; u < s; u++) {
      const f = (s - 1 - u) * c, A = u * c;
      l.set(h.subarray(f, f + c), A);
    }
    return this.Z.set(t, l), l;
  }
  begin() {
    const t = this.A;
    this.Z.clear(), this.K.st(), this.K.et(this.G, this.I, this.H), this.l.depth && t.clear(t.DEPTH_BUFFER_BIT), this.K.state.it();
  }
  end() {
    this.K.state.rt(), this.K.nt();
    const t = this.K.ot();
    this.K.et(t.framebuffer, t.viewport[2], t.viewport[3]);
  }
  ht() {
    return this.W || this.ct(), this.W;
  }
  ct() {
    if (!this.K) return;
    const t = { Ua: this.N[0], Ub: this.N[1], Uc: this.N[2], Ud: [this.I, this.H] }, e = _.j;
    this.W = this.K.ut.lt(e, t, !0);
  }
  ft() {
    const t = this.A;
    t.deleteFramebuffer(this.G);
    for (const e of this.N) t.deleteTexture(e);
    this.X && t.deleteRenderbuffer(this.X);
  }
  get width() {
    return this.I;
  }
  get height() {
    return this.H;
  }
  get textures() {
    return this.N;
  }
  get attachmentCount() {
    return this.Y;
  }
};
a(_, "j", null);
let tt = _;
const Rt = /* @__PURE__ */ new WeakMap();
function st(n, t) {
  Rt.set(n, t);
}
function Mt(n) {
  return Rt.get(n);
}
function J(n, t, e, i, r = 255) {
  n[0] = t / 255, n[1] = (e ?? t) / 255, n[2] = (i ?? t) / 255, n[3] = r / 255;
}
class it {
  constructor() {
    a(this, "dt", 1);
    a(this, "gt", 0);
    a(this, "vt", 0);
    a(this, "_t", 0);
    a(this, "At", 0);
    a(this, "yt", 0);
    a(this, "wt", 0);
    a(this, "bt", [0, 0, 0]);
    a(this, "Ct", [1, 1, 1, 1]);
    a(this, "Mt", [0, 0, 0, 1]);
    a(this, "xt", !1);
    a(this, "Ft", !1);
    a(this, "$t", !1);
    a(this, "Tt", 0);
    a(this, "Pt", [0, 0, 0, 1]);
    a(this, "Et", !1);
    a(this, "Rt", []);
    a(this, "St", []);
  }
  static Ut() {
    return { kt: 1, zt: 0, Lt: 0, Ot: 0, At: 0, yt: 0, wt: 0, Tt: 0, Dt: !1, It: !1, $t: !1, Et: !1, Ht: [0, 0, 0], Bt: [1, 1, 1, 1], Gt: [0, 0, 0, 1] };
  }
  Nt(t) {
    t.kt = this.dt, t.zt = this.gt, t.Lt = this.vt, t.Ot = this._t, t.At = this.At, t.yt = this.yt, t.wt = this.wt, t.Dt = this.xt, t.It = this.Ft, t.$t = this.$t, t.Tt = this.Tt, t.Et = this.Et, t.Ht[0] = this.bt[0], t.Ht[1] = this.bt[1], t.Ht[2] = this.bt[2], t.Bt[0] = this.Ct[0], t.Bt[1] = this.Ct[1], t.Bt[2] = this.Ct[2], t.Bt[3] = this.Ct[3], t.Gt[0] = this.Mt[0], t.Gt[1] = this.Mt[1], t.Gt[2] = this.Mt[2], t.Gt[3] = this.Mt[3];
  }
  Xt(t) {
    this.dt = t.kt, this.gt = t.zt, this.vt = t.Lt, this._t = t.Ot, this.At = t.At, this.yt = t.yt, this.wt = t.wt, this.xt = t.Dt, this.Ft = t.It, this.$t = t.$t, this.Tt = t.Tt, this.Et = t.Et, this.bt[0] = t.Ht[0], this.bt[1] = t.Ht[1], this.bt[2] = t.Ht[2], this.Ct[0] = t.Bt[0], this.Ct[1] = t.Bt[1], this.Ct[2] = t.Bt[2], this.Ct[3] = t.Bt[3], this.Mt[0] = t.Gt[0], this.Mt[1] = t.Gt[1], this.Mt[2] = t.Gt[2], this.Mt[3] = t.Gt[3];
  }
  it() {
    let t = this.St.pop();
    t || (t = it.Ut()), this.Nt(t), this.Rt.push(t);
  }
  rt() {
    const t = this.Rt.pop();
    t ? (this.Xt(t), this.St.push(t)) : console.warn("pop() called without matching push()");
  }
  Yt(t) {
    this.Nt(t);
  }
  Kt(t) {
    this.dt = Math.abs(t);
  }
  Wt() {
    this.gt = 0, this.vt = 0, this._t = 0, this.At = 0, this.yt = 0, this.wt = 0, this.Et = !1;
  }
  Zt(t) {
    t !== 0 && (this.At += t * Math.PI / 180);
  }
  jt(t) {
    t !== 0 && (this.yt += t * Math.PI / 180);
  }
  Vt(t) {
    t !== 0 && (this.wt += t * Math.PI / 180);
  }
  qt(t = 0, e = 0, i = 0) {
    t === 0 && e === 0 && i === 0 || (this.gt += t, this.vt += e, this._t += i);
  }
  Qt(t) {
    this.qt(t, 0, 0);
  }
  Jt(t) {
    this.qt(0, t, 0);
  }
  ts(t) {
    this.qt(0, 0, t);
  }
  ss(t) {
    this.bt[0] = t[0], this.bt[1] = t[1], this.bt[2] = t[2];
  }
  es(t, e, i, r = 255) {
    J(this.Ct, t, e, i, r);
  }
  rs(t, e, i, r = 255) {
    J(this.Mt, t, e, i, r);
  }
  ns(t) {
    this.xt = t;
  }
  hs(t) {
    this.Ft = t;
  }
  cs(t) {
    this.$t = t;
  }
  ls(t) {
    this.Tt = Tt(t);
  }
  us(t, e, i, r) {
    J(this.Pt, t, e, i, r);
  }
  fs(t) {
    this.Et = t;
  }
  get canvasBackgroundColor() {
    return this.Pt;
  }
  get useOrtho() {
    return this.Et;
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
const ut = new Float32Array([-0.5, -0.5, 0, 0, 0.5, -0.5, 1, 0, -0.5, 0.5, 0, 1, -0.5, 0.5, 0, 1, 0.5, -0.5, 1, 0, 0.5, 0.5, 1, 1]), H = { ds: 16, ps: WebGL2RenderingContext.TRIANGLES, gs: { vs: { size: 2, offset: 0 }, _s: { size: 2, offset: 8 } } };
class Wt {
  constructor(t) {
    a(this, "A");
    a(this, "As");
    a(this, "ws");
    this.A = t, this.As = t.createBuffer(), this.ws = new Float32Array(ut.length);
  }
  bs(t, e, i, r) {
    const s = this.A, h = Mt(this.A), o = h[2], c = h[3], l = t / o * 2 - 1, u = (t + i) / o * 2 - 1, f = 1 - (e + r) / c * 2, A = 1 - e / c * 2, g = ut, p = this.ws;
    for (let d = 0; d < g.length; d += 4) {
      const v = g[d], m = g[d + 1], E = g[d + 2], y = g[d + 3], b = l + (v + 0.5) * (u - l), w = f + (m + 0.5) * (A - f);
      p[d] = b, p[d + 1] = w, p[d + 2] = E, p[d + 3] = y;
    }
    s.bindBuffer(s.ARRAY_BUFFER, this.As), s.bufferData(s.ARRAY_BUFFER, p, s.DYNAMIC_DRAW), s.enableVertexAttribArray(0), s.vertexAttribPointer(0, 2, s.FLOAT, !1, 16, 0), s.drawArrays(s.TRIANGLES, 0, 6), s.disableVertexAttribArray(0), s.bindBuffer(s.ARRAY_BUFFER, null);
  }
  ft() {
    this.A.deleteBuffer(this.As);
  }
}
var T = ((n) => (n.RECTANGLE = "rectangle", n.LINE = "line", n.ELLIPSE = "ellipse", n.ARC = "arc", n.TRIANGLE = "triangle", n.BEZIER_CURVE = "bezier_curve", n))(T || {});
const kt = { rectangle: 2, line: 2, ellipse: 2, triangle: 2, arc: 3, bezier_curve: 4 };
class Zt {
  constructor(t) {
    a(this, "A");
    a(this, "Cs", /* @__PURE__ */ new Map());
    this.A = t;
  }
  Ms(t, e, i, r) {
    const s = this.A;
    let h = this.Cs.get(t);
    h || (h = /* @__PURE__ */ new Map(), this.Cs.set(t, h));
    let o = h.get(e) || null;
    if (!o) {
      o = s.createVertexArray(), h.set(e, o), s.bindVertexArray(o), s.bindBuffer(s.ARRAY_BUFFER, r);
      const c = s.getAttribLocation(t, "A0");
      c !== -1 && lt(s, c, i.gs.vs.size, i.ds, i.gs.vs.offset, 0, s.FLOAT, !1);
      const l = s.getAttribLocation(t, "A1");
      l !== -1 && lt(s, l, i.gs._s.size, i.ds, i.gs._s.offset, 0, s.FLOAT, !1);
    }
    s.bindVertexArray(o);
  }
  Fs() {
    this.A.bindVertexArray(null);
  }
  ft() {
    for (const [, t] of this.Cs) for (const [, e] of t) e && this.A.deleteVertexArray(e);
  }
}
const U = class U {
  static $s(t, e, i = 0) {
    const r = e || new Float32Array(U.FLOATS_PER_INSTANCE);
    let s = i;
    r[s++] = t.vs[0], r[s++] = t.vs[1], r[s++] = t.Ts[0], r[s++] = t.Ts[1], r[s++] = t.Ht[0], r[s++] = t.Ht[1], r[s++] = t.Ht[2], r[s++] = t.Bt[0], r[s++] = t.Bt[1], r[s++] = t.Bt[2], r[s++] = t.Bt[3], r[s++] = t.Gt[0], r[s++] = t.Gt[1], r[s++] = t.Gt[2], r[s++] = t.Gt[3], r[s++] = t.Ps[0], r[s++] = t.Ps[1], r[s++] = t.Ps[2], r[s++] = t.Tt;
    const h = t.Es;
    r[s++] = (h == null ? void 0 : h[0]) ?? 0, r[s++] = (h == null ? void 0 : h[1]) ?? 0, r[s++] = (h == null ? void 0 : h[2]) ?? 0;
    const o = t.Rs;
    r[s++] = (o == null ? void 0 : o[0]) ?? 0, r[s++] = (o == null ? void 0 : o[1]) ?? 0, r[s++] = (o == null ? void 0 : o[2]) ?? 0;
    const c = t.Ss, l = t.Us, u = t.ks, f = t.zs, A = t.Ls, g = !(!l || !u);
    return g ? (r[s++] = (f == null ? void 0 : f[0]) ?? 0, r[s++] = (f == null ? void 0 : f[1]) ?? 0, r[s++] = (A == null ? void 0 : A[0]) ?? 0, r[s++] = (A == null ? void 0 : A[1]) ?? 0, r[s++] = l[0], r[s++] = l[1], r[s++] = u[0], r[s++] = u[1]) : !g && !!c ? (r[s++] = c[0], r[s++] = c[1], r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0) : (r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0, r[s++] = 0), r[s++] = t.Os ?? 0, r[s++] = t.Ds ?? 0, r[s++] = t.Is ?? 0, r;
  }
  static Hs(t, e) {
    const i = t.length * U.FLOATS_PER_INSTANCE, r = e || new Float32Array(i);
    for (let s = 0; s < t.length; s++) {
      const h = s * U.FLOATS_PER_INSTANCE;
      U.$s(t[s], r, h);
    }
    return r;
  }
};
a(U, "BYTES_PER_INSTANCE", 144), a(U, "FLOATS_PER_INSTANCE", 36);
let D = U;
const O = class O {
};
a(O, "STRIDE", D.BYTES_PER_INSTANCE), a(O, "ATTRIBUTES", { A2: { location: -1, size: 2, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: O.STRIDE, offset: 0, divisor: 1 }, A3: { location: -1, size: 2, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: O.STRIDE, offset: 8, divisor: 1 }, A4: { location: -1, size: 3, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: O.STRIDE, offset: 16, divisor: 1 }, A5: { location: -1, size: 4, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: O.STRIDE, offset: 28, divisor: 1 }, A6: { location: -1, size: 4, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: O.STRIDE, offset: 44, divisor: 1 }, A7: { location: -1, size: 4, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: O.STRIDE, offset: 60, divisor: 1 }, A8: { location: -1, size: 3, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: O.STRIDE, offset: 76, divisor: 1 }, A9: { location: -1, size: 3, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: O.STRIDE, offset: 88, divisor: 1 }, Aa: { location: -1, size: 4, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: O.STRIDE, offset: 100, divisor: 1 }, Ab: { location: -1, size: 4, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: O.STRIDE, offset: 116, divisor: 1 }, Ac: { location: -1, size: 3, type: WebGL2RenderingContext.FLOAT, normalized: !1, stride: O.STRIDE, offset: 132, divisor: 1 } });
let W = O;
class jt {
  constructor(t = 1e3, e = 1.5) {
    a(this, "Bs");
    a(this, "Gs");
    a(this, "Ns");
    a(this, "Xs", 0);
    a(this, "Ys", 0);
    this.Gs = t, this.Ns = e;
    const i = t * D.FLOATS_PER_INSTANCE;
    this.Bs = new Float32Array(i);
  }
  Ks(t) {
    if (t <= this.Gs) return;
    const e = Math.ceil(t * this.Ns), i = this.Gs;
    this.Gs = e;
    const r = e * D.FLOATS_PER_INSTANCE, s = new Float32Array(r), h = i * D.FLOATS_PER_INSTANCE;
    s.set(this.Bs.subarray(0, Math.min(h, this.Xs))), this.Bs = s;
  }
  Ws() {
    return { buffer: this.Bs, offset: this.Xs };
  }
  Zs(t) {
    this.Xs += t, this.Ys++;
  }
  js() {
    this.Xs = 0, this.Ys = 0;
  }
  Vs(t = 0, e) {
    return this.Bs.subarray(t, e ?? this.Xs);
  }
  get qs() {
    return this.Ys;
  }
  get Qs() {
    return this.Gs;
  }
  get Js() {
    return this.Xs;
  }
  get te() {
    return this.Ys === 0;
  }
}
class Vt {
  constructor(t) {
    a(this, "Bs");
    this.Bs = t;
  }
  se(t) {
    this.Bs.Ks(this.Bs.qs + 1);
    const { buffer: e, offset: i } = this.Bs.Ws();
    e[i + 0] = t.x, e[i + 1] = t.y, e[i + 2] = t.width, e[i + 3] = t.height, e[i + 4] = t.char0, e[i + 5] = t.char1, e[i + 6] = t.char2, e[i + 7] = t.r1, e[i + 8] = t.g1, e[i + 9] = t.b1, e[i + 10] = t.a1, e[i + 11] = t.r2, e[i + 12] = t.g2, e[i + 13] = t.b2, e[i + 14] = t.a2, e[i + 15] = t.invert, e[i + 16] = t.flipX, e[i + 17] = t.flipY, e[i + 18] = t.charRot, e[i + 19] = t.translationX, e[i + 20] = t.translationY, e[i + 21] = t.translationZ, e[i + 22] = t.rotationX, e[i + 23] = t.rotationY, e[i + 24] = t.rotationZ;
    const r = t.curveParams0, s = t.curveParams1;
    return e[i + 25] = r[0], e[i + 26] = r[1], e[i + 27] = r[2], e[i + 28] = r[3], e[i + 29] = s[0], e[i + 30] = s[1], e[i + 31] = s[2], e[i + 32] = s[3], e[i + 33] = t.depth, e[i + 34] = t.baseZ, e[i + 35] = t.geometryType, this.Bs.Zs(D.FLOATS_PER_INSTANCE), this.Bs.qs - 1;
  }
  get qs() {
    return this.Bs.qs;
  }
}
class qt {
  constructor(t, e = 1e3) {
    a(this, "A");
    a(this, "ee", null);
    a(this, "ie", 0);
    a(this, "re", /* @__PURE__ */ new Map());
    this.A = t, this.ne(e);
  }
  ne(t) {
    const e = this.A;
    this.ee && e.deleteBuffer(this.ee), this.ee = e.createBuffer();
    const i = t * D.BYTES_PER_INSTANCE;
    xt(e, e.ARRAY_BUFFER, this.ee, i, e.DYNAMIC_DRAW), this.ie = t;
  }
  oe(t) {
    this.ne(t);
  }
  get Qs() {
    return this.ie;
  }
  he(t, e) {
    if (e === 0) return;
    const i = this.A;
    i.bindBuffer(i.ARRAY_BUFFER, this.ee);
    const r = e * D.FLOATS_PER_INSTANCE;
    i.bufferSubData(i.ARRAY_BUFFER, 0, t, 0, r);
  }
  ae(t) {
    let e = this.re.get(t);
    if (!e) {
      e = /* @__PURE__ */ new Map();
      const i = this.A;
      for (const r in W.ATTRIBUTES) {
        const s = i.getAttribLocation(t, r);
        s !== -1 && e.set(r, s);
      }
      this.re.set(t, e);
    }
    return e;
  }
  ce(t) {
    const e = this.A, i = t.D, r = this.ae(i);
    for (const [s, h] of r) {
      const o = W.ATTRIBUTES[s];
      o && lt(e, h, o.size, o.stride, o.offset, o.divisor, o.type, o.normalized);
    }
  }
  le(t) {
    const e = this.A, i = this.ae(t.D);
    for (const [r, s] of i)
      W.ATTRIBUTES[r] && (e.disableVertexAttribArray(s), e.vertexAttribDivisor(s, 0));
  }
  ft() {
    this.ee && (this.A.deleteBuffer(this.ee), this.ee = null), this.re.clear();
  }
}
class Qt {
  constructor(t, e = 1e3, i = 1.5) {
    a(this, "A");
    a(this, "Bs");
    a(this, "ue");
    a(this, "fe");
    this.A = t, this.Bs = new jt(e, i), this.ue = new Vt(this.Bs), this.fe = new qt(t, e);
  }
  de(t) {
    var r, s, h, o, c, l, u, f, A, g;
    const e = [0, 0, 0, 0], i = [0, 0, 0, 0];
    return t.Us && t.ks ? (e[0] = ((r = t.zs) == null ? void 0 : r[0]) ?? 0, e[1] = ((s = t.zs) == null ? void 0 : s[1]) ?? 0, e[2] = ((h = t.Ls) == null ? void 0 : h[0]) ?? 0, e[3] = ((o = t.Ls) == null ? void 0 : o[1]) ?? 0, i[0] = t.Us[0], i[1] = t.Us[1], i[2] = t.ks[0], i[3] = t.ks[1]) : t.Ss && (e[0] = t.Ss[0], e[1] = t.Ss[1]), this.se({ x: t.vs[0], y: t.vs[1], width: t.Ts[0], height: t.Ts[1], char0: t.Ht[0], char1: t.Ht[1], char2: t.Ht[2], r1: t.Bt[0], g1: t.Bt[1], b1: t.Bt[2], a1: t.Bt[3], r2: t.Gt[0], g2: t.Gt[1], b2: t.Gt[2], a2: t.Gt[3], invert: t.Ps[0], flipX: t.Ps[1], flipY: t.Ps[2], charRot: t.Tt, translationX: ((c = t.Es) == null ? void 0 : c[0]) ?? 0, translationY: ((l = t.Es) == null ? void 0 : l[1]) ?? 0, translationZ: ((u = t.Es) == null ? void 0 : u[2]) ?? 0, rotationX: ((f = t.Rs) == null ? void 0 : f[0]) ?? 0, rotationY: ((A = t.Rs) == null ? void 0 : A[1]) ?? 0, rotationZ: ((g = t.Rs) == null ? void 0 : g[2]) ?? 0, curveParams0: e, curveParams1: i, depth: t.Os || 0, baseZ: t.Ds || 0, geometryType: t.Is || 0 });
  }
  se(t) {
    const e = this.ue.se(t);
    return this.Bs.Qs > this.fe.Qs && this.fe.oe(this.Bs.Qs), e;
  }
  get pe() {
    return this.Bs.qs;
  }
  get te() {
    return this.Bs.te;
  }
  ge() {
    this.Bs.js();
  }
  ce(t) {
    const e = this.Bs.qs;
    if (e === 0) return;
    const i = this.Bs.Vs();
    this.fe.he(i, e), this.fe.ce(t);
  }
  le(t) {
    this.fe.le(t);
  }
  bs(t, e) {
    const i = this.Bs.qs;
    i !== 0 && this.A.drawArraysInstanced(t, 0, e, i);
  }
  ft() {
    this.fe.ft();
  }
}
class N {
  constructor(t, e, i, r) {
    a(this, "A");
    a(this, "ve");
    a(this, "me");
    a(this, "_e");
    a(this, "Ae", null);
    this.A = t, this.ve = e, this.me = i, this._e = r;
    const s = this.A.createBuffer();
    xt(this.A, this.A.ARRAY_BUFFER, s, this._e.ye, this.A.STATIC_DRAW), this.Ae = s;
  }
  get type() {
    return this.me;
  }
  get unitGeometry() {
    return this._e;
  }
  get unitBuffer() {
    return this.Ae;
  }
  get batch() {
    return this.ve;
  }
  we() {
    this.ve.ge();
  }
  be() {
    return !this.ve.te;
  }
  ft() {
    this.ve.ft(), this.A.deleteBuffer(this.Ae);
  }
  Ce(t, e, i) {
    return this.ve.de(t);
  }
  Me(t, e, i, r, s, h) {
    const o = s.zt ?? 0, c = s.Lt ?? 0, l = s.Ot ?? 0, u = s.At ?? 0, f = s.yt ?? 0, A = s.wt ?? 0, g = [0, 0, 0, 0], p = [0, 0, 0, 0];
    h && (h.bezStartX !== void 0 && h.bezStartY !== void 0 && h.bezEndX !== void 0 && h.bezEndY !== void 0 ? (g[0] = h.cp1x ?? 0, g[1] = h.cp1y ?? 0, g[2] = h.cp2x ?? 0, g[3] = h.cp2y ?? 0, p[0] = h.bezStartX ?? 0, p[1] = h.bezStartY ?? 0, p[2] = h.bezEndX ?? 0, p[3] = h.bezEndY ?? 0) : h.arcStart === void 0 && h.arcStop === void 0 || (g[0] = h.arcStart ?? 0, g[1] = h.arcStop ?? 0));
    const d = { x: t, y: e, width: i, height: r, char0: s.Ht[0], char1: s.Ht[1], char2: s.Ht[2], r1: s.Bt[0], g1: s.Bt[1], b1: s.Bt[2], a1: s.Bt[3], r2: s.Gt[0], g2: s.Gt[1], b2: s.Gt[2], a2: s.Gt[3], invert: s.$t ? 1 : 0, flipX: s.Dt ? 1 : 0, flipY: s.It ? 1 : 0, charRot: s.Tt, translationX: o, translationY: c, translationZ: l, rotationX: u, rotationY: f, rotationZ: A, curveParams0: g, curveParams1: p, depth: (h == null ? void 0 : h.depth) ?? 0, baseZ: (h == null ? void 0 : h.baseZ) ?? 0, geometryType: kt[this.me] ?? 0 };
    return this.ve.se(d);
  }
}
const Jt = { ye: ut, xe: 6, ...H }, $t = { ye: new Float32Array([0, -0.5, 0, 0, 1, -0.5, 1, 0, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 1, -0.5, 1, 0, 1, 0.5, 1, 1]), xe: 6, ...H }, te = { ye: function(n = 32) {
  const t = [], e = 2 * Math.PI / n;
  for (let i = 0; i < n; i++) {
    const r = i * e, s = (i + 1) % n * e, h = Math.cos(r), o = Math.sin(r), c = 0.5 * (h + 1), l = 0.5 * (o + 1), u = Math.cos(s), f = Math.sin(s), A = 0.5 * (u + 1), g = 0.5 * (f + 1);
    t.push(0, 0, 0.5, 0.5, h, o, c, l, u, f, A, g);
  }
  return new Float32Array(t);
}(32), xe: 96, ...H };
let ee = { ye: function(n) {
  const t = [];
  for (let e = 0; e < n; e++) {
    const i = e / n, r = (e + 1) / n;
    t.push(i, 0, i, 0, i, 1, i, 1, r, 1, r, 1);
  }
  return new Float32Array(t);
}(32), xe: 96, ...H };
const ie = { ye: new Float32Array([0, 0, 0, 0, 1, 0, 1, 0, 0.5, 1, 0.5, 1]), xe: 3, ...H }, re = { ye: function(n = 16) {
  const t = [];
  for (let e = 0; e < n; e++) {
    const i = e / n, r = (e + 1) / n;
    t.push(i, -0.5, i, 0, r, -0.5, r, 0, i, 0.5, i, 1, i, 0.5, i, 1, r, -0.5, r, 0, r, 0.5, r, 1);
  }
  return new Float32Array(t);
}(16), xe: 96, ...H }, se = { [T.RECTANGLE]: class extends N {
  constructor(n, t) {
    super(n, t, T.RECTANGLE, Jt);
  }
  de(n, t) {
    return this.Me(0, 0, n.width, n.height, t);
  }
}, [T.LINE]: class extends N {
  constructor(n, t) {
    super(n, t, T.LINE, $t);
  }
  de(n, t) {
    const e = n.x2 - n.x1, i = n.y2 - n.y1, r = Math.hypot(e, i), s = Math.atan2(i, e), h = t.kt || 1, o = n.x1 + e / 2 - r / 2, c = n.y1 + i / 2, l = { ...t, wt: (t.wt || 0) + s };
    return this.Me(o, c, r, h, l);
  }
}, [T.ELLIPSE]: class extends N {
  constructor(n, t) {
    super(n, t, T.ELLIPSE, te);
  }
  de(n, t) {
    return this.Me(0, 0, n.width, n.height, t);
  }
}, [T.ARC]: class extends N {
  constructor(n, t) {
    super(n, t, T.ARC, ee);
  }
  de(n, t) {
    const e = n.start * Math.PI / 180, i = n.stop * Math.PI / 180;
    return this.Me(0, 0, n.width, n.height, t, { arcStart: e, arcStop: i });
  }
}, [T.TRIANGLE]: class extends N {
  constructor(n, t) {
    super(n, t, T.TRIANGLE, ie);
  }
  de(n, t) {
    const e = Math.min(n.x1, n.x2, n.x3), i = Math.max(n.x1, n.x2, n.x3), r = Math.min(n.y1, n.y2, n.y3), s = i - e, h = Math.max(n.y1, n.y2, n.y3) - r;
    return this.Me(e, r, s, h, t);
  }
}, [T.BEZIER_CURVE]: class extends N {
  constructor(n, t) {
    super(n, t, T.BEZIER_CURVE, re);
  }
  de(n, t) {
    return this.Me(0, 0, 1, t.kt || 1, t, { cp1x: n.cp1x, cp1y: n.cp1y, cp2x: n.cp2x, cp2y: n.cp2y, bezStartX: n.x1, bezStartY: n.y1, bezEndX: n.x2, bezEndY: n.y2 });
  }
} };
class ne {
  constructor(t) {
    a(this, "A");
    a(this, "Fe");
    a(this, "$e");
    this.A = t, this.$e = new Zt(t), this.Fe = /* @__PURE__ */ new Map();
    for (const e of Object.values(T)) {
      const i = new Qt(t), r = new se[e](t, i);
      this.Fe.set(e, r);
    }
  }
  Te(t) {
    const e = this.Pe(t);
    for (const i of e) this.Ee(i);
  }
  Pe(t) {
    const e = [];
    let i = null, r = null, s = null;
    for (const h of t) r !== h.material || s !== h.type ? (i && i.length > 0 && e.push({ material: r, type: s, commands: i }), i = [h], r = h.material, s = h.type) : i.push(h);
    return i && i.length > 0 && e.push({ material: r, type: s, commands: i }), e;
  }
  Ee(t) {
    const { material: e, type: i, commands: r } = t, s = this.Fe.get(i);
    e.shader.U(), e.shader.L(e.uniforms);
    const h = Mt(this.A), o = r.length > 0 && r[0].state.Et;
    e.shader.L({ Uh: h[2] / h[3], Ue: [h[2], h[3]], Uf: 1, Ug: o ? 1 : 0 }), s.we();
    for (const c of r) s.de(c.params, c.state);
    if (s.be()) {
      const c = s.unitGeometry, l = s.unitBuffer;
      try {
        this.$e.Ms(e.shader.D, i + "", c, l), s.batch.ce(e.shader), s.batch.bs(c.ps, c.xe);
      } finally {
        s.batch.le(e.shader), this.$e.Fs(), s.we();
      }
    }
  }
  ft() {
    for (const t of this.Fe.values()) t.ft();
    this.Fe.clear(), this.$e.ft();
  }
}
function Ft(n) {
  let t = 0;
  for (let e = 0; e < n.length; e++)
    t = (t << 5) - t + n.charCodeAt(e), t &= t;
  return t;
}
function yt(n) {
  return Ft(n + "");
}
function z(n, t) {
  return (n << 5) - n + t;
}
class he {
  constructor(t) {
    a(this, "A");
    a(this, "Re", 0);
    a(this, "Se");
    a(this, "ke");
    a(this, "ze", /* @__PURE__ */ new Map());
    this.A = t, this.Se = new k(t, et, `#version 300 es
precision highp float;in vec3 v_glyphIndex;in vec4 v_glyphColor;in vec4 v_cellColor;in vec4 v_glyphFlags;layout(location=0)out vec4 o_character;layout(location=1)out vec4 o_primaryColor;layout(location=2)out vec4 o_secondaryColor;void main(){int A=int(v_glyphFlags.r>0.5?1:0);int B=int(v_glyphFlags.g>0.5?1:0);int C=int(v_glyphFlags.b>0.5?1:0);float D=float(A|(B<<1)|(C<<2))/255.;o_character=vec4(v_glyphIndex.xy,D,clamp(v_glyphFlags.a,0.,1.));o_primaryColor=vec4(v_glyphColor.rgb,v_glyphColor.a);o_secondaryColor=vec4(v_cellColor.rgb,v_cellColor.a);}`), this.ke = { id: this.Re++, shader: this.Se, uniforms: Object.freeze({}), hash: this.Le(this.Se, {}), isBuiltIn: !0 };
  }
  get Oe() {
    return this.ke;
  }
  lt(t, e = {}, i = !1) {
    const r = this.Le(t, e), s = this.ze.get(r);
    if (s) return s;
    const h = { id: this.Re++, shader: t, uniforms: Object.freeze({ ...e }), hash: r, isBuiltIn: i };
    return this.ze.set(r, h), h;
  }
  De(t, e = {}) {
    return { id: this.Re++, shader: t, uniforms: Object.freeze({ ...e }), hash: 0, isBuiltIn: !1 };
  }
  Le(t, e) {
    const i = yt(t.D), r = function(s, h) {
      let o = 0;
      const c = Object.keys(s).sort();
      for (const l of c) o = z(o, Ft(l)), o = z(o, h(s[l]));
      return o;
    }(e, this.Ie.bind(this));
    return z(i, r);
  }
  Ie(t) {
    return typeof t == "number" || typeof t == "boolean" ? function(e) {
      return typeof e == "boolean" ? e ? 1 : 0 : Math.floor(e);
    }(t) : Array.isArray(t) ? function(e) {
      let i = 0;
      const r = Array.isArray(e[0]) ? e.flat() : e;
      for (const s of r) i = z(i, typeof s == "number" ? s : 0);
      return i;
    }(t) : t instanceof Float32Array || t instanceof Int32Array ? function(e) {
      let i = 0;
      const r = Math.min(e.length, 16);
      for (let s = 0; s < r; s++) i = z(i, e[s]);
      return i;
    }(t) : t instanceof WebGLTexture ? yt(t) : 0;
  }
  ft() {
    this.Se != this.Se && this.Se.dispose(), this.Se.dispose(), this.ze.clear();
  }
}
class oe {
  constructor() {
    a(this, "He", []);
    a(this, "Be", 1);
    a(this, "Ts", 0);
  }
  Ge(t, e) {
    if (this.Ts >= this.He.length) {
      const r = { id: this.Be++, type: t, params: {}, state: it.Ut(), material: e };
      this.He.push(r);
    }
    const i = this.He[this.Ts];
    return i.id = this.Be++, i.type = t, i.material = e, this.Ts++, i;
  }
  Ne(t, e, i) {
    const r = this.Ge(T.RECTANGLE, i), s = r.params;
    return s.width = t.width, s.height = t.height, e.Yt(r.state), r.id;
  }
  Xe(t, e, i) {
    const r = this.Ge(T.LINE, i), s = r.params;
    return s.x1 = t.x1, s.y1 = t.y1, s.x2 = t.x2, s.y2 = t.y2, s.thickness = t.thickness, e.Yt(r.state), r.id;
  }
  Ye(t, e, i) {
    const r = this.Ge(T.ELLIPSE, i), s = r.params;
    return s.width = t.width, s.height = t.height, s.startAngle = t.startAngle, s.endAngle = t.endAngle, s.segments = t.segments, e.Yt(r.state), r.id;
  }
  Ke(t, e, i) {
    const r = this.Ge(T.ARC, i), s = r.params;
    return s.width = t.width, s.height = t.height, s.start = t.start, s.stop = t.stop, e.Yt(r.state), r.id;
  }
  We(t, e, i) {
    const r = this.Ge(T.TRIANGLE, i), s = r.params;
    return s.x1 = t.x1, s.y1 = t.y1, s.x2 = t.x2, s.y2 = t.y2, s.x3 = t.x3, s.y3 = t.y3, e.Yt(r.state), r.id;
  }
  Ze(t, e, i) {
    const r = this.Ge(T.BEZIER_CURVE, i), s = r.params;
    return s.x1 = t.x1, s.y1 = t.y1, s.cp1x = t.cp1x, s.cp1y = t.cp1y, s.cp2x = t.cp2x, s.cp2y = t.cp2y, s.x2 = t.x2, s.y2 = t.y2, s.thickness = t.thickness, s.segments = t.segments, e.Yt(r.state), r.id;
  }
  ge() {
    this.Ts = 0;
  }
  [Symbol.iterator]() {
    let t = 0;
    const e = this.Ts, i = this.He;
    return { next: () => t < e ? { value: i[t++], done: !1 } : { value: void 0, done: !0 } };
  }
}
class ae {
  constructor(t) {
    a(this, "A");
    a(this, "je", null);
    a(this, "Ve");
    a(this, "ut");
    a(this, "qe");
    a(this, "Qe");
    a(this, "Je");
    a(this, "ti", null);
    a(this, "si", {});
    a(this, "ei", []);
    a(this, "ii", []);
    a(this, "ri", null);
    a(this, "ni", [0, 0, 0, 0]);
    this.A = t, t.enable(t.DEPTH_TEST), t.depthFunc(t.LEQUAL), t.clearDepth(1), t.depthMask(!0), t.disable(t.CULL_FACE), this.qe = new it(), this.ut = new he(t), this.Qe = new oe(), this.Ve = new ne(t), this.Je = new Wt(t);
    const e = [0, 0, t.canvas.width, t.canvas.height];
    st(t, e), this.ei.push(null), this.ii.push(e), this.ri = null, this.ni = e;
  }
  st() {
    this.ei.push(this.ri), this.ii.push([...this.ni]);
  }
  ot() {
    return { framebuffer: this.ei.pop() ?? null, viewport: this.ii.pop() ?? [0, 0, this.A.canvas.width, this.A.canvas.height] };
  }
  et(t, e, i) {
    const r = this.A;
    this.ri !== t && (r.bindFramebuffer(r.FRAMEBUFFER, t), this.ri = t);
    const s = [0, 0, e, i];
    this.ni[0] === s[0] && this.ni[1] === s[1] && this.ni[2] === s[2] && this.ni[3] === s[3] || (r.viewport(...s), st(r, s), this.ni = s);
  }
  oi(t) {
    this.je !== t && (this.je = t, t.U());
  }
  hi(t, e) {
    return new k(this.A, t, e);
  }
  ai(t) {
    this.ti = t, t && (this.si = {});
  }
  O(t, e) {
    this.si[t] = e;
  }
  ci(t) {
    Object.assign(this.si, t);
  }
  li(t) {
    return new k(this.A, et, t);
  }
  ui(t, e, i) {
    this.Qe.Ne({ width: e ?? t.width, height: i ?? t.height }, this.qe, t.ht());
  }
  fi(t, e, i, r) {
    this.Je.bs(t, e, i, r);
  }
  di(t, e) {
    if (this.ti) {
      const i = this.ut.De(this.ti, this.si);
      this.Qe.Ne({ width: t, height: e }, this.qe, i), this.ti = null, this.si = {};
    } else this.Qe.Ne({ width: t, height: e }, this.qe, this.ut.Oe);
  }
  pi(t, e, i, r) {
    this.Qe.Xe({ x1: t, y1: e, x2: i, y2: r }, this.qe, this.ut.Oe);
  }
  gi(t, e) {
    this.Qe.Ye({ width: t, height: e }, this.qe, this.ut.Oe);
  }
  mi(t, e, i, r, s, h) {
    this.Qe.We({ x1: t, y1: e, x2: i, y2: r, x3: s, y3: h }, this.qe, this.ut.Oe);
  }
  _i(t, e, i, r, s, h, o, c) {
    this.Qe.Ze({ x1: t, y1: e, cp1x: i, cp1y: r, cp2x: s, cp2y: h, x2: o, y2: c }, this.qe, this.ut.Oe);
  }
  Ai(t, e, i, r) {
    this.Qe.Ke({ width: t, height: e, start: i, stop: r }, this.qe, this.ut.Oe);
  }
  yi(t, e, i = 1, r = {}) {
    return new tt(this.A, t, e, i, r, this);
  }
  wi(t, e = t, i = t, r = 255) {
    this.qe.us(t, e ?? t, i ?? t, r);
    const [s, h, o, c] = this.qe.canvasBackgroundColor;
    this.ge(s, h, o, c);
  }
  ge(t = 0, e = 0, i = 0, r = 0) {
    this.A.clearColor(t, e, i, r), this.A.clear(this.A.COLOR_BUFFER_BIT);
  }
  bi() {
    const t = [0, 0, this.A.canvas.width, this.A.canvas.height];
    this.A.viewport(...t), st(this.A, t), this.ni = t, this.ii.length > 0 && (this.ii[0] = t);
  }
  nt() {
    const t = this.Qe;
    this.Ve.Te(t), t.ge();
  }
  ft() {
    this.ut.ft(), this.Ve.ft(), this.Je.ft();
  }
  get context() {
    return this.A;
  }
  get state() {
    return this.qe;
  }
  get materialManager() {
    return this.ut;
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
function V(n) {
  return n + 3 & -4;
}
function q(n, t, e) {
  n[t] = e >>> 8 & 255, n[t + 1] = 255 & e;
}
function L(n, t, e) {
  n[t] = e >>> 24 & 255, n[t + 1] = e >>> 16 & 255, n[t + 2] = e >>> 8 & 255, n[t + 3] = 255 & e;
}
function ce(n, t, e) {
  for (let i = 0; i < e.length; i++) n[t + i] = 255 & e.charCodeAt(i);
}
function nt(n, t, e) {
  const i = t + e;
  let r = 0;
  const s = R.t;
  for (let h = t; h < i; h += 4) s.uint8[3] = n[h] || 0, s.uint8[2] = n[h + 1] || 0, s.uint8[1] = n[h + 2] || 0, s.uint8[0] = n[h + 3] || 0, r = r + (s.uint32[0] >>> 0) >>> 0;
  return r >>> 0;
}
class le {
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
function Y(n) {
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
    u || (u = [], h.set(c, u)), u[ue(l, c)] = o;
  }
  return { min: t, max: e, table: h };
}
function ht(n, t) {
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
function ue(n, t) {
  let e = 0;
  for (let i = 0; i < t; i++) e = e << 1 | 1 & n, n >>>= 1;
  return e >>> 0;
}
function fe(n) {
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
      const A = s.readBits(2);
      if (A === 0) {
        s.alignToByte();
        const g = s.readBits(16);
        if ((65535 & (65535 ^ g)) !== s.readBits(16)) throw Error("DEFLATE uncompressed LEN/NLEN mismatch");
        for (let p = 0; p < g; p++) h.push(s.readBits(8));
      } else {
        if (A !== 1 && A !== 2) throw Error("Unsupported DEFLATE type");
        {
          let g, p;
          if (A === 1) {
            const d = Array(288).fill(0);
            for (let v = 0; v <= 143; v++) d[v] = 8;
            for (let v = 144; v <= 255; v++) d[v] = 9;
            for (let v = 256; v <= 279; v++) d[v] = 7;
            for (let v = 280; v <= 287; v++) d[v] = 8;
            g = Y(d), p = Y(Array(32).fill(5));
          } else {
            const d = s.readBits(5) + 257, v = s.readBits(5) + 1, m = s.readBits(4) + 4, E = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], y = Array(19).fill(0);
            for (let x = 0; x < m; x++) y[E[x]] = s.readBits(3);
            const b = Y(y), w = [];
            for (; w.length < d + v; ) {
              const x = ht(s, b);
              if (x <= 15) w.push(x);
              else if (x === 16) {
                const S = s.readBits(2) + 3, C = w[w.length - 1] || 0;
                for (let j = 0; j < S; j++) w.push(C);
              } else if (x === 17) {
                const S = s.readBits(3) + 3;
                for (let C = 0; C < S; C++) w.push(0);
              } else {
                if (x !== 18) throw Error("Invalid code length symbol");
                {
                  const S = s.readBits(7) + 11;
                  for (let C = 0; C < S; C++) w.push(0);
                }
              }
            }
            const F = w.slice(0, d), P = w.slice(d, d + v);
            g = Y(F), p = Y(P);
          }
          for (; ; ) {
            const d = ht(s, g);
            if (d < 256) h.push(d);
            else {
              if (d === 256) break;
              if (d > 256 && d < 286) {
                const v = d - 257;
                let m = o[v];
                const E = c[v];
                E && (m += s.readBits(E));
                const y = ht(s, p);
                if (y >= 30) throw Error("Invalid distance symbol");
                let b = l[y];
                const w = u[y];
                w && (b += s.readBits(w));
                const F = h.length - b;
                if (F < 0) throw Error("Invalid distance");
                for (let P = 0; P < m; P++) h.push(h[F + P] || 0);
              } else if (d === 286 || d === 287) throw Error("Reserved length symbol");
            }
          }
        }
      }
    }
  }(new le(n.subarray(i)), r), new Uint8Array(r);
}
function de(n) {
  const t = R, e = new Uint8Array(n);
  if (t.readASCII(e, 0, 4) !== "wOFF") throw Error("Invalid WOFF signature");
  const i = t.readUint(e, 4), r = t.readUshort(e, 12), s = t.readUint(e, 16), h = [];
  let o = 44;
  for (let m = 0; m < r; m++) {
    const E = t.readASCII(e, o, 4), y = t.readUint(e, o + 4), b = t.readUint(e, o + 8), w = t.readUint(e, o + 12), F = t.readUint(e, o + 16);
    h.push({ tag: E, offset: y, compLength: b, origLength: w, checksum: F }), o += 20;
  }
  for (const m of h) {
    const E = new Uint8Array(e.buffer, m.offset, m.compLength);
    if (m.compLength === m.origLength) m.data = new Uint8Array(E);
    else if (m.data = fe(E), m.data.length !== m.origLength) if (m.data.length < m.origLength) {
      const y = new Uint8Array(m.origLength);
      y.set(m.data), m.data = y;
    } else m.data = m.data.subarray(0, m.origLength);
  }
  const c = r;
  let l = 1, u = 0;
  for (; l << 1 <= c; ) l <<= 1, u++;
  const f = 16 * l, A = 16 * c - f;
  let g = 12 + 16 * c;
  const p = {};
  for (const m of h) p[m.tag] = g, g = V(g + m.data.length);
  const d = new Uint8Array(Math.max(s || 0, g));
  L(d, 0, i), q(d, 4, c), q(d, 6, f), q(d, 8, u), q(d, 10, A);
  let v = 12;
  for (const m of h) {
    ce(d, v, m.tag), v += 4;
    let E = m.data;
    if (m.tag === "head" && E.length >= 12) {
      const y = new Uint8Array(E);
      L(y, 8, 0), L(d, v, nt(y, 0, V(y.length))), v += 4;
    } else
      L(d, v, nt(E, 0, V(E.length))), v += 4;
    L(d, v, p[m.tag]), v += 4, L(d, v, m.data.length), v += 4;
  }
  for (const m of h) {
    const E = p[m.tag];
    d.set(m.data, E);
  }
  if (h.find((m) => m.tag === "head")) {
    const m = p.head, E = function(y, b) {
      const w = b + 8, F = [y[w], y[w + 1], y[w + 2], y[w + 3]];
      L(y, w, 0);
      const P = 2981146554 - (nt(y, 0, V(y.length)) >>> 0) >>> 0;
      return y[w] = F[0], y[w + 1] = F[1], y[w + 2] = F[2], y[w + 3] = F[3], P >>> 0;
    }(d, m);
    L(d, m + 8, E);
  }
  return d.buffer;
}
const ge = { parseTab(n, t, e) {
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
    const A = `p${l}e${u}`;
    let g = o.indexOf(f);
    if (g === -1) {
      let p;
      g = i.tables.length, o.push(f);
      const d = s(n, f);
      p = d === 4 ? this.parse4(n, f) : d === 12 ? this.parse12(n, f) : { format: d }, i.tables.push(p);
    }
    i.ids[A] = g;
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
} }, Ae = { parseTab(n, t, e) {
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
} }, pe = { parseTab(n, t, e) {
  const i = R;
  t += 4;
  const r = ["ascender", "descender", "lineGap", "advanceWidthMax", "minLeftSideBearing", "minRightSideBearing", "xMaxExtent", "caretSlopeRise", "caretSlopeRun", "caretOffset", "res0", "res1", "res2", "res3", "metricDataFormat", "numberOfHMetrics"], s = {};
  for (let h = 0; h < r.length; h++) {
    const o = r[h], c = o === "advanceWidthMax" || o === "numberOfHMetrics" ? i.readUshort : i.readShort;
    s[o] = c(n, t + 2 * h);
  }
  return s;
} }, me = { parseTab(n, t, e, i) {
  const r = R, s = [], h = [], o = i.maxp.numGlyphs, c = i.hhea.numberOfHMetrics;
  let l = 0, u = 0, f = 0;
  for (; f < c; ) l = r.readUshort(n, t + (f << 2)), u = r.readShort(n, t + (f << 2) + 2), s.push(l), h.push(u), f++;
  for (; f < o; ) s.push(l), h.push(u), f++;
  return { aWidth: s, lsBearing: h };
} }, Et = { cmap: ge, head: Ae, hhea: pe, maxp: { parseTab(n, t, e) {
  const i = R;
  return i.readUint(n, t), t += 4, { numGlyphs: i.readUshort(n, t) };
} }, hmtx: me, loca: { parseTab(n, t, e, i) {
  const r = R, s = [], h = i.head.indexToLocFormat, o = i.maxp.numGlyphs + 1;
  if (h === 0) for (let c = 0; c < o; c++) s.push(r.readUshort(n, t + (c << 1)) << 1);
  else if (h === 1) for (let c = 0; c < o; c++) s.push(r.readUint(n, t + (c << 2)));
  return s;
} }, glyf: { parseTab(n, t, e, i) {
  const r = [], s = i.maxp.numGlyphs;
  for (let h = 0; h < s; h++) r.push(null);
  return r;
}, Ci(n, t) {
  const e = R, i = n.Mi, r = n.loca;
  if (r[t] === r[t + 1]) return null;
  const s = Z.findTable(i, "glyf", n.xi);
  if (!s) return null;
  let h = s[0] + r[t];
  const o = {};
  if (o.noc = e.readShort(i, h), h += 2, o.xMin = e.readShort(i, h), h += 2, o.yMin = e.readShort(i, h), h += 2, o.xMax = e.readShort(i, h), h += 2, o.yMax = e.readShort(i, h), h += 2, o.xMin >= o.xMax || o.yMin >= o.yMax) return null;
  if (o.noc > 0) {
    o.endPts = [];
    for (let A = 0; A < o.noc; A++) o.endPts.push(e.readUshort(i, h)), h += 2;
    const c = e.readUshort(i, h);
    if (h += 2, i.length - h < c) return null;
    h += c;
    const l = o.endPts[o.noc - 1] + 1;
    o.flags = [];
    for (let A = 0; A < l; A++) {
      const g = i[h];
      if (h++, o.flags.push(g), 8 & g) {
        const p = i[h];
        h++;
        for (let d = 0; d < p; d++) o.flags.push(g), A++;
      }
    }
    o.xs = [];
    for (let A = 0; A < l; A++) {
      const g = o.flags[A], p = !!(16 & g);
      2 & g ? (o.xs.push(p ? i[h] : -i[h]), h++) : p ? o.xs.push(0) : (o.xs.push(e.readShort(i, h)), h += 2);
    }
    o.ys = [];
    for (let A = 0; A < l; A++) {
      const g = o.flags[A], p = !!(32 & g);
      4 & g ? (o.ys.push(p ? i[h] : -i[h]), h++) : p ? o.ys.push(0) : (o.ys.push(e.readShort(i, h)), h += 2);
    }
    let u = 0, f = 0;
    for (let A = 0; A < l; A++) u += o.xs[A], f += o.ys[A], o.xs[A] = u, o.ys[A] = f;
  } else o.parts = [], o.endPts = [], o.flags = [], o.xs = [], o.ys = [];
  return o;
} } }, Z = { parse(n) {
  const t = new Uint8Array(n);
  R.readASCII(t, 0, 4) === "wOFF" && (n = de(n));
  const e = new Uint8Array(n), i = Et, r = {}, s = { Mi: e, Fi: 0, xi: 0 };
  for (const h in i) {
    const o = h, c = Z.findTable(e, o, 0);
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
class ve {
  $i(t) {
    var i;
    const e = [];
    return (i = t.cmap) != null && i.tables ? (t.cmap.tables.forEach((r) => {
      if (r.format === 4) {
        const s = this.Ti(r);
        e.push(...s);
      } else if (r.format === 12) {
        const s = this.Pi(r);
        e.push(...s);
      }
    }), [...new Set(e)]) : [];
  }
  Ti(t) {
    const e = [];
    if (!(t.startCount && t.endCount && t.idRangeOffset && t.idDelta)) return e;
    for (let i = 0; i < t.startCount.length; i++) {
      const r = t.startCount[i], s = t.endCount[i];
      if (r !== 65535 || s !== 65535) {
        for (let h = r; h <= s; h++)
          if (this.Ei(t, h, i) > 0) try {
            const o = String.fromCodePoint(h);
            e.push(o);
          } catch {
          }
      }
    }
    return e;
  }
  Pi(t) {
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
  Ei(t, e, i) {
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
class ye {
  constructor(t) {
    a(this, "Ri");
    a(this, "Si");
    a(this, "K");
    this.K = t, this.Ri = document.createElement("canvas"), this.Si = this.Ri.getContext("2d", { willReadFrequently: !0, alpha: !0 });
  }
  Ui(t, e, i, r) {
    const s = t.length, h = Math.ceil(Math.sqrt(s)), o = Math.ceil(s / h), c = e.width * h, l = e.height * o;
    this.ki(c, l), this.zi(t, e, h, i, r);
    const u = this.K.yi(c, l, 1, { filter: "nearest" });
    return u.tt(this.Ri), { framebuffer: u, columns: h, rows: o };
  }
  ki(t, e) {
    this.Ri.width = t, this.Ri.height = e, this.Ri.style.width = t + "px", this.Ri.style.height = e + "px", this.Si.imageSmoothingEnabled = !1, this.Ri.style.imageRendering = "pixelated", this.Si.clearRect(0, 0, t, e), this.Si.textBaseline = "top", this.Si.textAlign = "left", this.Si.fillStyle = "white";
  }
  zi(t, e, i, r, s) {
    const h = r / s.head.unitsPerEm;
    for (let o = 0; o < t.length; o++) {
      const c = o % i, l = Math.floor(o / i), u = t[o].glyphData;
      if (!u) continue;
      const f = u.advanceWidth * h, A = c * e.width, g = l * e.height, p = A + 0.5 * e.width, d = g + 0.5 * e.height, v = Math.round(p - 0.5 * e.width), m = Math.round(d - 0.5 * r), E = v + 0.5 * (e.width - f), y = m + s.hhea.ascender * h;
      this.Li(u, E, y, h);
    }
  }
  Li(t, e, i, r) {
    if (!t || !t.xs || t.noc === 0) return;
    let { xs: s, ys: h, endPts: o, flags: c } = t;
    if (!(s && h && o && c)) return;
    this.Si.beginPath();
    let l = 0;
    for (let u = 0; u < o.length; u++) {
      const f = o[u];
      if (!(f < l)) {
        if (f >= l) {
          const A = e + s[l] * r, g = i - h[l] * r;
          this.Si.moveTo(A, g);
          let p = l + 1;
          for (; p <= f; )
            if (1 & c[p]) {
              const d = e + s[p] * r, v = i - h[p] * r;
              this.Si.lineTo(d, v), p++;
            } else {
              const d = e + s[p] * r, v = i - h[p] * r;
              if (p + 1 > f) {
                const E = e + s[l] * r, y = i - h[l] * r;
                if (1 & c[l]) this.Si.quadraticCurveTo(d, v, E, y);
                else {
                  const b = (d + E) / 2, w = (v + y) / 2;
                  this.Si.quadraticCurveTo(d, v, b, w);
                }
                break;
              }
              const m = p + 1;
              if (1 & c[m]) {
                const E = e + s[m] * r, y = i - h[m] * r;
                this.Si.quadraticCurveTo(d, v, E, y), p = m + 1;
              } else {
                const E = (d + (e + s[m] * r)) / 2, y = (v + (i - h[m] * r)) / 2;
                this.Si.quadraticCurveTo(d, v, E, y), p = m;
              }
            }
          this.Si.closePath();
        }
        l = f + 1;
      }
    }
    this.Si.fill();
  }
}
class Ct {
  constructor() {
    a(this, "Oi", /* @__PURE__ */ new Map());
    a(this, "Di", /* @__PURE__ */ new Map());
  }
  Ii(t, e) {
    const i = `${this.Hi(t)}_${e}`;
    if (this.Oi.has(i)) return this.Oi.get(i);
    const r = t.cmap;
    if (!r || !r.tables) return this.Oi.set(i, 0), 0;
    let s = 0;
    for (const h of r.tables) if (h.format === 4 ? s = this.Bi(e, h) : h.format === 12 && (s = this.Gi(e, h)), s > 0) break;
    return this.Oi.set(i, s), s;
  }
  Ni(t, e) {
    const i = e.codePointAt(0);
    return i === void 0 ? 0 : this.Ii(t, i);
  }
  Xi(t, e) {
    const i = t.hmtx;
    return i && i.aWidth && i.aWidth.length !== 0 ? e < i.aWidth.length ? i.aWidth[e] : i.aWidth[i.aWidth.length - 1] : 0;
  }
  Yi(t, e) {
    const i = e / t.head.unitsPerEm, r = t.hhea.ascender * i, s = t.hhea.descender * i, h = t.hhea.lineGap * i;
    return { ascender: r, descender: s, lineGap: h, lineHeight: r - s + h, unitsPerEm: t.head.unitsPerEm, scale: i };
  }
  Ki() {
    this.Oi.clear(), this.Di.clear();
  }
  Hi(t) {
    return `${t.xi}_${t.Mi.length}`;
  }
  Bi(t, e) {
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
  Gi(t, e) {
    const i = e.groups.length / 3;
    for (let r = 0; r < i; r++) {
      const s = e.groups[3 * r], h = e.groups[3 * r + 1], o = e.groups[3 * r + 2];
      if (t >= s && t <= h) return o + (t - s);
    }
    return 0;
  }
}
class Ee {
  constructor() {
    a(this, "Wi");
    this.Wi = new Ct();
  }
  Zi(t, e, i) {
    let r = 0;
    const s = this.Wi.Yi(i, e), h = s.lineHeight;
    for (const o of t) {
      const c = this.Wi.Ni(i, o);
      if (c === 0) continue;
      const l = this.Wi.Xi(i, c) * s.scale;
      r = Math.max(r, l);
    }
    return { width: Math.ceil(r), height: Math.ceil(h) };
  }
  Ki() {
    this.Wi.Ki();
  }
}
class we {
  constructor() {
    a(this, "ji");
    this.ji = new Ct();
  }
  createCharacterObjects(t, e) {
    const i = [], r = /* @__PURE__ */ new Map();
    return t.forEach((s, h) => {
      const o = s.codePointAt(0) || 0, c = { character: s, unicode: o, color: this.Vi(h), glyphData: this.qi(e, s) };
      i.push(c), r.set(s, c);
    }), { array: i, map: r };
  }
  Vi(t) {
    return [t % 256 / 255, Math.floor(t / 256) % 256 / 255, 0];
  }
  qi(t, e) {
    const i = e.codePointAt(0) || 0, r = this.ji.Ii(t, i);
    if (r === 0) return null;
    let s = 0;
    t.hmtx && t.hmtx.aWidth && r > 0 && t.hmtx.aWidth[r] !== void 0 && (s = t.hmtx.aWidth[r]);
    const h = Z.T.glyf.Ci(t, r);
    return h ? { ...h, advanceWidth: s } : null;
  }
  Qi(t, e) {
    const i = e.get(t);
    return i ? i.color : [0, 0, 0];
  }
  Ji(t, e) {
    return Array.from(t).map((i) => {
      const r = e.get(i);
      return r ? r.color : [0, 0, 0];
    });
  }
}
class gt {
  constructor(t, e = 16) {
    a(this, "tr");
    a(this, "sr", []);
    a(this, "er", /* @__PURE__ */ new Map());
    a(this, "ir");
    a(this, "rr", 16);
    a(this, "nr", 0);
    a(this, "hr", 0);
    a(this, "ar", { width: 0, height: 0 });
    a(this, "cr");
    a(this, "lr");
    a(this, "ur");
    a(this, "dr");
    a(this, "pr");
    this.rr = e, this.lr = new ve(), this.ur = new ye(t), this.dr = new Ee(), this.pr = new we();
  }
  async gr(t) {
    let e;
    if (t) {
      const i = await fetch(t);
      if (!i.ok) throw new B(`Failed to load font file: ${i.status} ${i.statusText}`);
      e = await i.arrayBuffer();
    } else
      e = await (await fetch("data:font/woff;base64,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")).arrayBuffer();
    await this.vr(e), this.tr = Z.parse(e)[0], await this.mr();
  }
  _r(t) {
    if (t === void 0) return this.rr;
    this.rr = t, this.ar = this.dr.Zi(this.sr.map((i) => i.character), this.rr, this.tr);
    const e = this.ur.Ui(this.sr, this.ar, this.rr, this.tr);
    this.ir = e.framebuffer, this.nr = e.columns, this.hr = e.rows;
  }
  async Ar(t) {
    try {
      const e = await fetch(t);
      if (!e.ok) throw new B(`Failed to load font file: ${e.status} ${e.statusText}`);
      const i = await e.arrayBuffer();
      await this.vr(i);
      const r = Z.parse(i);
      if (!r || r.length === 0) throw Error("Failed to parse font file");
      this.tr = r[0], await this.mr();
    } catch (e) {
      throw new B("Failed to load font: " + (e instanceof Error ? e.message : "Unknown error"), e);
    }
  }
  async vr(t) {
    const e = Date.now();
    this.cr = new FontFace("CustomFont_" + e, t), await this.cr.load(), document.fonts.add(this.cr);
  }
  async mr() {
    const t = this.lr.$i(this.tr), { array: e, map: i } = this.pr.createCharacterObjects(t, this.tr);
    this.sr = e, this.er = i, this.ar = this.dr.Zi(t, this.rr, this.tr);
    const r = this.ur.Ui(this.sr, this.ar, this.rr, this.tr);
    this.ir = r.framebuffer, this.nr = r.columns, this.hr = r.rows;
  }
  Qi(t) {
    return this.pr.Qi(t, this.er);
  }
  getCharacterColors(t) {
    return this.pr.Ji(t, this.er);
  }
  ft() {
    this.ir.ft(), document.fonts.delete(this.cr);
  }
  get fontFramebuffer() {
    return this.ir;
  }
  get characterMap() {
    return this.er;
  }
  get characters() {
    return this.sr;
  }
  get textureColumns() {
    return this.nr;
  }
  get textureRows() {
    return this.hr;
  }
  get maxGlyphDimensions() {
    return this.ar;
  }
  get fontSize() {
    return this.rr;
  }
  get font() {
    return this.tr;
  }
}
class Ot {
  constructor(t, e, i) {
    a(this, "yr");
    a(this, "wr");
    a(this, "I");
    a(this, "H");
    a(this, "br");
    a(this, "Cr");
    a(this, "Mr");
    a(this, "Fr");
    a(this, "$r");
    this.Mr = t, this.Fr = e, this.$r = i, this.js();
  }
  js() {
    this.yr = Math.floor(this.Mr.width / this.Fr), this.wr = Math.floor(this.Mr.height / this.$r), this.I = this.yr * this.Fr, this.H = this.wr * this.$r, this.br = Math.floor((this.Mr.width - this.I) / 2), this.Cr = Math.floor((this.Mr.height - this.H) / 2);
  }
  Tr(t, e) {
    this.Fr = t, this.$r = e, this.js();
  }
  get cellWidth() {
    return this.Fr;
  }
  get cellHeight() {
    return this.$r;
  }
  get cols() {
    return this.yr;
  }
  get rows() {
    return this.wr;
  }
  get width() {
    return this.I;
  }
  get height() {
    return this.H;
  }
  get offsetX() {
    return this.br;
  }
  get offsetY() {
    return this.Cr;
  }
}
const Te = /^rgba?\(([^)]+)\)$/i;
function ot(n) {
  return Number.isNaN(n) ? 0 : Math.max(0, Math.min(255, n));
}
function be(n) {
  if (!n) return null;
  const t = n.trim().toLowerCase();
  if (!t) return null;
  let e = null;
  return t.startsWith("rgb") && (e = function(i) {
    const r = Te.exec(i.trim());
    if (!r) return null;
    const s = r[1].split(",").map((u) => u.trim());
    if (s.length < 3) return null;
    const h = ot(parseFloat(s[0])), o = ot(parseFloat(s[1])), c = ot(parseFloat(s[2])), l = s[3] !== void 0 ? 255 * Math.max(0, Math.min(1, parseFloat(s[3]))) : 255;
    return [h, o, c, Math.round(l)];
  }(t)), e ? e[3] === 0 ? null : e : null;
}
class xe {
  constructor(t = {}) {
    a(this, "Mr");
    a(this, "Pr", null);
    a(this, "Er", !1);
    a(this, "Rr");
    this.Er = t.overlay ?? !1, this.Er && t.canvas ? (this.Pr = t.canvas, this.Mr = this.Sr(), this.Rr = !0, this.Ur()) : t.canvas ? (this.Mr = t.canvas, this.Rr = !1) : (this.Mr = this.kr(t.width, t.height), this.Rr = !0), this.Mr.style.imageRendering = "pixelated";
  }
  kr(t, e) {
    const i = document.createElement("canvas");
    return i.className = "textmodeCanvas", i.style.imageRendering = "pixelated", i.width = t || 800, i.height = e || 600, document.body.appendChild(i), i;
  }
  Sr() {
    const t = document.createElement("canvas");
    t.className = "textmodeCanvas", t.style.imageRendering = "pixelated";
    const e = this.Pr.getBoundingClientRect();
    let i = Math.round(e.width), r = Math.round(e.height);
    if (this.Pr instanceof HTMLVideoElement) {
      const o = this.Pr;
      (i === 0 || r === 0) && o.videoWidth > 0 && o.videoHeight > 0 && (i = o.videoWidth, r = o.videoHeight);
    }
    t.width = i, t.height = r, t.style.position = "absolute", t.style.pointerEvents = "none";
    const s = window.getComputedStyle(this.Pr);
    let h = parseInt(s.zIndex || "0", 10);
    return isNaN(h) && (h = 0), t.style.zIndex = "" + (h + 1), t;
  }
  Ur() {
    var t;
    this.zr(), (t = this.Pr.parentNode) == null || t.insertBefore(this.Mr, this.Pr.nextSibling);
  }
  Lr() {
    const t = [];
    return this.Er && this.Pr instanceof HTMLElement && (t.push(this.Pr), this.Pr.parentElement && t.push(this.Pr.parentElement)), this.Mr.parentElement && t.push(this.Mr.parentElement), t.push(this.Mr), t.push(document.body), t.push(document.documentElement), t;
  }
  Or() {
    const t = this.Lr();
    for (const e of t) {
      if (!e) continue;
      const i = window.getComputedStyle(e);
      console.log("Computed style for background color sampling:", i.backgroundColor);
      const r = be(i.backgroundColor);
      if (r) return r;
    }
    return [255, 255, 255, 255];
  }
  zr() {
    if (!this.Pr) return;
    const t = this.Pr.getBoundingClientRect();
    let e = this.Pr.offsetParent;
    if (e && e !== document.body) {
      const i = e.getBoundingClientRect();
      this.Mr.style.top = t.top - i.top + "px", this.Mr.style.left = t.left - i.left + "px";
    } else this.Mr.style.top = t.top + window.scrollY + "px", this.Mr.style.left = t.left + window.scrollX + "px";
  }
  Dr(t, e) {
    if (this.Er) {
      const i = this.Pr.getBoundingClientRect();
      this.Mr.width = Math.round(i.width), this.Mr.height = Math.round(i.height), this.zr();
    } else this.Mr.width = t ?? this.Mr.width, this.Mr.height = e ?? this.Mr.height;
  }
  Ir() {
    const t = this.Mr.getContext("webgl2", { alpha: !0, premultipliedAlpha: !1, preserveDrawingBuffer: !0, antialias: !1, depth: !0, stencil: !1, powerPreference: "high-performance" });
    if (!t) throw new B("`textmode.js` requires WebGL2 support.");
    return t;
  }
  ft() {
    const t = this.Mr.getContext("webgl") || this.Mr.getContext("webgl2");
    if (t) {
      const e = t.getExtension("WEBGL_lose_context");
      e == null || e.loseContext();
    }
    this.Rr && this.Mr.parentNode && this.Mr.parentNode.removeChild(this.Mr);
  }
  get canvas() {
    return this.Mr;
  }
  get targetCanvas() {
    return this.Pr;
  }
  get width() {
    return this.Mr.width;
  }
  get height() {
    return this.Mr.height;
  }
}
function Q(n) {
  return X(parseInt(n, 16), 0, 255);
}
class M {
  constructor(t, e, i, r, s) {
    a(this, "Hr");
    a(this, "Br");
    a(this, "Ht");
    a(this, "r");
    a(this, "g");
    a(this, "b");
    a(this, "a");
    this.r = X(t, 0, 255), this.g = X(e, 0, 255), this.b = X(i, 0, 255), this.a = X(r, 0, 255), this.Hr = [this.r, this.g, this.b, this.a], this.Br = [this.r / 255, this.g / 255, this.b / 255, this.a / 255], this.Ht = s ? [...s] : void 0;
  }
  static Gr(t, e, i, r) {
    if (M.Nr(t)) return t;
    if (Array.isArray(t)) {
      if (t.length < 3) throw Error("Component tuples must include at least RGB values.");
      const [s, h, o] = t, c = t.length === 4 ? t[3] : 255;
      return M.Xr(s, h, o, c);
    }
    if (typeof t == "string") {
      const s = t.trim();
      if (s.length === 0) throw Error("Color strings cannot be empty.");
      if (typeof e == "function" && Array.from(s).length === 1) {
        const h = function(o, c) {
          const l = c(o);
          if (!Array.isArray(l) || l.length === 0) return null;
          const u = l[0];
          return [u[0], u[1], u[2]];
        }(s, e);
        if (h) return M.Yr(h);
      }
      return M.Kr(s);
    }
    if (typeof t == "number") return typeof e == "number" && typeof i == "number" ? M.Xr(t, e, i, r ?? 255) : M.Wr(t);
    throw Error("Unsupported color input passed to TextmodeColor.$from.");
  }
  static Xr(t, e, i, r = 255) {
    return new M(t, e, i, r);
  }
  static Wr(t, e = 255) {
    return new M(t, t, t, e);
  }
  static Kr(t) {
    return new M(...function(e) {
      const i = e.replace(/^#|0x/gi, ""), r = (s = i).length === 3 || s.length === 4 ? s.split("").map((h) => h + h).join("") : s;
      var s;
      if (r.length !== 6 && r.length !== 8) throw Error("Invalid hex color: " + e);
      return [Q(r.slice(0, 2)), Q(r.slice(2, 4)), Q(r.slice(4, 6)), r.length === 8 ? Q(r.slice(6, 8)) : 255];
    }(t));
  }
  static Yr(t) {
    const [e, i, r] = t;
    return new M(255 * e, 255 * i, 255 * r, 255, t);
  }
  get rgb() {
    return [this.r, this.g, this.b];
  }
  get rgba() {
    return [...this.Hr];
  }
  get normalized() {
    return [...this.Br];
  }
  get character() {
    return this.Ht ? [...this.Ht] : void 0;
  }
  withAlpha(t) {
    return new M(this.r, this.g, this.b, t, this.Ht);
  }
  static Nr(t) {
    return t instanceof M;
  }
}
const At = /* @__PURE__ */ new Map();
function Re(n) {
  At.set(n.id, n);
}
function ze(n) {
  At.delete(n);
}
function Me(n) {
  return At.get(n);
}
class pt {
  constructor(t, e, i, r, s, h, o, c) {
    a(this, "A");
    a(this, "K");
    a(this, "Zr");
    a(this, "jr");
    a(this, "Vr");
    a(this, "I");
    a(this, "H");
    a(this, "W", null);
    a(this, "tr");
    a(this, "qr", "brightness");
    a(this, "Qr", null);
    a(this, "$t", 0);
    a(this, "Dt", 0);
    a(this, "It", 0);
    a(this, "Tt", 0);
    a(this, "Jr", "sampled");
    a(this, "tn", "fixed");
    a(this, "Bt", [1, 1, 1, 1]);
    a(this, "Gt", [0, 0, 0, 1]);
    a(this, "sn", [0, 0, 0, 1]);
    a(this, "en", [[0.1, 0, 0]]);
    a(this, "rn", null);
    a(this, "nn", /* @__PURE__ */ new Set());
    a(this, "hn", [[0, 0, 0, 0]]);
    a(this, "an", 0);
    this.A = t, this.K = e, this.Zr = i, this.tr = r, this.jr = s, this.Vr = h, this.I = o, this.H = c;
  }
  conversionMode(t) {
    return this.qr = t, this.Qr = null, this.W = null, this;
  }
  ft() {
    this.A.deleteTexture(this.Zr);
    for (const t of this.nn) t();
    this.nn.clear();
  }
  cn(t) {
    this.nn.add(t);
  }
  invert(t = !0) {
    return this.$t = t ? 1 : 0, this.W = null, this;
  }
  flipX(t = !0) {
    return this.Dt = t ? 1 : 0, this.W = null, this;
  }
  flipY(t = !0) {
    return this.It = t ? 1 : 0, this.W = null, this;
  }
  charRotation(t) {
    return this.Tt = Tt(t), this.W = null, this;
  }
  charColorMode(t) {
    return this.Jr = t, this.W = null, this;
  }
  cellColorMode(t) {
    return this.tn = t, this.W = null, this;
  }
  charColor(t, e, i, r) {
    return this.ln(this.Bt, t, e, i, r), this.W = null, this;
  }
  cellColor(t, e, i, r) {
    return this.ln(this.Gt, t, e, i, r), this.W = null, this;
  }
  background(t, e, i, r) {
    return this.ln(this.sn, t, e, i, r), this.W = null, this;
  }
  colorFilter(t) {
    if (!t || t.length === 0) return this.an = 0, this.hn = [[0, 0, 0, 0]], this.W = null, this;
    const e = [];
    for (const i of t) {
      if (e.length >= 64) break;
      let r = M.Gr(i);
      e.push(r.normalized);
    }
    return this.hn = e, this.an = e.length, this.W = null, this;
  }
  characters(t) {
    return this.rn = t, this.un(t), this.W = null, this;
  }
  fn(t) {
    this.tr = t, this.rn && this.un(this.rn), this.W = null;
  }
  get texture() {
    return this.Zr;
  }
  get width() {
    return this.I;
  }
  get height() {
    return this.H;
  }
  get originalWidth() {
    return this.jr;
  }
  get originalHeight() {
    return this.Vr;
  }
  ht() {
    return this.W || this.ct(), this.W;
  }
  dn() {
  }
  ct() {
    this.dn();
    const t = this.pn(), e = this.gn(), i = t.createShader(e), r = t.createUniforms(e);
    this.W = this.K.materialManager.De(i, r);
  }
  ln(t, e, i, r, s) {
    const h = M.Gr(e, i, r, s);
    J(t, h.r, h.g, h.b, h.a);
  }
  un(t) {
    const e = this.tr.getCharacterColors(t).filter((i) => Array.isArray(i)).slice(0, 255);
    this.en = e.length > 0 ? e : this.en;
  }
  createBaseConversionUniforms() {
    const t = this.an > 0;
    return { u_image: this.vn(), u_invert: !!this.$t, u_flipX: !!this.Dt, u_flipY: !!this.It, u_charRotation: this.Tt, u_charColorFixed: this.Jr === "fixed", u_charColor: this.Bt, u_cellColorFixed: this.tn === "fixed", u_cellColor: this.Gt, u_backgroundColor: this.sn, u_charCount: this.en.length, u_charList: this.en, u_colorFilterEnabled: t, u_colorFilterSize: t ? this.an : 0, u_colorFilterPalette: this.hn };
  }
  pn() {
    if (this.Qr && this.Qr.id === this.qr) return this.Qr;
    const t = Me(this.qr);
    if (!t) throw Error(`[textmode.js] Conversion mode "${this.qr}" is not registered. If this mode is provided by an add-on, make sure its plugin is installed before loading sources.`);
    return this.Qr = t, t;
  }
  gn() {
    return { renderer: this.K, gl: this.A, font: this.tr, source: this, gridWidth: this.I, gridHeight: this.H };
  }
}
class K extends pt {
  constructor(t, e, i, r, s, h, o, c) {
    const l = Math.min(o / s, c / h);
    super(t, e, i, r, s, h, Math.max(1, Math.floor(s * l)), Math.max(1, Math.floor(h * l)));
  }
  static mn(t, e, i, r, s) {
    const h = t.context, o = h.createTexture();
    h.bindTexture(h.TEXTURE_2D, o), h.pixelStorei(h.UNPACK_FLIP_Y_WEBGL, 1), $(h, h.NEAREST, h.NEAREST, h.CLAMP_TO_EDGE, h.CLAMP_TO_EDGE), h.texImage2D(h.TEXTURE_2D, 0, h.RGBA, h.RGBA, h.UNSIGNED_BYTE, i), h.bindTexture(h.TEXTURE_2D, null);
    const c = i.naturalWidth ?? i.width ?? i.videoWidth ?? 0, l = i.naturalHeight ?? i.height ?? i.videoHeight ?? 0;
    return new K(h, t, o, e, c, l, r, s);
  }
  vn() {
    return this.Zr;
  }
}
class Pt {
  constructor(t = 60) {
    a(this, "_n");
    a(this, "An", null);
    a(this, "yn", 0);
    a(this, "wn", !0);
    a(this, "bn", 0);
    a(this, "Cn", 0);
    a(this, "Mn", []);
    a(this, "xn", 10);
    a(this, "Fn", 0);
    this._n = 1e3 / t;
  }
  $n(t) {
    if (!this.wn) return;
    this.yn = performance.now();
    const e = (i) => {
      if (!this.wn) return void (this.An = null);
      const r = i - this.yn;
      r >= this._n && (t(), this.yn = i - r % this._n), this.wn && (this.An = requestAnimationFrame(e));
    };
    this.An = requestAnimationFrame(e);
  }
  Tn() {
    this.An && (cancelAnimationFrame(this.An), this.An = null);
  }
  Pn() {
    this.wn && (this.wn = !1, this.Tn());
  }
  En(t) {
    this.wn || (this.wn = !0, this.$n(t));
  }
  Rn(t, e) {
    if (t === void 0) return this.bn;
    this._n = 1e3 / t, this.wn && e && (this.Tn(), this.$n(e));
  }
  Sn() {
    const t = performance.now();
    if (this.Cn > 0) {
      const e = t - this.Cn;
      this.Mn.push(e), this.Mn.length > this.xn && this.Mn.shift();
      const i = this.Mn.reduce((r, s) => r + s, 0) / this.Mn.length;
      this.bn = 1e3 / i;
    }
    this.Cn = t;
  }
  get Un() {
    return this.wn;
  }
  get kn() {
    return this.bn;
  }
  get zn() {
    return this.Fn;
  }
  set zn(t) {
    this.Fn = t;
  }
  Ln() {
    this.Fn++;
  }
}
class Bt {
  constructor(t) {
    a(this, "Mr");
    a(this, "On");
    a(this, "Dn", { x: -1, y: -1 });
    a(this, "In", { x: -1, y: -1 });
    a(this, "Hn", null);
    a(this, "Bn", 0);
    a(this, "Gn");
    a(this, "Nn");
    a(this, "Xn");
    a(this, "Yn");
    a(this, "Kn");
    a(this, "Wn");
    a(this, "Zn", !1);
    a(this, "jn");
    a(this, "Vn");
    a(this, "qn");
    a(this, "Qn");
    a(this, "Jn");
    this.Mr = t;
  }
  so(t) {
    const e = performance.now() + Math.max(0, t);
    e > this.Bn && (this.Bn = e);
  }
  eo() {
    return performance.now() < this.Bn;
  }
  io(t) {
    const e = this.Mr.canvas;
    e.style.cursor = t == null || t === "" ? "" : t;
  }
  gr(t) {
    this.On = t, this.ro();
  }
  no() {
    if (this.Zn) return;
    const t = this.Mr.canvas;
    this.Gn = (e) => {
      this.oo(e), this.ho(e);
    }, this.Nn = () => {
      this.In = { ...this.Dn }, this.Dn.x = -1, this.Dn.y = -1, this.Hn = null;
    }, this.Xn = (e) => {
      this.oo(e), this.ao(e);
    }, this.Yn = (e) => {
      this.oo(e), this.co(e);
    }, this.Kn = (e) => {
      this.oo(e), this.lo(e);
    }, this.Wn = (e) => {
      this.oo(e), this.uo(e);
    }, t.addEventListener("mousemove", this.Gn, { passive: !0 }), t.addEventListener("mouseleave", this.Nn, { passive: !0 }), t.addEventListener("mousedown", this.Xn, { passive: !0 }), t.addEventListener("mouseup", this.Yn, { passive: !0 }), t.addEventListener("click", this.Kn, { passive: !0 }), t.addEventListener("wheel", this.Wn, { passive: !1 }), this.Zn = !0;
  }
  fo() {
    if (!this.Zn) return;
    const t = this.Mr.canvas;
    t.removeEventListener("mousemove", this.Gn), t.removeEventListener("mouseleave", this.Nn), t.removeEventListener("mousedown", this.Xn), t.removeEventListener("mouseup", this.Yn), t.removeEventListener("click", this.Kn), t.removeEventListener("wheel", this.Wn), this.Zn = !1;
  }
  ro() {
    if (this.Zn) try {
      if (this.Hn) {
        const t = new MouseEvent("mousemove", { clientX: this.Hn.x, clientY: this.Hn.y, bubbles: !1, cancelable: !1 });
        this.oo(t);
      } else this.Dn.x !== -1 && this.Dn.y !== -1 && (this.Dn.x >= this.On.cols || this.Dn.y >= this.On.rows) && (this.Dn.x = -1, this.Dn.y = -1);
    } catch {
      this.Dn.x = -1, this.Dn.y = -1;
    }
  }
  do(t) {
    this.jn = t;
  }
  po(t) {
    this.Vn = t;
  }
  vo(t) {
    this.qn = t;
  }
  mo(t) {
    this.Qn = t;
  }
  _o(t) {
    this.Jn = t;
  }
  Ao() {
    return { x: this.Dn.x, y: this.Dn.y };
  }
  ho(t) {
    if (this.Qn && !this.eo()) {
      const e = { position: { ...this.Dn }, previousPosition: { ...this.In }, originalEvent: t };
      this.Qn(e);
    }
  }
  ao(t) {
    if (this.Vn && !this.eo()) {
      const e = { position: { ...this.Dn }, previousPosition: { ...this.In }, button: t.button, originalEvent: t };
      this.Vn(e);
    }
  }
  co(t) {
    if (this.qn && !this.eo()) {
      const e = { position: { ...this.Dn }, previousPosition: { ...this.In }, button: t.button, originalEvent: t };
      this.qn(e);
    }
  }
  lo(t) {
    if (this.jn && !this.eo()) {
      const e = { position: { ...this.Dn }, previousPosition: { ...this.In }, button: t.button, originalEvent: t };
      this.jn(e);
    }
  }
  uo(t) {
    if (this.Jn && !this.eo()) {
      const e = { position: { ...this.Dn }, previousPosition: { ...this.In }, delta: { x: t.deltaX, y: t.deltaY }, originalEvent: t };
      this.Jn(e);
    }
  }
  oo(t) {
    const e = this.Mr.canvas;
    this.In = { ...this.Dn }, this.Hn = { x: t.clientX, y: t.clientY };
    const i = e.getBoundingClientRect(), r = t.clientX - i.left, s = t.clientY - i.top, h = e.width / i.width, o = s * (e.height / i.height), c = r * h - this.On.offsetX, l = o - this.On.offsetY, u = Math.floor(c / this.On.cellWidth), f = Math.floor(l / this.On.cellHeight);
    u >= 0 && u < this.On.cols && f >= 0 && f < this.On.rows ? (this.Dn.x = u, this.Dn.y = f) : (this.Dn.x = -1, this.Dn.y = -1);
  }
}
const Fe = Object.freeze(Object.defineProperty({ __proto__: null, MouseManager: Bt }, Symbol.toStringTag, { value: "Module" }));
class St {
  constructor() {
    a(this, "yo", /* @__PURE__ */ new Map());
    a(this, "wo", null);
    a(this, "bo", null);
    a(this, "Co");
    a(this, "Mo");
    a(this, "Zn", !1);
    a(this, "xo");
    a(this, "Fo");
    a(this, "$o", { ArrowUp: "UP_ARROW", ArrowDown: "DOWN_ARROW", ArrowLeft: "LEFT_ARROW", ArrowRight: "RIGHT_ARROW", F1: "F1", F2: "F2", F3: "F3", F4: "F4", F5: "F5", F6: "F6", F7: "F7", F8: "F8", F9: "F9", F10: "F10", F11: "F11", F12: "F12", Enter: "ENTER", Return: "RETURN", Tab: "TAB", Escape: "ESCAPE", Backspace: "BACKSPACE", Delete: "DELETE", Insert: "INSERT", Home: "HOME", End: "END", PageUp: "PAGE_UP", PageDown: "PAGE_DOWN", Shift: "SHIFT", Control: "CONTROL", Alt: "ALT", Meta: "META", " ": "SPACE" });
  }
  no() {
    this.Zn || (this.Co = (t) => {
      this.To(t);
    }, this.Mo = (t) => {
      this.Po(t);
    }, window.addEventListener("keydown", this.Co, { passive: !1 }), window.addEventListener("keyup", this.Mo, { passive: !1 }), this.Zn = !0);
  }
  fo() {
    this.Zn && (window.removeEventListener("keydown", this.Co), window.removeEventListener("keyup", this.Mo), this.Zn = !1, this.yo.clear(), this.wo = null, this.bo = null);
  }
  po(t) {
    this.xo = t;
  }
  vo(t) {
    this.Fo = t;
  }
  Eo(t) {
    const e = this.Ro(t), i = this.yo.get(t) || this.yo.get(e);
    return (i == null ? void 0 : i.isPressed) || !1;
  }
  So() {
    return this.wo;
  }
  Uo() {
    return this.bo;
  }
  ko() {
    const t = [];
    for (const [e, i] of this.yo) i.isPressed && t.push(e);
    return t;
  }
  zo() {
    return { ctrl: this.Eo("Control"), shift: this.Eo("Shift"), alt: this.Eo("Alt"), meta: this.Eo("Meta") };
  }
  Lo() {
    this.yo.clear(), this.wo = null, this.bo = null;
  }
  To(t) {
    const e = t.key, i = Date.now();
    this.yo.has(e) || this.yo.set(e, { isPressed: !1, lastPressTime: 0, lastReleaseTime: 0 });
    const r = this.yo.get(e);
    if (!r.isPressed && (r.isPressed = !0, r.lastPressTime = i, this.wo = e, this.xo)) {
      const s = { key: e, keyCode: t.keyCode, ctrlKey: t.ctrlKey, shiftKey: t.shiftKey, altKey: t.altKey, metaKey: t.metaKey, isPressed: !0, originalEvent: t };
      this.xo(s);
    }
  }
  Po(t) {
    const e = t.key, i = Date.now();
    this.yo.has(e) || this.yo.set(e, { isPressed: !1, lastPressTime: 0, lastReleaseTime: 0 });
    const r = this.yo.get(e);
    if (r.isPressed = !1, r.lastReleaseTime = i, this.bo = e, this.Fo) {
      const s = { key: e, keyCode: t.keyCode, ctrlKey: t.ctrlKey, shiftKey: t.shiftKey, altKey: t.altKey, metaKey: t.metaKey, isPressed: !1, originalEvent: t };
      this.Fo(s);
    }
  }
  Ro(t) {
    return this.$o[t] || t.toLowerCase();
  }
}
const Ce = Object.freeze(Object.defineProperty({ __proto__: null, KeyboardManager: St }, Symbol.toStringTag, { value: "Module" }));
class Dt {
  constructor(t, e) {
    a(this, "Mr");
    a(this, "Oo");
    a(this, "On");
    a(this, "Do", /* @__PURE__ */ new Map());
    a(this, "Io", /* @__PURE__ */ new Map());
    a(this, "Ho", /* @__PURE__ */ new Map());
    a(this, "Bo", null);
    a(this, "Go");
    a(this, "No");
    a(this, "Xo");
    a(this, "Yo");
    a(this, "Ko");
    a(this, "Wo");
    a(this, "Zn", !1);
    a(this, "Zo");
    a(this, "jo");
    a(this, "Vo");
    a(this, "qo");
    a(this, "Qo");
    a(this, "Jo");
    a(this, "th");
    a(this, "sh");
    a(this, "eh");
    a(this, "ih");
    a(this, "rh", 320);
    a(this, "nh", 350);
    a(this, "oh", 10);
    a(this, "hh", 550);
    a(this, "ah", 14);
    a(this, "uh", 48);
    a(this, "fh", 650);
    a(this, "dh", 0.02);
    a(this, "ph", 2);
    a(this, "gh", 600);
    a(this, "mh", 0);
    a(this, "_h", null);
    this.Mr = t, this.Oo = e;
    const i = this.Mr.canvas;
    this.Go = i.style.touchAction, this.No = i.style.userSelect, i.style.touchAction || (i.style.touchAction = "none"), i.style.userSelect || (i.style.userSelect = "none");
  }
  gr(t) {
    this.On = t, this.ro();
  }
  no() {
    if (this.Zn) return;
    const t = this.Mr.canvas;
    this.Xo = (e) => {
      this.Ah(e);
    }, this.Yo = (e) => {
      this.yh(e);
    }, this.Ko = (e) => {
      this.wh(e);
    }, this.Wo = (e) => {
      this.bh(e);
    }, t.addEventListener("touchstart", this.Xo, { passive: !1 }), t.addEventListener("touchmove", this.Yo, { passive: !1 }), t.addEventListener("touchend", this.Ko, { passive: !1 }), t.addEventListener("touchcancel", this.Wo, { passive: !1 }), this.Zn = !0;
  }
  fo() {
    if (!this.Zn) return;
    const t = this.Mr.canvas;
    t.removeEventListener("touchstart", this.Xo), t.removeEventListener("touchmove", this.Yo), t.removeEventListener("touchend", this.Ko), t.removeEventListener("touchcancel", this.Wo), this.Zn = !1, this.Bo = null, this.Do.clear(), this.Io.clear(), this.Ho.forEach((e) => {
      e.longPressTimer !== null && window.clearTimeout(e.longPressTimer);
    }), this.Ho.clear(), this._h = null, this.mh = 0, t.style.touchAction = this.Go, t.style.userSelect = this.No;
  }
  ro() {
    if (!this.On || this.Do.size === 0) return;
    const t = /* @__PURE__ */ new Map();
    for (const e of this.Do.values()) {
      const i = this.Ch(e.clientX, e.clientY, e.id, e);
      t.set(e.id, i);
    }
    this.Do = t;
  }
  Mh() {
    return Array.from(this.Do.values()).map((t) => ({ ...t }));
  }
  xh(t) {
    this.Zo = t;
  }
  mo(t) {
    this.jo = t;
  }
  Fh(t) {
    this.Vo = t;
  }
  $h(t) {
    this.qo = t;
  }
  Th(t) {
    this.Qo = t;
  }
  Ph(t) {
    this.Jo = t;
  }
  Eh(t) {
    this.th = t;
  }
  Rh(t) {
    this.sh = t;
  }
  Sh(t) {
    this.eh = t;
  }
  kh(t) {
    this.ih = t;
  }
  Ah(t) {
    var r;
    if (!this.On) return;
    t.preventDefault(), (r = this.Oo) == null || r.so(this.gh);
    const e = performance.now(), i = this.zh(t.changedTouches);
    for (const s of i) {
      const h = this.Do.get(s.id);
      h && this.Io.set(s.id, this.Lh(h)), this.Do.set(s.id, s);
      const o = { id: s.id, startPosition: s, lastPosition: s, startTime: e, lastTime: e, longPressTimer: null, longPressFired: !1 };
      this.th && (o.longPressTimer = window.setTimeout(() => {
        const c = this.Do.get(s.id);
        c && (o.longPressFired = !0, this.th({ touch: this.Lh(c), duration: performance.now() - o.startTime, originalEvent: t }));
      }, this.hh)), this.Ho.set(s.id, o), this.Zo && this.Zo(this.Oh(s, t, void 0, e));
    }
    this.Do.size === 2 && this.Dh();
  }
  yh(t) {
    var r;
    if (!this.On) return;
    t.preventDefault(), (r = this.Oo) == null || r.so(this.gh);
    const e = performance.now(), i = this.zh(t.changedTouches);
    for (const s of i) {
      const h = this.Do.get(s.id), o = h ? this.Lh(h) : void 0;
      o && this.Io.set(s.id, o), this.Do.set(s.id, s);
      const c = this.Ho.get(s.id);
      c && (c.lastPosition = s, c.lastTime = e, o) && G(o.clientX, o.clientY, s.clientX, s.clientY) > this.ah && c.longPressTimer !== null && (window.clearTimeout(c.longPressTimer), c.longPressTimer = null), this.jo && this.jo(this.Oh(s, t, o, e));
    }
    this.Do.size === 2 ? this.Ih(t) : this.Bo = null;
  }
  wh(t) {
    if (!this.On) return;
    t.preventDefault();
    const e = performance.now(), i = this.zh(t.changedTouches);
    for (const r of i) {
      const s = this.Do.get(r.id), h = s ? this.Lh(s) : void 0, o = this.Ho.get(r.id);
      o && o.longPressTimer !== null && (window.clearTimeout(o.longPressTimer), o.longPressTimer = null), this.Vo && this.Vo(this.Oh(r, t, h, e)), o && this.Hh(o, t), this.Ho.delete(r.id), this.Io.delete(r.id), this.Do.delete(r.id);
    }
    this.Do.size < 2 && (this.Bo = null);
  }
  bh(t) {
    if (!this.On) return;
    t.preventDefault();
    const e = performance.now(), i = this.zh(t.changedTouches);
    for (const r of i) {
      const s = this.Do.get(r.id), h = s ? this.Lh(s) : void 0, o = this.Ho.get(r.id);
      o && o.longPressTimer !== null && (window.clearTimeout(o.longPressTimer), o.longPressTimer = null), this.qo && this.qo(this.Oh(r, t, h, e)), this.Ho.delete(r.id), this.Io.delete(r.id), this.Do.delete(r.id);
    }
    this.Do.size < 2 && (this.Bo = null);
  }
  zh(t) {
    const e = [];
    for (let i = 0; i < t.length; i += 1) {
      const r = t.item(i);
      r && e.push(this.Bh(r));
    }
    return e;
  }
  Bh(t) {
    return this.Ch(t.clientX, t.clientY, t.identifier, { id: t.identifier, x: -1, y: -1, clientX: t.clientX, clientY: t.clientY, pressure: t.force, radiusX: t.radiusX, radiusY: t.radiusY, rotationAngle: t.rotationAngle });
  }
  Ch(t, e, i, r) {
    const s = this.Mr.canvas, h = s.getBoundingClientRect(), o = t - h.left, c = e - h.top, l = s.width / h.width, u = c * (s.height / h.height), f = o * l - this.On.offsetX, A = u - this.On.offsetY, g = Math.floor(f / this.On.cellWidth), p = Math.floor(A / this.On.cellHeight), d = g >= 0 && g < this.On.cols && p >= 0 && p < this.On.rows;
    return { id: i, x: d ? g : -1, y: d ? p : -1, clientX: t, clientY: e, pressure: r.pressure, radiusX: r.radiusX, radiusY: r.radiusY, rotationAngle: r.rotationAngle };
  }
  Oh(t, e, i, r) {
    const s = this.Ho.get(t.id), h = Array.from(this.Io.values()).map((l) => this.Lh(l)), o = Array.from(this.Do.values()).map((l) => this.Lh(l)), c = this.zh(e.changedTouches);
    return { touch: this.Lh(t), previousTouch: i ? this.Lh(i) : void 0, touches: o, previousTouches: h, changedTouches: c, deltaTime: s ? r - s.lastTime : 0, originalEvent: e };
  }
  Dh() {
    if (this.Do.size !== 2) return void (this.Bo = null);
    const t = Array.from(this.Do.values()), [e, i] = t, r = G(e.x, e.y, i.x, i.y), s = vt(e.clientX, e.clientY, i.clientX, i.clientY);
    this.Bo = { ids: [e.id, i.id], initialDistance: Math.max(r, 1e-4), initialAngle: s, lastScale: 1, lastRotation: 0 };
  }
  Ih(t) {
    if (this.Bo || this.Dh(), !this.Bo) return;
    const [e, i] = this.Bo.ids, r = this.Do.get(e), s = this.Do.get(i);
    if (!r || !s) return;
    const h = G(r.x, r.y, s.x, s.y) / this.Bo.initialDistance, o = h - this.Bo.lastScale;
    this.eh && Math.abs(o) > this.dh && (this.eh({ touches: [this.Lh(r), this.Lh(s)], scale: h, deltaScale: o, center: this.Gh(r, s), originalEvent: t }), this.Bo.lastScale = h);
    let c = vt(r.clientX, r.clientY, s.clientX, s.clientY) - this.Bo.initialAngle;
    c = (c + 180) % 360 - 180;
    const l = c - this.Bo.lastRotation;
    this.ih && Math.abs(l) > this.ph && (this.ih({ touches: [this.Lh(r), this.Lh(s)], rotation: c, deltaRotation: l, center: this.Gh(r, s), originalEvent: t }), this.Bo.lastRotation = c);
  }
  Gh(t, e) {
    const i = (t.clientX + e.clientX) / 2, r = (t.clientY + e.clientY) / 2, s = this.Ch(i, r, -1, { id: -1, x: -1, y: -1, clientX: i, clientY: r });
    return { x: s.x, y: s.y };
  }
  Hh(t, e) {
    const i = performance.now(), r = i - t.startTime, s = G(t.startPosition.clientX, t.startPosition.clientY, t.lastPosition.clientX, t.lastPosition.clientY);
    if (!t.longPressFired && r <= this.rh && s <= this.oh)
      this.Nh(t.lastPosition, i) && this.Jo ? this.Jo({ touch: this.Lh(t.lastPosition), taps: 2, originalEvent: e }) : this.Qo && this.Qo({ touch: this.Lh(t.lastPosition), taps: 1, originalEvent: e });
    else if (!t.longPressFired && r <= this.fh && s >= this.uh) {
      const h = { x: t.lastPosition.clientX - t.startPosition.clientX, y: t.lastPosition.clientY - t.startPosition.clientY }, o = Math.max(Math.hypot(h.x, h.y), 1e-4), c = { x: h.x / o, y: h.y / o }, l = { x: h.x / r, y: h.y / r };
      this.sh && this.sh({ touch: this.Lh(t.lastPosition), direction: c, distance: o, velocity: l, originalEvent: e });
    }
    this.mh = i, this._h = this.Lh(t.lastPosition);
  }
  Nh(t, e) {
    return !this._h || e - this.mh > this.nh ? !1 : G(t.clientX, t.clientY, this._h.clientX, this._h.clientY) <= this.oh;
  }
  Lh(t) {
    return { ...t };
  }
}
const Oe = Object.freeze(Object.defineProperty({ __proto__: null, TouchManager: Dt }, Symbol.toStringTag, { value: "Module" }));
class rt extends pt {
  constructor(e, i, r, s, h, o, c, l, u) {
    const f = o / c;
    let A, g;
    f > 1 ? (A = l, g = Math.round(l / f)) : (g = u, A = Math.round(u * f));
    super(e, i, r, s, o, c, A, g);
    a(this, "Xh");
    a(this, "Yh", !1);
    a(this, "Kh", []);
    a(this, "bn", null);
    a(this, "Wh", 0);
    a(this, "Zh", 0);
    a(this, "jh", -1);
    this.Xh = h;
  }
  ft() {
    super.ft();
    for (const e of this.Kh) this.A.deleteTexture(e);
    this.Kh = [], this.Xh.pause(), this.Xh.src = "", this.Xh.load();
  }
  Vh() {
    if (!this.Yh && this.Xh.readyState >= this.Xh.HAVE_CURRENT_DATA) {
      const e = this.A;
      e.bindTexture(e.TEXTURE_2D, this.Zr), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, this.Xh), e.bindTexture(e.TEXTURE_2D, null);
    }
  }
  vn() {
    if (this.Yh && this.Kh.length > 0) {
      const e = this.Zh % this.Kh.length;
      return this.Kh[e];
    }
    return this.Zr;
  }
  ht() {
    return this.W = null, super.ht();
  }
  dn() {
    this.Vh();
  }
  async qh(e, i) {
    var r;
    try {
      if (e <= 0) throw Error("Video preload requires a frameRate greater than 0.");
      const s = this.Xh.duration;
      if (!isFinite(s) || s <= 0) throw Error("Video duration is invalid, cannot preload frames.");
      const h = Math.max(1, Math.ceil(s * e));
      if (this.Qh(e, h), await this.Jh(e, i)) return void this.ta("captureStream", i);
      await this.sa(e, i), this.ta("seeking", i);
    } catch (s) {
      const h = s instanceof Error ? s : Error(s + "");
      throw (r = i == null ? void 0 : i.onError) == null || r.call(i, h), h;
    }
  }
  Qh(e, i) {
    this.bn = e, this.Wh = i, this.Kh = [], this.Yh = !1, this.Zh = 0, this.jh = -1;
  }
  ta(e, i) {
    var r;
    if (this.Kh.length === 0) throw Error(`Video preload via ${e} completed but produced 0 frames.`);
    this.Wh = this.Kh.length, this.Yh = !0, this.Zh = 0, this.jh = -1, this.Xh.pause(), this.Xh.currentTime = 0, i != null && i.onProgress && i.onProgress({ percent: 100, loadedFrames: this.Wh, totalFrames: this.Wh, strategy: e }), (r = i == null ? void 0 : i.onComplete) == null || r.call(i, { totalFrames: this.Wh, strategy: e });
  }
  ea(e) {
    const i = this.A, r = i.createTexture();
    return i.bindTexture(i.TEXTURE_2D, r), i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, 1), $(i, i.LINEAR, i.LINEAR, i.CLAMP_TO_EDGE, i.CLAMP_TO_EDGE), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, i.RGBA, i.UNSIGNED_BYTE, e), i.bindTexture(i.TEXTURE_2D, null), r;
  }
  ia(e, i) {
    if (!(i != null && i.onProgress) || this.Wh === 0) return;
    const r = Math.min(99, Math.floor(this.Kh.length / this.Wh * 100)), s = 10 * Math.floor(r / 10);
    s > this.jh && (this.jh = s, i.onProgress({ percent: r, loadedFrames: this.Kh.length, totalFrames: this.Wh, strategy: e }));
  }
  async Jh(e, i) {
    const r = globalThis, s = r == null ? void 0 : r.MediaStreamTrackProcessor, h = this.Xh.captureStream;
    if (typeof s != "function" || typeof h != "function") return !1;
    let o, c = null;
    try {
      const l = h.call(this.Xh);
      if (o = l.getVideoTracks()[0], !o) return l.getTracks().forEach((A) => A.stop()), !1;
      if (c = new s({ track: o }).readable.getReader(), this.Xh.currentTime = 0, this.Xh.muted = !0, await this.Xh.play().catch(() => {
      }), this.Xh.paused) return !1;
      const u = 1e6 / e;
      let f = 0;
      for (; this.Kh.length < this.Wh; ) {
        const A = await c.read();
        if (A.done) break;
        const g = A.value;
        if (g) try {
          const p = typeof g.timestamp == "number" ? g.timestamp : f;
          (this.Kh.length === 0 || p >= f) && (this.Kh.push(this.ea(g)), f = p + u, this.ia("captureStream", i));
        } finally {
          g.close();
        }
      }
      return c.releaseLock(), o.stop(), c = null, o = void 0, this.Xh.pause(), this.Xh.currentTime = 0, this.Kh.length !== 0;
    } catch {
      return this.Kh = [], this.jh = -1, !1;
    } finally {
      if (c) try {
        await c.cancel();
      } catch {
      }
      o && o.stop(), this.Xh.pause(), this.Xh.currentTime = 0;
    }
  }
  async sa(e, i) {
    const r = 1 / e, s = this.Wh, h = this.Xh;
    h.pause();
    for (let o = 0; o < s; o++) {
      const c = Math.min(h.duration, o * r);
      await this.ra(c), this.Kh.push(this.ea(h)), this.ia("seeking", i);
    }
    h.currentTime = 0;
  }
  ra(e) {
    return new Promise((i, r) => {
      const s = this.Xh, h = () => {
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
    return this.Yh && e !== void 0 && this.Wh > 0 && (this.Zh = (e % this.Wh + this.Wh) % this.Wh, this.W = null), this;
  }
  static async mn(e, i, r, s, h, o) {
    const c = e.context, l = o == null ? void 0 : o.frameRate;
    let u;
    typeof r == "string" ? (u = document.createElement("video"), u.crossOrigin = "anonymous", u.loop = !0, u.muted = !0, u.playsInline = !0, await new Promise((d, v) => {
      u.addEventListener("loadedmetadata", () => d(), { once: !0 }), u.addEventListener("error", (m) => {
        var y;
        const E = m.target;
        v(Error("Failed to load video: " + (((y = E.error) == null ? void 0 : y.message) || "Unknown error")));
      }, { once: !0 }), u.src = r;
    })) : (u = r, u.readyState < u.HAVE_METADATA && await new Promise((d, v) => {
      u.addEventListener("loadedmetadata", () => d(), { once: !0 }), u.addEventListener("error", (m) => {
        var E;
        return v(Error("Video error: " + ((E = m.target.error) == null ? void 0 : E.message)));
      }, { once: !0 });
    }));
    const f = c.createTexture();
    c.bindTexture(c.TEXTURE_2D, f), c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, 1), $(c, c.LINEAR, c.LINEAR, c.CLAMP_TO_EDGE, c.CLAMP_TO_EDGE), c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, u), c.bindTexture(c.TEXTURE_2D, null);
    const A = u.videoWidth, g = u.videoHeight, p = new rt(c, e, f, i, u, A, g, s, h);
    return l && l > 0 && await p.qh(l, o), p;
  }
  async play() {
    await this.Xh.play();
  }
  pause() {
    this.Xh.pause();
  }
  stop() {
    this.Xh.pause(), this.Xh.currentTime = 0;
  }
  speed(e) {
    return this.Xh.playbackRate = e, this;
  }
  loop(e = !0) {
    return this.Xh.loop = e, this;
  }
  time(e) {
    return this.Xh.currentTime = e, this;
  }
  volume(e) {
    return this.Xh.volume = Math.max(0, Math.min(1, e)), this;
  }
  get texture() {
    return this.Zr;
  }
  get width() {
    return this.I;
  }
  get height() {
    return this.H;
  }
  get originalWidth() {
    return this.jr;
  }
  get originalHeight() {
    return this.Vr;
  }
  get videoElement() {
    return this.Xh;
  }
  get currentTime() {
    return this.Xh.currentTime;
  }
  get duration() {
    return this.Xh.duration;
  }
  get isPlaying() {
    return !this.Xh.paused && !this.Xh.ended;
  }
  get isPreloaded() {
    return this.Yh;
  }
  get totalFrames() {
    return this.Wh;
  }
  get preloadFrameRate() {
    return this.bn;
  }
  get currentFrameIndex() {
    return this.Zh;
  }
}
const Pe = (n) => class extends n {
  na(t, e, i, r) {
    if (M.Nr(t)) return t;
    if (typeof t == "number" || typeof t == "string") return this.color(t, e, i, r);
    throw Error("Unsupported color input passed to color-capable method.");
  }
  rotate(t = 0, e = 0, i = 0) {
    this.K.state.Zt(t), this.K.state.jt(e), this.K.state.Vt(i);
  }
  rotateX(t) {
    this.K.state.Zt(t);
  }
  rotateY(t) {
    this.K.state.jt(t);
  }
  rotateZ(t) {
    this.K.state.Vt(t);
  }
  translate(t = 0, e = 0, i = 0) {
    this.K.state.qt(t, e, i);
  }
  translateX(t) {
    this.K.state.qt(t, 0, 0);
  }
  translateY(t) {
    this.K.state.qt(0, t, 0);
  }
  translateZ(t) {
    this.K.state.qt(0, 0, t);
  }
  push() {
    this.K.state.it();
  }
  pop() {
    this.K.state.rt();
  }
  color(t, e, i, r) {
    const s = typeof t == "string" ? (h) => this.tr.getCharacterColors(h) : void 0;
    return M.Gr(t, s ?? e, i, r);
  }
  rect(t = 1, e = 1) {
    this.K.di(t, e);
  }
  point() {
    this.K.di(1, 1);
  }
  line(t, e, i, r) {
    this.K.pi(t, e, i, r);
  }
  lineWeight(t) {
    this.K.state.Kt(t);
  }
  background(t, e, i, r = 255) {
    const s = this.na(t, e, i, r);
    this.K.wi(s.r, s.g, s.b, s.a);
  }
  char(t) {
    if (M.Nr(t)) {
      const i = t.character;
      return void (i && this.K.state.ss(i));
    }
    const e = Array.from(t);
    if (e.length === 0) throw Error("char() requires at least one character.");
    this.K.state.ss(this.tr.Qi(e[0]));
  }
  charColor(t, e, i, r) {
    const s = this.na(t, e, i, r);
    this.K.state.es(s.r, s.g, s.b, s.a);
  }
  cellColor(t, e, i, r) {
    const s = this.na(t, e, i, r);
    this.K.state.rs(s.r, s.g, s.b, s.a);
  }
  flipX(t) {
    this.K.state.ns(t);
  }
  flipY(t) {
    this.K.state.hs(t);
  }
  charRotation(t) {
    this.K.state.ls(t);
  }
  invert(t) {
    this.K.state.cs(t);
  }
  clear() {
    this.K.wi(0, 0, 0, 0);
  }
  ellipse(t, e) {
    this.K.gi(t / 2, e / 2);
  }
  triangle(t, e, i, r, s, h) {
    this.K.mi(t, e, i, r, s, h);
  }
  bezierCurve(t, e, i, r, s, h, o, c) {
    this.K._i(t, e, i, r, s, h, o, c);
  }
  arc(t, e, i, r) {
    this.K.Ai(t / 2, e / 2, i, r);
  }
  shader(t) {
    this.K.ai(t);
  }
  setUniform(t, e) {
    this.K.O(t, e);
  }
  setUniforms(t) {
    this.K.ci(t);
  }
  async createFilterShader(t) {
    if (typeof t == "string" && (t.startsWith("./") || t.startsWith("../") || t.endsWith(".frag") || t.endsWith(".glsl"))) {
      const e = await fetch(t);
      if (!e.ok) throw Error(`Failed to load shader from ${t}: ${e.statusText}`);
      const i = await e.text();
      return this.K.li(i);
    }
    return this.K.li(t);
  }
  createFramebuffer(t) {
    return this.K.yi(t.width ?? this.grid.cols, t.height ?? this.grid.rows, 3);
  }
  image(t, e, i) {
    this.K.ui(t, e, i);
  }
  ortho() {
    this.K.state.fs(!0);
  }
  async loadImage(t) {
    if (typeof t != "string") {
      const s = K.mn(this.K, this.tr, t, this.On.cols, this.On.rows);
      return this.oa(s), s;
    }
    const e = t, i = await new Promise((s, h) => {
      const o = new Image();
      o.crossOrigin = "anonymous", o.onload = () => s(o), o.onerror = (c) => h(c), o.src = e;
    }), r = K.mn(this.K, this.tr, i, this.On.cols, this.On.rows);
    return this.oa(r), r;
  }
  async loadVideo(t, e) {
    const i = await rt.mn(this.K, this.tr, t, this.On.cols, this.On.rows, e);
    return this.oa(i), i;
  }
}, Be = (n) => class extends n {
  async loadFont(t) {
    return this.tr.Ar(t).then(() => {
      const e = this.tr.maxGlyphDimensions;
      this.On.Tr(e.width, e.height), this.ha.resize(this.On.cols, this.On.rows), this.K.bi(), this.Oo.ro(), this.aa.ro(), this.ca();
    });
  }
  fontSize(t) {
    if (!dt.m(typeof t == "number" && t > 0, "Font size must be a positive number greater than 0.", { method: "fontSize", providedValue: t }) || this.tr.fontSize === t) return;
    this.tr._r(t);
    const e = this.tr.maxGlyphDimensions;
    this.On.Tr(e.width, e.height), this.ha.resize(this.On.cols, this.On.rows), this.K.bi(), this.Oo.ro(), this.aa.ro(), this.ca();
  }
}, Se = (n) => class extends n {
  get frameCount() {
    return this.la.zn;
  }
  set frameCount(t) {
    this.la.zn = t;
  }
  frameRate(t) {
    return t === void 0 ? this.la.kn : this.la.Rn(t, () => this.ua());
  }
  noLoop() {
    this.la.Pn();
  }
  loop() {
    this.la.En(() => this.ua());
  }
  redraw(t = 1) {
    if (dt.m(typeof t == "number" && t > 0 && Number.isInteger(t), "Redraw count must be a positive integer.", { method: "redraw", providedValue: t })) for (let e = 0; e < t; e++) this.ua();
  }
  isLooping() {
    return this.la.Un;
  }
}, De = (n) => class extends n {
  constructor(...t) {
    super(...t);
  }
  mouseClicked(t) {
    this.Oo.do(t);
  }
  mousePressed(t) {
    this.Oo.po(t);
  }
  mouseReleased(t) {
    this.Oo.vo(t);
  }
  mouseMoved(t) {
    this.Oo.mo(t);
  }
  mouseScrolled(t) {
    this.Oo._o(t);
  }
  get mouse() {
    return this.Oo.Ao();
  }
  cursor(t) {
    this.Oo.io(t);
  }
}, Le = (n) => class extends n {
  constructor(...t) {
    super(...t);
  }
  touchStarted(t) {
    this.aa.xh(t);
  }
  touchMoved(t) {
    this.aa.mo(t);
  }
  touchEnded(t) {
    this.aa.Fh(t);
  }
  touchCancelled(t) {
    this.aa.$h(t);
  }
  tap(t) {
    this.aa.Th(t);
  }
  doubleTap(t) {
    this.aa.Ph(t);
  }
  longPress(t) {
    this.aa.Eh(t);
  }
  swipe(t) {
    this.aa.Rh(t);
  }
  pinch(t) {
    this.aa.Sh(t);
  }
  rotateGesture(t) {
    this.aa.kh(t);
  }
  get touches() {
    return this.aa.Mh();
  }
}, Ue = (n) => class extends n {
  constructor(...t) {
    super(...t);
  }
  keyPressed(t) {
    this.fa.po(t);
  }
  keyReleased(t) {
    this.fa.vo(t);
  }
  isKeyPressed(t) {
    return this.fa.Eo(t);
  }
  get lastKeyPressed() {
    return this.fa.So();
  }
  get lastKeyReleased() {
    return this.fa.Uo();
  }
  get pressedKeys() {
    return this.fa.ko();
  }
  get modifierState() {
    return this.fa.zo();
  }
};
class Ie {
  constructor(t) {
    a(this, "da");
    a(this, "pa", /* @__PURE__ */ new Map());
    a(this, "ga", []);
    a(this, "va", /* @__PURE__ */ new Map());
    a(this, "ma", /* @__PURE__ */ new Map());
    this.da = t;
  }
  async _a(t) {
    for (const e of t) {
      if (this.pa.has(e.name)) return void console.warn(`[textmode.js] Plugin "${e.name}" is already installed.`);
      const i = this.ya(e.name);
      try {
        await e.install(this.da, i);
      } catch (r) {
        throw this.wa(e.name), r;
      }
      this.pa.set(e.name, e), this.ga.push(e.name);
    }
  }
  async ba(t) {
    const e = this.pa.get(t);
    if (!e) return;
    const i = this.ya(t);
    e.uninstall && await e.uninstall(this.da, i), this.pa.delete(t), this.ga.splice(this.ga.indexOf(t), 1), this.wa(t);
  }
  Ca() {
    this.Ma(this.va);
  }
  xa() {
    this.Ma(this.ma);
  }
  async Fa() {
    const t = [...this.pa.keys()];
    for (const e of t) await this.ba(e);
  }
  ya(t) {
    return { renderer: this.da.K, font: this.da.tr, grid: this.da.On, canvas: this.da.Mr, drawFramebuffer: this.da.ha, asciiFramebuffer: this.da.$a, registerPreDrawHook: (e) => this.Ta(this.va, t, e), registerPostDrawHook: (e) => this.Ta(this.ma, t, e) };
  }
  Ta(t, e, i) {
    const r = t.get(e) ?? /* @__PURE__ */ new Set();
    return r.add(i), t.set(e, r), () => {
      const s = t.get(e);
      s && (s.delete(i), s.size === 0 && t.delete(e));
    };
  }
  wa(t) {
    this.va.delete(t), this.ma.delete(t);
  }
  Ma(t) {
    for (const e of this.ga) {
      const i = t.get(e);
      i && i.forEach((r) => r());
    }
  }
}
const wt = `#version 300 es
in vec2 A0;in vec2 A1;out vec2 v_uv;void main(){v_uv=A1;gl_Position=vec4(A0,0.,1.);}`;
class Lt {
  constructor() {
    a(this, "Pa", /* @__PURE__ */ new Map());
    a(this, "Ea", []);
    a(this, "Ra", 0);
    a(this, "Sa", 0);
    a(this, "ka");
  }
  get za() {
    return this.Ra;
  }
  get La() {
    if (this.Ra === 0) return 0;
    let t = 0;
    for (const e of this.Ea) {
      const i = this.Pa.get(e);
      i && (t += Math.min(1, Math.max(0, i.progress)) * i.weight);
    }
    return Math.min(1, t / this.Ra);
  }
  Oa(t) {
    this.ka = t;
  }
  Da(t, e = 1) {
    const i = `phase-${this.Ea.length + 1}-${Date.now()}`, r = { id: i, label: t, weight: Math.max(1e-3, e), progress: 0, status: "running" };
    return this.Pa.set(i, r), this.Ea.push(i), this.Ra += r.weight, i;
  }
  Ia(t, e) {
    const i = this.Pa.get(t);
    if (!i) return;
    i.progress = Math.max(0, Math.min(1, e)), i.status = i.progress >= 1 ? "complete" : "running";
    const r = this.La;
    Math.abs(r - this.Sa) > 1e-3 && (this.Sa = r, this.ka && this.ka(r));
  }
  Ha(t) {
    const e = this.Pa.get(t);
    e && (e.progress = 1, e.status = "complete", this.Ia(t, 1));
  }
  Ba(t) {
    const e = this.Pa.get(t);
    e && (e.status = "failed");
  }
  Ga() {
    return this.Ea.map((t) => {
      const e = this.Pa.get(t);
      return e ? { id: e.id, label: e.label, weight: e.weight, progress: e.progress, status: e.status } : { id: t, label: t, weight: 1, progress: 0, status: "pending" };
    });
  }
}
class Ut {
  constructor(t = "active") {
    a(this, "Na");
    a(this, "Xa", "");
    a(this, "Ya", "");
    this.Na = t;
  }
  get Ka() {
    return this.Na;
  }
  get Wa() {
    return this.Na !== "disabled";
  }
  get Za() {
    return this.Na === "active" || this.Na === "transitioning" || this.Na === "error";
  }
  get ja() {
    return this.Xa;
  }
  get Va() {
    return this.Ya;
  }
  qa() {
    this.Na !== "done" && this.Na !== "transitioning" || (this.Na = "active");
  }
  Qa() {
    this.Na !== "disabled" && (this.Na = "done");
  }
  Ja() {
    this.Na !== "disabled" && (this.Na = "transitioning");
  }
  tc() {
    this.Na === "transitioning" && (this.Na = "done");
  }
  sc(t) {
    this.Na !== "disabled" && (this.Na = "error", t instanceof Error ? (this.Xa = t.message, this.Ya = t.stack || "") : (this.Xa = t, this.Ya = ""));
  }
  ec() {
    this.Na = "disabled";
  }
}
class It {
  constructor(t, e) {
    a(this, "rc", 0);
    a(this, "nc", 1);
    a(this, "oc");
    a(this, "hc");
    this.oc = t, this.hc = e;
  }
  get ac() {
    return this.nc;
  }
  get cc() {
    return this.nc < 1;
  }
  $n() {
    this.oc !== "none" && this.hc > 0 && (this.rc = performance.now());
  }
  tt() {
    if (this.oc === "none" || this.hc === 0) return this.nc = 1, !1;
    const t = performance.now() - this.rc, e = Math.min(1, t / this.hc);
    return e >= 1 ? (this.nc = 0, !0) : (this.nc = 1 - e, !1);
  }
  js() {
    this.nc = 1, this.rc = 0;
  }
}
function ft(n, t) {
  const e = n.tone ?? "auto";
  let i = "dark";
  return e === "light" || e === "dark" ? i = e : t && (i = function(r) {
    if (!r) return 0;
    const [s, h, o] = r.map((l) => l / 255), c = (l) => l <= 0.04045 ? l / 12.92 : Math.pow((l + 0.055) / 1.055, 2.4);
    return 0.2126 * c(s) + 0.7152 * c(h) + 0.0722 * c(o);
  }(t) > 0.5 ? "light" : "dark"), { mode: i, background: t, textColor: i === "light" ? "#1A1A1A" : "#F8F8F8", subtleColor: i === "light" ? "#4A4A4A" : "#C0C0C0" };
}
function Nt(n) {
  return n.mode === "light" ? ["#E91E63", "#9C27B0", "#FF6F00"] : ["#8EF9F3", "#F15BB5", "#FF9B71"];
}
function Xt(n, t) {
  return n.length ? n.map((e) => t.color(e)) : [t.color("#FFFFFF")];
}
const Ne = ({ textmodifier: n, grid: t, progress: e, frameCount: i, message: r, palette: s, theme: h, phases: o, transitionOpacity: c, isError: l, errorMessage: u }) => {
  const f = "|/-\\", A = Math.floor(i / 6) % 4, g = n.color(h.textColor), p = Math.floor(255 * c), d = n.color(g.r, g.g, g.b, p);
  if (n.charColor(d), n.cellColor(0, 0, 0, 0), l) {
    const v = n.color(h.mode === "light" ? "#D32F2F" : "#FF6B6B", p);
    n.charColor(v), n.push(), n.translate(0, -2, 0), n.char("X"), n.rect(1, 1), n.pop();
    const m = "SETUP ERROR", E = -Math.floor(m.length / 2);
    n.push(), n.translate(E, 0, 0);
    for (const y of m) n.char(y), n.rect(1, 1), n.translateX(1);
    if (n.pop(), u) {
      const y = n.color(h.subtleColor), b = n.color(y.r, y.g, y.b, p);
      n.charColor(b);
      const w = Math.floor(0.8 * t.cols), F = u.split(" "), P = [];
      let x = "";
      for (const C of F) (x + " " + C).length <= w ? x = x ? x + " " + C : C : (x && P.push(x), x = C);
      x && P.push(x);
      const S = P.slice(0, 3);
      P.length > 3 && (S[2] = S[2].substring(0, w - 3) + "..."), S.forEach((C, j) => {
        const Kt = -Math.floor(C.length / 2);
        n.push(), n.translate(Kt, 3 + j, 0);
        for (const Ht of C) n.char(Ht), n.rect(1, 1), n.translateX(1);
        n.pop();
      });
    }
    return;
  }
  if (n.push(), n.translate(0, 0, 0), n.char(f[A]), n.rect(1, 1), n.pop(), e > 0 || o.some((v) => v.status !== "pending")) {
    const v = Math.max(6, Math.floor(0.6 * t.cols)), m = -Math.floor(v / 2), E = Math.floor(v * e), y = s.length ? s : [n.color("#FFFFFF")];
    n.push(), n.translate(m, 3, 0);
    for (let b = 0; b < v; b++) {
      const w = b < E ? "*" : ".", F = y[b % y.length], P = n.color(F.r, F.g, F.b, p);
      n.charColor(P), n.char(w), n.rect(1, 1), n.translateX(1);
    }
    n.pop();
  }
  if (r) {
    const v = n.color(h.subtleColor), m = n.color(v.r, v.g, v.b, p);
    n.charColor(m);
    const E = -Math.floor(r.toUpperCase().length / 2);
    n.push(), n.translate(E, 5, 0);
    for (const y of r.toUpperCase()) n.char(y), n.rect(1, 1), n.translateX(1);
    n.pop();
  }
}, Xe = { message: "loading...", tone: "auto", transition: "fade", transitionDuration: 500 };
class _e {
  constructor(t, e, i) {
    this.lc = t, this.id = e, this.label = i;
  }
  report(t) {
    this.lc.Ia(this.id, t);
  }
  complete() {
    this.lc.Ha(this.id);
  }
  fail(t) {
    this.lc.Ba(this.id);
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
class _t {
  constructor(t, e, i) {
    a(this, "da");
    a(this, "l");
    a(this, "uc");
    a(this, "lc");
    a(this, "fc");
    a(this, "dc");
    a(this, "gc");
    a(this, "vc");
    a(this, "mc");
    a(this, "_c");
    a(this, "K");
    a(this, "yc", []);
    a(this, "wc");
    a(this, "bc", performance.now());
    a(this, "Cc", 0);
    a(this, "Mc", !1);
    a(this, "xc", !1);
    a(this, "Pc");
    this.da = t, this.l = { ...Xe, ...e ?? {} }, this.uc = new Ut("active"), this.lc = new Lt(), this.fc = new It(this.l.transition, this.l.transitionDuration), this.dc = new Pt(60), this.wc = ft(this.l, i);
    const r = Nt(this.wc);
    this.yc = Xt(r, this.da), this.K = this.Fc(), this.lc.Oa((s) => {
      s >= 0.999 && this.Qa();
    });
  }
  async gr(t) {
    if (this.xc) return;
    const e = this.da.K, i = this.da.Mr;
    this.gc = new gt(e, 16), await this.gc.gr(t);
    const r = this.gc.maxGlyphDimensions;
    this.vc = new Ot(i.canvas, r.width, r.height), this.mc = e.yi(this.vc.cols, this.vc.rows, 3), this._c = e.yi(this.vc.width, this.vc.height, 1), this.xc = !0;
  }
  get Za() {
    return this.uc.Za && this.Mc;
  }
  $n() {
    this.Mc || (this.Mc = !0, this.bc = performance.now(), this.Cc = 0, this.dc.$n(() => this.$c()));
  }
  Tn() {
    this.Mc && (this.Mc = !1, this.dc.Tn());
  }
  Dr() {
    this.xc && (this.vc.js(), this.mc.resize(this.vc.cols, this.vc.rows), this._c.resize(this.vc.width, this.vc.height));
  }
  ft() {
    this.Tn(), this.xc && (this.gc.ft(), this.mc.ft(), this._c.ft(), this.xc = !1);
  }
  get progress() {
    return this.lc.La;
  }
  message(t) {
    return typeof t == "string" && (this.l.message = t), this.l.message;
  }
  addPhase(t, e = 1) {
    this.uc.qa();
    const i = this.lc.Da(t, e);
    return new _e(this.lc, i, t);
  }
  Qa() {
    this.l.transition !== "none" && this.l.transitionDuration > 0 ? (this.uc.Ja(), this.fc.$n()) : (this.uc.Qa(), this.Tn(), this.Tc());
  }
  Tc() {
    this.Pc && this.Pc();
  }
  Ec(t) {
    this.Pc = t;
  }
  error(t) {
    this.uc.sc(t);
  }
  $c() {
    if (this.uc.Za) {
      if (this.Cc++, this.uc.Ka === "transitioning" && this.fc.tt())
        return this.uc.tc(), this.Tc(), void this.Tn();
      this.Rc();
    }
  }
  Rc() {
    if (!this.xc) return;
    const t = this.mc, e = this.gc, i = this.vc, r = this._c, s = this.da.K, h = this.da.Mr, o = this.da.Sc, c = this.da.kc;
    s.state.Wt(), t.begin(), this.da.clear(), this.da.push();
    try {
      const l = { textmodifier: this.da, grid: i, progress: this.progress, elapsedMs: performance.now() - this.bc, frameCount: this.Cc, message: this.l.message, palette: this.yc, theme: this.wc, phases: this.lc.Ga(), transitionOpacity: this.fc.ac, isError: this.uc.Ka === "error", errorMessage: this.uc.ja || void 0, errorDetails: this.uc.Va || void 0 };
      this.K(l);
    } finally {
      this.da.pop();
    }
    t.end(), r.begin(), s.oi(o), o.L({ u_characterTexture: e.fontFramebuffer, u_charsetDimensions: [e.textureColumns, e.textureRows], U0: t.textures[0], U1: t.textures[1], U2: t.textures[2], U3: [i.cols, i.rows], U4: [r.width, r.height], U5: s.state.canvasBackgroundColor }), s.fi(0, 0, h.width, h.height), r.end(), s.ge(...s.state.canvasBackgroundColor), s.oi(c), c.L({ U6: r.textures[0], U7: [r.width, r.height], U8: [i.offsetX, i.offsetY], U9: [i.width, i.height] }), s.fi(i.offsetX, i.offsetY, i.width, i.height);
  }
  zc(t) {
    this.wc = ft(this.l, t);
  }
  Fc() {
    const t = this.l.renderer || Ne;
    return (e) => {
      t(e), this.Lc(e);
    };
  }
  Lc(t) {
    const { textmodifier: e, grid: i, frameCount: r, theme: s, transitionOpacity: h } = t, o = [116, 101, 120, 116, 109, 111, 100, 101, 46, 106, 115].map((f) => String.fromCharCode(f)).join(""), c = (i.rows + 1 >> 1) - 2, l = 2 - (i.cols + 1 >> 1), u = s.mode === "light" ? [[233, 30, 99], [156, 39, 176], [255, 111, 0]] : [[142, 249, 243], [241, 91, 181], [255, 155, 113]];
    e.push(), e.translate(l, c, 0);
    for (let f = 0; f < o.length; f++) {
      const A = o[f], g = Math.floor(0.1 * r + 0.5 * f) % u.length, [p, d, v] = u[g], m = Math.floor(255 * h), E = e.color(p, d, v, m);
      e.charColor(E), e.char(A), e.point(), e.translateX(1);
    }
    e.pop();
  }
}
class Ke extends function(e, ...i) {
  return i.reduce((r, s) => s(r), e);
}(class {
}, Pe, Be, Se, De, Le, Ue) {
  constructor(e = {}) {
    super();
    a(this, "K");
    a(this, "tr");
    a(this, "Mr");
    a(this, "On");
    a(this, "la");
    a(this, "Oo");
    a(this, "aa");
    a(this, "fa");
    a(this, "Oc");
    a(this, "ha");
    a(this, "Sc");
    a(this, "$a");
    a(this, "kc");
    a(this, "Dc");
    a(this, "Ic", !1);
    a(this, "Hc", !1);
    a(this, "Bc", !1);
    a(this, "Gc", !1);
    a(this, "Nc", () => {
    });
    a(this, "Xc", () => {
    });
    a(this, "Yc", () => {
    });
    a(this, "Kc");
    a(this, "Wc");
    a(this, "Er", !1);
    a(this, "Zc");
    a(this, "jc", /* @__PURE__ */ new Set());
    this.Dc = new Ie(this), this.Er = e.overlay ?? !1, this.Mr = new xe(e), this.K = new ae(this.Mr.Ir()), this.tr = new gt(this.K, e.fontSize ?? 16), this.la = new Pt(e.frameRate ?? 60), this.Oc = new _t(this, e.loadingScreen, this.Mr.Or()), this.Oc.Ec(() => {
      this.la.zn = 0, this.Gc = !0;
    }), this.Oo = new Bt(this.Mr), this.aa = new Dt(this.Mr, this.Oo), this.fa = new St(), this.Sc = this.K.hi(wt, `#version 300 es
precision highp float;uniform sampler2D u_characterTexture;uniform vec2 u_charsetDimensions;uniform sampler2D U1;uniform sampler2D U2;uniform sampler2D U0;uniform vec2 U3;uniform vec2 U4;uniform vec4 U5;in vec2 v_uv;out vec4 fragColor;mat2 A(float B){float C=sin(B);float D=cos(B);return mat2(D,-C,C,D);}void main(){vec2 E=gl_FragCoord.xy/U4;vec2 F=E*U3;vec2 G=floor(F);vec2 H=(G+0.5)/U3;vec4 I=texture(U1,H);vec4 J=texture(U2,H);vec4 K=texture(U0,H);int L=int(K.b*255.+0.5);bool M=(L&1)!=0;bool N=(L&2)!=0;bool O=(L&4)!=0;int P=int(K.r*255.+0.5)+int(K.g*255.+0.5)*256;int Q=int(u_charsetDimensions.x);int R=P/Q;int S=P-(R*Q);float T=(u_charsetDimensions.y-1.)-float(R);vec2 U=1./u_charsetDimensions;vec2 V=vec2(float(S),T)*U;vec2 W=V+U;float X=-K.a*360.*0.017453292;vec2 Y=fract(F)-0.5f;vec2 Z=vec2(N?-1.:1.,O?-1.:1.);Y*=Z;Y=A(X)*Y+0.5;vec2 a=V+clamp(Y,0.,1.)*U;const float b=0.0001;if(any(lessThan(a,V-b))||any(greaterThan(a,W+b))){fragColor=M?I:J;return;}vec4 c=texture(u_characterTexture,a);if(M)c.rgb=mix(c.rgb,1.-c.rgb,float(M));vec4 d=mix(U5,J,J.a);fragColor=mix(d,I,c);}`), this.Oc.$n(), this.Vc(e);
  }
  async Vc(e) {
    await Promise.all([this.tr.gr(e.fontSource), this.Oc.gr(e.fontSource)]);
    const i = this.tr.maxGlyphDimensions;
    this.On = new Ot(this.Mr.canvas, i.width, i.height), this.Oo.gr(this.On), this.aa.gr(this.On), this.ha = this.K.yi(this.On.cols, this.On.rows, 3), this.$a = this.K.yi(this.On.width, this.On.height, 1), this.Er && (this.Zc = K.mn(this.K, this.tr, this.Mr.targetCanvas, this.On.cols, this.On.rows), this.oa(this.Zc)), this.kc = this.K.hi(wt, `#version 300 es
precision highp float;uniform sampler2D U6;uniform vec2 U7;uniform vec2 U8;uniform vec2 U9;in vec2 v_uv;out vec4 fragColor;void main(){vec2 A=gl_FragCoord.xy-U8;vec2 B=A*(U7/U9);vec2 C=(floor(B)+0.5)/U7;fragColor=texture(U6,C);}`), this.qc(), this.la.$n(() => this.ua()), await this.Dc._a(e.plugins ?? []);
    try {
      await this.Nc(), this.Oc.Qa();
    } catch (r) {
      console.error("Error during setup:", r), this.Oc.error(r);
    }
  }
  qc() {
    this.Kc = () => {
      this.Er && this.resizeCanvas(this.Mr.targetCanvas.width, this.Mr.targetCanvas.height), this.Yc();
    }, window.addEventListener("resize", this.Kc), this.Oo.no(), this.aa.no(), this.fa.no(), window.addEventListener("blur", () => {
      this.fa.Lo();
    }), this.Er && (this.Wc = new ResizeObserver(() => {
      this.resizeCanvas(this.Mr.targetCanvas.width, this.Mr.targetCanvas.height);
    }), this.Wc.observe(this.Mr.targetCanvas));
  }
  ua() {
    if (!this.Oc.Za && this.Gc) {
      this.Hc = !0;
      try {
        this.la.Sn(), this.la.Ln(), this.Er && bt(this.K.context, this.Zc.texture, this.Mr.targetCanvas), this.Dc.Ca(), this.K.state.Wt(), this.ha.begin(), this.Xc(), this.ha.end(), this.$a.begin(), this.K.oi(this.Sc), this.Sc.L({ u_characterTexture: this.tr.fontFramebuffer, u_charsetDimensions: [this.tr.textureColumns, this.tr.textureRows], U0: this.ha.textures[0], U1: this.ha.textures[1], U2: this.ha.textures[2], U3: [this.On.cols, this.On.rows], U4: [this.$a.width, this.$a.height], U5: this.K.state.canvasBackgroundColor }), this.K.fi(0, 0, this.Mr.width, this.Mr.height), this.$a.end(), this.K.ge(...this.K.state.canvasBackgroundColor), this.K.oi(this.kc), this.kc.L({ U6: this.$a.textures[0], U7: [this.$a.width, this.$a.height], U8: [this.On.offsetX, this.On.offsetY], U9: [this.On.width, this.On.height] }), this.K.fi(this.On.offsetX, this.On.offsetY, this.On.width, this.On.height), this.Dc.xa();
      } finally {
        this.Hc = !1, this.Ic && !this.Bc && this.Qc();
      }
    }
  }
  resizeCanvas(e, i) {
    this.Mr.Dr(e, i), this.Oc.zc(this.Mr.Or()), this.On.js(), this.Oc.Dr(), this.ha.resize(this.On.cols, this.On.rows), this.$a.resize(this.On.width, this.On.height), this.K.bi(), this.Oo.ro(), this.aa.ro(), this.ua();
  }
  destroy() {
    this.Bc || this.Ic || (this.Ic = !0, this.la.Pn(), this.Hc || this.Qc());
  }
  Qc() {
    var e, i;
    this.Ic = !1, this.Oc.ft(), this.Dc.Fa(), window.removeEventListener("resize", this.Kc), (e = this.Wc) == null || e.disconnect(), this.Oo.fo(), this.aa.fo(), this.fa.fo(), this.ha.ft(), this.Sc.dispose(), this.tr.ft(), this.K.ft(), this.$a.ft(), this.kc.dispose(), (i = this.Zc) == null || i.ft(), this.Mr.ft(), this.Bc = !0;
  }
  setup(e) {
    this.Nc = e;
  }
  draw(e) {
    this.Xc = e;
  }
  windowResized(e) {
    this.Yc = e;
  }
  get grid() {
    return this.On;
  }
  get font() {
    return this.tr;
  }
  get width() {
    return this.Mr.width;
  }
  get height() {
    return this.Mr.height;
  }
  get canvas() {
    return this.Mr.canvas;
  }
  get drawFramebuffer() {
    return this.ha;
  }
  get isDisposed() {
    return this.Bc;
  }
  get overlay() {
    return this.Zc;
  }
  get loading() {
    return this.Oc;
  }
  oa(e) {
    this.jc.has(e) || this.jc.add(e);
  }
  ca() {
    for (const e of this.jc) e.fn(this.tr);
  }
}
class mt {
  constructor() {
  }
  static create(t = {}) {
    return new Ke(t);
  }
  static setErrorLevel(t) {
    dt._(t);
  }
  static get version() {
    return "0.6.0-beta.5";
  }
}
let at = null;
const He = { id: "brightness", createShader: ({ gl: n }) => (at || (at = new k(n, et, `#version 300 es
precision highp float;in vec2 v_uv;uniform sampler2D u_image;uniform bool u_invert;uniform bool u_flipX;uniform bool u_flipY;uniform float u_charRotation;uniform bool u_charColorFixed;uniform vec4 u_charColor;uniform bool u_cellColorFixed;uniform vec4 u_cellColor;uniform vec4 u_backgroundColor;uniform int u_charCount;uniform vec3 u_charList[255];uniform bool u_colorFilterEnabled;uniform int u_colorFilterSize;uniform vec4 u_colorFilterPalette[64];layout(location=0)out vec4 o_character;layout(location=1)out vec4 o_primaryColor;layout(location=2)out vec4 o_secondaryColor;float A(vec3 B){return dot(B,vec3(0.299f,0.587f,0.114f));}float C(vec3 D,vec3 E){vec3 F=D-E;return dot(F,F);}vec4 G(vec4 H){if(!u_colorFilterEnabled||u_colorFilterSize<=0){return H;}int I=min(u_colorFilterSize,64);vec3 J=u_colorFilterPalette[0].rgb;float K=C(H.rgb,J);for(int L=1;L<64;++L){if(L>=I){break;}vec3 M=u_colorFilterPalette[L].rgb;float N=C(H.rgb,M);if(N<K){K=N;J=M;}}return vec4(J,H.a);}void main(){vec2 O=vec2(v_uv.x,1.0f-v_uv.y);vec4 H=texture(u_image,O);H=G(H);float E=A(H.rgb);vec2 P=vec2(0.);if(u_charCount>0){float Q=float(u_charCount);float R=clamp(E*(Q-1.0f),0.0f,Q-1.0f);int S=int(floor(R+0.5f));vec3 T=u_charList[S];P=T.xy;}else{P=vec2(E,0.0f);}vec4 U=u_charColorFixed?u_charColor:H;vec4 V=u_cellColorFixed?u_cellColor:H;if(H.a<0.01f){U=u_backgroundColor;V=u_backgroundColor;}else{}o_primaryColor=vec4(U.rgb,U.a);o_secondaryColor=vec4(V.rgb,V.a);int W=int(u_invert?1:0);int X=int(u_flipX?1:0);int Y=int(u_flipY?1:0);float Z=float(W|(X<<1)|(Y<<2))/255.;o_character=vec4(P,Z,clamp(u_charRotation,0.0f,1.0f));}`)), at), createUniforms: ({ source: n }) => n.createBaseConversionUniforms() }, Ye = Object.freeze(Object.defineProperty({ __proto__: null, LoadingPhaseTracker: Lt, LoadingScreenManager: _t, LoadingScreenStateMachine: Ut, LoadingScreenTransition: It, resolveColorInputs: Xt, resolveDefaultPalette: Nt, resolveTheme: ft }, Symbol.toStringTag, { value: "Module" })), We = Object.freeze(Object.defineProperty({ __proto__: null, TextmodeFont: gt, TextmodeImage: K, TextmodeSource: pt, TextmodeVideo: rt }, Symbol.toStringTag, { value: "Module" })), ke = Object.freeze(Object.defineProperty({ __proto__: null, keyboard: Ce, mouse: Fe, touch: Oe }, Symbol.toStringTag, { value: "Module" }));
Re(He);
const Ze = mt.create, je = mt.setErrorLevel, Ve = mt.version;
export {
  k as Shader,
  xe as TextmodeCanvas,
  M as TextmodeColor,
  Yt as TextmodeErrorLevel,
  tt as TextmodeFramebuffer,
  Ot as TextmodeGrid,
  Ke as Textmodifier,
  Ze as create,
  Me as getConversionStrategy,
  ke as input,
  We as loadables,
  Ye as loading,
  Re as registerConversionStrategy,
  je as setErrorLevel,
  mt as textmode,
  ze as unregisterConversionStrategy,
  Ve as version
};
