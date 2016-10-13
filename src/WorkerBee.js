/**
 * Created by Brave Chan on 2016/10/11.
 *
 */
(function(root,factory){
    if(typeof defined === "function" && defined.amd){
        // AMD.
        defined("WorkerBee",[],factory);
    }else{
        // Browser globals
        root.WorkerBee = factory();
    }
})(typeof self == 'object' && self.self === self && self || this,function(){
    "use strict";
    var wb = {};
    wb.VERSION = "0.0.0";
//========================================================================
    var nativeCreate = Object.create,
        nativeIsArray = Array.isArray();
    var CtrFn = function(){};
    var LEN = "length";
    var GU_PREV = "gu";
//=========================================================================
    wb.ConstUtil = {
        EVENT:"event",
        OBJECT:"object",
        FRAME:"frame",
        LOG:"log",
        LogType:{
            WARNING:0x505050,
            ERROR:0xe0e0e0
        }
    };
//=========================================================================
    wb.Util = {
        isArray:function(obj){
            if(nativeIsArray){
                return nativeIsArray(obj);
            }
            return Object.prototype.toString.call(obj) === "[object Array]";
        }
    };
//=========================================================================
    /**
     * create object use 'Object.create' in ES5 or polyfill.
     * @param prototype
     * @returns {*}
     */
    wb.createObject = function(prototype){
        if(typeof nativeCreate === "function"){
            return nativeCreate(prototype);
        }
        CtrFn.prototype = prototype;
        var newClass = new CtrFn();
        CtrFn.prototype = null;
        return newClass;
    };
    /**
     *
     * @param target {Object} [necessary]
     * @param src {Object} [necessary]
     */
    wb.extend = function(target,src){
        target = target || {};
        src = src || {};
        for(var key in src){
            if(src.hasOwnProperty(key)){
                target[key] = src[key];
            }
        }
    };

    wb.guId = function(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        }).toUpperCase();
    };

    /**
     * create a namespace.
     * @param libName {String}
     * @param shortName {String}
     * @returns {Object} A namespace you want.
     */
    wb.createCore = function(libName,shortName){

        var sysList = {
            object : {length:0},
            event : {length:0},
            frame : {length:0},
            log : {length:0}
        };

        var includeProto = {
            internal_getList:function(listType){
                return  sysList[listType] || false;
            }
        };

        wb.extend(includeProto,wb.prototype);

        var newCore = wb.createObject(includeProto);

        //debug mode,true is open,false is close.default is true.
        newCore.debug = true;

        newCore.libName = libName?libName:(void 0);
        newCore.shortName = shortName?shortName:(void 0);

        var constUtil = wb.ConstUtil,
            util = wb.Util;
        wb.extend(newCore,{
            id:wb.guId(),
            OM:WBObjectManager,
            EM:WBEventManager,
            FM:WBFrameManager,
            LM:WBLogManager,
            LogType:constUtil.LogType,
            extend:wb.extend,
            isArray:util.isArray
        });

        return newCore;
    };
//=========================================================================
    /**
     *
     */
    var WBObjectManager = {
        LIST_TYPE:wb.ConstUtil.OBJECT,
        /**
         *
         * @param obj
         * @returns {*}
         */
        addObject:function(obj){
            var idAttr = (this.shortName?this.shortName:GU_PREV)+"Id";
            var OM = this.OM;
            if(!obj || OM.inGNList(obj[idAttr])) {
                return false;
            }
            return this.wb_save(idAttr,obj,OM.LIST_TYPE);
        },
        /**
         *
         * @param id
         */
        removeObject:function(id){
            var OM = this.OM;
            if(!id || !OM.inGNList(id)){
                return;
            }
            this.wb_destroy(id,OM.LIST_TYPE);
        },
        /**
         *
         * @param id
         * @returns {*|Object|undefined}
         */
        getObject:function(id){
            return this.wb_find(id,OM.LIST_TYPE);
        },
        /**
         *
         * @param newId
         * @param oldId
         * @returns {*}
         */
        changeGUId:function(newId,oldId){
            var OM = this.OM;
            if(!newId || !oldId || !OM.inGNList(oldId)){
                return false;
            }
            var temp = this.wb_find(oldId,OM.LIST_TYPE);
            var idAttr = (this.shortName?this.shortName:GU_PREV)+"Id";
            temp[idAttr] = newId;
            this.wb_destroy(oldId,OM.LIST_TYPE);
            return this.wb_save(newId,temp,OM.LIST_TYPE);
        },
        /**
         *
         * @param id
         * @returns {boolean}
         */
        inGNList:function(id){
            var OM = this.OM;
            return !!this.wb_find(id,OM.LIST_TYPE);
        },
        /**
         *
         * @returns {*}
         */
        length:function(){
            var OM = this.OM;
            return this.internal_getList(OM.LIST_TYPE).length;
        }
    };
//=========================================================================
    var WBEventManager = {
        LIST_TYPE:"event",
        addEventFrom:function(){},
        removeEventFrom:function(){},
        getEventFrom:function(){},
        hasEventFrom:function(){},
        dispatchEventFrom:function(){}
    };
//==========================================================================
    var WBFrameManager = (function(){
        "use strict";
        var fm = {};


        return fm;

    })();
//===========================================================================
    var WBLogManager = {
        LIST_TYPE:"log",
        addLog:function(){},
        showAllLog:function(){},
        showLastLog:function(){},
        clearAllLog:function(){}
    };
//===========================================================================
    /**
     *
     *
     */
    wb.prototype = {
        /**
         * save an object in objectList
         * @param key {String} [necessary]
         * @param obj {Object} [necessary]
         * @param listType {String} [necessary]
         * @return {Boolean}
         */
        wb_save:function(key,obj,listType){
            if(key === LEN){
                return false;
            }
            var list = this.internal_getList(listType);
            if(!list){
                return false;
            }
            //is created
            if(!list[key] && obj){
                list.length++;
            }

            list[key] = obj;
            return true;
        },
        /**
         * delete an object from objectList
         * @param key {String} [necessary]
         * @param listType {String} [necessary]
         */
        wb_destroy:function(key,listType){
            if(key === LEN){
                return;
            }
            var list = this.internal_getList(listType);
            if(list[key]){
                delete list[key];
                list.length--;
            }
        },
        /**
         * get an item from objectList
         * @param key {String} [necessary]
         * @param listType {String} [necessary]
         * @returns {Object/undefined}
         */
        wb_find:function(key,listType){
            if(key === LEN){
                return;
            }
            var list = this.internal_getList(listType);
            return list.hasOwnProperty(key)?list[key]:(void 0);
        }
    };
//============================================================================
    var wb_object_prototype = {
        output:function(){},
        terminalClear:function(){},
        destroyObject:function(){}
    };
    wb.WBObject = function(){
        var obj = wb.createObject(wb_object_prototype);
        obj.fn = obj.prototype = wb_object_prototype;
        var idAttr = (this.shortName?this.shortName:GU_PREV)+"Id";
        var tempId = wb.guId();
        obj["_"+idAttr] = tempId;
        obj[idAttr] = tempId;
        var OM = this.OM;
        if(OM){
            OM.addObject(obj);
        }
        return obj;
    };
//===============================================================================
    var wb_EventDispatcher_prototype = {
        addEventListener:function(type,handler,scope,data){},
        removeEventListener:function(type,handler){},
        hasEventListener:function(type){},
        dispatchEvent:function(type,data){},
        on:function(){},
        off:function(){},
        trigger:function(){}
    };
    wb.WBEventDispatcher = function(){
        var prototype = wb.WBObject.call(this);
        wb.extend(prototype,wb_EventDispatcher_prototype);
        return wb.createObject(prototype);
    };
//==============================================================================
    return wb;
});
