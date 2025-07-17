module.exports = function inlineQueryHandler() {
  return async (ctx) => {
    const users = ctx.db.readData()

    console.log('Kayıtlı kullanıcılar:', users)

    await ctx.answerInlineQuery([
      {
        type: 'article',
        id: '1',
        title: 'Satranç Oyunu Başlat',
        input_message_content: {
          message_text: 'Yeni bir satranç oyunu başlattım! ♟️',
        },
      },
    ])
  }
}
