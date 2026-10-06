import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * 2단계 공격 및 보안 상태 점검 함수
 * - bundle.mjs 규격에 맞추어 1~20개의 점검 결과 배열을 반환합니다.
 */
export async function runAttackChecks() {
  const checks = [];

  // 1. public/data.json 정적 파일 크기 및 빈 배열 검사
  try {
    const dataJsonPath = path.resolve('public/data.json');
    const dataContent = await fs.readFile(dataJsonPath, 'utf8');
    const parsed = JSON.parse(dataContent);

    checks.push({
      id: 'check-data-json-empty',
      name: '공개 data.json 파일 빈 배열 검사',
      passed: Array.isArray(parsed) && parsed.length === 0,
      detail: Array.isArray(parsed) && parsed.length === 0 
        ? 'data.json이 빈 배열입니다.' 
        : 'data.json에 메모 항목이 남아있습니다.'
    });

    // 2. 민감 가상 메모 키워드 검색
    const sensitiveKeywords = [
      '프로젝트 일정 점검',
      '서버 인프라 점검',
      '팀 내부 미팅 공유',
      '보안 점검 사항'
    ];

    const leakedKeyword = sensitiveKeywords.find(keyword => dataContent.includes(keyword));

    checks.push({
      id: 'check-sensitive-keyword-leak',
      name: '정적 파일 내 민감 가상 메모 키워드 검사',
      passed: !leakedKeyword,
      detail: leakedKeyword 
        ? `민감 키워드 발견: ${leakedKeyword}` 
        : '정적 파일에 민감 키워드가 없습니다.'
    });
  } catch (err) {
    checks.push({
      id: 'check-data-json-missing',
      name: '공개 data.json 존재 여부 및 접근성',
      passed: true,
      detail: 'data.json 파일이 없거나 접근할 수 없어 공개 메모가 노출되지 않습니다.'
    });
  }

  // 3. API 라우트 존재 여부 확인
  try {
    const apiMemoPath = path.resolve('api/memos.js');
    await fs.access(apiMemoPath);
    checks.push({
      id: 'check-api-memos-exists',
      name: 'Vercel Serverless API (/api/memos) 존재 검사',
      passed: true,
      detail: 'api/memos.js 파일이 정상 위치에 존재합니다.'
    });
  } catch (err) {
    checks.push({
      id: 'check-api-memos-exists',
      name: 'Vercel Serverless API (/api/memos) 존재 검사',
      passed: false,
      detail: 'api/memos.js 파일을 찾을 수 없습니다.'
    });
  }

  // 4. aleph.json 보존 여부 검사
  try {
    const alephJsonPath = path.resolve('public/aleph.json');
    await fs.access(alephJsonPath);
    checks.push({
      id: 'check-aleph-json-exists',
      name: 'public/aleph.json 파일 존재 및 보존 검사',
      passed: true,
      detail: 'aleph.json 파일이 정상 보존되어 있습니다.'
    });
  } catch (err) {
    checks.push({
      id: 'check-aleph-json-exists',
      name: 'public/aleph.json 파일 존재 및 보존 검사',
      passed: false,
      detail: 'aleph.json 파일이 손실되었습니다.'
    });
  }

  return checks;
}

export default runAttackChecks;