import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, ShieldCheck, Navigation, AlertCircle, MapPin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Custom Marker Icons for Leaflet
const createCustomIcon = (bgColor, emoji) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${bgColor};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        border: 2px solid #ffffff;
        font-size: 16px;
        user-select: none;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
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
  const { theme } = useTheme();
  const { t } = useLanguage();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);

  const [routeInfo, setRouteInfo] = useState({ distanceKm: null, durationMins: null });
  const [routeLoading, setRouteLoading] = useState(false);

  const hasPickup = typeof pickupLocation?.lat === 'number' && typeof pickupLocation?.lng === 'number';
  const hasDelivery = typeof deliveryLocation?.lat === 'number' && typeof deliveryLocation?.lng === 'number';
  const hasLive = typeof liveLocation?.lat === 'number' && typeof liveLocation?.lng === 'number';
  const hasAnyCoords = hasPickup || hasDelivery || hasLive;

  // Initialize and update Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center point (defaults to central Tamil Nadu if no coords)
    const centerLat = liveLocation?.lat || pickupLocation?.lat || deliveryLocation?.lat || 11.1271;
    const centerLng = liveLocation?.lng || pickupLocation?.lng || deliveryLocation?.lng || 78.6569;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: hasAnyCoords ? 12 : 7,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Responsive tile theme: CartoDB Dark Matter for dark mode, OpenStreetMap for light mode
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    const activeBounds = [];

    // 1. Pickup (Farm) Marker
    if (hasPickup) {
      const pos = [pickupLocation.lat, pickupLocation.lng];
      activeBounds.push(pos);
      if (markersRef.current.farm) {
        markersRef.current.farm.setLatLng(pos);
      } else {
        markersRef.current.farm = L.marker(pos, { icon: farmIcon })
          .addTo(map)
          .bindPopup(`<b>🌾 ${pickupLocation.farmName || 'Farm Location'}</b><br/><small>${pickupLocation.address || 'Pickup Point'}</small>`);
      }
    } else if (markersRef.current.farm) {
      map.removeLayer(markersRef.current.farm);
      delete markersRef.current.farm;
    }

    // 2. Dropoff (Customer) Marker
    if (hasDelivery) {
      const pos = [deliveryLocation.lat, deliveryLocation.lng];
      activeBounds.push(pos);
      if (markersRef.current.customer) {
        markersRef.current.customer.setLatLng(pos);
      } else {
        markersRef.current.customer = L.marker(pos, { icon: homeIcon })
          .addTo(map)
          .bindPopup(`<b>📍 ${t('dropoffAddress')}</b><br/><small>Customer Destination</small>`);
      }
    } else if (markersRef.current.customer) {
      map.removeLayer(markersRef.current.customer);
      delete markersRef.current.customer;
    }

    // 3. Driver Live Location Marker
    if (hasLive) {
      const pos = [liveLocation.lat, liveLocation.lng];
      activeBounds.push(pos);
      if (markersRef.current.driver) {
        markersRef.current.driver.setLatLng(pos);
      } else {
        markersRef.current.driver = L.marker(pos, { icon: driverIcon })
          .addTo(map)
          .bindPopup(`<b>🛵 ${t('assignedPartner')}</b><br/>Speed: ${liveLocation.speed || 0} km/h<br/>Status: ${deliveryStatus || 'Active'}`);
      }
    } else if (markersRef.current.driver) {
      map.removeLayer(markersRef.current.driver);
      delete markersRef.current.driver;
    }

    // 4. Real Road Routing via OSRM
    if (hasPickup && hasDelivery) {
      setRouteLoading(true);
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pickupLocation.lng},${pickupLocation.lat};${deliveryLocation.lng},${deliveryLocation.lat}?overview=full&geometries=geojson`;

      fetch(osrmUrl)
        .then(res => res.json())
        .then(data => {
          if (data && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
            const durationMins = Math.round(route.duration / 60);
            setRouteInfo({ distanceKm, durationMins });

            // GeoJSON line coordinates are [lng, lat] -> convert to Leaflet [lat, lng]
            const lineCoords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

            if (polylineRef.current) {
              polylineRef.current.setLatLngs(lineCoords);
            } else {
              polylineRef.current = L.polyline(lineCoords, {
                color: '#10b981',
                weight: 5,
                opacity: 0.9,
                dashArray: null
              }).addTo(map);
            }

            try {
              map.fitBounds(L.latLngBounds(lineCoords), { padding: [40, 40] });
            } catch (_) {}
          } else {
            fallbackPolyline(map, activeBounds);
          }
        })
        .catch(() => {
          fallbackPolyline(map, activeBounds);
        })
        .finally(() => {
          setRouteLoading(false);
        });
    } else if (activeBounds.length > 0) {
      try {
        if (activeBounds.length === 1) {
          map.setView(activeBounds[0], 14);
        } else {
          map.fitBounds(L.latLngBounds(activeBounds), { padding: [40, 40] });
        }
      } catch (_) {}
    }

    // Invalidate map size after DOM render to prevent grey/blank tiles
    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(resizeTimer);
    };
  }, [pickupLocation, deliveryLocation, liveLocation, theme, hasPickup, hasDelivery, hasLive, deliveryStatus, t]);

  // Clean cleanup on component unmount to prevent Leaflet container reinitialization crash
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        markersRef.current = {};
        polylineRef.current = null;
      }
    };
  }, []);

  const fallbackPolyline = (map, bounds) => {
    if (bounds.length >= 2) {
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(bounds);
      } else {
        polylineRef.current = L.polyline(bounds, {
          color: '#10b981',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8'
        }).addTo(map);
      }
      try {
        map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
      } catch (_) {}
    }
  };

  const displayEta = estimatedArrivalMinutes || routeInfo.durationMins;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shadow-md">
      {/* Map Status Bar */}
      <div className="bg-slate-900 text-white p-3.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">
            {t('orderStatus')}: <span className="text-emerald-400">{t(deliveryStatus) || deliveryStatus || 'Active'}</span>
          </span>
        </div>

        {displayEta ? (
          <div className="flex items-center gap-1.5 font-bold bg-emerald-950 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-800">
            <Clock size={14} />
            <span>{t('estimatedArrival')}: <strong className="text-white text-sm">{displayEta} mins</strong></span>
          </div>
        ) : (
          <div className="text-gray-400 font-medium">
            {t('coordinatesNotice')}
          </div>
        )}

        {routeInfo.distanceKm && (
          <div className="flex items-center gap-1 text-emerald-300 bg-slate-800 px-2.5 py-1 rounded-lg">
            <Navigation size={13} />
            <span>{routeInfo.distanceKm} km route</span>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1 text-gray-400">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>OpenStreetMap Logistics</span>
        </div>
      </div>

      {/* Fallback Banner if no coordinates are available */}
      {!hasAnyCoords && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
          <span>GPS Coordinates Pending: Map routes and live driver tracking activate once pickup begins and location signal is broadcasted.</span>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[320px] sm:h-[400px] relative z-10"
      />

      {/* Legend */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-2.5 px-4 flex flex-wrap items-center justify-around gap-4 text-[11px] font-bold text-gray-700 dark:text-gray-300">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#0F5A32] inline-block" /> 🌾 {t('pickupFarm')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#0284c7] inline-block" /> 🛵 {t('assignedPartner')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ea580c] inline-block" /> 📍 {t('dropoffAddress')}
        </span>
      </div>
    </div>
  );
};

export default DeliveryMap;
