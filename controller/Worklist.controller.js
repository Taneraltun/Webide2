sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment, MessageBox, UploadCollectionParameter, MessageToast) {
	"use strict";

	return BaseController.extend("com.toros.ZPM_MALF_NOTIF.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var data = {
				Erdat: new Date(),
				Aedat: new Date()
			};
			var oDateModel = new JSONModel(data);
			this.getView().setModel(oDateModel, "dateModel");
			//generalModel içinden alınacak

			var aMetarial = [];
			var oModel = new JSONModel(aMetarial);
			this.getView().setModel(oModel, "materialModel");

			var aService = [];
			var oServiceModel = new JSONModel(aService);
			this.getView().setModel(oServiceModel, "serviceModel");

			var aLabor = [];
			var oLaborModel = new JSONModel(aLabor);
			this.getView().setModel(oLaborModel, "laborModel");

			var aProgressPayment = [];
			var oProgressPaymentModel = new JSONModel(aProgressPayment);
			this.getView().setModel(oProgressPaymentModel, "progressPaymentModel");

			var aSubOrder = [];
			var oSubOrderModel = new JSONModel(aSubOrder);
			this.getView().setModel(oSubOrderModel, "subOrderModel");

			var data = {
				Zzhsponcelik: 0
			};

			var oJsonModel = new JSONModel(data);
			this.getView().setModel(oJsonModel, "generalModel");

			this.getRouter().getRoute("worklist").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function (oEvent) {
			// 0: "application"
			// 1: "ZPM_MALF_NOTIF"
			// 2: "display"
			// 3: "component"

			var aOwnerIds = sap.ui.core.Component.getOwnerIdFor(this.getView()).split("-");
			var vAction = aOwnerIds[2];
			var startupParam = this.getOwnerComponent().getComponentData().startupParameters.MaintenanceNotification;
			if (startupParam !== undefined) {
				var vMaintenanceNotification = this.getOwnerComponent().getComponentData().startupParameters.MaintenanceNotification[0];
			}
			var vVisible = false;
			var vChangeVisible = false;
			var vNewVisible = false;
			if (vAction === "display") {
				this._showFormFragment("Display");
				this.onReadOrder(vMaintenanceNotification);
			} else if (vAction === "change") {
				this._showFormFragment("Change");
				this.onReadOrder(vMaintenanceNotification);
				vVisible = true;
				vChangeVisible = true;
			} else if (vAction === "create") {
				this._showFormFragment("Change");
				vVisible = true;
				vNewVisible = true;
			}
			var data = {
				visible: vVisible,
				changeVisible: vChangeVisible,
				newVisible: vNewVisible
			};
			var oModel = new JSONModel(data);
			this.getView().setModel(oModel, "actionModel");

		},
		onReadOrder: function (vId) {
			var that = this;
			var sPath = "/GeneralDataSet('" + vId + "')"; //hangi id ile ileryeceğimizi öğrendikten sonra burayı açıp alt satırı kapatacağız
			// var sPath = "/GeneralDataSet('0004000443')";
			that.getBusyDialog().open();
			this.getView().getModel("mainService").read(sPath, {
				urlParameters: {
					"$expand": "GeneralToService,GeneralToMaterial,GeneralToLabor,GeneralToProgresPayment,GeneralToSubOrder" // istenilenleri getirmek için o navigasyonun adı ekleniyor
				},
				success: function (oData, response) {
					var oJsonModel = new JSONModel(oData);
					that.getView().setModel(oJsonModel, "generalModel");

					var oModel = new JSONModel(oData.GeneralToMaterial.results);
					that.getView().setModel(oModel, "materialModel");

					var oServiceModel = new JSONModel(oData.GeneralToService.results);
					that.getView().setModel(oServiceModel, "serviceModel");

					var oLaborModel = new JSONModel(oData.GeneralToLabor.results);
					that.getView().setModel(oLaborModel, "laborModel");

					var oProgressPaymentModel = new JSONModel(oData.GeneralToProgresPayment.results);
					that.getView().setModel(oProgressPaymentModel, "progressPaymentModel");

					var oSubOrderModel = new JSONModel(oData.GeneralToSubOrder.results);
					that.getView().setModel(oSubOrderModel, "subOrderModel");

					that.getBusyDialog().close();
					if (oData.Aufnr === "") {
						var vI18n = that.getView().getModel("i18n").getResourceBundle();
						var sMessage = vI18n.getText("maintenanceOrderReadError");
						var oMessageData = {
							TYPE: "E",
							MESSAGE: sMessage
						};
						that.displayMessage(oMessageData);
					}

				},
				error: function (error) {
					that.getBusyDialog().close();
					var sMessage = JSON.parse(error.responseText).error.message.value;
					var oMessageData = {
						TYPE: "E",
						MESSAGE: sMessage
					};
					that.displayMessage(oMessageData);
				}
			});

		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onSave: function (oEvent) {

			var vId = oEvent.getSource().getId();
			var vOperation = "";
			if (vId.indexOf("buttonSave") !== -1) {
				vOperation = "S";
			} else {
				vOperation = "C";
			}

			var that = this;
			var oView = sap.ui.getCore(); //this.getView();
			var vAuart = oView.byId("inputAuart").getValue();
			var vWerks = oView.byId("inputWerks").getValue();
			var vIlart = oView.byId("inputIlart").getValue();

			var vOteil = oView.byId("inputOteil").getValue();
			var vVaplz = oView.byId("inputVaplz").getValue();
			var vZzarz = oView.byId("inputZzarz").getValue();
			var vIngpr = oView.byId("inputIngpr").getValue();
			var vZzsbp = oView.byId("inputZzsbp").getValue();
			var vTplnr = oView.byId("inputTplnr").getValue();
			var vZzczm = oView.byId("inputZzczm").getValue();
			var vEqunr = oView.byId("inputEqunr").getValue();
			var vStat = oView.byId("inputStat").getValue();
			var vKostl = oView.byId("inputKostl").getValue();
			var vZzistkonclk = oView.byId("inputZzistkonclk").getValue();
			var vPriok = oView.byId("inputPriok").getValue();
			var vAnlzu = oView.byId("inputAnlzu").getValue();
			var vMsaus = oView.byId("inputMsaus").getValue();
			var vZzdgisaciklm = oView.byId("inputZzdgisaciklm").getValue();
			var vPlnnr = oView.byId("inputPlnnr").getValue();
			var vZzhsponcelik = oView.byId("inputZzhsponcelik").getValue();
			var vZgaranti = oView.byId("inputZgaranti").getValue();
			var vErdat = oView.byId("dpErdat").getDateValue();
			var vAedat = oView.byId("dpAedat").getDateValue();

			// var oDate = oView.byId("dpAedat").getDateValue();
			// if (oDate.getValue() !== "") {
			// 	var fromDate = com.toros.ZPM_MALF_NOTIF.model.formatter.dateFormatToOdata(oDate.getDate());
			// }

			//tüm alanlar için kontrol eklenecek 
			if (vAuart === "") {
				MessageBox.show(this.getView().getModel("i18n").getResourceBundle().getText("PleaseEnterAuart"));
				return;
			}
			if (vZzhsponcelik === "") {
				vZzhsponcelik = 0;
				// MessageBox.show(this.getView().getModel("i18n").getResourceBundle().getText("PleaseEnterAuart"));
				// return;
			}

			var aLabor = this.getView().getModel("laborModel").getData();
			var aLaborCreate = [];
			var vIsdzTmp = "";
			var vIedzTmp = "";
			for (var i = 0; i < aLabor.length; i++) {
				if (aLabor[i].Isdz !== null && aLabor[i].Isdz.ms !== 0 && aLabor[i].Iedz !== null && aLabor[i].Iedz.ms !== 0) {
					var vIsdz = aLabor[i].Isdz.split(":");
					var vIedz = aLabor[i].Iedz.split(":");
					vIsdzTmp = "PT" + vIsdz[0] + "H" + vIsdz[1] + "M00S";
					vIedzTmp = "PT" + vIedz[0] + "H" + vIedz[1] + "M00S";
				} else {
					vIsdzTmp = "PT00H00M00S";
					vIedzTmp = "PT00H00M00S";
				}
				var sLabor = {
					Isdd: aLabor[i].Isdd,
					Isdz: vIsdzTmp,
					Iedd: aLabor[i].Iedd,
					Iedz: vIedzTmp,
					Arbpl: aLabor[i].Arbpl,
					Werks: aLabor[i].Werks,
					Dauno: aLabor[i].Dauno,
					Ltxa1: aLabor[i].Ltxa1
				};
				aLaborCreate.push(sLabor);
				// if (aLabor[i].Isdz.indexOf("PT") === -1) {
				// 	var vIsdz = aLabor[i].Isdz.split(":");
				// 	aLabor[i].Isdz = "PT" + vIsdz[0] + "H" + vIsdz[1] + "M00S";
				// }
				// if (aLabor[i].Iedz.indexOf("PT") === -1) {
				// 	var vIedz = aLabor[i].Iedz.split(":");
				// 	aLabor[i].Iedz = "PT" + vIedz[0] + "H" + vIedz[1] + "M00S";
				// }
				//"PT11H00M00S";
				// PT10H44M33S
			}

			var sModuleBooking = {
				Aedat: vAedat,
				Aufnr: (this.getView().getModel("generalModel").getData().Aufnr) ? this.getView().getModel("generalModel").getData().Aufnr.trim() : "",
				Auart: vAuart,
				SubAufnr: "",
				Werks: vWerks,
				Ilart: vIlart,
				Oteil: vOteil,
				Vaplz: vVaplz,
				Zzarz: vZzarz,
				Ingpr: vIngpr,
				Zzsbp: vZzsbp,
				Tplnr: vTplnr,
				Zzczm: vZzczm,
				Equnr: vEqunr,
				Stat: vStat,
				Kostl: vKostl,
				Zzistkonclk: vZzistkonclk,
				Priok: vPriok,
				Anlzu: vAnlzu,
				Msaus: vMsaus,
				Zzdgisaciklm: vZzdgisaciklm,
				Plnnr: vPlnnr,
				Zzhsponcelik: parseInt(vZzhsponcelik, 10),
				Zgaranti: vZgaranti,
				Erdat: vErdat,
				Operation: vOperation, //"S" save "C" change
				GeneralToMaterial: this.getView().getModel("materialModel").getData(),
				GeneralToService: this.getView().getModel("serviceModel").getData(),
				GeneralToLabor: aLaborCreate,
				GeneralToProgresPayment: this.getView().getModel("progressPaymentModel").getData(),
				GeneralToSubOrder: this.getView().getModel("subOrderModel").getData()
			};

			this.getBusyDialog().open();
			this.getView().getModel("mainService").create("/GeneralDataSet", sModuleBooking, {
				async: true,
				success: function (oData) {
					that.getBusyDialog().close();
					//MessageBox.success(that.getView().getModel("i18n").getResourceBundle().getText("maintenanceCreateSuccess"));

					var vI18n = that.getView().getModel("i18n").getResourceBundle();
					var sMessage = vI18n.getText("maintenanceCreateSuccessAufnr", [oData.Aufnr, oData.SubAufnr]);
					var oMessageData = {
						TYPE: "S",
						MESSAGE: sMessage
					};
					that.displayMessage(oMessageData);
					// that.onStartUpload();
				},
				error: function (error) {
					that.getBusyDialog().close();
					var sMessage = JSON.parse(error.responseText).error.message.value;
					var oMessageData = {
						TYPE: "E",
						MESSAGE: sMessage
					};
					that.displayMessage(oMessageData);
					// MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("maintenanceCreateError"));
				}
			});

		},
		onOpenDialog: function () {
			if (!this._oDetailDialog) {
				this._oDetailDialog = sap.ui.xmlfragment(this.getView().getId(), "com.toros.ZPM_MALF_NOTIF.fragment.material", this);
				this.getView().addDependent(this._oDetailDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDetailDialog);
			}
			this.singleMaterialModelCreate();
			this._oDetailDialog.open();
		},
		onCloseDialog: function () {
			this._oDetailDialog.close();
		},

		singleMaterialModelCreate: function () {
			var sMaterial = {
				Matnr: "",
				Maktx: "",
				Menge: "",
				Einheit: "",
				Lgort: "",
				Werks: "",
				Charg: "",
				Netwr: "",
				Netpr: "",
				Labst: ""
			};
			var oModel = new JSONModel(sMaterial);
			this.getView().setModel(oModel, "singleMaterialModel");
		},
		onAddMaterial: function (oEvent) {
			var oModel = this.getView().getModel("singleMaterialModel").getData();
			var aMetarial = this.getView().getModel("materialModel").getData();
			if (this.vEdit === true) {
				aMetarial[this.vSelectedIndex] = oModel;
			} else {
				aMetarial.push(oModel);
			}
			var oJSONModel = new JSONModel(aMetarial);
			this.getView().setModel(oJSONModel, "materialModel");

			this.singleMaterialModelCreate();
		},

		onEditMaterial: function (oEvent) {
			this.vEdit = true;
			this.vSelectedIndex = oEvent.getSource().getParent().getParent().getBindingContext("materialModel").getPath().split("/")[1];

			var sMaterial = oEvent.getSource().getParent().getParent().getBindingContext("materialModel").getProperty();
			var oModel = new JSONModel(sMaterial);
			this.getView().setModel(oModel, "singleMaterialModel");
			if (!this._oDetailDialog) {
				this._oDetailDialog = sap.ui.xmlfragment(this.getView().getId(), "com.toros.ZPM_MALF_NOTIF.fragment.material", this);
				this.getView().addDependent(this._oDetailDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDetailDialog);
			}
			this._oDetailDialog.open();
		},
		onDeleteMaterial: function (oEvent) {
			var aMetarial = this.getView().getModel("materialModel").getData();
			var vSelectedIndex = oEvent.getSource().getParent().getParent().getBindingContext("materialModel").getPath().split("/")[1];
			aMetarial.splice(vSelectedIndex, 1);

			var oJSONModel = new JSONModel(aMetarial);
			this.getView().setModel(oJSONModel, "materialModel");
		},
		onAddCloseMaterial: function (oEvent) {
			var sMaterial = this.getView().getModel("singleMaterialModel").getData();
			var aMaterial = this.getView().getModel("materialModel").getData();
			if (this.vEdit === true) {
				aMaterial[this.vSelectedIndex] = sMaterial;
			} else {
				aMaterial.push(sMaterial);
			}
			var oJSONModel = new JSONModel(aMaterial);
			this.getView().setModel(oJSONModel, "materialModel");
			this.singleMaterialModelCreate();
			this._oDetailDialog.close();
		},

		// SERVICE CODE BLOCK 
		onOpenServiceDialog: function () {
			if (!this._oDetailServiceDialog) {
				this._oDetailServiceDialog = sap.ui.xmlfragment(this.getView().getId(), "com.toros.ZPM_MALF_NOTIF.fragment.service", this);
				this.getView().addDependent(this._oDetailServiceDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDetailServiceDialog);
			}
			this.singleServiceModelCreate();
			this._oDetailServiceDialog.open();
		},
		onCloseServiceDialog: function () {
			this._oDetailServiceDialog.close();
		},

		singleServiceModelCreate: function () {
			var sService = {
				Matnr: "",
				Maktx: "",
				Ekgrp: "",
				Ekorg: "",
				Lifnr: "",
				Gpreis: "",
				Waers: "TRY",
				Saknr: ""
			};
			var oModel = new JSONModel(sService);
			this.getView().setModel(oModel, "singleServiceModel");
		},
		onAddService: function (oEvent) {
			var sSingleModel = this.getView().getModel("singleServiceModel").getData();
			var aServiceModel = this.getView().getModel("serviceModel").getData();
			if (this.vServiceEdit === true) {
				aServiceModel[this.vServiceSelectedIndex] = sSingleModel;
				this.vServiceEdit = false;
			} else {
				aServiceModel.push(sSingleModel);
			}
			var oJSONModel = new JSONModel(aServiceModel);
			this.getView().setModel(oJSONModel, "serviceModel");
			this.singleServiceModelCreate();
			// if(oEvent.getSoruce().getId().indexOf("buttonZSERSubmitCloseButton") !== -1){
			// 	this._oDetailServiceDialog.close();
			// }
		},
		onEditService: function (oEvent) {
			this.vServiceEdit = true;
			this.vServiceSelectedIndex = oEvent.getSource().getParent().getParent().getBindingContext("serviceModel").getPath().split("/")[1];
			var sService = oEvent.getSource().getParent().getParent().getBindingContext("serviceModel").getProperty();
			var oJSONModel = new JSONModel(sService);
			this.getView().setModel(oJSONModel, "singleServiceModel");
			if (!this._oDetailServiceDialog) {
				this._oDetailServiceDialog = sap.ui.xmlfragment(this.getView().getId(), "com.toros.ZPM_MALF_NOTIF.fragment.service", this);
				this.getView().addDependent(this._oDetailServiceDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDetailServiceDialog);
			}
			this._oDetailServiceDialog.open();
		},
		onDeleteService: function (oEvent) {
			var aService = this.getView().getModel("serviceModel").getData(); // data cekelim
			var sServiceIndex = oEvent.getSource().getParent().getParent().getBindingContext("serviceModel").getPath().split("/")[1];
			aService.splice(sServiceIndex, 1);
			var oJSONModel = new JSONModel(aService);
			this.getView().setModel(oJSONModel, "serviceModel");
		},
		onAddCloseService: function (oEvent) {
			var sService = this.getView().getModel("singleServiceModel").getData();
			var aServiceModel = this.getView().getModel("serviceModel").getData();
			if (this.vServiceEdit === true) {
				aServiceModel[this.vServiceSelectedIndex] = sService;
				this.vServiceEdit = false;
			} else {
				aServiceModel.push(sService);
			}
			var oJSONModel = new JSONModel(aServiceModel);
			this.getView().setModel(oJSONModel, "serviceModel");
			this.singleServiceModelCreate();
			this._oDetailServiceDialog.close();
		},

		// LABOR CODE BLOCK 
		onOpenLaborDialog: function () {
			if (!this._oDetailLaborDialog) {
				this._oDetailLaborDialog = sap.ui.xmlfragment(this.getView().getId(), "com.toros.ZPM_MALF_NOTIF.fragment.labor", this);
				this.getView().addDependent(this._oDetailLaborDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDetailLaborDialog);
			}
			this.singleLaborModelCreate();
			this._oDetailLaborDialog.open();
		},
		onCloseLaborDialog: function () {
			this._oDetailLaborDialog.close();
		},

		singleLaborModelCreate: function () {
			var sLabor = {
				Isdd: new Date(),
				Isdz: "",
				Iedd: new Date(),
				Iedz: "",
				Arbpl: "",
				Werks: "",
				Dauno: "",
				Ltxa1: ""
			};
			var oModel = new JSONModel(sLabor);
			this.getView().setModel(oModel, "singleLaborModel");
		},
		onAddLabor: function (oEvent) {
			var sSingleModel = this.getView().getModel("singleLaborModel").getData();
			var aLaborModel = this.getView().getModel("laborModel").getData();
			if (this.vLaborEdit === true) {
				aLaborModel[this.vLaborSelectedIndex] = sSingleModel;
				this.vLaborEdit = false;
			} else {
				aLaborModel.push(sSingleModel);
			}
			var oJSONModel = new JSONModel(aLaborModel);
			this.getView().setModel(oJSONModel, "laborModel");
			this.singleLaborModelCreate();
			// if(oEvent.getSoruce().getId().indexOf("buttonZSERSubmitCloseButton") !== -1){
			// 	this._oDetailServiceDialog.close();
			// }
		},
		onEditLabor: function (oEvent) {
			this.vLaborEdit = true;
			this.vLaborSelectedIndex = oEvent.getSource().getParent().getParent().getBindingContext("laborModel").getPath().split("/")[1];
			var sLabor = oEvent.getSource().getParent().getParent().getBindingContext("laborModel").getProperty();
			var oJSONModel = new JSONModel(sLabor);
			this.getView().setModel(oJSONModel, "singleLaborModel");
			if (!this._oDetailLaborDialog) {
				this._oDetailLaborDialog = sap.ui.xmlfragment(this.getView().getId(), "com.toros.ZPM_MALF_NOTIF.fragment.labor", this);
				this.getView().addDependent(this._oDetailLaborDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDetailLaborDialog);
			}
			this._oDetailLaborDialog.open();
			//	this._oDetailLaborDialog.open();
		},
		onDeleteLabor: function (oEvent) {
			var aLabor = this.getView().getModel("laborModel").getData(); // data cekelim
			var sLaborIndex = oEvent.getSource().getParent().getParent().getBindingContext("laborModel").getPath().split("/")[1];
			aLabor.splice(sLaborIndex, 1);
			var oJSONModel = new JSONModel(aLabor);
			this.getView().setModel(oJSONModel, "laborModel");
		},
		onAddCloseLabor: function (oEvent) {
			var sLabor = this.getView().getModel("singleLaborModel").getData();
			var aLaborModel = this.getView().getModel("laborModel").getData();
			if (this.vLaborEdit === true) {
				aLaborModel[this.vLaborSelectedIndex] = sLabor;
				this.vLaborEdit = false;
			} else {
				aLaborModel.push(sLabor);
			}
			var oJSONModel = new JSONModel(aLaborModel);
			this.getView().setModel(oJSONModel, "laborModel");
			this.singleLaborModelCreate();
			this._oDetailLaborDialog.close();
		},

		// PROGRESS PAYMENT CODE BLOCK 
		onOpenProgressPaymentDialog: function () {
			if (!this._oDetailProgressPaymentDialog) {
				this._oDetailProgressPaymentDialog = sap.ui.xmlfragment(this.getView().getId(),
					"com.toros.ZPM_MALF_NOTIF.fragment.progressPayment", this);
				this.getView().addDependent(this._oDetailProgressPaymentDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDetailProgressPaymentDialog);
			}
			this.singleProgressPaymentModelCreate();
			this._oDetailProgressPaymentDialog.open();
		},
		onCloseProgressPaymentDialog: function () {
			this._oDetailProgressPaymentDialog.close();
		},

		singleProgressPaymentModelCreate: function () {
			var sProgressPayment = {
				Matnr: "",
				Maktx: "",
				Ekgrp: "",
				Ekorg: "",
				Lifnr: "",
				Gpreis: "",
				Waers: "TRY",
				Saknr: ""
			};
			var oModel = new JSONModel(sProgressPayment);
			this.getView().setModel(oModel, "singleProgressPaymentModel");
		},
		onAddProgressPayment: function (oEvent) {
			var sSingleModel = this.getView().getModel("singleProgressPaymentModel").getData();
			var aProgressPaymentModel = this.getView().getModel("progressPaymentModel").getData();
			if (this.vProgressPaymentEdit === true) {
				aProgressPaymentModel[this.vProgressPaymentSelectedIndex] = sSingleModel;
				this.vProgressPaymentEdit = false;
			} else {
				aProgressPaymentModel.push(sSingleModel);
			}
			var oJSONModel = new JSONModel(aProgressPaymentModel);
			this.getView().setModel(oJSONModel, "progressPaymentModel");
			this.singleProgressPaymentModelCreate();
			// if(oEvent.getSoruce().getId().indexOf("buttonZSERSubmitCloseButton") !== -1){
			// 	this._oDetailProgressPaymentDialog.close();
			// }
		},
		onEditProgressPayment: function (oEvent) {
			this.vProgressPaymentEdit = true;
			this.vProgressPaymentSelectedIndex = oEvent.getSource().getParent().getParent().getBindingContext("progressPaymentModel").getPath()
				.split("/")[1];
			var sProgressPayment = oEvent.getSource().getParent().getParent().getBindingContext("progressPaymentModel").getProperty();
			var oJSONModel = new JSONModel(sProgressPayment);
			this.getView().setModel(oJSONModel, "singleProgressPaymentModel");
			if (!this._oDetailProgressPaymentDialog) {
				this._oDetailProgressPaymentDialog = sap.ui.xmlfragment(this.getView().getId(),
					"com.toros.ZPM_MALF_NOTIF.fragment.progressPayment", this);
				this.getView().addDependent(this._oDetailProgressPaymentDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDetailProgressPaymentDialog);
			}
			this._oDetailProgressPaymentDialog.open();
		},
		onDeleteProgressPayment: function (oEvent) {
			var aProgressPayment = this.getView().getModel("progressPaymentModel").getData(); // data cekelim
			var sProgressPaymentIndex = oEvent.getSource().getParent().getParent().getBindingContext("progressPaymentModel").getPath().split(
				"/")[1];
			aProgressPayment.splice(sProgressPaymentIndex, 1);
			var oJSONModel = new JSONModel(aProgressPayment);
			this.getView().setModel(oJSONModel, "progressPaymentModel");
		},
		onAddCloseProgressPayment: function (oEvent) {
			var sProgressPayment = this.getView().getModel("singleProgressPaymentModel").getData();
			var aProgressPaymentModel = this.getView().getModel("progressPaymentModel").getData();
			if (this.vProgressPaymentEdit === true) {
				aProgressPaymentModel[this.vProgressPaymentSelectedIndex] = sProgressPayment;
				this.vProgressPaymentEdit = false;
			} else {
				aProgressPaymentModel.push(sProgressPayment);
			}
			var oJSONModel = new JSONModel(aProgressPaymentModel);
			this.getView().setModel(oJSONModel, "progressPaymentModel");
			this.singleProgressPaymentModelCreate();
			this._oDetailProgressPaymentDialog.close();
		},

		// SUB ORDER CODE BLOCK 
		onOpenSubOrderDialog: function () {
			if (!this._oDetailSubOrderDialog) {
				this._oDetailSubOrderDialog = sap.ui.xmlfragment(this.getView().getId(), "com.toros.ZPM_MALF_NOTIF.fragment.subOrder", this);
				this.getView().addDependent(this._oDetailSubOrderDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDetailSubOrderDialog);
			}
			this.singleSubOrderModelCreate();
			this._oDetailSubOrderDialog.open();
		},
		onCloseSubOrderDialog: function () {
			this._oDetailSubOrderDialog.close();
		},

		singleSubOrderModelCreate: function () {
			var sSubOrder = {
				Auart: "",
				Vaplz: "",
				Werks: "",
				Ilart: ""
			};
			var oModel = new JSONModel(sSubOrder);
			this.getView().setModel(oModel, "singleSubOrderModel");
		},
		onAddSubOrder: function (oEvent) {
			var sSingleModel = this.getView().getModel("singleSubOrderModel").getData();
			var aSubOrderModel = this.getView().getModel("subOrderModel").getData();
			if (this.vSubOrderEdit === true) {
				aSubOrderModel[this.vSubOrderSelectedIndex] = sSingleModel;
				this.vSubOrderEdit = false;
			} else {
				aSubOrderModel.push(sSingleModel);
			}
			var oJSONModel = new JSONModel(aSubOrderModel);
			this.getView().setModel(oJSONModel, "subOrderModel");
			this.singleSubOrderModelCreate();
			// if(oEvent.getSoruce().getId().indexOf("buttonZSERSubmitCloseButton") !== -1){
			// 	this._oDetailSubOrderDialog.close();
			// }
		},
		onEditSubOrder: function (oEvent) {
			this.vSubOrderEdit = true;
			this.vSubOrderSelectedIndex = oEvent.getSource().getParent().getParent().getBindingContext("subOrderModel").getPath().split("/")[
				1];
			var sSubOrder = oEvent.getSource().getParent().getParent().getBindingContext("subOrderModel").getProperty();
			var oJSONModel = new JSONModel(sSubOrder);
			this.getView().setModel(oJSONModel, "singleSubOrderModel");
			if (!this._oDetailSubOrderDialog) {
				this._oDetailSubOrderDialog = sap.ui.xmlfragment(this.getView().getId(), "com.toros.ZPM_MALF_NOTIF.fragment.subOrder", this);
				this.getView().addDependent(this._oDetailSubOrderDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDetailSubOrderDialog);
			}
			this._oDetailSubOrderDialog.open();
		},
		onDeleteSubOrder: function (oEvent) {
			var aSubOrder = this.getView().getModel("subOrderModel").getData(); // data cekelim
			var sSubOrderIndex = oEvent.getSource().getParent().getParent().getBindingContext("subOrderModel").getPath().split("/")[1];
			aSubOrder.splice(sSubOrderIndex, 1);
			var oJSONModel = new JSONModel(aSubOrder);
			this.getView().setModel(oJSONModel, "subOrderModel");
		},
		onAddCloseSubOrder: function (oEvent) {
			var sSubOrder = this.getView().getModel("singleSubOrderModel").getData();
			var aSubOrderModel = this.getView().getModel("subOrderModel").getData();
			if (this.vSubOrderEdit === true) {
				aSubOrderModel[this.vSubOrderSelectedIndex] = sSubOrder;
				this.vSubOrderEdit = false;
			} else {
				aSubOrderModel.push(sSubOrder);
			}
			var oJSONModel = new JSONModel(aSubOrderModel);
			this.getView().setModel(oJSONModel, "subOrderModel");
			this.singleSubOrderModelCreate();
			this._oDetailSubOrderDialog.close();
		},
		getBusyDialog: function () {
			var that = this;
			if (!this.oBusyDialog)
				this.oBusyDialog = new sap.m.BusyDialog({
					text: that.getOwnerComponent().getModel("i18n").getProperty("messagePleaseWait")
				});
			return that.oBusyDialog;
		},

		onUploadCollectionChange: function (oEvent) {
			//this.vUploadCollectionId = oEvent.getSource().getId();
		},
		onStartUpload: function (oEvent) {
			this.vNewFile = 0;
			var oUploadCollection = this.getView().byId("uploadCollection"); //sap.ui.getCore().byId(this.vUploadCollectionId);
			var oItems = oUploadCollection.getItems();
			var cFiles = oItems.length;
			if (cFiles !== 0) {
				for (var i = 0; i < cFiles; i++) {
					if (oItems[i].getProperty("documentId") === "") {
						this.vNewFile = this.vNewFile + 1;
					}
				}
				if (this.vNewFile === 0) {
					this.selectFirstItem();
					var oViewModel = this.getModel("detailView");
					oViewModel.setProperty("/busy", false);
				}
				oUploadCollection.upload();
			} else {
				this.selectFirstItem();
				var oViewModel = this.getModel("detailView");
				oViewModel.setProperty("/busy", false);
			}

		},
		onBeforeUploadStarts: function (oEvent) {
			var that = this;
			var sFilename = oEvent.getParameter("fileName");
			var sContentDisposition = "";
			sContentDisposition = (sFilename + "#" + this.getView().getModel("valuesModel").getData().Reqnr);
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "Content-Disposition",
				value: sContentDisposition
			});
			var count = sFilename.length;

			if (sFilename.substring(count - 3) === "rar" || sFilename.substring(count - 3) === "zip") {
				var oCustomerHeaderType = new sap.m.UploadCollectionParameter({
					name: "Content-Type",
					value: "application/x-zip-compressed"
				});
				oEvent.getParameters().addHeaderParameter(oCustomerHeaderType);
			}
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: this.getView().getModel().getSecurityToken()
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderToken);
			this.counter++;
			setTimeout(function () {
				MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("worklistCreateFileSuccess"));
			}, 500);
		},
		onUploadCompleteCollection: function (oEvent) {
			var that = this;
			this.vNewFile = this.vNewFile - 1;
			if (this.vNewFile === 0) {
				//get attachments to modeld
				var attachmentFilter = [];
				attachmentFilter.push(new Filter("Reqnr", FilterOperator.EQ, this.getView().getModel("valuesModel").getData().Reqnr));
				that.getView().getModel().read("/AttachmentSet", {
					filters: attachmentFilter,
					sorters: null,
					async: true,
					success: function (oData) {
						var oJsonModel = new JSONModel(oData.results);
						that.getView().setModel(oJsonModel, "AttachmentsModel");

						var oViewModel = that.getModel("detailView");
						oViewModel.setProperty("/busy", false);
						that.selectFirstItem();
					},
					error: function (oError) {
						var oViewModel = that.getModel("detailView");
						oViewModel.setProperty("/busy", false);
						that.selectFirstItem();
					}
				});
			}

		},
		onFileDeleted: function (oEvent) {
			this.deleteItemById(oEvent.getSource().getBindingContext("AttachmentsModel").getProperty().DocumentId);
			MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("FileDeleted"));
		},
		deleteItemById: function (sItemToDeleteId) {
			var that = this;
			var oAttachmentsData = this.getView().getModel("AttachmentsModel").getData();

			jQuery.each(oAttachmentsData, function (index) {
				if (oAttachmentsData[index] && oAttachmentsData[index].DocumentId === sItemToDeleteId) {
					var oParameters = {};
					oParameters.DocumentId = oAttachmentsData[index].DocumentId;
					oParameters.Reqnr = oAttachmentsData[index].Reqnr;
					that.getView().getModel().callFunction("/deleteAttachment", {
						method: "GET",
						urlParameters: oParameters,
						async: true,
						success: function (oData, response) {
							oAttachmentsData.splice(index, 1);
							var oJsonModel = new JSONModel(oAttachmentsData);
							that.getView().setModel(oJsonModel, "AttachmentsModel");
						},
						error: function (oError) {

						}
					});
				}
			});
		},
		displayMessage: function (data) {

			var that = this;
			var oIcon, sTitle;

			switch (data.TYPE) {
			case "S":
				oIcon = sap.m.MessageBox.Icon.SUCCESS;
				break;
			case "I":
				oIcon = sap.m.MessageBox.Icon.INFORMATION;
				break;
			case "E":
				oIcon = sap.m.MessageBox.Icon.ERROR;
				break;
			case "W":
				oIcon = sap.m.MessageBox.Icon.WARNING;
				break;
			default:
				break;
			}
			sap.m.MessageBox.show(data.MESSAGE, {
				icon: oIcon,
				title: sTitle,
				actions: [sap.m.MessageBox.Action.OK]

			});
		},
		_showFormFragment: function (sFragmentName) {
			var oLayout = this.byId("generalLayout");
			oLayout.destroyContent();
			var oFormFragment = sap.ui.xmlfragment("com.toros.ZPM_MALF_NOTIF.fragment." + sFragmentName, this);
			oLayout.addContent(oFormFragment);
		},
		// Search Helps Begin
		_handleValueHelpSource: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			this.inputId = oEvent.getSource().getId();
			if (!this._svalueHelpDialog) {
				this._svalueHelpDialog = sap.ui.xmlfragment(
					"com.toros.ZPM_MALF_NOTIF.fragment.VHelpAuart",
					this
				);
				this.getView().addDependent(this._svalueHelpDialog);
				// This.sValueHelp ****
			}
			this._svalueHelpDialog.open(sInputValue);
		},

		_handleValueHelpCloseSource: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var codeInput = sap.ui.getCore().byId(this.inputAuart);
				codeInput.setValue(oSelectedItem.getTitle());
				codeInput.setDescription(oSelectedItem.getInfo());
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		// FILTER ILE OLAN HALI
		_handleValueHelpSearchSource: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var andFilter = [];
			var oFilter = [];
			oFilter.push(new sap.ui.model.Filter("Auart", sap.ui.model.FilterOperator.Contains, sValue));
			oFilter.push(new sap.ui.model.Filter("Autyp", sap.ui.model.FilterOperator.Contains, sValue));
			andFilter.push(new sap.ui.model.Filter(oFilter, false));
			oEvent.getSource().getBinding("items").filter(new sap.ui.model.Filter(andFilter, true));
		},

		// // ondiaolg open ile yapılacak Odata oku
		// This.getView().getModel("mainService").read("/SearchSet", {
		// 	""
		// 	odata okuma işlemi yap ve asagıdaki data yı doldur
		// })
		// var oDateModel = new JSONModel(data);
		// this.getView().setModel(oDateModel, "dateModel");
		//xoseker batch SH
		handleValueHelpBatch: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			this.inputId = oEvent.getSource().getId();
			if (!this._valueHelpDialogMaterial) {
				this._valueHelpDialogMaterial = sap.ui.xmlfragment(
					"com.toros.ZPM_MALF_NOTIF.fragment.VHelpMaterial",
					this
				);
				this.getView().addDependent(this._valueHelpDialogMaterial);
			}
			// open value help dialog filtered by the input value
			this._valueHelpDialogMaterial.open(sInputValue);
		},

		_handleValueHelpSearchBatch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("Mseh3", sap.ui.model.FilterOperator.Contains, sValue)//,
				//	new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.Contains, sValue)
				],
				and: false
			});
			evt.getSource().getBinding("items").filter(oFilter);
		},

		_handleValueHelpCloseBatch: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var batchInput = this.byId(this.inputId);
				batchInput.setValue(oSelectedItem.getDescription());
			}
			evt.getSource().getBinding("items").filter([]);
		},
		handleNavTo: function (evt) {
			var target = evt.getSource().data("target");
			this.oRouter.navTo(target);
		}

	});
});