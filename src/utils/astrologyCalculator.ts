import { Solar, Lunar } from 'lunar-javascript';

// 오행 정보 정의
export interface ElementInfo {
  name: string; // 목, 화, 토, 금, 수
  hanja: string; // 木, 火, 土, 金, 水
  color: string; // 청색, 적색, 황색, 백색, 흑색
  hexColor: string; // CSS 색상값
}

export interface Pillar {
  gan: string; // 천간 한자 (예: 甲)
  zhi: string; // 지지 한자 (예: 子)
  ganKr: string; // 천간 한글 (예: 갑)
  zhiKr: string; // 지지 한글 (예: 자)
  ganElement: ElementInfo;
  zhiElement: ElementInfo;
  tenGod?: string; // 십신 (예: 정인)
}

export interface DestinyResult {
  name: string;
  birthDateStr: string;
  isLunar: boolean;
  currentYear: number;
  currentMonth: number;
  currentYearGanInfo: string; // 예: "丙午"
  currentMonthGanInfo: string; // 예: "甲午"
  saju: {
    yearPillar: Pillar;
    monthPillar: Pillar;
    dayPillar: Pillar;
    hourPillar: Pillar;
    dayMaster: string; // 일간 한글 (예: 갑)
    dayMasterHanja: string; // 일간 한자 (예: 甲)
    dayMasterElement: ElementInfo;
    animal: string; // 띠 (예: 쥐띠)
  };
  scores: {
    documentLuck: number; // 부동산 문서운 (0-100)
    wealthLuck: number;   // 종합 재물운 (0-100)
  };
  analysis: {
    personality: string;
    generalWealthText: string; // 일반 재물운 (Page 2)
    documentLuckText: string;  // 부동산 문서운 (Page 5)
  };
  ziWei: {
    wealthPalace: string; // 일반 재백궁 위치 (예: 오궁)
    wealthStars: string[]; // 재백궁 주요 별들
    wealthDescription: string; // 일반 재물 기질 설명 (Page 3)
    propertyPalace: string; // 부동산 전택궁 위치 (예: 인궁)
    propertyStars: string[]; // 전택궁 주요 별들
    propertyDescription: string; // 부동산 평생운 설명 (Page 5)
  };
  western: {
    sunSign: string; // 태양 별자리 (Page 4)
    sunSignDescription: string; // 별자리 일반 성격 해설 (Page 4)
    fourthHouseSign: string; // 4하우스 별자리 (Page 5)
    homeStyle: string; // 추천 주거 스타일 (Page 5)
    interiorColor: string; // 행운의 인테리어 색상 (Page 5)
    tips: string[]; // 인테리어 팁 (Page 5)
  };
  fengShui: {
    luckyDirections: string[]; // 대박 방향 (Page 5)
    badDirections: string[];   // 피해야 할 방향 (Page 5)
  };
  romance: {
    loveStyle: string; // 나의 연애 스타일 & 플러팅 기질
    idealPartner: string; // 내가 끌리는 이상형 스타일
    luckyRomanceItem: string; // 연애운을 높여주는 행운의 아이템/키워드
    romanceScore: number; // 연애운 지수 (0-100)
  };
}

// 오행 맵핑
const ELEMENTS: Record<string, ElementInfo> = {
  '木': { name: '목', hanja: '木', color: '청색(초록색)', hexColor: '#10b981' },
  '火': { name: '화', hanja: '火', color: '적색(빨간색)', hexColor: '#ef4444' },
  '土': { name: '토', hanja: '土', color: '황색(노란색)', hexColor: '#f59e0b' },
  '金': { name: '금', hanja: '金', color: '백색(흰색/실버)', hexColor: '#94a3b8' },
  '水': { name: '수', hanja: '水', color: '흑색(검은색/블루)', hexColor: '#3b82f6' }
};

// 천간 오행 및 음양
const STEM_INFO: Record<string, { kr: string; element: string; isYang: boolean; desc: string }> = {
  '甲': { kr: '갑', element: '木', isYang: true, desc: '우뚝 솟은 큰 나무처럼 진취적이고 곧으며 타인에게 굽히지 않는 기질' },
  '乙': { kr: '을', element: '木', isYang: false, desc: '바람에 휘어지나 꺾이지 않는 화초처럼 유연하고 끈질기며 친화력이 강한 기질' },
  '丙': { kr: '병', element: '火', isYang: true, desc: '하늘에 빛나는 태양처럼 활기차고 정열적이며 매사에 당차고 밝은 기질' },
  '丁': { kr: '정', element: '火', isYang: false, desc: '밤하늘의 등불처럼 섬세하고 예의가 바르며 남을 조용히 돕고 헌신하는 기질' },
  '戊': { kr: '무', element: '土', isYang: true, desc: '넓고 신중한 대지나 높은 산처럼 믿음직스럽고 포용력이 넘치는 기질' },
  '己': { kr: '기', element: '土', isYang: false, desc: '밭이나 아담한 정원처럼 세심하고 다정하며 무엇이든 잘 가꾸어 내는 기질' },
  '庚': { kr: '경', element: '金', isYang: true, desc: '단단한 원석이나 큰 칼처럼 굳세고 정의로우며 강직하고 추진력이 돋보이는 기질' },
  '辛': { kr: '신', element: '金', isYang: false, desc: '정교하게 세공된 다이아몬드처럼 품격 있고 깔끔하며 예리한 미적 감각이 있는 기질' },
  '壬': { kr: '임', element: '水', isYang: true, desc: '도도하게 흐르는 거대한 강물처럼 지혜롭고 호탕하며 다양한 사람을 포용하는 기질' },
  '癸': { kr: '계', element: '水', isYang: false, desc: '하늘에서 내리는 비나 시냇물처럼 총명하고 상황 대처력이 뛰어나며 지혜가 가득한 기질' }
};

// 지지 오행 및 음양 (본기 기준)
const BRANCH_INFO: Record<string, { kr: string; element: string; isYang: boolean; animal: string }> = {
  '子': { kr: '자', element: '水', isYang: false, animal: '쥐' },
  '丑': { kr: '축', element: '土', isYang: false, animal: '소' },
  '寅': { kr: '인', element: '木', isYang: true, animal: '호랑이' },
  '卯': { kr: '묘', element: '木', isYang: false, animal: '토끼' },
  '辰': { kr: '진', element: '土', isYang: true, animal: '용' },
  '巳': { kr: '사', element: '火', isYang: true, animal: '뱀' },
  '午': { kr: '오', element: '火', isYang: false, animal: '말' },
  '未': { kr: '미', element: '土', isYang: false, animal: '양' },
  '申': { kr: '신', element: '金', isYang: true, animal: '원숭이' },
  '酉': { kr: '유', element: '金', isYang: false, animal: '닭' },
  '戌': { kr: '술', element: '土', isYang: true, animal: '개' },
  '亥': { kr: '해', element: '水', isYang: true, animal: '돼지' }
};

// 십신 계산 함수
function getTenGod(dayMaster: string, targetStem: string): string {
  const dm = STEM_INFO[dayMaster];
  const target = STEM_INFO[targetStem] || { element: BRANCH_INFO[targetStem]?.element, isYang: BRANCH_INFO[targetStem]?.isYang };

  if (!dm || !target) return '';

  const dmEl = dm.element;
  const tgEl = target.element;
  const sameSign = dm.isYang === target.isYang;

  const elementsOrder = ['木', '火', '土', '金', '水'];
  const dmIdx = elementsOrder.indexOf(dmEl);
  const tgIdx = elementsOrder.indexOf(tgEl);

  const diff = (tgIdx - dmIdx + 5) % 5;

  if (diff === 0) {
    return sameSign ? '비견' : '겁재';
  } else if (diff === 1) {
    return sameSign ? '식신' : '상관';
  } else if (diff === 2) {
    return sameSign ? '편재' : '정재';
  } else if (diff === 3) {
    return sameSign ? '편관' : '정관';
  } else {
    return sameSign ? '편인' : '정인';
  }
}

function getZodiacAnimal(yearZhi: string): string {
  return (BRANCH_INFO[yearZhi]?.animal || '') + '띠';
}

function getZodiacSign(month: number, day: number): string {
  const dates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 23, 22, 22];
  const signs = [
    '염소자리', '물병자리', '물고기자리', '양자리', '황소자리', '쌍둥이자리',
    '게자리', '사자자리', '처녀자리', '천칭자리', '전갈자리', '사수자리'
  ];
  return month === 12 && day >= 22 ? signs[0] : signs[day >= dates[month - 1] ? month : month - 1];
}

// 별자리별 일반적 성격 해설
const ZODIAC_GENERAL_DESC: Record<string, string> = {
  '염소자리': '책임감이 강하고 목표가 뚜렷하며, 계획을 차근차근 밟아나가는 실천력이 강합니다. 다소 보수적이나 내실을 기하는 성향입니다.',
  '물병자리': '독창적이고 객관적인 사고를 즐기며, 개성을 존중하고 새로운 아이디어에 열려 있습니다. 구속받는 것을 싫어하는 자유로운 영혼입니다.',
  '물고기자리': '감수성이 풍부하고 타인에 대한 공감 능력이 뛰어납니다. 직관력이 좋으며, 때로는 낭만적이고 예술적인 영역에서 두각을 나타냅니다.',
  '양자리': '자신감이 넘치고 개척 정신이 뛰어나며, 새로운 도전에 적극적입니다. 에너지가 앞서는 편이라 승부욕이 강한 면모를 보입니다.',
  '황소자리': '우직하고 성실하며 물질적인 안정과 감각적인 즐거움을 중시합니다. 소유욕이 다소 강하나 신용을 매우 귀하게 여깁니다.',
  '쌍둥이자리': '호기심이 넘치고 임기응변에 강하며 정보 교류와 소통을 즐깁니다. 트렌드 변화를 가장 빠르게 흡수하는 재치꾼 스타일입니다.',
  '게자리': '가정과 사람 관계의 따뜻함을 가장 소중히 여기며, 보호 본능과 모성애가 강합니다. 직관력이 좋고 정서적 만족을 깊이 추구합니다.',
  '사자자리': '화려하고 당당하며 리더십이 뛰어나 많은 사람들의 주목을 받는 것을 즐깁니다. 의리가 있고 자기 가치를 표현하는 에너지가 큽니다.',
  '처녀자리': '분석적이고 정교하며 꼼꼼하게 정리 정돈하는 능력이 뛰어납니다. 세부적인 사항을 놓치지 않으며 실수를 극도로 피하려 합니다.',
  '천칭자리': '조화와 균형, 예술적인 매력을 사랑하며 대인 관계에서 평화를 최우선으로 칩니다. 우아하고 매너가 좋은 평화주의자입니다.',
  '전갈자리': '집중력과 통찰력이 매우 깊어 사물의 본질을 파헤치는 능력이 탁월합니다. 감정이 뜨거우나 겉으로는 신비로움을 유지합니다.',
  '사수자리': '낙천적이고 모험을 좋아하며 철학적인 성격입니다. 얽매이는 것을 싫어하고 미지의 세계를 탐험하려는 향학열이 강합니다.'
};

function getBranchMainStem(zhi: string): string {
  const mapping: Record<string, string> = {
    '子': '癸', '丑': '己', '寅': '甲', '卯': '乙',
    '辰': '戊', '巳': '丙', '午': '丁', '未': '己',
    '申': '庚', '酉': '辛', '戌': '戊', '亥': '壬'
  };
  return mapping[zhi] || '己';
}

export function calculateDestiny(
  name: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  isLunar: boolean = false,
  _isLeap: boolean = false
): DestinyResult {
  let solar: any;
  let lunar: any;

  if (isLunar) {
    lunar = Lunar.fromYmd(year, month, day);
    solar = lunar.getSolar();
  } else {
    solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
    lunar = solar.getLunar();
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const curSolar = Solar.fromDate(now);
  const curLunar = curSolar.getLunar();
  const currentYearGan = curLunar.getYearGan();
  const currentYearZhi = curLunar.getYearZhi();
  const currentMonthGan = curLunar.getMonthGan();
  const currentMonthZhi = curLunar.getMonthZhi();

  const eightChar = lunar.getEightChar();
  
  const yGan = eightChar.getYearGan();
  const yZhi = eightChar.getYearZhi();
  const mGan = eightChar.getMonthGan();
  const mZhi = eightChar.getMonthZhi();
  const dGan = eightChar.getDayGan();
  const dZhi = eightChar.getDayZhi();
  
  const hGan = eightChar.getTimeGan();
  const hZhi = eightChar.getTimeZhi();

  const dayMaster = dGan; 
  const dayMasterHanja = dayMaster;
  const dayMasterKr = STEM_INFO[dayMaster]?.kr || '';

  const makePillar = (gan: string, zhi: string): Pillar => {
    const ganEl = ELEMENTS[STEM_INFO[gan]?.element || '土'];
    const zhiEl = ELEMENTS[BRANCH_INFO[zhi]?.element || '土'];
    return {
      gan,
      zhi,
      ganKr: STEM_INFO[gan]?.kr || '',
      zhiKr: BRANCH_INFO[zhi]?.kr || '',
      ganElement: ganEl,
      zhiElement: zhiEl,
      tenGod: gan !== dayMaster ? getTenGod(dayMaster, gan) : '일주'
    };
  };

  const yearPillar = makePillar(yGan, yZhi);
  const monthPillar = makePillar(mGan, mZhi);
  const dayPillar = makePillar(dGan, dZhi);
  const hourPillar = makePillar(hGan, hZhi);

  yearPillar.tenGod = getTenGod(dayMaster, yGan);
  monthPillar.tenGod = getTenGod(dayMaster, mGan);
  dayPillar.tenGod = '본인';
  hourPillar.tenGod = getTenGod(dayMaster, hGan);

  const elementsCount = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const allElements = [
    yearPillar.ganElement.name, yearPillar.zhiElement.name,
    monthPillar.ganElement.name, monthPillar.zhiElement.name,
    dayPillar.ganElement.name, dayPillar.zhiElement.name,
    hourPillar.ganElement.name, hourPillar.zhiElement.name
  ];
  allElements.forEach(el => {
    if (el === '목') elementsCount.목++;
    if (el === '화') elementsCount.화++;
    if (el === '토') elementsCount.토++;
    if (el === '금') elementsCount.금++;
    if (el === '수') elementsCount.수++;
  });

  let strongestEl = '토';
  let maxCount = 0;
  Object.entries(elementsCount).forEach(([el, count]) => {
    if (count > maxCount) {
      maxCount = count;
      strongestEl = el;
    }
  });

  const elementAdvice = strongestEl === '목' ? '🌲 나무(木)의 강인한 성장과 도약의 기운이 활발하니 생각한 바를 즉시 실천하기에 길합니다.' :
                        strongestEl === '화' ? '🔥 불(火)의 정열과 추진력이 넘치니 모임이나 네트워크에서 주도권을 잡기 수월한 때입니다.' :
                        strongestEl === '토' ? '⛰️ 흙(土)의 단단한 중심 기운과 신용이 가득하니 신뢰할 만한 약속이나 장기 계획을 짜기에 길합니다.' :
                        strongestEl === '금' ? '💎 금(金)의 예리하고 결단력 있는 기운이 강하니 군더더기를 쳐내고 핵심 판단에 올인하기 유리합니다.' :
                        '💧 물(水)의 지혜와 융통성이 무궁무진하니 유연한 상황 대처력과 아이디어로 난관을 극복하기에 좋습니다.';

  const currentYearTenGod = getTenGod(dayMaster, currentYearGan);
  
  let documentLuckScore = 70;
  let wealthLuckScore = 70;

  if (currentYearTenGod === '정인' || currentYearTenGod === '편인') {
    documentLuckScore = 90;
  } else if (currentYearTenGod === '정관' || currentYearTenGod === '편관') {
    documentLuckScore = 80;
  } else if (currentYearTenGod === '정재' || currentYearTenGod === '편재') {
    documentLuckScore = 75;
    wealthLuckScore = 88;
  } else if (currentYearTenGod === '겁재') {
    documentLuckScore = 55;
    wealthLuckScore = 50;
  } else if (currentYearTenGod === '식신' || currentYearTenGod === '상관') {
    documentLuckScore = 72;
    wealthLuckScore = 82;
  }

  let inSeongCount = 0;
  let jaeSeongCount = 0;
  [yGan, mGan, hGan, getBranchMainStem(yZhi), getBranchMainStem(mZhi), getBranchMainStem(dZhi), getBranchMainStem(hZhi)].forEach(stem => {
    const god = getTenGod(dayMaster, stem);
    if (god === '정인' || god === '편인') inSeongCount++;
    if (god === '정재' || god === '편재') jaeSeongCount++;
  });

  const hashShift = ((day + hour) % 7) - 3; 

  documentLuckScore += (inSeongCount * 3) + hashShift;
  wealthLuckScore += (jaeSeongCount * 4) + hashShift;

  documentLuckScore = Math.max(10, Math.min(100, documentLuckScore));
  wealthLuckScore = Math.max(10, Math.min(100, wealthLuckScore));

  // 12지 지지 인덱스 구하는 헬퍼 함수
  const getHourZhiIdx = (h: number): number => {
    if (h >= 23 || h < 1) return 0; // 자
    if (h >= 1 && h < 3) return 1;  // 축
    if (h >= 3 && h < 5) return 2;  // 인
    if (h >= 5 && h < 7) return 3;  // 묘
    if (h >= 7 && h < 9) return 4;  // 진
    if (h >= 9 && h < 11) return 5; // 사
    if (h >= 11 && h < 13) return 6; // 오
    if (h >= 13 && h < 15) return 7; // 미
    if (h >= 15 && h < 17) return 8; // 신
    if (h >= 17 && h < 19) return 9; // 유
    if (h >= 19 && h < 21) return 10; // 술
    return 11; // 해
  };

  const hourIdx = getHourZhiIdx(hour);
  const dayZhiTenGod = getTenGod(dayMaster, getBranchMainStem(dZhi));
  const dayZhiAnimal = BRANCH_INFO[dZhi]?.animal || '';
  
  let iljuRelationDesc = '';
  if (dayZhiTenGod === '비견' || dayZhiTenGod === '겁재') {
    iljuRelationDesc = `태어난 날의 지지에 나와 같은 오행의 힘(${dayZhiAnimal})을 깔고 있어, 주관이 뚜렷하고 내면적 자립심과 뚝심이 매우 강한 편입니다.`;
  } else if (dayZhiTenGod === '식신' || dayZhiTenGod === '상관') {
    iljuRelationDesc = `태어난 날의 지지에 나의 기운을 표출하는 성향(${dayZhiAnimal})을 품어, 표현력이 뛰어나고 다재다능하며 타인에게 베풀고 교류하는 재주가 탁월합니다.`;
  } else if (dayZhiTenGod === '편재' || dayZhiTenGod === '정재') {
    iljuRelationDesc = `태어난 날의 지지에 다스려야 할 재물 기운(${dayZhiAnimal})을 놓아, 현실적인 이해타산과 목표 지향적 성취욕이 뛰어나고 꼼꼼하게 결과물을 완성해내는 실행력이 강합니다.`;
  } else if (dayZhiTenGod === '편관' || dayZhiTenGod === '정관') {
    iljuRelationDesc = `태어난 날의 지지에 스스로를 절제하는 통제 기운(${dayZhiAnimal})이 자리 잡고 있어, 책임감이 강하고 규율을 잘 지키며 조직 내에서 흐트러짐 없는 리더십을 발휘하려 합니다.`;
  } else {
    iljuRelationDesc = `태어난 날의 지지에 나를 지지하고 돋우는 인성 기운(${dayZhiAnimal})이 들어 있어, 배움에 대한 열망이 크고 직관이 뛰어나며 타인의 원조와 지혜를 흡수하는 능력이 뛰어납니다.`;
  }

  const dmInfo = STEM_INFO[dayMaster];
  const personality = `${name}님은 사주 상 태어난 날의 하늘 기운인 일간이 '${dmInfo.kr}(${dayMaster})'에 해당하며, 이는 '${dmInfo.desc}'을(를) 의미합니다. ${iljuRelationDesc} 또한, 타고난 에너지 중 '${strongestEl}'의 기운이 가장 우세하게 조율되어 있어, ${elementAdvice}`;

  // 사주 일반 재물운 (generalWealthText) 조합형 고도화
  let wealthBase = '';
  if (wealthLuckScore >= 88) {
    wealthBase = `현재 ${currentYear}년 ${currentMonth}월 흐름상 타고난 재물 그릇이 매우 크고 뚜렷하게 발현됩니다. 강력한 주도권과 자수성가의 에너지를 품고 있어, 목표를 세우면 끝까지 자산을 일구어 내는 저력이 돋보입니다.`;
  } else if (wealthLuckScore >= 72) {
    wealthBase = `현재 ${currentYear}년 ${currentMonth}월 흐름상 알뜰하게 자산을 축적하고 안전지대를 구축하는 능력이 돋보이는 시기입니다. 계획성 있게 돈의 흐름을 통제하고 신용을 쌓아 올리는 견실한 재물 축적 능력이 매우 우수합니다.`;
  } else {
    wealthBase = `현재 ${currentYear}년 ${currentMonth}월 흐름상 재물 유동성에 기복이 따를 수 있는 역동적인 자산 국면입니다. 무리한 지출이나 충동적 고위험 투자를 강하게 경계하고, 시스템적으로 돈을 묶어두는 방어적 자산 수호 전략이 우선되어야 합니다.`;
  }

  let wealthElementTip = '';
  if (dayPillar.ganElement.name === '목') {
    wealthElementTip = '나무(木)의 성장 에너지처럼 초기 기획 단계의 유망 자산에 장기 투자하여 가치를 키워가는 방식이 체질에 맞습니다.';
  } else if (dayPillar.ganElement.name === '화') {
    wealthElementTip = '불(火)의 활발한 기운을 살려 트렌디한 시장 환경이나 유동성이 빠른 핵심지 자산을 신속하게 선점하는 기민함이 유리합니다.';
  } else if (dayPillar.ganElement.name === '토') {
    wealthElementTip = '흙(土)의 묵직한 신용처럼 변동성이 극히 적은 실물 부동산이나 굳건한 우량 자산에 락업(Lock-up)하여 보수적으로 묻어둘 때 재물이 불어납니다.';
  } else if (dayPillar.ganElement.name === '금') {
    wealthElementTip = '쇠(金)의 칼날 같은 결단력처럼 불필요한 지출과 부채를 과감히 정리하고 확실한 수익 모델에 선택과 집중을 하는 포트폴리오가 최선입니다.';
  } else {
    wealthElementTip = '물(水)의 지혜와 융통성처럼 현금 유동성을 원활하게 유지하며 여러 유망 분야에 자금을 골고루 배분하는 분산 재테크가 재물운을 극대화합니다.';
  }

  let wealthBehaviorTip = '';
  if (jaeSeongCount >= 2) {
    wealthBehaviorTip = '타고난 재물 감각(財星)이 강하므로, 본인의 주관적인 직감을 전적으로 신뢰하기보다 객관적인 시장 수치와 데이터 분석을 더하여 정밀하게 등기칠 때 큰 부를 움켜쥡니다.';
  } else if (inSeongCount >= 2) {
    wealthBehaviorTip = '문서와 자격(印星)의 힘이 강하므로, 당장 눈앞의 현금 회수보다 훗날 큰 프리미엄이 붙을 등기 문서, 토지, 혹은 계약 권리 관계를 먼저 선점하는 공부 중심의 투자가 길합니다.';
  } else if (allElements.filter(el => el === dayPillar.ganElement.name).length >= 3) {
    wealthBehaviorTip = '주체성과 독립심(比劫)이 강해 남의 말에 쉽게 휘둘리지 않지만, 동업이나 보증, 과도한 지인 추천은 피하고 오직 본인의 철저한 서류 검증하에 단독 명의로 자산을 굴리는 것이 안전합니다.';
  } else {
    wealthBehaviorTip = '상황 대처 및 기획력(食傷)이 우수하므로 신생 트렌드나 이색적인 투자처에 관심이 가더라도, 기초 자산의 안정성을 먼저 검증한 뒤 여유 자금 한도 내에서 한 단계씩 나아가시기 바랍니다.';
  }

  const generalWealthText = `${wealthBase} 특히 귀하는 ${wealthElementTip} 아울러 ${wealthBehaviorTip}`;

  let documentLuckText = '';
  if (documentLuckScore >= 88) {
    documentLuckText = `현재 ${currentYear}년 ${currentMonth}월은 일생의 강력한 문서 취득 및 권리운이 실시간으로 활성화되는 시기입니다. 계약 체결, 새로운 자격증 획득, 당첨 등 서류에 내 도장을 찍을 일이 있다면 주체적으로 실행하기에 가장 좋은 타이밍입니다. 막혔던 권리 관계도 술술 풀려나갈 우호적인 천문이 열렸습니다.`;
  } else if (documentLuckScore >= 78) {
    documentLuckText = `현재 ${currentYear}년 ${currentMonth}월의 서류 계약 및 약속운은 우수하고 평온합니다. 법적인 승인이나 대출 심사, 계약서 조율 등 관공서나 제도적 혜택이 긍정적으로 작용하는 흐름입니다. 무리한 모험만 피한다면 실속 있는 계약 체결에 아주 안정적인 흐름을 가져갈 수 있습니다.`;
  } else if (documentLuckScore >= 62) {
    documentLuckText = `현재 ${currentYear}년 ${currentMonth}월 기준 문서 및 계약운이 잔잔하고 평이한 상태입니다. 당장 서둘러 중요한 결정을 내리기보다는 관련 법률 조항이나 서류 특약 사항을 전문가의 검토를 거쳐 한 번 더 꼼꼼히 조율할 때입니다. 차분히 대비하는 것이 실수를 피하는 지름길입니다.`;
  } else {
    documentLuckText = `현재 ${currentYear}년 ${currentMonth}월은 문서운이 불안정하여 각종 계약이나 서류 날인 시 각별한 주의가 필요합니다. 겉만 화려한 조건이나 타인의 유혹에 휩쓸려 섣불리 서명할 경우 자금이 오랜 기간 묶이거나 손실을 볼 수 있으니, 신뢰할 만한 업계 전문가와 함께 권리분석을 철저히 마친 뒤 날인하시기 바랍니다.`;
  }

  const palaceZhis = ['자궁(子宮)', '축궁(丑宮)', '인궁(寅宮)', '묘궁(묘宮)', '진궁(辰宮)', '사궁(巳宮)', '오궁(午宮)', '미궁(未宮)', '신궁(申宮)', '유궁(酉宮)', '술궁(戌宮)', '해궁(亥宮)'];
  
  // 자미두수 명궁Idx: (음력월 - 1 - 시지Idx + 12) % 12
  const lifePalaceIdx = (lunar.getMonth() - 1 - hourIdx + 12) % 12;
  const wealthPalaceIdx = (lifePalaceIdx - 4 + 12) % 12;
  const wealthPalace = palaceZhis[wealthPalaceIdx];
  const propertyPalaceIdx = (lifePalaceIdx - 9 + 12) % 12;
  const propertyPalace = palaceZhis[propertyPalaceIdx];

  const wealthStarsMap: Record<string, string[]> = {
    '甲': ['무곡(武曲) - 직접적 현금별', '천상(天相) - 신용과 인장'],
    '乙': ['천기(天機) - 아이디어 재물성', '거문(巨門) - 구설 및 소통 재물성'],
    '丙': ['천부(天府) - 황실의 곳간별', '록존(祿存) - 자산 보존성'],
    '丁': ['태음(太陰) - 누적되는 저축별', '천동(天동) - 유희와 보상'],
    '戊': ['태양(太陽) - 베풀어서 커지는 재물', '태음(太陰) - 계획적 재테크'],
    '己': ['무곡(武曲) - 정교한 자금 회수', '천부(天府) - 상가 및 대형 자산'],
    '庚': ['천상(天相) - 대행 및 위탁 소득', '록존(祿存) - 가업 계승성'],
    '辛': ['자미(紫微) - 고귀한 재력 성향', '천부(天府) - 전통 자산 축적'],
    '壬': ['천기(天機) - 빠른 회전율 재테크', '태음(太陰) - 부동산 임대업'],
    '癸': ['거문(巨門) - 라이선스 계약 소득', '천동(天同) - 소액 투자 지향']
  };

  const propertyStarsMap: Record<string, string[]> = {
    '甲': ['태음(太陰) - 대지 소유의 별', '록존(祿存) - 부동 자산 수호성'],
    '乙': ['태양(太陽) - 남향 및 밝은 집', '천동(天同) - 인테리어가 예쁜 집'],
    '丙': ['자미(紫微) - 중심지 대형 건물', '천부(天府) - 곳간 창고'],
    '丁': ['천량(天梁) - 부모 상속성', '태음(太陰) - 호수 근처 주거'],
    '戊': ['무곡(武曲) - 고가 부동산 취득', '천상(天相) - 신도시 아파트'],
    '己': ['천부(天府) - 거대 빌딩 소유권', '록존(祿存) - 안전한 등기'],
    '庚': ['태음(太陰) - 여성적 편안함', '거문(巨門) - 주변 교통 활발'],
    '辛': ['자미(紫微) - 랜드마크 펜트하우스', '천량(天梁) - 튼튼한 건축물'],
    '壬': ['무곡(武曲) - 상업용 부동산', '좌보(Left) - 귀인의 알짜 추천'],
    '癸': ['태음(太陰) - 조망권 우수 부동산', '천동(天동) - 안락한 패밀리 아파트']
  };

  // 날짜에 따른 자미두수 보좌성 배치
  const lunarDay = lunar.getDay();
  const helperStar = lunarDay % 4 === 0 ? '천괴(天魁) - 귀인의 발탁' :
                     lunarDay % 4 === 1 ? '천월(天鉞) - 간접적 도움' :
                     lunarDay % 4 === 2 ? '좌보(左輔) - 주위의 원조' :
                     '우필(Right) - 보이지 않는 지원';

  const wealthStars = [
    ...(wealthStarsMap[dayMaster] || ['천부(天府)']),
    helperStar
  ];

  // 년간에 따른 록존 위치
  const lokJonPalace = yGan === '甲' ? '인궁' :
                       yGan === '乙' ? '묘궁' :
                       (yGan === '丙' || yGan === '戊') ? '사궁' :
                       (yGan === '丁' || yGan === '己') ? '오궁' :
                       yGan === '庚' ? '신궁' :
                       yGan === '辛' ? '유궁' :
                       yGan === '壬' ? '해궁' : '자궁';

  if (wealthPalace.includes(lokJonPalace)) {
    wealthStars.push('록존(祿存) - 하늘이 내린 곳간');
  }

  const propertyHelperStar = (lunarDay + hourIdx) % 3 === 0 ? '천마(天馬) - 빠른 부동산 순환' :
                             (lunarDay + hourIdx) % 3 === 1 ? '삼태(三台) - 주거 품격 향상' :
                             '팔좌(八座) - 안정적 정주 환경';

  const propertyStars = [
    ...(propertyStarsMap[dayMaster] || ['자미(紫微)']),
    propertyHelperStar
  ];

  if (propertyPalace.includes(lokJonPalace)) {
    propertyStars.push('록존(祿存) - 자산 대물림성');
  }

  let starDetail = '';
  if (wealthStars.some(s => s.includes('무곡')) && wealthStars.some(s => s.includes('록존'))) {
    starDetail = '귀하는 평생에 거쳐 현금을 축적하고 강력한 자산 방어벽을 구축하는 대형 금전운을 타고났습니다. 스스로 자금을 융통하는 감각이 비상하며, 한번 곳간에 들어온 자금은 굳게 걸어 잠그는 힘이 탁월합니다.';
  } else if (wealthStars.some(s => s.includes('무곡')) || wealthStars.some(s => s.includes('록존'))) {
    starDetail = '귀하는 자산의 수호 능력이 탄탄하며, 직접 돈을 굴리고 회수하는 현실적인 비즈니스 기질이 돋보입니다. 단기 투기보다는 가치가 확실한 실물 자산에 자금을 묶어둘 때 성공할 확률이 비약적으로 커집니다.';
  } else if (wealthStars.some(s => s.includes('자미')) || wealthStars.some(s => s.includes('천부'))) {
    starDetail = '귀하는 마치 국가나 가문의 창고를 지키는 관리자처럼 묵직하고 거대한 자산을 품는 성향입니다. 단돈 몇 푼의 차익을 노리기보다 장기적 관점에서 랜드마크나 핵심 자산을 선점할 때 재력가로 도약합니다.';
  } else if (wealthStars.some(s => s.includes('태음'))) {
    starDetail = '귀하는 밤하늘에 서서히 차오르는 달처럼 자산을 꾸준히 적립하고 모아가는 임대업/부동산 저축형 성향입니다. 계획성 없는 충동 투자를 피하고, 이자가 복리로 붙거나 월세가 나오는 월류형 자산 시스템을 구축하기에 안성맞춤입니다.';
  } else if (wealthStars.some(s => s.includes('천기')) || wealthStars.some(s => s.includes('거문'))) {
    starDetail = '귀하는 명석한 두뇌와 뛰어난 소통력, 라이선스나 특허 등 무형의 아이디어를 금전으로 환산해 내는 기획형 재물운을 지닙니다. 트렌드를 한발 앞서 분석하고 틈새시장을 날카롭게 파헤칠 때 의외의 큰 횡재를 맛보게 됩니다.';
  } else if (wealthStars.some(s => s.includes('천동')) || wealthStars.some(s => s.includes('태양'))) {
    starDetail = '귀하는 에너지를 널리 전파하거나 대중과 교류하는 과정에서 재물이 확장되는 확산형 성향입니다. 유희와 즐거움을 주는 콘텐츠나 서비스, 혹은 주변 사람들과의 네트워크 속에서 행운의 기회를 자주 마주하게 됩니다.';
  } else if (wealthStars.some(s => s.includes('천상'))) {
    starDetail = '귀하는 신용과 평판, 계약을 조율하고 다리를 놓는 중개 능력이 뛰어난 전문 자산가 기질입니다. 스스로의 명예를 소중히 하고, 정직하고 정확한 법적/계약적 장치를 활용할 때 재물이 막힘없이 흘러 들어옵니다.';
  } else {
    starDetail = '귀하는 독자적인 투자보다 주위의 실력 있는 파트너나 귀인의 권유, 전문가의 협업을 통해 돈의 길목을 안전하게 안내받는 협업형 재물운을 지닙니다. 인적 네트워킹과 두터운 신뢰 구축이 평생의 가장 큰 무기입니다.';
  }

  let palaceDetail = '';
  if (['자궁(子宮)', '오궁(午宮)', '묘궁(묘宮)', '유궁(酉宮)'].includes(wealthPalace)) {
    palaceDetail = '특히 재물궁이 트렌디하고 주목을 받기 쉬운 방위에 있어, 많은 대중들의 관심이 쏠리는 랜드마크성 자산이나 최신 유행하는 힙한 재테크 분야에서 뜻밖의 큰 두각을 나타냅니다.';
  } else if (['인궁(寅宮)', '신궁(申宮)', '사궁(巳宮)', '해궁(亥宮)'].includes(wealthPalace)) {
    palaceDetail = '특히 재물궁이 이동과 변화가 잦은 기운에 깃들어 있어, 지역을 이동하거나 온라인/글로벌 등 물리적 영역을 넘나들며 회전율을 빠르게 가져가는 활동성 자산에서 큰 성과를 얻습니다.';
  } else {
    palaceDetail = '특히 재물궁이 대지와 깊은 창고를 상징하는 기운에 묻혀 있어, 현금을 쉽게 빼 쓸 수 없는 끈끈한 땅이나 장기 적금 등 안전한 락업(Lock-up) 자산에 돈을 묻어두어야 비로소 큰 부가 누적됩니다.';
  }

  let wealthDescription = `귀하의 자미두수 명반에서 금전 유동성과 재테크 성향을 결정하는 '재백궁(財帛宮)'은 '${wealthPalace}'에 위치하며, 주요 재물 수호성인 ${wealthStars.join(', ')}의 영도를 받고 있습니다. \n\n${starDetail} ${palaceDetail}`;

  const currentMonthDetail = currentMonth % 2 === 0 
    ? `특히 실시간 명반 흐름을 대입해 볼 때, ${currentYear}년 ${currentMonth}월은 자미 성계가 '수렴과 보존'의 국면에 접어드는 시기입니다. 신규 투자보다는 기존 자산의 리스크를 재점검하고, 현금 비중을 늘려 방어적인 태세를 취하는 것이 금전적 안정을 지키는 열쇠입니다.`
    : `특히 실시간 명반 흐름을 대입해 볼 때, ${currentYear}년 ${currentMonth}월은 자미 성계가 '확장과 기회'의 활력을 띠는 시기입니다. 새로운 소득 파이프라인 개척이나 소액 재테크에 관심을 가지고 적극적으로 정보를 수집할 때 뜻밖의 금전적 성취가 따를 수 있습니다.`;
  
  wealthDescription += `\n\n${currentMonthDetail}`;

  // 전택궁 5가지 맞춤형 주거 운세 해설로 확장
  let propertyTypeDetail = '';
  const hasLandmarkStars = propertyStars.some(s => s.includes('자미') || s.includes('천부') || s.includes('록존'));
  const hasMoonStars = propertyStars.some(s => s.includes('태음') || s.includes('천상'));
  const hasHealingStars = propertyStars.some(s => s.includes('천동') || s.includes('천량') || s.includes('태양'));
  const hasHelperStars = propertyStars.some(s => s.includes('좌보') || s.includes('우필') || s.includes('천괴') || s.includes('천월'));
  const soilCount = elementsCount.토;

  if (hasLandmarkStars && soilCount >= 2) {
    propertyTypeDetail = '중년 이후 지역 내 랜드마크가 될 만한 상가나 거대 빌딩 등 굵직한 상업용 부동산을 소유할 수 있는 강력한 자산 그릇을 상징합니다. 실거주 외에 임대 소득 파이프라인을 구축해 가문을 번창시킬 대길의 에너지가 흐릅니다.';
  } else if (hasMoonStars) {
    propertyTypeDetail = '청약 당첨운이나 계획적인 갈아타기를 통해 역세권 대단지 신축 아파트를 선점하는 능력이 탁월한 명조입니다. 직관과 정보력이 결합되어 가치가 지속적으로 우상향할 안전지대 자산을 확보하는 주거 복을 가집니다.';
  } else if (hasHealingStars) {
    propertyTypeDetail = '정형화된 성냥갑 아파트보다 뷰(조망권)가 탁월하거나 테라스가 있는 자연 친화적 주거지, 혹은 독특하게 개조한 타운하우스나 단독주택에서 평온과 안정을 찾으며 건강과 자산이 동시에 커지는 치유형 부동산 복을 누립니다.';
  } else if (hasHelperStars) {
    propertyTypeDetail = '부모로부터의 상속 및 증여 가능성이 매우 크거나, 신뢰할 만한 귀인 파트너의 알짜 부동산 추천을 통해 예상치 못한 노른자위 매물을 획득하는 조력형 자산가 명반에 속합니다.';
  } else {
    propertyTypeDetail = '과도한 영끌 투자보다는 대출 레버리지를 철저히 관리한 똘똘한 실거주 아파트 1채를 착실히 마련해 불려 나갈 때 자손대대로 안정되고 새는 재물이 없는 탄탄한 가문 수호형 자산 운을 가집니다.';
  }

  let propertyDescription = `자미두수에서 평생의 부동산 복과 주거 편안함을 예견하는 '전택궁(田宅宮)'은 '${propertyPalace}'에 배치되어 있습니다. 이곳을 채우는 길성인 ${propertyStars.join(', ')}의 배치로 볼 때, 귀하는 \n\n${propertyTypeDetail}`;

  const sunSign = getZodiacSign(solar.getMonth(), solar.getDay());
  const sunSignDescription = ZODIAC_GENERAL_DESC[sunSign] || ZODIAC_GENERAL_DESC['게자리'];

  const zodiacSigns = [
    '양자리', '황소자리', '쌍둥이자리', '게자리', '사자자리', '처녀자리',
    '천칭자리', '전갈자리', '사수자리', '염소자리', '물병자리', '물고기자리'
  ];
  const sunSignIdx = zodiacSigns.indexOf(sunSign);

  // 태어난 시간대별 가상 Ascendant 회전을 반영한 4하우스 별자리 오프셋 결정
  const hourOffsetMap: Record<number, number> = {
    0: 0,   // 자시 (23~01) -> 오프셋 0
    1: 11,  // 축시 (01~03) -> 오프셋 11
    2: 10,  // 인시 (03~05) -> 오프셋 10
    3: 9,   // 묘시 (05~07, 일출) -> 오프셋 9
    4: 8,   // 진시 (07~09) -> 오프셋 8
    5: 7,   // 사시 (09~11) -> 오프셋 7
    6: 6,   // 오시 (11~13, 정오) -> 오프셋 6
    7: 5,   // 미시 (13~15) -> 오프셋 5
    8: 4,   // 신시 (15~17) -> 오프셋 4
    9: 3,   // 유시 (17~19, 일몰) -> 오프셋 3
    10: 2,  // 술시 (19~21) -> 오프셋 2
    11: 1   // 해시 (21~23) -> 오프셋 1
  };
  const offset = hourOffsetMap[hourIdx] ?? 3;
  const fourthHouseSign = zodiacSigns[(sunSignIdx + offset) % 12];

  const interiorStyles: Record<string, { style: string; color: string; tips: string[] }> = {
    '양자리': {
      style: '강렬한 포인트를 살린 모던한 미니멀리즘 스타일',
      color: '레드 및 스칼렛 포인트, 화이트 베이스',
      tips: ['현관 입구에 에너지를 돋우는 붉은 계열 소품 배치', '남향 배치의 거실에 스포트라이트 조명 설치']
    },
    '황소자리': {
      style: '천연 원목과 패브릭을 활용한 따뜻하고 안정적인 내추럴 스타일',
      color: '그린(초록색), 브라운(갈색)',
      tips: ['거실에 관엽식물 화분을 많이 두어 자연의 기운 흡수', '원목 침대와 안락한 흔들의자 배치로 침실 안정성 강조']
    },
    '쌍둥이자리': {
      style: '다양한 소품과 IT 기기가 어우러진 북유럽풍 스마트홈 스타일',
      color: '옐로우(노란색), 라이트 그레이',
      tips: ['집안 서재나 거실에 큰 책장 배치로 지적 기운 상승', '스마트 조명과 깔끔한 홈 오피스 구성']
    },
    '게자리': {
      style: '가족들의 편안함과 소통을 극대화한 아늑한 클래식 패밀리홈',
      color: '실버, 크림색, 파스텔블루',
      tips: ['주방을 거실만큼 넓고 아름답게 꾸미기', '가족사진이나 부드러운 패브릭 커튼을 활용해 아늑한 분위기 조성']
    },
    '사자자리': {
      style: '화려한 골드 소품과 대리석 마감이 돋보이는 럭셔리 스타일',
      color: '골드, 오렌지',
      tips: ['조명이 화려한 샹들리에나 대형 거울 설치', '노란색 계열의 화려한 예술 액자를 거실 중앙에 배치']
    },
    '처녀자리': {
      style: '수납과 위생, 동선을 극대화한 완벽한 정리정돈의 모던 스타일',
      color: '베이지, 파스텔그린, 화이트',
      tips: ['드레스룸이나 팬트리를 수납함으로 정리하기', '공기 정화 식물을 키우며 집안의 쾌적함 극대화']
    },
    '천칭자리': {
      style: '대칭과 균형, 예술적 감각이 돋보이는 프렌치 시크 데코',
      color: '핑크, 파스텔 퍼플, 로즈골드',
      tips: ['침실 and 거실의 대칭 가구 배치', '파스텔 톤의 세련된 조명과 디자이너 체어 활용']
    },
    '전갈자리': {
      style: '신비롭고 묵직한 분위기의 다크 네이비 / 가죽 포인트 빈티지 룩',
      color: '버건디, 네이비, 블랙',
      tips: ['침실은 최대한 암막 커튼 등을 써서 어둡고 아늑하게 차단', '화장실에 행운의 붉은 매트나 타월 배치']
    },
    '사수자리': {
      style: '해외 여행 기념품과 넓은 테라스가 어울리는 이국적인 에스닉 스타일',
      color: '퍼플(보라색), 딥 블루',
      tips: ['거실 넓은 테이블에 큰 세계지도나 여행 소품 배치', '넓은 창을 가리지 않고 뷰를 확보하는 가구 배치']
    },
    '염소자리': {
      style: '역사와 전통이 돋보이는 고풍스러운 앤티크 / 중후한 가죽 가구 스타일',
      color: '차콜, 다크 브라운, 실버',
      tips: ['고급스러운 가죽 소파나 대리석 테이블 배치', '오래된 고가구나 클래식 시계를 거실에 배치']
    },
    '물병자리': {
      style: '기존 틀에서 벗어난 개성 넘치는 인더스트리얼 또는 퓨처리즘 스타일',
      color: '스카이블루, 일렉트릭 블루',
      tips: ['금속성 철제 프레임 선반이나 독특한 조형물 설치', '개성 강한 추상화 액자나 독특한 조명 배치']
    },
    '물고기자리': {
      style: '바다나 물의 이미지를 담은 로맨틱한 보헤미안 / 쉬폰 레이어드 스타일',
      color: '바다 블루, 민트, 화이트',
      tips: ['욕실에 편안한 반신욕 욕조 및 아로마 캔들 설치', '투명한 유리나 조개껍데기 소품을 거실에 배치']
    }
  };

  const currentAstrology = interiorStyles[fourthHouseSign] || interiorStyles['게자리'];

  // 풍수 이사 방향 삼살방 및 대장군방 동적 계산
  let samsalDir = '북쪽';
  let daejanggunDir = '북쪽';

  const fireYears = ['巳', '午', '未'];
  const metalYears = ['申', '酉', '戌'];
  const waterYears = ['亥', '子', '丑'];
  const woodYears = ['寅', '卯', '辰'];

  if (fireYears.includes(currentYearZhi)) {
    samsalDir = '북쪽';
    daejanggunDir = '북쪽';
  } else if (metalYears.includes(currentYearZhi)) {
    samsalDir = '남쪽';
    daejanggunDir = '동쪽';
  } else if (waterYears.includes(currentYearZhi)) {
    samsalDir = '동쪽';
    daejanggunDir = '남쪽';
  } else if (woodYears.includes(currentYearZhi)) {
    samsalDir = '서쪽';
    daejanggunDir = '서쪽';
  }

  const animal = getZodiacAnimal(yZhi);
  const badDirStr = samsalDir === daejanggunDir 
    ? `${samsalDir} (올해 삼살/대장군 겹침)` 
    : `${samsalDir}(삼살방) 및 ${daejanggunDir}(대장군방)`;

  let badDirections = [`${badDirStr} 저촉`];
  let baseLuckyDirs: string[] = [];

  if (animal.includes('쥐') || animal.includes('용') || animal.includes('원숭이')) {
    baseLuckyDirs = ['남동쪽 (반안살 대길 방위)', '동쪽'];
    badDirections = [`${badDirStr} 저촉`, '북서쪽'];
  } else if (animal.includes('범') || animal.includes('말') || animal.includes('개')) {
    baseLuckyDirs = ['북동쪽 (반안살 대길 방위)', '남서쪽'];
    badDirections = [`${badDirStr} 저촉`, '남쪽 (육해살 저촉)'];
  } else if (animal.includes('토끼') || animal.includes('양') || animal.includes('돼지')) {
    baseLuckyDirs = ['남서쪽 (반안살 대길 방위)', '서쪽'];
    badDirections = [`${badDirStr} 저촉`, '동쪽 (재살 저촉)'];
  } else if (animal.includes('소') || animal.includes('뱀') || animal.includes('닭')) {
    baseLuckyDirs = ['북서쪽 (반안살 대길 방위)', '북동쪽'];
    badDirections = [`${badDirStr} 저촉`, '서쪽 (육해살 저촉)'];
  }

  // 일간별 천을귀인(天乙貴인) 방위 계산
  const cheonEulDirections: Record<string, string[]> = {
    '甲': ['북동쪽 (귀인 방위)', '남서쪽 (귀인 방위)'],
    '戊': ['북동쪽 (귀인 방위)', '남서쪽 (귀인 방위)'],
    '庚': ['북동쪽 (귀인 방위)', '남서쪽 (귀인 방위)'],
    '乙': ['북쪽 (귀인 방위)', '남서쪽 (귀인 방위)'],
    '己': ['북쪽 (귀인 방위)', '남서쪽 (귀인 방위)'],
    '丙': ['북서쪽 (귀인 방위)', '서쪽 (귀인 방위)'],
    '丁': ['북서쪽 (귀인 방위)', '서쪽 (귀인 방위)'],
    '辛': ['북동쪽 (귀인 방위)', '남쪽 (귀인 방위)'],
    '壬': ['남동쪽 (귀인 방위)', '동쪽 (귀인 방위)'],
    '癸': ['남동쪽 (귀인 방위)', '동쪽 (귀인 방위)']
  };

  const cheonEulDirs = cheonEulDirections[dayMasterHanja] || [];

  // 기본 반안살 방위와 천을귀인 방위를 중복 없이 병합 (단, 대흉방과 겹치면 제외)
  const luckyDirections = [...baseLuckyDirs, ...cheonEulDirs].filter((dir, index, self) => {
    if (self.findIndex(d => d.split(' ')[0] === dir.split(' ')[0]) !== index) return false;
    const dirName = dir.split(' ')[0];
    const isBad = badDirections.some(bad => bad.includes(dirName));
    return !isBad;
  });

  // ----------------------------------------------------
  // [NEW] 연애운 및 이상형 분석 계산 영역
  // ----------------------------------------------------
  // const spousePalaceIdx = (lifePalaceIdx - 2 + 12) % 12;
  // const spousePalace = palaceZhis[spousePalaceIdx];

  const spouseStarsMap: Record<string, string> = {
    '甲': '태양(太陽) - 활기차고 의리 넘치며 주변을 따뜻하게 밝혀주는 당당한 사람',
    '乙': '태음(太陰) - 감수성이 풍부하고 내 말을 조용히 경청해주며 세심하게 배려해주는 다정다감한 사람',
    '丙': '천부(天府) - 포용력이 넓고 감정 기복이 적어 나를 편안하게 감싸 안아주는 든든한 사람',
    '丁': '자미(紫微) - 품위가 있고 주관이 뚜렷하며 은근히 나를 올바르게 리드해줄 수 있는 사람',
    '戊': '천기(天機) - 지적이고 센스 있는 유머 감각이 있어 대화 코드가 잘 통하고 배울 점이 많은 사람',
    '己': '무곡(武曲) - 경제 관념이 철저하고 생활력이 강하며 현실적인 판단력이 뛰어난 능력자 스타일',
    '庚': '천상(天相) - 예의가 바르고 젠틀하며 외모나 옷차림에서도 세련미가 묻어나는 스타일',
    '辛': '천량(天梁) - 속이 깊고 어른스러워서 내가 기대어 쉴 수 있는 듬직한 사람',
    '壬': '천동(天同) - 함께 있으면 마음이 편안해지고 어린아이 같은 맑고 아기자기한 매력의 힐링형 사람',
    '癸': '거문(巨門) - 생각이 깊고 진중하여 가벼운 호감보다 속 깊은 진솔한 마음을 나누는 신비로운 매력의 사람'
  };
  const idealPartner = spouseStarsMap[dayMaster] || '자미(紫微) - 주관이 뚜렷하고 배려심이 깊은 듬직한 사람';

  let loveSikSangCount = 0;
  let loveInSeongCount = 0;
  let loveBiGeopCount = 0;

  [yGan, mGan, hGan, getBranchMainStem(yZhi), getBranchMainStem(mZhi), getBranchMainStem(dZhi), getBranchMainStem(hZhi)].forEach(stem => {
    const god = getTenGod(dayMaster, stem);
    if (god === '식신' || god === '상관') loveSikSangCount++;
    if (god === '정인' || god === '편인') loveInSeongCount++;
    if (god === '비견' || god === '겁재') loveBiGeopCount++;
  });

  let loveStyle = '';
  if (loveSikSangCount >= 2) {
    loveStyle = '마음에 드는 상대에게 주저 없이 호감을 아낌없이 표출하고 밀당 없이 적극적으로 표현하는 화끈한 [직진 플러팅] 타입입니다. 다정다감한 표현력이 매력적입니다.';
  } else if (loveInSeongCount >= 2) {
    loveStyle = '상대방의 작은 행동도 섬세하게 분석하며 감정의 안전지대가 확보될 때까지 시간을 두고 지켜보는 신중한 [정서적 교감 우선] 타입입니다. 깊은 공감 능력이 강점입니다.';
  } else if (loveBiGeopCount >= 2) {
    loveStyle = '서로의 독립적인 생활 패턴과 개성을 존중하며, 베스트 프렌드처럼 편안하게 대화하고 공통의 관심사를 나눌 수 있는 [친구 같은 연애 지향] 타입입니다.';
  } else {
    loveStyle = '감상적인 말잔치보다 실질적으로 챙겨주는 행동, 센스 있는 선물, 혹은 맛있는 식사 대접 같은 신뢰와 안정감을 주는 배려로 호감을 표현하는 [현실적인 든든형] 타입입니다.';
  }

  let luckyRomanceItem = '';
  const fireSigns = ['양자리', '사자자리', '사수자리'];
  const earthSigns = ['황소자리', '처녀자리', '염소자리'];
  const airSigns = ['쌍둥이자리', '천칭자리', '물병자리'];

  if (fireSigns.includes(sunSign)) {
    luckyRomanceItem = '에너지를 돋우는 비비드한 오렌지/레드 계열 패션 소품, 혹은 액티브한 야외 스포츠/축제 데이트';
  } else if (earthSigns.includes(sunSign)) {
    luckyRomanceItem = '차분한 매력을 더해주는 우디/머스크 계열 향수, 혹은 은은하게 대화를 나눌 아늑한 LP 바 데이트';
  } else if (airSigns.includes(sunSign)) {
    luckyRomanceItem = '감각적인 실버 악세사리(반지/팔찌), 혹은 힙한 팝업스토어나 현대 미술 전시회 방문 데이트';
  } else {
    luckyRomanceItem = '마음의 안정을 주는 아로마 캔들이나 무드등 소품, 혹은 오션뷰 카페나 잔잔한 물가 산책 데이트';
  }

  const romanceScore = 70 + ((day + hour + lunar.getDay() + 15) % 28);

  const result: DestinyResult = {
    name,
    birthDateStr: `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`,
    isLunar,
    currentYear,
    currentMonth,
    currentYearGanInfo: `${currentYearGan}${currentYearZhi}`,
    currentMonthGanInfo: `${currentMonthGan}${currentMonthZhi}`,
    saju: {
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
      dayMaster: dayMasterKr,
      dayMasterHanja,
      dayMasterElement: ELEMENTS[STEM_INFO[dayMaster]?.element || '土'],
      animal
    },
    scores: {
      documentLuck: documentLuckScore,
      wealthLuck: wealthLuckScore
    },
    analysis: {
      personality,
      generalWealthText,
      documentLuckText
    },
    ziWei: {
      wealthPalace,
      wealthStars,
      wealthDescription,
      propertyPalace,
      propertyStars,
      propertyDescription
    },
    western: {
      sunSign,
      sunSignDescription,
      fourthHouseSign,
      homeStyle: currentAstrology.style,
      interiorColor: currentAstrology.color,
      tips: currentAstrology.tips
    },
    fengShui: {
      luckyDirections,
      badDirections
    },
    romance: {
      loveStyle,
      idealPartner,
      luckyRomanceItem,
      romanceScore
    }
  };

  return result;
}
