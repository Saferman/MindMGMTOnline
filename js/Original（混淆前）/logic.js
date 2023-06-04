var op = new display_operation();
var socket = io();

//连接状态变量
var role = "recruiter"; //角色阵营
var players; // 玩家数量
var roomId;
var waiting = true; //是否需要等待其他玩家
var debug_msg;
var game_over = false;
var debug = false;     //非调试模式需要设置为false
var debug_time = 500; //设置debug期间交互需要的时长 ms
// var play = true;

// var room = document.getElementById("room")
// var roomNumber = document.getElementById("roomNumbers")
// var button = document.getElementById("button")
// var state = document.getElementById('state')

function getAllowedIdRange (start, end) {
    return Array.from(new Array(end + 1).keys()).toString().split(",").slice(start)
}

var join = function(){
    var qs = getQueryParams(document.location.search);
    console.log("允许的房间号：",getAllowedIdRange(0,99))
    // alert(qs.id);
    if((qs.id!=undefined)&&(getAllowedIdRange(0,99)).includes(qs.id)){
        roomId = qs.id;
    }else{
        document.location = urlABS('/'); //跳转到默认页面
    }
    
    // roomId = room.value;
    if (roomId!=undefined && roomId !== "" && parseInt(roomId) < 100) {
        // room.remove();
        // roomNumber.innerHTML = "Room Number " + roomId;
        // button.remove();
        // alert('do join');
        console.log("do join");
        socket.emit('joined', roomId);
    }
}

// 人数满
socket.on('full', function (msg) {
    if(roomId == msg)
        window.location.assign(urlABS("/full.html"));
});

//进入房间的初始化消息
socket.on('player', (msg) => {
    console.log(msg);
    role = msg.role;
    players = msg.players;
    op.addLog("You("+msg.playerId+") join room("+msg.roomId+") successfully");
    if(players == 2){
        socket.emit('playstart', msg.roomId);
    }
    else{
        op.changeStatus("Waiting for Second player...");
    }
    
});


// 人数到齐后的全局广播消息
socket.on('playstart', function (msg) {
    debug_msg = msg;
    if (msg.rmid == roomId) {
        //游戏开始
        waiting = false;
        op.clearLog();
        op.addLog("人数到齐，游戏开始");
        op.place_obstacle(msg.map_obstacle);
        if(role == "agent"){
            op.changeStatus("你是特工方，现在是对面招募者在移动......请耐心等待");
            if(!debug){
                op.showDialog("初始化成功","本轮游戏你扮演<font size='30'><b>特工方</b></font>！<br/>你需要操作四个特工抓捕招募者<br/><font size='6'><b>获胜条件</b></font>：在16:00前和对方完成12次接头任务前抓捕到招募者<br/>",function(){
                    op.showDialog("初始化成功",">(1)已在地图随机生成五个障碍物（任何角色都无法跨越，除了部分技能）<br/>>(2)你可以看到对面同伙的接头物品（只有2个，显示在上方）<br/>>(3)系统给对方招募者随机分配了一个技能，对方只能用一次（对方使用技能的时候会提示你）<br/>")
                })
            }
        }else{
            op.changeStatus("你是招募者，已随机生成障碍物、你的技能和接头物品"); 
            InitChooseAndSetItem(op);
            if(!debug){
                op.showDialog("初始化成功","本轮游戏你扮演<font size='30'><b>招募者</b></font>！<br/>你需要躲避对面玩家操作的四个特工抓捕<br/><font size='6'><b>获胜条件</b></font>：在16:00前不被抓捕或者完成12次你的接头任务<br/>",function(){
                    op.showDialog("初始化成功",">(1)已在地图随机生成五个障碍物（任何角色都无法跨越，除了部分技能）<br/>>(2)随机分配了你的接头物品三样（右侧）（每个格子最多接头一次！！）<br/>>(3)随机分配了你的技能（目前可使用次数：1次），你使用技能的时候系统会提示对面<br/>",function(){
                        InitRecruiterAction(op,function(){
                            var msg = {'roomId':roomId};
                            socket.emit('InitAgent', msg);
                        });// 招募者初始行动
                    })
                })
            }else{
                InitRecruiterAction(op,function(){
                    var msg = {'roomId':roomId};
                    socket.emit('InitAgent', msg);
                });// 招募者初始行动
            }
        }
        
    }
    // console.log(msg)
});



socket.on('otherdisconnected', function (msg) {
    if (msg == roomId) {
        socket.disconnect();
        if(game_over == false){ //如果游戏还未结束
            op.showDialog("警告！","其他玩家刷新了页面或者掉线，游戏必须重新开始",function(){location.reload()});
        }
        // 需要执行一个彻底清除状态的操作，比如map_obstacle
    }
    // console.log(msg)
});

// 同步消息的请求接口
// 这些函数会在game.js里面用到------------------------------------------
function SynDisplay(type,content,status_msg){
    if(status_msg==undefined)status_msg="";
    var msg = {
        'roomId':roomId,
        'type':type,
        'content':content,
        'statusMsg':status_msg
    };
    console.log(msg);
    socket.emit("display",msg);
}

function SendRecruiterTurn(){
    var msg = {'roomId':roomId};
    socket.emit('RecruiterTurn',msg);
}

function SendAgentTurn(){
    var msg = {'roomId':roomId};
    socket.emit('AgentTurn',msg);
}

// ------------------------------------------

// 处理玩家之间阻塞交互消息的函数和状态变量
// 存放特工收到结果反馈会执行的函数
var inquireMessageFromAgent_ContinueFunc = {}; //type:函数句柄

// 招募者不会调用该函数
// 这个函数默认不会阻塞，取决于回调和执行情况
function inquireMessageFromAgent(type,content){
    if(role == 'recruiter'){
        console.log("警告！以recruiter身份调用了inquireMessageFromAgent");
    }
    // 发送弹窗告知的消息，没有任何回调
    // 因此发送notice消息之后可以继续在主程序编写代码，进行下一步操作
    // 算了这个功能放到SynDisplay去实现

    //特工询问物品，需要招募者反馈在哪个格子放上足迹
    if(type=='ask'){
        var msg = {'roomId':roomId,'type':type};
        msg['title'] = '特工询问';
        msg['agentName'] = content['agentName']; // 哪个特工询问的
        msg['thingName'] = content['thingName']; //特工询问的物品
        // 不推荐在msg传递函数句柄，因为如果是特工脚本生成的，传递到招募者那里会变成undefined
        inquireMessageFromAgent_ContinueFunc['ask'] = content['continueFunc']
        msg['exposed_div_num'] = -1; // 这个参数是需要另一边处理得到结果后放入的
        socket.emit("inquireMessageFromAgent",msg);
        op.changeStatus("正在等待招募者回答，请稍等...");
    }
    if(type=="reveal"){
        var msg = {'roomId':roomId,'type':type};
        msg['title'] = '揭示足迹';
        msg['agentName'] = content['agentName']; //哪个特工询问的
        msg['divNum'] = content['divNum']; //询问的位置
        inquireMessageFromAgent_ContinueFunc['reveal'] = content['continueFunc']
        socket.emit("inquireMessageFromAgent",msg);
    }
    if(type=="interrogate"){
        var msg = {'roomId':roomId,'type':type};
        msg['title'] = '审问';
        msg['agentName'] = content['agentName']; //哪个特工询问的
        msg['thingName'] = content['thingName']; //询问的物品
        msg['result'] = -1;
        inquireMessageFromAgent_ContinueFunc['interrogate'] = content['continueFunc']
        socket.emit("inquireMessageFromAgent",msg);
    }
    if(type=="capture"){
        var msg = {'roomId':roomId,'type':type};
        msg['title'] = '抓捕';
        msg['agentName'] = content['agentName']; //哪个特工询问的
        msg['divNum'] = content['divNum']; //询问的位置
        inquireMessageFromAgent_ContinueFunc['capture'] = content['continueFunc']
        socket.emit("inquireMessageFromAgent",msg);
    }
    if(type=="MeruSkill"){
        var msg = {'roomId':roomId,'type':type};
        msg['title'] = 'Meru发动技能';
        msg['agentName'] = content['agentName']; //哪个特工询问的
        msg['divNum'] = content['divNum']; //询问的位置
        msg['result'] = -1;
        inquireMessageFromAgent_ContinueFunc['MeruSkill'] = content['continueFunc']
        socket.emit("inquireMessageFromAgent",msg);
    }
    
}


socket.on('inquireMessageFromAgent',function(msg){ 
    if(msg.roomId == roomId){
        if(role == 'recruiter'){
            if(msg.type == 'ask'){
                // msg不能传递非招募者函数内部定义或者还生成的函数句柄，会成为undefined
                // console.log("Debug:招募者接收到msg消息的时候content['continueFunc']:",msg['continueFunc'])
                if(chooseAskedTraceForFootprint(msg.thingName)!=-1){
                    //表示有可以揭示的
                    var cb_func = function(thing_name){
                        chooseAskedTraceForFootprint(thing_name,function(clicked_div_num){
                            SynDisplay("updateItem",{
                                'divNum':clicked_div_num,
                                'itemName':'footprint'
                                },'招募者有足迹涉及'+thing_name+'，已在地图上暴露（放置脚印）');
                            op.autoAddFootPrint(clicked_div_num)
                            msg['exposed_div_num'] = clicked_div_num;
                            // console.log("Debug:招募者返回msg消息的时候content['continueFunc']:",msg['continueFunc'])
                            socket.emit("inquireMessageFromAgent",msg);
                        })
                    }.bind(this,msg.thingName);
                    op.showDialog(msg.title,
                        "特工"+msg.agentName+"询问了你未被暴露过的足迹格子是否有"+"<img width='100' height='100' src='"+op.name2img(msg.thingName)+"'></img>"+"。由于有，请关闭对话框后选择一个格子暴露（将会放置脚印）。",cb_func);
                        op.addLog("特工在"+now_time+"点询问了你是否经过物品"+"<img width='60' height='80' src='"+op.name2img(msg.thingName)+"'></img>"+"，你暴露了一个足迹")
                }else{
                    var cb_func = function(){
                        msg['exposed_div_num'] = -1;
                        socket.emit("inquireMessageFromAgent",msg);
                    }
                    op.showDialog(msg.title,"特工"+msg.agentName+"询问了你未被暴露过的足迹格子是否有"+"<img width='100' height='100' src='"+op.name2img(msg.thingName)+"'></img>"+"。但你没有暴露任何足迹，可以点击右上角关闭该消息框。",cb_func)
                    op.addLog("特工在"+now_time+"点询问了你是否经过物品"+"<img width='60' height='80' src='"+op.name2img(msg.thingName)+"'></img>"+"，结果是你没有经过")
                }
            }
            if(msg.type == 'reveal'){
                var reveal_num = doReveal(msg.divNum);
                op.changeStatus("对面选择揭示特工"+msg.agentName+"所在位置的足迹信息，已在地图揭示你的第"+reveal_num+"步")
                // 移除足迹
                SynDisplay("rmFootPrint",{'divNum':msg.divNum},'');
                op.rmFootPrint(msg.divNum);
                // 显示揭示后的标记
                SynDisplay("updateItem",{'divNum':msg.divNum,'itemName':'reveal'+reveal_num},'揭示的位置是招募者的第'+reveal_num+"步");
                op.autoShowItem(msg.divNum,"reveal"+reveal_num);
                socket.emit("inquireMessageFromAgent",msg); // 让特工方继续行动
            }
            if(msg.type == "interrogate"){
                if(isInterrogateDiscover(msg.thingName)){
                    //审问成功
                    msg['result'] = 1;
                    op.showDialog("审问成功","对面审问发现了你接头物品："+msg.thingName+"。该物品将从你的右侧移除，并且无法再使用该物品接头");
                    //不同步消息了，直接在反馈地方显示
                    op.rmRecruiterThing(msg.thingName);
                }else{
                    //审问失败
                    msg['result'] = 0;
                    op.showDialog("审问失败","对面审问了"+msg.thingName+"，但是错误！");
                }
                socket.emit("inquireMessageFromAgent",msg);
            }
            if(msg.type == 'capture'){
                op.changeStatus("对面选择在特工"+msg.agentName+"所在位置的实施抓捕......")
                if(isCapture(msg.divNum)){
                    SendGlobalVictory("特工大获全胜！！！胜利原因：抓捕到招募者！")
                }else{
                    op.showDialog("对面进行抓捕","结果失败！"+msg.agentName+"并没有抓到你");
                    socket.emit("inquireMessageFromAgent",msg); // 抓捕失败就让特工方继续行动
                }
            }
            if(msg.type == 'MeruSkill'){
                op.changeStatus("对面发送Meru的技能：会告诉对方你的招募者是否在Meru正交的四个方向两个格子之内")
                if(isMeruSkillDiscover(msg.divNum)){
                    msg['result'] = 1
                    op.showDialog("红发女人Meru技能","对面使用了红发女人Meru技能结果，你<font color='red'><b>被发现</b></font>在Meru正交(上下左右，可以越过障碍物)两格子之内！")
                }else{
                    msg['result'] = 0
                    op.showDialog("红发女人Meru技能","对面使用了红发女人Meru技能结果，你<b>未被发现</b>在Meru正交(上下左右，可以越过障碍物)两格子之内。")
                }
                socket.emit("inquireMessageFromAgent",msg); // 抓捕失败就让特工方继续行动
            }
            
        }else{
            //特工发送方收到的反馈消息处理
            if(msg.type == "ask"){
                if(msg['exposed_div_num']==-1){
                    op.showDialog(msg.title,"招募者不存在符合要求的且未被暴露过的足迹格子。")
                    // op.addLog("你在"+now_time+"点询问了对方是否经过物品"+msg.thingName+"，结果是不存在")
                    op.addLog("你在"+now_time+"点询问了对方是否经过物品"+"<img width='60' height='80' src='"+op.name2img(msg.thingName)+"'></img>"+"，结果是不存在")
                }else{
                    op.showDialog(msg.title,"发现招募者足迹！已在地图放置了脚印")
                    // op.addLog("你在"+now_time+"点询问了对方是否经过物品"+msg.thingName+"，结果是存在")
                    op.addLog("你在"+now_time+"点询问了对方是否经过物品"+"<img width='60' height='80' src='"+op.name2img(msg.thingName)+"'></img>"+"，结果是存在")
                }
                if(inquireMessageFromAgent_ContinueFunc["ask"]==undefined) console.log("ask没有设置反馈后继续执行的操作");
                else inquireMessageFromAgent_ContinueFunc["ask"]();
            }
            if(msg.type == "reveal"){
                if(inquireMessageFromAgent_ContinueFunc["reveal"]==undefined) console.log("reveal没有设置反馈后继续执行的操作");
                else inquireMessageFromAgent_ContinueFunc["reveal"]();
            }
            if(msg.type == "interrogate"){
                if(msg['result'] == 1){
                    op.showDialog("审问成功","你审问了"+msg.thingName+"物品，成功发现对方一个接头物品！");
                    op.setRecruiterThing(msg.thingName); 
                    //更新Dusty的技能额外移动步数
                    increaseDustySkill();
                }else{
                    op.showDialog("审问失败","你审问了"+msg.thingName+"物品，但是错误！");
                }
                if(inquireMessageFromAgent_ContinueFunc["interrogate"]==undefined) console.log("interrogate没有设置反馈后继续执行的操作");
                else inquireMessageFromAgent_ContinueFunc["interrogate"]();
            }
            if(msg.type == "capture"){
                //收到这条消息反馈就表明你抓捕失败
                op.showDialog("抓捕结果","抓捕失败！");
                if(inquireMessageFromAgent_ContinueFunc["capture"]==undefined) console.log("capture没有设置反馈后继续执行的操作");
                else inquireMessageFromAgent_ContinueFunc["capture"]();
            }
            if(msg.type == "MeruSkill"){
                //收到这条消息反馈就表明你抓捕失败
                if(msg['result'] == -1)console.log("[错误]MeruSkill技能并未在招募者客户端执行成功")
                if(msg['result'] == 1){
                    op.showDialog("Meru技能结果","！！！发现对方招募者在Meru正交(上下左右，可以越过障碍物)两格子之内！")
                }else{
                    op.showDialog("Meru技能结果","遗憾，未在Meru正交(上下左右，可以越过障碍物)两格之内发现招募者。")
                }
                if(inquireMessageFromAgent_ContinueFunc["MeruSkill"]==undefined) console.log("MeruSkill没有设置反馈后继续执行的操作");
                else inquireMessageFromAgent_ContinueFunc["MeruSkill"]();
            }
        }
    }
});




// 特工独有消息................


socket.on('InitAgent',function(msg){
    // 招募者不会收到这条消息
    if(msg.roomId == roomId){
        if(role=="agent"){
            op.changeStatus("现在轮到你了，请放置你的特工：");
            op.showDialog("你的初始化阶段","现在轮到你初始阶段<br/>请注意左边时间轴表示时间，对面每次回合结束时间会前进一小时，每小时之内对面招募者（不是同伙）只能移动一步<br/>初始阶段是从五点开始的，表示对方已经移动了五步",function(){
                op.showDialog("提示","对方招募者不会在地图显示，这意味着招募者的起点和轨迹你是不知道的，但是对方四个同伙会在地图显示",function(){
                    InitPlaceAgents(op); 
                })
            })            
       }
    }
});



//-------------------------------------------------

// 招募者接收到该消息开始自己的回合
socket.on('RecruiterTurn',function(msg){
    if(msg.roomId == roomId){
        op.showDialog('提醒','现在轮到你的回合了！依次进行下述三个流程<br/>(1)移动你的招募者一步<br/>(2)移动你的超凡者同伙一步<br/>(3)(可选)再额外移动超凡者一步，但是需要你暴露一步你的足迹',function(){
            op.changeStatus("现在轮到你了（注意如果你无法移动会直接失败游戏）<br/>你还有"+extra_skill_left_num+"机会可以使用你的技能<br/>"+"你在之前的回合累计完成了"+accumulated_success_task+"次接头任务");
        })
        RecruiterTurnAction();
    }
});

// 特工接收到该消息开始自己的回合
socket.on('AgentTurn',function(msg){
    if(msg.roomId == roomId){
        notice_s = '现在轮到你的回合了,当前时间是'+now_time+"点。<br/>"
        if(op.use_skill_this_turn){
            notice_s += "[注意]<b>对方招募者刚刚使用了技能</b>，招募者的技能只可能是下面两个之一<br/>"
            notice_s += "(1)招募者不进行正常移动，转而从上下左右四个方向中选择一个方向，并向该方向移动两步（必须移动两步，可以越过障碍物）<br/>"
            notice_s += "(2)招募者不进行正常移动，转而从四个斜走的方向选择一个，向该方向斜走两步（必须移动两步）<br/>"
        }
        op.showDialog('提醒',notice_s,function(){
            op.changeStatus("现在轮到你了");
        })
        AgentTurnAction();
    }
});

// 胜利消息，会被广播到所有客户端包括发送方
function SendGlobalVictory(victory_status_message){
    game_over = true;
    var msg = {'roomId':roomId,'statusMsg':victory_status_message};
    socket.emit("GlobalVictory",msg);
}

socket.on('GlobalVictory',function(msg){
    if(msg.roomId == roomId){
        if(role == 'recruiter'){
            //招募者会将其足迹发送给所有玩家
            SynDisplay("showTraceAfterVictory",{'traceDivNumArray':recruiter_trace,'statusMsg':msg.statusMsg},'');
            game_over = true;
            socket.disconnect(); //断开游戏链接
            op.changeStatus(msg.statusMsg);
            op.showDialog('游戏结束',msg.statusMsg,function(){alert("感谢游玩Saferman的游戏，觉得精彩可以截图分享哟！");})
        }
        // 特工在showTraceAfterVictory消息收到后再处理游戏结束
    }
});




// 处理各类同步消息
socket.on('display', function (msg) {
    console.log("display:",msg.roomId == roomId);
    if (msg.roomId == roomId) {
        if(msg.type == 'updateItem'){
            if(msg.content.itemName == 'footprint'){
                op.autoAddFootPrint(msg.content.divNum);
            }else{
                op.autoShowItem(msg.content.divNum,msg.content.itemName);
            }
        }
        if(msg.type == 'updatePartnerThing'){
            for(var i in msg.content.rmThing){
                var thing_name = msg.content.rmThing[i];
                op.rmPartnerThing(thing_name);
            }
            for(var i in msg.content.setThing){
                var thing_name = msg.content.setThing[i];
                op.setPartnerThing(thing_name);
            }
        }
        if(msg.type == 'updateTimeAxis'){
            now_time = msg.content.nowTime;//更新全局变量
            op.updateTimeAxis(msg.content.nowTime,msg.content.accumulatedSuccessTask,msg.content.useSkillThisTurn);
        }
        if(msg.type == 'enableAgent'){
            op.enableAgent(msg.content.agentName);
        }
        if(msg.type == 'disableAgent'){
            op.disableAgent(msg.content.agentName);
        }
        if(msg.type == 'rmFootPrint'){
            op.rmFootPrint(msg.content.divNum);
        }
        if(msg.type == 'thingNoticeDialog'){
            op.showThingNoticeDialog(msg.content.thingArray,msg.content.message);
        }
        if(msg.type == 'showTraceAfterVictory'){
            //这个消息会处理特工结束的后胜利的操作
            for(var i in msg.content.traceDivNumArray){
                var div_num = msg.content.traceDivNumArray[i];
                op.showTrace(divnum2layerclassname(div_num,3),Number(i)+1);
           }
           game_over = true;
           socket.disconnect(); //断开游戏链接
           console.log(msg);
           op.changeStatus(msg.content.statusMsg);
           op.showDialog('游戏结束',msg.content.statusMsg,function(){alert("感谢游玩Saferman的游戏，觉得精彩可以截图分享哟！");})
        }
        // 更新状态消息
        if(msg.statusMsg!=''){
            if(role == "agent"){
                op.changeStatus(msg.statusMsg);
            }else{
                op.changeStatus(msg.statusMsg);
            }
        }        
    }
});
