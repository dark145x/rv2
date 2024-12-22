const fs = require("fs");
const moment = require("moment");

module.exports.config = {
		name: "join",
		eventType: ['log:subscribe'],
		version: "1.0.0",
		credits: "Mirai-Team And Modify By Jonell Magallanes",
		description: "GROUP UPDATE NOTIFICATION"
};

module.exports.run = async function ({ api, event, Users, Threads }) {
		if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
				api.changeNickname(`${global.config.BOTNAME} • [ ${global.config.PREFIX} ]`, event.threadID, api.getCurrentUserID());
				api.shareContact(
						`✅ 𝗕𝗼𝘁 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱\n━━━━━━━━━━━━━━━━━━\n${global.config.BOTNAME} connected successfully!\nType \"${global.config.PREFIX}help\" to view all commands\n\nContact the admin if you encounter an error.\n\n👷Developer: ${global.config.BOTOWNER}`,
						api.getCurrentUserID(),
						event.threadID
				);
				return;
		}

		try {
				const { threadID } = event;
				let { threadName, participantIDs } = await api.getThreadInfo(threadID);
				const tn = threadName || "Unnamed group";
				const addedParticipants = event.logMessageData.addedParticipants;

				if (addedParticipants.length === 1) {
						// Single user added
						const newParticipant = addedParticipants[0];
						const userID = newParticipant.userFbId;
						api.getUserInfo(parseInt(userID), (err, data) => {
								if (err) return;
								const userName = data[Object.keys(data)].name.replace("@", "");
								if (userID !== api.getCurrentUserID()) {
										const welcomeText = `Hello ${userName}!\nWelcome to ${tn}\nYou're the ${participantIDs.length}th member in this group. Enjoy!`;
										api.shareContact(welcomeText, newParticipant.userFbId, event.threadID);
								}
						});
				} else {
						// Multiple users added
						const mentions = addedParticipants.map(participant => {
								return {
										tag: participant.fullName,
										id: participant.userFbId
								};
						});

						const welcomeText = `Hello ${mentions.map(m => m.tag).join(", ")}!\nWelcome to ${tn}\nEnjoy your stay!`;
						api.sendMessage({ body: welcomeText, mentions }, threadID);
				}
		} catch (err) {
				console.log("ERROR: " + err);
		}
};
