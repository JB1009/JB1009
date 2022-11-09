// const { urlencoded } = require('express');
// const express    = require('express');
// const mysql      = require('mysql');
// const dbconfig   = require('./config/database');
// const connection = mysql.createConnection(dbconfig);

// const app = express();

// // configuration =========================
// app.set('port', process.env.PORT || 3001);

// // app.get('/', (req, res) => {
// //   res.send('Root');
// // });

// // app.get('/users', (req, res) => {
// //   connection.query('SELECT userName from users', (error, rows) => {
// //     if (error) throw error;
// //     console.log('User info is: ', rows);
// //     res.send(rows);
// //   });
// // });

// app.post('/process/join', (req, res) => {
//   console.log('/process/join 호출됨' + req);

//   const paramName = req.body.name;
//   const paramPhone = req.body.phone;
//   const paramEmail = req.body.email;
//   const paramOrders = req.body.orders;

//   app.getConnection((err, conn) => {
//     if (err) {
//       conn.release();
//       console.log('MySQL getConnetion error. aborted');
//       res.writeHead('200', { 'Content-Type': 'text/html/ charset=utf-8' })
//       res.write('<h2>DB 서버 연결 실패</h2>');
//       res.end();
//       return;
//     }

//     console.log("너왜안돼 ㅡㅡ");

//     const exec = conn.query('insert into users (userName, userPhone, userEmail, userOrder) values (?,?,?,?);',
//       [paramName, paramPhone, paramEmail, paramOrders],
//       (err, result) => {
//         conn.release();
//         console.log("실행된 SQL : " + exec.sql)
//         if(err){
//           console.dir(err);
//           res.writeHead('200', {'content-Type': 'text/html; charset=utf-8'});
//           console.log("Inserted fail");
//           res.write("<script>alert('ID가 중복 됐습니다.')</script>");
//           res.write("<script>window.location=\"res.html\"</script>");
//         }

//         if (result) {
//           console.dir(result);
//           console.log("Inserted sucess");
//           res.writeHead('200', {'content-Type': 'text/html; charset=utf-8'});
//           res.write("<script>alert('회원가입 성공! 환영합니다!')</script>");
//           res.write("<script>window.location=\"res.html\"</script>");
//         }
//       }
//     )
//   });
// });

// app.listen(app.get('port'), () => {
//   console.log('Express server listening on port ' + app.get('port'));
// });

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const static = require("serve-static");
const dbconfig = require("./config/database");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: dbconfig.host,
  user: dbconfig.user,
  password: dbconfig.password,
  database: dbconfig.database,
  debug: false,
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", static(path.join(__dirname, "public")));

app.post("/process/index", (req, res) => {
  // console.log("/process/main 호출됨" + req);

  const paramName = req.body.name;
  const paramPhone = req.body.phone;
  const paramEmail = req.body.email;
  const paramOrder = req.body.orders;
  const res_div = req.body.res;
  pool.getConnection((err, conn) => {
    if (err) {
      conn.release();
      console.log("MySQL getConnetion error. aborted");
      res.writeHead("200", { "Content-Type": "text/html/ charset=utf-8" });
      res.write("<h2>MySQL getConnetion error</h2>");
      res.end();
      return;
    }

    console.log("데이터베이스 연결 끊었음");
    // db 데이터 삽입
    const exec = conn.query(
      "insert into users (userName, userPhone, userEmail, userOrder) values (?,?,?,?);",
      [paramName, paramPhone, paramEmail, paramOrder],
      (err, result) => {
        conn.release();
        console.log("실행된 SQL : " + exec.sql);
        if (err) {
          console.log("SQL runtime error");
          console.dir(err);
          res.writeHead("200", { "Content-Type": "text/html/ charset=utf-8" });
          res.write("<h2>SQL runtime error</h2>");
          res.end();
          return;
        }
        // 빈칸일경우
        if (
          paramName == "" ||
          paramPhone == "" ||
          paramEmail == "" ||
          paramOrder == ""
        ) {
          res.writeHead("200", { "content-Type": "text/html; charset=utf-8" });
          // res.write("<script>swal('Good job!', 'You clicked the button!', 'success');</script>");
          res.write(
            '<script>window.location="../public/contact_us.html"</script>'
          );
          conn.query(
            "DELETE FROM users WHERE userName = '' or userPhone = '' or userEmail = '' or userOrder = ''"
          );
          return;
        }
        // 접속 성공 html 연결
        if (result) {
          console.dir(result);
          console.log("Inserted sucess");
          res.writeHead("200", { "content-Type": "text/html; charset=utf-8" });
          // res.write("<script>alert('접수완료')</script>");
          res.write('<script>window.location="../public/main.html"</script>');
          app.get("process/res");
          res.end();
        }
      }
    );
  });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
