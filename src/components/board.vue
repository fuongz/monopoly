<template>
  <div class="flex w-full flex-wrap h-screen overflow-hidden relative">
    <div
      class="absolute left-1/2 top-1/2 z-100 -translate-y-1/2 -translate-x-1/2 transform text-center text-gray-700"
    >
      <!-- Roll dice -->
      <span
        class="bg-purple-600 text-white rounded font-medium mx-auto px-12 py-4 border-0 focus:outline-0 mb-4 block cursor-pointer select-none"
        @click.prevent="rollDice"
      >
        Xúc xắc
      </span>

      <!-- Current Dice -->
      <p v-if="boardData.lastDice" class="mb-2">
        <span>Điểm xúc xắc: </span>
        <span class="font-semibold">{{ boardData.lastDice }}</span>
      </p>

      <!-- Current Player -->
      <template v-if="boardData.currentPlayer">
        <p>
          <span>Người chơi hiện tại: </span>
          <span class="font-semibold">{{ boardData.currentPlayer.name }}</span>
        </p>
      </template>

      <!-- Current Player -->
      <template v-if="playerData.players">
        <p
          v-for="player in playerData.players"
          :key="`player-info-${player.id}`"
        >
          <span>{{ player.name }} - </span>
          <span class="font-semibold">{{ player.money }}</span>
        </p>
      </template>
    </div>
    <div
      v-for="(block, index) in boardData.blocks"
      :key="index"
      class="board-block"
      :class="[
        {
          'board-block--span': block.isBlank,
          'font-semibold': block.isBold,
        },
        `board-block--bg-color-${block.backgroundColor}`,
      ]"
    >
      <!-- Player -->
      <div
        v-for="player in playerData.players"
        :key="`player-${player.id}`"
        class="absolute bottom-4 w-full flex items-center justify-center"
      >
        <div
          v-if="player.position === block.position"
          class="player"
          :class="[`player-${player.id}`]"
        ></div>
      </div>

      {{ block.isBlank ? '' : block.content }}
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, reactive } from 'vue'
  import board from '@/board.json'
  import { PlayerStatus } from '@/enums/playerStatus.enum'

  interface Block {
    content: string
    isBlank: boolean
    isBold: boolean
    event?: string
    icon?: string
    backgroundColor: string
    index: number
    position: number
    name?: string
  }

  interface BoardData {
    lastDice: null | number
    currentPlayer: Player | null
    blocks: Block[]
    nonBlankBlocks: Block[]
    totalBlocks: number
  }

  interface PlayerData {
    players: Player[]
  }

  interface Player {
    id: number
    name: string
    position: number
    money: number
    status: PlayerStatus
  }

  const boardData = reactive<BoardData>({
    lastDice: null,
    currentPlayer: null,
    blocks: [],
    nonBlankBlocks: [],
    totalBlocks: 0,
  })

  const playerData = reactive<PlayerData>({
    players: [
      {
        id: 1,
        name: 'Player 1',
        position: 41,
        money: 2000,
        status: PlayerStatus.PLAYING,
      },

      {
        id: 2,
        name: 'Player 2',
        position: 41,
        money: 2000,
        status: PlayerStatus.PLAYING,
      },
    ],
  })

  onMounted(() => {
    // Set board data
    boardData.currentPlayer = playerData.players[0]
    boardData.blocks = board.sort((a, b) => a.index - b.index)
    boardData.nonBlankBlocks = boardData.blocks
      .filter((block) => !block.isBlank)
      .sort((a, b) => a.position - b.position)

    boardData.totalBlocks = boardData.nonBlankBlocks.length

    // Set player data
    playerData.players.map((player) => {
      player.position = boardData.nonBlankBlocks[0].position || 0
    })
  })

  const nextPlayer = (currentPlayerIndex: number, isMe = false) => {
    if (isMe === true) {
      boardData.currentPlayer = playerData.players[currentPlayerIndex]
    } else {
      if (currentPlayerIndex < playerData.players.length - 1) {
        boardData.currentPlayer = playerData.players[currentPlayerIndex + 1]
      } else if (currentPlayerIndex >= playerData.players.length - 1) {
        boardData.currentPlayer = playerData.players[0]
      }
    }
  }

  const rollDice = (): void => {
    if (boardData.currentPlayer) {
      const currentPlayerIndex = playerData.players.findIndex(
        (player) => player.id === boardData.currentPlayer?.id
      )

      if (currentPlayerIndex !== -1) {
        const currentPlayer = playerData.players[currentPlayerIndex]

        const dice1 = Math.floor(Math.random() * 6) + 1
        const dice2 = Math.floor(Math.random() * 6) + 1
        const roll = dice1 + dice2
        boardData.lastDice = roll
        let isDouble = false

        console.log('----')
        console.log(`Player ${currentPlayer.id} rolled ${roll}`)
        console.log('Dice 1: ', dice1)
        console.log('Dice 2: ', dice2)

        if (dice1 === dice2) {
          console.log('Double!')
          isDouble = true
        }

        if (currentPlayer.status === PlayerStatus.IN_JAIL) {
          if (isDouble) {
            console.log('Player is out of jail!')
            currentPlayer.status = PlayerStatus.PLAYING

            isDouble = false
            nextPlayer(currentPlayerIndex, true)
            return
          } else {
            nextPlayer(currentPlayerIndex)
            return
          }
        }

        const currentPos = boardData.nonBlankBlocks.find((block) => {
          return (
            block.position === playerData.players[currentPlayerIndex].position
          )
        })

        if (currentPos) {
          let numNext = currentPos.position + roll

          if (numNext > boardData.totalBlocks) {
            numNext = numNext - boardData.totalBlocks
            playerData.players[currentPlayerIndex].money += 2000
          }

          const nextPos = boardData.nonBlankBlocks.find((block) => {
            return block.position === numNext
          })

          if (nextPos) {
            if (nextPos.event && nextPos.event === 'goToJail') {
              console.log('Go to jail')
              playerData.players[currentPlayerIndex].position =
                boardData.nonBlankBlocks.find((block) => {
                  return block.name === 'jail'
                })?.position || 0
              playerData.players[currentPlayerIndex].status =
                PlayerStatus.IN_JAIL
            } else {
              playerData.players[currentPlayerIndex].position = nextPos.position
            }

            nextPlayer(currentPlayerIndex, isDouble)
          }
        }
      }
    }
  }
</script>

<style scoped>
  .board-block {
    @apply relative w-1/12 h-auto border bg-gray-300 text-gray-800 flex items-center justify-center;
  }

  .board-block--span {
    @apply w-10/12 border-0 bg-white block;
  }

  .board-block--bg-color-blue {
    @apply bg-blue-300 text-blue-800;
  }

  .board-block--bg-color-black {
    @apply bg-gray-600 text-white;
  }

  /* Player */
  .player {
    @apply absolute w-4 h-4 rounded-full bg-blue-500 bottom-4;
  }

  .player-2 {
    @apply bg-red-500;
  }
</style>
