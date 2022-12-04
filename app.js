const express = require("express");
const app = express();
const ejs = require("ejs");
const https = require("https");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");
require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const nodeMailer = require("nodemailer");
const axios = require("axios");
const req = require("express/lib/request");
const objectId = require("mongodb").objectId;
const twilioClient = require("twilio")("AC9f2343f99976798f932dfc9a56d4ee8c", "b282d5813f8cf1cc1a70fb65cb54c848");

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "This is my secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb+srv://Mahmoud:test-123@cluster0.3ofhw.mongodb.net/clinicDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const UsertSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  phone: String,
  age: Number,
  googleId: String,
  active: Boolean,
  verificationCode: String,
  type: String
});

UsertSchema.plugin(passportLocalMongoose);
UsertSchema.plugin(findOrCreate);

const User = mongoose.model("User", UsertSchema);

passport.use(User.createStrategy());

//****** Create a Schema for the reservation for the registered accounts **************/
const AppointmentSchema = new mongoose.Schema ({
  time: String,
  date: String,
  patientId: String,
  age: String,
  phone: String,
  patientName: String,
  patientUsername: String,
  doctor: String,
  condition: String,
  fee: String
});

const Appointment = mongoose.model("Appointment", AppointmentSchema);

//****** The schema for the appointments that affect our database finances **************/
const countedAppointmentSchema = new mongoose.Schema({
  time: String,
  date: String,
  patientId: String,
  age: String,
  phone: String,
  patientName: String,
  patientUsername: String,
  doctor: String,
  condition: String,
  fee: String
});

const CountedAppointment = mongoose.model("CountedAppointment", countedAppointmentSchema);


//****** Create a Schema for the fees **************/
const FeeSchema = new mongoose.Schema({
  drName: String,
  condition: String,
  fee: Number
});

const Fee = mongoose.model("Fee", FeeSchema);

//****** Add Fees for the doctors *********/
/*Fee.insertMany([
  {
    drName: "Dr. Atef Aboulsoud",
    condition: "كشف",
    fee: 150
  },
  {
    drName: "Dr. Atef Aboulsoud",
    condition: "إستشارة",
    fee: 75
  },
  {
    drName: "Dr. Mervat Kabil",
    condition: "كشف",
    fee: 100
  },
  {
    drName: "Dr. Mervat Kabil",
    condition: "إستشارة",
    fee: 50
  },
  {
    drName: "Dr. Ahmed Atef",
    condition: "كشف",
    fee: 80
  },
  {
    drName: "Dr. Ahmed Atef",
    condition: "إستشارة",
    fee: 40
  }
])*/

//AppointmentSchema.plugin(passportLocalMongoose);
//AppointmentSchema.plugin(findOrCreate);

//****** Create a Schema for the reservation list **************/
const ListSchema = {
  list: [AppointmentSchema]
};

const List = mongoose.model("List", ListSchema);
//***************************************************************/

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/auth/google/home"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     console.log(profile);

//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }));

app.get("/", function(req, res) {

  var t = [];

  const url = "https://newsapi.org/v2/top-headlines?country=eg&category=health&apiKey=5d36523fc85f4d8abc47299241428dee";
  // https.get(url, function(response) {
  //   // console.log(response);
  //   let chunks = [];

  //   // IN ORDER TO GET THE FULL DATA YOU HAVE TO APPLY BOTH 'ON(DATA)' & 'ON(END)'
  //   response.on("data", function(data) {
  //     chunks.push(data);
  //   }).on("end", function(){
  //     let data = Buffer.concat(chunks);
  //     let schema = JSON.parse(data);
  //     console.log(schema);

  //     let rand = Math.floor(Math.random() * 19) + 0;
  //     let rand1 = Math.floor(Math.random() * 19) + 0;
  //     let rand2 = Math.floor(Math.random() * 19) + 0;

  //     t.push(schema.articles[rand]);
  //     t.push(schema.articles[rand1]);
  //     t.push(schema.articles[rand2]);
  //     // console.log(t);
  //     res.render("home", {
  //       news: t
  //     });
  //   });
  // });

  // res.render("home", {
  //   news: t
  // });

  res.render("home");
  
});

// FIND USER BY ID
// User.findOne({"_id": new mongoose.mongo.ObjectID("624af74fd167c10018f118bf")}, function(err, success) {
//   if(err) {
//     console.log(err);
//   } else {
//     console.log(success.username);
//   }
// });

// app.get("/auth/google",
//   passport.authenticate("google", { scope: ["profile"] })
// );

// app.get("/auth/google/home",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect("/");
//   });

// app.route("/register")
//   .get(function(req, res) {
//     res.render("register");
//   })
//   .post(function(req, res) {
//
//     });
//
//     // console.log(req.body);
//     // let msgs = [{
//     //   type: "success",
//     //   content: "Signed up seccessfully"
//     // }];
//     // res.render("login", {msgArray: msgs});
//   });

app.get("/register", function(req, res) {
  res.render("register");
});

// nodeOutlook.sendEmail({
//   auth: {
//     user: "tefasons@hotmail.com",
//     pass: "aboelso3od"
//   },
//   from: "tefasons@hotmail.com",
//   to: "mahmoud.atef98@outlook.com",
//   subject: "This is a trial e-mail from node js",
//   text: "This is a text version!",
//   onerror: (e) => console.log(e),
//   onSuccess: (s) => console.log("E-mail sent successfully!")
// });

function generateVerificationCode() {
  let code = Math.floor(Math.random() * ( 9999 - 1000) + 1000);
  return code;
}

function sendNodeMailer(uname, code){
  let transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: "abousoudcenter@gmail.com",
      pass: "ooplirnurwzhkjrr"
    },
  });

  let info = {
    from: "abousoudcenter@gmail.com",
    to: uname,
    subject: "Verification code for Abousoud Medical Center",
    html: "<b>Your verification code for Aboulsoud medical center is: " + code + "</b>"
  };

  transporter.sendMail(info, function(err, success) {
    if(err) {
      console.log(err);
    } else {
      console.log("Email sent successfully");
    }
  });
}

function sendMessage(uname, msgSubject, msgText) {
  let transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: "abousoudcenter@gmail.com",
      pass: "ooplirnurwzhkjrr"
    },
  });

  let info = {
    from: "abousoudcenter@gmail.com",
    to: uname,
    subject: msgSubject,
    html: msgText
  };

  transporter.sendMail(info, function(err, success) {
    if(err) {
      console.log(err);
    } else {
      console.log("Email sent successfully");
    }
  });
}

function sendSmsCode(number, vCode) {
  twilioClient.messages 
      .create({        
        body: "Your verification code is: " + vCode,
        messagingServiceSid: 'MG68c3886f9cc78a4277c484f374964f37',
        to: '+2' + number 
       }) 
      .then(message => console.log(message.sid)) 
      .done();
};

function sendSmsMessage(number, msg) {
  twilioClient.messages 
      .create({   
        from: "Al-Shorouk",     
        body: msg,
        messagingServiceSid: 'MG68c3886f9cc78a4277c484f374964f37',
        to: '+2' + number 
       }) 
      .then(message => console.log(message.sid)) 
      .done();
};

app.post("/register", function(req, res) {
  let code = generateVerificationCode();
  // SEND THE VERIFICATION CODE TO THE CLIENT
  sendSmsCode(req.body.phone, code);
  // GET THE AGE OF THE USER BY SUBTRACTING CURRENT YEAR - BIRTH YEAR
  let year = req.body.birthDay.split("-");
  let birthYear = year[0];
  let age = parseInt(new Date().getFullYear() - birthYear);
  User.register({
    username: req.body.username,
    name: req.body.fName + " " + req.body.lName,
    password: req.body.password,
    age: age,
    phone: req.body.phone,
    active: false,
    verificationCode: code,
    type: "patient"}, req.body.password, function(err, Patient) {
    if (err) {
      console.log(err);
      res.redirect("/register");
      //alert(err);
    } else {
      //********** This is if we don't have verificationpage **********************/
      // passport.authenticate("local")(req, res, function() {
      //   res.redirect("/");
      //   console.log("Successful Registration!");
      // });

      /*****************This redirects the user to the verification page***********************/
      sendNodeMailer(req.body.username, code);
      res.render("verifyAccount", {
        username: req.body.username
      });
    }
  })
});

app.get("/guestAppointment", (req, res) => {
  res.render("guestAppointment");
});

app.get("/drAhmedGuest", (req, res) => {
  res.render("drAhmedGuest");
});

app.post("/drAhmedGuest", (req, res) => {
  // console.log(req.body);
  res.redirect("/guestChooseTime/" + req.body.appointmentDate + "?parPatientName=" + req.body.patientName +
   "&parAge=" + req.body.age + "&parPhone=" + req.body.phone +
   "&parDrName=Dr. Ahmed Atef&parCondition=" + req.body.condition + 
   "&parAppointmentDate=" + req.body.appointmentDate);
});

app.get("/drAtefGuest", (req, res) => {
  res.render("drAtefGuest");
});

app.post("/drAtefGuest", (req, res) => {
  // console.log(req.body);

  res.redirect("/guestChooseTime/" + req.body.appointmentDate + "?parPatientName=" + req.body.patientName +
   "&parAge=" + req.body.age + "&parPhone=" + req.body.phone +
   "&parDrName=Dr. Atef Aboulsoud&parCondition=" + req.body.condition + 
   "&parAppointmentDate=" + req.body.appointmentDate);
});

app.get("/drMervatGuest", (req, res) => {
  res.render("drMervatGuest");
});

app.post("/drMervatGuest", (req, res) => {
  // console.log(req.body);

  res.redirect("/guestChooseTime/" + req.body.appointmentDate + "?parPatientName=" + req.body.patientName +
   "&parAge=" + req.body.age + "&parPhone=" + req.body.phone +
   "&parDrName=Dr. Mervat Kabil&parCondition=" + req.body.condition + 
   "&parAppointmentDate=" + req.body.appointmentDate);
});

app.get("/drIsmailGuest", (req, res) => {
  res.render("drIsmailGuest");
});

app.post("/drIsmailGuest", (req, res) => {
  // console.log(req.body);

  res.redirect("/guestChooseTime/" + req.body.appointmentDate + "?parPatientName=" + req.body.patientName +
   "&parAge=" + req.body.age + "&parPhone=" + req.body.phone +
   "&parDrName=Dr. Ismail Tawfik&parCondition=" + req.body.condition + 
   "&parAppointmentDate=" + req.body.appointmentDate);
});

app.get("/guestChooseTime/:appDate", function(req, res) {

  // console.log(req.body);
  // console.log(req.query);

  try {
    let arr = [];

  Appointment.find({date: req.params.appDate, doctor: req.query.parDrName}, function(err, found) {
    if(err) {
      console.log(err);
    } else {
      console.log("Found Them Right: " + found.length);
      for(var i = 0;i < found.length; i++) {
        arr.push(found[i].time);
      }

      res.render("guestChooseTime", {
        age: req.query.parAge,
        phone: req.query.parPhone,
        appointmentDate: req.query.parAppointmentDate,
        condition: req.query.parCondition,
        drName: req.query.parDrName,
        patientName: req.query.parPatientName,
        tmpArray: arr
      });
    }

  });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

app.post("/guestChooseTime/:appDate", (req, res) => {
  console.log(req.body);

  // FIND THE FEE
  Fee.findOne({drName: req.body.drName, condition: req.body.condition}, function(err, foundFee) {
    if(err) {
      console.log(err);
    } else {
      // CREATE AN APPOINTMENT OBJECT TO SAVE IT
      const app = new Appointment({
        time: req.body.appointmentTime,
        date: req.body.appointmentDate,
        patientId: "Guest",
        age: req.body.age,
        phone: req.body.phone,
        patientName: req.body.patientName,
        doctor: req.body.drName,
        condition: req.body.condition,
        patientUsername: "Guest",
        fee: foundFee.fee
      });
    
      // SAVE THE APPOINTMENT
      app.save(function(err, success) {
        if(err) {
          console.log(err);
        } else {
          console.log("Saved the appointment Successfully");
          let dr = "";
          if(req.body.drName === "Dr. Atef Aboulsoud") {dr = "الباطنة, أ.د/ عاطف أبوالسعود"}
          else if (req.body.drName === "Dr. Mervat Kabil") {dr = "الأنف والأذن, د/ ميرفت كمال قابيل"}
          else if (req.body.drName === "Dr. Ahmed Atef") {dr = "العظام, د/ أحمد عاطف أبوالسعود"}
          else if (req.body.drName === "Dr. Ismail Tawfik") {dr = "العظام, أ.د/ إسماعيل توفيق"}
          sendSmsMessage(req.body.phone, "تم حجز ميعاد يوم " + req.body.appointmentDate + " بعيادة " + dr + " الساعة " + req.body.appointmentTime +  " مساءاً. سيتم الإتصال بك يوم الحجز لتأكيد الميعاد. شكراً لإستخدامك موقع الشروق الطبى ");
          res.redirect("/guestConfirmReservation");
        }
      });
    }
  });
});

app.get("/guestConfirmReservation", (req, res) => {
  res.render("guestConfirmReservation");
});

app.post("/guestConfirmReservation", (req, res) => {
  res.redirect("/");
});

app.get("/drAhmedAtef", function(req, res){
  if(req.user) {
    res.render("drAhmedAtef", {
      name: req.user.name,
    });
  } else {
    res.render("drAhmedAtef");
  }
});

app.get("/editProfile", function(req, res) {
  if(req.user) {
    res.render("editProfile", {
      name: req.user.name,
      email: req.user.username,
      uName: req.user.name,
      phone: req.user.phone,
      age: req.user.age
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/editProfile", function(req, res) {
  // console.log(req.body);

  if(req.body.button === "update") {
    User.updateOne({_id: req.user.id}, {$set: {name: req.body.inputFullName, phone: req.body.inputPhone, age: req.body.inputAge}}, function(err, updated) {
      if(err) {
        console.log(err);
      } else {
        console.log("Updated the data of the user successfully!");
        res.redirect("/loggedInUser?updated=yes");
      }
    });
  } else {
    res.redirect("/loggedInUser");
  }
});

app.get("/chooseTime/:appDate", function(req, res) {

  // console.log(req.body);
  // console.log(req.query);

  try {
    let arr = [];

  Appointment.find({date: req.params.appDate, doctor: req.query.parDrName}, function(err, found) {
    if(err) {
      console.log(err);
    } else {
      console.log("Found Them Right: " + found.length);
      for(var i = 0;i < found.length; i++) {
        arr.push(found[i].time);
      }

      res.render("chooseTime", {
        name: req.user.name,
        age: req.query.parAge,
        phone: req.query.parPhone,
        appointmentDate: req.query.parAppointmentDate,
        condition: req.query.parCondition,
        drName: req.query.parDrName,
        patientName: req.query.parPatientName,
        tmpArray: arr
      });
    }

  });
  } catch (error) {
    console.log(error);
    res.redirect("/loggedInUser");
  }
});

app.post("/clinicDataDetails", function(req, res) {
  CountedAppointment.findOne({_id: req.body.buttonDetails}, function(err, found) {
    if(err) {
      console.log(err);
    } else {
      // console.log("Found the app to show details");
      res.render("clinicDataDetails", {
        app: found
      });
    }
  });
});

app.post("/chooseTime/:appDate", function(req, res) {
  console.log(req.body);

  // FIND THE FEE
  Fee.findOne({drName: req.body.drName, condition: req.body.condition}, function(err, foundFee) {
    if(err) {
      console.log(err);
    } else {
      // CREATE AN APPOINTMENT OBJECT TO SAVE IT
      const app = new Appointment({
        time: req.body.appointmentTime,
        date: req.body.appointmentDate,
        patientId: req.user.id,
        age: req.body.age,
        phone: req.body.phone,
        patientName: req.body.patientName,
        doctor: req.body.drName,
        condition: req.body.condition,
        patientUsername: req.user.username,
        fee: foundFee.fee
      });
    
      // SAVE THE APPOINTMENT
      app.save(function(err, success) {
        if(err) {
          console.log(err);
        } else {
          console.log("Saved the appointment Successfully");
          sendMessage(req.user.username,
            "Reservation Success",
            "<p>You have successfully made an appointment on " + req.body.appointmentDate + ", time: " + req.body.appointmentTime + ".<br>Thanks for using Al-Shorouk medical center Website and we are very excited to meet you.<br>Best Regards!<br>Al-Shorouk Medical Center");
          res.redirect("/confirmReservation");
        }
      });
    }
  });
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.post("/login", function(req, res) {
  /***** Store the data of the incoming request to make login request with it ************/
  const pat = new User({
    username: req.body.username,
    password: req.body.password
  });

  var name = "";

  User.findOne({username: req.body.username}, function(err, foundPatient) {
    if (err) {
      console.log(err);
    } else {
      if (foundPatient && foundPatient.password === req.body.password) {
        console.log("Right credentials! " + foundPatient.active);
        if (foundPatient.active === false) {
         console.log(foundPatient.password + " / " + foundPatient.active);
         res.render("verifyAccount", {
           // Send username as an argument
           username: req.body.username
         });
       } else {
         req.login(pat, function(err) {
           if (err) {
             //console.log("Not Authed!!");
             console.log(err);
             res.redirect("/login");
           } else {
             //console.log("Authed!!");
             passport.authenticate("local")(req, res, function() {
               if (req.body.username === "mahmoud.atef98@outlook.com") {
                 res.redirect("/adminHome");
               } else {
                 console.log(name);
                 res.redirect("/loggedInUser?flag=" + "Hi");
               }
             });
           }
         });
       }
      } else if (foundPatient && foundPatient.password !== req.body.password) {
        console.log("Wrong Credentials!");
        res.redirect("login");
      }
    }
  });

  app.get("/loggedInUser", function(req, res) {
    if (req.user) {
      // LOAD THE DATA FROM OUT HEALTH API
      var t = [];

      const url = "https://newsapi.org/v2/top-headlines?country=eg&category=health&apiKey=5d36523fc85f4d8abc47299241428dee";
    //   https.get(url, function(response) {
    //   // console.log(response);
    //   let chunks = [];

    //   // IN ORDER TO GET THE FULL DATA YOU HAVE TO APPLY BOTH 'ON(DATA)' & 'ON(END)'
    //   response.on("data", function(data) {
    //     chunks.push(data);
    //   }).on("end", function(){
    //     let data = Buffer.concat(chunks);
    //     let schema = JSON.parse(data);
    //     // console.log(schema.articles[3].title);

    //     let rand = Math.floor(Math.random() * 19) + 0;
    //     let rand1 = Math.floor(Math.random() * 19) + 0;
    //     let rand2 = Math.floor(Math.random() * 19) + 0;

    //     t.push(schema.articles[rand]);
    //     t.push(schema.articles[rand1]);
    //     t.push(schema.articles[rand2]);

    //     if(req.query.flag === "Hi") {
    //       res.render("loggedInUser", {
    //         name: req.user.name,
    //         flag: "Hi", 
    //         news: t
    //       })
    //     } else {
    //       res.render("loggedInUser", {
    //         name: req.user.name,
    //         news: t
    //       });
    //     }
    //   });
    // });

      // if(req.query.flag === "Hi") {
      //   res.render("loggedInUser", {
      //     name: req.user.name,
      //     flag: "Hi", 
      //     news: t
      //   })
      // } else {
      //   res.render("loggedInUser", {
      //     name: req.user.name,
      //     news: t
      //   });
      // }
      res.render("loggedInUser", {
        name: req.user.name,
        flag: "Hi"
      })
    } else {
      console.log("None!");
    }
  });

});

app.post("/deleteUserAppointment", function(req, res) {
  console.log(req.body.appointmentId);

  // WE FIND THE APPOINTMENT IN ORDER TO SEND THE DELETION MESSAGE WITH DETAILS FOR THE USER
  Appointment.findOne({_id: req.body.appointmentId}, function(err, found) {
    if(err) {
      console.log(err);
    } else {
      sendMessage(req.user.username,
        "Appointment Deleted",
        "Your appointment with date of " + found.date + " and time of " + found.time + " has been deleted! we are deeply sad to see you go.<br>Talk Soon<br>Kindest Regards!<br>Al-Shorouk Medical Center"
        );
    }
  });

  Appointment.deleteOne({_id: req.body.appointmentId}, function(err, success) {
    if(err) {
      console.log(err);
    } else {
      console.log("Deleetd successfully!");
      // WE REDIRECT TO A DUMMY DESTINATION BECAUSE EJS SCRIPT TAGS DO NOT WORK WITH REDIRECT, THEY HAVE TO BE INVOKED BY RES.RENDER
      res.redirect("/appointmentHistory");
    }
  });
});

app.post("/deleteClinicDataAppointment/:appId", (req, res) => {
  console.log("Param is: " + req.params.appId);

  CountedAppointment.deleteOne({_id: req.params.appId}, function(err, success) {
    if(err) {
      console.log(err);
    } else {
      console.log("Deleetd successfully by Admin from Clinic Data!");
      // WE REDIRECT TO A DUMMY DESTINATION BECAUSE EJS SCRIPT TAGS DO NOT WORK WITH REDIRECT, THEY HAVE TO BE INVOKED BY RES.RENDER
      res.redirect("/clinicData");
    }
  });
});

app.post("/deleteAdminCountedAppointment/:appId", function(req, res) {
  console.log("Param is: " + req.params.appId);

  CountedAppointment.deleteOne({_id: req.params.appId}, function(err, success) {
    if(err) {
      console.log(err);
    } else {
      console.log("Deleetd successfully by Admin!");
      // WE REDIRECT TO A DUMMY DESTINATION BECAUSE EJS SCRIPT TAGS DO NOT WORK WITH REDIRECT, THEY HAVE TO BE INVOKED BY RES.RENDER
      res.redirect("/finance/today");
    }
  });
});

app.post("/deleteAdminAppointment/:appId", function(req, res) {
  console.log("Param is: " + req.params.appId);

  Appointment.deleteOne({_id: req.params.appId}, function(err, success) {
    if(err) {
      console.log(err);
    } else {
      console.log("Deleetd successfully by Admin!");
      // WE REDIRECT TO A DUMMY DESTINATION BECAUSE EJS SCRIPT TAGS DO NOT WORK WITH REDIRECT, THEY HAVE TO BE INVOKED BY RES.RENDER
      res.redirect("/appointments");
    }
  });
});

// DUMMY ROUTE TO SHOW THE SWEETALERT POPUP MESSAGE
app.get("/t", function(req, res) {
  Appointment.find({patientId: req.user.id}, function(err, found){
    if (err) {
      console.log(err);
    } else {
      res.render("viewAppointmentHistory", {
        tmp: "none",
        name: req.user.name,
        newAppointments: found
      });
    }
  });
});

function changeActiveStatus (uname) {
  User.updateOne({username: uname}, {$set: {active: true}}, function(err, success) {
    if (err) {
      console.log(err);
    } else {
      console.log("Changed through the function successfully!");
    }
  });
};

app.post("/verifyAccount", function(req, res) {
  console.log(req.body);
  // FIRST FIND THE USER THEN COMPARE THE CODE
  if (req.body.button === "Verify") {
    User.findOne({username: req.body.username}, function(err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        console.log(foundUser.verificationCode);
        if (foundUser.verificationCode === req.body.code) {
          changeActiveStatus(req.body.username);
          console.log("User Authorized" +foundUser.active);
          // res.render("loggedInUser");
          res.redirect("/login");
        } else {
          console.log("Wrong Code");
        }
      }
    });
  } else {
    // RESEND THE CODE
    User.findOne({username: req.body.username}, function(err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        sendNodeMailer(req.body.username, foundUser.verificationCode);
        res.render("verifyAccount", {
          username: req.body.username
        });
      }
    });
  }
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/clinicData", function(req, res) {
  // LOAD COUNTED APPS AND SEND IT TO THE PAGE
  if (req.user && req.user.type === "admin"){
    CountedAppointment.find({}, function(err, foundApps) {
      if(err) {
        console.log(err);
      } else {
        console.log("Found The Apps!");
        res.render("clinicData", {
          appArray: foundApps
        });
      }
    });
  } else {
    res.redirect('/login');
  }

});

app.post("/clinicData", function(req, res) {
  console.log(req.body);
});

app.get("/finance/today", function(req, res) {

  // Get today's date
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;
  
  CountedAppointment.find({date: today}, function(err, found) {
    if(err) {
      console.log(err);
    } else {
      res.render("todayAppointments", {
        apps: found
      })
    }
  });
});

app.post("/finance/today", (req, res) => {
  // console.log(req.body);

  CountedAppointment.findOne({_id: req.body.buttonDetails}, function(err, found) {
    if(err) {
      console.log(err);
    } else {
      // console.log("Found the app to show details");
      res.render("clinicDataDetails", {
        app: found
      });
    }
  });
});

app.post("/updateData", (req, res) => {
  console.log(req.body);

  // Update the desired appointment
  CountedAppointment.updateOne({_id: req.body.updateDetails},
    {$set: {
      time: req.body.updateTime,
      date: req.body.updateDate,
      age: req.body.updateAge,
      phone: req.body.updatePhone,
      patientName: req.body.updatePatientName,
      doctor: req.body.updateDoctor,
      condition: req.body.updateCondition,
      fee: req.body.updateFee
    }}, function(err, updated) {
    if(err) {
      console.log(err);
    } else {
      console.log("3azamaaaa");
      res.redirect("/clinicData");
    }
  });
});

app.get("/editAppointment/:appId", function(req, res) {

  console.log(req.body);

  Appointment.findOne({_id: req.params.appId}, function(err, foundApp){
    if(err) {
      console.log(err);
    } else {
      res.render("editAppointment", {
        name: foundApp.patientName,
        age: foundApp.age,
        phone: foundApp.phone,
        drName: foundApp.doctor,
        condition: foundApp.condition,
        date: foundApp.date,
        appId: req.params.appId
      });
    }
  });

  // console.log(req.params.appId);
});

app.post("/editAppointment", function(req, res) {
  console.log(req.body);

  res.redirect("/editChooseTime?parAppId=" + req.body.appId + "&parPatientName=" + req.body.patientName
               + "&parAge=" + req.body.age + "&parPhone=" + req.body.phone
               + "&parDrName=" + req.body.drName + "&parCondition=" + req.body.condition
               + "&parDate=" + req.body.appointmentDate);
});

app.get("/editChooseTime", function(req, res) {
  // console.log(req.query.parAppId);

  let arr = [];

  Appointment.find({date: req.query.parDate, doctor: req.query.parDrName}, function(err, found) {
    if(err) {
      console.log(err);
    } else {
      console.log("Found Them Right: " + found.length);
      for(var i = 0;i < found.length; i++) {
        arr.push(found[i].time);
      }

      Appointment.findOne({_id: req.query.parAppId}, function(err, found) {
        if(err) {
          console.log(err);
        } else {
          console.log(arr);
          res.render("editChooseTime", {
            appointmentDate: req.query.parDate,
            age: req.query.parAge,
            phone: req.query.parPhone,
            drName: req.query.parDrName,
            condition: req.query.parCondition,
            patientName: req.query.parPatientName,
            time: found.time,
            tmpArray: arr,
            id: req.query.parAppId
          });
        }
      });
    }

  });
});

app.post("/editChooseTime/:appId", function(req, res) {
  console.log(req.body);

  Appointment.updateOne({_id: req.body.appId}, {
    $set: {
      time: req.body.appointmentTime,
      date: req.body.appointmentDate
    }
  }, function(err, updated) {
    if(err) {
      console.log(err);
    } else {
      console.log("3azamaaaa");
      res.redirect("/appointments");
    }
  });
});

app.get("/availableTimeDoctor", (req, res) => {
  if(req.user && req.user.type === "admin") {
    res.render("availableTimeDoctor");
  } else {
    res.redirect("/login");
  }
});

app.post("/availableTimeDoctor", (req, res) => {
  try {
    let arr = [];

  Appointment.find({date: req.body.date, doctor: req.body.drName}, function(err, found) {
    if(err) {
      console.log(err);
    } else {
      console.log("Found Them Right: " + found.length);
      for(var i = 0;i < found.length; i++) {
        arr.push(found[i].time);
      }

      res.render("availableTimes", {
        tmpArray: arr
      });
    }

  });
  } catch (error) {
    console.log(error);
    res.redirect("/adminHome");
  }
});

app.get("/finance", function(req, res) {
  if (req.user) {

    let tot = 0, day = 0;

    // Get the today date to query with it
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;

    // GET THE TOTAL REVENUE FOR THE CLINIC
    CountedAppointment.find({}, function(err, found) {
      if(err) {
        console.log(err);
      } else {
        // let total = 0;
        found.forEach(function(app, i) {
          tot += parseFloat(app.fee);
          if(app.date === today) {
            day += parseFloat(app.fee);
          }
        });

        res.render("finance", {
          fee: tot,
          todayFee: day
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/updateFees", function(req, res) {

  /********* Find The conditions and fees for the doctors and send it as parameter **********/
  Fee.find({}, function(err, foundFees){
    if (err) {
      console.log(err);
    } else {
      res.render("updateFees", {
        tableData: foundFees
      });
    }
  });

  // res.render("finance");
});

app.post("/updateFees", function(req, res) {
  console.log(req.body);
});

app.get("/adminHome", function(req, res) {
  if (req.user && req.user.type === "admin") {
    res.render("adminHome");
  } else {
    res.redirect('/login');
  }
});

app.get("/appointments", function(req, res) {
  if(req.user && req.user.type === "admin") {

    let tmp = new Date();
    var dd = String(tmp.getDate()).padStart(2, '0');
    var mm = String(tmp.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = tmp.getFullYear();

    tmp = yyyy + "-" + mm + "-" + dd;
    // console.log(tmp);

    Appointment.find({}, function(err, apps) {
      if (err) {
        console.log(err);
      } else {
        res.render("appointments", {
          newAppointments: apps,
          sendPatientName: "",
          sendDrName: "",
          sendTime: "",
          sendDate: "",
          todayValue: ""
        });
      }
    });
  } else {
    res.redirect("/login");
  }

  //res.render("appointments");
});

app.post("/appointments", function(req, res) {

  console.log(req.body);

  var args = {};

  const recievedTime = req.body.time;
  const recievedDate = req.body.date;
  const recievedPatientName = req.body.patientName;
  const recievedDrName = req.body.drName;
  const todayFilter = req.body.today;

  //*******All possibilities for parameters******/
  if (recievedTime !== "" &&
  recievedDate !== "" &&
  recievedPatientName !== "" &&
  recievedDrName !== "") {
    // console.log("All data is recieved!");

    args = {
      date: recievedDate,
       time: recievedTime,
        patientName: recievedPatientName,
         doctor: recievedDrName
        };

  } else if (recievedTime !== "" &&
  recievedDate !== "" &&
  recievedPatientName !== "" &&
  recievedDrName === "") {
   args = {
    date: recievedDate,
    time: recievedTime,
    patientName: recievedPatientName
   };
  } else if (recievedTime !== "" &&
  recievedDate !== "" &&
  recievedPatientName === "" &&
  recievedDrName === "") {
    args = {
      date: recievedDate,
      time: recievedTime
    };
  } else if (recievedTime !== "" &&
  recievedDate === "" &&
  recievedPatientName === "" &&
  recievedDrName === "") {
   args = {
    time: recievedTime
   };
  } else if (recievedTime === "" &&
  recievedDate !== "" &&
  recievedPatientName === "" &&
  recievedDrName === "") {
   args = {
    date: recievedDate
   };
  } else if (recievedTime === "" &&
  recievedDate === "" &&
  recievedPatientName !== "" &&
  recievedDrName === "") {
    args = {
      patientName: recievedPatientName
    };
  } else if (recievedTime === "" &&
  recievedDate === "" &&
  recievedPatientName === "" &&
  recievedDrName !== "") {
    args = {
      doctor: recievedDrName
    };
  } else if (recievedTime !== "" &&
  recievedDate === "" &&
  recievedPatientName !== "" &&
  recievedDrName !== "") {
    args = {
      time: recievedTime,
      patientName: recievedPatientName,
      doctor: recievedDrName
    };
  } else if (recievedTime !== "" &&
  recievedDate === "" &&
  recievedPatientName === "" &&
  recievedDrName !== "") {
    args = {
      time: recievedTime,
      doctor: recievedDrName
    };
  } else if (recievedTime !== "" &&
  recievedDate === "" &&
  recievedPatientName !== "" &&
  recievedDrName === "") {
   args = {
    time: recievedTime,
    patientName: recievedPatientName
   };
  } else if (recievedTime !== "" &&
  recievedDate !== "" &&
  recievedPatientName === "" &&
  recievedDrName !== "") {
    args = {
      time: recievedTime,
      date: recievedDate,
      doctor: recievedDrName
    };
  } else if (recievedTime === "" &&
  recievedDate !== "" &&
  recievedPatientName !== "" &&
  recievedDrName === "") {
    args = {
      date: recievedDate,
      patientName: recievedPatientName
    };
  } else if (recievedTime === "" &&
  recievedDate !== "" &&
  recievedPatientName === "" &&
  recievedDrName !== "") {
   args = {
    date: recievedDate,
    doctor: recievedDrName
   };
  } else if (recievedTime === "" &&
  recievedDate === "" &&
  recievedPatientName !== "" &&
  recievedDrName !== "") {
  args = {
    patientName: recievedPatientName,
    doctor: recievedDrName
  };
  } else if (recievedTime === "" &&
  recievedDate !== "" &&
  recievedPatientName !== "" &&
  recievedDrName !== "") {
    args = {
      date: recievedDate,
      patientName: recievedPatientName,
      doctor: recievedDrName
    };
  }

  Appointment.find(args, function(err, apps) {
    if (err) {
      console.log(err);
    } else {
      res.render("appointments", {
        newAppointments: apps,
        sendTime: recievedTime,
        sendDate: recievedDate,
        sendPatientName: recievedPatientName,
        sendDrName: recievedDrName
      });
    }
  })

});

app.get("/adminNewAppointment", function(req, res) {
  res.render("adminNewAppointment");
});

app.post("/adminNewAppointment", function(req, res) {
  console.log(req.body);
  //FIND THE FEE
  Fee.findOne({drName: req.body.drName, condition: req.body.condition}, function(err, foundFee) {
    if(err) {
      // throw(err);
      console.log(err);
    } else {
      // console.log(foundFee.fee);

      // CREATE AND SAVE THE APPOINTMENT INTO THE COUNTED APPOINTMENTS RIGHT AWAY
      const cApp = new CountedAppointment({
        time: req.body.appointmentTime,
        date: req.body.appointmentDate,
        phone: req.body.phone,
        age: req.body.age,
        patientName: req.body.patientName,
        doctor: req.body.drName,
        condition: req.body.condition,
        patientId: "admin",
        patientUsername: "admin",
        fee: foundFee.fee
      });

      cApp.save(function(err, success) {
        if(err) {
          console.log(err);
        } else {
          console.log("Saved the Appointment successfully by the user");
        }
      });
    }
  });

  res.redirect("/appointments");
});

app.get("/doctorSignIn", function(req, res) {
  res.render("doctorSignIn");
});

app.post("/none", function(req, res) {
  console.log(req.body);

  // FIND THE APPOINTMENT THAT WAS CLICKED
  Appointment.findOne({_id: req.body.appointmentId}, function(err, foundApp) {
    if (foundApp) {
      // console.log(foundApp);
      res.render("newAppointmentAttended", {
        name: foundApp.patientName,
        phone: foundApp.phone,
        age: foundApp.age,
        date: foundApp.date,
        time: foundApp.time,
        drName: foundApp.doctor,
        condition: foundApp.condition,
        username: foundApp.patientUsername,
        pId: foundApp.patientId,
        fee: foundApp.fee
      });
    } else {
      console.log("Not found!!");
    }
  });
});

app.post("/newAppointmentAttended", function(req, res) {
  console.log(req.body);

  const cApp = new CountedAppointment({
    time: req.body.appointmentTime,
    date: req.body.appointmentDate,
    patientId: req.body.patientId,
    age: req.body.age,
    phone: req.body.phone,
    patientName: req.body.patientName,
    patientUsername: req.body.username,
    doctor: req.body.drName,
    condition: req.body.condition,
    fee: req.body.fee
  });

  cApp.save(function(err, success) {
    if(err) {
      console.log(err);
    } else {
      console.log("Saved it Horayyyy!");
      res.redirect("/appointments");
    }
  })
})

app.get("/appointmentHistory", function(req, res) {
  if(req.user) {
    Appointment.find({patientId: req.user.id}, function(err, found){
      if (err) {
        console.log(err);
      } else {
        res.render("viewAppointmentHistory", {
          name: req.user.name,
          newAppointments: found
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/newAppointment", function(req, res) {
  res.render("newAppointment", {
    phone: req.body.phone
  });
});

app.get("/staff", function(req, res) {
  if (req.user) {
    res.render("staff", {
      name: req.user.name
    });
  } else{ 
    res.render("staff");
  }
});

app.post("/newAppointment", function(req, res) {
  
  // FIND THE FEE
  Fee.findOne({drName: req.body.drName, condition: req.body.condition}, function(err, foundFee) {
    if(err){
      console.log(err);
    } else {
      console.log(req.body);
      // SAVE THE APPOINTMENT TO THE COUNTED APPOINTMENTS IN DATABASE AS THE PATIENT ALREADY CAME
      const countedApp = new CountedAppointment({
        time: req.body.appointmentTime,
        date: req.body.appointmentDate,
        patientId: req.body.patientId,
        age: req.body.age,
        phone: req.body.phone,
        doctor: req.body.drName,
        patientUsername: req.body.username,
        condition: req.body.condition,
        patientName: req.body.patientName,
        fee: foundFee.fee
      });

      countedApp.save(function(err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log("Saved the counted appointment successfully!");
        }
      });

      res.redirect("/adminHome");
      // console.log("Found the fee and it is: " + foundFee.fee);
      // res.render("viewFeeAndConfirm", {
      //   fee: foundFee.fee
      // });
    }
  })

  // SAVE THE USER DATA WHETHER HE/SHE IS A NEW USER OR NOT
  // User.findOrCreate({name: req.body.patientName, age: req.body.age, phone: req.body.phone}, function(err) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log("Saved Successfully The new user!");
  //   }
  // });

  // SAVE THE APPOINTMENT
  // const countedApp = new CountedAppointment({
  //   time: req.body.appointmentTime,
  //   date: req.body.appointmentDate,
  //   age: req.body.age,
  //   phone: req.body.phone,
  //   patientName: req.body.patientName,
  //   doctor: req.body.drName
  // });

  // countedApp.save(function(err, result) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log("Saved the counted appointment successfully!");
  //   }
  // });
});

// DOCTORS APPOINTMENTS
app.get("/drAhmedAppointment", (req, res) => {
  if(req.user) {
    res.render("drAhmedAppointment", {
      name: req.user.name,
      age: req.user.age,
      phone: req.user.phone
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/drAhmedAppointment", (req, res) => {
  res.redirect("/chooseTime/" + req.body.appointmentDate + "?parPatientName=" + req.body.patientName +
   "&parAge=" + req.body.age + "&parPhone=" + req.body.phone +
   "&parDrName=Dr. Ahmed Atef&parCondition=" + req.body.condition + 
   "&parAppointmentDate=" + req.body.appointmentDate);
});

app.get("/drIsmailAppointment", (req, res) => {
  if(req.user) {
    res.render("drIsmailAppointment", {
      name: req.user.name,
      age: req.user.age,
      phone: req.user.phone
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/drIsmailAppointment", (req, res) => {
  console.log(req.body);
  res.redirect("/chooseTime/" + req.body.appointmentDate + "?parPatientName=" + req.body.patientName +
   "&parAge=" + req.body.age + "&parPhone=" + req.body.phone +
   "&parDrName=Dr. Ismail Tawfik&parCondition=" + req.body.condition + 
   "&parAppointmentDate=" + req.body.appointmentDate);
});

app.get("/drAtefAppointment", (req, res) => {
  if(req.user) {
    res.render("drAtefAppointment", {
      name: req.user.name,
      age: req.user.age,
      phone: req.user.phone
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/drAtefAppointment", (req, res) => {
  console.log(req.body);

  res.redirect("/chooseTime/" + req.body.appointmentDate + "?parPatientName=" + req.body.patientName +
   "&parAge=" + req.body.age + "&parPhone=" + req.body.phone +
   "&parDrName=Dr. Atef Aboulsoud&parCondition=" + req.body.condition + 
   "&parAppointmentDate=" + req.body.appointmentDate);
});

app.get("/drMervatAppointment", (req, res) => {
  if(req.user) {
    res.render("drMervatAppointment", {
      name: req.user.name,
      age: req.user.age,
      phone: req.user.phone
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/drMervatAppointment", (req, res) => {
  console.log(req.body);

  res.redirect("/chooseTime/" + req.body.appointmentDate + "?parPatientName=" + req.body.patientName +
   "&parAge=" + req.body.age + "&parPhone=" + req.body.phone +
   "&parDrName=Dr. Mervat Kabil&parCondition=" + req.body.condition + 
   "&parAppointmentDate=" + req.body.appointmentDate);
});

app.get("/adminPhoneReservation", (req, res) => {
  if(req.user && req.user.type === "admin") {
    res.render("adminPhoneReservation");
  } else {
    res.redirect("/login");
  }
});

app.post("/adminPhoneReservation", (req, res) => {
  // console.log(req.body);

  let arr = [];
  Appointment.find({doctor: req.body.drName, date: req.body.appointmentDate}, (err, found) => {
    if(err) {
      console.log(err)
    }
    else {
      console.log("entered The else with: " + found.length );
      for(var i = 0;i < found.length; i++) {
        arr.push(found[i].time);
        console.log("Entered The Loop");
      }
      const args = {
        patientName: req.body.patientName,
        age: req.body.age,
        phone: req.body.phone,
        drName: req.body.drName,
        condition: req.body.condition,
        appointmentDate: req.body.appointmentDate,
        tmpArray: arr
      }

      res.render("adminChooseTime", args);
    }
  });
});

app.post("/adminChooseTime", (req, res) => {
  console.log(req.body);

  Fee.findOne({drName: req.body.drName, condition: req.body.condition}, (err, foundFee) => {
    if(err) {
      console.log(err);
    } else {
      // CREATE THE APPOINTMENT AND SAVE IT
      const app = new Appointment({
        time: req.body.appointmentTime,
        date: req.body.appointmentDate,
        patientId: "admin",
        age: req.body.age,
        phone: req.body.phone,
        patientName: req.body.patientName,
        doctor: req.body.drName,
        condition: req.body.condition,
        patientUsername: "admin",
        fee: foundFee.fee
      });

      app.save( (err, success) => {
        if(err) {
          console.log(err);
        } else {
          console.log("Saved The Phone Reservation Successfully");
          res.redirect("/appointments");
        }
      });
    }
  })
});

app.get("/reservation", function(req, res) {
  if(req.user) {
    res.render("reservation", {
      phone: req.user.phone,
      name: req.user.name,
      age: req.user.age
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/reservation", function(req, res) {

  res.redirect("/chooseTime/" + req.body.appointmentDate + "?parPatientName=" + req.body.patientName +
   "&parAge=" + req.body.age + "&parPhone=" + req.body.phone + 
   "&parDrName=" + req.body.drName + "&parCondition=" + req.body.condition + 
   "&parAppointmentDate=" + req.body.appointmentDate);

  // // GET THE CREDENTIALS OF THE USER IN ORDER TO SAVE IT INTO THE APPOINTMENT
  //  User.findOne({"_id": new mongoose.mongo.ObjectID(req.user.id)}, function(err, foundUser) {
  //    if(err) {
  //      console.log(err);
  //    } else {
  //      console.log("The username of the user is: " + foundUser.username);
  //     //  CREATE AN APPOINTMENT OBJECT IN ORDER TO SAVE IT
  //      const app = new Appointment({
  //        time: req.body.appointmentTime,
  //        date: req.body.appointmentDate,
  //        patientId: req.user.id,
  //        age: req.body.age,
  //        phone: req.body.phone,
  //        patientName: req.body.patientName,
  //        doctor: req.body.drName,
  //        condition: req.body.condition,
  //        patientUsername: req.user.username
  //      });
  //     //  THE ACTUAL FUNCTION THAT SAVES THE APPOINTMENT TO THE DATABASE
  //      app.save(function(err, result) {
  //        if (err) {
  //          console.log(err);
  //        } else {
  //          console.log("Saved the appointment! with id of: " + result._id);
  //         //  res.redirect("/loggedInUser");
  //         Fee.findOne({drName: req.body.drName, condition: req.body.condition}, function(err, foundFee) {
  //           if (err) {
  //             console.log(err);
  //           } else {
  //             console.log("Found the fee successfully! Which is: " + foundFee.fee);
  //             res.render("confirmReservation", {
  //               name: req.user.name,
  //               fee: foundFee.fee,
  //               appointmentId: result._id
  //             });
  //           }
  //         });
  //        }
  //      });
  //    }
  //  });


  // // FIND THE FEE OF THE CHOSEN APPOINTMENT
  // Fee.findOne({drName: req.body.drName, condition: req.body.condition}, function(err, foundFee) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log("Found the fee successfully! Which is: " + foundFee.fee);
  //   }
  // });
});

app.get("/confirmReservation", function(req, res){
  res.render("confirmReservation", {
    name: req.user.name
  });
})

app.post("/confirmReservation", function(req, res) {
  res.redirect("/loggedInUser");
});

app.get("/patientPhoneNumber", function(req, res) {
  res.render("patientPhoneNumber");
});

app.post("/patientPhoneNumber", function(req, res) {
  User.findOne({phone: req.body.phone}, function(err, foundUser) {
    if (foundUser) {
      sendAge = foundUser.age;
      sendName = foundUser.name;
      res.render("reservation", {
        phone: req.body.phone,
        age: foundUser.age,
        name: foundUser.name
      });
    } else {
        res.render("reservation", {
        phone: req.body.phone,
        age: "",
        name: ""
      });
    }
  });
});

app.get("/phoneNumber", function(req, res) {
  res.render("phoneNumber");
});

app.post("/phoneNumber", function(req, res) {
  console.log(req.body);

  User.findOne({phone: req.body.phone}, function(err, foundUser) {
    if (foundUser) {
      sendAge = foundUser.age;
      sendName = foundUser.name;
      res.render("newAppointment", {
        phone: req.body.phone,
        age: foundUser.age,
        name: foundUser.name
      });
    } else {
        res.render("newAppointment", {
        phone: req.body.phone,
        age: "",
        name: ""
      });
    }
  });

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Started Listenning on port " + port);
});
