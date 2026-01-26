/**
 * Calculate intermediate point between two coordinates given a fraction (0-1)
 * along the Great Circle path.
 */
export const toRad = (deg) => deg * Math.PI / 180;
export const toDeg = (rad) => rad * 180 / Math.PI;

export const getIntermediatePoint = (lat1, lon1, lat2, lon2, fraction) => {
    const φ1 = toRad(lat1);
    const λ1 = toRad(lon1);
    const φ2 = toRad(lat2);
    const λ2 = toRad(lon2);

    const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((φ2 - φ1) / 2), 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.pow(Math.sin((λ2 - λ1) / 2), 2)));

    if (d === 0) return [lat1, lon1];

    const a = Math.sin((1 - fraction) * d) / Math.sin(d);
    const b = Math.sin(fraction * d) / Math.sin(d);

    const x = a * Math.cos(φ1) * Math.cos(λ1) + b * Math.cos(φ2) * Math.cos(λ2);
    const y = a * Math.cos(φ1) * Math.sin(λ1) + b * Math.cos(φ2) * Math.sin(λ2);
    const z = a * Math.sin(φ1) + b * Math.sin(φ2);

    const φi = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λi = Math.atan2(y, x);

    return [toDeg(φi), toDeg(λi)];
};

/**
 * Generate a set of points for a Great Circle path between two coordinates.
 * @param {Array} start [lat, lon]
 * @param {Array} end [lat, lon]
 * @param {number} numPoints Number of points to generate (default 100)
 */
export const getGeodesicPath = (start, end, numPoints = 100) => {
    const path = [];
    for (let i = 0; i <= numPoints; i++) {
        path.push(getIntermediatePoint(start[0], start[1], end[0], end[1], i / numPoints));
    }
    return path;
};
