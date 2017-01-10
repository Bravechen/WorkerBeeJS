/**
 * Created by Brave Chan on 2016/10/11.
 *
 */
(function(root,factory){
    if(typeof defined === "function" && defined.amd){
        // AMD.
        defined([],factory);
    }else{
        // Browser globals
        root.workerBee = factory();
    }
})(window || this,function(){
    "use strict";
//========================================================================
    var wb = {
        libName:"workerBee",
        shortName:'wb'
    };
    wb.VERSION = "0.0.0";
//========================================================================
    var nativeCreate = Object.create,
        nativeSlice = Array.prototype.slice,
        nativeKeys = Object.keys,
        CtrFn = function(){},
        LEN = "length",
        GU_ID = "guId";
//========================================================================
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
    var ConstUtil = wb.ConstUtil;
//========================================================================
    /**
     * 根据原型创建对象。使用原生的'Object.create'或者polyfill实现。
     * create object use 'Object.create' in ES5 or polyfill.
     * @param prototype {Object} [necessary]
     * @returns {Object}
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
     * 混合对象
     * mixin two objects
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
    /**
     * 产生一个guid
     * generate a guid
     * @returns {string}
     */
    var guId = function(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        }).toUpperCase();
    };

    wb.guId = guId;
//======================wb.prototype======================================
    /**
     *
     *
     */
    wb.prototype = {};
//============================createCore()================================
    /**
     * 创建一个命名空间或核心对象
     * create a namespace.
     *
     * @param libName {String} [optional]
     * 可选，不过框架总该有个名字吧
     * Optional, but framework should have a name,right?
     *
     * @param shortName {String} [optional]
     * 可选，不过框架总该有个简写吧
     * Optional, but framework should have a shorthand,right?
     *
     * @returns {Object}
     * 命名空间或核心对象
     * A namespace you want.
     */
    wb.createCore = function(libName,shortName){
        var sysList = {
                object : {length:0},
                event : {length:0},
                frame : {length:0},
                log : {length:0},
                guid:guId()
            },
            includeProto = {
                //only for debug
                internal_getList:function(listType){
                    return  sysList[listType] || false;
                },
                //only for debug
                internal_getSysList:function(){
                    return sysList || false;
                }
            },
            newCore;

        wb.extend(includeProto,{
            /**
             * 保存一个对象至对应列表中
             * save an object in a type list
             * @param key {String} [necessary]
             * @param obj {Object} [necessary]
             * @param listType {String} [necessary]
             * @return {Boolean}
             */
            wb_save:function(key,obj,listType){
                if(key === LEN){
                    return false;
                }
                var list = sysList[listType];
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
             * 从对应列表中删除一个对象
             * delete an object from a type list
             * @param key {String} [necessary]
             * @param listType {String} [necessary]
             */
            wb_destroy:function(key,listType){
                if(key === LEN){
                    return;
                }
                var list = sysList[listType];
                if(list[key]){
                    delete list[key];
                    list.length--;
                }
            },
            /**
             * 从对应列表中获取一个对象
             * get an item from a type list
             * @param key {String} [necessary]
             * @param listType {String} [necessary]
             * @returns {Object/undefined}
             */
            wb_find:function(key,listType){
                if(key === LEN){
                    return;
                }
                var list = sysList[listType];
                return list.hasOwnProperty(key)?list[key]:(void 0);
            },
            /**
             * 对应列表的元素总数
             * @param listType {String} [necessary]
             * @returns {Number}
             */
            wb_length:function(listType){
                return sysList[listType].length;
            },
            /**
             * 清空对应的列表
             * @param listType {String} [necessary]
             */
            wb_clear:function(listType){
                var oldList = sysList[listType],
                    timer = setTimeout(function(){
                        for(var key in oldList){
                            if(oldList.hasOwnProperty(key)){
                                delete oldList[key];
                            }
                        }
                        clearTimeout(timer);
                    },0);
                sysList[listType] = {length:0};
            },
            /**
             * 获取对应列表的键名数组
             * @param listType {String} [necessary]
             * @returns {Array}
             */
            wb_listKeys:function(listType){
                var list = sysList[listType],
                    keys;
                if(nativeKeys){
                    keys = nativeKeys(list);
                    keys.splice(keys.indexOf('length'),1);
                    return keys;
                }
                keys = [];
                for(var key in list){
                    if(list.hasOwnProperty(key) && key !== 'length'){
                        keys[keys.length] = key;
                    }
                }
                return keys;
            }
        });

        newCore = wb.createObject(includeProto);
        //debug mode,true is open,false is close.default is true.
        newCore.debug = true;
        newCore.libName = typeof libName === 'string' && libName || '';
        newCore.shortName = typeof libName === 'string' && shortName || '';

        wb.extend(newCore,{
            id:guId(),
            OM:WBObjectManager.create(newCore),
            EM:WBEventManager.create(newCore),
            FM:WBFrameManager.create(newCore),
            LM:WBLogManager.create(newCore),
            LogType:ConstUtil.LogType,
            extend:wb.extend,
            guId:guId,
            plugin:wb.plugin
        });

        return newCore;
    };
//==========================WBManager=====================================
    var WBManager = {
        prototype:{},
        init:function(obj){
            var manager = wb.createObject(this);
            wb.extend(manager,obj);
            manager.fn = this;
            return manager;
        },
        create:function(master){
            var obj = {};
            wb.extend(obj,this.prototype);
            obj.parent = this;
            obj.master = master;
            return obj;
        }
    };
    /**
     * 通用管理者工厂模型
     * @type {{prototype: {}, init: WBManager.init, create: WBManager.create}}
     */
    wb.WBManager = WBManager;
//=============================WBObjectManager============================
    var WBObjectManager = WBManager.init({
        LIST_TYPE:wb.ConstUtil.OBJECT,
        prototype:{
            /**
             * 添加一个对象
             */
            addObject:function(obj){
                var master = this.master,listType = this.parent.LIST_TYPE,id;
                if(!obj || !obj[GU_ID] || this.inGNList((id = obj[GU_ID]))) {
                    console.log("In OM,addObject has error",obj,obj[GU_ID],this.inGNList(id)); //替换成log
                    return false;
                }
                return master.wb_save(id,obj,listType);
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
                return master.wb_length(listType);
            }
        }
    });
    /**
     * 对象管理者工厂模型
     */
    wb.WBObjectManager = WBObjectManager;
//========================WBEventManager==================================
    var WBEventManager = WBManager.init({
        LIST_TYPE:wb.ConstUtil.EVENT,
        prototype:{
            SEPARATOR:"_",
            /**
             * 添加一个事件来源对象
             * @param type {String} [necessary] 事件类型
             * @param guid {String} [necessary] 监听事件的对象的guid
             * @param handler {Function} [necessary] 事件监听器
             * @param data {Object} [optional] 事件返回到监听器的数据对象
             * @param scope {Object} [optional] 期望的事件监听器中的上下文this指向
             */
            addEventFrom:function(type, guid, handler, data, scope){
                var id = guid + this.SEPARATOR + type,
                    listType = this.parent.LIST_TYPE,
                    master = this.master,
                    item = master.wb_find(id,listType) || {filled:false},
                    handlerItem,
                    handlers,
                    datas,
                    length;

                handlerItem = {
                    cb:handler,
                    data:!data?null:data,
                    scope:scope
                };

                if(!item.filled){
                    item.type = type;
                    item.guid = guid;
                    item.handlers = [handlerItem];
                    item.filled = true;
                    master.wb_save(id,item,listType);
                }else{
                    handlers = item.handlers;
                    length = handlers.length;
                    handlers[length] = handlerItem;
                }
            },
            /**
             * 移除事件来源对象
             * @param type {String} [necessary] 事件类型
             * @param guid {String} [necessary] 监听事件的对象的guid
             * @param handler {Function} [necessary] 事件侦听器
             * @returns {boolean} 移除是否成功
             */
            removeEventFrom:function(type, guid, handler){
                var id = guid + this.SEPARATOR + type,
                    master = this.master,
                    listType = this.parent.LIST_TYPE,
                    eventFrom = master.wb_find(id,listType),
                    handlers,
                    k=0;
                if (!eventFrom || handler) {
                    return false;
                }
                handlers = eventFrom.handlers;
                if(handlers && handlers.length>0){
                    for(var i=0,len=handlers.length;i<len;i++){
                        if(handler === handlers[i].cb){
                            handlers[i] = null;
                        }
                        if(!handlers[i]){
                            k++;
                        }
                    }
                }
                //如果处理器列表已为空，移除该事件源对象
                if(!handlers || handlers.length<=0 || k>=handlers.length){
                    eventFrom.type = null;
                    eventFrom.gnId = null;
                    eventFrom.handlers = null;
                    eventFrom.filled = null;
                    master.wb_destroy(id,listType);
                }
                return true;
            },
            /**
             * 获取一个事件源对象
             * @param type {String} [necessary] 事件类型
             * @param guid {String} [necessary] 事件监听对象的guid
             * @returns {*|Object|undefined} 事件源对象
             */
            getEventFrom:function(type,guid){
                var master = this.master,
                    id = guid + this.SEPARATOR + type,
                    listType = this.parent.LIST_TYPE;
                return master.wb_find(id,listType);
            },
            /**
             * 是否含有事件源
             * @param type {String} 事件类型
             * @param guid {String} 事件监听对象的guid
             * @returns {boolean} 是否含有事件源
             */
            hasEventFrom:function(type,guid){
                var master = this.master,
                    id = guid + this.SEPARATOR + type,
                    listType = this.parent.LIST_TYPE;
                return !!master.wb_find(id,listType);
            },
            /**
             * 派发一个事件
             * @param type {String} 事件类型
             * @param guid {String} 监听事件的对象的guid
             * @returns {boolean} 派发成功与否
             */
            dispatchEventFrom:function(type,guid){
                var master = this.master,
                    id = guid + this.SEPARATOR + type,
                    listType = this.parent.LIST_TYPE,
                    eventFrom = master.wb_find(id,listType),handlers,handlerItem,i,len;
                if(!eventFrom){
                    //log...
                    return false;
                }
                handlers = eventFrom.handlers;
                var fn,data,scope,event;
                for(i=0,len=handlers.length;i<len;i++){
                    handlerItem = handlers[i];
                    fn = handlerItem.cb;
                    if(!fn || typeof fn !== 'function'){
                        continue;
                    }
                    data = handlerItem.data;
                    scope = handlerItem.scope;
                    event = {
                        type:type,
                        data:data
                    };
                    //If the scope is not set, the master will be used
                    fn.call(scope?scope:master,event);
                }
                return true;
            }
        }      
    });
    /**
     * 事件管理者工厂模型
     */
    wb.WBEventManager = WBEventManager;
//=====================WBFrameManager=====================================
    var WBFrameManager = WBManager.init({
        LIST_TYPE:wb.ConstUtil.FRAME,
        prototype:{
            frameRate:60,
            vendors:['ms', 'moz', 'webkit', 'o'],
            /**
             * 初始化帧循环管理
             */
            initialize:function(){
                if(this.initialized){
                    return;
                }
                this.animateRequest = null;
                this.initialized = false;
                this.isPlaying = false;

                var vendors = this.parent.vendors,
                    frameRate = this.parent.frameRate;

                for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
                }
                if(!window.requestAnimationFrame){
                    window.requestAnimationFrame = function (callBack) {
                        return setTimeout(callBack, 1000 / frameRate);
                    };
                    window.cancelAnimationFrame = function(id) {
                        clearTimeout(id);
                    };
                }
                this.initialized = true;

            },
            /**
             * 添加帧更新监听
             * @param handler {Function} [necessary] 处理器回调
             * @param scope {Object} [optional] 处理器的this指向
             * @param data {Object} [optional] 需要发送到针处理器中的数据集合
             */
            addFrameListener:function(handler,scope,data){
                var master = this.master;
                if (!handler || typeof handler !== "function") {
                    if(master && master.LM){
                        master.LM.addLog("In "+master.shortName+"FrameManager's addFrameListener","The params are error.",handler);
                    }
                    return;
                }

                this.initialize();

                var frameFrom,listType = this.parent.LIST_TYPE;
                if(!handler.frameId){
                    frameFrom = {};
                    frameFrom.id = parseInt(Math.random()*0xffffff+Math.random()*Math.PI).toString(16);
                    frameFrom.handler = handler;
                    frameFrom.scope = scope;
                    frameFrom.data = data;
                    master.wb_save(frameFrom.id,frameFrom,listType);
                    frameFrom.isPlaying = true;
                    handler.frameId = frameFrom.id;
                }else{
                    return;
                }

                if(!this.animateRequest){
                    this.animateRequest = window.requestAnimationFrame(this.drawFrame);
                    this.isPlaying = true;
                }

                return frameFrom && frameFrom.id;
            },
            /**
             * 移除帧更新监听
             * @param handler {Function} [necessary] 被注册过的处理器
             */
            removeFrameListener:function(handler){
                if (!handler || typeof handler !== "function") {
                    return;
                }
                this.initialize();
                var master = this.master,
                    listType = this.parent.LIST_TYPE,
                    length,
                    key = this.findFrameId(handler);
                if(!!key){
                    var frameFrom = master.wb_find(key,listType);
                    frameFrom.id = null;
                    frameFrom.handler = null;
                    frameFrom.data = null;
                    frameFrom.isPlaying = null;
                    master.wb_destroy(key,listType);
                }
                length = master.wb_length(listType);
                if(length<=0 && !!this.animateRequest){
                    window.cancelAnimationFrame(this.animateRequest);
                    this.animateRequest = null;
                    this.isPlaying = false;
                }
            },
            /**
             * 暂停对一个处理器的帧监听
             * @param frameId {String} [optional] 处理器id。
             * 如果不传入任何参数，会暂停所有订阅者的响应
             */
            pauseFrame:function(frameId){
                if(!this.initialized){
                    return;
                }
                if(arguments.length===0){
                    this.isPlaying = false;
                    return;
                }
                var master = this.master,
                    listType = this.parent.LIST_TYPE,
                    frameFrom = master.wb_find(frameId,listType);
                if(frameFrom){
                    frameFrom.isPlaying = false;
                }
            },
            /**
             * 继续对一个处理器的帧监听
             * @param frameId {String} [optional] 处理器id。
             * 如果不传入任何参数，会恢复所有订阅者的响应。但是那些单独设置了暂停的处理除外。
             */
            continueFrame:function(frameId){
                if(!this.initialized){
                    return;
                }
                if(arguments.length===0){
                    this.isPlaying = true;
                    return;
                }
                var master = this.master,
                    listType = this.parent.LIST_TYPE,
                    frameFrom = master.wb_find(frameId,listType);
                if(frameFrom && !frameFrom.isPlaying){
                    frameFrom.isPlaying = true;
                }
            },
            /**
             * 侦听器是否已被暂停监听
             * @param frameId {String} [optional] 处理器id。
             * 如果不传入任何参数，会返回当前是否在进行帧循环监视
             *
             */
            isPause:function(frameId){
                if(!this.initialized){
                    return false;
                }
                if(arguments.length === 0){
                    return this.isPlaying;
                }
                var master = this.master,
                    listType = this.parent.LIST_TYPE,
                    frameFrom = master.wb_find(frameId,listType);
                return frameFrom && !frameFrom.isPlaying;
            },
            /**
             * 帧更新,可被重写
             * @param timestamp {Number}
             * **/
            drawFrame:function(timestamp){
                if(!this.initialized){
                    return;
                }
                if(!this.isPlaying){
                    return;
                }
                this.animateRequest = window.requestAnimationFrame(this.drawFrame);
                var master = this.master,
                    listType = this.parent.LIST_TYPE,
                    keys = master.wb_listKeys(listType),
                    scope,
                    item,
                    length = keys.length;

                for(var i=0;i<length;i++){
                    if((item = master.wb_find(keys[i],listType)).isPlaying){
                        scope = item.scope;
                        item.handler.apply(scope?scope:undefined,[timestamp,item.data?item.data:null]);
                    }
                }
            },
            /**
             * 处理器是否已被注册在列表中
             * @param handler
             * @returns {boolean}
             */
            findFrameId:function(handler){
                if(handler.frameId){
                    return handler.frameId;
                }
                var master = this.master,
                    listType = this.parent.LIST_TYPE,
                    list = master.wb_listKeys(listType);
                for(var key in list){
                    if(list.hasOwnProperty(key) && list[key].handler === handler){
                        return key;
                    }
                }
                return false;
            }
        }     
    });
    /**
     * 帧循环管理者工厂模型
     */
    wb.WBFrameManager = WBFrameManager;
//====================WBLogManager========================================
    var WBLogManager = WBManager.init({
        LIST_TYPE:wb.ConstUtil.LOG,
        prototype:{
            LogType:{
                WARNING:"warning",
                ERROR:"error",
                NORMAL:"normal"
            },
            /**
             * 添加一条日志。
             * 如果开启了debug模式，也会使用console进行输出
             */
            addLog:function(){
                var listType = this.parent.LIST_TYPE,
                    master = this.master,
                    logType = this.LogType,
                    args,
                    ary = nativeSlice.call(arguments,0),
                    date = new Date().getTime(),
                    text= "log--"+date+":",
                    key = master.wb_length(listType);
                for(var i= 0,len=ary.length;i<len;i++){
                    text+="<==|==>"+ary[i];
                }
                text+="\n";
                master.wb_save(key,text,listType);
                if(master.debug && window.console){
                    var type = ary[ary.length-1];
                    var methodName = type===logType.WARNING?'warn':type===logType.ERROR?'error':'log';
                    console[methodName].apply(console,ary);
                }
            },
            /**
             * 返回由全部日志组成的一个数组
             * @returns {Array}
             */
            showAllLog:function(){
                var ary = [],
                    listType = this.parent.LIST_TYPE,
                    master = this.master,
                    logType = this.LogType,
                    length = master.wb_length(listType);
                for(var i=0;i<length;i++){
                    ary[i] = master.wb_find(i,listType);
                }
                return ary;
            },
            /**
             * 返回最新保存的一条日志
             * @returns {String}
             */
            showLastLog:function(){
                var listType = this.parent.LIST_TYPE,
                    master = this.master,
                    length = master.wb_length(listType);
                return master.wb_find(length-1);
            },
            /**
             * 清空所有日志
             */
            clearAllLog:function(){
                var listType = this.parent.LIST_TYPE,
                    master = this.master;
                master.wb_clear(listType);
            }
        }
    });
    /**
     * 日志管理者工厂模型
     */
    wb.WBLogManager = WBLogManager;
//========================WBObjectModel===================================
    /**
     * 通用对象模型
     * The object model
     *
     * @type {Object}
     */
    var WBObjectModel = {
        /**
         * 用于实例的原型
         */
        prototype:{},
        /**
         * 创建一个对象模型
         * Create an object model
         * @param obj
         * @returns {*}
         */
        init:function(obj,instancePrototype){
            var objectModel = wb.createObject(this);
            objectModel.fn = this;
            objectModel.prototype = wb.createObject(this.prototype);
            wb.extend(objectModel,obj);
            wb.extend(objectModel.prototype,instancePrototype);
            return objectModel;
        },
        /**
         * 创建一个基于模型对象的prototype可以生产实例对象的工厂函数
         * Create an factory function base on an object model's prototype
         * @param master
         * @returns {Function} 工厂函数 factory function
         */
        create:function(master){
            var that = this;
            return function(option){
                var obj = wb.createObject(that.prototype),
                    className = that.className,
                    type = className.indexOf("WB")!=-1?className.split('WB')[1]:className,
                    guid = master.guId();

                obj.fn = that.prototype;
                obj.className = (this.libName?this.libName+".":"TheFramework")+
                    (this.shortName?this.shortName.toUpperCase():"")+type;
                
                Object.defineProperty(obj,"guId",{
                    get:function(){
                        return guid;
                    }
                });
    
                wb.extend(obj,option);
                if(master.OM){
                    master.OM.addObject(obj);
                }
                return obj;
            };
        }
    };
    wb.WBObjectModel = WBObjectModel;
//=========================WBObject=======================================
    var WBObject = WBObjectModel.init(
        {className:"WBObject"},
        {
            initialize:function(){},
            output:function(){
                return "["+(this.className?this.className:"")+"   "+GU_ID+":"+ this[GU_ID] +"]";
            },
            terminalClear:function(){},
            destroyObject:function(){}
        }
    );
    /**
     * 对象工厂模型
     */
    wb.WBObject = WBObject;
//=========================WBEventDispatcher==============================
    var WBEventDispatcher = WBObject.init({
        className:"WBEventDispatcher"
    },{
        addEventListener:function(type,handler,scope,data){},
        removeEventListener:function(type,handler){},
        hasEventListener:function(type){},
        dispatchEvent:function(type,data){}
    });
    /**
     * 事件派发者工厂模型
     */
    wb.WBEventDispatcher = WBEventDispatcher;
//====================plugin==============================================
    /**
     * 创建一个插件
     * @param pluginName {String} [necessary] 插件名称
     * @param staticObj {Object} [optional] 插件对象的静态属性或方法
     * @param instancePrototype {Object} [optional] 通过插件创建的实例对象的原型
     * @param master {Object} [optional] 所属框架或组件库的命名空间，默认是workerBee
     * @param extendsFactory {Object} [optional] 继承的工厂模型对象
     * @return {Object} 创建好的插件对象
     */
    wb.plugin = function(pluginName,staticObj,instancePrototype,master,extendsFactory){
        if(!pluginName){
            //warn
            return;
        }
        var oFactory,factory,pluginFn;
        staticObj = staticObj || {};
        instancePrototype = instancePrototype || {};
        master = master || this;
        oFactory = typeof extendsFactory === 'function'?extendsFactory:wb.WBObjectModel
        
        factory = oFactory.init({
            className:master.libName + "." + pluginName
        },instancePrototype);

        pluginFn = factory.create(master);
        wb.extend(pluginFn,staticObj);
        master[pluginName] = pluginFn;
        
        return master[pluginName];
    };
//========================================================================
    return wb;
});
