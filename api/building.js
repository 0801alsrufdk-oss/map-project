// 서버 중계 함수 (Vercel 서버리스). 브라우저 대신 data.go.kr 건축HUB 표제부를 호출한다.
// 인증키는 환경변수 DATA_GO_KR_KEY (.env / Vercel 환경변수)에서만 읽고, 로그·응답에 싣지 않는다.
const UP = 'https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo';

module.exports = async (req, res) => {
  let key = process.env.DATA_GO_KR_KEY || '';
  if (!key || key.includes('여기에_')) {
    res.status(500).json({ error: 'DATA_GO_KR_KEY 가 설정되지 않았습니다 (.env 확인)' });
    return;
  }
  if (key.includes('%')) { try { key = decodeURIComponent(key); } catch (e) {} }  // Encoding 키를 넣어도 동작

  const { sigunguCd, bjdongCd, platGbCd, bun, ji } = req.query || {};
  if (![sigunguCd, bjdongCd, platGbCd, bun, ji].every(v => /^\d+$/.test(v || ''))) {
    res.status(400).json({ error: '파라미터 형식 오류' });
    return;
  }

  const u = new URL(UP);
  u.search = new URLSearchParams({
    serviceKey: key, sigunguCd, bjdongCd, platGbCd, bun, ji,
    numOfRows: '20', pageNo: '1', _type: 'json',
  }).toString();

  try {
    const r = await fetch(u);
    const txt = await r.text();
    res.setHeader('Content-Type', r.headers.get('content-type') || 'text/plain; charset=utf-8');
    res.status(r.status).send(txt);
  } catch (e) {
    res.status(502).json({ error: 'data.go.kr 호출 실패' });   // 오류 객체는 출력하지 않는다(URL에 키 포함 방지)
  }
};
