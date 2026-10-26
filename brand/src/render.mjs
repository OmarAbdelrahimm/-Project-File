import path from 'node:path';
import {fileURLToPath} from 'node:url';
import chromium from '@sparticuz/chromium';
import {inflate} from './node_modules/@sparticuz/chromium/build/esm/lambdafs.js';
import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia} from '@remotion/renderer';
const here=path.dirname(fileURLToPath(import.meta.url));
const outputFromRepo=path.resolve(here,'../v3/00_Approval_Preview/assets');
const outputBesideSource=path.resolve(here,'../assets');
const out=(await import('node:fs')).existsSync(outputFromRepo)?outputFromRepo:outputBesideSource;
const serveUrl=await bundle({entryPoint:path.join(here,'index.jsx'),webpackOverride:(config)=>config});
const browserExecutable=await chromium.executablePath();
const al2023Libs=path.join(here,'node_modules','@sparticuz','chromium','bin','al2023.tar.br');
await inflate(al2023Libs);
process.env.LD_LIBRARY_PATH=`/tmp/al2023/lib:${process.env.LD_LIBRARY_PATH||''}`;
console.log('Chromium:',browserExecutable,'; bundled Linux libs:',process.env.LD_LIBRARY_PATH);
for(const [id,vertical] of [['BrandIntroHorizontal',false],['BrandIntroVertical',true]]){
  const composition=await selectComposition({serveUrl,id,browserExecutable});
  if(composition.durationInFrames!==45 || composition.fps!==30) throw new Error('Duration/fps mismatch');
  const alpha=path.join(out,`animated-logo-intro-${vertical?'9x16':'16x9'}-alpha.mov`);
  await renderMedia({composition,serveUrl,codec:'prores',proResProfile:'4444',outputLocation:alpha,pixelFormat:'yuva444p10le',imageFormat:'png',concurrency:2,browserExecutable,chromiumOptions:{gl:'angle'},muted:true,logLevel:'error'});
  console.log('Rendered ProRes 4444 alpha:',alpha);
  const mp4=path.join(out,`animated-logo-intro-${vertical?'9x16':'16x9'}-navy.mp4`);
  await renderMedia({composition,serveUrl,codec:'h264',outputLocation:mp4,pixelFormat:'yuv420p',crf:22,concurrency:2,browserExecutable,chromiumOptions:{gl:'angle'},muted:true,logLevel:'error',inputProps:{vertical,opaque:true}});
  console.log('Rendered fallback MP4:',mp4);
}
