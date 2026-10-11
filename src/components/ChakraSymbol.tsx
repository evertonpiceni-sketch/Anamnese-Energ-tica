/** Displays the original artwork supplied in the approved references, without redrawing it. */
export function ChakraSymbol({ name }: { name: string }) {
  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const primary = normalized.includes('plexo') ? 0 : normalized.includes('card') ? 1 : normalized.includes('lar') ? 2 : normalized.includes('frontal') ? 3 : /raiz|basico/.test(normalized) ? 4 : -1;
  const complementary = /coron/.test(normalized) ? 0 : /sacral|sacro|umbil|esplen|sexual/.test(normalized) ? 5 : -1;
  if (primary < 0 && complementary < 0) return null;
  const usePrimary = primary >= 0;
  const crop = usePrimary ? 62 : 46;
  const scale = 64 / crop;
  const x = usePrimary ? [53, 155, 259, 366, 477][primary] : 37;
  const y = usePrimary ? 1039 : [782, 830, 877, 925, 972, 1019, 1067][complementary];
  return <span role="img" aria-label={`Símbolo do ${name}`} className="block h-16 w-16 shrink-0" style={{
    backgroundImage: `url(/chakras-referencia-${usePrimary ? 'aprovada' : 'complementar'}.jpg)`,
    backgroundSize: `${(usePrimary ? 906 : 853) * scale}px ${1280 * scale}px`,
    backgroundPosition: `${-x * scale}px ${-y * scale}px`,
    backgroundRepeat: 'no-repeat',
  }} />;
}
