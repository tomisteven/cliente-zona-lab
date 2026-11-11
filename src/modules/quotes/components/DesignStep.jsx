import { formatCurrency } from '../../../shared/utils/format.js';
import FileField from './FileField.jsx';

export default function DesignStep({
  product,
  selections,
  onSelectionChange,
  logoFile,
  referenceFile,
  onFileChange,
  designNotes,
  onDesignNotesChange,
  error,
}) {
  return (
    <div className="wizard-panel">
      <div className="wizard-panel__heading">
        <p className="eyebrow">Paso 2</p>
        <h2>Personalizá tu {product.name.toLowerCase()}.</h2>
        <p>Elegí las opciones disponibles y sumá los archivos que tengas de tu marca.</p>
      </div>

      {error && (
        <p className="inline-message inline-message--error" role="alert">
          {error}
        </p>
      )}

      {product.optionGroups.length > 0 && (
        <div className="option-groups">
          {product.optionGroups.map((group) => (
            <fieldset className="option-group" key={group.id}>
              <legend>
                {group.name}
                <span>{group.required ? 'Obligatorio' : 'Opcional'}</span>
              </legend>
              <div className="choice-grid">
                {!group.required && (
                  <label className="choice-card">
                    <input
                      type="radio"
                      name={`group-${group.id}`}
                      value=""
                      checked={!selections[group.id]}
                      onChange={() => onSelectionChange(group.id, null)}
                    />
                    <span className="choice-card__control" aria-hidden="true" />
                    <span className="choice-card__content">
                      <strong>Sin agregar</strong>
                      <small>No incluir esta opción</small>
                    </span>
                  </label>
                )}

                {group.choices.map((choice) => (
                  <label className="choice-card" key={choice.id}>
                    <input
                      type="radio"
                      name={`group-${group.id}`}
                      value={choice.id}
                      checked={selections[group.id] === choice.id}
                      onChange={() => onSelectionChange(group.id, choice.id)}
                    />
                    <span className="choice-card__control" aria-hidden="true" />
                    <span className="choice-card__content">
                      <strong>{choice.label}</strong>
                      <small>
                        {choice.additionalUnitPrice > 0
                          ? `+ ${formatCurrency(choice.additionalUnitPrice)} por unidad`
                          : 'Sin costo adicional'}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      )}

      <div className="file-grid">
        <FileField
          id="quote-logo"
          label="Logo"
          hint="Preferentemente vectorial o con fondo transparente."
          file={logoFile}
          onChange={(file) => onFileChange('logo', file)}
        />
        <FileField
          id="quote-reference"
          label="Referencia de diseño"
          hint="Sumá una imagen, boceto o PDF con la idea que querés replicar."
          file={referenceFile}
          onChange={(file) => onFileChange('reference', file)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="quote-design-notes">Indicaciones de diseño</label>
        <textarea
          id="quote-design-notes"
          rows={5}
          maxLength={2000}
          value={designNotes}
          placeholder="Colores, ubicación del logo, detalles de terminación…"
          onChange={(event) => onDesignNotesChange(event.target.value)}
        />
        <p className="field-hint">{designNotes.length}/2000 caracteres</p>
      </div>
    </div>
  );
}
