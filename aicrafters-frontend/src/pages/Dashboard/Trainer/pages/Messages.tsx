import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Avatar, Paper, InputAdornment, CircularProgress, Autocomplete, Badge, Divider, useTheme } from '@mui/material';
import styled from 'styled-components';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { api } from '../../../../services/api';
import { format } from 'date-fns';
import { updateUnreadMessagesCount } from '../../../../utils/messages';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@mui/material';

// Modern styled components with consistent styling
const MessagesContainer = styled(Box)`
  display: flex;
  height: calc(100vh - 100px);
  gap: 0px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0px;
  }
`;

// Define custom prop types for styled components
type MobileProps = {
  $mobileView?: boolean;
  $showChats?: boolean;
};

// Create a wrapper for Paper that can accept our custom props
type StyledPaperProps = MobileProps & React.ComponentProps<typeof Paper>;

const StyledPaper = ({ $mobileView, $showChats, ...rest }: StyledPaperProps) => {
  return <Paper {...rest} />;
};

const ConversationsList = styled(StyledPaper)`
  width: 300px;
  overflow-y: auto;
  border-radius: 16px 0 0 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 768px) {
    width: 100%;
    border-radius: 16px;
    display: ${({ $mobileView, $showChats }: MobileProps) => 
      $mobileView && !$showChats ? 'none' : 'block'
    };
  }
`;

const ConversationItem = styled(Box)<{ $active?: boolean }>`
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  background: ${({ $active, theme }) => $active ? `${theme.palette.primary.main}10` : 'transparent'};
  border-left: ${({ $active, theme }) => $active ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent'};
  
  &:hover {
    background: ${({ theme }) => `${theme.palette.action.hover}`};
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 16px;
    right: 16px;
    height: 1px;
    background: ${({ theme }) => theme.palette.divider};
    opacity: 0.5;
  }
  
  &:last-child:after {
    display: none;
  }
`;

const ChatContainer = styled(StyledPaper)`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 0 16px 16px 0;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  background-image: ${({ theme }) => `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), 
    url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23${theme.palette.primary.main.substring(1)}' fill-opacity='0.03' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`};
  
  @media (max-width: 768px) {
    border-radius: 16px;
    display: ${({ $mobileView, $showChats }: MobileProps) => 
      $mobileView && $showChats ? 'none' : 'flex'
    };
  }
`;

const ChatHeader = styled(Box)`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const ChatMessages = styled(Box)`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
  contain: content;
  will-change: transform;
`;

const MessageGroup = styled(Box)<{ $sent?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: ${({ $sent }) => $sent ? 'flex-end' : 'flex-start'};
  max-width: 80%;
  align-self: ${({ $sent }) => $sent ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled(Box)<{ $sent?: boolean; $isFirst?: boolean; $isLast?: boolean }>`
  padding: 12px 16px;
  border-radius: ${({ $sent, $isFirst, $isLast }) => {
    if ($sent) {
      if ($isFirst && $isLast) return '16px 16px 4px 16px';
      if ($isFirst) return '16px 16px 4px 16px';
      if ($isLast) return '16px 4px 16px 16px';
      return '16px 4px 4px 16px';
    } else {
      if ($isFirst && $isLast) return '16px 16px 16px 4px';
      if ($isFirst) return '16px 16px 4px 4px';
      if ($isLast) return '4px 16px 16px 4px';
      return '4px 16px 4px 4px';
    }
  }};
  background: ${({ $sent, theme }) => $sent ? theme.palette.primary.main : '#F5F5F5'};
  color: ${({ $sent }) => $sent ? 'white' : '#1A1A1A'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: relative;
  max-width: 100%;
  word-break: break-word;
`;

// Create a CustomTypography component that accepts $sent prop
const CustomTypography = styled(Typography)<{ $sent?: boolean }>``;

// Create a wrapper for Typography that can accept our custom $sent prop
type MessageTimeProps = {
  $sent?: boolean;
  children: React.ReactNode;
};

const StyledTypography = ({ $sent, children, ...rest }: MessageTimeProps & Omit<React.ComponentProps<typeof Typography>, 'variant'>) => {
  return <Typography variant="caption" {...rest}>{children}</Typography>;
};

const MessageTime = styled(StyledTypography)`
  font-size: 0.7rem;
  color: ${({ $sent, theme }) => 
    $sent ? 'rgba(255, 255, 255, 0.7)' : theme.palette.text.secondary};
  margin-top: 2px;
`;

const DateDivider = styled(Box)`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.palette.text.secondary};
  margin: 16px 0;
  width: 100%;
  
  &:before, &:after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  }
  
  &:before {
    margin-right: 16px;
  }
  
  &:after {
    margin-left: 16px;
  }
`;

const ChatInput = styled(Box)`
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
  background-color: ${({ theme }) => theme.palette.background.paper};
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
`;

const SearchContainer = styled(Box)`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const StyledAvatar = styled(Avatar)`
  background: ${({ theme }) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`};
  color: white !important;
  & > * {
    color: white !important;
  }
`;

const NoConversationPlaceholder = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 16px;
  opacity: 0.8;
  padding: 0 20px;
  text-align: center;
`;

const UnreadBadge = styled(Badge)`
  .MuiBadge-badge {
    background: ${({ theme }) => theme.palette.secondary.main};
    color: white;
    font-weight: bold;
  }
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
  const theme = useTheme();
  
  // Mobile responsive states
  const isMobile = useMediaQuery('(max-width:768px)');
  const [showChats, setShowChats] = useState(true);

  // Add a new state for message loading
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Group messages by date for the date dividers
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  // Group messages by sender for the message bubbles
  const groupMessagesBySender = (messages: Message[]) => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];
    
    messages.forEach((message, index) => {
      if (index === 0 || messages[index - 1].sender !== message.sender) {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  };

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
    // Poll for new messages every 30 seconds instead of 10
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !selectedConversation.user?._id) return;

      setMessagesLoading(true);
      
      try {
        const response = await api.get(`/messages/${selectedConversation.user._id}`);
        const sortedMessages = [...response.data].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
        scrollToBottom();
        if (isMobile) {
          setShowChats(false);
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        // If we get a 404, it means the user was deleted
        if (axiosError.response?.status === 404) {
          setSelectedConversation(null);
          setConversations(prev => prev.filter(conv => conv.id !== selectedConversation.id));
        }
        console.error('Error fetching messages:', error);
      } finally {
        setMessagesLoading(false);
      }
    };

    // Clear messages immediately when conversation changes
    setMessages([]);
    
    if (selectedConversation) {
      fetchMessages();
      // Poll for new messages every 30 seconds instead of 10
      const interval = setInterval(fetchMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation, isMobile]);

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
    // Clear current messages immediately
    setMessages([]);
    
    // Set loading state for messages
    const prevConversation = selectedConversation;
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
      // This runs in the background and doesn't block the UI
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

  // Mobile navigation handler
  const handleBackToList = () => {
    setShowChats(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <MessagesContainer>
      <ConversationsList elevation={2} $mobileView={isMobile} $showChats={showChats}>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    }
                  }
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  )
                }}
              />
            )}
            onChange={(_, user) => handleUserSelect(user)}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5 }}>
                <StyledAvatar sx={{ width: 36, height: 36 }}>
                  {option.avatar ? (
                    <img src={option.avatar} alt={option.name} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    option.name[0]
                  )}
                </StyledAvatar>
                <Box>
                  <Typography variant="body1" fontWeight={500}>{option.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.email}
                  </Typography>
                </Box>
              </Box>
            )}
          />
        </SearchContainer>

        {conversations.length === 0 ? (
          <Box p={3} display="flex" justifyContent="center">
            <Typography variant="body2" color="text.secondary">
              {t('messages.noConversations', {defaultValue: 'No conversations found'})}
            </Typography>
          </Box>
        ) : (
          conversations
            .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime())
            .map(conversation => (
              <ConversationItem
                key={conversation.id}
                $active={selectedConversation?.id === conversation.id}
                onClick={() => handleConversationClick(conversation)}
              >
                <UnreadBadge
                  badgeContent={conversation.unreadCount}
                  color="secondary"
                  invisible={conversation.unreadCount <= 0}
                  overlap="circular"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                >
                  <StyledAvatar sx={{ width: 48, height: 48 }}>
                    {conversation.user?.fullName?.[0] || '?'}
                  </StyledAvatar>
                </UnreadBadge>
                <Box flex={1} overflow="hidden">
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      {conversation.user?.fullName || 'Unknown User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60, textAlign: 'right' }}>
                      {format(new Date(conversation.lastMessage.createdAt), 'HH:mm')}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    noWrap 
                    sx={{ 
                      fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                      color: conversation.unreadCount > 0 ? 'text.primary' : 'text.secondary'
                    }}
                  >
                    {conversation.lastMessage.content || 'Start a conversation'}
                  </Typography>
                </Box>
              </ConversationItem>
            ))
        )}
      </ConversationsList>

      <ChatContainer elevation={2} $mobileView={isMobile} $showChats={showChats}>
        {selectedConversation ? (
          <>
            <ChatHeader>
              {isMobile && (
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="back to list"
                  onClick={handleBackToList}
                  sx={{ mr: 1 }}
                >
                  <ArrowBackIcon />
                </IconButton>
              )}
              <StyledAvatar sx={{ width: 40, height: 40 }}>
                {selectedConversation.user?.fullName?.[0] || '?'}
              </StyledAvatar>
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedConversation.user?.fullName || 'Unknown User'}
                </Typography>
              </Box>
            </ChatHeader>

            <ChatMessages ref={chatMessagesRef}>
              {messagesLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress size={32} sx={{ color: theme.palette.primary.main }} />
                </Box>
              ) : (
                Object.entries(groupedMessages).map(([date, dayMessages]) => (
                  <React.Fragment key={date}>
                    <DateDivider>
                      <Typography variant="caption" px={2}>
                        {format(new Date(date), 'MMMM d, yyyy')}
                      </Typography>
                    </DateDivider>
                    
                    {groupMessagesBySender(dayMessages).map((group, groupIndex) => {
                      const isSent = group[0].sender !== selectedConversation.user._id;
                      return (
                        <MessageGroup key={groupIndex} $sent={isSent}>
                          {group.map((message, messageIndex) => (
                            <MessageBubble
                              key={message._id}
                              $sent={isSent}
                              $isFirst={messageIndex === 0}
                              $isLast={messageIndex === group.length - 1}
                            >
                              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                {message.content}
                              </Typography>
                              {messageIndex === group.length - 1 && (
                                <MessageTime $sent={isSent}>
                                  {format(new Date(message.createdAt), 'HH:mm')}
                                </MessageTime>
                              )}
                            </MessageBubble>
                          ))}
                        </MessageGroup>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </ChatMessages>

            <ChatInput>
              <TextField
                fullWidth
                multiline
                minRows={1}
                maxRows={6}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('messages.messagePlaceholder')}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '24px',
                    transition: 'all 0.2s ease',
                    '&.Mui-focused': {
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 0 0 2px ${theme.palette.primary.main}10`,
                    },
                    '& textarea': {
                      padding: '12px 16px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.divider,
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        color="primary"
                        sx={{ 
                          backgroundColor: newMessage.trim() ? theme.palette.primary.main : 'transparent',
                          color: newMessage.trim() ? 'white' : theme.palette.action.disabled,
                          '&:hover': {
                            backgroundColor: newMessage.trim() ? theme.palette.primary.dark : 'transparent'
                          }
                        }}
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
          <NoConversationPlaceholder>
            <img 
              src="https://www.gstatic.com/dynamite/images/ic_empty_state_conversations_dark_56dp.svg" 
              alt="No conversation selected" 
              width="100"
              height="100"
            />
            <Typography variant="h6" color="text.primary">
              {t('messages.selectConversation')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose an existing conversation or start a new one by searching for a user
            </Typography>
          </NoConversationPlaceholder>
        )}
      </ChatContainer>
    </MessagesContainer>
  );
};  