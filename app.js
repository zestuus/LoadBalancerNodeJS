const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const expressHbs = require("express-handlebars");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const MongoStore = require("connect-mongo")(session);

var indexRouter = require("./routes/index");
var userRouter = require("./routes/user");

var app = express();

mongoose.connect("mongodb://localhost:27017/balancer", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});
require("./config/passport")(passport);

app.engine(".hbs", expressHbs({ defaultLayout: "layout", extname: ".hbs" }));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
	session({
		secret: "veryverysecretinformation",
		resave: false,
		saveUninitialized: false,
		store: new MongoStore({
			mongooseConnection: mongoose.connection
		}),
		cookie: {
			secure: false,
			maxAge: 180 * 60 * 1000
		}
	})
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
	res.locals.login = req.isAuthenticated();
	res.locals.session = req.session;
	res.locals.user = req.user;
	next();
});

app.use("/user", userRouter);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
