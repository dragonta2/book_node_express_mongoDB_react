// strictモード
'use strict';

// nodeの標準ライブラリ httpをインポート｜http通信が扱えるようになる
var http = require('http');

// Expressをインポート
var express = require('express');

// viewsディレクトリの絶対パスを作成
var path = require('path');

// Expressのインスタンス appを定義
var app = express();


// テンプレートエンジンを設定
app.set('views', path.join(__dirname, 'views'));

// pugをセット
app.set('view engine', 'pug');



// getメソッドでルーティング 第一引数にパスを設定｜ルートを設定
app.get('/', function (req, res, next) {

  // res.renderでテンプレートでの描画を設定｜テンプレート名とテンプレート内で指定している変数titleの値をセット
  return res.render('index', { title: 'Hello World' });
});

// getメソッドでルーティング 第一引数にパスを設定｜hogeディレクトリを設定
app.get('/hoge', function (req, res, next) {

  // res.send 応答をクライアントに送信して要求
  return res.send('Hoge');
});


// node.jsに定義したhttpサーバーにExpressのインスタンスであるappを設置
var server = http.createServer(app);

// Node.jsのサーバーをポート番号3000に関連付ける
server.listen('3000');
