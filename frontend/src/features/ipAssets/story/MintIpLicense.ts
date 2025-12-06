import { StoryClient } from "@story-protocol/core-sdk";

interface MintProps {
  ipId: `0x${string}`;
  licensstermId: number;
}

export const MintIpLicense = async (
  client: StoryClient,
  mintData: MintProps
) => {
  await client.license.mintLicenseTokens({
    licenseTermsId: mintData.licensstermId,
    licensorIpId: mintData.ipId,
    amount: 1,
  });
};
