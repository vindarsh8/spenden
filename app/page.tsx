"use client";

import { useState } from "react";

const items = [
  ["👕", "Clothes"],
  ["📚", "Books"],
  ["♻️", "Plastic"],
  ["💻", "Electronics"],
];

export default function Home() {
  const [screen, setScreen] = useState("home");

  const [phone, setPhone] = useState("");
  const [usePhone, setUsePhone] = useState(false);

  const [item, setItem] = useState("");

  const [locationMethod, setLocationMethod] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [address, setAddress] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [organization, setOrganization] = useState("");
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  function startWithPhone() {
    setUsePhone(true);
    setScreen("phone");
  }

  function continueWithoutPhone() {
    setUsePhone(false);
    setScreen("item");
  }

  function continuePhone() {
    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    setScreen("item");
  }

  function continueItem() {
    if (!item) {
      alert("Please choose an item.");
      return;
    }

    setScreen("location");
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus(
        "Your browser does not support location detection. Please enter your location manually."
      );
      return;
    }

    setLocationStatus("Requesting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);

        setLocationMethod("gps");

        setLocationStatus(
          `Location detected successfully. Accuracy: approximately ${Math.round(
            position.coords.accuracy
          )} metres.`
        );
      },
      (error) => {
        if (error.code === 1) {
          setLocationStatus(
            "Location permission was denied. You can enter your location manually."
          );
        } else if (error.code === 2) {
          setLocationStatus(
            "Your location could not be detected. Please enter it manually."
          );
        } else {
          setLocationStatus(
            "Location detection timed out. Please enter your location manually."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  function continueLocation() {
    if (locationMethod === "gps") {
      setScreen("schedule");
      return;
    }

    if (!state || !city || !pinCode || !address) {
      alert("Please enter your state, city and PIN code.");
      return;
    }

    if (!/^\d{6}$/.test(pinCode)) {
      alert("Please enter a valid 6-digit PIN code.");
      return;
    }

    setScreen("schedule");
  }

  async function continueSchedule() {
  if (!date || !time) {
    alert("Please choose a pickup date and time.");
    return;
  }

  setScreen("organization");
  setSearching(true);
  setSearchError("");

  try {
    let lat = latitude;
    let lon = longitude;

    /*
      If GPS wasn't used, we currently need coordinates
      before searching nearby organizations.
    */
    if (lat === null || lon === null) {
      setSearchError(
        "For manual locations, organization search will be connected after the location lookup is added."
      );
      setSearching(false);
      return;
    }

    const response = await fetch(
      `/api/organizations?lat=${lat}&lon=${lon}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Search failed");
    }

    setOrganizations(data.organizations || []);
  } catch (error) {
    console.error(error);

    setSearchError(
      "We couldn't find organizations right now. Please try again."
    );
  } finally {
    setSearching(false);
  }
}

  function confirmPickup() {
    if (!organization) {
      alert("Please choose an organization.");
      return;
    }

    setScreen("confirmation");
  }

  function reset() {
    setScreen("home");

    setPhone("");
    setUsePhone(false);

    setItem("");

    setLocationMethod("");
    setState("");
    setCity("");
    setPinCode("");
    setAddress("");

    setLatitude(null);
    setLongitude(null);
    setLocationStatus("");

    setDate("");
    setTime("");

    setOrganization("");
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center p-6 text-black">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8">

        {/* HOME */}
        {screen === "home" && (
          <div className="text-center">

            <div className="text-6xl">♻️</div>

            <h1 className="text-5xl font-bold text-green-700 mt-4">
              Spenden
            </h1>

            <p className="text-black text-lg mt-4">
              Give your unwanted items a second life.
            </p>

            <p className="text-gray-700 mt-2">
              Find organizations and schedule a pickup from your home.
            </p>

            <div className="mt-10 space-y-4">

              <button
                onClick={startWithPhone}
                className="w-full p-4 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700"
              >
                📱 Continue with Phone Number
              </button>

              <button
                onClick={continueWithoutPhone}
                className="w-full p-4 rounded-xl border-2 border-gray-300 bg-white text-black font-bold text-lg hover:bg-gray-50"
              >
                👤 Continue Without a Number
              </button>

            </div>

            <p className="text-gray-500 text-sm mt-6">
              A phone number is optional.
            </p>

          </div>
        )}

        {/* PHONE */}
        {screen === "phone" && (
          <div>

            <button
              onClick={() => setScreen("home")}
              className="text-green-700 font-semibold"
            >
              ← Back
            </button>

            <div className="text-center mt-6">

              <div className="text-5xl">📱</div>

              <h1 className="text-3xl font-bold mt-4">
                Your phone number
              </h1>

              <p className="text-gray-700 mt-3">
                We'll use this for pickup notifications and reminders.
              </p>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full mt-6 p-4 border-2 border-gray-300 rounded-xl text-black bg-white outline-none focus:border-green-600"
              />

              <button
                onClick={continuePhone}
                className="w-full mt-4 p-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
              >
                Continue →
              </button>

            </div>

          </div>
        )}

        {/* ITEM */}
        {screen === "item" && (
          <div>

            <div className="text-center">

              <div className="text-5xl">📦</div>

              <h1 className="text-3xl font-bold mt-4">
                What do you want to give?
              </h1>

              <p className="text-gray-700 mt-2">
                Choose an item category.
              </p>

            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">

              {items.map(([icon, name]) => (
                <button
                  key={name}
                  onClick={() => setItem(name)}
                  className={`p-5 rounded-2xl border-2 text-left ${
                    item === name
                      ? "border-green-600 bg-green-100"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <span className="text-3xl">{icon}</span>

                  <div className="font-bold text-black mt-2">
                    {name}
                  </div>
                </button>
              ))}

            </div>

            <button
              onClick={continueItem}
              className="w-full mt-6 p-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
            >
              Continue →
            </button>

          </div>
        )}

        {/* LOCATION */}
        {screen === "location" && (
          <div>

            <button
              onClick={() => setScreen("item")}
              className="text-green-700 font-semibold"
            >
              ← Back
            </button>

            <div className="text-center mt-6">

              <div className="text-5xl">📍</div>

              <h1 className="text-3xl font-bold mt-4">
                Where should we look?
              </h1>

              <p className="text-gray-700 mt-2">
                Use your current location or enter your address area.
              </p>

            </div>

            {/* CURRENT LOCATION */}
            <button
              onClick={useCurrentLocation}
              className={`w-full mt-8 p-5 rounded-2xl border-2 text-left ${
                locationMethod === "gps"
                  ? "border-green-600 bg-green-100"
                  : "border-gray-300 bg-white"
              }`}
            >
              <div className="text-3xl">📍</div>

              <div className="font-bold text-lg mt-2">
                Use My Current Location
              </div>

              <div className="text-gray-600 mt-1">
                Let your browser detect your location.
              </div>
            </button>

            {locationStatus && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl text-gray-800">
                {locationStatus}
              </div>
            )}

            {locationMethod === "gps" &&
              latitude !== null &&
              longitude !== null && (
                <div className="mt-4 p-4 border border-green-200 rounded-xl bg-white">
                  <p className="font-bold text-green-700">
                    ✓ Location detected
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    Coordinates captured for nearby organization searches.
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    Latitude: {latitude.toFixed(5)}
                    <br />
                    Longitude: {longitude.toFixed(5)}
                  </p>
                </div>
              )}

            {/* MANUAL LOCATION */}
            <div className="mt-8 border-t pt-8">

              <h2 className="text-xl font-bold">
                Or enter your location
              </h2>

              <label className="block font-semibold mt-5">
                State
              </label>

              <input
                type="text"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setLocationMethod("manual");
                }}
                placeholder="e.g. Kerala"
                className="w-full mt-2 p-4 border-2 border-gray-300 rounded-xl bg-white text-black outline-none focus:border-green-600"
              />

              <label className="block font-semibold mt-5">
                City
              </label>

              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setLocationMethod("manual");
                }}
                placeholder="e.g. Chengannur"
                className="w-full mt-2 p-4 border-2 border-gray-300 rounded-xl bg-white text-black outline-none focus:border-green-600"
              />

              <label className="block font-semibold mt-5">
                PIN Code
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pinCode}
                onChange={(e) => {
                  setPinCode(e.target.value.replace(/\D/g, ""));
                  setLocationMethod("manual");
                }}
                placeholder="6-digit PIN code"
                className="w-full mt-2 p-4 border-2 border-gray-300 rounded-xl bg-white text-black outline-none focus:border-green-600"
              />
<label className="block font-semibold mt-5">
  Pickup Address
</label>

<textarea
  value={address}
  onChange={(e) => {
    setAddress(e.target.value);
    setLocationMethod("manual");
  }}
  placeholder="House/building, street, area, landmark..."
  rows={4}
  className="w-full mt-2 p-4 border-2 border-gray-300 rounded-xl bg-white text-black outline-none focus:border-green-600 resize-none"
/>
            </div>

            <button
              onClick={continueLocation}
              className="w-full mt-8 p-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
            >
              Continue →
            </button>

          </div>
        )}

        {/* SCHEDULE */}
        {screen === "schedule" && (
          <div>

            <button
              onClick={() => setScreen("location")}
              className="text-green-700 font-semibold"
            >
              ← Back
            </button>

            <div className="text-center mt-6">

              <div className="text-5xl">📅</div>

              <h1 className="text-3xl font-bold mt-4">
                Schedule your pickup
              </h1>

              <p className="text-gray-700 mt-2">
                Choose the day and time you'd like your items collected.
              </p>

            </div>

            <label className="block font-bold mt-8">
              Pickup date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-2 p-4 border-2 border-gray-300 rounded-xl text-black bg-white"
            />

            <label className="block font-bold mt-5">
              Pickup time
            </label>

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full mt-2 p-4 border-2 border-gray-300 rounded-xl text-black bg-white"
            />

            <button
              onClick={continueSchedule}
              className="w-full mt-6 p-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
            >
              Find Organizations →
            </button>

          </div>
        )}

        {/* ORGANIZATION SEARCH */}
{screen === "organization" && (
  <div>

    <button
      onClick={() => setScreen("schedule")}
      className="text-green-700 font-semibold"
    >
      ← Back
    </button>

    <div className="text-center mt-6">

      <div className="text-5xl">🌱</div>

      <h1 className="text-3xl font-bold mt-4">
        Organizations near you
      </h1>

      <p className="text-gray-700 mt-2">
        Looking for organizations that may accept your donation.
      </p>

    </div>

    {searching && (
      <div className="mt-8 text-center">

        <div className="text-4xl animate-pulse">
          🔎
        </div>

        <p className="font-semibold mt-3">
          Searching nearby organizations...
        </p>

      </div>
    )}

    {!searching && searchError && (
      <div className="mt-8 p-5 rounded-2xl bg-yellow-50 border border-yellow-200">

        <p className="font-bold">
          ⚠️ Search unavailable
        </p>

        <p className="text-gray-700 mt-2">
          {searchError}
        </p>

      </div>
    )}

    {!searching &&
      !searchError &&
      organizations.length === 0 && (
        <div className="mt-8 p-6 rounded-2xl bg-gray-50 text-center">

          <div className="text-4xl">
            🔎
          </div>

          <h2 className="font-bold text-xl mt-3">
            No organizations found
          </h2>

          <p className="text-gray-600 mt-2">
            Try another location or check again later.
          </p>

        </div>
      )}

    {!searching && organizations.length > 0 && (
      <div className="mt-8 space-y-4">

        {organizations.map((org) => (
          <div
            key={org.id}
            className="border-2 border-gray-200 rounded-2xl p-5 bg-white"
          >

            <h2 className="text-xl font-bold">
              {org.name}
            </h2>

            <p className="text-gray-700 mt-2">
              📍 {org.address}
            </p>

            {org.phone && (
              <p className="text-gray-700 mt-2">
                📞 {org.phone}
              </p>
            )}

            {org.website && (
              <p className="text-gray-700 mt-2 break-all">
                🌐 {org.website}
              </p>
            )}

            <p className="text-sm text-gray-500 mt-3">
              Data source: {org.source}
            </p>

            <button
              onClick={() => {
                setOrganization(org.name);
                setScreen("confirmation");
              }}
              className="w-full mt-4 p-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
            >
              Choose This Organization →
            </button>

          </div>
        ))}

      </div>
    )}

  </div>
)}
        {/* CONFIRMATION */}
        {screen === "confirmation" && (
          <div className="text-center">

            <div className="text-6xl">✅</div>

            <h1 className="text-3xl font-bold text-green-700 mt-5">
              Pickup Details Saved
            </h1>

            <p className="text-gray-700 mt-3">
              Your information is ready for the next stage.
            </p>

            <div className="mt-8 bg-green-50 rounded-2xl p-6 text-left">

              <p className="font-bold text-lg">
                📦 Item
              </p>

              <p>{item}</p>

              <p className="font-bold text-lg mt-5">
                📍 Location
              </p>

              {locationMethod === "gps" ? (
                <p>
                  Current location detected
                </p>
              ) : (
                <p>
                  {city}, {state} — {pinCode}
                </p>
              )}

              <p className="font-bold text-lg mt-5">
                📅 Date
              </p>

              <p>{date}</p>

              <p className="font-bold text-lg mt-5">
                🕐 Time
              </p>

              <p>{time}</p>

            </div>

            <button
              onClick={reset}
              className="w-full mt-6 p-4 rounded-xl border-2 border-gray-300 bg-white font-bold hover:bg-gray-50"
            >
              Start Again
            </button>

          </div>
        )}

      </div>
    </main>
  );
}