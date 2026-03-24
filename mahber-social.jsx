"use client";

import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ui/theme-toggle";
import TikTokAuthButton from "@/components/auth/tiktok-auth-button";
import ProfileDock from "@/components/ui/profile-dock";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');`;

const ET_GREEN = "#078930";
const ET_YELLOW = "#FCDD09";
const ET_RED = "#DA121A";
const FIRE = "#FF5C00";

const TIERS = [
  { name: "ASH",       min: 0,     icon: "🪨", color: "#7A7775", glow: "rgba(120,119,117,0.3)" },
  { name: "EMBER",     min: 1000,  icon: "🔥", color: FIRE,      glow: "rgba(255,92,0,0.35)" },
  { name: "FLAME",     min: 5000,  icon: "💥", color: ET_YELLOW, glow: "rgba(252,221,9,0.3)" },
  { name: "INFERNO",   min: 10000, icon: "⚡", color: ET_RED,    glow: "rgba(218,18,26,0.4)" },
  { name: "LEGENDARY", min: 20000, icon: "👑", color: ET_GREEN,  glow: "rgba(7,137,48,0.4)" },
];
function getTier(h) { for (let i=TIERS.length-1;i>=0;i--) if(h>=TIERS[i].min) return TIERS[i]; return TIERS[0]; }
function fmt(n) { return n>=1000?(n/1000).toFixed(1)+"k":String(n); }
function fmtHeat(n) { return fmt(n)+" 🔥"; }
function slugify(v) {
  return String(v || "mahber")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "mahber";
}

function getMahberRouteKey(m) {
  const key = String(m?.slug || m?.id || "").trim();
  return key;
}

const CSS = `
${FONTS}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07070A;--s1:#0E0E13;--s2:#16161D;--s3:#1C1C25;
  --border:rgba(255,255,255,0.07);
  --green:${ET_GREEN};--yellow:${ET_YELLOW};--red:${ET_RED};--fire:${FIRE};
  --txt:#F0EDE6;--muted:#7A7775;--soft:#B0ADA6;
}
:root[data-theme='light']{
  --bg:#F6F8FD;--s1:#FFFFFF;--s2:#FFFFFF;--s3:#EEF3FF;
  --border:rgba(18,31,56,0.14);
  --txt:#0F1B33;--muted:#536381;--soft:#304163;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--txt);font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased}
.app{min-height:100vh;background:var(--bg);position:relative;overflow-x:hidden}
.app::before{content:'';position:fixed;inset:0;background:
  radial-gradient(ellipse 60% 40% at 10% 0%,rgba(218,18,26,0.06) 0%,transparent 60%),
  radial-gradient(ellipse 50% 35% at 90% 100%,rgba(7,137,48,0.07) 0%,transparent 60%),
  radial-gradient(ellipse 70% 50% at 50% 50%,rgba(252,221,9,0.03) 0%,transparent 70%);
  pointer-events:none;z-index:0}
.nav{position:sticky;top:0;z-index:200;background:color-mix(in srgb, var(--s2) 82%, transparent);backdrop-filter:blur(24px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 18px;height:58px}
.logo{font-family:'Black Han Sans',sans-serif;font-size:22px;letter-spacing:3px;background:linear-gradient(90deg,var(--yellow),var(--fire));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.logo-sub{font-size:11px;display:block;color:var(--muted);letter-spacing:1.5px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;margin-top:-2px}
.tabs{display:flex;gap:2px;padding:12px 18px 0;border-bottom:1px solid var(--border);background:var(--bg);position:sticky;top:58px;z-index:190}
.tab{flex:1;text-align:center;padding:9px 6px;font-size:12px;font-weight:700;color:var(--muted);letter-spacing:0.5px;border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;text-transform:uppercase}
.tab.active{color:var(--yellow);border-bottom-color:var(--yellow)}
.tab:hover:not(.active){color:var(--txt)}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--yellow);color:#000;font-weight:800;font-size:14px;padding:12px 26px;border-radius:30px;z-index:999;animation:toastIn 0.3s ease;box-shadow:0 8px 32px rgba(252,221,9,0.35);white-space:nowrap;pointer-events:none}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.gem-layer{position:fixed;inset:0;pointer-events:none;z-index:998}
.gem-pop{position:fixed;transform:translate(-50%,-50%);padding:8px 12px;border-radius:999px;font-size:12px;font-weight:900;letter-spacing:0.4px;border:1px solid rgba(255,255,255,0.16);animation:gemFloat 950ms cubic-bezier(.2,.8,.2,1) forwards;backdrop-filter:blur(5px);white-space:nowrap}
.gem-pop.yellow{background:rgba(252,221,9,0.16);color:var(--yellow)}
.gem-pop.green{background:rgba(7,137,48,0.16);color:#59f398}
.gem-pop.red{background:rgba(218,18,26,0.16);color:#ff5f6b}
.gem-pop.cyan{background:rgba(0,242,234,0.14);color:#7ff7ff}
@keyframes gemFloat{0%{opacity:0;transform:translate(-50%,-42%) scale(0.8)}12%{opacity:1}100%{opacity:0;transform:translate(-50%,-150%) scale(1.06)}}
.feed-header{padding:20px 18px 0;position:relative;z-index:1}
.feed-title{font-family:'Black Han Sans',sans-serif;font-size:clamp(30px,7vw,56px);letter-spacing:3px;line-height:0.95;background:linear-gradient(135deg,#fff 0%,var(--yellow) 60%,var(--fire) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px}
.feed-sub{font-size:13px;color:var(--muted);font-weight:500;margin-bottom:16px}
.search-row{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.search{flex:1;min-width:140px;background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:10px 14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--txt);outline:none;transition:border-color 0.2s}
.search:focus{border-color:rgba(252,221,9,0.5)}
.search::placeholder{color:var(--muted)}
.sort-pill{background:var(--s2);border:1px solid var(--border);color:var(--muted);padding:10px 14px;border-radius:12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;text-transform:uppercase;letter-spacing:0.5px}
.sort-pill.on{background:var(--yellow);color:#000;border-color:var(--yellow)}
.tag-strip{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;padding-bottom:14px}
.tag-strip::-webkit-scrollbar{display:none}
.tag-btn{flex-shrink:0;padding:5px 13px;border-radius:20px;font-size:12px;font-weight:600;border:1px solid var(--border);color:var(--muted);cursor:pointer;transition:all 0.2s;background:transparent;font-family:'Plus Jakarta Sans',sans-serif}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px;padding:4px 18px 100px;position:relative;z-index:1}
.card{background:var(--s2);border:1px solid var(--border);border-radius:20px;padding:0;cursor:pointer;transition:transform 0.22s,box-shadow 0.22s;position:relative;overflow:hidden}
.card:hover{transform:translateY(-5px)}
.card-stripe{height:3px;width:100%}
.card-body{padding:18px}
.card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
.card-emoji{font-size:38px;line-height:1}
.tier-badge{display:flex;flex-direction:column;align-items:flex-end;gap:2px}
.tier-tag{font-size:10px;font-weight:800;letter-spacing:1.5px;padding:3px 8px;border-radius:6px}
.heat-val{font-family:'Black Han Sans',sans-serif;font-size:13px;letter-spacing:1px}
.card-name{font-family:'Black Han Sans',sans-serif;font-size:20px;letter-spacing:1px;margin-bottom:3px;line-height:1.1}
.card-creator{font-size:11px;color:var(--muted);font-weight:600;letter-spacing:0.3px;margin-bottom:14px}
.card-stats{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:14px;padding:10px 0}
.cstat{text-align:center}
.cstat-v{font-family:'Black Han Sans',sans-serif;font-size:18px;letter-spacing:0.5px}
.cstat-l{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-top:1px}
.card-btns{display:flex;gap:8px;flex-wrap:wrap}
.btn{border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;border-radius:11px;transition:all 0.18s;letter-spacing:0.3px}
.btn-join{flex:1;padding:10px;font-size:13px;background:var(--yellow);color:#000}
.btn-join:hover{background:#FFE84D;transform:scale(1.03)}
.btn-join.on{background:var(--s3);color:var(--muted);border:1px solid var(--border)}
.btn-icon{padding:10px 13px;font-size:14px;background:var(--s3);border:1px solid var(--border);color:var(--txt);cursor:pointer}
.btn-icon:hover{background:var(--s1);border-color:rgba(255,255,255,0.15)}
.btn-vote{padding:10px 13px;font-size:13px;background:rgba(252,221,9,0.13);border:1px solid rgba(252,221,9,0.45);color:var(--yellow)}
.btn-poll{padding:10px 13px;font-size:13px;background:rgba(7,137,48,0.14);border:1px solid rgba(7,137,48,0.5);color:#67f0a4}
.poll-mini{background:var(--s1);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px}
.poll-mini-q{font-size:13px;font-weight:700;margin-bottom:8px;color:var(--txt)}
.poll-mini-opt{width:100%;text-align:left;background:var(--s2);color:var(--txt);border:1px solid var(--border);border-radius:9px;padding:8px 10px;font-size:12px;font-weight:600;margin-bottom:7px;cursor:pointer}
.poll-mini-opt:hover{border-color:rgba(252,221,9,0.45)}
.poll-create-box{background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:12px;margin-top:10px}
.poll-create-row{display:flex;gap:8px;margin-top:8px}
.poll-create-input{width:100%;background:var(--s2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;color:var(--txt);font-size:13px;font-family:'Plus Jakarta Sans',sans-serif}
.poll-create-input:focus{outline:none;border-color:rgba(7,137,48,0.6)}
.poll-create-btn{margin-top:10px;width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(7,137,48,0.5);background:rgba(7,137,48,0.15);color:#67f0a4;font-weight:800;font-size:12px;cursor:pointer;text-transform:uppercase;letter-spacing:0.8px}
.poll-create-btn:hover{background:rgba(7,137,48,0.22)}
.wars-wrap{padding:20px 18px 100px;position:relative;z-index:1}
.section-title-big{font-family:'Black Han Sans',sans-serif;font-size:clamp(28px,6vw,48px);letter-spacing:3px;margin-bottom:4px}
.section-sub{font-size:13px;color:var(--muted);margin-bottom:20px}
.war-card{background:var(--s2);border:1px solid var(--border);border-radius:20px;overflow:hidden;margin-bottom:24px}
.war-top{background:linear-gradient(135deg,rgba(218,18,26,0.1),rgba(252,221,9,0.05),rgba(7,137,48,0.08));border-bottom:1px solid var(--border);padding:14px 20px;display:flex;justify-content:space-between;align-items:center}
.war-label{font-size:10px;font-weight:800;color:var(--red);letter-spacing:2px;text-transform:uppercase}
.war-timer{font-family:'Black Han Sans',sans-serif;font-size:14px;color:var(--yellow);letter-spacing:1px}
.war-body{padding:20px}
.war-fighters{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin-bottom:20px}
.fighter{text-align:center}
.fighter-emoji{font-size:42px;margin-bottom:6px}
.fighter-name{font-family:'Black Han Sans',sans-serif;font-size:18px;letter-spacing:1px;line-height:1.1}
.fighter-votes{font-size:12px;color:var(--muted);margin-top:3px}
.vs-badge{font-family:'Black Han Sans',sans-serif;font-size:22px;color:var(--fire);background:rgba(255,92,0,0.1);border:2px solid rgba(255,92,0,0.3);border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center}
.war-bar-wrap{background:var(--s1);border-radius:12px;height:16px;overflow:hidden;margin-bottom:12px;display:flex}
.war-bar-a{background:linear-gradient(90deg,var(--red),#FF6060);height:100%;transition:width 0.8s cubic-bezier(.4,0,.2,1)}
.war-bar-b{background:linear-gradient(90deg,var(--green),#00D45A);height:100%;transition:width 0.8s cubic-bezier(.4,0,.2,1)}
.war-pcts{display:flex;justify-content:space-between;font-family:'Black Han Sans',sans-serif;font-size:14px;margin-bottom:16px}
.war-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.war-btn{padding:13px;border-radius:13px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:14px;border:none;cursor:pointer;transition:all 0.2s;letter-spacing:0.3px}
.war-btn-a{background:var(--red);color:#fff}
.war-btn-a:hover{background:#FF2A2A;transform:scale(1.03)}
.war-btn-b{background:var(--green);color:#fff}
.war-btn-b:hover{background:#00A843;transform:scale(1.03)}
.war-btn.voted-state{opacity:0.55;cursor:not-allowed}
.past-wars-title{font-family:'Black Han Sans',sans-serif;font-size:18px;letter-spacing:2px;color:var(--muted);margin-bottom:12px}
.past-row{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--s1);border-radius:12px;margin-bottom:8px;font-size:13px}
.past-winner{font-weight:700;color:var(--yellow)}
.past-score{font-family:'Black Han Sans',sans-serif;font-size:14px;color:var(--muted);letter-spacing:1px}
.trend-wrap{padding:20px 18px 100px;position:relative;z-index:1}
.rank-row{display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--s2);border:1px solid var(--border);border-left:3px solid;border-radius:14px;margin-bottom:10px;cursor:pointer;transition:transform 0.2s,border-color 0.2s}
.rank-row:hover{transform:translateX(5px)}
.rank-num{font-family:'Black Han Sans',sans-serif;font-size:22px;color:var(--muted);width:28px;flex-shrink:0}
.rank-num.top3{color:var(--yellow)}
.rank-emoji{font-size:28px;flex-shrink:0}
.rank-info{flex:1}
.rank-name{font-weight:700;font-size:15px;margin-bottom:2px}
.rank-heat-text{font-size:12px;color:var(--muted)}
.heat-bar-bg{height:4px;background:var(--s1);border-radius:4px;margin-top:6px;overflow:hidden}
.heat-bar-fill{height:100%;border-radius:4px;transition:width 1s ease}
.rank-tier-badge{font-size:10px;font-weight:800;letter-spacing:1.5px;padding:3px 8px;border-radius:6px;flex-shrink:0}
.create-wrap{padding:20px 18px 100px;position:relative;z-index:1}
.create-preview{background:var(--s2);border:1px solid rgba(252,221,9,0.2);border-radius:20px;padding:20px;margin-bottom:20px;position:relative;overflow:hidden}
.create-preview::after{content:'PREVIEW';position:absolute;top:12px;right:14px;font-size:10px;font-weight:800;color:rgba(252,221,9,0.35);letter-spacing:2px}
.form-group{margin-bottom:16px}
.form-label{font-size:12px;font-weight:700;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;display:block}
.form-input{width:100%;background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:12px 16px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:var(--txt);outline:none;transition:border-color 0.2s}
.form-input:focus{border-color:rgba(252,221,9,0.5)}
.form-input::placeholder{color:var(--muted)}
textarea.form-input{resize:vertical;min-height:80px}
.emoji-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}
.emoji-opt{font-size:22px;cursor:pointer;padding:6px;border-radius:10px;border:2px solid transparent;transition:all 0.15s;background:var(--s1)}
.emoji-opt.on{border-color:var(--yellow);background:rgba(252,221,9,0.1)}
.btn-create{width:100%;padding:14px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:16px;background:linear-gradient(135deg,var(--green),#00C85A);color:#fff;border:none;border-radius:14px;cursor:pointer;transition:all 0.2s;letter-spacing:0.5px;margin-top:8px}
.btn-create:hover{transform:scale(1.02);box-shadow:0 8px 32px rgba(7,137,48,0.4)}
.create-success{text-align:center;padding:40px 20px;background:var(--s2);border:1px solid rgba(7,137,48,0.3);border-radius:20px}
.create-success-emoji{font-size:56px;margin-bottom:12px}
.create-success h2{font-family:'Black Han Sans',sans-serif;font-size:28px;letter-spacing:2px;color:var(--green);margin-bottom:8px}
.create-success p{font-size:14px;color:var(--muted);line-height:1.6}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:var(--s2);border:1px solid rgba(252,221,9,0.2);border-radius:24px;padding:24px;width:100%;max-width:380px;position:relative}
.modal-close{position:absolute;top:14px;right:16px;background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer}
.modal-title{font-family:'Black Han Sans',sans-serif;font-size:18px;letter-spacing:2px;margin-bottom:14px;color:var(--yellow)}
.share-card{border-radius:20px;padding:24px;text-align:center;margin-bottom:16px}
.share-card-name{font-family:'Black Han Sans',sans-serif;font-size:28px;letter-spacing:2px;margin:10px 0 4px}
.share-card-stat{font-size:13px;color:var(--muted);margin-bottom:10px}
.share-card-tier{font-size:11px;font-weight:800;letter-spacing:2px;padding:4px 12px;border-radius:20px}
.share-card-site{margin-top:10px;font-size:13px;color:var(--muted);font-weight:600}
.share-btns{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.share-btn{padding:11px;border-radius:12px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:13px;border:none;cursor:pointer;transition:all 0.2s}
.share-tiktok{background:linear-gradient(135deg,#FF0050,#00F2EA);color:#000}
.share-copy{background:var(--s3);color:var(--txt);border:1px solid var(--border)}
.detail-wrap{min-height:100vh;background:var(--bg)}
.detail-nav{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--border);position:sticky;top:0;background:color-mix(in srgb, var(--s2) 84%, transparent);backdrop-filter:blur(20px);z-index:100}
.back-btn{background:var(--s2);border:1px solid var(--border);color:var(--txt);padding:8px 14px;border-radius:10px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all 0.2s}
.back-btn:hover{background:var(--s3)}
.detail-nav-title{font-family:'Black Han Sans',sans-serif;font-size:14px;letter-spacing:1px;color:var(--muted);flex:1;text-align:center}
.detail-hero{padding:20px 18px;border-bottom:1px solid var(--border)}
.detail-top{display:flex;gap:16px;align-items:flex-start;margin-bottom:12px}
.detail-emoji{font-size:54px;flex-shrink:0}
.detail-name{font-family:'Black Han Sans',sans-serif;font-size:clamp(26px,6vw,44px);letter-spacing:2px;line-height:1;margin-bottom:4px}
.detail-creator{font-size:13px;color:var(--muted);font-weight:600}
.detail-desc{font-size:14px;color:var(--soft);line-height:1.65;margin-bottom:16px}
.detail-stats{display:grid;grid-template-columns:repeat(4,1fr);background:var(--s2);border:1px solid var(--border);border-radius:14px;margin-bottom:16px;overflow:hidden}
.dstat{padding:14px 8px;text-align:center;border-right:1px solid var(--border)}
.dstat:last-child{border-right:none}
.dstat-v{font-family:'Black Han Sans',sans-serif;font-size:20px;letter-spacing:0.5px}
.dstat-l{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-top:2px}
.detail-btns{display:flex;gap:10px;flex-wrap:wrap}
.btn-big{padding:13px 24px;font-size:14px;border-radius:13px;letter-spacing:0.3px}
.detail-section{padding:20px 18px;border-bottom:1px solid var(--border)}
.section-head{font-family:'Black Han Sans',sans-serif;font-size:20px;letter-spacing:2px;color:var(--yellow);margin-bottom:14px}
.poll-card{background:var(--s2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px}
.poll-q{font-size:15px;font-weight:700;margin-bottom:12px}
.poll-opt{position:relative;overflow:hidden;background:var(--s1);border:1px solid var(--border);border-radius:10px;padding:11px 14px;margin-bottom:8px;cursor:pointer;transition:border-color 0.2s;display:flex;justify-content:space-between;align-items:center}
.poll-opt:hover{border-color:rgba(252,221,9,0.4)}
.poll-opt.voted{border-color:var(--green)}
.poll-fill{position:absolute;left:0;top:0;bottom:0;background:rgba(7,137,48,0.12);transition:width 0.6s ease;z-index:0}
.poll-opt-text{position:relative;z-index:1;font-size:14px;font-weight:500}
.poll-pct{position:relative;z-index:1;font-size:13px;font-weight:800;color:var(--green)}
.lb-row{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--s2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px;transition:transform 0.2s}
.lb-row:hover{transform:translateX(5px)}
.lb-pos{font-family:'Black Han Sans',sans-serif;font-size:18px;color:var(--muted);width:22px}
.lb-badge{font-size:18px}
.lb-name{flex:1;font-weight:700;font-size:14px}
.lb-pts{font-family:'Black Han Sans',sans-serif;font-size:16px;color:var(--yellow);letter-spacing:1px}
.tiktok-block{background:linear-gradient(135deg,#010101,#111);border:1px solid #222;border-radius:16px;padding:24px;text-align:center;margin:20px 18px 100px}
.tiktok-block h3{font-family:'Black Han Sans',sans-serif;font-size:22px;letter-spacing:2px;margin-bottom:8px}
.tiktok-block p{font-size:13px;color:var(--muted);margin-bottom:16px}
.btn-tiktok-big{background:linear-gradient(135deg,#FF0050,#00F2EA);color:#000;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:15px;padding:13px 32px;border-radius:13px;border:none;cursor:pointer;transition:all 0.2s;letter-spacing:0.3px}
.btn-tiktok-big:hover{transform:scale(1.05);box-shadow:0 8px 28px rgba(255,0,80,0.3)}
@media(max-width:480px){.grid{grid-template-columns:1fr;padding:4px 12px 100px}.feed-header,.wars-wrap,.trend-wrap,.create-wrap{padding-left:12px;padding-right:12px}.tabs .tab{font-size:11px;padding:9px 4px}}
@media(prefers-reduced-motion: reduce){*{animation:none !important;transition:none !important}}
[data-theme='light'] .app::before{opacity:0.45}
[data-theme='light'] .feed-title{background:linear-gradient(135deg,#1f2b47 0%,#0f5f95 55%,#187153 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
[data-theme='light'] .tiktok-block{background:linear-gradient(135deg,#eaf2ff,#f5f9ff);border:1px solid var(--border)}
`;

export default function MahberSocial() {
  const [mahbers, setMahbers] = useState([]);
  const [tab, setTab] = useState("feed");
  const [detailId, setDetailId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [toastMsg, setToastMsg] = useState(null);
  const [warVotes, setWarVotes] = useState({ a: 4820, b: 3290 });
  const [warJustVoted, setWarJustVoted] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const [createForm, setCreateForm] = useState({ name: "", emoji: "🔥", desc: "", tiktok: "", telegram: "" });
  const [createDone, setCreateDone] = useState(false);
  const [warCountdown, setWarCountdown] = useState(259140);
  const [theme, setTheme] = useState("dark");
  const [profile, setProfile] = useState(null);
  const [emojiOptions, setEmojiOptions] = useState(["🔥", "💘", "😂", "⚽", "🎵", "☕", "🍯", "🕺", "🌍", "👑", "⚡", "🎭", "🏆", "💎", "🌙"]);
  const [gems, setGems] = useState([]);

  function applyStoredActions(items, username) {
    if (typeof window === "undefined" || !username || !Array.isArray(items)) return items;

    return items.map((item) => {
      const slug = String(item?.slug || "").trim();
      if (!slug) return item;

      try {
        const key = `mahber-actions:${slug}:${username}`;
        const parsed = JSON.parse(localStorage.getItem(key) || "{}");
        return {
          ...item,
          joined: Boolean(parsed.joined),
          boosted: Boolean(parsed.boosted),
        };
      } catch {
        return item;
      }
    });
  }

  function persistFeedCache(items) {
    if (typeof window !== "undefined") {
      localStorage.setItem("mahber-feed-cache", JSON.stringify(items));
    }
  }

  useEffect(() => {
    const t = setInterval(() => {
      setMahbers(prev => prev.map(m => ({
        ...m,
        heat: Math.max(0, m.heat + Math.floor(Math.random() * 18) - 2),
        members: Math.random() > 0.97 ? m.members + 1 : m.members,
      })));
      setWarVotes(prev => ({
        a: prev.a + (Math.random() > 0.5 ? Math.floor(Math.random() * 8) : 0),
        b: prev.b + (Math.random() > 0.5 ? Math.floor(Math.random() * 6) : 0),
      }));
    }, 2200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setWarCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("mahber-theme") : null;
    const next = saved === "light" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  useEffect(() => {
    async function loadProfile() {
      try {
        const cached = typeof window !== "undefined" ? localStorage.getItem("mahber-profile-cache") : null;
        if (cached) {
          try {
            setProfile(JSON.parse(cached));
          } catch {
            // ignore invalid cache
          }
        }

        const res = await fetch("/api/auth/tiktok/me", { cache: "no-store" });
        const data = await res.json();
        setProfile(data.user || null);
        if (typeof window !== "undefined") {
          if (data.user) {
            localStorage.setItem("mahber-profile-cache", JSON.stringify(data.user));
          } else {
            localStorage.removeItem("mahber-profile-cache");
          }
        }
      } catch {
        setProfile(null);
      }
    }
    loadProfile();
  }, []);

  useEffect(() => {
    async function loadEmojis() {
      try {
        const res = await fetch("/api/emojis", { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          setEmojiOptions(data.items.map((item) => item.emoji));
        }
      } catch {
        // keep defaults
      }
    }
    loadEmojis();
  }, []);

  useEffect(() => {
    async function loadMahbersFromDb() {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("mahber-feed-cache");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMahbers(applyStoredActions(parsed, profile?.username));
            }
          } catch {
            // ignore bad cache
          }
        }
      }

      try {
        const res = await fetch("/api/mahbers?cursor=0&limit=24", { cache: "no-store" });
        const data = await res.json();
        if (!Array.isArray(data.items) || data.items.length === 0) return;

        const mapped = data.items.map((item) => ({
            id: item.id || Date.now(),
            slug: item.slug || slugify(item.name),
            name: item.name || "Untitled Mahber",
            emoji: item.emoji || "🔥",
            creator: item.creator || "guest",
            ownerUsername: item.ownerUsername || "",
            badge: item.verified ? "✔" : "🆕",
            members: item.members || 1,
            heat: item.heat || 80,
          joined: Boolean(item.joined),
          boosted: Boolean(item.boosted),
            tiktok: item.tiktok || "https://tiktok.com",
            telegram: item.telegram || "",
            desc: item.desc || "Community mahber",
            tags: item.category ? [String(item.category)] : ["community"],
            warWins: item.warWins || 0,
            joinCount: item.joinCount || 0,
            boostPoints: item.boostPoints || 0,
            polls: Array.isArray(item.polls) ? item.polls : [],
            lb: Array.isArray(item.lb) ? item.lb : [],
          }));

        const withActions = applyStoredActions(mapped, profile?.username);
        setMahbers(withActions);
        persistFeedCache(withActions);
      } catch {
        // DB is the source of truth in real mode
      }
    }
    loadMahbersFromDb();
  }, [profile?.username]);

  useEffect(() => {
    if (!profile?.username) return;
    setMahbers((prev) => {
      const next = applyStoredActions(prev, profile.username);
      persistFeedCache(next);
      return next;
    });
  }, [profile?.username]);

  useEffect(() => {
    if (!profile && tab === "create") {
      setTab("feed");
    }
  }, [profile, tab]);

  function toast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  }

  function spawnGem(label, tone = "yellow", event) {
    const id = `${Date.now()}-${Math.random()}`;
    let x = typeof window !== "undefined" ? window.innerWidth * 0.5 : 180;
    let y = typeof window !== "undefined" ? window.innerHeight * 0.72 : 440;

    if (event?.clientX && event?.clientY) {
      x = event.clientX;
      y = event.clientY;
    }

    setGems((prev) => [...prev, { id, label, tone, x, y }]);
    setTimeout(() => {
      setGems((prev) => prev.filter((g) => g.id !== id));
    }, 980);
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("mahber-theme", next);
  }

  async function handleLogout() {
    await fetch("/api/auth/tiktok/logout", { method: "POST" });
    setProfile(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("mahber-profile-cache");
    }
    toast("Logged out from TikTok");
  }

  async function handleJoin(id, event) {
    const target = mahbers.find((x) => x.id === id);
    if (!target?.slug) {
      toast("Mahber route is missing");
      return;
    }

    try {
      const res = await fetch("/api/mahbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "interact",
          slug: target.slug,
          kind: "join",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data?.error === "login_required") {
          toast("Login required to join");
          return;
        }
        toast(data?.error || "Failed to update join");
        return;
      }

      const joinedNow = Boolean(data?.active);
      const nextItem = data?.item || {};

      setMahbers((prev) => {
        const next = prev.map((m) => {
          if (m.id !== id && m.slug !== target.slug) return m;
          return {
            ...m,
            members: Number(nextItem.members ?? m.members),
            heat: Number(nextItem.heat ?? m.heat),
            joinCount: Number(nextItem.joinCount ?? m.joinCount),
            joined: joinedNow,
          };
        });
        persistFeedCache(next);
        return next;
      });

      if (typeof window !== "undefined" && profile?.username) {
        const key = `mahber-actions:${target.slug}:${profile.username}`;
        let boosted = false;
        try {
          boosted = Boolean(JSON.parse(localStorage.getItem(key) || "{}").boosted);
        } catch {
          boosted = false;
        }
        localStorage.setItem(key, JSON.stringify({ joined: joinedNow, boosted }));
      }

      if (joinedNow) {
        spawnGem("+80 💎", "yellow", event);
        toast(`🔥 Welcome to ${target.name}!`);
      } else {
        spawnGem("-80 💎", "red", event);
        toast(`Left ${target.name}`);
      }
    } catch {
      toast("Failed to update join");
    }
  }

  function handleBoost(id, event) {
    const m = mahbers.find(x => x.id === id);
    setMahbers(prev => prev.map(x => x.id !== id ? x : {
      ...x,
      boosted: !x.boosted,
      heat: x.boosted ? Math.max(0, x.heat - 500) : x.heat + 500,
    }));
    if (m?.boosted) {
      spawnGem("-500 💎", "red", event);
      toast(`Unboosted ${m.name}`);
    } else {
      spawnGem("+500 💎", "cyan", event);
      toast("⚡ BOOSTED! +500 heat added!");
    }
  }

  function handleVote(mahberId, pollId, optIdx, event) {
    setMahbers(prev => prev.map(m => {
      if (m.id !== mahberId) return m;
      return {
        ...m, heat: m.heat + 40,
        polls: m.polls.map(p => p.id !== pollId || p.voted !== null ? p : {
          ...p, voted: optIdx,
          opts: p.opts.map((o, i) => i === optIdx ? { ...o, v: o.v + 1 } : o)
        })
      };
    }));
    fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "poll",
        targetId: `${mahberId}:${pollId}`,
        option: optIdx,
        username: profile?.username || null,
      }),
    }).catch(() => {});
    spawnGem("+40 💎", "green", event);
    toast("🗳️ Vote locked in!");
  }


  function handleWarVote(side, event) {
    if (warJustVoted) return;
    setWarVotes(prev => ({ ...prev, [side]: prev[side] + 1 + Math.floor(Math.random() * 5) }));
    setWarJustVoted(side);
    fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "war",
        targetId: "weekly-war",
        side,
        username: profile?.username || null,
      }),
    }).catch(() => {});
    spawnGem("War Vote 💎", side === "a" ? "red" : "green", event);
    toast(side === "a" ? "🔴 Arsenal Mahber gets your vote!" : "💘 Habesha Singles gets your vote!");
  }


  function fmtCountdown(s) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
  }

  const detailMahber = mahbers.find(m => m.id === detailId);
  const allTags = ["all", "football", "culture", "love", "comedy", "dating"];
  const tagColors = ["var(--yellow)", "var(--red)", "var(--green)", "var(--fire)", "#CC00FF", "#0099FF"];

  const filtered = mahbers
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    .filter(m => filterTag === "all" || m.tags?.includes(filterTag))
    .sort((a, b) => b.heat - a.heat);

  const warTotal = warVotes.a + warVotes.b;
  const warPctA = Math.round((warVotes.a / warTotal) * 100);
  const warPctB = 100 - warPctA;

  if (detailId && detailMahber) {
    const tier = getTier(detailMahber.heat);
    return (
      <>
        <style>{CSS}</style>
        <div className="gem-layer">
          {gems.map((g) => (
            <div key={g.id} className={`gem-pop ${g.tone}`} style={{ left: g.x, top: g.y }}>{g.label}</div>
          ))}
        </div>
        <div className="detail-wrap">
          <div className="detail-nav">
            <button className="back-btn" onClick={() => setDetailId(null)}>← Back</button>
            <div className="detail-nav-title">{detailMahber.name}</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <TikTokAuthButton profile={profile} />
              <button className="btn-icon" style={{ borderRadius: 10 }} onClick={() => setShareModal(detailMahber)}>📤</button>
            </div>
          </div>
          <div style={{ height: 3, background: `linear-gradient(90deg,${ET_RED},${ET_YELLOW},${ET_GREEN})` }} />

          <div className="detail-hero">
            <div className="detail-top">
              <div className="detail-emoji">{detailMahber.emoji}</div>
              <div>
                <div className="detail-name">{detailMahber.name}</div>
                <div className="detail-creator">{detailMahber.badge} @{detailMahber.creator}</div>
              </div>
            </div>
            <div className="detail-desc">{detailMahber.desc}</div>
            <div className="detail-stats">
              <div className="dstat"><div className="dstat-v" style={{ color: ET_YELLOW }}>{fmt(detailMahber.members)}</div><div className="dstat-l">Members</div></div>
              <div className="dstat"><div className="dstat-v" style={{ color: tier.color }}>{fmtHeat(detailMahber.heat)}</div><div className="dstat-l">Heat</div></div>
              <div className="dstat"><div className="dstat-v" style={{ color: ET_GREEN }}>{detailMahber.warWins}</div><div className="dstat-l">War Wins</div></div>
              <div className="dstat"><div className="dstat-v">{tier.icon}</div><div className="dstat-l">{tier.name}</div></div>
            </div>
            <div className="detail-btns">
              <button className={`btn btn-join btn-big ${detailMahber.joined ? "on" : ""}`} onClick={(e) => handleJoin(detailMahber.id, e)}>
                {detailMahber.joined ? "✓ Joined" : "+ Join Mahber"}
              </button>
              {!detailMahber.boosted && (
                <button className="btn btn-icon btn-big" onClick={(e) => handleBoost(detailMahber.id, e)}>⚡ Boost</button>
              )}
              <button className="btn btn-icon btn-big" onClick={() => window.open(detailMahber.tiktok, "_blank")}>▶ TikTok</button>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-head">🗳️ ACTIVE POLLS</div>
            {detailMahber.polls.map(poll => {
              const total = poll.opts.reduce((s, o) => s + o.v, 0);
              return (
                <div className="poll-card" key={poll.id}>
                  <div className="poll-q">{poll.q}</div>
                  {poll.opts.map((opt, i) => {
                    const pct = total ? Math.round((opt.v / total) * 100) : 0;
                    return (
                      <div key={i} className={`poll-opt ${poll.voted === i ? "voted" : ""}`} onClick={(e) => handleVote(detailMahber.id, poll.id, i, e)}>
                        <div className="poll-fill" style={{ width: poll.voted !== null ? `${pct}%` : "0%" }} />
                        <span className="poll-opt-text">{opt.l}{poll.voted !== null ? ` (${fmt(opt.v)})` : ""}</span>
                        {poll.voted !== null && <span className="poll-pct">{pct}%</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="detail-section">
            <div className="section-head">🏆 LEADERBOARD</div>
            {detailMahber.lb.map((e, i) => (
              <div className="lb-row" key={e.n}>
                <div className="lb-pos">{i + 1}</div>
                <div className="lb-badge">{e.b}</div>
                <div className="lb-name">{e.n}</div>
                <div className="lb-pts">{fmt(e.p)} pts</div>
              </div>
            ))}
          </div>

          <div className="tiktok-block">
            <h3>🎬 WATCH ON TIKTOK</h3>
            <p>All the latest videos, reactions & collabs from {detailMahber.name}</p>
            <button className="btn-tiktok-big" onClick={() => window.open(detailMahber.tiktok, "_blank")}>Open on TikTok →</button>
          </div>

          {shareModal && (() => {
            const t = getTier(shareModal.heat);
            return (
              <div className="modal-overlay" onClick={() => setShareModal(null)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => setShareModal(null)}>✕</button>
                  <div className="modal-title">SHARE MAHBER</div>
                  <div className="share-card" style={{ background: `linear-gradient(135deg,var(--s1),#0A0A12)`, border: `2px solid ${t.color}`, boxShadow: `0 0 32px ${t.glow}` }}>
                    <div style={{ fontSize: 48 }}>{shareModal.emoji}</div>
                    <div className="share-card-name" style={{ color: t.color }}>{shareModal.name}</div>
                    <div className="share-card-stat">{fmt(shareModal.members)} members · {fmtHeat(shareModal.heat)}</div>
                    <div className="share-card-tier" style={{ background: `${t.color}20`, color: t.color }}>{t.icon} {t.name} TIER</div>
                    <div className="share-card-site">mahber.social 🇪🇹</div>
                  </div>
                  <div className="share-btns">
                    <button className="share-btn share-tiktok" onClick={() => { window.open(shareModal.tiktok || "https://tiktok.com", "_blank"); setShareModal(null); }}>▶ Open TikTok</button>
                    <button className="share-btn share-copy" onClick={async () => {
                      const key = getMahberRouteKey(shareModal);
                      const link = key ? `${window.location.origin}/mahber/${key}` : window.location.origin;
                      try {
                        await navigator.clipboard.writeText(link);
                        toast("🔗 Link copied!");
                      } catch {
                        toast(link);
                      }
                      setShareModal(null);
                    }}>🔗 Copy Link</button>
                  </div>
                </div>
              </div>
            );
          })()}

          {toastMsg && <div className="toast">{toastMsg}</div>}

          <ProfileDock
            profile={profile}
            onCreate={() => setTab("create")}
            onProfile={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/user";
              }
            }}
            onLogout={handleLogout}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="gem-layer">
        {gems.map((g) => (
          <div key={g.id} className={`gem-pop ${g.tone}`} style={{ left: g.x, top: g.y }}>{g.label}</div>
        ))}
      </div>
      <div className="app">
        <nav className="nav">
          <div>
            <div className="logo">MAHBER<span className="logo-sub">🇪🇹 ETHIOPIAN MAHBERS</span></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <TikTokAuthButton profile={profile} />
          </div>
        </nav>

        <div className="tabs">
          {[
            ["feed", "🔥 Feed"],
            ["wars", "⚔️ Wars"],
            ["trending", "📈 Trending"],
            ...(profile ? [["create", "➕ Create"]] : []),
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {toastMsg && <div className="toast">{toastMsg}</div>}

        {/* ── FEED ── */}
        {tab === "feed" && (
          <>
            <div className="feed-header">
              <div className="feed-title">THE HOME OF<br />ETHIOPIAN<br />MAHBERS</div>
              <div className="feed-sub">Join • Vote • Vibe on TikTok 🔥</div>
              <div className="search-row">
                <input className="search" placeholder="🔍  Search mahbers..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="tag-strip">
                {allTags.map((tag, i) => (
                  <button key={tag} className="tag-btn"
                    style={{ background: filterTag === tag ? tagColors[i] : "transparent", color: filterTag === tag ? "#000" : "var(--muted)", borderColor: filterTag === tag ? tagColors[i] : "var(--border)", fontWeight: filterTag === tag ? 800 : 600 }}
                    onClick={() => setFilterTag(tag)}>
                    {tag === "all" ? "🌍 All" : tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid">
              {filtered.map((m) => {
                const tier = getTier(m.heat);
                return (
                  <div key={m.id} className="card"
                    style={{ boxShadow: "none" }}
                    onClick={() => {
                      const key = getMahberRouteKey(m);
                      if (!key) {
                        toast("Mahber route is missing");
                        return;
                      }
                      window.location.href = `/mahber/${key}`;
                    }}>
                    <div className="card-stripe" style={{ background: `linear-gradient(90deg,${ET_RED},${ET_YELLOW},${ET_GREEN})` }} />
                    <div className="card-body">
                      <div className="card-top">
                        <div className="card-emoji">{m.emoji}</div>
                        <div className="tier-badge"><div className="heat-val" style={{ color: tier.color }}>{fmtHeat(m.heat)}</div></div>
                      </div>
                      <div className="card-name">
                        {m.name} {m.verified ? <span style={{ color: "#2ea6ff", fontSize: 16, marginLeft: 4 }}>✓</span> : null}
                      </div>
                      <div className="card-creator">{m.badge} @{m.creator}</div>
                      <div className="card-stats">
                        <div className="cstat"><div className="cstat-v" style={{ color: ET_YELLOW }}>{fmt(m.members)}</div><div className="cstat-l">Members</div></div>
                        <div className="cstat"><div className="cstat-v" style={{ color: tier.color }}>{m.polls.length}</div><div className="cstat-l">Polls</div></div>
                        <div className="cstat"><div className="cstat-v" style={{ color: ET_GREEN }}>{m.warWins}</div><div className="cstat-l">War Wins</div></div>
                      </div>
                      <div className="card-btns">
                        <button className={`btn btn-join ${m.joined ? "on" : ""}`} onClick={e => { e.stopPropagation(); handleJoin(m.id, e); }}>
                          {m.joined ? "✓ Joined" : "+ Join"}
                        </button>
                        <button className="btn btn-icon" onClick={e => { e.stopPropagation(); setShareModal(m); }}>📤</button>
                        <button className="btn btn-icon" onClick={e => {
                          e.stopPropagation();
                          const key = getMahberRouteKey(m);
                          if (!key) {
                            toast("Mahber route is missing");
                            return;
                          }
                          window.location.href = `/mahber/${key}`;
                        }}>↗</button>
                        <button className="btn btn-icon" onClick={e => { e.stopPropagation(); window.open(m.tiktok, "_blank"); }}>▶</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── WARS ── */}
        {tab === "wars" && (
          <div className="wars-wrap">
            <div className="section-title-big" style={{ background: `linear-gradient(90deg,${ET_RED},${ET_YELLOW})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MAHBER<br />WARS ⚔️</div>
            <div className="section-sub">Weekly battle — community decides everything. Winner gets crowned 👑</div>

            <div className="war-card">
              <div className="war-top">
                <span className="war-label">⚔️ BATTLE OF THE WEEK</span>
                <span className="war-timer">⏱ {fmtCountdown(warCountdown)}</span>
              </div>
              <div className="war-body">
                <div className="war-fighters">
                  <div className="fighter">
                    <div className="fighter-emoji">🔴</div>
                    <div className="fighter-name">Arsenal Mahber</div>
                    <div className="fighter-votes">{fmt(warVotes.a)} votes</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div className="vs-badge">VS</div>
                  </div>
                  <div className="fighter">
                    <div className="fighter-emoji">💘</div>
                    <div className="fighter-name">Habesha Singles</div>
                    <div className="fighter-votes">{fmt(warVotes.b)} votes</div>
                  </div>
                </div>
                <div className="war-bar-wrap">
                  <div className="war-bar-a" style={{ width: `${warPctA}%` }} />
                  <div className="war-bar-b" style={{ width: `${warPctB}%` }} />
                </div>
                <div className="war-pcts">
                  <span style={{ color: ET_RED, fontFamily: "'Black Han Sans',sans-serif", fontSize: 14 }}>{warPctA}% 🔴</span>
                  <span style={{ color: ET_GREEN, fontFamily: "'Black Han Sans',sans-serif", fontSize: 14 }}>💘 {warPctB}%</span>
                </div>
                <div className="war-btns">
                  <button className={`war-btn war-btn-a ${warJustVoted ? "voted-state" : ""}`} onClick={(e) => handleWarVote("a", e)}>
                    {warJustVoted === "a" ? "✓ Voted!" : "Vote Arsenal 🔴"}
                  </button>
                  <button className={`war-btn war-btn-b ${warJustVoted ? "voted-state" : ""}`} onClick={(e) => handleWarVote("b", e)}>
                    {warJustVoted === "b" ? "✓ Voted!" : "Vote Singles 💘"}
                  </button>
                </div>
              </div>
            </div>

            <div className="past-wars-title">PAST WARS</div>
            {[
              { winner: "Arsenal Mahber 🔴", vs: "Chelsea Mahber 🔵", score: "61%-39%" },
              { winner: "Comedy Club 😂", vs: "Real Madrid ⚪", score: "58%-42%" },
              { winner: "Buna Ceremony ☕", vs: "Man City 🩵", score: "54%-46%" },
            ].map((w, i) => (
              <div className="past-row" key={i}>
                <div><div className="past-winner">🏆 {w.winner}</div><div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>vs {w.vs}</div></div>
                <div className="past-score">{w.score}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── TRENDING ── */}
        {tab === "trending" && (
          <div className="trend-wrap">
            <div className="section-title-big" style={{ background: `linear-gradient(90deg,${FIRE},${ET_YELLOW})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TRENDING<br />NOW 📈</div>
            <div className="section-sub">Real-time heat rankings — updates every few seconds.</div>
            {[...mahbers].sort((a, b) => b.heat - a.heat).map((m, i) => {
              const tier = getTier(m.heat);
              const maxHeat = mahbers.reduce((mx, x) => Math.max(mx, x.heat), 0);
              const pct = Math.round((m.heat / maxHeat) * 100);
              return (
                <div key={m.id} className="rank-row" style={{ borderLeftColor: tier.color }} onClick={() => {
                  const key = getMahberRouteKey(m);
                  if (!key) {
                    toast("Mahber route is missing");
                    return;
                  }
                  window.location.href = `/mahber/${key}`;
                }}>
                  <div className={`rank-num ${i < 3 ? "top3" : ""}`}>#{i + 1}</div>
                  <div className="rank-emoji">{m.emoji}</div>
                  <div className="rank-info">
                    <div className="rank-name">{m.name}</div>
                    <div className="rank-heat-text">{fmtHeat(m.heat)} · {fmt(m.members)} members</div>
                    <div className="heat-bar-bg"><div className="heat-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${tier.color},${tier.color}88)` }} /></div>
                  </div>
                  <div className="rank-tier-badge" style={{ background: `${tier.color}20`, color: tier.color }}>{tier.icon} {tier.name}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CREATE ── */}
        {tab === "create" && (
          <div className="create-wrap">
            <div className="section-title-big" style={{ background: `linear-gradient(90deg,${ET_GREEN},${ET_YELLOW})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>START YOUR<br />MAHBER ➕</div>
            <div className="section-sub">Build your tribe. Your rules. Your TikTok.</div>

            {createDone ? (
              <div className="create-success">
                <div className="create-success-emoji">{createForm.emoji}</div>
                <h2>MAHBER IS LIVE! 🔥</h2>
                <p>"{createForm.name}" has been created.<br />Share it on TikTok and watch your tribe grow.</p>
                <br />
                <button className="btn-create" style={{ maxWidth: 240, margin: "0 auto", display: "block" }}
                  onClick={() => { setCreateDone(false); setCreateForm({ name: "", emoji: "🔥", desc: "" }); }}>
                  Create Another ➕
                </button>
              </div>
            ) : (
              <>
                {createForm.name && (
                  <div className="create-preview">
                    <div style={{ fontSize: 32, marginBottom: 6 }}>{createForm.emoji}</div>
                    <div style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: 20, letterSpacing: 1, marginBottom: 4 }}>{createForm.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{createForm.desc || "Your description here..."}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center", fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>
                      <span style={{ color: ET_GREEN }}>🪨 ASH TIER</span>
                      <span>· 0 members · 0 🔥 heat</span>
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Mahber Name</label>
                  <input className="form-input" placeholder="e.g. Tej Bet Crew, Addis Fashion Mahber..." value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pick an Emoji</label>
                  <div className="emoji-row">
                    {emojiOptions.map(e => (
                      <span key={e} className={`emoji-opt ${createForm.emoji === e ? "on" : ""}`} onClick={() => setCreateForm(f => ({ ...f, emoji: e }))}>{e}</span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" placeholder="What's your mahber about? Who's it for?" value={createForm.desc} onChange={e => setCreateForm(f => ({ ...f, desc: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">TikTok Link (optional)</label>
                  <input className="form-input" placeholder="https://tiktok.com/@yourmahber" value={createForm.tiktok} onChange={e => setCreateForm(f => ({ ...f, tiktok: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Telegram Link (optional)</label>
                  <input className="form-input" placeholder="https://t.me/yourmahber" value={createForm.telegram} onChange={e => setCreateForm(f => ({ ...f, telegram: e.target.value }))} />
                </div>
                <button
                  className="btn-create"
                  onClick={async () => {
                    if (!createForm.name) {
                      toast("Add a name first!");
                      return;
                    }
                    try {
                      const res = await fetch("/api/mahbers", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: createForm.name,
                          emoji: createForm.emoji,
                          desc: createForm.desc,
                          tiktok: createForm.tiktok,
                          telegram: createForm.telegram,
                        }),
                      });

                      const data = await res.json();
                      if (!res.ok) {
                        if (data?.error === "login_required") {
                          toast("Login with TikTok to create a mahber");
                        } else if (data?.error === "slug_exists") {
                          toast("A mahber with this name already exists");
                        } else {
                          toast("Failed to save mahber. Try again.");
                        }
                        return;
                      }
                      const item = data?.item;

                      if (item) {
                        setMahbers((prev) => [
                          {
                            id: item.id,
                            slug: item.slug || slugify(item.name),
                            name: item.name,
                            emoji: item.emoji || createForm.emoji,
                            creator: item.creator || "guest",
                            ownerUsername: item.ownerUsername || profile?.username || "",
                            badge: "🆕",
                            members: item.members || 1,
                            heat: item.heat || 120,
                            joined: false,
                            boosted: false,
                            tiktok: item.tiktok || createForm.tiktok || "https://tiktok.com",
                            telegram: item.telegram || createForm.telegram || "",
                            desc: item.desc || createForm.desc,
                            tags: ["community"],
                            warWins: 0,
                            joinCount: item.joinCount || 0,
                            boostPoints: item.boostPoints || 0,
                            polls: [],
                            lb: [],
                          },
                          ...prev,
                        ]);
                      }

                      setCreateDone(true);
                      setTab("feed");
                      spawnGem("Mahber +120 💎", "yellow");
                      toast("Mahber created and added to feed");
                      setCreateForm({ name: "", emoji: "🔥", desc: "", tiktok: "", telegram: "" });
                    } catch {
                      toast("Failed to save mahber. Try again.");
                    }
                  }}
                >
                  🔥 Launch My Mahber
                </button>
              </>
            )}
          </div>
        )}

        {/* SHARE MODAL */}
        {shareModal && (() => {
          const t = getTier(shareModal.heat);
          return (
            <div className="modal-overlay" onClick={() => setShareModal(null)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setShareModal(null)}>✕</button>
                <div className="modal-title">SHARE MAHBER</div>
                <div className="share-card" style={{ background: "linear-gradient(135deg,var(--s1),#0A0A12)", border: `2px solid ${t.color}`, boxShadow: `0 0 32px ${t.glow}` }}>
                  <div style={{ fontSize: 48 }}>{shareModal.emoji}</div>
                  <div className="share-card-name" style={{ color: t.color }}>{shareModal.name}</div>
                  <div className="share-card-stat">{fmt(shareModal.members)} members · {fmtHeat(shareModal.heat)}</div>
                  <div className="share-card-tier" style={{ background: `${t.color}20`, color: t.color }}>{t.icon} {t.name} TIER</div>
                  <div className="share-card-site">mahber.social 🇪🇹</div>
                </div>
                <div className="share-btns">
                  <button className="share-btn share-tiktok" onClick={() => { window.open(shareModal.tiktok || "https://tiktok.com", "_blank"); setShareModal(null); }}>▶ Open TikTok</button>
                  <button className="share-btn share-copy" onClick={async () => {
                    const key = getMahberRouteKey(shareModal);
                    const link = key ? `${window.location.origin}/mahber/${key}` : window.location.origin;
                    try {
                      await navigator.clipboard.writeText(link);
                      toast("🔗 Link copied!");
                    } catch {
                      toast(link);
                    }
                    setShareModal(null);
                  }}>🔗 Copy Link</button>
                </div>
              </div>
            </div>
          );
        })()}

        <ProfileDock
          profile={profile}
          onCreate={() => setTab("create")}
          onLogin={() => {
            window.location.href = "/login";
          }}
          onProfile={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/user";
            }
          }}
          onLogout={handleLogout}
        />
      </div>
    </>
  );
}
