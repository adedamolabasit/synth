import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const STORY_URL = import.meta.env.VITE_STORY_API_URL;
const API_KEY = import.meta.env.VITE_STORY_API_KEY;

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
      const firstAsset = assets[0];

      if (firstAsset && Array.isArray(firstAsset.licenses)) {
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
