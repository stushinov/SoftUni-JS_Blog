const Article = require('mongoose').model('Article');

module.exports = {

    createGet: (req, res) => {
        res.render('article/create');
    },


    //same as createPost: function(req, res){}
    createPost: (req, res) => {
        let articleArgs = req.body;

        let errorMessage = '';

        if (!req.isAuthenticated) {
            errorMessage = 'You should be logged in to make articles'
        } else if (!articleArgs.title) {
            errorMessage = 'Invalid title';
        } else if (!articleArgs.content) {

        }

        if (errorMessage) {
            res.render('article/create', {error: errorMessage});
            return;
        }

        articleArgs.author = req.user.id;
        Article.create(articleArgs).then(article => {
            req.user.articles.push(article.id);
            req.user.save(err => {

                if (err) {
                    res.redirect('/', {error: err.errorMessage});
                } else {
                    res.redirect('/');
                }
            });
        })

    },

    details: (req, res) => {

        let id = req.params.id;

        Article.findById(id).populate('author').then(article => {

            if(!req.user){
                res.render('article/details', {article: article, isUserAuthorized: false});
                return;
            }
            req.user.isInRole('Admin').then(isAdmin => {

                let isUserAuthorized = isAdmin || req.user.isAuthor(article);
                res.render('article/details', {article: article, isUserAuthorized: isUserAuthorized});
            })
        });
    },

    editGet: (req, res) => {

        let id = req.params.id;

        if(!req.isAuthenticated()){
            let returnUrl = `/article/edit/${id}`;

            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');

            return;
        }
        Article.findById(id).then(article =>{

            req.user.isInRole('Admin').then(isAdmin => {

                if(!isAdmin && !req.user.isAuthor(article)){
                    res.redirect('/');
                    return;
                }
                res.render('article/edit', article);
            })
        })
    },

    editPost: (req, res) => {

        let id = req.params.id;

        let errorMsg = '';

        let articleArgs = req.body;

        if (!articleArgs.title) {
            errorMsg = 'Article title cannot be empty'
        } else if (!articleArgs.content) {
            errorMsg = 'Article content cannot be empty';
        }

        if (errorMsg) {
            res.render('article/edit', {error: errorMsg});
        } else {
            Article.update({_id: id}, {$set: {title: articleArgs.title, content: articleArgs.content}})
                .then(updateStatus => {
                    res.redirect(`/article/details/${id}`);
                });
        }
    },

    deleteGet: function(req, res){
        let id = req.params.id;

        if(!req.isAuthenticated()){
            let returnUrl = `/article/delete/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }
        Article.findById(id).then(article => {
            req.user.isInRole('Admin').then(isAdmin =>{

                if(!isAdmin && !req.user.isAuthor(article)){
                    res.redirect('/');
                    return;
                }

                res.render('article/delete', article);
            })
        })
    },

    deletePost: function(req, res){
        let id = req.params.id;
        Article.findOneAndRemove({_id: id}).populate('author').then(article => {

            let author = article.author;

            //Index of articles's id in author's articles.
            let index = author.articles.indexOf(article.id);

            if(index < 0){

                let errorMsg = 'Article was not found for this author';
                res.render('article/delete', {error: errorMsg});

            } else {

                //Remove count elements after a given index (inclusive)
                let count = 1;

                author.articles.splice(index, count);

                author.save().then((user) => {
                    res.redirect('/');
                })
            }

        });
    }

};