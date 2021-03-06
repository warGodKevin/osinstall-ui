import Ember from 'ember';
const {
  get,
  set,
  computed
} = Ember;

export default Ember.Controller.extend({
	networkSrv: Ember.inject.service('api/network/service'),
    isShowNetmask:false,

    networkChange: function() {
        var self = this;
        var network = this.get('model.info.Network');
        if(!Ember.isEmpty(network)){
            self.get("networkSrv").getCidrInfoByNetwork(network).then(function(data) {
                if(data.Status==="success"){
                    set(self,"model.info.Netmask",data.Content.Mask);
                }
            });
            set(this,"isShowNetmask",true);
        }else{
          set(this,"isShowNetmask",false);
        }
    }.observes("model.info.Network"),

	actions:{
		addAction: function() {
			var self = this;
        	var form = this.get("model.info");
        	self.get("networkSrv").create(form).then(function(data) {
                if(data.Status==="success"){
                    Ember.$.notify({
                    	message: "保存成功!"
                    }, {
                    	animate: {
                    		enter: 'animated fadeInRight',
                    		exit: 'animated fadeOutRight'
                    	},
                    	type: 'success'
                    });
                    self.transitionToRoute('dashboard.network.list');
                } else {
                    Ember.$.notify({
                    	title: "<strong>保存失败:</strong>",
                    	message: data.Message
                    }, {
                    	animate: {
                    		enter: 'animated fadeInRight',
                    		exit: 'animated fadeOutRight'
                    	},
                    	type: 'danger'
                    });
                }
            });
        },
	}
});
