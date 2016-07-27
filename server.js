var express = require('express');
var bodyParser = require('body-parser');
var login = require('./routes/login');
var passport = require('passport');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var register = require('./routes/register');
var login = require('./routes/login');
var path = require('path');

var app = express();

app.use(session({
  secret: 'puppers',
  key: 'user',
  resave: true,
  saveUninitialized: false,
  cookie: { maxAge: 1000000, secure: false }
}));



passport.serializeUser(function(user, done) {
   done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err,user){
    if(err) {
      return done(err);
    }
    done(null, user);
  });
});

passport.use('local', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, function(username, password, done) {
  User.findAndComparePassword(username, password, function(err, isMatch, user){
    if(err){
      return done(err);
    }
    if(isMatch){
      return done(null, user);
    }else {
      done(null, false);
    }
  });
}));


app.use(passport.initialize());

app.use(passport.session());

app.use(session({
   secret: 'secret',
   key: 'user',
   resave: true,
   saveUninitialized: false,
   cookie: { maxAge: 60000, secure: false }
}));
app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use('/register', register);
app.use('/login', login);

app.get('/', function(req,res,next){
  res.sendFile(path.resolve(__dirname, 'public/views/login.html'));
});

app.use('/api', function(req, res, next){
  if(req.isAuthenticated()){
    next();
  }else{
    res.sendStatus(403);
  }

});




var server = app.listen(3000, function(){
  var port = server.address().port;
  console.log('ready and waiting on port', port);
})
