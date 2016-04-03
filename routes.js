module.exports.addWebcastRoutes = function(app) {
    app.get('/live', function(req, res) {
        res.render('live', {
            'title': 'Live'
        });
    });
    app.get('/tbaloader', function(req, res) {
        res.render('tbaloader', {
            'title': 'Load from The Blue Alliance'
        });
    });
    app.get('/cplive', function(req, res) {
        res.render('cp_live', {
            'title': 'Live Control Panel'
        });
    });
}
