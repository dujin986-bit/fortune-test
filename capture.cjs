const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('브라우저 실행 중...');
    const browser = await puppeteer.launch({
      headless: 'new',
      defaultViewport: {
        width: 1080,
        height: 1920
      }
    });
    const page = await browser.newPage();
    console.log('HTML 페이지 로딩 중...');
    await page.goto('file:///C:/Users/백두진/Desktop/운세테스트/인스타_릴스_홍보용_썸네일.html', { waitUntil: 'networkidle0' });
    
    console.log('스크린샷 캡처 중...');
    await page.screenshot({ path: 'C:/Users/백두진/Desktop/운세테스트/인스타_릴스_최종_썸네일.png' });
    
    await browser.close();
    console.log('캡처 완료! 인스타_릴스_최종_썸네일.png 생성됨.');
  } catch (err) {
    console.error('오류 발생:', err);
  }
})();
