/**
* @fileOverview
* Rotinas de inicialização do addon.
* cf. https://developers.google.com/apps-script/add-ons/lifecycle
*/

'use strict';

function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  SpreadsheetApp.getUi()
  .createAddonMenu()
  .addItem('Abrir', 'abrirSidebar')
  .addToUi();  
  if (e && e.authMode == ScriptApp.AuthMode.LIMITED || e.authMode == ScriptApp.AuthMode.FULL) {
    var preferencias = JSON.parse(PropertiesService.getUserProperties().getProperty(Config_.STORAGE.CHAVE_PREFERENCIAS_USUARIO));
    if (preferencias && preferencias.opcaoAbrir && preferencias.opcaoAbrir === true) {
      abrirSidebar();
    }
  }
}