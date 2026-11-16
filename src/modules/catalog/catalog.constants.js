export const CATALOG_CATEGORIES = [
  {
    value: 'bolsos-deportivos',
    label: 'Bolsos deportivos',
    seoDescription:
      'Bolsos deportivos personalizados para clubes, equipos y marcas. Producción por cantidad, logo bordado y cotización online.',
  },
  {
    value: 'mochilas',
    label: 'Mochilas',
    seoDescription:
      'Mochilas personalizadas para marcas, colegios y clubes. Diseños resistentes, producción por cantidad y personalización con logo.',
  },
  {
    value: 'bolsos',
    label: 'Bolsos',
    seoDescription:
      'Bolsos personalizados para marcas, eventos y uso diario. Elegí modelo, materiales y personalización con tu identidad.',
  },
  {
    value: 'fundas',
    label: 'Fundas',
    seoDescription:
      'Fundas personalizadas para notebooks y equipos. Protección, diseño propio y producción por cantidad para empresas.',
  },
  {
    value: 'neceseres',
    label: 'Neceseres',
    seoDescription:
      'Neceseres personalizados para viajes, clubes y regalos corporativos. Producción por cantidad y personalización con logo.',
  },
  {
    value: 'paleteros',
    label: 'Paleteros',
    seoDescription:
      'Paleteros personalizados para pádel y entrenamiento. Diseño deportivo, producción por cantidad y cotización online.',
  },
];

export function findCatalogCategory(value) {
  return CATALOG_CATEGORIES.find((category) => category.value === value) ?? null;
}
