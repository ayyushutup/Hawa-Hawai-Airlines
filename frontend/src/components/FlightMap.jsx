import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SmoothPlaneMarker from './SmoothPlaneMarker';
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

            {flights.map(flight => (
                <SmoothPlaneMarker
                    key={flight.id}
                    flight={flight}
                    isSelected={selectedFlightId === flight.id}
                    onClick={onFlightSelect}
                />
            ))}
        </MapContainer>
    );
};

export default FlightMap;
