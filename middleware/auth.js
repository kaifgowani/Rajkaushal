// Redirect to login if not authenticated
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

// NEW: Admin Check
module.exports.isAdmin = (req, res, next) => {
    // res.locals.currentUser is set in your index.js!
    if (res.locals.currentUser && res.locals.currentUser.role === 'admin') {
        return next();
    }
    // If they aren't an admin, kick them out
    res.status(403).send(`
        <div style="text-align:center; padding:50px; font-family:sans-serif;">
            <h1 style="color:#dc3545;">Access Denied</h1>
            <p>You must be an administrator to view this page.</p>
            <a href="/">Return Home</a>
        </div>
    `);
};
