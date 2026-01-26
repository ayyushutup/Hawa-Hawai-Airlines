import React, { useEffect, useRef, useState } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

const SmoothPlaneMarker = ({ flight, onClick, isSelected }) => {
    const [position, setPosition] = useState([flight.latitude, flight.longitude]);
    const [heading, setHeading] = useState(flight.heading);

    // Refs for animation
    const requestRef = useRef();
    const startTimeRef = useRef();
    const startPosRef = useRef([flight.latitude, flight.longitude]);
    const startHeadingRef = useRef(flight.heading);
    const targetPosRef = useRef([flight.latitude, flight.longitude]);
    const targetHeadingRef = useRef(flight.heading);

    // Animation duration in ms (slightly larger than poll interval to prevent stops if lag)
    const DURATION = 16000;

    // Update targets when props change
    useEffect(() => {
        startPosRef.current = position;
        startHeadingRef.current = heading;
        targetPosRef.current = [flight.latitude, flight.longitude];

        // Handle heading wrap-around (e.g. 350 -> 10)
        let newHeading = flight.heading;
        const diff = newHeading - heading;
        if (diff > 180) newHeading -= 360;
        if (diff < -180) newHeading += 360;
        targetHeadingRef.current = newHeading;

        startTimeRef.current = performance.now();

        // Cancel any existing loop to restart with new targets
        cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(requestRef.current);
    }, [flight.latitude, flight.longitude, flight.heading, flight.id]);

    const animate = (time) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        const elapsed = time - startTimeRef.current;
        const progress = Math.min(elapsed / DURATION, 1.0);

        // Linear interpolation
        const currentLat = startPosRef.current[0] + (targetPosRef.current[0] - startPosRef.current[0]) * progress;
        const currentLng = startPosRef.current[1] + (targetPosRef.current[1] - startPosRef.current[1]) * progress;
        const currentHeading = startHeadingRef.current + (targetHeadingRef.current - startHeadingRef.current) * progress;

        setPosition([currentLat, currentLng]);
        setHeading(currentHeading);

        if (progress < 1.0) {
            requestRef.current = requestAnimationFrame(animate);
        }
    };

    const color = flight.is_my_flight ? '#D4AF37' : '#2E004B';
    const size = flight.is_my_flight ? 40 : 28; // Slightly larger for better visibility
    const zIndex = flight.is_my_flight ? 1000 : 1; // My flights always on top

    // SVG Plane Icon
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size}" height="${size}" style="transform: rotate(${heading}deg); filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
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
            position={position}
            icon={icon}
            zIndexOffset={zIndex}
            eventHandlers={{
                click: () => onClick(flight),
            }}
        />
    );
};

export default SmoothPlaneMarker;
