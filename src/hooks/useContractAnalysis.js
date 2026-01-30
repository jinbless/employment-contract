import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { contractApi } from '../api/contractApi';
import { exportToWord, exportToPDF } from '../utils/pdfExport';
import { PROGRESS_INCREMENT } from '../constants';
import { useAnalysis } from '../context/AnalysisContext';

/**
 * 계약서 분석 관련 비즈니스 로직을 담당하는 커스텀 훅
 */
export function useContractAnalysis() {
    const {
        files,
        setExtractedText,
        structuredData,
        setStructuredData,
        setAnalysisResult,
        generatedContract,
        setGeneratedContract,
        isAnalyzing,
        setIsAnalyzing,
        progress,
        setProgress,
        userContext,
        setStep,
        setIsExpanded,
        analysisResultRef,
    } = useAnalysis();

    // OCR 텍스트 추출
    const extractOCR = useCallback(async (isConnected) => {
        if (!isConnected) {
            alert('서버와 연결되어 있지 않습니다.');
            return;
        }
        if (files.length === 0) {
            alert('파일을 먼저 선택해주세요.');
            return;
        }

        setIsAnalyzing(true);
        setProgress(0);

        let combinedText = "";
        const totalFiles = files.length;

        const interval = setInterval(() => {
            setProgress(prev => Math.min(prev + PROGRESS_INCREMENT, 90));
        }, 500);

        try {
            for (let i = 0; i < totalFiles; i++) {
                const fd = new FormData();
                fd.append('file', files[i]);
                console.log(`OCR 요청 중: 파일 ${i + 1}/${totalFiles}`);

                const data = await contractApi.extractOCR(fd);
                console.log('OCR 성공:', data);

                if (data.extractedText) {
                    combinedText += `\n--- 문서 ${i + 1} ---\n` + data.extractedText + "\n";
                }
            }
            clearInterval(interval);
            setProgress(95);
            setExtractedText(combinedText.trim());

            // 구조화 진행
            await structureData(combinedText.trim());
        } catch (error) {
            clearInterval(interval);
            setIsAnalyzing(false);
            console.error('OCR 전체 오류:', error);
            alert('OCR 처리 중 오류가 발생했습니다.\n\n' + error.message);
        }
    }, [files, setExtractedText, setIsAnalyzing, setProgress]);

    // 데이터 구조화
    const structureData = useCallback(async (text) => {
        try {
            console.log('구조화 요청 시작');
            const data = await contractApi.structureContract(text);
            console.log('구조화 성공:', data);
            setStructuredData(JSON.parse(data.structuredData));
            setProgress(100);
            setTimeout(() => {
                setIsAnalyzing(false);
                setProgress(0);
            }, 500);
        } catch (error) {
            console.error('구조화 오류:', error);
            setIsAnalyzing(false);
            alert('구조화 중 오류가 발생했습니다.\n\n' + error.message);
        }
    }, [setStructuredData, setIsAnalyzing, setProgress]);

    // 분석 실행
    const confirmAndAnalyze = useCallback(async () => {
        if (!structuredData) {
            alert('구조화된 데이터가 없습니다.');
            return;
        }
        setIsAnalyzing(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => Math.min(prev + 5, 90));
        }, 800);

        try {
            console.log('분석 요청 시작:', structuredData, userContext);
            const data = await contractApi.analyzeContract(structuredData, userContext);
            console.log('분석 성공:', data);

            clearInterval(interval);
            setProgress(100);

            setTimeout(() => {
                setAnalysisResult(data);
                setIsAnalyzing(false);
                setStep(3);
                setProgress(0);
                setIsExpanded(false);
            }, 500);

        } catch (error) {
            console.error('분석 오류:', error);
            clearInterval(interval);
            setIsAnalyzing(false);
            alert('분석 중 오류가 발생했습니다.\n\n' + error.message);
        }
    }, [structuredData, userContext, setAnalysisResult, setIsAnalyzing, setProgress, setStep, setIsExpanded]);

    // 계약서 생성
    const generateContract = useCallback(async (analysisResult) => {
        if (!analysisResult) return;
        setIsAnalyzing(true);
        try {
            const data = await contractApi.generateContract(analysisResult);
            if (data.success) {
                setGeneratedContract(data.contractText);
                setStep(4);
            } else {
                alert('계약서 생성 실패: ' + data.error);
            }
        } catch (error) {
            console.error('계약서 생성 오류:', error);
            alert('계약서 생성 중 오류가 발생했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [setGeneratedContract, setIsAnalyzing, setStep]);

    // PDF 다운로드 (분석 결과)
    const downloadAnalysisPDF = useCallback(async () => {
        if (!analysisResultRef.current) return;

        try {
            const buttons = analysisResultRef.current.querySelectorAll('button');
            buttons.forEach(btn => btn.style.display = 'none');

            const canvas = await html2canvas(analysisResultRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            buttons.forEach(btn => btn.style.display = '');

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`근로계약서_분석결과_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            console.error('PDF 생성 실패:', error);
            alert('PDF 생성 중 오류가 발생했습니다.');
        }
    }, [analysisResultRef]);

    // PDF 다운로드 (계약서)
    const downloadContractPDF = useCallback(async () => {
        if (!generatedContract) return;
        try {
            await exportToPDF(generatedContract, `표준근로계약서_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            alert(error.message);
        }
    }, [generatedContract]);

    // Word 다운로드 (계약서)
    const downloadContractWord = useCallback(() => {
        if (!generatedContract) return;
        exportToWord(generatedContract, `표준근로계약서_${new Date().toISOString().slice(0, 10)}.doc`);
    }, [generatedContract]);

    return {
        extractOCR,
        structureData,
        confirmAndAnalyze,
        generateContract,
        downloadAnalysisPDF,
        downloadContractPDF,
        downloadContractWord,
        isAnalyzing,
        progress,
    };
}

export default useContractAnalysis;
