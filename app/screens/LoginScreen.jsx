import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ajuste conforme seu ambiente (ver observações acima)
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL_API;

export default function LoginScreen({ navigation }) {
    console.log('BASE_URL:', BASE_URL); // Adicione este log para verificar a variável
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    // Função para lidar com o login
    async function handleLogin() {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/usuario/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            const json = await res.json();
            if (json.success) {
                await AsyncStorage.setItem('token', json.data.token);
                await AsyncStorage.setItem('usuario', JSON.stringify(json.data.usuario));
                Alert.alert('Sucesso', json.message);
                setEmail('');
                setSenha('');
                navigation.navigate('Home');
                // aqui você pode navegar para a tela principal do app
            } else {
                Alert.alert('Erro', json.message || 'Login falhou');
                alert(`Erro: ${json.message || 'Login falhou'}`);
                console.log('Login falhou:', json); // Log para depuração
            }
        } catch (e) {
            Alert.alert('Erro', e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Faça login</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                style={styles.input}
                secureTextEntry
            />
            <Button title={loading ? 'Entrando...' : 'Entrar'} onPress={handleLogin} />
            <View style={{ height: 12 }} />
            <Button title="Criar conta" onPress={() => navigation.navigate('Register')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    input: { height: 48, borderColor: '#ccc', borderWidth: 1, paddingHorizontal: 10, marginBottom: 12, borderRadius: 6 },
    title: { fontSize: 24, marginBottom: 12, textAlign: 'center' }
});