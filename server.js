const express = require("express");
const app = express();
const server = require('http').Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
require('dotenv').config()
const port = process.env.PORT || 5000;

const cors = require('cors');
const corsOptions ={
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
}
app.use(cors(corsOptions));

app.use(express.json());
// Для парсинга application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// Абсолютный путь к папке с картинками
app.use("/static", express.static(__dirname + "/assets"));


//роуты
app.use("/api/auth", require("./routes/client-auth"));

//массив с юзерами
let users = []
// массив с картами
let dataCards = [{
    imgSrc: "1.png",
    name: "1",
    id: 1,
    isToggle: false
  },
  {
    imgSrc: "3.png",
    name: "3",
    id: 2,
    isToggle: false
  },
  {
    imgSrc: "2.png",
    name: "2",
    id: 3,
    isToggle: false
  },
  {
    imgSrc: "4.png",
    name: "4",
    id: 4,
    isToggle: false
  },
  {
    imgSrc: "5.png",
    name: "5",
    id: 5,
    isToggle: false
  },
  {
    imgSrc: "6.png",
    name: "6",
    id: 6,
    isToggle: false
  },
  {
    imgSrc: "2.png",
    name: "2",
    id: 7,
    isToggle: false
  },
  {
    imgSrc: "1.png",
    name: "1",
    id: 8,
    isToggle: false
  },
  {
    imgSrc: "3.png",
    name: "3",
    id: 9,
    isToggle: false
  },
  {
    imgSrc: "5.png",
    name: "5",
    id: 10,
    isToggle: false
  },
  {
    imgSrc: "6.png",
    name: "6",
    id: 11,
    isToggle: false
  },
  {
    imgSrc: "4.png",
    name: "4",
    id: 12,
    isToggle: false
  }
]

// подключение к сокету
io.on('connection', (socket) => {
  console.log('a user connected ' + socket.id);

  socket.on('message', (message) => {
    console.log(message);
  });



  //подключение пользователя
  socket.on('create', function (data, login, callback) {   
    console.log(data)
    users.push({
      id: data.id,
      login:login.login,
      socket: socket.id,
      status: false,
      appponent: {
        id: 2,
        socket: ""
      }
    })

    //обновление списка пользователей
    io.emit('update', { users: users });

    callback({
      status: 200,
      socket: socket.id
      
        })
    
// callback({
//   users: users,
//       data: dataCards
//     })
  });

  // открытие карточки

  socket.on('flip', function(data, apponentToken, myStep, callback) {
    console.log(data)
console.log(myStep.myStep)
    io.to(apponentToken.apponentToken).emit('flip', {
      id: data.id,
       myStep: myStep.myStep
     });
callback({
  status: "ok"
    })
  });

//запрос на игру
   socket.on('sendGame', function(data, id, tokenFirst, callback) {
    console.log(data)
    console.log(id)
     users = users.map(el => {
       if (el.id == id.id) {
         el.status = true
         return el
       } else {
        return el
       }
     })
     users = users.map(el => {
       if (el.socket == data.tokenUser) {
         el.status = true
         return el
       } else {
         return el
       }
     })
io.emit('update', {
  users: users
});
     
     io.to(data.tokenUser).emit('sendGame', {
       apponentToken: tokenFirst.tokenFirst,
       statusGame: 'ready'
     });
callback({
  status: "ok"
    })
   });


   //отмена игры

 socket.on('cancelReady', function(socket, id, callback) {
   
    console.log(id)
     users = users.map(el => {
       if (el.id == id.id) {
         el.status = false
         return el
       } else {
        return el
       }
     })
     users = users.map(el => {
       if (el.socket == socket.socket) {
         el.status = false
         return el
       } else {
         return el
       }
     })
io.emit('update', {
  users: users
});
     
     io.to(socket.socket).emit('cancelReady', {
       
       statusGame: 'cancel'
     });
callback({
  status: "ok"
    })
   });
   
// конец игры
socket.on('endGame', function(id, token, status, callback) {

  console.log(id)
     console.log(token)
     users = users.map(el => {
       if (el.id == id.id) {
         el.status = false
         return el
       } else {
        return el
       }
     })
users = users.map(el => {
       if (el.socket == token.apponentToken) {
         el.status = false
         return el
       } else {
        return el
       }
     })

     
io.emit('update', {
  users: users
});
     
     io.to(token.apponentToken).emit('endGame', {
       
       statusGame: status.status
     });
callback({
  status: "ok"
    })
});


// начало игры
socket.on('startGame', function(data, id, tokenMy, callback) {
    console.log(data)
    console.log(id)
     users = users.map(el => {
       if (el.id == id.id) {
         el.status = true
         return el
       } else {
        return el
       }
     })
io.emit('update', {
  users: users
});

// дублируем массив с картами и перемешиваем
  let newArray = [...dataCards]

  function shuffle(arr) {
    let newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]]; 
    }
    return newArr;
}

newArray = shuffle(newArray)
     
     io.to(data.tokenFirstGame).emit('startGame', {
      myStep: false,
       statusGame: 'game',
       data: newArray
     });
   io.to(tokenMy.tokenMy).emit('startGame', {
      myStep: true,
     statusGame: 'game',
       data: newArray
     });
     
callback({
  status: "ok"
    })
   });
   

// разъдиненеие
    socket.on('disconnect', function () {
      console.log('разъединился: ', socket.id);
  
      users = users.filter(el => el.socket !== socket.id)
   io.emit('update', {
     users: users
   });
    console.log(users);
  });
  
});

server.listen(port, () => {
  console.log(`App listening on port ${port}`);

  });





