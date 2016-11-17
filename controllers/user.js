//Continue from 4. Edit user registration
const Role = require('mongoose').model('Role');
const User = require('mongoose').model('User');
const encryption = require('./../utilities/encryption');

module.exports = {
    registerGet: (req, res) => {
        res.render('user/register');
    },

    registerPost:(req, res) => {
        let registerArgs = req.body;

        User.findOne({email: registerArgs.email}).then(user => {
            let errorMsg = '';
            if (user) {
                errorMsg = 'User with the same username exists!';
            } else if (registerArgs.password !== registerArgs.repeatedPassword) {
                errorMsg = 'Passwords do not match!'
            }

            if (errorMsg) {
                registerArgs.error = errorMsg;
                res.render('user/register', registerArgs)
            } else {
                let salt = encryption.generateSalt();
                let passwordHash = encryption.hashPassword(registerArgs.password, salt);

                let userObject = {
                    email: registerArgs.email,
                    passwordHash: passwordHash,
                    fullName: registerArgs.fullName,
                    salt: salt
                };

                let roles = [];

                Role.findOne({name: 'User'}).then(role => {

                    roles.push(role.id);

                    userObject.roles = roles;

                    User.create(userObject).then(user => {
                        role.users.push(user);

                        role.save(err =>{

                           if(err){
                               registerArgs.error = err.message;
                               res.render('user/register', registerArgs);
                           } else {

                               req.logIn(user, (err) => {

                                   if(err){
                                       registerArgs.error = err.message;
                                       return;
                                   }

                                   res.redirect('/');
                               });
                           }

                        });
                    });
                });


                // User.create(userObject).then(user => {
                //     req.logIn(user, (err) => {
                //         if (err) {
                //             registerArgs.error = err.message;
                //             res.render('user/register', registerArgs);
                //             return;
                //         }
                //
                //         res.redirect('/')
                //     })
                // })
            }
        })
    },

    loginGet: (req, res) => {
        res.render('user/login');
    },

    loginPost: (req, res) => {
        let loginArgs = req.body;
        User.findOne({email: loginArgs.email}).then(user => {
            if (!user ||!user.authenticate(loginArgs.password)) {
                let errorMsg = 'Either username or password is invalid!';
                loginArgs.error = errorMsg;
                res.render('user/login', loginArgs);
                return;
            }

            req.logIn(user, (err) => {
                if (err) {
                    console.log(err);
                    res.redirect('/user/login', {error: err.message});
                    return;
                }

                res.redirect('/');
            })
        })
    },

    logout: (req, res) => {
        req.logOut();
        res.redirect('/');
    }
};
