// §8 Tutorial step machine — Q1 (T1-T7) and Q2 (T8)
import { bus } from '../core/EventBus'

export type Q1StepId = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7'

export interface TutorialStepDef {
  id: Q1StepId | 'T8'
  message: string
  highlight: 'gen_clue' | 'gen_lifestyle' | 'deliver_btn' | null
}

export const Q1_STEPS: TutorialStepDef[] = [
  { id: 'T1', message: '이곳이 머지 보드입니다. 빛나는 아이콘이 단서 생성기예요.', highlight: 'gen_clue' },
  { id: 'T2', message: '탭해서 단서를 만들어보세요.', highlight: 'gen_clue' },
  { id: 'T3', message: '잘하셨어요! 같은 단서를 두 개 더 만들어볼까요?', highlight: 'gen_clue' },
  { id: 'T4', message: '두 개를 겹쳐보세요. 합성됩니다.', highlight: null },
  { id: 'T5', message: '축하합니다! L2 단서를 만드셨군요. 계속 합성해서 요구 아이템을 모아보세요.', highlight: null },
  { id: 'T6', message: '민지의 [전달] 버튼이 빛나고 있습니다. 탭하세요.', highlight: 'deliver_btn' },
  { id: 'T7', message: '수사 포인트가 올라갔어요. 목표까지 계속해주세요!', highlight: null },
]

export const T8_STEP: TutorialStepDef = {
  id: 'T8',
  message: '새로운 단서 생성기가 도착했습니다. 라이프스타일 단서로 사람의 취향을 알아낼 수 있어요.',
  highlight: 'gen_lifestyle',
}

export class TutorialSystem {
  private q1Index = -1  // -1=미시작, 0-6=단계, 7=완료
  private q2Done = false
  private onChange: ((step: TutorialStepDef | null) => void) | null = null
  private firstDelivered = false

  onStepChange(cb: (step: TutorialStepDef | null) => void): void {
    this.onChange = cb
  }

  // ── Q1 Tutorial ──────────────────────────────────────────────────────────

  startQ1(): void {
    if (this.q1Index >= 0) return
    this.q1Index = 0
    this.emit()

    // T2: T1 표시 1.5초 후 자동 진행
    setTimeout(() => {
      if (this.q1Index === 0) this.advanceQ1()
    }, 1500)

    bus.on('merge:success', this.onMergeSuccess)
  }

  /**
   * BoardScene의 updateQuestState()에서 매 보드 변경 시 호출.
   * @param l1clue  보드 위 chain_clue L1 개수
   * @param l2clue  보드 위 chain_clue L2 개수
   * @param isDeliverable  현재 전달 가능 여부 (모든 Requirements 충족)
   */
  checkBoardState(l1clue: number, _l2clue: number, isDeliverable: boolean): void {
    // T4: L1 단서 2개 이상 → "겹쳐보세요" 안내
    if (this.q1Index === 2 && l1clue >= 2) {
      this.advanceQ1()
      return
    }
    // T6: 모든 Requirements 충족 후에만 "전달 버튼 탭" 안내
    // (l2clue 조건 제거 — isDeliverable로만 판단)
    if (this.q1Index === 4 && isDeliverable) {
      this.advanceQ1()
    }
  }

  private onMergeSuccess = (): void => {
    if (this.q1Index === 3) this.advanceQ1()  // T5: 첫 머지 완료
  }

  /** 생성기 첫 더블탭 시 GeneratorSystem이 호출 */
  notifyFirstSpawn(): void {
    if (this.q1Index === 1) this.advanceQ1()  // T3
  }

  /** 첫 전달 완료 시 BoardScene이 호출 */
  notifyDelivered(): void {
    if (this.q1Index === 5 && !this.firstDelivered) {
      this.firstDelivered = true
      this.advanceQ1()  // T7
      setTimeout(() => {
        if (this.q1Index === 6) this.completeQ1()
      }, 2000)
    }
  }

  private advanceQ1(): void {
    this.q1Index++
    if (this.q1Index >= Q1_STEPS.length) {
      this.completeQ1()
      return
    }
    this.emit()
  }

  private completeQ1(): void {
    this.q1Index = 7
    bus.off('merge:success', this.onMergeSuccess)
    this.onChange?.(null)
  }

  skipQ1(): void {
    this.q1Index = 7
    bus.off('merge:success', this.onMergeSuccess)
    this.onChange?.(null)
  }

  isQ1Done(): boolean {
    return this.q1Index >= 7
  }

  // ── Q2 Tutorial (T8) ─────────────────────────────────────────────────────

  startQ2(): void {
    if (this.q2Done) return
    this.q2Done = true
    this.onChange?.(T8_STEP)
    setTimeout(() => this.onChange?.(null), 5000)
  }

  isQ2Done(): boolean {
    return this.q2Done
  }

  // ── Internal ─────────────────────────────────────────────────────────────

  private emit(): void {
    const step = Q1_STEPS[this.q1Index]
    this.onChange?.(step ?? null)
  }

  destroy(): void {
    bus.off('merge:success', this.onMergeSuccess)
  }
}
