"use client";

import dynamic from "next/dynamic";
import React from "react";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[650px] flex items-center justify-center bg-gray-950 text-yellow-400 font-mono border-4 border-dashed border-yellow-500 rounded-xl">
      ⌛ Loading Dynamic Map Client...
    </div>
  ),
});

export default function MapClient(): React.ReactElement {
  return React.createElement(Map, null);
}