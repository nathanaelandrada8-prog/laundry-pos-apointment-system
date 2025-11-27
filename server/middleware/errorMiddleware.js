const errorHandler = (err, req, res, next) => {
    
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    if (req.originalUrl.startsWith('/api/')) {
        res.json({
            success: false,
            message: err.message,
            
            stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        });
    } else {
        
        console.error(`EJS Route Error (Status ${statusCode}): ${err.message}`);
        
        res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
        res.redirect(`/login?error=${encodeURIComponent(err.message)}`);
    }
};

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

export { errorHandler, notFound };
