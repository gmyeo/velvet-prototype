export interface ChainDef {
  id: string
  name: string
  maxLevel: number
  itemNames: string[]
  spriteKeys: string[]
  toneColor: number
  levelColors: number[]
}

export const CHAINS: ChainDef[] = [
  {
    id: 'chain_clue',
    name: '단서',
    maxLevel: 6,
    itemNames: ['종이 쪽지', '메모', '편지', '사진', '문서철', '비밀 서류함'],
    spriteKeys: ['clue_1', 'clue_2', 'clue_3', 'clue_4', 'clue_5', 'clue_6'],
    toneColor: 0xd9b382,
    levelColors: [0x7ba7d4, 0x5b8fc4, 0x3a76b4, 0x2a5a98, 0x1a4078, 0x0d2a58],
  },
  {
    id: 'chain_tool',
    name: '도구',
    maxLevel: 6,
    itemNames: ['자물쇠 핀', '작은 돋보기', '큰 돋보기', '망원경', '카메라', '첩보 가방'],
    spriteKeys: ['tool_1', 'tool_2', 'tool_3', 'tool_4', 'tool_5', 'tool_6'],
    toneColor: 0xc47a3a,
    levelColors: [0xe8a86a, 0xd4875a, 0xb86840, 0x9a4e28, 0x7a3510, 0x5a2000],
  },
  {
    id: 'chain_trace',
    name: '흔적',
    maxLevel: 6,
    itemNames: ['머리카락', '발자국 본', '지문 카드', '증거 봉투', 'DNA 샘플', '분석 보고서'],
    spriteKeys: ['trace_1', 'trace_2', 'trace_3', 'trace_4', 'trace_5', 'trace_6'],
    toneColor: 0x4a8c6a,
    levelColors: [0x8fd4b0, 0x6ab890, 0x4a9c70, 0x2e7e52, 0x1a6038, 0x0a4020],
  },
  {
    id: 'chain_lifestyle',
    name: '라이프스타일',
    maxLevel: 6,
    itemNames: ['SNS 스크린샷', '영수증', '동선 사진', '일정표 메모', '취향 카드', '라이프스타일 프로파일'],
    spriteKeys: ['lifestyle_1', 'lifestyle_2', 'lifestyle_3', 'lifestyle_4', 'lifestyle_5', 'lifestyle_6'],
    toneColor: 0xc4728a,
    levelColors: [0xf0b8c8, 0xe090a8, 0xcc6888, 0xb04870, 0x8c2858, 0x681040],
  },
]

export function getChain(id: string): ChainDef {
  const chain = CHAINS.find(c => c.id === id)
  if (!chain) throw new Error(`Unknown chain: ${id}`)
  return chain
}
