import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import chromium from '@sparticuz/chromium';
import {inflate} from './node_modules/@sparticuz/chromium/build/esm/lambdafs.js';
import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia} from '@remotion/renderer';
const here=path.dirname(fileURLToPath(import.meta.url));
const preview=process.argv.includes('--preview');
const outDir=path.resolve(here,'../exports');
fs.mkdirSync(outDir,{recursive:true});
const outputLocation=path.join(outDir,preview?'CASE_001_preview.mp4':'CASE_001_Rough_Cut.mp4');
const serveUrl=await bundle({entryPoint:path.join(here,'index.jsx'),webpackOverride:(config)=>config});
const browserExecutable=await chromium.executablePath();
await inflate(path.join(here,'node_modules','@sparticuz','chromium','bin','al2023.tar.br'));
process.env.LD_LIBRARY_PATH=`/tmp/al2023/lib:${process.env.LD_LIBRARY_PATH||''}`;
const id=preview?'Case001Preview':'Case001Final';
const composition=await selectComposition({serveUrl,id,browserExecutable});
console.log(`Rendering ${id}: ${composition.width}x${composition.height}, ${composition.durationInFrames} frames at ${composition.fps}fps`);
await renderMedia({
  composition,serveUrl,codec:'h264',outputLocation,pixelFormat:'yuv420p',crf:24,
  x264Preset:'veryfast',audioCodec:'aac',audioBitrate:'96k',concurrency:2,
  browserExecutable,chromiumOptions:{gl:'angle'},logLevel:'info',
});
console.log(`Rendered: ${outputLocation}`);
