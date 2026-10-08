import React from 'react';
import { useApp } from './context/AppContext';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ServerListScreen } from './screens/ServerListScreen';
import { SpeedTestScreen } from './screens/SpeedTestScreen';
import { ShieldScreen } from './screens/ShieldScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AccountScreen } from './screens/AccountScreen';
import { LogsScreen } from './screens/LogsScreen';
import { BottomNav } from './components/BottomNav';

const MainTabs: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F19]">
      <main className="flex-1">
        {activeTab === 'dashboard' && <HomeScreen />}
        {activeTab === 'servers' && <ServerListScreen />}
        {activeTab === 'speedtest' && <SpeedTestScreen />}
        {activeTab === 'shield' && <ShieldScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>
      <BottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  const { route } = useApp();

  switch (route) {
    case 'splash':
      return <SplashScreen />;
    case 'login':
      return <LoginScreen />;
    case 'account':
      return <AccountScreen />;
    case 'logs':
      return <LogsScreen />;
    case 'main':
    default:
      return <MainTabs />;
  }
};
