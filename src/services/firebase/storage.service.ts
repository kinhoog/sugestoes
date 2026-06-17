import {
  getDownloadURL,
  ref,
  uploadBytes,
  type StorageReference,
} from 'firebase/storage';

import { MAX_TAMANHO_ANEXO_BYTES, STORAGE_ANEXOS_ROOT } from '../../lib/constants';
import { validarAnexos } from '../../lib/validators';
import { requireFirebaseStorage } from './client';

export interface UploadAnexoResult {
  nome_arquivo: string;
  caminho_storage: string;
  tamanho_bytes: number;
  content_type: string;
}

function criarAnexoRef(solicitacaoId: string, file: File): StorageReference {
  const storage = requireFirebaseStorage();
  const safeName = file.name.replace(/[^\w.\- ]+/g, '_');
  const uniqueName = `${crypto.randomUUID()}-${safeName}`;
  return ref(storage, `${STORAGE_ANEXOS_ROOT}/${solicitacaoId}/${uniqueName}`);
}

export async function uploadAnexoSolicitacao(
  solicitacaoId: string,
  file: File,
): Promise<UploadAnexoResult> {
  if (file.size > MAX_TAMANHO_ANEXO_BYTES) {
    throw new Error('O arquivo excede o limite de 10 MB.');
  }

  const fileRef = criarAnexoRef(solicitacaoId, file);
  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type || 'application/octet-stream',
    customMetadata: {
      solicitacao_id: solicitacaoId,
    },
  });

  return {
    nome_arquivo: file.name,
    caminho_storage: snapshot.metadata.fullPath,
    tamanho_bytes: file.size,
    content_type: snapshot.metadata.contentType ?? file.type,
  };
}

export async function uploadAnexosSolicitacao(
  solicitacaoId: string,
  files: readonly File[],
): Promise<UploadAnexoResult[]> {
  const validacao = validarAnexos(files);

  if (!validacao.valido) {
    throw new Error(validacao.erro);
  }

  return Promise.all(files.map((file) => uploadAnexoSolicitacao(solicitacaoId, file)));
}

export async function obterUrlDownloadAnexo(caminhoStorage: string): Promise<string> {
  const storage = requireFirebaseStorage();
  return getDownloadURL(ref(storage, caminhoStorage));
}
