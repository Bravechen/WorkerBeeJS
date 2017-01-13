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
    var nativeCreate = Object.create,
        nativeSlice = Array.prototype.slice,
        nativeKeys = Object.keys,
        CtrFn = function(){},
        LEN = "length",
        GU_ID = "guId",
        ConstUtil = {
            EVENT:"event",
            OBJECT:"object",
            FRAME:"frame",
            LOG:"log",
            LogType:{
                WARNING:0x505050,
                ERROR:0xe0e0e0
            }
        },
        /**
         * 产生一个guId
         * generate a guId
         * @returns {String}
         */
        guId = function(){
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            }).toUpperCase();
        },
        fCollection = {},
        /**
         * 保存一个对象至对应列表中
         * save an object in a type list
         * @param key {String} [necessary]
         * @param obj {Object} [necessary]
         * @param listType {String} [necessary]
         * @return {Boolean}
         */
        wb_save = function(fid,key,obj,listType){
            var list; 
            if(key === LEN){
                return false;
            }
            list = fCollection[fid][listType];
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
        wb_destroy = function(fid,key,listType){
            var list;
            if(key === LEN){
                return;
            }
            list = fCollection[fid][listType];
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
        wb_find = function(fid,key,listType){
            if(key === LEN){
                return;
            }
            var list = fCollection[fid][listType];
            return list.hasOwnProperty(key)?list[key]:(void 0);
        },
        /**
         * 对应列表的元素总数
         * @param listType {String} [necessary]
         * @returns {Number}
         */
        wb_length = function(fid,listType){
            return fCollection[fid][listType].length;
        },
        /**
         * 清空对应的列表
         * @param listType {String} [necessary]
         */
        wb_clear = function(fid,listType){
            var sysList = fCollection[fid],
                oldList = sysList[listType],
                //需要再评估方式
                timer = setTimeout(function(){
                    for(var key in oldList){
                        if(oldList.hasOwnProperty(key)){
                            delete oldList[key];
                        }
                    }
                    sysList[listType] = {length:0};
                    clearTimeout(timer);
                },0);            
        },
        /**
         * 获取对应列表的键名数组
         * @param listType {String} [necessary]
         * @returns {Array}
         */
        wb_listKeys = function(fid,listType){
            var list = fCollection[fid][listType],
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
        };
//========================================================================
    var wb = {
        libName:"workerBee",    //全称
        shortName:'wb',         //缩写
        debug:true,             //debug模式
        VERSION:"0.0.0",        //版本号
        ConstUtil:ConstUtil,     //常量
        guId:guId,
//======================wb.prototype======================================
        prototype:{},
//============================wb base ====================================        
        /**
         * @public
         * 根据原型创建对象。使用原生的'Object.create'或者polyfill实现。
         * create object use 'Object.create' in ES5 or polyfill.
         * @param prototype {Object} [necessary]
         * @returns {Object}
         */
        createObject:function(prototype){
            if(typeof nativeCreate === "function"){
                return nativeCreate(prototype);
            }
            CtrFn.prototype = prototype;
            var newClass = new CtrFn();
            CtrFn.prototype = null;
            return newClass;
        },
        /**
         * @public
         * 混合对象
         * mixin two objects
         * @param target {Object} [necessary]
         * @param src {Object} [necessary]
         */
        extend:function(target,src){
            target = target || {};
            src = src || {};
            for(var key in src){
                if(src.hasOwnProperty(key)){
                    target[key] = src[key];
                }
            }
        },
        /**
         * 创建一个插件
         * @param pluginName {String} [necessary] 插件名称
         * @param staticObj {Object} [optional] 插件对象的静态属性或方法
         * @param instancePrototype {Object} [optional] 通过插件创建的实例对象的原型
         * @param master {Object} [optional] 所属框架或组件库的命名空间，默认是workerBee
         * @param extendsFactory {Object} [optional] 继承的工厂模型对象
         * @return {Function} 创建好的插件对象
         */
        plugin:function(pluginName,staticObj,instancePrototype,master,extendsFactory){
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
        }
    },
//==========================WBManager=====================================
    WBManager = {
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
    },
//====================WBLogManager========================================    
    WBLogManager = WBManager.init({
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
                    fid = master.fid,
                    logType = this.LogType,
                    args,
                    ary = nativeSlice.call(arguments,0),
                    date = new Date().getTime(),
                    text= "log--"+date+":",
                    key = wb_length(fid,listType);
                for(var i= 0,len=ary.length;i<len;i++){
                    text+="<==|==>"+ary[i];
                }
                text+="\n";
                wb_save(fid,key,text,listType);
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
                    fid = this.master.fid,
                    logType = this.LogType,
                    length = wb_length(fid,listType);
                for(var i=0;i<length;i++){
                    ary[i] = wb_find(fid,i,listType);
                }
                return ary;
            },
            /**
             * 返回最新保存的一条日志
             * @returns {String}
             */
            showLastLog:function(){
                var listType = this.parent.LIST_TYPE,
                    fid = this.master.fid,
                    length = wb_length(fid,listType);
                return wb_find(fid,length-1);
            },
            /**
             * 清空所有日志
             */
            clearAllLog:function(){
                var listType = this.parent.LIST_TYPE,
                    fid = this.master.fid;
                wb_clear(fid,listType);
            }
        }
    }),
//=============================WBObjectManager============================    
    WBObjectManager = WBManager.init({
        LIST_TYPE:wb.ConstUtil.OBJECT,
        prototype:{
            /**
             * 添加一个对象
             * @param obj {Object} 要被添加进的对象
             * @return {Boolean} 添加操作是否成功
             */
            addObject:function(obj){
                var listType = this.parent.LIST_TYPE,
                    fid = this.master.fid,
                    id;
                if(!obj || !obj[GU_ID] || this.inList((id = obj[GU_ID]))) {
                    if(this.master.debug){
                        console.error("In OM,addObject has error",obj,obj[GU_ID],this.inList(id));
                    }                    
                    return false;
                }
                return wb_save(fid,id,obj,listType);
            },
            /**
             * 从OM中移除一个对象
             * @param id {String} 对象的guId
             */
            removeObject:function(id){
                var fid = this.master.fid,
                    listType = this.parent.LIST_TYPE;
                if(!id || !this.inList(id)){
                    if(this.master.debug){
                        console.error("In OM,addObject has error",id,this.inList(id));
                    }                    
                    return;
                }
                wb_destroy(fid,id,listType);
            },
            /**
             * 通过一个guId获取一个对象
             * @param id {String} 对象的guId
             * @returns {*|Object|undefined}
             */
            getObject:function(id){
                var fid = this.master.fid,listType = this.parent.LIST_TYPE;
                return wb_find(fid,id,listType);
            },
            /**
             * 是否在OM列表中
             * @param id {String} 对象的guId
             * @returns {Boolean} 是否在OM列表中
             */
            inList:function(id){
                var fid = this.master.fid,listType = this.parent.LIST_TYPE;
                return !!wb_find(fid,id,listType);
            },
            /**
             * OM中管理的对象的数量
             * @returns {Number} 对象的数量
             */
            length:function(){
                var fid = this.master.fid,listType = this.parent.LIST_TYPE;
                return wb_length(fid,listType);
            }
        }
    }),
//========================WBEventManager==================================
    WBEventManager = WBManager.init({
        LIST_TYPE:wb.ConstUtil.EVENT,
        prototype:{
            /**
             * 添加一个事件来源对象
             * @param type {String} [necessary] 事件类型
             * @param guId {String} [necessary] 监听事件的对象的guId
             * @param handler {Function} [necessary] 事件监听器
             * @param data {Object} [optional] 事件返回到监听器的数据对象
             * @param scope {Object} [optional] 期望的事件监听器中的上下文this指向
             */
            addEventFrom:function(type, guId, handler, data, scope){
                var listType = this.parent.LIST_TYPE,
                    fid = this.master.fid,
                    item = wb_find(fid,guId,listType),
                    handlerItem,
                    list;

                if(!item){
                    item = {length:0};
                    wb_save(fid,guId,item,listType);
                }
                
                handlerItem = {
                    cb:handler,
                    data:!data?null:data,
                    scope:scope
                };

                list = item[type];
                if(!list){
                    list = [handlerItem];
                    item[type] = list;
                    item.length++;
                }else{
                    list[list.length] = handlerItem;
                    if(list.length>10){
                        console.warn("The obj that guId is ",guId," has too many event listener on this type:",type,"reach at "+list.length+", please consider to use event proxy instead.");
                    }
                }
            },
            /**
             * 移除事件来源对象
             * @param type {String} [necessary] 事件类型
             * @param guId {String} [necessary] 监听事件的对象的guId
             * @param handler {Function} [necessary] 事件侦听器
             * @returns {boolean} 移除是否成功
             */
            removeEventFrom:function(type, guId, handler){
                var fid = this.master.fid,
                    debug = this.master.debug,
                    listType = this.parent.LIST_TYPE,
                    eventFrom = wb_find(fid,guId,listType),
                    handlers,len;

                if (!eventFrom || !eventFrom[type] || typeof handler !== 'function') {
                    if(debug){
                        console.info("This obj that guId is ",guId,"has not register event listener of ",type," or, the param of handler is not a function.");
                    }
                    return false;
                }

                handlers = eventFrom[type];
                if(handlers){
                    len = handler.length;
                    while(len--){
                        if(handler === handlers[len].cb){
                            handlers.splice(len,1);
                            break;
                        }
                    }
                }
                //如果处理器列表已为空，移除该事件源对象
                if(!handlers || handlers.length<=0){
                    eventFrom[type] = null;
                    eventFrom.length--;
                    if(eventFrom.length<=0){
                        wb_destroy(fid,guId,listType);
                    }
                }
                return true;
            },
            /**
             * 移除某个对象对某个事件的全部侦听
             * @param type {String} [necessary] 事件类型
             * @param guId {String} [necessary] 监听事件的对象的guId
             * @returns {boolean} 移除是否成功
             */
            removeEventFromALL:function(type,guId){
                var fid = this.master.fid,
                    listType = this.parent.LIST_TYPE,
                    eventFrom = wb_find(fid,guId,listType),
                    handlers,len,item;

                if (!eventFrom) {
                    return true;
                }
                handlers = eventFrom[type];
                if(handlers && (len = handlers.length)>0){
                    while(len--){
                        item = handlers[len];
                        item.cb = null;
                        item.data = null;
                        item.scope = null;
                        handlers[len] = null;
                    }
                }
                eventFrom[type] = null;
                eventFrom.length--;
                if(eventFrom.length<=0){
                    wb_destroy(fid,guId,listType);
                }                
                return true;
            },
            /**
             * 移除某个对象注册的所有事件
             * @param guId {String} [necessary] 对象的guId
             * @return {Boolean} 是否移除成功
             */
            removeALLEventByGUID:function(guId){
                var fid = this.master.fid,
                    listType = this.parent.LIST_TYPE,
                    eventFrom = wb_find(fid,guId,listType);
                if(!eventFrom){
                    return true;
                }               
                if(eventFrom.length<=0){
                    wb_destroy(fid,guId,listType);
                    return true;
                }

                for(var key in eventFrom){
                    if(eventFrom.hasOwnProperty(key) && key!='length'){
                        this.removeEventFromALL(key,guId);
                    }
                }
                return true;
            },
            /**
             * 获取一个事件源对象
             * @param type {String} [necessary] 事件类型
             * @param guId {String} [necessary] 事件监听对象的guId
             * @returns {*|Object|undefined} 事件源对象
             */
            getEventFrom:function(type,guId){
                var fid = this.master.fid,
                    listType = this.parent.LIST_TYPE;
                return wb_find(fid,guId,listType);
            },
            /**
             * 是否含有事件源
             * @param type {String} 事件类型
             * @param guId {String} 事件监听对象的guId
             * @returns {boolean} 是否含有事件源
             */
            hasEventFrom:function(type,guId){
                var fid = this.master.fid,
                    listType = this.parent.LIST_TYPE,
                    eventFrom = wb_find(fid,guId,listType);
                if(eventFrom && eventFrom.length<=0){
                    wb_destroy(fid,guId,listType);
                    eventFrom = null;
                }
                return !!eventFrom;
            },
            /**
             * 派发一个事件
             * @param type {String} 事件类型
             * @param guId {String} 监听事件的对象的guId
             * @param eventData {Object} 随事件发送的数据
             * @returns {boolean} 派发成功与否
             */
            dispatchEventFrom:function(type,guId,eventData){
                var master = this.master,
                    fid = master.fid,
                    debug = master.debug,
                    listType = this.parent.LIST_TYPE,
                    eventFrom = wb_find(fid,guId,listType),
                    handlers,handlerItem,i,len,fn,data,scope;

                if(!eventFrom){
                    if(debug){
                        console.error("In dispatchEventFrom,EM dose not find any event type of ",type," on this obj===> ",guId);
                    }
                    return false;
                }

                handlers = eventFrom[type];
                for(i=0,len=handlers.length;i<len;i++){
                    handlerItem = handlers[i];
                    fn = handlerItem.cb;
                    data = handlerItem.data;
                    scope = handlerItem.scope;
                    
                    //If the scope is not set, the master will be used
                    fn.call(scope?scope:master,{
                        type:type,
                        eventData:eventData,
                        data:data
                    });
                }
                return true;
            }
        }
    }),
//=====================WBFrameManager=====================================    
    WBFrameManager = WBManager.init({
        LIST_TYPE:wb.ConstUtil.FRAME,
        frameRate:60,
        vendors:['ms', 'moz', 'webkit', 'o'],
        prototype:{
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
                var master = this.master
                    fid = master.fid,
                    listType = this.parent.LIST_TYPE,
                    frameFrom;
                if (!handler || typeof handler !== "function") {
                    if(master.debug){
                        console.error("In "+master.shortName+"FrameManager's addFrameListener","The params are error.",handler);
                    }
                    return;
                }

                this.initialize();

                if(!handler.frameId){
                    frameFrom = {};
                    frameFrom.id = parseInt(Math.random()*0xffffff+Math.random()*Math.PI).toString(16);
                    frameFrom.handler = handler;
                    frameFrom.scope = scope;
                    frameFrom.data = data;
                    wb_save(fid,frameFrom.id,frameFrom,listType);
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
                var fid = this.master.fid,
                    listType = this.parent.LIST_TYPE,
                    length,
                    key = this.findFrameId(handler);
                if(!!key){
                    var frameFrom = wb_find(fid,key,listType);
                    frameFrom.id = null;
                    frameFrom.handler = null;
                    frameFrom.data = null;
                    frameFrom.isPlaying = null;
                    wb_destroy(fid,key,listType);
                }
                length = wb_length(fid,listType);
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
                var fid = this.master.fid,
                    listType = this.parent.LIST_TYPE,
                    frameFrom = wb_find(fid,frameId,listType);
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
                var fid = this.master.fid,
                    listType = this.parent.LIST_TYPE,
                    frameFrom = wb_find(fid,frameId,listType);
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
                var fid = this.master.fid,
                    listType = this.parent.LIST_TYPE,
                    frameFrom = wb_find(fid,frameId,listType);
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
                var fid = this.master.fid,
                    listType = this.parent.LIST_TYPE,
                    keys = wb_listKeys(fid,listType),
                    scope,
                    item,
                    length = keys.length;

                for(var i=0;i<length;i++){
                    if((item = wb_find(fid,keys[i],listType)).isPlaying){
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
                var fid = this.master.fid,
                    listType = this.parent.LIST_TYPE,
                    list = wb_listKeys(fid,listType);
                for(var key in list){
                    if(list.hasOwnProperty(key) && list[key].handler === handler){
                        return key;
                    }
                }
                return false;
            }
        }     
    }),
//========================WBObjectModel===================================    
    WBObjectModel = {
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
                        _guId = master.guId();

                    obj.fn = that.prototype;
                    obj.className = (this.libName?this.libName+".":"TheFramework")+
                        (this.shortName?this.shortName.toUpperCase():"")+type;
                    
                    Object.defineProperties(obj,{
                        guId:{
                            get:function(){
                                return _guId;
                            }
                        },
                        master:{
                            get:function(){
                                return master;
                            }
                        }
                    });
        
                    wb.extend(obj,option);
                    if(master.OM){
                        master.OM.addObject(obj);
                    }
                    return obj;
                };
        }
    },
//=========================WBObject=======================================    
    WBObject = WBObjectModel.init({
        className:"WBObject",
    },{
        initialize:function(){},
        output:function(){
            return "["+(this.className?this.className:"")+"   "+GU_ID+":"+ this[GU_ID] +"]";
        },
        terminalClear:function(){},
        destroyObject:function(){},
    }),
//=========================WBEventDispatcher==============================        
    WBEventDispatcher = WBObject.init({
        className:"WBEventDispatcher",
    },{
        /**
         * 添加事件侦听
         * @param type {String} [necessary] 事件类型
         * @param handler {Function} [necessary] 事件处理器
         * @param data {Object} [optional] 附加数据
         * @param scope {Object} [optional] 事件处理器中期望的上下文this指向
         */
        addEventListener:function(type,handler,data,scope){
            var EM = this.master.EM,
                guId = this.guId;
            if(typeof handler !== 'function'){
                if(this.master.debug){
                    console.error("In addEventListener(),The param of handler is error,the handle is ",typeof handler);
                }
                return;
            }
            EM.addEventFrom(type, guId, handler, data, scope);
        },
        /**
         * 移除事件侦听
         * @param type {String} [necessary] 事件类型
         * @param handler {Function} [necessary] 事件处理器
         * @return {Boolean} 是否移除成功
         */
        removeEventListener:function(type,handler){
            var EM = this.master.EM,
                guId = this.guId,
                result = false;
            if(EM.hasEventFrom(type,guId)){
                result = EM.removeEventFrom(type,guId,handler);
                if(!result && this.master.debug){
                    console.warn("In removeEventListener(),remove handler failed.","type:",type,"guId:",guId,"handler type:",typeof handler);
                }
            }
            return result;
        },
        /**
         * 是否含有对某一个事件的侦听
         * @param type {String} [necessary] 事件类型
         * @return {Boolean} 是否已对事件进行了侦听
         */
        hasEventListener:function(type){
            var EM = this.master.EM,
                guId = this.guId;
            return EM.hasEventFrom(type,guId);
        },
        /**
         * 派发某一个事件
         * @param type {String} [necessary] 事件类型
         * @param data {Object} [optional] 伴随事件发送的数据
         * @return {Boolean} 事件是否发送成功
         */
        dispatchEvent:function(type,data){
            var EM = this.master.EM,
                guId = this.guId,
                result = false;
            if(EM.hasEventFrom(type,guId)){
                result = EM.dispatchEventFrom(type,guId,data);
            }
            return result;
        },
    });    
//============================createCore()================================
    /**
     * @public
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
        var _fid = guId(),
            sysList = {
                object : {length:0},
                event : {length:0},
                frame : {length:0},
                log : {length:0},
                fid:_fid
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
            newCore = wb.createObject(includeProto);

        fCollection[_fid] = sysList;

        //debug mode,true is open,false is close.default is true.
        newCore.debug = true;
        newCore.libName = typeof libName === 'string' && libName || '';
        newCore.shortName = typeof libName === 'string' && shortName || '';        
        //define fid
        Object.defineProperty(newCore,'fid',{
            get:function(){
                return _fid;
            }
        });

        wb.extend(newCore,{
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
//============================public=======================================
    /**
     * @public
     * 通用管理者工厂模型
     */
    wb.WBManager = WBManager;
    /**
     * @public
     * 日志管理者工厂模型
     */
    wb.WBLogManager = WBLogManager;
    /**
     * @public
     * 对象管理者工厂模型
     */
    wb.WBObjectManager = WBObjectManager;
    /**
     * @public
     * 事件管理者工厂模型
     */
    wb.WBEventManager = WBEventManager;
    /**
     * @public
     * 帧循环管理者工厂模型
     */
    wb.WBFrameManager = WBFrameManager;
    /**
     * @public
     * 通用对象模型
     */ 
    wb.WBObjectModel = WBObjectModel;
    /**
     * @public
     * 对象工厂模型
     */
    wb.WBObject = WBObject;
    /**
     * @public
     * 事件派发者工厂模型
     */
    wb.WBEventDispatcher = WBEventDispatcher;
//========================================================================    
    if(wb.debug){
        wb.wb_save = wb_save;
        wb.wb_clear = wb_clear;
        wb.wb_destroy = wb_destroy;
        wb.wb_find = wb_find;
        wb.wb_length = wb_length;
        wb.wb_listKeys = wb_listKeys;
    }
//========================================================================
    return wb;
});
