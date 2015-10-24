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
        
        //Setup ws
        this.setupWs(proto);
        
        this.listenTo(ApiActions.get, this.get);
    },
    
    setupWs(proto){
    	if ( this.ws && ws.readyState === WebSocket.OPEN ){
    		return console.log("websocket already started");
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
            
   			//register the apis again if retrying the connection
			if (this.retryConnection){
				console.log("Reconnecting the APIs");
 
    			for ( var i = 0 ; i < this.wsRetryParams.length; i++ ){
    				var api = this.wsRetryParams[i];
    				this.get(api.id, api.params);
    			};
    			this.retryConnection = false;
			}
        };
        
        ws.onclose = function(evt){
    		console.log("WebSocket Mozaik API Store closed");
    		delete this.ws;
			//May be timeout, retry in 1s
    		setTimeout( function(){
    			console.log("Restarting WebSocket Mozaik API Store...");
    			this.retryConnection = true;
    			this.setupWs(proto);
    		}.bind(this), 1000);			
    	}.bind(this);
    },
    
    retryConnection: false,		//Indicate whether we are reconnecting
    wsRetryParams : [], //Remember the api params when reconnecting the websocket
    
    get(id, params) {
    	var ws = this.ws;
    	if ( !this.retryConnection ){
    		this.wsRetryParams.push({id:id,params:params});
    	}
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