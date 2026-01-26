import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Marker } from 'react-leaflet';
import { getGeodesicPath } from '../utils/geodesic';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FlightMap = ({ flights, selectedFlightId, onFlightSelect }) => {
    const center = [20.5937, 78.9629]; // India center

    // Calculate path for selected flight
    const selectedPath = useMemo(() => {
        if (!selectedFlightId) return null;
        const flight = flights.find(f => f.id === selectedFlightId);
        if (!flight) return null;

        return getGeodesicPath(
            [flight.origin_lat || flight.latitude, flight.origin_lng || flight.longitude], // Fallback if origin coords missing in model, but model has them
            [flight.dest_lat || flight.latitude, flight.dest_lng || flight.longitude] // Wait, Flight model returns origin/dest objects? Need to check api response structure.
            // Tracking route returns origin: flight.origin.code. It does NOT return origin lat/long explicitly in "origin" field, but uses them for calc.
            // We need to pass origin/dest coordinates in the API response to draw the line!
        );
    }, [selectedFlightId, flights]);

    // We realized we need origin/dest coords in the API response to draw the full path properly from start to end.
    // The current API response has 'latitude' and 'longitude' of the CURRENT position.
    // It has 'origin' and 'destination' as CODES (e.g. DEL, BOM).
    // The frontend doesn't know the lat/lon of DEL/BOM unless we send it or look it up.
    // Let's assume for now we might need to update backend to send origin_coords and dest_coords.
    // OR we can just draw a line from the current plane position to the destination? No, we want the full arc.

    // ACTION: I will update this file, but I also need to update the backend to send origin/dest LatLon.
    // For now, let's leave the path logic commented or simple, and I'll do a quick backend fix next.

    return (
        <MapContainer
            center={center}
            zoom={5}
            style={{ height: '100%', width: '100%', minHeight: '600px', background: '#e2e8f0' }}
            zoomControl={false}
        >
            <ZoomControl position="bottomright" />

            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {/* Render Geodesic Path if a flight is selected */}
            {selectedPath && (
                <Polyline
                    positions={selectedPath}
                    pathOptions={{ color: '#D4AF37', weight: 2, dashArray: '5, 10', opacity: 0.6 }}
                />
            )}

            {flights.map(flight => {
                // Create icon inline or memoize outside
                const color = flight.is_my_flight ? '#D4AF37' : '#2E004B';
                const size = flight.is_my_flight ? 40 : 28;
                const svg = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size}" height="${size}" style="transform: rotate(${flight.heading}deg); filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>
                `;
                const icon = L.divIcon({
                    html: svg,
                    className: 'bg-transparent',
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                });

                return (
                    <Marker
                        key={flight.id}
                        position={[flight.latitude, flight.longitude]}
                        icon={icon}
                        zIndexOffset={flight.is_my_flight ? 1000 : 1}
                        eventHandlers={{
                            click: () => onFlightSelect(flight),
                        }}
                    />
                );
            })}
        </MapContainer>
    );
};

export default FlightMap;
