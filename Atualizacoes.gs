/**
* @fileOverview
* Módulo dos serviços de atualização de tabelas e índices.
*/

'use strict';

/**
* Verifica e atualiza os índices da planilha local.
*
* @public
* @return {Json} Retorna uma string Json com os resultados da atualização, no formato: { 'etapa', 'mensagem' } 
*/
function atualizarIndices() {
  return Notificacao_.criar(Atualizacoes_.executar, Config_.ATUALIZACOES.TIPO.INDICES);
}

/**
* Verifica e atualiza as tabelas da planilha local.
*
* @public
* @return {Json} Retorna uma string Json com os resultados da atualização, no formato: { 'etapa', 'mensagem' } 
*/
function atualizarTabelas() {
  return Notificacao_.criar(Atualizacoes_.executar, Config_.ATUALIZACOES.TIPO.TABELAS);
}

var Atualizacoes_ = (function(atualizacoes) {

  /**
  * Acessa o webservice e atualiza uma planilha local.
  *
  * @private
  * @param {(Array|string)} opcoes Objeto com as seguintes opcoes para atualização da planilha:
  *  a) planilha<Spreadsheet>;
  *  b) template<Sheet>;
  *  c) url<string>;
  *  d) nomearColunas<boolean>;
  *  e) sobrescrever<boolean>;
  *  f) ultimaPosicao<boolean>;
  *  g) manterOculta<boolean>).
  * @return {Object} Retorna uma API que dá acesso aos seguintes métodos/propriedades:
  *  a) executar ( () -> this);
  *  b) log ( flag=[true] -> this);
  *  c) alertar ( flag=[true] -> this).
  */
  function atualizarPlanilhaLocal(opcoes) {
    
    var atualizar = function() {
      var resultado = Http_.consultarServicoInterno(opcoes.url);
      Object.keys(resultado).forEach(function(consulta) {
        try {
          if (resultado[consulta].status === Config_.STATUS.OK) {
            try {
              opcoes.dados = resultado[consulta].payload;
              var pagina = Planilhas.criarPagina(consulta, opcoes);
              Planilhas.atualizarPagina(pagina, opcoes);
              var registro = '-';
            } catch (e) {
              var registro = e;
            }
          } else {
            var registro = resultado[consulta].payload;
          }
        } catch (e) {
          var registro = new Error('O servidor não retornou a resposta esperada.');
        }
        relatorio.incluir(consulta, registro);
      });
    };
    
    if (opcoes.planilha !== null && opcoes.planilha !== undefined) {
      
      var opcoesLog = {
        planilha: opcoes.planilha,
        template: opcoes.templateLog,
        manterOculta: true,
        ultimaPosicao: true,
      };
      var relatorio = Planilhas.criarRelatorio(opcoesLog);
      
      return {
        
        executar: function() {
          atualizar();
          return this;
        },
        
        log: function(flag) {
          (flag !== false) && relatorio.log();
          return this;
        },
        
        alertar: function(flag) {
          (flag !== false) && relatorio.informarErros(); 
          (flag !== false) && relatorio.informarSucessos(); 
          return this;
        },
        
        resultado: function() {
          return relatorio.dados();
        },
        
        html: function() {
          var dados = relatorio.dados();
          
          var inicio = '<div class="w3-responsive">'
          + '<table class="w3-table w3-striped w3-small" style="min-width: 100%">'
          + '<tr><th style="padding-left: 5px; padding-right: 8px;"><b>consulta</b></th><th style="padding-left: 5px; padding-right: 5px;"><b>mensagem</b></th></tr>';

          var final = '</div>'

          var htmlSucessos = dados.sucessos.map(function(sucesso) {
            return '<tr><td style="padding-left: 5px; padding-right: 8px;">' + sucesso.etapa + '</td><td style="padding-left: 5px; padding-right: 5px;" class="w3-text-green">' + sucesso.mensagem + '</td></tr>';
          }).join('');
          
          var htmlErros = dados.erros.map(function(erro) {
            return '<tr><td style="padding-left: 5px; padding-right: 8px;">' + erro.etapa + '</td><td style="padding-left: 5px; padding-right: 5px;" class="w3-text-red">' + erro.mensagem + '</td></tr>';
          }).join('');
          
          return inicio + htmlSucessos + htmlErros + final;
        }
      };
    }
  };

  /**
  * Verifica e atualiza os índices ou tabelas na planilha local.
  *
  * @private
  * @param {Object} opcoes Objeto com os seguintes parâmetros: planilha<Spreadsheet>, tenplate<Sheet>, templateLog<Sheet>, consultas<Array>.
  * @param {string} TIPO_ATUALIZACAO Tipo de atualizacao segundo os parâmetros em Config_.ATUALIZACOES.TIPO.
  * @return {Json} Retorna uma string Json com os resultados da atualização, no formato { 'erros'<Array>, 'sucessos'<Array> }, 
  *                cada Array sendo um conjunto de objetos da forma { 'etapa'<string>, 'mensagem'<string> } 
  */
  function atualizar(opcoes, TIPO_ATUALIZACAO) {
    
    if (Array.isArray(opcoes.consultas) && opcoes.consultas.length > 0) {
      
      var prop = (TIPO_ATUALIZACAO === Config_.ATUALIZACOES.TIPO.INDICES) ? Config_.STORAGE.URL.INDICES : Config_.STORAGE.URL.TABELAS;

      Logger.log(TIPO_ATUALIZACAO);
      Logger.log(prop);
      
      var base = PropertiesService.getScriptProperties().getProperty(prop);
      var url = Http_.criarUrl(base, opcoes.consultas); 
      
      opcoes.url = url;
      opcoes.nomearColunas = (TIPO_ATUALIZACAO === Config_.ATUALIZACOES.TIPO.INDICES);
      opcoes.sobrescrever = true;
      opcoes.ultimaPosicao = false;
      opcoes.manterOculta = true;
      
      return atualizarPlanilhaLocal(opcoes).executar().log().html();
      
    } else {
      
      throw new Utils.CustomError('Esta planilha não comporta atualização de índices.');
    }
  }
  
  /**
  * Executa verificação e atualização da planilha.
  *
  * @private
  * @param {string} TIPO_ATUALIZACAO Tipo de atualizacao segundo os parâmetros em Config_.ATUALIZACOES.TIPO.
  * @return {Json} Retorna uma string Json com os resultados da atualização, no formato: { 'etapa', 'mensagem' } 
  */
  atualizacoes.executar = function(TIPO_ATUALIZACAO) {
    
    if (TIPO_ATUALIZACAO in Config_.ATUALIZACOES.TIPO) {
      
      var planilha = SpreadsheetApp.getActiveSpreadsheet();
      var intervalo = planilha.getRangeByName(Config_.PLANILHA.INTERVALO.TIPO);
      
      if (intervalo !== null && intervalo !== undefined) {
        
        var TIPO_PLANILHA = intervalo.getValue();
        
        if (TIPO_PLANILHA in Config_.ATUALIZACOES.CONSULTAS[TIPO_ATUALIZACAO]) {
          
          var opcoes = {
            planilha: planilha,
            template: planilha.getSheetByName(Config_.PLANILHA.TEMPLATE.DADOS),
            templateLog: planilha.getSheetByName(Config_.PLANILHA.TEMPLATE.LOG),
            consultas: Config_.ATUALIZACOES.CONSULTAS[TIPO_ATUALIZACAO][TIPO_PLANILHA],
          };
          
          return atualizar(opcoes, TIPO_ATUALIZACAO);
          
        } else {
          
          throw new Utils.CustomError('Tipo de planilha não identificado.');
        }
        
      } else {
        
        throw new Utils.CustomError('Tipo de planilha não identificado.');
      } 
      
    } else {
      
      throw new Utils.CustomError('Tipo de atualização não identificado.');
    } 
  };
  
  return atualizacoes;
  
})(Atualizacoes_ || Object.create(null));