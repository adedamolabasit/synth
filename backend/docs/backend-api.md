Synth Backend API Documentation
📌 Overview

The Synth backend handles:

File uploads (audio + video)

Metadata extraction

Whisper-based lyric generation

IPFS upload

Video and audio record management

Story Protocol asset registration

Public REST API with Swagger UI

It is built in Express + TypeScript and organized into a clean service + controller architecture.

🧭 Architecture
/controllers

Handle request/response logic.

audioController.ts

videoController.ts

/services

Encapsulate logic for:

Audio metadata extraction

Whisper transcription

IPFS uploads

Video record processing

Story Protocol communications

/utils

compress.ts – gzip compression

pinata.ts – IPFS upload helpers

logger.ts – API logging

envValidator.ts – environment validation

/middleware

upload.ts – Multer audio/video upload handler

/model

Mongoose schemas:

audioEntry

videoEntry

userEntry

🎵 Audio API
POST /api/audio/upload

Upload audio → extract metadata → transcribe → store in DB.

GET /api/audio/:walletAddress

Get all audio entries for a wallet.

GET /api/audio/details/:id

Retrieve a single audio entry.

🎥 Video API
POST /api/video/upload

Upload the recorded video file (from canvas).

PUT /api/video/register-ip

Update video with Story Protocol IP asset info.

PUT /api/video/publish

Publish video + metadata via Pinata/IPFS.

DELETE /api/video/:id

Delete a user's video.

🧪 Swagger Docs

The backend generates swagger docs using:

/swagger


Open your browser:

http://localhost:3000/api/docs

🔗 Dependencies

OpenAI Whisper (lyrics)

music-metadata (audio analysis)

Pinata (IPFS)

Mongoose (MongoDB)

Story Protocol (IP registration)