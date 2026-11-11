"use client";

import Link from "next/link";
import React from "react";
import MapClient from "../_components/MapClient";

export default function MapPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-gray-900 text-white">
      <div className="w-full max-w-7xl flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Location & Mapping Dashboard</h1>
          <p className="text-gray-400">100% Free OpenStreetMap & Leaflet Integration</p>
        </div>
        <Link 
          href="/"
          className="rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="w-full max-w-7xl bg-gray-800 p-3 rounded-2xl shadow-xl border border-gray-700">
        <MapClient />
      </div>
    </div>
  );
}