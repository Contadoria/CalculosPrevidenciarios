/**
* @fileOverview
* Helpers para chamadas Http.
*/

'use strict';

var Http_ = (function(http) {

  /**
  * Extrai o conteúdo do objecto HTTPResponse, com as datas convertidas em objetos Date.
  *
  * @private
  * @param {HTTPResponse} resposta Objeto HTTPResponse retornado pelo método UrlFetchApp.fetch do Google Apps Script.
  * @return {*} Retorna o conteúdo da resposta recebida.
  */
  function extrairConteudo(resposta) {
    
    var codigo = resposta && resposta.getResponseCode() ? resposta.getResponseCode() : null;
    var texto = resposta && resposta.getContentText();
    
    if (codigo === 200) {
      
      var conteudo = (resposta && resposta.getContentText()) ? resposta.getContentText() : null; 
      
      try {
        return JSON.parse(conteudo, function(k, v) {
          return (k === '') ? v : Utils.tentarConverterEmData(v);
        });
      } catch (e) {
        throw new Error('Não foi possível decodificar os dados recebidos.');
      }
    }
    
    throw new Error('A comunicação com o servidor falhou (cód. ' + (codigo || 'não informado') + ').');
  }

  /**
  * Consultar webservice interno.
  *
  * @private
  * @param {string} url Url completo, com query string.
  * @return {any} Retorna o resultado da consulta. 
  */
  http.consultarServicoInterno = function(url) {
    
    var params = {
      method: 'get',
      followRedirects: true,
      muteHttpExceptions: true // para lidar com o erro a partir de 'resposta.getResponseCode()'
    };
    
    var resposta = extrairConteudo(UrlFetchApp.fetch(url, params)); 
    
    if (resposta && resposta.status) {
      if (resposta.status === Config_.STATUS.OK) {
        var dados = resposta.payload;
        if (!dados) {
          throw new Utils.CustomError('A consulta não retornou a resposta esperada.');
        }
      } else if (resposta.status === Config_.STATUS.ERRO.USUARIO) {
        Notificacao_.throwErroUsuario(resposta.payload);
      } else {
        Notificacao_.throwErroSistema(resposta.payload);
      }
    }
    
    return dados;
  };
  
  /**
  * Criar url para chamada GET a partir de uma lista de consultas.
  *
  * @private
  * @param {string} baseUrl Url do serviço.
  * @param {Array} consultas Lista de consultas.
  * @return {string} Retorna o url com as consultas integradas. 
  */
  http.criarUrl = function(baseUrl, consultas) {
    var queryString = '?' + consultas.map(function(consulta) {
      return 'consulta=' + consulta;
    }).join('&');
    
    return baseUrl + queryString;
  };

  return http;
  
})(Http_ || Object.create(null));