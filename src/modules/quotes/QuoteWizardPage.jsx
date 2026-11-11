import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ArrowIcon } from '../../shared/components/Icons.jsx';
import { ErrorState, LoadingState } from '../../shared/components/PageStates.jsx';
import { getCatalogProduct, listCatalogProducts } from '../catalog/catalog.api.js';
import { useSiteSettings } from '../site-settings/site-settings.context.js';
import { createQuoteRequest, estimateQuote } from './quote.api.js';
import DesignStep from './components/DesignStep.jsx';
import ProductPicker from './components/ProductPicker.jsx';
import QuantityStep from './components/QuantityStep.jsx';
import QuoteSuccess from './components/QuoteSuccess.jsx';
import ReviewStep from './components/ReviewStep.jsx';
import WizardProgress from './components/WizardProgress.jsx';

const EMPTY_CUSTOMER = {
  name: '',
  brandName: '',
  phone: '',
  email: '',
  observations: '',
};

const INITIAL_PRODUCTS_STATE = {
  status: 'loading',
  items: [],
  error: null,
};

const INITIAL_PRODUCT_STATE = {
  status: 'idle',
  error: null,
};

const INITIAL_ESTIMATE_STATE = {
  status: 'idle',
  data: null,
  error: null,
};

function createInitialSelections(product) {
  return Object.fromEntries(
    product.optionGroups
      .filter((group) => group.required && group.choices.length > 0)
      .map((group) => [group.id, group.choices[0].id]),
  );
}

function buildQuickQuantities(minimumQuantity) {
  const values = [minimumQuantity, 15, 20, 25, 30, 50, 100, 250, 500]
    .filter((value) => value >= minimumQuantity)
    .sort((left, right) => left - right);

  return [...new Set(values)].slice(0, 8);
}

function validateCustomer(customer) {
  if (customer.name.trim().length < 2) {
    return 'Ingresá tu nombre y apellido.';
  }

  const phoneDigits = customer.phone.replace(/\D/g, '');

  if (phoneDigits.length < 6 || phoneDigits.length > 15) {
    return 'Ingresá un teléfono de contacto válido.';
  }

  if (customer.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
    return 'Revisá el correo electrónico ingresado.';
  }

  return null;
}

export default function QuoteWizardPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const settings = useSiteSettings();
  const [productsState, setProductsState] = useState(INITIAL_PRODUCTS_STATE);
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [productState, setProductState] = useState(INITIAL_PRODUCT_STATE);
  const [productAttempt, setProductAttempt] = useState(0);
  const [product, setProduct] = useState(null);
  const [step, setStep] = useState(slug ? 2 : 1);
  const [selections, setSelections] = useState({});
  const [quantity, setQuantity] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [referenceFile, setReferenceFile] = useState(null);
  const [designNotes, setDesignNotes] = useState('');
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [stepError, setStepError] = useState(null);
  const [estimateState, setEstimateState] = useState(INITIAL_ESTIMATE_STATE);
  const [estimateAttempt, setEstimateAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(null);

  const selectionPayload = useMemo(
    () =>
      Object.entries(selections).map(([groupId, choiceId]) => ({
        groupId,
        choiceId,
      })),
    [selections],
  );
  const quantityNumber = Number(quantity);
  const quickQuantities = useMemo(
    () => (product ? buildQuickQuantities(product.minimumQuantity) : []),
    [product],
  );

  useEffect(() => {
    const controller = new AbortController();

    setProductsState(INITIAL_PRODUCTS_STATE);

    listCatalogProducts({ limit: 24, signal: controller.signal })
      .then((response) => {
        setProductsState({ status: 'success', items: response.items ?? [], error: null });
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return;
        }

        setProductsState({ status: 'error', items: [], error: error.message });
      });

    return () => {
      controller.abort();
    };
  }, [catalogAttempt]);

  useEffect(() => {
    if (!slug) {
      setProduct(null);
      setProductState(INITIAL_PRODUCT_STATE);
      setStep(1);
      return undefined;
    }

    const controller = new AbortController();

    setProductState({ status: 'loading', error: null });
    setStepError(null);

    getCatalogProduct(slug, { signal: controller.signal })
      .then((response) => {
        const loadedProduct = response.product;

        setProduct(loadedProduct);
        setSelections(createInitialSelections(loadedProduct));
        setQuantity(String(loadedProduct.minimumQuantity));
        setEstimateState(INITIAL_ESTIMATE_STATE);
        setProductState({ status: 'success', error: null });
        setStep(2);
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return;
        }

        setProduct(null);
        setProductState({
          status: 'error',
          error:
            error.status === 404 ? 'El producto que buscás ya no está disponible.' : error.message,
        });
      });

    return () => {
      controller.abort();
    };
  }, [slug, productAttempt]);

  useEffect(() => {
    if (!product) {
      setEstimateState(INITIAL_ESTIMATE_STATE);
      return undefined;
    }

    if (step !== 3) {
      return undefined;
    }

    if (!Number.isInteger(quantityNumber) || quantityNumber < product.minimumQuantity) {
      setEstimateState(INITIAL_ESTIMATE_STATE);
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setEstimateState({ status: 'loading', data: null, error: null });

      estimateQuote(
        {
          productId: product.id,
          quantity: quantityNumber,
          selections: selectionPayload,
        },
        { signal: controller.signal },
      )
        .then((response) => {
          setEstimateState({ status: 'success', data: response.estimate, error: null });
        })
        .catch((error) => {
          if (error?.name === 'AbortError') {
            return;
          }

          setEstimateState({ status: 'error', data: null, error: error.message });
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [product, step, quantityNumber, selectionPayload, estimateAttempt]);

  useEffect(() => {
    if (success) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [success]);

  function handleSelectProduct(item) {
    setStepError(null);

    if (slug === item.slug && product) {
      setStep(2);
      return;
    }

    navigate(`/personalizar/${item.slug}`, { replace: true });
  }

  function handleSelectionChange(groupId, choiceId) {
    setSelections((current) => {
      const next = { ...current };

      if (choiceId === null) {
        delete next[groupId];
      } else {
        next[groupId] = choiceId;
      }

      return next;
    });
    setStepError(null);
  }

  function handleFileChange(kind, file) {
    if (kind === 'logo') {
      setLogoFile(file);
      return;
    }

    setReferenceFile(file);
  }

  function handleCustomerChange(field, value) {
    setCustomer((current) => ({ ...current, [field]: value }));
    setSubmitError(null);
  }

  function goToPreviousStep() {
    setStepError(null);
    setSubmitError(null);
    setStep((current) => Math.max(1, current - 1));
  }

  function handleContinueFromDesign() {
    const missingGroup = product.optionGroups.find(
      (group) => group.required && !selections[group.id],
    );

    if (missingGroup) {
      setStepError(`Elegí una opción para ${missingGroup.name}.`);
      return;
    }

    setStepError(null);
    setStep(3);
  }

  function handleContinueFromQuantity() {
    if (estimateState.status !== 'success') {
      return;
    }

    setStep(4);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const customerError = validateCustomer(customer);

    if (customerError) {
      setSubmitError(customerError);
      return;
    }

    if (estimateState.status !== 'success' || !estimateState.data?.pricing) {
      setSubmitError('Volvé al paso anterior y calculá el precio antes de continuar.');
      return;
    }

    const whatsappWindow = window.open('about:blank', '_blank');

    if (whatsappWindow) {
      whatsappWindow.opener = null;
    }

    const formData = new FormData();
    const payload = {
      productId: product.id,
      quantity: quantityNumber,
      selections: selectionPayload,
      designNotes: designNotes.trim(),
      customer: {
        name: customer.name.trim(),
        brandName: customer.brandName.trim(),
        phone: customer.phone.trim(),
        email: customer.email.trim(),
        observations: customer.observations.trim(),
      },
    };

    formData.set('payload', JSON.stringify(payload));

    if (logoFile) {
      formData.set('logo', logoFile, logoFile.name);
    }

    if (referenceFile) {
      formData.set('reference', referenceFile, referenceFile.name);
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await createQuoteRequest(formData);

      setSuccess(result);
      setSubmitting(false);

      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.location.href = result.whatsappUrl;
      }
    } catch (error) {
      whatsappWindow?.close();
      setSubmitError(error.message);
      setSubmitting(false);
    }
  }

  function renderStep() {
    if (step === 1) {
      return (
        <>
          <div className="wizard-panel wizard-panel--picker">
            <div className="wizard-panel__heading">
              <p className="eyebrow">Paso 1</p>
              <h2>Elegí el producto que querés personalizar.</h2>
              <p>Después vas a poder definir opciones, cantidad y archivos de diseño.</p>
            </div>
          </div>
          <ProductPicker
            productsState={productsState}
            onSelect={handleSelectProduct}
            onRetry={() => setCatalogAttempt((current) => current + 1)}
            selectedSlug={slug}
            whatsappNumber={settings.whatsappNumber}
          />
        </>
      );
    }

    if (step === 2) {
      return (
        <DesignStep
          product={product}
          selections={selections}
          onSelectionChange={handleSelectionChange}
          logoFile={logoFile}
          referenceFile={referenceFile}
          onFileChange={handleFileChange}
          designNotes={designNotes}
          onDesignNotesChange={setDesignNotes}
          error={stepError}
        />
      );
    }

    if (step === 3) {
      return (
        <QuantityStep
          product={product}
          quantity={quantity}
          onQuantityChange={setQuantity}
          quickQuantities={quickQuantities}
          estimateState={estimateState}
          onRetryEstimate={() => setEstimateAttempt((current) => current + 1)}
        />
      );
    }

    return (
      <ReviewStep
        product={product}
        selections={selections}
        quantity={quantityNumber}
        pricing={estimateState.data?.pricing}
        logoFile={logoFile}
        referenceFile={referenceFile}
        designNotes={designNotes}
        customer={customer}
        onCustomerChange={handleCustomerChange}
        onSubmit={handleSubmit}
        onBack={goToPreviousStep}
        submitting={submitting}
        error={submitError}
      />
    );
  }

  if (success) {
    return (
      <div className="page quote-page">
        <div className="container quote-shell">
          <QuoteSuccess result={success} />
        </div>
      </div>
    );
  }

  if (slug && productState.status === 'loading') {
    return (
      <div className="page quote-page">
        <div className="container quote-shell">
          <LoadingState label="Preparando el configurador…" />
        </div>
      </div>
    );
  }

  if (slug && productState.status === 'error') {
    return (
      <div className="page quote-page">
        <div className="container quote-shell">
          <ErrorState
            title="No pudimos abrir este producto."
            message={productState.error}
            onRetry={() => setProductAttempt((current) => current + 1)}
          />
          <div className="state-panel__actions">
            <Link className="button button--dark" to="/catalogo">
              Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page quote-page">
      <section className="page-hero page-hero--quote">
        <div className="container">
          <p className="eyebrow eyebrow--accent">Cotizador</p>
          <h1>Armá tu pedido paso a paso.</h1>
          <p>
            Elegí el producto, personalizalo y enviá el resumen por WhatsApp. Sin registro y sin
            pagos online.
          </p>
        </div>
      </section>

      <section className="section section--compact">
        <div className="container quote-shell">
          <WizardProgress
            currentStep={step}
            onStepClick={(nextStep) => {
              if (nextStep < step) {
                setStepError(null);
                setStep(nextStep);
              }
            }}
          />

          {renderStep()}

          {step > 1 && step < 4 && (
            <div className="wizard-actions">
              <button className="button button--outline" type="button" onClick={goToPreviousStep}>
                Volver
              </button>

              {step === 2 && (
                <button
                  className="button button--dark"
                  type="button"
                  onClick={handleContinueFromDesign}
                >
                  Continuar con la cantidad
                  <ArrowIcon />
                </button>
              )}

              {step === 3 && (
                <button
                  className="button button--dark"
                  type="button"
                  disabled={estimateState.status !== 'success'}
                  onClick={handleContinueFromQuantity}
                >
                  Continuar con mis datos
                  <ArrowIcon />
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
