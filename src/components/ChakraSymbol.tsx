/** Purpose-made transparent lotus artwork following the approved logo. */
export function ChakraSymbol({ name }: { name: string }) {
  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const index = /raiz|basico/.test(normalized) ? 0 : /sacral|sacro|umbil|esplen|sexual/.test(normalized) ? 1 : normalized.includes('plexo') ? 2 : normalized.includes('card') ? 3 : normalized.includes('lar') ? 4 : normalized.includes('frontal') ? 5 : normalized.includes('coron') ? 6 : -1;
  if (index < 0) return null;
  const centers = [156, 446, 740, 1036, 1329, 1623, 1915];
  const scale = 80 / 294;
  return <span role="img" aria-label={`Símbolo do ${name}`} className="block h-24 w-20 shrink-0" style={{ backgroundImage: 'url(/chakras-logo.png)', backgroundSize: `${2073 * scale}px ${758 * scale}px`, backgroundPosition: `${40 - centers[index] * scale}px ${48 - 366 * scale}px`, backgroundRepeat: 'no-repeat' }} />;
}
