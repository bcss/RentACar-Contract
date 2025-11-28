/**
 * File: client/src/components/MaterialSymbol.tsx
 * @area UI Design System
 * @checklist UI Alignment Phase 2
 * @purpose Material Symbols Outlined icons for reference design alignment
 * 
 * @behaviour
 *  - Renders Material Symbols Outlined font icons
 *  - Supports filled variant via filled prop
 *  - Consistent sizing with text-lg, text-xl, text-2xl
 *  - RTL-aware icon display
 */

interface MaterialSymbolProps {
  name: string;
  className?: string;
  filled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const sizeClasses = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
  '2xl': 'text-3xl',
};

export function MaterialSymbol({ 
  name, 
  className = '', 
  filled = false,
  size = 'md'
}: MaterialSymbolProps) {
  const fillStyle = filled 
    ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
    : { fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" };
  
  return (
    <span 
      className={`material-symbols-outlined ${sizeClasses[size]} ${className}`}
      style={fillStyle}
    >
      {name}
    </span>
  );
}

export default MaterialSymbol;
