import { ReactNode } from 'react';

export interface GuidelineBoxProps {
  title?: string;
  children: ReactNode;
  testId?: string;
}

export function GuidelineBox({ title, children, testId }: GuidelineBoxProps) {
  return (
    <div className="p-4 bg-muted/50 rounded-lg" data-testid={testId || 'guidelines-box'}>
      {title && (
        <h4 className="font-medium mb-2" data-testid={`${testId || 'guidelines'}-title`}>
          {title}
        </h4>
      )}
      <div className="space-y-1 text-sm text-muted-foreground" data-testid={`${testId || 'guidelines'}-content`}>
        {children}
      </div>
    </div>
  );
}
