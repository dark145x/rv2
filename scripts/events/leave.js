const fs = require("fs");

module.exports.config = {
		name: "leaveNoti",
		eventType: ["log:unsubscribe"],
		version: "1.0.0",
		credits: "Jonell Magallanes",
		description: "Notify left members",
		dependencies: {
				"fs-extra": "",
				"path": ""
		}
};

module.exports.run = async function({ api, event, Users, Threads }) {
		function reply(data) {
				api.sendMessage(data, event.threadID, event.messageID);
		}

		if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

		let { threadName, participantIDs } = await api.getThreadInfo(event.threadID);
		const type = (event.author == event.logMessageData.leftParticipantFbId) ? "left the group." : "kicked by Admin of the group";
		let name = (await api.getUserInfo(event.logMessageData.leftParticipantFbId))[event.logMessageData.leftParticipantFbId].name;

		let leaveMessage = `${name} has been ${type}\nMember’s left: ${participantIDs.length}`;

		api.shareContact(leaveMessage, event.logMessageData.leftParticipantFbId, event.threadID);
};