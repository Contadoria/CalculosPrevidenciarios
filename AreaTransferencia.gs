/**
* @fileOverview
* Módulo da área de transferência.
* As rotinas utilizam o cache do usuário (UserCache) como área de transferência, chave definida pela variável privada KEY.
* As informações ficam disponíveis pelo tempo determinado pela variável privada DURACAO (em segundos).
*/

'use strict';

/**
* Copia para o cache de todos os intervalos que contenham o prefixo identificado por Config.STORAGE.PREFIXO.COMUM.
*
* @public
* @return {void}
*/
function copiarDados() {
  return Notificacao_.criar(AreaTransferencia_.copiar);
}

/**
* Transfere dados armazenados no cache para a planilha ativa.
*
* @public
* @return {string} Retorna mensagem com o resultado da operação.
*/
function colarDados() {
  return Notificacao_.criar(AreaTransferencia_.colar);
}

var AreaTransferencia_ = (function(areaTransferencia) {

  var DURACAO = 600;
  var KEY = 'clipboard';
  
  areaTransferencia.copiar = function() {
    
    var planilha = SpreadsheetApp.getActiveSpreadsheet();
    var id = planilha.getId();
    var cache = CacheService.getUserCache();
    
    var intervalosNomeados = planilha.getNamedRanges().filter(function(intervaloNomeado) {
      return intervaloNomeado.getName().indexOf(Config_.PREFIXO.COMUM) >= 0;
    });
    
    var dados = intervalosNomeados.reduce(function(obj, intervaloNomeado) {
      var intervalo = intervaloNomeado.getRange();
      var val = intervaloNomeado.getName().indexOf(Config_.PREFIXO.COMUM_FORMULA) === 0
      ? intervalo.getFormula()
      : intervalo.getValue();
      obj[intervaloNomeado.getName()] = val;
      return obj;
    }, Object.create(null));
    
    dados.id = id;
    
    cache.remove(KEY);
    cache.put(KEY, JSON.stringify(dados), DURACAO);
    
    return '<p style="color: ' + Config_.CORES.SUCESSO + ';">Dados copiados com sucesso.<p>';
  };
  
  areaTransferencia.colar = function() {
    
    var planilha = SpreadsheetApp.getActiveSpreadsheet();
    var id = planilha.getId();
    
    var props = PropertiesService.getScriptProperties();
    var tcId = props.getProperty(Config_.STORAGE.ID.TC);
    var rmiId = props.getProperty(Config_.STORAGE.ID.RMI);
    var atrasadosId = props.getProperty(Config_.STORAGE.ID.ATRASADOS);
    
    var cache = CacheService.getUserCache();
    var dados = JSON.parse(cache.get(KEY));
    
    if (dados && dados.id) {
      if (dados.id === tcId || dados.id === rmiId || dados.id === atrasadosId) {
        throw new Utils.CustomError('<p>Você está tentando colar os dados numa <b>planilha de desenvolvimento</b>.<p></p>Por razões de segurança, essa operação não é permitida.</p>');
      }
      if (dados.id === id) {
        throw new Utils.CustomError('<p>Você está tentando colar os dados <b style="color: red;">na mesma planilha</b>.</p><p>Essa operação não é permitida.</p>');
      }
    }

    if (dados !== null && dados !== undefined) {
      Object.keys(dados).forEach(function(nome) {
        var val = dados[nome];
        Logger.log('Lido: ' + nome + ' - ' + val);
        if (val !== null && val !== undefined && nome.indexOf(Config_.PREFIXO.COMUM) >= 0) {
          val = Utils.isNumeric(val) ? parseFloat(val) : Utils.tentarConverterEmData(val);
          var formula = (nome.indexOf(Config_.PREFIXO.COMUM_FORMULA) === 0);
          if (val !== null && val !== undefined && val !== '') {
            Planilhas.atualizarIntervalo(nome, {dados: val, planilha: planilha, formula: formula});
          }
        }
      });
      cache.remove(KEY);
      return '<p style="color: ' + Config_.CORES.SUCESSO + ';">Dados colados com sucesso.<p>';
    } else {
      return '<p>Nenhum dado foi encontrado. Tente primeiro copiar dados para o cache, a partir de uma outra planilha.<p>'
    }
  };
  
  return areaTransferencia;
  
})(AreaTransferencia_ || Object.create(null));