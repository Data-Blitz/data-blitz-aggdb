

var example = function() {};

module.exports = {

    build :function(anApp, anAppNode) {
        console.log('building something, starting with '+JSON.stringfy(anApp)+' using '+ JSON.stringify(anAppNode));
        return anApp;


    },
    rebuild : function(anApp, anAppNode) {
        return anApp;

    }

}
