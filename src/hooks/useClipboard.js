import { useState, useCallback } from 'react';

export const useClipboard = (resetDelay = 2000) => {
  const [copiedKey, setCopiedKey] = useState(null);

  const copy = useCallback(
    async (text, key = 'default') => {
      if (!navigator.clipboard) {
        console.warn('Clipboard API no soportada en este entorno');
        return false;
      }
      try {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), resetDelay);
        return true;
      } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
        return false;
      }
    },
    [resetDelay]
  );

  return { copy, copiedKey, isCopied: (key) => copiedKey === key };
};
