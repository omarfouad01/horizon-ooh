/**
 * ServiceIcon.tsx
 * Renders an Iconify icon for website service cards.
 * Kept in its own file so it can be lazy-imported from Home.tsx and Services.tsx,
 * preventing @iconify/react (51 KB) from entering the eager LCP bundle.
 */
import { lazy, Suspense } from 'react';

const LazyIcon = lazy(() =>
  import('@iconify/react').then(m => ({ default: m.Icon }))
);

interface ServiceIconProps {
  icon: string;
  size?: number;
  className?: string;
  color?: string;
}

export function ServiceIcon({ icon, size = 32, className = '', color }: ServiceIconProps) {
  if (!icon) return null;
  return (
    <Suspense fallback={<span style={{ display: 'inline-block', width: size, height: size }} />}>
      <LazyIcon
        icon={icon}
        width={size}
        height={size}
        className={className}
        style={color ? { color } : undefined}
      />
    </Suspense>
  );
}
