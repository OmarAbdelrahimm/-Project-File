import React from 'react';
import {Composition} from 'remotion';
import {ProjectFileIntro} from './Intro.jsx';

export const RemotionRoot = () => <>
  <Composition id="BrandIntroHorizontal" component={ProjectFileIntro} durationInFrames={45} fps={30} width={1920} height={1080} defaultProps={{vertical:false}} />
  <Composition id="BrandIntroVertical" component={ProjectFileIntro} durationInFrames={45} fps={30} width={1080} height={1920} defaultProps={{vertical:true}} />
</>;
