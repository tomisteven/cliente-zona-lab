import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { TrashIcon } from '../../shared/components/Icons.jsx';
import { ErrorState, LoadingState } from '../../shared/components/PageStates.jsx';
import { CATALOG_CATEGORIES } from '../catalog/catalog.constants.js';
import { createAdminProduct, getAdminProduct, updateAdminProduct } from './admin.api.js';
import AdminImageField from './AdminImageField.jsx';

function createEmptyTier() {
  return { minQuantity: '', maxQuantity: '', unitPrice: '' };
}

function createEmptyChoice() {
  return { label: '', additionalUnitPrice: '0' };
}

function createEmptyGroup() {
  return { name: '', required: false, choices: [createEmptyChoice()] };
}

function createEmptyForm() {
  return {
    name: '',
    slug: '',
    category: CATALOG_CATEGORIES[0].value,
    shortDescription: '',
    description: '',
    imageUrl: '',
    active: true,
    minimumQuantity: '12',
    personalizationFee: '0',
    priceTiers: [{ minQuantity: '12', maxQuantity: '', unitPrice: '' }],
    optionGroups: [],
  };
}

function mapProductToForm(product) {
  return {
    name: product.name,
    slug: product.slug,
    category: product.category,
    shortDescription: product.shortDescription,
    description: product.description,
    imageUrl: product.imageUrl,
    active: product.active,
    minimumQuantity: String(product.minimumQuantity),
    personalizationFee: String(product.personalizationFee),
    priceTiers: product.priceTiers.map((tier) => ({
      minQuantity: String(tier.minQuantity),
      maxQuantity: tier.maxQuantity === null ? '' : String(tier.maxQuantity),
      unitPrice: String(tier.unitPrice),
    })),
    optionGroups: product.optionGroups.map((group) => ({
      name: group.name,
      required: group.required,
      choices: group.choices.map((choice) => ({
        label: choice.label,
        additionalUnitPrice: String(choice.additionalUnitPrice),
      })),
    })),
  };
}

function getErrorMessages(error) {
  if (!Array.isArray(error.details)) {
    return [];
  }

  return error.details
    .map((detail) => detail?.message)
    .filter((message, index, messages) => message && messages.indexOf(message) === index);
}

export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(createEmptyForm);
  const [featuresText, setFeaturesText] = useState('');
  const [status, setStatus] = useState(isEditing ? 'loading' : 'ready');
  const [loadError, setLoadError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [errorDetails, setErrorDetails] = useState([]);

  useEffect(() => {
    if (!isEditing) {
      setStatus('ready');
      return undefined;
    }

    const controller = new AbortController();

    setStatus('loading');
    setLoadError(null);

    getAdminProduct(id, { signal: controller.signal })
      .then((response) => {
        setForm(mapProductToForm(response.product));
        setFeaturesText(response.product.features.join('\n'));
        setStatus('ready');
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return;
        }

        setLoadError(error.message);
        setStatus('error');
      });

    return () => {
      controller.abort();
    };
  }, [id, isEditing, attempt]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateTier(index, field, value) {
    setForm((current) => ({
      ...current,
      priceTiers: current.priceTiers.map((tier, tierIndex) =>
        tierIndex === index ? { ...tier, [field]: value } : tier,
      ),
    }));
  }

  function addTier() {
    setForm((current) => ({
      ...current,
      priceTiers: [...current.priceTiers, createEmptyTier()],
    }));
  }

  function removeTier(index) {
    setForm((current) => ({
      ...current,
      priceTiers: current.priceTiers.filter((_, tierIndex) => tierIndex !== index),
    }));
  }

  function updateGroup(index, field, value) {
    setForm((current) => ({
      ...current,
      optionGroups: current.optionGroups.map((group, groupIndex) =>
        groupIndex === index ? { ...group, [field]: value } : group,
      ),
    }));
  }

  function addGroup() {
    setForm((current) => ({
      ...current,
      optionGroups: [...current.optionGroups, createEmptyGroup()],
    }));
  }

  function removeGroup(index) {
    setForm((current) => ({
      ...current,
      optionGroups: current.optionGroups.filter((_, groupIndex) => groupIndex !== index),
    }));
  }

  function updateChoice(groupIndex, choiceIndex, field, value) {
    setForm((current) => ({
      ...current,
      optionGroups: current.optionGroups.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              choices: group.choices.map((choice, index_) =>
                index_ === choiceIndex ? { ...choice, [field]: value } : choice,
              ),
            }
          : group,
      ),
    }));
  }

  function addChoice(groupIndex) {
    setForm((current) => ({
      ...current,
      optionGroups: current.optionGroups.map((group, index) =>
        index === groupIndex
          ? { ...group, choices: [...group.choices, createEmptyChoice()] }
          : group,
      ),
    }));
  }

  function removeChoice(groupIndex, choiceIndex) {
    setForm((current) => ({
      ...current,
      optionGroups: current.optionGroups.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              choices: group.choices.filter((_, index_) => index_ !== choiceIndex),
            }
          : group,
      ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    setErrorDetails([]);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      category: form.category,
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      features: featuresText
        .split('\n')
        .map((feature) => feature.trim())
        .filter(Boolean),
      imageUrl: form.imageUrl,
      active: form.active,
      minimumQuantity: Number(form.minimumQuantity),
      personalizationFee: Number(form.personalizationFee || 0),
      priceTiers: form.priceTiers.map((tier) => ({
        minQuantity: Number(tier.minQuantity),
        maxQuantity: tier.maxQuantity === '' ? null : Number(tier.maxQuantity),
        unitPrice: Number(tier.unitPrice),
      })),
      optionGroups: form.optionGroups.map((group) => ({
        name: group.name.trim(),
        required: group.required,
        choices: group.choices.map((choice) => ({
          label: choice.label.trim(),
          additionalUnitPrice: Number(choice.additionalUnitPrice || 0),
        })),
      })),
    };

    try {
      if (isEditing) {
        await updateAdminProduct(id, payload);
      } else {
        await createAdminProduct(payload);
      }

      navigate('/admin/productos', { replace: true });
    } catch (error) {
      setSaveError(error.message);
      setErrorDetails(getErrorMessages(error));
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (status === 'loading') {
    return <LoadingState label="Cargando producto…" />;
  }

  if (status === 'error') {
    return (
      <ErrorState
        title="No pudimos cargar el producto."
        message={loadError}
        onRetry={() => setAttempt((current) => current + 1)}
      />
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <Link className="text-link" to="/admin/productos">
            ← Volver a productos
          </Link>
          <h1>{isEditing ? 'Editar producto' : 'Nuevo producto'}</h1>
          <p>Completá la información pública, los precios por cantidad y las opciones.</p>
        </div>
      </div>

      {saveError && (
        <div className="inline-message inline-message--error" role="alert">
          <p>{saveError}</p>
          {errorDetails.length > 0 && (
            <ul>
              {errorDetails.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <details className="admin-form__guide" open>
        <summary>Ver un ejemplo completo de producto</summary>
        <div className="admin-form__guide-body">
          <p>
            Estos valores son solo un ejemplo. Reemplazalos por los datos y precios reales de tu
            producto.
          </p>
          <dl className="admin-example">
            <div>
              <dt>Nombre</dt>
              <dd>Bolso deportivo personalizado</dd>
            </div>
            <div>
              <dt>Slug</dt>
              <dd>
                <code>bolso-deportivo</code> (si lo dejás vacío, se genera solo)
              </dd>
            </div>
            <div>
              <dt>Categoría</dt>
              <dd>Bolsos deportivos</dd>
            </div>
            <div>
              <dt>Cantidad mínima</dt>
              <dd>12 unidades</dd>
            </div>
            <div>
              <dt>Descripción breve</dt>
              <dd>Bolso deportivo con logo bordado, cierre reforzado y material resistente.</dd>
            </div>
            <div>
              <dt>Descripción completa</dt>
              <dd>
                Bolso de 45 × 25 cm en poliéster 600D, con cordón ajustable, bolsillo interno y
                espacio para logo. Ideal para clubes, marcas y eventos.
              </dd>
            </div>
            <div>
              <dt>Características</dt>
              <dd>Material resistente / Cierre reforzado / Logo bordado / Cordón ajustable</dd>
            </div>
            <div>
              <dt>Costo de personalización</dt>
              <dd>
                $5.000 por pedido, no por unidad. Dejá <code>0</code> si no cobrás este costo.
              </dd>
            </div>
            <div>
              <dt>Tramos de precio</dt>
              <dd>12 a 49 unidades: $12.500 c/u · 50 a 99: $11.000 c/u · 100 o más: $9.800 c/u</dd>
            </div>
            <div>
              <dt>Grupo obligatorio</dt>
              <dd>
                <code>Color</code>: Negro +$0 · Azul +$500 · Blanco +$500
              </dd>
            </div>
            <div>
              <dt>Grupo opcional</dt>
              <dd>
                <code>Bolsillo</code>: Sin bolsillo +$0 · Con bolsillo +$1.200
              </dd>
            </div>
          </dl>
          <p className="admin-form__guide-note">
            El precio unitario es por unidad. El adicional de cada opción se suma al precio unitario
            y el costo de personalización se suma una sola vez al total del pedido.
          </p>
        </div>
      </details>

      <form className="admin-form" onSubmit={handleSubmit}>
        <section className="admin-form__section">
          <div className="admin-form__section-heading">
            <h2>Información general</h2>
            <p>
              Es lo que ve el cliente en el catálogo. El slug es la parte final de la URL del
              producto.
            </p>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="product-name">Nombre *</label>
              <input
                id="product-name"
                type="text"
                maxLength={120}
                required
                placeholder="Ej.: Bolso deportivo personalizado"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="product-slug">Slug</label>
              <input
                id="product-slug"
                type="text"
                maxLength={140}
                placeholder="Ej.: bolso-deportivo (vacío = automático)"
                value={form.slug}
                onChange={(event) => updateField('slug', event.target.value)}
              />
              <p className="field-hint">
                Es la dirección del producto. Solo minúsculas, números y guiones.
              </p>
            </div>

            <div className="form-field">
              <label htmlFor="product-category">Categoría *</label>
              <select
                id="product-category"
                value={form.category}
                onChange={(event) => updateField('category', event.target.value)}
              >
                {CATALOG_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="product-minimum">Cantidad mínima *</label>
              <input
                id="product-minimum"
                type="number"
                min="1"
                step="1"
                required
                placeholder="Ej.: 12"
                value={form.minimumQuantity}
                onChange={(event) => updateField('minimumQuantity', event.target.value)}
              />
              <p className="field-hint">
                Es la menor cantidad que aceptás. Debe coincidir con el inicio del primer tramo.
              </p>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="product-short-description">Descripción breve *</label>
            <textarea
              id="product-short-description"
              rows={2}
              maxLength={240}
              required
              placeholder="Ej.: Bolso deportivo con logo bordado, cierre reforzado y material resistente."
              value={form.shortDescription}
              onChange={(event) => updateField('shortDescription', event.target.value)}
            />
            <p className="field-hint">
              Una frase corta para las tarjetas del catálogo. {form.shortDescription.length}/240
              caracteres.
            </p>
          </div>

          <div className="form-field">
            <label htmlFor="product-description">Descripción completa</label>
            <textarea
              id="product-description"
              rows={5}
              maxLength={5000}
              placeholder="Ej.: Bolso de 45 × 25 cm en poliéster 600D, con cordón ajustable, bolsillo interno y espacio para logo."
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
            />
            <p className="field-hint">
              Contá medidas, material, uso recomendado y qué incluye. Podés dejarlo vacío.
            </p>
          </div>

          <div className="form-field">
            <label htmlFor="product-features">Características</label>
            <textarea
              id="product-features"
              rows={4}
              placeholder={
                'Una característica por línea\nEj.: Material resistente\nEj.: Cierre reforzado\nEj.: Logo bordado'
              }
              value={featuresText}
              onChange={(event) => setFeaturesText(event.target.value)}
            />
            <p className="field-hint">
              Escribí una característica por línea. Se muestran como viñetas. Máximo 12.
            </p>
          </div>

          <AdminImageField
            id="product-image"
            label="Imagen principal"
            hint="PNG, JPG o WEBP de hasta 8 MB. Usá una foto clara del producto, idealmente cuadrada."
            value={form.imageUrl}
            onChange={(value) => updateField('imageUrl', value)}
          />

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => updateField('active', event.target.checked)}
            />
            <span>
              <strong>Producto publicado</strong>
              <small>Si está desmarcado, no aparece en el catálogo público.</small>
            </span>
          </label>
        </section>

        <section className="admin-form__section">
          <div className="admin-form__section-heading">
            <h2>Precios por cantidad</h2>
            <p>
              Definí cuánto sale cada unidad según la cantidad. Los tramos no pueden superponerse y
              solo el último puede quedar abierto.
            </p>
          </div>

          <div className="form-field">
            <label htmlFor="product-fee">Costo de personalización</label>
            <input
              id="product-fee"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej.: 5000"
              value={form.personalizationFee}
              onChange={(event) => updateField('personalizationFee', event.target.value)}
            />
            <p className="field-hint">
              Se suma una sola vez al total del pedido, no por unidad. Dejá 0 si no cobrás.
            </p>
          </div>

          <p className="admin-form__example-line">
            Ejemplo: 12 a 49 unidades → $12.500 c/u · 50 a 99 → $11.000 c/u · 100 o más → $9.800
            c/u.
          </p>

          <div className="dynamic-list">
            {form.priceTiers.map((tier, index) => (
              <div className="dynamic-row dynamic-row--tier" key={index}>
                <div className="form-field">
                  <label htmlFor={`tier-min-${index}`}>Desde *</label>
                  <input
                    id={`tier-min-${index}`}
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="Ej.: 12"
                    value={tier.minQuantity}
                    onChange={(event) => updateTier(index, 'minQuantity', event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor={`tier-max-${index}`}>Hasta</label>
                  <input
                    id={`tier-max-${index}`}
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Ej.: 49 o vacío"
                    value={tier.maxQuantity}
                    onChange={(event) => updateTier(index, 'maxQuantity', event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor={`tier-price-${index}`}>Precio unitario *</label>
                  <input
                    id={`tier-price-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="Ej.: 12500"
                    value={tier.unitPrice}
                    onChange={(event) => updateTier(index, 'unitPrice', event.target.value)}
                  />
                </div>
                <button
                  className="icon-button icon-button--danger"
                  type="button"
                  onClick={() => removeTier(index)}
                  disabled={form.priceTiers.length === 1}
                  aria-label="Quitar tramo"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          <button
            className="button button--outline button--compact"
            type="button"
            onClick={addTier}
          >
            Agregar tramo
          </button>
        </section>

        <section className="admin-form__section">
          <div className="admin-form__section-heading">
            <h2>Opciones de personalización</h2>
            <p>
              Cada grupo es una decisión del cliente y cada opción es una alternativa. Por ejemplo:
              grupo <strong>Color</strong> con opciones Negro, Azul y Blanco.
            </p>
          </div>

          {form.optionGroups.length === 0 && (
            <p className="empty-inline">
              Todavía no agregaste grupos. Si el producto no tiene variantes, podés dejarlo vacío.
            </p>
          )}

          <div className="option-editor-list">
            {form.optionGroups.map((group, groupIndex) => (
              <div className="option-editor" key={groupIndex}>
                <div className="option-editor__heading">
                  <div className="form-field">
                    <label htmlFor={`group-name-${groupIndex}`}>Nombre del grupo *</label>
                    <input
                      id={`group-name-${groupIndex}`}
                      type="text"
                      maxLength={80}
                      required
                      placeholder="Ej.: Color, Tamaño o Ubicación del logo"
                      value={group.name}
                      onChange={(event) => updateGroup(groupIndex, 'name', event.target.value)}
                    />
                  </div>

                  <label className="checkbox-field checkbox-field--compact">
                    <input
                      type="checkbox"
                      checked={group.required}
                      onChange={(event) =>
                        updateGroup(groupIndex, 'required', event.target.checked)
                      }
                    />
                    <span>
                      <strong>Obligatorio</strong>
                      <small>El cliente no puede continuar sin elegir.</small>
                    </span>
                  </label>

                  <button
                    className="icon-button icon-button--danger"
                    type="button"
                    onClick={() => removeGroup(groupIndex)}
                    aria-label={`Quitar grupo ${group.name || groupIndex + 1}`}
                  >
                    <TrashIcon />
                  </button>
                </div>

                <div className="choice-editor-list">
                  {group.choices.map((choice, choiceIndex) => (
                    <div className="dynamic-row dynamic-row--choice" key={choiceIndex}>
                      <div className="form-field">
                        <label htmlFor={`choice-label-${groupIndex}-${choiceIndex}`}>
                          Opción *
                        </label>
                        <input
                          id={`choice-label-${groupIndex}-${choiceIndex}`}
                          type="text"
                          maxLength={80}
                          required
                          placeholder="Ej.: Negro, Azul o Blanco"
                          value={choice.label}
                          onChange={(event) =>
                            updateChoice(groupIndex, choiceIndex, 'label', event.target.value)
                          }
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor={`choice-price-${groupIndex}-${choiceIndex}`}>
                          Adicional por unidad
                        </label>
                        <input
                          id={`choice-price-${groupIndex}-${choiceIndex}`}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Ej.: 500"
                          value={choice.additionalUnitPrice}
                          onChange={(event) =>
                            updateChoice(
                              groupIndex,
                              choiceIndex,
                              'additionalUnitPrice',
                              event.target.value,
                            )
                          }
                        />
                        <p className="field-hint">
                          Se suma al precio unitario. Usá 0 si la opción no cuesta más.
                        </p>
                      </div>
                      <button
                        className="icon-button icon-button--danger"
                        type="button"
                        onClick={() => removeChoice(groupIndex, choiceIndex)}
                        disabled={group.choices.length === 1}
                        aria-label="Quitar opción"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  className="button button--outline button--compact"
                  type="button"
                  onClick={() => addChoice(groupIndex)}
                >
                  Agregar opción
                </button>
              </div>
            ))}
          </div>

          <button
            className="button button--outline button--compact"
            type="button"
            onClick={addGroup}
          >
            Agregar grupo
          </button>
        </section>

        <div className="admin-form__actions">
          <Link className="button button--outline" to="/admin/productos">
            Cancelar
          </Link>
          <button className="button button--dark button--large" type="submit" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner spinner--light" aria-hidden="true" />
                Guardando…
              </>
            ) : isEditing ? (
              'Guardar cambios'
            ) : (
              'Crear producto'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
