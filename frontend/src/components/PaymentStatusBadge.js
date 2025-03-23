import React from 'react';
import { Badge } from 'react-bootstrap';

const PaymentStatusBadge = ({ status }) => {
  let variant;
  
  switch (status) {
    case 'pagado':
      variant = 'success';
      break;
    case 'pendiente':
      variant = 'warning';
      break;
    case 'cancelado':
      variant = 'danger';
      break;
    default:
      variant = 'secondary';
  }
  
  return (
    <Badge 
      bg={variant} 
      className={`payment-status-badge payment-status-${status}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default PaymentStatusBadge;