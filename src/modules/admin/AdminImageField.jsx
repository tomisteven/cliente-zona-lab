import { useState } from 'react';

import { resolveMediaUrl } from '../../shared/api/http-client.js';
import { UploadIcon } from '../../shared/components/Icons.jsx';
import { validateMediaFile, MEDIA_FILE_ACCEPT } from '../../shared/utils/files.js';
import { uploadAdminMedia } from './admin.api.js';

export default function AdminImageField({ id, label, value, onChange, hint }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFileChange(event) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';

    if (!file) {
      return;
    }

    const validationMessage = validateMediaFile(file);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await uploadAdminMedia(file);
      onChange(response.file.url);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-image-field">
      <div className="admin-image-field__heading">
        <span>{label}</span>
        {value && (
          <button
            className="text-button text-button--danger"
            type="button"
            onClick={() => onChange('')}
          >
            Quitar imagen
          </button>
        )}
      </div>

      <div className={`admin-image-field__body ${value ? 'has-image' : ''}`}>
        {value ? (
          <img src={resolveMediaUrl(value)} alt="Vista previa de la imagen seleccionada" />
        ) : (
          <span className="admin-image-field__placeholder" aria-hidden="true">
            ZL
          </span>
        )}

        <div>
          <label className="button button--outline button--compact" htmlFor={id}>
            <UploadIcon />
            {uploading ? 'Subiendo…' : value ? 'Cambiar imagen' : 'Subir imagen'}
          </label>
          <input
            id={id}
            className="file-input"
            type="file"
            accept={MEDIA_FILE_ACCEPT}
            onChange={handleFileChange}
            disabled={uploading}
          />
          <p className="field-hint">{hint ?? 'PNG, JPG o WEBP · hasta 8 MB.'}</p>
        </div>
      </div>

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
