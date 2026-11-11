"use client";

import React, { useEffect, useRef } from "react";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "~/trpc/react";

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Fetch locations using tRPC end-to-end type safety
  const { data: locations, refetch } = api.location.getAll.useQuery();
  const createLocation = api.location.create.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  // Initialize Map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    void import("leaflet").then((L) => {
      if (!isMounted || !mapRef.current) return;

      // Fix default Leaflet marker icons
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      // Initialize map instance over Pretoria
      const map = L.map(mapRef.current).setView([-25.7479, 28.2293], 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Create a layer group to hold dynamic markers so we can clear/update them easily
      const markerLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markerLayer;

      // Click event to add a new location via tRPC mutation
      map.on("click", (e: L.LeafletMouseEvent) => {
        const title = prompt("Enter a title for this location:");
        if (!title) return;
        const description = prompt("Enter a brief description (optional):") ?? "";

        createLocation.mutate(
          {
            title,
            description,
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
          },
          {
            onError: (error) => {
              console.error("Failed to save location:", error);
            },
          }
        );
      });

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }).catch((err: unknown) => {
      console.error("Leaflet initialization failed:", err);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [createLocation]);

  // Update and render markers whenever tRPC data changes
  useEffect(() => {
    const layerGroup = markersLayerRef.current;
    if (!layerGroup || !locations) return;

    console.log("Fetched locations from PostgreSQL via tRPC:", locations);

    void import("leaflet").then((L) => {
      // Clear existing markers before re-adding
      layerGroup.clearLayers();

      locations.forEach((loc) => {
        const marker = L.marker([loc.latitude, loc.longitude])
          .bindPopup(`<b>${loc.title}</b><br />${loc.description ?? ""}`);
        layerGroup.addLayer(marker);
      });
    }).catch((err: unknown) => {
      console.error("Failed to render location markers:", err);
    });
  }, [locations]);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-gray-400 font-mono bg-gray-950 p-2 rounded-lg border border-gray-800">
        💡 <span className="text-yellow-400 font-bold">Tip:</span> Click anywhere on the map to save a new location directly to PostgreSQL via Prisma & tRPC!
      </div>
      <div 
        ref={mapRef} 
        className="z-0 h-[650px] w-full rounded-xl bg-gray-900 shadow-inner border border-gray-800"
      />
    </div>
  );
}