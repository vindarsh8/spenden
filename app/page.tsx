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
  const [email, setEmail] = useState("");
  const [sendingWelcome, setSendingWelcome] = useState(false);
  const [sendingConfirmation, setSendingConfirmation] = useState(false);
  const [pickupConfirmed, setPickupConfirmed] = useState(false);
  const [emailError, setEmailError] = useState("");
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
  const [organization, setOrganization] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  async function continueEmail() {
    const cleaned = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      alert("Please enter a valid email address.");
      return;
    }

    setSendingWelcome(true);
    setEmailError("");
    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "welcome", email: cleaned }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not send welcome email.");
      setScreen("item");
    } catch (error) {
      console.error("Welcome email error:", error);
      setEmailError(error instanceof Error ? error.message : "Could not send the welcome email.");
    } finally {
      setSendingWelcome(false);
    }
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
      setLocationStatus("Location detection is not supported. Please enter your location manually.");
      return;
    }

    setLocationStatus("Requesting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationMethod("gps");
        setLocationStatus(
          `Location detected successfully. Accuracy: approximately ${Math.round(position.coords.accuracy)} metres.`
        );
      },
      () => {
        setLocationStatus("Location could not be detected. Please enter your location manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  function continueLocation() {
    if (locationMethod === "gps" && latitude !== null && longitude !== null) {
      setScreen("schedule");
      return;
    }

    if (!state || !city || !pinCode || !address) {
      alert("Please enter your state, city, PIN code and pickup address.");
      return;
    }

    if (!/^\d{6}$/.test(pinCode)) {
      alert("Please enter a valid 6-digit PIN code.");
      return;
    }

    setLocationMethod("manual");
    setScreen("schedule");
  }

  async function continueSchedule() {
    if (!date || !time) {
      alert("Please choose a pickup date and time.");
      return;
    }

    const selectedDate = new Date(`${date}T${time}`);
    if (selectedDate.getTime() < Date.now()) {
      alert("Please choose a future pickup date and time.");
      return;
    }

    setScreen("organization");
    setSearching(true);
    setSearchError("");
    setOrganizations([]);
    setOrganization(null);

    try {
      const params = new URLSearchParams({
        item,
        city,
        state,
        pinCode,
      });

      if (latitude !== null && longitude !== null) {
        params.set("lat", String(latitude));
        params.set("lon", String(longitude));
      }

      const response = await fetch(`/api/organizations?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Search failed");

      setOrganizations(data.organizations || []);
      if (!data.organizations?.length) {
        setSearchError("No suitable matches were found for this item and location.");
      }
    } catch (error) {
      console.error(error);
      setSearchError("We couldn't load suitable organizations right now. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  async function confirmPickup() {
    if (!organization) {
      alert("Please choose an organization.");
      return;
    }

    setSendingConfirmation(true);
    setEmailError("");
    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pickup",
          email,
          item,
          organization: organization.name,
          date,
          time,
          address,
          city,
          state,
          pinCode,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not send pickup email.");
      setPickupConfirmed(true);
    } catch (error) {
      console.error("Pickup email error:", error);
      setEmailError(error instanceof Error ? error.message : "Could not send the pickup email.");
    } finally {
      setSendingConfirmation(false);
    }
  }

  function reset() {
    setScreen("home");
    setEmail("");
    setEmailError("");
    setPickupConfirmed(false);
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
    setOrganization(null);
    setOrganizations([]);
    setSearchError("");
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center p-4 sm:p-6 text-black">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-5 sm:p-8">

        {screen === "home" && (
          <div className="text-center">
            <div className="text-6xl">♻️</div>
            <h1 className="text-5xl font-bold text-green-700 mt-4">Spenden</h1>
            <p className="text-black text-lg mt-4">Give your unwanted items a second life.</p>
            <p className="text-gray-700 mt-2">Find suitable organizations and schedule a pickup from your home.</p>

            <button
              onClick={() => setScreen("email")}
              className="w-full mt-10 p-4 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700"
            >
              📧 Continue with Email
            </button>

            <p className="text-gray-500 text-sm mt-5">Your email is used for welcome and pickup updates.</p>
          </div>
        )}

        {screen === "email" && (
          <div>
            <button onClick={() => setScreen("home")} className="text-green-700 font-semibold">← Back</button>
            <div className="text-center mt-6">
              <div className="text-5xl">📧</div>
              <h1 className="text-3xl font-bold mt-4">Your email address</h1>
              <p className="text-gray-700 mt-3">We'll send a welcome email and your pickup details here.</p>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full mt-6 p-4 border-2 border-gray-300 rounded-xl text-black bg-white outline-none focus:border-green-600"
              />
              {emailError && <p className="text-red-600 text-sm mt-3">{emailError}</p>}
              <button onClick={continueEmail} disabled={sendingWelcome} className="w-full mt-4 p-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-60">
                {sendingWelcome ? "Sending welcome email..." : "Continue →"}
              </button>
            </div>
          </div>
        )}

        {screen === "item" && (
          <div>
            <div className="text-center">
              <div className="text-5xl">📦</div>
              <h1 className="text-3xl font-bold mt-4">What do you want to give?</h1>
              <p className="text-gray-700 mt-2">Choose an item category.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              {items.map(([icon, name]) => (
                <button
                  key={name}
                  onClick={() => setItem(name)}
                  className={`p-5 rounded-2xl border-2 text-left ${item === name ? "border-green-600 bg-green-100" : "border-gray-300 bg-white"}`}
                >
                  <span className="text-3xl">{icon}</span>
                  <div className="font-bold text-black mt-2">{name}</div>
                </button>
              ))}
            </div>

            <button onClick={continueItem} className="w-full mt-6 p-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700">
              Continue →
            </button>
          </div>
        )}

        {screen === "location" && (
          <div>
            <button onClick={() => setScreen("item")} className="text-green-700 font-semibold">← Back</button>
            <div className="text-center mt-6">
              <div className="text-5xl">📍</div>
              <h1 className="text-3xl font-bold mt-4">Where should we look?</h1>
              <p className="text-gray-700 mt-2">We'll use this to find suitable donation organizations.</p>
            </div>

            <button
              onClick={useCurrentLocation}
              className={`w-full mt-8 p-5 rounded-2xl border-2 text-left ${locationMethod === "gps" ? "border-green-600 bg-green-100" : "border-gray-300 bg-white"}`}
            >
              <div className="text-3xl">📍</div>
              <div className="font-bold text-lg mt-2">Use My Current Location</div>
              <div className="text-gray-600 mt-1">Let your browser detect your location.</div>
            </button>

            {locationStatus && <div className="mt-4 p-4 bg-green-50 rounded-xl text-gray-800">{locationStatus}</div>}

            <div className="mt-8 border-t pt-8">
              <h2 className="text-xl font-bold">Or enter your location</h2>

              <label className="block font-semibold mt-5">State</label>
              <input value={state} onChange={(e) => { setState(e.target.value); setLocationMethod("manual"); }} placeholder="e.g. Kerala"
                className="w-full mt-2 p-4 border-2 border-gray-300 rounded-xl bg-white text-black outline-none focus:border-green-600" />

              <label className="block font-semibold mt-5">City</label>
              <input value={city} onChange={(e) => { setCity(e.target.value); setLocationMethod("manual"); }} placeholder="e.g. Kochi"
                className="w-full mt-2 p-4 border-2 border-gray-300 rounded-xl bg-white text-black outline-none focus:border-green-600" />

              <label className="block font-semibold mt-5">PIN Code</label>
              <input inputMode="numeric" maxLength={6} value={pinCode}
                onChange={(e) => { setPinCode(e.target.value.replace(/\D/g, "")); setLocationMethod("manual"); }}
                placeholder="6-digit PIN code"
                className="w-full mt-2 p-4 border-2 border-gray-300 rounded-xl bg-white text-black outline-none focus:border-green-600" />

              <label className="block font-semibold mt-5">Pickup Address</label>
              <textarea value={address} onChange={(e) => { setAddress(e.target.value); setLocationMethod("manual"); }}
                placeholder="House/building, street, area, landmark..." rows={4}
                className="w-full mt-2 p-4 border-2 border-gray-300 rounded-xl bg-white text-black outline-none focus:border-green-600 resize-none" />
            </div>

            <button onClick={continueLocation} className="w-full mt-8 p-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700">
              Continue →
            </button>
          </div>
        )}

        {screen === "schedule" && (
          <div>
            <button onClick={() => setScreen("location")} className="text-green-700 font-semibold">← Back</button>
            <div className="text-center mt-6">
              <div className="text-5xl">📅</div>
              <h1 className="text-3xl font-bold mt-4">Schedule your pickup</h1>
              <p className="text-gray-700 mt-2">Choose the day and time you'd like Spenden to collect your items.</p>
            </div>

            <label className="block font-bold mt-8">Pickup date</label>
            <input type="date" min={new Date().toISOString().split("T")[0]} value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full mt-2 p-4 border-2 border-gray-300 rounded-xl text-black bg-white" />

            <label className="block font-bold mt-5">Pickup time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="w-full mt-2 p-4 border-2 border-gray-300 rounded-xl text-black bg-white" />

            <button onClick={continueSchedule} className="w-full mt-6 p-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700">
              Find Matching Organizations →
            </button>
          </div>
        )}

        {screen === "organization" && (
          <div>
            <button onClick={() => setScreen("schedule")} className="text-green-700 font-semibold">← Back</button>

            <div className="text-center mt-6">
              <div className="text-5xl">🌱</div>
              <h1 className="text-3xl font-bold mt-4">Best Matches for You</h1>
              <p className="text-gray-700 mt-2">
                Matches are based on <b>{item}</b> and your location.
              </p>
            </div>

            {searching && (
              <div className="mt-8 text-center">
                <div className="text-4xl animate-pulse">🔎</div>
                <p className="font-semibold mt-3">Finding suitable organizations...</p>
              </div>
            )}

            {!searching && searchError && (
              <div className="mt-8 p-5 rounded-2xl bg-yellow-50 border border-yellow-200">
                <p className="font-bold">⚠️ No match</p>
                <p className="text-gray-700 mt-2">{searchError}</p>
              </div>
            )}

            {!searching && organizations.length > 0 && (
              <div className="mt-8 space-y-4">
                {organizations.map((org, index) => (
                  <div key={org.id} className={`border-2 rounded-2xl p-5 bg-white ${index === 0 ? "border-green-500 shadow-md" : "border-gray-200"}`}>
                    {index === 0 && (
                      <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-bold">
                        ⭐ Best Match
                      </div>
                    )}

                    <h2 className="text-xl font-bold mt-3">{org.name}</h2>
                    <p className="text-gray-700 mt-2">📍 {org.address}</p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">✓ Accepts {item}</span>
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">🚚 Spenden pickup</span>
                      {org.locationMatch && <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">📍 Location match</span>}
                    </div>

                    <p className="text-sm text-gray-600 mt-4">{org.reason}</p>

                    <p className="text-xs text-gray-500 mt-3">
                      Donation information: <a href={org.sourceUrl} target="_blank" rel="noreferrer" className="text-green-700 underline">official source</a>
                    </p>

                    <button
                      onClick={() => { setOrganization(org); setScreen("confirmation"); }}
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

        {screen === "confirmation" && organization && (
          <div className="text-center">
            <div className="text-6xl">{pickupConfirmed ? "✅" : "📦"}</div>
            <h1 className="text-3xl font-bold text-green-700 mt-5">{pickupConfirmed ? "Pickup Email Sent" : "Review Your Pickup"}</h1>
            <p className="text-gray-700 mt-3">{pickupConfirmed ? `Pickup details have been emailed to ${email}.` : "Review the details below, then confirm to email your pickup details."}</p>

            <div className="mt-8 bg-green-50 rounded-2xl p-6 text-left">
              <p className="font-bold text-lg">📦 Item</p>
              <p>{item}</p>

              <p className="font-bold text-lg mt-5">🏢 Organization</p>
              <p>{organization.name}</p>

              <p className="font-bold text-lg mt-5">📍 Pickup area</p>
              <p>{locationMethod === "gps" ? "Current location detected" : `${city}, ${state} — ${pinCode}`}</p>

              <p className="font-bold text-lg mt-5">🏠 Pickup address</p>
              <p>{address || "Current location"}</p>

              <p className="font-bold text-lg mt-5">📅 Date & time</p>
              <p>{date} at {time}</p>

              <p className="font-bold text-lg mt-5">📧 Email</p>
              <p>{email}</p>

              <div className="mt-6 p-4 rounded-xl bg-white border border-green-200">
                <p className="font-bold text-green-700">🚚 Spenden pickup</p>
                <p className="text-sm text-gray-700 mt-1">
                  Spenden arranges the volunteer pickup from the address above.
                </p>
              </div>
            </div>

            {!pickupConfirmed && (
              <button onClick={confirmPickup} disabled={sendingConfirmation} className="w-full mt-6 p-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-60">
                {sendingConfirmation ? "Sending confirmation email..." : "Confirm Pickup & Email Details"}
              </button>
            )}
            {emailError && <p className="text-red-600 text-sm mt-3">{emailError}</p>}
            <button onClick={reset} className="w-full mt-3 p-4 rounded-xl border-2 border-gray-300 bg-white font-bold hover:bg-gray-50">
              Start Again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
