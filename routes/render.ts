import express = require('express');
var router = express.Router();
import { withLogin } from '../src/middleware';
import { getUser } from '../src/account';

router.get('/login', async (req, res) => {
    let token = req.cookies.token
    if (!token)
        res.render('login');
    else {
        getUser(token, (err, user) => {
            if (err)
                res.render('login');
            else
                res.redirect('home');
        });
    }
});

router.get('/logout', async (req, res) => {
    res.setHeader("Set-Cookie", "token=;expires=Thu, 01 Jan 1970 00:00:01 GMT");
    res.redirect('/');
});

router.get('/register', async (req, res) => {
    res.redirect('/login');
})

router.get('/', async (req, res) => {
    res.redirect('home');
});

router.get('/home', withLogin, async (req, res) => {
    res.render('home');
});

router.get('/user', withLogin, async (req, res) => {
    res.render('user');
});

router.get('/settings', withLogin, async (req, res) => {
    res.render('settings');
});

router.get('/about', withLogin, async (req, res) => {
    res.render('about');
});


export = router;
