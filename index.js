var express = require('express');
var app = express();

var Request = require('superagent');
var _ = require('underscore');

var api_url = 'https://commons.wikimedia.org/w/api.php'

var getResultPage = function(query, cb, end, first) {
    Request
        .get(api_url)
        .query('action=query&generator=categorymembers&gcmtype=file&gcmlimit=100&cllimit=max&prop=categories')
        .query({'format': 'json'})
        .query({'gcmtitle': query.category})
        .query(query.continue_obj)
        .end(function(res){
            cb(res.body, first);
            if (!res.body['continue']) {
                end();
            } else {
                query['continue_obj'] = res.body['continue'];
                getResultPage(query, cb, end, false);
            }
        });
};

app.get('/', function (req, res) {
    var cat = req.query.cat || null; 
    console.log("cat: " + cat);

    if (!cat) {
        var options = {
            root: __dirname,
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        res.sendFile('index.html', options, function (err) {
            if (err) {
              console.log(err);
              res.status(err.status).end();
            }
            else {
              console.log('Sent: index.html');
            }
        });
        return;
    }
    getResultPage(
        {
            'first': true,
            'category': cat,
            'continue_obj': {
                'continue': ''
            }
        },
        function(response, first) {
            console.log(response, first);
            if (!response.query) {
                if (response.error) {
                   res.write("<p style='color: red; font-weight: bold;'>" + response.error.info + " (" + response.error.code + "): " + cat);
                } else {
                    res.write("<pi style='color: red; font-weight: bold;'>Error: No data found for category '" + cat + "'!<p>");
                }
                res.end();
                return;
            }
            if (first) {
                res.attachment('catexport_' + cat + '.csv');
                res.write('\"filename\",\"category\"');
            }
            _.each(response.query.pages, function(page) {
                _.each(page.categories, function(category) {
                    console.log('\"' + page.title + '\",\"' + category.title + '\"');
                    res.write('\n\"' + page.title + '\",\"' + category.title + '\"');
                });
            });
        },
        function() {
            res.end();
            console.log('Finished.');
        },
        true
    );
})

var port = process.env.PORT || 7777;
var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port

    console.log('catexport app listening at http://%s:%s', host, port)
})
