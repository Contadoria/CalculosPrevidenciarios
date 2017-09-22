/**
* @fileOverview
* Módulo com rotinas para notificação do resultado das operações.
*/

'use strict';

var Notificacao_ = (function(notificacao) {
  
  /**
  * Cria notificação ao cliente do resultado retornado por uma rotina.
  *
  * @private
  * @param {Function} fn Função a ser executada, seguida ou não de argumentos adicionais.
  * @return {Json} Retorna um objeto serializado com informações sobre o resultado da rotina.
  */
  notificacao.criar = function(fn/*, args*/) {
    try {
        return JSON.stringify(fn.apply(this, Array.prototype.slice.call(arguments, 1)));
    } catch (e) {
      if (Utils.isCustomError(e)) {
        notificacao.throwErroUsuario(e);
      } else {
        notificacao.throwErroSistema(e);
      }
    }
  };
  
  notificacao.throwErroUsuario = function(e) {
    Erros_.informar(e).logLocal();
    throw e.message;
  };

  notificacao.throwErroSistema = function(e) {
    Erros_.informar(e).logCentral().logLocal();
    throw 'Houve um erro de comunicação com o servidor.'
  };
  
  return notificacao;
  
})(Notificacao_ || Object.create(null));