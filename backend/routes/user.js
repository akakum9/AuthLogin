const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');
const validateResetInput = require('../validation/reset');
const validateEmailInput = require('../validation/forgot');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/User');

router.post('/register', function(req, res) {

    const { errors, isValid } = validateRegisterInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({
        email: req.body.email
    }).then(user => {
        if(user) {
            return res.status(400).json({
                email: 'Email already exists'
            });
        }
        else {
            const avatar = gravatar.url(req.body.email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                admincode: req.body.admincode,
                avatar
            });
            
            bcrypt.genSalt(10, (err, salt) => {
                if(err) console.error('There was an error', err);
                else {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) console.error('There was an error', err);
                        else {
                            if(req.body.admincode === 'secretcode') {
                                newUser.isAdmin = true;
                            }
                            newUser.password = hash;
                            newUser
                                .save()
                                .then(user => {
                                    res.json(user)
                                }); 
                        }
                    });
                }
            });
        }
    });
});

router.post('/login', (req, res) => {

    const { errors, isValid } = validateLoginInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email})
        .then(user => {
            if(!user) {
                errors.email = 'User not found'
                return res.status(404).json(errors);
            } else {
                bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if(isMatch) {
                            const payload = {
                                id: user.id,
                                name: user.name,
                                avatar: user.avatar,
                                isAdmin: user.isAdmin
                            }
                            jwt.sign(payload, 'secret', {
                                expiresIn: 3600
                            }, (err, token) => {
                                if(err) console.error('There is some error in token', err);
                                else {
                                    res.json({
                                        success: true,
                                        token: `Bearer ${token}`
                                    });
                                    console.log(admin);
                                }
                            });
                        }
                        else {
                            errors.password = 'Incorrect Password';
                            return res.status(400).json(errors);
                        }
                    });
            }
        });
});

router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
            console.log("crypto");
        },
        function(token, done) {
            const { errors, isValid } = validateEmailInput(req.body);

            if(!isValid) {
                return res.status(400).json(errors);
            }

            const email = req.body.email;

            User.findOne({email}, function(err, user) {
                if (!user) {
                    errors.email = 'User not found'
                    return res.status(404).json(errors);
                }
        
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        
                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            let smtpTransport = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: 'akash_kumar_project',
                    pass: 'akash12345'
                }
                // api key = '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'
            });
            let mailOptions = {
                to: user.email,
                from: 'passwordreset@demo.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + 'localhost:3000' + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            console.log('mailoption');
            smtpTransport.sendMail(mailOptions, function(err) {
                //req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                console.log('mail- sending..');
                done(err, 'done');
                console.log('mail- send');
            });
        }
    ], function(err) {
        if (err) return next(err);
        console.log('error');
        res.redirect('/forgot');
    });
});

router.post('/reset', function(req, res) {
        async.waterfall([
            function(done) {
                const resetPasswordToken = req.body.resetPasswordToken;

                const { errors, isValid } = validateResetInput(req.body);

                if(!isValid) {
                    return res.status(400).json(errors);
                }
                console.log(req.body.resetToken);
                User.findOne({ resetPasswordToken: req.body.resetToken, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                    if (!user) {
                        //req.flash('error', 'Password reset token is invalid or has expired.');
                        errors.password = 'Invalid'
                        return res.status(404).json(err);
                    }
        
                    user.password = req.body.password;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
            
                    bcrypt.genSalt(10, (err, salt) => {
                        if(err) console.error('There was an error', err);
                        else {
                            bcrypt.hash(user.password, salt, (err, hash) => {
                                if(err) console.error('There was an error', err);
                                else {
                                    user.password = hash;
                                    user
                                        .save()
                                        .then(user => {
                                            res.json(user)
                                            done(err, user);
                                        }); 
                                }
                            });
                        }
                    });
                });
            },
            function(user, done) {
                let smtpTransport = nodemailer.createTransport({
                    service: 'SendGrid',
                    auth: {
                        user: 'akash_kumar_project',
                        pass: 'akash12345'
                    }
                    // api key = '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'
                });
                console.log("smtp");
                let mailOptions = {
                to: user.email,
                from: 'passwordreset@demo.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    //req.flash('success', 'Success! Your password has been changed.');
                    console.log("confirm mail sent");
                    done(err);
                });
            }
        ], function(err) {
        res.redirect('/');
        });
    });

router.get('/me',  passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});


module.exports = router;