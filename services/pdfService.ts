import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { RepairOrder } from '@/types/repair';
import { Quote } from '@/types/quote';

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
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #4a6fdc;">
    <div>
      <h1 style="font-size: 24px; margin: 0 0 5px 0; color: #2c3e50; font-weight: 700; letter-spacing: -0.5px;">
        ${options.title}
      </h1>
      <p style="margin: 0; color: #7f8c8d; font-size: 14px;">
        <span style="color: #4a6fdc; font-weight: 500;">Fecha:</span> ${getCurrentDate()}
      </p>
    </div>
    ${options.logoUri ? `
      <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <img 
          src="${options.logoUri}" 
          alt="Logo" 
          style="max-width: 120px; max-height: 60px;"
        />
      </div>
    ` : ''}
  </div>
`;

const getHTMLFooter = (options: PDFOptions) => `
  <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #eaeef2; font-size: 12px; color: #7f8c8d; text-align: center;">
    <p style="margin: 5px 0;">
      <span style="color: #2c3e50; font-weight: 600;">${options.companyName}</span> • ${options.companyAddress}
    </p>
    <p style="margin: 5px 0;">
      <i class="fas fa-phone" style="margin-right: 5px;"></i> ${options.companyPhone} • 
      <i class="fas fa-envelope" style="margin: 0 5px;"></i> ${options.companyEmail}
    </p>
  </div>
`;

export const generateRepairOrderPDF = async (order: RepairOrder, options: Partial<PDFOptions> = {}) => {
  const pdfOptions = { ...defaultOptions, title: 'ORDEN DE REPARACIÓN', ...options };
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${pdfOptions.title}</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          body { 
            font-family: 'Inter', Arial, sans-serif; 
            line-height: 1.6; 
            color: #2d3748; 
            padding: 30px; 
            max-width: 800px; 
            margin: 0 auto;
            background-color: #fff;
          }
          
          h1, h2, h3 { 
            color: #1a202c;
            font-weight: 700;
            margin-top: 0;
          }
          
          .section { 
            margin-bottom: 30px;
            background: #ffffff;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.03);
            border: 1px solid #edf2f7;
          }
          
          .section-title { 
            font-size: 16px; 
            margin-bottom: 15px; 
            color: #4a6fdc;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding-bottom: 8px;
            border-bottom: 2px solid #f0f4f8;
          }
          
          .info-grid { 
            display: grid; 
            grid-template-columns: 140px 1fr; 
            gap: 12px; 
            margin-bottom: 5px; 
          }
          
          .info-label { 
            font-weight: 500; 
            color: #4a5568;
            font-size: 14px;
          }
          
          .info-value {
            color: #2d3748;
            font-weight: 400;
          }
          
          .items-table { 
            width: 100%; 
            border-collapse: separate;
            border-spacing: 0;
            margin: 20px 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          
          .items-table th { 
            background-color: #4a6fdc;
            color: white;
            text-align: left; 
            padding: 12px 15px;
            font-weight: 500;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .items-table td { 
            padding: 12px 15px; 
            border-bottom: 1px solid #edf2f7;
            font-size: 14px;
            vertical-align: top;
          }
          
          .items-table tr:last-child td {
            border-bottom: none;
          }
          
          .items-table tr:nth-child(even) {
            background-color: #f8fafc;
          }
          
          .items-table tr:hover {
            background-color: #f1f5f9;
          }
          
          .signature { 
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px dashed #e2e8f0;
          }
          
          .text-right { 
            text-align: right; 
          }
          
          .text-center { 
            text-align: center; 
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.3px;
            text-transform: uppercase;
          }
          
          .status-pending { background-color: #fff3cd; color: #d4a100; }
          .status-in-progress { background-color: #cce5ff; color: #0069d9; }
          .status-completed { background-color: #d4edda; color: #155724; }
          .status-delivered { background-color: #d1ecf1; color: #0c5460; }
          
          .device-card {
            background: #f8fafc;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            border-left: 4px solid #4a6fdc;
          }
          
          .device-title {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 8px;
            font-size: 15px;
          }
          
          .device-detail {
            display: flex;
            margin-bottom: 5px;
            font-size: 13px;
          }
          
          .device-label {
            color: #718096;
            min-width: 120px;
            font-weight: 500;
          }
          
          .device-value {
            color: #2d3748;
            font-weight: 400;
          }
          
          .total-row {
            background-color: #f8fafc;
            font-weight: 600;
          }
          
          .signature-line {
            border-top: 1px solid #cbd5e0;
            width: 200px;
            margin: 40px 0 5px;
          }
          
          .signature-label {
            font-size: 12px;
            color: #718096;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        ${getHTMLHeader(pdfOptions)}
        
        <!-- Order Status -->
        <div class="section" style="padding: 15px 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-weight: 500; color: #4a5568;">Orden #</span>
              <span style="font-weight: 700; color: #2d3748; letter-spacing: 0.5px;">${order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <span class="status-badge status-${order.status?.toLowerCase().replace(' ', '-') || 'pending'}">
              ${order.status || 'Pendiente'}
            </span>
          </div>
        </div>
        
        <!-- Customer Information -->
        <div class="section">
          <h2 class="section-title">
            <i class="fas fa-user" style="margin-right: 8px;"></i>
            Datos del Cliente
          </h2>
          <div class="info-grid">
            <div class="info-label">Cliente:</div>
            <div class="info-value">${order.customer?.name || 'No especificado'}</div>
            <div class="info-label">Documento:</div>
            <div class="info-value">${order.customer?.documentNumber || 'No especificado'}</div>
            <div class="info-label">Teléfono:</div>
            <div class="info-value">${order.customer?.phone || 'No especificado'}</div>
            <div class="info-label">Email:</div>
            <div class="info-value">${order.customer?.email || 'No especificado'}</div>
          </div>
        </div>
        
        <!-- Device Information -->
        <div class="section">
          <h2 class="section-title">
            <i class="fas fa-laptop" style="margin-right: 8px;"></i>
            Equipo a Reparar
          </h2>
          ${order.devices?.map(device => `
            <div class="device-card">
              <div class="device-title">${device.type || 'Dispositivo'}</div>
              <div class="device-detail">
                <span class="device-label">Marca/Modelo:</span>
                <span class="device-value">${device.brand || 'N/A'} ${device.model || ''}</span>
              </div>
              <div class="device-detail">
                <span class="device-label">N° de Serie:</span>
                <span class="device-value">${device.serialNumber || 'No especificado'}</span>
              </div>
              <div class="device-detail">
                <span class="device-label">Problema:</span>
                <span class="device-value">${device.reportedIssue || 'No especificado'}</span>
              </div>
              ${device.reportedIssue ? `
                <div class="device-detail">
                  <span class="device-label">Observaciones:</span>
                  <span class="device-value">${device.reportedIssue}</span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        
        <!-- Work Description -->
        ${order.description ? `
          <div class="section">
            <h2 class="section-title">
              <i class="fas fa-clipboard" style="margin-right: 8px;"></i>
              Descripción del Trabajo
            </h2>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-right: 3px solid #e2e8f0;">
              ${order.description.replace(/\n/g, '<br>')}
            </div>
          </div>
        ` : ''}
        
        <!-- Repair Items -->
        <div class="section" style="padding: 0; overflow: hidden;">
          <h2 class="section-title" style="margin-bottom: 0; border-radius: 8px 8px 0 0; margin: 0; padding: 15px 20px;">
            <i class="fas fa-tools" style="margin-right: 8px;"></i>
            Detalle de la Reparación
          </h2>
          <div style="padding: 0 20px 20px;">
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 45%;">Descripción</th>
                  <th style="width: 15%; text-align: center;">Cantidad</th>
                  <th style="width: 20%; text-align: right;">Precio Unit.</th>
                  <th style="width: 20%; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${order.items?.length ? order.items.map(item => `
                  <tr>
                    <td>
                      <div style="font-weight: 500; margin-bottom: 3px;">${item.deviceType || 'Item'}</div>
                      <div style="font-size: 12px; color: #718096;">
                        ${item.brand || ''} ${item.model || ''}
                      </div>
                    </td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">S/ ${item.price.toFixed(2)}</td>
                    <td style="text-align: right; font-weight: 500;">S/ ${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="4" style="text-align: center; padding: 20px; color: #a0aec0; font-style: italic;">
                      No hay items registrados
                    </td>
                  </tr>
                `}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; padding-right: 15px;">
                    <strong>Total:</strong>
                  </td>
                  <td style="text-align: right; font-size: 16px; color: #2d3748;">
                    <strong>S/ ${order.totalCost?.toFixed(2) || '0.00'}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
            
            ${order.notes ? `
              <div style="margin-top: 20px; padding: 12px; background: #fff8e6; border-radius: 6px; border-right: 3px solid #ffd54f;">
                <div style="font-weight: 600; margin-bottom: 5px; color: #8a6d3b;">
                  <i class="fas fa-info-circle" style="margin-right: 5px;"></i>
                  Notas Adicionales
                </div>
                <div style="font-size: 13px; color: #8a6d3b;">
                  ${order.notes.replace(/\n/g, '<br>')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div style="text-align: center;">
            <div class="signature-line"></div>
            <div class="signature-label">Firma del Cliente</div>
          </div>
          <div style="text-align: center;">
            <div class="signature-line"></div>
            <div class="signature-label">
              ${order.technician ? 
                `Técnico: ${order.technician.firstName} ${order.technician.lastName}` : 
                'Técnico a cargo'}
            </div>
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
          .text-center { text-align: center; }
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
    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Create a new filename with timestamp
    const newUri = `${FileSystem.documentDirectory}${fileName}`;
    
    // Move the file to a permanent location
    await FileSystem.moveAsync({
      from: uri,
      to: newUri,
    });

    // Handle web platform differently
    if (Platform.OS === 'web') {
      // For web, open the PDF in a new tab
      const response = await fetch(uri);
      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
      return { success: true, uri: pdfUrl };
    } else {
      // For mobile, use the sharing API
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
