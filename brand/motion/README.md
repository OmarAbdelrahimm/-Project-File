# Remotion Intro settings

The official animated OA logo uses the approved closed-O / open-A mark. Render settings are recorded in `intro-settings.json`; React compositions and the reproducible render script are in `../src/`. Final MOV/MP4 deliverables are maintained on Google Drive only and are deliberately excluded from Git.

Run from the brand source package after `npm ci`:

```bash
npm run render:smoke
```

The preflight render must pass for both aspect ratios before claiming a render-ready release. Alpha validation is performed on ProRes 4444 output; the H.264 MP4 is the navy-background fallback.
