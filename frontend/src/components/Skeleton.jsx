/**
 * Skeleton loading component with animated shimmer effect.
 * Used to show loading placeholders while content is being fetched.
 */

/**
 * Base skeleton component with shimmer animation.
 */
export function Skeleton({ className = '', width, height, rounded = 'md' }) {
    const roundedClasses = {
        none: '',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-full'
    };

    return (
        <div
            className={`bg-gray-200 animate-pulse ${roundedClasses[rounded]} ${className}`}
            style={{ width, height }}
            aria-hidden="true"
        />
    );
}

/**
 * Skeleton for text lines.
 */
export function SkeletonText({ lines = 1, className = '' }) {
    return (
        <div className={`space-y-2 ${className}`} aria-hidden="true">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className="h-4"
                    width={i === lines - 1 ? '75%' : '100%'}
                />
            ))}
        </div>
    );
}

/**
 * Skeleton for a flight card in search results.
 */
export function SkeletonFlightCard() {
    return (
        <div
            className="p-6 rounded-2xl shadow-sm border border-gray-100 bg-white"
            aria-hidden="true"
            role="presentation"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {/* Icon placeholder */}
                    <Skeleton width={64} height={64} rounded="xl" />

                    {/* Time and code */}
                    <div className="space-y-2">
                        <Skeleton width={60} height={28} rounded="md" />
                        <Skeleton width={40} height={16} rounded="md" />
                    </div>

                    {/* Arrow */}
                    <div className="flex flex-col items-center px-4">
                        <Skeleton width={50} height={12} rounded="md" />
                        <div className="w-24 h-px bg-gray-200 my-2" />
                    </div>

                    {/* Arrival time and code */}
                    <div className="space-y-2">
                        <Skeleton width={60} height={28} rounded="md" />
                        <Skeleton width={40} height={16} rounded="md" />
                    </div>
                </div>

                {/* Price */}
                <div className="text-right space-y-2">
                    <Skeleton width={80} height={28} rounded="md" />
                    <Skeleton width={60} height={16} rounded="md" />
                </div>
            </div>
        </div>
    );
}

/**
 * Skeleton for statistics cards in admin dashboard.
 */
export function SkeletonStatCard() {
    return (
        <div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            aria-hidden="true"
        >
            <div className="flex items-center gap-4">
                <Skeleton width={48} height={48} rounded="lg" />
                <div className="space-y-2 flex-1">
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="40%" height={24} />
                </div>
            </div>
        </div>
    );
}

/**
 * Skeleton for table rows.
 */
export function SkeletonTableRow({ columns = 4 }) {
    return (
        <tr aria-hidden="true">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton height={20} rounded="md" />
                </td>
            ))}
        </tr>
    );
}

export default Skeleton;
