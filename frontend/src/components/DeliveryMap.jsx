
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ---------- ICONS ---------- */
const createPinIcon = (color) =>
  L.divIcon({
    className: "custom-pin-icon",
    html: `
      <svg viewBox="0 0 24 24" width="32" height="32" fill="${color}" stroke="white" stroke-width="2">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="white"/>
      </svg>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

const createCarIcon = () =>
  L.divIcon({
    className: "custom-car-icon",
    html: `
      <svg viewBox="0 0 24 24" width="36" height="36" fill="#3b82f6" stroke="white" stroke-width="2">
        <path d="M3 10h18"/>
        <circle cx="7.5" cy="17.5" r="1.5" fill="white"/>
        <circle cx="16.5" cy="17.5" r="1.5" fill="white"/>
      </svg>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

const greenIcon = createPinIcon("#22c55e");
const redIcon = createPinIcon("#ef4444");
const carIcon = createCarIcon();

/* ---------- COMPONENT ---------- */
export default function DeliveryMap({ pickup, dropoff, driver }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);
  const driverRef = useRef(null);

  const isMapReady = useRef(false);
  /* ---------- MAP INIT ---------- */
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = L.map(containerRef.current).setView([12.97, 77.59], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(mapRef.current);

    setTimeout(() => mapRef.current?.invalidateSize(), 100);

    mapRef.current.whenReady(() => {
      isMapReady.current = true;
      mapRef.current.invalidateSize();
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  /* ---------- PICKUP + DROPOFF ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const pLat = Number(pickup?.lat);
    const pLng = Number(pickup?.lng);
    const dLat = Number(dropoff?.lat);
    const dLng = Number(dropoff?.lng);

    if (
      Number.isNaN(pLat) ||
      Number.isNaN(pLng) ||
      Number.isNaN(dLat) ||
      Number.isNaN(dLng)
    )
      return;

    if (!pickupRef.current) {
      pickupRef.current = L.marker([pLat, pLng], { icon: greenIcon }).addTo(map);
    } else {
      pickupRef.current.setLatLng([pLat, pLng]);
    }

    if (!dropoffRef.current) {
      dropoffRef.current = L.marker([dLat, dLng], { icon: redIcon }).addTo(map);
    } else {
      dropoffRef.current.setLatLng([dLat, dLng]);
    }

    setTimeout(() => {
      if (!mapRef.current || !isMapReady.current) return;

    mapRef.current.invalidateSize({ pan: false });

    const bounds = L.latLngBounds(
      [pLat, pLng],
      [dLat, dLng]
    );

    if (!bounds.isValid()) return;
    
    mapRef.current.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 15,
      animate: false,
    });

    map.invalidateSize();
  },150);
  }, [pickup, dropoff]);

  /* ---------- DRIVER ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const lat = Number(driver?.lat);
    const lng = Number(driver?.lng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    if (!driverRef.current) {
      driverRef.current = L.marker([lat, lng], { icon: carIcon }).addTo(map);
    } else {
      driverRef.current.setLatLng([lat, lng]);
    }
  }, [driver]);

  return (
    <div
      ref={containerRef}
      style={{ height: "420px", width: "100%", borderRadius: "16px" }}
    />
  );
}
