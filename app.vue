<script setup lang="ts">
import { TheChessboard, type BoardApi, type SquareKey, type Promotion } from 'vue3-chessboard'
import { Chess, type Move } from 'chess.js'
import stockfishImg from '/stockfish.png'
import 'vue3-chessboard/style.css'
import { useStockfish } from '~/composables/useStockfish'

const currentFen = ref<string | undefined>()

const playerColor = ref<'w' | 'b'>('w')

const colorMap = {
  w: 'white',
  b: 'black',
} as const

const { calculateBestMove, lastMoveByStockfish } = useStockfish()

let boardApi: BoardApi | undefined

const isPlayerTurn = computed(() => {
  const chess = new Chess(currentFen.value)
  return chess.turn() === playerColor.value
})

const makeStockfishMove = ({
  from,
  to,
  promotion,
}: {
  from: SquareKey
  to: SquareKey
  promotion?: Promotion
}) => {
  if (isPlayerTurn.value) return
  boardApi?.move({ from, to, promotion })
}

watch(lastMoveByStockfish, (move) => {
  if (move) {
    makeStockfishMove(move)
  }
})

const onMove = (move: Move) => {
  currentFen.value = move.after
  if (!isPlayerTurn.value) {
    calculateBestMove({ fen: move.after })
  }
}

const restartGame = (color: 'w' | 'b') => {
  playerColor.value = color
  currentFen.value = new Chess().fen()
  boardApi?.resetBoard()

  if (!isPlayerTurn.value) {
    calculateBestMove({ fen: currentFen.value })
  }
}

const copyPgn = () => {
  const pgn = boardApi?.getPgn()
  if (pgn) {
    navigator.clipboard.writeText(pgn)
  }
}
</script>

<template>
  <div class="chessboard-wrapper">
    <div class="name-opponent">
      <img
        :src="stockfishImg"
        alt="stockfish"
        width="50px"
        height="50px"
      >
      <b>Stockfish</b>
    </div>
    <TheChessboard
      :key="playerColor"
      :player-color="colorMap[playerColor]"
      :board-config="{
        orientation: colorMap[playerColor],
      }"
      @move="onMove"
      @board-created="api => (boardApi = api)"
    />
    <div class="bottom-buttons">
      <button @click="copyPgn">
        Copy PGN to Clipboard
      </button>
      <div class="restart-buttons">
        <button @click="restartGame('w')">
          Restart as White
        </button>
        <button @click="restartGame('b')">
          Restart as Black
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chessboard-wrapper {
  border: 4px solid black;
  background-color: #262421;
  color: rgb(235, 235, 235);
}
.name-opponent {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  font-size: 1.1rem;
}

.restart-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.bottom-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px;
  @media (width <= 768px) {
    flex-direction: column;
    gap: 20px;
  }
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #333;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 0 1px 2px rgba(0, 0, 0, 0.1);
  color: whitesmoke;
}
button:hover {
  filter: brightness(1.1);
}
</style>
