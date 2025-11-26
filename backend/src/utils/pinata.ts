import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const PINATA_JWT = process.env.PINATA_JWT!;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY!;
const PINATA_KEY = process.env.PINATA_KEY!;

export interface PinataResult {
  ipfsHash: string;
  url: string;
}

export const uploadToPinata = async (file: Express.Multer.File): Promise<PinataResult> => {
  if (!file) throw new Error("No file provided");

  const filePath = file.path; 
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  try {
    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxBodyLength: Infinity,
      headers: {
        "Authorization": `Bearer ${PINATA_JWT}`,
        ...formData.getHeaders(),
      },
    });


    const ipfsHash = res.data.IpfsHash;
    const gatewayUrl = `${PINATA_GATEWAY}/ipfs/${ipfsHash}?pinataGatewayToken=${PINATA_KEY}`;

    return { ipfsHash, url: gatewayUrl };
  } catch (err: any) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw new Error(err.message || "Failed to upload file to Pinata");
  }
};
