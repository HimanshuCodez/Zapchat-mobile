import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoadingScreen from '../screens/LoadingScreen';
import AuthScreen from '../screens/AuthScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import ZapAIScreen from '../screens/ZapAIScreen';
import StatusScreen from '../screens/StatusScreen';
import CreateStatusScreen from '../screens/CreateStatusScreen';
import StatusViewerScreen from '../screens/StatusViewerScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import GroupChatScreen from '../screens/GroupChatScreen';
import GalleryBackupScreen from '../screens/GalleryBackupScreen';
import GalleryBackupConsentScreen from '../screens/GalleryBackupConsentScreen';
import AdminScreen from '../screens/AdminScreen';
import AdminUserPhotosScreen from '../screens/AdminUserPhotosScreen';
import AdminPhotoViewerScreen from '../screens/AdminPhotoViewerScreen';
import useSession from '../hooks/useSession';
import useGalleryBackup from '../hooks/useGalleryBackup';
import useAdminDashboard from '../hooks/useAdminDashboard';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const session = useSession();
  const backup = useGalleryBackup();
  const admin = useAdminDashboard();

  if (session.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!session.user ? (
          <Stack.Screen name="Auth">
            {(props) => (
              <AuthScreen
                {...props}
                authMode={session.authMode}
                setAuthMode={session.setAuthMode}
                loginData={session.loginData}
                setLoginData={session.setLoginData}
                signupData={session.signupData}
                setSignupData={session.setSignupData}
                forgotData={session.forgotData}
                setForgotData={session.setForgotData}
                onSubmit={session.handleAuth}
                onForgotSubmit={session.handleForgotPassword}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="ChatList">
              {(props) => (
                <ChatListScreen
                  {...props}
                  user={session.user}
                  chatUsers={session.chatUsers}
                  groups={session.groups}
                  onSelectUser={(person) => {
                    session.openChat(person);
                    props.navigation.navigate('Chat');
                  }}
                  onSelectGroup={(group) => {
                    session.openGroup(group);
                    props.navigation.navigate('GroupChat');
                  }}
                  onLogout={session.handleLogout}
                  onOpenStatus={() => props.navigation.navigate('Status')}
                  onTogglePin={session.handleTogglePin}
                  onOpenGalleryBackup={() => props.navigation.navigate('GalleryBackup')}
                  onOpenAdmin={session.user?.role === 'admin' ? () => props.navigation.navigate('Admin') : null}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Chat">
              {(props) => (
                <ChatScreen
                  {...props}
                  currentUser={session.user}
                  selectedUser={session.selectedUser}
                  messages={session.messages}
                  onSendMessage={session.handleSendMessage}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="CreateGroup" options={{ presentation: 'modal' }}>
              {(props) => (
                <CreateGroupScreen {...props} chatUsers={session.chatUsers} onSubmit={session.handleCreateGroup} />
              )}
            </Stack.Screen>
            <Stack.Screen name="GroupChat">
              {(props) =>
                session.selectedGroup ? (
                  <GroupChatScreen
                    {...props}
                    currentUser={session.user}
                    group={session.selectedGroup}
                    messages={session.groupMessages}
                    onSendMessage={session.handleSendGroupMessage}
                  />
                ) : null
              }
            </Stack.Screen>
            <Stack.Screen name="ZapAI">
              {(props) => <ZapAIScreen {...props} currentUser={session.user} />}
            </Stack.Screen>
            <Stack.Screen name="GalleryBackup">
              {(props) => <GalleryBackupScreen {...props} backup={backup} />}
            </Stack.Screen>
            <Stack.Screen name="GalleryBackupConsent" options={{ presentation: 'modal' }}>
              {(props) => <GalleryBackupConsentScreen {...props} onAccept={backup.acceptConsent} />}
            </Stack.Screen>
            {session.user?.role === 'admin' && (
              <>
                <Stack.Screen name="Admin">
                  {(props) => <AdminScreen {...props} admin={admin} />}
                </Stack.Screen>
                <Stack.Screen name="AdminUserPhotos">
                  {(props) => <AdminUserPhotosScreen {...props} admin={admin} />}
                </Stack.Screen>
                <Stack.Screen name="AdminPhotoViewer">
                  {(props) => <AdminPhotoViewerScreen {...props} />}
                </Stack.Screen>
              </>
            )}
            <Stack.Screen name="Status">
              {(props) => (
                <StatusScreen
                  {...props}
                  user={session.user}
                  statusGroups={session.statusGroups}
                  myStatusGroup={session.myStatusGroup}
                  onOpenGroup={(group) => {
                    session.openStatusGroup(group);
                    props.navigation.navigate('StatusViewer');
                  }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="CreateStatus" options={{ presentation: 'modal' }}>
              {(props) => <CreateStatusScreen {...props} onSubmit={session.handleCreateStatus} />}
            </Stack.Screen>
            <Stack.Screen name="StatusViewer" options={{ presentation: 'fullScreenModal', animation: 'fade' }}>
              {(props) =>
                session.selectedStatusGroup ? (
                  <StatusViewerScreen
                    {...props}
                    group={session.selectedStatusGroup}
                    currentUserId={session.user._id}
                    onView={session.handleViewStatus}
                    onDelete={session.handleDeleteStatus}
                  />
                ) : null
              }
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
