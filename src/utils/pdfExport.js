import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPDF(content, filename) {
  const element = document.createElement('div');
  element.style.cssText = 'padding:40px;font-size:12px;line-height:1.6;font-family:"Malgun Gothic",sans-serif;white-space:pre-wrap';
  element.innerText = content;
  document.body.appendChild(element);

  try {
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

    let heightLeft = imgHeight - pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('PDF 생성 실패:', error);
    throw new Error('PDF 생성 중 오류가 발생했습니다.');
  } finally {
    document.body.removeChild(element);
  }
}

export function exportToWord(content, filename) {
  const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
    "xmlns:w='urn:schemas-microsoft-com:office:word' " +
    "xmlns='http://www.w3.org/TR/REC-html40'> " +
    "<head><meta charset='utf-8'><title>표준근로계약서</title></head><body>";
  const footer = "</body></html>";
  const html = header + "<pre style='font-family: Malgun Gothic; white-space: pre-wrap;'>" + content + "</pre>" + footer;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
