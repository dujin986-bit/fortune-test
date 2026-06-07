import { jsPDF } from 'jspdf';
import type { DestinyResult } from './astrologyCalculator';

// ArrayBuffer를 Base64로 변환하는 헬퍼 함수
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// 한글 폰트 로드 및 jsPDF 초기화 함수
async function initPDFWithKoreanFont(): Promise<jsPDF> {
  const fontUrl = 'https://cdn.jsdelivr.net/gh/fonts-archive/NanumGothic/NanumGothic.ttf';
  
  try {
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error('폰트 파일을 가져오지 못했습니다.');
    }
    const arrayBuffer = await response.arrayBuffer();
    const base64Font = arrayBufferToBase64(arrayBuffer);
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Virtual File System에 폰트 추가 및 등록
    doc.addFileToVFS('NanumGothic.ttf', base64Font);
    doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
    doc.setFont('NanumGothic');
    
    return doc;
  } catch (error) {
    console.error('한글 폰트 로드 실패:', error);
    return new jsPDF();
  }
}

export async function generatePDFReport(result: DestinyResult, creatorInfo: {
  name: string;
  instagramUrl: string;
  instagramId: string;
  slogan: string;
}): Promise<void> {
  
  const doc = await initPDFWithKoreanFont();
  
  // A4 규격: 210mm x 297mm
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2); // 170mm

  // 색상 팔레트 정의
  const colors = {
    primary: [15, 23, 42],     // #0f172a (Deep Slate/Navy)
    accent: [217, 119, 6],      // #d97706 (Dark Amber/Gold)
    accentLight: [251, 191, 36], // #fbbf24 (Amber/Gold Light)
    textDark: [51, 65, 85],     // #334155 (Slate Body)
    textLight: [248, 250, 252], // #f8fafc (Slate White)
    bgLight: [241, 245, 249],   // #f1f5f9 (Light Gray)
    border: [226, 232, 240]     // #e2e8f0 (Border slate)
  };

  // 헬퍼: 텍스트 줄바꿈 및 자동 렌더링
  const writeWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, index: number) => {
      doc.text(line, x, y + (index * lineHeight));
    });
    return y + (lines.length * lineHeight);
  };

  // 헬퍼: 페이지 테두리 데코
  const drawPageFrame = () => {
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setLineWidth(0.5);
    // 이중 얇은 선 테두리
    doc.rect(margin - 5, margin - 5, pageWidth - (margin * 2) + 10, pageHeight - (margin * 2) + 10);
    doc.setLineWidth(0.1);
    doc.rect(margin - 3, margin - 3, pageWidth - (margin * 2) + 6, pageHeight - (margin * 2) + 6);
  };

  // 헬퍼: 헤더/푸터 렌더링 (표지 제외)
  const drawHeaderFooter = (pageNumber: number) => {
    drawPageFrame();
    
    // 헤더
    doc.setFontSize(8);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text('나의 인생 천기누설 리포트 (사주  ·  자미두수  ·  점성술)', margin, margin - 8);
    
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.2);
    doc.line(margin, margin - 6, pageWidth - margin, margin - 6);

    // 푸터
    doc.line(margin, pageHeight - margin + 6, pageWidth - margin, pageHeight - margin + 6);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(creatorInfo.name, margin, pageHeight - margin + 11);
    doc.text(`Page ${pageNumber} / 5`, pageWidth - margin - 15, pageHeight - margin + 11);
  };

  // ==========================================
  // PAGE 1: 표지 (Cover)
  // ==========================================
  drawPageFrame();
  
  // 상단 골드 엠블럼 원
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.5);
  doc.circle(pageWidth / 2, 60, 20);
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.circle(pageWidth / 2, 60, 19.5, 'FD');
  
  // 엠블럼 내 텍스트
  doc.setFontSize(16);
  doc.setTextColor(colors.accentLight[0], colors.accentLight[1], colors.accentLight[2]);
  doc.text('渾天儀', pageWidth / 2, 59, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('DESTINY ANALYSIS REPORT', pageWidth / 2, 65, { align: 'center' });

  // 타이틀
  doc.setFontSize(22);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(`나의 인생 천기누설 리포트 (${result.currentMonth}월호)`, pageWidth / 2, 108, { align: 'center' });
  
  doc.setFontSize(13);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text('동양 명리학  ·  자미두수  ·  서양 점성술 융합 분석', pageWidth / 2, 120, { align: 'center' });

  // 선 데코
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 30, 130, pageWidth / 2 + 30, 130);

  // 대상자 정보 박스
  const infoBoxY = 160;
  doc.setFillColor(colors.bgLight[0], colors.bgLight[1], colors.bgLight[2]);
  doc.rect(margin + 10, infoBoxY, contentWidth - 20, 55, 'F');
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.3);
  doc.rect(margin + 10, infoBoxY, contentWidth - 20, 55, 'D');

  doc.setFontSize(12);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  
  let currentY = infoBoxY + 12;
  doc.text(`분 석 대 상 자 :   ${result.name} 님 (${result.currentMonth}월 운세)`, margin + 25, currentY);
  currentY += 10;
  doc.text(`양 력 생 년 월 일 :   ${result.birthDateStr}`, margin + 25, currentY);
  currentY += 10;
  doc.text(`음 력 생 년 월 일 :   ${result.isLunar ? '음력' : '양력 변환 완료'}`, margin + 25, currentY);
  currentY += 10;
  doc.text(`분 석 기 준 :   ${result.currentYear}년 ${result.currentMonth}월 (${result.currentYearGanInfo}년)`, margin + 25, currentY);

  // 제공자 정보 (하단)
  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(creatorInfo.name, pageWidth / 2, 255, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text(creatorInfo.slogan, pageWidth / 2, 262, { align: 'center' });

  // ==========================================
  // PAGE 2: 사주팔자 편 (Saju) - 일반 사주 및 재물 흐름
  // ==========================================
  doc.addPage();
  drawHeaderFooter(2);

  doc.setFontSize(16);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('01. 명리학(命理學) 사주팔자 분석', margin, 35);
  
  doc.setFontSize(9);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text('태어난 날의 하늘 에너지(일간)와 사주 8자의 관계를 기반으로 타고난 성향을 살핍니다.', margin, 41);

  // 사주 만세력 테이블 그리기
  const tableY = 48;
  const colWidth = 35;
  const colStart = margin + 15;
  const rowHeight = 8;

  // 헤더 그리기
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(colStart, tableY, colWidth * 4, rowHeight, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  const headers = ['시주 (時柱)', '일주 (日柱)', '월주 (月柱)', '년주 (年柱)'];
  headers.forEach((h, i) => {
    doc.text(h, colStart + (i * colWidth) + (colWidth / 2), tableY + 5.5, { align: 'center' });
  });

  // 천간 행
  doc.setFillColor(colors.bgLight[0], colors.bgLight[1], colors.bgLight[2]);
  doc.rect(colStart, tableY + rowHeight, colWidth * 4, rowHeight, 'F');
  doc.rect(colStart, tableY + rowHeight, colWidth * 4, rowHeight, 'D');

  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  const pillars = [result.saju.hourPillar, result.saju.dayPillar, result.saju.monthPillar, result.saju.yearPillar];
  
  pillars.forEach((p, i) => {
    // 천간 글자
    doc.setFontSize(12);
    // 오행 색상 배경 동그라미
    const rgb = p.ganElement.hexColor === '#ef4444' ? [239, 68, 68] :
                p.ganElement.hexColor === '#10b981' ? [16, 185, 129] :
                p.ganElement.hexColor === '#f59e0b' ? [245, 158, 11] :
                p.ganElement.hexColor === '#3b82f6' ? [59, 130, 246] : [200, 200, 200];
    
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    const cx = colStart + (i * colWidth) + (colWidth / 2);
    const cy = tableY + rowHeight + 4;
    doc.circle(cx, cy, 3.5, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.text(`${p.ganKr}`, cx, cy + 1.2, { align: 'center' });
  });

  // 지지 행
  doc.setFillColor(255, 255, 255);
  doc.rect(colStart, tableY + (rowHeight * 2), colWidth * 4, rowHeight, 'F');
  doc.rect(colStart, tableY + (rowHeight * 2), colWidth * 4, rowHeight, 'D');

  pillars.forEach((p, i) => {
    // 지지 글자
    const rgb = p.zhiElement.hexColor === '#ef4444' ? [239, 68, 68] :
                p.zhiElement.hexColor === '#10b981' ? [16, 185, 129] :
                p.zhiElement.hexColor === '#f59e0b' ? [245, 158, 11] :
                p.zhiElement.hexColor === '#3b82f6' ? [59, 130, 246] : [200, 200, 200];
    
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    const cx = colStart + (i * colWidth) + (colWidth / 2);
    const cy = tableY + (rowHeight * 2) + 4;
    doc.circle(cx, cy, 3.5, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.text(`${p.zhiKr}`, cx, cy + 1.2, { align: 'center' });
  });

  // 십신 명칭 행
  doc.setFillColor(colors.bgLight[0], colors.bgLight[1], colors.bgLight[2]);
  doc.rect(colStart, tableY + (rowHeight * 3), colWidth * 4, rowHeight, 'F');
  doc.rect(colStart, tableY + (rowHeight * 3), colWidth * 4, rowHeight, 'D');

  doc.setFontSize(8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  pillars.forEach((p, i) => {
    doc.text(p.tenGod || '', colStart + (i * colWidth) + (colWidth / 2), tableY + (rowHeight * 3) + 5.5, { align: 'center' });
  });

  // 성향 요약
  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('● 타고난 명리적 기질 (일간 성향)', margin, 92);
  
  doc.setFontSize(9.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  let sajuY = writeWrappedText(result.analysis.personality, margin + 4, 99, contentWidth - 8, 5.5);

  // 일반 평생 재물운 해설
  sajuY += 10;
  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('● 타고난 평생의 재물운 및 자산 기질', margin, sajuY);

  doc.setFontSize(9.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  sajuY = writeWrappedText(result.analysis.generalWealthText, margin + 4, sajuY + 7, contentWidth - 8, 5.5);

  // 종합 재물운 지수 게이지바
  sajuY += 10;
  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('● 나의 종합 재물운 지수', margin, sajuY);

  const drawScoreBar = (label: string, score: number, y: number) => {
    doc.setFontSize(9.5);
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    doc.text(label, margin + 4, y + 4.5);

    const barWidth = 100;
    const barX = margin + 35;
    doc.setFillColor(226, 232, 240); // slate-200
    doc.rect(barX, y, barWidth, 6, 'F');

    const filledWidth = (score / 100) * barWidth;
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.rect(barX, y, filledWidth, 6, 'F');

    doc.setFontSize(10);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.text(`${score} 점`, barX + barWidth + 5, y + 5);
  };

  sajuY += 5;
  drawScoreBar('종합 재물운', result.scores.wealthLuck, sajuY);

  // ==========================================
  // PAGE 3: 자미두수 편 (Zi Wei Dou Shu) - 일반 재백궁 재물 분석
  // ==========================================
  doc.addPage();
  drawHeaderFooter(3);

  doc.setFontSize(16);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('02. 자미두수(紫微斗數) 평생 재물운 분석', margin, 35);
  
  doc.setFontSize(9);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text('태어난 음력 월/일/시의 천체 성계를 통해 내 자산의 크기와 금전 취득 기질을 파악합니다.', margin, 41);

  // 재백궁(財帛宮) 하이라이트 박스
  const zwBoxY = 48;
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(margin, zwBoxY, contentWidth, 30, 'F');
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.5);
  doc.rect(margin, zwBoxY, contentWidth, 30, 'D');

  doc.setFontSize(13);
  doc.setTextColor(colors.accentLight[0], colors.accentLight[1], colors.accentLight[2]);
  doc.text(`[ 평생의 재물 흐름을 관장하는 궁: 재백궁 (${result.ziWei.wealthPalace}) ]`, margin + 10, zwBoxY + 11);
  
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`수호성 및 재물 길성:  ${result.ziWei.wealthStars.join('  |  ')}`, margin + 10, zwBoxY + 21);

  // 자미두수 상세 해설
  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('● 재백궁(財帛宮)이 예견하는 자산 증식 명반 해석', margin, zwBoxY + 42);

  doc.setFontSize(9.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  let zwY = writeWrappedText(result.ziWei.wealthDescription, margin + 4, zwBoxY + 49, contentWidth - 8, 6.0);

  const boxStartY = zwY + 12;
  const wealthTips = [
    '자산 상승의 주기성: 자미두수의 유년 재백궁에 화록(화록)이나 록존 등의 대길성이 들어올 때 수입원이 다양해지고 뜻밖의 목돈이 마련됩니다.',
    '지출 방어법: 살성(나쁜 기운의 별)이 재백궁을 칠 때는 큰 모험적인 신규 사업 추진을 지양하고 내실 있는 자산에 고정시키는 것이 돈을 아끼는 비결입니다.',
    '나만의 돈 모으는 습관: 타고난 재백궁 별의 성향에 따라, 귀하는 분산 투자보다 하나의 확실한 유형 자산에 자금을 고정시키는 저축이 가장 적합합니다.'
  ];

  // 박스 높이 동적 계산 (텍스트 길이에 따라 유동적 조절)
  let totalTextHeight = 0;
  wealthTips.forEach((t, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${t}`, contentWidth - 16);
    totalTextHeight += (lines.length * 5.0) + 3;
  });
  const boxHeight = 15 + totalTextHeight;

  // 배경 및 테두리 박스 그리기
  doc.setFillColor(colors.bgLight[0], colors.bgLight[1], colors.bgLight[2]);
  doc.rect(margin, boxStartY, contentWidth, boxHeight, 'F');
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.3);
  doc.rect(margin, boxStartY, contentWidth, boxHeight, 'D');

  doc.setFontSize(10.5);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('★ 자미두수 자산 증식 꿀팁', margin + 8, boxStartY + 9);

  doc.setFontSize(9);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  
  let tipY = boxStartY + 15;
  wealthTips.forEach((t, i) => {
    tipY = writeWrappedText(`${i + 1}. ${t}`, margin + 10, tipY, contentWidth - 16, 5.0) + 3;
  });

  // ==========================================
  // PAGE 4: 서양 점성술 편 (Western Astrology) - 성격 및 라이프 기질
  // ==========================================
  doc.addPage();
  drawHeaderFooter(4);

  doc.setFontSize(16);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('03. 서양 점성술(Astrology) 라이프 기질 분석', margin, 35);
  
  doc.setFontSize(9);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text('나의 태양 별자리 배치를 통해 타고난 행동 양식과 내면의 깊은 심리적 요소를 탐색합니다.', margin, 41);

  // 정보 요약 박스
  const astY = 48;
  doc.setFillColor(colors.bgLight[0], colors.bgLight[1], colors.bgLight[2]);
  doc.rect(margin, astY, contentWidth, 25, 'F');
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.3);
  doc.rect(margin, astY, contentWidth, 25, 'D');

  doc.setFontSize(10.5);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(`나의 태양 별자리:  ${result.western.sunSign}`, margin + 8, astY + 10);
  doc.text(`태양 에너지 상태:  조화롭고 에너제틱함`, margin + 8, astY + 18);

  // 추천 라이프 스타일
  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('● 타고난 태양 별자리의 성격적 특성', margin, astY + 36);

  doc.setFontSize(9.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  let astY2 = writeWrappedText(result.western.sunSignDescription, margin + 4, astY + 43, contentWidth - 8, 6.0);

  // 점성술적 라이프 코칭 상세
  astY2 += 10;
  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('● 나를 성장시키는 라이프 에너지 활성화 방안', margin, astY2);

  doc.setFontSize(9.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  
  let coachY = astY2 + 7;
  const planetTransitDesc = result.currentMonth >= 5 && result.currentMonth <= 7
    ? `태양이 쌍둥이자리와 게자리를 통과하는 ${result.currentMonth}월 천체 주기에는, 내면적 휴식과 감정의 안정을 회복하는 차분한 루틴을 가지는 것이 운을 키우는 지름길입니다.`
    : result.currentMonth >= 8 && result.currentMonth <= 10
    ? `태양이 사자자리와 처녀자리를 지나는 ${result.currentMonth}월 천체 주기에는 결단력과 실행력이 극대화되므로, 계획했던 공부나 목표를 과감하게 추진해 보셔도 좋습니다.`
    : `행성 궤도가 조화롭게 수렴되는 ${result.currentMonth}월 주기에는 차분히 장기적인 인생의 로드맵을 다시 그리고 내실을 다지는 사색의 시간을 가지는 것이 큰 행운을 부릅니다.`;

  const coachTexts = [
    `당신은 ${result.western.sunSign}의 자아를 깨울 때 가장 큰 창의성과 결단력이 뿜어져 나옵니다. 일상에서 타인의 시선에 갇히기보다, 스스로 주도권을 쥐고 추진할 때 행복을 느낍니다.`,
    `[실시간 천체 운세] ${planetTransitDesc}`,
    '지속적인 영감을 얻기 위해, 일상 속에서 본인의 지적 호기심을 충족해 주는 취미나 가벼운 산책, 또는 행운의 아이템을 곁에 두는 라이프 루틴이 매우 추천됩니다.'
  ];
  coachTexts.forEach((ct) => {
    coachY = writeWrappedText(`- ${ct}`, margin + 4, coachY, contentWidth - 8, 5.5) + 3;
  });

  // ----------------------------------------------------
  // [NEW] 4페이지 하단 연애운 데코 박스 렌더링
  // ----------------------------------------------------
  const romanceBoxY = coachY + 5;
  const romanceBoxHeight = 48;
  
  // 연애운 핑크 톤 박스 데코
  doc.setFillColor(254, 242, 242); // #fef2f2 (Rose-50)
  doc.rect(margin, romanceBoxY, contentWidth, romanceBoxHeight, 'F');
  doc.setDrawColor(244, 63, 94); // #f43f5e (Rose-500)
  doc.setLineWidth(0.4);
  doc.rect(margin, romanceBoxY, contentWidth, romanceBoxHeight, 'D');

  // 하이라이트 타이틀
  doc.setFontSize(10.5);
  doc.setTextColor(225, 29, 72); // #e11d48 (Rose-600)
  doc.text('💖 이달의 연애 매력 & 끌리는 이상형 (자미두수 융합)', margin + 6, romanceBoxY + 8);

  // 연애 매력 게이지바
  const rBarWidth = 55;
  const rBarX = margin + 98;
  const rBarY = romanceBoxY + 4.5;
  
  doc.setFontSize(8.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text('연애 매력 지수', margin + 78, rBarY + 3.8);
  
  doc.setFillColor(226, 232, 240); // slate-200
  doc.rect(rBarX, rBarY, rBarWidth, 4, 'F');
  doc.setFillColor(244, 63, 94); // rose-500
  doc.rect(rBarX, rBarY, (result.romance.romanceScore / 100) * rBarWidth, 4, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(244, 63, 94);
  doc.text(`${result.romance.romanceScore}점`, rBarX + rBarWidth + 3, rBarY + 3.8);

  // 세부 내용 텍스트 작성
  doc.setFontSize(9);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  
  let currentRomanceY = romanceBoxY + 16;
  
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('나의 연애 스타일:', margin + 6, currentRomanceY);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  currentRomanceY = writeWrappedText(result.romance.loveStyle, margin + 31, currentRomanceY, contentWidth - 36, 4.8);

  currentRomanceY += 1.5;
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('끌리는 이상형:', margin + 6, currentRomanceY);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  currentRomanceY = writeWrappedText(result.romance.idealPartner, margin + 31, currentRomanceY, contentWidth - 36, 4.8);

  currentRomanceY += 1.5;
  doc.setTextColor(225, 29, 72); // rose-600
  doc.text('행운의 연애 팁:', margin + 6, currentRomanceY);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  writeWrappedText(result.romance.luckyRomanceItem, margin + 31, currentRomanceY, contentWidth - 36, 4.8);

  // ==========================================
  // PAGE 5: 부동산 문서운 & 풍수지리 (Real Estate specialized page)
  // ==========================================
  doc.addPage();
  drawHeaderFooter(5);

  doc.setFontSize(16);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('04. 천기(天氣) 융합 부동산 & 이사 풍수 리포트', margin, 35);
  
  doc.setFontSize(9);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text('사주, 자미두수, 점성술의 천문을 종합하여 나에게 꼭 맞는 부동산 계약운과 명당의 터전을 찾습니다.', margin, 41);

  // A. 2026년 나의 부동산 문서운 (Saju)
  const reY = 48;
  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(`● ${result.currentYear}년 ${result.currentMonth}월 나의 부동산 문서운(매매/계약/청약) 분석`, margin, reY);

  // 문서운 게이지바
  drawScoreBar('부동산 문서운', result.scores.documentLuck, reY + 5);

  doc.setFontSize(9);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  let reY2 = writeWrappedText(result.analysis.documentLuckText, margin + 4, reY + 17, contentWidth - 8, 5.0);

  // B. 자미두수 전택궁 부동산 분석
  reY2 += 6;
  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(`● 전택궁(田宅宮)이 말해주는 나의 부동산 자산 가치 (${result.ziWei.propertyPalace})`, margin, reY2);
  
  doc.setFontSize(9);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  reY2 = writeWrappedText(result.ziWei.propertyDescription, margin + 4, reY2 + 6, contentWidth - 8, 5.0);

  // C. 점성술 4하우스 주거 스타일 & 이사 방위
  reY2 += 6;
  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('● 나에게 행운을 주는 이사 길방 & 풍수 인테리어', margin, reY2);

  doc.setFontSize(9);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text(`- 추천 주거 스타일: ${result.western.homeStyle} (4th House ${result.western.fourthHouseSign})`, margin + 4, reY2 + 6);
  doc.text(`- 행운의 인테리어 색상: ${result.western.interiorColor}`, margin + 4, reY2 + 11);
  
  let fsTipY = reY2 + 16;
  result.western.tips.forEach((tip) => {
    fsTipY = writeWrappedText(`- 풍수 팁: ${tip}`, margin + 4, fsTipY, contentWidth - 8, 5.0) + 1.5;
  });

  // 이사 방위 박스
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.rect(margin, fsTipY, contentWidth / 2 - 2, 16, 'F');
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.rect(margin, fsTipY, contentWidth / 2 - 2, 16, 'D');

  doc.setFontSize(9.5);
  doc.setTextColor(16, 185, 129);
  doc.text('★ 이사 길방(吉方)', margin + 4, fsTipY + 5);
  doc.setFontSize(8.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text(result.fengShui.luckyDirections[0], margin + 4, fsTipY + 11);

  doc.setFillColor(254, 242, 242); // red-50
  doc.rect(margin + contentWidth / 2 + 2, fsTipY, contentWidth / 2 - 2, 16, 'F');
  doc.setDrawColor(239, 68, 68); // red-500
  doc.rect(margin + contentWidth / 2 + 2, fsTipY, contentWidth / 2 - 2, 16, 'D');

  doc.setFontSize(9.5);
  doc.setTextColor(239, 68, 68);
  doc.text('⚠️ 조심할 흉방(凶方)', margin + contentWidth / 2 + 6, fsTipY + 5);
  doc.setFontSize(8.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text(result.fengShui.badDirections[0], margin + contentWidth / 2 + 6, fsTipY + 11);

  // D. 인스타그램 소통 오퍼
  const bottomY = fsTipY + 19;
  doc.setLineWidth(0.2);
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.line(margin, bottomY, pageWidth - margin, bottomY);

  doc.setFontSize(9.5);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(`[ 일상의 행운을 높이는 가이드 ]`, margin, bottomY + 7);

  doc.setFontSize(8.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const solutionText = `귀하의 오행에 어울리는 풍수 조율과 행운의 이사방향(${result.fengShui.luckyDirections[0].split(' ')[0]})은 일상의 소소한 습관에서 시작됩니다. 이 보고서가 유용한 나침반이 되기를 바라며, 더 다양한 행운의 콘텐츠와 소통은 인스타그램 채널에서 이어가실 수 있습니다.`;
  
  // 겹침을 방지하기 위해 텍스트 작성 후 반환된 Y 좌표를 사용해 버튼을 그립니다.
  let solY = writeWrappedText(solutionText, margin, bottomY + 12, contentWidth, 4.5);
  solY += 6; // 스페이싱 추가

  // 인스타그램 바로가기 링크 버튼
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(margin + 20, solY, contentWidth - 40, 10, 'F');
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.rect(margin + 20, solY, contentWidth - 40, 10, 'D');

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('👉 인스타그램에서 더 많은 행운 팁 보기 👈', pageWidth / 2, solY + 6.5, { align: 'center' });
  doc.link(margin + 20, solY, contentWidth - 40, 10, { url: creatorInfo.instagramUrl });

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`인스타그램: ${creatorInfo.instagramId} | ${creatorInfo.slogan}`, pageWidth / 2, solY + 16, { align: 'center' });

  // PDF 저장
  doc.save(`${result.name}_부동산_사주_분석_보고서.pdf`);
}
