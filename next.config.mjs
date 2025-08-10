/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    // In development, Next.js requires unsafe-eval for HMR and React Fast Refresh
    // Also needs unsafe-inline for injected scripts
    const scriptSrc = isDev 
      ? "'self' 'unsafe-eval' 'unsafe-inline'" 
      : "'self'";
    
    // In development, Next.js injects inline styles
    const styleSrc = "'self' https://fonts.googleapis.com" + (isDev ? " 'unsafe-inline'" : "");

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src ${scriptSrc}; style-src ${styleSrc}; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ws: wss:; object-src 'none'; base-uri 'self';`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
