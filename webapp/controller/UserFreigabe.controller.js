sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageToast'
], function (Controller, JSONModel, MessageToast) {
	"use strict";
	return Controller.extend("com.wieland.oav.controller.UserFreigabe", {
		onInit: function () {
			var oModel = new JSONModel("/IAS/scim/Users");
			this.getView().setModel(oModel, "UsersModel");
		},
		formatMail: function (emails) {
			if (emails && emails.length > 0) {
				return emails[0].value;
			}
			return "no mail address";
		},
		isOAVUser: function(groups) {
			if (groups && groups.length > 0) {
				var result = groups.filter(group => group.value == "OAV_User");
				return !!result;
			}
			return false;	
		},
		calcPressedForFreigabeButton: function (groups) {
			return this.isOAVUser(groups);
		},
		calcTextForFreigabeButton: function (groups) {
			if (this.isOAVUser(groups)) {
				return "Freigabe zurücknehmen";
			}
			return "Freigeben";
		},
		onPress: function (evt) {
			var userID = evt.getSource().data("userID");
			if (evt.getSource().getPressed()) {
				evt.getSource().setText("Freigabe zurücknehmen");
				MessageToast.show("User wurde freigegeben und per Mail informiert.");
			} else {
				evt.getSource().setText("Freigeben");
				MessageToast.show("Dem User wurde die Freigabe entzogen.");
			}
		},
		action: function (oEvent) {
			var that = this;
			var actionParameters = JSON.parse(oEvent.getSource().data("wiring").replace(/'/g, "\""));
			var eventType = oEvent.getId();
			var aTargets = actionParameters[eventType].targets || [];
			aTargets.forEach(function (oTarget) {
				var oControl = that.byId(oTarget.id);
				if (oControl) {
					var oParams = {};
					for (var prop in oTarget.parameters) {
						oParams[prop] = oEvent.getParameter(oTarget.parameters[prop]);
					}
					oControl[oTarget.action](oParams);
				}
			});
			var oNavigation = actionParameters[eventType].navigation;
			if (oNavigation) {
				var oParams = {};
				(oNavigation.keys || []).forEach(function (prop) {
					oParams[prop.name] = encodeURIComponent(JSON.stringify({
						value: oEvent.getSource().getBindingContext(oNavigation.model).getProperty(prop.name),
						type: prop.type
					}));
				});
				if (Object.getOwnPropertyNames(oParams).length !== 0) {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName, oParams);
				} else {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName);
				}
			}
		}
	});
});