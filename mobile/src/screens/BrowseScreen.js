import { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function BrowseScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/properties', { params: city ? { city } : {} });
      setItems(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <View className="flex-1 bg-slate-50 pt-12 px-4">
      <Text className="text-2xl font-bold">Browse</Text>
      <TextInput
        value={city} onChangeText={setCity} onSubmitEditing={load}
        placeholder="Filter by city (e.g. Lagos)"
        className="border border-slate-300 rounded-xl px-4 py-3 mt-3 bg-white"
        returnKeyType="search"
      />

      {loading ? (
        <ActivityIndicator className="mt-10" />
      ) : (
        <FlatList
          className="mt-4"
          data={items}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text className="text-center text-slate-500 mt-10">No properties found.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('PropertyDetail', { id: item._id })}
              className="bg-white rounded-2xl mb-3 overflow-hidden border border-slate-200">
              <Image source={{ uri: item.photos[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600' }} className="w-full h-44" />
              <View className="p-4">
                <View className="flex-row justify-between">
                  <Text className="font-semibold flex-1" numberOfLines={1}>{item.title}</Text>
                  <Text className="text-brand-700 font-bold">${item.rentAmount}/mo</Text>
                </View>
                <Text className="text-slate-500 text-sm mt-1">{item.address.city}, {item.address.country}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
