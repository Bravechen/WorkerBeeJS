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
})(window || this,function(){
    "use strict";
    var wb = {};
    wb.VERSION = "0.0.0";
//========================================================================
    var nativeCreate = Object.create;
    var CtrFn = function(){};
    var LEN = "length";
    var GU_PREV = "gu";
    var GU_ID = "guId";
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

    var guId = function(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        }).toUpperCase();
    };

    wb.guId = guId;
//======================wb.prototype============================================
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
//============================createCore()================================================
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

        var constUtil = wb.ConstUtil;
        wb.extend(newCore,{
            id:guId(),
            OM:WBObjectManager.create(newCore),
            EM:WBEventManager.create(newCore),
            FM:WBFrameManager.create(newCore),
            LM:WBLogManager.create(newCore),
            LogType:constUtil.LogType,
            extend:wb.extend
        });

        return newCore;
    };
//==========================WBManager===============================================
    var WBManager = {
        prototype:{},
        init:function(obj){
            var manager = wb.createObject(this);
            wb.extend(manager,obj);
            manager.fn = this;
            return manager;
        },
        create:function(master){
            var obj = wb.createObject(this.prototype);
            obj.fn = this.prototype;
            obj.parent = this;
            obj.master = master;
            return obj;
        }
    };
    wb.WBManager = WBManager;
//=============================WBObjectManager==============================================
    /**
     *
     */
    var WBObjectManager = WBManager.init({
        LIST_TYPE:wb.ConstUtil.OBJECT
    });
    wb.extend(WBObjectManager,{
        prototype:{
            master:null,
            addObject:function(obj){
                var master = this.master,listType = this.parent.LIST_TYPE;
                if(!obj || !obj[GU_ID] || this.inGNList(obj[GU_ID])) {
                    console.log("In OM,addObject has error",obj,obj[GU_ID],this.inGNList(obj[GU_ID]));
                    return false;
                }
                return master.wb_save(obj[GU_ID],obj,listType);
            },
            /**
             *
             * @param id
             */
            removeObject:function(id){
                var master = this.master,listType = this.parent.LIST_TYPE;
                if(!id || !this.inGNList(id)){
                    return;
                }
                master.wb_destroy(id,listType);
            },
            /**
             *
             * @param id
             * @returns {*|Object|undefined}
             */
            getObject:function(id){
                var master = this.master,listType = this.parent.LIST_TYPE;
                return master.wb_find(id,listType);
            },
            /**
             *
             * @param id
             * @returns {boolean}
             */
            inGNList:function(id){
                var master = this.master,listType = this.parent.LIST_TYPE;
                return !!master.wb_find(id,listType);
            },
            /**
             *
             * @returns {*}
             */
            length:function(){
                var master = this.master,listType = this.parent.LIST_TYPE;
                return master.internal_getList(listType).length;
            }
        }
    });
    wb.WBObjectManager = WBObjectManager;
//========================WBEventManager=================================================
    var WBEventManager = WBManager.init({
        LIST_TYPE:"event"
    });
    wb.extend(WBEventManager.fn,{
        prototype:{
            addEventFrom:function(){},
            removeEventFrom:function(){},
            getEventFrom:function(){},
            hasEventFrom:function(){},
            dispatchEventFrom:function(){}
        }
    });
    wb.WBEventManager = WBEventManager;
//=====================WBFrameManager=====================================================
    var WBFrameManager = WBManager.init({
        LIST_TYPE:wb.ConstUtil.FRAME
    });
    wb.extend(WBFrameManager,{
        prototype:{

        }
    });
    wb.WBFrameManager = WBFrameManager;
//====================WBLogManager=======================================================
    var WBLogManager = WBManager.init({
        LIST_TYPE:"log"
    });
    wb.extend(WBLogManager,{
        prototype:{
            addLog:function(){},
            showAllLog:function(){},
            showLastLog:function(){},
            clearAllLog:function(){}
        }
    });
    wb.WBLogManager = WBLogManager;
//========================WBObjectModel===================================================
    var WBObjectModel = {
        prototype:{},
        init:function(obj){
            var objectModel = wb.createObject(this);
            objectModel.fn = this;
            wb.extend(objectModel,obj);
            return objectModel;
        },
        create:function(master){
            var that = this;
            return function(option){
                var obj = wb.createObject(that.fn.prototype);
                obj.fn = that.fn.prototype;
                obj.parent = that;
                obj.className = (this.libName?this.libName+".":"TheFramework")+
                    (this.shortName?this.shortName.toUpperCase():"")+that.className;
                obj[GU_ID] = guId();
                wb.extend(that.prototype,option); //可以使用Object.keys()优化，将2步混合一个循环合并完成
                wb.extend(obj,that.prototype);
                if(master.OM){
                    master.OM.addObject(obj);
                }
                return obj;
            };
        }
    };
    wb.WBObjectModel = WBObjectModel;
//=========================WBObject============================================

    var WBObject = WBObjectModel.init({
        className:"Object"
    });
    wb.extend(WBObject,{
        prototype:{
            output:function(){
                return "["+(this.className?this.className:"")+"   "+GU_ID+":"+ this[GU_ID] +"]";
            },
            terminalClear:function(){},
            destroyObject:function(){}
        }
    });
    wb.WBObject = WBObject;
//=========================WBEventDispatcher======================================================
    var WBEventDispatcher = WBObject.init({
        className:"EventDispatcher"
    });
    wb.extend(WBEventDispatcher,{
        prototype:{
            addEventListener:function(type,handler,scope,data){},
            removeEventListener:function(type,handler){},
            hasEventListener:function(type){},
            dispatchEvent:function(type,data){},
            on:function(){},
            off:function(){},
            trigger:function(){}
        }
    });
    wb.WBEventDispatcher = WBEventDispatcher;
//==============================================================================
    return wb;
});
