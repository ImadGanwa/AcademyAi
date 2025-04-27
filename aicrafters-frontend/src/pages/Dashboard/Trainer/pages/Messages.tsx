import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Avatar, Paper, InputAdornment, CircularProgress, Autocomplete } from '@mui/material';
import styled from 'styled-components';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import { api } from '../../../../services/api';
import { format } from 'date-fns';
import { updateUnreadMessagesCount } from '../../../../utils/messages';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

const MessagesContainer = styled(Box)`
  display: flex;
  height: calc(100vh - 100px);
  gap: 24px;
`;

const ConversationsList = styled(Paper)`
  width: 300px;
  overflow-y: auto;
  border-radius: 12px;
`;

const ConversationItem = styled(Box)<{ $active?: boolean }>`
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  background: ${({ $active, theme }) => $active ? theme.palette.action.selected : 'transparent'};
  
  &:hover {
    background: ${({ theme }) => theme.palette.action.hover};
  }
`;

const ChatContainer = styled(Paper)`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
`;

const ChatHeader = styled(Box)`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ChatMessages = styled(Box)`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled(Box)<{ $sent?: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  align-self: ${({ $sent }) => $sent ? 'flex-start' : 'flex-end'};
  background: ${({ $sent }) => $sent ? '#F5F5F5' : '#E3F2FD'};
  color: #1A1A1A;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const MessageTime = styled(Typography)`
  font-size: 0.75rem;
  color: #757575;
  margin-top: 4px;
`;

const ChatInput = styled(Box)`
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
`;

const SearchContainer = styled(Box)`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

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

export const Messages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/trainer/users');
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/messages/conversations');
        // Filter out conversations with deleted users
        const validConversations = response.data.filter(
          (conv: Conversation) => conv.user && conv.user._id && conv.user.fullName
        );
        setConversations(validConversations);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
      }
    };

    fetchConversations();
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !selectedConversation.user?._id) return;

      try {
        const response = await api.get(`/messages/${selectedConversation.user._id}`);
        const sortedMessages = [...response.data].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
        scrollToBottom();
      } catch (error) {
        const axiosError = error as AxiosError;
        // If we get a 404, it means the user was deleted
        if (axiosError.response?.status === 404) {
          setSelectedConversation(null);
          setConversations(prev => prev.filter(conv => conv.id !== selectedConversation.id));
        }
        console.error('Error fetching messages:', error);
      }
    };

    if (selectedConversation) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await api.post('/messages/send', {
        receiverId: selectedConversation.user._id,
        content: newMessage.trim()
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
              sender: response.data.sender,
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

  const handleConversationClick = async (conversation: Conversation) => {
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

  const handleUserSelect = async (user: User | null) => {
    if (!user) return;

    // Check if conversation with this user already exists
    const existingConversation = conversations.find(
      conv => conv.user._id === user.id
    );

    if (existingConversation) {
      handleConversationClick(existingConversation);
    } else {
      // Create a new conversation object
      const newConversation: Conversation = {
        id: user.id,
        user: {
          _id: user.id,
          fullName: user.name,
          email: user.email,
          status: 'active',
          lastActive: new Date()
        },
        lastMessage: {
          content: '',
          createdAt: new Date(),
          sender: '',
          read: true
        },
        unreadCount: 0
      };

      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setMessages([]);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MessagesContainer>
      <ConversationsList elevation={0}>
        <SearchContainer>
          <Autocomplete
            fullWidth
            options={users}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={t('messages.searchUsers')}
                variant="outlined"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            )}
            onChange={(_, user) => handleUserSelect(user)}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {option.avatar ? (
                    <img src={option.avatar} alt={option.name} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    option.name[0]
                  )}
                </Avatar>
                <Box>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.email}
                  </Typography>
                </Box>
              </Box>
            )}
          />
        </SearchContainer>

        {conversations
          .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime())
          .map(conversation => (
            <ConversationItem
              key={conversation.id}
              $active={selectedConversation?.id === conversation.id}
              onClick={() => handleConversationClick(conversation)}
            >
              <Avatar sx={{ bgcolor: '#1976d2' }}>
                {conversation.user?.fullName?.[0] || '?'}
              </Avatar>
              <Box flex={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={600}>
                    {conversation.user?.fullName || 'Unknown User'}
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
                        fontSize: '0.75rem'
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

      <ChatContainer elevation={0}>
        {selectedConversation ? (
          <>
            <ChatHeader>
              <Avatar sx={{ bgcolor: '#1976d2' }}>
                {selectedConversation.user?.fullName?.[0] || '?'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedConversation.user?.fullName || 'Unknown User'}
                </Typography>
              </Box>
            </ChatHeader>

            <ChatMessages ref={chatMessagesRef}>
              {messages.map(message => (
                <MessageBubble
                  key={message._id}
                  $sent={message.sender === selectedConversation.user._id}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                  <MessageTime variant="caption">
                    {format(new Date(message.createdAt), 'HH:mm')}
                  </MessageTime>
                </MessageBubble>
              ))}
            </ChatMessages>

            <ChatInput>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('messages.messagePlaceholder')}
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