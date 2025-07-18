const chess = require('chess')

const {
  log,
  debug,
  preLog,
  getGame,
  isWhiteTurn,
  isWhiteUser,
  isBlackUser,
  makeUserLog,
} = require('@/helpers')
const { board, actions, promotion } = require('@/keyboards')

// eslint-disable-next-line id-length
const sortFunction = (a, b) => JSON.stringify(a) > JSON.stringify(b) ? 1 : -1

const mapFunction = ({ dest }) => dest

const statusMessage = ({ isCheck, isCheckmate, isRepetition }) => `
${isCheck ? '|ŞAH|' : ''}${isCheckmate ? '|MAT|' : ''}${isRepetition ? '|TEKRAR|' : ''}`

const topMessage = (whiteTurn, player, enemy) => whiteTurn
  ? `Beyaz (üst): ${player.first_name}
Siyah (alt): [${enemy.first_name}](tg://user?id=${enemy.id})
Siyahın sırası | [Sohbet](https://t.me/${process.env.DISCUSSION_GROUP})`
  : `Siyah (üst): ${player.first_name}
Beyaz (alt): [${enemy.first_name}](tg://user?id=${enemy.id})
Beyazın sırası | [Sohbet](https://t.me/${process.env.DISCUSSION_GROUP})`

module.exports = () => [
  /^([a-h])([1-8])([QRNB])?$/,
  async (ctx) => {
    if (ctx.game.busy) {
      return ctx.answerCbQuery()
    }

    ctx.game.busy = true

    const gameEntry = await getGame(ctx)

    if (typeof gameEntry === 'boolean') {
      return gameEntry
    }

    if (!isBlackUser(gameEntry, ctx) && !isWhiteUser(gameEntry, ctx)) {
      ctx.game.busy = false
      return ctx.answerCbQuery('Üzgünüm, bu oyun meşgul. Yeni bir tane başlatmayı deneyin.')
    }

    ctx.game.entry = gameEntry
    ctx.game.config = JSON.parse(gameEntry.config) || { rotation: 'dynamic' }

    const gameMoves = await ctx.db('moves')
      .where('game_id', gameEntry.id)
      .orderBy('created_at', 'asc')
      .select()

    if ((isWhiteTurn(gameMoves) && isBlackUser(gameEntry, ctx)) ||
      (!isWhiteTurn(gameMoves) && isWhiteUser(gameEntry, ctx))) {
      ctx.game.busy = false
      return ctx.answerCbQuery('Lütfen bekleyin. Şu an sizin sıranız değil.')
    }

    const gameClient = chess.create({ PGN: true })

    gameMoves.forEach(({ entry }) => {
      try {
        gameClient.move(entry)
      } catch (error) {
        debug(error)
      }
    })

    const enemy = await ctx.db('users')
      .where('id', isWhiteUser(gameEntry, ctx)
        ? Number(gameEntry.blacks_id)
        : Number(gameEntry.whites_id))
      .first()
      .catch(debug)

    let status = gameClient.getStatus()
    const pressed = status.board.squares
      .find(({ file, rank }) => file === ctx.match[1] && rank === Number(ctx.match[2]))

    if (
      !ctx.game.selected &&
      (!pressed ||
      !pressed.piece ||
      (pressed.piece.side.name === 'black' && isWhiteTurn(gameMoves)) ||
      (pressed.piece.side.name === 'white' && !isWhiteTurn(gameMoves)))
    ) {
      ctx.game.busy = false
      return ctx.answerCbQuery()
    }
    /**
     * Bir taş seçimi
     */
    if (
      pressed && pressed.piece &&
      ((pressed.piece.side.name === 'white' && isWhiteTurn(gameMoves)) ||
      (pressed.piece.side.name === 'black' && !isWhiteTurn(gameMoves))) &&
      !(ctx.game.selected &&
        pressed.file === ctx.game.selected.file &&
        pressed.rank === ctx.game.selected.rank)
    ) {
      const allowedMoves = Object.keys(status.notatedMoves)
        .filter((key) => status.notatedMoves[key].src === pressed)
        .map((key) => ({ ...status.notatedMoves[key], key }))

      if (
        ((!ctx.game.allowedMoves || ctx.game.allowedMoves.length === 0) &&
          allowedMoves.length === 0) ||
        (ctx.game.allowedMoves && ctx.game.allowedMoves.length === allowedMoves.length &&
          JSON.stringify(ctx.game.allowedMoves.map(mapFunction).sort(sortFunction)) === JSON.stringify(allowedMoves.map(mapFunction).sort(sortFunction)))
      ) {
        ctx.game.allowedMoves = allowedMoves
        ctx.game.selected = pressed

        ctx.game.busy = false
        return ctx.answerCbQuery(`${pressed.piece.type} ${pressed.file}${pressed.rank}`)
      }

      ctx.game.lastBoard = board({
        board: status.board.squares.map((square) => {
          const move = allowedMoves
            .find((({ file, rank }) => ({ dest }) => dest.file === file &&
              dest.rank === rank)(square))

          return move ? { ...square, move } : square
        }),
        isWhite: ctx.game.config.rotation === 'dynamic'
          ? isWhiteTurn(gameMoves)
          : ctx.game.config.rotation === 'whites',
        actions: actions(),
      })

      await ctx.editMessageReplyMarkup(ctx.game.lastBoard.reply_markup)
        .catch((error) => {
          debug(error)
          debug(ctx.update)
          debug(ctx.game)
        })

      ctx.game.allowedMoves = allowedMoves
      ctx.game.selected = pressed

      ctx.game.busy = false
      return ctx.answerCbQuery(`${pressed.piece.type} ${pressed.file}${pressed.rank}`)
    }

    /**
     * Bir hedef seçimi
     */
    if (ctx.game.selected) {
      if (
        ctx.game.selected.piece.type === 'pawn' &&
        (
          (isWhiteTurn(gameMoves) && ctx.game.selected.rank === 7 && pressed.rank === 8) ||
          (!isWhiteTurn(gameMoves) && ctx.game.selected.rank === 2 && pressed.rank === 1)
        ) &&
        !ctx.game.promotion
      ) {
        ctx.game.promotion = pressed

        const makeMoves = ctx.game.allowedMoves.filter(
          ({ dest: { file, rank } }) => file === pressed.file && rank === pressed.rank,
        )
        const keyboardRow = promotion({ makeMoves, pressed })
        const board = ctx.game.lastBoard.reply_markup

        board.inline_keyboard.unshift(keyboardRow)

        await ctx.editMessageReplyMarkup(board)
          .catch(debug)

        ctx.game.busy = false
        return ctx.answerCbQuery()
      }

      let makeMove
      // let topMessageText = topMessage(
      //   !isWhiteTurn(gameMoves),
      //   enemy,
      //   ctx.from,
      // )

      if (ctx.game.promotion) {
        makeMove = ctx.game.allowedMoves.find(({ key, dest: { file, rank } }) => (
          file === pressed.file && rank === pressed.rank && key.endsWith(ctx.match[3])
        ))
        ctx.game.promotion = null
      } else {
        makeMove = ctx.game.allowedMoves.find(
          ({ dest: { file, rank } }) => file === pressed.file && rank === pressed.rank,
        )
      }

      if (makeMove) {
        try {
          gameClient.move(makeMove.key)
        } catch (error) {
          debug(error)
        }

        await ctx.db('moves').insert({
          game_id: ctx.game.entry.id,
          entry: makeMove.key,
        }).catch(debug)

        log(
          preLog('MOVE', `${gameEntry.id} ${makeMove.key} ${gameMoves.length + 1} ${makeUserLog(ctx.from)}`),
          ctx,
        )
      }

      status = gameClient.getStatus()

      ctx.game.lastBoard = board({
        board: status.board.squares,
        isWhite: ctx.game.config.rotation === 'dynamic'
          ? (makeMove ? !isWhiteTurn(gameMoves) : isWhiteTurn(gameMoves))
          : ctx.game.config.rotation === 'whites',
        actions: actions(),
      })

      if (makeMove) {
        await ctx.editMessageText(
          topMessage(isWhiteTurn(gameMoves), ctx.from, enemy) + statusMessage(status),
          {
            ...ctx.game.lastBoard,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
          },
        ).catch(debug)

        ctx.game.allowedMoves = null
        ctx.game.selected = null

        ctx.game.busy = false
        return ctx.answerCbQuery(makeMove.key)
      }

      if (ctx.game.allowedMoves.length > 0) {
        await ctx.editMessageReplyMarkup(ctx.game.lastBoard.reply_markup)
          .catch(debug)
      }

      ctx.game.allowedMoves = null
      ctx.game.selected = null

      ctx.game.busy = false
      return ctx.answerCbQuery()
    }
  },
]
