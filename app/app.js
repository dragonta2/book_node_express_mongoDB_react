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

// multipart/form-data形式のリクエスト（画像などの大きなファイルリクエストをパースする形式）をパースするミドルウェア
var fileUpload = require('express-fileupload');

// スキーマをインポート
var Message = require('./schema/Message');

// Expressのインスタンス appを定義
var app = express();

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

// 指定したパスから静的ファイルを配信
app.use("/image", express.static(path.join(__dirname, 'image')));

// テンプレートエンジンを設定
app.set('views', path.join(__dirname, 'views'));

// pugをセット
app.set('view engine', 'pug');



// getメソッドでルーティング 第一引数にパスを設定｜ルート(index)を設定
app.get('/', function (req, res, next) {

  // find()｜クエリに該当する複数のデータを取得するメソッド
  // MongoDBのクエリの基本形式｜第一引数:オブジェクト形式でクエリを設定、最後の引数に結果を取得するコールバック関数を設定（エラーは必ずコールバックの中の第一引数に入る。第二引数に結果が配列形式で格納される）
  Message.find({}, function (err, msgs) {

    if (err) throw err;

    // res.renderでテンプレートでの描画を設定｜テンプレート名, テンプレート内で指定している変数の値をセット
    return res.render('index', { messages: msgs });

  });
});

// getメソッドでルーティング 第一引数にパスを設定｜updateディレクトリを設定
app.get('/update', function (req, res, next) {

  // pugファイルを描画
  return res.render('update');
});


// postメソッドでupdate画面のデータを送信する
app.post("/update", fileUpload(), function (req, res, nest) {

  if (req.files && req.files.image) {
    req.files.image.mv('./image/' + req.files.image.name,

      function (err) {

        if (err) throw err;

        var newMessage = new Message({
          username: req.body.username,
          message: req.body.message,
          image_path: '/image/' + req.files.image.name
        });

        newMessage.save((err) => {
          if (err) throw err;

          return res.redirect("/");
        });
      });
  } else {
    var newMessage = new Message({
      username: req.body.username,
      message: req.body.message
    });
    newMessage.save((err) => {

      if (err) throw err;

      return res.redirect("/");
    });
  }
});

// node.jsに定義したhttpサーバーにExpressのインスタンスであるappを設置
var server = http.createServer(app);

// Node.jsのサーバーをポート番号3000に関連付ける
server.listen('3000');
