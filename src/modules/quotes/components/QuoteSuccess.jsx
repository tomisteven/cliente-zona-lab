import { Link } from 'react-router-dom';

import { CheckIcon, WhatsAppIcon } from '../../../shared/components/Icons.jsx';
import { formatCurrency } from '../../../shared/utils/format.js';

export default function QuoteSuccess({ result }) {
  const { quote, whatsappUrl } = result;
  const hasFiles = quote.files.logo || quote.files.reference;

  return (
    <div className="success-panel">
      <span className="success-panel__icon">
        <CheckIcon />
      </span>
      <p className="eyebrow">Pedido registrado</p>
      <h1>Tu cotización está lista para enviar.</h1>
      <p className="success-panel__code">{quote.code}</p>

      <div className="success-panel__summary">
        <div>
          <span>Producto</span>
          <strong>{quote.product.name}</strong>
        </div>
        <div>
          <span>Cantidad</span>
          <strong>{quote.quantity} unidades</strong>
        </div>
        <div>
          <span>Precio estimado</span>
          <strong>
            {quote.pricing.status === 'estimated'
              ? formatCurrency(quote.pricing.estimatedTotal)
              : 'A cotizar'}
          </strong>
        </div>
      </div>

      <p>
        El pedido quedó guardado con tus datos. Si WhatsApp no se abrió automáticamente, usá el
        botón para continuar la conversación.
      </p>

      {hasFiles && (
        <p className="success-panel__note">
          Importante: adjuntá el logo o la referencia en el chat de WhatsApp. El archivo no se envía
          automáticamente.
        </p>
      )}

      <div className="success-panel__actions">
        {whatsappUrl && (
          <a
            className="button button--accent button--large"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsAppIcon />
            Abrir WhatsApp
          </a>
        )}
        <Link className="button button--outline" to="/catalogo">
          Volver al catálogo
        </Link>
        <Link className="text-link" to="/personalizar">
          Hacer otro pedido
        </Link>
      </div>
    </div>
  );
}
