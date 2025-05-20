import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Paper,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import styled from 'styled-components';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const MessagesContainer = styled(Box)`
  display: flex;
  height: 100%;
  min-height: 600px;
`;

const ContactsList = styled(Paper)`
  width: 320px;
  border-radius: 12px;
  overflow: hidden;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
`;

const ChatContainer = styled(Paper)`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  margin-left: 16px;
`;

const ContactsHeader = styled(Box)`
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const SearchContainer = styled(Box)`
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  padding: 8px 12px;
  border-radius: 8px;
  margin-top: 12px;
`;

const ContactsListContainer = styled(List)`
  overflow-y: auto;
  max-height: calc(100% - 110px);
`;

const ContactItem = styled(ListItem)<{ $isActive?: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  background-color: ${({ $isActive }) => ($isActive ? 'rgba(0, 0, 0, 0.04)' : 'transparent')};
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;

const ChatHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const ChatContent = styled(Box)`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: #f9f9f9;
`;

const ChatInputContainer = styled(Box)`
  display: flex;
  align-items: center;
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
`;

const MessagePlaceholder = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 24px;
`;

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

export const Messages: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language;
  const [activeContact, setActiveContact] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data - would come from API in real application
  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Amara Okafor',
      avatar: '/avatars/avatar1.jpg',
      lastMessage: "I'm looking forward to our session tomorrow",
      time: '10:30 AM',
      unread: 2,
    },
    {
      id: '2',
      name: 'David Chen',
      avatar: '/avatars/avatar2.jpg',
      lastMessage: 'Thank you for your help with the project',
      time: 'Yesterday',
      unread: 0,
    },
    {
      id: '3',
      name: 'Sophie Martin',
      avatar: '/avatars/avatar3.jpg',
      lastMessage: 'Can we reschedule our session?',
      time: 'Monday',
      unread: 1,
    },
    {
      id: '4',
      name: 'Miguel Rodriguez',
      avatar: '/avatars/avatar4.jpg',
      lastMessage: 'I have a question about the assignment',
      time: 'Last week',
      unread: 0,
    },
  ];

  const handleContactClick = (contactId: string) => {
    setActiveContact(contactId);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" sx={{  mb: 3 }}>
        {t('mentorship.messages.title', 'Messages') as string}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('mentorship.messages.description', 'Chat with your mentees and manage your conversations')}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('mentorship.messages.error', 'Failed to load conversations. Please try again.') as string}
        </Alert>
      ) : (
        <MessagesContainer>
          <ContactsList elevation={1}>
            <ContactsHeader>
              <Typography variant="h6">{t('mentorship.messages.conversations', 'Conversations')}</Typography>
              <SearchContainer>
                <SearchIcon sx={{ color: '#666', mr: 1 }} />
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder={t('mentorship.messages.searchPlaceholder', 'Search contacts')}
                  InputProps={{ disableUnderline: true }}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </SearchContainer>
            </ContactsHeader>
            <ContactsListContainer>
              {filteredContacts.map((contact) => (
                <React.Fragment key={contact.id}>
                  <ContactItem
                    $isActive={activeContact === contact.id}
                    onClick={() => handleContactClick(contact.id)}
                  >
                    <ListItemAvatar>
                      <Avatar src={contact.avatar} alt={contact.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1">{contact.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {contact.time}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '180px',
                            }}
                          >
                            {contact.lastMessage}
                          </Typography>
                          {contact.unread > 0 && (
                            <Box
                              sx={{
                                ml: 1,
                                bgcolor: 'primary.main',
                                color: 'white',
                                borderRadius: '50%',
                                width: 20,
                                height: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                              }}
                            >
                              {contact.unread}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ContactItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </ContactsListContainer>
          </ContactsList>

          <ChatContainer elevation={1}>
            {activeContact ? (
              <>
                <ChatHeader>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={contacts.find((c) => c.id === activeContact)?.avatar}
                      alt={contacts.find((c) => c.id === activeContact)?.name}
                      sx={{ mr: 2 }}
                    />
                    <Typography variant="h6">
                      {contacts.find((c) => c.id === activeContact)?.name}
                    </Typography>
                  </Box>
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </ChatHeader>
                <ChatContent>
                  {/* Message bubbles would go here in a real app */}
                  <Typography variant="body2" color="text.secondary" align="center">
                    {/* Messages will appear here in a real app */}
                    {t('mentorship.messages.noMessagesYet', 'Messages will appear here.') as string}
                  </Typography>
                </ChatContent>
                <ChatInputContainer>
                  <TextField
                    fullWidth
                    placeholder={t('mentorship.messages.typeMessage', 'Type a message')}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 2 }}
                  />
                  <Button variant="contained">{t('mentorship.messages.send', 'Send')}</Button>
                </ChatInputContainer>
              </>
            ) : (
              <MessagePlaceholder>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {t('mentorship.messages.selectConversation', 'Select a conversation')}
                </Typography>
                <Typography variant="body2">
                  {t('mentorship.messages.chooseContact', 'Choose a contact from the list to start chatting')}
                </Typography>
              </MessagePlaceholder>
            )}
          </ChatContainer>
        </MessagesContainer>
      )}
    </Box>
  );
}; 