// Redirect to login if not authenticated
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

// Admin Check
module.exports.isAdmin = (req, res, next) => {
    if (res.locals.currentUser && res.locals.currentUser.role === 'admin') {
        return next();
    }
    res.status(403).send(`
        <div style="text-align:center; padding:50px; font-family:sans-serif;">
            <h1 style="color:#dc3545;">Access Denied</h1>
            <p>You must be an administrator to view this page.</p>
            <a href="/">Return Home</a>
        </div>
    `);
};

// Employer Check
module.exports.isEmployer = (req, res, next) => {
    // Allow access if they are an employer OR an admin
    if (res.locals.currentUser && (res.locals.currentUser.role === 'employer' || res.locals.currentUser.role === 'admin')) {
        return next();
    }
    // If they are a standard worker, block them
    res.status(403).send(`
        <div style="text-align:center; padding:50px; font-family:sans-serif;">
            <h1 style="color:#dc3545;">Access Denied</h1>
            <p>You must be registered as an Employer to access this portal.</p>
            <a href="/">Return Home</a>
        </div>
    `);
};