'use client';

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY as string;

interface Comment {
  id: string;
  text: string;
  coordinates: number[][];
}

const Map: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [lng, setLng] = useState(-106.4798);
  const [lat, setLat] = useState(39.4680);
  const [zoom, setZoom] = useState(13);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [currentComment, setCurrentComment] = useState('');
  const [currentPolygon, setCurrentPolygon] = useState<any>(null);

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

      // Add the draw control to the map
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        },
      });
      map.current.addControl(draw.current);

      // Listen for draw.create events
      map.current.on('draw.create', onDrawCreate);

      // Listen for the 'result' event from the Geocoder
      geocoder.on('result', (e) => {
        const coords = e.result.center;
        map.current?.flyTo({
          center: coords,
          essential: true,
          zoom: 12
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

  const onDrawCreate = (e: any) => {
    const polygon = e.features[0];
    setCurrentPolygon(polygon);
    setShowCommentInput(true);
  };

  const handleCommentSubmit = () => {
    if (currentComment && currentPolygon) {
      setComments([...comments, { 
        id: currentPolygon.id, 
        text: currentComment, 
        coordinates: currentPolygon.geometry.coordinates[0] 
      }]);
      setCurrentComment('');
      setShowCommentInput(false);
      setCurrentPolygon(null);
    }
  };

  const focusOnComment = (comment: Comment) => {
    if (map.current) {
      const bounds = new mapboxgl.LngLatBounds(); 
      comment.coordinates.forEach((coord) => bounds.extend(coord as [number, number]));
      map.current.fitBounds(bounds, { padding: 10 });
    }
  };

  return (
    <div className="relative">
      <div className="sidebar my-2">
        <span>Longitude:</span> <span className='px-2 text-sm  text-white bg-black border-black border-2 rounded-full'>{lng}</span> | Latitude: <span className='px-2 text-sm text-white bg-black border-black border-2 rounded-full'>{lat}</span> | Zoom: <span className='px-2 text-sm text-white bg-black border-black border-2 rounded-full'>{zoom}</span>
      </div>
      <div ref={mapContainer} className="map-container rounded-md" style={{ height: '700px', width: '800px' }} />
      
      <AnimatePresence>
        {showCommentInput && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 bg-white p-4 rounded-md shadow-md"
          >
            <textarea 
              value={currentComment}
              onChange={(e) => setCurrentComment(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter your comment..."
            />
            <button 
              onClick={handleCommentSubmit}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Submit Comment
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4"
      >
        <h3 className="text-xl font-bold mb-2">Comments</h3>
        {comments.map((comment) => (
          <motion.div 
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-100 p-4 rounded-md mb-2"
          >
            <p>{comment.text}</p>
            <button 
              onClick={() => focusOnComment(comment)}
              className="mt-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Focus
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Map;