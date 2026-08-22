require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// ==============================
// KAYIT SİSTEMİ
// ==============================

const DATA_DIR = path.join(__dirname, "data");
const SAVE_FILE = path.join(DATA_DIR, "players.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(SAVE_FILE)) {
  fs.writeFileSync(SAVE_FILE, "{}");
}

function loadPlayers() {
  try {
    return JSON.parse(fs.readFileSync(SAVE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function savePlayers() {
  fs.writeFileSync(
    SAVE_FILE,
    JSON.stringify(players, null, 2)
  );
}

const players = loadPlayers();

// ==============================
// YENİ OYUNCU
// ==============================

function createPlayer() {
  return {
    chapter: 1,

    inventory: [],

    choices: [],

    flags: [],

    trust: {
      alex: 0,
      mira: 0,
      stranger: 0
    },

    createdAt: Date.now(),
    lastPlayed: Date.now()
  };
}

// ==============================
// ENVANTER
// ==============================

function addItem(player, item) {
  if (!player.inventory.includes(item)) {
    player.inventory.push(item);
  }
}

function removeItem(player, item) {
  player.inventory =
    player.inventory.filter(x => x !== item);
}

// ==============================
// FLAG
// ==============================

function addFlag(player, flag) {
  if (!player.flags.includes(flag)) {
    player.flags.push(flag);
  }
}

function hasFlag(player, flag) {
  return player.flags.includes(flag);
}

// ==============================
// BÖLÜMLER
// ==============================

const chapters = {

  1: {
    title: "03:17",
    location: "Ev",

    story:
      "Saat 03:17. Telefonun kendi kendine açılıyor. " +
      "Galerinde daha önce hiç görmediğin bir video beliriyor: " +
      "`oyun_kaydi_#2.mp4`. Videoyu açtığında bir metro istasyonu görüyorsun. " +
      "Kameranın karşısındaki kişi ise sensin.",

    choices: {

      A: {
        text: "Videoyu kapat",

        result:
          "Videoyu kapatıyorsun. Fakat telefon ekranında " +
          "yeni bir mesaj beliriyor: \"Geç kaldın.\"",

        effects: {
          flags: ["video_closed"]
        }
      },

      B: {
        text: "Videoyu sonuna kadar izle",

        result:
          "Videoyu izlemeye devam ediyorsun. " +
          "Videodaki sen kameraya dönüyor ve dudaklarını oynatıyor: " +
          "\"Beni bul.\"",

        effects: {
          flags: ["video_watched"],
          item: "Eski Telefon"
        }
      }
    }
  },

  2: {
    title: "İlk Mesaj",
    location: "Ev",

    story:
      "Telefon tekrar titriyor. Gönderen kısmında kendi kullanıcı adın yazıyor. " +
      "Mesajda yalnızca bir adres var: \"03:33 — Kuzey Metro İstasyonu.\"",

    choices: {

      A: {
        text: "Adrese git",

        result:
          "Montunu giyip evden çıkıyorsun. Sokaklar garip şekilde sessiz.",

        effects: {
          flags: ["went_to_metro"]
        }
      },

      B: {
        text: "Mesajı görmezden gel",

        result:
          "Telefonu masaya bırakıyorsun. Birkaç saniye sonra kapının önünden " +
          "bir metro anonsu duyuluyor.",

        effects: {
          flags: ["ignored_message"]
        }
      }
    }
  },

  3: {
    title: "Kuzey Metro",
    location: "Metro İstasyonu",

    story:
      "İstasyona geldiğinde saat tam 03:33. Peronda kimse yok. " +
      "Rayların üzerinde ışıkları kapalı bir tren bekliyor.",

    choices: {

      A: {
        text: "Trene bin",

        result:
          "Trene biniyorsun. Kapılar kapanıyor ve tren hareket ediyor.",

        effects: {
          flags: ["entered_train"],
          item: "Metro Jetonu"
        }
      },

      B: {
        text: "Peronda kal",

        result:
          "Trene binmiyorsun. Tren birkaç saniye sonra hareket ediyor. " +
          "Ama son vagondaki biri sana bakıyor.",

        effects: {
          flags: ["stayed_platform"]
        }
      }
    }
  },

  4: {
    title: "Son Vagon",
    location: "Metro Treni",

    story:
      "Trenin son vagonuna ilerliyorsun. Koltuklardan birinde yüzü görünmeyen " +
      "bir yolcu oturuyor.",

    choices: {

      A: {
        text: "Yolcuyla konuş",

        result:
          "Yolcu başını kaldırıyor. \"Beni hatırlamıyorsun.\" diyor.",

        effects: {
          flags: ["talked_to_stranger"],
          trust: ["stranger", 2]
        }
      },

      B: {
        text: "Yanından geç",

        result:
          "Yolcunun yanından geçiyorsun. Arkandan tek bir kelime duyuyorsun: \"Kaç.\"",

        effects: {
          flags: ["ignored_stranger"],
          trust: ["stranger", -1]
        }
      }
    }
  },

  5: {
    title: "Kayıt Odası",
    location: "Bilinmeyen Bölge",

    story:
      "Tren durduğunda kapılar açılıyor. Dışarı çıktığında kendini eski bir " +
      "kayıt odasında buluyorsun. Masanın üzerinde üzerinde adının yazdığı bir dosya var.",

    choices: {

      A: {
        text: "Dosyayı aç",

        result:
          "Dosyanın içinde çocukluğundan bugüne kadar çekilmiş fotoğraflar var. " +
          "Fakat hiçbirini hatırlamıyorsun.",

        effects: {
          flags: ["opened_file"],
          item: "Mühürlü Dosya"
        }
      },

      B: {
        text: "Dosyaya dokunma",

        result:
          "Dosyaya dokunmadan geri çekiliyorsun. Dosyanın kapağı kendi kendine açılıyor.",

        effects: {
          flags: ["refused_file"]
        }
      }
    }
  }

};

// ==============================
// EFEKTLER
// ==============================

function applyEffects(player, effects) {

  if (!effects) return;

  if (effects.flags) {

    for (const flag of effects.flags) {
      addFlag(player, flag);
    }
  }

  if (effects.item) {
    addItem(player, effects.item);
  }

  if (effects.removeItem) {
    removeItem(player, effects.removeItem);
  }

  if (effects.trust) {

    const [character, amount] = effects.trust;

    if (!player.trust[character]) {
      player.trust[character] = 0;
    }

    player.trust[character] += amount;
  }
}

// ==============================
// BUTONLAR
// ==============================

function createChoiceButtons(chapter) {

  return new ActionRowBuilder().addComponents(

    new ButtonBuilder()
      .setCustomId("story_A")
      .setLabel(`🟥 A — ${chapter.choices.A.text}`)
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("story_B")
      .setLabel(`🟦 B — ${chapter.choices.B.text}`)
      .setStyle(ButtonStyle.Primary)

  );
}

// ==============================
// BÖLÜM GÖSTER
// ==============================

async function sendChapter(user, player) {

  const chapter = chapters[player.chapter];

  if (!chapter) {

    return user.send(
      "🏆 **SEZON 1 TAMAMLANDI!**\n\n" +
      "Buraya kadar geldin.\n" +
      "Ama bu sadece başlangıçtı..."
    );
  }

  const embed = new EmbedBuilder()
    .setTitle(
      `🌑 SONSUZ KORKU MACERASI — BÖLÜM ${player.chapter}`
    )
    .setDescription(chapter.story)
    .addFields(
      {
        name: "📍 Konum",
        value: chapter.location,
        inline: true
      },
      {
        name: "🎒 Envanter",
        value:
          player.inventory.length
            ? player.inventory.join(", ")
            : "Boş",
        inline: true
      }
    )
    .setFooter({
      text: "Seçimin hikâyeyi değiştirebilir."
    });

  await user.send({
    embeds: [embed],
    components: [
      createChoiceButtons(chapter)
    ]
  });
}

// ==============================
// BOT HAZIR
// ==============================

client.once("ready", () => {

  console.log(
    `🌑 Sonsuz Korku Macerası aktif: ${client.user.tag}`
  );

});

// ==============================
// DM KOMUTLARI
// ==============================

client.on("messageCreate", async message => {

  if (message.author.bot) return;

  if (message.channel.type !== ChannelType.DM) return;

  const userId = message.author.id;

  const command =
    message.content
      .trim()
      .toLowerCase();

  // BAŞLA

  if (
    command === "başla" ||
    command === "basla"
  ) {

    if (players[userId]) {

      return message.reply(
        `Zaten devam eden bir oyunun var.\n\n` +
        `📖 Bölüm: **${players[userId].chapter}**\n\n` +
        `Devam etmek için **devam** yaz.`
      );

    }

    players[userId] =
      createPlayer();

    savePlayers();

    return sendChapter(
      message.author,
      players[userId]
    );
  }

  // DEVAM

  if (command === "devam") {

    if (!players[userId]) {

      return message.reply(
        "Henüz bir oyunun yok.\n" +
        "**başla** yazarak başlayabilirsin."
      );

    }

    return sendChapter(
      message.author,
      players[userId]
    );
  }

  // DURUM

  if (command === "durum") {

    const player =
      players[userId];

    if (!player) {

      return message.reply(
        "Henüz bir oyunun yok."
      );

    }

    return message.reply(
      `🌑 **OYUN DURUMU**\n\n` +

      `📖 Bölüm: **${player.chapter}**\n` +

      `🎒 Envanter: **${
        player.inventory.length
          ? player.inventory.join(", ")
          : "Boş"
      }**\n\n` +

      `🤝 Alex: **${player.trust.alex}**\n` +
      `🤝 Mira: **${player.trust.mira}**\n` +
      `👤 Yolcu: **${player.trust.stranger}**\n\n` +

      `🧠 Verilen karar: **${player.choices.length}**`
    );
  }

  // SIFIRLA

  if (
    command === "sıfırla" ||
    command === "sifirla"
  ) {

    delete players[userId];

    savePlayers();

    return message.reply(
      "🔄 Oyun kaydın silindi.\n\n" +
      "Yeni oyun için **başla** yaz."
    );
  }

  // YARDIM

  if (
    command === "yardım" ||
    command === "yardim"
  ) {

    return message.reply(
      "🌑 **SONSUZ KORKU MACERASI**\n\n" +

      "`başla` — Yeni oyun\n" +
      "`devam` — Oyuna devam et\n" +
      "`durum` — Karakter bilgilerin\n" +
      "`sıfırla` — Oyunu baştan başlat\n" +
      "`yardım` — Komutları göster"
    );
  }

});

// ==============================
// BUTON SEÇİMLERİ
// ==============================

client.on(
  "interactionCreate",
  async interaction => {

    if (!interaction.isButton()) return;

    if (
      !interaction.customId.startsWith(
        "story_"
      )
    ) return;

    const userId =
      interaction.user.id;

    const player =
      players[userId];

    if (!player) {

      return interaction.reply({
        content:
          "Önce DM'den **başla** yaz.",
        ephemeral: true
      });

    }

    const chapter =
      chapters[player.chapter];

    if (!chapter) return;

    const choice =
      interaction.customId ===
      "story_A"
        ? "A"
        : "B";

    const selected =
      chapter.choices[choice];

    // EFEKTLER

    applyEffects(
      player,
      selected.effects
    );

    // KARAR KAYDI

    player.choices.push({
      chapter: player.chapter,
      choice: choice,
      time: Date.now()
    });

    // SONRAKİ BÖLÜM

    player.chapter++;

    player.lastPlayed =
      Date.now();

    savePlayers();

    const resultEmbed =
      new EmbedBuilder()
        .setTitle(
          `✅ ${choice} SEÇİMİ`
        )
        .setDescription(
          selected.result
        )
        .setFooter({
          text:
            `Sonraki bölüm: ${player.chapter}`
        });

    await interaction.update({
      embeds: [resultEmbed],
      components: []
    });

    setTimeout(
      () => {
        sendChapter(
          interaction.user,
          player
        ).catch(console.error);
      },
      1000
    );

  }
);

// ==============================
// HATALAR
// ==============================

process.on(
  "unhandledRejection",
  console.error
);

process.on(
  "uncaughtException",
  console.error
);

// ==============================
// GİRİŞ
// ==============================

if (!process.env.DISCORD_TOKEN) {

  console.error(
    "❌ DISCORD_TOKEN bulunamadı!"
  );

  process.exit(1);
}

client.login(
  process.env.DISCORD_TOKEN
);
