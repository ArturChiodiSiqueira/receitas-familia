// Erro lançado pelas regras do sistema (diferente de falha de rede ou do servidor).
export class ErroNegocio extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'ErroNegocio';
  }
}

// Mostra a mensagem das regras de negócio; para qualquer outra falha usa o texto padrão.
export function mensagemDeErro(erro, padrao) {
  return erro instanceof ErroNegocio ? erro.message : padrao;
}
