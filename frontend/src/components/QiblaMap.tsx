import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MAKKAH_LAT = 21.4225;
const MAKKAH_LNG = 39.8262;

interface QiblaMapProps {
  userLat: number;
  userLng: number;
  city?: string;
}

export default function QiblaMap({ userLat, userLng, city }: QiblaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [(userLat + MAKKAH_LAT) / 2, (userLng + MAKKAH_LNG) / 2],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    // Add zoom control to bottom-left
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // Attribution bottom-right
    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('© <a href="https://openstreetmap.org">OSM</a>')
      .addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear existing layers (except tile layer)
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    const isValidLocation = userLat !== 0 || userLng !== 0;
    if (!isValidLocation) return;

    // Kaaba icon
    const kaabaIcon = L.divIcon({
      html: '<div style="font-size:28px;text-align:center;line-height:1;">🕋</div>',
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // User icon
    const userIcon = L.divIcon({
      html: '<div style="font-size:24px;text-align:center;line-height:1;">📍</div>',
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    // Add markers
    L.marker([MAKKAH_LAT, MAKKAH_LNG], { icon: kaabaIcon })
      .addTo(map)
      .bindPopup('<b>الكعبة المشرفة</b><br/>مكة المكرمة');

    L.marker([userLat, userLng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`<b>موقعك</b><br/>${city || ''}`);

    // Qibla line (geodesic approximation with intermediate points)
    const points: [number, number][] = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const lat = userLat + (MAKKAH_LAT - userLat) * f;
      const lng = userLng + (MAKKAH_LNG - userLng) * f;
      points.push([lat, lng]);
    }

    L.polyline(points, {
      color: 'hsl(142, 71%, 45%)',
      weight: 3,
      opacity: 0.8,
      dashArray: '8, 6',
    }).addTo(map);

    // Small circle around user location
    L.circle([userLat, userLng], {
      radius: 5000,
      color: 'hsl(142, 71%, 45%)',
      fillColor: 'hsl(142, 71%, 45%)',
      fillOpacity: 0.15,
      weight: 1,
    }).addTo(map);

    // Fit bounds
    const bounds = L.latLngBounds(
      [userLat, userLng],
      [MAKKAH_LAT, MAKKAH_LNG]
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [userLat, userLng, city]);

  return (
    <div className="w-full max-w-sm min-w-0">
      <div
        ref={mapRef}
        className="h-[350px] w-full overflow-hidden rounded-2xl border border-border shadow-lg"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-[2px] w-4 border-t-2 border-dashed border-primary" />
          <span className="text-[10px] text-muted-foreground break-words">خط اتجاه القبلة</span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="text-xs">🕋</span>
          <span className="text-[10px] text-muted-foreground">الكعبة</span>
          <span className="mx-1 text-muted-foreground/30">|</span>
          <span className="text-xs">📍</span>
          <span className="text-[10px] text-muted-foreground">موقعك</span>
        </div>
      </div>
    </div>
  );
}
