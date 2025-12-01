import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const STORY_URL = "https://staging-api.storyprotocol.net/api/v4";
const API_KEY = "KOTbaGUSWQ6cUJWhiJYiOjPgB0kTRu1eCFFvQL0IWls";

export interface LicenseTerm {
  id: string;
  name?: string;
  details?: any;
}

export function useStory(ipId: string | undefined) {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLicenseTerms = useCallback(async () => {
    if (!ipId) {
      setLicenses([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${STORY_URL}/assets`,
        {
          includeLicenses: true,
          moderated: false,
          orderBy: "blockNumber",
          orderDirection: "desc",
          pagination: {
            limit: 20,
            offset: 0,
          },
          where: {
            ipIds: [ipId],
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": API_KEY,
          },
        }
      );

      const assets = response.data.data ?? [];
      console.log(assets,"assets>>")
      const firstAsset = assets[0];
      console.log(firstAsset,"lll")

      if (firstAsset && Array.isArray(firstAsset.licenses)) {
        console.log(firstAsset.licenses,'first')
        setLicenses(firstAsset.licenses);
      } else {
        setLicenses([]);
      }
    } catch (err: any) {
      setError(err?.response?.data || err.message || "Unknown error");
      setLicenses([]);
    } finally {
      setLoading(false);
    }
  }, [ipId]);

  useEffect(() => {
    fetchLicenseTerms();
  }, [ipId, fetchLicenseTerms]);

  return {
    licenses,
    loading,
    error,
    fetchLicenseTerms,
  };
}
