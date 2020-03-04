// strictモード
'use strict';

// nodeの標準ライブラリ httpをインポート｜http通信が扱えるようになる
var http = require('http');

// Expressをインポート
var express = require('express');

// viewsディレクトリの絶対パスを作成
var path = require('path');

// POST形式のリクエストのボディをパースする
var bodyparser = require('body-parser');

// mongoseをセット｜ExpressアプリケーションをMongoDBに接続させる
var mongoose = require('mongoose');


// スキーマをインポート
var Message = require('./schema/Message');

// Expressのインスタンス appを定義
var app = express();


// var newMessage = new Message({
//   username: req.body.username,
//   message: req.body.message
// });

// newMessage.save((err) => {
//   if (err) throw err;
//   return res.redirect("/");
// });


// 指定したパスにMongoDBを接続してコールバック関数を実行させる
mongoose.connect('mongodb://localhost:27017/chatapp', function (err) {

  if (err) {
    console.error(err);
  } else {
    console.log("successfully connected to MongoDB.");
  }
});



// 以下、このサイトを参考に書いた記法 ちゃんと動く！ https://reffect.co.jp/node-js/express-jsnode-js-mongodb 

// mongoose.connect('mongodb://localhost:27017/chatapp');

// var db = mongoose.connection;

// db.on('error', console.error.bind(console, 'DB connection error:'));

// db.once('open', () => console.log('DB connection successful'));

// リクエストを返すルーティングよりも前の位置でbody-paserミドルウェアを設定する（そうしないと適用されなくなってしまう）
app.use(bodyparser());

// テンプレートエンジンを設定
app.set('views', path.join(__dirname, 'views'));

// pugをセット
app.set('view engine', 'pug');



// getメソッドでルーティング 第一引数にパスを設定｜ルートを設定
app.get('/', function (req, res, next) {

  // res.renderでテンプレートでの描画を設定｜テンプレート名とテンプレート内で指定している変数titleの値をセット
  return res.render('index', { title: 'Hello World' });
});

// getメソッドでルーティング 第一引数にパスを設定｜updateディレクトリを設定
app.get('/update', function (req, res, next) {

  // pugファイルを描画
  return res.render('update');
});

app.post("/update", function (req, res, nest) {

  var newMessage = new Message({
    username: req.body.username,
    message: req.body.message
  });
  newMessage.save((err) => {
    if (err) throw err;
    return res.redirect("/");
  });
});

// node.jsに定義したhttpサーバーにExpressのインスタンスであるappを設置
var server = http.createServer(app);

// Node.jsのサーバーをポート番号3000に関連付ける
server.listen('3000');
