import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';

export default function LoginScreen({ navigation }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);

  const submit = () => dispatch(login(form));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white p-6 justify-center">
      <Text className="text-3xl font-bold text-slate-900">Welcome back</Text>
      <Text className="text-slate-500 mt-1">Sign in to manage your properties on the go.</Text>

      <View className="mt-8 space-y-3">
        <TextInput
          className="border border-slate-300 rounded-xl px-4 py-3"
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(v) => setForm({ ...form, email: v })}
        />
        <TextInput
          className="border border-slate-300 rounded-xl px-4 py-3"
          placeholder="Password"
          secureTextEntry
          value={form.password}
          onChangeText={(v) => setForm({ ...form, password: v })}
        />
        {error && <Text className="text-red-500 text-sm">{error}</Text>}
        <TouchableOpacity onPress={submit} disabled={loading} className="bg-brand-600 rounded-xl py-3 mt-2">
          {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-center font-semibold">Sign in</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} className="py-2">
          <Text className="text-center text-slate-600">New here? <Text className="text-brand-600 font-semibold">Create account</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
