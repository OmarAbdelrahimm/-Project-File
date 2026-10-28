import React from 'react';
import {Composition} from 'remotion';
import {ProjectFileIntro} from './Intro.jsx';
import {Case001Video,case001Config} from './Case001Video.jsx';
import {Case001HookV2,hookV2Config} from './Case001HookV2.jsx';

export const RemotionRoot = () => <>
  <Composition id="BrandIntroHorizontal" component={ProjectFileIntro} durationInFrames={45} fps={30} width={1920} height={1080} defaultProps={{vertical:false}} />
  <Composition id="BrandIntroVertical" component={ProjectFileIntro} durationInFrames={45} fps={30} width={1080} height={1920} defaultProps={{vertical:true}} />
  <Composition id="Case001Preview" component={Case001Video} durationInFrames={240} fps={30} width={case001Config.width} height={case001Config.height} defaultProps={{audioSeconds:8}} />
  <Composition id="Case001Final" component={Case001Video} durationInFrames={case001Config.durationInFrames} fps={case001Config.fps} width={case001Config.width} height={case001Config.height} defaultProps={{audioSeconds:case001Config.durationInFrames/case001Config.fps}} />
  <Composition id={hookV2Config.id} component={Case001HookV2} durationInFrames={hookV2Config.durationInFrames} fps={hookV2Config.fps} width={hookV2Config.width} height={hookV2Config.height} />
</>;
