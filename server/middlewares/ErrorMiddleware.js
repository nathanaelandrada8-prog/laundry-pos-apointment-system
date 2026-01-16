import 'dotenv/config';

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    console.error(`Status: ${statusCode} | Error: ${message} | Route: ${req.originalUrl}`);

    if ((statusCode === 401 || statusCode === 403) && !req.originalUrl.startsWith('/api/')) {
        
        res.cookie('token', '', { 
            httpOnly: true, 
            expires: new Date(0),
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        
        return res.redirect(`/?error=${encodeURIComponent(message)}`);
    }

    res.status(statusCode).json({
        message: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    });
};

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

export { errorHandler, notFound };
