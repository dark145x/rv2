module.exports.config = {
  name: "help",
  version: "1.0.2",
  permission: 0,
  credits: "ryuko",
  description: "beginner's guide",
  prefix: true,
  premium: false,
  category: "guide",
  usages: "[Shows Commands]",
  cooldowns: 5,
  envConfig: {
		autoUnsend: true,
		delayUnsend: 60
	}
};

module.exports.languages = {
  en: {
    moduleInfo:
      "%1\n%2\n\nusage : %3\ncategory : %4\nwaiting time : %5 seconds(s)\npermission : %6\n\nmodule code by %7.",
    helpList:
      `there are %1 commands and %2 categories of ${global.config.BOTNAME} ai.`,
    user: "user",
    adminGroup: "group admin",
    adminBot: "bot admin",
  },
};


module.exports.handleEvent = function ({ api, event, getText }) {
  const { commands } = global.client;
  const { threadID, messageID, body } = event;  

  if (!body || typeof body == "undefined" || body.indexOf("help") != 0)
    return;
  const splitBody = body.slice(body.indexOf("help")).trim().split(/\s+/);
  if (splitBody.length == 1 || !commands.has(splitBody[1].toLowerCase())) return;
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const command = commands.get(splitBody[1].toLowerCase());
  const prefix = threadSetting.hasOwnProperty("PREFIX")
    ? threadSetting.PREFIX
    : global.config.PREFIX;
  return api.sendMessage(
    getText(
      "moduleInfo",
      command.config.name,
      command.config.description,
      `${prefix}${command.config.name} ${
        command.config.usages ? command.config.usages : ""
      }`,
      command.config.category,
      command.config.cooldowns,
      command.config.permission === 0
        ? getText("user")
        : command.config.permission === 1
        ? getText("adminGroup")
        : getText("adminBot"),
      command.config.credits
    ),
    threadID,
    messageID
  );
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const command = commands.get((args[0] || "").toLowerCase());
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
  const prefix = threadSetting.hasOwnProperty("PREFIX")
    ? threadSetting.PREFIX
    : global.config.PREFIX;

  if (!command) {
    const commandList = Array.from(commands.values());
    const categories = new Set(commandList.map((cmd) => cmd.config.category.toLowerCase()));
    const categoryCount = categories.size;

    const categoryNames = Array.from(categories);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(categoryNames.length / itemsPerPage);

    let currentPage = 1;
    if (args[0]) {
      const parsedPage = parseInt(args[0]);
      if (
        !isNaN(parsedPage) &&
        parsedPage >= 1 &&
        parsedPage <= totalPages
      ) {
        currentPage = parsedPage;
      } else {
        return api.sendMessage(
          `oops, you went too far. please choose a page between 1 and ${totalPages}.`,
          threadID,
          messageID
        );
      }
    }
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const visibleCategories = categoryNames.slice(startIdx, endIdx);

    let msg = "";
    for (let i = 0; i < visibleCategories.length; i++) {
      const category = visibleCategories[i];
      const categoryCommands = commandList.filter(
        (cmd) =>
          cmd.config.category.toLowerCase() === category
      );
      const commandNames = categoryCommands.map((cmd) => cmd.config.name);
      const numberFont = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
      ];
      msg += `${
        category.charAt(0).toLowerCase() + category.slice(1)
      } category :\n\n${commandNames.join("\n")}\n\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n`;
    }
    const numberFontPage = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
    ];
    msg += `page ${numberFontPage[currentPage - 1]} of ${
      numberFontPage[totalPages - 1]
    }\n\n`;
    msg += getText("helpList", commands.size, categoryCount, prefix);

    const axios = require("axios");
    const fs = require("fs-extra");
    const imgP = [];
    const img = [
      "https://i.ibb.co/ZLnvPwQ/Picsart-23-07-24-11-03-50-602.png"
    ];
    const path = __dirname + "/cache/menu.png";
    const rdimg = img[Math.floor(Math.random() * img.length)];

    const { data } = await axios.get(rdimg, {
      responseType: "arraybuffer",
    });

    fs.writeFileSync(path, Buffer.from(data, "utf-8"));
    imgP.push(fs.createReadStream(path));
    const msgg = {
  body: `existing commands and categories\n\nhere's the categories and commands of ${global.config.BOTNAME} ai ;\n\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n` + msg + `\n\n`
    };

    const sentMessage = await api.sendMessage(msgg, threadID, async (error, info) => {
			if (autoUnsend) {
				await new Promise(resolve => setTimeout(resolve, delayUnsend * 500));
				return api.unsendMessage(info.messageID);
			} else return;
		}, messageID);
  } else {
    return api.sendMessage(
      getText(
        "moduleInfo",
        command.config.name,
        command.config.description,
        `${prefix}${command.config.name} ${
          command.config.usages ? command.config.usages : ""
        }`,
        command.config.category,
        command.config.cooldowns,
        command.config.permission === 0
          ? getText("user")
          : command.config.permission === 1
          ? getText("adminGroup")
          : getText("adminBot"),
        command.config.credits
      ),
      threadID, async (error, info) => {
			if (autoUnsend) {
				await new Promise(resolve => setTimeout(resolve, delayUnsend * 500));
				return api.unsendMessage(info.messageID);
			} else return;
		}, messageID);
  }
};
