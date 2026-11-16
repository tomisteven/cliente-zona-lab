import { useState } from 'react';

import { UploadIcon } from '../../shared/components/Icons.jsx';
import { InlineMessage } from '../../shared/components/PageStates.jsx';
import { MEDIA_FILE_ACCEPT, validateMediaFile } from '../../shared/utils/files.js';
import { uploadAdminMedia } from './admin.api.js';
import AdminMediaBrowser from './AdminMediaBrowser.jsx';

export default function AdminMediaPage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

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
    setSuccess(false);

    try {
      await uploadAdminMedia(file);
      setSuccess(true);
      setRefreshToken((current) => current + 1);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="eyebrow">Medios</p>
          <h1>Biblioteca de imágenes</h1>
          <p>
            Reutilizá imágenes en productos y portada. Cada archivo genera variantes de 480, 960 y
            1600 px para cargar más rápido.
          </p>
        </div>

        <div className="admin-page__actions">
          <label className="button button--dark button--compact" htmlFor="media-upload">
            <UploadIcon />
            {uploading ? 'Subiendo…' : 'Subir imagen'}
          </label>
          <input
            id="media-upload"
            className="file-input"
            type="file"
            accept={MEDIA_FILE_ACCEPT}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      </div>

      {error && <InlineMessage tone="error">{error}</InlineMessage>}
      {success && (
        <InlineMessage tone="success">Imagen subida y variantes generadas.</InlineMessage>
      )}

      <AdminMediaBrowser key={refreshToken} />
    </div>
  );
}
