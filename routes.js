module.exports.addWebcastRoutes = function(app) {
    app.get('/tbaloader', function(req, res) {
        res.render('tbaloader', {
            'title': 'Load from The Blue Alliance'
        });
    });
}
