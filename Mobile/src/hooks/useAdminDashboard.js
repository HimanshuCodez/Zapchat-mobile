import { useCallback, useMemo, useState } from 'react';
import { api } from '../api/client';

export default function useAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPhotos, setUserPhotos] = useState([]);
  const [userPhotosPage, setUserPhotosPage] = useState(0);
  const [hasMoreUserPhotos, setHasMoreUserPhotos] = useState(false);

  const fetchUsers = useCallback(async (q) => {
    const response = await api.get('/admin/users', { params: q ? { q } : {} });
    setUsers(response.data || []);
  }, []);

  const fetchGlobalStats = useCallback(async () => {
    const response = await api.get('/admin/stats');
    setGlobalStats(response.data);
  }, []);

  const openUser = useCallback(async (user, page = 1) => {
    const response = await api.get(`/admin/users/${user._id}/photos`, { params: { page, limit: 60 } });
    setSelectedUser(response.data.user);
    setUserPhotos((current) => (page === 1 ? response.data.photos : [...current, ...response.data.photos]));
    setUserPhotosPage(page);
    setHasMoreUserPhotos(response.data.hasMore);
  }, []);

  const loadMoreUserPhotos = useCallback(() => {
    if (hasMoreUserPhotos && selectedUser) {
      openUser(selectedUser, userPhotosPage + 1);
    }
  }, [hasMoreUserPhotos, selectedUser, userPhotosPage, openUser]);

  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
    setUserPhotos([]);
    setUserPhotosPage(0);
    setHasMoreUserPhotos(false);
  }, []);

  const deletePhoto = useCallback(async (photoId) => {
    await api.delete(`/admin/photos/${photoId}`);
    setUserPhotos((current) => current.filter((p) => p._id !== photoId));
  }, []);

  return useMemo(
    () => ({
      users,
      globalStats,
      selectedUser,
      userPhotos,
      hasMoreUserPhotos,
      fetchUsers,
      fetchGlobalStats,
      openUser,
      loadMoreUserPhotos,
      clearSelectedUser,
      deletePhoto,
    }),
    [
      users,
      globalStats,
      selectedUser,
      userPhotos,
      hasMoreUserPhotos,
      fetchUsers,
      fetchGlobalStats,
      openUser,
      loadMoreUserPhotos,
      clearSelectedUser,
      deletePhoto,
    ]
  );
}
