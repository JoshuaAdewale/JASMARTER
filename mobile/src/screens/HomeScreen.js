import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';

export default function HomeScreen({ navigation }) {
  const { user } = useSelector((s) => s.auth);

  const tiles = [
    { icon: '🔍', title: 'Browse properties',  action: () => navigation.navigate('Browse') },
    { icon: '📄', title: 'My leases',          action: () => navigation.navigate('Leases') },
    { icon: '🛠️', title: 'Maintenance',          action: () => navigation.navigate('Maintenance') },
    { icon: '➕', title: 'List a property',     action: () => navigation.navigate('Leases') }, // owners go to web
  ];

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="bg-brand-600 px-6 pt-16 pb-10 rounded-b-3xl">
        <Text className="text-white text-2xl font-bold">Hi, {user?.firstName} 👋</Text>
        <Text className="text-brand-100 mt-1">Your property, managed smartly.</Text>
      </View>

      <View className="px-4 mt-6">
        <View className="flex-row flex-wrap -mx-2">
          {tiles.map((t) => (
            <TouchableOpacity key={t.title} onPress={t.action} className="w-1/2 px-2 mb-3">
              <View className="bg-white rounded-2xl p-5 border border-slate-200">
                <Text className="text-3xl">{t.icon}</Text>
                <Text className="font-semibold mt-3">{t.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="bg-white rounded-2xl border border-slate-200 p-5 mt-2">
          <Text className="font-semibold">Tips</Text>
          <Text className="text-slate-600 text-sm mt-1">
            • Turn on notifications to get rent reminders.{'\n'}
            • Report maintenance issues with photos for faster resolution.{'\n'}
            • Use the web dashboard to upload multiple photos at once.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
