import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export function ProductImage({
  src,
  alt,
  className = 'h-full w-full object-cover',
  containerClassName = 'aspect-[4/3] w-full overflow-hidden bg-slate-100',
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const trimmedSrc = src?.trim();

  if (!trimmedSrc || hasError) {
    return (
      <div
        className={`${containerClassName} flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-teal-50/40 text-slate-400`}
        role="img"
        aria-label={alt}
      >
        <Package className="h-9 w-9 stroke-[1.5] text-teal-700/40" aria-hidden="true" />
        <span className="mt-2 max-w-[80%] truncate px-3 text-center text-xs font-medium text-slate-500">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <img
        src={trimmedSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={className}
        loading="lazy"
      />
    </div>
  );
}
