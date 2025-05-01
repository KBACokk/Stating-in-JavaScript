document.addEventListener('DOMContentLoaded', function() {
    const waveElements = document.querySelectorAll('.wave-effect');
    waveElements.forEach(element => {
        element.addEventListener('click', function(e) {
            if (window.getSelection().toString().length > 0) return;

            const wave = document.createElement('span');
            wave.className = 'wave';
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            wave.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${e.clientX - rect.left - size/2}px;
                top: ${e.clientY - rect.top - size/2}px;
            `;
            this.appendChild(wave);
            setTimeout(() => wave.remove(), 700);
        });
    });

    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    editableElements.forEach(element => {
        const storageKey = `resume_${element.id || element.className || element.tagName}`;
        const savedContent = localStorage.getItem(storageKey);
        if (savedContent) element.innerHTML = savedContent;

        element.addEventListener('input', () => {
            localStorage.setItem(storageKey, element.innerHTML);
        });
    });

    document.getElementById('download-btn').addEventListener('click', generatePDF);
});

function generatePDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        doc.setFont('helvetica');
        doc.setTextColor(44, 62, 80);

        addHeaderToPDF(doc);


        let yPos = 40;
        yPos = addSectionToPDF(doc, 'Experience', '.experience-item', yPos);
        yPos = addSectionToPDF(doc, 'Education', '.education-item', yPos + 10);
        yPos = addInterestsToPDF(doc, yPos + 10);
        addContactInfoToPDF(doc, yPos + 10);

        doc.save('resume.pdf');
    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Error generating PDF. Please try again.');
    }
}

function addHeaderToPDF(doc) {
    const header = document.querySelector('.resume-header');
    if (!header) return;


    doc.setFontSize(22);
    doc.text(20, 20, document.querySelector('.header-left h1')?.textContent.trim() || '');
    doc.setFontSize(16).setTextColor(102, 102, 102);
    doc.text(20, 28, document.querySelector('.header-left p')?.textContent.trim() || '');


    const languages = Array.from(document.querySelectorAll('.languages-list span'))
                         .map(el => el.textContent.trim()).join(', ');
    doc.setFontSize(12).text(160, 20, `Languages: ${languages}`);
}

function addSectionToPDF(doc, title, selector, yPos) {
    doc.setFontSize(18).setTextColor(44, 62, 80).text(20, yPos, title);

    const items = document.querySelectorAll(selector);
    if (items.length === 0) return yPos + 10;

    const tableData = Array.from(items).map(item => {
        const period = item.querySelector('.experience-period, .education-period')?.textContent.trim() || '';
        const title = item.querySelector('h3')?.textContent.trim() || '';
        const company = item.querySelector('.experience-company, .education-institution')?.textContent.trim() || '';
        const description = getDescriptionText(item);
        const tags = getTagsText(item);

        return [
            period,
            `${title}\n${company}`,
            `${description}${tags ? '\nTags: ' + tags : ''}`
        ];
    });

    doc.autoTable({
        startY: yPos + 10,
        head: [['Period', 'Position', 'Details']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [66, 133, 244],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        columnStyles: {
            0: {cellWidth: 30},
            1: {cellWidth: 50},
            2: {cellWidth: 'auto'}
        },
        styles: {
            fontSize: 10,
            cellPadding: 3,
            lineColor: [200, 200, 200],
            lineWidth: 0.2
        }
    });

    return doc.lastAutoTable.finalY;
}

function addInterestsToPDF(doc, yPos) {
    const interests = document.querySelectorAll('.interests-list span');
    if (interests.length === 0) return yPos;

    doc.setFontSize(18).setTextColor(44, 62, 80).text(20, yPos, 'Interests');
    doc.setFontSize(12).text(20, yPos + 8, 
        Array.from(interests).map(el => el.textContent.trim()).join(', '));

    return yPos + 15;
}

function addContactInfoToPDF(doc, yPos) {
    const contact = document.querySelector('.contact-info');
    if (!contact) return;

    doc.setFontSize(14).setTextColor(102, 102, 102)
       .text(20, yPos, contact.textContent.trim());
}

function getDescriptionText(item) {
    const descEl = item.querySelector('.experience-description, .education-description');
    if (!descEl) return '';

    return Array.from(descEl.querySelectorAll('li'))
               .map(li => '• ' + li.textContent.trim())
               .join('\n');
}

function getTagsText(item) {
    const tags = item.querySelectorAll('.tag');
    if (tags.length === 0) return '';

    return Array.from(tags).map(tag => tag.textContent.trim()).join(', ');
}
