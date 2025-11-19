import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  testId?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message, testId, size = 'md' }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4"
      data-testid={testId || 'loading-state'}
    >
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-primary mb-4`}
        data-testid={`${testId || 'loading'}-spinner`}
      />
      {message && (
        <p className="text-muted-foreground" data-testid={`${testId || 'loading'}-message`}>
          {message}
        </p>
      )}
    </div>
  );
}
