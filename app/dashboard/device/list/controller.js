import Ember from 'ember';
const {
  get,
  set,
  computed
} = Ember;

export default Ember.Controller.extend({
	deviceSrv: Ember.inject.service('api/device/service'),
	page:1,
	pageCount:1,
	pageSize:10,
	form:{Status:null,OsID:null,HardwareID:null,SystemID:null,Keyword:null,BatchNumber:null},
	isShowMultiSearchBlock:false, //是否显示复杂查询区块
	isShowInstallInfoCol:false,
    selectAll:false,//是否全选
    autoRefresh:true,//是否自动刷新
    autoRefreshTimer:null,
    autoRefreshTime:20000,

    autoRefreshChange: function() {
        var self = this;
        var autoRefresh = this.get('autoRefresh');
        if(autoRefresh === true){
            this.set('autoRefreshTimer', setInterval(function() {
                self.send("pageChanged",self.get("page"));
            }, self.get("autoRefreshTime")));
        }else{
            clearInterval(self.get('autoRefreshTimer'));
            self.set('autoRefreshTimer', null);
        }
    }.observes("autoRefresh"),

    selectAllChange: function() {
        var self = this;
        var selectAll = this.get('selectAll');
        var rowList = this.get("rowList");
        Object.keys(rowList).forEach(function (key) {
            var re = /^[0-9]*]*$/;
            if(re.test(key)){
                var row = rowList[key];
                set(row,"checked",selectAll); 
            }
        });
    }.observes("selectAll"),

	actions:{
		showMultiSearchBlockAction:function(){
			set(this,'isShowMultiSearchBlock',true);
		},
		hideMultiSearchBlockAction:function(){
			set(this,'isShowMultiSearchBlock',false);
		},
        searchBatchNumberAction:function(batchNumber){
            //set(this,'form.BatchNumber',batchNumber);
            var keyword = this.get("form.Keyword");
            if(!Ember.isEmpty(keyword)){
                keyword += "\n" + batchNumber;
            }else{
                keyword = batchNumber;
            }
            set(this,'form.Keyword',keyword);
            this.send("pageChanged",this.get("page"));
        },
		queryAction:function(form){
			this.set('form',form);
			this.send("pageChanged",this.get("page"));
            var self = this;
            if(this.get("autoRefresh") === true && this.get("autoRefreshTimer") === null){
                this.set('autoRefreshTimer', setInterval(function() {
                    self.send("pageChanged",self.get("page"));
                }, self.get("autoRefreshTime")));
            }
		},
		searchAction:function(){
            //console.log(this.get("form"));
			this.send("pageChanged",this.get("page"));
		},
		pageChanged:function(page){
			var self = this;
			this.set("page",page);
			var pageSize = this.get("pageSize");
			var form = this.get("form");
			if(form.Status === "installing" || form.Status === "failure"){
				self.set('isShowInstallInfoCol',true);
			}else{
				self.set('isShowInstallInfoCol',false);
			}
			this.get("deviceSrv").list(pageSize,(page-1)*pageSize,form).then(function(data){
                self.set('rowList', data.Content.list);
                var pageCount = Math.ceil(data.Content.recordCount/pageSize);
                if(pageCount <= 0){
                	pageCount = 1;
                }
                self.set('pageCount',pageCount);
            });
		},
        reInstallAction:function(){
            var self = this;
            var rowList = self.get("rowList");
            var datas = [];
            Object.keys(rowList).forEach(function (key) {
                var re = /^[0-9]*]*$/;
                if(re.test(key)){
                    var row = rowList[key];
                    if(row.checked === true){
                        var currentData = {};
                        currentData.ID = row.ID;
                        datas.pushObject(currentData);
                    }
                }
            });
            if(datas.length === 0){
                alert("请先选中要重装的设备!");
                return ;
            }
            self.get("deviceSrv").batchReInstall(datas).then(function(data) {
                    if(data.Status==="success"){
                        Ember.$.notify({
                            message: "操作成功!"
                        }, {
                            animate: {
                                enter: 'animated fadeInRight',
                                exit: 'animated fadeOutRight'
                            },
                            type: 'success'
                        });
                        self.send("pageChanged",self.get("page"));
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

        batchDeleteAction:function(){
            var self = this;
            var rowList = self.get("rowList");
            var datas = [];
            Object.keys(rowList).forEach(function (key) {
                var re = /^[0-9]*]*$/;
                if(re.test(key)){
                    var row = rowList[key];
                    if(row.checked === true){
                        var currentData = {};
                        currentData.ID = row.ID;
                        datas.pushObject(currentData);
                    }
                }
            });
            if(datas.length === 0){
                alert("请先选中要删除的设备!");
                return ;
            }
            if(confirm("确定删除吗?")){
                self.get("deviceSrv").batchDelete(datas).then(function(data) {
                    if(data.Status==="success"){
                        Ember.$.notify({
                            message: "操作成功!"
                        }, {
                            animate: {
                                enter: 'animated fadeInRight',
                                exit: 'animated fadeOutRight'
                            },
                            type: 'success'
                        });
                        self.send("pageChanged",self.get("page"));
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
            }
        },

		
		deleteAction: function(id) {
            if(confirm("确认删除吗？")){
    			var self = this;
            	self.get("deviceSrv").deleteRowById(id).then(function(data) {
                    if(data.Status==="success"){
                        Ember.$.notify({
                        	message: "删除成功!"
                        }, {
                        	animate: {
                        		enter: 'animated fadeInRight',
                        		exit: 'animated fadeOutRight'
                        	},
                        	type: 'success'
                        });
                        //self.transitionToRoute('dashboard.os.list');
                        self.send("pageChanged",self.get("page"));
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
            }
        },
	}
});