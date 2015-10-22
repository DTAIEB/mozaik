var Reflux      = require('reflux');
var ApiActions  = require('./../actions/ApiActions');
var ConfigStore = require('./ConfigStore');

var buffer = [];

var ApiStore = Reflux.createStore({
	ws: null, 
	
    init() {
        this.listenTo(ConfigStore, this.initWs);
    },

    initWs(config) {
        var proto = 'ws';
        if (config.useWssConnection === true) {
            proto = 'wss';
        }

        this.ws = new WebSocket(`${ proto }://${ window.document.location.host }`);
        var ws = this.ws;
        ws.onmessage = event => {
            ApiStore.trigger(JSON.parse(event.data));
        };

        ws.onopen = () => {
            buffer.forEach(request => {
                ws.send(JSON.stringify(request));
            });
        };
        
        ws.onclose = function(evt){
    		console.log("WebSocket Mozaik API Store closed");
			//May be timeout
			//console.log( JSON.stringify(evt) );
			console.log("Restarting WebSocket Mozaik API Store...");
			ws = null;
			delete this.ws;
			ws = this.ws = new WebSocket(`${ proto }://${ window.document.location.host }`);
    	}
        
        this.listenTo(ApiActions.get, this.get);
    },

    get(id, params) {
    	var ws = this.ws;
        if (ws === null || ws.readyState !== WebSocket.OPEN) {
            buffer.push({
                id:     id,
                params: params || {}
            });

            return;
        }

        ws.send(JSON.stringify({
            id:     id,
            params: params || {}
        }));
    }
});

module.exports = ApiStore;