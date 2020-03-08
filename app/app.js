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

// スキーマをインポート｜/schema/Message.js
var Message = require('./schema/Message');

// スキーマをインポート｜/schema/User.js
var User = require('./schema/User');



// express用 汎用認証ミドルウェア
var passport = require('passport');

// ローカル認証を行う
var LocalStrategy = require('passport-local').Strategy;

// セッションを扱う
var session = require('express-session');

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


// セッションをセット
app.use(session({ secret: 'HogeFuga' }));

// 認証用ミドルウェア passportを初期化
app.use(passport.initialize());

// パスポートにセッションを指定
app.use(passport.session());


// 指定したパスにテンプレートエンジンを設定
app.set('views', path.join(__dirname, 'views'));

// pugをセット
app.set('view engine', 'pug');


// 指定したパスから静的ファイルを配信｜画像ファイル
app.use("/image", express.static(path.join(__dirname, 'image')));

// 指定したパスから静的ファイルを配信｜アバターアイコン
app.use('/avatar', express.static(path.join(__dirname, 'avatar')));



// getメソッドでルーティング 第一引数にパスを設定(/の記号を必ず入れること！）｜ルート(index)を設定
// ルーティングを作成｜トップ画面を描画
app.get('/', function (req, res, next) {

  // find()｜クエリに該当する複数のデータを取得するメソッド
  // MongoDBのクエリの基本形式｜第一引数:オブジェクト形式でクエリを設定、最後の引数に結果を取得するコールバック関数を設定（エラーは必ずコールバックの中の第一引数に入る。第二引数に結果が配列形式で格納される）
  Message.find({}, function (err, msgs) {

    if (err) throw err;

    // res.renderでテンプレートでの描画を設定｜テンプレート名, テンプレート内で指定している変数の値をセット
    return res.render('index', {
      messages: msgs
    });

  });
});


// ルーティングを作成｜会員登録用画面
app.get('/signin', function (req, res, next) {
  return res.render('signin');
});


// ルーティングを作成｜会員登録データ投稿画面
app.post('/signin', fileUpload(), function (req, res, next) {

  var avatar = req.files.avatar;
  avatar.mv('./avatar/' + avatar.name, function (err) {

    if (err) throw err;

    var newUser = new User({
      username: req.body.username,
      password: req.body.password,
      avatar_path: '/avatar/' + avatar.name
    });

    newUser.save((err) => {
      if (err) throw err;
      return res.redirect('/');
    });
  });
});


// passport.authenticate('local')でセッションが設定されていない場合に処理が渡される
passport.use(new LocalStrategy(

  // usernameとpasswordはPOST形式でルーティングの/loginに送信されたパラメータから自動的にセットされる
  // まず、POSTで送信されたユーザー名とパスワードからDBに問い合わせて、該当のユーザーが登録済かをチェック、コールバック関数のdone()を呼びだす。
  function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {

      // doneの第一引数にはエラーが発生した場合にtrurと評価される値を渡す。第2引数には認証が成功して登録済みのユーザーの場合はtrueをそうでない場合はfalseを渡す。
      if (err) { return done(err); }

      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      // doneを呼ぶことができるのは1回のリクエストのたびに1回だけ。認証に成功した場合はこのユーザー情報を使ってセッションIDを生成する。
      return done(null, user);
    });
  }
));

// passportでセッションを管理するにあたって、cookieに保存され、ユーザーを区別するために使用するセッション情報に、データベースに保存されたユーザーの全ての情報を使うのは不都合が生じることがある。そのため、セッションのシリアライズとデシリアライズをおこなう。

// シリアライズはpassport.use()で認証されたユーザーのデータから、どの情報をセッションに格納するかを決定する。ここではuser._idを指定している。

// ※ 用語解説｜シリアライズ（serialize）｜プログラミングでオプジェクト化されたデータを、ファイルやストレージに保存したり、ネットワークで送受信したりできるような形に変換することを言います。

// これはExpressのsession変数であるreq.sessionに格納され、req.session.passport.user = 'hogehoge'のようにセッションのペイロード（ヘッダなどの制御情報を除いた、正味のデータ本体のこと）として任意のルーティングで使用することができる。
passport.serializeUser(function (user, done) {
  done(null, user._id);
});


// デシリアライズは、ログイン済みのクライアントからセッション変数を送信されるたびに、その中身を検証するために送信するミドルウェア。通常 req.session.passport.userの中身がコールバック関数の第一引数として渡される。

// ※ 用語解説｜デシリアライズ（deserialize）｜シリアライズされたデータをプログラミングで扱えるようにオブジェクトの型に復元すること

// 通常このデータを使って、データベースなどから該当するユーザーの情報を取得するので、クエリとして使用可能な項目を指定する。
passport.deserializeUser(function (id, done) {
  User.findOne({ _id: id }, function (err, user) {
    done(err, user);
  });
});




// app.post('/avatar', fileUpload(), function (req, res, next) {

//   var avatar = req.files.avatar;
//   avatar.mv('./avatar/' + avatar.name, function (err) {

//     if (err) throw err;

//     var newUser = new User({
//       username: req.body.username,
//       password: req.body.password,
//       avatar_path: '/avatar/' + avatar.name
//     });

//     newUser.save((err) => {
//       if (err) throw err;
//       return res.redirect('/');
//     });
//   });
// });


// ルーティングを作成｜ログイン画面を描画
app.get('/login', function (req, res, next) {
  return res.render('login');
});

// ログイン画面に認証を送信｜OKならトップ画面へ、失敗ならログイン画面へ飛ばす
app.post('/login', passport.authenticate('local',
  {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);


// ルーティングを作成｜update画面を描画
app.get('/update', function (req, res, next) {

  // pugファイル｜update.pugを描画
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
