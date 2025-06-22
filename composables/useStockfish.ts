import type { Square } from 'chess.js'
import type { Promotion } from 'vue3-chessboard'

type StockfishMove = {
  from: Square
  to: Square
  promotion?: Promotion
}

const parseMove = (move: string): StockfishMove => {
  const from = move.slice(0, 2) as Square
  const to = move.slice(2, 4) as Square
  const promotion = move.length > 4 ? move.slice(4, 5) as Promotion : undefined
  return { from, to, promotion }
}

export const useStockfish = () => {
  let stockfish: Worker | undefined
  const lastMoveByStockfish = ref<StockfishMove | undefined>()

  const initStockfish = async () => {
    if (import.meta.server) return
    const wasmSupported
      = typeof WebAssembly === 'object'
        && WebAssembly.validate(
          Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00),
        )
    stockfish = new Worker(
      wasmSupported ? '/stockfish.wasm.js' : '/stockfish.js',
    )

    stockfish.postMessage('uci')
    stockfish.postMessage('ucinewgame')
    stockfish.postMessage('position startpos')

    stockfish.onmessage = (event: MessageEvent) => {
      const line = event.data
      if (line.includes('bestmove')) {
        try {
          const move = line.split(' ')[1]
          if (move) {
            lastMoveByStockfish.value = parseMove(move)
          }
        }
        catch (e) {
          console.error('Error parsing best move:', e)
        }
      }
    }
    stockfish.onerror = (event: ErrorEvent) => {
      console.error('error', event)
    }
  }

  const calculateBestMove = ({
    fen,
    depth = 10,
    movetime = 100,
  }: {
    fen: string
    depth?: number
    movetime?: number
  }) => {
    if (!stockfish) {
      // eslint-disable-next-line no-console
      console.warn('Stockfish not initialized')
      return
    }
    stockfish.postMessage(`position fen ${fen}`)
    stockfish.postMessage(`go depth ${depth}`)
    stockfish.postMessage(`go movetime ${movetime}`)
  }

  onMounted(() => {
    initStockfish()
  })

  onUnmounted(() => {
    stockfish?.terminate()
  })

  return {
    calculateBestMove,
    lastMoveByStockfish: readonly(lastMoveByStockfish),
  }
}
