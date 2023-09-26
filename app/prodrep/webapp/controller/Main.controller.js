sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Filter, FilterOperator, Sorter, MessageToast, MessageBox) {
        "use strict";

        return Controller.extend("prueba.prodrep.controller.Main", {

            _loadViewModel: function () {
                const oViewModel = new JSONModel({
                    busy: false,
                    hasUIChanges: false,
                    productEmpty: true,
                    order: 0
                });

                this.getView().setModel(oViewModel, "viewModel"); //lo asocia a la vista
            },

            _getText : function(sTextId, aArgs){
                return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId,aArgs);
            },

            _setUIChanges : function(bHasUIChanges){
                if(bHasUIChanges === undefined){
                    bHasUIChanges = this.getView().getModel().hasPendingChanges();
                }

                const oModel = this.getView().getModel("viewModel");
                oModel.setProperty("/hasUIChanges", bHasUIChanges);
            },

            _loadFilters : function(){
                const oViewModel = new JSONModel({
                    Product : "",
                    Category: ""
                });
                this.getView().setModel(oViewModel, "filters"); //lo asocia a la vista
            },

            _setBusy : function(bIsBusy){
                const oModel = this.getView().getModel("viewModel");
                oModel.setProperty("/busy", bIsBusy);
            },
            onInit: function () {
                this._oProductTable = this.getView().byId("productsTable"); //este valor sale de la vista
                this._loadViewModel();
                this._loadFilters();
            },

            onSearch : function(){
                let oView = this.getView();
                let oModel = oView.getModel("filters");
                let sProduct = oModel.getProperty("/Product");
                let sCategory = oModel.getProperty("/Category");
                let aFilters = [];

                if(sProduct){
                    aFilters.push(new Filter("Product", FilterOperator.Contains,sProduct));
                };

                if(sCategory){
                    aFilters.push(new Filter("Category_ID", FilterOperator.EQ,sCategory));
                };

                this._oProductTable.getBinding("items").filter(aFilters);

            },
            onClearFilters : function(){
                this._oProductTable.getBinding("items").filter([]);
                this._loadFilters();
            },
            onSort : function(){
                let oView = this.getView();
                let aStates =  [undefined,"asc","desc"];
                let aStatesTextIds = ["sortNone", "sortAscending", "sortDescending"];
                let sMessage;
                let iOrder = oView.getModel("viewModel").getProperty("/order");

                iOrder = (iOrder + 1) % aStates.length;
                let sOrder = aStates[iOrder];

                oView.getModel("viewModel").setProperty("/order", iOrder);
                this._oProductTable.getBinding("items").sort(sOrder && new Sorter("Products", sOrder === "desc"));

                sMessage = this._getText("sortMessage", [this._getText(aStatesTextIds[iOrder])]);

            },

            onInputChange : function(oEvent){
                this._setUIChanges(true);
                if(oEvent.getSource().getParent().getBindingContext().getProperty("Product")){
                    this.getView().getModel("viewModel").setProperty("/productEmpty",false);
                }
            },

            onCreate : function(){
                let oList = this._oProductTable;
                let oBinding = oList.getBinding("items");
                let oContext = oBinding.create({
                    "Product" : "",
                    "Description" : "",
                    "Ranking" : null,
                    "Category_ID": null
                });
                
                this._setUIChanges();
                this.getView().getModel("viewModel").setProperty("/productEmpty",true);

                oList.getItems().some(function(oItem){
                    if(oItem.getBindingContext() === oContext){
                        oItem.focus();
                        oItem.setSelected();
                        return true;
                    }
                });
            },

            onSave : function(){
                const fnSuccess =  function(){
                    this._setBusy(false);
                    this._setUIChanges(false);
                    MessageToast.show(this._getText("changesSentMessage"));
                }.bind(this);

                const fnError =  function(oError){
                    this._setBusy(false);
                    this._setUIChanges(false);
                    MessageBox.error(oError.message);
                }.bind(this);

                this._setBusy(true);
                this.getOwnerComponent().getModel().submitBatch("productGroup").then(fnSuccess,fnError);
            },

            onDelete : function(){
                let oContext;
                let oSelected = this._oProductTable.getSelectedItem();
                let sProduct;

                if(oSelected){
                    oContext = oSelected.getBindingContext();
                    sProduct = oContext.getProperty("Product");

                    oContext.delete().then(function(){
                        MessageToast.show(this._getText("deleteSuccessMessage", sProduct));
                    }.bind(this), function(oError){
                        this._setUIChanges();
                        if(oError.canceled){
                            MessageToast.show(this._getText("deleteRestoreMessage", sProduct));
                            return;
                        }
                        MessageBox.error(oError.message + ":" + sProduct);
                    }.bind(this));

                    this._setUIChanges();
                }

            },

            oResetChanges : function(){
                this._oProductTable.getBinding("items").resetChanges();
                this._setUIChanges();
            }
        });
    });
