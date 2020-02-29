// strictモード
'use strict';

// nodeの標準ライブラリ httpをインポート｜http通信が扱えるようになる
var http = require('http');

// Expressをインポート
var express = require('express');

// Expressのインスタンス appを定義
var app = express();

// getメソッドでルーティング 第一引数にパスを設定｜ルートを設定
app.get('/', function (req, res, next) {

  // res.send 応答をクライアントに送信して要求
  return res.send('Hello World');
});

// getメソッドでルーティング 第一引数にパスを設定｜hogeディレクトリを設定
app.get('/hoge', function (req, res, next) {

  // res.send 応答をクライアントに送信して要求
  return res.send('Hoge');
});


// // useメソッドを使用
// app.use(function (req, res, next) {

//   // res.send 応答をクライアントに送信して要求
//   return res.send('Hello World');
// });

// node.jsに定義したhttpサーバーにExpressのインスタンスであるappを設置
var server = http.createServer(app);

// Node.jsのサーバーをポート番号3000に関連付ける
server.listen('3000');
