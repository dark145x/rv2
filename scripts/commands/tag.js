module.exports.config = { 
  prefix: true,
  name: "tag",
  version: "1.1.0",
  permission: 0,
  credits: "sakibin",
  description: "Mention users based on keyword, or mention all users with 'all' or '-a'.",
  category: "utility",
  usages: "[keyword|all|-a]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users }) {
  const { threadID, messageReply } = event;

  // If replying to a message, mention the sender of the replied message
  if (messageReply) {
      const senderID = messageReply.senderID;
      try {
          const userName = await Users.getNameUser(senderID); // Fetch the sender's name
          const mentions = [{ tag: userName, id: senderID }];
          return api.sendMessage(
              { body: `Mentioning ${userName}`, mentions },
              threadID,
              event.messageID
          );
      } catch (err) {
          console.log(`Error fetching user name for ID ${senderID}:`, err);
          return api.sendMessage("An error occurred while mentioning the user.", threadID);
      }
  }

  // Handle "all" or "-a" argument to mention all users
  if (args[0]?.toLowerCase() === "all" || args[0]?.toLowerCase() === "-a") {
      const threadInfo = await api.getThreadInfo(threadID); // Get all members in the thread
      const participants = threadInfo.participantIDs; // IDs of all participants in the group
      const mentions = [];
      const userNames = [];

      for (let userID of participants) {
          try {
              const userName = await Users.getNameUser(userID); // Fetch the user's name
              mentions.push({ tag: userName, id: userID }); // Add to mentions array
              userNames.push(userName); // Add to list of names
          } catch (err) {
              console.log(`Error fetching user name for ID ${userID}:`, err);
          }
      }

      if (mentions.length === 0) {
          return api.sendMessage("No users found in this group.", threadID);
      }

      const messageBody = `Mentioning everyone: ${userNames.join(", ")}`;
      return api.sendMessage({ body: messageBody, mentions }, threadID);
  }

  // Handle keyword-based search functionality
  const keyword = args[0]?.toLowerCase(); // Get the keyword from the arguments
  if (!keyword) {
      return api.sendMessage("Please provide a keyword to search for or use 'all'/'-a' to mention everyone.", threadID);
  }

  const threadInfo = await api.getThreadInfo(threadID); // Get all members in the thread
  const participants = threadInfo.participantIDs; // IDs of all participants in the group
  const mentions = [];
  const matchedNames = [];

  for (let userID of participants) {
      try {
          const userName = await Users.getNameUser(userID); // Fetch the user's name
          if (userName?.toLowerCase().startsWith(keyword)) { // Check if name starts with keyword
              mentions.push({ tag: userName, id: userID }); // Add to mentions array
              matchedNames.push(userName); // Add to matched names for summary
          }
      } catch (err) {
          console.log(`Error fetching user name for ID ${userID}:`, err);
      }
  }

  if (mentions.length === 0) {
      return api.sendMessage(`No users found with names starting with "${keyword}".`, threadID);
  }

  const messageBody = `Matching users: ${matchedNames.join(", ")}`;
  api.sendMessage({ body: messageBody, mentions }, threadID);
};
