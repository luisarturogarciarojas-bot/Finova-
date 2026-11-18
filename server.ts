import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Generous payload limits for PDF uploads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Initialize GoogleGenAI SDK with required headers
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Extract real text from PDF streams (decompresses FlateDecode streams)
function extractTextFromPdf(buffer: Buffer): string {
  let fullText = '';
  try {
    const str = buffer.toString('binary');
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;
    while ((match = streamRegex.exec(str)) !== null) {
      const rawStream = Buffer.from(match[1], 'binary');
      let textContent = '';
      try {
        textContent = zlib.inflateSync(rawStream).toString('utf-8');
      } catch (e) {
        textContent = rawStream.toString('utf-8');
      }

      // Match (string) Tj or ' or "
      const tjRegex = /\(([^)]+)\)\s*(?:Tj|'|\")/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(textContent)) !== null) {
        fullText += tjMatch[1] + ' ';
      }

      // Match [(str) 20 (str)] TJ
      const arrayRegex = /\[([^\]]+)\]\s*TJ/g;
      let arrMatch;
      while ((arrMatch = arrayRegex.exec(textContent)) !== null) {
        const innerRegex = /\(([^)]+)\)/g;
        let innerMatch;
        while ((innerMatch = innerRegex.exec(arrMatch[1])) !== null) {
          fullText += innerMatch[1];
        }
        fullText += ' ';
      }
    }
  } catch (err) {
    console.warn('PDF stream extraction error:', err);
  }
  return fullText.replace(/\\([()])/g, '$1').replace(/\s+/g, ' ').trim();
}

// Deterministic parser: extracts real customers, products, debts, transactions from raw text
function parseRealDataFromText(rawText: string, filename?: string) {
  const lines = rawText.split(/[\r\n]+|(?<=\.)\s+(?=[A-Z])/).map(l => l.trim()).filter(Boolean);
  
  const customers: any[] = [];
  const products: any[] = [];
  const debts: any[] = [];
  const transactions: any[] = [];
  
  let companyName = (filename || 'Empresa Importada').replace(/\.[^/.]+$/, '');
  
  // Look for company title in first few lines
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    if (line.length > 3 && line.length < 60 && !line.match(/página|page|fecha|date|\$|\d{4}/i)) {
      companyName = line;
      break;
    }
  }

  const phoneRegex = /(?:\+?57|\+?58|\+?1)?\s*(?:3\d{2}|4\d{2}|04\d{2}|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const taxIdRegex = /(?:NIT|RIF|CC|DNI|RUT|RFC|CEDULA|C\.C\.)\s*[:.-]?\s*([0-9A-Z.-]+)/i;
  const priceRegex = /(?:\$|USD|Bs\.?|€)?\s*(\d{1,6}(?:[.,]\d{2}))(?!\d)/;
  const dateRegex = /\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\b/;

  const seenCustomerNames = new Set<string>();
  const seenProductNames = new Set<string>();

  for (const line of lines) {
    const hasPhone = line.match(phoneRegex);
    const hasEmail = line.match(emailRegex);
    const hasTaxId = line.match(taxIdRegex);
    const priceMatch = line.match(priceRegex);
    const dateMatch = line.match(dateRegex);

    // 1. Identify customer line
    if (line.match(/cliente|customer|comprador|titular|nombre/i) || (hasPhone && line.length < 80)) {
      let custName = line
        .replace(/cliente[:\s]*|nombre[:\s]*/i, '')
        .replace(phoneRegex, '')
        .replace(emailRegex, '')
        .replace(taxIdRegex, '')
        .replace(/[,\-:|]/g, ' ')
        .trim();

      if (custName.length > 2 && custName.length < 50 && !seenCustomerNames.has(custName.toLowerCase())) {
        seenCustomerNames.add(custName.toLowerCase());
        customers.push({
          id: `cust-real-${Date.now()}-${customers.length + 1}`,
          name: custName,
          phone: hasPhone ? hasPhone[0].trim() : '',
          email: hasEmail ? hasEmail[0].trim() : undefined,
          taxId: hasTaxId ? hasTaxId[0].trim() : undefined,
          category: 'Importado',
          totalPurchases: 0,
        });
      }
    }

    // 2. Identify product / article line with price
    if ((line.match(/producto|articulo|item|sku|unid|cant/i) || priceMatch) && !line.match(/total|subtotal|saldo|deuda|pago/i) && priceMatch) {
      const parsedPrice = parseFloat(priceMatch[1].replace(',', '.'));
      let prodName = line
        .replace(priceRegex, '')
        .replace(/producto[:\s]*|articulo[:\s]*/i, '')
        .replace(/[0-9]+x\b/i, '')
        .trim();

      if (prodName.length > 2 && prodName.length < 60 && !seenProductNames.has(prodName.toLowerCase()) && !isNaN(parsedPrice) && parsedPrice > 0) {
        seenProductNames.add(prodName.toLowerCase());
        products.push({
          id: `prod-real-${Date.now()}-${products.length + 1}`,
          name: prodName,
          sku: `ART-${(products.length + 1).toString().padStart(3, '0')}`,
          category: 'Inventario Importado',
          costPrice: Math.round(parsedPrice * 0.7 * 100) / 100,
          salePrice: parsedPrice,
          stock: 10,
          minStockAlert: 2,
          isAvailable: true,
        });
      }
    }

    // 3. Identify debt / receivable / payable
    if (line.match(/deuda|por cobrar|por pagar|saldo pendiente|factura pendiente|fiado/i) && priceMatch) {
      const debtAmount = parseFloat(priceMatch[1].replace(',', '.'));
      if (!isNaN(debtAmount) && debtAmount > 0) {
        const isPayable = Boolean(line.match(/por pagar|proveedor|compra/i));
        debts.push({
          id: `debt-real-${Date.now()}-${debts.length + 1}`,
          type: isPayable ? 'payable' : 'receivable',
          contactName: line.slice(0, 35).replace(/[0-9$.,]/g, '').trim() || 'Contacto registrado',
          contactPhone: hasPhone ? hasPhone[0] : '',
          totalAmount: debtAmount,
          paidAmount: 0,
          remainingAmount: debtAmount,
          dueDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString().split('T')[0],
          notes: line.slice(0, 80).trim(),
          status: 'pending',
          history: [],
        });
      }
    }

    // 4. Identify real transaction / sale / expense
    if ((line.match(/venta|ingreso|gasto|compra|cobro|pago/i) || dateMatch) && priceMatch) {
      const txAmount = parseFloat(priceMatch[1].replace(',', '.'));
      if (!isNaN(txAmount) && txAmount > 0) {
        const isExpense = Boolean(line.match(/gasto|egreso|compra|pago|flete|alquiler|nomina/i));
        transactions.push({
          id: `tx-real-${Date.now()}-${transactions.length + 1}`,
          type: isExpense ? 'expense' : 'sale',
          amount: txAmount,
          concept: line.replace(priceRegex, '').replace(dateRegex, '').trim().slice(0, 60) || (isExpense ? 'Gasto registrado' : 'Venta registrada'),
          category: isExpense ? 'Gastos Operativos' : 'Ventas del Negocio',
          paymentMethod: 'cash',
          date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
          time: '12:00',
        });
      }
    }
  }

  const totalSales = transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalReceivable = debts.filter(d => d.type === 'receivable').reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalPayable = debts.filter(d => d.type === 'payable').reduce((sum, d) => sum + d.remainingAmount, 0);

  return {
    companyName,
    dateRange: {
      start: transactions[transactions.length - 1]?.date || new Date().toISOString().split('T')[0],
      end: transactions[0]?.date || new Date().toISOString().split('T')[0],
    },
    summary: {
      totalSales,
      totalExpenses,
      totalReceivable,
      totalPayable,
    },
    customers,
    products,
    debts,
    transactions,
  };
}

// Endpoint to parse real PDF / document without inventing fake dummy data
app.post('/api/import-old-company', async (req, res) => {
  try {
    const { pdfBase64, filename } = req.body || {};

    if (!pdfBase64) {
      return res.status(400).json({
        success: false,
        error: 'No se envió ningún archivo para procesar. Por favor adjunta un documento PDF con información real.',
      });
    }

    // 1. If Gemini AI is configured, perform multimodal document extraction
    if (ai && pdfBase64) {
      try {
        const prompt = `Analiza este documento contable/financiero de una empresa real.
REGLA CRÍTICA Y ESTRICTA: Extrae EXCLUSIVAMENTE los datos reales que aparezcan escritos en este documento.
NUNCA inventes clientes, productos, números, nombres ni montos ficticios. Si una sección no existe en el documento, devuélvela como un array vacío [].
Estructura JSON requerida:
{
  "companyName": "Nombre real de la empresa que figure en el documento",
  "dateRange": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "summary": {
    "totalSales": 0,
    "totalExpenses": 0,
    "totalReceivable": 0,
    "totalPayable": 0
  },
  "customers": [
    {
      "id": "c-1",
      "name": "Nombre real del cliente",
      "phone": "Teléfono si aparece",
      "email": "Correo si aparece",
      "taxId": "Documento/NIT/RIF si aparece",
      "category": "General",
      "totalPurchases": 0
    }
  ],
  "products": [
    {
      "id": "p-1",
      "name": "Nombre real del producto/artículo",
      "sku": "Código si aparece",
      "category": "Categoría o General",
      "costPrice": 0,
      "salePrice": 0,
      "stock": 0,
      "minStockAlert": 2,
      "isAvailable": true
    }
  ],
  "debts": [
    {
      "id": "d-1",
      "type": "receivable o payable",
      "contactName": "Nombre de la persona o proveedor",
      "contactPhone": "",
      "totalAmount": 0,
      "paidAmount": 0,
      "remainingAmount": 0,
      "dueDate": "YYYY-MM-DD",
      "createdAt": "YYYY-MM-DD",
      "notes": "Detalle real de la deuda",
      "status": "pending",
      "history": []
    }
  ],
  "transactions": [
    {
      "id": "t-1",
      "type": "sale o expense",
      "amount": 0,
      "concept": "Concepto real",
      "category": "Ventas o Gastos",
      "paymentMethod": "cash",
      "date": "YYYY-MM-DD",
      "time": "12:00",
      "customerOrSupplier": "Nombre si aparece"
    }
  ]
}
Responde ÚNICAMENTE con el JSON válido.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              text: prompt,
            },
          ],
          config: {
            responseMimeType: 'application/json',
          },
        });

        const textOutput = response.text;
        if (textOutput) {
          const parsed = JSON.parse(textOutput);
          const hasAnyData =
            (parsed.customers && parsed.customers.length > 0) ||
            (parsed.products && parsed.products.length > 0) ||
            (parsed.debts && parsed.debts.length > 0) ||
            (parsed.transactions && parsed.transactions.length > 0);

          if (hasAnyData) {
            return res.json({
              success: true,
              source: 'gemini_document_extraction',
              data: parsed,
            });
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini extraction notice, checking text stream parser:', geminiError?.message);
      }
    }

    // 2. Local deterministic extraction from raw PDF text stream
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const rawPdfText = extractTextFromPdf(pdfBuffer);

    if (rawPdfText && rawPdfText.length > 20) {
      const parsedData = parseRealDataFromText(rawPdfText, filename);
      const hasAnyRealData =
        parsedData.customers.length > 0 ||
        parsedData.products.length > 0 ||
        parsedData.debts.length > 0 ||
        parsedData.transactions.length > 0;

      if (hasAnyRealData) {
        return res.json({
          success: true,
          source: 'pdf_text_parser',
          data: parsedData,
        });
      }
    }

    // 3. If no real data could be extracted, return a clear truthful error (NEVER fake dummy data)
    return res.status(422).json({
      success: false,
      error: 'No se encontraron registros legibles en el documento PDF proporcionado. Asegúrate de que el archivo contenga texto seleccionable (no sea una imagen escaneada vacía o con contraseña).',
    });
  } catch (error: any) {
    console.error('Error in /api/import-old-company:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar el archivo PDF.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Fynova Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
