import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-6', className)}
      {...props}
    >
      <path d="M9 12l2 2 4-4" />
      <path d="M21 12a9 9 0 1 1-9-9 9.1 9.1 0 0 1 7.1 3.4" />
    </svg>
  );
}
