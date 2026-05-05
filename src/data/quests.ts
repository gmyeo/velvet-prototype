// §5.2.2 Order data structures + §7 quest scenarios

export interface OrderRequirementDef {
  itemChainId: string
  itemLevel: number
  requiredCount: number
  clientDialogue: string
  renComment: string
  points: number
}

export interface OrderDef {
  id: string
  type: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  difficulty: '★' | '★★' | '★★★'
  clientName: string
  clientAge: string
  clientIntro: string
  generatorIds: string[]
  requirements: OrderRequirementDef[]
  goalPoints: number
  rewardXP: number
  rewardCoins: number
  rewardFame: number
  // §5.3.8 closing cut
  closingBgColor: number
  closingCaption: string
  // §7 outro
  clientOutro: string
  renOutro: string
}

export const ORDERS: OrderDef[] = [
  // ── Q1: 사라진 미오 ──────────────────────────────────────────────────────
  {
    id: 'q1_lost_cat',
    type: 'Q1',
    difficulty: '★',
    clientName: '민지',
    clientAge: '24 / 동네 카페 사장',
    clientIntro: '고양이 미오가 3일째 안 들어와요...',
    generatorIds: ['gen_clue', 'gen_tool'],
    requirements: [
      {
        itemChainId: 'chain_clue',
        itemLevel: 2,
        requiredCount: 2,
        clientDialogue: '동네 사람들에게 물어봐 주세요.',
        renComment: '옆집 할머니가 미오를 봤다는군요.',
        points: 20,
      },
      {
        itemChainId: 'chain_tool',
        itemLevel: 3,
        requiredCount: 1,
        clientDialogue: '혹시 발자국이라도...',
        renComment: '골목 벽에 작은 발톱 자국이 있습니다.',
        points: 30,
      },
      {
        itemChainId: 'chain_clue',
        itemLevel: 4,
        requiredCount: 1,
        clientDialogue: '어디 있는지 알 수 있을까요?',
        renComment: '찾았습니다. 두 블록 떨어진 카페입니다.',
        points: 50,
      },
    ],
    goalPoints: 100,
    rewardXP: 100,
    rewardCoins: 50,
    rewardFame: 30,
    closingBgColor: 0xd4a97a,
    closingCaption: '사건 종결 — 미오, 무사 귀가',
    clientOutro: '"미오야! 정말 거기 있었어..!\n탐정님, 정말 정말 감사해요."',
    renOutro: '"미오를 데리고 따뜻한 차나 한 잔 하시죠.\n그게 보답입니다."',
  },

  // ── Q2: 그 사람의 마음 ───────────────────────────────────────────────────
  {
    id: 'q2_crush_style',
    type: 'Q2',
    difficulty: '★',
    clientName: '유리',
    clientAge: '26 / 마케터',
    clientIntro: '회사 선배를 1년째 좋아해요. 그 사람 취향을 알고 싶어요.',
    generatorIds: ['gen_clue', 'gen_tool', 'gen_lifestyle'],
    requirements: [
      {
        itemChainId: 'chain_lifestyle',
        itemLevel: 2,
        requiredCount: 2,
        clientDialogue: '선배의 SNS를 좀 봐주실래요?',
        renComment: '공원 카페를 자주 가시는 분이군요.',
        points: 30,
      },
      {
        itemChainId: 'chain_clue',
        itemLevel: 3,
        requiredCount: 1,
        clientDialogue: '선배 친구한테도 물어봐 주세요.',
        renComment: '조용한 사람을 좋아한다는 증언입니다.',
        points: 40,
      },
      {
        itemChainId: 'chain_lifestyle',
        itemLevel: 3,
        requiredCount: 1,
        clientDialogue: '자주 가는 곳도 알고 싶어요.',
        renComment: '주말마다 독립서점에 가시네요.',
        points: 50,
      },
      {
        itemChainId: 'chain_lifestyle',
        itemLevel: 5,
        requiredCount: 1,
        clientDialogue: '결국, 어떤 사람을 좋아하나요?',
        renComment: '정리됐습니다. 차분하고 책 좋아하는 분이군요.',
        points: 80,
      },
    ],
    goalPoints: 200,
    rewardXP: 200,
    rewardCoins: 100,
    rewardFame: 80,
    closingBgColor: 0xc4728a,
    closingCaption: '사건 종결 — 편지는 전달되었다',
    clientOutro: '"이거... 정말 대단해요! 이대로 다가가면 될까요?"',
    renOutro: '"정보는 도구일 뿐입니다. 결국 마음을 보여주시는 건 본인이죠."',
  },

  // ── Q3: 남편의 비밀 ──────────────────────────────────────────────────────
  {
    id: 'q3_husband_secret',
    type: 'Q3',
    difficulty: '★★',
    clientName: '수아',
    clientAge: '32 / 프리랜서 디자이너',
    clientIntro: '남편이 요즘 이상해요. 사실인지 아닌지만 알고 싶어요.',
    generatorIds: ['gen_clue', 'gen_tool', 'gen_lifestyle'],
    requirements: [
      {
        itemChainId: 'chain_lifestyle',
        itemLevel: 4,
        requiredCount: 1,
        clientDialogue: '남편의 일정표 좀 확인해주세요.',
        renComment: '수요일마다 비어있는 시간이 있습니다.',
        points: 60,
      },
      {
        itemChainId: 'chain_tool',
        itemLevel: 4,
        requiredCount: 1,
        clientDialogue: '어디로 가는지 따라가 봐주세요.',
        renComment: '강남의 한 호텔로 향했습니다.',
        points: 80,
      },
      {
        itemChainId: 'chain_tool',
        itemLevel: 5,
        requiredCount: 1,
        clientDialogue: '...사진은 가능할까요?',
        renComment: '찍었습니다. 보시는 게 괜찮으시겠습니까.',
        points: 110,
      },
      {
        itemChainId: 'chain_clue',
        itemLevel: 5,
        requiredCount: 1,
        clientDialogue: '정리해주세요. 마주할 준비가 됐어요.',
        renComment: '보고서입니다. 어떤 결정이든 곁에서 돕겠습니다.',
        points: 100,
      },
    ],
    goalPoints: 350,
    rewardXP: 400,
    rewardCoins: 200,
    rewardFame: 200,
    closingBgColor: 0x7a9e7e,
    closingCaption: '사건 종결 — 진실은 기록에 남는다',
    clientOutro: '"...역시. 그렇군요.\n감사해요. 흔들리지 않을 수 있게 됐어요."',
    renOutro: '"어떤 결정을 하시든, 이 사무소는 늘 비밀을 지킵니다."',
  },

  // ── Q4: 사라진 별빛 ──────────────────────────────────────────────────────
  {
    id: 'q4_stolen_diamond',
    type: 'Q4',
    difficulty: '★★★',
    clientName: '혜진',
    clientAge: '45 / 갤러리 대표',
    clientIntro: '가문의 다이아몬드 "별빛"이 사라졌어요. 조용히 처리해주세요.',
    generatorIds: ['gen_clue', 'gen_tool', 'gen_trace'],
    requirements: [
      {
        itemChainId: 'chain_clue',
        itemLevel: 4,
        requiredCount: 1,
        clientDialogue: '현장을 살펴봐 주세요.',
        renComment: '현장은 그날 밤 그대로 보존돼 있군요.',
        points: 60,
      },
      {
        itemChainId: 'chain_trace',
        itemLevel: 3,
        requiredCount: 2,
        clientDialogue: '지문이 남아있을까요?',
        renComment: '두 사람의 지문이 검출됐습니다.',
        points: 100,
      },
      {
        itemChainId: 'chain_tool',
        itemLevel: 4,
        requiredCount: 1,
        clientDialogue: '용의자들의 알리바이를...',
        renComment: '한 사람의 알리바이가 무너졌습니다.',
        points: 100,
      },
      {
        itemChainId: 'chain_trace',
        itemLevel: 5,
        requiredCount: 1,
        clientDialogue: '확실한 증거가 필요해요.',
        renComment: 'DNA가 일치합니다. 새로 들인 가정부였습니다.',
        points: 140,
      },
      {
        itemChainId: 'chain_clue',
        itemLevel: 5,
        requiredCount: 1,
        clientDialogue: '별빛은... 어디에?',
        renComment: '회수했습니다. 무사합니다.',
        points: 100,
      },
    ],
    goalPoints: 500,
    rewardXP: 700,
    rewardCoins: 500,
    rewardFame: 400,
    closingBgColor: 0x2c3e6b,
    closingCaption: '사건 종결 — 별빛은 꺼지지 않았다',
    clientOutro: '"...정말 돌아왔군요.\n제 의심을, 알아봐 주신 건 당신뿐이에요."',
    renOutro: '"재단의 만찬, 다음에도 안전하게 진행하시길."',
  },
]

export function getOrder(id: string): OrderDef {
  const order = ORDERS.find(o => o.id === id)
  if (!order) throw new Error(`Unknown order: ${id}`)
  return order
}

export function getNextOrderId(currentId: string): string | null {
  const ids = ORDERS.map(o => o.id)
  const idx = ids.indexOf(currentId)
  return idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null
}
