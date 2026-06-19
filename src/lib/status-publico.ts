import type { StatusPublicoSolicitacao, StatusSolicitacao } from '../types/solicitacao.types';

export function mapStatusPublico(status: StatusSolicitacao | string | null | undefined): StatusPublicoSolicitacao {
  switch (status) {
    case 'Em Análise':
      return 'Em análise';
    case 'Aguardando Informações':
      return 'Aguardando informações';
    case 'Aprovada':
      return 'Aprovada';
    case 'Rejeitada':
      return 'Rejeitada';
    case 'Concluída':
      return 'Concluída';
    case 'Nova':
    default:
      return 'Pendente';
  }
}
