import { Quote } from '@/types/quote';
import { RepairOrder } from '@/types/repair';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

type PDFOptions = {
  title: string;
  logoUri?: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
};

const defaultOptions: PDFOptions = {
  title: 'Documento',
  companyName: 'Taller de Reparaciones',
  companyAddress: 'Av. Principal 123, Lima, Perú',
  companyPhone: '+51 123 456 789',
  companyEmail: 'contacto@taller.com',
};

const getCurrentDate = () => {
  return new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getHTMLHeader = (options: PDFOptions) => `
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
    <div>
      <h1 style="font-size: 20px; margin: 0; color: #333;">${options.title}</h1>
      <p style="margin: 5px 0 0; color: #666; font-size: 14px;">${getCurrentDate()}</p>
    </div>
    ${options.logoUri ? `
      <img 
        src="${options.logoUri}" 
        alt="Logo" 
        style="max-width: 100px; max-height: 60px;"
      />
    ` : ''}
  </div>
`;

const getHTMLFooter = (options: PDFOptions) => `
  <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
    <p>${options.companyName} • ${options.companyAddress}</p>
    <p>Teléfono: ${options.companyPhone} • Email: ${options.companyEmail}</p>
  </div>
`;

const getStatusText = (status: string): string => {
  switch (status) {
    case 'RECEIVED': return 'Recibido';
    case 'DIAGNOSED': return 'Diagnosticado';
    case 'IN_PROGRESS': return 'En Progreso';
    case 'WAITING_FOR_PARTS': return 'Esperando Repuestos';
    case 'COMPLETED': return 'Completado';
    case 'DELIVERED': return 'Entregado';
    case 'CANCELLED': return 'Cancelado';
    default: return status || 'Desconocido';
  }
};

export const generateRepairOrderPDF = async (order: RepairOrder, options: Partial<PDFOptions> = {}) => {
  console.log('generateRepairOrderPDF called with order:', order);
  const pdfOptions = { ...defaultOptions, title: 'Orden de Reparación', ...options };
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${pdfOptions.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1, h2, h3 { color: #2c3e50; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 18px; margin-bottom: 10px; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .info-grid { display: grid; grid-template-columns: 150px 1fr; gap: 10px; margin-bottom: 15px; }
          .info-label { font-weight: bold; color: #555; }
          .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .items-table th { background-color: #f5f5f5; text-align: left; padding: 8px; border: 1px solid #ddd; }
          .items-table td { padding: 8px; border: 1px solid #ddd; }
          .signature { margin-top: 50px; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        ${getHTMLHeader(pdfOptions)}
        
        <div class="section">
          <h2 class="section-title">Información de la Orden</h2>
          <div class="info-grid">
            <div class="info-label">ID de Orden:</div>
            <div>#${order.id?.substring(0, 8).toUpperCase() || 'N/A'}</div>
            <div class="info-label">Estado:</div>
            <div>${getStatusText(order.status) || 'No especificado'}</div>
            <div class="info-label">Fecha de Creación:</div>
            <div>${order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-PE') : 'No especificado'}</div>
          </div>
        </div>
        
        <div class="section">
          <h2 class="section-title">Datos del Cliente</h2>
          <div class="info-grid">
            <div class="info-label">Cliente:</div>
            <div>${order.customerName || 'No especificado'}</div>
            <div class="info-label">Teléfono:</div>
            <div>${order.customerPhone || 'No especificado'}</div>
            <div class="info-label">Email:</div>
            <div>${order.customerEmail || 'No especificado'}</div>
          </div>
        </div>
        
        <div class="section">
          <h2 class="section-title">Dispositivo${order.devices && order.devices.length > 1 ? 's' : ''}</h2>
          ${order.devices && order.devices.length > 0 ?
            order.devices.map(device => `
              <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 5px;">
                <div><strong>Tipo:</strong> ${device.type || 'No especificado'}</div>
                <div><strong>Marca:</strong> ${device.brand || 'No especificado'}</div>
                <div><strong>Modelo:</strong> ${device.model || 'No especificado'}</div>
                <div><strong>N° de Serie:</strong> ${device.serialNumber || 'No especificado'}</div>
                <div><strong>Problema reportado:</strong> ${device.reportedIssue || 'No especificado'}</div>
                ${device.accessories && device.accessories.length > 0 ? `
                  <div style="margin-top: 10px;"><strong>Accesorios:</strong></div>
                  <ul style="margin: 5px 0; padding-left: 20px;">
                    ${device.accessories.map(acc => `
                      <li>${acc.name} ${acc.included ? '✓' : '✗'}</li>
                    `).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')
            : '<p>No hay dispositivos registrados</p>'
          }
        </div>
        
        <div class="section">
          <h2 class="section-title">Descripción del Trabajo</h2>
          <p>${order.description || 'No se proporcionó una descripción.'}</p>
        </div>
        
        <div class="section">
          <h2 class="section-title">Items de Reparación</h2>
          <table class="items-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th style="width: 80px;">Cantidad</th>
                <th style="width: 100px;">Precio Unit.</th>
                <th style="width: 100px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map(item => `
                <tr>
                  <td>${[item.deviceType, item.brand, item.model].filter(Boolean).join(' ') || 'Item sin descripción'}</td>
                  <td>${item.quantity || 1}</td>
                  <td>S/ ${(item.price || 0).toFixed(2)}</td>
                  <td>S/ ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}</td>
                </tr>
              `).join('') || '<tr><td colspan="4" class="text-center">No hay items registrados</td></tr>'}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right"><strong>Total:</strong></td>
                <td><strong>S/ ${order.totalCost?.toFixed(2) || '0.00'}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div class="section">
          <div class="signature">
            <p>Firma del Cliente: ________________________</p>
            <p style="margin-top: 30px;">Técnico: ${order.technicianName || 'No asignado'}</p>
          </div>
        </div>
        
        ${getHTMLFooter(pdfOptions)}
      </body>
    </html>
  `;

  return await generateAndSharePDF(html, `orden_reparacion_${order.id}.pdf`);
};

export const generateQuotePDF = async (quote: Quote, options: Partial<PDFOptions> = {}) => {
  const pdfOptions = { ...defaultOptions, title: 'Presupuesto', ...options };
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${pdfOptions.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1, h2, h3 { color: #2c3e50; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 18px; margin-bottom: 10px; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .info-grid { display: grid; grid-template-columns: 150px 1fr; gap: 10px; margin-bottom: 15px; }
          .info-label { font-weight: bold; color: #555; }
          .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .items-table th { background-color: #f5f5f5; text-align: left; padding: 8px; border: 1px solid #ddd; }
          .items-table td { padding: 8px; border: 1px solid #ddd; }
          .signature { margin-top: 50px; }
          .text-right { text-align: right; }
          .status { 
            display: inline-block; 
            padding: 5px 10px; 
            border-radius: 4px; 
            font-weight: bold; 
            text-transform: uppercase;
            font-size: 12px;
            margin-left: 10px;
          }
          .status-pending { background-color: #fff3cd; color: #856404; }
          .status-approved { background-color: #d4edda; color: #155724; }
          .status-rejected { background-color: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        ${getHTMLHeader(pdfOptions)}
        
        <div class="section">
          <h2 class="section-title">
            Presupuesto #${quote.id.slice(0, 8).toUpperCase()}
            <span class="status status-${quote.status.toLowerCase()}">
              ${quote.status === 'PENDING' ? 'Pendiente' : quote.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
            </span>
          </h2>
          <div class="info-grid">
            <div class="info-label">Cliente:</div>
            <div>${quote.customer?.name || 'No especificado'}</div>
            <div class="info-label">Fecha:</div>
            <div>${new Date(quote.createdAt || '').toLocaleDateString('es-PE')}</div>
            <div class="info-label">Válido hasta:</div>
            <div>${new Date(new Date(quote.createdAt || '').getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE')}</div>
          </div>
        </div>
        
        <div class="section">
          <h2 class="section-title">Descripción</h2>
          <p>${quote?.repairOrder?.device || 'No se proporcionó una descripción.'}</p>
        </div>
        
        <div class="section">
          <h2 class="section-title">Items del Presupuesto</h2>
          <table class="items-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th style="width: 80px;">Cantidad</th>
                <th style="width: 100px;">Precio Unit.</th>
                <th style="width: 100px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${quote.items?.map(item => `
                <tr>
                  <td>${item.description || 'Item sin descripción'}</td>
                  <td>${item.quantity}</td>
                  <td>S/ ${item.price.toFixed(2)}</td>
                  <td>S/ ${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              `).join('') || '<tr><td colspan="4" class="text-center">No hay items registrados</td></tr>'}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right"><strong>Total:</strong></td>
                <td><strong>S/ ${quote.totalAmount?.toFixed(2) || '0.00'}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div class="section">
          <h2 class="section-title">Términos y Condiciones</h2>
          <ol style="padding-left: 20px; margin: 10px 0;">
            <li>Este presupuesto tiene una validez de 7 días a partir de la fecha de emisión.</li>
            <li>El trabajo comenzará una vez aprobado el presupuesto y recibido el pago del 50% del monto total.</li>
            <li>El tiempo estimado de reparación es aproximado y puede variar según la disponibilidad de repuestos.</li>
            <li>Los precios incluyen IGV.</li>
            <li>Se requiere pago completo antes de la entrega del equipo.</li>
          </ol>
        </div>
        
        <div class="section">
          <div class="signature">
            <p>Firma del Cliente: ________________________</p>
            <p style="margin-top: 30px;">Atentamente,</p>
            <p>${quote.technician ? `${quote.technician.firstName} ${quote.technician.lastName}` : 'Equipo Técnico'}</p>
          </div>
        </div>
        
        ${getHTMLFooter(pdfOptions)}
      </body>
    </html>
  `;

  return await generateAndSharePDF(html, `presupuesto_${quote.id}.pdf`);
};

const generateAndSharePDF = async (html: string, fileName: string) => {
  try {
    console.log('Generating PDF with HTML length:', html.length);
    console.log('HTML preview:', html.substring(0, 500) + '...');
    
    if (Platform.OS === 'web') {
      // Para web, usar una estrategia diferente
      console.log('Using web-specific PDF generation');
      
      // Crear una nueva ventana con el HTML para imprimir
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Esperar a que se cargue y luego imprimir
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
        
        return { success: true, uri: 'web-print' };
      } else {
        throw new Error('No se pudo abrir la ventana de impresión');
      }
    } else {
      // Generate PDF with explicit options to ensure HTML rendering
      const printOptions = {
        html,
        base64: false,
        width: 612,
        height: 792,
        margins: {
          left: 20,
          top: 20,
          right: 20,
          bottom: 20,
        },
      };
      
      console.log('Print options:', printOptions);
      const { uri } = await Print.printToFileAsync(printOptions);

      console.log('PDF generated at:', uri);

      // Create a new filename with timestamp
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Move the file to a permanent location
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      // Share the PDF
      await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir documento',
        UTI: 'com.adobe.pdf',
      });

      return { success: true, uri: newUri };
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error };
  }
};
