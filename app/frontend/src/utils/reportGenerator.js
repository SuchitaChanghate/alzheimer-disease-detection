/**
 * Utility to generate and download a professional clinical diagnostic report.
 * Opens a print-friendly window, formats data, and triggers window.print().
 */
export const downloadReport = (data) => {
    const {
        userName = 'N/A',
        userEmail = 'N/A',
        age = 'N/A',
        gender = 'N/A',
        mmse = 'N/A',
        cdr = 'N/A',
        prediction = 'N/A',
        confidence = 0,
        gradCamImage = '',
        createdAt = new Date().toISOString()
    } = data;

    const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const confidencePercent = Math.round(confidence * 100);

    let stageLabel = 'Unknown';
    let stageColor = '#64748b'; // Slate
    let stageBg = '#f8fafc';
    let stageDescription = '';

    if (prediction === 'AD') {
        stageLabel = "Alzheimer's Disease Risk (AD)";
        stageColor = '#dc2626'; // Red 600
        stageBg = '#fef2f2';
        stageDescription = "The AI system detected significant atrophy patterns in the MRI scan matching typical Alzheimer's Disease signatures. This includes structural density decreases in critical cognitive areas like the hippocampus. Clinical metrics (MMSE / CDR) correlate with severe to moderate cognitive changes.";
    } else if (prediction === 'MCI') {
        stageLabel = "Mild Cognitive Impairment (MCI)";
        stageColor = '#d97706'; // Amber 600
        stageBg = '#fffbeb';
        stageDescription = "The AI system detected early structural changes in the MRI scan. These patterns are commonly associated with Mild Cognitive Impairment (MCI) and represent a transitional phase between normal brain aging and early dementia. Consistent monitoring and preventative brain health plans are highly recommended.";
    } else if (prediction === 'CN') {
        stageLabel = "Cognitively Normal (CN)";
        stageColor = '#059669'; // Emerald 600
        stageBg = '#ecfdf5';
        stageDescription = "The AI system did not detect structural patterns matching Alzheimer's Disease or Mild Cognitive Impairment. Brain volume, hippocampal structure, and clinical metrics are within expected normal bounds for healthy brain aging.";
    }

    const printWindow = window.open('', '_blank', 'width=900,height=1000');

    const reportHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Diagnostic Report - ${userName}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');
                
                body {
                    font-family: 'Outfit', sans-serif;
                    color: #1e293b;
                    line-height: 1.5;
                    margin: 0;
                    padding: 40px;
                    background-color: #ffffff;
                }
                
                .header {
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 24px;
                    margin-bottom: 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .logo-section h1 {
                    font-size: 28px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.5px;
                }

                .logo-section h1 span {
                    color: #4f46e5;
                }

                .logo-section p {
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748b;
                    margin: 2px 0 0 0;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .report-meta {
                    text-align: right;
                }

                .report-meta h2 {
                    font-size: 16px;
                    font-weight: 700;
                    color: #4f46e5;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .report-meta p {
                    font-size: 13px;
                    color: #64748b;
                    margin: 4px 0 0 0;
                    font-weight: 500;
                }

                .section-title {
                    font-size: 14px;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 6px;
                }

                .info-grid {
                    display: grid;
                    grid-template-cols: repeat(2, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .info-card {
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 16px;
                    padding: 16px 20px;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #e2e8f0;
                    font-size: 14px;
                }

                .info-row:last-child {
                    border-bottom: none;
                }

                .info-label {
                    font-weight: 600;
                    color: #64748b;
                }

                .info-value {
                    font-weight: 700;
                    color: #0f172a;
                }

                .result-box {
                    background-color: ${stageBg};
                    border: 1px dashed ${stageColor}40;
                    border-left: 6px solid ${stageColor};
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 35px;
                }

                .result-title {
                    font-size: 20px;
                    font-weight: 800;
                    color: ${stageColor};
                    text-transform: uppercase;
                    margin-top: 0;
                    margin-bottom: 8px;
                }

                .result-desc {
                    font-size: 14px;
                    font-weight: 500;
                    color: #334155;
                    margin: 0 0 16px 0;
                    line-height: 1.6;
                }

                .confidence-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .confidence-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #475569;
                    text-transform: uppercase;
                    min-width: 140px;
                }

                .confidence-bar-bg {
                    flex-grow: 1;
                    height: 12px;
                    background: #e2e8f0;
                    border-radius: 6px;
                    overflow: hidden;
                }

                .confidence-bar-fill {
                    height: 100%;
                    width: ${confidencePercent}%;
                    background: ${stageColor};
                    border-radius: 6px;
                }

                .confidence-val {
                    font-size: 15px;
                    font-weight: 800;
                    color: ${stageColor};
                }

                .visuals-section {
                    display: grid;
                    grid-template-cols: 1.2fr 1.8fr;
                    gap: 30px;
                    margin-bottom: 40px;
                }

                .visual-img-container {
                    border: 4px solid #f8fafc;
                    border-radius: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    overflow: hidden;
                    text-align: center;
                    background: #f8fafc;
                }

                .visual-img-container img {
                    width: 100%;
                    max-width: 250px;
                    aspect-ratio: 1;
                    object-fit: cover;
                    display: block;
                    margin: 0 auto;
                }

                .visual-explanation {
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 16px;
                    padding: 20px;
                    font-size: 13.5px;
                }

                .visual-explanation h4 {
                    margin-top: 0;
                    margin-bottom: 10px;
                    font-size: 14px;
                    font-weight: 700;
                    color: #0f172a;
                    text-transform: uppercase;
                }

                .visual-explanation p {
                    color: #475569;
                    margin: 0 0 16px 0;
                    line-height: 1.6;
                    font-weight: 500;
                }

                .color-legend {
                    display: grid;
                    grid-template-cols: 1fr 1fr;
                    gap: 12px;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    padding: 6px 12px;
                    border-radius: 8px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                }

                .legend-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .sign-off-section {
                    margin-top: 50px;
                    padding-top: 30px;
                    border-top: 2px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                }

                .sign-off-notes {
                    max-width: 450px;
                }

                .sign-off-notes h4 {
                    font-size: 12px;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    margin-top: 0;
                    margin-bottom: 8px;
                }

                .notes-lines {
                    border-bottom: 1px dashed #cbd5e1;
                    height: 24px;
                    margin-bottom: 10px;
                }

                .signature-box {
                    text-align: center;
                    min-width: 200px;
                }

                .signature-line {
                    border-bottom: 2px solid #e2e8f0;
                    height: 50px;
                    margin-bottom: 8px;
                }

                .signature-box p {
                    font-size: 11px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    margin: 0;
                }

                .footer {
                    margin-top: 60px;
                    text-align: center;
                    font-size: 11px;
                    color: #94a3b8;
                    font-weight: 600;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 20px;
                }

                @media print {
                    body {
                        padding: 20px;
                    }
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-section">
                    <h1>HEALTH<span>AI</span></h1>
                    <p>Hybrid Medical Diagnostics</p>
                </div>
                <div class="report-meta">
                    <h2>Diagnostic Report</h2>
                    <p>Report ID: ${data._id || 'REP-GEN-AUTO'}</p>
                    <p>Issued: ${formattedDate}</p>
                </div>
            </div>

            <div class="section-title">Patient Context & Metrics</div>
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-row">
                        <span class="info-label">Patient Name:</span>
                        <span class="info-value">${userName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Patient Email:</span>
                        <span class="info-value">${userEmail}</span>
                    </div>
                </div>
                <div class="info-card">
                    <div class="info-row">
                        <span class="info-label">Age / Gender:</span>
                        <span class="info-value">${age} years / ${gender === 'M' || gender === 0 || gender === '0' ? 'Male' : 'Female'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">MMSE Score:</span>
                        <span class="info-value">${mmse} / 30</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">CDR Score:</span>
                        <span class="info-value">${cdr}</span>
                    </div>
                </div>
            </div>

            <div class="section-title">AI diagnostic verdict</div>
            <div class="result-box">
                <h3 class="result-title">${stageLabel}</h3>
                <p class="result-desc">${stageDescription}</p>
                
                <div class="confidence-wrapper">
                    <span class="confidence-label">AI Diagnostic Certainty</span>
                    <div class="confidence-bar-bg">
                        <div class="confidence-bar-fill"></div>
                    </div>
                    <span class="confidence-val">${confidencePercent}%</span>
                </div>
            </div>

            <div class="section-title">MRI Neural Attention Mapping</div>
            <div class="visuals-section">
                <div class="visual-img-container">
                    ${gradCamImage ? `
                        <img id="gradCamImg" src="${window.location.origin}/results/${gradCamImage}" alt="Brain Focus Heatmap" />
                    ` : `
                        <div style="height:220px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:12px; font-weight:600;">No Scan Visuals Available</div>
                    `}
                </div>
                <div class="visual-explanation">
                    <h4>Grad-CAM Explainable AI (XAI)</h4>
                    <p>
                        The Neural Attention map uses Grad-CAM features extracted from the final Self-Attention layers of the Vision Transformer (ViT-Base). Warm-colored regions indicate areas in the MRI that weighted heavily in the classifier's output.
                    </p>
                    <div class="color-legend">
                        <div class="legend-item">
                            <div class="legend-dot" style="background-color: #ef4444;"></div>
                            <span style="color: #ef4444;">Atrophy / Focus Area</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-dot" style="background-color: #3b82f6;"></div>
                            <span style="color: #3b82f6;">Stable Tissue</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="sign-off-section">
                <div class="sign-off-notes">
                    <h4>Clinical Annotations / Notes</h4>
                    <div class="notes-lines"></div>
                    <div class="notes-lines"></div>
                    <div class="notes-lines"></div>
                </div>
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <p>Authorized Physician</p>
                    <p style="font-size: 9px; color:#cbd5e1; margin-top:2px;">Signature & Stamp</p>
                </div>
            </div>

            <div class="footer">
                HealthAI Patient Diagnostics • Confidential Report • Powered by Hybrid ViT-MLP Fusion
            </div>

            <script>
                // Ensure image is fully loaded before showing print dialog
                window.onload = function() {
                    const img = document.getElementById('gradCamImg');
                    if (img && !img.complete) {
                        img.onload = function() {
                            window.print();
                        };
                        img.onerror = function() {
                            window.print();
                        }
                    } else {
                        // Small buffer to guarantee layout render
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    }
                }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
};
