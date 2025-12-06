# synth

![TypeScript](https://img.shields.io/badge/-TypeScript-blue?logo=typescript&logoColor=white) ![License](https://img.shields.io/badge/license-ISC-green)

## 📝 Description

Synth is a cutting-edge AI-powered audio-visualization platform designed to revolutionize the way we experience music. Upload your favorite tracks or any audio file and watch as Synth automatically generates accurate lyrics and transforms the sound into breathtaking, dynamic visual experiences. Imagine having a personalized music video created for every song in your library! Built using Express.js and TypeScript for a robust and scalable backend, Synth provides a seamless web-based experience. Furthermore, each generated video is registered on the Story Blockchain as a unique IP asset, empowering users with verifiable ownership and control over their creative content. Synth combines the power of AI, music visualization, and blockchain technology to offer a truly innovative platform for music lovers and creators alike. Featuring a comprehensive API and user-friendly web interface, Synth is poised to become the go-to platform for immersive audio-visual experiences.

## ✨ Features

- 🌐 Api
- 🕸️ Web


## 🛠️ Tech Stack

- 🚀 Express.js
- 📜 TypeScript


## 📦 Key Dependencies

```
axios: ^1.13.2
cors: ^2.8.5
dotenv: ^17.2.3
express: ^5.1.0
form-data: ^4.0.4
formdata-node: ^6.0.3
helmet: ^8.1.0
mongoose: ^8.19.3
morgan: ^1.10.1
multer: ^2.0.2
music-metadata: ^11.10.0
openai: ^6.8.1
pako: ^2.1.0
swagger-jsdoc: ^6.2.8
swagger-ui-express: ^5.0.1
```

## 🚀 Run Commands

- **dev**: `npm run dev`
- **build**: `npm run build`
- **start**: `npm run start`


## 📁 Project Structure

```
.
├── backend
│   ├── package.json
│   ├── src
│   │   ├── app.ts
│   │   ├── config
│   │   │   ├── config.ts
│   │   │   └── db.ts
│   │   ├── controllers
│   │   │   ├── audioController.ts
│   │   │   └── videoController.ts
│   │   ├── middleware
│   │   │   └── upload.ts
│   │   ├── model
│   │   │   ├── audioEntry.model.ts
│   │   │   ├── userEntry.model.ts
│   │   │   └── videoEntry.model.ts
│   │   ├── routes
│   │   │   ├── audioRoutes.ts
│   │   │   └── videoRoutes.ts
│   │   ├── server.ts
│   │   ├── services
│   │   │   ├── audioEntry.service.ts
│   │   │   ├── openaiService.ts
│   │   │   └── videoEntry.service.ts
│   │   ├── types
│   │   │   └── index.ts
│   │   └── utils
│   │       ├── compress.ts
│   │       ├── envValidator.ts
│   │       ├── logger.ts
│   │       └── pinata.ts
│   ├── swagger.ts
│   ├── tmp-1764202951380-soul-vlog-background-349590.mp3
│   ├── tmp-1764529034315-alex-productions-epic-cinematic-trailer-elite(chosic.com).mp3
│   ├── tmp-1764530539526-alex-productions-epic-cinematic-trailer-elite(chosic.com).mp3
│   ├── tmp-1764530945156-Aimless-Lyrics(chosic.com).mp3
│   ├── tmp-1764536204527-alex-productions-epic-cinematic-trailer-elite(chosic.com).mp3
│   ├── tmp-1764625867073-alex-productions-epic-cinematic-trailer-elite(chosic.com).mp3
│   ├── tmp-1764638785350-blues-road-blues-slow-tempo-female-vocal-guitar-solo-lyrics-317775.mp3
│   ├── tmp-1764638822014-inner-world-1-original-lyrics-335827.mp3
│   ├── tmp-1764638854939-peaceful-147904.mp3
│   ├── tmp-1764723227301-inner-world-1-original-lyrics-335827.mp3
│   ├── tmp-1764900629516-scott-buckley-i-walk-with-ghosts(chosic.com).mp3
│   ├── tmp-1764901318357-sweet-life-luxury-chill-438146.mp3
│   ├── tsconfig.json
│   └── types
│       └── swagger-jsdoc.d.ts
└── frontend
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── src
    │   ├── App.tsx
    │   ├── api
    │   │   ├── client.ts
    │   │   ├── mutations
    │   │   │   ├── deleteVideo.ts
    │   │   │   ├── updateIpRegistration .ts
    │   │   │   ├── updatePublication.ts
    │   │   │   ├── uploadAudio.ts
    │   │   │   └── uploadVideo.ts
    │   │   └── queries
    │   │       ├── getAudio.ts
    │   │       ├── getAudioByWallet.ts
    │   │       ├── getVideoById.ts
    │   │       └── getWalletVideos.ts
    │   ├── components
    │   │   ├── common
    │   │   │   └── Toast
    │   │   │       ├── ToastContainer.tsx
    │   │   │       ├── ToastProvider.tsx
    │   │   │       ├── index.tsx
    │   │   │       └── useToast.ts
    │   │   ├── layouts
    │   │   │   ├── Sidebar.tsx
    │   │   │   └── StatusBar.tsx
    │   │   └── ui
    │   │       ├── Badge.tsx
    │   │       ├── Button.tsx
    │   │       ├── Card.tsx
    │   │       ├── Input.tsx
    │   │       ├── Input2.tsx
    │   │       ├── Slider.tsx
    │   │       └── Switch.tsx
    │   ├── features
    │   │   ├── audio
    │   │   │   ├── components
    │   │   │   │   ├── AudioUploadPanel.tsx
    │   │   │   │   └── MusicPlayerPanel.tsx
    │   │   │   └── types.ts
    │   │   ├── ipAssets
    │   │   │   ├── components
    │   │   │   │   ├── DashboardHeader.tsx
    │   │   │   │   ├── LicenseModal.tsx
    │   │   │   │   ├── RegisterIPModal.tsx
    │   │   │   │   ├── StatsGrid.tsx
    │   │   │   │   ├── VideoCard.tsx
    │   │   │   │   ├── VideoGrid.tsx
    │   │   │   │   └── WalletCard.tsx
    │   │   │   ├── hooks
    │   │   │   │   ├── useStory.ts
    │   │   │   │   ├── useVideoThumbnails.ts
    │   │   │   │   └── useVideos.ts
    │   │   │   ├── index.tsx
    │   │   │   ├── story
    │   │   │   │   ├── MintIpLicense.ts
    │   │   │   │   └── RegisterIpAsset.ts
    │   │   │   ├── types.ts
    │   │   │   └── utils
    │   │   │       ├── formatter.ts
    │   │   │       └── hash.ts
    │   │   ├── video
    │   │   │   ├── components
    │   │   │   │   ├── EmptyState.tsx
    │   │   │   │   ├── LoadingState.tsx
    │   │   │   │   ├── VideoCard.tsx
    │   │   │   │   ├── VideoDetailView.tsx
    │   │   │   │   ├── VideoGallery.tsx
    │   │   │   │   ├── VideoInfo.tsx
    │   │   │   │   ├── VideoPlayerHeader.tsx
    │   │   │   │   └── VideoSidebar.tsx
    │   │   │   ├── hooks
    │   │   │   │   ├── useVideoHover.ts
    │   │   │   │   ├── useVideoThumbnails.ts
    │   │   │   │   └── useVideos.ts
    │   │   │   ├── index.tsx
    │   │   │   └── utils
    │   │   │       └── videoUtils.ts
    │   │   └── workspace
    │   │       ├── components
    │   │       │   ├── AudioVisualization.tsx
    │   │       │   ├── CanvasControls.tsx
    │   │       │   ├── CanvasRenderer.tsx
    │   │       │   ├── ControlsPanel.tsx
    │   │       │   ├── CustomSwitch.tsx
    │   │       │   ├── Modals.tsx
    │   │       │   ├── SlidersPanel.tsx
    │   │       │   └── VisualizerLibrary.tsx
    │   │       ├── hooks
    │   │       │   ├── useAudioSync.ts
    │   │       │   ├── useCanvasAnimation.ts
    │   │       │   ├── useLivePreview.ts
    │   │       │   └── useThreeSetup.ts
    │   │       ├── index.tsx
    │   │       └── utils
    │   │           └── index.ts
    │   ├── hooks
    │   │   ├── useDeleteVideo.ts
    │   │   ├── useGetAudio.ts
    │   │   ├── useGetAudioByWallet.ts
    │   │   ├── useGetVideoById.ts
    │   │   ├── useGetVideosByWallet.ts
    │   │   ├── useUpdateIp.ts
    │   │   ├── useUpdatePublication.ts
    │   │   ├── useUploadAudio.ts
    │   │   └── useUploadVideo.ts
    │   ├── index.css
    │   ├── main.tsx
    │   ├── pages
    │   │   └── dashboard
    │   │       └── WorkspaceLayout.tsx
    │   ├── provider
    │   │   ├── AudioContext.tsx
    │   │   ├── IpContext.tsx
    │   │   ├── QueryProvider.tsx
    │   │   ├── VisualizerContext.tsx
    │   │   └── config.ts
    │   ├── shared
    │   │   ├── config
    │   │   │   └── audio.config.ts
    │   │   ├── types
    │   │   │   ├── audio.types.ts
    │   │   │   └── visualizer.types.ts
    │   │   └── utils
    │   │       ├── index.ts
    │   │       └── pinata.ts
    │   ├── story
    │   │   ├── client
    │   │   │   └── storyClient.ts
    │   │   ├── config.ts
    │   │   └── utils.ts
    │   ├── studio
    │   │   ├── effects
    │   │   │   ├── audioEffects.ts
    │   │   │   ├── gsapAnimations.ts
    │   │   │   └── postprocessing.ts
    │   │   ├── types
    │   │   │   └── visualizer.ts
    │   │   ├── utils
    │   │   │   └── sceneRecorder.ts
    │   │   └── visualizers
    │   │       ├── Elements
    │   │       │   ├── ElementCustomizationPanel.tsx
    │   │       │   └── VisualElementSelector.tsx
    │   │       ├── animators
    │   │       │   ├── audioReactive.ts
    │   │       │   ├── auroraWaves.ts
    │   │       │   ├── biomorphic.ts
    │   │       │   ├── celestialOrbit.ts
    │   │       │   ├── celestialSymphony.ts
    │   │       │   ├── cosmicWeb.ts
    │   │       │   ├── crystalCave.ts
    │   │       │   ├── crystalLattice.ts
    │   │       │   ├── crystalMatrix.ts
    │   │       │   ├── crystalResonance.ts
    │   │       │   ├── cyberGrid.ts
    │   │       │   ├── cyberGrid2.ts
    │   │       │   ├── dimensionalGateway.ts
    │   │       │   ├── dnaHelix.ts
    │   │       │   ├── dnaOrigami.ts
    │   │       │   ├── electromagneticField.ts
    │   │       │   ├── fibonacciSpiral.ts
    │   │       │   ├── fireRings.ts
    │   │       │   ├── fractalExpansion.ts
    │   │       │   ├── fractalTree.ts
    │   │       │   ├── geometric.ts
    │   │       │   ├── hexagonalGrid.ts
    │   │       │   ├── holographicGrid.ts
    │   │       │   ├── index.ts
    │   │       │   ├── kaliedoscope.ts
    │   │       │   ├── lightningStorm.ts
    │   │       │   ├── liquid.ts
    │   │       │   ├── liquidMercury.ts
    │   │       │   ├── mandala.ts
    │   │       │   ├── mobiusStrip.ts
    │   │       │   ├── moleculeBonds.ts
    │   │       │   ├── morphing.ts
    │   │       │   ├── morphingCrystals.ts
    │   │       │   ├── nebulaCloud.ts
    │   │       │   ├── neuralCosmos.ts
    │   │       │   ├── neuralFireworks.ts
    │   │       │   ├── neuralNetwork.ts
    │   │       │   ├── orbitalRings.ts
    │   │       │   ├── particleWave.ts
    │   │       │   ├── plasmaField.ts
    │   │       │   ├── plasmaStorm.ts
    │   │       │   ├── quantumField.ts
    │   │       │   ├── quantumFlux.ts
    │   │       │   ├── quantumFoam.ts
    │   │       │   ├── sacredGeometry.ts
    │   │       │   ├── solarFlare.ts
    │   │       │   ├── spectrum.ts
    │   │       │   ├── spiralArms.ts
    │   │       │   ├── supernova.ts
    │   │       │   ├── tesseract.ts
    │   │       │   ├── timeVortex.ts
    │   │       │   ├── toroidalField.ts
    │   │       │   ├── voronoiCells.ts
    │   │       │   ├── warpTunnel.ts
    │   │       │   └── waveform3D.ts
    │   │       ├── creators
    │   │       │   ├── audioReactive.ts
    │   │       │   ├── auroraWaves.ts
    │   │       │   ├── biomorphic.ts
    │   │       │   ├── celestialOrbit.ts
    │   │       │   ├── celestialSymphony.ts
    │   │       │   ├── cosmicWeb.ts
    │   │       │   ├── crystalCave.ts
    │   │       │   ├── crystalLattice.ts
    │   │       │   ├── crystalMatrix.ts
    │   │       │   ├── crystalResonance.ts
    │   │       │   ├── cyberGrid.ts
    │   │       │   ├── cyberGrid2.ts
    │   │       │   ├── dimensionalGateway.ts
    │   │       │   ├── dnaHelix.ts
    │   │       │   ├── dnaOrigami.ts
    │   │       │   ├── electromagneticField.ts
    │   │       │   ├── fibonacciSpiral.ts
    │   │       │   ├── fireRings.ts
    │   │       │   ├── fractalExpansion.ts
    │   │       │   ├── fractalTree.ts
    │   │       │   ├── geometric.ts
    │   │       │   ├── hexagonalGrid.ts
    │   │       │   ├── holographicGrid.ts
    │   │       │   ├── index.ts
    │   │       │   ├── kaliedoscope.ts
    │   │       │   ├── lightningStorm.ts
    │   │       │   ├── liquid.ts
    │   │       │   ├── liquidMercury.ts
    │   │       │   ├── mandala.ts
    │   │       │   ├── mobiusStrip.ts
    │   │       │   ├── moleculeBonds.ts
    │   │       │   ├── morphing.ts
    │   │       │   ├── morphingCrystals.ts
    │   │       │   ├── nebulaCloud.ts
    │   │       │   ├── neuralCosmos.ts
    │   │       │   ├── neuralFireworks.ts
    │   │       │   ├── neuralNetwork.ts
    │   │       │   ├── orbitalRings.ts
    │   │       │   ├── particleWave.ts
    │   │       │   ├── plasmaField.ts
    │   │       │   ├── plasmaStorm.ts
    │   │       │   ├── quantumField.ts
    │   │       │   ├── quantumFlux.ts
    │   │       │   ├── quantumFoam.ts
    │   │       │   ├── sacredGeometry.ts
    │   │       │   ├── solarFlare.ts
    │   │       │   ├── spectrum.ts
    │   │       │   ├── spiralArms.ts
    │   │       │   ├── supernova.ts
    │   │       │   ├── tesseract.ts
    │   │       │   ├── timeVortex.ts
    │   │       │   ├── toroidalField.ts
    │   │       │   ├── voronoiCells.ts
    │   │       │   ├── warpTunnel.ts
    │   │       │   └── waveform3D.ts
    │   │       └── manager
    │   │           ├── AudioManager.ts
    │   │           ├── ElementRendererManager.ts
    │   │           ├── LyricsManager.ts
    │   │           ├── LyricsRenderer.ts
    │   │           └── VisualizerManager.ts
    │   ├── styles
    │   │   └── theme.ts
    │   └── vite-env.d.ts
    ├── tailwind.config.js
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── vite.config.ts
```

## 👥 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/adedamolabasit/synth.git`
3. **Create** a new branch: `git checkout -b feature/your-feature`
4. **Commit** your changes: `git commit -am 'Add some feature'`
5. **Push** to your branch: `git push origin feature/your-feature`
6. **Open** a pull request

Please ensure your code follows the project's style guidelines and includes tests where applicable.

## 📜 License

This project is licensed under the ISC License.

---
*This README was generated with ❤️ by ReadmeBuddy*