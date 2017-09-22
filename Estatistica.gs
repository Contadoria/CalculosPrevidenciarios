/**
* @fileOverview
* Módulo para registro estatistico.
*/

'use strict';

/**
* Obtem o url do serviço registrado na planilha.
*
* @public
* @param {Spreadsheet=} planilha A planilha onde procurar a informação.
* @return {Json|boolean} Json com o url ou false, se não houver na planilha o intervalo apropriado.
*/
function obterUrlEstatistica(planilha) {
  return Notificacao_.criar(Estatistica_.obterUrl, planilha);
}

/**
* Verifica se o serviço está disponível.
*
* @public
* @param {string} url Url do serviço de estatística.
* @return {Json} Json com a informação. O payload traz as seguintes propriedades:
*                a) status<string>;
*                b) payload<object>.
*                ==> o payload vem com as propriedades dadosServico<Array> e url<string>
*/
function testarServicoEstatistico(url) {
  return Notificacao_.criar(Estatistica_.testar, url);
}

/**
* Registra novo serviço na planilha, testando-o primeiro.
*
* @public
* @param {string} url Url do novo serviço de estatística.
* @return {Json} Json com os dados do serviço. O payload traz as seguintes propriedades:
*                a) status<string>;
*                b) payload<object>.
*                ==> o payload vem com as propriedades dadosServico<Array> e url<string>
*/
function registrarServicoEstatistico(url) {
  return Notificacao_.criar(Estatistica_.registrarServico, url);
}

/**
* Obter dados do cálculo.
*
* @public
* @param {string} complemento Texto adicional para registro. 
* @param {string} observacoes Texto adicional para registro. 
* @param {Spreadsheet=} planilha Planilha com os dados. 
* @return {Json} Json com os dados, contendo duas propriedades: payload<object> e html<string>.
*/
function obterDadosDoCalculo(complemento, observacoes, planilha) {
  return Notificacao_.criar(Estatistica_.obterDados, complemento, observacoes, planilha);
}

/**
* Registrar cálculo.
*
* @public
* @param {Json} payload Json com os dados do cálculo para registrar.
* @param {Spreadsheet=} planilha Planilha com os dados. 
* @return {string} Mensagem reportando o resultado.
*/
function registrarCalculo(payload, planilha) {
  return Notificacao_.criar(Estatistica_.registrar, payload, planilha);
}

var Estatistica_ = (function(estatistica) {
  
  function salvarUrl(planilha, url, rotulo) {
    
    planilha = planilha || SpreadsheetApp.getActiveSpreadsheet();
    rotulo = rotulo || 'Serviço registrado';
    var intervalo = planilha.getRangeByName(Config_.PLANILHA.INTERVALO.ESTATISTICA_URL);
    
    if (intervalo !== null) {
      Planilhas.inserirUrlComoFormula(intervalo, url, rotulo);
    }
  }
  
  estatistica.obterUrl = function(planilha){
    
    planilha = planilha || SpreadsheetApp.getActiveSpreadsheet();
    var intervalo = planilha.getRangeByName(Config_.PLANILHA.INTERVALO.ESTATISTICA_URL);
    
    if (intervalo !== null) {
      return Planilhas.extrairUrlDeFormula(intervalo.getFormula());
    } else {
      return false;
    }
  };
  
  estatistica.testar = function(url) {
    try {
      return Http_.consultarServicoInterno(url + '?teste=true');
    } catch (e) {
      throw new Utils.CustomError('O serviço não retornou a resposta esperada. Verifique se o url informado está correto e se o serviço está ativo.')
    }
  };
  
  estatistica.registrarServico = function(url) {
    
    var planilha = SpreadsheetApp.getActiveSpreadsheet();
    
    var dadosServico = estatistica.testar(url);
    salvarUrl(planilha, dadosServico.url, dadosServico.nome);
    
    return dadosServico;
  }
  
  estatistica.obterDados = function(complemento, observacoes, planilha) {
    
    planilha = planilha || SpreadsheetApp.getActiveSpreadsheet();

    var usuario = Session.getEffectiveUser().getEmail();

    var intervaloTipo = planilha.getRangeByName(Config_.PLANILHA.INTERVALO.TIPO);
    var tipo = intervaloTipo ? intervaloTipo.getValue() : '';
    
    var url = planilha.getUrl();

    var intervaloProcesso = planilha.getRangeByName(Config_.PLANILHA.INTERVALO.PROCESSO);
    var processo = intervaloProcesso ? intervaloProcesso.getValue() : '';

    var intervaloJuizo = planilha.getRangeByName(Config_.PLANILHA.INTERVALO.JUIZO);
    var juizo = intervaloJuizo ? intervaloJuizo.getValue() : '';

    var intervaloSecao = planilha.getRangeByName(Config_.PLANILHA.INTERVALO.SECAO);
    var secao = intervaloSecao ? intervaloSecao.getValue() : '';

    var intervaloSubsecao = planilha.getRangeByName(Config_.PLANILHA.INTERVALO.SUBSECAO);
    var subsecao = intervaloSubsecao ? intervaloSubsecao.getValue() : '';

    var payload = {
      Usuario: usuario,
      Tipo: tipo,
      Url: url,
      Processo: processo,
      Juizo: juizo,
      Secao: secao,
      Subsecao: subsecao,
      Complemento: complemento || '',
      Observacoes: observacoes || ''
    };
        
    var inicio = '<div>'
    + '<ul class="w3-ul w3-border-bottom">';

    var itens = Object.keys(payload).map(function(key) {
      return '<li style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden" title="' + (payload[key] || '') + '">'
      +'<span class="w3-text-teal"><b>' + key + '</b></span><br>'
      +'<span class="w3-small">'+ (payload[key] || '<span class="w3-text-grey"><i>não há dados</i></span>') + '</span>';
    }).join('');

    var final = '</ul></div>'
 
    var html = inicio + itens + final;
    
    return {
      payload: payload,
      html: html,
    };
  };
  
  estatistica.registrar = function(payload, planilha) {
    
    planilha = planilha || SpreadsheetApp.getActiveSpreadsheet();
    
    var urlServico = estatistica.obterUrl(planilha);
    var dados = JSON.parse(payload);
    dados.Timestamp = '';
    
    var resposta = UrlFetchApp.fetch(urlServico, {
      method: 'post',
      payload: dados,
      followRedirects: true,
      muteHttpExceptions: true
    });
    
    try {
      
      var opcoes = {
        planilha: planilha,
        template: planilha.getSheetByName(Config_.PLANILHA.TEMPLATE.LOG),
        manterOculta: true,
        ultimaPosicao: true
      };
      
      var logInfo = {
        Timestamp: '',
        Descricao: 'Registro estatístico',
        Resultado: 'OK',
        Detalhes: resposta
      };
      Planilhas.atualizarLog(logInfo, opcoes);
      
    } catch (e) {
      
      Erros_.informar(e).logCentral();
    }
    
    return '<p style="color: ' + Config_.CORES.SUCESSO + ';">Dados enviados com sucesso<p>';
  };
  
  return estatistica;
  
})(Estatistica_ || Object.create(null));