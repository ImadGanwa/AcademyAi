import React, { useEffect, useRef, useState } from 'react';
import { Box, TextField, Typography, Avatar, InputAdornment, IconButton } from '@mui/material';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { format } from 'date-fns';
import SendIcon from '@mui/icons-material/Send';
import { updateUnreadMessagesCount } from '../../../../utils/messages';

interface Conversation {
  id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    status: string;
    lastActive: Date;
  };
  lastMessage: {
    content: string;
    createdAt: Date;
    sender: string;
    read: boolean;
  };
  unreadCount: number;
}

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: Date;
  read: boolean;
}

const MessagesContainer = styled(Box)`
  display: flex;
  height: calc(100vh - 180px);
  gap: 20px;
  padding: 20px;
`;

const ConversationsList = styled(Box)`
  width: 300px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
`;

const ConversationItem = styled(Box)<{ selected?: boolean }>`
  padding: 15px;
  cursor: pointer;
  background-color: ${props => props.selected ? '#f5f5f5' : 'transparent'};
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ChatContainer = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled(Box)`
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
`;

const ChatMessages = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MessageBubble = styled(Box)<{ isOwn?: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
  background: ${props => props.isOwn ? '#E3F2FD' : '#F5F5F5'};
  color: #1A1A1A;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: relative;
`;

const MessageTime = styled(Typography)`
  font-size: 0.75rem;
  color: #757575;
  margin-top: 4px;
  text-align: ${props => props.align || 'left'};
`;

const ChatInput = styled(Box)`
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
`;

export const Messages: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/messages/conversations');
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
    // Poll for new conversations every 30 seconds
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;

      try {
        const response = await api.get(`/messages/${selectedConversation.user._id}`);
        const sortedMessages = [...response.data].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (selectedConversation) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await api.post('/messages/send', {
        receiverId: selectedConversation.user._id,
        content: newMessage.trim(),
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');

      // Update conversations list with new message
      setConversations(prev => {
        const updated = [...prev];
        const index = updated.findIndex(c => c.id === selectedConversation.id);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            lastMessage: {
              content: newMessage.trim(),
              createdAt: new Date(),
              sender: user?.id || '',
              read: false
            }
          };
        }
        return updated;
      });

      // Ensure scroll happens after state updates
      setTimeout(scrollToBottom, 0);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Update total unread count
  const updateTotalUnreadCount = (updatedConversations: Conversation[]) => {
    const totalUnread = updatedConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    updateUnreadMessagesCount(totalUnread);
  };

  const handleConversationSelect = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Immediately update the unread count in the frontend
    if (conversation.unreadCount > 0) {
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        );
        updateTotalUnreadCount(updated);
        return updated;
      });
    }
    
    // Mark messages as read in the backend asynchronously
    try {
      await api.post(`/messages/${conversation.user._id}/read`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return (
    <MessagesContainer>
      <ConversationsList>
        <Typography variant="h6" sx={{ p: 2 }}>
          {t('messages.conversations')}
        </Typography>
        {conversations
          .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime())
          .map(conversation => (
            <ConversationItem
              key={conversation.id}
              selected={selectedConversation?.id === conversation.id}
              onClick={() => handleConversationSelect(conversation)}
            >
              <Avatar sx={{ bgcolor: '#1976d2' }}>{conversation.user.fullName[0]}</Avatar>
              <Box flex={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={600}>
                    {conversation.user.fullName}
                  </Typography>
                  {conversation.unreadCount > 0 && (
                    <Box
                      sx={{
                        backgroundColor: '#1976d2',
                        color: 'white',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        marginLeft: 'auto'
                      }}
                    >
                      {conversation.unreadCount}
                    </Box>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {conversation.lastMessage.content}
                </Typography>
              </Box>
            </ConversationItem>
          ))}
      </ConversationsList>

      <ChatContainer>
        {selectedConversation ? (
          <>
            <ChatHeader>
              <Avatar sx={{ bgcolor: '#1976d2' }}>{selectedConversation.user.fullName[0]}</Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedConversation.user.fullName}
                </Typography>
              </Box>
            </ChatHeader>

            <ChatMessages ref={chatMessagesRef}>
              {messages.map(message => {
                const isOwn = message.sender !== selectedConversation?.user._id;
                return (
                  <MessageBubble
                    key={message._id}
                    isOwn={isOwn}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                    <MessageTime 
                      variant="caption" 
                      align={isOwn ? 'right' : 'left'}
                    >
                      {format(new Date(message.createdAt), 'HH:mm')}
                    </MessageTime>
                  </MessageBubble>
                );
              })}
            </ChatMessages>

            <ChatInput>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('messages.typeMessage')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        color="primary"
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </ChatInput>
          </>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography variant="h6" color="text.secondary">
              {t('messages.selectConversation')}
            </Typography>
          </Box>
        )}
      </ChatContainer>
    </MessagesContainer>
  );
}; 