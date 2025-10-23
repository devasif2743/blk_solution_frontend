import React, { useState } from "react";

const LocationFetcher = () => {
  const [coords, setCoords] = useState({ lat: "", lon: "" });
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch full address including locality
  const getAddressFromCoords = async (lat, lon) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;

        // ✅ Safely pick locality from multiple possible fields
        const locality =
          addr.suburb ||
          addr.neighbourhood ||
          addr.village ||
          addr.town ||
          addr.city_district ||
          addr.city ||
          "N/A";

        setAddress({
          fullAddress: data.display_name,
          locality,
          district: addr.county || addr.city || "N/A",
          state: addr.state || "N/A",
          country: addr.country || "N/A",
          pincode: addr.postcode || "N/A",
        });
      } else {
        setAddress(null);
        alert("No address found for these coordinates.");
      }
    } catch (err) {
      console.error("Error fetching address:", err);
      alert("Failed to fetch address.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Auto-detect user location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported!");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        getAddressFromCoords(latitude, longitude);
      },
      (err) => {
        console.error(err);
        alert("Location access denied or failed.");
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📍 Get Address & Locality from Lat / Lon</h2>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={coords.lat}
          onChange={(e) => setCoords({ ...coords, lat: e.target.value })}
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={coords.lon}
          onChange={(e) => setCoords({ ...coords, lon: e.target.value })}
        />
        <button onClick={() => getAddressFromCoords(coords.lat, coords.lon)}>
          Get Address
        </button>
        <button onClick={detectLocation}>Use My Location</button>
      </div>

      {loading && <p>Loading...</p>}

      {address && (
        <div style={{ marginTop: "20px", lineHeight: "1.6" }}>
          <strong>Full Address:</strong> {address.fullAddress} <br />
          <strong>Locality:</strong> {address.locality} <br />
          <strong>District:</strong> {address.district} <br />
          <strong>State:</strong> {address.state} <br />
          <strong>Country:</strong> {address.country} <br />
          <strong>Pincode:</strong> {address.pincode}
        </div>
      )}
    </div>
  );
};

export default LocationFetcher;
