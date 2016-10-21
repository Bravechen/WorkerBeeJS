# WorkerBee

## 属性 propertise

### VERSION

WorkerBee版本号

### ConstUtil

常量工具

### prototype

核心原型。用来创建核心或命名空间对象。

创建出来的对象的原型(`__proto__`)含有该对象拥有的方法

#### wb_save

保存一个对象到对应列表中

**此方法已经不再定义在WorkerBee.prototype对象，但仍然在原型中提供。**

#### wb_destroy

销毁一个对象到对应列表中

**此方法已经不再定义在WorkerBee.prototype对象，但仍然在原型中提供。**

#### wb_find

从对应列表中查找一个对象

**此方法已经不再定义在WorkerBee.prototype对象，但仍然在原型中提供。**

#### wb_length

从对应列表的对象数量

**此方法已经不再定义在WorkerBee.prototype对象，但仍然在原型中提供。**

---

## 方法

### createObject

创建一个核心对象或者命名空间

### extend

- target
- source

混合2个对象，返回参数target所指向的对象

### guId

guid生成器，生成一段guid随机字符串

---
## 管理对象工厂模型
---

### WBManager

通用管理对象工厂模型。

用来生成一个有特殊用途的管理对象工厂模型

#### prototype

在生成对象工厂实例时，所使用的原型。

生成管理对象实例后，实例对象的原型(`__proto__`),会指向对应工厂模型所提供的prototype属性

#### init

创建特殊用途的管理对象工厂模型

#### create

根据工厂模型提供的prototype属性，创建一个管理对象实例

---

### WBObjectManager

对象管理工厂模型

#### prototype

用来生成对象管理实例对象过程中，所需的原型。

##### master

管理对象实例，所在的核心对象或命名空间

##### addObject

添加一个对象到对象列表中

##### removeObject

从对象列表中移除一个对象

##### getObject

从对象列表中获取一个对象

##### inGNList

判断一个对象是否在对象列表中

##### length

返回对象列表中的对象数量

#### LIST_TYPE

使用的列表类型

---
### WBEventManager

事件管理对象工厂模型

#### LIST_TYPE

使用的列表类型

#### prototype

创建事件管理对象实例时，使用的原型对象

##### master

事件管理对象所在的核心对象或者命名空间

##### addEventFrom

添加一个事件源到事件管理列表

##### removeEventFrom

从事件管理列表中移除一个事件源

##### getEventFrom

从事件管理列表中获取一个事件源

##### hasEventFrom

判断是否含有指定的事件源

##### dispatchEventFrom

派发一个事件源所含有的事件

---
### WBFrameManager

帧循环管理对象工厂模型

#### LIST_TYPE

使用的列表类型

#### prototype

创建帧循环管理对象时，所用的原型

##### master

帧循环管理对象所在的核心或命名空间

---
### WBLogManager

日志管理对象工厂模型

#### LIST_TYPE

使用的列表类型

#### prototype

创建日志管理对象时，所使用的原型

##### master

日志管理对象所在的核心或命名空间

##### addLog

添加一条日志

##### showAllLog

返回包含全部日志的数组

##### showLastLog

显示最新保存的一条日志

##### clearAllLog

清空所有日志

---
## 通用对象工厂模型

---
### WBObjectModel

通用对象工厂模型可以用来创建特殊用途的对象工厂模型

也提供创建框架运行需要的工厂方法，用来创建所需的对象。

#### prototype

在返回的用于创建对象实例的工厂方法中，创建一个实例对象所用到的原型。

#### init

创建一个具有特殊功能的工厂模型

#### create

创建一个工厂方法。可以用来创建满足要求的对象实例。

实例的原型(`__proto__`)包含工厂模型的prototype属性中的方法和属性

---

### WBObject

对象工厂模型。用来为框架创建普通的对象。

#### className

创建的对象的类型名称的字符串标识，只是用来识别，不用做任何类型判断。

但会被用于对象池的创建。如果在实际任务中，需要用到对象池的话。

#### prototype

创建一个具体对象实例时，所用到的原型。

##### output

输出对象的信息。

##### terminalClear

对当前对象进行一次清理重置。可以覆盖和扩展

##### destroyObject

销毁一个对象。终结一个对象的生命周期。

---
### WBEventDispatcher

事件派发者的工厂模型。它来自于`WBObject`，使用`WBObject.init()`被创建出来。

#### className

创建出的对象的类型标识。

#### prototype

创建一个事件派发者对象时，所使用的原型。

##### addEventListener

侦听一个事件，添加事件侦听器

##### removeEventListener

移除某个事件一个侦听器

##### hasEventListener

对象是否含有对某个事件的侦听器

##### dispatchEvent

派发一个事件
