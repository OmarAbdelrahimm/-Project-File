import path from 'node:path';
import {pathToFileURL} from 'node:url';
import chromium from '@sparticuz/chromium';
import {inflate} from './node_modules/@sparticuz/chromium/build/esm/lambdafs.js';
import puppeteer from 'puppeteer-core';
const here=path.dirname(new URL(import.meta.url).pathname);
const pageFile=path.resolve(here,'../v3/00_Approval_Preview/brand-kit.html');
const executablePath=await chromium.executablePath();
await inflate(path.join(here,'node_modules/@sparticuz/chromium/bin/al2023.tar.br'));
process.env.LD_LIBRARY_PATH=`/tmp/al2023/lib:${process.env.LD_LIBRARY_PATH||''}`;
const browser=await puppeteer.launch({executablePath,args:chromium.args,headless:true,defaultViewport:{width:1440,height:1050,deviceScaleFactor:1}});
try{
 const page=await browser.newPage();
 await page.goto(pathToFileURL(pageFile).href,{waitUntil:'load',timeout:120000});
 await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:'/tmp/brand-kit-v3-top.png'});
 const result=await page.evaluate(()=>({title:document.title,sections:document.querySelectorAll('main section').length,nav:document.querySelectorAll('#quicknav a').length,inventory:document.querySelectorAll('#inventoryTable tbody tr').length,images:[...document.images].map(i=>({alt:i.alt,ok:i.complete&&i.naturalWidth>0,w:i.naturalWidth,h:i.naturalHeight})),videoSources:[...document.querySelectorAll('video')].map(v=>({type:v.canPlayType('video/mp4'),src:v.querySelector('source')?.src?.slice(0,22)})),fontAmiri:document.fonts.check('700 24px Amiri'),fontPlex:document.fonts.check('700 24px Plex')}));
 console.log(JSON.stringify(result,null,2));
 const broken=result.images.filter(i=>!i.ok); if(broken.length) process.exitCode=2;
 if(!result.title.includes('Brand Kit v3')||result.sections<10||result.nav<8||result.inventory<60||!result.fontAmiri||!result.fontPlex)process.exitCode=3;
} finally {await browser.close();}
