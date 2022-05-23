const Discord = require('discord.js');

const parser = new (require('../core'))({
  useDefaultContext: false,
  context: {}
});

const client = new Discord.Client({
  intents: Discord.Intents.FLAGS.GUILDS | Discord.Intents.FLAGS.GUILD_MESSAGES
});

client
  .on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
  })
  .on('messageCreate', async msg => {
    const matches = msg.content.match(/`{3}s\n?[\S\s]*?`{3}/g);

    if (!matches) return;

    for (const match of matches) {
      const code = /`{3}s\n?([\S\s]*?)`{3}/.exec(match)[1];

      let resp = await msg.channel.send({
        content: "Is this a splatag I see? :eyes:\n\nParsing...",
      });

      resp.edit(parser.run(code));
    }
  })

  .login(process.env.DISCORD_TOKEN);
