sap.ui.define([
	"sap/ui/core/mvc/Controller", 
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";
	return Controller.extend("wielandRegistrationSample.controller.View1", {
		/**
		 *@memberOf wielandRegistrationSample.controller.View1
		 */
		doSomethingCritical: function (oEvent) {
			MessageBox.alert('Something critical happened!');
		}
	});
});