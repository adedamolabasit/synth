import { StoryClient } from "@story-protocol/core-sdk";
import { parseEther } from "viem";

interface MintProps {
  ipId: `0x${string}`;
  licensstermId: number;
}

export const MintIpLicense = async (
  client: StoryClient,
  mintData: MintProps
) => {
  
  const response = await client.license.mintLicenseTokens({
    licenseTermsId: mintData.licensstermId,
    licensorIpId: mintData.ipId,
    amount: 1,
  });

      console.log('License minted:', {
        'Transaction Hash': response.txHash,
        'License Token IDs': response.licenseTokenIds,
    })
};
