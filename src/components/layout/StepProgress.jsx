import React from 'react';

const StepProgress = ({ step, files, analysisResult }) => {
    // Determine active step for visualization
    // logic based on original App.jsx
    const isStep1 = files.length === 0;
    const isStep2 = files.length > 0 && !analysisResult;
    // Step 3 (Analysis) or Step 4 (Generation) both light up the 3rd circle in original code logic
    // actually original code: className={`step ${analysisResult ? 'active' : ''}`}
    const isStep3 = !!analysisResult;

    // Logic from original App.jsx:
    // Step 1 active if no files. Completed if files exist.
    // Step 2 active if files exist & no result. Completed if result exists.
    // Step 3 active if result exists.
    // The 'step' prop is now used to explicitly control the active step.
    // The 'files' and 'analysisResult' props can still be used for completion logic if needed,
    // but the primary active step is driven by 'step'.

    // Define the steps with their labels
    const steps = [
        { id: 1, label: '파일 업로드' },
        { id: 2, label: '정보 확인' },
        { id: 3, label: '결과 분석' },
        { id: 4, label: '계약서 작성' }
    ];

    return (
        <div className="step-progress">
            <div className="steps-container">
                {steps.map((s, index) => (
                    <React.Fragment key={s.id}>
                        <div className={`step ${step === s.id ? 'active' : step > s.id ? 'completed' : ''}`}>
                            <div className="step-circle">{s.id}</div>
                            <div className="step-label">{s.label}</div>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="step-arrow">→</div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default StepProgress;
