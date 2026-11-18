import { PDFParse } from 'pdf-parse';

export function normalizeDate(str?: string): string {
  if (!str) return new Date().toISOString().split('T')[0];
  const dmy = str.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})\b/);
  if (dmy) {
    const day = dmy[1].padStart(2, '0');
    const month = dmy[2].padStart(2, '0');
    let year = dmy[3];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }
  const ymd = str.match(/\b(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})\b/);
  if (ymd) {
    return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`;
  }
  return new Date().toISOString().split('T')[0];
}

export function extractAmounts(line: string): number[] {
  const matches = line.matchAll(/(?:(?:\$|USD|Bs\.?|€|COP)\s*)?([0-9]{1,3}(?:[.,][0-9]{3})+(?:[.,][0-9]{1,2})|[0-9]+[.,][0-9]{1,2}|[0-9]+(?:\.[0-9]+)?)/gi);
  const results: number[] = [];
  for (const m of matches) {
    let clean = m[1];
    if (clean.includes('.') && clean.includes(',')) {
      if (clean.indexOf('.') < clean.indexOf(',')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        clean = clean.replace(/,/g, '');
      }
    } else if (clean.includes(',')) {
      clean = clean.replace(',', '.');
    }
    const val = parseFloat(clean);
    if (!isNaN(val) && val > 0) {
      results.push(val);
    }
  }
  return results;
}

const sample1 = `
INVERSIONES Y SUMINISTROS LOS PINOS C.A.
RIF: J-40892110-3
Factura N°: 00452
Fecha: 14/11/2026
Cliente: Bodega La Esquina C.A.
Teléfono: 0412-5551234
Dirección: Av. Bolívar Local 4

Cant.  Descripción                P.Unit    Total
20     Harina Pan 1kg             1.20      24.00
10     Aceite Diana 1L            2.50      25.00
15     Arroz Mary Blanco 1kg      1.40      21.00
5      Café Madrid 500g           3.80      19.00

Subtotal: 89.00
IVA (16%): 14.24
Total a Pagar: 103.24
Condición: A crédito 15 días
`;

console.log('Sample 1 amounts on Subtotal line:', extractAmounts('Subtotal: 89.00'));
console.log('Sample 1 amounts on Harina line:', extractAmounts('20     Harina Pan 1kg             1.20      24.00'));
