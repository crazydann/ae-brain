'use client';
import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function Card({ title, children, className = '', action }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          {title && <h3 className="text-sm font-semibold text-gray-700">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
