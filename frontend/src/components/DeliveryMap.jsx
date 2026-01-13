import { useEffect, useRef, mountedRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 1. DEFINE ROBUST SVG ICONS (Fixes unavailable pointers)
const createPinIcon = (color) => {
  const svgHtml = `
    <svg viewBox="0 0 24 24" width="32" height="32" fill="${color}" stroke="white" stroke-width="2" style="filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.3));">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" fill="white" />
    </svg>`;

  return L.divIcon({
    className: "custom-pin-icon",
    html: svgHtml,
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Bottom center
    popupAnchor: [0, -32]  // Top center
  });
};

const createCarIcon = () => {
  const svgHtml = `
    <svg viewBox="0 0 24 24" width="36" height="36" fill="#3b82f6" stroke="white" stroke-width="2" style="filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.3));">
      <path d="M5 17h14" stroke-linecap="round"/>
      <path d="M15 17h-1c-.5 0-1 .5-1 1v1a1 1 0 0 1-2 0v-1c0-.5-.5-1-1-1H8c-.5 0-1 .5-1 1v1a1 1 0 0 1-2 0v-1c0-.5-.5-1-1-1H4" stroke-linecap="round"/>
      <path d="M3 10h18" stroke-linecap="round"/>
      <path d="M5 10l1.5-4.5A2 2 0 0 1 8.4 4h7.2a2 2 0 0 1 1.9 1.5L19 10" stroke-linecap="round"/>
      <circle cx="7.5" cy="17.5" r="1.5" fill="white" stroke="none"/>
      <circle cx="16.5" cy="17.5" r="1.5" fill="white" stroke="none"/>
    </svg>`;

  return L.divIcon({
    className: "custom-car-icon",
    html: svgHtml,
    iconSize: [36, 36],
    iconAnchor: [18, 18], // Centered
    popupAnchor: [0, -18]
  });
};

const greenIcon = createPinIcon('#22c55e');
const redIcon = createPinIcon('#ef4444');
const carIcon = createCarIcon();

export default function DeliveryMap({ pickup, dropoff, driver }) {

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);
  const driverRef = useRef(null);
  const isMapReady = useRef(false); 

  // 1. CREATE MAP ONCE
  useEffect(() => {
    if (mapRef.current) return;   

    mapRef.current = L.map(mapContainerRef.current).setView([12.97, 77.59], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
      .addTo(mapRef.current);

    return () => {
      isMapReady.current = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. FIT BOUNDS
  useEffect(() => {
    if (
      !mountedRef.current ||
      !mapRef.current ||
      !pickup?.lat ||
      !dropoff?.lat
    )
      return;

    const bounds = L.latLngBounds(
      [pickup.lat, pickup.lng],
      [dropoff.lat, dropoff.lng]
    );

    // Delay to avoid race condition
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.fitBounds(bounds, {
          padding: [40, 40],
          maxZoom: 15
        });
      }
    }, 100);
  }, [pickup, dropoff]);


  // 3. UPDATE PICKUP MARKER (Green)
  useEffect(() => {
    if (!isMapReady.current|| !mapRef.current || !pickup?.lat || !pickup?.lng) return;

    if (!pickupRef.current) {
      pickupRef.current = L.marker([pickup.lat, pickup.lng], { icon: greenIcon }).addTo(mapRef.current);
      pickupRef.current.bindPopup("Pickup");
    } else {
      pickupRef.current.setLatLng([pickup.lat, pickup.lng]);
    }

  }, [pickup]);

  // 4. UPDATE DROPOFF MARKER (Red)
  useEffect(() => {
    if (!isMapReady.current|| !mapRef.current || !dropoff?.lat || !dropoff?.lng) return;

    if (!dropoffRef.current) {
      dropoffRef.current = L.marker([dropoff.lat, dropoff.lng], { icon: redIcon }).addTo(mapRef.current);
      dropoffRef.current.bindPopup("Dropoff");
    } else {
      dropoffRef.current.setLatLng([dropoff.lat, dropoff.lng]);
    }

  }, [dropoff]);

  // 5. UPDATE DRIVER MARKER
  useEffect(() => {
    if (!isMapReady.current|| !mapRef.current || !driver?.lat || !driver?.lng) return;

    if (!driverRef.current) {
      driverRef.current = L.marker([driver.lat, driver.lng], { icon: carIcon }).addTo(mapRef.current);
      driverRef.current.bindPopup("Driver");
    } else {
      driverRef.current.setLatLng([driver.lat, driver.lng]);
    }

  }, [driver]);

  return (
    <div
      id="map"
      ref={mapContainerRef}
      style={{ height: "420px", width: "100%", borderRadius: "16px" }}
    />
  );
}