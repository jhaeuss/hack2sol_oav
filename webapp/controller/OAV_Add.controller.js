sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller,JSONModel,MessageBox,Filter,FilterOperator) {
	"use strict";

	return Controller.extend("test.Test.controller.main", {

	onInit: function () {
		var oModel = new JSONModel();
		oModel.setData({
					"bloeckeCollection":[
						{ "Text": "06:00 - 10:00",
						   "State":"5/5",
						   "Ladestelle": "L2",
						   "BlockDate": "2018-11-28"
	                    },
	                    { "Text": "10:00 - 12:00",
						   "State":"5/5",
						   "Ladestelle": "L2",
						   "BlockDate": "2018-11-28"
	                    },
	                    { "Text": "06:00 - 10:00",
						   "State":"5/5",
						   "Ladestelle": "L1",
						   "BlockDate": "2018-11-28"
	                    },
	                    { "Text": "06:00 - 10:00",
						   "State":"5/5",
						   "Ladestelle": "L2",
						   "BlockDate": "2018-11-29"
	                    }
					]
  	    });
  	    
  	    this.getView().setModel(oModel,"Bloecke");
  	    var aFilter = [];
  	    this.byId("intervalCalendar").setNonWorkingDays([5,6]); 
  	    var list = this.byId("ListTest");
  	    var listB = list.getBinding("items");
  	    aFilter.push(new Filter("BlockDate", FilterOperator.EQ, "2018-11-28"));
  	    aFilter.push(new Filter("Ladestelle", FilterOperator.EQ, "L2"));
  	    listB.filter(aFilter);
  	},
  	onFahrzeugtypChange: function (event) {
  	    var param = event.getParameters("selectedItem");
  	    var selectedItem = param.selectedItem.getKey();
  	    if("LAU" === selectedItem || "LHA" === selectedItem) {
  	    	this.byId("label_Fahrzeugkennzeichen2").setVisible(true);
  	    	this.byId("input_Fahrzeugkennzeichen2").setVisible(true);
  	    } else{
  	    	this.byId("label_Fahrzeugkennzeichen2").setVisible(false);
  	    	this.byId("input_Fahrzeugkennzeichen2").setVisible(false);
  	    }
  	},
	onAddPosition: function () {
		MessageBox.show("asdfas dafdfasdf");
	},
    handleCalendarSelect: function(event){
    	var d = event.getSource().getSelectedDates()[0].getStartDate();
		if(!!d){
			var dateStr = d.getFullYear() + "-" + (d.getMonth() +1) + "-" + 	d.getDate();
		  
  	        var aFilter = [];
	  	    this.byId("intervalCalendar").setNonWorkingDays([0,1,2]); 
	  	    var list = this.byId("ListTest");
	  	    var listB = list.getBinding("items");
	  	    aFilter.push(new Filter("BlockDate", FilterOperator.EQ, dateStr));
	  	    aFilter.push(new Filter("Ladestelle", FilterOperator.EQ, "L2"));
	  	    listB.filter(aFilter);                
		}
    },
    navBack: function(event) {
    	var wizard = this.getView().byId("CreateAvisierungWizard");
		var step1 = this.getView().byId("LieferdatenStep");
		wizard.discardProgress(step1);
    	this.getOwnerComponent().getRouter().navTo("Home");
    },
    wizardCompletedHandler: function(event) {
    	// instantiate dialog
		if (!this._dialog) {
			this._dialog = sap.ui.xmlfragment("com.wieland.oav.view.BusyDialog", this);
			this.getView().addDependent(this._dialog);
		}

		// open dialog
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._dialog);
		this._dialog.open();
		var that = this;

		// simulate end of operation
		jQuery.sap.delayedCall(3000, this, function () {
			this._dialog.close();
			that.navBack();
		}.bind(this));
    }
});
});