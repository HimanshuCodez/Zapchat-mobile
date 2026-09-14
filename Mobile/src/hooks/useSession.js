import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { io } from 'socket.io-client';
import { api, saveToken, SOCKET_URL, TOKEN_KEY } from '../api/client';

export default function useSession() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '', number: '' });
  const [signupData, setSignupData] = useState({ fullname: '', email: '', number: '', password: '' });
  const [forgotData, setForgotData] = useState({ email: '', number: '', newPassword: '' });
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [statusGroups, setStatusGroups] = useState([]);
  const [selectedStatusGroup, setSelectedStatusGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = async () => {
    await saveToken(null);
    setUser(null);
    setSelectedUser(null);
    setMessages([]);
    setChatUsers([]);
    setStatusGroups([]);
    setSelectedStatusGroup(null);
    setOnlineUserIds([]);
    setGroups([]);
    setSelectedGroup(null);
    setGroupMessages([]);
  };

  const fetchChatUsers = async () => {
    try {
      const response = await api.get('/messages/users');
      setChatUsers(response.data || []);
    } catch (error) {
      console.log('fetchChatUsers error', error.response?.data || error.message);
    }
  };

  const openChat = async (person) => {
    setSelectedUser(person);

    try {
      const response = await api.get(`/messages/${person._id}`);
      setMessages(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Could not load messages');
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await api.get('/status');
      setStatusGroups(response.data || []);
    } catch (error) {
      console.log('fetchStatuses error', error.response?.data || error.message);
    }
  };

  const openStatusGroup = (group) => {
    setSelectedStatusGroup(group);
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data || []);
    } catch (error) {
      console.log('fetchGroups error', error.response?.data || error.message);
    }
  };

  const openGroup = async (group) => {
    setSelectedGroup(group);

    try {
      const response = await api.get(`/groups/${group._id}/messages`);
      setGroupMessages(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Could not load group messages');
    }
  };

  const handleCreateGroup = async ({ name, memberIds }) => {
    try {
      const response = await api.post('/groups', { name, memberIds });
      setGroups((current) => [response.data, ...current]);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Could not create group';
      Alert.alert('Group creation failed', message);
      throw error;
    }
  };

  const handleSendGroupMessage = async (text) => {
    if (!selectedGroup || !text.trim()) return;

    try {
      const response = await api.post(`/groups/${selectedGroup._id}/messages`, { text: text.trim() });
      setGroupMessages((current) => [...current, response.data]);
    } catch (error) {
      Alert.alert('Message error', error.response?.data?.error || 'Could not send message');
    }
  };

  const handleCreateStatus = async ({ image, caption, backgroundColor, song }) => {
    try {
      await api.post('/status', { image, caption, backgroundColor, song });
      await fetchStatuses();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Could not post status';
      Alert.alert('Status failed', message);
      throw error;
    }
  };

  const handleViewStatus = async (statusId) => {
    setStatusGroups((current) =>
      current.map((group) => ({
        ...group,
        statuses: group.statuses.map((status) =>
          status._id === statusId ? { ...status, viewedByMe: true } : status
        ),
      }))
    );

    try {
      await api.post(`/status/${statusId}/view`);
    } catch (error) {
      console.log('view status error', error.message);
    }
  };

  const handleDeleteStatus = async (statusId) => {
    setStatusGroups((current) =>
      current
        .map((group) => ({
          ...group,
          statuses: group.statuses.filter((status) => status._id !== statusId),
        }))
        .filter((group) => group.statuses.length > 0)
    );

    try {
      await api.delete(`/status/${statusId}`);
    } catch (error) {
      console.log('delete status error', error.message);
    }
  };

  const handleAuth = async () => {
    const payload = authMode === 'login' ? loginData : signupData;
    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/signup';

    if (authMode === 'login' && (!payload.email || !payload.password || !payload.number)) {
      Alert.alert('Missing fields', 'Email, phone number, and password are required.');
      return;
    }

    if (authMode === 'signup' && (!payload.fullname || !payload.email || !payload.password || !payload.number)) {
      Alert.alert('Missing fields', 'Please fill in all signup fields.');
      return;
    }

    try {
      const response = await api.post(endpoint, payload);
      const token = response.data?.token;
      const loggedUser = response.data?.user;

      if (!token || !loggedUser) {
        throw new Error('Authentication data was incomplete.');
      }

      await saveToken(token);
      setUser(loggedUser);
      setSelectedUser(null);
      setMessages([]);
      if (authMode === 'login') {
        setLoginData({ email: '', password: '', number: '' });
      } else {
        setSignupData({ fullname: '', email: '', number: '', password: '' });
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Authentication failed';
      Alert.alert('Authentication failed', message);
    }
  };

  const handleForgotPassword = async () => {
    const { email, number, newPassword } = forgotData;

    if (!email || !number || !newPassword) {
      Alert.alert('Missing fields', 'Email, phone number, and new password are required.');
      return;
    }

    try {
      await api.post('/auth/reset-password', { email, number, newPassword });
      setForgotData({ email: '', number: '', newPassword: '' });
      setAuthMode('login');
      Alert.alert('Password reset', 'Your password has been reset. Please sign in.');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Could not reset password';
      Alert.alert('Reset failed', message);
    }
  };

  const handleTogglePin = async (userId) => {
    setChatUsers((current) =>
      current.map((person) => (person._id === userId ? { ...person, isPinned: !person.isPinned } : person))
    );

    try {
      await api.post(`/messages/pin/${userId}`);
    } catch (error) {
      console.log('toggle pin error', error.message);
      setChatUsers((current) =>
        current.map((person) => (person._id === userId ? { ...person, isPinned: !person.isPinned } : person))
      );
    }
  };

  const handleSendMessage = async (text) => {
    if (!selectedUser || !text.trim()) return;

    try {
      const response = await api.post(`/messages/send/${selectedUser._id}`, { text: text.trim() });
      setMessages((current) => [...current, response.data]);
    } catch (error) {
      Alert.alert('Message error', error.response?.data?.message || 'Could not send message');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Logout failed', error.message);
    } finally {
      await clearSession();
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        const response = await api.get('/auth/check');
        setUser(response.data);
      } catch (error) {
        console.log('check auth failed', error.response?.data || error.message);
        await clearSession();
      }

      setIsLoading(false);
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchChatUsers();
    fetchStatuses();
    fetchGroups();

    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      query: { userId: user._id },
    });

    socketInstance.on('connect', () => {
      console.log('socket connected');
    });

    socketInstance.on('getOnlineUsers', (ids) => {
      setOnlineUserIds(ids || []);
    });

    socketInstance.on('newMessage', (message) => {
      if (!selectedUser) return;
      if (message.senderId !== selectedUser._id && message.receiverId !== selectedUser._id) {
        return;
      }

      setMessages((current) => {
        const exists = current.some((item) => item._id === message._id);
        return exists ? current : [...current, message];
      });
    });

    socketInstance.on('newStatus', ({ user: statusUser, status }) => {
      setStatusGroups((current) => {
        const idx = current.findIndex((group) => group.user._id === statusUser._id);
        if (idx === -1) {
          return [...current, { user: statusUser, statuses: [status] }];
        }
        const updated = [...current];
        updated[idx] = { ...updated[idx], statuses: [...updated[idx].statuses, status] };
        return updated;
      });
    });

    socketInstance.on('statusDeleted', ({ statusId }) => {
      setStatusGroups((current) =>
        current
          .map((group) => ({ ...group, statuses: group.statuses.filter((status) => status._id !== statusId) }))
          .filter((group) => group.statuses.length > 0)
      );
    });

    socketInstance.on('newGroup', (group) => {
      setGroups((current) => (current.some((item) => item._id === group._id) ? current : [group, ...current]));
    });

    socketInstance.on('groupUpdated', (group) => {
      setGroups((current) => current.map((item) => (item._id === group._id ? group : item)));
      setSelectedGroup((current) => (current && current._id === group._id ? group : current));
    });

    socketInstance.on('newGroupMessage', (message) => {
      if (!selectedGroup || message.groupId !== selectedGroup._id) return;

      setGroupMessages((current) => {
        const exists = current.some((item) => item._id === message._id);
        return exists ? current : [...current, message];
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user, selectedUser?._id, selectedGroup?._id]);

  useEffect(() => {
    if (!user || !selectedUser) return;
    const syncMessages = async () => {
      try {
        const response = await api.get(`/messages/${selectedUser._id}`);
        setMessages(response.data || []);
      } catch (error) {
        console.log('syncMessages error', error.message);
      }
    };

    syncMessages();
  }, [selectedUser, user]);

  const myStatusGroup = useMemo(
    () => statusGroups.find((group) => group.user._id === user?._id) || null,
    [statusGroups, user]
  );

  const chatUsersView = useMemo(
    () =>
      [...chatUsers]
        .map((person) => ({ ...person, isOnline: onlineUserIds.includes(person._id) }))
        .sort((a, b) => Number(!!b.isPinned) - Number(!!a.isPinned)),
    [chatUsers, onlineUserIds]
  );

  const selectedUserView = useMemo(() => {
    if (!selectedUser) return null;
    const known = chatUsers.find((person) => person._id === selectedUser._id);
    return {
      ...selectedUser,
      lastSeen: known?.lastSeen ?? selectedUser.lastSeen,
      isPinned: known?.isPinned ?? selectedUser.isPinned,
      isOnline: onlineUserIds.includes(selectedUser._id),
    };
  }, [selectedUser, chatUsers, onlineUserIds]);

  return useMemo(
    () => ({
      user,
      isLoading,
      authMode,
      setAuthMode,
      loginData,
      setLoginData,
      signupData,
      setSignupData,
      forgotData,
      setForgotData,
      chatUsers: chatUsersView,
      selectedUser: selectedUserView,
      messages,
      statusGroups,
      myStatusGroup,
      selectedStatusGroup,
      groups,
      selectedGroup,
      groupMessages,
      openChat,
      openStatusGroup,
      openGroup,
      handleAuth,
      handleForgotPassword,
      handleSendMessage,
      handleLogout,
      handleCreateStatus,
      handleViewStatus,
      handleDeleteStatus,
      handleTogglePin,
      handleCreateGroup,
      handleSendGroupMessage,
    }),
    [
      user,
      isLoading,
      authMode,
      loginData,
      signupData,
      forgotData,
      chatUsersView,
      selectedUserView,
      messages,
      statusGroups,
      myStatusGroup,
      selectedStatusGroup,
      groups,
      selectedGroup,
      groupMessages,
    ]
  );
}
