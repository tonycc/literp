export interface StatusTagProps {
  value: string;
  type?: 'status' | 'type' | 'acquisitionMethod' | 'template';
  showTooltip?: boolean;
  className?: string;
}