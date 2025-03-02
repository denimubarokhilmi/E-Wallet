export const middlewareAuthLogin = (req, res, next) => {
    const username = req.signedCookies?.name;
    if (username) {
        return next();
    }
    res.redirect('/login');
}