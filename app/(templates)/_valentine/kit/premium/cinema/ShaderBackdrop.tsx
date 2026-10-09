"use client";

// ─── <ShaderBackdrop> — a full-bleed, slow, expensive-looking fragment shader ─
//
//   <ShaderBackdrop preset="velvet" />                                   // Valentine
//   <ShaderBackdrop preset="fog" colors={["#07060d", "#4b4466", "#ffd9a0"]} parallax />
//
// colors = [deep, mid, highlight]. Raw WebGL1, one fullscreen triangle, ONE
// context per backdrop and never more than MAX_CONTEXTS live on a page (the
// extra ones quietly fall back to the CSS gradient). Perf:
//   • draws at `scale` × CSS size × min(DPR, 1.5) (default 0.55) and lets the
//     browser upsample — soft shaders look identical, the GPU does ~1/7 of the work;
//   • 30 fps on touch devices, 60 on desktop; drops resolution further by itself
//     if frames run long;
//   • stops when the tab is hidden or the canvas is off screen;
//   • reduced motion: one still frame, no loop. No WebGL: the CSS gradient.
// The context is explicitly lost on unmount so Safari doesn't hoard it.

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "../../useReducedMotion";
import { hexToRgb01, subscribeTilt } from "./shared";

export type BackdropPreset = "velvet" | "aurora" | "candle" | "nebula" | "fog" | "bokeh" | "rosegold";

export const BACKDROP_COLORS: Record<BackdropPreset, [string, string, string]> = {
  velvet: ["#1a0309", "#6a0c25", "#ffc2cc"],
  aurora: ["#050816", "#3df5b5", "#b26bff"],
  candle: ["#120805", "#ff9a3c", "#ffe2a8"],
  nebula: ["#04030c", "#6b2bd9", "#ff6fa8"],
  fog: ["#07060d", "#4a4560", "#ffcf8a"],
  bokeh: ["#0b0712", "#ff5f8f", "#ffc46b"],
  rosegold: ["#4a2027", "#d9927f", "#fff0e6"],
};

export interface ShaderBackdropProps {
  preset: BackdropPreset;
  /** [deep, mid, highlight] hex. Defaults per preset (BACKDROP_COLORS). */
  colors?: [string, string, string];
  /** 0–2 glow/contrast of the light parts (default 1). */
  intensity?: number;
  /** Time multiplier (default 1). Keep it ≤ 1.5 — slow reads as expensive. */
  speed?: number;
  /** Drift with the shared pointer/gyro tilt. */
  parallax?: boolean;
  /** Internal resolution factor, 0.3–1 (default 0.55). */
  scale?: number;
  /** position: fixed (default) or absolute inside a relative parent. */
  fixed?: boolean;
  z?: number;
  style?: CSSProperties;
  className?: string;
}

const MAX_CONTEXTS = 2;
let liveContexts = 0;

const HEAD = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 R; uniform float T; uniform vec3 C0; uniform vec3 C1; uniform vec3 C2; uniform float I; uniform vec2 P;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){v+=a*vn(p);p=m*p;a*=.5;}return v;}
`;

const SCENES: Record<BackdropPreset, string> = {
  // Silk/velvet folds lit from the upper left: a warped height field, shaded by its slope.
  velvet: `
float hgt(vec2 q,float t){
  vec2 d=vec2(.82,.57);float w=fbm(q*.55+vec2(t*.6,-t*.4));
  float a=dot(q,d)*7.5+w*4.2+t*1.4;
  float b=dot(q,vec2(-.5,.87))*2.6+w*2.6-t*.9;
  return sin(a)*.65+sin(b)*.35+sin(a*2.1+b)*.08;}
vec3 scene(vec2 p){float t=T*.06;vec2 q=p*2.;float e=.015;
  float h=hgt(q,t);float hx=hgt(q+vec2(e,0.),t);float hy=hgt(q+vec2(0.,e),t);
  vec3 n=normalize(vec3((h-hx)/e*.13,(h-hy)/e*.13,1.));
  vec3 L=normalize(vec3(.62,.48,.62));
  float dif=max(dot(n,L),0.);
  float spec=pow(max(dot(n,normalize(L+vec3(0.,0.,1.))),0.),28.);
  float sheen=pow(1.-n.z,1.5);
  float k=smoothstep(.35,1.,dif);
  vec3 col=mix(C0,C1,k);
  col*=.5+.5*k;
  col+=C2*spec*.5*I+C2*sheen*.18*I;
  return col*(1.-.3*dot(p,p));}`,
  // Soft curtains with vertical striations over a deep sky and a few stars.
  aurora: `
vec3 scene(vec2 p){float t=T*.1;
  vec3 col=mix(C0,C0*1.8+.02,smoothstep(.9,-.9,p.y));
  vec2 sg=p*70.;float s=h21(floor(sg));col+=step(.975,s)*smoothstep(.09,0.,length(fract(sg)-.5))*.8*(.6+.4*sin(T*1.7+s*60.))*smoothstep(-.2,.4,p.y);
  for(int i=0;i<3;i++){float fi=float(i);
    float x=p.x+fi*.37;
    float y=-.02+fi*.15+.13*sin(x*2.6+t*1.3+fi*1.9)+.07*sin(x*5.3-t*.9)+.12*(fbm(vec2(x*1.6+t*.4,fi*3.1))-.5);
    float d=p.y-y;
    float band=d>0.?exp(-d*(2.2+fi)):exp(d*9.);
    float stri=.62+.38*vn(vec2(x*9.+t*1.5+fi*9.,fi+t*.2));
    vec3 c=i==0?C1:i==1?mix(C1,C2,.55):C2;
    col+=c*band*stri*(.55-fi*.1)*I;}
  return col;}`,
  // A warm low flame-glow that breathes, shafts of light from the upper left, dust in the shafts.
  candle: `
vec3 scene(vec2 p){
  float fl=.86+.07*sin(T*7.3)+.05*sin(T*13.1+1.)+.12*(vn(vec2(T*3.,0.))-.5);
  float d=length((p-vec2(0.,-.62))*vec2(1.,.85));
  vec3 col=C0*(.7+.3*smoothstep(-.9,.9,p.y));
  col+=C1*exp(-d*2.3)*fl*.85*I;
  col+=C2*exp(-d*7.)*fl*.7*I;
  vec2 o=vec2(-1.1,1.);vec2 dir=p-o;float ang=atan(dir.y,dir.x);
  float rays=fbm(vec2(ang*8.,T*.04));rays=pow(rays,2.2)*smoothstep(2.4,.4,length(dir));
  col+=C2*rays*.42*I;
  vec2 g=p*16.+vec2(T*.12,-T*.2);vec2 id=floor(g);vec2 f=fract(g)-.5;float h=h21(id);
  vec2 off=(vec2(h,fract(h*13.))-.5)*.6;
  float m=smoothstep(.07,0.,length(f-off))*step(.8,h);
  col+=C2*m*(rays*3.+.08)*(.5+.5*sin(T*1.6+h*40.));
  return col;}`,
  // Domain-warped clouds over two parallaxing star layers.
  nebula: `
vec3 scene(vec2 p){float t=T*.025;
  vec2 q=vec2(fbm(p*2.4+t),fbm(p*2.4+vec2(5.2,1.3)-t));
  float n=fbm(p*2.8+q*2.6+t*.5);
  float m=smoothstep(.3,.62,n);
  vec3 col=mix(C0,C1*.8,m*.6*I);
  col=mix(col,C2*.75,smoothstep(.5,.72,n)*smoothstep(.4,.7,q.x)*.22*I);
  col+=C1*.15*smoothstep(.45,.8,q.y)*m*I;
  col+=C2*pow(m,8.)*.08*I;
  col*=1.-.35*dot(p,p);
  for(int i=0;i<2;i++){float s=float(i)+1.;vec2 g=p*(48.+s*36.)+P*s*3.;vec2 id=floor(g);vec2 f=fract(g)-.5;float h=h21(id+s*7.);
    float st=smoothstep(.16,0.,length(f-(vec2(h,fract(h*7.))-.5)*.6))*step(.9,h);
    col+=vec3(1.,.95,.92)*st*(.55+.45*sin(T*1.3+h*90.))*(1.2-s*.3);}
  return col;}`,
  // Two layers of rolling ground fog under a cold moon-glow.
  fog: `
vec3 scene(vec2 p){float t=T*.05;
  vec3 col=mix(C0*.6,C0*2.2+.02,smoothstep(-.8,.8,p.y));
  col+=C2*exp(-length(p-vec2(.28,.42))*3.)*.45*I;
  float f1=fbm(vec2(p.x*1.6+t,p.y*3.2+t*.3));
  float f2=fbm(vec2(p.x*3.-t*1.8,p.y*5.)+3.7);
  float low=smoothstep(.6,-.6,p.y);
  float fv=smoothstep(.38,.9,f1*.7+f2*.4+low*.35-.12);
  col=mix(col,C1*1.35+C2*.1,fv*.85*I);
  col+=C2*.06*fv*smoothstep(-.2,.5,p.y)*I;
  return col;}`,
  // Out-of-focus city lights: three depth layers of soft disks with brighter rims.
  bokeh: `
vec3 scene(vec2 p){
  vec3 col=mix(C0,C0*1.7+.02,smoothstep(-.9,.9,p.y));
  for(int L=0;L<3;L++){float l=float(L);
    float sc=2.6+l*1.9;
    vec2 g=p*sc+vec2(T*.025*(l+1.),sin(T*.08+l)*.25)+P*(3.-l)*.35;
    vec2 id=floor(g);vec2 f=fract(g)-.5;float h=h21(id+l*17.);
    if(h<.42)continue;
    float r=.13+.17*fract(h*7.);
    vec2 o=(vec2(h,fract(h*31.))-.5)*(.92-2.*r);
    float d=length(f-o);
    float edge=.035+(2.-l)*.03;
    float disk=smoothstep(r,r-edge,d);
    float rim=smoothstep(r-.07,r-.01,d)*disk;
    vec3 c=mix(C1,C2,fract(h*11.));
    col+=c*(disk*.4+rim*.28)*(1.-l*.22)*I*(.75+.25*sin(T*.45+h*20.));}
  return col;}`,
  // Liquid metal: warped noise read as a mirror that reflects soft studio bands.
  rosegold: `
vec3 scene(vec2 p){float t=T*.06;vec2 q=p*1.15;
  float a=fbm(q+vec2(t,t*.7));
  float b=fbm(q*1.3+a*1.9-vec2(t*.6,0.));
  float band=sin(b*13.+p.y*2.2+t*2.5)*.5+.5;
  vec3 col=mix(C0,C1,smoothstep(.0,1.,band));
  col=mix(col,C2,pow(band,7.)*.85*I);
  col+=C2*pow(smoothstep(.55,.95,b),3.)*.35*I;
  return col*(1.-.22*dot(p,p));}`,
};

const MAIN = `
void main(){vec2 p=(gl_FragCoord.xy-.5*R)/R.y+P*.04;
  vec3 col=scene(p);
  col+=(h21(gl_FragCoord.xy+fract(T))-.5)/128.;
  gl_FragColor=vec4(max(col,0.),1.);}`;

const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";

/** A rich CSS gradient in the preset's colours — the no-WebGL / first-paint look. */
export function backdropGradient(preset: BackdropPreset, c: [string, string, string]): string {
  switch (preset) {
    case "candle": return `radial-gradient(120% 70% at 50% 92%, ${c[1]}55, transparent 60%), radial-gradient(60% 40% at 50% 100%, ${c[2]}44, transparent 70%), ${c[0]}`;
    case "fog": return `radial-gradient(70% 50% at 75% 18%, ${c[2]}22, transparent 70%), linear-gradient(to top, ${c[1]}aa, ${c[0]} 60%)`;
    case "aurora": return `radial-gradient(120% 50% at 30% 40%, ${c[1]}33, transparent 70%), radial-gradient(90% 40% at 70% 30%, ${c[2]}33, transparent 70%), ${c[0]}`;
    case "rosegold": return `linear-gradient(160deg, ${c[0]}, ${c[1]} 45%, ${c[2]} 60%, ${c[1]} 75%, ${c[0]})`;
    default: return `radial-gradient(110% 70% at 30% 30%, ${c[1]}66, transparent 70%), radial-gradient(90% 60% at 80% 85%, ${c[2]}22, transparent 70%), ${c[0]}`;
  }
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== "production") console.warn("[ShaderBackdrop]", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export default function ShaderBackdrop({
  preset, colors, intensity = 1, speed = 1, parallax = false, scale = 0.55, fixed = true, z = 0, style, className,
}: ShaderBackdropProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const cols = colors ?? BACKDROP_COLORS[preset];
  const colorKey = cols.join("|");
  // Uniforms that may change without rebuilding the program.
  const live = useRef({ intensity, speed });
  useEffect(() => { live.current = { intensity, speed }; }, [intensity, speed]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || liveContexts >= MAX_CONTEXTS) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) return;
    liveContexts++;
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, HEAD + SCENES[preset] + MAIN);
    const prog = gl.createProgram();
    let raf = 0, alive = true, onScreen = true, visible = !document.hidden, lost = false;
    const cleanups: (() => void)[] = [];
    const release = () => {
      if (!alive) return;
      alive = false;
      liveContexts--;
      cancelAnimationFrame(raf);
      cleanups.forEach((f) => f());
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    if (!vs || !fs || !prog) { release(); return; }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { release(); return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uR = u("R"), uT = u("T"), uI = u("I"), uP = u("P");
    const c = colorKey.split("|").map(hexToRgb01);
    gl.uniform3fv(u("C0"), c[0]);
    gl.uniform3fv(u("C1"), c[1]);
    gl.uniform3fv(u("C2"), c[2]);

    const touch = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    const frameMs = touch ? 1000 / 31 : 0;
    let q = Math.max(0.3, Math.min(1, scale));
    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr * q));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr * q));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uR, w, h);
    };
    resize();

    // Parallax: read the shared tilt without re-rendering React; smooth in-loop.
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
    if (parallax && !reduce) cleanups.push(subscribeTilt((s) => { tilt.tx = s.x; tilt.ty = -s.y; }));

    let t = preset === "nebula" ? 800 : 7.3; // a seed so the still frame isn't the boring t=0 one
    let last = performance.now(), lastDraw = 0, slow = 0, firstFrame = true;
    const draw = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t = (t + dt * live.current.speed) % 3600;
      tilt.x += (tilt.tx - tilt.x) * Math.min(1, dt * 3);
      tilt.y += (tilt.ty - tilt.y) * Math.min(1, dt * 3);
      gl.uniform1f(uT, t);
      gl.uniform1f(uI, live.current.intensity);
      gl.uniform2f(uP, tilt.x, tilt.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (firstFrame) { firstFrame = false; setReady(true); }
    };
    const loop = (now: number) => {
      raf = 0;
      if (!alive || lost || !onScreen || !visible) return;
      raf = requestAnimationFrame(loop);
      if (now - lastDraw < frameMs) return;
      // Adaptive quality: if frames keep running long, drop the internal resolution once.
      const gap = lastDraw ? now - lastDraw : 16;
      lastDraw = now;
      slow = gap > (touch ? 48 : 30) ? slow + 1 : Math.max(0, slow - 1);
      if (slow > 40 && q > 0.36) { q = 0.36; slow = 0; resize(); }
      draw(now);
    };
    const kick = () => {
      if (reduce) return;
      if (!raf && alive && onScreen && visible && !lost) { last = performance.now(); raf = requestAnimationFrame(loop); }
    };
    if (reduce) draw(performance.now());
    else kick();

    const ro = new ResizeObserver(() => { resize(); if (reduce) draw(performance.now()); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; kick(); });
    io.observe(canvas);
    const onVis = () => { visible = !document.hidden; kick(); };
    document.addEventListener("visibilitychange", onVis);
    const onLost = (e: Event) => { e.preventDefault(); lost = true; setReady(false); };
    canvas.addEventListener("webglcontextlost", onLost);
    cleanups.push(() => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
    });
    return () => { release(); setReady(false); };
  }, [preset, colorKey, parallax, reduce, scale]);

  const pos: CSSProperties = { position: fixed ? "fixed" : "absolute", inset: 0, width: "100%", height: "100%" };
  return (
    <div aria-hidden className={className} style={{ ...pos, zIndex: z, pointerEvents: "none", background: backdropGradient(preset, cols), ...style }}>
      <canvas
        // A fresh canvas per program: a lost context can't be re-acquired on the same element.
        key={`${preset}|${colorKey}|${scale}|${parallax}|${reduce}`}
        ref={ref}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", opacity: ready ? 1 : 0, transition: "opacity .9s ease" }}
      />
    </div>
  );
}
