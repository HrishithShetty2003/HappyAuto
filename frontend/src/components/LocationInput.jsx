import React, { useState, useEffect, useRef } from "react";

export default function LocationInput({ label, icon, value, onSelect }) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch address suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 3) {
        try {
          const res = await fetch(
            `https://photon.komoot.io/api/?q=${query}&limit=5`
          );
          const data = await res.json();
          setResults(data.features || []);
          setIsOpen(true);
        } catch (e) {
          console.error("Error fetching location", e);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 400); // Debounce search by 400ms

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (place) => {
    const address = place.properties.name;
    // Use city/state if name is too generic, otherwise just use the formatted name
    const fullAddress = place.properties.city 
      ? `${address}, ${place.properties.city}` 
      : address;

    const lat = place.geometry.coordinates[1];
    const lng = place.geometry.coordinates[0];

    setQuery(fullAddress);
    setIsOpen(false);
    
    onSelect({
      address: fullAddress,
      lat: lat,
      lng: lng
    });
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Label */}
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
        {label}
      </label>

      {/* Input Field */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
          <span className="text-lg">{icon}</span>
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium"
          placeholder={`Search for ${label.toLowerCase()}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if(results.length > 0) setIsOpen(true) }}
        />
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto">
          {results.map((item, idx) => (
            <div
              key={idx}
              className="px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors group"
              onClick={() => handleSelect(item)}
            >
              <p className="text-sm font-semibold text-slate-800 group-hover:text-amber-700">
                {item.properties.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {item.properties.city && item.properties.city + ", "} 
                {item.properties.country}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}