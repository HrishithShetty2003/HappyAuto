// // import { useEffect, useRef } from "react";
// // import L from "leaflet";
// // import "leaflet/dist/leaflet.css";

// // // Define custom icons
// // const greenIcon = L.icon({
// //   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
// //   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
// //   iconSize: [25, 41],
// //   iconAnchor: [12, 41],
// //   popupAnchor: [1, -34],
// //   shadowSize: [41, 41]
// // });

// // const redIcon = L.icon({
// //   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
// //   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
// //   iconSize: [25, 41],
// //   iconAnchor: [12, 41],
// //   popupAnchor: [1, -34],
// //   shadowSize: [41, 41]
// // });

// // export default function DriverTrackingMap({ pickup, dropoff }) {

// //   const mapContainerRef = useRef(null);
// //   const mapRef = useRef(null);
  
// //   const pickupRef = useRef(null);
// //   const dropoffRef = useRef(null);

// //   // 1. CREATE MAP ONCE
// //   useEffect(() => {
// //     if (!mapContainerRef.current || mapRef.current) return; 

// //     // Initialize map
// //     mapRef.current = L.map(mapContainerRef.current).setView([12.97, 77.59], 13);

// //     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
// //       .addTo(mapRef.current);

// //     // Cleanup map on unmount
// //     return () => {
// //       if (mapRef.current) {
// //         mapRef.current.remove();
// //         mapRef.current = null;
// //       }
// //     };
// //   }, []);

// //   // 2. UPDATE MARKERS & FIT BOUNDS
// //   useEffect(() => {
// //     if (!mapRef.current || !pickup?.lat || !pickup?.lng || !dropoff?.lat || !dropoff?.lng) return;

// //     // Update or Create Pickup Marker
// //     if (!pickupRef.current) {
// //       pickupRef.current = L.marker([pickup.lat, pickup.lng], { icon: greenIcon }).addTo(mapRef.current);
// //       pickupRef.current.bindPopup("Pickup");
// //     } else {
// //       pickupRef.current.setLatLng([pickup.lat, pickup.lng]);
// //     }

// //     // Update or Create Dropoff Marker
// //     if (!dropoffRef.current) {
// //       dropoffRef.current = L.marker([dropoff.lat, dropoff.lng], { icon: redIcon }).addTo(mapRef.current);
// //       dropoffRef.current.bindPopup("Dropoff");
// //     } else {
// //       dropoffRef.current.setLatLng([dropoff.lat, dropoff.lng]);
// //     }

// //     // Create bounds for auto-zooming
// //     const bounds = L.latLngBounds(
// //       [pickup.lat, pickup.lng], 
// //       [dropoff.lat, dropoff.lng]
// //     );

// //     // Fit bounds
// //     mapRef.current.fitBounds(bounds, { 
// //       padding: [40, 40],
// //       maxZoom: 15 
// //     });

// //     // CRITICAL FIX: Invalidate size to ensure map renders correctly 
// //     // inside the expanded div
// //     setTimeout(() => {
// //         mapRef.current?.invalidateSize();
// //     }, 200);

// //   }, [pickup, dropoff]);

// //   return (
// //     <div
// //       ref={mapContainerRef}
// //       style={{ height: "300px", width: "100%", borderRadius: "16px", zIndex: 0 }}
// //     />
// //   );
// // }

// import { useEffect, useRef } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// const greenIcon = L.icon({
//   iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
//   shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41]
// });

// const redIcon = L.icon({
//   iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
//   shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41]
// });

// export default function DriverTrackingMap({ pickup, dropoff }) {

//   const mapContainerRef = useRef(null);
//   const mapRef = useRef(null);

//   const pickupRef = useRef(null);
//   const dropoffRef = useRef(null);

//   // CREATE MAP (ONCE)
//   useEffect(() => {
//     if (!mapContainerRef.current || mapRef.current) return;

//     mapRef.current = L.map(mapContainerRef.current, {
//       zoomControl: false
//     }).setView([12.97, 77.59], 12);

//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
//       .addTo(mapRef.current);

//     return () => {
//       mapRef.current?.remove();
//       mapRef.current = null;
//     };
//   }, []);

//   // MARKERS + AUTO-ZOOM
//   useEffect(() => {
//     if (!mapRef.current || !pickup?.lat || !dropoff?.lat) return;

//     // Pickup
//     if (!pickupRef.current) {
//       pickupRef.current = L.marker([pickup.lat, pickup.lng], { icon: greenIcon })
//         .addTo(mapRef.current)
//         .bindPopup("Pickup");
//     } else {
//       pickupRef.current.setLatLng([pickup.lat, pickup.lng]);
//     }

//     // Dropoff
//     if (!dropoffRef.current) {
//       dropoffRef.current = L.marker([dropoff.lat, dropoff.lng], { icon: redIcon })
//         .addTo(mapRef.current)
//         .bindPopup("Dropoff");
//     } else {
//       dropoffRef.current.setLatLng([dropoff.lat, dropoff.lng]);
//     }

//     // Fit route neatly
//     const bounds = L.latLngBounds(
//       [pickup.lat, pickup.lng],
//       [dropoff.lat, dropoff.lng]
//     );

//     // Delay ensures animation container finished expanding
//     setTimeout(() => {
//       mapRef.current?.invalidateSize();
//       mapRef.current?.fitBounds(bounds, {
//         padding: [40, 40],
//         maxZoom: 15
//       });
//     }, 150);

//   }, [pickup, dropoff]);

//   return (
//     <div
//       ref={mapContainerRef}
//       style={{
//         height: "300px",
//         width: "100%",
//         borderRadius: "16px",
//         overflow: "hidden",   // ⛔ prevents UI overlap
//         position: "relative",
//         zIndex: 0              // ⛔ keeps it under other UI
//       }}
//       className="border border-slate-200 shadow-sm"
//     />
//   );
// }
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 1. CONFIGURE ROBUST SVG ICONS (Same as Customer Dashboard)
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

const greenIcon = createPinIcon('#22c55e'); // Green
const redIcon = createPinIcon('#ef4444');   // Red

export default function DriverTrackingMap({ pickup, dropoff }) {

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

  // 1. INITIALIZE MAP
  useEffect(() => {
    if (mapRef.current) return;   

    mapRef.current = L.map(mapContainerRef.current).setView([12.97, 77.59], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
      .addTo(mapRef.current);

    // CRITICAL FIX: Force map to recalculate size immediately upon mount
    // This fixes the grey map / stuck center issue in conditional cards
    setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
    }, 50);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      pickupRef.current = null;
      dropoffRef.current = null;
    };
  }, []);

  // 2. COMBINED UPDATE LOGIC (Markers + Centering)
  // We use one effect to ensure markers exist before we try to center on them
  useEffect(() => {
    if (!mapRef.current) return;

    // Ensure coordinates are numbers (safeguards against backend string issues)
    const pLat = parseFloat(pickup?.lat);
    const pLng = parseFloat(pickup?.lng);
    const dLat = parseFloat(dropoff?.lat);
    const dLng = parseFloat(dropoff?.lng);

    // if (!pLat || !pLng || !dLat || !dLng) return; changed for recent delivery section

    if (
      Number.isNaN(pLat) ||
      Number.isNaN(pLng) ||
      Number.isNaN(dLat) ||
      Number.isNaN(dLng)
    ) {
      return;
    }

    // --- UPDATE PICKUP MARKER ---
    if (!pickupRef.current) {
      pickupRef.current = L.marker([pLat, pLng], { icon: greenIcon }).addTo(mapRef.current);
      pickupRef.current.bindPopup("Pickup");
    } else {
      pickupRef.current.setLatLng([pLat, pLng]);
    }

    // --- UPDATE DROPOFF MARKER ---
    if (!dropoffRef.current) {
      dropoffRef.current = L.marker([dLat, dLng], { icon: redIcon }).addTo(mapRef.current);
      dropoffRef.current.bindPopup("Dropoff");
    } else {
      dropoffRef.current.setLatLng([dLat, dLng]);
    }

    // --- AUTO-CENTER & FIT BOUNDS ---
    // We use requestAnimationFrame to ensure Leaflet has rendered the markers first
    // requestAnimationFrame(() => {
    //     if (!mapRef.current) return;

        

    //     const bounds = L.latLngBounds(
    //       [pLat, pLng], 
    //       [dLat, dLng]
    //     );

    //     mapRef.current.fitBounds(bounds, {
    //       padding: [60, 60],
    //       maxZoom: 15,
    //       animate: true,
    //     });
        
    //     // Final size check to ensure map is visible in the card
    //     setTimeout(() => {
    //         mapRef.current?.invalidateSize();
    //     }, 100);
    // });

    // --- AUTO-CENTER & FIT BOUNDS ---
    setTimeout(() => {
      if (!mapRef.current) return;

      // 🔥 CRITICAL: fix container size first
      mapRef.current.invalidateSize();

      const bounds = L.latLngBounds(
        [pLat, pLng],
        [dLat, dLng]
      );

      mapRef.current.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 15,
        animate: true,
      });

    }, 150);


  }, [pickup, dropoff]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: "300px", width: "100%", borderRadius: "16px", zIndex: 0 }}
    />
  );
}