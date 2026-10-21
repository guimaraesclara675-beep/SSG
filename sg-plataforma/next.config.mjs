/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // A vitrine (catálogo, demonstrações, pacotes) é a página inicial do site.
    return { beforeFiles: [{ source: '/', destination: '/vitrine.html' }] };
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
      ]
    }];
  }
};
export default nextConfig;
