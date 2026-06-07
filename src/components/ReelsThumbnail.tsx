import { forwardRef } from 'react';
import type { DestinyResult } from '../utils/astrologyCalculator';
import { Compass, Sparkles } from 'lucide-react';

interface ReelsThumbnailProps {
  result: DestinyResult | null;
}

const ReelsThumbnail = forwardRef<HTMLDivElement, ReelsThumbnailProps>(({ result }, ref) => {
  if (!result) return null;

  // 방향성 추출
  const luckyDir = result.fengShui.luckyDirections[0]?.split(' ')[0] || '동남쪽';

  return (
    // 화면상에 작게 미리보기로 표시되도록 scale 조정 (가로 1080 -> 약 324px)
    <div className="reels-thumbnail-wrapper" style={{ height: '580px', marginBottom: '20px', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
      <div 
        ref={ref}
        className="reels-thumbnail-container"
        style={{ transform: 'scale(0.3)', transformOrigin: 'top center' }}
      >
        <div className="reels-bg-elements">
          <div className="bg-blob blob-1"></div>
          <div className="bg-blob blob-2"></div>
        </div>

        <div className="reels-content">
          {/* 상단 6월 사주 문구 */}
          <div className="reels-header">
            <span className="reels-badge"><Sparkles size={24} /> 🔮 6월 한정 무료 운세</span>
            <h1 className="reels-title">
              폼 미친 6월<br />
              <span className="highlight-text">{result.name}님의 운세가 무료!</span>
            </h1>
          </div>

          {/* 메인 사주 데이터 박스 (글래스모피즘) */}
          <div className="reels-glass-card">
            <div className="reels-saju-circle" style={{ backgroundColor: result.saju.dayMasterElement.hexColor }}>
              {result.saju.dayMasterHanja}
            </div>
            
            <div className="reels-data-rows">
              <div className="reels-row">
                <span className="row-label">타고난 기운</span>
                <span className="row-value">{result.saju.dayPillar.ganKr}{result.saju.dayPillar.zhiKr}일주</span>
              </div>
              <div className="reels-row">
                <span className="row-label">문서운 지수</span>
                <span className="row-value highlight-score">{result.scores.documentLuck}점</span>
              </div>
              <div className="reels-row">
                <span className="row-label">행운의 방향</span>
                <span className="row-value"><Compass size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />{luckyDir}</span>
              </div>
            </div>
          </div>

          {/* 하단 DM 양식 유도 문구 */}
          <div className="reels-footer">
            <div className="dm-prompt">
              <div className="dm-icon">💌</div>
              <div className="dm-text">
                <strong>DM으로 양식에 맞춰</strong> 보내주시면<br />
                순서대로 꼼꼼하게 운세 배달해 드림! 🚀<br />
                <span style={{ fontSize: '1.8rem', color: '#94a3b8', marginTop: '12px', display: 'block' }}>
                  (직접 수작업으로 보니 쪼~금 걸릴 수 있음 주의 😉)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ReelsThumbnail;
