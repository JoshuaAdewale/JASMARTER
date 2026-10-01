import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import api from '../services/api';

export default function PropertyDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [property, setProperty] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => { api.get(`/properties/${id}`).then((r) => setProperty(r.data)); }, [id]);

  if (!property) return <ActivityIndicator className="mt-20" />;

  const apply = async () => {
    try {
      await api.post(`/leases/apply/${id}`, { startDate: new Date(), endDate: new Date(Date.now() + 365 * 86400000), message });
      Alert.alert('Application sent', 'The owner will review your request.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not apply', e.response?.data?.error || e.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <Image source={{ uri: property.photos[0] }} className="w-full h-64" />
      <View className="p-5">
        <Text className="text-2xl font-bold">{property.title}</Text>
        <Text className="text-slate-500 mt-1">{property.address.street}, {property.address.city}, {property.address.country}</Text>

        <View className="flex-row flex-wrap mt-3">
          <Tag text={`$${property.rentAmount}/mo`} />
          <Tag text={property.propertyType} />
          <Tag text={`${property.bedrooms} bd · ${property.bathrooms} ba`} />
        </View>

        <Text className="mt-4 text-slate-700">{property.description}</Text>

        {property.amenities?.length > 0 && (
          <View className="mt-5">
            <Text className="font-semibold">Amenities</Text>
            <View className="flex-row flex-wrap mt-2">
              {property.amenities.map((a) => <Tag key={a} text={a} color="brand" />)}
            </View>
          </View>
        )}

        <View className="mt-6 border-t border-slate-200 pt-5">
          <Text className="font-semibold mb-2">Apply to lease</Text>
          <TextInput
            value={message} onChangeText={setMessage}
            placeholder="Tell the owner about yourself…"
            multiline
            className="border border-slate-300 rounded-xl p-3 min-h-[80px]"
          />
          <TouchableOpacity onPress={apply} className="bg-brand-600 rounded-xl py-3 mt-3">
            <Text className="text-white text-center font-semibold">Submit application</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function Tag({ text, color = 'slate' }) {
  const cls = color === 'brand' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-700';
  return <Text className={`${cls} px-2 py-1 rounded-full text-xs mr-2 mb-2`}>{text}</Text>;
}
