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
