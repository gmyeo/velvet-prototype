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
  { id: 'T5', message: '축하합니다! L2 단서를 만드셨군요. 같은 방법으로 L2 단서를 두 개 만들어 주세요.', highlight: null },
  { id: 'T6', message: '민지의 [전달] 버튼이 빛나고 있습니다. 탭하세요.', highlight: 'deliver_btn' },
  { id: 'T7', message: '수사 포인트가 올라갔어요. 목표까지 계속해주세요!', highlight: null },
]

export const T8_STEP: TutorialStepDef = {
  id: 'T8',
  message: '새로운 단서 생성기가 도착했습니다. 라이프스타일 단서로 사람의 취향을 알아낼 수 있어요.',
  highlight: 'gen_lifestyle',
}

export class TutorialSystem {
  private q1Index = -1  // -1=not started, 0-6=step, 7=done
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

    // T2 fires 1.5s after T1
    setTimeout(() => {
      if (this.q1Index === 0) this.advanceQ1()
    }, 1500)

    bus.on('merge:success', this.onMergeSuccess)
  }

  /** BoardScene calls this after every board rescan */
  checkBoardState(l1clue: number, l2clue: number): void {
    // T4: 2× L1 exist → prompt merge
    if (this.q1Index === 2 && l1clue >= 2) {
      this.advanceQ1()
    }
    // T6: 2× L2 exist → prompt deliver
    if (this.q1Index === 4 && l2clue >= 2) {
      this.advanceQ1()
    }
  }

  private onMergeSuccess = (): void => {
    if (this.q1Index === 3) this.advanceQ1()  // T5: first merge complete
  }

  /** Called by GeneratorSystem on first manual spawn */
  notifyFirstSpawn(): void {
    if (this.q1Index === 1) this.advanceQ1()  // T3
  }

  /** Called by BoardScene after first delivery */
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
