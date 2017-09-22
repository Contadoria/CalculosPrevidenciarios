/**
* @fileOverview
* Módulo da interface do usuário.
*/

/**
* Abre a interface principal das ferramentas.
*
* @public
* @return {void} 
*/
function abrirSidebar() {
  var html = HtmlService.createTemplateFromFile('_index')
  .evaluate()
  .setTitle('Cálculo Previdenciário');
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
* Rotina para incluir conteúdo de arquivos no template html.
*
* @public
* @param {String} nomeArquivo Nome do arquivo cujo conteúdo deva ser inserido no template.
* @return {string} Retorna uma string html com o conteúdo a ser inserido. 
*/
function incluir(nomeArquivo) {
  return HtmlService.createHtmlOutputFromFile(nomeArquivo).getContent();
}

/**
* Rotina para envio dos dados iniciais ao cliente.
*
* @public
* @return {Json} Retorna Json string com os dados. 
*/
function obterDados() {
  
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  
  var intervaloTermoInicial = planilha.getRangeByName(Config_.PLANILHA.INTERVALO.SUSPENSAO_TERMO_INICIAL);
  var intervaloMarcoInterruptivo = planilha.getRangeByName(Config_.PLANILHA.INTERVALO.SUSPENSAO_MARCO_INTERRUPTIVO);
  var termoInicial = intervaloTermoInicial ? intervaloTermoInicial.getValue() : null;
  var marcoInterruptivo = intervaloMarcoInterruptivo ? intervaloMarcoInterruptivo.getValue() : null;
  return Notificacao_.criar(function() {
    return {
      preferencias: Registro_.obterPreferenciasDoUsuario(),
      infoPadrao: Registro_.obterMapaInfoPadrao(planilha),
      intervalos: planilha.getNamedRanges().map(function(namedRange) { return namedRange.getName() }),
      urlEstatistica: Estatistica_.obterUrl(planilha),
      prescricao: {
        termoInicial: termoInicial ? termoInicial.toJSON().slice(0,10) : new Date().toJSON().slice(0,10),
        marcoInterruptivo: marcoInterruptivo ? marcoInterruptivo.toJSON().slice(0,10) : new Date().toJSON().slice(0,10),
      }
    };
  });
}

/**
* Rotina para envio dos dados iniciais ao cliente.
*
* @public
* @param {string} errString String com os dados do erro. 
* @return {void} 
*/
function registrarErro(errString) {
  try {
    Erros_.informar(errString).logCentral().logLocal();
  } catch (e) {
  }
}