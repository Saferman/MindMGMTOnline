
class display_operation {
    constructor() {

        this.partner_item_img_class_name = ['extra_item1','extra_item2'];

        this.max_item_num = 6
        
        this.map_state_dict = {}; // map_class_name "dvi1"为关键词:使用的pos的array格式，不一定按照顺序

        //合法的item_name
        this.name2img = function(name){
            console.log(name);
            if(name.startsWith("partner"))return urlABS("./img/partner.png");
            if(['Bill','Dusty','Herry','Meru'].includes(name))return urlABS("./img/"+name+".png");
            if(name.startsWith("footprint"))return urlABS("./img/footprint.png");
            if(name.startsWith("reveal"))return  urlABS("./img/reveal/"+name+".png");
            if(name == "extra_skill")return urlABS("./img/extra_skill.png");
            if(["adver","bird","book","bus","cafe","car","dog","fire","garden","paffit","people","pool","ship","subconcious","umbrella","zanzibar"].includes(name)){
                return urlABS("./img/"+name+".png")
            }
        }

        this.agentName2Disable = function(name){
            if(['Bill','Dusty','Herry','Meru'].includes(name))return urlABS("./img/"+name+"Disabled.png");
            return '';
        }

        // 地图的各种item物件位置全部储存到这个数组里，通过接口获取
        this.name2position = {}; // item_name  ["div1",3] 

        // 设置div格子为候选目标
        this.toCandidate = function (class_name) {
            var div_t = document.getElementsByClassName(class_name)[0];
            div_t.style.marginTop = "9px";
            div_t.style.marginLeft = "9px";
            div_t.style.opacity = "0.5";
            div_t.style.width = "100px";
            div_t.style.height = "100px";
            div_t.style.background = "rgb(238, 235, 235)";
            div_t.style.borderRadius = "50%";

        };

        // 候选目标被点击到，设置为黄色
        this.toClickedCandidate = function (class_name) {
            var div_t = document.getElementsByClassName(class_name)[0];
            div_t.style.background = "rgb(255,255,0)";
        };

        //清除候选格子的style
        this.revertOrigLayer2DivStyle = function (class_name) {
            var div_t = document.getElementsByClassName(class_name)[0];
            div_t.setAttribute("style", "z-index: 1;position: absolute;"); //要确保原始的css就是这个
        };

        //在div格子里的第几个子格子放置图片，img_url需要时绝对路径
        // 使用最原始层的
        this.showItem = function (class_name, pos, img_url) {
            var div_t = document.getElementsByClassName(class_name)[0];
            var img = div_t.getElementsByTagName('img')[pos];
            img.setAttribute("src", img_url);
            img.style.display = "inline";
        };

        // 移除放置的图片
        this.rmItem = function (class_name, pos) {
            var div_t = document.getElementsByClassName(class_name)[0];
            var img = div_t.getElementsByTagName('img')[pos];
            img.setAttribute("src", "");
            img.style.display = "none";
        };

        this.getPartnerNum = function(){
            var num = 0;
            for(var key in this.name2position){
                if(key.startsWith("partner"))num+=1;
            }
            return num;
        }

        this.getDivPartnerName = function(div_num){
            for(var key_name in this.name2position){
                if(key_name.startsWith("partner")&&(this.name2position[key_name][0] == "div"+div_num)){
                    return key_name;
                }
            }
            console.log("并没有在"+div_num+"格子发现任何超凡者！！！");
            return undefined
        }



        //自动化的新接口
        // 由于每次放置新的会把同名的老的删除，像脚印这种不用通过该函数处理
        // 放置揭示需要移除所在位置的脚印
        // item_name 允许 agents是个人物  partner1=,2,3,4  reveal1-16（揭示后的内容)
        // footprint 不使用这个函数！！！
        // 需要带着特效一起移动，目前的特效是闪烁（this.Item2IntervalId）
        this.autoShowItem = function (div_num, item_name) {
            // console.log("map_state_dict:",this.map_state_dict)
            // 先判断这个格子满没满，满了就不执行下面内容
            var map_class_name = "div" + div_num;
            if((map_class_name in this.map_state_dict)&&(this.map_state_dict[map_class_name].length == this.max_item_num)){
                console.log("尝试在"+map_class_name+"格子放置"+item_name+"失败，因为格子已满");
                return;
            }
            var is_old_with_standout = false;
            var old_img_url = "";//因为只是移动和初始化放置，需要确保不改变原图的src，也是为了兼容disable agent
            // 移除之前的，
            if(item_name in this.name2position){
                var old_map_class_name = this.name2position[item_name][0];
                var old_pos = this.name2position[item_name][1];
                var old_img = document.getElementsByClassName(old_map_class_name)[0].getElementsByTagName('img')[old_pos];
                removeArray(this.map_state_dict[old_map_class_name],old_pos);
                old_img_url = old_img.getAttribute("src"); //原图src
                old_img.setAttribute("src", "");
                old_img.setAttribute("title", "");
                old_img.style.display = "none";
                //如果有特效，移除之前的闪烁特效
                if((item_name in this.Item2IntervalId)&&(this.Item2IntervalId[item_name].length>0)){
                    this.clearStandOut(item_name);
                    is_old_with_standout = true;
                }
            }
            //使用原始地图层
            var div_t = document.getElementsByClassName(map_class_name)[0];
            var pos = -1;
            if(map_class_name in this.map_state_dict){
                var used_array = this.map_state_dict[map_class_name];
                pos = 0
                while(used_array.includes(pos))pos++;
                this.map_state_dict[map_class_name].push(pos);
                this.name2position[item_name] = [map_class_name,pos];
            }else{
                pos = 0;
                this.map_state_dict[map_class_name] = [0];
                this.name2position[item_name] = [map_class_name,pos];
            }
            var img = div_t.getElementsByTagName('img')[pos]; 
            if(old_img_url == ""){
                img.setAttribute("src", this.name2img(item_name));
            }else{
                img.setAttribute("src", old_img_url);
            }
            // 特工的图标，当鼠标移动过去的时候还需要额外显示技能(mouseover事件)
            if(agents_name.includes(item_name)){
                img.setAttribute("title", item_name+"  技能是"+agents_info[item_name].description);
            }else{
                img.setAttribute("title", item_name);
            }
            img.style.display = "inline";
            //如果移动前有闪动特效添加上去
            if(is_old_with_standout){
                this.standOut(item_name);
            }
        };

        this.footprint_seq = 0; 
        this.exposed_trace = [];
        // 足迹单独处理的函数 footprint
        this.getExposedArray = function(){return this.exposed_trace};
        this.autoAddFootPrint = function (div_num) {
            // 先判断这个格子满没满，满了就不执行下面内容
            var map_class_name = "div" + div_num;
            if((map_class_name in this.map_state_dict)&&(this.map_state_dict[map_class_name].length == this.max_item_num)){
                console.log("尝试在"+map_class_name+"格子放置足迹失败，因为格子已满");
                return;
            }
            this.exposed_trace.push(div_num);
            this.footprint_seq += 1;
            var item_name = "footprint" + this.footprint_seq;
            //使用原始地图层
            var div_t = document.getElementsByClassName(map_class_name)[0];
            var pos = -1;
            if(map_class_name in this.map_state_dict){
                var used_array = this.map_state_dict[map_class_name];
                pos = 0
                while(used_array.includes(pos))pos++;
                this.map_state_dict[map_class_name].push(pos);
                this.name2position[item_name] = [map_class_name,pos];
            }else{
                pos = 0;
                this.map_state_dict[map_class_name] = [0];
                this.name2position[item_name] = [map_class_name,pos];
            }
            var img = div_t.getElementsByTagName('img')[pos]; 
            img.setAttribute("title", "这是足迹，表示招募者走过这个格子");
            img.setAttribute("src", this.name2img(item_name));
            img.style.display = "inline";
        };

        this.rmFootPrint = function(div_num){
            //找出div_num的唯一足迹的item_name
            var footprint_item_name = ""; 
            var map_class_name =  "div" + div_num;
            for(var key_name in this.name2position){
                //操，一个位置可能有多个keyname满足
                if(!key_name.startsWith("footprint"))continue;
                if(this.name2position[key_name][0] == map_class_name){  // 确保不要的key清除
                    footprint_item_name = key_name;
                    break;
                }
            }
            if(footprint_item_name == "")console.log("在name2position记录里找不到div_num为"+div_num+"格子的脚印item_name")
            // 关闭图像之类的
            var pos =  this.name2position[footprint_item_name][1];
            var img = document.getElementsByClassName(map_class_name)[0].getElementsByTagName('img')[pos];
            img.setAttribute("src", "");
            img.setAttribute("title", "");
            img.style.display = "none";
            //清理状态变量
            removeArray(this.map_state_dict[map_class_name],pos); 
            delete this.name2position[footprint_item_name]; // 一定要删除这个key-value
        }


        this.disableAgent = function(item_name){
            var img = this.getItemTag(item_name);
            img.setAttribute("src", this.agentName2Disable(item_name));
        }
        this.enableAgent = function(item_name){
            var img = this.getItemTag(item_name);
            img.setAttribute("src", this.name2img(item_name));
        }

        // 查找物品所在的格子
        this.getItemDivnum = function (item_name){
            if(!(item_name in this.name2position)){
                console.log("[-]"+item_name+"还不在op.name2position数组里，这意味着地图上可能没有");
                return -1;
            }
            var map_class_name = this.name2position[item_name][0];
            return Number(map_class_name.split("div")[1]);
        }

        // 获取物品的图像标签对象，用于设置监听事件
        this.getItemTag = function(item_name){
            if(!(item_name in this.name2position)){
                console.log("[不该出现的问题]op.getItemImgTag处理"+item_name+"，但是name2position里没有")
                return -1;
            }
            var map_class_name = this.name2position[item_name][0];
            var pos = this.name2position[item_name][1];
            var div_t = document.getElementsByClassName(map_class_name)[0];
            var img = div_t.getElementsByTagName('img')[pos]; 
            return img
        }

        //显示技能描述
        this.showSkill = function (description){
            var p_t = document.getElementsByClassName("skill_description")[0];
            p_t.innerHTML = "你的技能是：<br/>"+description;
        }

        // 让item闪烁
        // https://www.runoob.com/jsref/met-win-clearinterval.html


        //清除技能描述
        this.closeSkill = function (description){
            var p_t = document.getElementsByClassName("skill_description")[0];
            p_t.innerHTML = "";
        }

 
        //显示按钮
        this.showItemButton = function (id_name) {
            document.getElementById(id_name).style.display = "inline";
        };

        //隐藏按钮 变量名重复，操
        this.hideItemButton = function (id_name) {
            document.getElementById(id_name).style.display = "none";
        };

        //清空地图所有边界信息
        this.clearAllBorder = function(){
            var directions = ["Right",'Left','Top','Bottom']
            for(var i=1;i<43;i++){
                var div_t = document.getElementsByClassName("div"+i)[0];
                for(var j in directions){
                    div_t.style['border'+directions[j]] = "";
                }
                div_t.style.borderColor = "";
            }
        }
        
        //放置路障
        this.putFence = function (div_num, direction) {
            //top bottom left right
            var div_t = document.getElementsByClassName("div"+div_num)[0];
            div_t.style['border'+direction] = "10px inset";
            div_t.style.borderColor = "#d03e20"

            // div_t.setAttribute("style", old_style + ";" + "border-" + direction + ": 10px inset; border-color: #d03e20;");
        };

        //招募者走过的格子需要显示为红色圈
        this.showTrace = function (class_name, step_number) {
            var div_t = document.getElementsByClassName(class_name)[0];
            div_t.innerHTML = "" + step_number;
            var d = {
                marginTop: '40px',
                marginLeft: '45px',
                width: '50px',
                height: '50px',
                background: 'rgb(42 242 22)',
                borderRadius: '50%',
                textAlign: 'center',
                fontSize: '30px',
                color: '#da0c0c'
            };
            for (var k in d) {
                div_t.style[k] = d[k];
            }

        };

    

        // 在网页地图上弹框提示
        // 依赖jquery
        this.showDialog = function(title,message,cb_func){
            console.log("showDialog:",title,message);
            document.getElementById('screen_dialog_message').innerHTML = message;
            document.getElementById('screen_dialog_end_prompt').innerHTML = "(关闭点击右上角或下方按钮)";
            $(function() {
                // 设置关闭了对话框的回调函数
                $( "#screen_dialog" ).on('dialogclose', function(event) {
                    $( "#screen_dialog" ).off('dialogclose');
                    //清除debug的setTimeout
                    if(cb_func!=undefined)cb_func();
                });

                $( "#screen_dialog" ).dialog({
                  autoOpen: true,
                  modal: true,
                  width: 705,
                  height: 450,
                  show: {
                    effect: "slide",
                    duration: 500
                  },
                  open: function(event, ui){
                    if(debug == true){
                        setTimeout("$('#screen_dialog').dialog('close')",debug_time);
                    }
                  },
                  title:title,
                  hide: {
                    effect: "fade",
                    duration: 100
                  },
                //   buttons: { "关闭": function() {  } } 
                }).css("font-size", "28px").css("color",'maroon');

                //buttons样式
                $('#screen_dialog').dialog("option", "buttons", [
                    {
                        text: "确认",
                        width: "150",
                        height:'80',
                        click: function () { $(this).dialog("close"); }
                    }
                ]);
                //结束
            });
            //End
        }
        
        //需要设置关闭对话框的监听事件清空子节点
        // 显示物品强迫用户选择
        this.showChooseThingDialog = function(thing_name_array,cb_func,canceled_cd_func){
            console.log("showChooseThingDialog:",thing_name_array);
            var dialog_t = document.getElementById('choose_thing_dialog');
            dialog_t.setAttribute('title','请点击你想选择的物品：');
            var choose_thing_name = "";
            var clicked_cancel = false; // 点击cancel就退出对话框
            var thing_name2img_tag = {}; //储存新生成的img
            // 添加显示的图片标签
            for(var i in thing_name_array){
                var thing_name = thing_name_array[i];
                var img_t = document.createElement('img');
                img_t.setAttribute("src",this.name2img(thing_name));
                img_t.style.margin = "5px";
                thing_name2img_tag[thing_name] = img_t;
                var listener_func = function(thing_name){
                    choose_thing_name = thing_name;
                    for(var key_name in thing_name2img_tag){
                        if(key_name == thing_name){
                            thing_name2img_tag[key_name].style.border = "4px solid #121212";
                        }else thing_name2img_tag[key_name].style.border = "";
                    }
                }
                img_t.addEventListener("click", listener_func.bind(this,thing_name));
                dialog_t.appendChild(img_t);
            }
            $(function() {
                // 设置关闭了对话框的回调函数
                $( "#choose_thing_dialog" ).on('dialogclose', function(event) {
                    // 去除dialogclose，不然每次对话框弹出后都要清理
                    $( "#choose_thing_dialog" ).off('dialogclose');
                    //删除所有子节点
                    while (dialog_t.hasChildNodes()) {
                        dialog_t.removeChild(dialog_t.firstChild);
                    }
                    //判断用户是否点击了取消
                    if(clicked_cancel==true){
                        console.log("用户取消了选择物品的对话框")
                        if(canceled_cd_func!=undefined)canceled_cd_func();
                    }else{
                        //判断用户是否选择了物品
                        if(choose_thing_name == ""){
                            op.showChooseThingDialog(thing_name_array,cb_func,canceled_cd_func); //重新执行，强迫用户选择
                        }else{
                            console.log("通过对话框用户选择了",choose_thing_name);
                            if(cb_func!=undefined)cb_func(choose_thing_name);
                        }
                    }
                    
                });

                $( "#choose_thing_dialog" ).dialog({
                  autoOpen: true,
                  modal: true,
                  width: 1311,
                  height: 600,
                  show: {
                    effect: "slide",
                    duration: 500
                  },
                  hide: {
                    effect: "fade",
                    duration: 100
                  }
                }).css("text-align",'center');

                //buttons样式
                if(canceled_cd_func!=undefined){
                    $('#choose_thing_dialog').dialog("option", "buttons", [
                        {
                            text: "确认",
                            width: "150",
                            height:'80',
                            click: function () { $(this).dialog("close"); }
                        },
                        {
                            text: "取消",
                            width: "150",
                            height:'80',
                            click: function () { clicked_cancel=true;$(this).dialog("close"); }
                        }
                    ]);
                }else{
                    $('#choose_thing_dialog').dialog("option", "buttons", [
                        {
                            text: "确认",
                            width: "150",
                            height:'80',
                            click: function () { $(this).dialog("close"); }
                        }
                    ]);
                }
               });
            //End
        }

        //需要设置关闭对话框的监听事件清空子节点
        //只显示物品不强迫
        this.showThingNoticeDialog = function(thing_name_array,message){
            console.log("showThingNoticeDialog:",thing_name_array,"  ",message);
            var dialog_t = document.getElementById('choose_thing_dialog');
            dialog_t.setAttribute('title','消息通知');
            var p = document.createElement('p');
            p.innerHTML = message;
            p.setAttribute("style","font-size:25px;color:DarkBlue;");
            dialog_t.appendChild(p);
            // 添加显示的图片标签
            for(var i in thing_name_array){
                var thing_name = thing_name_array[i];
                var img_t = document.createElement('img');
                img_t.setAttribute("src",this.name2img(thing_name));
                img_t.style.margin = "5px";
                dialog_t.appendChild(img_t);
            }
            $(function() {
                // 设置关闭了对话框的回调函数
                $( "#choose_thing_dialog" ).on('dialogclose', function(event) {
                    // 去除dialogclose，不然每次对话框弹出后都要清理
                    $( "#choose_thing_dialog" ).off('dialogclose');
                    //删除所有子节点
                    while (dialog_t.hasChildNodes()) {
                        dialog_t.removeChild(dialog_t.firstChild);
                    }
                });

                $( "#choose_thing_dialog" ).dialog({
                  autoOpen: true,
                  modal: true,
                  width: 855,
                  height: 600,
                  show: {
                    effect: "slide",
                    duration: 500
                  },
                  open: function(event, ui){
                    if(debug == true){
                        setTimeout("$('#choose_thing_dialog').dialog('close')",debug_time);
                    }
                  },
                  hide: {
                    effect: "fade",
                    duration: 100
                  }
                }).css("text-align",'center');

                //buttons样式
                $('#choose_thing_dialog').dialog("option", "buttons", [
                    {
                        text: "关闭",
                        width: "100",
                        height:'50',
                        click: function () { $(this).dialog("close"); }
                    }
                ]);
               });
            //End
        }

        

        // //显示超凡者
        // this.showPartner = function(class_name){
        //     var div_t = document.getElementsByClassName(class_name)[0];
        //     var img = document.createElement("img");
        //     img.setAttribute("src",urlABS("./img/partner.png"));
        //     var d = {marginTop: '40px',
        //             marginLeft: '45px',
        //             width: '40px',
        //             height: '40px',
        //             background: 'rgb(42 242 22)',
        //             borderRadius: '50%',
        //             textAlign: 'center',
        //             fontSize: '30px',
        //             color: '#da0c0c'}
        //     for(var k in d){
        //         div_t.style[k] = d[k];
        //     }
        //     div_t.appendChild(img);
        // }
        //修改img标签的src并显示出来，img_url需要是绝对路径
        // this.modifyIMGSRC = function (class_name, img_url) {
        //     document.getElementsByClassName(class_name)[0].setAttribute("src", img_url);
        //     document.getElementsByClassName(class_name)[0].style.display = "inline";

        // };

        

        this.changeStatus = function (message) {
            var id_name = "status";
            document.getElementById(id_name).innerHTML = message;
            console.log("[+]status:" + message);
            // this.addLog(message);
        };

        this.addStatus = function (msg) {
            var id_name = "status";
            document.getElementById(id_name).innerHTML += "\r\n\r\n" + msg;
            console.log("[+]status(add):" + msg);
        };

        this.clearLog = function (message) {
            //删除所有子节点
            var log_t = document.getElementById('log');
            while (log_t.hasChildNodes()) {
                log_t.removeChild(log_t.firstChild);
            }
            const new_p = document.createElement("p");
            new_p.innerHTML = "[部分操作日志：]";
            log_t.appendChild(new_p);
        };

        this.addLog = function (message) {
            const new_p = document.createElement("p");
            new_p.innerHTML = message;
            var id_name = "log";
            document.getElementById(id_name).appendChild(new_p);
            console.log("[+]log:" + message);
        };

        this.use_skill_this_turn = false;
        // 更新时间轴信息 use_skill_this_turn 是逻辑值
        this.updateTimeAxis = function (now_time, accumulated_success_task,use_skill_this_turn) {
            if (now_time >= 5) {
                this.use_skill_this_turn = use_skill_this_turn; //更新招募者是否使用技能状态
                if (now_time % 2 == 0) {
                    document.getElementsByClassName("circle" + (now_time - 4))[0].style.background = "gray";
                    // 偶数点如果使用了技能也会公布
                    if(use_skill_this_turn){
                        document.getElementsByClassName("timeline-task-process"+(now_time-4))[0].innerHTML = "<b>[对方使用技能]</b>"
                    }
                } else {
                    //只在奇数点显示状态和使用技能情况
                    document.getElementsByClassName("circle" + (now_time - 4))[0].style.background = "red";
                    document.getElementsByClassName("timeline-common-description" + (now_time - 4))[0].innerHTML = "累计完成";
                    document.getElementsByClassName("timeline-task-process" + (now_time - 4))[0].innerHTML = accumulated_success_task + "次(<font color='red'>" + accumulated_success_task + "/12</font>)";
                    if(use_skill_this_turn){
                        document.getElementsByClassName("timeline-skill-status"+(now_time-4))[0].innerHTML = "<b>[对方使用技能]</b>"
                    }
                }
                if (now_time > 5) { //将上一个时间节点变为空心
                    document.getElementsByClassName("circle" + (now_time - 5))[0].style.background = "white";
                }
            }
        };

        //额外物品槽储存的物品信息
        var partner_thing_info = {
            'extra_item1':'',
            'extra_item2':''
        } //key是html物品槽的图像class_name，储存thing的16个name

        this.partner_thing_array = []; //记录超凡者同伙的所有接头物品
        //额外物品槽
        this.setPartnerThing = function(thing_name){
            for(var class_name in partner_thing_info){
                if(partner_thing_info[class_name] == ''){
                    var img = document.getElementsByClassName(class_name)[0]
                    img.setAttribute("src", this.name2img(thing_name));
                    img.style.display = "inline";
                    partner_thing_info[class_name] = thing_name;
                    this.partner_thing_array.push(thing_name);
                    return 1;
                }
            }
            console.log("试图放入新的额外物品，但是没槽位了")
            return -1; //没有空位置了
        }

        this.rmPartnerThing = function(thing_name){
            for(var class_name in partner_thing_info){
                if(partner_thing_info[class_name] == thing_name){
                    partner_thing_info[class_name] = "";
                    var img = document.getElementsByClassName(class_name)[0]
                    img.setAttribute("src","");
                    img.style.display = "none";
                    return 1;
                }
            }
            console.log("移除的额外物品并不存在");
            return -1;//物品不存在
        }

        this.getPartnerThingArray = function(){
            var thing_name_array = [];
            for(var class_name in partner_thing_info){
                if(partner_thing_info[class_name]!=""){
                    thing_name_array.push(partner_thing_info[class_name]);
                }
            }
            return thing_name_array;
        }

        // 招募者三个物品槽
        var recruiter_thing_info = {
            'recruiter_item1':'',
            'recruiter_item2':'',
            'recruiter_item3':''
        } //key是html物品槽的图像class_name，储存thing的16个name

        function recruiterthing2img(thing_name){
            return urlABS("./img/"+thing_name+".png")
        }
        

        this.setRecruiterThing = function(thing_name){
            for(var class_name in recruiter_thing_info){
                if(recruiter_thing_info[class_name] == ''){
                    var img = document.getElementsByClassName(class_name)[0]
                    img.setAttribute("src", recruiterthing2img(thing_name));
                    img.style.display = "inline";
                    recruiter_thing_info[class_name] = thing_name;
                    return 1;
                }
            }
            console.log("试图放入招募者的物品，但是没槽位了")
            return -1; //没有空位置了
        }

        this.rmRecruiterThing = function(thing_name){
            for(var class_name in recruiter_thing_info){
                if(recruiter_thing_info[class_name] == thing_name){
                    recruiter_thing_info[class_name] = "";
                    var img = document.getElementsByClassName(class_name)[0]
                    img.setAttribute("src","");
                    img.style.display = "none";
                    return 1;
                }
            }
            console.log("移除的招募者物品并不存在");
            return -1;//物品不存在
        }

        this.getRecruiterThingArray = function(){
            var thing_name_array = [];
            for(var class_name in recruiter_thing_info){
                if(recruiter_thing_info[class_name]!=""){
                    thing_name_array.push(recruiter_thing_info[class_name]);
                }
            }
            return thing_name_array;
        }

        // 按钮对应html button id值的字典
        var button2idname = {
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
        // 显示按钮并设置监听事件，无需确认，点击后自动清除监听事件并隐藏按钮(未来优化加入确认环节)
        //button_name_array示例['move','skill']
        // 监听函数的名称列表，不接受传参，或者带参数但是已经bind过的
        //listener_cb_func_array每个元素必须是var xx变量定义的
        this.autoSetButtonClickListener = function(button_name_array,listener_cb_func_array){
            var new_handler_array = [];
            for(var i in button_name_array){
                if(!(button_name_array[i] in button2idname)){
                    console.log("autoSetButtonClickListener错误：你传入的button_name_array存在错误关键词:",button_name_array);
                    continue;
                }
                var button_id_name = button2idname[button_name_array[i]];
                this.showItemButton(button_id_name);
                var new_handler = function(i){
                    clear(op); //在调用这个句柄所在空间搜索op
                    listener_cb_func_array[i](); //这个参数需要绑定，不然就读取了i的最终值
                }.bind(this,i);
                new_handler_array.push(new_handler);
                document.getElementById(button_id_name).addEventListener("click",new_handler);
            }
            // 由于要在外部调用不能出现this
            var clear = function(op){
                for(var i in button_name_array){
                    if(!(button_name_array[i] in button2idname)){
                        console.log("autoSetButtonClickListener错误：你传入的button_name_array存在错误关键词:",button_name_array);
                        continue;
                    }
                    var button_id_name = button2idname[button_name_array[i]];
                    op.hideItemButton(button_id_name);
                    document.getElementById(button_id_name).removeEventListener("click",new_handler_array[i]);
                }
            }
        }

        this.showFocusAgent = function(agent_name){
            var f_img = document.getElementById("focusedAgent")
            f_img.setAttribute("src",this.name2img(agent_name))
            f_img.style.display = 'inline';
        }

        this.clearShowFocusAgent = function(){
            var f_img = document.getElementById("focusedAgent")
            f_img.setAttribute("src","")
            f_img.style.display = 'none';
        }

        // 同上只是，不自动添加clear操作，而是返回clear函数句柄
        //listener_cb_func_array每个元素必须是var xx变量定义的
        this.setButtonClickListener = function(button_name_array,listener_cb_func_array){
            var new_handler_array = [];
            for(var i in button_name_array){
                if(!(button_name_array[i] in button2idname)){
                    console.log("autoSetButtonClickListener错误：你传入的button_name_array存在错误关键词:",button_name_array);
                    continue;
                }
                var button_id_name = button2idname[button_name_array[i]];
                this.showItemButton(button_id_name);
                var new_handler = function(i){
                    listener_cb_func_array[i](); //这个参数需要绑定，不然就读取了i的最终值
                }.bind(this,i);
                new_handler_array.push(new_handler);
                document.getElementById(button_id_name).addEventListener("click",new_handler);
            }
            // 由于要在外部调用不能出现this
            var clear = function(op){
                for(var i in button_name_array){
                    if(!(button_name_array[i] in button2idname)){
                        console.log("autoSetButtonClickListener错误：你传入的button_name_array存在错误关键词:",button_name_array);
                        continue;
                    }
                    var button_id_name = button2idname[button_name_array[i]];
                    op.hideItemButton(button_id_name);
                    document.getElementById(button_id_name).removeEventListener("click",new_handler_array[i]);
                }
            }
            return clear;
        }

        this.Item2IntervalId = {};

        //
        this.isStandOut = function(item_name){
            if((item_name in this.Item2IntervalId)&&(this.Item2IntervalId[item_name].length >0)){
                return true;
            }else{
                return false;
            }
        }
        // 让招募者的第几步闪烁
        this.standOutRecruiter = function(step){
            step = Number(step)
            if(step > recruiter_trace){
                console.log('错误，尝试让第'+step+'步闪烁，但是招募者现在只走了'+recruiter_trace.length);
                return;
            }
            if(step==0){
                console.log("step参数是0，招募者没有第0步")
                return;
            }
            var div_num = recruiter_trace[step-1];
            var div_t = document.getElementsByClassName(divnum2layerclassname(div_num,3))[0];
            var intervalId1 = setInterval(function(){div_t.style.opacity = 0.4;},250);
            var intervalId2 = setInterval(function(){div_t.style.opacity = 1;},500);
            var key_name = 'recruiter_step'+step;
            if((key_name in this.Item2IntervalId)&&(this.Item2IntervalId[key_name].length >0)){
                console.log("[注意]standOut对"+key_name+"又执行了一遍");
            }
            this.Item2IntervalId[key_name] = [intervalId1,intervalId2];
        }

        this.clearStandOutRecruiter = function(step){
            var key_name = 'recruiter_step'+step;
            if(!(key_name in this.Item2IntervalId)){
                console.log("[错误]"+key_name+"还没有调用过standOut就执行了clearStandOut");
                return;
            }
            console.log(key_name+"清除了闪烁效果")
            for(var i in this.Item2IntervalId[key_name]){
                clearInterval(this.Item2IntervalId[key_name][i])
            }
            var div_num = recruiter_trace[step-1];
            var div_t = document.getElementsByClassName(divnum2layerclassname(div_num,3))[0];
            div_t.style.opacity = 1; 
            this.Item2IntervalId[key_name] = [];
            console.log("执行了对"+key_name+"的clearStandOut,",this.Item2IntervalId[key_name]);
        }

        //在地图上让图标闪烁
        this.standOut = function(item_name){
            console.log(item_name+"添加了闪烁效果")
            var img_t = this.getItemTag(item_name);
            var intervalId1 = setInterval(function(){img_t.style.opacity = 0.4;},250);
			//再次调用setInterval()函数,每隔0.5秒显示 时间差就可以形成图片闪烁功能;
			var intervalId2 = setInterval(function(){img_t.style.opacity = 1;},500);
            if((item_name in this.Item2IntervalId)&&(this.Item2IntervalId[item_name].length >0)){
                console.log("[注意]standOut对"+item_name+"又执行了一遍");
            }
            this.Item2IntervalId[item_name] = [intervalId1,intervalId2];
        };
        this.clearStandOut = function(item_name){
            if(!(item_name in this.Item2IntervalId)){
                console.log("[错误]"+item_name+"还没有调用过standOut就执行了clearStandOut");
                return;
            }
            console.log(item_name+"清除了闪烁效果")
            for(var i in this.Item2IntervalId[item_name]){
                clearInterval(this.Item2IntervalId[item_name][i])
            }
            var img_t = this.getItemTag(item_name);
            img_t.style.opacity = 1; 
            this.Item2IntervalId[item_name] = [];
            console.log("执行了对"+item_name+"的clearStandOut,",this.Item2IntervalId[item_name]);
        };

        //设置地图上的特工、超凡者等东西的监听事件，无需确认
        //不会自动清理设置的监听事件、特效等操作，但是会返回清理函数
        //listener_cb_func_array每个元素必须是var xx变量定义的
        this.setItemClickListener = function(item_name_array,listener_cb_func_array){
            var new_handler_array = [];
            for(var i in item_name_array){
                var item_name = item_name_array[i];
                if(this.getItemTag(item_name)==-1){
                    console.log("setItemClickListener错误：你传入的item_name_array存在错误关键词:",item_name_array);
                    continue;
                }
                this.standOut(item_name);
                var img_t = op.getItemTag(item_name);
                // console.log("setItemClickListener里面:",listener_cb_func_array);
                var new_handler = function(i){
                    listener_cb_func_array[i](); //这个参数需要绑定，不然就读取了i的最终值
                }.bind(this,i);
                new_handler_array.push(new_handler);
                var img_t = this.getItemTag(item_name);
                img_t.addEventListener("click",new_handler);
            }
            // 由于要在外部调用不能出现this
            var clear = function(op){
                for(var i in item_name_array){
                    var item_name = item_name_array[i];
                    if(op.getItemTag(item_name)==-1){
                        console.log("setItemClickListener错误：你传入的item_name_array存在错误关键词:",item_name_array);
                        continue;
                    }
                    op.clearStandOut(item_name);
                    var img_t = op.getItemTag(item_name);
                    img_t.removeEventListener("click",new_handler_array[i]);
                }
            }
            return clear;
        }
        this.obstacle_path = []; //存放障碍物 无法通过的路径 "3-4" "4-3"
        this.place_obstacle = function(node_array){
            var direction2attributevalue = {
                0:"Right",
                1:"Bottom",
                2:"Left",
                3:"Top"
            };
            //清空地图上的所有边界，并重置所有相关状态变量
            this.clearAllBorder();
            this.obstacle_path = [];
            for(var node_key in node_array){
                var direction = node_array[node_key];
                var div_num = (parseInt(node_key/5)+1)+parseInt(node_key);
                if(direction >= 2){div_num = div_num+7;}
                // console.log("[put]"+map[div_num].class_name+" "+direction2attributevalue[direction]);
                this.putFence(div_num,direction2attributevalue[direction]);
                // 添加障碍情况到obstacle_path变量
                var other_div_num;
                if(direction == 0)other_div_num = div_num+1;
                if(direction == 1)other_div_num = div_num+6;
                if(direction == 2)other_div_num = div_num-1;
                if(direction == 3)other_div_num = div_num-6;
                this.obstacle_path.push(div_num+"-"+other_div_num);
                this.obstacle_path.push(other_div_num+"-"+div_num);
            }
            console.log("obstacle_path:",this.obstacle_path);
        }

        // 优化体验的极致交互操作
        // mover_handler接受一个clicked_div_num参数
        // buttonhandler接受一个清理句柄
        // 得到每种地图物件的一栋候选处理格子
        this.item2getNeighborHandler = {
            'Bill':moveAgentWithoutRecord,
            'Dusty':moveAgentWithoutRecord,
            'Herry':moveAgentWithoutRecord,
            'Meru':moveAgentWithoutRecord,
            'partner1':movePartnerWithoutRecord,
            'partner2':movePartnerWithoutRecord,
            'partner3':movePartnerWithoutRecord,
            'partner4':movePartnerWithoutRecord,
            'recruiter':moveRecruiterWithoutRecord
        }

        // 新的交互接口
        this.interact = function(candicate_map_item_array,move_confirmed_handler,button_handler_dict){
            //显示按钮并设置监听事件
            for(var button_key_name in button_handler_dict){
                op.showItemButton(button2idname[button_key_name])
                document.getElementById(button_idname[button_key_name]).addEventListener("click", button_handler_dict[button_key_name]);
            }
            var rightSideButtonClear = function(){
                for(var button_key_name in button_handler_dict){
                    document.getElementById(button_idname[button_key_name]).removeEventListener("click", button_handler_dict[button_key_name]);
                    op.hideItemButton(button_idname[button_key_name]); 
                }
            }
        }
    }
}


// 点击按钮通过弹窗让用户确认是否选择
function interactForButtonClear(button_handler_dict,confirmed_cbfunc){
    
}


// 新的用户交互并确认选择哪个格子的函数
// first_clicked_cb_func 第一次点击了候选格子会调用的函数
// canceled_cb_func点击cancel会执行的操作
// confirmed_cbfun接受一个clicked_div_num参数
// 返回的清理句柄负责清理候选格子，以及判断是否需要清理clicked状态，按钮
// 如果选择了格子，必须要确保要么点击confirm要么点击cancel
// 每点击clicked不出现confirm cancel
function NewInteractForDivChoice(div_num_list,confirmed_cbfunc,first_clicked_cb_func,canceled_cb_func){
    // 设置这些候选格子的状态，并且设置点击监听事件
    // 该函数只使用第二层作为候选层
    var choice_div_classname_array = [];
    for(var i in div_num_list){
        var div_num = div_num_list[i];
        choice_div_classname_array.push(divnum2layerclassname(div_num,2)); // 使用layer2画布
    }
    var clicked_div_layer2_class_name = ""; // 用户选择
    var waited_for_confirm = false;
    var is_this_first_clicked = true;
    var setted_click_handler = {};
    function clickHandler(class_name){
        console.log(class_name+" is clicked and waited_for_confirm is ",waited_for_confirm);
        if(is_this_first_clicked == true){
            is_this_first_clicked = false;
            first_clicked_cb_func();
            //显示确认和取消按钮并设置监听事件
            op.showItemButton(button_idname['confirm']);
            document.getElementById(button_idname['confirm']).addEventListener("click", confirmHandler);
            op.showItemButton(button_idname['cancel']);
            document.getElementById(button_idname['cancel']).addEventListener("click", cancelHandler);
        }
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

    var cancelHandler = function(){
        buttonClear();
        clearChoice(); //必须要在buttonClear()后面调用
        console("用户点击了取消，清理button，地图格子所有状态和监听事件")
        canceled_cb_func();
    };
    
    var confirmHandler = function(){
        buttonClear();
        clearChoice(); //必须要在buttonClear()后面调用
        console.log("Player's final choice: ",clicked_div_layer2_class_name);
        confirmed_cbfunc(layerclassname2divnum(clicked_div_layer2_class_name));
    }

    var buttonClear = function(){
        if(clicked_div_layer2_class_name!=""){   
            op.toCandidate(clicked_div_layer2_class_name);
            waited_for_confirm = false;
            clicked_div_layer2_class_name = "";
        }else{
            console.log("[错误]NewInteracrt调用了buttonClear但是用户还没有点击过候选格子")
        }
        //清理按钮的监听事件并隐藏按钮
        document.getElementById(button_idname['confirm']).removeEventListener("click",
            confirmHandler);
        op.hideItemButton(button_idname['confirm']);
        document.getElementById(button_idname['cancel']).removeEventListener("click",
            cancelHandler);
        op.hideItemButton(button_idname['cancel']); 
    }

    // 清理候选格子，以及判断是否需要清理clicked状态，按钮
    var clearChoice = function(){
        console.log("调用了NewInteract清理句柄learChoice")
        //清理候选格子的监听事件
        for(var name in setted_click_handler){
            document.getElementsByClassName(name)[0].removeEventListener("click",
            setted_click_handler[name]);
        }
        //清理候选格子的显示状态
        for(var i in choice_div_classname_array){
            var div_class_name = choice_div_classname_array[i];
            op.revertOrigLayer2DivStyle(div_class_name);
        }       
    }
    return clearChoice
}