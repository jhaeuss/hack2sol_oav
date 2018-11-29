sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ushell/services/Container"
], function (Controller, MessageBox, Container) {
	"use strict";
	return Controller.extend("com.wieland.oav.controller.Home", {
		onInit: function() {
			if (this.isUserInGroup("OAV_Admin")) {
				var tile = this.getView().byId("NeuregistrierungenTile");
				tile.setVisible(true);
			}
			if (this.isUserInGroup("OAV_User")) {
				var tile = this.getView().byId("AvisierungAnmeldenTile");
				tile.setVisible(true);
			}
		},
		isUserInGroup: function(groupName) {
			var user = this.getUser();
			if (user && user.groups && user.groups.length > 0) {
				var result = user.groups.filter(group => group.value === groupName);
				return !!result && result.length > 0;
			}
			return false;	
		},
		getUser: function () {
			var currentUser = this.getCurrentUser();
			if (currentUser) {
				var userName = currentUser.name;
				var aData = jQuery.ajax({
					type: "GET",
					contentType: "application/scim+json",
					url: "/IAS/scim/Users/" + userName,
					dataType: "json",
					async: false
				});
				if (aData.status == 200) {
					return aData.responseJSON;
				}
			}
			return undefined;
		},
		getCurrentUser: function () {
			var aData = jQuery.ajax({
				type: "GET",
				contentType: "application/json",
				url: "/services/userapi/currentUser",
				dataType: "json",
				async: false
			});
			if (aData.status == 200) {
				return aData.responseJSON;
			}
			return undefined;
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