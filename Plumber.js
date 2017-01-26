var async = require('async');

var name = null;
var appNodeRepoAccessor = null;
var implSourceRepoAccessor = null;
var instanceCount = 0;


function getImpl(anImplPath) {
    var dir = __dirname + '/implementations/' + anImplPath;
    var path = dir + '/' + 'App.js';
    var impl = implSourceRepoAccessor.get(path);
    return impl;
}

function getImplTests(anImplPath) {
    var dir = __dirname + '/implementations/' + anImplPath;
    var path = dir + '/' + 'Test.js';
    var implTest = implSourceRepoAccessor.get(path);
    return implTest;
}


function getAppNode(anAppNodePath) {
    return appNodeRepoAccessor.get(anAppNodePath);
}

function injectDependencies(anApp, anAppNode, aLogger) {
    if (anAppNode.dependencies)
        for (dependency  in anAppNode.dependencies) {
            dependencyAppNode = anAppNode.dependencies[dependency];
            if (dependencyAppNode.value)
                anApp[dependency] = dependencyAppNode.value;
            else if (dependencyAppNode.appNodeUri) {
                if (aLogger)
                    anApp[dependency] = bake(dependencyAppNode.appNodeUri, aLogger);
                else
                    anApp[dependency] = bake(dependencyAppNode.appNodeUri);
            }
        }
    return anApp;
}


function createInstance(aPrototype)
   {
       if (typeof aPrototype.create !== 'function') {
           Object.create = function(aPrototype){
               var F =
                   function () {
                   };
               F.prototype = o;
               var instanceImpl = new F();
               instanceImpl.instanceId = instanceCount++;
               return new F();
           }
       }
       else
        return new aPrototype();
   }


function bake(anAppNodeUri, aLogger) {

    appNode = getAppNode(anAppNodeUri);
    if (!appNode)
        return ('no appNode');

    var app;
    // check for existing implementations
    if (appNode.implPath) {
        app = getImpl(appNode.implPath);
        if (app === null) {
            logger.log('info', 'cannot find impl at:' + appNode.implPath);
            app = {}
        }
        if (appNode.newInstance) {
            app = Object.create(app);
            app.instanceId = instanceCount++;
        }

    }
    else
        app = {} //new empty application, pre-dependency injections

    if (!app)
        logger.log('info', 'using existing instance of ' + appNode.name);
    if (appNode.name)
        app.name = appNode.name;

    if (appNode.configuration) //inject local AppNode configuration
        app.configuration = appNode.configuration
    if (aLogger)
        app.logger = aLogger;

    if (appNode.dependencies) {
        if (aLogger)
            app = injectDependencies(app, appNode, aLogger);
        else
            app = injectDependencies(app, appNode);
    }
    return app
}


function service(aServiceName, anApp, aConfiguratonStack) {
    for (childKey  in anApp)
        if (typeof anApp[childKey] === 'object')
            service(aServiceName, anApp[childKey], aConfiguratonStack)
    if (anApp != null)
        if (aServiceName in anApp)
            anApp[aServiceName](aConfiguratonStack);
}


function loadRunnables(aRunList, anApp, anAppFunctionKey) {

    for (childKey  in anApp)
        if (typeof anApp[childKey] === 'object') {
            loadRunnables(aRunList, anApp[childKey], anAppFunctionKey);
        }
    if (anApp)
        if ((anAppFunctionKey in anApp)) {
            logger.log('info', 'loading ' + anApp.name + '::' + anAppFunctionKey + ' for execution');
            aRunList.push(function (aCallback) {
                    logger.log('info', 'executing app: ' + anApp.name);
                    anApp.run()
                }
            )
        }
}

function loadTestables(aRunList, anApp, anAppFunctionKey) {

    for (childKey  in anApp)
        if (typeof anApp[childKey] === 'object') {
            loadTestables(aRunList, anApp[childKey], anAppFunctionKey);
        }
    if (anApp)
        if ((anAppFunctionKey in anApp)) {
            logger.log('info', 'loading ' + anApp.name + '::' + anAppFunctionKey + ' for execution');
            aRunList.push(function (aCallback) {
                    logger.log('info', 'executing app: ' + anApp.name);
                    anApp.run()
                }
            )
        }
}




function run(aRunList, callback) {
    async.parallel(aRunList);
}


module.exports = {

    "configuration": {},

    "readySelf": function (aBluePrintConfiguration) {
        name = aBluePrintConfiguration.name;
        appNodeRepoAccessor = require(aBluePrintConfiguration.appNodeRepoAccessor.impl);
        appNodeRepoAccessor.ready(aBluePrintConfiguration.appNodeRepoAccessor);
        implSourceRepoAccessor = require(aBluePrintConfiguration.implSourceRepoAccessor.impl);
        console.log('Readying Plumber:' + name);
    },


    "build": function (aRootAppNodeUri, aLogger) {
        //Download and Resolve appNode Graph
        //Construct Application impls from AppNode
        if (aLogger)
            application = new bake(aRootAppNodeUri, aLogger);

        else
            application = new bake(aRootAppNodeUri);

        if (logger)
            aLogger.log('info', 'successfully built app:' + application.name + application);
        return application;
    },
    "ready": function (anApp, aConfiguration, aLogger) {
        //resolve all connections and handshakes to all external dependencies
        //system posed, ready to run
        service('ready', anApp, aConfiguration);
        console.log('Readying Plumber App:' + anApp.name)
        return anApp;
    },
    "test": function (anApp, aConfiguration, aLogger) {
        // run the readied, tested implementation
        var runList = [];
        loadTestables(runList, anApp, 'run');
        run(runList);
    },
    "run": function (anApp) {
        // run the readied, tested implementation
        var runList = [];
        loadRunnables(runList, anApp, 'run');
        run(runList);
    }
}

//main entry point for Plumber.js processing environment
console.log('argv:' + process.argv);
var configuration = require(process.argv[2]);//read plumber configuration file
// In the beginning there was an console logger and a bare plumber
var plumber;
var logger = console;

if (configuration) {
    module.exports.readySelf(configuration);// plumber uses plumber for processing
    if (configuration.logger) { //build working logger first
        injectLogger = module.exports.build(configuration.logger.appNodeUri,logger);
        injectLogger = module.exports.ready(injectLogger, configuration.logger.configuration);
        logger = injectLogger;
    }
    plumber = module.exports.build(configuration.rootAppNodeUri, logger);//dependency inject logger
    plumber = module.exports.ready(plumber, configuration);//resolve all implementation injections,
                                                           //resulting Plumber Application graph is completelyinitialize
    //module.exports.test(plumber);//execute all AppNode run methods asynchronously
    module.exports.run(plumber);//execute all AppNode run methods asynchronously
    //plumber will continue to run until all AppNodes sporting
    //run methods return or receives shutdown method invocation
}
