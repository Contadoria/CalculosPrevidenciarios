/**
* @fileOverview
* Módulo para preenchimento da planilha com os dados extraídos de um texto.
*/

'use strict';

/**
* Preenche a planilha com os dados fornecidos, conforme o tipo de preenchimento escolhido pelo usuário.
* A cada tipo de preenchimento corresponde uma das funções privadas contidas no objeto Preenchimento_.
*
* @public
* @param {Json} payload Json com os dados a serem utilizados e as opções do usuário.
*  Esse payload deve ter duas propriedades:
*  a) opcao: contém um objeto com os parâmetros de preenchimento escolhidos e uma propriedade "dados" com os dados de preenchimento 
*     (modificação de um dos objetos Config_.OPCOES.GRUPOS da biblioteca TextParser);
*  b) origem: um dos objetos Config_.ORIGEM da biblioteca TextParser. 
* @return {string} Retorna mensagem com o resultado da operação.
*/
function preencher(payload) {
  return Notificacao_.criar(Preenchimento_.executar, payload);
}

var Preenchimento_ = (function(preenchimento) {

  function preencherDadosSimples(dados) {
    var resultado = Object.keys(dados).reduce(function(matriz, intervalo) {
      if (dados[intervalo] !== null && dados[intervalo] !== undefined) {
        var resultado = Planilhas.atualizarIntervalo(intervalo, {dados: dados[intervalo]});
        matriz.push('<div>' + intervalo + '</div>');
      }
      return matriz;
    }, [])
    .sort(function(a, b) {
      return a - b;
    })
    .join('');
    return '<div><b>Intervalos preenchidos:</b></div>' + (resultado.length > 0 ? resultado : '<div style="padding: 10px;">nenhum</div>');
  }

  function preencherBeneficioRecebido(dados) {
    
    var INTERVALO_COMPETENCIAS = 'CompetenciaDescontos';
    var INTERVALOS_ROTULOS = ['DescontosNB1', 'DescontosNB2', 'DescontosNB3', 'DescontosNB4', 'DescontosNB5'];
    var INTERVALOS_RENDA = ['DescontosNB1Renda', 'DescontosNB2Renda', 'DescontosNB3Renda', 'DescontosNB4Renda', 'DescontosNB5Renda'];
    var INTERVALOS_ABONO = ['DescontosNB1Abono', 'DescontosNB2Abono', 'DescontosNB3Abono', 'DescontosNB4Abono', 'DescontosNB5Abono'];
    var PRIMEIRA_LINHA = 5;
    
    var NB = dados.NB || 'NB ?';
    var planilha = SpreadsheetApp.getActiveSpreadsheet();

    var indicePrimeiroVazio = INTERVALOS_RENDA.reduce(function(resultado, intervalo, idx) {
      var intervaloRenda = planilha.getRangeByName(intervalo).offset(5, 0);
      var intervaloAbono = planilha.getRangeByName(INTERVALOS_ABONO[idx]).offset(5, 0);
      if (intervaloRenda.isBlank() && intervaloAbono.isBlank()) {
        return idx;
      }
      return resultado;
    }, -1);
    
    if (indicePrimeiroVazio >= 0 && indicePrimeiroVazio <= (INTERVALOS_ROTULOS.length - 1)) {
      
      var nomeIntervaloRotulo = INTERVALOS_ROTULOS[indicePrimeiroVazio];
      var nomeIntervaloRenda = INTERVALOS_RENDA[indicePrimeiroVazio];
      
      var linhasDesloc = Utils.posicaoCompetencia(planilha.getRangeByName(INTERVALO_COMPETENCIAS).getValues(), dados.competenciaInicial);
      
      if (linhasDesloc > 0) {
        Utils.atualizarIntervalo(nomeIntervaloRotulo, { dados: NB });
        Utils.atualizarIntervalo(nomeIntervaloRenda, { dados: dados.tabela, linhasDesloc: linhasDesloc });
      } else {
        throw new Utils.CustomError('Não foi possível posicionar os dados corretamente.');
      }
      
    } else {
      throw new Utils.CustomError('Não há intervalos disponíveis para a importação dos dados.');
    }
    
    return '<p>Dados importados com sucesso para o <b>grupo ' + (indicePrimeiroVazio + 1) + '</b>.</p>';
  }
  
  function preencherSalarios(dados) {
    
    var INTERVALO_COMPETENCIAS = 'CompetenciaIndices';
    var INTERVALO_ATUALIZACAO = 'SalariosContribuicao';
    var LINHA_INICIAL = 5;
    
    if (dados.tabela && dados.competenciaInicial) {
      
      var planilha = SpreadsheetApp.getActiveSpreadsheet();
      
      var linhasDesloc = Utils.posicaoCompetencia(planilha.getRangeByName(INTERVALO_COMPETENCIAS).getValues(), dados.competenciaInicial);

      if (linhasDesloc <= 0) {
        throw new Utils.CustomError('Não foi possível posicionar os dados corretamente.');
      }
      
      if (Utils.isTable(dados.tabela)) {
        
        Planilhas.atualizarIntervalo(INTERVALO_ATUALIZACAO, { dados: dados.tabela, linhasDesloc: LINHA_INICIAL + linhasDesloc });
        
      } else if (Utils.isTable(dados.tabela.primeira) && Utils.isTable(dados.tabela.segunda)) {
        
        Planilhas.atualizarIntervalo(INTERVALO_ATUALIZACAO, { dados: dados.tabela.primeira });
        Planilhas.atualizarIntervalo(INTERVALO_ATUALIZACAO, { dados: dados.tabela.segunda, linhasDesloc: LINHA_INICIAL + linhasDesloc });
        
      } else if (Utils.isTable(dados.tabela.segunda) && Utils.isTable(dados.tabela.terceira)) {
        
        Planilhas.atualizarIntervalo(INTERVALO_ATUALIZACAO, { dados: dados.tabela.segunda });
        Planilhas.atualizarIntervalo(INTERVALO_ATUALIZACAO, { dados: dados.tabela.terceira, linhasDesloc: LINHA_INICIAL + linhasDesloc });
        
      } else {
        throw new Utils.CustomError('Os dados recebidos são inválidos.');
      }
      
    } else {
      throw new Utils.CustomError('Os dados recebidos são inválidos.');
    }
    return '<p style="color: ' + Config_.CORES.SUCESSO + ';">Dados importados com sucesso.<p>';
  }

  function preencherPeriodos(dados) {

    var INTERVALO_ATUALIZACAO = 'TCInformado';
    
    var planilha = SpreadsheetApp.getActiveSpreadsheet();
    var intervalo = planilha.getRangeByName(INTERVALO_ATUALIZACAO);
    
    var linhasDesloc = Planilhas.ultimaLinhaNaoVazia(intervalo);

    if (linhasDesloc >= 0) {
      Planilhas.atualizarIntervalo('TCInformado', { dados: dados.tabela, linhasDesloc: linhasDesloc });
    } else {
      return new Utils.CustomError('Não foi possível encontrar espaço disponível para a inserção dos dados.');
    }
    return '<p>Dados importados com sucesso a partir da <b>linha ' + (linhasDesloc + 1) + '</b>.</p>';
  }  

  function preencherNovaPagina(dados, nome) {
    
    var planilha = SpreadsheetApp.getActiveSpreadsheet();
    
    var opcoes = {
      planilha: planilha,
      ultimaPosicao: false, 
      manterOculta: false,
      sobrescrever: false, 
      nomearColunas: false
    };
    
    var pagina = Planilhas.criarPagina(nome, opcoes);

    if (Utils.isTable(dados.info)) {
      opcoes.dados = dados.info;
      Planilhas.atualizarPagina(pagina, opcoes);
    }
    if (dados.tabela) {
      if (Utils.isTable(dados.tabela)) {
        opcoes.dados = dados.tabela;
        Planilhas.atualizarPagina(pagina, opcoes);
      } else {
        if (Utils.isTable(dados.tabela.primeira)) {
          opcoes.dados = dados.tabela.primeira;
          Planilhas.atualizarPagina(pagina, opcoes);
        }
        if (Utils.isTable(dados.tabela.segunda)) {
          opcoes.dados = dados.tabela.segunda;
          Planilhas.atualizarPagina(pagina, opcoes);
        }
        if (Utils.isTable(dados.tabela.terceira)) {
          opcoes.dados = dados.tabela.terceira;
          Planilhas.atualizarPagina(pagina, opcoes);
        }
      }
    }
    
    return '<p style="color: ' + Config_.CORES.SUCESSO + ';">Dados do<br>' + nome + '<br>importados com sucesso.<p>';
  }
  
  preenchimento.executar = function(payload) {

    var FUNCOES_DADOS_TABULARES = {
      BENEFICIO_RECEBIDO: preencherBeneficioRecebido,
      SALARIOS: preencherSalarios,
      PERIODOS: preencherPeriodos,
      NOVA_PAGINA: preencherNovaPagina,
    };

    var obj = JSON.parse(payload, function(k, v) {
      return k === '' ? v : Utils.tentarConverterEmData(v);
    });
    
    if (!Utils.isObject(obj)) {
      throw new Utils.CustomError('Os dados recebidos são inválidos.');
    }
    
    if (obj.opcao.TABULAR === false) {
      
      return preencherDadosSimples(obj.opcao.dados);
      
    } else {
      
      return FUNCOES_DADOS_TABULARES[obj.opcao.NOME](obj.opcao.dados, obj.origem.NOME);
    }
  }

  return preenchimento;
  
})(Preenchimento_ || Object.create(null));