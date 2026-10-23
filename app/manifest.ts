import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Omega Health',
    short_name: 'Omega',
    description: 'A teen-friendly menstrual health tracking app.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F3EA',
    theme_color: '#513B70',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
