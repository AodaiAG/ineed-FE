import React, { useEffect, useState } from "react";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Avatar,
  MessageText,
  ImageComponent,
  useMessageContext,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import "stream-chat-react/dist/css/v2/index.css";
import "./custom-styles.css";
import { useNavigate } from "react-router-dom";


const StreamChatComponent = ({ apiKey, userToken, channelId, userID, userRole }) => {
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const client = StreamChat.getInstance(apiKey);

  useEffect(() => {
    const setupChat = async () => {
      try {
        console.log(`Connecting user: ${userID}`);
        await client.connectUser({ id: userID }, userToken);

        console.log(`Joining channel: ${channelId}`);
        const joinedChannel = client.channel("messaging", channelId);

        await joinedChannel.watch();
        console.log("Channel joined successfully:", joinedChannel);

        setChannel(joinedChannel);
      } catch (error) {
        console.error("Error setting up chat:", error);
        setError(true);
      }
    };

    setupChat();

    return () => {
      if (client && client.userID) {
        console.log("Disconnecting user...");
        client.disconnectUser();
      }
    };
  }, [client, userToken, channelId, userID]);

  // Custom Message Component with Updated Logic
  const CustomMessage = (props) => {
    const { isMyMessage, message } = useMessageContext();
    const navigate = useNavigate();
  
    const messageUiClassNames = ["str-chat__message-simple"];
  
    if (isMyMessage()) {
      messageUiClassNames.push("str-chat__message--me");
    } else {
      messageUiClassNames.push("str-chat__message--other");
    }
  
    const isOwnMessage = message.user?.id === userID;
    const senderRole = message.user?.role;
  
    let displayName = message.user?.name || "משתמש לא ידוע";
    if (userRole === "prof" && senderRole === "client") {
      displayName = "לקוח אנונימי";
    }
  
    if (userRole === "prof" && senderRole === "prof" && !isOwnMessage) {
      displayName = "מומחה אנונימי";
    }

    // If it's the current user's message, show "אני"
    if (isOwnMessage) {
      displayName = "אני";
    }
  
    const handleAvatarClick = () => {
      if (message.user?.id) {
        navigate(`/profile/${message.user.id}`);
      }
    };

    // Check if message has attachments
    const hasImages = message.attachments?.some(attachment => attachment.type === 'image');
  
    return (
      <div className={messageUiClassNames.join(" ")} data-message-id={message.id}>
        <div className="str-chat__message-inner">
          <Avatar
            image={message.user?.image}
            name={displayName}
            //onClick={handleAvatarClick}
            className="str-chat__avatar"
          />
          <div className="str-chat__message-content">
            {hasImages && (
              <div className="str-chat__message-attachments">
                {message.attachments.map((attachment, index) => (
                  attachment.type === 'image' && (
                    <div key={index} className="str-chat__message-attachment">
                      <div 
                        style={{ 
                          position: 'relative',
                          cursor: 'pointer',
                          maxWidth: '300px'
                        }}
                      >
                        <img 
                          src={attachment.image_url}
                          alt="Chat attachment"
                          style={{ 
                            width: '100%', 
                            height: 'auto',
                            borderRadius: '8px'
                          }}
                          onClick={() => setSelectedImage(attachment.image_url)}
                        />
                        <a 
                          href={attachment.image_url} 
                          download 
                          className="str-chat__message-attachment-download"
                          onClick={(e) => e.stopPropagation()}
                          style={{ 
                            position: 'absolute',
                            right: '8px',
                            top: '8px',
                            background: 'white',
                            borderRadius: '50%',
                            padding: '4px',
                            cursor: 'pointer',
                            zIndex: 1,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          <svg className="str-chat__message-attachment-download-icon" data-testid="download" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04ZM19 18H6C3.79 18 2 16.21 2 14C2 11.95 3.53 10.24 5.56 10.03L6.63 9.92L7.13 8.97C8.08 7.14 9.94 6 12 6C14.62 6 16.88 7.86 17.39 10.43L17.69 11.93L19.22 12.04C20.78 12.14 22 13.45 22 15C22 16.65 20.65 18 19 18ZM13.45 10H10.55V13H8L12 17L16 13H13.45V10Z" fill="black"></path>
                          </svg>
                        </a>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
            <div className="str-chat__message-text">
              <MessageText />
            </div>
            <div className="str-chat__message-data">
              <span className="str-chat__message-username">{displayName}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  

  if (error) {
    return <div>Failed to initialize chat. Please try again later.</div>;
  }

  if (!channel) {
    return <p>Loading chat...</p>;
  }

  return (
    <>
      <Chat client={client} theme="messaging light">
        <Channel channel={channel}>
          <ChannelHeader />
          <MessageList Message={CustomMessage} />
          <MessageInput publishTypingEvent={false} />
        </Channel>
      </Chat>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage}
              alt="Enlarged chat attachment"
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain'
              }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default StreamChatComponent;