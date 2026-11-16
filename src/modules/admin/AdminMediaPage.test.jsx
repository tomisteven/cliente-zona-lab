import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminMediaPage from './AdminMediaPage.jsx';
import { deleteAdminMedia, listAdminMedia, uploadAdminMedia } from './admin.api.js';

vi.mock('./admin.api.js', () => ({
  listAdminMedia: vi.fn(),
  uploadAdminMedia: vi.fn(),
  deleteAdminMedia: vi.fn(),
}));

const ITEMS = [
  {
    fileName: 'portada-libre.png',
    url: '/uploads/media/portada-libre.png',
    mimeType: 'image/png',
    width: 1200,
    height: 900,
    sizeBytes: 240000,
    createdAt: '2026-11-12T10:00:00.000Z',
    inUse: false,
    variants: [],
  },
  {
    fileName: 'portada-en-uso.png',
    url: '/uploads/media/portada-en-uso.png',
    mimeType: 'image/png',
    width: 1200,
    height: 900,
    sizeBytes: 240000,
    createdAt: '2026-11-11T10:00:00.000Z',
    inUse: true,
    variants: [],
  },
];

function listResponse(items = ITEMS) {
  return {
    items,
    pagination: { page: 1, limit: 24, total: items.length, totalPages: 1 },
  };
}

describe('AdminMediaPage', () => {
  beforeEach(() => {
    listAdminMedia.mockResolvedValue(listResponse());
    uploadAdminMedia.mockResolvedValue({ file: { url: '/uploads/media/nueva.png' } });
    deleteAdminMedia.mockResolvedValue();
  });

  it('lista imágenes, marca las que están en uso y elimina las libres', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<AdminMediaPage />);

    expect(await screen.findByText('portada-libre.png')).toBeInTheDocument();
    expect(screen.getByText('portada-en-uso.png')).toBeInTheDocument();
    expect(screen.getByText('En uso')).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });

    expect(deleteButtons[0]).toBeEnabled();
    expect(deleteButtons[1]).toBeDisabled();

    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteAdminMedia).toHaveBeenCalledWith('/uploads/media/portada-libre.png');
    });
  });

  it('sube una imagen y refresca la biblioteca', async () => {
    render(<AdminMediaPage />);

    await screen.findByText('portada-libre.png');

    const file = new File(['contenido'], 'nueva.png', { type: 'image/png' });

    fireEvent.change(screen.getByLabelText('Subir imagen'), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(uploadAdminMedia).toHaveBeenCalledWith(file);
    });
    expect(await screen.findByText('Imagen subida y variantes generadas.')).toBeInTheDocument();
  });
});
