/** Purpose-made transparent 3D artwork, not a crop from a report reference. */
export function ChakraSymbol({ name }: { name: string }) {
  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const index = /raiz|basico/.test(normalized) ? 0 : /sacral|sacro|umbil|esplen|sexual/.test(normalized) ? 1 : normalized.includes('plexo') ? 2 : normalized.includes('card') ? 3 : normalized.includes('lar') ? 4 : normalized.includes('frontal') ? 5 : normalized.includes('coron') ? 6 : -1;
  if (index < 0) return null;
  return <span role="img" aria-label={`Símbolo do ${name}`} className="block h-24 w-20 shrink-0" style={{ backgroundImage: 'url(/chakras-cristalinos.png)', backgroundSize: '560px 186.67px', backgroundPosition: `${-index * 80}px -40px`, backgroundRepeat: 'no-repeat' }} />;
}
