import { useEffect, useState } from 'react';

import AdminMediaBrowser from './AdminMediaBrowser.jsx';

export default function AdminMediaPicker({
  buttonLabel = 'Elegir de la biblioteca',
  onSelect,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        className="button button--outline button--compact"
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        {buttonLabel}
      </button>

      {open && (
        <div
          className="media-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            className="media-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Biblioteca de imágenes"
          >
            <header className="media-modal__header">
              <div>
                <p className="eyebrow">Medios</p>
                <h2>Biblioteca de imágenes</h2>
              </div>
              <button
                className="text-button"
                type="button"
                onClick={() => setOpen(false)}
                autoFocus
              >
                Cerrar
              </button>
            </header>

            <AdminMediaBrowser
              onSelect={(url) => {
                onSelect(url);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
