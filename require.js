(function(global){
/**
 * @license RequireJS 0.0.1
 * author: echozzh
 */
 var isBrowser = !!(typeof window !== "undefined" && navigator && document),
     context={
      topModule:"",
      waitings:[],
      loadeds:[],
      baseUrl:"",
      modules:[] 
     } ;
  
/**
 * 判断变量是否函数
 * @param  {[type]}
 * @return {Boolean}
 */
function isFunction(it) {
   return Object.prototype.toString.call(it) === "[object Function]";
}

/**
 * 判断变量是否数组
 * @param  {[type]}
 * @return {Boolean}
 */
function isArray(it) {
    return Object.prototype.toString.call(it) === "[object Array]";
}

/**
 * 遍历集合
 * 如果func返回true，跳出遍历
 * @param  {[type]}  
 * @return {[type]}
 */
function eachList(list,func){
     if(list){
       for(var i=0,len=list.length;i<len;i++){
          if(func(list[i],i,list)) {
             break;
            }
       }
     }
}

/**
 * 判断对象是否具有某属性
 * @param  {[type]} obj 对象  prop 属性
 * @return {Boolean}
 */
function hasProp(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * 循环遍历对象上的属性,并对每一次遍历调用函数
 * 当回调函数返回真值，结束遍历
 * @return {[type]}
 */
function eachProp(obj, func) {
    var prop;
    for (prop in obj) {
        if (hasProp(obj, prop)) {
            if (func(obj[prop], prop)) {
                break;
            }
        }
    }
} 
/**
 * 函数：将源对象的方法和属性拷贝到目标对象
 * @param  {[type]}  target 目标对象 source 源对象 force 是否强制覆盖原有属性  deepStringMixin是否深拷贝
 * @return {[type]}  targrt 目标
 */
function mixin(target, source,force,deepStringMixin) {
    if (source) {
        eachProp(source, function (value, prop) {
            if (force || !hasProp(target, prop)) {
                if (deepStringMixin && typeof value === 'object' && value &&
                    !isArray(value) && !isFunction(value) &&
                    !(value instanceof RegExp)) {

                    if (!target[prop]) {
                        target[prop] = {};
                    }
                    mixin(target[prop], value, force, deepStringMixin);
                } else {
                    target[prop] = value;
                }
            }
        });
    }
    return target;
}

/**
 * 从数组中删除指定元素
 * @param  {[type]}
 * @return {[type]}
 */
 function removeByEle(arr, ele) {
        let index = arr.indexOf(ele);
        if (index === -1) return;
        arr.splice(index, 1);
}

/**
 * 获取唯一标识
 * @return {[type]}
 */
function getUnqName(){
  return "$" + new Date().getTime()+(Math.round(Math.random()*100));
}

 var requireJs={
    version:"0.0.1"
 };

 /**
 * require方法，加载一个模块
 * @param  {[type]}  deps    [依赖数组]
 * @param  {Function} callback [工厂函数]
 * @return {[type]}
 */
 requireJs.require=function(deps,callback){

        if (typeof name !== 'string') {
            callback = deps;
            deps = name;
            name = null;
        }

       if (!isArray(deps)) {
            callback = deps;
            deps = [];
        }

        // 生成随机模块名,方法
        let moduleName = getUnqName();
        context.topModule = moduleName;
        context.waitings.push(moduleName);
        // 生成一个模块配置
        context.modules[moduleName] = {
            moduleName: moduleName,
            deps: deps,
            factory: callback,
            args: [],
            returnValue: ""
        }

        deps.forEach(function(dep) {
            var scriptNode = document.createElement("script");
            scriptNode.setAttribute("data-module-name", dep);
            scriptNode.async = true;
            scriptNode.src = context.baseUrl + dep + ".js";
            document.querySelector("head").appendChild(scriptNode);
            scriptNode.onload = scriptOnload;
            context.waitings.push(dep);
        });

 }

/**
 * [define和 require 做的工作几乎相同]
 * @param  {[array]} deps    [依赖数组]
 * @param  {[function]} callback [工厂函数]
 * @return {[type]}
 */
 requireJs.define=function(name,deps,callback){

      if (typeof name !== 'string') {
            callback = deps;
            deps = name;
            name = null;
        }

      if (!isArray(deps)) {
            callback = deps;
            deps = [];
        }

        //生成一个模块配置
        tempModule = {
            deps: deps,
            factory: callback,
            args: [],
            returnValue: ""
        }

        // 递归遍历所有依赖，添加到 `head` 中，并设置 这个节点的一个属性`data-module-name`标识模块名
        deps.forEach(function(dep) {
            var scriptNode = document.createElement("script");
            scriptNode.setAttribute("data-module-name", dep);
            scriptNode.async = true;
            scriptNode.src = context.baseUrl + dep + ".js";
            document.querySelector("head").appendChild(scriptNode);
            scriptNode.onload = scriptOnload;
            context.waitings.push(dep);
        });


 }

 /**
 *  [每一个脚本插入head中，都会执行这个事件 。这个函数完成两件事：
 *  1. 如果是一个匿名模块加载，那么取得这个匿名模块，并完成模块命名,
 *  2. 当节点加载完毕，判断context.waitings是否为空，如果不为空，返回,如果为空，说明已经全部加载完毕，现在就可以执行所有的工厂函数]
 * @param  {[object]} e [事件对象]
 * @return {[type]}
 */
function scriptOnload(e) {
    e = e || window.event;
    let node = e.target;
    let moduleName = node.getAttribute('data-module-name');
    tempModule.moduleName = moduleName;
    context.modules[moduleName] = tempModule;
    removeByEle(context.waitings, moduleName);
    context.loadeds.push(moduleName);

    if (!context.waitings.length) {
        // console.log(context.modules);
        exec(context.topModule);
    }
}

/**
 * 所有模块加载完毕，递归执行工程函数 , 核心方法
 * @param  {[string]} moduleName [模块名]
 * @return {[type]}
 */
function exec(moduleName) {
    let module = context.modules[moduleName];
    let deps = module.deps;
    let args = [];
    if(deps){
        deps.forEach(function(dep) {
            exec(dep);
            args.push(context.modules[dep].returnValue);
        });
        module.args = args;
        module.returnValue = context.modules[moduleName].factory.apply(context.modules[moduleName], args);
    }

}

/**
 * 配置函数
 * @param  {[type]}. config [配置对象]
 * @return {[type]}
 */
requireJs.config=function(config){
     context.baseUrl = config.baseUrl || baseUrl;
}

/**
 * 查找data-main属性的script标签,
 * 根据属性值(通过新建一个script标签)加载并且解析入口文件
 */
if (isBrowser) {

     var scripts=document.getElementsByTagName('script');
     var head,src,subPath,mainScript;

     eachList(scripts,function(script){
      var dataMain = script.getAttribute('data-main');
            if (dataMain) {
                if (!head) {
                head = script.parentNode;
                }
                if (!context.baseUrl) {
                    src = dataMain.split('/');
                    mainScript = src.pop();
                    subPath = src.length ? src.join('/')  + '/' : './';
                    context.baseUrl = subPath;
                }
                // 创建顶层节点
                var dataMainNode = document.createElement('script');
                dataMainNode.async = true;
                head.appendChild(dataMainNode);
                dataMainNode.src = dataMain+ ".js";
                dataMainNode.onload = function() {
                    // 将顶层模块 从waitings里面除去，并添加到loadeds数组中
                    removeByEle(context.waitings, context.topModule)
                    context.loadeds.push(context.topModule);
                }
                return true;
            }
     });

}

//暴露接口
 global.requireJs=requireJs
 global.define=requireJs.define;
 global.require=requireJs.require;

})(window);