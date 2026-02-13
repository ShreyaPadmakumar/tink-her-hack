// download helpers - single file, zip, pdf

import JSZip from 'jszip';
import jsPDF from 'jspdf';

export function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export async function downloadAsZip(files, zipName = 'codebridge-export') {
    const zip = new JSZip();

    files.forEach(f => {
        zip.file(f.name || f.filename || 'untitled.txt', f.content || '');
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${zipName}.zip`;
    a.click();
    URL.revokeObjectURL(url);
}

export function downloadAsPDF(filename, content, language = 'plaintext') {
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const margin = 15;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const usableWidth = pageWidth - margin * 2;
    let y = margin;

    // header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(filename, margin, y);
    y += 8;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(120);
    pdf.text(`Language: ${language}  •  Exported: ${new Date().toLocaleString()}`, margin, y);
    y += 4;

    // divider
    pdf.setDrawColor(200);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 6;

    // code
    pdf.setFontSize(9);
    pdf.setFont('courier', 'normal');
    pdf.setTextColor(40);

    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        if (y > pageHeight - margin) {
            pdf.addPage();
            y = margin;
        }

        // line number
        pdf.setTextColor(180);
        const lineNum = String(i + 1).padStart(4, ' ');
        pdf.text(lineNum, margin, y);

        // code content
        pdf.setTextColor(40);
        const codeLine = lines[i].replace(/\t/g, '    ');
        const wrapped = pdf.splitTextToSize(codeLine, usableWidth - 15);
        pdf.text(wrapped, margin + 15, y);

        y += wrapped.length * 4;
    }

    // footer
    const totalPages = pdf.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFontSize(7);
        pdf.setTextColor(150);
        pdf.text(`Page ${p} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        pdf.text('CodeBridge', pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    pdf.save(`${filename.replace(/\.[^/.]+$/, '')}.pdf`);
}

// export a group of files as a single PDF (one file per page)
export function downloadGroupAsPDF(groupName, files) {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const margin = 15;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const usableWidth = pageWidth - margin * 2;

    files.forEach((file, idx) => {
        if (idx > 0) pdf.addPage();

        let y = margin;

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(file.filename || file.name || 'untitled', margin, y);
        y += 6;

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(120);
        pdf.text(`Language: ${file.language || 'plaintext'}`, margin, y);
        y += 4;

        pdf.setDrawColor(200);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 6;

        pdf.setFontSize(9);
        pdf.setFont('courier', 'normal');
        pdf.setTextColor(40);

        const lines = (file.content || '').split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (y > pageHeight - margin) {
                pdf.addPage();
                y = margin;
            }

            pdf.setTextColor(180);
            pdf.text(String(i + 1).padStart(4, ' '), margin, y);

            pdf.setTextColor(40);
            const codeLine = lines[i].replace(/\t/g, '    ');
            const wrapped = pdf.splitTextToSize(codeLine, usableWidth - 15);
            pdf.text(wrapped, margin + 15, y);
            y += wrapped.length * 4;
        }
    });

    const totalPages = pdf.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFontSize(7);
        pdf.setTextColor(150);
        pdf.text(`Page ${p}/${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    pdf.save(`${groupName || 'group'}.pdf`);
}
