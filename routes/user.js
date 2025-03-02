import express from 'express';
import { bank } from '../db/db.js';

import crypto from 'crypto';

function generateRandomId() {
    return `id-${crypto.randomBytes(4).toString('hex')}`
}
const formatNumber = (value) => value.toLocaleString();
export const router = express.Router();
router.use(async (req, res, next) => {
    try {
        const username = req.signedCookies?.name
        const { resultCollectionUser, resultCollectionTransaksi } = await bank.get();
        const sentTransactions = resultCollectionTransaksi.filter((doc) => doc);
        const finds = resultCollectionUser.find((doc) => doc.name === username)
        res.locals.transaksi = sentTransactions;
        res.locals.data = finds;
        res.locals.format = formatNumber;
        res.locals.IDMerchant = generateRandomId;
        next();
    } catch (err) {
        console.log(err);
        res.redirect('/login')
    }
});

router.route('/home').get((req, res) => {
    res.render('home', {
        title: 'Home Page',

    })
})
router.route('/service').get((req, res) => {
    res.render('our-service', {
        title: 'service',

    })
})
router.route('/contact').get((req, res) => {
    res.render('contact', {
        title: 'Contact Us',
    })
})
router.route('/register',).get((req, res) => {
    res.render('form/register', {
        title: 'Sign Up',
        message: '',
        layout: 'form/form-layouts',
    })
}).post(async (req, res) => {
    const result = await bank.createDoc(req.body);
    if (result.message) {
        res.render('form/register', {
            message: result.message,
            title: 'Sign Up',
            layout: 'form/form-layouts'
        })
    } else {
        setTimeout(() => {
            res.cookie('name', req.body.name, {
                signed: true,
                httpOnly: true,
                maxAge: 2592000,
                secure: true
            })
            res.redirect('/home')
        }, 1000)
    }
});

//! login
router.route('/login').get((req, res) => {
    res.render('form/login', {
        title: 'Sign In',
        message: '',
        layout: 'form/form-layouts',
    })
}).post(async (req, res) => {
    const result = await bank.checkLogin(req.body);
    if (result.message) {
        res.render('form/login', {
            message: result.message,
            title: 'Sign In',
            layout: 'form/form-layouts',
            secure: true
        })
    } else {

        setTimeout(() => {
            res.cookie('name', req.body.name, {
                signed: true,
                httpOnly: true,
                maxAge: 2592000
            })

            res.redirect('/home')
        }, 1000)
    }
});
router.route('/logout').get((req, res) => {
    res.clearCookie('name');
    res.clearCookie(req.signedCookies['connect.sid']);
    res.redirect('/login');
});

router.route('/transfer').get(async (req, res) => {
    const { resultCollectionTransaksi } = await bank.get();
    res.status(200).json({
        status: 200,
        data: resultCollectionTransaksi,
    })
}).post(async (req, res) => {
    if (req.body.jumlah < 5000) return false;
    const result = await bank.createDocTransaksi(req.body);
    if (result.acknowledged === true) {
        const { resultCollectionTransaksi } = await bank.get();
        const find = resultCollectionTransaksi.find((doc) => doc.sentTransactions[0].IDMerchant === req.body.IDMerchant)
        res.status(200).json({
            status: 200,
            data: find,

        })
    } else if (result.message) {
        res.status(400).json({
            status: 400,
            message: result.message
        })
    }

})


router.route('/search').get((req, res) => {
    res.json({
        status: 200,
        data: 'misal'
    })
}).post(async (req, res) => {
    const { resultCollectionUser } = await bank.get();
    const finds = resultCollectionUser.find((doc) => doc.phone === req.body.value);
    if (finds) {
        res.json({
            status: 200,
            data: finds
        })

    } else {
        res.json({
            status: 404,
            message: `Tidak ada hasil pencarian ${req.body.value}`
        })
    }
});

router.get('/userData', async (req, res) => {
    const username = req.signedCookies?.name;
    const { resultCollectionUser } = await bank.get();
    const finds = resultCollectionUser.find((doc) => doc.name === username);
    res.json({
        status: 200,
        data: finds
    })

});

//! route filter by hari 
router.post('/filter-hari', async (req, res) => {
    const result = await bank.filterHari(req.body);
    if (result) {
        res.status(200).json({
            status: 200,
            data: result
        })
    }
})
router.post('/isi-saldo', async (req, res) => {
    try {

        const result = await bank.createSaldo(req.body);
        if (result.acknowledged == true) {
            res.status(200).json({
                status: 200,
                message: 'Berhasil menambah saldo'
            })
        }
    } catch (err) {
        console.log(err);
    }
})

router.route('/getTransaksi').get(async (req, res) => {
    res.json({
        name: 'deni'
    })
});
