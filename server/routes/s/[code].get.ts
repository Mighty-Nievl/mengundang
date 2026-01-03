import { defineEventHandler, getRouterParam, setCookie, sendRedirect } from 'h3';

export default defineEventHandler(async (event) => {
    const code = getRouterParam(event, 'code');

    if (code) {
        // Set cookie for 30 days
        setCookie(event, 'referral_code', code, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
            httpOnly: false, // Accessible by JS (though our register logic handles it)
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
    }

    // Redirect to register page
    return sendRedirect(event, '/register', 302);
});
