/**
* @fileOverview
* Módulo das informações padrão do usuário.
* As rotinas utilizam o serviço de armazenamento vinculado ao usuário (UserProperties).
*/

'use strict';

/**
* Mapeia os intervalos da planilha em relação aos dados do registro, produzindo 
* um objeto com as seguintes informações: 'registro' e 'planilha'
* A chave 'registro' traz uma Array de objetos com os seguintes dados: 'intervalo', 'rotulo', 'valor', 'novo', 'naPlanilha'.
* A chave 'planilha' traz uma Array de objetos com os seguintes dados: 'intervalo', 'rotulo', 'valor', 'noRegistro'
*
* @public
* @return {Json} Json com os dados.
*/
function obterMapaInfoPadrao() {
  return Notificacao_.criar(Registro_.obterMapaInfoPadrao);
}

/**
* Salva no serviço de armazenamento as informações contidas nos intervalos listados.
*
* @public
* @param {Array|string} lista Lista de intervalos.
* @return {Json} Json com mapa de informações padrão atualizado. 
*/
function salvarInfoPadrao(lista) {
  return Notificacao_.criar(Registro_.salvarInfoPadrao, lista);
}

/**
* Recupera as informações salvas no serviço de armazenamento.
*
* @public
* @param {Array|string} lista Lista de informações a serem recuperadas.
* @return {Json} Json com mapa de informações padrão atualizado. 
*/
function baixarInfoPadrao(lista) {
  return Notificacao_.criar(Registro_.baixarInfoPadrao, lista);
}

/**
* Atualiza no serviço de armazenamento o registro informado.
*
* @public
* @param {string} intervalo Registro a ser alterado (mesmo nome do intervalo).
* @param {string} valor Novo valor.
* @return {Json} Json com mapa de informações padrão atualizado. 
*/
function atualizarInfoPadrao(intervalo, valor) {
  return Notificacao_.criar(Registro_.atualizarInfoPadrao, intervalo, valor);
}

/**
* Remove o registro informado.
*
* @public
* @param {string} intervalo Registro a ser removido (mesmo nome do intervalo).
* @return {Json} Json com mapa de informações padrão atualizado. 
*/
function removerInfoPadrao(intervalo) {
  return Notificacao_.criar(Registro_.removerInfoPadrao, intervalo);
}

/**
* Atualiza preferências do usuário no serviço de armazenamento com a chave Config_.STORAGE.CHAVE_OPCOES_USUARIO.
*
* @public
* @param {Object} preferencias Preferências do usuário.
* @return {Json} Json com as informações atualizadas.
*/
function atualizarPreferenciasDoUsuario(preferencias) {
  return Notificacao_.criar(Registro_.atualizarPreferenciasDoUsuario, preferencias);
}

/**
* Obtém as preferências do usuário salvas no serviço de armazenamento.
*
* @public
* @return {Json} Json com as informações. 
*/
function obterPreferenciasDoUsuario() {
  return Notificacao_.criar(Registro_.obterPreferenciasDoUsuario);
}

var Registro_ = (function(registro) {
  
  function verificarListaDeIntervalos(lista) {
    Logger.log(lista)
    Logger.log(Array.isArray(lista))
    if (Array.isArray(lista)) {
      return lista;
    } else if (Utils.isString(lista)) {
      return [lista];
    } else {
      throw new Utils.CustomError('Nenhum intervalo foi selecionado. <b><i>Os dados anteriores não foram alterados.</i></b>');
    }
  }
  
  function humanizar(s) {
    return Utils.humanizar(s.replace(Config_.PREFIXO.PADRAO_FORMULA, '').replace(Config_.PREFIXO.PADRAO, ''));
  }
  
  function obterInfoPadrao() {
    
    var dados = PropertiesService.getUserProperties().getProperties();
    delete dados[Config_.STORAGE.CHAVE_OPCOES_USUARIO];
    
    return Object.keys(dados).filter(function(key) {
      return key.indexOf(Config_.PREFIXO.PADRAO) >= 0 
      || key.indexOf(Config_.PREFIXO.PADRAO_FORMULA) >= 0    
    }).reduce(function(resultado, key) {
      resultado[key] = dados[key];
      return resultado;
    }, Object.create(null));
  };
  
  registro.obterMapaInfoPadrao = function(planilha) {
    
    planilha = planilha || SpreadsheetApp.getActiveSpreadsheet();
    
    var mapaIntervalos = planilha.getNamedRanges().map(function(intervaloNomeado) {
      return intervaloNomeado.getName();
    }).filter(function(nome) {
      return nome.indexOf(Config_.PREFIXO.PADRAO) >= 0 || nome.indexOf(Config_.PREFIXO.PADRAO_FORMULA) >= 0;
    }).reduce(function(seed, item) {
      seed[item] = humanizar(item);
      return seed;
    }, Object.create(null));
    
    var dadosRegistro = obterInfoPadrao();
    
    var mapaPlanilha = Object.keys(mapaIntervalos).map(function(key) {
      return {
        intervalo: key,
        rotulo: mapaIntervalos[key],
        valor: dadosRegistro[key] ? dadosRegistro[key] : '',
        noRegistro: key in dadosRegistro,
      };
    }).sort(function(a, b) {
      return a.rotulo < b.rotulo ? -1 : a.rotulo > b.rotulo ? 1 : 0;
    });
    
    var mapaRegistro = Object.keys(dadosRegistro).map(function(key) {
      return {
        intervalo: key,
        rotulo: humanizar(key),
        valor: dadosRegistro[key],
        novo: dadosRegistro[key],
        naPlanilha: key in mapaIntervalos,
      }
    });
    
    return {
      registro: mapaRegistro,
      planilha: mapaPlanilha
    };
  }
  
  registro.salvarInfoPadrao = function(lista) {
    
    var planilha = SpreadsheetApp.getActiveSpreadsheet();
    var listaVerificada = verificarListaDeIntervalos(lista);
    
    var intervalosNomeados = planilha.getNamedRanges().filter(function(intervaloNomeado) {
      return listaVerificada.indexOf(intervaloNomeado.getName()) >= 0;
    });
    
    var dados = intervalosNomeados.reduce(function(obj, intervaloNomeado) {
      var intervalo = intervaloNomeado.getRange();
      var val = intervaloNomeado.getName().indexOf(Config_.PREFIXO.PADRAO_FORMULA) >= 0
      ? intervalo.getFormula()
      : intervalo.getValue();
      if (val !== null && val !== undefined && val !== '') {
        obj[intervaloNomeado.getName()] = val;
      }
      return obj;
    }, Object.create(null));
    
    PropertiesService.getUserProperties().setProperties(dados, false);
    
    return registro.obterMapaInfoPadrao(planilha);
  };
  
  registro.baixarInfoPadrao = function(lista) {

    var planilha = SpreadsheetApp.getActiveSpreadsheet();
    var listaVerificada = verificarListaDeIntervalos(lista);
    
    var dados = PropertiesService.getUserProperties().getProperties();
    
    listaVerificada.forEach(function(nome) {
      var val = dados[nome];
      if (val !== null && val !== undefined) {
        val = Utils.isNumeric(val) ? parseFloat(val) : Utils.tentarConverterEmData(val);
        var formula = (nome.indexOf(Config_.PREFIXO.PADRAO_FORMULA) >= 0);
        Planilhas.atualizarIntervalo(nome, {dados: val, planilha: planilha, formula: formula});
      }
    });
    
    return registro.obterMapaInfoPadrao(planilha);
  };

  registro.atualizarInfoPadrao = function(intervalo, valor) {
    PropertiesService.getUserProperties().setProperty(intervalo, valor);
    return registro.obterMapaInfoPadrao();
  };

  registro.removerInfoPadrao = function(intervalo) {
    Logger.log(intervalo)
    PropertiesService.getUserProperties().deleteProperty(intervalo);
    Logger.log(PropertiesService.getUserProperties().getProperty(intervalo))
    
    return registro.obterMapaInfoPadrao();
  };
  
  registro.obterPreferenciasDoUsuario = function() {
    return JSON.parse(PropertiesService.getUserProperties().getProperty(Config_.STORAGE.CHAVE_PREFERENCIAS_USUARIO));
  };

  registro.atualizarPreferenciasDoUsuario = function(preferencias) {
    PropertiesService.getUserProperties().setProperty(Config_.STORAGE.CHAVE_PREFERENCIAS_USUARIO, JSON.stringify(preferencias));
    return registro.obterPreferenciasDoUsuario();
  };
  
  return registro;
  
})(Registro_ || Object.create(null));
