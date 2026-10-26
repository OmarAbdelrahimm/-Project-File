from __future__ import annotations
import math, re, subprocess
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
import arabic_reshaper
from bidi.algorithm import get_display

ROOT=next(p for p in Path(__file__).resolve().parents if (p/'.git').exists())
OUT=ROOT/'brand'/'v3'/'00_Approval_Preview'
AS=OUT/'assets'; SRC=OUT/'src'; AS.mkdir(parents=True,exist_ok=True); SRC.mkdir(parents=True,exist_ok=True)
FONTS={
 'amiri': SRC/'fonts'/'Amiri-Bold.ttf',
 'plex': SRC/'fonts'/'IBMPlexSansArabic-Bold.ttf',
 'plex-med': SRC/'fonts'/'IBMPlexSansArabic-Medium.ttf',
}
COL={'navy':'#122536','navy2':'#1B3448','charcoal':'#171A1D','graphite':'#20262A','gold':'#D8B46E','gold2':'#B78E45','ivory':'#F4EFE5','stone':'#B8B0A1','muted':'#87949C','white':'#FFFFFF','ink':'#1C2730','blueprint':'#8FA8B9'}
_cache={}
def fontdata(path):
 k=str(path)
 if k not in _cache:
  f=TTFont(str(path)); _cache[k]=(f,f.getGlyphSet(),f.getBestCmap(),f['hmtx'].metrics,f['head'].unitsPerEm)
 return _cache[k]
def text_paths(text,x,y,size,color,font='plex',anchor='middle',rtl=True,opacity=1):
 fp=FONTS[font]; f,glyphset,cmap,hmtx,upem=fontdata(fp)
 visual=get_display(arabic_reshaper.reshape(text),base_dir='R') if rtl else text
 seq=[]; width=0
 for ch in visual:
  gn=cmap.get(ord(ch),'.notdef'); adv=hmtx.get(gn,(upem*0.55,0))[0]; seq.append((gn,adv)); width+=adv*size/upem
 if anchor=='middle': cursor=x-width/2
 elif anchor=='end': cursor=x-width
 else: cursor=x
 paths=[]; scale=size/upem
 for gn,adv in seq:
  if gn!='.notdef':
   pen=SVGPathPen(glyphset); glyphset[gn].draw(pen); d=pen.getCommands()
   if d: paths.append(f'<path d="{d}" transform="translate({cursor:.3f} {y:.3f}) scale({scale:.6f} {-scale:.6f})" fill="{color}" opacity="{opacity}"/>')
  cursor+=adv*scale
 return ''.join(paths)
def txt(text,x,y,size,color,font='plex',anchor='middle',rtl=True,opacity=1):
 return text_paths(text,x,y,size,color,font,anchor,rtl,opacity)
def svg(w,h,body,defs=''):
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><defs>{defs}</defs>{body}</svg>'
def save_svg(name,w,h,body,defs=''):
 p=AS/(name+'.svg');p.write_text(svg(w,h,body,defs),encoding='utf-8');return p
def rect(x,y,w,h,fill,rx=0,stroke=None,sw=1,opacity=1):
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="{sw}"' if stroke else '')+f' opacity="{opacity}"/>'
def line(x1,y1,x2,y2,c,sw=2,op=1,dash=None):
 return f'<path d="M{x1} {y1} L{x2} {y2}" fill="none" stroke="{c}" stroke-width="{sw}" opacity="{op}"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>'
def grid(w,h,step=80,c='#89A5B9',op=.12):
 bits=[]
 for x in range(0,w+1,step):bits.append(line(x,0,x,h,c,1,op))
 for y in range(0,h+1,step):bits.append(line(0,y,w,y,c,1,op))
 return ''.join(bits)
def mark(cx,cy,size,fg,gold,concept='A',line_gold=True):
 # Official OA: O is a fully closed curved ring; A is open, with two feet and its own horizontal crossbar.
 s=size/128; group=[f'<g transform="translate({cx-size/2:.2f} {cy-size/2:.2f}) scale({s:.6f})" style="filter:drop-shadow(0px 7px 5px rgba(0,0,0,.42))">']
 # Optional contextual framing is kept behind, never fused into the letters.
 if concept=='B':
  group.append(f'<path d="M25 20 H82 L104 42 V102 H25 Z" fill="{COL["graphite"]}" stroke="{gold}" stroke-width="4" stroke-linejoin="round"/>')
  group.append(f'<path d="M82 20 V42 H104" fill="none" stroke="{gold}" stroke-width="4"/>')
 elif concept=='C':
  group.append(f'<rect x="16" y="12" width="96" height="100" rx="7" fill="none" stroke="{gold}" stroke-width="3"/>')
  for x in (32,48,64,80,96): group.append(f'<path d="M{x} 16 V108" stroke="{gold}" stroke-width="1" opacity=".18"/>')
  for y in (28,44,60,76,92): group.append(f'<path d="M20 {y} H108" stroke="{gold}" stroke-width="1" opacity=".18"/>')
 o='M27.5 77.1V53.4C27.5 34.7 35.2 26.1 50.9 26.1S74.2 34.7 74.2 53.4V77.1C74.2 84.5 70.4 88.3 63 88.3H38.7C31.4 88.3 27.5 84.5 27.5 77.1ZM37.3 76.6C37.3 78.8 38 79.8 40.5 79.8H61.3C63.5 79.8 64.5 78.8 64.5 76.6V53.8C64.5 41.1 60.8 35.8 50.9 35.8S37.3 41.1 37.3 53.8Z'
 a='M72.6 88.3L87.8 30.1Q89.1 25.3 93.6 25.3Q98.1 25.3 99.4 30.1L114.6 88.3H104L100.6 74.1H86.6L83.2 88.3Z M87.7 63.8L93.6 42.2L99.5 63.8Z'
 group.append(f'<path fill-rule="evenodd" d="{o}" transform="translate(1.5 2.2)" fill="{COL["gold2"]}" opacity=".76"/>')
 group.append(f'<path fill-rule="evenodd" d="{o}" fill="{fg}"/>')
 group.append(f'<path fill-rule="evenodd" d="{a}" fill="{fg}"/>')
 group.append(f'<path d="M85.3 65.9H102" stroke="{gold}" stroke-width="3.5" stroke-linecap="square"/>')
 group.append('</g>');return ''.join(group)
def bg_defs(a,b):
 return f'<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient><linearGradient id="paper" x1="0" y1="0" x2="0.8" y2="1"><stop stop-color="#FFFFFF"/><stop offset="1" stop-color="{COL["ivory"]}"/></linearGradient><filter id="shadow" x="-30%" y="-30%" width="160%" height="180%"><feGaussianBlur stdDeviation="18"/></filter>'
def round_bg(w,h,light=False):
 return rect(0,0,w,h,'url(#paper)' if light else 'url(#bg)',max(12,int(min(w,h)*.035)) )
def file_scene(w,h):
 # Separate reveal motif: isometric open project folder with schematic sheet; not used as avatar.
 bits=[round_bg(w,h),grid(w,h,max(32,int(min(w,h)/20)),COL['blueprint'],.08)]
 # cast shadow, open tray and raised cover
 bits += [f'<ellipse cx="{w*.5:.0f}" cy="{h*.74:.0f}" rx="{w*.30:.0f}" ry="{h*.075:.0f}" fill="#000" opacity=".28" filter="url(#shadow)"/>']
 bits += [f'<path d="M{w*.20:.0f} {h*.62:.0f} L{w*.35:.0f} {h*.45:.0f} H{w*.76:.0f} L{w*.82:.0f} {h*.62:.0f} V{h*.78:.0f} H{w*.20:.0f} Z" fill="{COL["navy2"]}" stroke="{COL["gold"]}" stroke-width="{max(3,w*.003):.1f}"/>']
 bits += [f'<path d="M{w*.24:.0f} {h*.58:.0f} L{w*.40:.0f} {h*.25:.0f} L{w*.78:.0f} {h*.40:.0f} L{w*.65:.0f} {h*.65:.0f} Z" fill="{COL["navy"]}" stroke="{COL["gold"]}" stroke-width="{max(3,w*.003):.1f}"/>']
 bits += [f'<path d="M{w*.35:.0f} {h*.56:.0f} L{w*.44:.0f} {h*.38:.0f} L{w*.67:.0f} {h*.46:.0f} L{w*.59:.0f} {h*.64:.0f} Z" fill="#E6E2D9" stroke="{COL["gold2"]}" stroke-width="4"/>']
 for i in range(3): bits.append(f'<path d="M{w*(.425+i*.055):.0f} {h*.46:.0f} L{w*(.60+i*.01):.0f} {h*(.50+i*.055):.0f}" stroke="{COL["navy2"]}" stroke-width="3" opacity=".68"/>')
 bits.append(f'<circle cx="{w*.5:.0f}" cy="{h*.53:.0f}" r="{max(5,w*.008):.1f}" fill="{COL["gold"]}"/>')
 return ''.join(bits)
# Copy the explicitly approved OA avatar master; keep its approved geometry and proportions unchanged.
approved_avatar=ROOT/'brand'/'assets'/'avatar-oa-corrected-800.svg'
(AS/'avatar-oa-corrected-800.svg').write_bytes(approved_avatar.read_bytes())

# Open-file schematic scene, preserved as a separate visual element.
save_svg('open-file-blueprint-scene',1920,1080,file_scene(1920,1080),bg_defs(COL['navy'],COL['charcoal']))

# Logo lockups: symbol plus Arabic name, multiple surfaces and monochrome versions.
for variant,bg,fg,accent,label in [
 ('color-on-light',COL['ivory'],COL['navy'],COL['gold'],'color'),
 ('color-on-dark',COL['navy'],COL['ivory'],COL['gold'],'color'),
 ('mono-on-light',COL['ivory'],COL['charcoal'],COL['charcoal'],'mono'),
 ('mono-on-dark',COL['charcoal'],COL['ivory'],COL['ivory'],'mono')]:
 body=rect(0,0,1600,420,bg,0)
 body+=mark(235,208,260,fg,accent,'A')
 body+=txt('ملف المشروع',1270,205,96,fg,'amiri','end')
 body+=line(735,252,1265,252,accent,5,.95)
 body+=txt('قراءة هندسية للمشاريع والبنية التحتية',1270,325,34,fg,'plex-med','end')
 save_svg('logo-horizontal-'+variant,1600,420,body,bg_defs(bg,bg))

# Banner final and safe-area guide.
w,h=2560,1440
body=round_bg(w,h)+grid(w,h,80,COL['blueprint'],.13)
# Dim technical drawing planes and small gold datum markers.
body+=f'<path d="M120 1130 L740 470 L1250 720 L650 1240 Z" fill="{COL["navy2"]}" opacity=".55" stroke="{COL["gold"]}" stroke-width="5"/><path d="M1480 280 L2240 490 L1980 1190 L1390 880 Z" fill="{COL["graphite"]}" opacity=".60" stroke="{COL["blueprint"]}" stroke-width="4"/>'
for x,y in [(250,980),(2170,950),(530,360),(2070,330)]: body+=f'<circle cx="{x}" cy="{y}" r="9" fill="{COL["gold"]}"/>'
body+=mark(1280,620,180,COL['ivory'],COL['gold'],'C')
body+=txt('ملف المشروع',1280,790,96,COL['ivory'],'amiri')
body+=line(990,835,1570,835,COL['gold'],5)
body+=txt('قراءة هندسية للمشاريع والبنية التحتية',1280,886,40,COL['ivory'],'plex-med')
save_svg('youtube-channel-banner',w,h,body,bg_defs(COL['navy'],COL['charcoal']))
guide=body+f'<rect x="507" y="508.5" width="1546" height="423" fill="none" stroke="#FF6B6B" stroke-width="5" stroke-dasharray="22 14" opacity=".9"/>'+txt('SAFE AREA 1546 × 423',1280,545,22,'#FF6B6B','plex',rtl=False)
save_svg('youtube-channel-banner-safe-area-guide',w,h,guide,bg_defs(COL['navy'],COL['charcoal']))

# YouTube thumbnails A/B.
def thumbnail(which):
 w,h=1280,720; body=round_bg(w,h)+grid(w,h,55,COL['blueprint'],.12)
 if which=='A':
  body+=f'<path d="M760 140 H1170 V560 H760 Z" fill="{COL["charcoal"]}" stroke="{COL["gold"]}" stroke-width="6"/><path d="M800 210 H1120 M800 300 H1040 M800 390 H1080 M800 480 H980" stroke="{COL["blueprint"]}" stroke-width="7" opacity=".7"/><path d="M760 140 L720 185 V590 H1135 L1170 560" fill="none" stroke="{COL["gold"]}" stroke-width="6"/>'
  body+=txt('أزمة أم نتيجة؟',390,290,72,COL['ivory'],'amiri','middle')
  body+=txt('من المخطط إلى الموقع',390,375,34,COL['stone'],'plex')
  body+=txt('القصة وراء الأرقام',390,500,28,COL['gold'],'plex')
 else:
  body+=f'<path d="M750 110 H1150 V580 H750 Z" fill="#E3E0D7" stroke="{COL["gold"]}" stroke-width="6"/><path d="M810 190 H1080 M810 260 H1100 M810 330 H970 M810 450 H1100 M810 520 H1030" stroke="{COL["navy2"]}" stroke-width="7"/><circle cx="995" cy="365" r="64" fill="none" stroke="{COL["gold2"]}" stroke-width="8"/><path d="M995 290 V440 M920 365 H1070" stroke="{COL["gold2"]}" stroke-width="4"/>'
  body+=txt('ماذا يقول المخطط؟',390,285,68,COL['ivory'],'amiri')
  body+=txt('الدليل قبل الانطباع',390,375,34,COL['stone'],'plex')
  body+=txt('اقرأ التفاصيل',390,500,28,COL['gold'],'plex')
 body+=mark(1130,93,100,COL['ivory'],COL['gold'],'A')
 body+=line(80,610,1200,610,COL['gold'],5)
 body+=txt('ملف المشروع',1150,670,34,COL['ivory'],'amiri','end')
 return body
for c in ['A','B']: save_svg(f'thumbnail-concept-{c}',1280,720,thumbnail(c),bg_defs(COL['navy'],COL['charcoal']))

# Caption compositions, clean 2D overlays with two short lines.
def caption(vertical=False):
 w,h=(1080,1920) if vertical else (1920,1080)
 body=round_bg(w,h)+grid(w,h,80,COL['blueprint'],.09)
 # minimal 2D contextual geometry, not a 3D card
 body+=f'<path d="M{w*.12:.0f} {h*.22:.0f} H{w*.88:.0f} M{w*.18:.0f} {h*.28:.0f} H{w*.74:.0f}" stroke="{COL["blueprint"]}" stroke-width="3" opacity=".34"/>'
 y=h*.74 if not vertical else h*.76
 x=w*.5; boxw=w*.82; boxh=170 if not vertical else 250
 body+=rect(x-boxw/2,y-boxh/2,boxw,boxh,'#122536',24, COL['gold'],2,.96)
 body+=txt('كل تفصيلة في المشروع',x,y-4,52 if not vertical else 42,COL['ivory'],'plex')
 body+=txt('تغيّر نتيجة التنفيذ',x,y+66,52 if not vertical else 42,COL['gold'],'plex')
 return body
save_svg('caption-in-scene-16x9',1920,1080,caption(False),bg_defs(COL['navy'],COL['charcoal']))
save_svg('caption-in-scene-9x16',1080,1920,caption(True),bg_defs(COL['navy'],COL['charcoal']))

# Shorts/Reels cover 9:16, Instagram post 4:5, Facebook cover.
def social(kind,w,h):
 body=round_bg(w,h)+grid(w,h,max(40,int(min(w,h)/16)),COL['blueprint'],.10)
 body+=f'<path d="M{w*.08:.0f} {h*.78:.0f} L{w*.44:.0f} {h*.22:.0f} L{w*.92:.0f} {h*.54:.0f} L{w*.69:.0f} {h*.88:.0f} Z" fill="{COL["navy2"]}" stroke="{COL["gold"]}" stroke-width="{max(3,w*.003):.1f}" opacity=".55"/>'
 if kind=='shorts':
  body+=mark(w*.5,h*.26,min(w*.34,260),COL['ivory'],COL['gold'],'B')
  body+=txt('من الخطة إلى الموقع',w*.5,h*.56,70,COL['ivory'],'amiri')
  body+=txt('قراءة هندسية للمشاريع',w*.5,h*.62,34,COL['stone'],'plex')
 elif kind=='instagram':
  body+=mark(w*.5,h*.27,230,COL['ivory'],COL['gold'],'C')
  body+=txt('من الخطة إلى الموقع',w*.5,h*.54,72,COL['ivory'],'amiri')
  body+=txt('كيف تُقرأ تفاصيل المشروع؟',w*.5,h*.61,34,COL['stone'],'plex')
 else:
  body+=mark(w*.78,h*.50,190,COL['ivory'],COL['gold'],'A')
  body+=txt('ملف المشروع',w*.46,h*.45,78,COL['ivory'],'amiri')
  body+=txt('قراءة هندسية للمشاريع والبنية التحتية',w*.46,h*.56,35,COL['stone'],'plex')
 return body
save_svg('shorts-reels-cover',1080,1920,social('shorts',1080,1920),bg_defs(COL['navy'],COL['charcoal']))
save_svg('instagram-post-template',1080,1350,social('instagram',1080,1350),bg_defs(COL['navy'],COL['charcoal']))
save_svg('facebook-cover-template',1640,624,social('facebook',1640,624),bg_defs(COL['navy'],COL['charcoal']))

# End-screen guide with only the two allowed YouTube end-screen placement zones.
w,h=1920,1080
body=round_bg(w,h)+grid(w,h,72,COL['blueprint'],.10)
body+=mark(960,260,160,COL['ivory'],COL['gold'],'A')+txt('نقفل الملف…',960,430,74,COL['ivory'],'amiri')
body+=line(240,490,1680,490,COL['gold'],4)
body+=rect(245,585,535,300,'none',14,COL['gold'],4,.9)+rect(1140,600,540,285,'none',135,COL['gold'],4,.9)
body+=txt('اقتراح فيديو',512,920,34,COL['ivory'],'plex')+txt('اشتراك',1410,920,34,COL['ivory'],'plex')
body+=txt('تُضاف العناصر القابلة للنقر من YouTube Studio',960,1000,28,COL['stone'],'plex')
save_svg('youtube-end-screen-template',w,h,body,bg_defs(COL['navy'],COL['charcoal']))

# Seamless technical-grid pattern (no ornament).
w=h=512
pattern=f'<rect width="512" height="512" fill="{COL["navy"]}"/><path d="M0 0 H512 M0 256 H512 M0 512 H512 M0 0 V512 M256 0 V512 M512 0 V512" stroke="{COL["blueprint"]}" stroke-width="2" opacity=".25"/><path d="M0 0 L256 256 L512 0 M0 512 L256 256 L512 512" fill="none" stroke="{COL["gold"]}" stroke-width="2" opacity=".2"/><circle cx="256" cy="256" r="6" fill="{COL["gold"]}" opacity=".65"/>'
save_svg('seamless-blueprint-pattern',w,h,pattern)

# Monochrome transparent channel watermark.
watermark=mark(75,75,120,COL['ivory'],COL['ivory'],'A',False)
save_svg('youtube-channel-watermark',150,150,watermark)

# Write an SVG paths-only verification manifest (all newly generated SVG text is paths, not <text>).
print('Created SVG assets:',len(list(AS.glob('*.svg'))))
# Render every SVG to native PNG using resvg; transparent SVGs remain transparent.
renderer=ROOT/'brand'/'src'/'render_svg_assets.cjs'
subprocess.run(['node',str(renderer),str(AS)],check=True)
# Add avatar size set and thumbnail 168-wide preview images.
from PIL import Image
src=AS/'avatar-oa-corrected-800.png'
im=Image.open(src).convert('RGBA')
for px in (256,98,48,32):
 im.resize((px,px),Image.Resampling.LANCZOS).save(AS/f'avatar-oa-corrected-{px}.png',optimize=True)
for concept in 'AB':
 im=Image.open(AS/f'thumbnail-concept-{concept}.png').convert('RGB')
 im.resize((168,95),Image.Resampling.LANCZOS).save(AS/f'thumbnail-concept-{concept}-preview-168.png',quality=91,optimize=True)
print('Final assets:',len(list(AS.iterdir())))
