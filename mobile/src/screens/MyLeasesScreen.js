import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import api from '../services/api';

const color = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  terminated: 'bg-slate-200 text-slate-700',
  completed: 'bg-slate-200 text-slate-700',
};

export default function MyLeasesScreen() {
  const [items, setItems] = useState([]);
  const [paying, setPaying] = useState(null);

  const load = async () => { setItems((await api.get('/leases/mine')).data); };
  useEffect(() => { load(); }, []);

  const decide = async (id, action) => {
    await api.post(`/leases/${id}/decision`, { action });
    load();
  };

  const payRent = async (lease) => {
    setPaying(lease._id);
    try {
      const { data } = await api.post('/payments/create-intent', { leaseId: lease._id, amount: lease.monthlyRent });
      await api.post('/payments/confirm', { leaseId: lease._id, paymentIntentId: data.paymentIntentId, status: 'succeeded' });
      Alert.alert('Paid', 'Rent marked as paid (MVP). Add Stripe SDK for real payments.');
      load();
    } catch (e) {
      Alert.alert('Payment error', e.response?.data?.error || e.message);
    } finally { setPaying(null); }
  };

  return (
    <View className="flex-1 bg-slate-50 pt-12 px-4">
      <Text className="text-2xl font-bold">My leases</Text>
      <FlatList
        className="mt-3"
        data={items}
        keyExtractor={(i) => i._id}
        ListEmptyComponent={<Text className="text-center text-slate-500 mt-10">No leases yet.</Text>}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-200">
            <Text className="font-semibold">{item.property?.title}</Text>
            <Text className="text-slate-500 text-sm">{new Date(item.startDate).toDateString()} → {new Date(item.endDate).toDateString()}</Text>
            <Text className="text-brand-700 font-bold mt-1">${item.monthlyRent}/mo</Text>

            <View className="flex-row items-center mt-2 space-x-2">
              <Text className={`px-2 py-1 rounded-full text-xs ${color[item.status]}`}>{item.status}</Text>
            </View>

            <View className="flex-row mt-3 space-x-2">
              {item.status === 'pending' && (
                <>
                  <TouchableOpacity onPress={() => decide(item._id, 'approve')} className="bg-brand-600 px-3 py-2 rounded-lg">
                    <Text className="text-white text-xs font-semibold">Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => decide(item._id, 'reject')} className="bg-red-100 px-3 py-2 rounded-lg">
                    <Text className="text-red-700 text-xs font-semibold">Reject</Text>
                  </TouchableOpacity>
                </>
              )}
              {['approved','active'].includes(item.status) && (
                <TouchableOpacity onPress={() => payRent(item)} disabled={paying === item._id} className="bg-brand-600 px-3 py-2 rounded-lg">
                  <Text className="text-white text-xs font-semibold">{paying === item._id ? '…' : 'Pay rent'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}
