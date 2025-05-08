import React, { useEffect, useState } from 'react';
import { testSupabaseConnection } from './testConnection';

function App() {
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    async function checkConnection() {
      const status = await testSupabaseConnection();
      setConnectionStatus(status);
    }
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Statut de la connexion Supabase</h2>
        {connectionStatus ? (
          <div className={`p-4 rounded ${connectionStatus.connected ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={`text-lg ${connectionStatus.connected ? 'text-green-700' : 'text-red-700'}`}>
              {connectionStatus.message}
            </p>
          </div>
        ) : (
          <p className="text-gray-600">Vérification de la connexion...</p>
        )}
      </div>
    </div>
  );
}

export default App;
