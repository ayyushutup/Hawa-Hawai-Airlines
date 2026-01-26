import { AlertCircle, RefreshCw, WifiOff, XCircle } from 'lucide-react';

/**
 * Error banner component for displaying user-friendly error messages.
 * Supports different error types and optional retry functionality.
 */
export default function ErrorBanner({
    message,
    code = 'UNKNOWN_ERROR',
    onRetry = null,
    onDismiss = null,
    className = ''
}) {
    // Determine icon and styling based on error code
    const getErrorConfig = () => {
        switch (code) {
            case 'NETWORK_ERROR':
                return {
                    icon: WifiOff,
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-orange-200',
                    textColor: 'text-orange-800',
                    iconColor: 'text-orange-500'
                };
            case 'UNAUTHORIZED':
            case 'FORBIDDEN':
                return {
                    icon: XCircle,
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    textColor: 'text-red-800',
                    iconColor: 'text-red-500'
                };
            case 'RATE_LIMITED':
                return {
                    icon: AlertCircle,
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    textColor: 'text-yellow-800',
                    iconColor: 'text-yellow-500'
                };
            default:
                return {
                    icon: AlertCircle,
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    textColor: 'text-red-800',
                    iconColor: 'text-red-500'
                };
        }
    };

    const config = getErrorConfig();
    const Icon = config.icon;

    return (
        <div
            role="alert"
            aria-live="polite"
            className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}
        >
            <div className="flex items-start gap-3">
                <Icon
                    className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`}
                    aria-hidden="true"
                />
                <div className="flex-1">
                    <p className={`text-sm font-medium ${config.textColor}`}>
                        {message}
                    </p>

                    {(onRetry || onDismiss) && (
                        <div className="mt-3 flex gap-3">
                            {onRetry && (
                                <button
                                    onClick={onRetry}
                                    className={`inline-flex items-center gap-1.5 text-sm font-medium ${config.textColor} hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current rounded`}
                                    aria-label="Retry the failed action"
                                >
                                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                                    Try again
                                </button>
                            )}
                            {onDismiss && (
                                <button
                                    onClick={onDismiss}
                                    className={`text-sm ${config.textColor} opacity-70 hover:opacity-100 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded`}
                                    aria-label="Dismiss this error message"
                                >
                                    Dismiss
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
