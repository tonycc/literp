export interface StatusTagProps {
  value: string;
  type?: 'status' | 'type' | 'acquisitionMethod';
  showTooltip?: boolean;
  className?: string;
}