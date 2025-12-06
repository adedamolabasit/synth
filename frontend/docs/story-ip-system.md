# Story Protocol — IP Registration & Licensing

This document describes how Synth registers generated videos as IP on Story and how the license minting flow works.

## Key frontend files

- `src/features/ipAssets/story/RegisterIpAsset.ts` — code that prepares metadata & calls the Story client to register IP.
- `src/features/ipAssets/story/MintIpLicense.ts` — functions for minting a license against an IP asset.
- `src/features/ipAssets/hooks/useStory.ts` — React hook that exposes registration and licensing functions to the UI.
- `src/story/client/storyClient.ts` — Story Protocol client configuration used for signing & RPC calls.
- `src/features/ipAssets/components/RegisterIPModal.tsx` & `LicenseModal.tsx` — UI forms used to register and license.

## Typical registration flow

1. User records a visualizer session and the frontend successfully uploads the video to the backend via `uploadVideo` mutation.
2. Backend pins the video to IPFS (see `backend/src/utils/pinata.ts`) and returns a content URL/CID.
3. The frontend collects metadata:
   - `creatorAddress` (from connected wallet)
   - `videoCid` or `videoUrl`
   - `visualizerTemplate` id
   - `creatorSettings` (JSON)
   - `thumbnailCid` and `renderPreview`
   - `timestamp`
4. `RegisterIpAsset.ts` creates a metadata JSON object and calls `storyClient.registerIp(metadata)` or the Story Protocol contract wrapper.
5. The user signs the registration transaction with their wallet (dynamic wallet connector from `src/provider/IpContext.tsx` or the provider you use).
6. On success, Story returns an `ipId` which is stored in your backend by calling `backend/src/controllers/videoController.ts` to update the video entry (`videoEntry.service.ts`).

## Minting a License

- `MintIpLicense.ts` accepts `ipId`, `licenseTerms` (royalty, allowed uses), and `recipient`.
- The license minting operation creates a token/claim on the Story network binding the license terms to the IP object.
- Frontend displays transaction progress and final license ID.

## Security & UX notes

- Never transmit private keys to the backend; signing must happen client-side using the connected wallet.
- Store only metadata & Story `ipId` on your backend; the canonical asset is the IPFS CID.
- Provide clear UX for gas fees and confirmations — Story transactions may require multiple confirmations.

## Example metadata JSON

```json
{
  "creator": "0x...",
  "videoCid": "ipfs://Qm...",
  "template": "orbitalRings",
  "settings": { /* creator JSON */ },
  "thumbnail": "ipfs://Qm...",
  "timestamp": 1710000000
}
````

---

# `overview.md`

````md
# Synth — Project Overview

This file links the major parts of the repo and provides quick-start instructions for other developers.

## Repo layout (relevant folders)

- `backend/` — Express.js + TypeScript API that handles audio uploads, video uploads, IPFS pinning, and OpenAI calls for lyrics generation.
- `frontend/` — React + TypeScript SPA implementing the workspace, creators, and Story integration.
  - `src/features/workspace/` — workspace UI and Three.js integration
  - `src/studio/` — core visualizer templates, creators, animators, managers
  - `src/features/ipAssets/` — IP dashboard and registration UI
  - `src/story/` — Story client + config

## How to run locally

1. **Backend**
```bash
cd backend
pnpm install # or npm/yarn
cp .env.example .env
# Set PINATA keys, DB URL, STORY config
pnpm run dev
````

2. **Frontend**

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm run dev
# open http://localhost:5173 (or the port Vite prints)
```

## Recommended testing flow

1. Start backend and frontend.
2. Upload an audio file via the audio upload panel.
3. Open the workspace and select a visualizer template.
4. Play the audio and verify the visuals react in real-time.
5. Record a short clip (use `Record` button) and check the uploaded asset in the IP dashboard.
6. Use `Register IP` to create a Story entry and then `Mint License` to create a license.

## Where to add docs in the repo

Create a `/docs` folder at repo root and add:

* `audio-visualizer.md`
* `story-ip-system.md`
* `overview.md`

Commit with a message like: `docs: add visualizer and story protocol documentation`.

---
