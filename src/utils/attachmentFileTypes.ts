// Type de fichier accepté par une pièce jointe de tâche
// (`Task.attachments[i].file_type`, choisi dans le Générateur de formulaire
// web : photo, pdf, word, pdf_word, other). Un slot sans `file_type`
// (configuré avant ce choix) garde l'ancien comportement : document PDF/Word
// si son nom contient un mot de FILE_CONTENT_CONNAT_IMAGE_LIST_OPTIONS,
// photo sinon (même règle que `legacy_attachment_file_type` côté backend).
import { FILE_CONTENT_CONNAT_IMAGE_LIST_OPTIONS } from './constants';

export type AttachmentFileType = 'photo' | 'pdf' | 'word' | 'pdf_word' | 'other';

const PDF_MIME = 'application/pdf';
const WORD_MIMES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const DEFINITIONS: Record<AttachmentFileType, { mimes: string[]; extensions: string[] | null; camera: boolean }> = {
  photo: { mimes: ['image/*'], extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp'], camera: true },
  pdf: { mimes: [PDF_MIME], extensions: ['pdf'], camera: false },
  word: { mimes: WORD_MIMES, extensions: ['doc', 'docx'], camera: false },
  pdf_word: { mimes: [PDF_MIME, ...WORD_MIMES], extensions: ['pdf', 'doc', 'docx'], camera: false },
  other: { mimes: ['*/*'], extensions: null, camera: true },
};

const slotName = (name: any): string => {
  if (name && typeof name === 'object') return String(name.name ?? '');
  return String(name ?? '');
};

export function attachmentFileType(slot: any): AttachmentFileType {
  const fileType = slot?.file_type;
  if (fileType && Object.prototype.hasOwnProperty.call(DEFINITIONS, fileType)) {
    return fileType as AttachmentFileType;
  }
  const name = slotName(slot?.name).toUpperCase();
  return FILE_CONTENT_CONNAT_IMAGE_LIST_OPTIONS.some((mot: string) => name.includes(mot)) ? 'pdf_word' : 'photo';
}

// Types MIME à passer au sélecteur de documents (expo-document-picker).
export function attachmentPickerMimeTypes(slot: any): string[] {
  return DEFINITIONS[attachmentFileType(slot)].mimes;
}

// Le bouton « Prendre une photo » n'a de sens que pour une photo ou un document libre.
export function attachmentAllowsCamera(slot: any): boolean {
  return DEFINITIONS[attachmentFileType(slot)].camera;
}

// Vérifie le fichier choisi (le filtre du sélecteur n'est pas toujours respecté
// selon l'appareil) : par l'extension du nom, sinon par le type MIME.
export function attachmentFileAllowed(slot: any, file: { name?: string; uri?: string; mimeType?: string; type?: string }): boolean {
  const def = DEFINITIONS[attachmentFileType(slot)];
  if (!def.extensions) return true;
  const source = String(file?.name || file?.uri || '').split('?')[0];
  const ext = source.includes('.') ? source.split('.').pop()!.toLowerCase() : '';
  if (ext && def.extensions.includes(ext)) return true;
  const mime = String(file?.mimeType || file?.type || '').toLowerCase();
  if (!mime) return false;
  return def.mimes.some((m) => (m.endsWith('/*') ? mime.startsWith(m.slice(0, -1)) : mime === m));
}

// Pièces jointes marquées « partagées avec les villages sièges » (`slot.share`).
export function taskHasSharedAttachments(task: any): boolean {
  return Array.isArray(task?.attachments) && task.attachments.some((slot: any) => !!slot?.share);
}
