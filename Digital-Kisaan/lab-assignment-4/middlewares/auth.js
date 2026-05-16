// Middleware to check if user is logged in natively via Session
const isLoggedIn = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    req.flash('error', 'You must be logged in to view this page.');
    res.redirect('/login');
};

// Middleware to check if native Session user has Admin role
const isAdmin = (req, res, next) => {
    if (req.session && req.session.role === 'admin') {
        return next();
    }
    // "If a regular customer tries to access /admin, redirect them with an 'Access Denied' message."
    req.flash('error', 'Access Denied: You do not have administrator privileges.');
    res.redirect('/products');
};

module.exports = {
    isLoggedIn,
    isAdmin
};
