import { LicenseTerms, StoryClient } from "@story-protocol/core-sdk";
import { uploadJSONToIPFS } from "../../../shared/utils/pinata";
import { SPGNFTContractAddress } from "../../../story/utils";
import { IpMetadata } from "@story-protocol/core-sdk";
import { IPRegistrationData, RegisteredIpAssetParams } from "../types";
import { sha256Hash } from "../utils/hash";

export const RegisterIpAsset = async (
  client: StoryClient,
  registrationData: IPRegistrationData
): Promise<RegisteredIpAssetParams> => {
  const {
    title,
    description,
    creators,
    video,
    licenseTerms,
  } = registrationData;

  console.log(registrationData, "registration data");

  const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
    title: title,
    description: description,
    createdAt: new Date().toISOString(),
    creators: creators,
    image: video.thumbnailUrl,
    imageHash: video.videoHash as `0x${string}`,
    mediaUrl: video.videoUrl,
    mediaHash: video.videoHash as `0x${string}`,
    mediaType: video.metadata.type,
  });

  const nftMetadata = {
    name: title,
    description: description,
    image: video.thumbnailUrl,
    attributes: [
      {
        key: "Name",
        value: video.metadata.name,
      },
      {
        key: "Size",
        value: video.metadata.size,
      },
      {
        key: "Type",
        value: video.metadata.type,
      },
      {
        key: "Duration",
        value: video.metadata.duration,
      },
    ],
  };

  const [ipIpfsHash, nftIpfsHash] = await Promise.all([
    uploadJSONToIPFS(ipMetadata),
    uploadJSONToIPFS(nftMetadata),
  ]);

  const ipHash = await sha256Hash(ipMetadata);

  const nftHash = await sha256Hash(nftMetadata);
console.log(licenseTerms,"pppppp")
  const response = await client?.ipAsset.registerIpAsset({
    spgNftContract: SPGNFTContractAddress,
    nft: {
      type: "mint",
      spgNftContract: SPGNFTContractAddress,
    },
    licenseTermsData: [
      {
        terms: licenseTerms as LicenseTerms,
      },
    ],
    ipMetadata: {
      ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
      ipMetadataHash: `0x${ipHash}`,
      nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
      nftMetadataHash: `0x${nftHash}`,
    },
  });

  return {
    ipId: response.ipId,
    status: "registered",
    tokenId: response.tokenId,
  };
};
