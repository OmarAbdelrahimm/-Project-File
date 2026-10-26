const fs=require('fs');
const path=require('path');
const {Resvg}=require('@resvg/resvg-js');
const dir=process.argv[2];
if(!dir) throw new Error('Usage: node render_svg_assets.cjs <asset-directory>');
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.svg'))){
 const src=path.join(dir,f), svg=fs.readFileSync(src,'utf8');
 const m=svg.match(/<svg[^>]*width="(\d+)"[^>]*height="(\d+)"/);
 if(!m) throw new Error('No explicit dimensions in '+f);
 const width=+m[1],height=+m[2];
 const png=new Resvg(svg,{fitTo:{mode:'original'},font:{loadSystemFonts:false}}).render().asPng();
 fs.writeFileSync(path.join(dir,f.replace(/\.svg$/,'.png')),png);
 console.log(f,width+'x'+height,png.length);
}
