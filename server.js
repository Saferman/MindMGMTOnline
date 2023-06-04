const express = require('express');
const http = require('http');
const socket = require('socket.io');
const schedule = require('node-schedule');

const hostname = '0.0.0.0';
const port = process.env.PORT || 8080

var app = express();
const server = http.createServer(app)
const io = socket(server)
var players;
var joined = true;
var onlineUsers = 0;


/**更新在线用户数量 */
// online user 定时器
// 定义规则
let rule = new schedule.RecurrenceRule();
rule.minute = [0,5,10,15,20,25,30,35,40,45,50,55];

function generateRandomNumber() {
    
    var mean = 40; // 平均值
    var standardDeviation = 10; // 标准差
  
    var x = Math.random() * 2 - 1;
    var y = Math.random() * 2 - 1;
    var radiusSquared = x * x + y * y;
  
    // 排除范围在 (0, 1) 之外的点
    while (radiusSquared >= 1 || radiusSquared === 0) {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      radiusSquared = x * x + y * y;
    }
  
    var multiplier = Math.sqrt(-2 * Math.log(radiusSquared) / radiusSquared);
    var gaussianNumber = x * multiplier;
  
    // 将正态分布转换为范围为 20-60 的整数
    var randomNumber = Math.round(mean + standardDeviation * gaussianNumber);
  
    // 确保结果在范围内
    randomNumber = Math.max(20, Math.min(60, randomNumber));
  
    return randomNumber;
  }
  
// 启动任务
let job = schedule.scheduleJob(rule, () => {
    console.log('更新在线用户数量', new Date());
    onlineUsers = generateRandomNumber()
  });

console.log('更新在线用户数量', new Date());
onlineUsers = generateRandomNumber()

/**正式内容 */

app.use(express.static(__dirname + "/"));

// 最大支持game数
var games = Array(100);
for (let i = 0; i < 100; i++) {
    games[i] = {players: 0 , pid: [0 , 0],exist_role:""}; // pid 设置为客户端用户id，即playerId
}//exist_role只保存pid一个角色的身份
// 角色
var roleArray = ["agent","recruiter"];


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/game', (req, res) => {
    console.log("请求/game")
    res.sendFile(__dirname + '/game.html');
});

io.on('connection', function (socket) {
    onlineUsers++;
    io.sockets.emit('onlineUsers', { onlineUsers: onlineUsers });

    // console.log(players);
    var role; // 标识身份
    var game_over = false; 
    var playerId =  Math.floor((Math.random() * 100) + 1); // 随机数，客户端用户id
    
    console.log("Client " +playerId + '(browser) connected');

    socket.on('joined', function (roomId) {
        if(!(roomId in games)){
            return;
        }
        // games[roomId] = {}
        console.log("RoomId:",roomId);
        if (games[roomId].players < 2) {
            games[roomId].players++;
            games[roomId].pid[games[roomId].players - 1] = playerId;
        }
        else{
            socket.emit('full', roomId)
            console.log("The room is full:");
            console.log(games[roomId]);
            return;
        }
        
        console.log(games[roomId]);
        players = games[roomId].players
        
        // 如果第一位玩家断线，然后重连两个人都是招募者！这个Bug以后解决
        // 默认客户端的logic.js逻辑是第二个连接的人发送playstart消息，并设置自己为招募者，同时执行相关操作
        // 新逻辑要求第三个角色无法进入房间
        if(games[roomId].exist_role == ""){
            //第一个玩家身份随机分配
            role = roleArray[Math.floor(Math.random()*roleArray.length)];
            games[roomId].exist_role = role
        }else{
            if(games[roomId].exist_role == "agent"){role = "recruiter";}
            else{role = "agent";}
        }

        socket.emit('player', { playerId, players, role, roomId })
        // players--;
  
    });

    // 第二位玩家加入成功后会发送playstart消息，随机生成地图障碍物，并通知所有玩家客户端准备开始游戏
    socket.on('playstart', function (rmid) {
        // msg为房间号
        // 随机摆放地图障碍物
        var map_obstacle = {};
        var node_with_edge = new Array(); 
        while(Object.keys(map_obstacle).length < 5){
            var node_key = Math.floor(Math.random()*25);
            var direction = Math.floor(Math.random()*4);// 0 1 2 3 上左下右
            //判断这个点是否已经有边被选择了
            if(node_with_edge.includes(node_key))continue;
            //判断选择的边另一个顶点是否有边被选择
            var other_node = -1;
            if(direction == 0 && (node_key - 5)>=0){
                if(node_with_edge.includes(node_key-5))continue;
                other_node = (node_key-5);
            }
            if(direction == 1 && (node_key%5 != 0)){
                if(node_with_edge.includes(node_key-1))continue;
                other_node = node_key-1;
            }
            if(direction == 2 && (node_key + 5)<25){
                if(node_with_edge.includes(node_key+5))continue;
                other_node = node_key+5;
            }
            if(direction == 3 && ((node_key+1)%5 != 0)){
                if(node_with_edge.includes(node_key+1))continue;
                other_node = node_key+1;
            }
            
            //添加
            // console.log(typeof(node_key));//number
            console.log("Add "+node_key," other_node: "+other_node,"  exist:",node_with_edge);
            map_obstacle[node_key] = direction;
            node_with_edge.push(node_key);
            if(other_node!=-1)node_with_edge.push(other_node);
        }
        console.log("map:",map_obstacle);
        io.emit('playstart', {rmid,map_obstacle});// 发送给所有客户端包括sender
        console.log("room " + rmid + " is starting to play game");
    });

    socket.on('disconnect', function () {
        onlineUsers--;
        io.sockets.emit('onlineUsers', { onlineUsers: onlineUsers });

        var roomId = -1;
        for (let i = 0; i < 100; i++) {
            if (games[i].pid[0] == playerId || games[i].pid[1] == playerId){   
                roomId = i  
                games[i].players--;
                // 仅仅一名玩家退出
                if(games[i].pid[0] == playerId && games[i].players > 0){
                    games[i].pid[0] = games[i].pid[1]; 
                    if(games[roomId].exist_role == "agent"){games[roomId].exist_role = "recruiter";}
                    else{games[roomId].exist_role = "agent";}
                }
                // 所以玩家退出时候
                if(games[i].players == 0){
                    games[roomId].exist_role = "";
                }
            } 
        }
        console.log(playerId + ' disconnected');
        if(!game_over){ //如果是游戏结束后客户端断开连接就不发送该消息
            console.log('发送了otherdisconnected消息');
            socket.broadcast.emit('otherdisconnected',roomId);
        }
    }); 


    socket.on('InitAgent', function (msg) {
        console.log("InitAgent");
        socket.broadcast.emit('InitAgent', msg);
    });
    

    socket.on('inquireMessageFromAgent',function(msg){
        console.log("发送inquireMessageFromAgent消息:",msg);
        socket.broadcast.emit('inquireMessageFromAgent', msg);
    });

    socket.on("display",function(msg){
        console.log("Synchronous display:",msg);
        socket.broadcast.emit('display',msg);
    });
   
    socket.on("RecruiterTurn",function(msg){
        console.log("RecruiterTurn");
        socket.broadcast.emit('RecruiterTurn',msg);
    });
   
    socket.on("AgentTurn",function(msg){
        console.log("AgentTurn",msg);
        socket.broadcast.emit('AgentTurn',msg);
    });
   
    socket.on("GlobalVictory",function(msg){
        game_over = true;
        console.log("[Room "+msg.roomId+" Game over]",msg.statusMsg);
        io.emit('GlobalVictory',msg);
    });

    
});

server.listen(port,hostname,() => {
    console.log(`Server running at http://${hostname}:${port}/`);
    console.log(`Local you can click http://127.0.0.1:${port}/`);
  });