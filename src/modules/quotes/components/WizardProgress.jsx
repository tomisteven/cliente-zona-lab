import { CheckIcon } from '../../../shared/components/Icons.jsx';

const STEPS = [
  { number: 1, label: 'Producto', hint: 'Elegí el modelo' },
  { number: 2, label: 'Diseño', hint: 'Personalizá los detalles' },
  { number: 3, label: 'Cantidad', hint: 'Consultá el precio' },
  { number: 4, label: 'Pedido', hint: 'Completá tus datos' },
];

export default function WizardProgress({ currentStep, onStepClick }) {
  return (
    <nav className="wizard-progress" aria-label="Progreso de la cotización">
      <ol>
        {STEPS.map((step) => {
          const isCurrent = step.number === currentStep;
          const isComplete = step.number < currentStep;
          const canGoBack = step.number < currentStep;

          return (
            <li
              key={step.number}
              className={`wizard-progress__step ${isCurrent ? 'is-current' : ''} ${
                isComplete ? 'is-complete' : ''
              }`}
            >
              <button
                type="button"
                disabled={!canGoBack || !onStepClick}
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => onStepClick?.(step.number)}
              >
                <span className="wizard-progress__number">
                  {isComplete ? <CheckIcon /> : String(step.number).padStart(2, '0')}
                </span>
                <span className="wizard-progress__text">
                  <strong>{step.label}</strong>
                  <small>{step.hint}</small>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
