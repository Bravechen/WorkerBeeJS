(function(wb,QUnit){
    "use strict";
    wb.debug = true;
    QUnit.test("WorkerBee save obj in list, and destroy obj from list",function(assert){
        var ClassA = wb.createCore();
        var ClassB = wb.createCore();
        assert.ok(ClassA.internal_getSysList() !== ClassB.internal_getSysList(),"Each framework has a unique sysList.");
        assert.ok(true,"Framework ClassA's sysList===>"+ClassA.internal_getSysList().fid);
        assert.ok(true,"Framework ClassB's sysList===>"+ClassB.internal_getSysList().fid);
        var constUtil = wb.ConstUtil;
        ClassB.debug = false;
        var obj1 = {name:"123"},
            obj2 = {name:"456"},
            obj3 = {name:"xcv"},
            obj4 = {name:"789"};
        wb.wb_save(ClassA.fid,"abc",obj1,constUtil.OBJECT);
        wb.wb_save(ClassB.fid,"def",obj2,constUtil.OBJECT);
        wb.wb_save(ClassB.fid,"123",obj3,constUtil.OBJECT);
        wb.wb_save(ClassA.fid,"qwe",obj4,constUtil.OBJECT);
        assert.ok(wb.wb_find(ClassA.fid,"qwe",constUtil.OBJECT) === obj4,"an obj is in list");
        wb.wb_destroy(ClassA.fid,"qwe",constUtil.OBJECT);
        assert.ok(wb.wb_find(ClassA.fid,"qwe",constUtil.OBJECT) === undefined,"delete an obj from list is ok");
    });
//==================================================================
    var gardener = wb.createCore("gardener","gn");

    QUnit.test("create a Framework,and name libName and shortName for it.",function(assert){
        assert.ok(gardener.libName === "gardener","libName passed.");
        assert.ok(gardener.shortName === "gn","shortName passed.");
        console.log(gardener);
    });

    QUnit.test("create a gn.GNObject,then use it to create an instances.",function(assert){
        //console.log("wb.WBObject",wb.WBObject);
        //console.log("wb.WBEventDispatcher",wb.WBEventDispatcher);

        gardener.GNObject = wb.WBObject.create(gardener);
        var gnObj = gardener.GNObject({
            initialize:function(){
                return "This is gnObj's init.";
            },
            gnId:"gnObj1"
        });
        var gnObj2 = gardener.GNObject({
            createChildren:function(){

            },
            gnId:"gnObj2"
        });
        assert.ok(true,gnObj);
        assert.ok(true,gnObj.output());
        assert.ok(true,"gnObj2.guId===>"+gnObj2.guId);
        assert.ok(gnObj.initialize() === "This is gnObj's init.","The method named 'initialize' has been called.");
        assert.ok(gardener.OM.getObject(gnObj.guId) === gnObj,"The instance gnObj had been add into ObjectManager.");
        //console.log(gardener.internal_getSysList());
        assert.ok(gardener.OM.inList(gnObj.guId) === true,"The gnObj is in OM's list.");
        assert.ok(gardener.OM.length() > 1,"There are some instances in OM's list.");
        gardener.OM.removeObject(gnObj2.guId);
        assert.ok(gardener.OM.length() >0 && !gardener.OM.inList(gnObj2.guId),"The gnObj2 has been removed.");
        var id = gardener.guId(),
            obj3 = {
                guId:id
            };
        gardener.OM.addObject(obj3);
        assert.ok(gardener.OM.getObject(obj3.guId) === obj3 && gardener.OM.inList(obj3.guId) === true,"Call getObject(),success.");
        //console.log(gardener.internal_getSysList());
    });

    QUnit.test("create a gn.GNEventListener,then use it to create an instance.",function(assert){
        gardener.GNEventDispatcher = wb.WBEventDispatcher.create(gardener);
        var gnED = gardener.GNEventDispatcher();
        assert.ok(typeof gnED.addEventListener === 'function','The gnED has a method that be named "addEventListener".');
        assert.ok(typeof gnED.removeEventListener === 'function','The gnED has a method that be named "removeEventListener".');
        assert.ok(typeof gnED.hasEventListener === 'function','The gnED has a method that be named "hasEventListener".');
        assert.ok(typeof gnED.dispatchEvent === 'function','The gnED has a method that be named "dispatchEvent".');
        console.log("gnED",gnED);
        assert.ok(true,gnED.output());
        var type = "balalala";
        gnED.addEventListener("balalala",balaHandler,{message:"This is balalala's data."},gnED);
        gnED.addEventListener("balalala1",balaHandler,{message:"This is balalala's data."},gnED);
        gnED.addEventListener("balalala1",balaHandler1,{message:"This is balalala's data."},gnED);
        gnED.addEventListener("balalala2",balaHandler,{message:"This is balalala's data."},gnED);
        gnED.addEventListener("balalala3",balaHandler,{message:"This is balalala's data."},gnED);
        console.log(gardener.internal_getList(wb.ConstUtil.EVENT));
        assert.ok(wb.wb_find(gardener.fid,gnED.guId,wb.ConstUtil.EVENT).length === 4,"EM receive enough event-types");
        assert.ok(gnED.hasEventListener(type,gnED.guId) === true,"The event "+ type + " has been register.");
        assert.ok(gardener.EM.hasEventFrom(type,gnED.guId) === true,"The event "+type+" is in EM's list.");
        assert.ok(gnED.dispatchEvent(type,{message:"This is send data by event."}) === true,"fire the event "+type+",success.");

        function balaHandler(e){
            assert.ok(e.type === type,"The event " + e.type + "had been fired.");
            assert.ok(this === gnED,"This handler's this is right.");
            assert.ok(e.data.message === "This is balalala's data.","e.data is right.");
            assert.ok(e.eventData.message === "This is send data by event.","This is balalala's eventData from the operation of fired.");
            assert.ok(gnED.removeEventListener(type,balaHandler) === true,"Remove the event type "+type+",success.");
            gardener.EM.removeEventFromALL("balalala1",gnED.guId);
            assert.ok(wb.wb_find(gardener.fid,gnED.guId,wb.ConstUtil.EVENT).length === 2,"EM remove the "+gnED.guId+"'s event all listener,success.");
            gardener.EM.removeALLEventByGUID(gnED.guId);
            var removed = !gardener.EM.hasEventFrom("balalala2",gnED.guId) &&
                !gardener.EM.hasEventFrom("balalala3",gnED.guId) && !wb.wb_find(gardener.fid,gnED.guId,wb.ConstUtil.EVENT);
            assert.ok(removed === true,"The all event listeners belong to gnED,have been removed,success.");
            console.log(gardener.internal_getSysList());
        }

        function balaHandler1(e){

        }
    });

    //使用插件扩展wb：
    //1.定义好插件，并使用wb.plugin()方法，将插件绑定到wb上。
    gardener.EventProxy = wb.WBEventProxy;  //2.在创建的命名空间上的属性中，引用wb的插件，实质是引入了一个实例工厂。
    console.log("gardener.EventProxy:",gardener.EventProxy);
    var eventProxy = gardener.EventProxy();
    console.log("eventProxy:",eventProxy);

})(workerBee,QUnit);
