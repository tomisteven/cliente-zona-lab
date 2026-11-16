import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseEnv } from 'node:util';

import { CATALOG_CATEGORIES } from '../src/modules/catalog/catalog.constants.js';
import { FAQ_ITEMS } from '../src/modules/faq/faq.data.js';
import { buildMediaSrcSet } from '../src/shared/api/media.js';

const ROOT = process.cwd();

for (const envFile of ['.env', '.env.production']) {
  try {
    const parsed = parseEnv(await readFile(path.join(ROOT, envFile), 'utf8'));

    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    continue;
  }
}

const DIST_DIR = path.join(ROOT, 'dist');
const SITE_URL = (
  process.env.VITE_SITE_URL ||
  process.env.SEO_SITE_URL ||
  'http://localhost:8080'
).replace(/\/+$/, '');
const API_BASE_URL = (
  process.env.SEO_API_BASE_URL ||
  (process.env.VITE_API_BASE_URL?.startsWith('http')
    ? process.env.VITE_API_BASE_URL
    : 'http://localhost:5050/api')
).replace(/\/+$/, '');
const MEDIA_BASE_URL = (
  process.env.VITE_MEDIA_BASE_URL ||
  (API_BASE_URL.startsWith('http') ? new URL(API_BASE_URL).origin : SITE_URL)
).replace(/\/+$/, '');
const SITE_NAME = 'Zona Lab';
const DEFAULT_DESCRIPTION =
  'Bolsos, mochilas, neceseres y paleteros personalizados para marcas, clubes y empresas. Diseño propio, producción por cantidad y cotización online.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;
const GOOGLE_VERIFICATION = process.env.VITE_GOOGLE_SITE_VERIFICATION || '';
const BING_VERIFICATION = process.env.VITE_BING_SITE_VERIFICATION || '';
const TODAY = new Date().toISOString().slice(0, 10);
const moneyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character];
  });
}

function escapeXml(value) {
  return escapeHtml(value);
}

function absoluteMedia(value) {
  if (!value) {
    return '';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${MEDIA_BASE_URL}${value.startsWith('/') ? value : `/${value}`}`;
}

function responsiveImageAttributes(mediaPath, sizes) {
  const srcSet = buildMediaSrcSet(mediaPath);

  if (!srcSet) {
    return '';
  }

  const absoluteSrcSet = srcSet
    .split(', ')
    .map((entry) => {
      const [variantPath, descriptor] = entry.split(' ');

      return `${escapeHtml(absoluteMedia(variantPath))} ${descriptor}`;
    })
    .join(', ');

  return ` srcset="${absoluteSrcSet}" sizes="${sizes}"`;
}

function formatMoney(value) {
  return Number.isFinite(Number(value)) ? moneyFormatter.format(Number(value)) : 'A cotizar';
}

function jsonLdScript(data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return `<script type="application/ld+json" data-seo-static="true">${json}</script>`;
}

function buildHead({ title, description, canonical, image, type = 'website', jsonLd }) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
  const imageUrl = image || DEFAULT_OG_IMAGE;

  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#050b16" />
    <meta name="robots" content="index,follow" />
    <meta name="author" content="${SITE_NAME}" />
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta property="og:locale" content="es_AR" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(fullTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:alt" content="${escapeHtml(fullTitle)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(fullTitle)}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="manifest" href="/site.webmanifest" />
    ${GOOGLE_VERIFICATION ? `<meta name="google-site-verification" content="${escapeHtml(GOOGLE_VERIFICATION)}" />` : ''}
    ${BING_VERIFICATION ? `<meta name="msvalidate.01" content="${escapeHtml(BING_VERIFICATION)}" />` : ''}
    <title>${escapeHtml(fullTitle)}</title>
    ${jsonLd ? jsonLdScript(jsonLd) : ''}
  `;
}

function buildPage({ head, content, assetTags }) {
  return `<!doctype html>
<html lang="es">
  <head>
    ${head}
    ${assetTags.join('\n    ')}
  </head>
  <body>
    <div id="root">${content}</div>
    <noscript>Zona Lab diseña y fabrica bolsos, mochilas, neceseres y paleteros personalizados. Activá JavaScript para ver el catálogo y cotizar tu pedido.</noscript>
  </body>
</html>`;
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${url} respondió ${response.status}`);
  }

  return response.json();
}

async function fetchAllProducts() {
  const items = [];
  let page = 1;
  let totalPages;

  do {
    const data = await fetchJson(`${API_BASE_URL}/catalog/products?page=${page}&limit=24`);

    items.push(...(data.items ?? []));
    totalPages = data.pagination?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages);

  return items;
}

async function hydrateProducts(summaries) {
  return Promise.all(
    summaries.map(async (summary) => {
      try {
        const data = await fetchJson(
          `${API_BASE_URL}/catalog/products/${encodeURIComponent(summary.slug)}`,
        );

        return { ...summary, ...data.product };
      } catch {
        return summary;
      }
    }),
  );
}

async function fetchProductReviews(productId) {
  try {
    return await fetchJson(
      `${API_BASE_URL}/catalog/products/${encodeURIComponent(productId)}/reviews`,
    );
  } catch {
    return { items: [], summary: { count: 0, average: null } };
  }
}

async function fetchPublicSettings() {
  try {
    const data = await fetchJson(`${API_BASE_URL}/settings/public`);

    return data.settings ?? {};
  } catch {
    return {};
  }
}

function productListContent(products) {
  return `
    <main>
      <h1>Catálogo de bolsos y accesorios personalizados</h1>
      <p>Elegí un producto para ver sus opciones, precios por cantidad y personalización.</p>
      <ul>
        ${products
          .map(
            (product) => `
          <li>
            <a href="/productos/${escapeHtml(product.slug)}">
              <img src="${escapeHtml(absoluteMedia(product.imageUrl))}"${responsiveImageAttributes(product.imageUrl, '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw')} alt="${escapeHtml(product.name)}" width="320" height="240" loading="lazy" />
              <strong>${escapeHtml(product.name)}</strong>
              <span>${escapeHtml(product.shortDescription)}</span>
              <span>Desde ${escapeHtml(formatMoney(product.startingUnitPrice))} por unidad · mínimo ${escapeHtml(product.minimumQuantity)} unidades</span>
            </a>
          </li>`,
          )
          .join('')}
      </ul>
      <p><a href="/personalizar">Cotizar un pedido personalizado</a></p>
    </main>
  `;
}

function categoryContent(category, products) {
  return `
    <main>
      <nav aria-label="Migas de pan">
        <a href="/">Inicio</a> / <a href="/catalogo">Catálogo</a> / <span>${escapeHtml(category.label)}</span>
      </nav>
      <h1>${escapeHtml(category.label)} personalizados</h1>
      <p>${escapeHtml(category.seoDescription)}</p>
      <ul>
        ${products
          .map(
            (product) => `
          <li>
            <a href="/productos/${escapeHtml(product.slug)}">
              <img src="${escapeHtml(absoluteMedia(product.imageUrl))}"${responsiveImageAttributes(product.imageUrl, '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw')} alt="${escapeHtml(product.name)}" width="320" height="240" loading="lazy" />
              <strong>${escapeHtml(product.name)}</strong>
              <span>Desde ${escapeHtml(formatMoney(product.startingUnitPrice))} por unidad</span>
            </a>
          </li>`,
          )
          .join('')}
      </ul>
      <p><a href="/catalogo">Ver todos los productos</a> · <a href="/personalizar">Cotizar mi pedido</a></p>
    </main>
  `;
}

function homeContent(products, settings) {
  const title = settings.heroTitle || 'CREÁ TU PROPIA LÍNEA DE BOLSOS.';
  const subtitle =
    settings.heroSubtitle ||
    'Personalizá bolsos, mochilas y accesorios para tu marca, club o empresa.';
  const featured = products.slice(0, 6);

  return `
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(subtitle)}</p>
      <p><a href="/catalogo">Ver catálogo</a> · <a href="/personalizar">Cotizar mi pedido</a></p>
      <h2>Productos destacados</h2>
      <ul>
        ${featured
          .map(
            (product) => `
          <li>
            <a href="/productos/${escapeHtml(product.slug)}">${escapeHtml(product.name)}</a> — desde ${escapeHtml(formatMoney(product.startingUnitPrice))} por unidad
          </li>`,
          )
          .join('')}
      </ul>
    </main>
  `;
}

function productContent(product) {
  const prices = (product.priceTiers ?? [])
    .map((tier) => Number(tier.unitPrice))
    .filter(Number.isFinite);
  const startingPrice = prices.length > 0 ? Math.min(...prices) : product.startingUnitPrice;
  const images = (product.images?.length ? product.images : [product.imageUrl]).filter(Boolean);

  return `
    <main>
      <nav aria-label="Migas de pan">
        <a href="/">Inicio</a> / <a href="/catalogo">Catálogo</a> / <span>${escapeHtml(product.name)}</span>
      </nav>
      <h1>${escapeHtml(product.name)}</h1>
      ${images
        .map(
          (image, index) =>
            `<img src="${escapeHtml(absoluteMedia(image))}"${responsiveImageAttributes(image, '(max-width: 900px) 100vw, 46vw')} alt="${escapeHtml(product.imageAlt || product.name)}${index > 0 ? ` — imagen ${index + 1}` : ''}" width="1200" height="900" />`,
        )
        .join('')}
      <p>${escapeHtml(product.shortDescription)}</p>
      ${product.description ? `<p>${escapeHtml(product.description)}</p>` : ''}
      ${
        product.features?.length
          ? `<ul>${product.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>`
          : ''
      }
      <p>Desde ${escapeHtml(formatMoney(startingPrice))} por unidad · mínimo ${escapeHtml(product.minimumQuantity)} unidades.</p>
      <p><a href="/catalogo/${escapeHtml(product.category)}">Ver más ${escapeHtml(product.categoryLabel)}</a></p>
      <p><a href="/personalizar/${escapeHtml(product.slug)}">Personalizar este producto</a> · <a href="/catalogo">Volver al catálogo</a></p>
      ${
        product.reviews?.items?.length
          ? `<section>
              <h2>Reseñas</h2>
              ${product.reviews.items
                .map(
                  (review) =>
                    `<article><h3>${escapeHtml(review.name)} — ${escapeHtml(review.rating)}/5</h3><p>${escapeHtml(review.comment)}</p></article>`,
                )
                .join('')}
            </section>`
          : ''
      }
    </main>
  `;
}

function faqContent() {
  return `
    <main>
      <h1>Preguntas frecuentes</h1>
      ${FAQ_ITEMS.map(
        (item) =>
          `<section><h2>${escapeHtml(item.question)}</h2><p>${escapeHtml(item.answer)}</p></section>`,
      ).join('')}
      <p><a href="/contacto">Hacer una consulta</a> · <a href="/catalogo">Ver catálogo</a></p>
    </main>
  `;
}

function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function quoteContent() {
  return `
    <main>
      <h1>Armá tu pedido paso a paso</h1>
      <p>Elegí el producto, personalizalo, definí la cantidad y enviá el resumen por WhatsApp. Sin registro y sin pagos online.</p>
      <ol>
        <li>Elegí el producto.</li>
        <li>Personalizá colores, opciones y archivos.</li>
        <li>Consultá el precio por cantidad.</li>
        <li>Completá tus datos y confirmá por WhatsApp.</li>
      </ol>
      <p><a href="/catalogo">Ver catálogo</a> · <a href="/personalizar">Empezar mi cotización</a></p>
    </main>
  `;
}

function organizationalJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
      description:
        'Diseño, fabricación y personalización de bolsos, mochilas y accesorios para marcas, clubes y empresas.',
      areaServed: 'AR',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'es-AR',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/catalogo?buscar={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

function collectionJsonLd({ name, url, products }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: product.name,
        url: `${SITE_URL}/productos/${product.slug}`,
        image: absoluteMedia(product.imageUrl),
      })),
    },
  };
}

function catalogJsonLd(products) {
  return collectionJsonLd({
    name: 'Catálogo Zona Lab',
    url: `${SITE_URL}/catalogo`,
    products,
  });
}

function categoryJsonLd(category, products) {
  return collectionJsonLd({
    name: `${category.label} personalizados`,
    url: `${SITE_URL}/catalogo/${category.value}`,
    products,
  });
}

function productJsonLd(product) {
  const images = (product.images?.length ? product.images : [product.imageUrl])
    .filter(Boolean)
    .map(absoluteMedia);
  const prices = (product.priceTiers ?? [])
    .map((tier) => Number(tier.unitPrice))
    .filter(Number.isFinite);
  const lowPrice = prices.length > 0 ? Math.min(...prices) : null;
  const highPrice = prices.length > 0 ? Math.max(...prices) : null;
  const productUrl = `${SITE_URL}/productos/${product.slug}`;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || product.shortDescription,
      image: images,
      sku: product.id,
      category: product.categoryLabel,
      brand: {
        '@type': 'Brand',
        name: SITE_NAME,
      },
      offers:
        lowPrice === null
          ? undefined
          : {
              '@type': 'AggregateOffer',
              priceCurrency: 'ARS',
              lowPrice,
              highPrice,
              offerCount: prices.length,
              availability: 'https://schema.org/InStock',
              url: productUrl,
            },
      ...(product.reviews?.summary?.count > 0
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: product.reviews.summary.average,
              reviewCount: product.reviews.summary.count,
              bestRating: 5,
              worstRating: 1,
            },
            review: product.reviews.items.slice(0, 5).map((review) => ({
              '@type': 'Review',
              author: { '@type': 'Person', name: review.name },
              reviewRating: {
                '@type': 'Rating',
                ratingValue: review.rating,
                bestRating: 5,
                worstRating: 1,
              },
              reviewBody: review.comment,
              datePublished: review.createdAt,
            })),
          }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${SITE_URL}/catalogo` },
        { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
      ],
    },
  ];
}

async function writeRoute(routePath, html) {
  const outputDirectory = path.join(DIST_DIR, routePath);
  const outputFile = path.join(outputDirectory, 'index.html');

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputFile, html, 'utf8');
}

function buildSitemap(products) {
  const routes = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/catalogo', priority: '0.9', changefreq: 'daily' },
    { path: '/personalizar', priority: '0.8', changefreq: 'weekly' },
    { path: '/preguntas-frecuentes', priority: '0.7', changefreq: 'monthly' },
    ...CATALOG_CATEGORIES.map((category) => ({
      path: `/catalogo/${category.value}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
  ];
  const urls = routes
    .map(
      (route) => `
  <url>
    <loc>${escapeXml(`${SITE_URL}${route.path}`)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
    )
    .join('');
  const productUrls = products
    .map((product) => {
      const images = (product.images?.length ? product.images : [product.imageUrl])
        .filter(Boolean)
        .map(absoluteMedia)
        .map((image) => `<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`)
        .join('');

      return `
  <url>
    <loc>${escapeXml(`${SITE_URL}/productos/${product.slug}`)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    ${images}
  </url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}${productUrls}
</urlset>
`;
}

async function main() {
  if (!process.env.VITE_SITE_URL && !process.env.SEO_SITE_URL) {
    console.warn('⚠ VITE_SITE_URL no está definido; se usa http://localhost:8080 como dominio.');
  }

  const baseHtml = await readFile(path.join(DIST_DIR, 'index.html'), 'utf8');
  const assetTags = [
    ...baseHtml.matchAll(/<link[^>]*href="\/assets\/[^"]+"[^>]*>/g),
    ...baseHtml.matchAll(/<script[^>]*src="\/assets\/[^"]+"[^>]*><\/script>/g),
  ].map((match) => match[0]);

  let products = [];
  let settings = {};

  try {
    const summaries = await fetchAllProducts();

    [products, settings] = await Promise.all([hydrateProducts(summaries), fetchPublicSettings()]);
    products = await Promise.all(
      products.map(async (product) => ({
        ...product,
        reviews: await fetchProductReviews(product.id),
      })),
    );
  } catch (error) {
    console.warn(`⚠ No se pudo consultar la API para el SEO: ${error.message}`);
    console.warn('  Se generarán solo las rutas estáticas.');
  }

  await mkdir(DIST_DIR, { recursive: true });

  await writeFile(
    path.join(DIST_DIR, 'index.html'),
    buildPage({
      head: buildHead({
        title: 'Zona Lab · Bolsos y accesorios personalizados',
        description: DEFAULT_DESCRIPTION,
        canonical: `${SITE_URL}/`,
        jsonLd: organizationalJsonLd(),
      }),
      content: homeContent(products, settings),
      assetTags,
    }),
    'utf8',
  );

  await writeRoute(
    'catalogo',
    buildPage({
      head: buildHead({
        title: 'Catálogo de bolsos y accesorios personalizados',
        description:
          'Explorá bolsos, mochilas, neceseres, paleteros y fundas personalizables para tu marca, club o empresa.',
        canonical: `${SITE_URL}/catalogo`,
        jsonLd: catalogJsonLd(products),
      }),
      content: productListContent(products),
      assetTags,
    }),
  );

  for (const category of CATALOG_CATEGORIES) {
    const categoryProducts = products.filter((product) => product.category === category.value);

    await writeRoute(
      path.join('catalogo', category.value),
      buildPage({
        head: buildHead({
          title: `${category.label} personalizados`,
          description: category.seoDescription,
          canonical: `${SITE_URL}/catalogo/${category.value}`,
          jsonLd: categoryJsonLd(category, categoryProducts),
        }),
        content: categoryContent(category, categoryProducts),
        assetTags,
      }),
    );
  }

  await writeRoute(
    'personalizar',
    buildPage({
      head: buildHead({
        title: 'Cotizá tu pedido personalizado',
        description:
          'Elegí el producto, personalizalo, definí la cantidad y enviá tu pedido por WhatsApp. Sin registro y sin pagos online.',
        canonical: `${SITE_URL}/personalizar`,
      }),
      content: quoteContent(),
      assetTags,
    }),
  );

  await writeRoute(
    'preguntas-frecuentes',
    buildPage({
      head: buildHead({
        title: 'Preguntas frecuentes',
        description:
          'Cantidad mínima, precios, personalización, archivos, plazos y envíos de pedidos personalizados en Zona Lab.',
        canonical: `${SITE_URL}/preguntas-frecuentes`,
        jsonLd: faqJsonLd(),
      }),
      content: faqContent(),
      assetTags,
    }),
  );

  for (const product of products) {
    const image = absoluteMedia(product.imageUrl);

    await writeRoute(
      path.join('productos', product.slug),
      buildPage({
        head: buildHead({
          title: product.seoTitle || product.name,
          description: product.seoDescription || product.shortDescription,
          canonical: `${SITE_URL}/productos/${product.slug}`,
          image,
          type: 'product',
          jsonLd: productJsonLd(product),
        }),
        content: productContent(product),
        assetTags,
      }),
    );
  }

  await writeFile(path.join(DIST_DIR, 'sitemap.xml'), buildSitemap(products), 'utf8');
  await writeFile(
    path.join(DIST_DIR, 'robots.txt'),
    `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /estado

Sitemap: ${SITE_URL}/sitemap.xml
`,
    'utf8',
  );

  console.log(
    `✓ SEO generado: ${products.length + CATALOG_CATEGORIES.length + 4} páginas, sitemap.xml y robots.txt para ${SITE_URL}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
