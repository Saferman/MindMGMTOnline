// html 标签变量
var button_idname = {
    'confirm':'confirmbutton',
    'cancel':'cancelbutton',
    'move':'opbutton1',
    'ask':'opbutton2',
    'reveal':'opbutton3',
    'capture':'opbutton4',
    'skill':'opbutton5',
    'interrogate':'opbutton6',
    'skip':'opbutton7'
};

// 游戏固定变量
//描述地图每个格子本身的属性
var map = {
    1:{'class_name':"div1",'items':["book","adver"]},
    2:{'class_name':"div2",'items':["cafe","bus"]},
    3:{'class_name':"div3",'items':["zanzibar","umbrella"]},
    4:{'class_name':"div4",'items':["ship","paffit"]},
    5:{'class_name':"div5",'items':["garden","dog"]},
    6:{'class_name':"div6","items":["subconcious","pool"]},

    7:{'class_name':"div7",'items':['subconcious','paffit']},
    8:{'class_name':"div8",'items':['bird','dog']},
    9:{'class_name':"div9",'items':['people','fire']},
    10:{'class_name':"div10",'items':['cafe','adver']},
    11:{'class_name':"div11",'items':['bus','car']},
    12:{'class_name':"div12",'items':['book','fire']},

    13:{'class_name':"div13",'items':['fire','pool']},
    14:{'class_name':"div14",'items':['garden','umbrella']},
    15:{'class_name':"div15",'items':[]},
    16:{'class_name':"div16",'items':['bird','zanzibar']},
    17:{'class_name':"div17",'items':['pool','paffit']},
    18:{'class_name':"div18",'items':['ship','dog']},

    19:{'class_name':"div19",'items':['people','car']},
    20:{'class_name':"div20",'items':['adver','zanzibar']},
    21:{'class_name':"div21",'items':['pool','ship']},
    22:{'class_name':"div22",'items':['subconcious','umbrella']},
    23:{'class_name':"div23",'items':['people','book']},
    24:{'class_name':"div24",'items':['bird','cafe']},

    25:{'class_name':"div25",'items':['book','paffit']},
    26:{'class_name':"div26",'items':['cafe','fire']},
    27:{'class_name':"div27",'items':['dog','people']},
    28:{'class_name':"div28",'items':['adver','garden']},
    29:{'class_name':"div29",'items':[]},
    30:{'class_name':"div30",'items':['pool','car']},

    31:{'class_name':"div31",'items':['zanzibar','bus']},
    32:{'class_name':"div32",'items':['umbrella','ship']},
    33:{'class_name':"div33",'items':['car','paffit']},
    34:{'class_name':"div34",'items':['bus','book']},
    35:{'class_name':"div35",'items':['ship','subconcious']},
    36:{'class_name':"div36",'items':['garden','zanzibar']},
    
    37:{'class_name':"div37",'items':['bird','garden']},
    38:{'class_name':"div38",'items':['people','subconcious']},
    39:{'class_name':"div39",'items':['fire','adver']},
    40:{'class_name':"div40",'items':['cafe','umbrella']},
    41:{'class_name':"div41",'items':['dog','car']},
    42:{'class_name':"div42",'items':['bird','bus']}
};


function layerclassname2divnum(name){//所有layer共用
    return Number(name.split("div")[1]);
}

function divnum2layerclassname(div_num,layer_num){
    return "layer" + layer_num + map[div_num].class_name
}




var victory_time = 16; //到16点游戏结束，招募者胜利
var success_tasks = 12; //接头几次算胜利

var agents_name = ["Bill","Dusty","Herry","Meru"];
var partner_name = ['partner1','partner2','partner3','partner4'];

var agents_info = {
    "Bill":{"description":"可以将相邻的一个超凡者推开一格（免费）"},
    "Dusty":{"description":"可以移动任意一名特工最多(1+已经审问出来的招募者接头物品个数)步（免费）"},
    "Herry":{"description":"你所在位置或者正交相邻的超凡者无法接头（永久，自动）"},
    "Meru":{"description":"询问招募者是否在你的正交四个方向2格之内（非免费）"}
}

var agents_initial_map = [1,2,3,4,5,6,7,13,19,25,31,37,38,39,40,41,42,36,30,24,18,12];

var extra_skill_name = "extra_skill";
var extra_skill_allowed_cell = [8,9,10,14,16,20,21,22,23,24,28,30,34,35,36];


//游戏状态变量
// var used_thing_name = [];  //已经被招募者和同伙选择的物品
// 物品数组，如果被招募者和同伙使用就移出
var thing_name_array = ["adver","bird","book","bus","cafe","car","dog","fire","garden","paffit","people","pool","ship","subconcious","umbrella","zanzibar"];

var recruiter_trace = []; // 1 - 42 
var accumulated_success_task = 0;
var now_time = 0; //几点

var extra_skill_has_gotten = false; //是否捡到了额外技能
var extra_skill_left_num = 1; //还可以使用几次技能
var random_skill = -1;
var skill_info = {
    0:{'description':'可以移动到正交的四个方向第二个格子位置'},
    1:{'description':'可以移动到斜角四个方向第二个格子位置'}
};
var use_skill_this_turn = false; //标识是否使用了技能，结束需要设置为false



// 人物技能带来的函数------------------------

//判断超凡者所在位置和正交的四个方向周围是否有Herry特工
function isHerryAround(partner_div_num){
    var neighbor = [];
    //上下左右（正交的四个方向）
    if((partner_div_num%6)!=1)neighbor.push(partner_div_num-1);
    if((partner_div_num%6)!=0)neighbor.push(partner_div_num+1);
    if((partner_div_num-6)>0)neighbor.push(partner_div_num-6);
    if((partner_div_num+6)<43)neighbor.push(partner_div_num+6);
    var herry_div_num = op.getItemDivnum("Herry");
    if((herry_div_num==partner_div_num)||(neighbor.includes(herry_div_num))){
        return true;
    }else{
        return false;
    }
}


// 公共函数--------------------------

function getPartnerPosition(){
    var partner_position = [];
    for(var i=0;i<op.getPartnerNum();i++){
        if(op.getItemDivnum(partner_name[i])!=-1){
            partner_position.push(op.getItemDivnum(partner_name[i]));
        }
    }
    return partner_position; //返回的是Divnum组成的array
}

function getAgentPosition(op){
    var agent_position = [];
    for(var i=0;i<agents_name.length;i++){
        if(op.getItemDivnum(agents_name[i])!=-1){
            agent_position.push(op.getItemDivnum(agents_name[i]));
        }
    }
    return agent_position;
}



// 得到在地图上移动的邻居格子，受佛像和障碍物影响
function getNeighbor(now_cell){
    now_cell = Number(now_cell);
    var neighbor = [];
    //上下左右（正交的四个方向）肯定可以移动，除了边界
    if((now_cell%6)!=1)neighbor.push(now_cell-1);
    if((now_cell%6)!=0)neighbor.push(now_cell+1);
    if((now_cell-6)>0)neighbor.push(now_cell-6);
    if((now_cell+6)<43)neighbor.push(now_cell+6);
    //如果有左上角格子，左上角格子是否和佛像相邻
    if(![1,2,3,4,5,6,7,13,19,25,31,37].includes(now_cell)){
        if(isBuddha(now_cell)||isBuddha(now_cell-7))neighbor.push(now_cell-7);
    }
    // 如果有右上角格子，右上角格子是否和佛像相邻
     if(![1,2,3,4,5,6,12,18,24,30,36,42].includes(now_cell)){
        if(isBuddha(now_cell)||isBuddha(now_cell-5))neighbor.push(now_cell-5);
    }
    // 如果有左下角格子，左下角格子是否和佛像相邻
    if(![37,38,39,40,41,42,1,7,13,19,25,31].includes(now_cell)){
        if(isBuddha(now_cell)||isBuddha(now_cell+5))neighbor.push(now_cell+5);
    }
    // 如果有右下角格子，右下角格子是否和佛像相邻
    if(![37,38,39,40,41,42,6,12,18,24,30,36].includes(now_cell)){
        if(isBuddha(now_cell)||isBuddha(now_cell+7))neighbor.push(now_cell+7);
    }
    return neighbor;
}


// 超凡者可以斜走
function getPartnerNeighbor(now_cell){
    now_cell = Number(now_cell);
    var neighbor = [];
    //上下左右（正交的四个方向）肯定可以移动，除了边界
    if((now_cell%6)!=1)neighbor.push(now_cell-1);
    if((now_cell%6)!=0)neighbor.push(now_cell+1);
    if((now_cell-6)>0)neighbor.push(now_cell-6);
    if((now_cell+6)<43)neighbor.push(now_cell+6);
    //如果有左上角格子
    if(![1,2,3,4,5,6,7,13,19,25,31,37].includes(now_cell)){
        neighbor.push(now_cell-7);
    }
    // 如果有右上角格子
     if(![1,2,3,4,5,6,12,18,24,30,36,42].includes(now_cell)){
        neighbor.push(now_cell-5);
    }
    // 如果有左下角格子
    if(![37,38,39,40,41,42,1,7,13,19,25,31].includes(now_cell)){
        neighbor.push(now_cell+5);
    }
    // 如果有右下角格子
    if(![37,38,39,40,41,42,6,12,18,24,30,36].includes(now_cell)){
        neighbor.push(now_cell+7);
    }
    return neighbor;
}

// 障碍物要考虑！！
function getOrthogonalNeighborExceptObstacle(now_cell){
    now_cell = Number(now_cell);
    var neighbor = [];
    //上下左右（正交的四个方向）肯定可以移动，除了边界和障碍物
    if((now_cell%6)!=1){
        var cell = now_cell-1;
        var path = cell+"-"+now_cell;
        if(!op.obstacle_path.includes(path))neighbor.push(now_cell-1);
    }
    if((now_cell%6)!=0){
        var cell = now_cell+1;
        var path = cell+"-"+now_cell;
        if(!op.obstacle_path.includes(path))neighbor.push(now_cell+1);
    }
    if((now_cell-6)>0){
        var cell = now_cell-6;
        var path = cell+"-"+now_cell;
        if(!op.obstacle_path.includes(path))neighbor.push(now_cell-6);
    }
    if((now_cell+6)<43){
        var cell = now_cell+6;
        var path = cell+"-"+now_cell;
        if(!op.obstacle_path.includes(path))neighbor.push(now_cell+6);
    }
    return neighbor;
}


function isBuddha(now_cell){
    now_cell = Number(now_cell);
    if(map[now_cell].items.length == 0)return true;
    else return false;
}

// 所有玩家都会执行的操作


//需要用户交互最终确认选择哪个格子
// canceled_cb_func需要用户传递进来，表示如果取消行动需要执行什么操作
function InteractForDivChoice(div_num_list,confirmed_cbfunc,canceled_cb_func){
    if(debug==true){
        //调试模式下随机选择
        var random_index =Math.floor((Math.random()*div_num_list.length)); 
        setTimeout(() => {
            confirmed_cbfunc(div_num_list[random_index]);
        }, debug_time);
        return;
    }
    // 设置这些候选格子的状态，并且设置点击监听事件
    // 该函数只使用第二层作为候选层
    var choice_div_classname_array = [];
    for(var i in div_num_list){
        var div_num = div_num_list[i];
        choice_div_classname_array.push(divnum2layerclassname(div_num,2)); // 使用layer2画布
    }
    var clicked_div_layer2_class_name = ""; // 用户选择
    var waited_for_confirm = false;
    var setted_click_handler = {};
    function clickHandler(class_name){
        console.log(class_name+" is clicked and waited_for_confirm is ",waited_for_confirm);
        //将之前点击的等待确认的格子状态取消
        if(clicked_div_layer2_class_name!=""){
            op.toCandidate(clicked_div_layer2_class_name);
            waited_for_confirm = false;
            clicked_div_layer2_class_name = "";
        }
        //将点击选择的格子设置为等待确认状态
        if(!waited_for_confirm){
            waited_for_confirm = true;
            clicked_div_layer2_class_name = class_name;
            op.toClickedCandidate(class_name);
        }
    }
    //给候选格子设置监听事件
    for(var i in choice_div_classname_array){
        var div_class_name = choice_div_classname_array[i];
        op.toCandidate(div_class_name);
        var f = clickHandler.bind(this,div_class_name);
        document.getElementsByClassName(div_class_name)[0].addEventListener("click",f);
        setted_click_handler[div_class_name] = f;
    }
    var use_cancel = false; //表示是否出现了cancel按钮
    //只给确认按钮设置监听事件
    op.showItemButton(button_idname['confirm']);
    var confirmHandler = function(){
        console.log("click confirm");
        //取消所有监听事件、将按钮隐藏、将所有候选格子候选状态取消
        if(clicked_div_layer2_class_name!=""){
            for(var name in setted_click_handler){
                document.getElementsByClassName(name)[0].removeEventListener("click",
                setted_click_handler[name]);
            }
            document.getElementById(button_idname['confirm']).removeEventListener("click",
            confirmHandler);
            op.hideItemButton(button_idname['confirm']);
            if(use_cancel){
                document.getElementById(button_idname['cancel']).removeEventListener("click",
            cancelHandler);
                op.hideItemButton(button_idname['cancel']);
            }
            for(var i in choice_div_classname_array){
                var div_class_name = choice_div_classname_array[i];
                op.revertOrigLayer2DivStyle(div_class_name);
            }
            //执行最终操作：
            console.log("Player's final choice: ",clicked_div_layer2_class_name);
            confirmed_cbfunc(layerclassname2divnum(clicked_div_layer2_class_name));
        }
    }
    //一定要在定义之后
    document.getElementById(button_idname['confirm']).addEventListener("click", confirmHandler);

    // 取消按钮
    if(canceled_cb_func!=undefined){
        use_cancel = true;
        var cancelHandler = function(){
            console.log("click cancel");
            //清除所有候选格子的监听事件
            for(var name in setted_click_handler){
                document.getElementsByClassName(name)[0].removeEventListener("click",
                setted_click_handler[name]);
            }
            //重置所有候选格子的状态
            for(var i in choice_div_classname_array){
                var div_class_name = choice_div_classname_array[i];
                op.revertOrigLayer2DivStyle(div_class_name);
            }
            //清除确认、取消按钮
            document.getElementById(button_idname['confirm']).removeEventListener("click",
            confirmHandler);
            op.hideItemButton(button_idname['confirm']);
            document.getElementById(button_idname['cancel']).removeEventListener("click",
            cancelHandler);
            op.hideItemButton(button_idname['cancel']);
            canceled_cb_func(); //回调，一般是让界面显示到之前状态的函数
        }
        op.showItemButton(button_idname['cancel']);
        document.getElementById(button_idname['cancel']).addEventListener("click", cancelHandler);
    }
}









// 只会招募者执行的操作函数----------------------------------------------------------------
function InitChooseAndSetItem(op){
    var choosed_thing_name_array = getRandomSubarray(thing_name_array,5);
    for(var i=0;i<3;i++){
        removeArray(thing_name_array,choosed_thing_name_array[i]);
        op.setRecruiterThing(choosed_thing_name_array[i]);
    }
    for(var i=3;i<5;i++){
        removeArray(thing_name_array,choosed_thing_name_array[i]);
        op.setPartnerThing(choosed_thing_name_array[i]);
    }
    // 同步显示同伙接头物品
    SynDisplay('updatePartnerThing',{'rmThing':[],'setThing':op.getPartnerThingArray()},'');
    // 随机抽取技能
    if(Math.random() >= 0.5){
        random_skill = 0;
    }else{
        random_skill = 1;
    }
    op.showSkill(skill_info[random_skill].description);
}



// 移动一步,注意不会记录最终的选择，怎么处理结果取决于callback_function
function moveRecruiterWithoutRecord(callback_function,canceled_cb_func){
    var choice_cell = []; // 储存 格子 map的数字 1-42
    if(recruiter_trace.length == 0){
        for(j=8;j<38;j+=6){
            for(i=0;i<4;i++){
                choice_cell.push(j+i);
            }
        }
    }else{
        var now_cell = recruiter_trace.slice(-1)[0];
        var neighbor = getNeighbor(now_cell);
        for(var i in neighbor){
            var cell = neighbor[i];
            var path = cell+"-"+now_cell;
            //招募者不能越过障碍和走到重复的
            if(!(op.obstacle_path.includes(path)||recruiter_trace.includes(cell))){
                choice_cell.push(cell);
            }
        }
    }
    if(choice_cell.length == 0)return -1;
    // 交互让用户选择走到哪一个格子
    if(callback_function!=undefined)InteractForDivChoice(choice_cell,callback_function,canceled_cb_func);
    return 1;
}


// 第一个技能，移动到正交四个方向第二个格子位置，可以越过障碍，只是不能重复走
function skillOneRecruiterWithoutRecord(callback_function,canceled_cb_func){
    var choice_cell = []; // 储存 格子 map的数字 1-42
    var now_cell = recruiter_trace.slice(-1)[0];
    //判断上边
    if(((now_cell-12) >= 1)&&(!recruiter_trace.includes(now_cell-12))){
        choice_cell.push(now_cell-12);
    }
    //判断下边
    if(((now_cell+12) <= 42)&&(!recruiter_trace.includes(now_cell+12))){
        choice_cell.push(now_cell+12);
    }
    //判断左边
    if(![1,2,7,8,13,14,19,20,25,26,31,32,37,38].includes(now_cell)){
        if(!recruiter_trace.includes(now_cell-2)){
            choice_cell.push(now_cell-2);
        }
    }
    //判断右边
    if(![5,6,11,12,17,18,23,24,29,30,35,36,41,42].includes(now_cell)){
        if(!recruiter_trace.includes(now_cell+2)){
            choice_cell.push(now_cell+2);
        }
    }
    if(choice_cell.length == 0)return -1;
    // 交互让用户选择走到哪一个格子
    console.log("技能一候选格子:",choice_cell);
    if(callback_function!=undefined)InteractForDivChoice(choice_cell,callback_function,canceled_cb_func);
    return 1;
}

// 第二个技能，移动到斜角四个方向第二个格子位置，可以越过障碍，只是不能重复走
function skillTwoRecruiterWithoutRecord(callback_function,canceled_cb_func){
    var choice_cell = []; // 储存 格子 map的数字 1-42
    var now_cell = recruiter_trace.slice(-1)[0];
    //判断左上角
    if(![1,2,3,4,5,6,7,8,9,10,11,12,13,14,19,20,25,26,31,32,37,38].includes(now_cell)){
        if(!recruiter_trace.includes(now_cell-14)){
            choice_cell.push(now_cell-14);
        }
    }
    //判断右下角
    if(![31,32,33,34,35,36,37,38,39,40,41,42,29,30,23,24,17,18,11,12,5,6].includes(now_cell)){
        if(!recruiter_trace.includes(now_cell+14)){
            choice_cell.push(now_cell+14);
        }
    }
    //判断左下角
    if(![31,32,33,34,35,36,37,38,39,40,41,42,25,26,19,20,13,14,7,8,1,2].includes(now_cell)){
        if(!recruiter_trace.includes(now_cell+10)){
            choice_cell.push(now_cell+10);
        }
    }
    //判断右上角
    if(![1,2,3,4,5,6,7,8,9,10,11,12,17,18,23,24,29,30,35,36,41,42].includes(now_cell)){
        if(!recruiter_trace.includes(now_cell-10)){
            choice_cell.push(now_cell-10);
        }
    }
    if(choice_cell.length == 0)return -1;
    // 交互让用户选择走到哪一个格子
    console.log("技能二候选格子:",choice_cell);
    if(callback_function!=undefined)InteractForDivChoice(choice_cell,callback_function,canceled_cb_func);
    return 1;
}


function checkRecruiterVictory(){
    if(now_time >= victory_time){
        SendGlobalVictory("游戏结束!!!恭喜招募方玩家获得胜利，胜利原因：在规定时间范围"+victory_time+"点前未被抓捕");
    }
    if(accumulated_success_task >= success_tasks){
        SendGlobalVictory("游戏结束!!!恭喜招募方玩家获得胜利，胜利原因：招募方完成了"+success_tasks+"次接头任务");
    }
}

// 最终执行移动的操作，关键函数
function moveRecruiter(op,div_num){
    recruiter_trace.push(div_num);
    op.showTrace(divnum2layerclassname(div_num,3),recruiter_trace.length);//地图上显示出来,使用layer3画布
    now_time += 1;
    //判断招募者是否捡到额外技能标记
    if((op.getItemDivnum(extra_skill_name)!=-1)&&(div_num == op.getItemDivnum(extra_skill_name))&&(extra_skill_has_gotten == false)){
        extra_skill_left_num += 1;
        extra_skill_has_gotten = true;
    }
    // 统计任务完成次数
    // 这里我认为只要一个格子有多个交接的东西，可以算完成多次交接（修改为最多一次）
    // console.log("move to ",div_num," with ",map[div_num].items);
    for(var i in map[div_num].items){
        if(op.getRecruiterThingArray().includes(map[div_num].items[i])){
            accumulated_success_task += 1;
            break;
        }
    }
}


function placePartner(op,call_function){
    var choice_cell = []; // 储存 格子 map的数字 1-42
    var partner_position = getPartnerPosition();
    for(j=8;j<38;j+=6){
        for(i=0;i<4;i++){
            if(!partner_position.includes(j+i)){ // 同一格不能放置多个超凡者
                choice_cell.push(j+i);
            }
        }
    }
    InteractForDivChoice(choice_cell,function(clicked_div_num){
        var partner_item_name = partner_name[op.getPartnerNum()];
        op.autoShowItem(clicked_div_num,partner_item_name);
        // console.log("放置特工消息：",{'divNum':clicked_div_num,'itemName':partner_name[partner_placed_num]});
        SynDisplay('updateItem',{'divNum':clicked_div_num,'itemName':partner_item_name},'放置了超凡者'+partner_item_name);
        if(op.getPartnerNum()<4){
            placePartner(op,call_function);
        }else{
            call_function();
        }
    })
}

//招募者和超凡者行动完的回合结束执行函数，初始行动不需要执行

// 招募者初始行动
function InitRecruiterAction(op,make_agent_init_action_callback_fucntion){
    var moveCallFunc = function(clicked_div_num){
        moveRecruiter(op,clicked_div_num);
        if(recruiter_trace.length < 5){
            if(moveRecruiterWithoutRecord(moveCallFunc) == -1){
                // 把自己走死了
                SendGlobalVictory("游戏结束！！！特工胜利，胜利原因：招募者无路可走了！！");
            };
        }else{
            //更新
            if(now_time%2==0){
                SynDisplay("updateTimeAxis",{'nowTime':now_time,'accumulatedSuccessTask':-1,'useSkillThisTurn':use_skill_this_turn},'对方招募者移动完毕，等待对面放置四个同伙');
            }else{
                SynDisplay("updateTimeAxis",{'nowTime':now_time,'accumulatedSuccessTask':accumulated_success_task,'useSkillThisTurn':use_skill_this_turn},'对方招募者移动完毕，等待对面放置四个同伙');
            }
            op.updateTimeAxis(now_time,accumulated_success_task,use_skill_this_turn);
            // 放置超凡者
            op.changeStatus("请依次放置你的四个超凡者同伙（不能在同一个格子，注意点击到白色区域）");
            placePartner(op,function(){
                // 防止数据泄露
                var partner_divnum_array = getPartnerPosition();
                for(var i in partner_divnum_array){
                    // getPartnerPosition 逻辑可知 partner_divnum_array[i] 和 partner_name[i]一致
                    SynDisplay("updateItem",{'divNum':partner_divnum_array[i],'itemName':partner_name[i]},"");
                }
                op.changeStatus("你的行动完成, 请等待特工行动....");
                make_agent_init_action_callback_fucntion();
            })
        }
    };
    console.log("招募者初始行动");
    op.changeStatus("初始阶段，你会先移动五步，请选择...（注意如果无路可走会直接输掉游戏）")
    moveRecruiterWithoutRecord(moveCallFunc);
}

// 招募者回合移动超凡者
function movePartnerWithoutRecord(partner_item_name,callback_function){
    var choice_cell = []; // 储存 格子 map的数字 1-42
    var now_cell = op.getItemDivnum(partner_item_name);
    if(now_cell == -1)console.log("没有找到超凡者所在格子，名称：",partner_item_name);
    var neighbor = getPartnerNeighbor(now_cell);
    for(var i in neighbor){
        var cell = neighbor[i];
        var path = cell+"-"+now_cell;
        //超凡者不能越过障碍
        //超凡者不能移动到已有超凡者的格子
        if((!op.obstacle_path.includes(path))&&(!getPartnerPosition().includes(cell))){
            choice_cell.push(cell);
        }
    }
    if(choice_cell.length == 0)return -1;
    // 交互让用户选择走到哪一个格子
    console.log("超凡者候选格子:",choice_cell,"起点:",now_cell);
    if(callback_function!=undefined)InteractForDivChoice(choice_cell,callback_function);
    return 1;
}

// 结算招募者的回合
// 在初始化放置人物（虽然也要移动招募者）不适合调用此函数，因为需要结合特工技能判定超凡者能否接头
function RecruiterTurnEnd(){
    //这里不进行时间前进因为招募者移动的函数里面会自动加上时间
    // now_time += 1;
    //判断超凡者的接头任务是否有完成(由于显示和game逻辑没有分开导致的败笔！！现在已经更正)
    var stat = {};
    for(var i in op.getPartnerThingArray()){
        stat[op.getPartnerThingArray()[i]] = 0;
    }
    var partner_divnum_array = getPartnerPosition();
    for(var i in partner_divnum_array){
        var div_num = partner_divnum_array[i];
        if(isHerryAround(div_num))continue; //如果Herry在超凡者位置或者周围，技能导致超凡者无法接头
        for(var j in map[div_num].items){
            var connector_item_name = map[div_num].items[j];
            if(connector_item_name in stat){
                stat[connector_item_name] += 1;
            }
        }
    }
    var completed_thing_array_this_turn = []; //本回合招募者超凡者完成的接头物品
    for(var thing_name in stat){
        if(stat[thing_name]>=2){
            //表示接头物品成功
            completed_thing_array_this_turn.push(thing_name);
            accumulated_success_task += 1
            //更换接头物品，并同步消息
            op.rmPartnerThing(thing_name);
            var new_thing_name = getRandomSubarray(thing_name_array,1)[0];
            removeArray(thing_name_array,new_thing_name);
            op.setPartnerThing(new_thing_name);
            SynDisplay("updatePartnerThing",{'rmThing':[thing_name],'setThing':[new_thing_name]},'超凡者同伙成功完成对'+thing_name+'的接头任务')
        }
    }
    // 以明显的方式告知自己和其他玩家，同伙接头成功的物品
    if(completed_thing_array_this_turn.length > 0){
        SynDisplay("thingNoticeDialog",{'thingArray':completed_thing_array_this_turn,'message':'对方的四个超凡者同伙完成了以下接头物品:'},'')
        op.showThingNoticeDialog(completed_thing_array_this_turn,'本轮你完成以下物品的接头');
    }
    //更新时间轴，注意是否使用技能需要在所有玩家时间轴展示
    if(now_time%2 == 0){
        //偶数时间点，特工不应该知道这边任务接头情况，所以就不发送
        SynDisplay("updateTimeAxis",{'nowTime':now_time,
        'accumulatedSuccessTask':-1,
        'useSkillThisTurn':use_skill_this_turn},'')
    }else{
        SynDisplay("updateTimeAxis",{'nowTime':now_time,
        'accumulatedSuccessTask':accumulated_success_task,
        'useSkillThisTurn':use_skill_this_turn},'')
    }
    op.updateTimeAxis(now_time,accumulated_success_task,use_skill_this_turn)
    use_skill_this_turn = false;
    //判断是否达到胜利条件
    checkRecruiterVictory()
    //发送特工回合消息
    op.changeStatus("你的回合结束，现在轮到特工行动，你累计完成了"+accumulated_success_task+"次接头任务");
    SendAgentTurn(completed_thing_array_this_turn);
}

function RevealTraceFromAll(op,callback_function){
    var choice_cell = [];
    for(var i in recruiter_trace){
        var his_cell = recruiter_trace[i];
        // 判断是否已经标注过足迹或者揭示了答案
        if(!op.getExposedArray().includes(his_cell)){
            choice_cell.push(his_cell);
        }
    }
    if(choice_cell.length == 0)return -1;
    // 交互让用户选择走到哪一个格子
    console.log("因为额外移动超凡者，需要招募者额外揭示足迹的候选格子:",choice_cell);
    if(callback_function!=undefined)InteractForDivChoice(choice_cell,callback_function);
    return 1;
}

function PartnerExtraMove(){
    op.changeStatus("额外移动任意一名超凡者一次，但是要暴露一个你走过的格子（已暴露的不能），可以点击Skip跳过");
    // ------------------- 这部分代码和调用PartnerExtraMove的基本重合，将来封装
    var setted_click_handler = {};
    var clear = function(){
        op.hideItemButton(button_idname['skip'])
        document.getElementById(button_idname['skip']).removeEventListener("click",skipCbFunc);
        for(var partner_item_name in setted_click_handler){
            op.clearStandOut(partner_item_name);
            var img_t = op.getItemTag(partner_item_name);
            img_t.removeEventListener("click",setted_click_handler[partner_item_name]);
        }
    }

    function skipCbFunc(){
        clear();
        RecruiterTurnEnd(); // 结算招募者的回合
    }
    function partnerChooseCbFunc(i){
        if(RevealTraceFromAll(op)==-1){
            op.changeStatus("抱歉由于你没有可以暴露的足迹，只能点击跳过");
            return;
        }
        op.changeStatus("请选择你要暴露的足迹");
        clear();
        movePartnerWithoutRecord(partner_name[i],function(clicked_div_num){
            SynDisplay("updateItem",{'divNum':clicked_div_num,'itemName':partner_name[i]},"通过暴露自己的一个足迹额外移动了超凡者");
            op.autoShowItem(clicked_div_num,partner_name[i]);
            RevealTraceFromAll(op,function(clicked_div_num){
                SynDisplay("updateItem",{'divNum':clicked_div_num,'itemName':'footprint'},"暴露了一个足迹");
                op.autoAddFootPrint(clicked_div_num);
                RecruiterTurnEnd(); // 结算招募者的回合
            });
        });
    }
    op.showItemButton(button_idname['skip']);
    document.getElementById(button_idname['skip']).addEventListener("click",skipCbFunc);
    //设置超凡者同伙的监听事件
    for(var i=0;i<partner_name.length;i++){
        op.standOut(partner_name[i]);
        var img_t = op.getItemTag(partner_name[i]);
        var hf = partnerChooseCbFunc.bind(this,i);
        img_t.addEventListener("click",hf);
        setted_click_handler[partner_name[i]] = hf;
    }
    // -------------------
}

function RecruiterSkillCallbackFunc(clicked_div_num){
    //更新技能使用情况变量
    extra_skill_left_num -= 1;
    use_skill_this_turn = true;
    RecruiterMoveCallbackFunc(clicked_div_num);
}


function RecruiterMoveCallbackFunc(clicked_div_num){
    //执行移动
    moveRecruiter(op,clicked_div_num);
    // 必须执行移动一名超凡者一步
    op.changeStatus("请移动一名超凡者（同一个格子最多一名超凡者）");
    //这下部分的代码肯定可以封装
    var partnerChooseCbFunc = function(i){
        partnerClear(op);
        // console.log("partnerChooseCbFunc参数",i);
        movePartnerWithoutRecord(partner_name[i],function(clicked_div_num){
            SynDisplay("updateItem",{'divNum':clicked_div_num,'itemName':partner_name[i]},"移动了超凡者");
            op.autoShowItem(clicked_div_num,partner_name[i]);
            PartnerExtraMove();
        });
    }
    var item_name_array = [];
    var listener_cb_func_array = [];
    for(var i in partner_name){
        if(movePartnerWithoutRecord(partner_name[i])!=-1){
            item_name_array.push(partner_name[i]);
            var hf = partnerChooseCbFunc.bind(this,i);
            listener_cb_func_array.push(hf);
        }
    }
    var partnerClear = op.setItemClickListener(item_name_array, listener_cb_func_array);
}

function RecruiterTurnAction(){
    op.standOutRecruiter(recruiter_trace.length); //传参为第几步
    if(random_skill == 0){
        var skill_func = skillOneRecruiterWithoutRecord;
    }else{
        var skill_func = skillTwoRecruiterWithoutRecord;
    }
    console.log("skill_func定义完毕");
    // 目前没想好如何封装下述操作
    //------招募者有移动和使用技能选项
    var button_name_array = [];
    var listener_cb_func_array = [];
    if(moveRecruiterWithoutRecord()!=-1){
        var moveHandler = function(){
            op.changeStatus("你选择了移动，请移动招募者");
            op.clearStandOutRecruiter(recruiter_trace.length); 
            moveRecruiterWithoutRecord(RecruiterMoveCallbackFunc,RecruiterTurnAction);
        }
        button_name_array.push("move");
        listener_cb_func_array.push(moveHandler);
    }
    console.log("判断是否可以使用技能");
    if(extra_skill_left_num > 0 && (skill_func()!=-1)){
        var skillHandler = function(){
            op.changeStatus("你选择了使用技能，请移动招募者");
            op.clearStandOutRecruiter(recruiter_trace.length); 
            skill_func(RecruiterSkillCallbackFunc,RecruiterTurnAction);
        }
        button_name_array.push("skill");
        listener_cb_func_array.push(skillHandler);
    }
    console.log("判断是否无路可走");
    if(button_name_array.length == 0){
        SendGlobalVictory("游戏结束！！！特工胜利，胜利原因：招募者无路可走了！！");
    }
    op.autoSetButtonClickListener(button_name_array,listener_cb_func_array);//自带清理
}

// 特工发起询问操作后的招募者行动
// 如果足迹有未被放置足迹过的（已经揭示的也算）格子出现了这个物品，招募者需要选择一个
function chooseAskedTraceForFootprint(thing_name,cb_func){
    var choice_cell = [];
    //遍历招募者的历史足迹
    for(var i in recruiter_trace){
        var div_num = recruiter_trace[i];
        if((!op.getExposedArray().includes(div_num))&&(map[div_num].items.includes(thing_name))){
            choice_cell.push(div_num);
        }
    }
    if(choice_cell.length == 0)return -1;
    // 交互让用户选择走到哪一个格子
    console.log("你被询问到"+thing_name+"是否出现在你的足迹上，如果有需要选择一个放置足迹标记，候选对象:",choice_cell);
    if(cb_func!=undefined)InteractForDivChoice(choice_cell,cb_func);
    return 1;
}

// 特工发起揭示操作后招募者的行动
// 返回数字，表示是招募者的第几步
function doReveal(div_num){
    div_num = Number(div_num);
    if(!op.getExposedArray().includes(div_num)){
        console.log("[doReveal错误]尝试揭示一个不存在足迹的格子:",div_num);
        return -1;
    }
    if(!recruiter_trace.includes(div_num)){
        console.log("[doReveal错误]尝试揭示并不是招募者足迹的格子:",div_num);
        return -1;
    }
    return Number(recruiter_trace.indexOf(div_num) + 1);
}

// 特工抓捕后招募者判断是否成功的
function isCapture(div_num){
    div_num = Number(div_num);
    // wait(2000); //延时2秒
    if(recruiter_trace.slice(-1)[0] == div_num) return true;
    else return false;
}

//审问执行后招募者的函数
function isInterrogateDiscover(thing_name){
    return op.getRecruiterThingArray().includes(thing_name);
}


// 对面Meru技能执行的操作
function isMeruSkillDiscover(div_num){
    var neighbor = [div_num ]; //包括Meru当前位置
    var now_cell = div_num;
    //上的方向
    if((now_cell-6)>0)neighbor.push(now_cell-6);
    if((now_cell-12)>0)neighbor.push(now_cell-12);
    //下的方向
    if((now_cell+6)>0)neighbor.push(now_cell+6);
    if((now_cell+12)>0)neighbor.push(now_cell+12);
    //左的方向
    if((now_cell%6)!=1)neighbor.push(now_cell-1);
    if(((now_cell%6)!=1)&&((now_cell%2)!=2))neighbor.push(now_cell-2);
    //右的方向
    if((now_cell%6)!=0)neighbor.push(now_cell+1);
    if(((now_cell%6)!=0)&&((now_cell%2)!=5))neighbor.push(now_cell+2);
    var recruiter_now_cell = recruiter_trace.slice(-1)[0];
    return neighbor.includes(recruiter_now_cell);
}

// 只会特工执行的操作函数--------------------------------------------------------
function InitPlaceAgents(op){
    var agent_index = 0; //对应agents_name
    function placeAgent(op){
        var notice_message = "放置"+agents_name[agent_index]+",这名特工的技能："+agents_info[agents_name[agent_index]].description;
        op.changeStatus("请你"+notice_message);
        SynDisplay("thingNoticeDialog",{'thingArray':[agents_name[agent_index]],'message':'对面正在'+notice_message},'')
        op.showThingNoticeDialog([agents_name[agent_index]], "请你"+notice_message)
        var choice_cell = [];
        var agents_position = getAgentPosition(op);
        for(var i in agents_initial_map){
            if(!agents_position.includes(agents_initial_map[i])){
                choice_cell.push(agents_initial_map[i]);
            }
        };
        InteractForDivChoice(choice_cell,function(clicked_div_num){
            op.autoShowItem(clicked_div_num,agents_name[agent_index]);
            SynDisplay('updateItem',{'divNum':clicked_div_num,'itemName':agents_name[agent_index]},'放置了特工'+agents_name[agent_index]);
            agent_index += 1;   
            if(agent_index < agents_name.length){
                placeAgent(op);
            }else{
                // 放置额外技能标记
                // 只允许放到佛像周围一圈
                op.changeStatus("请放置额外技能标记");
                SynDisplay("thingNoticeDialog",{'thingArray':[extra_skill_name],'message':'对面正在放置额外技能标记，,如果你之后走到标记所在的格子位置，可以额外再使用一次你的技能'},'')
                op.showThingNoticeDialog([extra_skill_name], "请放置额外技能标记,如果对方之后走到标记所在的格子位置，可以额外再使用一次对方的技能")
                var choice_cell = extra_skill_allowed_cell;
                InteractForDivChoice(choice_cell,function(clicked_div_num){
                    op.autoShowItem(clicked_div_num,extra_skill_name);
                    SynDisplay('updateItem',{'divNum':clicked_div_num,'itemName':extra_skill_name},"放置了额外使用一次技能的标记");
                    op.changeStatus("游戏设置完成，正式开始！现在轮到招募者行动，请等待...");
                    SendRecruiterTurn();
                });
            }
        });
    }
    placeAgent(op);
}

//移动特工的操作
//注意：特工可以移动两步
function moveAgentWithoutRecord(agent_name,cb_func,canceled_cb_func){
    var one_choice_cell = []; // 储存 格子 map的数字 1-42
    var now_cell = op.getItemDivnum(agent_name);
    if(now_cell == -1)console.log("没有找到"+agent_name+"所在格子");
    // 第一步范围内的格子
    var neighbor = getNeighbor(now_cell); //特工不能随意斜走，但是有佛像可以，不使用getOrthogonalNeighbor
    for(var i in neighbor){
        var cell = neighbor[i];
        var path = cell+"-"+now_cell;
        //不能越过障碍
        if(!op.obstacle_path.includes(path)){
            one_choice_cell.push(cell);
        }
    }
    // 得到第二步范围内的格子
    var two_choice_cell = []; 
    for(var j in one_choice_cell){
        var one_cell = one_choice_cell[j];
        var neighbor = getNeighbor(one_cell);
        for(var i in neighbor){
            var two_cell = neighbor[i];
            var path = two_cell+"-"+one_cell;
            //不能越过障碍，并且不能重复
            if((!op.obstacle_path.includes(path))&&(!one_choice_cell.includes(two_cell))){
                // 不能是起点，言外之意特工必须移动
                if(two_cell!=now_cell){
                    two_choice_cell.push(two_cell);
                }
            }
        }
    }
    var choice_cell = one_choice_cell.concat(two_choice_cell); //合并
    if(choice_cell.length == 0)return -1;
    // 交互让用户选择走到哪一个格子
    console.log("特工"+agent_name+"移动的候选格子:",choice_cell,"起点:",now_cell);
    if(cb_func!=undefined)InteractForDivChoice(choice_cell,cb_func,canceled_cb_func);
    return 1;
}

function getNeighborWithinRange(now_cell,now_step,max_step){
    if(now_step == max_step)return [];
    var choice_cell = []; 
    var neighbor = getNeighbor(now_cell);
    for(var i in neighbor){
        var cell = neighbor[i];
        var path = cell+"-"+now_cell;
        //不能越过障碍
        if(!op.obstacle_path.includes(path)){
            choice_cell.push(cell);
        }
    }
    for(var j in choice_cell){
        var next_choice_cell = getNeighborWithinRange(choice_cell[j],now_step+1,max_step);
        //next_choice_cell返回前去过重，所以只需要移除一次
        removeArray(next_choice_cell,now_cell);
        choice_cell = choice_cell.concat(next_choice_cell);
    }
    return Array.from(new Set(choice_cell));
}

// Dusty的技能让特工可以再移动一步
function multiMoveAgentWithoutRecord(agent_name,max_step,cb_func){
    var choice_cell = []; // 储存 格子 map的数字 1-42
    var now_cell = op.getItemDivnum(agent_name);
    if(now_cell == -1)console.log("没有找到"+agent_name+"所在格子");
    choice_cell = getNeighborWithinRange(now_cell,0,max_step);
    if(choice_cell.length == 0)return -1;
    // 交互让用户选择走到哪一个格子
    console.log("Dusty技能：特工"+agent_name+"移动的候选格子:",choice_cell,"起点:",now_cell);
    if(cb_func!=undefined)InteractForDivChoice(choice_cell,cb_func);
    return 1;
}


function doBillSkillWithoutRecord(cb_func){
    var choice_cell = [];
    var now_cell = op.getItemDivnum('Bill');
    if(now_cell == -1)console.log("没有找到Bill所在格子");
    //障碍物格挡的相邻格子无法被触发
    var neighbor = getOrthogonalNeighborExceptObstacle(now_cell);
    //Bill可以踢开在自己格子的超凡者
    neighbor.push(now_cell)
    for(var i in neighbor){
        if(getPartnerPosition().includes(neighbor[i])){
            choice_cell.push(neighbor[i]);
        }
    }
    if(choice_cell.length == 0)return -1;
    console.log("特工Bill执行技能的候选格子:",choice_cell,"起点:",now_cell);
    if(cb_func!=undefined)InteractForDivChoice(choice_cell,cb_func);
    return 1;
}


function doDustySkillWithoutRecord(cb_func){
    // op.setItemClickListener会自动添加standOut，但是此时Dusty已有 不建议使用，除非以后改为堆栈形式
    var name_array = [];
    var hf_array = [];
    for(var i in agents_name){
        var agent_name = agents_name[i];
        if(agent_name == 'Dusty')continue;
        name_array.push(agent_name);
        var hf = function(agentName){
            tmp_clear(op);
            op.getItemTag('Dusty').removeEventListener("click",DustyListener);
            cb_func(agentName);
        }.bind(this,agent_name);
        hf_array.push(hf);
    }
    var DustyListener = function(){
        tmp_clear(op);
        op.getItemTag('Dusty').removeEventListener("click",DustyListener);
        cb_func("Dusty");
    }
    op.getItemTag('Dusty').addEventListener("click",DustyListener)
    var tmp_clear = op.setItemClickListener(name_array,hf_array); //会自动添加
}

// 得到具体格子可以询问的物品，注意超凡者所在的格子无法被询问
function getAskedThingNameArray(div_num){
    var partner_thingname_array = []
    var partner_position = getPartnerPosition();
    for(var i in partner_position){
        partner_thingname_array = partner_thingname_array.concat(map[partner_position[i]].items)
    }
    var result = [];
    for(var i in map[div_num].items){
        var thing_name = map[div_num].items[i];
        if(!partner_thingname_array.includes(thing_name))result.push(thing_name);
    }
    return result
}

function chooseDivPushOff(now_cell,cb_func){
    var choice_cell = []; // 储存 格子 map的数字 1-42
    // 得到正交方向相邻格子，并且排除障碍物
    var neighbor = getOrthogonalNeighborExceptObstacle(now_cell);
    //也不能和其他超凡者在同一个格子
    for(var i in neighbor){
        var cell = neighbor[i];
        if(!getPartnerPosition().includes(cell))choice_cell.push(cell);
    }
    if(choice_cell.length == 0)return -1;
    if(cb_func!=undefined)InteractForDivChoice(choice_cell,cb_func);
    return 1;
}

// 特工回合结束执行的操作，必须进行状态清理
function AgentTurnEnd(){
    action_num_this_turn = 0;
    buttonHandlerClear = undefined;
    agentItemHandlerClear = undefined;
    op.changeStatus("你的回合结束，请等待招募者行动...");
    SendRecruiterTurn();
}


// 特工状态变量
var last_action_agents = [];
var action_num_this_turn = 0; //表明特工角色的玩家当前行动了几轮，每回合最多两轮
var buttonHandlerClear = undefined; //存放清除右侧按钮的监听事件（包括显示等）的函数句柄
var agentItemHandlerClear = undefined; //存放清除地图上agentItem监听事件（包括突显特效）的函数句柄

// 不需要被AgentTurnEnd处理的状态变量
var revealed_div_array = []; //存放揭示过的，只会在特工玩家端修改使用
var focusedAgent = ""; //聚焦的特工
// 记录每一名特工行动的次数和上次行动(move或者unmove)，可以使用的免费技能次数
var AgentActionInfo = {
    'Bill':{'actionNUM':0,'historyAction':[],'skillNum':1},
    'Dusty':{'actionNUM':0,'historyAction':[],'skillNum':1},
    'Herry':{'actionNUM':0,'historyAction':[],'skillNum':0},  //skillNum不会被使用
    'Meru':{'actionNUM':0,'historyAction':[],'skillNum':0}    //skillNum不会被使用
}//必须设置为0，没有技能的方便commonActionEnd判断是否还有免费技能可以使用

var Dusty_skill_extra_move_num = 0; //每次审问出一个招募者物品，Dusty的技能就可以多移动一步

function increaseDustySkill(){
    //由于审问成功可以提升Dusty技能
    Dusty_skill_extra_move_num += 1;
}



// ask move reveal capture interrogate 共同起始和结束判断函数

function commonActionStart(agent_name){
    if(agentItemHandlerClear!=undefined){
        agentItemHandlerClear(op);
        agentItemHandlerClear = undefined;
    }
    if(buttonHandlerClear!=undefined){
        buttonHandlerClear(op);
        buttonHandlerClear = undefined;
    }
    focusedAgent = agent_name; // 让AgentTurnAction统一清理
    if(!op.isStandOut(agent_name)){
        op.standOut(agent_name); //聚焦该特工让其保持闪烁直到这名特工行动完毕，确保行动的出口都是AgentTurnAction()
    }
}

function commonActionEnd(agent_name){
     //判断这名特工是否用完了行动次数和免费技能次数
    if((AgentActionInfo[agent_name].actionNUM >=2)&&(AgentActionInfo[agent_name].skillNum == 0)){
        SynDisplay('disableAgent',{'agentName':agent_name},'');
        op.disableAgent(agent_name);
        // 需要清除闪烁
        last_action_agents.push(agent_name);
        AgentTurnAction()
    }else{
        //没使用完行动
        AgentName2Handler[agent_name]();
    }
}

// 要不要添加这个特工闪烁等之类的特效
// 选择了按钮中的任意一个就执行gentItemHandlerClear和右侧按钮清除
var moveHandler = function(agent_name){
    commonActionStart(agent_name);
    // 更新特工行动状态
    op.changeStatus("请移动选择的角色:"+agent_name+"(最多可以移动两步)");
    moveAgentWithoutRecord(agent_name,function(clicked_div_num){
        AgentActionInfo[agent_name].actionNUM += 1
        AgentActionInfo[agent_name].historyAction.push('move');
        SynDisplay('updateItem',{'divNum':clicked_div_num,'itemName':agent_name},'移动了特工'+agent_name);
        op.autoShowItem(clicked_div_num,agent_name); //地图上移动特工
        commonActionEnd(agent_name);
    },function(){commonActionEnd(agent_name);});
}


// Ask也要判断能不能被询问，我的版本是超凡者占据的格子涉及的物品不能被询问，有超凡者在特工的位置也不能
var askHandler = function(agent_name){
    commonActionStart(agent_name);
    // 更新特工行动状态
    op.changeStatus("你选择了"+agent_name+"并执行询问物品操作，请选择你要询问的物品....");
    
    //显示当前位置可以询问的物品，让玩家选择
    var asked_thingnames = getAskedThingNameArray(op.getItemDivnum(agent_name));
    op.showChooseThingDialog(asked_thingnames,function(choosed_thingname){
        AgentActionInfo[agent_name].actionNUM += 1
        AgentActionInfo[agent_name].historyAction.push('unmove');
        var content = {};
        content['agentName'] = agent_name;
        content['thingName'] = choosed_thingname;
        var continueFunc = function(agent_name){
            commonActionEnd(agent_name);
        }.bind(this,agent_name);
        content['continueFunc'] = continueFunc;
        inquireMessageFromAgent('ask',content); 
    },function(){commonActionEnd(agent_name);});
};

//判断是否可以揭示，有超凡者在不行
var revealHandler = function(agent_name){
    commonActionStart(agent_name);
    op.changeStatus("你选择了揭示"+agent_name+"所在位置脚印的信息");
    AgentActionInfo[agent_name].actionNUM += 1
    AgentActionInfo[agent_name].historyAction.push('unmove');
    var content = {};
    content['agentName'] = agent_name;
    content['divNum'] = op.getItemDivnum(agent_name);
    //揭示过的不能再被揭示
    revealed_div_array.push(content['divNum']);
    var continueFunc = function(agent_name){
        commonActionEnd(agent_name);
    }.bind(this,agent_name);
    content['continueFunc'] = continueFunc;
    inquireMessageFromAgent('reveal',content); 
};

//判断是否可以抓捕，有超凡者在不行
var captureHandler = function(agent_name){
    commonActionStart(agent_name);
    op.changeStatus("你选择了抓捕"+agent_name+"所在位置的对手，如果抓捕成功你就获胜！");
    AgentActionInfo[agent_name].actionNUM += 1
    AgentActionInfo[agent_name].historyAction.push('unmove');
    var content = {};
    content['agentName'] = agent_name;
    content['divNum'] = op.getItemDivnum(agent_name);
    var continueFunc = function(agent_name){
        commonActionEnd(agent_name);
    }.bind(this,agent_name);
    content['continueFunc'] = continueFunc;
    inquireMessageFromAgent('capture',content); 
};

//必须有招募者
var interrogateHandler = function(agent_name){
    commonActionStart(agent_name);
    op.changeStatus("你选择了审问超凡者，请从下述所有物品中选择一个（自动排除出现过的物品）:");
    //按照规则，是所有物品都可审问
    //特工辅助，自动排除同伙出现过的物品
    // var asked_thingnames = thing_name_array;
    var asked_thingnames = [];
    for(var i in thing_name_array){
        if(!op.partner_thing_array.includes(thing_name_array[i])){
            asked_thingnames.push(thing_name_array[i]);
        }
    }

    op.showChooseThingDialog(asked_thingnames,function(choosed_thingname){
        AgentActionInfo[agent_name].actionNUM += 1
        AgentActionInfo[agent_name].historyAction.push('unmove');
        var content = {};
        content['agentName'] = agent_name;
        content['thingName'] = choosed_thingname;
        var continueFunc = function(agent_name){
            // 将超凡者推离一步（如果可以的话）
            if(chooseDivPushOff(op.getItemDivnum(agent_name))!=-1){
                op.changeStatus("审问超凡者之后，将其推离一格,请选择推离的位置...");
                chooseDivPushOff(op.getItemDivnum(agent_name),function(clicked_div_num){
                    var partner_name = op.getDivPartnerName(op.getItemDivnum(agent_name));
                    SynDisplay("updateItem",{'divNum':clicked_div_num,'itemName':partner_name},"特工"+agent_name+"推离了你的一个超凡者")
                    op.autoShowItem(clicked_div_num,partner_name)
                    commonActionEnd(agent_name);
                })
            }else{
                //直接结束
                commonActionEnd(agent_name);
            }
        }.bind(this,agent_name);
        content['continueFunc'] = continueFunc;
        inquireMessageFromAgent('interrogate',content); 
    },function(){commonActionEnd(agent_name);});
};

var skipHandler = function(agent_name){
    if(agentItemHandlerClear!=undefined){
        agentItemHandlerClear(op);
        agentItemHandlerClear = undefined;
    }
    if(buttonHandlerClear!=undefined){
        buttonHandlerClear(op);
        buttonHandlerClear = undefined;
    }
    SynDisplay('disableAgent',{'agentName':agent_name},'');
    op.disableAgent(agent_name);
    last_action_agents.push(agent_name);
    AgentTurnAction();
};


//免费行动
var BillSkillHandler = function(){
    commonActionStart('Bill')
    AgentActionInfo['Bill'].skillNum -= 1;
    op.changeStatus("请选择你要将哪个格子的超凡者同伙推离...");
    doBillSkillWithoutRecord(function(clicked_div_num){
        //遍历四个超凡者选择第一个位于click_div_num的目标
        var choosed_partner_item_name = "";
        for(var i in partner_name){
            if(op.getItemDivnum(partner_name[i]) == clicked_div_num){
                choosed_partner_item_name = partner_name[i];
            }
        }
        //需不需要突显一下
        var choice_cell = getOrthogonalNeighborExceptObstacle(clicked_div_num);
        InteractForDivChoice(choice_cell,function(clicked_moved_div_num){
            SynDisplay('updateItem',{'divNum':clicked_moved_div_num,'itemName':choosed_partner_item_name},'选择使用Bill的技能将你的一个超凡者推移到相邻的一格');
            op.autoShowItem(clicked_moved_div_num, choosed_partner_item_name);
            commonActionEnd('Bill')
        });
    })
};

// 免费行动，可以移动任意特工一步
var DustySkillHandler = function(){
    commonActionStart('Dusty')
    AgentActionInfo['Dusty'].skillNum -= 1;
    op.changeStatus("使用Dusty技能，请选择你额外要移动的特工，可以额外移动一步");
    doDustySkillWithoutRecord(function(agent_name){
        //选择好特工后进行移动（只能一步）
        multiMoveAgentWithoutRecord(agent_name,Dusty_skill_extra_move_num+1,function(clicked_div_num){
            SynDisplay('updateItem',{'divNum':clicked_div_num,'itemName':agent_name},'选择使用Dusty的技能将'+agent_name+"额外移动了一步");
            op.autoShowItem(clicked_div_num, agent_name);
            commonActionEnd('Dusty');
        })
    })
};

//不是免费的行动
var MeruSkillHandler = function(){
    commonActionStart('Meru');
    op.changeStatus("使用Dusty的技能，可以询问招募者是否在你正交的四个格子两步之内");
    AgentActionInfo['Meru'].actionNUM += 1
    AgentActionInfo['Meru'].historyAction.push('unmove');
    var content = {};
    content['agentName'] = 'Meru';
    content['divNum'] = op.getItemDivnum('Meru');
    var continueFunc = function(){
        commonActionEnd('Meru');
    };
    content['continueFunc'] = continueFunc;
    inquireMessageFromAgent('MeruSkill',content); 
};

// ----------------------------上述是右侧Button点击后的事件处理函数

//点击四名特工的任意一位都执行右侧按钮清除
var BillActionHandler = function(){
    var agent_name = 'Bill';
    console.log("进入"+agent_name+"图标点击后的句柄函数")
    op.showFocusAgent(agent_name);
    if(buttonHandlerClear!=undefined){
        buttonHandlerClear(op);
        buttonHandlerClear = undefined;
    }
    //点击到这个特工,都会显示特工的技能描述
    op.showSkill(agents_info[agent_name].description)
    var button_item_array = [];
    var cb_func_array = [];
    // 如果移动过了就不执行里面函数
    if(!AgentActionInfo[agent_name].historyAction.includes('move')){
        button_item_array.push('move');
        cb_func_array.push(moveHandler.bind(this,agent_name));
    }
    // 如果已经执行过特殊的行动就跳过
    if(!AgentActionInfo[agent_name].historyAction.includes('unmove')){
        var current_div_num = op.getItemDivnum(agent_name);
        //判断当前位置是否有可以Ask的物品
        if((!getPartnerPosition().includes(current_div_num))&&(getAskedThingNameArray(current_div_num).length > 0)){
            button_item_array.push('ask');
            cb_func_array.push(askHandler.bind(this,agent_name));
        }
        //判断这名特工所在位置是否有足迹但未被揭示过，如果有可以选择揭示
        // 有超凡者在的位置也不能揭示
        if((op.getExposedArray().includes(current_div_num))&&(!revealed_div_array.includes(current_div_num))){
            if(!getPartnerPosition().includes(current_div_num)){
                button_item_array.push('reveal');
                cb_func_array.push(revealHandler.bind(this,agent_name));
            }
        }
        //有超凡者在的位置不能抓捕
        if(!getPartnerPosition().includes(current_div_num)){
            button_item_array.push('capture');
            cb_func_array.push(captureHandler.bind(this,agent_name));
        }
        //审问，如果该位置有超凡者
        if(getPartnerPosition().includes(current_div_num)){
            button_item_array.push('interrogate');
            cb_func_array.push(interrogateHandler.bind(this,agent_name));
        }
        
    }
    //判断是否执行过免费技能
    //Bill需要判断正交相邻的格子有没有超凡者
    if((AgentActionInfo[agent_name].skillNum > 0)&&(doBillSkillWithoutRecord()!=-1)){
        button_item_array.push('skill');
        cb_func_array.push(BillSkillHandler); //Bill特有
    }
    //跳过
    button_item_array.push('skip');
    cb_func_array.push(skipHandler.bind(this,agent_name));
    buttonHandlerClear = op.setButtonClickListener(button_item_array, cb_func_array);
}

var DustyActionHandler = function(){
    var agent_name = 'Dusty';
    console.log("进入"+agent_name+"图标点击后的句柄函数")
    op.showFocusAgent(agent_name);
    if(buttonHandlerClear!=undefined){
        buttonHandlerClear(op);
        buttonHandlerClear = undefined;
    }
    //点击到这个特工都会显示特工的技能描述
    op.showSkill(agents_info[agent_name].description)
    var button_item_array = [];
    var cb_func_array = [];
    // 如果移动过了就不执行里面函数
    if(!AgentActionInfo[agent_name].historyAction.includes('move')){
        button_item_array.push('move');
        cb_func_array.push(moveHandler.bind(this,agent_name));
    }
    // 如果已经执行过特殊的行动就跳过
    if(!AgentActionInfo[agent_name].historyAction.includes('unmove')){
        var current_div_num = op.getItemDivnum(agent_name);
        //判断当前位置是否有可以Ask的物品
        if((!getPartnerPosition().includes(current_div_num))&&(getAskedThingNameArray(current_div_num).length > 0)){
            button_item_array.push('ask');
            cb_func_array.push(askHandler.bind(this,agent_name));
        }
        //判断这名特工所在位置是否有足迹但未被揭示过，如果有可以选择揭示
        // 有超凡者的位置不能揭示
        if((op.getExposedArray().includes(current_div_num))&&(!revealed_div_array.includes(current_div_num))){
            if(!getPartnerPosition().includes(current_div_num)){
                button_item_array.push('reveal');
                cb_func_array.push(revealHandler.bind(this,agent_name));
            }
        }
        //有超凡者在的位置不能抓捕
        if(!getPartnerPosition().includes(current_div_num)){
            button_item_array.push('capture');
            cb_func_array.push(captureHandler.bind(this,agent_name));
        }
        //审问，如果该位置有超凡者
        if(getPartnerPosition().includes(current_div_num)){
            button_item_array.push('interrogate');
            cb_func_array.push(interrogateHandler.bind(this,agent_name));
        }
        
    }
    //判断是否执行过免费技能
    if(AgentActionInfo[agent_name].skillNum > 0){
        button_item_array.push('skill');
        cb_func_array.push(DustySkillHandler); // Dusty特有
    }
    //跳过
    button_item_array.push('skip');
    cb_func_array.push(skipHandler.bind(this,agent_name));
    buttonHandlerClear = op.setButtonClickListener(button_item_array, cb_func_array);
}

// Herry不存在技能按钮
var HerryActionHandler = function(){
    var agent_name = 'Herry';
    console.log("进入"+agent_name+"图标点击后的句柄函数")
    op.showFocusAgent(agent_name);
    if(buttonHandlerClear!=undefined){
        buttonHandlerClear(op);
        buttonHandlerClear = undefined;
    }
    //点击到这个特工都会显示特工的技能描述
    op.showSkill(agents_info[agent_name].description)
    var button_item_array = [];
    var cb_func_array = [];
    // 如果移动过了就不执行里面函数
    if(!AgentActionInfo[agent_name].historyAction.includes('move')){
        button_item_array.push('move');
        cb_func_array.push(moveHandler.bind(this,agent_name));
    }
    // 如果已经执行过特殊的行动就跳过
    if(!AgentActionInfo[agent_name].historyAction.includes('unmove')){
        var current_div_num = op.getItemDivnum(agent_name);
        //判断当前位置是否有可以Ask的物品
        if((!getPartnerPosition().includes(current_div_num))&&(getAskedThingNameArray(current_div_num).length > 0)){
            button_item_array.push('ask');
            cb_func_array.push(askHandler.bind(this,agent_name));
        }
        //判断这名特工所在位置是否有足迹但未被揭示过，如果有可以选择揭示
        // 有超凡者的位置不能揭示
        if((op.getExposedArray().includes(current_div_num))&&(!revealed_div_array.includes(current_div_num))){
            if(!getPartnerPosition().includes(current_div_num)){
                button_item_array.push('reveal');
                cb_func_array.push(revealHandler.bind(this,agent_name));
            }
        }
        //有超凡者在的位置不能抓捕
        if(!getPartnerPosition().includes(current_div_num)){
            button_item_array.push('capture');
            cb_func_array.push(captureHandler.bind(this,agent_name));
        }
        //审问，如果该位置有超凡者
        if(getPartnerPosition().includes(current_div_num)){
            button_item_array.push('interrogate');
            cb_func_array.push(interrogateHandler.bind(this,agent_name));
        }
        
    }
    //跳过
    button_item_array.push('skip');
    cb_func_array.push(skipHandler.bind(this,agent_name));
    buttonHandlerClear = op.setButtonClickListener(button_item_array, cb_func_array);
}

var MeruActionHandler = function(){
    var agent_name = 'Meru';
    console.log("进入"+agent_name+"图标点击后的句柄函数")
    op.showFocusAgent(agent_name);
    if(buttonHandlerClear!=undefined){
        buttonHandlerClear(op);
        buttonHandlerClear = undefined;
    }
    //点击到这个特工都会显示特工的技能描述
    op.showSkill(agents_info[agent_name].description)
    var button_item_array = [];
    var cb_func_array = [];
    // 如果移动过了就不执行里面函数
    if(!AgentActionInfo[agent_name].historyAction.includes('move')){
        button_item_array.push('move');
        cb_func_array.push(moveHandler.bind(this,agent_name));
    }
    // 如果已经执行过特殊的行动就跳过
    if(!AgentActionInfo[agent_name].historyAction.includes('unmove')){
        var current_div_num = op.getItemDivnum(agent_name);
        //判断当前位置是否有可以Ask的物品
        if((!getPartnerPosition().includes(current_div_num))&&(getAskedThingNameArray(current_div_num).length > 0)){
            button_item_array.push('ask');
            cb_func_array.push(askHandler.bind(this,agent_name));
        }
        //判断这名特工所在位置是否有足迹但未被揭示过，如果有可以选择揭示
        //有超凡者的位置不能揭示
        if((op.getExposedArray().includes(current_div_num))&&(!revealed_div_array.includes(current_div_num))){
            if(!getPartnerPosition().includes(current_div_num)){
                button_item_array.push('reveal');
                cb_func_array.push(revealHandler.bind(this,agent_name));
            }
        }
        //有超凡者在的位置不能抓捕
        if(!getPartnerPosition().includes(current_div_num)){
            button_item_array.push('capture');
            cb_func_array.push(captureHandler.bind(this,agent_name));
        }
        //技能，这部分代码有区别
        button_item_array.push('skill');
        cb_func_array.push(MeruSkillHandler); //Meru特有
        //审问，如果该位置有超凡者
        if(getPartnerPosition().includes(current_div_num)){
            button_item_array.push('interrogate');
            cb_func_array.push(interrogateHandler.bind(this,agent_name));
        }
    }
    //跳过 随时都可以
    button_item_array.push('skip');
    cb_func_array.push(skipHandler.bind(this,agent_name));
    buttonHandlerClear = op.setButtonClickListener(button_item_array, cb_func_array);
}

// 由于ActionHandler都是以变量形式命名，需要放在这些变量定义之后
var AgentName2Handler = {
    'Bill':BillActionHandler,
    'Dusty':DustyActionHandler,
    'Herry':HerryActionHandler,
    'Meru':MeruActionHandler
}

// 特工行动回合
// 实现的时候看能不能写成调用两次的形式
function AgentTurnAction(){
    //清空聚焦的特工，需要在回合结束前处理
    if(focusedAgent!=""){
        //关闭右侧显示正在行动的特工
        op.clearShowFocusAgent();
        op.clearStandOut(focusedAgent);
        focusedAgent = "";
    }
    //判断第几次行动了
    if(action_num_this_turn >= 2){
        AgentTurnEnd(); //在该函数里面清理状态
        return; //必须添加
    }
    else{
        action_num_this_turn += 1;
    }
    op.changeStatus("请选择你的特工行动（本回合最多移动两名，且只能交替行动，当四名特工都行动完成才能自由选择）");
    // 如果四个特工都不能使用就重置
    // 在操作特工之后让其disabled
    if(last_action_agents.length == 4){
        for(var i in last_action_agents){
            SynDisplay('enableAgent',{'agentName':last_action_agents[i]},'');
            op.enableAgent(last_action_agents[i]);
            AgentActionInfo[last_action_agents[i]].actionNUM = 0;
            AgentActionInfo[last_action_agents[i]].historyAction = [];
            if((last_action_agents[i] == 'Bill')||(last_action_agents[i]=='Dusty')){
                AgentActionInfo[last_action_agents[i]].skillNum = 1;
            }else{
                AgentActionInfo[last_action_agents[i]].skillNum = 0;
            }
            
        }
        last_action_agents = []; //需要清空
    }
    var candicateAgents = []; //储存agents item_name
    for(var i in agents_name){
        var agentName = agents_name[i];
        if(!last_action_agents.includes(agentName))candicateAgents.push(agentName);
    }
    var cb_func_array = [];
    for(var i in candicateAgents){
        // 要确保hf使用的所以变量在之后被调用的时候不会被销毁！
        var hf = function(agent_name){AgentName2Handler[agent_name]();}.bind(this,candicateAgents[i]); 
        cb_func_array.push(hf);
    }
    agentItemHandlerClear = op.setItemClickListener(candicateAgents,cb_func_array);
}