sap.ui.define([], function () {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
		downloadLinkFormatter: function (DocumentId) {
			return this.getModel().sServiceUrl + "/AttachmentViewSet('" + DocumentId + "')/$value";
		},

		positionNumberFormat: function (sPosNo) {
			if (sPosNo) {
				return sPosNo >= 5 ? sPosNo.substr(0, 5) : sPosNo;
			}
			return sPosNo;
		},

		dateFormat: function (value) {
			if (value === "" || value === null) {
				return value;
			}

			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd.MM.yyyy"
			});
			var dateFormatted = dateFormat.format(value);
			return dateFormatted;
		},
		timeFormat: function (value) {
			if (value === "" || value === null || value === "PT00H00M00S" || value.ms === 0) {
				return "";
			} else {
				return value;
			}
		},
		dateFormatToOdata: function (value) {
			if (!value) {
				return value;
			}

			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyyMMdd"
			});
			var dateFormatted = dateFormat.format(value);
			return dateFormatted;
		},
		oDataTodateFormat: function (value) {
			if (!value) {
				return value;
			}
			return value.substring(6, 8) + "." + value.substring(4, 6) + "." + value.substring(0, 4);
		},

		// timeFormat: function (time) {
		// 	if (time == undefined) return "";
		// 	var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
		// 		pattern: "HH:mm"
		// 	});
		// 	var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
		// 	var timeStr = timeFormat.format(new Date(time.ms + TZOffsetMs));
		// 	return timeStr;
		// },

		urlFormat: function (value) {
			return [cus.AKSA.WorkOrder.utils.Util.url, cus.AKSA.WorkOrder.utils.Util.Folder, value].join("/");
		}

	};

});