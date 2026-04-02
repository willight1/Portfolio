export function makeSafeUploadFile(file: File): File {
  const ext = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : '';
  const safeExt = ext ? `.${ext.replace(/[^a-z0-9]/g, '')}` : '';
  const safeName = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;
  return new File([file], safeName, { type: file.type });
}
