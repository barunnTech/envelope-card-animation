'use client'

import { useEffect, useState } from 'react'
import styles from './EnvelopeCard.module.css'

interface Card {
  id: number
  title: string
  subtitle: string
  decoration: string
}

interface EnvelopeCardProps {
  isAnimating: boolean
  onAnimationStart: () => void
}

const ALL_CARDS: Card[] = [
  { id: 1, title: "You're Invited", subtitle: "To a Special Event", decoration: "" },
  { id: 2, title: "Save the Date", subtitle: "Join Us for Celebration", decoration: "" },
  { id: 3, title: "Wedding Invitation", subtitle: "Our Special Day", decoration: "" },
  { id: 4, title: "Birthday Party", subtitle: "Let's Celebrate Together", decoration: "" },
]

export default function EnvelopeCard({ isAnimating, onAnimationStart }: EnvelopeCardProps) {
  const [phase, setPhase] = useState<'initial' | 'start' | 'flap-open' | 'card-slide' | 'card-rotate'>('initial')
  const [hasStarted, setHasStarted] = useState(false)
  const [visibleCards, setVisibleCards] = useState<Card[]>([ALL_CARDS[0]]) // 처음엔 1장만
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [swipingCardId, setSwipingCardId] = useState<number | null>(null)
  const [isSwipeEnabled, setIsSwipeEnabled] = useState(false)

  useEffect(() => {
    if (isAnimating && !hasStarted) {
      playAnimation()
    }
  }, [isAnimating, hasStarted])

  const playAnimation = () => {
    setHasStarted(true)

    // Step 1: Start opening flap immediately
    setTimeout(() => {
      setPhase('start')
    }, 0)

    // Step 2: Flap fully open (after 750ms animation)
    setTimeout(() => {
      setPhase('flap-open')
    }, 750)

    // Step 3: Card slides up (after flap is open)
    setTimeout(() => {
      setPhase('card-slide')
    }, 1260)

    // Step 4: Card rotates (바로 회전 시작)
    setTimeout(() => {
      setPhase('card-rotate')
    }, 1760) // 2250 → 1760으로 단축 (약 500ms 단축)

    // Step 5: 회전 완료 후 뒤에 카드들 나타남
    setTimeout(() => {
      console.log('🎴 Adding cards 2, 3, 4 to visibleCards')
      setVisibleCards(ALL_CARDS) // 모든 카드 표시
    }, 2560) // 3050 → 2560으로 단축

    // Step 6: 스와이프 활성화
    setTimeout(() => {
      console.log('👆 Swipe enabled')
      setIsSwipeEnabled(true)
    }, 3000) // 3500 → 3000으로 단축
  }

  const handleEnvelopeClick = () => {
    if (!hasStarted) {
      onAnimationStart()
      playAnimation()
    }
  }

  const handleReplay = () => {
    // Force reload to reset everything
    window.location.reload()
  }

  // 카드 전환 핸들러
  const goToNextCard = () => {
    if (!isSwipeEnabled || currentCardIndex >= ALL_CARDS.length - 1) return

    console.log('➡️ Next card')
    setIsSwipeEnabled(false)
    setSwipingCardId(ALL_CARDS[currentCardIndex].id)

    setTimeout(() => {
      setCurrentCardIndex(prev => prev + 1)
      setSwipingCardId(null)
      setIsSwipeEnabled(true)
    }, 600)
  }

  const goToPrevCard = () => {
    if (!isSwipeEnabled || currentCardIndex <= 0) return

    console.log('⬅️ Previous card')
    setIsSwipeEnabled(false)
    // 이전 카드도 동일한 애니메이션 (fly away 효과 없이 바로 전환)
    setCurrentCardIndex(prev => prev - 1)
    setTimeout(() => {
      setIsSwipeEnabled(true)
    }, 600) // 다음 카드와 동일한 시간
  }

  // 터치 스와이프 감지
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    if (!isSwipeEnabled) {
      console.log('❌ Touch blocked - swipe not enabled')
      return
    }
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    console.log('👆 Touch start:', e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeEnabled) return
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !isSwipeEnabled) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    console.log(`Touch distance: ${distance}, Left: ${isLeftSwipe}, Right: ${isRightSwipe}, CurrentIndex: ${currentCardIndex}`)

    if (isLeftSwipe && currentCardIndex < ALL_CARDS.length - 1) {
      console.log('✅ Going to NEXT card')
      goToNextCard()
    } else if (isRightSwipe && currentCardIndex > 0) {
      console.log('✅ Going to PREV card')
      goToPrevCard()
    } else {
      console.log('❌ Swipe blocked or not enough distance')
    }

    // 리셋
    setTouchStart(null)
    setTouchEnd(null)
  }

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSwipeEnabled) return
      if (e.key === 'ArrowLeft') goToPrevCard()
      if (e.key === 'ArrowRight') goToNextCard()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSwipeEnabled, currentCardIndex])

  return (
    <div className={styles.container}>
      <div className={styles.mediaRoot}>
        <div
          className={styles.graphics}
          style={{
            opacity: 1
          }}
        >

          {/* CARD - 원본과 동일한 구조 (사용 안함) */}
          <div
            id="card"
            className={styles.scenario}
            style={{
              top: '50%',
              left: '50%',
              width: '267.375px',
              height: '374.325px',
              visibility: 'hidden',
              zIndex: 1,
              transform: 'translateX(-50%) translateY(-50%) scale(1.2)',
              transition: 'all 0.5s cubic-bezier(0.445, 0.05, 0.55, 0.95)'
            }}
          >
            <div
              id="cardChild"
              className={styles.scenarioChild}
              style={{
                transform: 'rotateY(0deg)'
              }}
            >
              <div id="cardFront" className={styles.scene}>
                <div className={styles.cardFrontContent}>
                  <div className={styles.cardHeader}></div>
                  <h2>You're Invited</h2>
                  <p>to our special event</p>
                </div>
              </div>
            </div>
          </div>

          {/* ENVELOPE - 가로로 긴 봉투 */}
          <div
            id="envelope"
            className={styles.scenario}
            onClick={handleEnvelopeClick}
            style={{
              top: '50%',
              left: '50%',
              width: 'min(380px, 75vw)', // 모바일: 화면의 75%
              height: 'min(250px, 48vw)', // 비율 유지
              visibility: 'inherit',
              zIndex: phase === 'initial' ? 1 : 0,
              cursor: hasStarted ? 'default' : 'pointer',
              transform: phase === 'initial'
                ? 'translateX(-50%) translateY(calc(-50% - 28%)) scale(1.0)'
                : 'translateX(-50%) translateY(calc(-50% + 210%)) scale(2.0)',
              transition: 'all 2s cubic-bezier(0.445, 0.05, 0.55, 0.95)'
            }}
          >
            <div id="envelopeChild" className={styles.scenarioChild}>

              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                backgroundColor: '#1a1a1a',
                overflow: 'visible'
              }}>

                {/* 봉투 내부 바닥 (내지) */}
                <div style={{
                  position: 'absolute',
                  width: '90%',
                  height: '100%',
                  top: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 0
                }}>
                  <svg width="100%" height="100%" viewBox="0 0 340 250" preserveAspectRatio="none">
                    <defs>
                      <pattern id="damaskPattern" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
                        <rect width="40" height="40" fill="#F5EFE7"/>
                        <path d="M20 5 Q25 10 20 15 Q15 10 20 5 M20 25 Q25 30 20 35 Q15 30 20 25 M5 20 Q10 25 5 30 Q0 25 5 20 M35 20 Q40 25 35 30 Q30 25 35 20" fill="none" stroke="#E8DCC8" strokeWidth="0.5" opacity="0.6"/>
                      </pattern>
                    </defs>
                    <rect width="340" height="250" fill="url(#damaskPattern)" rx="4"/>
                  </svg>
                </div>

                {/* 아래쪽 플랩 */}
                <svg width="335" height="173" viewBox="0 0 335 173" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ position: 'absolute', width: '100%', height: '100%', top: '3px', left: 0, zIndex: 4, filter: visibleCards.length > 1 ? 'none' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))', opacity: visibleCards.length > 1 ? 0 : 1, transition: 'opacity 1s ease-out, filter 1s ease-out' }}>
                  <defs>
                    <linearGradient id="bottomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2a2a2a" />
                      <stop offset="50%" stopColor="#1a1a1a" />
                      <stop offset="100%" stopColor="#0a0a0a" />
                    </linearGradient>
                  </defs>
                  <path d="M333.604 164.977C333.241 162.314 331.568 159.911 329.015 158.389L180.084 68.9955C172.529 64.4654 162.49 64.4654 154.917 68.9955L5.98593 158.372C3.43302 159.911 1.75983 162.297 1.39759 164.96L0.638619 170.562C0.569621 171.081 1.03535 171.547 1.65633 171.547H333.345C333.949 171.547 334.432 171.081 334.363 170.562L333.604 164.96V164.977Z" fill="url(#bottomGradient)" stroke="rgba(0,0,0,0.5)" strokeWidth="1"/>
                </svg>

                {/* 왼쪽 플랩 */}
                <svg width="335" height="173" viewBox="0 0 335 173" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: 2, filter: visibleCards.length > 1 ? 'none' : 'drop-shadow(-2px 0 8px rgba(0,0,0,0.3))', opacity: visibleCards.length > 1 ? 0 : 1, transition: 'opacity 1s ease-out, filter 1s ease-out' }}>
                  <defs>
                    <linearGradient id="leftGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0a0a0a" />
                      <stop offset="100%" stopColor="#1a1a1a" />
                    </linearGradient>
                  </defs>
                  <path d="M12.8506 0.904175H0.5V172.222C0.5 172.654 0.965734 173 1.51771 173H19.1466L155.469 90.1594C158.177 88.5168 158.177 85.4044 155.469 83.7618L24.0627 3.8782C20.8888 1.94163 16.9387 0.904175 12.8678 0.904175H12.8506Z" fill="url(#leftGradient)" stroke="rgba(0,0,0,0.5)" strokeWidth="1"/>
                </svg>

                {/* 오른쪽 플랩 */}
                <svg width="335" height="173" viewBox="0 0 335 173" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: 3, filter: visibleCards.length > 1 ? 'none' : 'drop-shadow(2px 0 8px rgba(0,0,0,0.3))', opacity: visibleCards.length > 1 ? 0 : 1, transition: 'opacity 1s ease-out, filter 1s ease-out' }}>
                  <defs>
                    <linearGradient id="rightGradient" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#0a0a0a" />
                      <stop offset="100%" stopColor="#1a1a1a" />
                    </linearGradient>
                  </defs>
                  <path d="M322.132 0.904175H334.483V172.222C334.483 172.654 334.017 173 333.465 173H315.836L179.515 90.1594C176.806 88.5168 176.806 85.4044 179.515 83.7618L310.938 3.89551C314.112 1.95893 318.062 0.921483 322.132 0.921483V0.904175Z" fill="url(#rightGradient)" stroke="rgba(0,0,0,0.5)" strokeWidth="1"/>
                </svg>

                {/* 위쪽 뚜껑 (열리는 부분) */}
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '50%',
                    top: 0,
                    left: 0,
                    transformOrigin: 'center top',
                    transform: phase === 'initial'
                      ? 'rotateX(0deg)'
                      : 'rotateX(180deg)',
                    transition: 'transform 0.75s cubic-bezier(0.445, 0.05, 0.55, 0.95), z-index 0s, opacity 1s ease-out',
                    zIndex: phase === 'initial' || phase === 'start' ? 5 : -10,
                    opacity: visibleCards.length > 1 ? 0 : 1, // 뚜껑도 fade out
                    pointerEvents: 'none',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* 뚜껑 외부 (검정) */}
                  <svg
                    width="334"
                    height="125"
                    viewBox="0 0 334 125"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      filter: visibleCards.length > 1 ? 'none' : 'drop-shadow(0 -4px 12px rgba(0,0,0,0.5))',
                      transition: 'filter 1s ease-out'
                    }}
                  >
                    <defs>
                      <linearGradient id="topGradient" x1="50%" y1="100%" x2="50%" y2="0%">
                        <stop offset="0%" stopColor="#0a0a0a" />
                        <stop offset="50%" stopColor="#1a1a1a" />
                        <stop offset="100%" stopColor="#2a2a2a" />
                      </linearGradient>
                    </defs>
                    <path d="M0.897426 7.47704C1.25968 10.4096 2.93296 13.0489 5.486 14.7222L154.425 120.673C161.981 125.659 172.02 125.659 179.593 120.673L328.532 14.7394C331.085 13.0489 332.758 10.4096 333.121 7.49429L333.88 1.31869C333.949 0.749427 333.483 0.231918 332.862 0.231918H167L1.15618 0.231918C0.552421 0.231918 0.069413 0.732176 0.138414 1.31869L0.897426 7.49429V7.47704Z" fill="url(#topGradient)" stroke="rgba(0,0,0,0.5)" strokeWidth="1"/>
                  </svg>

                  {/* 뚜껑 내부 (내지 - 열렸을 때만 보임, 삼각형 모양) */}
                  <div style={{
                    position: 'absolute',
                    width: '90%',
                    height: '100%',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%) rotateX(180deg) scaleY(-1)',
                    zIndex: 1,
                    backfaceVisibility: 'hidden'
                  }}>
                    <svg width="100%" height="100%" viewBox="0 0 300 125" preserveAspectRatio="none">
                      <defs>
                        <pattern id="damaskPatternTop" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
                          <rect width="40" height="40" fill="#F5EFE7"/>
                          <path d="M20 5 Q25 10 20 15 Q15 10 20 5 M20 25 Q25 30 20 35 Q15 30 20 25 M5 20 Q10 25 5 30 Q0 25 5 20 M35 20 Q40 25 35 30 Q30 25 35 20" fill="none" stroke="#E8DCC8" strokeWidth="0.5" opacity="0.6"/>
                        </pattern>
                      </defs>
                      {/* 뚜껑 삼각형 모양 - 뚜껑 외부 path와 동일한 형태 */}
                      <path d="M0 10L4 15L150 125L150 125L150 125L296 15L300 10L299 3L298 0H2L1 3L0 10Z" fill="url(#damaskPatternTop)" opacity="0.95"/>
                    </svg>
                  </div>
                </div>

                {/* 카드 스택 - 봉투 안으로 다시 이동 */}
                {visibleCards.map((card, index) => {
                  const cardPosition = ALL_CARDS.findIndex(c => c.id === card.id)
                  const isCurrentCard = cardPosition === currentCardIndex
                  const cardsBehind = cardPosition - currentCardIndex
                  const isSwiping = swipingCardId === card.id
                  const isNewCard = cardPosition > 0 // 첫 번째 카드가 아니면 새로 추가된 카드

                  // 현재 카드 기준 앞뒤로 1장씩만 렌더링 (성능 최적화)
                  if (cardsBehind < -1 || cardsBehind > 3) return null

                  return (
                    <div
                      key={card.id}
                      id={isCurrentCard ? "envelopeCard" : undefined}
                      className={styles.scene}
                      onTouchStart={isCurrentCard ? onTouchStart : undefined}
                      onTouchMove={isCurrentCard ? onTouchMove : undefined}
                      onTouchEnd={isCurrentCard ? onTouchEnd : undefined}
                      onClick={isCurrentCard ? goToNextCard : undefined}
                      style={{
                        visibility: 'inherit',
                        width: 'min(220px, 42vw)', // 모바일: 화면의 42%
                        height: 'min(340px, 65vw)', // 비율 유지 (340/220 = 1.545)
                        position: 'absolute', // 원래대로 absolute
                        top: '50%',
                        left: '50%',
                        zIndex: phase === 'initial' || phase === 'start' || phase === 'flap-open' || phase === 'card-slide' ? 1 : cardsBehind < 0 ? 5 : (10 - cardsBehind),
                        transform: isSwiping
                          ? 'translateX(calc(-50% - 150%)) translateY(-130%) translateZ(30px) rotate(-15deg) scale(0.9)'
                          : phase === 'initial' || phase === 'start' || phase === 'flap-open'
                          ? 'translateX(-50%) translateY(-50%) translateZ(-0.1px) rotate(-90deg) scale(0.95)'
                          : phase === 'card-slide'
                          ? 'translateX(-50%) translateY(-140%) translateZ(10px) rotate(-90deg) scale(1)'
                          : cardsBehind < 0
                          ? 'translateX(-50%) translateY(calc(-130% - 5px)) translateZ(-5px) rotate(0deg) scale(0.98)'
                          : `translateX(-50%) translateY(calc(-130% + ${cardsBehind * 12}px)) translateZ(${20 - cardsBehind * 8}px) rotate(${cardsBehind * 3}deg) scale(${1 - cardsBehind * 0.02})`,
                        transition: isSwiping
                          ? 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                          : isNewCard
                          ? 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' // 새 카드는 bounce 효과
                          : phase === 'card-rotate'
                          ? 'all 0.8s cubic-bezier(0.445, 0.05, 0.55, 0.95)'
                          : 'all 0.6s cubic-bezier(0.445, 0.05, 0.55, 0.95)', // 스와이프 전환은 부드럽게
                        opacity: isSwiping ? 0 : cardsBehind < 0 ? 0 : (isNewCard && visibleCards.length === 1 ? 0 : 1), // 이전 카드는 투명
                        pointerEvents: isCurrentCard && isSwipeEnabled ? 'auto' : 'none',
                        cursor: isCurrentCard && isSwipeEnabled ? 'grab' : 'default'
                      }}
                    >
                      <div className={styles.envelopeCardInner}>
                        <div className={styles.cardHeaderSmall}>
                          <div className={styles.headerDecoration}>{card.decoration}</div>
                        </div>
                        <div className={styles.cardContent}>
                          <h3 className={styles.cardTitle}>{card.title}</h3>
                          <p className={styles.cardSubtitle}>{card.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}

              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Replay Button */}
      <button onClick={handleReplay} className={styles.replayBtn}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
        </svg>
      </button>

    </div>
  )
}