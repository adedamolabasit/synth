# 🔧 Synth Backend API Documentation

## 📌 Overview

The **Synth Backend** is responsible for all processing, storage, and blockchain interactions.  
It handles:

- File uploads (audio + video)  
- Metadata extraction  
- Whisper-based lyric generation  
- IPFS uploads  
- Video & audio record management  
- Story Protocol asset registration  
- Public REST API with Swagger UI  

The backend is built with **Express + TypeScript** and follows a clean **controller + service architecture**.

---

## 🧭 Architecture

### `/controllers`
Handle request/response logic.

- `audioController.ts`  
- `videoController.ts`  

### `/services`
Encapsulated core logic:

- Audio metadata extraction  
- Whisper transcription  
- IPFS upload operations  
- Video record processing  
- Story Protocol communication  

### `/utils`
Utility helpers:

- `compress.ts` – gzip compression  
- `pinata.ts` – IPFS upload helpers  
- `logger.ts` – API logging  
- `envValidator.ts` – environment validation  

### `/middleware`
- `upload.ts` – Multer handler for audio/video uploads  

### `/model`
Mongoose schemas:

- `audioEntry`  
- `videoEntry`  
- `userEntry`  

---

# 🎵 Audio API

### **POST** `/api/audio/upload`  
Upload audio → extract metadata → transcribe → store in DB.

### **GET** `/api/audio/:walletAddress`  
Fetch all audio entries linked to a wallet.

### **GET** `/api/audio/details/:id`  
Retrieve a single audio entry by ID.

---

# 🎥 Video API

### **POST** `/api/video/upload`  
Upload a finalized visualization video (recorded from canvas).

### **PUT** `/api/video/register-ip`  
Attach Story Protocol IP asset data to the video entry.

### **PUT** `/api/video/publish`  
Upload video + metadata to IPFS (Pinata).

### **DELETE** `/api/video/:id`  
Remove a user's video entry.

---

# Security
✅ Rate Limiting

A custom Express rate-limiter protects all upload routes
to prevent spam, DDoS attempts, and excessive requests.

# Testing 
Unit Tests for File Uploads path

# 🧪 Swagger Documentation

The backend automatically generates Swagger documentation under:


Access it in your browser:

👉 **http://localhost:3000/api/docs**

---

# 🔗 Dependencies

Key technologies powering the backend:

- **OpenAI Whisper** — automatic lyrics generation  
- **music-metadata** — audio metadata extraction  
- **Pinata (IPFS)** — decentralized storage  
- **Mongoose** — MongoDB ORM  
- **Story Protocol SDK** — IP asset registration  
- **Unit test**


---
