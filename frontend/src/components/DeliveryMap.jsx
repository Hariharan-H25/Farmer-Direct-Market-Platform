import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Clock, ShieldCheck } from 'lucide-react';

// Custom Marker Icons for Leaflet
const createCustomIcon = (bgColor, emoji) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${bgColor};
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        border: 2px solid #ffffff;
        font-size: 18px;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });
};

const farmIcon = createCustomIcon('#0F5A32', '🌾');
const driverIcon = createCustomIcon('#0284c7', '🛵');
const homeIcon = createCustomIcon('#ea580c', '📍');

const DeliveryMap = ({ 
  pickupLocation, 
  deliveryLocation, 
  liveLocation, 
  deliveryStatus,
  estimatedArrivalMinutes 
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center point (defaults to Tamil Nadu center if no coords)
    const defaultCenter = [
      liveLocation?.lat || pickupLocation?.lat || deliveryLocation?.lat || 11.3410,
      liveLocation?.lng || pickupLocation?.lng || deliveryLocation?.lng || 77.7172
    ];

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false
      });

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const activeLatLngs = [];

    // 1. Pickup (Farm) Marker
    if (pickupLocation?.lat && pickupLocation?.lng) {
      const farmPos = [pickupLocation.lat, pickupLocation.lng];
      activeLatLngs.push(farmPos);

      if (markersRef.current.farm) {
        markersRef.current.farm.setLatLng(farmPos);
      } else {
        markersRef.current.farm = L.marker(farmPos, { icon: farmIcon })
          .addTo(map)
          .bindPopup(`<b>🌾 Pickup Farm</b><br/>${pickupLocation.farmName || 'Local Farm'}<br/><small>${pickupLocation.address || ''}</small>`);
      }
    }

    // 2. Dropoff (Customer) Marker
    if (deliveryLocation?.lat && deliveryLocation?.lng) {
      const dropPos = [deliveryLocation.lat, deliveryLocation.lng];
      activeLatLngs.push(dropPos);

      if (markersRef.current.customer) {
        markersRef.current.customer.setLatLng(dropPos);
      } else {
        markersRef.current.customer = L.marker(dropPos, { icon: homeIcon })
          .addTo(map)
          .bindPopup(`<b>📍 Delivery Address</b><br/>Dropoff Destination`);
      }
    }

    // 3. Driver Live Location Marker
    if (liveLocation?.lat && liveLocation?.lng) {
      const driverPos = [liveLocation.lat, liveLocation.lng];
      activeLatLngs.push(driverPos);

      if (markersRef.current.driver) {
        markersRef.current.driver.setLatLng(driverPos);
      } else {
        markersRef.current.driver = L.marker(driverPos, { icon: driverIcon })
          .addTo(map)
          .bindPopup(`<b>🛵 Delivery Partner</b><br/>Speed: ${liveLocation.speed || 0} km/h<br/>Live GPS Signal Active`);
      }
    }

    // 4. Route Polyline
    if (activeLatLngs.length >= 2) {
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(activeLatLngs);
      } else {
        polylineRef.current = L.polyline(activeLatLngs, {
          color: '#0F5A32',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8'
        }).addTo(map);
      }

      // Fit map viewport to encompass all points
      try {
        map.fitBounds(L.latLngBounds(activeLatLngs), { padding: [50, 50] });
      } catch {
        // ignore bounds calculation error
      }
    }

    return () => {
      // cleanup on unmount
    };
  }, [pickupLocation, deliveryLocation, liveLocation]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shadow-md">
      {/* Map Status Bar */}
      <div className="bg-slate-900 text-white p-3.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">
            Status: <span className="text-emerald-400">{deliveryStatus || 'Pending'}</span>
          </span>
        </div>

        {estimatedArrivalMinutes ? (
          <div className="flex items-center gap-1.5 font-bold bg-emerald-950 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-800">
            <Clock size={14} />
            <span>Estimated Arrival: <strong className="text-white text-sm">{estimatedArrivalMinutes} mins</strong></span>
          </div>
        ) : (
          <div className="text-gray-400 font-medium">
            ETA calculated once live transit begins
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1 text-gray-400">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>OpenStreetMap Live Logistics</span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[320px] sm:h-[420px] relative z-10"
      />

      {/* Legend */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-2.5 px-4 flex flex-wrap items-center justify-around gap-4 text-[11px] font-bold text-gray-700 dark:text-gray-300">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#0F5A32] inline-block" /> 🌾 Farmer Pickup Location
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#0284c7] inline-block" /> 🛵 Delivery Partner
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ea580c] inline-block" /> 📍 Customer Destination
        </span>
      </div>
    </div>
  );
};

export default DeliveryMap;
