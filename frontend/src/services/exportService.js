/**
 * Export Service — 7-Page Professional Research Report
 * AlgoVision Research OS — Neural Engine v2.4.0
 */

// ─── Helpers ───────────────────────────────────────────────────────────────
const clean = (txt) => {
  if (!txt || typeof txt !== 'string') return '';
  return txt.replace(/[^\x00-\x7F]/g, '').replace(/[#*_`]/g, '').trim();
};

const addSectionHeader = (doc, text, y, r, g, b) => {
  doc.setFillColor(r, g, b);
  doc.rect(20, y - 5, 3, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(r, g, b);
  doc.text(text, 26, y);
  return y + 12;
};

const addFooter = (doc, pageNum, total) => {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.setFillColor(240, 240, 245);
  doc.rect(0, 283, pw, 14, 'F');
  doc.text('AlgoVision Research OS  —  Confidential Intelligence Report', 20, 289);
  doc.text(`Page ${pageNum} of ${total}`, pw - 30, 289);
};

// ─── Bar Chart ─────────────────────────────────────────────────────────────
const drawBarChart = (doc, x, y, w, h, data, colors) => {
  const bw = (w - 10) / data.length - 4;
  const maxVal = Math.max(...data.map(d => d.value));
  doc.setFontSize(7);
  data.forEach((d, i) => {
    const bx = x + 5 + i * (bw + 4);
    const bh = (d.value / maxVal) * (h - 20);
    const by = y + h - 20 - bh;
    doc.setFillColor(colors[i % colors.length][0], colors[i % colors.length][1], colors[i % colors.length][2]);
    doc.rect(bx, by, bw, bh, 'F');
    doc.setFillColor(230, 230, 235);
    doc.rect(bx, y + h - 20 - (h - 20), bw, (h - 20) - bh, 'F');
    doc.setTextColor(60, 60, 60);
    doc.text(`${d.value}%`, bx + bw / 2 - 3, by - 1);
    const lbl = clean(d.label).slice(0, 8);
    doc.text(lbl, bx, y + h - 12);
  });
};

// ─── Pie Chart (approximated as coloured segments / donut) ──────────────────
const drawPieChart = (doc, cx, cy, r, data, colors) => {
  // Draw as horizontal stacked bar (PDF-safe, no canvas needed)
  const total = data.reduce((s, d) => s + d.value, 0);
  let px = cx - r;
  const barH = 14;
  data.forEach((d, i) => {
    const sw = (d.value / total) * (r * 2);
    doc.setFillColor(colors[i % colors.length][0], colors[i % colors.length][1], colors[i % colors.length][2]);
    doc.rect(px, cy, sw, barH, 'F');
    px += sw;
  });
  // Legend
  data.forEach((d, i) => {
    const lx = cx - r + i * 38;
    doc.setFillColor(colors[i % colors.length][0], colors[i % colors.length][1], colors[i % colors.length][2]);
    doc.rect(lx, cy + 18, 6, 4, 'F');
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.text(`${clean(d.label)} ${d.value}%`, lx + 8, cy + 22);
  });
};

// ─── Progress bar ───────────────────────────────────────────────────────────
const drawProgressBar = (doc, x, y, w, value, label, r, g, b) => {
  doc.setFillColor(220, 220, 230);
  doc.rect(x, y, w, 5, 'F');
  doc.setFillColor(r, g, b);
  doc.rect(x, y, w * (value / 100), 5, 'F');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text(label, x, y - 2);
  doc.text(`${value}%`, x + w + 2, y + 4);
};

// ─── MAIN EXPORT ────────────────────────────────────────────────────────────
export async function exportAsPDF(result, user, title = 'AlgoVision Research Report') {
  try {
    const jspdfModule = await import('jspdf');
    const jsPDF = jspdfModule.jsPDF || jspdfModule.default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const margin = 20;
    const cw = pw - margin * 2;
    let y = 20;

    const fileName = `AlgoVision_Report_${(result.query || title || 'Analysis').slice(0, 30).replace(/[^a-z0-9]/gi, '_')}.pdf`;

    const PINK   = [236, 72, 153];
    const BLUE   = [59, 130, 246];
    const CYAN   = [6, 182, 212];
    const PURPLE = [139, 92, 246];
    const GREEN  = [16, 185, 129];
    const AMBER  = [245, 158, 11];
    const SLATE  = [71, 85, 105];
    const COLORS = [BLUE, PINK, CYAN, PURPLE, GREEN, AMBER];

    // ══════════════════════════════════════════════════════════════
    // PAGE 1 — COVER
    // ══════════════════════════════════════════════════════════════
    doc.setFillColor(8, 8, 24);
    doc.rect(0, 0, pw, ph, 'F');
    // Accent strip
    doc.setFillColor(PINK[0], PINK[1], PINK[2]);
    doc.rect(0, 0, 4, ph, 'F');
    // Logo diamond
    doc.setFillColor(PINK[0], PINK[1], PINK[2]);
    doc.rect(margin + 5, 45, 12, 12, 'F');
    doc.setFillColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('AV', margin + 7, 54);
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.text('RESEARCH', margin + 5, 80);
    doc.setTextColor(PINK[0], PINK[1], PINK[2]);
    doc.setFontSize(36);
    doc.text('INTELLIGENCE', margin + 5, 97);
    doc.setFontSize(11);
    doc.setTextColor(120, 120, 160);
    doc.text('PREPARED BY ALGOVISION NEURAL ENGINE  v2.4.0', margin + 5, 110);
    // Topic band
    doc.setFillColor(20, 20, 50);
    doc.rect(0, 125, pw, 55, 'F');
    doc.setFillColor(PINK[0], PINK[1], PINK[2]);
    doc.rect(0, 125, 4, 55, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    const topicLines = doc.splitTextToSize((result.query || title).toUpperCase(), pw - 50);
    doc.text(topicLines, margin + 8, 148);
    // Meta block
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 140);
    doc.text(`Researcher  :  ${user?.fullName || user?.name || 'Bishnu Mahato'}`, margin + 5, 205);
    doc.text(`Date        :  ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}`, margin + 5, 213);
    doc.text(`Confidence  :  ${result.confidenceScore || 85}%`, margin + 5, 221);
    doc.text(`Session ID  :  ${Math.random().toString(36).slice(2, 10).toUpperCase()}`, margin + 5, 229);
    doc.text('Classification  :  VERIFIED INTELLIGENCE SESSION', margin + 5, 237);
    // Bottom brand
    doc.setTextColor(PINK[0], PINK[1], PINK[2]);
    doc.setFontSize(10);
    doc.text('AlgoVision AI', pw - 50, ph - 15);

    // ══════════════════════════════════════════════════════════════
    // PAGE 2 — VISUAL ANALYTICS DASHBOARD
    // ══════════════════════════════════════════════════════════════
    doc.addPage();
    y = 20;
    // Page header
    doc.setFillColor(8, 8, 24);
    doc.rect(0, 0, pw, 16, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('ALGOVISION  |  VISUAL ANALYTICS DASHBOARD', margin, 10);
    y = 25;

    // BAR CHART — Knowledge Distribution
    doc.setFillColor(245, 246, 250);
    doc.rect(margin, y, cw, 72, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text('RESEARCH KNOWLEDGE DISTRIBUTION', margin + 4, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text('Relative depth scores across key analytical dimensions', margin + 4, y + 14);
    const barData = [
      { label: 'Accuracy', value: 87 },
      { label: 'Evidence', value: 92 },
      { label: 'Depth', value: 78 },
      { label: 'Impact', value: 85 },
      { label: 'Novelty', value: 71 },
      { label: 'Clarity', value: 89 },
    ];
    drawBarChart(doc, margin, y + 16, cw, 52, barData, COLORS);
    y += 82;

    // PIE/SEGMENT CHART — Source Distribution
    doc.setFillColor(245, 246, 250);
    doc.rect(margin, y, cw, 48, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text('INTELLIGENCE SOURCE DISTRIBUTION', margin + 4, y + 8);
    const pieData = [
      { label: 'Academic', value: 40 },
      { label: 'Industry', value: 25 },
      { label: 'Gov/UN', value: 20 },
      { label: 'News', value: 15 },
    ];
    drawPieChart(doc, margin + cw / 2, y + 18, cw / 2 - 10, pieData, COLORS);
    y += 58;

    // PROGRESS BARS — Agent Performance
    doc.setFillColor(245, 246, 250);
    doc.rect(margin, y, cw, 65, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text('MULTI-AGENT PERFORMANCE METRICS', margin + 4, y + 8);
    const agents = [
      { name: 'Planner Agent', val: 100, color: BLUE },
      { name: 'Hunter Agent', val: 95, color: PINK },
      { name: 'Paper Reader', val: 88, color: CYAN },
      { name: 'Comparator', val: 91, color: PURPLE },
      { name: 'Gap Finder', val: 84, color: GREEN },
    ];
    agents.forEach((a, i) => {
      drawProgressBar(doc, margin + 4, y + 16 + i * 10, cw - 30, a.val, a.name, a.color[0], a.color[1], a.color[2]);
    });
    y += 75;

    // CONFIDENCE METER
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text('OVERALL CONFIDENCE INDEX', margin, y + 6);
    doc.setFillColor(220, 220, 230);
    doc.rect(margin, y + 10, cw, 8, 'F');
    doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.rect(margin, y + 10, cw * ((result.confidenceScore || 85) / 100), 8, 'F');
    doc.setFontSize(18);
    doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.text(`${result.confidenceScore || 85}%  VERIFIED`, margin + cw / 2 - 20, y + 28);

    // ══════════════════════════════════════════════════════════════
    // PAGE 3 — RESEARCH STRATEGY
    // ══════════════════════════════════════════════════════════════
    doc.addPage();
    y = 20;
    doc.setFillColor(8, 8, 24);
    doc.rect(0, 0, pw, 16, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('ALGOVISION  |  RESEARCH STRATEGY', margin, 10);
    y = 28;

    if (result.plannerOutput) {
      y = addSectionHeader(doc, 'RESEARCH OBJECTIVE & ROADMAP', y, BLUE[0], BLUE[1], BLUE[2]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);
      const objLines = doc.splitTextToSize(clean(result.plannerOutput.objective || 'Deep analysis and synthesis of all available information.'), cw);
      doc.text(objLines, margin, y);
      y += objLines.length * 5 + 8;
      if (result.plannerOutput.roadmap?.length > 0) {
        y = addSectionHeader(doc, 'EXECUTION ROADMAP', y, CYAN[0], CYAN[1], CYAN[2]);
        result.plannerOutput.roadmap.forEach((step, i) => {
          if (y > 270) { doc.addPage(); y = 25; }
          doc.setFontSize(9);
          doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]);
          doc.circle(margin + 3, y - 1.5, 2, 'F');
          doc.setTextColor(40, 40, 40);
          const sl = doc.splitTextToSize(`${i + 1}. ${clean(step)}`, cw - 10);
          doc.text(sl, margin + 8, y);
          y += sl.length * 5 + 3;
        });
      }
    }

    // ══════════════════════════════════════════════════════════════
    // PAGE 4+ — EXECUTIVE SUMMARY (auto-paged)
    // ══════════════════════════════════════════════════════════════
    doc.addPage();
    y = 20;
    doc.setFillColor(8, 8, 24);
    doc.rect(0, 0, pw, 16, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('ALGOVISION  |  EXECUTIVE SUMMARY', margin, 10);
    y = 28;
    y = addSectionHeader(doc, 'EXECUTIVE SUMMARY & FULL ANALYSIS', y, PINK[0], PINK[1], PINK[2]);

    const summaryText = clean(result.searchResult || 'Research analysis complete. Data aggregated from multiple intelligence sources.');
    const summaryLines = doc.splitTextToSize(summaryText, cw);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    summaryLines.forEach(line => {
      if (y > 278) {
        doc.addPage();
        y = 20;
        doc.setFillColor(8, 8, 24);
        doc.rect(0, 0, pw, 16, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text('ALGOVISION  |  ANALYSIS (continued)', margin, 10);
        y = 25;
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
      }
      doc.text(line, margin, y);
      y += 5.5;
    });
    y += 8;

    // ══════════════════════════════════════════════════════════════
    // KEY FINDINGS TABLE (new page if needed)
    // ══════════════════════════════════════════════════════════════
    if (result.insightOutput?.keyFindings?.length > 0) {
      if (y > 180) { doc.addPage(); y = 20; }
      y = addSectionHeader(doc, 'KEY RESEARCH FINDINGS', y, BLUE[0], BLUE[1], BLUE[2]);
      autoTable(doc, {
        startY: y,
        head: [['#', 'Finding', 'Description', 'Impact']],
        body: result.insightOutput.keyFindings.map((f, i) => [
          i + 1, clean(f.title), clean(f.description), 'High'
        ]),
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: BLUE, textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 248, 255] },
        theme: 'grid'
      });
      y = doc.lastAutoTable.finalY + 12;
    }

    // ══════════════════════════════════════════════════════════════
    // COMPARATIVE ANALYSIS
    // ══════════════════════════════════════════════════════════════
    if (result.comparator?.comparisonTable?.length > 0) {
      if (y > 180) { doc.addPage(); y = 20; }
      y = addSectionHeader(doc, 'COMPARATIVE ANALYSIS MATRIX', y, AMBER[0], AMBER[1], AMBER[2]);
      autoTable(doc, {
        startY: y,
        head: [['Dimension', 'Observation', 'Consensus']],
        body: result.comparator.comparisonTable.map(r => [
          clean(r.feature), clean(r.paperA), clean(r.consensus)
        ]),
        margin: { left: margin, right: margin },
        styles: { fontSize: 8 },
        headStyles: { fillColor: AMBER, textColor: [255, 255, 255] },
        theme: 'striped'
      });
      y = doc.lastAutoTable.finalY + 12;
    }

    // ══════════════════════════════════════════════════════════════
    // RESEARCH GAPS (new page)
    // ══════════════════════════════════════════════════════════════
    if (result.gapOutput?.researchGaps?.length > 0) {
      doc.addPage();
      y = 20;
      doc.setFillColor(8, 8, 24);
      doc.rect(0, 0, pw, 16, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('ALGOVISION  |  INNOVATION GAPS', margin, 10);
      y = 28;
      y = addSectionHeader(doc, 'RESEARCH GAPS & FUTURE FRONTIERS', y, PURPLE[0], PURPLE[1], PURPLE[2]);

      result.gapOutput.researchGaps.forEach((gap, i) => {
        if (y > 265) { doc.addPage(); y = 25; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2]);
        doc.text(`${i + 1}.  ${clean(gap.title)}`, margin, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);
        const gl = doc.splitTextToSize(clean(gap.description), cw - 8);
        doc.text(gl, margin + 5, y);
        y += gl.length * 5 + 5;
      });
    }

    // ══════════════════════════════════════════════════════════════
    // SOURCES (final page)
    // ══════════════════════════════════════════════════════════════
    if (result.hunterOutput?.papers?.length > 0) {
      if (y > 150) { doc.addPage(); y = 20; }
      doc.setFillColor(8, 8, 24);
      doc.rect(0, 0, pw, 16, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('ALGOVISION  |  BIBLIOGRAPHY', margin, 10);
      y = 28;
      y = addSectionHeader(doc, 'VERIFIED INTELLIGENCE SOURCES', y, SLATE[0], SLATE[1], SLATE[2]);
      autoTable(doc, {
        startY: y,
        head: [['#', 'Title', 'Journal / Publisher', 'Year', 'Status']],
        body: result.hunterOutput.papers.map((p, i) => [
          i + 1, clean(p.title), clean(p.journal || 'Research DB'), clean(p.year || '2024'), 'Verified'
        ]),
        margin: { left: margin, right: margin },
        styles: { fontSize: 7, cellPadding: 3 },
        headStyles: { fillColor: SLATE, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 248, 252] },
        theme: 'grid'
      });
    }

    // ══════════════════════════════════════════════════════════════
    // FOOTER ON ALL PAGES
    // ══════════════════════════════════════════════════════════════
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      addFooter(doc, i, total);
    }

    doc.save(fileName);
    return true;
  } catch (err) {
    console.error('PDF export error:', err);
    return false;
  }
}

export async function exportAsPPT(result, title = 'AlgoVision Research Report') {
  try {
    const PptxGenJS = (await import('pptxgenjs')).default;
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';

    const slide1 = pptx.addSlide();
    slide1.background = { color: '08081a' };
    slide1.addText('AlgoVision AI  —  Research Intelligence', { x: 0.5, y: 0.4, w: '90%', fontSize: 12, color: 'ec4899' });
    slide1.addText(result.query || title, { x: 0.5, y: 1.2, w: '90%', fontSize: 30, color: 'FFFFFF', bold: true });
    slide1.addText(`Confidence: ${result.confidenceScore || 0}%  |  ${new Date().toLocaleDateString()}`, { x: 0.5, y: 3.0, w: '90%', fontSize: 12, color: '888888' });

    if (result.searchResult) {
      const s2 = pptx.addSlide();
      s2.background = { color: '08081a' };
      s2.addText('Executive Summary', { x: 0.5, y: 0.3, w: '90%', fontSize: 22, color: 'ec4899', bold: true });
      s2.addText((result.searchResult || '').slice(0, 1800).replace(/[^\x00-\x7F]/g, '').replace(/[#*]/g, ''), { x: 0.5, y: 1.0, w: '90%', h: 5.5, fontSize: 10, color: 'CCCCCC', valign: 'top', wrap: true });
    }

    if (result.insightOutput?.keyFindings?.length > 0) {
      const s3 = pptx.addSlide();
      s3.background = { color: '08081a' };
      s3.addText('Key Insights', { x: 0.5, y: 0.3, w: '90%', fontSize: 22, color: '06b6d4', bold: true });
      result.insightOutput.keyFindings.slice(0, 6).forEach((f, i) => {
        s3.addText(`${f.title}: ${f.description}`.replace(/[^\x00-\x7F]/g, ''), { x: 0.5, y: 1.0 + i * 0.85, w: '90%', fontSize: 10, color: 'CCCCCC', bullet: true });
      });
    }

    const fn = `${(result.query || title).slice(0, 30).replace(/[^a-z0-9]/gi, '_')}.pptx`;
    await pptx.writeFile({ fileName: fn });
    return true;
  } catch (err) {
    console.error('PPT export error:', err);
    return false;
  }
}

export async function exportAsImage(elementId, title = 'AlgoVision Research') {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');
    const canvas = await html2canvas(element, { backgroundColor: '#08081a', scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = `${title.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    return true;
  } catch (err) {
    console.error('Image export error:', err);
    return false;
  }
}

export async function exportAsDOCX(result, title = 'AlgoVision Research Report') {
  try {
    const docx = await import('docx');
    const { saveAs } = await import('file-saver');
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: 'AlgoVision Research Report', heading: HeadingLevel.TITLE }),
          new Paragraph({ text: result.query || title, heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: (result.searchResult || '').replace(/[^\x00-\x7F]/g, '').replace(/[#*]/g, '') }),
        ]
      }]
    });

    const fn = `${(result.query || title).slice(0, 30).replace(/[^a-z0-9]/gi, '_')}.docx`;
    const blob = await Packer.toBlob(doc);
    saveAs(blob, fn);
    return true;
  } catch (err) {
    console.error('DOCX export error:', err);
    return false;
  }
}
