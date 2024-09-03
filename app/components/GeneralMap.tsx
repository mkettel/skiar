'use client';

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';


mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY as string;

const Map: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(-106.4798);
  const [lat, setLat] = useState(39.4680);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y',
      center: [lng, lat],
      zoom: zoom,
      pitch: 70,
      bearing: 180,
      
    });

    map.current.on('load', () => {
      if (!map.current) return;
      map.current.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });

      map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

      // Add the geocoder control to the map
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        marker: false,
        placeholder: 'Search for a location',
      });

      map.current.addControl(geocoder);

      // Listen for the 'result' event from the Geocoder
      geocoder.on('result', (e) => {
        const coords = e.result.center;
        map.current?.flyTo({
          center: coords,
          essential: true,
          zoom: 12 // You can adjust this zoom level
        });
      });
    });

    // Update state when the map moves
    map.current.on('move', () => {
      if (!map.current) return;
      setLng(Number(map.current.getCenter().lng.toFixed(4)));
      setLat(Number(map.current.getCenter().lat.toFixed(4)));
      setZoom(Number(map.current.getZoom().toFixed(2)));
    });
  }, []);

  return (
    <div>
      <div className="sidebar my-2">
        <span>Longitude:</span> <span className='px-2 text-sm  text-white bg-black border-black border-2 rounded-full'>{lng}</span> | Latitude: <span className='px-2 text-sm text-white bg-black border-black border-2 rounded-full'>{lat}</span> | Zoom: <span className='px-2 text-sm text-white bg-black border-black border-2 rounded-full'>{zoom}</span>
      </div>
      <div ref={mapContainer} className="map-container rounded-md" style={{ height: '700px', width: '800px' }} />
    </div>
  );
};

export default Map;