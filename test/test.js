(function(wb,QUnit){
    "use strict";

    QUnit.test("create a Framework,and name libName and shortName for it.",function(assert){
        var gardener = wb.createCore("gardener","gn");
        console.log(gardener);
        console.log(gardener.OM);
        assert.ok(gardener.libName === "gardener","libName passed.");
        assert.ok(gardener.shortName === "gn","shortName passed.");
    });

    QUnit.test("WorkerBee save obj in list, and destroy obj from list",function(assert){
        var ClassA = wb.createCore();
        var ClassB = wb.createCore();
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
        console.log("1111111111111",ClassA.internal_getList(constUtil.OBJECT));
        assert.ok(ClassA.wb_find("qwe",constUtil.OBJECT) === obj4,"a obj is in list");
        //ClassA.wb_destroy("qwe",constUtil.OBJECT);
        //assert.ok(ClassA.wb_find("qwe",constUtil.OBJECT) === undefined,"delete a obj from list is ok");

    });
})(WorkerBee,QUnit);
