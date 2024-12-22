import { useState, useEffect } from "react";

const DEMO_KEY = {
  kty: "oct",
  k: btoa("tszwai"),
  alg: "HS256",
  ext: true,
  key_ops: ["sign", "verify"],
};

export function useSecureData() {
  const [data, setData] = useState("");
  const [isCompromised, setIsCompromised] = useState(false);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);

  // Initialize the demo key
  useEffect(() => {
    window.crypto.subtle
      .importKey("jwk", DEMO_KEY, { name: "HMAC", hash: "SHA-256" }, true, [
        "sign",
        "verify",
      ])
      .then((key) => setCryptoKey(key));
  }, []);

  /** save the incoming trusted data */
  const saveData = async (newValue: string) => {
    if (!cryptoKey) return false;

    try {
      const signature = await window.crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        new TextEncoder().encode(newValue)
      );

      localStorage.setItem(
        "secureData",
        JSON.stringify({
          value: newValue,
          signature: Array.from(new Uint8Array(signature)),
        })
      );

      setData(newValue);
      setIsCompromised(false);
      return true;
    } catch (error) {
      console.error("Save failed:", error);
      return false;
    }
  };

  /** Verify the incoming data, if it is trusted, save it */
  const verifyData = async (incomingData: string) => {
    if (!cryptoKey) return false;

    const stored = localStorage.getItem("secureData");
    if (!stored) {
      await saveData(incomingData);
      return true;
    }

    try {
      const parsed = JSON.parse(stored);
      const isValid = await window.crypto.subtle.verify(
        "HMAC",
        cryptoKey,
        new Uint8Array(parsed.signature).buffer,
        new TextEncoder().encode(parsed.value)
      );

      if (!isValid || parsed.value !== incomingData) {
        setIsCompromised(true);
        return false;
      }

      setIsCompromised(false);
      return true;
    } catch (error) {
      console.error("Verification failed:", error);
      return false;
    }
  };

  // recover the data from the most recent stored data and update the state
  // return false if no data is stored or cryptoKey is not initialized
  const recoverData = async () => {
    if (!cryptoKey) return false;

    const stored = localStorage.getItem("secureData");
    if (!stored) return false;

    try {
      const parsed = JSON.parse(stored);
      const isValid = await window.crypto.subtle.verify(
        "HMAC",
        cryptoKey,
        new Uint8Array(parsed.signature).buffer,
        new TextEncoder().encode(parsed.value)
      );

      if (isValid) {
        setData(parsed.value);
        setIsCompromised(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Recovery failed:", error);
      return false;
    }
  };

  return { data, setData, isCompromised, saveData, verifyData, recoverData };
}
