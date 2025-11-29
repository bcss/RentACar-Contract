/**
 * File: client/src/components/MaterialSymbol.tsx
 * @area UI Design System
 * @purpose Material Symbols Outlined icons with responsive scaling
 * 
 * @behaviour
 *  - Renders Material Symbols Outlined font icons
 *  - Uses inline fontSize (rem) to override external stylesheet
 *  - Scales proportionally with root font-size clamp
 */

interface MaterialSymbolProps {
  name: string;
  className?: string;
  filled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const sizeMap: Record<string, string> = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
};

export function MaterialSymbol({ 
  name, 
  className = '', 
  filled = false,
  size = 'md'
}: MaterialSymbolProps) {
  const style = {
    fontSize: sizeMap[size],
    fontVariationSettings: filled 
      ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
      : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"
  };
  
  return (
    <span 
      className={`material-symbols-outlined ${className}`}
      style={style}
    >
      {name}
    </span>
  );
}

export default MaterialSymbol;
