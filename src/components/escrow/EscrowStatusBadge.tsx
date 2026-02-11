import { Badge } from "@/components/ui/badge";

interface EscrowStatusBadgeProps {
  status: number;
}

export function EscrowStatusBadge({ status }: EscrowStatusBadgeProps) {
  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { label: 'Created', variant: 'secondary' as const, color: 'bg-gray-500' };
      case 1:
        return { label: 'Funded', variant: 'default' as const, color: 'bg-blue-500' };
      case 2:
        return { label: 'Completed', variant: 'default' as const, color: 'bg-yellow-500' };
      case 3:
        return { label: 'Released', variant: 'default' as const, color: 'bg-green-500' };
      case 4:
        return { label: 'Cancelled', variant: 'destructive' as const, color: 'bg-red-500' };
      default:
        return { label: 'Unknown', variant: 'outline' as const, color: 'bg-gray-400' };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <Badge variant={statusInfo.variant} className={`${statusInfo.color} text-white`}>
      {statusInfo.label}
    </Badge>
  );
}
