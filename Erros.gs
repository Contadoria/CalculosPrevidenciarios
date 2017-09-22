/**
* @fileOverview
* Módulo de tratamento de erros.
*/

'use strict';

var Erros_ = (function(erros) {
  
  /**
  * API para alerta e registro nos Logs central e local.
  *
  * @private
  * @param {(Error|Object|string)} erro Objeto de erro nativo ou objeto comum com as propriedades do erro ou string com mensagem de erro.
  * @return {Object} Retorna uma API que dá acesso aos seguintes métodos/propriedades:
  *  a) alertar (flag=[true] -> this);
  *  b) logLocal (flag=[true] -> this);
  *  c) logCentral (flag=[true] -> this);
  *  d) dados ( () -> Json);
  */
  erros.informar = function(erro) {
    
    var planilha = SpreadsheetApp.getActiveSpreadsheet();
    
    var opcoes = {
      planilha: planilha,
      manterOculta: true,
      ultimaPosicao: true,
    };
    
    var name = (erro && erro.name) || '';
    var message = (erro && erro.message) || '';
    var stack = (erro && erro.stack) || '';
    var descricao = name;
    var detalhes = (name + ": " + message + '\n' + stack).replace(/\n{2,}/g, '\n');
    
    if (planilha !== null && planilha !== undefined) {
      var intervaloTipo = planilha.getRangeByName(Config_.PLANILHA.INTERVALO.TIPO);
      var intervaloVersao = planilha.getRangeByName(Config_.PLANILHA.INTERVALO.VERSAO_ATUAL);
      var tipo = (intervaloTipo && intervaloTipo.getValue()) || 'n/c';
      var versao = (intervaloVersao && intervaloVersao.getValue()) || 'n/c';
      opcoes.versao = tipo + ' (' + versao + ')';
      opcoes.template = planilha.getSheetByName(Config_.PLANILHA.TEMPLATE.LOG);
    }
    
    var payload = {
      Timestamp: '',
      Versao: opcoes.versao || 'n/c',
      Resultado: 'ERRO',
      Descricao: descricao,
      Detalhes: detalhes,
      UsuarioAtivo: Session.getActiveUser().getEmail() || '',
      UsuarioEfetivo: Session.getEffectiveUser().getEmail() || '',
      Url: (opcoes.planilha !== null && opcoes.planilha !== undefined) ? opcoes.planilha.getUrl() : ''
    };
    
    return {
      
      alertar: function(flag) {
        if (flag !== false) {
          try { 
            Browser.msgBox('Erro', Utils.mensagemErro(erro || ''), Browser.Buttons.OK); 
          } catch (e) {
            
          }
        }
        return this;
      },
      
      logLocal: function(flag) {
        if (flag !== false) {
          if (opcoes.planilha !== null && opcoes.planilha !== undefined) {
            try {
              Planilhas.atualizarLog(payload, opcoes);
            } catch (e) {
              
            }
          }
        }
        return this;
      },
      
      logCentral: function(flag) {
        if (flag !== false) {
          try { 
            var logUrl = PropertiesService.getScriptProperties().getProperty(Config_.STORAGE.URL.ERROS);
            UrlFetchApp.fetch(logUrl, {
              method: 'post',
              payload: payload,
              followRedirects: true,
              muteHttpExceptions: true
            });
          } catch(e) {
            
          }
        }
        return this;
      },
      
      dados: function() {
        var obj = {
          name: Utils.nomeErro(erro),
          message: Utils.mensagemErro(erro),
          stack: Utils.stackErro(erro),
        };
        return JSON.stringify(obj);
      }
    };
  };
  
  return erros;
  
})(Erros_ || Object.create(null));