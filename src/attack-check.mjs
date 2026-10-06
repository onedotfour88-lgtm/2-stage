import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * 단계별 공격 및 보안 상태 점검 함수
 */
export async function attackCheck(step = 2) {
  const results = {
    step,
    passed: true,
    checks: []
  };

  try {
    // 1. public/data.json 정적 파일 내 메모 제거 여부 점검
    const dataJsonPath = path.resolve('public/data.json');
    let dataContent = '';
    
    try {
      dataContent = await fs.readFile(dataJsonPath, 'utf8');
      const parsed = JSON.parse(dataContent);
      
      if (Array.isArray(parsed) && parsed.length === 0) {
        results.checks.push({ name: 'public/data.json cleared', status: 'PASS' });
      } else {
        results.passed = false;
        results.checks.push({ 
          name: 'public/data.json cleared', 
          status: 'FAIL', 
          reason: 'data.json contains items' 
        });
      }
    } catch (err) {
      // 파일이 없거나(404) 읽을 수 없는 경우도 정적 파일 메모 제거 조건 충족
      results.checks.push({ name: 'public/data.json cleared', status: 'PASS', note: 'file missing or empty' });
    }

    // 2. 가상 메모 핵심 민감 키워드 노출 여부 검사
    const sensitiveKeywords = [
      '프로젝트 일정 점검',
      '서버 인프라 점검',
      '팀 내부 미팅 공유',
      '보안 점검 사항'
    ];

    const leakedKeyword = sensitiveKeywords.find(keyword => dataContent.includes(keyword));

    if (leakedKeyword) {
      results.passed = false;
      results.checks.push({ 
        name: 'no sensitive keywords in static files', 
        status: 'FAIL', 
        reason: `Found keyword: ${leakedKeyword}` 
      });
    } else {
      results.checks.push({ name: 'no sensitive keywords in static files', status: 'PASS' });
    }

    return results;
  } catch (error) {
    return {
      step,
      passed: false,
      error: error.message
    };
  }
}

export default attackCheck;