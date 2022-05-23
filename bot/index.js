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

      try {
        const parsed = parser.parse(code);

        if (parsed.error) {
          resp.edit(`Error: ${parsed.error}: ${parsed.details}`);
          return;
        }

        parsed.applyContext({
          user: {
            name: msg.author.username,
            id: msg.author.id,
            tag: msg.author.tag,
            discriminator: msg.author.discriminator,
            avatar: msg.author.avatar,
            avatar_url: msg.author.avatarURL.bind(msg.author, { format: 'png', size: 2048, dynamic: true }),
            banner: msg.author.banner,
            banner_url: msg.author.bannerURL.bind(msg.author, { format: 'png', size: 2048, dynamic: true }),
            bot: msg.author.bot,
            created_at: msg.author.createdAt,
            created_timestamp: msg.author.createdTimestamp,
            joined_at: msg.member.joinedAt,
            joined_timestamp: msg.member.joinedTimestamp,
            permissions: msg.member.permissions.bitfield,
          },
          channel: {
            id: msg.channel.id,
            name: msg.channel.name,
            type: msg.channel.type,
            topic: msg.channel.topic,
            nsfw: msg.channel.nsfw,
          },
          client: {
            user: {
              id: client.user.id,
              name: client.user.username,
              tag: client.user.tag,
              discriminator: client.user.discriminator,
              avatar: client.user.avatar,
              avatar_url: client.user.avatarURL.bind(client.user, { format: 'png', size: 2048, dynamic: true }),
              banner: client.user.banner,
              banner_url: client.user.bannerURL.bind(client.user, { format: 'png', size: 2048, dynamic: true }),
              bot: client.user.bot,
              created_at: client.user.createdAt,
              created_timestamp: client.user.createdTimestamp,
            },
            get uptime() {
              return client.uptime;
            },
          }
        });

        resp = await resp.edit(`${resp.content} done!\nExecuting code...`);

        let result;

        try {
          result = parsed.run();
        } catch (e) {
          resp.edit(`Sandbox Error: ${e}`);
          return;
        }

        resp.edit(result);
      } catch (e) {
        resp.edit(`Parse Error: ${e}`);
      }
    }
  })

  .login(process.env.DISCORD_TOKEN);
