const fs = require('fs');

// Read App.jsx
let code = fs.readFileSync('src/App.jsx', 'utf8');

console.log('Applying fixes...');

// Fix 1: Overlay positioning - add position absolute to loading overlay in structured step
code = code.replace(
    /currentStep === 'structured' &&[\s\S]*?<div className="split-container"/,
    match => match.replace(
        '<div className="split-container"',
        '<div className="split-container" style={{ position: \'relative\' }}'
    )
);

// Fix 2: Condition badges - format as [공통] style
code = code.replace(
    /{item\.적용조건 && <span className="text-xs[^"]*">{item\.적용조건}<\/span>}/g,
    '{item.적용조건 && <span className="inline-block px-2 py-1 rounded text-xs font-bold text-white bg-blue-600 mr-2">[{item.적용조건}]</span>}'
);

// Fix 3: DB reference hiding - remove <db>...</db> from display, log to console
code = code.replace(
    /<div className={`font-bold mb-2 \${item\.적절성 === '부적절' \? 'text-red-600' : 'text-slate-800'}`}>{item\.판단이유}<\/div>/g,
    `{(() => {
                                                                        const cleanReason = (item.판단이유 || '').replace(/<db>.*?<\\/db>/g, '');
                                                                        console.log(\`[항목: \${item.항목}] 참조 DB:\`, item.판단이유?.match(/<db>(.*?)<\\/db>/g) || '없음');
                                                                        return <div className={\`font-bold mb-2 \${item.적절성 === '부적절' ? 'text-red-600' : 'text-slate-800'}\`}>{cleanReason}</div>;
                                                                    })()}`
);

// Fix 4 & 5: Improve overall opinion with bullets and hide DB references
code = code.replace(
    /<p className="text-lg leading-relaxed"[^>]*>{result\.overallOpinion}<\/p>/,
    `<div className="text-base leading-loose" style={{ lineHeight: '1.9' }}>
                                                            {(() => {
                                                                const cleanText = (result.overallOpinion || '').replace(/<db>.*?<\\/db>/g, '');
                                                                return cleanText.split(/(?<=[.!?])\\s+/).filter(s => s.trim()).map((sentence, i) => (
                                                                    <div key={i} style={{ marginBottom: '0.8rem', paddingLeft: '1.2rem', textIndent: '-1.2rem' }}>
                                                                        <span style={{ fontWeight: 600, marginRight: '0.5rem' }}>•</span>
                                                                        <span>{sentence.trim()}</span>
                                                                    </div>
                                                                ));
                                                            })()}
                                                        </div>`
);

// Fix 6: Ensure contract generation works
code = code.replace(
    /const generateContract = async \(\) => {[\s\S]*?};/,
    `const generateContract = async () => {
        setIsGenerating(true);
        setProgress(0);
        const interval = setInterval(() => { setProgress(prev => Math.min(prev + 5, 90)); }, 500);
        try {
            const res = await fetch('http://localhost:3001/api/generate/contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysisResult: result,
                    originalText: extractedText,
                    workerType,
                    companySize
                })
            });
            if (!res.ok) throw new Error('계약서 생성 오류');
            const data = await res.json();
            clearInterval(interval);
            setProgress(100);
            setGeneratedContract(data.contractText);
            setCurrentStep('contract');
        } catch (error) {
            clearInterval(interval);
            alert('계약서 생성 실패: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };`
);

// Write back
fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('✅ All fixes applied successfully!');
