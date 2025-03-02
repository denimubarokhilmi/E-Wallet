import express from 'express';
import { router } from './routes/user.js';
import { middlewareAuthLogin } from './routes/middleware/middleware.js';
import expressEjsLayouts from 'express-ejs-layouts';
import cookieParser from 'cookie-parser';
import session from 'express-session';
const app = express();

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('secret'));
app.use(express.static('public'));
app.use(expressEjsLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main-layouts');
app.set('forms', 'form/form-layouts');
app.set("subdomain offset", 1)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cache-Control', 'public, max-age=2592000');

    next();
});
app.use(session({
    secret: 'secret',
    resave: false,
    rolling: true,
    maxAge: 2592000000,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(['/home', '/service', '/contact'], middlewareAuthLogin);
app.use(router);


app.listen(3000, () => {
    console.log(' server running on http://localhost:3000');
});