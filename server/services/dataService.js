import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import XLSX from 'xlsx';

let xlsxFileMap = new Map();
let contractItems = [];
let serverDir = '';
let rootDir = '';

/**
 * 데이터 서비스 초기화
 */
export function initDataService(serverDirectory) {
  serverDir = serverDirectory;
  rootDir = join(serverDirectory, '..');
}

/**
 * XLSX 파일 인덱싱
 */
export async function buildXlsxIndex() {
  try {
    const files = await readdir(rootDir);
    const xlsxFiles = files.filter(f => f.endsWith('.xlsx'));

    xlsxFiles.forEach(file => {
      const category = file.split('_')[0];
      xlsxFileMap.set(category, join(rootDir, file));
    });

    // 별칭 설정
    xlsxFileMap.set('임금대장', xlsxFileMap.get('임금대장-임금명세서'));
    xlsxFileMap.set('임금명세서', xlsxFileMap.get('임금대장-임금명세서'));
    xlsxFileMap.set('휴일대체', xlsxFileMap.get('휴일'));

    console.log(`✅ XLSX 인덱싱 완료: ${xlsxFileMap.size}개 카테고리`);
  } catch (error) {
    console.error('❌ XLSX 인덱싱 실패:', error);
  }
}

/**
 * CSV 데이터 로드
 */
export async function loadContractItems() {
  try {
    const csvPath = join(serverDir, '근로계약서_updated.csv');
    const data = await readFile(csvPath, 'utf-8');
    const lines = data.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');

    contractItems = lines.slice(1).map(line => {
      const values = line.split(',');
      const item = {};
      headers.forEach((header, index) => {
        item[header.trim()] = values[index]?.trim() || '';
      });
      return item;
    });

    console.log(`✅ CSV 로드 완료: ${contractItems.length}개 항목`);
  } catch (error) {
    console.error('❌ CSV 로드 실패:', error);
    contractItems = [];
  }
}

/**
 * 적용 항목 필터링
 */
export function filterApplicableItems(businessSize, workerTypes) {
  const applicable = contractItems.filter(item => {
    const condition = item['적용조건'];

    if (condition === '공통') return true;
    if (condition === businessSize) return true;
    if (workerTypes.includes(condition)) return true;

    return false;
  });

  console.log(`📋 필터링 결과: ${applicable.length}개 항목 (공통 + ${businessSize} + ${workerTypes.join(', ')})`);
  return applicable;
}

/**
 * 상세 법령 가이드라인 추출
 */
export async function getDetailedLegalContent(topics) {
  const result = {
    text: '',
    structured: {}
  };

  if (!topics || topics.length === 0) return result;

  let detailedContent = '\n\n### [참고: 상세 법령 가이드라인]\n';
  let foundAny = false;
  const uniqueTopics = [...new Set(topics)];

  for (const topicStr of uniqueTopics) {
    if (!topicStr) continue;
    const parts = topicStr.trim().split(' ');
    if (parts.length < 2) continue;

    const category = parts[0];
    const topicId = parts[1];

    const filePath = xlsxFileMap.get(category);
    if (filePath) {
      try {
        const workbook = XLSX.readFile(filePath);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet);

        const match = data.find(row =>
          Object.values(row).some(v => typeof v === 'string' && v.includes(topicId))
        );

        if (match) {
          const content = `\n#### ${topicStr}\n- 상세내용: ${match.내용 || ''}\n` +
            (match.법조문 ? `- 관련법조문: ${match.법조문}\n` : '');
          detailedContent += content;

          result.structured[topicStr] = {
            title: topicStr,
            content: match.내용 || '',
            law: match.법조문 || ''
          };
          foundAny = true;
        }
      } catch (error) {
        console.error(`❌ XLSX 읽기 실패 (${category}):`, error.message);
      }
    }
  }

  if (foundAny) {
    result.text = detailedContent;
  }

  return result;
}

/**
 * 데이터베이스 파일 목록 조회
 */
export async function listDatabaseFiles() {
  const rootFiles = await readdir(rootDir);
  const serverFiles = await readdir(serverDir);

  return [
    ...rootFiles.filter(f => f.endsWith('.xlsx')).map(f => ({ name: f, type: 'xlsx', location: 'root' })),
    ...serverFiles.filter(f => f.endsWith('.csv')).map(f => ({ name: f, type: 'csv', location: 'server' }))
  ];
}

/**
 * 서버 디렉토리 경로 반환
 */
export function getServerDir() {
  return serverDir;
}

/**
 * 루트 디렉토리 경로 반환
 */
export function getRootDir() {
  return rootDir;
}
