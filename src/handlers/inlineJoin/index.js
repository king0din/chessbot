const chess = require('chess')

const { board, actions } = require('@/keyboards')
const { debug, preLog, log, makeUserLog } = require('@/helpers')

module.exports = () => [
  /^join::([wb])::(\d+)/,
  async (ctx) => {
    if (ctx.game.joined) {
      return ctx.answerCbQuery('Zaten oyuna katıldınız')
    }
    const enemyId = Number(ctx.match[2])
    const iAmWhite = ctx.match[1] !== 'w'

    if (ctx.from.id === enemyId) {
      return ctx.answerCbQuery('Kendinle oynayamazsın!')
    }

    let user = await ctx.db('users')
      .where({ id: ctx.from.id })
      .first()
      .catch(debug)

    if (!user) {
      await ctx.db('users').insert(ctx.from).catch(debug)
      user = await ctx.db('users').where('id', ctx.from.id).first().catch(debug)
    }

    const enemy = await ctx.db('users').where('id', enemyId).first().catch(debug)

    await ctx.db('games').insert({
      whites_id: iAmWhite ? ctx.from.id : enemy.id,
      blacks_id: iAmWhite ? enemy.id : ctx.from.id,
      inline_id: ctx.callbackQuery.inline_message_id,
      config: JSON.stringify({ rotation: 'dynamic' }),
    }).catch(debug)

    const game = await ctx.db('games')
      .where('inline_id', ctx.callbackQuery.inline_message_id)
      .first()
      .catch(debug)

    if (!game) {
      return ctx.answerCbQuery('Oyun silinmiş. Lütfen tekrar deneyin, mesaj kutunuza @santrancbot yazarak yeni bir oyun başlatabilirsiniz.')
    }

    ctx.game.entry = game
    ctx.game.config = JSON.parse(game.config) || { rotation: 'dynamic' }

    const gameClient = chess.create({ PGN: true })
    const status = gameClient.getStatus()

    ctx.game.lastBoard = board({
      board: status.board.squares,
      isWhite: true,
      actions: actions(),
    })

    log(
      preLog('JOIN', `${game.id} ${makeUserLog(enemy)} ${makeUserLog(user)}`),
      ctx,
    )

    await ctx.editMessageText(
      iAmWhite
        ? `Siyah (üst): ${enemy.first_name}
Beyaz (alt): ${user.first_name}
Beyaz'ın sırası | [Sohbet](https://t.me/${process.env.DISCUSSION_GROUP})`
        : `Siyah (üst): ${user.first_name}
Beyaz (alt): ${enemy.first_name}
Beyaz'ın sırası | [Sohbet](https://t.me/${process.env.DISCUSSION_GROUP})`,
      {
        ...ctx.game.lastBoard,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      },
    ).catch(debug)

    ctx.game.joined = true

    return ctx.answerCbQuery('Şimdi oynayabilirsin!')
  },
]
