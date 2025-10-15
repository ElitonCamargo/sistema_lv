import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ajuste conforme seu ambiente (mesma variável usada no LoginScreen)
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL_API;

export default function HomeScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                console.log('Token encontrado:', token);
                if (!token) {
                    // sem token, volta para o login
                    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                    return;
                }
                // Obtendo usuário armazenado na key usuario do AsyncStorage
                
                const userLogin = await AsyncStorage.getItem('usuario');

                setUser(JSON.parse(userLogin));

            } catch (e) {
                console.log('Erro ao obter usuário:', e.message);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [navigation]);

    async function handleLogout() {
        try {
            await AsyncStorage.removeItem('token');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível sair.');
        }
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const displayName = user?.nome || user?.email || 'usuário';
    console.log('Usuário logado:', user);
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bem-vindo, {displayName}!</Text>
            <Text style={styles.subtitle}>Você está logado com sucesso.</Text>
            <View style={{ height: 12 }} />
            <Button title="Sair" onPress={handleLogout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#555', textAlign: 'center' }
});