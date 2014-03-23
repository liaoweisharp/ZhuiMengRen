/// <reference path="../jQuery/jquery-1.6.1.min.js" />

var baseData;//{"合同签订状态","项目分类", }
var pageSize;
var requireColumn; //需要的列
var loading;

$(function () {
    $(".ZX_BG_header").hide();
    var html = "<div style='margin:15px auto;'><center>请输入密码：<input id='txtPW' type='password'></center></div>"
    $.jBox(html, { title: "密码", buttons: { "确认": "1" }, submit: function (v) {
        debugger
        if (v == "1") {

            if ($.trim($("#txtPW").val()) == "mingqing") { $.jBox.tip('密码正确', 'success'); $(".ZX_BG_header").show(); initDataDom(); }
            else {
                $.jBox.tip('密码错误，请重试或联系工作人员。', 'error');
                return false;
            }
        }
    }, showClose: false
    });

})
function initDataDom() {
    pageSize=10;
    baseData = {};
    where_HeTong = null;
    requireColumn = ["ht_Number", "ht_MingCheng", "ht_QianDingZhuangTai"];
    loading = "<p><center><img src='../Images/ajax-loader_b.gif'/></center></p>";
    
    $invokeWebService_2("~WebService_HeTong.getInitData", {}, null, successCallBack, errorCallBack, null, "getInitData");
//    $invokeWebService_2("~WebService_HeTong.getHeTongInfo", { htId: 24 }, null, function (result) { 
//        
//    }, errorCallBack, null, "getInitData");
    
}
    

function successCallBack(result,context){

    if (context == "getInitData") {
        baseData["newObject"] = result[0]; // 这个没用了
        baseData["工程地点"] = result[1];
        baseData["获取方式"] = result[2];
        baseData["合同付款方式"] = result[3];
        baseData["合同签订状态"] = result[4];
        baseData["合同执行部门"] = result[5];
        baseData["投资性质"] = result[6];
        baseData["项目分类"] = result[7];
        baseData["业务类型"] = result[8];
        baseData["变更方式"] = result[9];
        baseData["变更监理费类型"] = result[10];
        baseData["发票款项性质"] = result[11];
        baseData["归档情况"] = result[12];


        //开始调用显示合同列表
        callListHeTong(null);
        //开始调用项目前期
        new XMQQ("divPageSize_QQ", "divContent_QQ");
    }
    else if (context.userContent == "getQQnoHeTong") {
        baseData["QianQiNoHeTong"]=result;//没有合同的项目前期
    }
    else if (context.userContent == "countHeTong") {
    
        var optInit = getOptionsFromForm();
        $("#divPageSize").pagination(result, optInit);
        $("#divPageSize").show();
    }
    else if (context.userContent == "filterHeTongWrappper") {
        
        var data = result;
        //#region 日期转换成日期格式
     
        //如果还有不存在Json的日期类型还需要在此处转换
        //#endregion
        baseData["heTongArray"] = data;
        if (data.length == 0) {
            $("#divContent").html("还没有合同的记录哦，要添加一个合同请点击右上角的\"添加\"按钮");
        }
        else {
            var str = getHtmlOfHeTong(data);
            $("#divContent").html(str);
            tableAddStyle();
        }
    }
    else if (context.userContent == "countQianQi") {
        var optInit = getOptionsFromForm_QQ();
        $("#divPageSize_QQ").pagination(result, optInit);
        $("#divPageSize_QQ").show();
    }
    else if (context.userContent == "filterAllXiangMuQianQi") {
        var data = result;
        //#region 日期转换成日期格式
        //        var jsons = createJson().findAll("validate", "datetime");

        //        for (var i = 0; i < jsons.length; i++) {
        //            for (var j = 0; j < data.length; j++) {
        //                if (data[j][jsons[i].itemId]) {
        //                    data[j][jsons[i].itemId] = strToDate(data[j][jsons[i].itemId]).pattern("yyyy-MM-dd");
        //                }
        //            }
        //        }
        //如果还有不存在Json的日期类型还需要在此处转换
        //#endregion
        //baseData["heTongArray"] = data;
        if (data.length == 0) {
            $("#divContentQQ").html("还没有项目前期的记录，要添加请点击右上角的\"添加\"按钮");
        }
        else {
            var str = getHtmlOfHeTong(data);
            $("#divContentQQ").html(str);
            tableAddStyle();
        }
    }
    else if (context == "addHeTong") {

        if (result) {
            initDataDom();
            $.jBox.tip('添加成功。', 'success');
        }
        else {
            $.jBox.tip('添加失败。', 'error');
        }
    }
    else if (context.userContent == "updateHeTong" || context.userContent == "updateHeTongVice" || context.userContent == "updateJieSuan") {
    
        if(result)
        {
            $.jBox.tip('更新成功', 'success');
            pageselectCallback(pd.currentPageNumber, null);
        }
        else{
            $.jBox.tip('更新失败', 'error');
        }
    }
    
    else if (context.userContent == "delHeTong") {
        pageselectCallback(pd.currentPageNumber, null);
    }
    else if (context.userContent == "getHeTongInfo") {
        var jsonOfHeTong = createJson();
        var jsonOfHTV = createJson_htv();
        var jsonOfJieSuan = createJson_jieSuan();

        var ht = result[0];
        conventToDateTime(ht, jsonOfHeTong);
        var htv = result[1];
        debugger
        conventToDateTime(htv, jsonOfHTV);
        var jieSuan = result[2];
        conventToDateTime(jieSuan, jsonOfJieSuan);
       /// var baseData["没有合同的前期"]=result[3];//没有合同的前期并且包含自己
        var id1=context.id1;
        var id2=context.id2;
        var id3=context.id3;
        var type = context.type;
       
        var json= jsonOfHeTong.firstOrDefault("itemId", "ht_QqId");
        if(json){
             var init = [];
            for (var i = 0; i < result[3].length; i++) {
                init.push({id:result[3][i].qq_Id,title:result[3][i].qq_GongChengMingCheng});
            }
            json.init=init;
        }
        
        if(context.type=="review") {

            new bindDiv(jsonOfHeTong, ht, id1, { type: type }, null);
            new bindDiv(jsonOfHTV, htv, id2, { type: type }, null);
            new bindDiv(jsonOfJieSuan, jieSuan, id3, { type: type }, null);
        }
        else if(context.type=="update"){
            new bindDiv(jsonOfHeTong, ht, id1, { type: type }, clickUpdate_HT);
            new bindDiv(jsonOfHTV, htv, id2, { type: type }, clickUpdate_HTV);
            new bindDiv(jsonOfJieSuan, jieSuan, id3, { type: type }, clickUpdate_JieSuan);
        }
    }
}
function errorCallBack(result, context) {
    alert("回调错误");
    
}
//#region Html
//得到合同的记录的html
function getHtmlOfHeTong(heTongs){
      //表头
        var str = [];
    var jsonArray = createJson();
    if (heTongs.length > 0) {
        str.push("<table class='tbHetong' cellspacing='0' cellpadding='6'>");
        str.push("<tr class='header'>");
        str.push("<td class='td1'>合同号</td>");
        str.push("<td class='td2'>合同名称</td>");
        str.push("<td class='td11'>执行类型</td>");
        str.push("<td class='td3'>暂定监理费总额</td>");
        str.push("<td class='td4'>累计应收款总额</td>");
        str.push("<td class='td5'>累计实收款总额</td>");
        str.push("<td class='td6'>累计开票总额</td>");
        str.push("<td class='td7'>履约金</td>");
        str.push("<td class='td8'>质保金</td>");                                                                                                                           
        str.push("<td class='td9'>合同执行</td>");
        str.push("<td class='td10'>操作</td>");
        str.push("</tr>");
        //表内容
        for (var i = 0; i < heTongs.length; i++) {
            var ht = heTongs[i];
            str.push("<tr class='row'>");
            str.push(String.format("<td class='td1'><a href='javascript:void(0);' onclick=\"clickDetail({1})\">{0}</a></td>", ht.ht_Number == null ? "" : ht.ht_Number,ht.ht_Id));
            str.push(String.format("<td class='td2'>{0}</td>", ht.ht_MingCheng == null ? "" : ht.ht_MingCheng));
            str.push(String.format("<td class='td11'>{0}</td>", ht.zhiXingLeiXing == null ? "" : ht.zhiXingLeiXing));
            str.push(String.format("<td class='td3'>{0}</td>", ht.zanJianLiFeiZongE == null ? "" : "<label validate='money'>" + ht.zanJianLiFeiZongE + "</label>"));
            str.push(String.format("<td class='td4'>{0}</td>", ht.yingShouKuanZongE == null ? "" : "<label validate='money'>" + ht.yingShouKuanZongE + "</label>"));
            str.push(String.format("<td class='td5'>{0}</td>", ht.yiShouKuanZongE == null ? "" : "<label validate='money'>" + ht.yiShouKuanZongE + "</label>"));
            str.push(String.format("<td class='td6'>{0}</td>", ht.leJiYiKaiPiaoZongE == null ? "" : "<label validate='money'>" + ht.leJiYiKaiPiaoZongE + "</label>"));
            str.push(String.format("<td class='td7'>{0}</td>", ht.isTuiLvYue ? "已退" : "未退"));
            str.push(String.format("<td class='td8'>{0}</td>", ht.isTuiZhiBao ? "已退" : "未退"));


            str.push(String.format("<td class='td9'><a href='javascript:void(0);' onclick=\"clickZhiXing('{0}','{1}')\">合同执行</a></td>", ht.ht_Id, ht.ht_MingCheng));

            str.push(String.format("<td class='td10'><span class='opation'><a href='javascript:void(0);' onclick=\"clickEdit({0})\">编辑</a>|<a href='javascript:void(0);' onclick=\"clickDel({0})\">删除</a></span></td>",ht.ht_Id));
            
            str.push("</tr>");
        }
  

        str.push("</table>");
    }
    return str.join("");
}
function getHtmlOfZhiXing(htId) {
    var heTong=baseData["heTongArray"].firstOrDefault("ht_Id",htId);
    if(!heTong) return "";
    var htNumber=heTong.ht_Number;
    var htName = heTong.ht_MingCheng;
    var str=[];
    //合同变更与争议
    str.push("<div style='width:97%;margin:8px auto;'>");
    str.push(String.format("<div class='divZX_name'><span class='ZX_name'>{0} &nbsp;&nbsp;{1}</span></div>", htNumber, htName));
    str.push("<div class='ZX_BG_header ZX_h'>");
    str.push("<ul class='ulnone'>");
    str.push("<li class='ZX_title'>合同变更与争议</li>");
    str.push(String.format("<li class='bg_A' style='float:right;'><a href='javascript:void(0);' onclick=\"HTBG.Add('{0}')\" >添加</a></li>", htId));
    str.push("</ul>");
    str.push("<br/>");
  
    str.push("</div>");

    str.push(String.format("<div id='{0}' class='ZX_con'>", HTBG.Prefix + htId));
//    str.push("<table class='tab' style='width:100%;' cellspacing='0' cellpadding='4'>");
//    str.push("<tr class='header'>");
//    str.push("<td class='td1'>补充合同名称</td>");
//    str.push("<td class='td2'>补充合同编号</td>");
//    str.push("<td class='td3'>(预计)补充签订费用(万元)</td>");
//    str.push("<td class='td4'>产值分成比例(%)</td>");
//    str.push("<td class='td5'>原因及简要说明</td>");
//    str.push("<td class='td6'>补充费用起始计费日期</td>");
//    str.push("<td class='td7'>争议内容</td>");
//    str.push("</tr>");
//    str.push("<tr>")
//    str.push("<td class='td1'>名称1</td>");
//    str.push("<td class='td2'>120</td>");
//    str.push("<td class='td3'>122.5</td>");
//    str.push("<td class='td4'>50</td>");
//    str.push("<td class='td5'>原因1...</td>");
//    str.push("<td class='td6'>2013-07-09</td>");
//    str.push("<td class='td7'>争议内容....</td>");
//   
//    str.push("</tr>")
//    str.push("</table>");
    str.push("</div>");
    //收款计划
    str.push("<div class='ZX_JH_header ZX_h'>");
    str.push("<ul class='ulnone'>");
    str.push("<li class='ZX_title'>收款计划</li>");
    str.push(String.format("<li class='bg_A' style='float:right;'><a href='javascript:void(0);' onclick=\"SKJH.Add('{0}')\">添加</a></li>", htId));
    str.push("</ul>");
    str.push("<br/>");
    str.push("</div>");
    str.push(String.format("<div id='{0}' class='ZX_con'>", SKJH.Prefix + htId));
    str.push("</div>");

    //发票管理
    str.push("<div class='ZX_GL_header ZX_h'>");
    str.push("<ul class='ulnone'>");
    str.push("<li class='ZX_title'>发票及收款</li>");
    str.push(String.format("<li class='bg_A' style='float:right;'><a href='javascript:void(0);' onclick=\"FPGL.Add('{0}')\">添加</a></li>", htId));
    str.push("</ul>");
    str.push("<br/>");
    str.push("</div>");
    str.push(String.format("<div id='{0}' class='ZX_con'>", FPGL.Prefix + htId));
    str.push("</div>");

    //收款情况
//    str.push("<div class='ZX_QK_header ZX_h'>");
//    str.push("<ul class='ulnone'>");
//    str.push("<li class='ZX_title'>收款情况</li>");
//    str.push(String.format("<li class='bg_A' style='float:right;'><a href='javascript:void(0);' onclick=\"SKQK.Add('{0}')\">添加</a></li>",htId));
//    str.push("</ul>");
//    str.push("<br/>");
//    str.push("</div>");
//    str.push(String.format("<div id='{0}' class='ZX_con'>", SKQK.Prefix + htId));
//    str.push("</div>");
//    str.push("</div>");
    return str.join("");
}
function getTabsHtml(id,id1,id2,id3) {
    var str = [];
    str.push(String.format("<div id='{0}' class='tabsP'>", id));
    str.push("<ul>");
    str.push(String.format("<li><a href='#{0}'>合同基本项</a></li>", id1));
    str.push(String.format("<li><a href='#{0}'>合同更多</a></li>",id2));
    str.push(String.format("<li><a href='#{0}'>合同结算</a></li>",id3));
    str.push("</ul>");
    str.push(String.format("<div class='tabsContent' style='background-color:White;' id='{0}'></div>",id1));
    str.push(String.format("<div class='tabsContent' style='background-color:White;' id='{0}'></div>", id2));
    str.push(String.format("<div class='tabsContent' style='background-color:White;' id='{0}'></div>", id3));
    str.push("</div>");
    return str.join("");
}
//#endregion

//#region 句柄
//点击合同执行
function clickUpdate_HT(event) {

    var jsonArray = event.data.newBind.ShouJiData();
    var obj = bind.jsonToObject(jsonArray);
    obj["ht_Id"] = event.data.obj.ht_Id;
    $invokeWebService_2("~WebService_HeTong.updateHeTong", { heTong: obj }, null, successCallBack, errorCallBack, null, { userContent: "updateHeTong" });
}
function clickUpdate_HTV(event) {
    
    var jsonArray = event.data.newBind.ShouJiData();
    var obj = bind.jsonToObject(jsonArray);
    obj["htv_Id"]=event.data.obj.htv_Id;
    $invokeWebService_2("~WebService_HeTong.updateHeTongVice", {htv:obj}, null, successCallBack, errorCallBack, null,{userContent:"updateHeTongVice"});
}
function clickUpdate_JieSuan(event) {
    
    var jsonArray = event.data.newBind.ShouJiData();
    var obj = bind.jsonToObject(jsonArray);
    obj["js_Id"]=event.data.obj.js_Id;
    $invokeWebService_2("~WebService_HeTong.updateJieSuan", {jieSuan:obj}, null, successCallBack, errorCallBack, null,{userContent:"updateJieSuan"});
}
function clickZhiXing(htId) {
    var str = getHtmlOfZhiXing(htId);
    $.jBox(str, { buttons: { "关闭": "0" }, height: 550, width: 880, top: "3%", title: "合同执行" });
    $invokeWebService_2("~WebService_HeTong.getHTAndChild", { htId: htId }, null, function (result, context) {
        baseData["合同以及变更"] = result;
        HTBG.InitDom(htId);
        SKJH.InitDom(htId);
        FPGL.InitDom(htId);

    }, errorCallBack, null, null);
}
//重新得到合同以及变更合同
function getHeTongAndChild(htId) {
    $invokeWebService_2("~WebService_HeTong.getHTAndChild", { htId: htId }, null, function (result, context) {
        baseData["合同以及变更"] = result;
    }, errorCallBack, null, null);
}
//添加合同
var click_AddHeTong = function () {
    //生成json
    //
    $invokeWebService_2("~WebService_HeTong.getQQnoHeTong", {}, null, function (result, context) {
    
        var option = { type: "new" };
        //jBox options
        var optionJbox = { title: "添加合同", width: 850, buttons: { "添加": "1", "取消": "0" }, top: "3%", submit: _clickAdd };

        var jsonArray = createJson();
        var init = [];
        for (var i = 0; i < result.length; i++) {
            init.push({id:result[i].qq_Id,title:result[i].qq_GongChengMingCheng});
        }
        jsonArray.firstOrDefault("itemId", "ht_QqId")["init"]=init;//添加初始值
        var bindObj = new bind(jsonArray, null, option, optionJbox);
    }, errorCallBack, null, "getQQnoHeTong");

}
function clickDetail(htId) {
    var id = String.randomString(6);
    var id1 = String.randomString(6);
    var id2 = String.randomString(6);
    var id3 = String.randomString(6);
    var str = getTabsHtml(id, id1, id2, id3);
    $("#" + id1).html(loading);
    $("#" + id2).html(loading);
    $("#" + id3).html(loading);

    $.jBox(str, { title: "合同详细" , width:900, height:700,top:"3%"});
    $("#" + id).tabs();
    $invokeWebService_2("~WebService_HeTong.getHeTongInfo", {htId:htId}, null, successCallBack, errorCallBack, null, {userContent:"getHeTongInfo",type:"review",id1:id1,id2:id2,id3:id3});
}

function clickEdit(htId) {
    var id = String.randomString(6);
    var id1 = String.randomString(6);
    var id2 = String.randomString(6);
    var id3 = String.randomString(6);
    var str = getTabsHtml(id, id1, id2, id3);
    $("#" + id1).html(loading);
    $("#" + id2).html(loading);
    $("#" + id3).html(loading);

    $.jBox(str, { title: "编辑合同相关" ,width:900 ,top:"3%", buttons:{}});
    $("#" + id).tabs();
    $invokeWebService_2("~WebService_HeTong.getHeTongInfo", { htId: htId }, null, successCallBack, errorCallBack, null, { userContent: "getHeTongInfo", type: "update", id1: id1, id2: id2, id3: id3 });
}
function clickDel(htId) {
    $.jBox.confirm(String.format("<input type='hidden' value='{0}'>你确定要删除这份合同记录吗？对应的\"\合同与变更\"、\"收款计划\"等，会一起删除", htId), "确定删除吗？",_clickDel,{ buttons: { "删除": "1", "取消": "0" }})
}
function _clickAdd(v,h, f) {
    
    if (v == "1") {
        var bindObj = h.find("[name='" + bind.Obj + "']").data("data");
        var jsonArray = bindObj.ShouJiData();
        var newHeTong = bind.jsonToObject(jsonArray);

        
        $invokeWebService_2("~WebService_HeTong.addHeTong", { heTong: newHeTong }, function () {
            $.jBox.tip("添加新合同，请稍后...", 'loading');
        }, successCallBack, errorCallBack, function () {
            $.jBox.tip('完成。', 'success');
        }, "addHeTong");
    }

    
    return true;
}
function _clickEdit(v,h,f){
    if (v == "1") {
        var bindObj = h.find("[name='" + bind.Obj + "']").data("data");
        var jsonArray = bindObj.ShouJiData();
        
        var _newHeTong = bind.jsonToObject(jsonArray);
        _newHeTong["ht_Id"] = bindObj.obj.ht_Id;
        //var newHeTong = $.extend({}, bindObj.heTong, _newHeTong);
        //delete newHeTong.__type;
        $invokeWebService_2("~WebService_HeTong.updateHeTong", { heTong: _newHeTong }, function () {
            $.jBox.tip("更新中，请稍后...", 'loading');
        }, successCallBack, errorCallBack, function () {
            $.jBox.tip('完成。', 'success');
        }, { userContent: "updateHeTong" });
    }
    return true;
}
function _clickDel(v, h, f) {
    if (v == "1") {
        var htId = h.find("input[type='hidden']").attr("value");
        $invokeWebService_2("~WebService_HeTong.delHeTong", { id: htId }, null, successCallBack, errorCallBack, null, { userContent: "delHeTong" });
    }
    return true;
}
//开始调用显示合同列表
function callListHeTong(where) {

    $invokeWebService_2("~WebService_HeTong.countHeTong", { pageClass: null, where: where }, null, successCallBack, errorCallBack, null, { userContent: "countHeTong"});
}
function Click_Search_HeTong() {
    var value = $.trim($("#txtSerHeTong").val());
    if (value == "") {
        alert("搜索内容为空，请填值再搜索。");
        value=null;
    }
   
    callListHeTong(value);
    where_HeTong=value;
}

//#endregion
//#region 生成json
function createJson() {
    var jsonArray = [];
    jsonArray.push({ itemId: "ht_QqId", type: "select", title: "项目前期" });
    jsonArray.push({ itemId: "ht_Number", type: "text", title: "合同号" });
    jsonArray.push({itemId:"ht_MingCheng",type:"text",title:"合同名称"});
    
    //jsonArray.push({itemId:"ht_QianDingZhuangTai",type:"select",title:"合同签订状态",init:getInit(baseData["合同签订状态"],"zt_")});
    jsonArray.push({itemId:"ht_YeZhuHeTongBianHao",type:"text",title:"业主合同编号"});
    jsonArray.push({itemId:"ht_YeZhuMingCheng",type:"text",title:"业主名称"});
    jsonArray.push({itemId:"ht_XiangGuanDanWei",type:"text",title:"项管单位"});
    jsonArray.push({itemId:"ht_YiFangQianYueDanWei",type:"text",title:"乙方签约单位"});
    jsonArray.push({itemId:"ht_QianYueRiQi",type:"text",validate:"datetime",title:"合同签约日期"});
    jsonArray.push({ itemId: "ht_XiangMuFenLei", type: "select", title: "项目分类", init: getInit(baseData["项目分类"], "fl_") });
    jsonArray.push({ itemId: "ht_HuoQuFangShi", type: "select", title: "获取方式", init: getInit(baseData["获取方式"], "fs_") });
    jsonArray.push({ itemId: "ht_GongChengDiDian", type: "select", title: "工程地点", init: getInit(baseData["工程地点"], "dd_") });
    jsonArray.push({ itemId: "ht_TouZiXinZhi", type: "select", title: "投资性质", init: getInit(baseData["投资性质"], "xz_") });
    jsonArray.push({ itemId: "ht_GongChengZongTouZi", type: "text", validate: "money", title: "工程总投资（万元）" });
    jsonArray.push({ itemId: "ht_ShouFeiFangShi", type: "text", title: "收费方式" });
    jsonArray.push({ itemId: "ht_HeTongJinE", type: "text", validate: "money", title: "合同金额（万元）" });
//    jsonArray.push({itemId:"ht_JianLiFeiLv",type:"text",title:"监理费率（%）"});
//    jsonArray.push({ itemId: "ht_HeTongJieSuanJinE", type: "text", validate: "money", title: "合同结算金额（万元）" });
    jsonArray.push({ itemId: "ht_HeTongZhiXingBuMen", type: "select", title: "合同执行部门", init: getInit(baseData["合同执行部门"], "bm_") });
    jsonArray.push({ itemId: "ht_YeWuLeiXing", type: "select", title: "业务类型", init: getInit(baseData["业务类型"], "lx_") });
//    jsonArray.push({itemId:"ht_ChanZhiShengChengBili",type:"text",title:"产值生成比例"});
    jsonArray.push({ itemId: "ht_HeTongFuKuanFangShi", type: "select", title: "合同付款方式", init: getInit(baseData["合同付款方式"], "fk_") });
    jsonArray.push({ itemId: "ht_ShiGongFuWuQiXian", type: "text", title: "施工阶段监理服务期限" });
    jsonArray.push({ itemId: "ht_JianLiFuWuQiXian", type: "text", title: "监理服务期限" });
    jsonArray.push({ itemId: "ht_HeTongKaiShiRiQi",type:"text", validate: "datetime", title: "合同开始日期" });
    jsonArray.push({ itemId: "ht_HeTongJieShuRiQi", type:"text",validate: "datetime", title: "合同结束日期" });
    //jsonArray.push({ itemId: "ht_HeTongGongQi", type: "text", title: "合同工期" });
    //jsonArray.push({ itemId: "ht_HeTongJieSuanRiQi", type: "text", validate: "datetime", title: "合同结算日期" });
    jsonArray.push({itemId:"ht_DangAnJieShouRen",type:"text",title:"档案接收人"});
    jsonArray.push({ itemId: "ht_HeTongNeiRong", type: "ntext", title: "合同主要条款" });
    //jsonArray.push({itemId:"ht_HeTongBianGeng",type:"text",title:"合同变更"});
    //jsonArray.push({itemId:"ht_GongSiGuanLiFeiLv",type:"text",title:"公司管理费率"});
    //jsonArray.push({ itemId: "ht_ShiFouKouShuiJin", type: "select", title: "是否扣税金", init: [{ id: "1", title: "是" }, { id: "2", title: "否"}] });
    jsonArray.push({ itemId: "ht_ZhiBaoJin", type: "text", validate: "money", title: "质保金（万元）" });
    jsonArray.push({ itemId: "ht_ZhiBaoJinYueDing", type: "text", title: "质保金退换约定" });
    //jsonArray.push({ itemId: "ht_ZhiBaoJinDaoQi", type: "text", validate: "datetime", title: "质保金到期" });
    jsonArray.push({ itemId: "ht_LvYueBaoZhengJin", type: "text", validate: "money", title: "履约保证金" });
    jsonArray.push({ itemId: "ht_LvYueZhiBaoJinYueDing", type: "text",title: "履约保证金退还约定" });
    //jsonArray.push({ itemId: "ht_LvYueBaoZhengJinDaoQi", type: "text", validate: "datetime", title: "履约保证金到期" });
    jsonArray.push({ itemId: "ht_GongChengGuiMoYuGaiKuang", type: "ntext", title: "工程规模与概况" });
    jsonArray.push({itemId:"ht_BeiZhu",type:"ntext",title:"备注"});
    
    return jsonArray;
}
function createJson_htv(){
    var jsonArray = [];
    jsonArray.push({ itemId: "htv_YanQiZongE", type: "text",validate:"money", title: "延期监理费预计总额（万元）" });
    jsonArray.push({ itemId: "htv_YanQiKaiShiRiQi", type: "text",validate:"datetime", title: "延期监理费起始计费日期" });
    jsonArray.push({ itemId: "htv_YanQiYuJiKaiShiRiQi", type: "text",validate:"datetime",  title: "延期费预计计费开始日期" });
    jsonArray.push({ itemId: "htv_YanQiYuJiJieShuRiQi", type: "text",validate:"datetime",  title: "延期费预计计费结束日期" });
    jsonArray.push({ itemId: "htv_LvYueYingTuiHuanRiQi", type: "text", validate:"datetime", title: "履约保证金应退还时间" });
    jsonArray.push({ itemId: "htv_LvYueYingTuiZongE", type: "text", validate:"money", title: "履约保证金应退总额" });
    jsonArray.push({ itemId: "htv_LvYueTuiHuanShiJian", type: "text",validate:"datetime",  title: "履约保证金退还时间" });
    jsonArray.push({ itemId: "htv_ZhiBaoJinTuiHuanShiJian", type: "text",validate:"datetime",  title: "质保金应退时间" });
    jsonArray.push({ itemId: "htv_ZhiBaoJinYingTuiZongE", type: "text",validate:"money",  title: "质保金应退总额（万元）" });
    jsonArray.push({ itemId: "htv_ZhiBaoJinYingTuiZong", type: "text",validate:"datetime",  title: "质保金退还时间" });
    jsonArray.push({ itemId: "htv_GuiDangQingKuang", type: "select",title: "竣工资料归档情况",init: getInit(baseData["归档情况"],"gd_")});
    jsonArray.push({ itemId: "htv_BeiZhu", type: "ntext", title: "备注" });
    return jsonArray;
}
function createJson_jieSuan(){
    var jsonArray = [];
    jsonArray.push({ itemId: "js_YuJieSuanJianLiFei", type: "text",validate:"money", title: "预结算监理费" });
    jsonArray.push({ itemId: "js_YuJieSuanShuoMing", type: "ntext", title: "预结算说明" });
    jsonArray.push({ itemId: "js_JieSuanJianLiFei", type: "text",validate:"money", title: "结算监理费" });
    jsonArray.push({ itemId: "js_JieSuanShuoMing", type: "ntext", title: "结算说明" });
    return jsonArray;
}
//公用

//#endregion
//#region 其他


function getOptionsFromForm() {

    var opt = { callback: pageselectCallback, items_per_page: 10, next_text: "下页", num_display_entries:pageSize , num_edge_entries: 2, prev_text: "上页" };
    var htmlspecialchars = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }
    $.each(htmlspecialchars, function (k, v) {
        opt.prev_text = opt.prev_text.replace(k, v);
        opt.next_text = opt.next_text.replace(k, v);
    })
    return opt;
}

function pageselectCallback(page_index, jq) {
    pd = {};
    pd.currentPageNumber = page_index;
    pd.pageSize = pageSize;
    
    $invokeWebService_2("~WebService_HeTong.filterHeTongWrappper", { pageClass: pd,where:where_HeTong },
       function () {
           $("#divContent").html(loading);
       }, successCallBack, errorCallBack, null, { userContent: "filterHeTongWrappper" });
   }


   //合同列表添加样式和事件
   function tableAddStyle() {
       $("#divContent,#divContentQQ").find("tr[class*='header']").addClass("bgHeader");
       $("#divContent,#divContentQQ").find("tr[class*='row']:odd").addClass("bg1");
       $("#divContent,#divContentQQ").find("tr[class*='row']").bind("mouseover", {}, function () {
            $(this).addClass("mouseover");
       })
        $("#divContent,#divContentQQ").find("tr[class*='row']").bind("mouseout", {}, function () {
            $(this).removeClass("mouseover");
        })
        $("#divContent,#divContentQQ").find("td").find("label[validate='money']").formatCurrency();
   }
//把obj属性是时间转化成日期字符串
function conventToDateTime(obj,jsonArray){
    var datetimes= jsonArray.findAll("validate","datetime");
    for(var i=0;i<datetimes.length;i++){
        if(obj && obj[datetimes[i].itemId]){
            obj[datetimes[i].itemId]=strToDate(obj[datetimes[i].itemId]).pattern("yyyy-MM-dd");
        }
    }
}
//#endregion