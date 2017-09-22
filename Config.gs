/**
* @fileOverview
* Módulo com os parâmetros de configuração.
*/

'use strict';

var Config_ = (function(config) {
  
  config.CORES = {
    SUCESSO: '#FFFFFF'
  };

  config.STATUS = {
    OK: 'ok',
    ERRO: {
      USUARIO: 'erro usuario',
      SISTEMA: 'erro sistema'
    }
  };
  
  config.ATUALIZACOES = {
    TIPO: {
      INDICES: 'INDICES',
      TABELAS: 'TABELAS',
    },
    CONSULTAS: {
      INDICES: {
        TC: [],
        RMI: ['IndicesConsolidados'],
        ATRASADOS: ['IndicesConsolidados'],
      },
      TABELAS: {
        TC: ['ListaJuizos', 'ListaBeneficios', 'TabelaPontuacao', 'TabelaConversao', 'TabelaCarencia', 'ListaMotivos'],
        RMI: ['ListaJuizos', 'ListaBeneficios', 'OpcoesPC', 'OpcoesAtividadesConcomitantes', 'TabelaPontuacao', 'TabuasMortalidade'],
        ATRASADOS: ['ListaJuizos', 'ListaBeneficios', 'OpcoesAcao', 'OpcoesReajuste', 'OpcoesCorrecao', 'OpcoesJuros', 'OpcoesAlcada'],
      }
    }
  };
  
  config.PLANILHA = {
    TEMPLATE: {
      DADOS: 'DadosTemplate',
      LOG: 'LogTemplate',
    },
    PAGINAS_OCULTAS: {
      TC: ['Processamento', 'Parametros', 'Resultado', 'ParametrosDemonstrativos'],
      RMI: ['CalculoSalarios', 'ParametrosRMI', 'CalculoRMI', 'CalculosParalelos', 'ParametrosDemonstrativos'],
      ATRASADOS: ['ParametrosEvolucao', 'Evolucao', 'ParametrosDemonstrativos', 'ColunasDemonstrativos']
    },
    INTERVALO: {
      URL: 'SheetUrl',
      TIPO:'_v_Tipo',
      VERSAO_ATUAL: '_v_VersaoAtual',
      VERSAO_ATUAL_TEXTO: '_v_VersaoAtualTexto',
      VERSAO_DATA: '_v_Data',
      VERSAO_ANTERIORES: '_v_VersoesAnteriores',
      ESTATISTICA_URL: 'EstatisticaUrl',
      SUSPENSAO_TERMO_INICIAL: 'DER',
      SUSPENSAO_MARCO_INTERRUPTIVO: 'Citacao',
      PROCESSO: 'Processo',
      JUIZO: 'Juizo',
      SECAO: 'Secao',
      SUBSECAO: 'Subsecao',
      SALARIOS: 'SalariosContribuicao',
      ROTULOS_NB: ['DescontosNB1', 'DescontosNB2', 'DescontosNB3', 'DescontosNB4', 'DescontosNB5'],
    }
  };
  
  config.STORAGE = {
    ID: {
      TC: 'TC_ID',
      RMI: 'RMI_ID',
      ATRASADOS: 'ATRASADOS_ID',
      INDICES: 'INDICES_ID',
      TABELAS: 'TABELAS_ID',
      ERROS: 'ERROS_ID',
    },
    URL: {
      INDICES: 'INDICES_URL',
      TABELAS: 'TABELAS_URL',
      ERROS: 'ERROS_URL',
      ESTATISTICA: 'ESTATISTICA_URL',
    },
    PREFIXO: {
      PADRAO: 'PREFIXO_PADRAO',
      PADRAO_FORMULA: 'PREFIXO_PADRAO_FORMULA',
      COMUM: 'PREFIXO_COMUM',
      COMUM_FORMULA: 'PREFIXO_COMUM_FORMULA',
      LIMPAR: 'PREFIXO_LIMPAR'
    },
    CHAVE_PREFERENCIAS_USUARIO: 'PREFERENCIAS',
    PICKER_KEY: 'PICKER_KEY',
    CLIENT_ID: 'CLIENT_ID'
  };
  
  config.PREFIXO = {
    PADRAO: '_p_',
    PADRAO_FORMULA: '_p_f_',
    COMUM: '_c_',
    COMUM_FORMULA: '_c_f_',
    LIMPAR: '_limpar_'
  };
  
  return config;
  
})(Config_ || Object.create(null));