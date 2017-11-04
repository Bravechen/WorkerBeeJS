/**
 * 事件代理对象
 * @author Brave Chan 2017.1.9
 */
;(function(root,factory){
    if(typeof define === "function" && define.amd){
        define(['workerBee'],factory);
    }else{
        root.workerBee = root.workerBee || {};
        root.workerBee.WBEventProxy = factory(root.workerBee);
    }
})(window || this,function(wb){
    "use strict";

    var staticObj = {
            
        },
        prototype = {
            on:function(type,handler,data,scope){
                return this;
            },
            off:function(type,handler){
                return this;
            },
            trigger:function(type){
                return;
            }
        },
        WBObject = wb.WBObject;

    return wb.plugin("WBEventProxy",staticObj,prototype,wb,WBObject);
});