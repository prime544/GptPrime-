burayı sil
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

// ======================================================
// BOT
// ======================================================

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// ======================================================
// KAYIT SİSTEMİ
// ======================================================

const DATA_DIR = path.join(__dirname, "data");
const SAVE_FILE = path.join(DATA_DIR, "players.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(SAVE_FILE)) {
  fs.writeFileSync(SAVE_FILE, "{}");
}

let players = {};

try {
  players = JSON.parse(
    fs.readFileSync(SAVE_FILE, "utf8")
  );
} catch {
  players = {};
}

function savePlayers() {
  fs.writeFileSync(
    SAVE_FILE,
    JSON.stringify(players, null, 2)
  );
}

// ======================================================
// OYUNCU
// ======================================================

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

// ======================================================
// YARDIMCI SİSTEMLER
// ======================================================

function addItem(player, item) {
  if (!player.inventory.includes(item)) {
    player.inventory.push(item);
  }
}

function removeItem(player, item) {
  player.inventory =
    player.inventory.filter(x => x !== item);
}

function hasItem(player, item) {
  return player.inventory.includes(item);
}

function addFlag(player, flag) {
  if (!player.flags.includes(flag)) {
    player.flags.push(flag);
  }
}

function hasFlag(player, flag) {
  return player.flags.includes(flag);
}

function changeTrust(player, character, amount) {
  if (!player.trust[character]) {
    player.trust[character] = 0;
  }

  player.trust[character] += amount;
}

// ======================================================
// HİKÂYE VERİLERİ
// ======================================================

const locations = [
  "03:17 Metro İstasyonu",
  "Kuzey Metro",
  "Eski Kayıt Odası",
  "Sessiz Peron",
  "Yeraltı Arşivi",
  "Saat Meydanı",
  "Boş Hastane",
  "Gölgeler Sokağı",
  "Kırmızı Bölge",
  "Cam Kule",
  "Kontrol Merkezi",
  "Unutulmuş İstasyon",
  "Eski Şehir",
  "Kayıp Tünel",
  "Sıfır Noktası"
];

const items = [
  "Eski Telefon",
  "Metro Jetonu",
  "Mühürlü Dosya",
  "Paslı Anahtar",
  "Kırık USB",
  "Siyah Fener",
  "Mavi Çip",
  "Kırmızı Kart",
  "Eski Fotoğraf",
  "Bozuk Telsiz",
  "Cam Anahtar",
  "Saat Pili",
  "Arşiv Rozeti",
  "Şifreli Kart",
  "Gümüş Anahtar"
];

const chapterNames = [
  "03:17",
  "İlk Mesaj",
  "Kuzey Metro",
  "Son Vagon",
  "Kayıt Odası",
  "03:33'ün Ardından",
  "İlk Döngü",
  "Ayak Sesleri",
  "Eski Harita",
  "Kayıp Kamera",
  "Mühür",
  "Kırmızı Hat",
  "Sessiz Hastane",
  "Yolcunun Notu",
  "İkinci Kayıt",
  "Saat Meydanı",
  "Gizli Kat",
  "Mavi Oda",
  "Siyah Ekran",
  "Kayıp İsim",
  "Alex",
  "Mira",
  "Kontrol Merkezi",
  "Kilitli Kapı",
  "Yeraltı Arşivi",
  "İlk Gerçek",
  "Yanlış Dünya",
  "Geri Sayım",
  "Kırmızı Bölge",
  "Gölgeler",
  "Dosya 31",
  "İkinci Döngü",
  "Boş Şehir",
  "Kayıp Oyuncu",
  "Eski Terminal",
  "Yedinci Kat",
  "Kamera Odası",
  "Bilinmeyen Ses",
  "Tünel",
  "İkinci Anahtar",
  "Kırık Saat",
  "Yolcu",
  "Sahte Çıkış",
  "Kayıt #43",
  "Mühendis",
  "Sistem Hatası",
  "Mavi Bölge",
  "Unutulan Gün",
  "Dosya #49",
  "Gerçeklik",
  "İlk İhanet",
  "Kayıt #51",
  "Gizli Sunucu",
  "Karanlık Oda",
  "Sinyal",
  "03:17 Tekrarı",
  "Kayıp Ses",
  "İkinci Şehir",
  "Cam Koridor",
  "Siyah Kapı",
  "Kayıt #61",
  "Gözlemci",
  "Bilinmeyen Yönetici",
  "Kırmızı Dosya",
  "Mira'nın Sırrı",
  "Alex'in Geçmişi",
  "Kayıp Metro",
  "Son Yolcu",
  "Haritanın Dışı",
  "Sıfırıncı Oda",
  "Üçüncü Kapı",
  "Kayıt #73",
  "Sistem Odası",
  "Bozuk Dünya",
  "Gerçek Dünya",
  "Kopya",
  "Kayıt #78",
  "İsimler",
  "Hatırlama",
  "Unutma",
  "Kontrol",
  "Son Mesaj",
  "Kayıt #84",
  "Kırmızı Işık",
  "Mavi Işık",
  "Siyah Işık",
  "Kayıt #88",
  "İlk Son",
  "İkinci Son",
  "Üçüncü Son",
  "Geri Dönüş",
  "Kayıt #93",
  "Kayıp Şehir",
  "Gizli Geçit",
  "Saat 03:33",
  "Eski Dünya",
  "Yeni Dünya",
  "Kayıt #99",
  "Yüzüncü Kapı",
  "İkinci Yüz",
  "Üçüncü Yüz",
  "Gözler",
  "Sesler",
  "Kayıt #105",
  "Oyuncular",
  "Kayıp Oyuncular",
  "Sistem",
  "Hata",
  "Kırmızı Kod",
  "Mavi Kod",
  "Siyah Kod",
  "Kayıt #113",
  "Anahtar",
  "Son Tünel",
  "Son Şehir",
  "Kayıt #117",
  "İlk Gerçek",
  "İkinci Gerçek",
  "Üçüncü Gerçek",
  "Dışarı",
  "İçeri",
  "Kayıt #123",
  "Son Yol",
  "Son Kamera",
  "Son Dosya",
  "Son Mesaj",
  "03:17",
  "03:33",
  "Kapı #1",
  "Kapı #2",
  "Kapı #3",
  "Kayıt #132",
  "Sıfır Noktası",
  "Oyunun İçinde",
  "Oyunun Dışında",
  "Gerçeklik Kırılması",
  "Son Döngü",
  "Son Anahtar",
  "Son Kayıt",
  "Geri Sayım",
  "Kayıt #142",
  "Son Şehir",
  "Son Yolcu",
  "Son Kapı",
  "Sezon 1",
  "Gerçek Son",
  "03:33",
  "SONSUZ"
];

// ======================================================
// ÖZEL BÖLÜMLER
// ======================================================

const specialChapters = {

  1: {
    location: "Ev",
    story:
      "Saat 03:17. Telefonun kendi kendine açılıyor. " +
      "Galerinde daha önce hiç görmediğin bir video beliriyor: " +
      "`oyun_kaydi_#2.mp4`. Videoyu açtığında bir metro istasyonu görüyorsun. " +
      "Kameranın karşısındaki kişi ise sensin.",

    choices: [
      {
        text: "Videoyu kapat",
        result:
          "Videoyu kapatıyorsun. Ekranda tek bir mesaj beliriyor: " +
          "\"Geç kaldın.\"",
        effects: {
          flags: ["video_closed"]
        }
      },
      {
        text: "Videoyu izle",
        result:
          "Videoyu sonuna kadar izliyorsun. Videodaki sen kameraya bakıp " +
          "\"Beni bul.\" diyor.",
        effects: {
          flags: ["video_watched"],
          item: "Eski Telefon"
        }
      },
      {
        text: "Videoyu telefona kaydet",
        result:
          "Videoyu kaydediyorsun. Dosyanın boyutu birkaç saniye içinde " +
          "değişmeye başlıyor.",
        effects: {
          flags: ["video_saved"],
          item: "Eski Telefon"
        }
      }
    ]
  },

  6: {
    location: "03:33 Metro İstasyonu",

    story:
      "Metrodan ayrıldığını sanıyorsun. Fakat birkaç saniye sonra " +
      "hâlâ aynı istasyonda olduğunu fark ediyorsun. " +
      "Saatler 03:33'te durmuş. Telefonuna yeni bir mesaj geliyor: " +
      "\"İlk döngüyü kırdın. Şimdi beni bul.\"",

    choices: [
      {
        text: "Trenin geldiği tünele git",
        result:
          "Tünele giriyorsun. Uzaktan eski bir trenin sesi geliyor.",
        effects: {
          flags: ["followed_train"],
          item: "Metro Jetonu"
        }
      },
      {
        text: "Ayak seslerini takip et",
        result:
          "Sağdaki koridora giriyorsun. Ayak sesleri bir anda kesiliyor.",
        effects: {
          flags: ["followed_footsteps"]
        }
      },
      {
        text: "Mesajı cevapla",
        result:
          "Tek kelime yazıyorsun: \"Kimsin?\". Cevap anında geliyor: " +
          "\"Bunu daha önce de sordun.\"",
        effects: {
          flags: ["answered_unknown"],
          trust: ["stranger", 1]
        }
      }
    ]
  },

  150: {
    location: "Sıfır Noktası",

    story:
      "150 bölümdür verdiğin kararların tamamı gözlerinin önünden geçiyor. " +
      "03:33. Önünde üç kapı var. Arkandan gizemli yolcunun sesi geliyor: " +
      "\"Bu son değil. Bu sadece ilk hikâyenin sonu.\"",

    choices: [
      {
        text: "Gerçek dünyaya dön",
        result:
          "Kapıyı açıyorsun. Gerçek dünya seni karşılıyor. " +
          "Telefonunda tek bir dosya beliriyor: `SEZON_2.mp4`.",
        effects: {
          flags: ["season1_escape"]
        }
      },
      {
        text: "Oyunun içinde kal",
        result:
          "Kapıyı açıyorsun. Arkasında daha önce hiç görmediğin devasa bir şehir var.",
        effects: {
          flags: ["season2_inside"]
        }
      },
      {
        text: "Gizemli yolcunun yanına dön",
        result:
          "Arkanı dönüyorsun. Yolcu ilk kez yüzünü gösteriyor. " +
          "Yüzü sana ait.",
        effects: {
          flags: ["saw_true_face"],
          trust: ["stranger", 10]
        }
      }
    ]
  }

};

// ======================================================
// 150 BÖLÜM OLUŞTURUCU
// ======================================================

function generateChapter(number) {

  if (specialChapters[number]) {
    return specialChapters[number];
  }

  const location =
    locations[(number - 1) % locations.length];

  const item =
    items[(number - 1) % items.length];

  const previousFlag =
    `chapter_${number - 1}_choice`;

  let story;

  if (number === 2) {

    story =
      "Telefon tekrar titriyor. Gönderen kısmında kendi kullanıcı adın " +
      "yazıyor. Mesajda yalnızca bir adres var: " +
      "\"03:33 — Kuzey Metro İstasyonu.\"";

  } else if (number === 3) {

    story =
      "Kuzey Metro'ya ulaşıyorsun. Peron tamamen boş. " +
      "Rayların üzerinde ışıkları kapalı bir tren bekliyor.";

  } else {

    const events = [
      `Duvarın arkasından ${item} adında bir şeyin bulunduğuna dair bir ses geliyor.`,
      "Telefonundaki saat bir saniyeliğine 03:33'e dönüyor.",
      "Uzaktaki bir kamera doğrudan sana dönüyor.",
      "Hoparlörlerden bozuk bir ses yükseliyor.",
      "Bir kapı kendi kendine açılıyor.",
      "Duvarlarda daha önce olmayan işaretler beliriyor.",
      "Bir gölge koridorun sonunda kayboluyor.",
      "Sistemin ekranında adın beliriyor."
    ];

    const event =
      events[(number - 1) % events.length];

    story =
      `${location} bölgesindesin. ${event} ` +
      "Burada daha önce bulunmuş olduğuna dair garip bir hisse kapılıyorsun.";
  }

  return {

    location,

    story,

    choices: [

      {
        text: "İzi takip et",

        result:
          `İzi takip ediyorsun. ${item} buluyorsun ve onu yanında taşıyorsun.`,

        effects: {
          item,
          flags: [previousFlag, `chapter_${number}_A`],
          trust: ["alex", 1]
        }
      },

      {
        text: "Geri dön",

        result:
          "Geri dönüyorsun. Fakat geldiğin yol artık aynı görünmüyor.",

        effects: {
          flags: [previousFlag, `chapter_${number}_B`],
          trust: ["mira", 1]
        }
      },

      {
        text: "Hiçbir şeye dokunma",

        result:
          "Olduğun yerde bekliyorsun. Birkaç saniye sonra sistem konuşuyor: " +
          "\"Temkinli seçim.\"",

        effects: {
          flags: [previousFlag, `chapter_${number}_C`],
          trust: ["stranger", 1]
        }
      }

    ]
  };
}

const chapters = {};

for (let i = 1; i <= 150; i++) {
  chapters[i] = generateChapter(i);
}

// ======================================================
// EFEKT UYGULA
// ======================================================

function applyEffects(player, effects) {

  if (!effects) return;

  if (effects.item) {
    addItem(player, effects.item);
  }

  if (effects.removeItem) {
    removeItem(player, effects.removeItem);
  }

  if (effects.flags) {

    for (const flag of effects.flags) {
      addFlag(player, flag);
    }
  }

  if (effects.trust) {

    const [character, amount] =
      effects.trust;

    changeTrust(
      player,
      character,
      amount
    );
  }
}

// ======================================================
// BUTONLAR
// ======================================================

function createButtons(chapter) {

  return new ActionRowBuilder()
    .addComponents(

      new ButtonBuilder()
        .setCustomId("choice_A")
        .setLabel(
          `🟥 A — ${chapter.choices[0].text}`
        )
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("choice_B")
        .setLabel(
          `🟦 B — ${chapter.choices[1].text}`
        )
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("choice_C")
        .setLabel(
          `🟩 C — ${chapter.choices[2].text}`
        )
        .setStyle(ButtonStyle.Success)

    );
}

// ======================================================
// BÖLÜM GÖNDER
// ======================================================

async function sendChapter(user, player) {

  const chapter =
    chapters[player.chapter];

  if (!chapter) {

    return user.send(
      "🏆 **SEZON 1 TAMAMLANDI!**\n\n" +
      "150 bölümün tamamını bitirdin.\n\n" +
      "Ama hikâye burada bitmedi..."
    );
  }

  const inventory =
    player.inventory.length
      ? player.inventory.join(", ")
      : "Boş";

  const progress =
    Math.floor(
      (player.chapter / 150) * 100
    );

  const embed =
    new EmbedBuilder()
      .setTitle(
        `🌑 SONSUZ KORKU MACERASI`
      )
      .setDescription(
        `## BÖLÜM ${player.chapter}/150 — ${
          chapterNames[player.chapter - 1] ||
          `Bölüm ${player.chapter}`
        }\n\n${chapter.story}`
      )
      .addFields(
        {
          name: "📍 Konum",
          value: chapter.location,
          inline: true
        },
        {
          name: "📊 İlerleme",
          value: `${progress}%`,
          inline: true
        },
        {
          name: "🎒 Envanter",
          value: inventory,
          inline: false
        }
      )
      .setFooter({
        text:
          "Seçimlerin kaydedilir. Hiçbir karar tamamen unutulmaz."
      });

  await user.send({
    embeds: [embed],
    components: [
      createButtons(chapter)
    ]
  });
}

// ======================================================
// READY
// ======================================================

client.once("ready", () => {

  console.log(
    `🌑 Sonsuz Korku Macerası aktif!`
  );

  console.log(
    `🤖 Bot: ${client.user.tag}`
  );

  console.log(
    `📖 Bölüm sayısı: 150`
  );

  console.log(
    `🎯 Seçim noktası: 450`
  );

});

// ======================================================
// DM KOMUTLARI
// ======================================================

client.on("messageCreate", async message => {

  if (message.author.bot) return;

  if (
    message.channel.type !==
    ChannelType.DM
  ) return;

  const id =
    message.author.id;

  const command =
    message.content
      .trim()
      .toLowerCase();

  // -------------------------
  // BAŞLA
  // -------------------------

  if (
    command === "başla" ||
    command === "basla"
  ) {

    if (players[id]) {

      return message.reply(
        `⚠️ Zaten devam eden bir oyunun var.\n\n` +
        `📖 Bölüm: **${players[id].chapter}/150**\n\n` +
        `Kaldığın yerden devam etmek için **devam** yaz.`
      );

    }

    players[id] =
      createPlayer();

    savePlayers();

    await message.reply(
      "🌑 **SONSUZ KORKU MACERASI**\n\n" +
      "Oyun kaydın oluşturuldu.\n" +
      "Hikâye başlıyor..."
    );

    return sendChapter(
      message.author,
      players[id]
    );
  }

  // -------------------------
  // DEVAM
  // -------------------------

  if (command === "devam") {

    if (!players[id]) {

      return message.reply(
        "❌ Kayıt bulunamadı.\n" +
        "Başlamak için **başla** yaz."
      );
    }

    return sendChapter(
      message.author,
      players[id]
    );
  }

  // -------------------------
  // DURUM
  // -------------------------

  if (command === "durum") {

    const player =
      players[id];

    if (!player) {

      return message.reply(
        "❌ Henüz oyunun yok.\n" +
        "**başla** yazarak başlayabilirsin."
      );
    }

    return message.reply(
      `🌑 **OYUNCU DURUMU**\n\n` +

      `📖 Bölüm: **${player.chapter}/150**\n` +

      `🎒 Envanter:\n` +
      `${player.inventory.length
        ? player.inventory.map(x => `• ${x}`).join("\n")
        : "Boş"}\n\n` +

      `🤝 Alex: **${player.trust.alex}**\n` +
      `🤝 Mira: **${player.trust.mira}**\n` +
      `👤 Gizemli Yolcu: **${player.trust.stranger}**\n\n` +

      `🧠 Verilen karar: **${player.choices.length}**`
    );
  }

  // -------------------------
  // SIFIRLA
  // -------------------------

  if (
    command === "sıfırla" ||
    command === "sifirla"
  ) {

    delete players[id];

    savePlayers();

    return message.reply(
      "🔄 **Oyun kaydın sıfırlandı.**\n\n" +
      "Baştan başlamak için **başla** yaz."
    );
  }

  // -------------------------
  // YARDIM
  // -------------------------

  if (
    command === "yardım" ||
    command === "yardim"
  ) {

    return message.reply(
      "🌑 **SONSUZ KORKU MACERASI**\n\n" +

      "🎮 `başla` → Yeni oyun\n" +
      "▶️ `devam` → Oyuna devam et\n" +
      "📊 `durum` → Karakter durumunu göster\n" +
      "🔄 `sıfırla` → Oyunu baştan başlat\n" +
      "❓ `yardım` → Yardım menüsü"
    );
  }

});

// ======================================================
// BUTONLAR
// ======================================================

client.on(
  "interactionCreate",
  async interaction => {

    if (!interaction.isButton()) return;

    if (
      !interaction.customId.startsWith(
        "choice_"
      )
    ) return;

    const id =
      interaction.user.id;

    const player =
      players[id];

    if (!player) {

      return interaction.reply({
        content:
          "❌ Önce DM'den **başla** yaz.",
        ephemeral: true
      });
    }

    const chapter =
      chapters[player.chapter];

    if (!chapter) {

      return interaction.reply({
        content:
          "🏆 Bu sezonu tamamladın!",
        ephemeral: true
      });
    }

    const letter =
      interaction.customId
        .replace("choice_", "");

    let choiceIndex = 0;

    if (letter === "B") {
      choiceIndex = 1;
    }

    if (letter === "C") {
      choiceIndex = 2;
    }

    const selected =
      chapter.choices[choiceIndex];

    // -------------------------
    // ESKİ SEÇİM KONTROLÜ
    // -------------------------

    const alreadyChosen =
      player.choices.some(
        x =>
          x.chapter === player.chapter
      );

    if (alreadyChosen) {

      return interaction.reply({
        content:
          "⚠️ Bu bölüm için zaten seçim yaptın.",
        ephemeral: true
      });
    }

    // -------------------------
    // EFEKTLER
    // -------------------------

    applyEffects(
      player,
      selected.effects
    );

    // -------------------------
    // KARAR KAYDI
    // -------------------------

    player.choices.push({
      chapter: player.chapter,
      choice: letter,
      timestamp: Date.now()
    });

    // -------------------------
    // BÖLÜM İLERLET
    // -------------------------

    player.chapter++;

    player.lastPlayed =
      Date.now();

    savePlayers();

    // -------------------------
    // SONUÇ
    // -------------------------

    const resultEmbed =
      new EmbedBuilder()
        .setTitle(
          `✅ SEÇİM ${letter}`
        )
        .setDescription(
          selected.result
        )
        .addFields({
          name: "📖 Sonraki Bölüm",
          value:
            player.chapter <= 150
              ? `**${player.chapter}/150**`
              : "🏆 Sezon tamamlandı!"
        })
        .setFooter({
          text:
            "Seçimin kaydedildi."
        });

    await interaction.update({
      embeds: [resultEmbed],
      components: []
    });

    // -------------------------
    // SONRAKİ BÖLÜM
    // -------------------------

    if (player.chapter <= 150) {

      setTimeout(
        () => {

          sendChapter(
            interaction.user,
            player
          ).catch(console.error);

        },
        1200
      );

    } else {

      setTimeout(
        () => {

          interaction.user.send(
            "🏆 **SEZON 1 TAMAMLANDI!**\n\n" +
            "150 bölümün tamamını bitirdin.\n\n" +
            "🌑 Ama `oyun_kaydi_#2.mp4` dosyası hâlâ telefonunda..."
          );

        },
        1200
      );
    }

  }
);

// ======================================================
// HATA YAKALAMA
// ======================================================

process.on(
  "unhandledRejection",
  error => {
    console.error(
      "Unhandled Rejection:",
      error
    );
  }
);

process.on(
  "uncaughtException",
  error => {
    console.error(
      "Uncaught Exception:",
      error
    );
  }
);

// ======================================================
// TOKEN
// ======================================================

if (!process.env.DISCORD_TOKEN) {

  console.error(
    "❌ DISCORD_TOKEN bulunamadı!"
  );

  process.exit(1);
}

client.once("ready", () => {
  console.log(`🌑 ${client.user.tag} aktif!`);

  client.user.setPresence({
    activities: [
      {
        name: 'DM\'den "başla" yaz',
        type: 0
      }
    ],
    status: "online"
  });
});

client.login(
  process.env.DISCORD_TOKEN
);
