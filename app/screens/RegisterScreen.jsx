import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';

// Ajuste conforme seu ambiente (ver observações acima)
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL_API;

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, cargo, avatar })
      });
      const json = await res.json();
      if (json.success) {
        Alert.alert('Sucesso', json.message, [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
        alert('Sucesso', json.message);
        setNome('');
        setEmail('');
        setSenha('');
        setCargo('');
        setAvatar('');
        navigation.navigate('Login');
      } else {
        Alert.alert('Erro', json.message || 'Falha no cadastro');
      }
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>
      <TextInput placeholder="Nome" value={nome} onChangeText={setNome} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Senha" value={senha} onChangeText={setSenha} style={styles.input} secureTextEntry />
      <TextInput placeholder="Cargo" value={cargo} onChangeText={setCargo} style={styles.input} />
      <TextInput placeholder="Avatar (nome do arquivo)" value={avatar} onChangeText={setAvatar} style={styles.input} />
      <Button title={loading ? 'Cadastrando...' : 'Cadastrar'} onPress={handleRegister} />
      <View style={{ height: 12 }} />
      <Button title="Entrar" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { height: 48, borderColor: '#ccc', borderWidth: 1, paddingHorizontal: 10, marginBottom: 12, borderRadius: 6 },
  title: { fontSize: 24, marginBottom: 12, textAlign: 'center' }
});