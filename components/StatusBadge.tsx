import { Badge } from '@/components/ui/Badge';
import { RepairOrderStatus } from '@/types/repair';

interface StatusBadgeProps {
  status: RepairOrderStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getVariantAndText = () => {
    switch (status) {
      case RepairOrderStatus.RECEIVED:
        return { variant: 'warning' as const, text: 'Pendiente' };
      case RepairOrderStatus.IN_PROGRESS:
        return { variant: 'info' as const, text: 'En Reparación' };
      case RepairOrderStatus.COMPLETED:
        return { variant: 'success' as const, text: 'Listo' };
      case RepairOrderStatus.DELIVERED:
        return { variant: 'primary' as const, text: 'Entregado' };
      case RepairOrderStatus.CANCELLED:
        return { variant: 'error' as const, text: 'Cancelado' };
      default:
        return { variant: 'primary' as const, text: 'Desconocido' };
    }
  };

  const { variant, text } = getVariantAndText();

  return <Badge variant={variant} text={text} />;
};