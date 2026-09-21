"use client";

import { useState } from "react";

const items = [
  ["👕", "Clothes"],
  ["📚", "Books"],
  ["♻️", "Plastic"],
  ["💻", "Electronics"],
];

export default function Home() {
  const [item, setItem] = useState("");
  const [city, setCity] = useState("");
  const [done, setDone] = useState(false);

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center p-6 text-black">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8">

        {!done ? (
          <>
            {/* Header */}
            <div className="text-center">
              <div className="text-5xl">♻️</div>

              <h1 className="text-4xl font-bold text-green-700 mt-3">
                Spenden
              </h1>

              <p className="text-black mt-3 text-lg">
                Donate or recycle your unwanted items without the hassle.
              </p>
            </div>

            {/* Item selection */}
            <h2 className="text-xl font-bold text-black mt-10">
              What do you want to give?
            </h2>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {items.map(([icon, name]) => (
                <button
                  key={name}
                  onClick={() => setItem(name)}
                  className={`p-5 rounded-2xl border-2 text-left transition ${
                    item === name
                      ? "border-green-600 bg-green-100 text-black"
                      : "border-gray-300 bg-white text-black hover:border-green-500"
                  }`}
                >
                  <span className="text-3xl">{icon}</span>

                  <div className="font-semibold text-black mt-2">
                    {name}
                  </div>
                </button>
              ))}
            </div>

            {/* Location */}
            <h2 className="text-xl font-bold text-black mt-8">
              Where are you?
            </h2>

            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your city"
              className="w-full mt-3 p-4 border-2 border-gray-300 rounded-xl text-black bg-white placeholder-gray-500 outline-none focus:border-green-600"
            />

            {/* Submit */}
            <button
              onClick={() => setDone(true)}
              disabled={!item || !city}
              className="w-full mt-6 p-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-600"
            >
              Find Organizations →
            </button>
          </>
        ) : (
          <>
            {/* Results */}
            <div className="text-center">
              <div className="text-5xl">🌱</div>

              <h1 className="text-3xl font-bold text-black mt-4">
                Organizations near you
              </h1>

              <p className="text-black mt-2">
                Showing results for{" "}
                <strong>{item}</strong> in{" "}
                <strong>{city}</strong>
              </p>
            </div>

            {/* Organization 1 */}
            <div className="mt-8 border-2 border-gray-200 rounded-2xl p-5 bg-white">
              <h2 className="text-xl font-bold text-black">
                Green Earth Foundation
              </h2>

              <p className="text-black mt-2">
                ♻️ Accepts {item}
              </p>

              <p className="text-green-700 font-semibold mt-2">
                🚚 Pickup available
              </p>

              <button className="mt-4 px-5 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">
                Schedule Pickup
              </button>
            </div>

            {/* Organization 2 */}
            <div className="mt-4 border-2 border-gray-200 rounded-2xl p-5 bg-white">
              <h2 className="text-xl font-bold text-black">
                Community Care NGO
              </h2>

              <p className="text-black mt-2">
                ❤️ Accepts donations in {city}
              </p>

              <p className="text-green-700 font-semibold mt-2">
                🚚 Pickup available
              </p>

              <button className="mt-4 px-5 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">
                Schedule Pickup
              </button>
            </div>

            {/* Back */}
            <button
              onClick={() => setDone(false)}
              className="w-full mt-6 p-4 border-2 border-gray-300 text-black bg-white rounded-xl font-semibold hover:bg-gray-50"
            >
              ← Start Again
            </button>
          </>
        )}
      </div>
    </main>
  );
}