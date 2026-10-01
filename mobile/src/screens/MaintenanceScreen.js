import { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import api from '../services/api';

export default function MaintenanceScreen() {
  const [items, setItems] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({ propertyId: '', title: '', description: '', category: 'other', priority: 'medium' });

  const load = async () => {
    const [maint, props] = await Promise.all([api.get('/maintenance'), api.get('/properties')]);
    setItems(maint.data);
    setProperties(props.data);
    if (!form.propertyId && props.data[0]) setForm((f) => ({ ...f, propertyId: props.data[0]._id }));
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.propertyId) return;
    await api.post(`/maintenance/${form.propertyId}`, form);
    setForm({ ...form, title: '', description: '' });
    load();
  };

  return (
    <View className="flex-1 bg-slate-50 pt-12 px-4">
      <Text className="text-2xl font-bold">Maintenance</Text>

      <View className="bg-white rounded-2xl p-4 mt-3 border border-slate-200">
        <TextInput className="border border-slate-300 rounded-xl p-3" placeholder="Title (e.g. Leaking tap)" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
        <TextInput className="border border-slate-300 rounded-xl p-3 mt-2 min-h-[80px]" placeholder="Describe the issue…" multiline value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />
        <View className="flex-row mt-2 space-x-2">
          <TextInput className="flex-1 border border-slate-300 rounded-xl p-3" placeholder="Property ID" value={form.propertyId} onChangeText={(v) => setForm({ ...form, propertyId: v })} />
          <TextInput className="flex-1 border border-slate-300 rounded-xl p-3" placeholder="Category"   value={form.category}   onChangeText={(v) => setForm({ ...form, category: v })} />
          <TextInput className="flex-1 border border-slate-300 rounded-xl p-3" placeholder="Priority"   value={form.priority}   onChangeText={(v) => setForm({ ...form, priority: v })} />
        </View>
        <TouchableOpacity onPress={submit} className="bg-brand-600 rounded-xl py-3 mt-3">
          <Text className="text-white text-center font-semibold">Submit request</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        className="mt-4"
        data={items}
        keyExtractor={(i) => i._id}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-200">
            <Text className="font-semibold">{item.title}</Text>
            <Text className="text-slate-600 text-sm">{item.description}</Text>
            <View className="flex-row mt-2 space-x-2">
              <Tag text={item.category} />
              <Tag text={item.priority} color="amber" />
              <Tag text={item.status} color="blue" />
            </View>
          </View>
        )}
      />
    </View>
  );
}

function Tag({ text, color = 'slate' }) {
  const cls = {
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
  }[color];
  return <Text className={`${cls} px-2 py-1 rounded-full text-xs`}>{text}</Text>;
}
