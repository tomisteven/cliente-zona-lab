import { useState } from 'react';

import { resolveMediaUrl } from '../../shared/api/http-client.js';
import { CloseIcon, UploadIcon } from '../../shared/components/Icons.jsx';
import { MEDIA_FILE_ACCEPT, validateMediaFile } from '../../shared/utils/files.js';
import { deleteAdminMedia, uploadAdminMedia } from './admin.api.js';
import AdminMediaPicker from './AdminMediaPicker.jsx';

export default function AdminGalleryField({
  id,
  label = 'Galería adicional',
  values = [],
  onChange,
  onPromote,
  max = 9,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFileChange(event) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (files.length === 0) {
      return;
    }

    const available = Math.max(0, max - values.length);
    const selectedFiles = files.slice(0, available);
    const validationMessage = selectedFiles.map((file) => validateMediaFile(file)).find(Boolean);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    if (files.length > available) {
      setError(`Podés agregar hasta ${max} imágenes adicionales.`);
      return;
    }

    setUploading(true);
    setError(null);

    const uploadedUrls = [];

    try {
      for (const file of selectedFiles) {
        const response = await uploadAdminMedia(file);

        uploadedUrls.push(response.file.url);
      }

      onChange([...values, ...uploadedUrls]);
    } catch (uploadError) {
      if (uploadedUrls.length > 0) {
        onChange([...values, ...uploadedUrls]);
      }

      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  }

  function handleRemove(imageUrl) {
    deleteAdminMedia(imageUrl).catch(() => {});
    onChange(values.filter((value) => value !== imageUrl));
  }

  function moveImage(index, direction) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= values.length) {
      return;
    }

    const nextValues = [...values];

    [nextValues[index], nextValues[nextIndex]] = [nextValues[nextIndex], nextValues[index]];
    onChange(nextValues);
  }

  function handlePickFromLibrary(imageUrl) {
    if (values.includes(imageUrl)) {
      setError('Esa imagen ya está en la galería.');
      return;
    }

    if (values.length >= max) {
      setError(`Podés agregar hasta ${max} imágenes adicionales.`);
      return;
    }

    setError(null);
    onChange([...values, imageUrl]);
  }

  return (
    <div className="admin-gallery">
      <div className="admin-image-field__heading">
        <span>{label}</span>
        <small>
          {values.length}/{max} imágenes
        </small>
      </div>

      {values.length > 0 && (
        <div className="admin-gallery__grid">
          {values.map((imageUrl, index) => (
            <div className="admin-gallery__item" key={imageUrl}>
              <img
                src={resolveMediaUrl(imageUrl)}
                alt={`Imagen adicional ${index + 1}`}
                loading="lazy"
              />
              <button
                className="admin-gallery__remove"
                type="button"
                aria-label={`Quitar imagen ${index + 1}`}
                onClick={() => handleRemove(imageUrl)}
              >
                <CloseIcon />
              </button>
              <div className="admin-gallery__actions">
                <button
                  type="button"
                  aria-label={`Mover imagen ${index + 1} a la izquierda`}
                  disabled={index === 0}
                  onClick={() => moveImage(index, -1)}
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label={`Mover imagen ${index + 1} a la derecha`}
                  disabled={index === values.length - 1}
                  onClick={() => moveImage(index, 1)}
                >
                  →
                </button>
                {onPromote && (
                  <button
                    type="button"
                    aria-label={`Usar imagen ${index + 1} como portada`}
                    onClick={() => onPromote(imageUrl)}
                  >
                    Portada
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="admin-image-field__buttons">
          <label className="button button--outline button--compact" htmlFor={id}>
            <UploadIcon />
            {uploading ? 'Subiendo…' : 'Agregar imágenes'}
          </label>
          <AdminMediaPicker
            buttonLabel="Agregar desde biblioteca"
            onSelect={handlePickFromLibrary}
            disabled={uploading || values.length >= max}
          />
        </div>
        <input
          id={id}
          className="file-input"
          type="file"
          accept={MEDIA_FILE_ACCEPT}
          multiple
          onChange={handleFileChange}
          disabled={uploading || values.length >= max}
        />
        <p className="field-hint">
          PNG, JPG o WEBP de hasta 8 MB. La primera imagen del producto se usa como portada.
        </p>
      </div>

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
