import { useState } from 'react';
import { resolveProductImageUrl } from '../../utils/mediaUrl';

function Placeholder({ className }) {
    return (
        <div
            className={`flex items-center justify-center bg-gradient-to-br from-slate-800/90 to-slate-900 text-slate-500 ${className || ''}`}
            aria-hidden
        >
            <svg className="h-10 w-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
            </svg>
        </div>
    );
}

/**
 * Product image with dev-friendly /uploads handling and a calm fallback when the URL fails.
 */
const ProductThumb = ({ url, alt, className = '', imgClassName = 'h-full w-full object-contain' }) => {
    const resolved = resolveProductImageUrl(url);
    const [failed, setFailed] = useState(false);

    if (!resolved || failed) {
        return <Placeholder className={className} />;
    }

    return (
        <div className={`relative overflow-hidden ${className || ''}`}>
            <img
                draggable={false}
                className={imgClassName}
                src={resolved}
                alt={alt || ''}
                loading="lazy"
                decoding="async"
                onError={() => setFailed(true)}
            />
        </div>
    );
};

export default ProductThumb;
