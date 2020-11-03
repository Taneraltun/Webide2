/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/toros/ZPM_MALF_NOTIF/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});