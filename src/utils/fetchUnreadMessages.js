import { StreamChat } from "stream-chat";
import api from './api';

const apiKey = "nr6puhgsrawn";
const client = StreamChat.getInstance(apiKey);

const fetchUnreadMessages = async (userId, userToken, requestIds, type = 'client') => {
  try {
    // If no token is provided, try to generate a new one
    if (!userToken) {
      try {
        const response = await api.post('/api/generate-user-token', {
          id: userId,
          type: type
        });
        
        if (response.data.success) {
          userToken = response.data.token;
          // Store the new token in sessionStorage based on type
          sessionStorage.setItem(`${type}ChatToken`, userToken);
        } else {
          throw new Error('Failed to generate token');
        }
      } catch (error) {
        console.error('Error generating token:', error);
        return {};
      }
    }

    if (!client.userID) {
      await client.connectUser({ id: userId }, userToken);
    }

    const channelIds = requestIds.map((id) => `request_${id}`);
    if (!channelIds.length) return {};

    const channels = await client.queryChannels(
      { id: { $in: channelIds } },
      { last_message_at: -1 },
      { watch: true }
    );

    const unreadCounts = {};
    channels.forEach((channel) => {
      unreadCounts[channel.cid.split(":")[1].replace("request_", "")] = channel.countUnread();
    });

    return unreadCounts;
  } catch (error) {
    console.error("Error fetching unread messages:", error);
    return {};
  }
};

export default fetchUnreadMessages;
