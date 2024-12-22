import React, { useEffect, useState } from "react";
import { useSecureData } from "./useSecureData.tsx";

const API_URL = "http://localhost:8080";

function App() {
  const [data, setData] = useState("");
  const {
    data: trustedData,
    isCompromised,
    saveData,
    verifyData,
    recoverData,
  } = useSecureData();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const response = await fetch(API_URL);
    const { data } = await response.json();
    setData(data);
    await verifyData(data);
  };

  const updateData = async () => {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ data }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    await saveData(data);
  };

  const handleRecoverData = async () => {
    await recoverData();
    setData(trustedData);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        position: "absolute",
        padding: 0,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
        fontSize: "30px",
      }}
    >
      <div>Saved Data</div>
      <input
        style={{ fontSize: "30px" }}
        type="text"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button style={{ fontSize: "20px" }} onClick={updateData}>
          Update Data
        </button>
        <button style={{ fontSize: "20px" }} onClick={getData}>
          Verify Data
        </button>
        {isCompromised && (
          <button style={{ fontSize: "20px" }} onClick={handleRecoverData}>
            Recover Data
          </button>
        )}
      </div>
      {isCompromised && (
        <div style={{ color: "red", fontSize: "16px" }}>
          Warning: Server data has been tampered with!
        </div>
      )}
    </div>
  );
}

export default App;
