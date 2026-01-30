import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import XLSX from 'xlsx';

/**
 * 데이터 서비스 클래스
 * 전역 상태 대신 인스턴스 기반 상태 관리
 */
class DataService {
  constructor() {
    this.xlsxFileMap = new Map();
    this.xlsxCache = new Map(); // XLSX 데이터 캐시
    this.contractItems = [];
    this.serverDir = '';
    this.rootDir = '';
    this.initialized = false;
  }

  /**
   * 서비스 초기화
   */
  init(serverDirectory) {
    this.serverDir = serverDirectory;
    this.rootDir = join(serverDirectory, '..');
    this.initialized = true;
  }

  /**
   * 초기화 상태 확인
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('DataService가 초기화되지 않았습니다. init()을 먼저 호출하세요.');
    }
  }

  /**
   * XLSX 파일 인덱싱
   */
  async buildXlsxIndex() {
    this.ensureInitialized();

    try {
      const legalDataDir = join(this.rootDir, 'data', 'legal');
      const files = await readdir(legalDataDir);
      const xlsxFiles = files.filter(f => f.endsWith('.xlsx'));

      xlsxFiles.forEach(file => {
        const category = file.split('_')[0];
        this.xlsxFileMap.set(category, join(legalDataDir, file));
      });

      // 별칭 설정
      this.xlsxFileMap.set('임금대장', this.xlsxFileMap.get('임금대장-임금명세서'));
      this.xlsxFileMap.set('임금명세서', this.xlsxFileMap.get('임금대장-임금명세서'));
      this.xlsxFileMap.set('휴일대체', this.xlsxFileMap.get('휴일'));

      console.log(`✅ XLSX 인덱싱 완료: ${this.xlsxFileMap.size}개 카테고리`);
    } catch (error) {
      console.error('❌ XLSX 인덱싱 실패:', error);
    }
  }

  /**
   * CSV 데이터 로드
   */
  async loadContractItems() {
    this.ensureInitialized();

    try {
      const csvPath = join(this.rootDir, 'data', 'templates', '근로계약서_updated.csv');
      const data = await readFile(csvPath, 'utf-8');
      const lines = data.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');

      this.contractItems = lines.slice(1).map(line => {
        const values = line.split(',');
        const item = {};
        headers.forEach((header, index) => {
          item[header.trim()] = values[index]?.trim() || '';
        });
        return item;
      });

      console.log(`✅ CSV 로드 완료: ${this.contractItems.length}개 항목`);
    } catch (error) {
      console.error('❌ CSV 로드 실패:', error);
      this.contractItems = [];
    }
  }

  /**
   * 적용 항목 필터링
   */
  filterApplicableItems(businessSize, workerTypes) {
    const applicable = this.contractItems.filter(item => {
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
   * XLSX 파일 읽기 (캐싱 포함)
   */
  async readXlsxFile(filePath) {
    // 캐시 확인
    if (this.xlsxCache.has(filePath)) {
      return this.xlsxCache.get(filePath);
    }

    // 파일 읽기
    const workbook = XLSX.readFile(filePath);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet);

    // 캐시에 저장
    this.xlsxCache.set(filePath, data);

    return data;
  }

  /**
   * 상세 법령 가이드라인 추출
   */
  async getDetailedLegalContent(topics) {
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

      const filePath = this.xlsxFileMap.get(category);
      if (filePath) {
        try {
          const data = await this.readXlsxFile(filePath);

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
  async listDatabaseFiles() {
    this.ensureInitialized();

    const legalDataDir = join(this.rootDir, 'data', 'legal');
    const templatesDir = join(this.rootDir, 'data', 'templates');
    const legalFiles = await readdir(legalDataDir);
    const templateFiles = await readdir(templatesDir);

    return [
      ...legalFiles.filter(f => f.endsWith('.xlsx')).map(f => ({ name: f, type: 'xlsx', location: 'data/legal' })),
      ...templateFiles.filter(f => f.endsWith('.csv')).map(f => ({ name: f, type: 'csv', location: 'data/templates' }))
    ];
  }

  /**
   * 서버 디렉토리 경로 반환
   */
  getServerDir() {
    return this.serverDir;
  }

  /**
   * 루트 디렉토리 경로 반환
   */
  getRootDir() {
    return this.rootDir;
  }

  /**
   * 캐시 초기화
   */
  clearCache() {
    this.xlsxCache.clear();
    console.log('✅ XLSX 캐시 초기화 완료');
  }
}

// 싱글톤 인스턴스 생성
const dataService = new DataService();

// 하위 호환성을 위한 함수형 API (기존 코드와 호환)
export function initDataService(serverDirectory) {
  dataService.init(serverDirectory);
}

export async function buildXlsxIndex() {
  return dataService.buildXlsxIndex();
}

export async function loadContractItems() {
  return dataService.loadContractItems();
}

export function filterApplicableItems(businessSize, workerTypes) {
  return dataService.filterApplicableItems(businessSize, workerTypes);
}

export async function getDetailedLegalContent(topics) {
  return dataService.getDetailedLegalContent(topics);
}

export async function listDatabaseFiles() {
  return dataService.listDatabaseFiles();
}

export function getServerDir() {
  return dataService.getServerDir();
}

export function getRootDir() {
  return dataService.getRootDir();
}

// 클래스 인스턴스도 내보내기 (향후 직접 사용 가능)
export { dataService };
export default DataService;
