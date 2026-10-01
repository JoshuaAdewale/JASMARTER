import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../store/slices/authSlice';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'tenant' });
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);

  const submit = () => dispatch(register(form));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
        <Text className="text-3xl font-bold text-slate-900">Create account</Text>
        <Text className="text-slate-500 mt-1">Join JASMARTA — manage properties anywhere.</Text>

        <View className="mt-6 space-y-3">
          <View className="flex-row space-x-3">
            <TextInput className="flex-1 border border-slate-300 rounded-xl px-4 py-3" placeholder="First name" value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} />
            <TextInput className="flex-1 border border-slate-300 rounded-xl px-4 py-3" placeholder="Last name"  value={form.lastName}  onChangeText={(v) => setForm({ ...form, lastName: v })} />
          </View>
          <TextInput className="border border-slate-300 rounded-xl px-4 py-3" placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} />
          <TextInput className="border border-slate-300 rounded-xl px-4 py-3" placeholder="Password (min 6)" secureTextEntry value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} />

          <View className="flex-row space-x-2 mt-1">
            {['tenant','owner'].map((r) => (
              <TouchableOpacity key={r} onPress={() => setForm({ ...form, role: r })}
                className={`flex-1 py-3 rounded-xl border ${form.role === r ? 'bg-brand-600 border-brand-600' : 'border-slate-300'}`}>
                <Text className={`text-center font-semibold capitalize ${form.role === r ? 'text-white' : 'text-slate-700'}`}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {error && <Text className="text-red-500 text-sm">{error}</Text>}
          <TouchableOpacity onPress={submit} disabled={loading} className="bg-brand-600 rounded-xl py-3 mt-2">
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-center font-semibold">Create account</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} className="py-2">
            <Text className="text-center text-slate-600">Already have an account? <Text className="text-brand-600 font-semibold">Sign in</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
