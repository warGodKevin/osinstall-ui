import Ember from 'ember';
export default Ember.Route.extend({
	deviceSrv: Ember.inject.service('api/device/service'),
	model: function() {
        return Ember.RSVP.hash({
        	preInstallDeviceNum:this.get('deviceSrv').getNumByStatus("pre_install").then(function(data){return data.Content.count;}),
			installingDeviceNum:this.get('deviceSrv').getNumByStatus("installing").then(function(data){return data.Content.count;}),
			failureDeviceNum:this.get('deviceSrv').getNumByStatus("failure").then(function(data){return data.Content.count;}),
			successDeviceNum:this.get('deviceSrv').getNumByStatus("success").then(function(data){return data.Content.count;}),
		});
    },
    setupController: function(controller, model) {
    	model.SumDeviceNum = parseInt(model.preInstallDeviceNum) + parseInt(model.installingDeviceNum) + parseInt(model.failureDeviceNum) + parseInt(model.successDeviceNum);
    	controller.set("model",model);
    }
});
