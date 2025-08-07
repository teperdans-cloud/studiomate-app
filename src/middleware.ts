import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware() {
    // Add any custom middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user has access to the requested page
        if (req.nextUrl.pathname.startsWith('/dashboard') ||
            req.nextUrl.pathname.startsWith('/portfolio') ||
            req.nextUrl.pathname.startsWith('/applications') ||
            req.nextUrl.pathname.startsWith('/profile/setup')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/portfolio/:path*',
    '/applications/:path*',
    '/profile/setup/:path*'
  ]
}