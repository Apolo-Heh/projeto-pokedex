import { use, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Card } from '@/components/card';
import { Alert } from '@/components/alert';

export default function Index() {
    const [name, setName] = useState<string>('');
    const [senha, setSenha] = useState<string>('');

    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [alertData, setAlertData] = useState({ 
        title: '', 
        message: '',
        type: 'success' as 'success' | 'error' | 'warning' | 'info',
    });

    const { signIn } = useAuth();

    function validateCredentials() {
        if(name === 'kleber' && senha === '123') {
            signIn(name);

            router.push({
                pathname: '/dashboard',
                params: { username: name } 
            });
        } else {
            setAlertData({
                title: 'Erro de Login',
                message: 'Credenciais inválidas. Tente novamente.',
                type: 'error',
            });
            setIsAlertVisible(true);
        }
    }

    return (
        <View style={styles.container}>
            <Card>
                <Image 
                    source={require('@assets/images/cat-icon.svg')} 
                    style={{ width: 200, height: 200 }} 
                />
                <Input 
                    placeholder="Usuario" 
                    onChangeText={setName} />
                <Input 
                    placeholder="Senha" 
                    secureTextEntry 
                    onChangeText={setSenha} />
                <Button 
                    title="Enviar" 
                    onPress={validateCredentials} 
                    style={{ marginTop: 20 }}/>
            </Card>

            <Alert 
                title={alertData.title}
                message={alertData.message}
                type={alertData.type}
                visible={isAlertVisible}
                onClose={() => setIsAlertVisible(false)}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
        flex: 1,
        padding: 32,
        justifyContent: 'center',
        gap: 16,
    },
    title: {
        color: '#333',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 26,
    },
});
