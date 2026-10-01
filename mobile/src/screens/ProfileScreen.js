import { View, Text, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

export default function ProfileScreen() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  return (
    <View className="flex-1 bg-slate-50 pt-12 px-4">
      <Text className="text-2xl font-bold">Profile</Text>

      <View className="bg-white rounded-2xl p-5 mt-4 border border-slate-200 items-center">
        <View className="w-20 h-20 rounded-full bg-brand-600 items-center justify-center">
          <Text className="text-white text-3xl font-bold">{user?.firstName?.[0] || '?'}</Text>
        </View>
        <Text className="font-semibold text-lg mt-3">{user?.firstName} {user?.lastName}</Text>
        <Text className="text-slate-500">{user?.email}</Text>
        <Text className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs mt-2 capitalize">{user?.role}</Text>
      </View>

      <TouchableOpacity onPress={() => dispatch(logout())} className="bg-red-50 border border-red-200 rounded-xl py-3 mt-6">
        <Text className="text-red-600 text-center font-semibold">Log out</Text>
      </TouchableOpacity>
    </View>
  );
}
