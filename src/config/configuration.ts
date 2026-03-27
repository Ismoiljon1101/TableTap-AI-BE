export const config = () => ({
    port: parseInt(process.env.PORT || '3500', 10),
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tabletap',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        accessTokenExpiry: '1d',
        refreshTokenExpiry: '7d',
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3500/auth/google/callback',
    },
});
