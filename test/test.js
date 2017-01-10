(function(wb,QUnit){
    "use strict";

    QUnit.test("WorkerBee save obj in list, and destroy obj from list",function(assert){
        var ClassA = wb.createCore();
        var ClassB = wb.createCore();
        assert.ok(ClassA.internal_getSysList() !== ClassB.internal_getSysList(),"Each framework has a unique sysList.");
        assert.ok(true,"Framework ClassA's sysList===>"+ClassA.internal_getSysList().guid);
        assert.ok(true,"Framework ClassB's sysList===>"+ClassB.internal_getSysList().guid);
        var constUtil = wb.ConstUtil;
        ClassB.debug = false;
        var obj1 = {name:"123"},
            obj2 = {name:"456"},
            obj3 = {name:"xcv"},
            obj4 = {name:"789"};
        ClassA.wb_save("abc",obj1,constUtil.OBJECT);
        ClassB.wb_save("def",obj2,constUtil.OBJECT);
        ClassB.wb_save("123",obj3,constUtil.OBJECT);
        ClassA.wb_save("qwe",obj4,constUtil.OBJECT);
        assert.ok(ClassA.wb_find("qwe",constUtil.OBJECT) === obj4,"a obj is in list");
        ClassA.wb_destroy("qwe",constUtil.OBJECT);
        assert.ok(ClassA.wb_find("qwe",constUtil.OBJECT) === undefined,"delete a obj from list is ok");
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
        console.log(gardener.internal_getSysList());
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
        console.log(gardener.internal_getSysList());
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
        console.log(gardener.internal_getList(wb.ConstUtil.EVENT));
        var type = "balalala";
        gnED.addEventListener("balalala",balaHandler,{message:"This is balalala's data."},gnED);
        assert.ok(gnED.hasEventListener(type,gnED.guId) === true,"The event "+ type + " has been register.");
        assert.ok(gardener.EM.hasEventFrom(type,gnED.guId) === true,"The event "+type+" is in EM's list.");
        assert.ok(gnED.dispatchEvent(type,{message:"This is send data by event."}) === true,"fire the event "+type+",success.");

        function balaHandler(e){
            assert.ok(true,"The event " + e.type + "had been fired.");
            assert.ok(this === gnED,"This handler's this is right.");
            assert.ok(e.data.message === "This is balalala's data.","e.data is right.");
            assert.ok(e.eventData.message === "This is send data by event.","This is balalala's eventData from the operation of fired.");
            console.log("In event handler===>",e);
            assert.ok(gnED.removeEventListener(type,balaHandler) === true,"Remove the event type "+type+",success.");
            console.log("after remove:",gardener.internal_getList(wb.ConstUtil.EVENT));
        }
    });

})(workerBee,QUnit);
