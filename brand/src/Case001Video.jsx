import React from 'react';
import {
  AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig,
  Easing, spring,
} from 'remotion';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '@fontsource/amiri/700.css';
import captions from './case001-captions.json';
import sceneStarts from './case001-scene-starts.json';
import sectionStarts from './case001-section-starts.json';

const C = {navy:'#122536',deep:'#1B3448',gold:'#D8B46E',gold2:'#B78E45',ivory:'#F4EFE5',blue:'#8FA8B9',muted:'#87949C',green:'#72C8A2',red:'#E57B70',paper:'#E9E5DB'};
const AUDIO_SECONDS = 612.86;
const NOMINAL_SECONDS = 645;
const BASE = [
  {at:0, chapter:'الافتتاح', title:'الخرسانة وصلت… والاعتماد؟', subtitle:'قرار الصب يبدأ من ملف واضح', visual:'hook', tags:['تحقق','وثّق','ثم قرر']},
  {at:40, chapter:'ملف الحالة', title:'المضخة وصلت… والنسخة مش واضحة', subtitle:'نحدد الجزء المتأثر، ونراجع المستند قبل القرار', visual:'file', tags:['عنصر محدد','نسخة معتمدة','سجل واضح']},
  {at:130, chapter:'المحطة ١', title:'آخر إصدار معتمد', subtitle:'ما نكتفيش بصورة أو رسالة منفصلة', visual:'revisions', tags:['رقم المراجعة','حالة الاعتماد','مصدر رسمي']},
  {at:195, chapter:'المحطة ٢', title:'التسليح والغطاء', subtitle:'مطابقة التفصيلة… بلا أرقام عامة', visual:'rebar', tags:['النوع والتوزيع','التثبيت','غطاء حسب المشروع']},
  {at:260, chapter:'المحطة ٣', title:'الشدة قبل الصب', subtitle:'أبعاد، ثبات، نظافة، وإغلاق مناسب', visual:'form', tags:['محاور ومناسيب','دعامات ووصلات','سطح نظيف']},
  {at:283, chapter:'المحطة ٤', title:'المدفونات والفتحات', subtitle:'ما سيختفي داخل الخرسانة يُراجع أولًا', visual:'embed', tags:['سليفات','فتحات','تعارض؟ استفسار رسمي']},
  {at:310, chapter:'حل السيناريو', title:'نوقف الجزء… لا الموقع كله', subtitle:'حدود القرار حسب الإجراء والصلاحيات', visual:'split', tags:['عزل التعارض','استكمال المسموح','توثيق الحالة']},
  {at:353, chapter:'المحطة ٥', title:'نقطة الفحص والموافقة', subtitle:'نتبع الـ ITP وإجراء المشروع المعتمد', visual:'flow', tags:['إبلاغ','معاينة','تسجيل النتيجة']},
  {at:375, chapter:'المراجع وحدودها', title:'الإصدار الأحدث… مع احترام التعاقد', subtitle:'الإصدار المنطبق تحدده وثائق المشروع والجهة المختصة', visual:'refs', tags:['ACI SPEC-311.7-25','IBC 2024 §1705.3','الكود المحلي']},
  {at:397, chapter:'الاستعداد', title:'طريقة الصب والأدوات والوصول', subtitle:'مراجعة استعداد، لا إذن بتغيير الإجراء', visual:'ready', tags:['خطة معتمدة','معدات مناسبة','وصول آمن']},
  {at:419, chapter:'بعد التحقق', title:'قرار مرتبط بمستند ونتيجة', subtitle:'مش إحساس إن الشكل مظبوط من بعيد', visual:'verified', tags:['مطابقة','مراجعة','تسجيل']},
  {at:463, chapter:'قرار الموقع', title:'مطابق وموثّق؟ استكمال حسب الإجراء', subtitle:'غير محسوم؟ تعليق الجزء وتصعيده', visual:'decision', tags:['مطابق وموثق','غير محسوم','مسؤول وخطوة تالية']},
  {at:485, chapter:'سجل الفحص', title:'اكتب ما يحتاجه من يستلم بعدك', subtitle:'المكان، المرجع، الملاحظة، والإغلاق', visual:'record', tags:['مستند','وقت','نتيجة']},
  {at:530, chapter:'الخلاصة العملية', title:'قائمة ما قبل الصب', subtitle:'بداية منظمة… وليست بديلًا عن مستندات المشروع', visual:'checklist', tags:['آخر مستند','حديد وغطاء','شدة ومدفونات','نقطة الفحص','قرار موثق']},
  {at:574, chapter:'الختام', title:'القرار بعد التحقق', subtitle:'استعجال مفهوم… وقرار فني مسؤول', visual:'close', tags:['اعتماد','فحص','توثيق']},
  {at:595, chapter:'سؤال الحلقة', title:'إيه أول مستند هتفتحه قبل ما تقول نبدأ؟', subtitle:'شارك نقطة فحص شايف إنها بتتنسى — من غير بيانات خاصة', visual:'question', tags:['رسومات','مواصفات','ITP']},
  {at:630, chapter:'ملف المشروع', title:'نقفل الملف… والسؤال مستمر', subtitle:'لو إصدار واحد لسه مش مؤكد، هتقرر إيه؟', visual:'brand', tags:['ملف المشروع']},
].map((s,i)=>({...s,startFrame:Math.round((sceneStarts[String(s.at)] ?? s.at/NOMINAL_SECONDS*AUDIO_SECONDS)*30),id:i}));

const reveal = (f, delay=0, distance=28) => {
  const p = interpolate(f-delay,[0,15],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
  return {opacity:p, transform:`translateY(${(1-p)*distance}px)`};
};
const Box = ({children, style={}, ...props}) => <div {...props} style={{border:'1px solid rgba(143,168,185,.24)',background:'linear-gradient(145deg,rgba(27,52,72,.9),rgba(18,37,54,.86))',borderRadius:18,...style}}>{children}</div>;
const Pill = ({children, color=C.gold}) => <span style={{fontFamily:'IBM Plex Sans Arabic',fontSize:17,fontWeight:600,color,border:`1px solid ${color}55`,background:`${color}12`,padding:'8px 14px',borderRadius:999,whiteSpace:'nowrap'}}>{children}</span>;
function Grid(){return <svg viewBox="0 0 1280 720" preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.3}}><defs><pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke={C.blue} strokeOpacity=".12" strokeWidth="1"/></pattern><radialGradient id="glow"><stop stopColor={C.gold} stopOpacity=".1"/><stop offset="1" stopColor={C.gold} stopOpacity="0"/></radialGradient></defs><rect width="1280" height="720" fill="url(#grid)"/><ellipse cx="950" cy="240" rx="430" ry="290" fill="url(#glow)"/></svg>}
function RebarDrawing({frame}){
  const p=interpolate(frame,[0,22],[0,1],{extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
  return <svg viewBox="0 0 560 360" style={{width:'100%',height:'100%'}}>
    <defs><linearGradient id="concrete" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#E9E5DB"/><stop offset="1" stopColor="#B8B0A1"/></linearGradient></defs>
    <rect x="80" y="75" width="400" height="220" rx="10" fill="url(#concrete)" opacity=".16" stroke={C.ivory} strokeWidth="2" strokeDasharray="8 7"/>
    {[0,1,2,3,4,5].map(i=><g key={i} opacity={p}><path d={`M${140+i*56} 105V265`} stroke={i===2?C.gold:C.blue} strokeWidth="6" strokeLinecap="round"/><circle cx={140+i*56} cy="111" r="8" fill={C.ivory}/><circle cx={140+i*56} cy="259" r="8" fill={C.ivory}/></g>)}
    {[0,1,2,3].map(i=><path key={i} d={`M105 ${140+i*42}H455`} stroke={C.gold} strokeWidth="5" strokeLinecap="round" opacity={p}/>) }
    <path d="M95 70V104M85 70H105M85 104H105" stroke={C.ivory} strokeWidth="2"/><text x="280" y="334" fill={C.blue} textAnchor="middle" fontSize="18" fontFamily="IBM Plex Sans Arabic">تفصيلة المشروع — دون قيمة عامة</text>
  </svg>;
}
function Visual({type,frame}){
  const cards = (items) => <div style={{display:'grid',gap:14,width:'100%',direction:'rtl'}}>{items.map((it,i)=><Box key={i} style={{...reveal(frame,i*8,16),padding:'17px 20px',display:'flex',alignItems:'center',gap:14}}><span style={{width:34,height:34,borderRadius:10,background:`${it[1]||C.gold}18`,border:`1px solid ${it[1]||C.gold}65`,color:it[1]||C.gold,display:'grid',placeItems:'center',fontSize:18,fontWeight:700}}>{it[2]||'✓'}</span><span style={{fontFamily:'IBM Plex Sans Arabic',fontSize:20,color:C.ivory,fontWeight:600}}>{it[0]}</span></Box>)}</div>;
  if(type==='rebar') return <RebarDrawing frame={frame}/>;
  if(type==='revisions') return <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:16,width:'100%'}}><Doc label="REV A" state="قديم" dim/><div style={{fontSize:42,color:C.gold}}>←</div><Doc label="REV B" state="معتمد"/></div>;
  if(type==='form') return <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:28}}><div style={{width:300,height:220,border:'10px solid #B78E45',borderTopWidth:7,position:'relative',borderRadius:7,background:'rgba(233,229,219,.07)'}}><div style={{position:'absolute',inset:'20px 40px',border:'2px dashed #8FA8B9'}}/><i style={{position:'absolute',width:15,height:230,background:C.gold,transform:'rotate(36deg)',left:50,bottom:-56}}/><i style={{position:'absolute',width:15,height:230,background:C.gold,transform:'rotate(-36deg)',right:50,bottom:-56}}/></div>{cards([['ثبات القوالب والدعامات'],['الأبعاد والمناسيب'],['نظافة سطح التلامس']])}</div>;
  if(type==='embed') return <div style={{width:450,height:300,position:'relative',border:'2px dashed #8FA8B9',borderRadius:22,background:'rgba(233,229,219,.06)'}}><div style={{position:'absolute',inset:'55px 38px',border:'2px solid #B78E45',borderRadius:8,opacity:.7}}/>{[0,1,2].map(i=><div key={i} style={{position:'absolute',top:110+i*32,left:25,width:400,height:8,background:[C.blue,C.gold,C.green][i],borderRadius:8,transform:`rotate(${i===1?3:-2}deg)`,opacity:.92}}/>)}<div style={{position:'absolute',right:138,top:145,width:120,height:70,background:C.navy,border:`2px solid ${C.red}`,borderRadius:12,display:'grid',placeItems:'center',color:C.red,fontFamily:'IBM Plex Sans Arabic'}}>تعارض؟</div></div>;
  if(type==='hook'||type==='file'||type==='close'||type==='brand') return <div style={{display:'grid',placeItems:'center',width:'100%',height:'100%',position:'relative'}}><div style={{width:350,height:230,border:`3px solid ${C.gold}`,background:'linear-gradient(150deg,#1B3448,#122536)',borderRadius:'20px 20px 24px 24px',transform:`perspective(900px) rotateY(${Math.sin(frame/34)*3}deg)`,boxShadow:'0 28px 60px #0005',position:'relative'}}><div style={{position:'absolute',top:-37,left:22,width:135,height:42,background:C.deep,border:`3px solid ${C.gold}`,borderBottom:0,borderRadius:'16px 16px 0 0'}}/><div style={{position:'absolute',top:34,left:30,right:30,bottom:28,border:'1px solid #8FA8B966',borderRadius:12,display:'grid',placeItems:'center'}}><div style={{fontFamily:'Amiri',fontSize:40,color:C.ivory,textAlign:'center',lineHeight:1.25}}>ملف<br/><span style={{color:C.gold}}>الصبّة</span></div><div style={{position:'absolute',bottom:18,width:110,height:4,background:C.gold,borderRadius:5}}/></div></div><div style={{position:'absolute',bottom:12,right:30}}><Pill>CASE 001 • PRE-POUR</Pill></div></div>;
  if(type==='split'||type==='decision') return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,width:'100%'}}><Box style={{padding:22,borderColor:`${C.green}66`,minHeight:210,display:'grid',placeItems:'center',textAlign:'center'}}><div><div style={{fontSize:36,color:C.green,marginBottom:12}}>✓</div><div style={{fontFamily:'IBM Plex Sans Arabic',fontSize:22,color:C.ivory,fontWeight:700}}>مطابق وموثّق</div><div style={{fontFamily:'IBM Plex Sans Arabic',fontSize:15,color:C.blue,marginTop:8}}>استكمال حسب الإجراء</div></div></Box><Box style={{padding:22,borderColor:`${C.gold}66`,minHeight:210,display:'grid',placeItems:'center',textAlign:'center'}}><div><div style={{fontSize:36,color:C.gold,marginBottom:12}}>Ⅱ</div><div style={{fontFamily:'IBM Plex Sans Arabic',fontSize:22,color:C.ivory,fontWeight:700}}>غير محسوم</div><div style={{fontFamily:'IBM Plex Sans Arabic',fontSize:15,color:C.blue,marginTop:8}}>تعليق الجزء + تصعيد</div></div></Box></div>;
  if(type==='flow') return <div style={{display:'flex',direction:'rtl',alignItems:'center',justifyContent:'center',gap:12,width:'100%'}}>{['طلب فحص','معاينة','تسجيل النتيجة'].map((x,i)=><React.Fragment key={x}><Box style={{...reveal(frame,i*12),padding:'22px 18px',minWidth:135,textAlign:'center',fontFamily:'IBM Plex Sans Arabic',fontSize:20,color:C.ivory}}><span style={{display:'block',fontSize:26,color:C.gold,marginBottom:8}}>0{i+1}</span>{x}</Box>{i<2&&<b style={{color:C.gold,fontSize:28}}>←</b>}</React.Fragment>)}</div>;
  if(type==='refs') return <div style={{display:'grid',gap:18,width:'100%'}}>{[['ACI','SPEC-311.7-25','الأحدث المتاح حاليًا'],['IBC','2024 · §1705.3','Concrete construction']].map((r,i)=><Box key={i} style={{...reveal(frame,i*10),padding:'20px 24px',display:'flex',alignItems:'center',gap:20}}><span style={{fontFamily:'Amiri',fontWeight:700,fontSize:28,color:C.gold,width:72}}>{r[0]}</span><span style={{flex:1}}><b style={{fontFamily:'IBM Plex Sans Arabic',fontSize:21,color:C.ivory,display:'block'}}>{r[1]}</b><small style={{fontFamily:'IBM Plex Sans Arabic',fontSize:15,color:C.blue}}>{r[2]}</small></span><span style={{color:C.gold,fontSize:20}}>↗</span></Box>)}<div style={{fontFamily:'IBM Plex Sans Arabic',fontSize:15,color:C.muted,textAlign:'center'}}>المشروع القائم يتبع الإصدار المعتمد تعاقديًا ومحليًا</div></div>;
  if(type==='ready') return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,width:'100%'}}>{[['خطة الصب','↗'],['معدة الدمك','◉'],['وصول آمن','⇢'],['إجراء معتمد','✓']].map((r,i)=><Box key={i} style={{...reveal(frame,i*7),padding:18,minHeight:102,display:'flex',alignItems:'center',gap:13}}><span style={{fontSize:27,color:C.gold}}>{r[1]}</span><b style={{fontFamily:'IBM Plex Sans Arabic',fontSize:18,color:C.ivory}}>{r[0]}</b></Box>)}</div>;
  if(type==='verified') return <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,width:'100%'}}>{[['01','مستند'],['02','مطابقة'],['03','توثيق']].map((r,i)=><Box key={r[0]} style={{...reveal(frame,i*12),height:220,display:'grid',placeItems:'center',alignContent:'center',gap:14}}><span style={{color:C.gold,fontSize:45,fontFamily:'Amiri'}}>{r[0]}</span><b style={{fontFamily:'IBM Plex Sans Arabic',color:C.ivory,fontSize:20}}>{r[1]}</b></Box>)}</div>;
  if(type==='record') return <Box style={{padding:25,width:'100%'}}><div style={{display:'flex',justifyContent:'space-between',borderBottom:`1px solid ${C.blue}55`,paddingBottom:12,marginBottom:10}}><b style={{fontFamily:'IBM Plex Sans Arabic',fontSize:19,color:C.ivory}}>سجل الفحص</b><Pill>نموذج توضيحي</Pill></div>{['الموقع / العنصر','المستند والمرجع','الملاحظة والإجراء','النتيجة والإغلاق'].map((x,i)=><div key={x} style={{...reveal(frame,i*7),display:'flex',justifyContent:'space-between',padding:'10px 4px',borderBottom:'1px solid #8FA8B922',fontFamily:'IBM Plex Sans Arabic',fontSize:17,color:C.ivory}}><span>{x}</span><span style={{color:i<2?C.green:C.gold}}>✓</span></div>)}</Box>;
  if(type==='checklist') return <div style={{display:'grid',gap:10,width:'100%'}}>{['آخر مستند معتمد','التسليح والغطاء','الشدة والمدفونات','نقطة الفحص','قرار موثّق'].map((x,i)=><Box key={i} style={{...reveal(frame,i*9,18),padding:'12px 20px',display:'flex',alignItems:'center',gap:15}}><span style={{width:28,height:28,borderRadius:'50%',border:`2px solid ${C.gold}`,display:'grid',placeItems:'center',color:C.green,fontSize:16}}>✓</span><span style={{fontFamily:'IBM Plex Sans Arabic',fontSize:19,color:C.ivory}}>{x}</span></Box>)}</div>;
  if(type==='question') return <div style={{textAlign:'center',width:'100%'}}><div style={{fontFamily:'Amiri',fontSize:50,color:C.gold,marginBottom:26}}>؟</div><div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>{['الرسومات','المواصفات','ITP'].map(x=><Pill key={x}>{x}</Pill>)}</div></div>;
  return cards([['تحقق من المستند'],['طابق الواقع'],['وثّق القرار']]);
}
function Doc({label,state,dim=false}){return <Box style={{width:175,height:226,padding:16,opacity:dim ? .48 : 1,transform:dim?'rotate(-4deg)':'rotate(2deg)',boxShadow:'0 14px 28px #0003'}}><div style={{fontFamily:'IBM Plex Sans Arabic',fontWeight:700,fontSize:14,color:dim?C.muted:C.gold}}>{label}</div><div style={{height:4,background:C.blue,opacity:.5,marginTop:23,width:'85%'}}/><div style={{height:4,background:C.blue,opacity:.35,marginTop:12,width:'70%'}}/><div style={{height:4,background:C.blue,opacity:.35,marginTop:12,width:'80%'}}/><div style={{height:4,background:C.blue,opacity:.35,marginTop:12,width:'55%'}}/><div style={{marginTop:31,textAlign:'center',fontFamily:'IBM Plex Sans Arabic',fontSize:16,color:dim?C.red:C.green,fontWeight:700,border:`1px solid ${dim?C.red:C.green}66`,padding:8,borderRadius:8}}>{state}</div></Box>}

const PHOTO_BANK = [
  'hook-concrete-stock.jpg',
  'hook-pour-stock.jpg',
  'hook-finish-stock.jpg',
];
const PHOTO_LABELS = ['صبّ الخرسانة — صورة توضيحية','صب من مزراب الخلاطة — صورة توضيحية','تسوية الخرسانة — صورة توضيحية'];
const TRANSITION_EVENTS = Object.entries(sectionStarts)
  .map(([nominal, at], i) => ({nominal:Number(nominal), at:Number(at), index:i}))
  .filter(x => x.nominal !== 0 && x.at > 1 && x.at < AUDIO_SECONDS-1)
  .sort((a,b)=>a.at-b.at);
const PHOTO_SWAP_SFX = [7.2,14.4,21.6,28.8,36.0].map((at,i)=>({at,file:['sfx/click-button-medium.wav','sfx/foley-card-touch.wav','sfx/mechanical-switch-light.wav','sfx/writing-pen-tick.wav','sfx/click-button-soft.wav'][i],v:.10}));
const TRANSITION_SOUNDS = ['sfx/whoosh-medium-soft.wav','sfx/foley-paper-slide.wav','sfx/mechanical-switch-light.wav','sfx/foley-card-touch.wav'];
const SFX_CUES = [
  {at:0,file:'sfx/bass-rumble-short.wav',v:.08},
  ...PHOTO_SWAP_SFX,
  ...TRANSITION_EVENTS.map((ev,i)=>({at:Math.max(0,ev.at-.42),file:TRANSITION_SOUNDS[i%TRANSITION_SOUNDS.length],v:.13})),
  ...BASE.slice(1).map((s,i)=>({at:(sceneStarts[String(s.at)]||0)+1.9,file:['sfx/click-button-medium.wav','sfx/mechanical-switch-light.wav','sfx/foley-card-touch.wav'][i%3],v:.085})),
].sort((a,b)=>a.at-b.at);

function AmbientHeader({time,chapter}){
  const phase=(time%12)/12;
  const shift=phase<.5?phase*2:(1-phase)*2;
  return <div style={{position:'absolute',left:42,right:42,top:24,height:56,zIndex:90,display:'flex',justifyContent:'space-between',alignItems:'center',pointerEvents:'none'}}>
    <div style={{display:'flex',alignItems:'center',gap:12,direction:'ltr',width:350}}>
      <Img src={staticFile('oa-avatar.svg')} style={{width:39,height:39,objectFit:'contain',borderRadius:8}}/>
      <div dir="rtl" style={{position:'relative',width:280,color:C.ivory,fontFamily:'IBM Plex Sans Arabic'}}>
        <div style={{fontSize:19,fontWeight:700,lineHeight:1.2}}>ملف المشروع</div>
        <div style={{fontSize:11,color:C.blue,marginTop:3}}>الهندسة • التنفيذ • الجودة</div>
        <div style={{position:'absolute',left:0,bottom:-9,width:220,height:2,background:'rgba(216,180,110,.22)',overflow:'hidden'}}><div style={{position:'absolute',left:`${shift*150}px`,top:0,width:62,height:2,background:C.gold,boxShadow:`0 0 7px ${C.gold}`}}/></div>
      </div>
    </div>
    <div dir="rtl" style={{width:270,height:44,textAlign:'right',color:C.ivory,fontFamily:'IBM Plex Sans Arabic'}}>
      <div style={{fontSize:14,fontWeight:700,lineHeight:1.2}}>{chapter}</div>
      <div style={{fontSize:11,color:C.gold,marginTop:4,letterSpacing:'.08em'}}>CASE 001 <span style={{color:C.blue}}>•</span> فحص ما قبل الصب</div>
    </div>
  </div>;
}

function HookPhotoVisual({time}){
  const slotSeconds=7.2, slot=Math.floor(time/slotSeconds)%PHOTO_BANK.length, local=time%slotSeconds;
  const p=interpolate(local,[0,.52],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
  const opening=time<slotSeconds&&local<.52;
  const previousOpacity=opening?0:1-p, currentOpacity=opening?1:p;
  const drift=Math.sin(time*.34)*5, zoom=1.025+((time%14.4)/14.4)*.035;
  return <div style={{width:'100%',height:390,display:'flex',alignItems:'center',justifyContent:'center',gap:13}}>
    <div style={{position:'relative',width:418,height:280,borderRadius:16,overflow:'hidden',border:`1px solid ${C.gold}88`,boxShadow:'0 16px 38px #0005',background:C.deep}}>
      <Img src={staticFile(PHOTO_BANK[(slot+PHOTO_BANK.length-1)%PHOTO_BANK.length])} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',transform:`translateX(${drift}px) scale(${zoom})`,filter:'saturate(.85) contrast(1.04)',opacity:previousOpacity}}/>
      <Img src={staticFile(PHOTO_BANK[slot])} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',transform:`translateX(${drift}px) scale(${zoom})`,filter:'saturate(.85) contrast(1.04)',opacity:currentOpacity}}/>
      <div style={{position:'absolute',left:10,bottom:9,padding:'4px 8px',borderRadius:6,background:'#0b1b28d9',color:C.ivory,fontSize:10,fontFamily:'IBM Plex Sans Arabic'}}>{PHOTO_LABELS[slot]}</div>
    </div>
    <div style={{width:164,height:184,background:'rgba(18,37,54,.94)',border:'1px solid rgba(143,168,185,.45)',borderRadius:14,padding:9,boxShadow:'0 14px 30px #0004',display:'grid',placeItems:'center'}}>
      <svg viewBox="0 0 150 130" width="146" height="132" aria-label="شبكة تسليح توضيحية">
        <g strokeLinecap="round">{[0,1,2,3].map(i=><path key={'v'+i} d={`M${24+i*34} 12V116`} stroke={i%2?C.ivory:C.blue} strokeWidth="5"/>)}{[0,1,2,3].map(i=><path key={'h'+i} d={`M12 ${22+i*30}H138`} stroke={i%2?C.gold:C.ivory} strokeWidth="4"/>)}</g>
        <text x="75" y="128" textAnchor="middle" fill={C.blue} fontSize="11" fontFamily="IBM Plex Sans Arabic">شبكة 2D توضيحية</text>
      </svg>
    </div>
  </div>;
}

const PHOTO_INSERTS = [
  {base:40,offset:17,duration:2.8,img:'hook-pour-stock.jpg',label:'صبّ الخرسانة — Stock توضيحي'},
  {base:130,offset:22,duration:2.7,img:'hook-concrete-stock.jpg',label:'موقع عمل — Stock توضيحي'},
  {base:310,offset:9,duration:2.8,img:'hook-pour-stock.jpg',label:'صبّ الخرسانة — Stock توضيحي'},
  {base:397,offset:1,duration:2.7,img:'hook-finish-stock.jpg',label:'تسوية الخرسانة — Stock توضيحي'},
  {base:419,offset:17,duration:2.8,img:'hook-concrete-stock.jpg',label:'مراجعة الموقع — Stock توضيحي'},
  {base:530,offset:9,duration:2.8,img:'hook-finish-stock.jpg',label:'عمل الموقع — Stock توضيحي'},
].map(x=>({...x,s:(sceneStarts[String(x.base)]||0)+x.offset}));

function PhotoInsert({time,cue}){
  const local=time-cue.s, inP=interpolate(local,[0,.3],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}), outP=interpolate(local,[cue.duration-.3,cue.duration],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}), opacity=Math.min(inP,outP);
  const pan=Math.sin(local*1.1)*4;
  return <div style={{position:'absolute',left:'50%',top:'50%',width:510,height:330,borderRadius:16,overflow:'hidden',border:`1px solid ${C.gold}88`,boxShadow:'0 18px 40px #0006',opacity,transform:`translate(-50%,calc(-50% + ${(1-opacity)*12}px))`,background:C.deep}}>
    <Img src={staticFile(cue.img)} style={{width:'100%',height:'100%',objectFit:'cover',transform:`translateX(${pan}px) scale(1.04)`,filter:'saturate(.82) contrast(1.04)'}}/>
    <div style={{position:'absolute',left:9,bottom:8,padding:'4px 8px',borderRadius:6,background:'#0b1b28de',color:C.ivory,fontSize:10,fontFamily:'IBM Plex Sans Arabic'}}>{cue.label}</div>
  </div>;
}

function KaraokeCaption({time}){
  const cap=captions.find(c=>time>=c.s&&time<c.e); if(!cap)return null;
  let idx=-1;
  for(let i=0;i<cap.t.length;i++){if(time>=cap.t[i][0]&&time<cap.t[i][1]){idx=i;break;}}
  if(idx<0){for(let i=cap.t.length-1;i>=0;i--){if(time>=cap.t[i][1]){idx=i;break;}}}
  const fontSize=cap.w.length>25?16:cap.w.length>18?18:20;
  return <div dir="rtl" style={{position:'absolute',left:54,right:54,bottom:22,zIndex:105,display:'flex',justifyContent:'center',pointerEvents:'none'}}>
    <div style={{width:'100%',maxWidth:1168,minHeight:66,padding:'9px 16px 11px',borderRadius:12,background:'rgba(6,17,26,.96)',border:'1px solid rgba(216,180,110,.78)',boxShadow:'0 9px 26px #0007',display:'flex',alignItems:'center',justifyContent:'center',flexWrap:'wrap',gap:'0px 6px',fontFamily:'IBM Plex Sans Arabic',fontSize,fontWeight:700,lineHeight:1.45,textAlign:'center'}}>
      {cap.w.map((w,i)=><span key={`${cap.id}-${i}`} style={{display:'inline-block',whiteSpace:'nowrap',color:i===idx?C.gold:C.ivory,transform:`scale(${i===idx?1.075:1})`,textShadow:i===idx?'0 0 9px rgba(255,211,106,.8),0 0 17px rgba(255,211,106,.32)':'none',zIndex:i===idx?2:1,transition:'color .08s linear, transform .08s linear'}}>{w}</span>)}
    </div>
  </div>;
}

function FocusRibbon({scene,local}){
  const tags=scene.tags||[]; if(!tags.length)return null;
  const index=Math.floor(local/1.75)%tags.length, p=local%1.75;
  return <div key={`${scene.id}-${index}`} dir="rtl" style={{marginTop:20,display:'inline-flex',alignItems:'center',gap:9,padding:'8px 13px',borderRadius:10,border:`1px solid ${C.gold}66`,background:'rgba(10,24,35,.72)',fontFamily:'IBM Plex Sans Arabic',fontSize:15,color:C.gold,opacity:interpolate(p,[0,.15],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),transform:`translateY(${interpolate(p,[0,.18],[8,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}px)`}}>
    <span style={{width:7,height:7,borderRadius:'50%',background:C.gold,boxShadow:`0 0 8px ${C.gold}`}}/>{tags[index]}
  </div>;
}

function ChapterTransition({time,ev,scene}){
  const start=ev.at-.42, dur=1.82, local=time-start;
  if(local<0||local>dur)return null;
  const cover=interpolate(local,[0,.28,dur-.28,dur],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
  const enterP=interpolate(local,[.18,.72],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
  const exitP=interpolate(local,[1.12,1.56],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.in(Easing.cubic)});
  const dirs=['left','up','right','down'],dir=dirs[ev.index%dirs.length];
  const dist=dir==='left'? -460:dir==='right'?460:0;
  const ydist=dir==='up'? -260:dir==='down'?260:0;
  const slideInX=(1-enterP)*dist,slideInY=(1-enterP)*ydist;
  const slideOutX=exitP*(dir==='left'?460:dir==='right'?-460:0),slideOutY=exitP*(dir==='up'?260:dir==='down'?-260:0);
  const cardOpacity=Math.min(enterP,1-exitP);
  return <AbsoluteFill style={{zIndex:70,pointerEvents:'none',background:'rgb(8,20,31)',opacity:cover}}>
    <div style={{position:'absolute',left:66,top:'38%',width:410,height:170,borderRadius:18,border:`1px solid ${C.gold}`,background:'linear-gradient(145deg,rgba(18,37,54,.98),rgba(27,52,72,.96))',boxShadow:'0 18px 44px #0007',display:'flex',alignItems:'center',gap:20,padding:'22px 26px',opacity:cardOpacity,transform:`translate(${slideInX+slideOutX}px,${slideInY+slideOutY}px)`}}>
      <svg viewBox="0 0 78 68" width="75" height="66" aria-hidden="true"><path d="M7 18h24l7 8h32v34H7z" fill="none" stroke={C.gold} strokeWidth="3" strokeLinejoin="round"/><path d="M7 18v-8h23l7 8" fill="none" stroke={C.gold} strokeWidth="3"/><path d="M17 38h42M17 48h32" stroke={C.blue} strokeWidth="2" strokeLinecap="round"/></svg>
      <div dir="rtl" style={{fontFamily:'IBM Plex Sans Arabic',color:C.ivory}}><div style={{fontSize:24,fontWeight:700}}>ملف الصبّة</div><div style={{fontSize:13,color:C.gold,marginTop:7}}>{scene.chapter} • CASE 001</div></div>
    </div>
  </AbsoluteFill>;
}

function SfxPlaylist({fps}){
  return <>{SFX_CUES.map((cue,i)=><Sequence key={`${cue.file}-${i}`} from={Math.max(0,Math.round(cue.at*fps))} durationInFrames={Math.ceil(2.5*fps)}><Audio src={staticFile(cue.file)} volume={cue.v}/></Sequence>)}</>;
}

export const Case001Video = ({audioSeconds=AUDIO_SECONDS}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const time=frame/fps;
  const activeIndex=BASE.reduce((a,s,i)=>s.startFrame<=frame?i:a,0);
  const scene=BASE[activeIndex], local=(frame-scene.startFrame)/fps;
  const activePhoto=PHOTO_INSERTS.find(cue=>time>=cue.s&&time<cue.s+cue.duration);
  const progress=Math.min(1,time/audioSeconds);
  return <AbsoluteFill style={{backgroundColor:C.navy,color:C.ivory,overflow:'hidden',fontFamily:'IBM Plex Sans Arabic'}}>
    <Grid/>
    <div style={{position:'absolute',width:520,height:520,borderRadius:'50%',border:`1px solid ${C.gold}16`,right:-300,top:90,transform:`scale(${1+Math.sin(time/5)*.04})`,zIndex:1}}/>
    <div style={{position:'absolute',left:58,right:58,top:100,bottom:112,display:'grid',gridTemplateColumns:'1.05fr .95fr',gap:38,alignItems:'center',direction:'ltr',zIndex:5}}>
      <div style={{height:400,width:'100%',position:'relative',display:'flex',alignItems:'center',justifyContent:'center',overflow:'visible'}}>
        {scene.visual==='hook'?<HookPhotoVisual time={time}/>:activePhoto?<PhotoInsert time={time} cue={activePhoto}/>:<Visual type={scene.visual} frame={frame-scene.startFrame}/>}
      </div>
      <div dir="rtl" style={{alignSelf:'center',textAlign:'right',padding:'4px 0'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:9,color:C.gold,fontSize:15,fontWeight:700,marginBottom:15}}><span style={{width:8,height:8,borderRadius:8,background:C.gold,boxShadow:`0 0 12px ${C.gold}`}}/>{scene.chapter}</div>
        <h1 style={{fontFamily:'Amiri',fontSize:38,lineHeight:1.35,fontWeight:700,color:C.ivory,margin:'0 0 12px',maxWidth:520}}>{scene.title}</h1>
        <p style={{fontSize:18,lineHeight:1.75,color:C.blue,margin:0,maxWidth:500}}>{scene.subtitle}</p>
        <FocusRibbon scene={scene} local={local}/>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:18,justifyContent:'flex-start'}}>{scene.tags.map((t,i)=><span key={`${scene.id}-${t}`} style={{border:`1px solid ${i===0?C.gold:C.blue}50`,background:i===0?'#D8B46E12':'#8FA8B910',padding:'6px 10px',borderRadius:999,color:i===0?C.gold:C.ivory,fontSize:12}}>{t}</span>)}</div>
      </div>
    </div>
    <div style={{position:'absolute',left:58,right:58,top:91,height:3,zIndex:20,background:'#8FA8B933',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${progress*100}%`,background:`linear-gradient(90deg,${C.gold2},${C.gold})`}}/></div>
    {TRANSITION_EVENTS.map(ev=><ChapterTransition key={ev.nominal} time={time} ev={ev} scene={scene}/>)}
    <AmbientHeader time={time} chapter={scene.chapter}/>
    <KaraokeCaption time={time}/>
    <div style={{position:'absolute',right:55,bottom:124,zIndex:40,fontSize:12,color:C.blue,fontFamily:'IBM Plex Sans Arabic'}}>{new Date(time*1000).toISOString().slice(14,19)}</div>
    <Audio src={staticFile('CASE_001_voiceover_full.mp3')} volume={1}/>
    <SfxPlaylist fps={fps}/>
  </AbsoluteFill>;
};
export const case001Config = {fps:30,width:1280,height:720,durationInFrames:Math.ceil(AUDIO_SECONDS*30)};
