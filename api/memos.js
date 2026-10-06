export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const memos = [
    { id: 1, title: "비밀 자금 내역", content: "차명 계좌 A-102에 5000만원 입금 완료" },
    { id: 2, title: "주요 인사 접대 일정", content: "다음 주 화요일 강남 요정 예약" },
    { id: 3, title: "금고 비밀번호 힌트", content: "최 부장님 생년월일 뒤 4자리" },
    { id: 4, title: "비상 연락망", content: "김 실장 010-XXXX-XXXX" }
  ];

  return res.status(200).json(memos);
}