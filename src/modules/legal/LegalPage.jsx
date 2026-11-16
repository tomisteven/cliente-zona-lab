import { Link } from 'react-router-dom';

import { usePageMeta } from '../../shared/hooks/usePageMeta.js';

const BUSINESS_NAME = import.meta.env.VITE_BUSINESS_NAME || 'Zona Lab';
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'zonasportoficial@gmail.com';
const UPDATED_AT = import.meta.env.VITE_LEGAL_UPDATED_AT || '12 de noviembre de 2026';

const PAGES = {
  privacidad: {
    title: 'Política de privacidad',
    description: `Información sobre el tratamiento de datos personales en ${BUSINESS_NAME}.`,
    sections: [
      {
        title: 'Responsable del tratamiento',
        paragraphs: [
          `${BUSINESS_NAME} es responsable de los datos personales que recibimos a través de este sitio, del configurador de pedidos y de los canales de contacto publicados.`,
          `Para consultas sobre privacidad escribinos a ${CONTACT_EMAIL}.`,
        ],
      },
      {
        title: 'Datos que recopilamos',
        paragraphs: [
          'Datos de contacto y del pedido: nombre, marca o institución, teléfono, correo electrónico, observaciones y detalles de personalización.',
          'Archivos de diseño: logos, referencias y material que decidas adjuntar para cotizar o producir tu pedido.',
          'Datos técnicos y de navegación: páginas visitadas, dispositivo, origen de campaña y medición de uso, siempre según tu consentimiento.',
        ],
      },
      {
        title: 'Para qué usamos los datos',
        paragraphs: [
          'Responder consultas, preparar cotizaciones, coordinar pedidos y producir los artículos solicitados.',
          'Enviar actualizaciones sobre el estado de tu pedido por correo electrónico.',
          'Mejorar el sitio, medir campañas y entender qué productos generan interés, con consentimiento cuando corresponda.',
          'Cumplir obligaciones legales y resolver reclamos.',
        ],
      },
      {
        title: 'Conservación y destinatarios',
        paragraphs: [
          'Conservamos los datos durante el tiempo necesario para gestionar el pedido, cumplir obligaciones y atender consultas posteriores.',
          'Podemos usar proveedores de hosting, correo, almacenamiento y analítica que tratan datos por cuenta nuestra. No vendemos datos personales.',
        ],
      },
      {
        title: 'Tus derechos',
        paragraphs: [
          'Podés solicitar acceso, rectificación, actualización o supresión de tus datos escribiendo a ' +
            `${CONTACT_EMAIL}. También podés retirar tu consentimiento para analítica o publicidad desde las preferencias de cookies.`,
        ],
      },
      {
        title: 'Seguridad',
        paragraphs: [
          'Aplicamos medidas técnicas y organizativas razonables para proteger la información. Los archivos de pedido son privados y solo se descargan desde el panel administrativo autenticado.',
        ],
      },
    ],
  },
  terminos: {
    title: 'Términos y condiciones',
    description: `Condiciones de uso del sitio y del proceso de cotización de ${BUSINESS_NAME}.`,
    sections: [
      {
        title: 'Servicio',
        paragraphs: [
          `Este sitio permite conocer productos y solicitar una cotización a ${BUSINESS_NAME}. No se realizan pagos online ni se confirma una compra automáticamente.`,
        ],
      },
      {
        title: 'Cotizaciones y precios',
        paragraphs: [
          'Los importes mostrados son estimaciones calculadas según producto, cantidad y opciones. No incluyen envío salvo que se indique expresamente.',
          'La cotización definitiva se confirma por WhatsApp o por el canal de contacto acordado. Los precios pueden cambiar sin previo aviso.',
        ],
      },
      {
        title: 'Pedidos y producción',
        paragraphs: [
          'La producción comienza cuando se confirman diseño, cantidad, precio y condiciones de entrega.',
          'Los plazos son estimados y pueden variar según disponibilidad de materiales y volumen de producción.',
        ],
      },
      {
        title: 'Archivos y propiedad intelectual',
        paragraphs: [
          'Al enviar un logo o diseño declarás que tenés autorización para usarlo. El material se utiliza únicamente para cotizar y producir el pedido.',
          'No se permite usar el sitio para actividades ilícitas, vulnerar derechos de terceros o intentar acceder a áreas privadas.',
        ],
      },
      {
        title: 'Responsabilidad',
        paragraphs: [
          `${BUSINESS_NAME} no garantiza la disponibilidad ininterrumpida del sitio ni la exactitud absoluta de la información publicada. Los datos de productos y precios pueden actualizarse.`,
        ],
      },
      {
        title: 'Contacto',
        paragraphs: [`Para consultas sobre estas condiciones escribinos a ${CONTACT_EMAIL}.`],
      },
    ],
  },
  cookies: {
    title: 'Política de cookies',
    description: `Cómo usamos cookies y tecnologías similares en ${BUSINESS_NAME}.`,
    sections: [
      {
        title: 'Qué son',
        paragraphs: [
          'Las cookies son pequeños archivos que permiten que el sitio funcione y que podamos medir su uso. También usamos almacenamiento local para recordar tu decisión de consentimiento y el origen de campaña.',
        ],
      },
      {
        title: 'Cookies necesarias',
        paragraphs: [
          'Son indispensables para la seguridad, la sesión administrativa y el funcionamiento básico del sitio. No requieren consentimiento.',
        ],
      },
      {
        title: 'Analítica',
        paragraphs: [
          'Con tu permiso podemos usar Google Analytics o Tag Manager para medir visitas, páginas vistas y conversiones de forma agregada.',
        ],
      },
      {
        title: 'Publicidad',
        paragraphs: [
          'Con tu permiso podemos usar Meta Pixel y herramientas de medición publicitaria para evaluar campañas. No cargamos estas herramientas si rechazás la categoría de publicidad.',
        ],
      },
      {
        title: 'Cómo gestionarlas',
        paragraphs: [
          'Podés aceptar todo, usar solo las necesarias o configurar cada categoría desde el banner de cookies. También podés borrar cookies y almacenamiento desde la configuración de tu navegador.',
        ],
      },
      {
        title: 'Contacto',
        paragraphs: [`Para consultas sobre cookies escribinos a ${CONTACT_EMAIL}.`],
      },
    ],
  },
};

export default function LegalPage({ kind }) {
  const page = PAGES[kind] ?? PAGES.privacidad;

  usePageMeta(page.title, page.description, { path: `/${kind}` });

  return (
    <div className="page legal-page">
      <div className="container legal-page__inner">
        <nav className="breadcrumb" aria-label="Migas de pan">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <span aria-current="page">{page.title}</span>
        </nav>

        <header className="legal-page__header">
          <p className="eyebrow">Información legal</p>
          <h1>{page.title}</h1>
          <p>Última actualización: {UPDATED_AT}</p>
        </header>

        <div className="legal-page__content">
          {page.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <p className="legal-page__back">
          <Link className="text-link" to="/">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
