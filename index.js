var express = require('express');
var app = express();

var Request = require('superagent');
var _ = require('underscore');

var api_url = 'https://commons.wikimedia.org/w/api.php'

var getResultPage = function(query, cb, end) {
    Request
        .get(api_url)
        .query('action=query&generator=categorymembers&gcmtype=file&gcmlimit=10&cllimit=max&prop=categories')
        .query({'format': 'json'})
        .query({'gcmtitle': query.category})
        .query(query.continue_obj)
        .end(function(res){
            cb(res.body);
            if (!res.body['continue']) {
                end();
            } else {
                query['continue_obj'] = res.body['continue'];
                getResultPage(query, cb, end);
            }
        });
};

app.get('/', function (req, res) {
    var cat = req.query.cat || null; 

    if (!cat) {
        res.send(
            '<p>Use <strong>?cat=</strong><em>{Name of Wikimedia Commons category}</em> (e.g. Category:CH-BAR_Collection_First_World_War_Switzerland) to download a CSV of all the categories for each file in that category.</p>'
        );
    } else {
        res.attachment('catexport_' + cat + '.csv');
        res.write('filename,category');
        getResultPage(
            {
                'category': cat,
                'continue_obj': {
                    'continue': ''
                }
            },
            function(response) {
                _.each(response.query.pages, function(page) {
                    res.write("\n");
                    _.each(page.categories, function(category) {
                        console.log('\"' + page.title + '\",\"' + category.title + '\"');
                        res.write(page.title + ',' + category.title);
                    });
                });
            },
            function() {
                res.end();
            }
        );
    }
})

var server = app.listen(7777, function () {
    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)
})
