import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '@fontsource/amiri/700.css';

const C={navy:'#122536',deep:'#1B3448',gold:'#D8B46E',goldBright:'#FFD36A',ivory:'#F4EFE5',blue:'#8FA8B9',muted:'#AAB6BD',green:'#78C9A1',red:'#E78174'};
const FPS=30, DURATION=43.233;
const stock=staticFile('hook-concrete-stock.jpg');
const voice=staticFile('CASE_001_voiceover_full.mp3');

const CAPTIONS=[
 {s:0.266,e:4.222,w:['نفتح','ملف...','صبّة','خرسانة','فاضل','عليها','دقائق.'],p:[[0.266,1.233,0,2],[1.802,4.222,2,7]]},
 {s:4.682,e:11.129,w:['المضخة','جاهزة،','والحديد','قدامنا،','بس','آخر','اعتماد','مش','ظاهر','في','النسخة','اللي','مع','مهندس','الموقع.'],p:[[4.682,5.755,0,2],[5.986,7.136,2,4],[7.515,11.129,4,15]]},
 {s:11.724,e:16.068,w:['نبدأ','الصب،','ولا','نقف','لحد','ما','نعرف','إحنا','بنبص','على','أنهي','رسمة؟'],p:[[11.724,12.648,0,2],[12.885,16.068,2,12]]},
 {s:17.122,e:23.396,w:['دي','حالة','مركّبة','مستوحاة','من','مواقف','هندسية','متكررة،','مش','واقعة','منسوبة','لمشروع','أو','شركة.'],p:[[17.122,20.771,0,8],[20.982,23.396,8,14]]},
 {s:23.928,e:30.120,w:['هنمشيها','خطوة','خطوة:','إيه','اللي','يتراجع','قبل','الصب،','وإمتى','القرار','الصح','يبقى','إننا','نوقف؟'],p:[[23.928,25.274,0,3],[25.822,27.504,3,8],[27.765,30.120,8,14]]},
 {s:31.016,e:35.538,w:['والهدف','مش','إننا','نعطّل','الموقع،','ولا','إننا','نجري','عشان','المضخة','مستنية.'],p:[[31.016,33.025,0,5],[33.257,35.538,5,11]]},
 {s:35.985,e:42.198,w:['الهدف','إننا','نعرف:','هل','نقاط','الفحص','اتقفلت','واتوثقت','حسب','رسومات','ومواصفات','المشروع؟'],p:[[35.985,37.337,0,3],[37.686,42.198,3,12]]},
];
const SFX=[
 {at:0,file:'sfx/bass-rumble-short.wav',v:.09},
 {at:.82,file:'sfx/writing-marker-draw.wav',v:.13},
 {at:2.62,file:'sfx/foley-paper-slide.wav',v:.14},
 {at:4.682,file:'sfx/mechanical-switch-light.wav',v:.22},
 {at:6.42,file:'sfx/click-button-medium.wav',v:.18},
 {at:8.35,file:'sfx/foley-card-touch.wav',v:.20},
 {at:10.2,file:'sfx/click-button-medium.wav',v:.16},
 {at:11.724,file:'sfx/click-button-soft.wav',v:.25},
 {at:13.35,file:'sfx/mechanical-switch-light.wav',v:.18},
 {at:16.068,file:'sfx/whoosh-medium-soft.wav',v:.18},
 {at:17.122,file:'sfx/foley-card-touch.wav',v:.18},
 {at:18.82,file:'sfx/click-button-medium.wav',v:.17},
 {at:20.55,file:'sfx/mechanical-ratchet-light.wav',v:.11},
 {at:22.45,file:'sfx/writing-pen-tick.wav',v:.13},
 {at:23.928,file:'sfx/click-button-soft.wav',v:.19},
 {at:25.72,file:'sfx/foley-card-touch.wav',v:.17},
 {at:27.000,file:'sfx/tone-ding-mid.wav',v:.16},
 {at:30.120,file:'sfx/foley-paper-slide.wav',v:.16},
 {at:31.016,file:'sfx/mechanical-ratchet-light.wav',v:.12},
 {at:32.7,file:'sfx/click-button-medium.wav',v:.14},
 {at:33.257,file:'sfx/mechanical-switch-light.wav',v:.17},
 {at:34.6,file:'sfx/writing-pen-tick.wav',v:.12},
 {at:35.985,file:'sfx/click-button-soft.wav',v:.18},
 {at:37.686,file:'sfx/writing-marker-draw.wav',v:.12},
 {at:39.55,file:'sfx/foley-paper-slide.wav',v:.13},
 {at:41.08,file:'sfx/click-button-medium.wav',v:.15},
];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const enter=(t,start,d=.28)=>interpolate(t,[start,start+d],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
const weight=(w)=>Math.max(1,Array.from(w.replace(/[^\p{L}\p{N}]/gu,'')).length);
function activeWord(cap,t){
 for(const [a,b,from,to] of cap.p){
  if(t<a||t>=b)continue;
  const ws=cap.w.slice(from,to),total=ws.reduce((n,x)=>n+weight(x),0),target=(t-a)/(b-a)*total;
  let sum=0;for(let i=0;i<ws.length;i++){sum+=weight(ws[i]);if(target<sum)return from+i;}
  return to-1;
 }
 return -1;
}
function Karaoke({time}){
 const c=CAPTIONS.find(x=>time>=x.s&&time<x.e);if(!c)return null;
 const idx=activeWord(c,time),alpha=enter(time,c.s,.12);
 return <div dir="rtl" style={{position:'absolute',left:70,right:70,bottom:23,zIndex:60,display:'flex',justifyContent:'center',opacity:alpha,transform:`translateY(${10*(1-alpha)}px)`,pointerEvents:'none'}}>
  <div style={{width:'100%',maxWidth:1120,minHeight:76,padding:'10px 20px 12px',borderRadius:13,background:'rgba(7,18,27,.95)',border:'1px solid rgba(216,180,110,.75)',boxShadow:'0 10px 28px rgba(0,0,0,.38)',display:'flex',alignItems:'center',justifyContent:'center',flexWrap:'wrap',gap:'2px 7px',fontFamily:'IBM Plex Sans Arabic',fontSize:24,fontWeight:700,lineHeight:1.6,textAlign:'center'}}>
   {c.w.map((w,i)=><span key={`${c.s}-${i}`} style={{display:'inline-block',whiteSpace:'nowrap',color:i===idx?C.goldBright:C.ivory,transform:`scale(${i===idx?1.08:1})`,textShadow:i===idx?'0 0 9px rgba(255,211,106,.72),0 0 18px rgba(255,211,106,.30)':'none',transformOrigin:'center',zIndex:i===idx?2:1}}>{w}</span>)}
  </div>
 </div>;
}
function Background({time,variant=0}){
 const shift=interpolate(time,[0,DURATION],[0,28],{extrapolateRight:'clamp'});
 return <AbsoluteFill style={{background:`linear-gradient(${132+variant*3}deg,#102333 0%,#172E40 55%,#0F2232 100%)`,overflow:'hidden'}}>
  <svg viewBox="0 0 1280 720" preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.25}}>
   <defs><pattern id={`grid-${variant}`} width="48" height="48" patternUnits="userSpaceOnUse"><path d={`M48 0H0V48`} fill="none" stroke={C.blue} strokeWidth="1" strokeOpacity=".18"/></pattern><radialGradient id={`glow-${variant}`}><stop stopColor={C.gold} stopOpacity=".14"/><stop offset="1" stopColor={C.gold} stopOpacity="0"/></radialGradient></defs>
   <rect width="1280" height="720" fill={`url(#grid-${variant})`} transform={`translate(${shift%48},0)`}/><ellipse cx={920-shift} cy="345" rx="480" ry="325" fill={`url(#glow-${variant})`}/>
  </svg>
 </AbsoluteFill>;
}
function ShowSignature({time}){
 const cycle=(time%12)/12,line=cycle<.5?cycle*2:2-cycle*2;
 return <>
  <div style={{position:'absolute',left:34,top:20,zIndex:45,display:'flex',alignItems:'center',gap:10,direction:'ltr',width:330,height:54}}>
   <Img src={staticFile('oa-avatar.svg')} style={{width:38,height:38,borderRadius:8,objectFit:'contain'}}/>
   <div dir="rtl" style={{position:'relative',width:270,color:C.ivory,fontFamily:'IBM Plex Sans Arabic'}}>
    <div style={{fontSize:18,fontWeight:700,lineHeight:1.15}}>ملف المشروع</div><div style={{fontSize:11,color:C.blue,marginTop:4}}>الهندسة • التنفيذ • الجودة</div>
    <div style={{position:'absolute',left:0,bottom:-9,width:210,height:2,background:'rgba(216,180,110,.22)',overflow:'hidden'}}><div style={{position:'absolute',left:`${line*150}px`,top:0,width:60,height:2,background:C.gold,boxShadow:`0 0 8px ${C.gold}`}}/></div>
   </div>
  </div>
  <div dir="rtl" style={{position:'absolute',right:34,top:22,zIndex:45,width:220,height:48,textAlign:'right',color:C.ivory,fontFamily:'IBM Plex Sans Arabic',pointerEvents:'none'}}>
   <div style={{fontSize:15,fontWeight:700,lineHeight:1.2}}>فحص ما قبل الصب</div><div style={{fontSize:11,color:C.gold,marginTop:4,letterSpacing:'.08em'}}>CASE 001</div>
  </div>
 </>;
}
function CaptionedCard({time,start,title,detail='',accent=C.gold,style={}}){
 const p=enter(time,start,.28);if(p<=0)return null;
 return <div dir="rtl" style={{position:'absolute',opacity:p,transform:`translateY(${(1-p)*18}px)`,background:'linear-gradient(145deg,rgba(244,239,229,.97),rgba(228,225,216,.94))',color:C.navy,border:`1px solid ${accent}aa`,borderRadius:14,padding:'15px 18px',boxShadow:'0 14px 34px rgba(0,0,0,.25)',fontFamily:'IBM Plex Sans Arabic',...style}}>
  <div style={{fontSize:12,fontWeight:700,color:accent,marginBottom:5}}>{detail||'معلومة من السيناريو'}</div><div style={{fontSize:21,fontWeight:700,lineHeight:1.4}}>{title}</div>
 </div>;
}
function PhotoCard({time,x=54,y=174,w=500,h=333,position='center',border=true}){
 const motion=interpolate(time,[0,DURATION],[0,1],{extrapolateRight:'clamp',easing:Easing.linear});
 const scale=1.01+motion*.045,dx=Math.sin(motion*Math.PI*2)*5;
 return <div style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:16,overflow:'hidden',border:border?`1px solid ${C.gold}88`:'none',boxShadow:'0 18px 42px rgba(0,0,0,.34)',background:C.deep}}>
  <Img src={stock} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:position,transform:`translateX(${dx}px) scale(${scale})`,filter:'saturate(.82) contrast(1.04)'}}/>
  <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(8,20,30,.02),rgba(8,20,30,.24))'}}/>
 </div>;
}
function RebarAnnotation({time,start=.82}){
 const p=enter(time,start,.36);const draw=interpolate(time,[start,start+1.1],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
 return <div style={{position:'absolute',left:570,top:226,width:214,height:215,opacity:p,transform:`translateX(${(1-p)*25}px)`,background:'rgba(18,37,54,.86)',border:'1px solid rgba(143,168,185,.45)',borderRadius:14,padding:'11px 12px',boxShadow:'0 14px 32px rgba(0,0,0,.28)'}}>
  <svg viewBox="0 0 190 160" width="190" height="160">
   <defs><clipPath id="mini-mesh-clip"><rect x="0" y="0" width={190*draw} height="160"/></clipPath></defs>
   <g clipPath="url(#mini-mesh-clip)" strokeLinecap="round">{Array.from({length:5},(_,i)=><path key={'v'+i} d={`M${25+i*35} 18V140`} stroke={i%2?C.ivory:C.blue} strokeWidth="6"/>)}{Array.from({length:4},(_,i)=><path key={'h'+i} d={`M15 ${30+i*34}H175`} stroke={i%2?C.gold:C.ivory} strokeWidth="5"/>)}</g>
   <g fill={C.gold} opacity={draw}>{Array.from({length:12},(_,i)=><circle key={i} cx={25+(i%5)*35} cy={30+Math.floor(i/5)*34} r="3.5"/>)}</g>
  </svg>
  <div dir="rtl" style={{textAlign:'right',fontFamily:'IBM Plex Sans Arabic',fontSize:12,color:C.ivory}}>شبكة تسليح — توضيح 2D</div>
 </div>;
}
function ApprovalCard({time}){
 const p=enter(time,2.62,.38),flip=interpolate(time,[7.8,8.2,9.0,9.4],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <div dir="rtl" style={{position:'absolute',left:78,top:135,width:224,height:92,opacity:.86*p,transform:`rotate(-4deg) translateY(${(1-p)*-22}px)`,background:'rgba(244,239,229,.84)',border:'1px solid rgba(216,180,110,.9)',borderRadius:7,boxShadow:'0 10px 25px rgba(0,0,0,.24)',padding:'10px 13px',fontFamily:'IBM Plex Sans Arabic',color:'#263744',zIndex:4}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><b style={{fontSize:13}}>حالة الاعتماد</b><span style={{fontSize:10,color:'#846E4F'}}>مراجعة</span></div>
  <div style={{height:1,background:'#53616a55',margin:'8px 0'}}/><div style={{display:'flex',justifyContent:'space-between',fontSize:11}}><span>آخر إصدار</span><b style={{opacity:.45}}>غير واضح</b></div>
  <div style={{position:'absolute',inset:0,borderRadius:7,border:`2px solid ${C.gold}`,opacity:flip,pointerEvents:'none'}}/>
 </div>;
}
function MiniStatus({time}){
 const cue=time<4.682?{at:0,title:'قبل الصب',sub:'قرار يبدأ من مستند واضح'}:time<6.42?{at:4.682,title:'المضخة جاهزة',sub:'المعدة في الموقع'}:time<8.35?{at:6.42,title:'والحديد قدامنا',sub:'العنصر ظاهر للمراجعة'}:time<10.2?{at:8.35,title:'آخر اعتماد غير ظاهر',sub:'في النسخة المتاحة'}:time<11.724?{at:10.2,title:'نسخة مهندس الموقع',sub:'حالة الاعتماد غير واضحة'}:time<13.35?{at:11.724,title:'نصبّ ولا نوقف؟',sub:'سؤال القرار قبل التنفيذ'}:time<15.2?{at:13.35,title:'نصبّ؟   /   نوقف؟',sub:'الاختيار معلّق حتى التحقق',pair:true}:{at:15.2,title:'النسخة أولًا',sub:'ثم قرار الموقع'};
 const p=enter(time,cue.at,.22);
 return <div dir="rtl" style={{position:'absolute',right:64,top:188,width:420,minHeight:130,opacity:p,transform:`translateY(${(1-p)*14}px)`,zIndex:6}}>
  {!cue.pair?<div style={{background:'rgba(10,24,35,.78)',borderRight:`3px solid ${C.gold}`,padding:'16px 20px',borderRadius:'0 12px 12px 0',boxShadow:'0 12px 28px rgba(0,0,0,.2)'}}><div style={{fontFamily:'IBM Plex Sans Arabic',fontSize:13,color:C.gold,marginBottom:7}}>{cue.sub}</div><div style={{fontFamily:'Amiri',fontSize:30,fontWeight:700,color:C.ivory,lineHeight:1.25}}>{cue.title}</div></div>:<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>{['نصبّ؟','نوقف؟'].map((x,i)=><div key={x} style={{padding:'16px 12px',textAlign:'center',border:`1px solid ${i?C.red:C.gold}88`,background:'rgba(10,24,35,.9)',borderRadius:12,color:i?C.red:C.gold,fontFamily:'Amiri',fontSize:25,fontWeight:700}}>{x}</div>)}<div style={{gridColumn:'1/3',textAlign:'right',fontFamily:'IBM Plex Sans Arabic',fontSize:12,color:C.blue}}>{cue.sub}</div></div>}
 </div>;
}
function SceneOne({time}){
 return <AbsoluteFill style={{overflow:'hidden'}}><Background time={time} variant={0}/>
  <PhotoCard time={time} x={52} y={194} w={500} h={333} position={time<7.5?'center':'60% center'}/>
  <RebarAnnotation time={time}/><ApprovalCard time={time}/><MiniStatus time={time}/>
  <div style={{position:'absolute',left:58,top:540,width:730,height:24,display:'flex',alignItems:'center',gap:12,opacity:enter(time,0,.2)}}><div style={{height:2,width:interpolate(time,[0,15],[80,420],{extrapolateRight:'clamp'}),background:`linear-gradient(90deg,${C.gold},rgba(216,180,110,.05))`}}/><span style={{fontFamily:'IBM Plex Sans Arabic',fontSize:11,color:C.blue}}>الموقع • حالة توضيحية</span></div>
 </AbsoluteFill>;
}
function AlertMark(){return <svg width="46" height="44" viewBox="0 0 46 44"><path d="M23 3L43 39H3Z" fill="rgba(231,129,116,.18)" stroke={C.red} strokeWidth="3"/><path d="M23 14V26M23 32V34" stroke={C.ivory} strokeWidth="3" strokeLinecap="round"/></svg>}
function SyntheticTable({time,start}){
 const p=enter(time,start,.25);return <div dir="rtl" style={{position:'absolute',right:70,top:196,width:440,opacity:p,transform:`translateX(${(1-p)*28}px)`,background:'rgba(12,28,40,.93)',border:'1px solid rgba(216,180,110,.55)',borderRadius:14,padding:14,boxShadow:'0 16px 36px rgba(0,0,0,.3)'}}>
  <div style={{fontFamily:'IBM Plex Sans Arabic',fontSize:11,color:C.gold,marginBottom:9}}>سيناريو تعليمي — بيانات توضيحية</div>
  {[['المعلومة','مراجعة'],['المستند','مطابقة'],['النتيجة','قرار موثق']].map((r,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:6}}>{r.map((v,j)=><div key={j} style={{padding:'8px 10px',background:j?'rgba(120,201,161,.10)':'rgba(143,168,185,.12)',border:`1px solid ${j?C.green:C.blue}55`,borderRadius:7,fontFamily:'IBM Plex Sans Arabic',fontSize:13,color:C.ivory,textAlign:'right'}}>{v}</div>)}</div>)}
 </div>;
}
function FlowCard({time,start,title,items}){
 const p=enter(time,start,.3);return <div dir="rtl" style={{position:'absolute',right:70,top:192,width:450,opacity:p,transform:`translateY(${(1-p)*18}px)`,background:'rgba(11,26,38,.9)',border:'1px solid rgba(216,180,110,.5)',borderRadius:14,padding:17}}>
  <div style={{fontFamily:'IBM Plex Sans Arabic',fontSize:12,color:C.gold,marginBottom:10}}>{title}</div><div style={{display:'flex',gap:8,alignItems:'center',justifyContent:'space-between'}}>{items.map((x,i)=><React.Fragment key={x}><div style={{flex:1,textAlign:'center',padding:'10px 6px',borderRadius:8,background:'rgba(143,168,185,.12)',border:'1px solid rgba(143,168,185,.35)',fontFamily:'IBM Plex Sans Arabic',fontSize:14,color:C.ivory}}>{x}</div>{i<items.length-1&&<span style={{color:C.gold,fontSize:19}}>←</span>}</React.Fragment>)}</div>
 </div>;
}
function MiniBalance({time}){
 const p=enter(time,27,.35),angle=Math.sin((time-27)*1.2)*3;
 return <div style={{position:'absolute',right:83,top:190,width:405,height:292,opacity:p,transform:`translateY(${(1-p)*20}px)`,background:'rgba(12,28,40,.45)',border:'1px solid rgba(216,180,110,.45)',borderRadius:16}}>
  <div dir="rtl" style={{position:'absolute',right:14,top:12,fontFamily:'IBM Plex Sans Arabic',fontSize:11,color:C.gold}}>موازنة القرار — تمهيد</div>
  <svg viewBox="0 0 405 230" style={{position:'absolute',left:0,top:35,width:'100%',height:230}}>
   <path d="M202 85L68 85M202 85L336 85" stroke={C.gold} strokeWidth="9" strokeLinecap="round" transform={`rotate(${angle} 202 85)`}/><circle cx="202" cy="85" r="13" fill={C.navy} stroke={C.ivory} strokeWidth="5"/><path d="M202 99L158 188H246Z" fill={C.deep} stroke={C.gold} strokeWidth="4"/>
   <path d="M68 88V145M38 145H98Q68 190 38 145ZM336 88V145M306 145H366Q336 190 306 145Z" fill="none" stroke={C.blue} strokeWidth="4"/>
  </svg>
 </div>;
}
function SceneTwo({time}){
 const local=time-17.122;
 const phase=time<18.82?'note':time<20.55?'photo':time<22.45?'table':time<23.928?'choice':time<25.72?'flow':time<27?'flow2':time<30.12?'balance':'done';
 return <AbsoluteFill style={{overflow:'hidden'}}><Background time={time} variant={1}/>
  <PhotoCard time={time} x={54} y={205} w={492} h={328} position={time<20.55?'35% center':'72% center'}/>
  {phase==='note'&&<CaptionedCard time={time} start={17.122} title="ملاحظة توضيحية" detail="حالة مركّبة للتعلّم" style={{right:80,top:220,width:420}}/>}
  {phase==='photo'&&<div style={{position:'absolute',right:85,top:190,width:420,height:220,display:'flex',gap:14,alignItems:'center'}}><div style={{width:260,height:180,overflow:'hidden',borderRadius:12,border:`1px solid ${C.gold}`,boxShadow:'0 12px 25px #0005'}}><Img src={stock} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'72% center',transform:`scale(${1+Math.sin(local)*.025})`}}/></div><div style={{display:'grid',justifyItems:'center',gap:8}}><AlertMark/><span dir="rtl" style={{fontFamily:'IBM Plex Sans Arabic',fontSize:12,color:C.ivory}}>موقف توضيحي</span></div></div>}
  {phase==='table'&&<SyntheticTable time={time} start={20.55}/>}
  {phase==='choice'&&<div dir="rtl" style={{position:'absolute',right:76,top:210,width:440,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>{[['المعلومة',C.blue],['القرار',C.gold]].map(([x,col],i)=><div key={x} style={{padding:'24px 14px',border:`1px solid ${col}88`,borderRadius:14,background:'rgba(11,25,36,.9)',textAlign:'center',fontFamily:'Amiri',fontSize:24,color:C.ivory,transform:`translateY(${i?14:0}px)`}}><span style={{display:'block',fontSize:12,color:col,marginBottom:8}}>خطوة {i+1}</span>{x}</div>)}</div>}
  {(phase==='flow'||phase==='flow2')&&<FlowCard time={time} start={23.928} title={phase==='flow'?'قبل الصب — تسلسل توضيحي':'خطوة بخطوة — قبل قرار الإيقاف'} items={phase==='flow'?['مستند','مراجعة','قرار']:['راجع','تحقق','وثّق']}/>}
  {(phase==='balance'||phase==='done')&&<MiniBalance time={time}/>}
  {phase==='balance'&&<CaptionedCard time={time} start={27.0} title="الوقت مقابل التحقق" detail="الميزان يظهر تمهيدًا للفكرة" accent={C.gold} style={{left:610,top:490,width:360}}/>}
  {phase==='done'&&<CaptionedCard time={time} start={29.0} title="لا أرقام كودية هنا" detail="القرار مرتبط بمستند المشروع" accent={C.green} style={{left:600,top:488,width:380}}/>}
 </AbsoluteFill>;
}
function ScaleSvg({time}){
 const deg=interpolate(time,[27,31.016,33.257,35.985,39.2,42.2],[0,6,-5,7,-3,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)}),r=deg*Math.PI/180,cx=820,cy=318,L=178;
 const lx=cx-L*Math.cos(r),ly=cy-L*Math.sin(r),rx=cx+L*Math.cos(r),ry=cy+L*Math.sin(r);
 const leftLabel=enter(time,31.016,.24),rightLabel=enter(time,35.985,.24);
 return <svg viewBox="0 0 1280 720" preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
  <ellipse cx="820" cy="520" rx="245" ry="25" fill="#000" opacity=".24"/>
  <path d="M820 324V495M740 500H900M765 519H875" stroke={C.ivory} strokeWidth="7" strokeLinecap="round"/>
  <path d="M820 375L767 495H873Z" fill={C.deep} stroke={C.gold} strokeWidth="4"/>
  <path d={`M${lx} ${ly}L${rx} ${ry}`} stroke={C.gold} strokeWidth="13" strokeLinecap="round"/>
  <circle cx={cx} cy={cy} r="19" fill={C.navy} stroke={C.ivory} strokeWidth="7"/><circle cx={cx} cy={cy} r="6" fill={C.gold}/>
  {[{x:lx,y:ly,label:'الوقت',op:leftLabel},{x:rx,y:ry,label:'التحقق',op:rightLabel}].map((q,i)=><g key={i}>
   <path d={`M${q.x-32} ${q.y+3}L${q.x-49} ${q.y+102}M${q.x+32} ${q.y+3}L${q.x+49} ${q.y+102}M${q.x} ${q.y+3}V${q.y+102}`} stroke={C.blue} strokeWidth="3.5"/>
   <path d={`M${q.x-57} ${q.y+102}Q${q.x} ${q.y+145} ${q.x+57} ${q.y+102}`} fill="rgba(27,52,72,.88)" stroke={C.gold} strokeWidth="4"/>
   <rect x={q.x-67} y={q.y+146} width="134" height="42" rx="11" fill="rgba(8,20,29,.94)" stroke={C.gold} strokeWidth="1.5" opacity={q.op}/>
   <text x={q.x} y={q.y+174} textAnchor="middle" fill={C.ivory} fontFamily="IBM Plex Sans Arabic" fontSize="20" fontWeight="700" opacity={q.op}>{q.label}</text>
  </g>)}
 </svg>;
}
function SupportPanel({time}){
 let title,rows,start;
 if(time<32.7){title='طرفا القرار';rows=[['لا تعطيل بلا سبب',C.red],['لا استعجال بلا تحقق',C.gold]];start=31.016;}
 else if(time<33.257){title='ميزان القرار';rows=[['الوقت',C.blue],['التحقق',C.gold]];start=32.7;}
 else if(time<34.6){title='قرار بلا تطرف';rows=[['توقف محدد',C.red],['استكمال موثق',C.green]];start=33.257;}
 else if(time<35.985){title='انتظار المعلومة';rows=[['المراجعة أولًا',C.blue],['ثم القرار',C.gold]];start=34.6;}
 else if(time<37.686){title='نقطة الفحص';rows=[['التحقق أولًا',C.green],['القرار من المستند',C.blue]];start=35.985;}
 else if(time<39.55){title='إغلاق نقاط الفحص';rows=[['اتقفلت',C.green],['واتوثقت',C.gold]];start=37.686;}
 else if(time<41.08){title='مرجع القرار';rows=[['الرسومات',C.blue],['المواصفات',C.gold]];start=39.55;}
 else {title='نتيجة موثقة';rows=[['فحص مكتمل',C.green],['قرار مسؤول',C.gold]];start=41.08;}
 const p=enter(time,start,.22);
 return <div dir="rtl" style={{position:'absolute',right:44,top:211,width:228,opacity:p,transform:`translateX(${(1-p)*17}px)`,padding:13,background:'rgba(10,24,35,.91)',border:'1px solid rgba(143,168,185,.42)',borderRadius:13,boxShadow:'0 12px 27px rgba(0,0,0,.26)'}}>
  <div style={{fontFamily:'IBM Plex Sans Arabic',fontSize:12,color:C.gold,marginBottom:9}}>{title}</div>
  {rows.map(([x,col],i)=><div key={x} style={{display:'flex',alignItems:'center',gap:7,padding:'7px 4px',borderTop:i?'1px solid #8FA8B922':'none',fontFamily:'IBM Plex Sans Arabic',fontSize:12,color:C.ivory}}><span style={{color:col,fontSize:17,fontWeight:700}}>{i===0?'✓':'•'}</span>{x}</div>)}
 </div>;
}
function SceneThree({time}){
 const revealP=enter(time,31.016,.34), pulse=interpolate(Math.sin((time-31)*3),[-1,1],[.10,.32]);
 return <AbsoluteFill style={{overflow:'hidden'}}><Background time={time} variant={2}/>
  <PhotoCard time={time} x={52} y={213} w={500} h={333} position="68% center"/>
  <div style={{position:'absolute',inset:0,opacity:revealP}}><ScaleSvg time={time}/></div>
  <SupportPanel time={time}/>
  <div style={{position:'absolute',left:596,top:578,width:510,height:2,background:`linear-gradient(90deg,rgba(216,180,110,.04),rgba(216,180,110,${pulse}),rgba(216,180,110,.04))`}}/>
 </AbsoluteFill>;
}
function FolderIcon(){return <svg width="82" height="70" viewBox="0 0 82 70"><path d="M7 16Q7 10 13 10H33L41 18H69Q75 18 75 24V57Q75 63 69 63H13Q7 63 7 57Z" fill="rgba(216,180,110,.15)" stroke={C.gold} strokeWidth="3"/><path d="M7 27H75" stroke={C.gold} strokeWidth="3"/><path d="M20 39H62M20 48H52" stroke={C.ivory} strokeOpacity=".82" strokeWidth="2.5" strokeLinecap="round"/></svg>}
function FileTransition({time,start,direction='left'}){
 const duration=.96,local=time-start;if(local<0||local>duration)return null;
 const opacity=interpolate(local,[0,.14,.78,.96],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
 const cardP=interpolate(local,[.14,.36,.73,.91],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
 const offset=direction==='left'?interpolate(cardP,[0,1],[260,0]):interpolate(cardP,[0,1],[145,0]);
 return <div style={{position:'absolute',inset:0,zIndex:22,opacity,background:'linear-gradient(120deg,rgba(8,20,30,.99),rgba(18,37,54,.99))',pointerEvents:'none'}}>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 48% 52%,rgba(216,180,110,.13),transparent 58%)'}}/>
  <div style={{position:'absolute',left:76,top:260,width:330,height:168,display:'flex',alignItems:'center',gap:18,padding:'22px 24px',border:'1px solid rgba(216,180,110,.72)',borderRadius:16,background:'linear-gradient(145deg,rgba(27,52,72,.97),rgba(12,27,39,.98))',boxShadow:'0 18px 50px rgba(0,0,0,.35)',opacity:cardP,transform:direction==='left'?`translateX(${offset}px)`:`translateY(${offset}px)`}}>
   <FolderIcon/><div dir="rtl" style={{fontFamily:'Amiri',fontSize:29,fontWeight:700,color:C.ivory,lineHeight:1.25}}>ملف الصبّة<div style={{fontFamily:'IBM Plex Sans Arabic',fontSize:12,color:C.gold,marginTop:7}}>فحص ما قبل الصب</div></div>
  </div>
  <div style={{position:'absolute',left:76,top:457,width:330,height:1,background:`linear-gradient(90deg,${C.gold},transparent)`,opacity:cardP*.6}}/>
 </div>;
}
function SoundBed(){return <>{SFX.map((s,i)=><Sequence key={`${s.file}-${i}`} from={Math.round(s.at*FPS)}><Audio src={staticFile(s.file)} volume={s.v}/></Sequence>)}</>}
export const Case001HookV2=()=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),time=frame/fps;
 const scene2=interpolate(time,[16.95,17.18],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const scene3=interpolate(time,[30.90,31.12],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const scene1=1-scene2;
 return <AbsoluteFill style={{background:C.navy,color:C.ivory,fontFamily:'IBM Plex Sans Arabic',overflow:'hidden'}}>
  <div style={{position:'absolute',inset:0,zIndex:1,opacity:scene1}}><SceneOne time={time}/></div>
  <div style={{position:'absolute',inset:0,zIndex:2,opacity:scene2}}><SceneTwo time={time}/></div>
  <div style={{position:'absolute',inset:0,zIndex:3,opacity:scene3}}><SceneThree time={time}/></div>
  <FileTransition time={time} start={16.068} direction="left"/>
  <FileTransition time={time} start={30.120} direction="up"/>
  <ShowSignature time={time}/>
  <Karaoke time={time}/>
  <Audio src={voice} volume={1}/><SoundBed/>
 </AbsoluteFill>;
};
export const hookV2Config={id:'CASE001HookSampleV2',component:Case001HookV2,durationInFrames:Math.ceil(DURATION*FPS),fps:FPS,width:1280,height:720};
