function urlABS(s){
    return new URL(s, document.baseURI).href
}

//从数组中sample
function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

//删除数组中特定value
function removeArray(A,value){
    const index = A.indexOf(value);
    if (index > -1) { // only splice array when item is found
        A.splice(index, 1); // 2nd parameter means remove one item only
    }
}


function banButton(id_name){
    document.getElementById(id_name).style.display = "none";
}

function allowButton(id_name){
    document.getElementById(id_name).style.display = "inline";
}

//延时
//卡顿主线程绝对不是一个好的选择
function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
}

// function test(a,f){
//     if(f != undefined){
//         return f(a);
//     }else{
//         return -1;
//     }
// }

// getQueryParams(document.location.search)
function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}
