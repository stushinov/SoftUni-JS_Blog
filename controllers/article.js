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
            res.render('article/details', article)
        });
    },

    editGet: (req, res) => {

        let id = req.params.id;

        Article.findById(id).then(article => {
            res.render('article/edit', article)
        });
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
    }
};