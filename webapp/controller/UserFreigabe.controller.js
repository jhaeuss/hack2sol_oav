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
		isOAVUser: function (user) {
			if (user.groups && user.groups.length > 0) {
				var result = user.groups.filter(group => group.value == "OAV_User");
				return !!result && result.length > 0;
			}
			return false;
		},
		calcPressedForFreigabeButton: function (user) {
			return this.isOAVUser(user);
		},
		calcTextForFreigabeButton: function (user) {
			if (this.isOAVUser(user)) {
				return "Freigabe zurücknehmen";
			}
			return "Freigeben";
		},
		onPress: function (evt) {
			var user = evt.getSource().data("user");
			if (evt.getSource().getPressed()) {
				evt.getSource().setText("Freigabe zurücknehmen");
				this.addUser2Group(user);
			} else {
				evt.getSource().setText("Freigeben");
				this.removeUserFromGroup(user);
			}
		},
		addUser2Group: function (user) {
			if (!user.groups) {
				user.groups = [];
			}
			user.groups.push({
				"value": "OAV_User"
			});
			this.updateUser(user,
				function (data, textStatus, jqXHR) {
					MessageToast.show("User " + user.id + " wurde freigegeben.");
				},
				function (e) {
					MessageToast.show("Fehler: User " + user.id + " konnte nicht freigegeben werden! (" + e + ")");
				}
			);
		},
		updateUser: function (user, successHandler, errorHandler) {
			var myData = {
				"id": user.id,
				"groups": user.groups
			};
			var aData = jQuery.ajax({
				type: "PUT",
				contentType: "application/scim+json",
				url: "/IAS/scim/Users/" + user.id,
				dataType: "json",
				data: JSON.stringify(myData),
				success: successHandler,
				error: errorHandler,
				async: false
			});
		},
		removeUserFromGroup: function (user) {
			if (!user.groups) {
				user.groups = [];
			}
			user.groups = user.groups.filter(group => group.value != "OAV_User");
			this.updateUser(user,
				function (data, textStatus, jqXHR) {
					MessageToast.show("Dem User " + user.id + " wurde die Freigabe entzogen.");
				},
				function (e) {
					MessageToast.show("Fehler: Dem User " + user.id + " konnte die Freigabe nicht entzogen werden! (" + e + ")");
				}
			);
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