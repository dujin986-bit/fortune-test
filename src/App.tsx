import React, { useState } from 'react';
import { Compass, Sparkles, Download, MessageSquare, ArrowRight, RefreshCw, Copy } from 'lucide-react';
import { calculateDestiny } from './utils/astrologyCalculator';
import type { DestinyResult } from './utils/astrologyCalculator';
import { generatePDFReport } from './utils/pdfGenerator';

interface CustomerDBItem {
  name: string;
  email: string;
  birthDate: string;
  parsedDate: string;
}

// 인스타그램 채널 및 기본 크리에이터 정보 설정
const CREATOR_INFO = {
  name: "운세와 풍수 이야기",
  instagramUrl: "https://instagram.com/", // 사용자 인스타그램 프로필 주소 (나중에 아이디만 붙이면 됨)
  instagramId: "@username", // 표시용 인스타그램 아이디
  slogan: "사주, 점성술, 풍수를 통해 일상 속에 행운을 더하는 공간입니다."
};

function App() {
  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input');
  
  // 입력 모드 상태 (직접 입력 vs DM 파서)
  const [inputMode, setInputMode] = useState<'manual' | 'parser'>('manual');
  const [rawText, setRawText] = useState('');

  // 입력 폼 상태
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState(1995);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);
  const [birthHour, setBirthHour] = useState(12);
  const [isLunar, setIsLunar] = useState(false);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);

  // DM 텍스트 파싱 및 폼 채우기 함수
  const handleParseAndFill = () => {
    if (!rawText.trim()) {
      alert('붙여넣을 DM 텍스트를 입력해 주세요.');
      return;
    }

    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // 1. 이름 추출 (접두사가 없어도 첫 라인의 유효 텍스트 추출)
    const namePrefixMatch = rawText.match(/이름\s*:\s*([^\n\r]+)/);
    if (namePrefixMatch) {
      setName(namePrefixMatch[1].trim());
    } else if (lines.length > 0) {
      const firstLine = lines[0];
      const isDate = firstLine.match(/\d{4}/);
      const isEmail = firstLine.includes('@');
      const isType = firstLine.includes('양력') || firstLine.includes('음력');
      if (!isDate && !isEmail && !isType && firstLine.length < 10) {
        // 숫자나 기호를 제거하고 남은 텍스트를 이름으로 채택
        const cleanName = firstLine
          .replace(/[0-9.]/g, '')
          .replace(/이름/g, '')
          .replace(/:/g, '')
          .replace(/^[-\s]+/g, '')
          .trim();
        setName(cleanName);
      }
    }

    // 2. 생년월일 추출 (띄어쓰기, 한글, 점, 대시 등 유연 매칭)
    // 예: "1989 06 26", "1989.6.26", "1989년 6월 26일"
    const ymdMatch = rawText.match(/(\d{4})\s*[\s년\-./]\s*(\d{1,2})\s*[\s월\-./]\s*(\d{1,2})/);
    if (ymdMatch) {
      setBirthYear(Number(ymdMatch[1]));
      setBirthMonth(Number(ymdMatch[2]));
      setBirthDay(Number(ymdMatch[3]));
    }

    // 3. 양력/음력 추출 (전체 본문 검색)
    const isLunarText = rawText.match(/음력/);
    const isSolarText = rawText.match(/양력/);
    if (isLunarText && !isSolarText) {
      setIsLunar(true);
    } else {
      setIsLunar(false); // 기본값 양력
    }

    // 4. 이메일 주소 추출 (전체 본문 검색)
    const emailMatch = rawText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      setEmail(emailMatch[1].trim());
    }

    // 5. 태어난 시간 추출 (접두사가 없어도 시간 정보 행 추적)
    const timePrefixMatch = rawText.match(/시간\s*:\s*([^\n\r]+)/);
    let timeStr = timePrefixMatch ? timePrefixMatch[1].trim() : '';

    if (!timeStr) {
      const timeLine = lines.find(line => 
        line.includes('오전') || 
        line.includes('오후') || 
        line.includes('시') || 
        line.includes('모름') ||
        line.includes('새벽') ||
        line.includes('낮') ||
        line.includes('밤')
      );
      if (timeLine) {
        timeStr = timeLine;
      }
    }

    if (timeStr) {
      if (timeStr.includes('모름')) {
        setBirthHour(12);
      } else {
        const ampmMatch = timeStr.match(/(오전|오후|새벽|낮|밤)\s*(\d{1,2})/);
        const numberMatch = timeStr.match(/(\d{1,2})/);
        if (ampmMatch) {
          const ampm = ampmMatch[1];
          let hourVal = Number(ampmMatch[2]);
          const isPm = ampm === '오후' || ampm === '밤' || ampm === '낮';
          
          if (isPm && hourVal < 12) hourVal += 12;
          if (!isPm && hourVal === 12) hourVal = 0;
          setBirthHour(hourVal);
        } else if (numberMatch) {
          setBirthHour(Number(numberMatch[1]));
        }
      }
    } else {
      setBirthHour(12); // 기본값
    }

    setConsent(true);
    alert('성공적으로 파싱되어 입력 폼이 자동으로 완성되었습니다! 값을 확인하신 후 분석을 시작하세요.');
  };
  
  // 결과 상태
  const [result, setResult] = useState<DestinyResult | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // 시간 목록 (시주 계산용)
  const HOURS = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${String(i).padStart(2, '0')}:00 (${i < 12 ? '오전' : '오후'} ${i === 0 || i === 12 ? 12 : i % 12}시)`
  }));

  const saveCustomerToDB = (customerName: string, customerEmail: string, year: number, month: number, day: number) => {
    try {
      const rawDB = localStorage.getItem('fortune_customer_db');
      const db: CustomerDBItem[] = rawDB ? JSON.parse(rawDB) : [];
      
      // 동일한 이메일이 이미 수집되었다면 중복 적재 방지
      if (db.some(item => item.email.toLowerCase() === customerEmail.toLowerCase())) {
        return;
      }

      const newItem: CustomerDBItem = {
        name: customerName,
        email: customerEmail,
        birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        parsedDate: new Date().toLocaleString('ko-KR')
      };
      
      db.push(newItem);
      localStorage.setItem('fortune_customer_db', JSON.stringify(db));
    } catch (err) {
      console.error('DB 저장 실패:', err);
    }
  };

  const handleStartAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !consent) {
      alert('모든 정보를 기입하시고 개인정보 수집에 동의해 주세요.');
      return;
    }

    setStep('analyzing');

    // 천기 분석 느낌을 주는 애니메이션 효과 (3초 대기)
    setTimeout(() => {
      const year = birthYear;
      const month = birthMonth;
      const day = birthDay;

      try {
        const destinyResult = calculateDestiny(name, year, month, day, birthHour, isLunar);
        setResult(destinyResult);
        saveCustomerToDB(name, email, year, month, day); // 성공 시 DB 자동 누적
        setStep('result');
      } catch (err) {
        console.error(err);
        alert('사주 분석 도중 오류가 발생했습니다. 생년월일을 다시 확인해 주세요.');
        setStep('input');
      }
    }, 3000);
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      await generatePDFReport(result, CREATOR_INFO);
    } catch (err) {
      console.error(err);
      alert('PDF 파일 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    try {
      const rawDB = localStorage.getItem('fortune_customer_db');
      const db: CustomerDBItem[] = rawDB ? JSON.parse(rawDB) : [];
      
      if (db.length === 0) {
        alert('수집된 이메일 DB가 아직 없습니다.');
        return;
      }
      
      let csvContent = '\uFEFF'; // 한글 깨짐 방지 UTF-8 BOM
      csvContent += '이름,이메일,생년월일,수집일시\n';
      
      db.forEach(item => {
        const nameClean = item.name.replace(/"/g, '""');
        const emailClean = item.email.replace(/"/g, '""');
        csvContent += `"${nameClean}","${emailClean}","${item.birthDate}","${item.parsedDate}"\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `수집이메일_DB_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('CSV 다운로드 실패:', err);
      alert('다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleClearDB = () => {
    if (window.confirm('정말 수집된 모든 이메일 DB를 삭제하시겠습니까? 복구할 수 없습니다.')) {
      localStorage.removeItem('fortune_customer_db');
      alert('DB가 성공적으로 초기화되었습니다.');
    }
  };

  const handleCopyDMText = () => {
    if (!result) return;
    
    // 이사 방향 텍스트 정제 (한자어 제거 및 순화)
    const luckyDir = result.fengShui.luckyDirections.map(d => d.replace(/반안살 대길 방위/g, '나를 성공으로 이끄는 최고의 대길 방향')).join(', ');
    const badDir = (result.fengShui.badDirections[0] || '북쪽')
      .replace(/삼살\/대장군/g, '자연의 나쁜 기운인 삼살/대장군 방위')
      .replace(/저촉/g, '피하기');
    
    // 풍수 인테리어 팁들을 불릿 기호와 함께 문자열로 조립
    const interiorTips = result.western.tips.map(tip => `   • ${tip}`).join('\n');
    
    // 어려운 한자어 순화 처리
    const purePersonality = result.analysis.personality
      .replace(/일간/g, '타고난 나만의 기운')
      .replace(/명조/g, '사주 흐름');

    const pureWealth = result.analysis.generalWealthText
      .replace(/소득\(정재\)/g, '고정 소득')
      .replace(/정재/g, '차곡차곡 모으는 안정 자산')
      .replace(/명조/g, '사주');

    const pureWealthDesc = result.ziWei.wealthDescription
      .replace(/재백궁\(財帛宮\)/g, '평생 재물 수호궁')
      .replace(/재백궁/g, '재물 수호궁')
      .replace(/화록\(화록\)/g, '큰 돈을 부르는 재물의 별')
      .replace(/록존/g, '자산을 굳건히 수호하는 별')
      .replace(/살성\(나쁜 기운의 별\)이/g, '불안정한 기운이')
      .replace(/살성이/g, '불안정한 기운이')
      .replace(/성반/g, '운세 궤도')
      .replace(/유년 재물/g, '올해의 재물')
      .replace(/유년/g, '올해의')
      .replace(/임금 중심/g, '노동 소득 중심');

    const purePropertyDesc = result.ziWei.propertyDescription
      .replace(/전택궁\(田宅宮\)/g, '부동산/가정 수호궁')
      .replace(/전택궁/g, '부동산 수호궁')
      .replace(/대길의 복/g, '큰 복');

    const pureDocumentText = result.analysis.documentLuckText
      .replace(/정인\/편인/g, '합격 및 중요 계약의 기운')
      .replace(/문서운/g, '합격/서류 계약운')
      .replace(/액운/g, '나쁜 기운')
      .replace(/세운/g, '올해의 운');

    const dmText = `🔮 **${result.name}님의 ${result.currentMonth}월 동서양 통합 운세 분석 보고서** 🔮

안녕하세요, ${result.name}님! 요청하신 ${result.currentMonth}월 사주, 자미두수, 점성술 융합 분석 결과입니다. 길고 구체적이니 천천히 읽어보세요. 😊

──────────────────────

### 1. 🌲 타고난 사주 성향 및 자아 유형
* **나의 영혼 기운 (사주 일주)**: ${result.saju.dayPillar.ganKr}${result.saju.dayPillar.zhiKr}일주 (${result.saju.dayMasterElement.name}의 기운)
* **타고난 성격 특징**: 
  ${purePersonality}

──────────────────────

### 💰 2. 타고난 재물운 & 돈 관리 스타일
* **평생 재물운 지수**: ${result.scores.wealthLuck}점
* **나의 재물운 해설**: 
  ${pureWealth}

──────────────────────

### 🔮 3. 자미두수 평생 돈 그릇 (재물 수호궁) 분석
* **나의 평생 돈 그릇 위치**: ${result.ziWei.wealthPalace}
* **돈을 벌고 쓰는 성향**: 
  ${pureWealthDesc}

──────────────────────

### 💖 4. [보너스] 이달의 연애 매력 & 끌리는 이상형
* **연애 매력 지수**: ${result.romance?.romanceScore ?? 0}점
* **나의 연애 스타일**: ${result.romance?.loveStyle ?? ''}
* **자미두수가 말하는 나의 이상형**: ${result.romance?.idealPartner ?? ''}
* **연애운을 높여주는 행운의 아이템/데이트 팁**: ${result.romance?.luckyRomanceItem ?? ''}

──────────────────────

### 🧭 5. [보너스] 나를 돕는 풍수 이사 방향 & 공간 조언
* **나의 부동산 복 (자미두수 전택궁)**: 
  ${purePropertyDesc}
* **이달의 부동산 문서(계약/합격)운**: 
  ${pureDocumentText}
* **나에게 행운을 주는 주거 스타일**: ${result.western.homeStyle}
* **행운의 인테리어 색상**: ${result.western.interiorColor}
* **이동하기 좋은 행운의 방향**: ${luckyDir}
* **조심해서 피해야 할 방향**: ${badDir}
* **나의 일상 풍수 조언**:
${interiorTips}

──────────────────────

✉️ 분석 결과에 대해 더 궁금한 점이 있거나 흥미로운 부분이 있다면 언제든 이 DM으로 답장 남겨주세요! 편하게 소통해요 💬`;

    navigator.clipboard.writeText(dmText)
      .then(() => {
        alert('인스타 DM용 장문 분석 텍스트가 클립보드에 복사되었습니다! 인스타 DM 창에 붙여넣기(Ctrl+V) 하세요.');
      })
      .catch((err) => {
        console.error('클립보드 복사 실패:', err);
        alert('복사에 실패했습니다. 수동으로 복사해 주세요.');
      });
  };

  const handleReset = () => {
    setName('');
    setBirthYear(1995);
    setBirthMonth(1);
    setBirthDay(1);
    setBirthHour(12);
    setIsLunar(false);
    setEmail('');
    setConsent(false);
    setResult(null);
    setStep('input');
  };

  return (
    <div className="app-container">
      {/* 1. 입력 화면 */}
      {step === 'input' && (
        <div className="glass-card">
          <div className="header-emblem">
            <div className="emblem-ring">
              <Sparkles />
            </div>
          </div>
          <h1>동서양 통합 부동산 사주</h1>
          <p style={{ textAlign: 'center', marginBottom: '16px', fontSize: '0.85rem' }}>
            생년월일시로 알아보는 나만의 실시간 부동산 문서운 · 이사방향 · 풍수 리포트
          </p>

          {/* 입력 방식 전환 탭 */}
          <div className="toggle-group" style={{ marginBottom: '24px', gridTemplateColumns: '1fr 1fr' }}>
            <button
              type="button"
              className={`toggle-btn ${inputMode === 'manual' ? 'active' : ''}`}
              onClick={() => setInputMode('manual')}
              style={{ fontSize: '0.82rem', padding: '10px' }}
            >
              ✍️ 직접 입력 모드
            </button>
            <button
              type="button"
              className={`toggle-btn ${inputMode === 'parser' ? 'active' : ''}`}
              onClick={() => setInputMode('parser')}
              style={{ fontSize: '0.82rem', padding: '10px' }}
            >
              📋 DM 복사 붙여넣기
            </button>
          </div>

          {inputMode === 'parser' && (
            <div style={{ marginBottom: '24px', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--color-accent-light)' }}>
                고객이 보낸 DM 텍스트 붙여넣기
              </label>
              <textarea
                className="form-control"
                style={{ width: '100%', height: '120px', fontSize: '0.8rem', resize: 'vertical', fontFamily: 'monospace', padding: '10px', background: 'rgba(15, 23, 42, 0.6)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '10px' }}
                placeholder={`[예시 양식 복사 적용]&#10;1. 이름: 홍길동&#10;2. 생년월일: 1995년 5월 12일&#10;3. 양력 / 음력 선택: 양력&#10;4. 태어난 시간: 오후 2시&#10;5. 리포트를 수령할 이메일 주소: name@email.com`}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleParseAndFill}
                style={{ fontSize: '0.85rem', padding: '10px 14px', width: '100%', border: '1px solid var(--color-accent-light)' }}
              >
                ⚡ 텍스트 자동 채우기
              </button>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleDownloadCSV}
                  style={{ flex: 1, fontSize: '0.75rem', padding: '8px 10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px dashed rgba(16, 185, 129, 0.3)' }}
                >
                  📥 DB 엑셀 다운로드 (CSV)
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleClearDB}
                  style={{ fontSize: '0.75rem', padding: '8px 10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px dashed rgba(239, 68, 68, 0.3)' }}
                >
                  🗑️ 초기화
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleStartAnalysis}>
            <div className="form-group">
              <label>이름</label>
              <input
                type="text"
                className="form-control"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>이메일 주소 (PDF 리포트 수령용)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                * 분석 결과 PDF 보고서가 다운로드되며 이메일로도 연동됩니다.
              </p>
            </div>

            <div className="form-group">
              <label>생년월일</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
                <select
                  className="form-control"
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                >
                  {Array.from({ length: 97 }, (_, i) => 2026 - i).map((y) => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
                <select
                  className="form-control"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{m}월</option>
                  ))}
                </select>
                <select
                  className="form-control"
                  value={birthDay}
                  onChange={(e) => setBirthDay(Number(e.target.value))}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}일</option>
                  ))}
                </select>
              </div>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${!isLunar ? 'active' : ''}`}
                  onClick={() => setIsLunar(false)}
                >
                  양력 (Solar)
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${isLunar ? 'active' : ''}`}
                  onClick={() => setIsLunar(true)}
                >
                  음력 (Lunar)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>태어난 시간</label>
              <select
                className="form-control"
                value={birthHour}
                onChange={(e) => setBirthHour(Number(e.target.value))}
              >
                {HOURS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              <label htmlFor="consent">
                개인정보 수집 및 안내 이메일 발송 동의 (필수)<br />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  생성된 사주 분석 리포트 다운로드 및 향후 새로운 운세 콘텐츠/업데이트 소식 이메일 수신에 동의합니다.
                </span>
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '24px' }}>
              무료 사주 분석하기 <ArrowRight size={18} />
            </button>
          </form>
        </div>
      )}

      {/* 2. 로딩/분석 중 화면 */}
      {step === 'analyzing' && (
        <div className="glass-card">
          <div className="analyzing-container">
            <div className="compass-container">
              <div className="compass-outer" />
              <div className="compass-inner">
                <div className="compass-needle" />
              </div>
            </div>
            <h2>우주의 에너지를 조율하고 있습니다</h2>
            <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
              태어난 순간의 별자리 좌표와 사주팔자를 융합하여<br />
              {name}님의 부동산 문서운 및 길방을 연산하고 있습니다.
            </p>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-accent-light)', marginTop: '14px' }}>
              동서양 천체 궤도 데이터 동기화 중...
            </p>
          </div>
        </div>
      )}

      {/* 3. 결과 요약 및 PDF 다운로드 화면 */}
      {step === 'result' && result && (
        <>
          <div className="glass-card">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div className="saju-circle" style={{ 
                backgroundColor: result.saju.dayMasterElement.hexColor,
                width: '60px',
                height: '60px',
                fontSize: '1.4rem',
                marginBottom: '10px'
              }}>
                {result.saju.dayMasterHanja}
              </div>
              <h2 style={{ borderLeft: 'none', paddingLeft: 0, margin: 0 }}>
                {result.name}님의 {result.currentMonth}월 운세 분석 완료
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-accent-light)', marginTop: '4px' }}>
                {result.saju.animal} · {result.saju.dayMaster}일주 ({result.saju.dayMasterElement.name}의 기운)
              </p>
            </div>

            <div className="score-badge-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div className="score-badge-card">
                <div className="score-badge-value">{result.scores.documentLuck}점</div>
                <div className="score-badge-label">문서운(계약)</div>
              </div>
              <div className="score-badge-card">
                <div className="score-badge-value">{result.scores.wealthLuck}점</div>
                <div className="score-badge-label">종합 재물운</div>
              </div>
              <div className="score-badge-card" style={{ border: '1px solid rgba(244, 63, 94, 0.4)', background: 'rgba(244, 63, 94, 0.05)' }}>
                <div className="score-badge-value" style={{ color: '#fb7185' }}>{result.romance?.romanceScore ?? 0}점</div>
                <div className="score-badge-label" style={{ color: '#fda4af' }}>연애 매력</div>
              </div>
            </div>

            <div className="saju-grid">
              <div className="saju-item">
                <div className="saju-label">시주</div>
                <div className="saju-circle" style={{ backgroundColor: result.saju.hourPillar.ganElement.hexColor }}>
                  {result.saju.hourPillar.gan}
                </div>
                <div className="saju-circle" style={{ backgroundColor: result.saju.hourPillar.zhiElement.hexColor }}>
                  {result.saju.hourPillar.zhi}
                </div>
                <div className="saju-desc">{result.saju.hourPillar.tenGod}</div>
              </div>
              <div className="saju-item">
                <div className="saju-label">일주</div>
                <div className="saju-circle" style={{ backgroundColor: result.saju.dayPillar.ganElement.hexColor }}>
                  {result.saju.dayPillar.gan}
                </div>
                <div className="saju-circle" style={{ backgroundColor: result.saju.dayPillar.zhiElement.hexColor }}>
                  {result.saju.dayPillar.zhi}
                </div>
                <div className="saju-desc">본인</div>
              </div>
              <div className="saju-item">
                <div className="saju-label">월주</div>
                <div className="saju-circle" style={{ backgroundColor: result.saju.monthPillar.ganElement.hexColor }}>
                  {result.saju.monthPillar.gan}
                </div>
                <div className="saju-circle" style={{ backgroundColor: result.saju.monthPillar.zhiElement.hexColor }}>
                  {result.saju.monthPillar.zhi}
                </div>
                <div className="saju-desc">{result.saju.monthPillar.tenGod}</div>
              </div>
              <div className="saju-item">
                <div className="saju-label">년주</div>
                <div className="saju-circle" style={{ backgroundColor: result.saju.yearPillar.ganElement.hexColor }}>
                  {result.saju.yearPillar.gan}
                </div>
                <div className="saju-circle" style={{ backgroundColor: result.saju.yearPillar.zhiElement.hexColor }}>
                  {result.saju.yearPillar.zhi}
                </div>
                <div className="saju-desc">{result.saju.yearPillar.tenGod}</div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '6px' }}>● 성향 한줄 요약</h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                {result.analysis.personality.substring(0, 100)}...
              </p>
            </div>

            {result.romance && (
            <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.15)' }}>
              <h3 style={{ marginBottom: '8px', color: '#fb7185', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                💖 이달의 연애운 & 이상형 분석
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#fda4af', marginBottom: '8px', lineHeight: '1.4' }}>
                <strong>연애 스타일:</strong> {result.romance.loveStyle}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px', lineHeight: '1.4' }}>
                <strong>자미두수 이상형:</strong> {result.romance.idealPartner}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#a7f3d0', lineHeight: '1.4' }}>
                <strong>행운의 연애 팁:</strong> {result.romance.luckyRomanceItem}
              </p>
            </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '6px', color: 'var(--color-accent-light)' }}>● 타고난 재물운 기질</h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                {result.analysis.generalWealthText.substring(0, 100)}...
              </p>
            </div>

            <button 
              onClick={handleDownloadPDF} 
              className="btn-primary" 
              disabled={pdfLoading}
              style={{ padding: '14px 10px', fontSize: '1rem' }}
            >
              {pdfLoading ? (
                <>
                  <Compass className="animate-spin" size={18} /> 폰트 다운로드 및 PDF 생성 중...
                </>
              ) : (
                <>
                  <Download size={18} /> 상세 5p PDF 리포트 받기
                </>
              )}
            </button>

            {/* 인스타 DM 요약 전송 섹션 */}
            <div className="dm-summary-section">
              <div className="dm-section-header">
                <div className="dm-insta-icon">📲</div>
                <div>
                  <div className="dm-section-title">인스타 DM 전송용 분석 요약</div>
                  <div className="dm-section-sub">아래 핵심 포인트를 복사해서 바로 DM으로 전송하세요</div>
                </div>
              </div>

              <div className="dm-points-grid">
                <div className="dm-point-card">
                  <span className="dm-point-icon">🌲</span>
                  <div className="dm-point-content">
                    <div className="dm-point-label">타고난 기운</div>
                    <div className="dm-point-value">{result.saju.dayMasterElement.name}의 기운</div>
                  </div>
                </div>
                <div className="dm-point-card">
                  <span className="dm-point-icon">💰</span>
                  <div className="dm-point-content">
                    <div className="dm-point-label">재물운 점수</div>
                    <div className="dm-point-value">{result.scores.wealthLuck}점</div>
                  </div>
                </div>
                <div className="dm-point-card">
                  <span className="dm-point-icon">📋</span>
                  <div className="dm-point-content">
                    <div className="dm-point-label">문서/계약운</div>
                    <div className="dm-point-value">{result.scores.documentLuck}점</div>
                  </div>
                </div>
                <div className="dm-point-card">
                  <span className="dm-point-icon">🧭</span>
                  <div className="dm-point-content">
                    <div className="dm-point-label">행운 방향</div>
                    <div className="dm-point-value">{result.fengShui.luckyDirections[0]?.split(' ')[0] ?? '동쪽'}</div>
                  </div>
                </div>
                <div className="dm-point-card">
                  <span className="dm-point-icon">💖</span>
                  <div className="dm-point-content">
                    <div className="dm-point-label">연애 매력</div>
                    <div className="dm-point-value">{result.romance?.romanceScore ?? 0}점</div>
                  </div>
                </div>
                <div className="dm-point-card">
                  <span className="dm-point-icon">🏠</span>
                  <div className="dm-point-content">
                    <div className="dm-point-label">행운 인테리어</div>
                    <div className="dm-point-value">{result.western.interiorColor}</div>
                  </div>
                </div>
              </div>

              <div className="dm-copy-hint">
                <span className="dm-copy-hint-dot" />
                총 5개 섹션 · 풍수 인테리어 팁 · 자미두수 분석 포함된 장문 텍스트
              </div>

              <button 
                onClick={handleCopyDMText} 
                className="dm-copy-btn"
              >
                <Copy size={18} />
                <span>인스타 DM용 장문 분석 전문 복사</span>
                <span className="dm-copy-arrow">→</span>
              </button>
            </div>
          </div>

          <div className="glass-card cta-box" style={{ padding: '24px 20px' }}>
            <h3>🔮 일상의 행운을 높이는 운세 & 풍수 이야기</h3>
            <p>
              오늘 확인한 분석 결과가 흥미로우셨나요? 인스타그램을 팔로우하시면 매달 업데이트되는 문서운, 행운의 방향, 그리고 일상 속 풍수 인테리어 팁을 가장 빠르게 확인하실 수 있습니다. 궁금한 점은 DM으로 편하게 소통해요!
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a 
                href={CREATOR_INFO.instagramUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-primary"
                style={{ background: '#fef08a', color: '#1e293b', boxShadow: 'none', fontSize: '0.95rem', padding: '12px' }}
              >
                <MessageSquare size={16} /> 인스타그램 팔로우 & DM 소통
              </a>
            </div>
            
            <button 
              onClick={handleReset}
              className="btn-secondary" 
              style={{ marginTop: '16px', border: 'none', fontSize: '0.8rem', opacity: '0.7' }}
            >
              <RefreshCw size={12} /> 다른 사람 사주 분석하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
