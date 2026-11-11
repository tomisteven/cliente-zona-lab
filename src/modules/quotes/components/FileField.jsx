import { useEffect, useState } from 'react';

import { CloseIcon, UploadIcon } from '../../../shared/components/Icons.jsx';
import {
  DESIGN_FILE_ACCEPT,
  isImageFile,
  validateDesignFile,
} from '../../../shared/utils/files.js';
import { formatFileSize } from '../../../shared/utils/format.js';

export default function FileField({ id, label, hint, file, onChange }) {
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file || !isImageFile(file)) {
      setPreviewUrl(null);
      return undefined;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [file]);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] ?? null;
    event.target.value = '';

    if (!selectedFile) {
      return;
    }

    const validationMessage = validateDesignFile(selectedFile);

    if (validationMessage) {
      setError(validationMessage);
      onChange(null);
      return;
    }

    setError(null);
    onChange(selectedFile);
  }

  function handleRemove() {
    setError(null);
    onChange(null);
  }

  return (
    <div className={`file-field ${file ? 'file-field--selected' : ''}`}>
      <div className="file-field__heading">
        <span>{label}</span>
        <small>Opcional</small>
      </div>

      {file ? (
        <div className="file-preview">
          {previewUrl ? (
            <img src={previewUrl} alt={`Vista previa de ${label.toLowerCase()}`} />
          ) : (
            <span className="file-preview__icon">PDF</span>
          )}
          <div className="file-preview__meta">
            <strong>{file.name}</strong>
            <span>{formatFileSize(file.size)}</span>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={handleRemove}
            aria-label={`Quitar ${label.toLowerCase()}`}
          >
            <CloseIcon />
          </button>
        </div>
      ) : (
        <label className="file-drop" htmlFor={id}>
          <UploadIcon />
          <span>Seleccionar archivo</span>
          <small>PNG, JPG, WEBP, SVG o PDF · hasta 10 MB</small>
        </label>
      )}

      <input
        id={id}
        className="file-input"
        type="file"
        accept={DESIGN_FILE_ACCEPT}
        onChange={handleFileChange}
        aria-describedby={`${id}-hint ${error ? `${id}-error` : ''}`.trim()}
      />

      <p className="field-hint" id={`${id}-hint`}>
        {hint}
      </p>

      {file && (
        <label className="file-replace" htmlFor={id}>
          Reemplazar archivo
        </label>
      )}

      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
