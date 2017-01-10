(function(wb,QUnit){
    "use strict";

    QUnit.test("create a Framework,and name libName and shortName for it.",function(assert){
        var gardener = wb.createCore("gardener","gn");
        assert.ok(gardener.libName === "gardener","libName passed.");
        assert.ok(gardener.shortName === "gn","shortName passed.");
    });

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

    console.log("wb.WBObject",wb.WBObject);
    console.log("wb.WBEventDispatcher",wb.WBEventDispatcher);

    var ClassC = wb.createCore("ClassC","cc");
    console.log("ClassC",ClassC);
    ClassC.CCObject = wb.WBObject.create(ClassC);
    var ccObj = ClassC.CCObject({
        initialize:function(){
            return "This is ccObj's init.";
        },
        ccId:""
    });
    console.log(ccObj);
    //console.info("output:",ccObj.output());
    //console.info("initialize:",ccObj.initialize());

    //ClassC.CCEventDispatcher = wb.WBEventDispatcher.create(ClassC);
    //console.log("ClassC.CCEventDispatcher",ClassC.CCEventDispatcher);
    //var ccEventDispatcher = ClassC.CCEventDispatcher();
    //console.log("ccEventDispatcher instance--->",ccEventDispatcher);
    //console.info(ccEventDispatcher.output());
    //console.log("internal list:",ClassC.internal_getList(wb.ConstUtil.OBJECT));
    //ccEventDispatcher.addEventListener("abc",function(){});

    ClassC.EventProxy = wb.WBEventProxy;
    var eventProxy = ClassC.EventProxy({
        initialize:function(){
            return "This is a instance created by EventProxy plugin. ";
        }
    });
    console.log(ClassC.EventProxy.hasEvent);
    console.log(eventProxy);
    console.log(eventProxy.initialize());
    console.log(eventProxy.on());
    console.log(eventProxy.off());
    console.log(eventProxy.trigger());

})(workerBee,QUnit);
