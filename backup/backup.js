var clear = function(){
    op.hideItemButton(button_idname['skip'])
    document.getElementById(button_idname['skip']).removeEventListener("click",skipCbFunc);
    for(var partner_item_name in setted_click_handler){
        var img_t = op.getItemTag(partner_item_name);
        img_t.removeEventListener("click",setted_click_handler[partner_item_name]);
    }
}

function skipCbFunc(){
    clear();
    PartnerExtraMove();
}

function partnerChooseCbFunc(i){
    clear();
    console.log("partnerChooseCbFunc参数",i);
    movePartnerWithoutRecord(op,partner_name[i],function(clicked_div_num){
        SynDisplay("updateItem",{'divNum':clicked_div_num,'itemName':partner_name[i]},"移动了超凡者");
        op.autoShowItem(clicked_div_num,partner_name[i]);
        PartnerExtraMove();
    });
}
op.showItemButton(button_idname['skip']);
document.getElementById(button_idname['skip']).addEventListener("click",skipCbFunc);
//设置超凡者同伙的监听事件
for(var i=0;i<partner_name.length;i++){
    var img_t = op.getItemTag(partner_name[i]);
    var hf = partnerChooseCbFunc.bind(this,i);
    img_t.addEventListener("click",hf);
    setted_click_handler[partner_name[i]] = hf;
}


//这个是我初版的候选格子选择函数，每次切换不同的候选格子需要用户先点击cancel，游玩体验太差了
//需要用户交互最终确认选择哪个格子
function InteractForDivChoice(div_num_list,op,callback_function){
    // 设置这些候选格子的状态，并且设置点击监听事件
    //document.getElementById("myBtn").addEventListener("click", displayDate);
    //addEventListener() 方法允许您向相同元素添加多个事件，同时不覆盖已有事件：
    //addEventListener https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
    // 匿名函数如何移除监听事件https://stackoverflow.com/questions/4950115/removeeventlistener-on-anonymous-functions-in-javascript
    // 必看，监听器传参的问题 https://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example
    // https://stackoverflow.com/questions/11565471/removing-event-listener-which-was-added-with-bind
    //可以封装,不要传入choice_cell，直接传class_name list
    
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
    //给确认和取消按钮设置监听事件
    op.showItemButton(button_idname['confirm']);
    op.showItemButton(button_idname['cancel']);
    var cancelHandler = function(){
        console.log("click cancel");
        if(clicked_div_layer2_class_name!=""){
            op.toCandidate(clicked_div_layer2_class_name);
            waited_for_confirm = false;
            clicked_div_layer2_class_name = "";
        }
    }
    var confirmHandler = function(){
        console.log("click confirm");
        //取消所有监听事件、将按钮隐藏、将所有候选格子候选状态取消
        if(clicked_div_layer2_class_name!=""){
            for(var name in setted_click_handler){
                document.getElementsByClassName(name)[0].removeEventListener("click",
                setted_click_handler[name]);
            }
            document.getElementById(button_idname['cancel']).removeEventListener("click",
            cancelHandler);
            document.getElementById(button_idname['confirm']).removeEventListener("click",
            confirmHandler);
            op.hideItemButton(button_idname['confirm']);
            op.hideItemButton(button_idname['cancel']);
            for(var i in choice_div_classname_array){
                var div_class_name = choice_div_classname_array[i];
                op.revertOrigLayer2DivStyle(div_class_name);
            }
            //执行最终操作：
            console.log("Player's final choice: ",clicked_div_layer2_class_name);
            callback_function(layerclassname2divnum(clicked_div_layer2_class_name));
        }
    }

    document.getElementById(button_idname['cancel']).addEventListener("click", cancelHandler);
    document.getElementById(button_idname['confirm']).addEventListener("click", confirmHandler);
}