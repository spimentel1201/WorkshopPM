import { Badge } from '@/components/ui/Badge';
import { RepairStatus } from '@/types/repair';

interface StatusBadgeProps {
  status: RepairStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getVariantAndText = () => {
    switch (status) {
      case RepairStatus.PENDING:
        return { variant: 'warning' as const, text: 'Pendiente' };
      case RepairStatus.IN_PROGRESS:
        return { variant: 'info' as const, text: 'En Reparación' };
      case RepairStatus.COMPLETED:
        return { variant: 'success' as const, text: 'Listo' };
      case RepairStatus.DELIVERED:
        return { variant: 'primary' as const, text: 'Entregado' };
      case RepairStatus.CANCELLED:
        return { variant: 'error' as const, text: 'Cancelado' };
      default:
        return { variant: 'primary' as const, text: 'Desconocido' };
    }
  };

  const { variant, text } = getVariantAndText();

  return <Badge variant={variant} text={text} />;
};