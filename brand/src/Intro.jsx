import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

const GOLD='#D8B46E';
const IVORY='#F4EFE5';
const NAVY='#122536';

function Mark({size=360}) {
  return <svg width={size} height={size} viewBox="0 0 128 128" aria-hidden="true">
    <path fillRule="evenodd" d="M27.5 77.1V53.4C27.5 34.7 35.2 26.1 50.9 26.1S74.2 34.7 74.2 53.4V77.1C74.2 84.5 70.4 88.3 63 88.3H38.7C31.4 88.3 27.5 84.5 27.5 77.1ZM37.3 76.6C37.3 78.8 38 79.8 40.5 79.8H61.3C63.5 79.8 64.5 78.8 64.5 76.6V53.8C64.5 41.1 60.8 35.8 50.9 35.8S37.3 41.1 37.3 53.8Z" fill={IVORY}/>
    <path fillRule="evenodd" d="M72.6 88.3L87.8 30.1Q89.1 25.3 93.6 25.3Q98.1 25.3 99.4 30.1L114.6 88.3H104L100.6 74.1H86.6L83.2 88.3Z M87.7 63.8L93.6 42.2L99.5 63.8Z" fill={IVORY}/>
    <path d="M85.3 65.9H102" stroke={GOLD} strokeWidth="3.5" strokeLinecap="square"/>
  </svg>;
}

export const ProjectFileIntro = ({vertical=false,opaque=false}) => {
  const frame=useCurrentFrame();
  const {fps,width,height}=useVideoConfig();
  const open=interpolate(frame,[0,11,24],[0,1,1],{extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
  const sheetY=interpolate(frame,[0,8,24],[height*.15,height*.02,0],{extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
  const iconScale=interpolate(frame,[12,24,36],[.72,1.035,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
  const iconOpacity=interpolate(frame,[9,20],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const lineWidth=interpolate(frame,[17,33],[0,vertical?390:580],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.quad)});
  const cx=width/2, cy=height*(vertical?.45:.48);
  const folderW=vertical?width*.76:width*.54;
  const folderH=vertical?height*.31:height*.48;
  const folderX=cx-folderW/2, folderY=cy-folderH*.30;
  const flapY=folderY-folderH*.22;
  const gridOpacity=interpolate(frame,[8,21,45],[0,.22,.13],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return <AbsoluteFill style={{backgroundColor:opaque?NAVY:'transparent',overflow:'hidden'}}>
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position:'absolute',inset:0}}>
      <defs>
        <linearGradient id="sheet" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#F4EFE5"/><stop offset="1" stopColor="#D5D3CC"/></linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%"><feGaussianBlur stdDeviation="22"/></filter>
      </defs>
      <g opacity={gridOpacity} stroke="#93AFC2" strokeWidth="2">
        {Array.from({length:13},(_,i)=><React.Fragment key={i}><path d={`M${width*.16+i*width*.057} ${height*.08}V${height*.91}`}/><path d={`M${width*.12} ${height*.12+i*height*.064}H${width*.88}`}/></React.Fragment>)}
      </g>
      <ellipse cx={cx} cy={folderY+folderH*.66} rx={folderW*.56} ry={folderH*.20} fill="#000" opacity=".36" filter="url(#shadow)"/>
      <g opacity={open}>
        <path d={`M${folderX} ${folderY+folderH*.28} L${folderX+folderW*.18} ${folderY} H${folderX+folderW*.76} L${folderX+folderW} ${folderY+folderH*.26} V${folderY+folderH} H${folderX}Z`} fill={NAVY} stroke={GOLD} strokeWidth={Math.max(3,width*.0025)}/>
        <path d={`M${folderX+folderW*.06} ${flapY+sheetY} L${folderX+folderW*.30} ${flapY-folderH*.25+sheetY} L${folderX+folderW*.94} ${flapY+sheetY} L${folderX+folderW*.77} ${folderY+folderH*.37}Z`} fill="#243C4E" stroke={GOLD} strokeWidth={Math.max(3,width*.0025)}/>
        <path d={`M${folderX+folderW*.23} ${folderY+folderH*.22} L${folderX+folderW*.36} ${folderY-folderH*.02} L${folderX+folderW*.72} ${folderY+folderH*.07} L${folderX+folderW*.59} ${folderY+folderH*.34}Z`} fill="url(#sheet)" stroke="#B78E45" strokeWidth="3"/>
        <path d={`M${folderX+folderW*.39} ${folderY+folderH*.12}L${folderX+folderW*.65} ${folderY+folderH*.19}M${folderX+folderW*.36} ${folderY+folderH*.19}L${folderX+folderW*.61} ${folderY+folderH*.26}`} stroke={NAVY} strokeWidth="3" opacity=".6"/>
      </g>
    </svg>
    <div style={{position:'absolute',left:cx,top:cy,transform:`translate(-50%,-50%) scale(${iconScale})`,opacity:iconOpacity,filter:'drop-shadow(0 14px 24px rgba(0,0,0,.34))'}}>
      <Mark size={vertical?width*.44:Math.min(height*.40,width*.24)}/>
    </div>
    <div style={{position:'absolute',left:cx,top:cy+(vertical?height*.16:height*.18),width:lineWidth,height:4,background:GOLD,transform:'translateX(-50%)',boxShadow:'0 0 14px rgba(216,180,110,.25)'}}/>
  </AbsoluteFill>;
};
