import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const PINATA_JWT = process.env.PINATA_JWT!;

export interface PinataResult {
  ipfsHash: string;
  url: string;
}
/**
 * Upload a file to Pinata using the provided Multer file.
 * @param file - The Multer file object from req.file
 */
export const uploadToPinata = async (file: Express.Multer.File): Promise<PinataResult> => {
  if (!file) throw new Error("No file provided");

  console.log(file.path,"pathh")

  const filePath = file.path; // ✅ use Multer’s actual file path
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

    // ✅ Delete the temp file after upload succeeds
    // fs.unlinkSync(filePath);

    const ipfsHash = res.data.IpfsHash;
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    return { ipfsHash, url: gatewayUrl };
  } catch (err: any) {
    // Ensure temp file is removed even on error
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw new Error(err.message || "Failed to upload file to Pinata");
  }
};
