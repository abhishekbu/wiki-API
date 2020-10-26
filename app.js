const express = require("express");
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/wikiDB', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
    console.log("Connected to database");
});

// Article schema
const articleSchema = new mongoose.Schema({
    title: String,
    content: String
});

const Article = mongoose.model("Article", articleSchema);

//////////////////////////////// REQUESTS TARGETTING ALL ARTICLES ////////////////////////////////////////

app.route("/articles")
    .get(function(req, res){
        Article.find(function(err, foundArticles){
            if (!err)
                res.send(foundArticles);
            else
                res.send(err);
        });
    })
    .post(function(req, res){
        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        })
        newArticle.save(function(err) {
            if(!err)
                res.send("Successfully added a new article");
            else
                res.send(err); 
        });
    })
    .delete(function(req, res){
        Article.deleteMany(function(err){
            if (!err)
                res.send("Successfully deleted all articles");
            else
                res.send(err);
        }) 
    });

//////////////////////////////// REQUESTS TARGETTING SPECIFIC ARTICLES ////////////////////////////////////////
app.route("/articles/:articleName")
    .get(function(req, res){
        const articleTitle = req.params.articleName
        Article.findOne(
            {title: articleTitle},
            function(err, foundArticle){
                if (foundArticle)
                    res.send(foundArticle)
                else
                    res.send("No article matching that title was found!");
            }
        )
    })
    .put(function(req, res){
        const articleTitle = req.params.articleName;
        Article.replaceOne(
            {title: articleTitle},
            {title: req.body.title, content: req.body.content},
            function(err, numAffected){
                if (!err)
                    console.log(numAffected)
                    res.send("Successfully updated article.");
            }
        )
    })
    .patch(function(req, res){
        const articleTitle = req.params.articleName;
        Article.updateOne(
            {title: articleTitle},
            {$set: req.body},
            function(err) {
                if(!err)
                    res.send("Successfully updated the article.");
            }
        )
    })
    .delete(function(req, res){
        Article.deleteOne(
            {title: req.params.articleName},
            function(err){
                if (!err)
                    res.send("Successfully deleted the corresponding article")
                else
                    res.send(err)
            }
        )
    });
    

app.listen(3000, function(){
    console.log("Server started");
})

