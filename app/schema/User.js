var mongoose = require('mongoose');

var User = mongoose.Schema({
  username: String,
  password: String,
  date: {
    type: Date,
    default: new Date()
  },
  avatar_path: String
});

// 第1引数はcollections名, 第2引数は 3行目のvar User = mongoose.Schema() で指定しているschemaの変数名
module.exports = mongoose.model('User', User);
